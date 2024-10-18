document.addEventListener('DOMContentLoaded', function() {
    updateUsedIngredients();
    displayStoredIngredients();
    loadChecklistState();
    checkMissionButton();
});

document.getElementById('ingredient-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const nameSelect = document.getElementById('name');
    const name = nameSelect.options[nameSelect.selectedIndex].value;
    const quantity = parseInt(document.getElementById('quantity').value, 10);
    const photo = document.getElementById('photo').files[0];

    const now = new Date();
    const formattedDate = now.toLocaleString();

    const reader = new FileReader();
    reader.onload = function(e) {
        const ingredient = {
            name: name,
            quantity: quantity,
            date: formattedDate,
            photo: e.target.result
        };

        saveIngredient(ingredient);
        addIngredientToOutput(ingredient);
        document.getElementById('ingredient-form').reset();
    };

    reader.readAsDataURL(photo);
});

function saveIngredient(ingredient) {
    let ingredients = JSON.parse(localStorage.getItem('ingredients')) || [];
    const existingIngredient = ingredients.find(ing => ing.name === ingredient.name);

    if (existingIngredient) {
        existingIngredient.quantity += ingredient.quantity;
        existingIngredient.date = ingredient.date;
        existingIngredient.photo = ingredient.photo;
    } else {
        ingredients.push(ingredient);
    }

    localStorage.setItem('ingredients', JSON.stringify(ingredients));
}

function displayStoredIngredients() {
    const ingredients = JSON.parse(localStorage.getItem('ingredients')) || [];
    ingredients.forEach(ingredient => {
        addIngredientToOutput(ingredient);
    });
}

function addIngredientToOutput(ingredient) {
    const outputItem = document.createElement('div');
    outputItem.classList.add('output-item');

    outputItem.innerHTML = `
        <strong>食材の名前:</strong> ${ingredient.name}<br>
        <strong>個数:</strong> ${ingredient.quantity}<br>
        <strong>登録した日時:</strong> ${ingredient.date}<br>
        <img src="${ingredient.photo}" alt="写真"><br>
        <button class="delete-button" data-name="${ingredient.name}">削除</button>
    `;

    document.getElementById('output').appendChild(outputItem);

    outputItem.querySelector('.delete-button').addEventListener('click', function() {
        deleteIngredient(ingredient.name);
    });
}

function deleteIngredient(name) {
    let ingredients = JSON.parse(localStorage.getItem('ingredients')) || [];
    ingredients = ingredients.filter(ingredient => ingredient.name !== name);
    localStorage.setItem('ingredients', JSON.stringify(ingredients));
    document.getElementById('output').innerHTML = '';
    displayStoredIngredients();
}

function loadChecklistState() {
    const checklistItems = document.querySelectorAll('.check-item');
    checklistItems.forEach(item => {
        const itemName = item.dataset.name;
        item.checked = JSON.parse(localStorage.getItem(itemName)) || false;
        item.addEventListener('change', function() {
            localStorage.setItem(itemName, JSON.stringify(item.checked));
            checkMissionButton();
        });
    });
}

function checkMissionButton() {
    const allChecked = Array.from(document.querySelectorAll('.check-item')).every(item => item.checked);
    const missionButton = document.getElementById('mission-button');
    if (allChecked) {
        missionButton.style.display = 'block';
    } else {
        missionButton.style.display = 'none';
    }
}

function goToSecondMission() {
    const allChecked = Array.from(document.querySelectorAll('.check-item')).every(item => item.checked);
    if (allChecked) {
        window.location.href = 'mission1.html';
    } else {
        alert('すべてのチェックボックスがチェックされていません。まだ未完成です。');
    }
}

function updateUsedIngredients() {
    const usedIngredients = JSON.parse(localStorage.getItem('usedIngredients')) || [];
    if (usedIngredients.length > 0) {
        let ingredients = JSON.parse(localStorage.getItem('ingredients')) || [];
        usedIngredients.forEach(used => {
            const ingredient = ingredients.find(ing => ing.name === used.name);
            if (ingredient) {
                ingredient.quantity -= used.quantity;
                if (ingredient.quantity <= 0) {
                    ingredients = ingredients.filter(ing => ing.name !== used.name);
                }
            }
        });
        localStorage.setItem('ingredients', JSON.stringify(ingredients));
        localStorage.removeItem('usedIngredients');
        document.getElementById('output').innerHTML = '';
        displayStoredIngredients();
    }
}
