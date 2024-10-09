// Registrar o Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('Service Worker registrado com sucesso:', registration.scope);
        }).catch(error => {
            console.log('Falha ao registrar o Service Worker:', error);
        });
    });
}

// Função para converter a imagem para base64
async function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Função para adicionar uma nova plantação
document.getElementById('plantation-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const photoInput = document.getElementById('photo');
    const photo = await convertImageToBase64(photoInput.files[0]);

    navigator.geolocation.getCurrentPosition(async (position) => {
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };

        try {
            const response = await fetch('http://127.0.0.1:3000/api/plantations', { // Certifique-se de que a rota da API está correta
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, description, location, photo })
            });

            if (response.ok) {
                document.getElementById('plantation-form').reset();
                fetchPlantations(); // Atualiza a lista após adicionar uma nova plantação
            } else {
                console.error('Erro ao adicionar plantação:', response.statusText);
            }
        } catch (error) {
            console.error('Erro ao conectar com a API:', error);
        }
    });
});

// Função para deletar uma plantação
async function deletePlantation(id) {
    try {
        const response = await fetch(`http://127.0.0.1:3000/api/plantations/${id}`, { // Certifique-se de que a rota da API está correta
            method: 'DELETE',
        });

        if (response.ok) {
            console.log('Plantação deletada com sucesso');
            fetchPlantations(); // Atualiza a lista de plantações após a exclusão
        } else {
            console.error('Erro ao deletar plantação:', response.statusText);
        }
    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
    }
}

// Função para editar uma plantação
async function editPlantation(id, currentName, currentDescription) {
    const newName = prompt("Editar Título:", currentName);
    const newDescription = prompt("Editar Descrição:", currentDescription);

    if (newName !== null && newDescription !== null) {
        try {
            const response = await fetch(`http://127.0.0.1:3000/api/plantations/${id}`, { // Certifique-se de que a rota da API está correta
                method: 'PUT', // O método deve ser PUT para edição
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: newName, description: newDescription }) // Envia os dados atualizados
            });

            if (response.ok) {
                console.log('Plantação editada com sucesso');
                fetchPlantations(); // Atualiza a lista após editar a plantação
            } else {
                console.error('Erro ao editar plantação:', response.statusText);
            }
        } catch (error) {
            console.error('Erro ao conectar com a API:', error);
        }
    }
}

// Função para buscar e exibir as plantações
async function fetchPlantations() {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/plantations'); // Certifique-se de que a rota da API está correta
        if (!response.ok) {
            throw new Error('Erro ao buscar plantações');
        }
        const plantations = await response.json();
        const list = document.getElementById('plantations-list');
        list.innerHTML = '';
        plantations.forEach(p => {
            const item = document.createElement('div');
            item.innerHTML = `
                <h3>${p.name}</h3>
                <p>${p.description}</p>
                <img src="${p.photo}" alt="${p.name}" style="max-width: 100%; height: auto;">
                <div class="button-container">
                    <button class="edit-button" onclick="editPlantation('${p._id}', '${p.name}', '${p.description}')">Editar</button>
                    <button class="delete-button" onclick="deletePlantation('${p._id}')">Deletar</button>   
                </div>
            `;
            list.appendChild(item);
        });
        
    } catch (error) {
        console.error('Erro ao carregar plantações:', error);
    }
}

// Carregar as plantações assim que a página é carregada
fetchPlantations();
