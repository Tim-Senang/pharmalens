import os
from flask import Flask, request, jsonify, session, render_template
from flask_cors import CORS
from db import get_db_connection
from auth_utils import get_user_by_username, verify_password, create_user
import mysql.connector
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import io
import requests
import uuid
import time

# Load YOLOv8 model (replace 'best.pt' with your trained model path)
MODEL_PATH = os.environ.get('YOLO_MODEL_PATH', 'best.pt')
model = YOLO(MODEL_PATH)

# --- ROUTING FRONTEND (HTML Pages) ---
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login')
def login_page():
    return render_template('login-page.html')

@app.route('/riwayat')
def riwayat_page():
    return render_template('riwayat.html')

@app.route('/scan')
def scan_page():
    return render_template('scan.html')

app = Flask(__name__)
app.secret_key = 'pharmalens_session_secret_key_2024'  # Fixed secret key

# Simple token storage (in production, use Redis or database)
active_tokens = {}

# Session cookie configuration untuk cross-origin
app.config.update(
    SESSION_COOKIE_SAMESITE=None,
    SESSION_COOKIE_SECURE=False,
    SESSION_COOKIE_HTTPONLY=False,
    SESSION_COOKIE_DOMAIN=None,
    SESSION_COOKIE_PATH='/',
    SESSION_PERMANENT=False,
    PERMANENT_SESSION_LIFETIME=3600  # 1 hour
)

# CORS configuration - disable Flask-CORS to avoid conflicts
# CORS(app, supports_credentials=True, origins=['http://localhost:5500', 'http://127.0.0.1:5500'])

@app.before_request
def handle_preflight():
    if request.method == 'OPTIONS':
        origin = request.headers.get('Origin')
        print(f"CORS Preflight - Origin: {origin}")
        print(f"CORS Preflight - Requested Headers: {request.headers.get('Access-Control-Request-Headers')}")
        
        if origin in ['http://localhost:5500', 'http://127.0.0.1:5500']:
            from flask import make_response
            response = make_response()
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE'
            response.headers['Access-Control-Max-Age'] = '3600'
            response.status_code = 200
            print(f"CORS Preflight - Headers set for: {origin}")
            return response

@app.after_request
def add_cors_headers(response):
    origin = request.headers.get('Origin')
    print(f"CORS After - Origin: {origin}, Method: {request.method}")  # Debug
    
    # Always set CORS headers for allowed origins
    if origin in ['http://localhost:5500', 'http://127.0.0.1:5500']:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE'
        response.headers['Vary'] = 'Origin'
        print(f"CORS After - Headers set for: {origin}")
    
    return response

@app.route('/session-check', methods=['GET'])
def session_check():
    print(f"Session-check - Headers: {dict(request.headers)}")  # Debug headers
    
    # Check Authorization header for token
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        print(f"Session-check - Token found: {token}")
        
        if token in active_tokens:
            token_data = active_tokens[token]
            if time.time() < token_data['expires']:
                print(f"Session-check - Valid token for user: {token_data['username']}")
                return jsonify({"logged_in": True, "username": token_data['username']}), 200
            else:
                print("Session-check - Token expired")
                del active_tokens[token]
        else:
            print("Session-check - Invalid token")
    
    # Check Flask session as fallback
    if 'user_id' in session:
        print(f"Session-check - Flask session valid: {session.get('user_id')}")
        return jsonify({"logged_in": True, "username": session.get('username', session.get('user_id'))}), 200
    
    print("Session-check - No valid authentication found")
    return jsonify({"logged_in": False}), 200

@app.route('/test-session', methods=['GET'])
def test_session():
    # Endpoint sederhana untuk test session tanpa login_required
    session['test'] = 'working'
    return jsonify({"message": "Session test", "session_data": dict(session)}), 200

# Mapping class id ke nama obat (27 kelas sesuai data.yaml)
CLASS_MAP = {
    0: "amlodipine 10mg hipertensi",
    1: "amlodipine 5mg hipertensi",
    2: "bisoprolol 2-5mg hipertensi",
    3: "bisoprolol 5mg hipertensi",
    4: "captopril 12-5mg hipertensi",
    5: "captopril 25mg hipertensi",
    6: "captopril 50mg hipertensi",
    7: "diamicron mr 60mg diabetes",
    8: "dopamet 250mg hipertensi",
    9: "gliclazide 80mg diabetes",
    10: "glimepiride 1mg diabetes",
    11: "glimepiride 2mg diabetes",
    12: "glimepiride 3mg diabetes",
    13: "glimepiride 4mg diabetes",
    14: "glipizide 5mg diabetes",
    15: "gliquidone 30mg diabetes",
    16: "glucodex 80mg diabetes",
    17: "glucophage xr 500mg diabetes",
    18: "glucotrol xl 10mg diabetes",
    19: "glucotrol xl 5mg diabetes",
    20: "hidroklorotiazid 25mg hipertensi",
    21: "januvia 100mg diabetes",
    22: "metformin 500mg diabetes",
    23: "metformin 850mg diabetes",
    24: "ramipril 10mg hipertensi",
    25: "ramipril 2-5mg hipertensi",
    26: "ramipril 5mg hipertensi"
}


def get_drug_benefit(drug_name):
    prompt = f"Jelaskan manfaat obat {drug_name} secara singkat dan jelas dalam bahasa Indonesia."
    headers = {
        "Authorization": f"Bearer {COHERE_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "command-r-plus",
        "prompt": prompt,
        "max_tokens": 120,
        "temperature": 0.5
    }
    response = requests.post(COHERE_API_URL, headers=headers, json=data)
    if response.status_code == 200:
        result = response.json()
        return result["generations"][0]["text"].strip()
    else:
        return "Tidak dapat mengambil manfaat obat."

# ---- AUTH ----

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Username dan password wajib diisi'}), 400
    if get_user_by_username(username):
        return jsonify({'error': 'Username sudah terdaftar'}), 409
    try:
        create_user(username, password, role='user')
        return jsonify({'message': 'Registrasi berhasil'}), 201
    except Exception as e:
        return jsonify({'error': f'Gagal registrasi: {str(e)}'}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = get_user_by_username(username)
    if user and verify_password(password, user['password_hash']):
        session.permanent = True
        session['user_id'] = user['id']
        session['role'] = user['role']
        session['username'] = user['username']
        
        print(f"Login successful - Session set: {dict(session)}")  # Debug
        print(f"Login - Request Origin: {request.headers.get('Origin')}")  # Debug
        print(f"Login - Session ID: {session.sid if hasattr(session, 'sid') else 'N/A'}")  # Debug
        
        # Generate simple token
        token = f"pharmalens_{user['id']}_{int(time.time())}"
        active_tokens[token] = {
            'user_id': user['id'],
            'username': user['username'],
            'role': user['role'],
            'expires': time.time() + 3600  # 1 hour
        }
        
        print(f"Login - Token generated: {token}")
        print(f"Login - Active tokens: {len(active_tokens)}")
        
        return jsonify({
            "message": "Login berhasil", 
            "role": user['role'],
            "user_id": user['id'],
            "username": user['username'],
            "token": token
        }), 200
    return jsonify({"error": "Username atau password salah"}), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logout berhasil"})

# ---- SCAN PROTECTED ----
def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        print(f"Auth check - Headers: {dict(request.headers)}")  # Debug headers
        
        # Check Authorization header for token
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            print(f"Token found in header: {token}")
            
            if token in active_tokens:
                token_data = active_tokens[token]
                if time.time() < token_data['expires']:
                    print(f"Valid token for user: {token_data['username']}")
                    return f(*args, **kwargs)
                else:
                    print("Token expired")
                    del active_tokens[token]
            else:
                print("Invalid token")
        
        # Check Flask session as fallback
        if 'user_id' in session:
            print(f"Flask session valid: user_id = {session['user_id']}")
            return f(*args, **kwargs)
        
        print("No valid authentication found")
        return jsonify({"error": "Login diperlukan"}), 401
    return decorated

@app.route('/predict', methods=['POST'])
@login_required
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    file = request.files['image']
    img = Image.open(io.BytesIO(file.read())).convert('RGB')
    results = model(img)
    boxes = results[0].boxes
    if not boxes:
        return jsonify({"prediction": "Tidak ada kemasan obat terdeteksi."})

    # Ambil class id dengan confidence tertinggi
    best_box = max(boxes, key=lambda b: b.conf[0])
    class_id = int(best_box.cls[0])
    drug_name = CLASS_MAP.get(class_id, f"Obat dengan class id {class_id}")
    benefit = get_drug_benefit(drug_name)

    # Simpan riwayat scan ke DB - get user_id from token or session
    user_id = None
    
    # Try to get user_id from token first
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        if token in active_tokens:
            user_id = active_tokens[token]['user_id']
            print(f"Predict - User ID from token: {user_id}")
    
    # Fallback to session
    if not user_id:
        user_id = session.get('user_id')
        print(f"Predict - User ID from session: {user_id}")
    
    # Save uploaded image - always save regardless of user_id
    image_path = None
    try:
        # Create uploads directory if not exists
        import os
        uploads_dir = 'uploads'
        if not os.path.exists(uploads_dir):
            os.makedirs(uploads_dir)
        
        # Generate unique filename
        import uuid
        from datetime import datetime
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        user_prefix = user_id if user_id else 'anonymous'
        filename = f"scan_{user_prefix}_{timestamp}_{uuid.uuid4().hex[:8]}.jpg"
        image_path = os.path.join(uploads_dir, filename)
        
        # Save image to file
        img.save(image_path)
        print(f"Predict - Image saved to: {image_path}")
        
    except Exception as e:
        print(f"Predict - Error saving image: {e}")
        image_path = None
    
    # Debug prints
    print(f"Predict - Final values before DB save:")
    print(f"  user_id: {user_id}")
    print(f"  drug_name: {drug_name}")
    print(f"  benefit: {benefit[:100] if benefit else 'None'}...")
    print(f"  image_path: {image_path}")
    
    if user_id:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("INSERT INTO scan_history (user_id, drug_name, benefit, image_path) VALUES (%s, %s, %s, %s)", 
                   (user_id, drug_name, benefit, image_path))
        conn.commit()
        cur.close()
        conn.close()
        print(f"Predict - Scan history saved for user: {user_id} with image_path: {image_path}")
    else:
        print("Predict - Warning: No user_id found, scan history not saved")

    return jsonify({
        "prediction": f"Obat terdeteksi: {drug_name}",
        "manfaat": benefit
    })

@app.route('/manfaat', methods=['POST'])
def manfaat():
    data = request.get_json()
    nama_obat = data.get('nama_obat', '')
    if not nama_obat:
        return jsonify({"error": "Nama obat tidak diberikan."}), 400
    benefit = get_drug_benefit(nama_obat)
    return jsonify({"manfaat": benefit})

# ---- RIWAYAT SCAN (user) ----
@app.route('/riwayat', methods=['GET'])
@login_required
def riwayat():
    # Get user_id from token or session
    user_id = None
    
    # Try to get user_id from token first
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        if token in active_tokens:
            user_id = active_tokens[token]['user_id']
            print(f"Riwayat - User ID from token: {user_id}")
    
    # Fallback to session
    if not user_id:
        user_id = session.get('user_id')
        print(f"Riwayat - User ID from session: {user_id}")
    
    if not user_id:
        return jsonify({"error": "User ID tidak ditemukan"}), 400
    
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT id, drug_name, benefit, image_path, scanned_at FROM scan_history WHERE user_id=%s ORDER BY scanned_at DESC", (user_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    
    print(f"Riwayat - Found {len(rows)} records for user {user_id}")
    return jsonify({"riwayat": rows})

# ---- SERVE UPLOADED IMAGES ----
@app.route('/uploads/<filename>')
def serve_image(filename):
    """Serve uploaded images from uploads directory"""
    import os
    from flask import send_from_directory
    uploads_dir = 'uploads'
    if os.path.exists(os.path.join(uploads_dir, filename)):
        return send_from_directory(uploads_dir, filename)
    else:
        return jsonify({"error": "Image not found"}), 404

# ---- ADMIN: LIHAT USER ----
@app.route('/users', methods=['GET'])
@login_required
def list_users():
    if session.get('role') != 'admin':
        return jsonify({"error": "Hanya admin yang bisa mengakses."}), 403
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT id, username, role, created_at FROM users")
    users = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify({"users": users})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
