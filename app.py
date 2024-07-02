from flask import Flask, request, send_file, send_from_directory, jsonify
from PIL import Image
import io
import os
import json

app = Flask(__name__, static_url_path='', static_folder='static')

MODELS_FILE = 'phone_models.json'

def load_models():
    if os.path.exists(MODELS_FILE):
        with open(MODELS_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_models(models):
    with open(MODELS_FILE, 'w') as f:
        json.dump(models, f)

PHONE_RESOLUTIONS = load_models()

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/admin')
def admin():
    return send_from_directory(app.static_folder, 'admin.html')

@app.route('/app.js')
def serve_js():
    return send_from_directory(app.static_folder, 'app.js')

@app.route('/admin.js')
def serve_admin_js():
    return send_from_directory(app.static_folder, 'admin.js')

@app.route('/api/models', methods=['GET', 'POST'])
def handle_models():
    global PHONE_RESOLUTIONS
    if request.method == 'GET':
        return jsonify(PHONE_RESOLUTIONS)
    elif request.method == 'POST':
        new_model = request.json
        PHONE_RESOLUTIONS[new_model['name']] = [new_model['width'], new_model['height']]
        save_models(PHONE_RESOLUTIONS)
        return jsonify({"status": "success"})

@app.route('/api/models/<model_name>', methods=['DELETE'])
def delete_model(model_name):
    global PHONE_RESOLUTIONS
    if model_name in PHONE_RESOLUTIONS:
        del PHONE_RESOLUTIONS[model_name]
        save_models(PHONE_RESOLUTIONS)
        return jsonify({"status": "success"})
    return jsonify({"status": "error", "message": "Model not found"}), 404

@app.route('/process_image', methods=['POST'])
def process_image():
    if 'image' not in request.files:
        return 'No image file', 400

    image_file = request.files['image']
    model = request.form.get('model')

    if model not in PHONE_RESOLUTIONS:
        return 'Invalid phone model', 400

    img = Image.open(image_file)
    target_resolution = tuple(PHONE_RESOLUTIONS[model])
    img_resized = img.resize(target_resolution, Image.LANCZOS)

    img_io = io.BytesIO()
    img_resized.save(img_io, 'JPEG', quality=85)
    img_io.seek(0)

    return send_file(img_io, mimetype='image/jpeg')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')