// メニュー表示の切り替え
function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.classList.toggle('active');
}

// 食材の単位を定義
const unitMap = {
    'ごはん': '合',
    'うどん': '玉',
    '卵': '個',
    '長ネギ': '本',
    '紅ショウガ': 'g',
    'なす': '本',
    '牛肉': 'g',
    '玉ねぎ': '個',
    'ピーマン': '個',
    '鶏もも': 'g',
    'もやし': 'g',
    'パプリカ': '個',
    'にんにく': '片',
    'じゃがいも': '個',
    'ベーコン': '枚',
    'バター': 'g',
    'アスパラ': '本',
    'チーズ': 'g',
    'パスタ': 'g',
    'しめじ': '個',
    'にんじん': '個',
    '里芋': '個',
    'ごぼう': '本',
    'こんにゃく': '個',
    '舞茸': '個',
    'きゃべつ': '個',
    'トマト': '個',
    'other': '' // 自由入力の場合は単位なし
};

// 単位を推定する関数（自由入力の場合）
function guessUnitByName(name) {
    // 正確に一致する場合の単位を取得
    if (unitMap[name]) {
        return unitMap[name];
    }
}

// 選択された食材に応じて単位を更新
document.getElementById('name').addEventListener('change', function() {
    const selectedValue = this.value;
    const unitLabel = document.getElementById('unit-label');
    const otherNameInput = document.getElementById('otherName');
    const otherNameLabel = document.getElementById('otherNameLabel');

    if (selectedValue === 'other') {
        // 自由入力が選択された場合
        otherNameInput.style.display = 'block';
        otherNameLabel.style.display = 'block';
        unitLabel.textContent = '';  // 単位なし（後で入力内容から推定）
    } else {
        // 選択された食材に応じて単位を更新
        otherNameInput.style.display = 'none';
        otherNameLabel.style.display = 'none';
        unitLabel.textContent = unitMap[selectedValue] || '個'; // マッピングされた単位を表示
    }
});

// フォーム送信時に食材を保存し、リストに表示
document.getElementById('ingredient-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const nameSelect = document.getElementById('name');
    const selectedName = nameSelect.value;
    const otherName = document.getElementById('otherName').value;
    const name = selectedName === 'other' ? otherName : selectedName;

    // 単位を推定
    const unit = selectedName === 'other' ? guessUnitByName(otherName) : unitMap[selectedName] || '個';
    
    // 個数を単位に基づいて設定（例: うどんは1個=1玉）
    const quantity = parseFloat(document.getElementById('quantity').value);

    const now = new Date();
    const formattedDate = now.toLocaleString();

    const ingredient = {
        name: name,
        quantity: quantity,
        unit: unit,
        date: formattedDate,
    };
    saveIngredient(ingredient);
    document.getElementById('ingredient-form').reset();
});

// ユーザーが自由入力した際に単位を変更
document.getElementById('otherName').addEventListener('input', function() {
    const otherName = this.value;
    const unitLabel = document.getElementById('unit-label');

    // 単位を推定して表示
    const guessedUnit = guessUnitByName(otherName);
    unitLabel.textContent = guessedUnit;
});

// 保存された食材をローカルストレージに追加
function saveIngredient(ingredient) {
    let ingredients = JSON.parse(localStorage.getItem('ingredients')) || [];
    const existingIngredient = ingredients.find(ing => ing.name === ingredient.name);

    if (existingIngredient) {
        // 既存の食材がある場合は数量を加算
        existingIngredient.quantity += ingredient.quantity;
    } else {
        // 新しい食材を追加
        ingredients.push(ingredient);
    }

    localStorage.setItem('ingredients', JSON.stringify(ingredients)); // ローカルストレージに保存
    displayStoredIngredients();
    updateChecklist(ingredient.name);
}

// 保存された食材を表示し、チェックリストを更新
function displayStoredIngredients() {
    const ingredients = JSON.parse(localStorage.getItem('ingredients')) || [];
    const output = document.getElementById('output');
    output.innerHTML = '';

    ingredients.forEach(ingredient => {
        const outputItem = document.createElement('div');
        outputItem.innerHTML = `
            <strong>食材名:</strong> ${ingredient.name}<br>
            <strong>数量:</strong> ${ingredient.quantity} ${ingredient.unit}<br>
            <strong>登録した日時:</strong> ${ingredient.date}<br>
            <button class="delete-button" onclick="deleteIngredient('${ingredient.name}')">削除</button><br>`;
        output.appendChild(outputItem);
    });

    // チェックリストの更新
    updateChecklist();
}

// チェックリストを更新する関数
function updateChecklist() {
    const ingredients = JSON.parse(localStorage.getItem('ingredients')) || [];
    const checkboxes = document.querySelectorAll('.check-item');

    checkboxes.forEach(checkbox => {
        const ingredient = ingredients.find(ing => ing.name === checkbox.dataset.name);
        if (ingredient && ingredient.quantity >= checkbox.dataset.quantity) {
            checkbox.checked = true;
        }
    });

    // 全てのチェックボックスがチェックされたら次のミッションボタンを表示
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
    if (allChecked) {
        document.getElementById('mission-button').style.display = 'block';
    }
}

// 食材を削除する
function deleteIngredient(name) {
    let ingredients = JSON.parse(localStorage.getItem('ingredients')) || [];
    ingredients = ingredients.filter(ing => ing.name !== name);
    localStorage.setItem('ingredients', JSON.stringify(ingredients));
    displayStoredIngredients();
    updateChecklist();
}

// 次のミッションへ進む
function goToNextMission(missionNumber) {
    let ingredients = JSON.parse(localStorage.getItem('ingredients')) || [];
    const checkboxes = document.querySelectorAll('.check-item');
    let insufficientIngredients = '';

    checkboxes.forEach(checkbox => {
        const requiredQuantity = parseFloat(checkbox.dataset.quantity); // チェックリストに必要な個数
        const ingredientIndex = ingredients.findIndex(ing => ing.name === checkbox.dataset.name); // 該当の食材を取得

        if (ingredientIndex !== -1) {
            const ingredient = ingredients[ingredientIndex];
            const currentQuantity = parseFloat(ingredient.quantity); // 保存されている食材の個数
            const difference = currentQuantity - requiredQuantity; // 保存された数から必要数を引き算

            if (difference < 0) {
                // 不足している場合の処理
                insufficientIngredients += `${ingredient.name}: ${-difference} ${ingredient.unit}不足しています。\n`; // 不足している食材を表示
            } else if (difference === 0) {
                // ちょうど必要数だけあった場合、その食材を削除
                ingredients.splice(ingredientIndex, 1); // 配列から削除
            } else {
                // 十分な量がある場合、残りの個数を更新
                ingredient.quantity = difference;
            }
        } else {
            // 該当する食材が保存されていない場合
            insufficientIngredients += `${checkbox.dataset.name}: ${requiredQuantity} ${unitMap[checkbox.dataset.name]}不足しています。\n`;
        }
    });

    if (insufficientIngredients) {
        // 不足している食材がある場合はアラートを表示
        alert("以下の食材が不足しています:\n" + insufficientIngredients);
    } else {
        // ローカルストレージを更新し、次のミッションに進む
        localStorage.setItem('ingredients', JSON.stringify(ingredients)); // 更新後のデータを保存
        
        // 次のミッションのページに移動
        window.location.href = `mission2_${missionNumber}.html`; 
    }
}


// ページが読み込まれたら食材を表示し、チェックリストを更新
document.addEventListener('DOMContentLoaded', function() {
    displayStoredIngredients();
});
