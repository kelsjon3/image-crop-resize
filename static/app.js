console.log('JavaScript file loaded');

let cropper;
const imageInput = document.getElementById('image-input');
const previewImage = document.getElementById('preview-image');
const cropButton = document.getElementById('crop-button');
const phoneModel = document.getElementById('phone-model');
const croppedImage = document.getElementById('cropped-image');
const debugLog = document.getElementById('debug-log');
const lastUpdated = document.getElementById('last-updated');

// Set last updated time
lastUpdated.textContent = new Date().toLocaleString();

function log(message) {
    console.log(message);
    const debugLog = document.getElementById('debug-log');
    if (debugLog) {
        debugLog.textContent += message + '\n';
    } else {
        console.error('Debug log element not found');
    }
}

function loadPhoneModels() {
    fetch('/api/models')
        .then(response => response.json())
        .then(models => {
            const phoneModelSelect = document.getElementById('phone-model');
            phoneModelSelect.innerHTML = '<option value="">Select IP Phone Model</option>';
            for (const [name, [width, height]] of Object.entries(models)) {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = `${name} (${width}x${height})`;
                phoneModelSelect.appendChild(option);
            }
        });
}

document.addEventListener('DOMContentLoaded', loadPhoneModels);

log('JavaScript initialized');

imageInput.addEventListener('change', (e) => {
    log('File input changed');
    const file = e.target.files[0];
    if (file) {
        log(`File selected: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
        const reader = new FileReader();
        reader.onload = (event) => {
            log('File read successfully');
            previewImage.src = event.target.result;
            if (cropper) {
                log('Destroying existing cropper');
                cropper.destroy();
            }
            log('Initializing new cropper');
            cropper = new Cropper(previewImage, {
                aspectRatio: 1,
                viewMode: 1,
            });
        };
        reader.readAsDataURL(file);
    } else {
        log('No file selected');
    }
});

cropButton.addEventListener('click', () => {
    log('Crop button clicked');
    if (!cropper) {
        log('No cropper instance found. Has an image been loaded?');
        alert('Please select an image first.');
        return;
    }
    const croppedCanvas = cropper.getCroppedCanvas();
    log('Image cropped');
    const selectedModel = phoneModel.value;
    
    if (!selectedModel) {
        log('No phone model selected');
        alert('Please select an IP phone model');
        return;
    }

    log(`Selected model: ${selectedModel}`);
    croppedCanvas.toBlob((blob) => {
        log('Cropped image converted to blob');
        const formData = new FormData();
        formData.append('image', blob, 'cropped.jpg');
        formData.append('model', selectedModel);

        log('Sending cropped image to server');
        fetch('/process_image', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            log(`Server response status: ${response.status}`);
            return response.blob();
        })
        .then(blob => {
            log('Received processed image from server');
            const url = URL.createObjectURL(blob);
            croppedImage.src = url;
            log('Displayed processed image');
        })
        .catch(error => {
            log(`Error: ${error.message}`);
            console.error('Error:', error);
        });
    }, 'image/jpeg');
});