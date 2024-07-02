let cropper;
const imageInput = document.getElementById('image-input');
const previewImage = document.getElementById('preview-image');
const cropButton = document.getElementById('crop-button');
const phoneModel = document.getElementById('phone-model');
const croppedImage = document.getElementById('cropped-image');

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            previewImage.src = event.target.result;
            if (cropper) {
                cropper.destroy();
            }
            cropper = new Cropper(previewImage, {
                aspectRatio: 1,
                viewMode: 1,
            });
        };
        reader.readAsDataURL(file);
    }
});

cropButton.addEventListener('click', () => {
    if (!cropper) {
        alert('Please select an image first.');
        return;
    }
    const croppedCanvas = cropper.getCroppedCanvas();
    const selectedModel = phoneModel.value;
    
    if (!selectedModel) {
        alert('Please select an IP phone model');
        return;
    }

    croppedCanvas.toBlob((blob) => {
        const formData = new FormData();
        formData.append('image', blob, 'cropped.jpg');
        formData.append('model', selectedModel);

        fetch('/process_image', {
            method: 'POST',
            body: formData
        })
        .then(response => response.blob())
        .then(blob => {
            const url = URL.createObjectURL(blob);
            croppedImage.src = url;
        })
        .catch(error => console.error('Error:', error));
    }, 'image/jpeg');
});