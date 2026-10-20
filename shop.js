"use strict";

const ACHIEVEMENTS = [
    { id: "welcome", title: "Первый шаг", desc: "Войти в систему", icon: "🚪", check: (s) => !!s.student },
    { id: "reader", title: "Книжный червь", desc: "Изучить первую лекцию", icon: "📖", check: (s) => Object.keys(s.results).length > 0 },
    { id: "hacker", title: "Хакер", desc: "Пройти первый тест", icon: "💻", check: (s) => Object.keys(s.results).some(k => k.includes('_test')) },
    { id: "gamer", title: "Геймер", desc: "Сыграть в мини-игру", icon: "🎮", check: (s) => s.xp >= 50 },
    { id: "level_5", title: "Опытный", desc: "Достичь 5 уровня", icon: "⭐", check: (s) => window.getLevel(s.xp) >= 5 },
    { id: "rich", title: "Богач", desc: "Накопить 1000 XP", icon: "💰", check: (s) => s.xp >= 1000 }
];

// Товары в магазине
const THEMES = [
    { id: "default", title: "Стандартная", price: 0, color: "#ff6b3d", type: "theme" },
    { id: "neon", title: "Киберпанк", price: 500, color: "#ff00cc", type: "theme" },
    { id: "matrix", title: "Матрица", price: 500, color: "#00ff00", type: "theme" },
    { id: "anime", title: "Аниме (Розовый)", price: 800, color: "#ffb6c1", type: "theme" },
    { id: "rgb", title: "RGB Геймер", price: 1000, color: "#ff0055", type: "theme" }
];

const AVATARS = [
    { id: "default", url: null, price: 0, title: "Стандартный" },
    { id: "av1", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix", price: 200, title: "Парень" },
    { id: "av2", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka", price: 200, title: "Девушка" },
    { id: "av3", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Robo", price: 300, title: "Робот" },
    { id: "custom", url: "url", price: 500, title: "Свой URL" }
];

const EFFECTS = [
    { id: "none", title: "Нет", price: 0, css: "" },
    { id: "glow", title: "Свечение", price: 400, css: "box-shadow: 0 0 15px var(--accent); border-color: var(--accent);" },
    { id: "rainbow", title: "Радуга", price: 800, css: "animation: rainbow-border 3s infinite linear; border: 3px solid; border-image: linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet) 1;" }
];

window.checkAchievements = function() {
    if (!window.state.student) return;
    if (!window.state.unlockedAchievements) window.state.unlockedAchievements = [];
    ACHIEVEMENTS.forEach(ach => {
        if (!window.state.unlockedAchievements.includes(ach.id) && ach.check(window.state)) {
            window.state.unlockedAchievements.push(ach.id);
            window.showToast(`🏆 Достижение: ${ach.title}!`, "ok");
            window.saveStudentData();
        }
    });
};

window.renderShopPage = function() {
    var app = document.getElementById("app"); if (!app) return; app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Магазин XP";
    app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
    app.appendChild(el(`<section class="hero"><h1>🛒 Магазин</h1><p>Баланс: <b style="color:var(--gold); font-size:24px;">${window.state.xp} XP</b></p></section>`));

    function renderCategory(title, items, type) {
        var html = `<h3 style="margin-top:30px; border-bottom: 2px solid var(--border); padding-bottom:10px;">${title}</h3>`;
        html += `<div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:16px;">`;
        
        items.forEach(item => {
            var isOwned = (window.state.purchasedThemes || []).includes(item.id) || (window.state.avatar === item.url) || (window.state.effect === item.id);
            var isActive = false;
            if (type === 'theme') isActive = localStorage.getItem("mdk.theme_active") === item.id;
            if (type === 'avatar') isActive = window.state.avatar === item.url || (item.id === 'default' && !window.state.avatar);
            if (type === 'effect') isActive = (window.state.effect || 'none') === item.id;

            var btnHtml = "";
            if (isActive) btnHtml = `<button class="btn ghost" disabled style="border-color:var(--ok); color:var(--ok); width:100%;">✅ Активно</button>`;
            else if (isOwned) btnHtml = `<button class="btn" onclick="window.applyShopItem('${type}', '${item.id}', '${item.url || ''}')" style="width:100%; background:var(--card-soft); color:var(--text);">Применить</button>`;
            else btnHtml = `<button class="btn" onclick="window.buyShopItem('${type}', '${item.id}', ${item.price}, '${item.url || ''}')" style="width:100%; background:var(--gold); color:#000;">Купить за ${item.price} XP</button>`;

            var preview = "";
            if (type === 'theme') preview = `<div style="height:40px; border-radius:8px; background:${item.color}; margin-bottom:10px;"></div>`;
            if (type === 'avatar' && item.url && item.url !== 'url') preview = `<img src="${item.url}" style="width:60px; height:60px; border-radius:50%; margin:0 auto 10px; display:block;">`;
            if (type === 'effect') preview = `<div style="height:40px; width:40px; border-radius:50%; background:var(--card); margin:0 auto 10px; ${item.css}"></div>`;

            html += `<div class="module" style="padding:15px; text-align:center;">
                ${preview}
                <h4 style="margin:0 0 10px 0;">${item.title}</h4>
                ${btnHtml}
            </div>`;
        });
        html += `</div>`;
        return html;
    }

    app.innerHTML += renderCategory("🎨 Темы оформления", THEMES, "theme");
    app.innerHTML += renderCategory("👤 Аватары", AVATARS, "avatar");
    app.innerHTML += renderCategory("✨ Эффекты аватара", EFFECTS, "effect");
    
    // Плюшки за уровень
    var lvl = window.getLevel(window.state.xp);
    app.innerHTML += `<h3 style="margin-top:30px; border-bottom: 2px solid var(--border); padding-bottom:10px;">🎁 Плюшки за уровень</h3>
    <div class="module">
        <p>Ваш уровень: <b>${lvl}</b></p>
        <ul>
            <li>Ур. 2: Открывается кастомизация профиля (скоро)</li>
            <li>Ур. 5: Скидка 10% в магазине (скоро)</li>
            <li>Ур. 10: Особый значок в профиле (скоро)</li>
        </ul>
    </div>`;
};

window.buyShopItem = function(type, id, price, url) {
    if (window.state.xp < price) return window.showToast("Недостаточно XP!", "err");
    if (url === 'url') {
        url = prompt("Введите прямую ссылку на картинку (URL, заканчивающийся на .png, .jpg, .gif):");
        if (!url || (!url.startsWith("http") && !url.startsWith("data:"))) return window.showToast("Неверный URL", "err");
    }
    if (confirm(`Купить за ${price} XP?`)) {
        window.state.xp -= price;
        if (type === 'theme') { if(!window.state.purchasedThemes) window.state.purchasedThemes = []; window.state.purchasedThemes.push(id); }
        if (type === 'avatar') { window.state.avatar = url; }
        if (type === 'effect') { window.state.effect = id; }
        
        window.saveStudentData();
        window.showToast("Покупка успешна!", "ok");
        window.renderShopPage();
        window.renderUserChip();
    }
};

window.applyShopItem = function(type, id, url) {
    if (type === 'theme') {
        localStorage.setItem("mdk.theme_active", id);
        document.documentElement.setAttribute("data-theme", id === "default" ? "dark" : id);
    } else if (type === 'avatar') {
        window.state.avatar = url || null;
    } else if (type === 'effect') {
        window.state.effect = id;
    }
    window.saveStudentData();
    window.showToast("Применено!", "ok");
    window.renderShopPage();
    window.renderUserChip();
};

window.renderProfilePage = function() {
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = "";
  app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
  
  if (window.state.staff) { app.innerHTML += `<section class="module"><h1>Профиль учителя</h1><p>${window.state.staff.name}</p></section>`; return; }
  if (!window.state.student) return;

  var lvl = window.getLevel(window.state.xp);
  var effCss = window.state.effect && window.state.effect !== 'none' ? EFFECTS.find(e => e.id === window.state.effect).css : "";
  var avHtml = window.state.avatar ? `<img src="${window.state.avatar}" style="width:100px; height:100px; border-radius:50%; object-fit:cover;">` : "👨‍🎓";

  app.innerHTML += `<section class="module" style="text-align:center; padding:40px;">
      <div style="width:120px; height:120px; margin:0 auto 20px; border-radius:50%; border:4px solid var(--accent); display:flex; align-items:center; justify-content:center; font-size:60px; ${effCss}">
          ${avHtml}
      </div>
      <h2 style="margin:0 0 10px 0;">${window.state.student.name}</h2>
      <p style="color:var(--muted); margin-bottom:15px;">Группа: ${window.state.student.group}</p>
      <div style="display:inline-block; background:var(--card-soft); padding:10px 20px; border-radius:20px;">
          <b style="color:var(--gold);">${window.state.xp} XP</b> · Уровень ${lvl}
      </div>
  </section>
  <section class="module">
      <h3>Подпись профиля</h3>
      <input type="text" id="profileNick" class="self-input" placeholder="Никнейм (по умолчанию ФИО)" value="${window.state.nickname || ''}">
      <input type="text" id="profileSign" class="self-input" placeholder="Подпись или статус" value="${window.state.signature || ''}">
      <button class="btn" onclick="window.saveProfileDetails()">Сохранить</button>
  </section>`;
};

window.saveProfileDetails = function() {
    window.state.nickname = document.getElementById("profileNick").value;
    window.state.signature = document.getElementById("profileSign").value;
    window.saveStudentData();
    window.showToast("Профиль обновлен", "ok");
};