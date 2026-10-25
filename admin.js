window.renderAdminPanel = function() {
    var app = document.getElementById("app");
    app.innerHTML = `<a class="backlink" href="#/profile" style="color:var(--accent);">← Назад в кабинет</a>
    <section class="hero"><h1>⚙️ Панель управления</h1></section>
    <div class="module">
        <h3>📢 Добавить уведомление на главную</h3>
        <input type="text" id="admNotifText" class="self-input" placeholder="Текст уведомления (например: В пятницу экзамен!)">
        <button class="btn" onclick="window.addNotification()">Добавить</button>
        
        <h3 style="margin-top:30px;">📚 Добавить новую тему в МДК</h3>
        <select id="admTopicMdk" class="self-input">
            <option value="07.01">МДК 07.01</option>
            <option value="04.01">МДК 04.01</option>
            <option value="02.01">МДК 02.01</option>
        </select>
        <input type="text" id="admTopicName" class="self-input" placeholder="Название темы">
        <textarea id="admTopicContent" class="self-input" rows="5" placeholder="Текст лекции (HTML поддерживается)"></textarea>
        <button class="btn" onclick="window.addCustomTopic()">Создать тему</button>

        <hr style="margin: 30px 0; border-color: var(--border);">

        <h3>📄 Загрузить PDF в лекцию</h3>
        <select id="admPdfMdk" class="self-input">
            <option value="07.01">МДК 07.01</option>
            <option value="04.01">МДК 04.01</option>
            <option value="02.01">МДК 02.01</option>
            <option value="02.02">МДК 02.02</option>
        </select>
        <input type="text" id="admPdfTopic" class="self-input" placeholder="ID темы (например: t-1-1 или t-3-1)">
        <input type="text" id="admPdfTitle" class="self-input" placeholder="Название PDF документа">
        <input type="file" id="admPdfFile" accept=".pdf" class="self-input" style="padding:10px; background:var(--bg);">
        <button class="btn" onclick="window.uploadPdf()">Загрузить PDF</button>

        <hr style="margin: 30px 0; border-color: var(--border);">

        <h3>📇 Создать флэш-карточку</h3>
        <select id="admFcMdk" class="self-input">
            <option value="07.01">МДК 07.01</option>
            <option value="04.01">МДК 04.01</option>
            <option value="02.01">МДК 02.01</option>
            <option value="02.02">МДК 02.02</option>
        </select>
        <input type="text" id="admFcTopic" class="self-input" placeholder="ID темы (например: t-1-1)">
        <input type="text" id="admFcTerm" class="self-input" placeholder="Термин (лицевая сторона)">
        <input type="text" id="admFcDef" class="self-input" placeholder="Определение (обратная сторона)">
        <button class="btn" onclick="window.addFlashcard()">Создать карточку</button>
    </div>`;
};

window.uploadPdf = function() {
    var mdkId = document.getElementById("admPdfMdk").value;
    var topicId = document.getElementById("admPdfTopic").value;
    var title = document.getElementById("admPdfTitle").value;
    var file = document.getElementById("admPdfFile").files[0];
    if(!mdkId || !topicId || !title || !file) return window.showToast("Заполните все поля и выберите файл", "err");
    
    var reader = new FileReader();
    reader.onload = function(e) {
        if (!window.CUSTOM_DATA.customLectures) window.CUSTOM_DATA.customLectures = [];
        window.CUSTOM_DATA.customLectures.push({ mdkId, topicId, title, dataUrl: e.target.result });
        window.saveCustomData();
        window.showToast("PDF успешно загружен!", "ok");
        document.getElementById("admPdfFile").value = "";
    };
    reader.readAsDataURL(file);
};

window.addFlashcard = function() {
    var mdkId = document.getElementById("admFcMdk").value;
    var topicId = document.getElementById("admFcTopic").value;
    var term = document.getElementById("admFcTerm").value;
    var definition = document.getElementById("admFcDef").value;
    if(!mdkId || !topicId || !term || !definition) return window.showToast("Заполните все поля", "err");
    
    if (!window.CUSTOM_DATA.flashcards) window.CUSTOM_DATA.flashcards = [];
    window.CUSTOM_DATA.flashcards.push({ mdkId, topicId, term, definition });
    window.saveCustomData();
    window.showToast("Карточка создана!", "ok");
    document.getElementById("admFcTerm").value = "";
    document.getElementById("admFcDef").value = "";
};