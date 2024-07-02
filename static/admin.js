document.addEventListener('DOMContentLoaded', () => {
    const modelsTable = document.getElementById('modelsTable').getElementsByTagName('tbody')[0];
    const addModelForm = document.getElementById('addModelForm');

    function loadModels() {
        fetch('/api/models')
            .then(response => response.json())
            .then(models => {
                modelsTable.innerHTML = '';
                for (const [name, [width, height]] of Object.entries(models)) {
                    const row = modelsTable.insertRow();
                    row.innerHTML = `
                        <td>${name}</td>
                        <td>${width}</td>
                        <td>${height}</td>
                        <td><button onclick="deleteModel('${name}')">Delete</button></td>
                    `;
                }
            });
    }

    addModelForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('modelName').value;
        const width = document.getElementById('modelWidth').value;
        const height = document.getElementById('modelHeight').value;

        fetch('/api/models', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, width: parseInt(width), height: parseInt(height) }),
        })
        .then(() => {
            loadModels();
            addModelForm.reset();
        });
    });

    window.deleteModel = (name) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            fetch(`/api/models/${name}`, { method: 'DELETE' })
                .then(() => loadModels());
        }
    };

    loadModels();
});