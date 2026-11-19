import base64
from io import BytesIO
import os
import sqlite3
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import bcrypt

try:
    import pymysql
    import pymysql.cursors
    HAS_PYMYSQL = True
except ImportError:
    HAS_PYMYSQL = False

try:
    from rembg import remove as rembg_remove
    HAS_REMBG = True
except ImportError:
    HAS_REMBG = False

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), 'gallery.db')


def init_sqlite_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Login (
            UserID INTEGER PRIMARY KEY AUTOINCREMENT,
            Username TEXT UNIQUE NOT NULL,
            Email TEXT UNIQUE NOT NULL,
            Password TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()


init_sqlite_db()


def get_db_connection():
    if HAS_PYMYSQL:
        try:
            conn = pymysql.connect(
                host=os.environ.get('DB_HOST', 'localhost'),
                user=os.environ.get('DB_USER', 'root'),
                password=os.environ.get('DB_PASSWORD', ''),
                database=os.environ.get('DB_NAME', 'mysql'),
                cursorclass=pymysql.cursors.DictCursor,
                connect_timeout=2,
            )
            return conn, 'mysql'
        except Exception:
            pass
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn, 'sqlite'


def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode('utf-8')
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password)
    except Exception:
        return False


def extract_input_image():
    if 'file' in request.files:
        file = request.files['file']
        if file.filename != '':
            return Image.open(file.stream).convert('RGBA')
    if request.is_json:
        data = request.get_json(silent=True) or {}
        b64 = data.get('image') or data.get('file') or ''
        if ',' in b64:
            b64 = b64.split(',', 1)[1]
        if b64:
            raw = base64.b64decode(b64)
            return Image.open(BytesIO(raw)).convert('RGBA')
    return None


def fallback_remove_background(image: Image.Image) -> Image.Image:
    img = image.convert('RGBA')
    width, height = img.size
    pixels = img.load()
    if not pixels:
        return img
    bg_color = pixels[0, 0]
    for x in range(width):
        for y in range(height):
            p = pixels[x, y]
            dist = abs(p[0] - bg_color[0]) + abs(p[1] - bg_color[1]) + abs(p[2] - bg_color[2])
            if dist < 45:
                pixels[x, y] = (255, 255, 255, 0)
    return img


@app.route('/')
def hello_world():
    return 'Hello from Gallery Backend!'


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'Gallery backend service is running'})


@app.route('/test_db_connection')
def test_db_connection():
    conn = None
    try:
        conn, db_type = get_db_connection()
        return jsonify({'message': f'Database connection successful ({db_type})'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    identifier = data.get('username') or data.get('email') or ''
    password = data.get('password') or ''

    if not identifier or not password:
        return jsonify({'success': False, 'message': 'Email/Username and password required'}), 400

    conn = None
    try:
        conn, db_type = get_db_connection()
        cursor = conn.cursor()

        if db_type == 'mysql':
            cursor.execute('SELECT * FROM Login WHERE Email=%s OR Username=%s', (identifier, identifier))
            user = cursor.fetchone()
        else:
            cursor.execute('SELECT * FROM Login WHERE Email=? OR Username=?', (identifier, identifier))
            row = cursor.fetchone()
            user = dict(row) if row else None

        if not user:
            return jsonify({'success': False, 'message': 'Invalid Username or Email'}), 401

        stored_hash = user.get('Password') or user.get('password') or ''
        if verify_password(password, stored_hash):
            return jsonify({
                'success': True,
                'message': 'Login Successful',
                'Id': str(user.get('UserID', user.get('id', ''))),
                'Name': str(user.get('Username', user.get('name', ''))),
                'Email': str(user.get('Email', user.get('email', ''))),
            })
        else:
            return jsonify({'success': False, 'message': 'Invalid Password'}), 401
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500
    finally:
        if conn:
            conn.close()


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    username = data.get('name') or data.get('username') or ''
    email = data.get('email') or ''
    password = data.get('password') or ''

    if not username or not email or not password:
        return jsonify({'success': False, 'message': 'Name, email, and password required'}), 400

    conn = None
    try:
        conn, db_type = get_db_connection()
        cursor = conn.cursor()

        if db_type == 'mysql':
            cursor.execute('SELECT * FROM Login WHERE Username=%s OR Email=%s', (username, email))
            existing_user = cursor.fetchone()
        else:
            cursor.execute('SELECT * FROM Login WHERE Username=? OR Email=?', (username, email))
            existing_user = cursor.fetchone()

        if existing_user:
            return jsonify({'success': False, 'message': 'Username or Email already exists'}), 409

        hashed_password = hash_password(password)

        if db_type == 'mysql':
            cursor.execute(
                'INSERT INTO Login (Username, Password, Email) VALUES (%s, %s, %s)',
                (username, hashed_password, email),
            )
        else:
            cursor.execute(
                'INSERT INTO Login (Username, Password, Email) VALUES (?, ?, ?)',
                (username, hashed_password, email),
            )
        conn.commit()

        return jsonify({'success': True, 'message': 'Registration successful'})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500
    finally:
        if conn:
            conn.close()


@app.route('/remove_background', methods=['POST'])
def remove_background():
    try:
        input_image = extract_input_image()
        if not input_image:
            return jsonify({'error': 'No image provided'}), 400

        if HAS_REMBG:
            try:
                output_image = rembg_remove(input_image)
            except Exception:
                output_image = fallback_remove_background(input_image)
        else:
            output_image = fallback_remove_background(input_image)

        output_buffer = BytesIO()
        output_image.save(output_buffer, format='PNG')
        output_buffer.seek(0)

        if request.headers.get('Accept') == 'application/json' or request.is_json:
            b64_str = base64.b64encode(output_buffer.getvalue()).decode('utf-8')
            return jsonify({
                'success': True,
                'image': f'data:image/png;base64,{b64_str}',
            })

        return send_file(output_buffer, mimetype='image/png')
    except Exception as e:
        return jsonify({'error': f'Failed to process image: {str(e)}'}), 500


@app.route('/remove_noise', methods=['POST'])
def remove_noise():
    try:
        input_image = extract_input_image()
        if not input_image:
            return jsonify({'error': 'No image provided'}), 400

        denoised = input_image.convert('RGB')
        denoised = denoised.filter(ImageFilter.MedianFilter(size=3))
        denoised = denoised.filter(ImageFilter.SMOOTH_MORE)

        enhancer = ImageEnhance.Contrast(denoised)
        denoised = enhancer.enhance(1.1)

        output_buffer = BytesIO()
        denoised.save(output_buffer, format='JPEG', quality=95)
        output_buffer.seek(0)

        if request.headers.get('Accept') == 'application/json' or request.is_json:
            b64_str = base64.b64encode(output_buffer.getvalue()).decode('utf-8')
            return jsonify({
                'success': True,
                'image': f'data:image/jpeg;base64,{b64_str}',
            })

        return send_file(output_buffer, mimetype='image/jpeg')
    except Exception as e:
        return jsonify({'error': f'Failed to process image: {str(e)}'}), 500


@app.route('/generate_ai', methods=['POST'])
def generate_ai():
    try:
        input_image = extract_input_image()
        data = request.get_json(silent=True) or {}
        style = data.get('style') or request.form.get('style') or 'vibrant'

        if not input_image:
            from PIL import ImageDraw
            img = Image.new('RGB', (600, 600), color=(15, 23, 42))
            draw = ImageDraw.Draw(img)
            for i in range(300):
                color = (
                    int(100 + 155 * (i / 300)),
                    int(50 + 100 * (1 - i / 300)),
                    int(200 + 55 * (i / 300)),
                )
                draw.ellipse([300 - i, 300 - i, 300 + i, 300 + i], outline=color, width=2)
            input_image = img

        processed = input_image.convert('RGB')
        if style == 'vintage':
            processed = ImageOps.colorize(ImageOps.grayscale(processed), '#3a1c0d', '#fdf6e2')
        elif style == 'cyberpunk':
            enhancer = ImageEnhance.Color(processed)
            processed = enhancer.enhance(1.8)
            contrast = ImageEnhance.Contrast(processed)
            processed = contrast.enhance(1.3)
            processed = processed.filter(ImageFilter.EDGE_ENHANCE_MORE)
        elif style == 'sketch':
            processed = ImageOps.grayscale(processed).filter(ImageFilter.CONTOUR)
        else:
            color_enhancer = ImageEnhance.Color(processed)
            processed = color_enhancer.enhance(1.4)
            sharp_enhancer = ImageEnhance.Sharpness(processed)
            processed = sharp_enhancer.enhance(1.5)
            contrast = ImageEnhance.Contrast(processed)
            processed = contrast.enhance(1.15)

        output_buffer = BytesIO()
        processed.save(output_buffer, format='JPEG', quality=95)
        output_buffer.seek(0)

        if request.headers.get('Accept') == 'application/json' or request.is_json:
            b64_str = base64.b64encode(output_buffer.getvalue()).decode('utf-8')
            return jsonify({
                'success': True,
                'image': f'data:image/jpeg;base64,{b64_str}',
            })

        return send_file(output_buffer, mimetype='image/jpeg')
    except Exception as e:
        return jsonify({'error': f'Failed to process image: {str(e)}'}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    app.run(debug=True, host=host, port=port)
