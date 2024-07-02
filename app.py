from flask import Flask, request, send_file, send_from_directory
from PIL import Image
import io
import os

app = Flask(__name__, static_url_path='', static_folder='static')

PHONE_RESOLUTIONS = {
    'model1': (320, 240),
    'model2': (480, 320),
    'model3': (800, 480)
}

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/app.js')
def serve_js():
    return send_from_directory(app.static_folder, 'app.js')

@app.route('/process_image', methods=['POST'])
def process_image():
    if 'image' not in request.files:
        return 'No image file', 400

    image_file = request.files['image']
    model = request.form.get('model')

    if model not in PHONE_RESOLUTIONS:
        return 'Invalid phone model', 400

    img = Image.open(image_file)
    target_resolution = PHONE_RESOLUTIONS[model]
    img_resized = img.resize(target_resolution, Image.LANCZOS)

    img_io = io.BytesIO()
    img_resized.save(img_io, 'JPEG', quality=85)
    img_io.seek(0)

    return send_file(img_io, mimetype='image/jpeg')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')