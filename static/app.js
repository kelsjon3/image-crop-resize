let cropper;
const imageInput = document.getElementById('image-input');
const image = document.getElementById('image');
const cropButton = document.getElementById('crop-button');
const phoneModel = document.getElementById('phone-model');
const croppedImage = document.getElementById('cropped-image');

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        image.src = event.target.result;
        if (cropper) {
            cropper.destroy();
        }
        cropper = new Cropper(image, {
            aspectRatio: 1,
            viewMode: 1,
        });
    };
    reader.readAsDataURL(file);
});

cropButton.addEventListener('click', () => {
    const croppedCanvas = cropper.getCroppedCanvas();
    const selectedModel = phoneModel.value;
    
    if (!selectedModel) {
        alert('Please select an IP phone model');
        return;
    }

    const formData = new FormData();
    croppedCanvas.toBlob((blob) => {
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
    });
});