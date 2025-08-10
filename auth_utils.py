import bcrypt
import db
import mysql.connector

# Helper: get user by username

def get_user_by_username(username):
    conn = db.get_db_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM users WHERE username=%s", (username,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    return user

# Helper: verify password

def verify_password(password, password_hash):
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

# Helper: create user (for admin only)
def create_user(username, password, role='user'):
    conn = db.get_db_connection()
    cur = conn.cursor()
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode()
    cur.execute("INSERT INTO users (username, password_hash, role) VALUES (%s, %s, %s)", (username, password_hash, role))
    conn.commit()
    cur.close()
    conn.close()
