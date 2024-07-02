from flask import Flask, render_template, request, jsonify, send_file
import pymysql
from flask_cors import CORS
import bcrypt
from rembg import remove
from PIL import Image
from io import BytesIO

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello_world():
    return 'Hello from Flask!'

# Route to test database connection
@app.route('/test_db_connection')
def test_db_connection():
    try:
        # Connect to MySQL database
        conn = pymysql.connect(host='localhost',
                               user='root',
                               password='',
                               database='mysql',
                               cursorclass=pymysql.cursors.DictCursor)
        conn.close()
        return jsonify({"message": "Database connection successful"})
    except Exception as e:
        return jsonify({"error": str(e)})
  

def hash_password(password):
    # Hash a password for the first time
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return hashed

def verify_password(plain_password, hashed_password):
    # Check hashed password. Using bcrypt.checkpw() to verify the password
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password)

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    try:
        # Connect to the database
        conn = pymysql.connect(host='localhost',
                               user='root',
                               password='',
                               database='mysql',
                               cursorclass=pymysql.cursors.DictCursor)
        cursor = conn.cursor()

        # Query the database for the provided username
        cursor.execute("SELECT * FROM Login WHERE Email=%s", (username,))
        Login = cursor.fetchone()
        print(Login)
        if Login and verify_password(password, Login['Password'].encode('utf-8')):
            return jsonify({'success': True, 'message': 'Login Successful', 'Id': Login['UserID'], 'Name': Login['Username'], 'Email': Login['Email']})
        elif Login :
            print(username,password)
            return jsonify({'success': True, 'message': 'Invalid Password'})        
        else:
            print(username,password)
            return jsonify({'success': False, 'message': 'Invalid Username','username':username,'password':password})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Error: {}'.format(str(e))})
    finally:
        # Close database connection
        if conn:
            conn.close()


@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('name')
    password = data.get('password')
    email = data.get('email')

    try:
        # Connect to the database
        conn = pymysql.connect(host='localhost',
                               user='root',
                               password='',
                               database='mysql',
                               cursorclass=pymysql.cursors.DictCursor)
        cursor = conn.cursor()

        # Check if the username already exists
        cursor.execute("SELECT * FROM Login WHERE Username=%s", (username,))
        existing_user = cursor.fetchone()
        if existing_user:
            return jsonify({'success': False, 'message': 'Username already exists'})
        
        # Hash the password
        hashed_password = hash_password(password)
        
        # Insert new user into the database
        cursor.execute("INSERT INTO Login (Username, Password, Email) VALUES (%s, %s, %s)",
                       (username, hashed_password, email))
        conn.commit()

        return jsonify({'success': True, 'message': 'Registration successful'})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Error: {}'.format(str(e))})
    finally:
        cursor.close()
        conn.close()


@app.route('/remove_background', methods=['POST'])
def remove_background():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    print("this here")
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    
    if file:
        input_image = Image.open(file)
        output_image = remove(input_image)
        print(output_image,"I am here ")
        output_buffer = BytesIO()
        output_image.save(output_buffer, format='PNG')
        output_buffer.seek(0)
        print(output_buffer)
        return send_file(output_buffer, mimetype='image/png')
    else:
        return jsonify({'error': 'Failed to process image'})

if __name__ == '__main__':
    app.run(debug=True, host= '192.168.0.100')
