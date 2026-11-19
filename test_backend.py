import unittest
import json
import base64
from io import BytesIO
from PIL import Image
from backend import app


class BackendTestCase(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_health(self):
        res = self.client.get('/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get('status'), 'ok')

    def test_database_connection(self):
        res = self.client.get('/test_db_connection')
        self.assertEqual(res.status_code, 200)

    def test_register_and_login_flow(self):
        # Register new user
        reg_payload = {
            'name': 'Gallery Tester',
            'email': 'tester@example.com',
            'password': 'Password123!',
        }
        res = self.client.post('/register', json=reg_payload)
        self.assertIn(res.status_code, [200, 409])
        if res.status_code == 200:
            self.assertTrue(res.get_json()['success'])

        # Duplicate register should fail
        res_dup = self.client.post('/register', json=reg_payload)
        self.assertEqual(res_dup.status_code, 409)
        self.assertFalse(res_dup.get_json()['success'])

        # Login with correct password
        login_res = self.client.post(
            '/login',
            json={
                'username': 'tester@example.com',
                'password': 'Password123!',
            },
        )
        self.assertEqual(login_res.status_code, 200)
        login_data = login_res.get_json()
        self.assertTrue(login_data['success'])
        self.assertEqual(login_data['Email'], 'tester@example.com')

        # Login with invalid password MUST fail with 401
        invalid_res = self.client.post(
            '/login',
            json={
                'username': 'tester@example.com',
                'password': 'WrongPassword!',
            },
        )
        self.assertEqual(invalid_res.status_code, 401)
        self.assertFalse(invalid_res.get_json()['success'])

        # Login with non-existent user MUST fail with 401
        no_user_res = self.client.post(
            '/login',
            json={
                'username': 'nobody@example.com',
                'password': 'Password123!',
            },
        )
        self.assertEqual(no_user_res.status_code, 401)
        self.assertFalse(no_user_res.get_json()['success'])

    def test_remove_background(self):
        img = Image.new('RGB', (50, 50), color='white')
        buf = BytesIO()
        img.save(buf, format='PNG')
        buf.seek(0)

        data = {
            'file': (buf, 'test.png'),
        }
        res = self.client.post(
            '/remove_background',
            data=data,
            content_type='multipart/form-data',
            headers={'Accept': 'application/json'},
        )
        self.assertEqual(res.status_code, 200)
        json_data = res.get_json()
        self.assertTrue(json_data['success'])
        self.assertIn('data:image/png;base64,', json_data['image'])

    def test_remove_noise(self):
        img = Image.new('RGB', (50, 50), color='blue')
        buf = BytesIO()
        img.save(buf, format='JPEG')
        buf.seek(0)

        data = {
            'file': (buf, 'test.jpg'),
        }
        res = self.client.post(
            '/remove_noise',
            data=data,
            content_type='multipart/form-data',
            headers={'Accept': 'application/json'},
        )
        self.assertEqual(res.status_code, 200)
        json_data = res.get_json()
        self.assertTrue(json_data['success'])
        self.assertIn('data:image/jpeg;base64,', json_data['image'])

    def test_generate_ai(self):
        res = self.client.post(
            '/generate_ai',
            json={'style': 'cyberpunk'},
            headers={'Accept': 'application/json'},
        )
        self.assertEqual(res.status_code, 200)
        json_data = res.get_json()
        self.assertTrue(json_data['success'])
        self.assertIn('data:image/jpeg;base64,', json_data['image'])


if __name__ == '__main__':
    unittest.main()
