import os
import sqlite3
from flask import Flask, request, jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
DATABASE = 'riwayat.db'

# --- Database Setup ---
def init_db():
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS riwayat (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama_obat TEXT,
        manfaat TEXT,
        waktu TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    conn.commit()
    conn.close()

init_db()

# --- API OCR Space ---
OCR_API_KEY = 'K86721188088957'
OCR_URL = 'https://api.ocr.space/parse/image'

@app.route('/scan', methods=['POST'])
def scan_obat():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['file']
    payload = {'isOverlayRequired': False}
    files = {'file': (file.filename, file.stream, file.mimetype)}
    headers = {'apikey': OCR_API_KEY}
    response = requests.post(OCR_URL, files=files, data=payload, headers=headers)
    result = response.json()
    # Ambil hasil text OCR
    try:
        parsed = result['ParsedResults'][0]['ParsedText']
        return jsonify({'text': parsed})
    except Exception:
        return jsonify({'error': 'OCR gagal'}), 500

# --- API Cohere ---
COHERE_API_KEY = 'NFA1iym4BjJrlwrmwu4egEq2Fi0JPoyItDOoPe1g'
COHERE_URL = 'https://api.cohere.ai/v1/chat'

@app.route('/manfaat', methods=['POST'])
def manfaat_obat():
    data = request.get_json()
    nama_obat = data.get('nama_obat', '')
    if not nama_obat:
        return jsonify({'error': 'Nama obat kosong'}), 400
    prompt = f"Apa manfaat obat {nama_obat} dalam bahasa Indonesia, singkat dan jelas?"
    headers = {
        'Authorization': f'Bearer {COHERE_API_KEY}',
        'Content-Type': 'application/json',
    }
    payload = {
        'message': prompt,
        'model': 'command-r-plus',
        'temperature': 0.3
    }
    response = requests.post(COHERE_URL, json=payload, headers=headers)
    try:
        manfaat = response.json()['text']
        return jsonify({'manfaat': manfaat})
    except Exception:
        return jsonify({'error': 'Gagal mengambil manfaat obat'}), 500

# --- Simpan Riwayat ---
@app.route('/riwayat', methods=['POST'])
def simpan_riwayat():
    data = request.get_json()
    nama_obat = data.get('nama_obat', '')
    manfaat = data.get('manfaat', '')
    if not nama_obat or not manfaat:
        return jsonify({'error': 'Data tidak lengkap'}), 400
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute('INSERT INTO riwayat (nama_obat, manfaat) VALUES (?, ?)', (nama_obat, manfaat))
    conn.commit()
    conn.close()
    return jsonify({'status': 'ok'})

@app.route('/riwayat', methods=['GET'])
def ambil_riwayat():
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute('SELECT id, nama_obat, manfaat, waktu FROM riwayat ORDER BY waktu DESC')
    rows = c.fetchall()
    conn.close()
    riwayat = [
        {'id': row[0], 'nama_obat': row[1], 'manfaat': row[2], 'waktu': row[3]} for row in rows
    ]
    return jsonify({'riwayat': riwayat})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
