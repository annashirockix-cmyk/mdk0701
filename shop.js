"use strict";

const ACHIEVEMENTS = [
    { id: "welcome", title: "Первый шаг", desc: "Войти в систему", icon: "🚪" },
    { id: "reader", title: "Книжный червь", desc: "Изучить лекцию", icon: "📖" },
    { id: "hacker", title: "Хакер", desc: "Пройти тест", icon: "💻" },
    { id: "gamer", title: "Геймер", desc: "Сыграть в игру", icon: "🎮" },
    { id: "gcode_pro", title: "G-кодер", desc: "Пройти уровень в тренажере G-кода", icon: "📐" },
    { id: "level_5", title: "Опытный", desc: "Достичь 5 уровня", icon: "⭐" },
    { id: "rich", title: "Богач", desc: "Накопить 1000 XP", icon: "💰" }
];

const THEMES = [
    { id: "default", title: "Стандартная", price: 0, bg: "#0e0e10", text: "#e8e6e1" },
    { id: "light", title: "Светлая", price: 0, bg: "#f5f2ec", text: "#2c2c2c" },
    { id: "neon", title: "Киберпанк", price: 500, bg: "#09090b", text: "#ff00cc" },
    { id: "matrix", title: "Матрица", price: 500, bg: "#000000", text: "#00ff00" },
    { id: "cyberpunk", title: "Cyberpunk", price: 800, bg: "#0a0015", text: "#00ffff" }
];

const AVATARS = [
    { id: "default", url: null, price: 0, title: "Стандарт" },
    { id: "av1", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix", price: 100, title: "Парень" },
    { id: "av2", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka", price: 100, title: "Девушка" },
    { id: "av3", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Robo", price: 200, title: "Робот" },
    { id: "custom", url: "url", price: 500, title: "Свой URL" }
];

const TEXT_EFFECTS = [
    { id: "none", title: "Без эффекта", price: 0 },
    { id: "fx-rainbow-text", title: "Радужный текст", price: 300 },
    { id: "fx-neon-text", title: "Неоновое свечение", price: 400 },
    { id: "fx-glitch-text", title: "Глитч (Помехи)", price: 500 },
    { id: "fx-typewriter", title: "Пишущая машинка", price: 200 }
];

const BG_EFFECTS = [
    { id: "none", title: "Без эффекта", price: 0 },
    { id: "fx-aurora-bg", title: "Северное сияние", price: 500 },
    { id: "fx-matrix-bg", title: "Матрица (Дождь)", price: 600 },
    { id: "fx-starfield-bg", title: "Звездное небо", price: 600 },
    { id: "bg-underwater", title: "Подводный мир", price: 700 },
    { id: "bg-foggy-forest", title: "Туманный лес", price: 700 },
    { id: "bg-stone-alley", title: "Каменная аллея", price: 700 },
    { id: "bg-cats-yarn", title: "Кошки и клубки", price: 700 },
    { id: "bg-pumpkins", title: "Тыквы", price: 700 },
    { id: "bg-spooky-room", title: "Жуткая комната", price: 700 },
    { id: "bg-halloween", title: "Хэллоуин", price: 700 },
    { id: "bg-red-forest", title: "Красный лес", price: 700 },
    { id: "bg-lanterns", title: "Фонари", price: 700 },
    { id: "bg-dark-table", title: "Темный стол", price: 700 },
    { id: "bg-graveyard", title: "Кладбище", price: 700 },
    { id: "bg-cats-notebook", title: "Коты и тетрадь", price: 700 }
];

const CARD_EFFECTS = [
    { id: "none", title: "Без эффекта", price: 0 },
    { id: "fx-holo-card", title: "Голографическая карта", price: 700 },
    { id: "fx-3d-card", title: "3D карточка", price: 800 }
];

window.renderShopPage = function() {
    var app = document.getElementById("app"); if (!app) return; app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Магазин XP";
    app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
    
    var isTeacher = !!window.state.staff;
    var balance = isTeacher ? "∞ (Преподаватель)" : window.state.xp + " XP";
    
    app.appendChild(el(`<section class="hero"><h1>🛒 Магазин</h1><p>Баланс: <b style="color:var(--gold); font-size:24px;">${balance}</b></p></section>`));

    function renderCategory(title, items, type) {
        var html = `<h3 style="margin-top:30px; border-bottom: 2px solid var(--border); padding-bottom:10px;">${title}</h3>`;
        html += `<div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:16px; margin-top:15px;">`;
        
        items.forEach(item => {
            var isOwned = isTeacher || 
                          (type === 'theme' && (window.state.purchasedThemes || []).includes(item.id)) ||
                          (type === 'avatar' && window.state.avatar === item.url) ||
                          (type === 'text' && (window.state.purchasedTextEffects || []).includes(item.id)) ||
                          (type === 'bg' && (window.state.purchasedBgEffects || []).includes(item.id)) ||
                          (type === 'card' && (window.state.purchasedCardEffects || []).includes(item.id)) ||
                          item.price === 0;
            
            var isActive = false;
            if (type === 'theme') isActive = localStorage.getItem("mdk.theme_active") === item.id;
            if (type === 'avatar') isActive = window.state.avatar === item.url || (item.id === 'default' && !window.state.avatar);
            if (type === 'text') isActive = (window.state.activeTextEffect || 'none') === item.id;
            if (type === 'bg') isActive = (window.state.activeBgEffect || 'none') === item.id;
            if (type === 'card') isActive = (window.state.activeCardEffect || 'none') === item.id;

            var btnHtml = "";
            if (isActive) {
                btnHtml = `<button class="btn ghost" disabled style="border-color:var(--ok); color:var(--ok); width:100%;">✅ Активно</button>`;
            } else if (isOwned) {
                btnHtml = `<button class="btn" onclick="window.applyShopItem('${type}', '${item.id}', '${item.url || ''}')" style="width:100%; background:var(--card-soft); color:var(--text); border:1px solid var(--border);">Применить</button>`;
            } else {
                btnHtml = `<button class="btn" onclick="window.buyShopItem('${type}', '${item.id}', ${item.price}, '${item.url || ''}')" style="width:100%; background:var(--gold); color:#000;">Купить (${item.price} XP)</button>`;
            }

            var preview = "";
            if (type === 'theme') {
                preview = `<div style="background:${item.bg}; color:${item.text}; height:60px; border-radius:6px; margin-bottom:10px; display:flex; align-items:center; justify-content:center; font-weight:bold;">Aa</div>`;
            }
            if (type === 'avatar' && item.url && item.url !== 'url') {
                preview = `<img src="${item.url}" style="width:60px; height:60px; border-radius:50%; margin:0 auto 10px; display:block;">`;
            } else if (type === 'avatar' && item.id === 'default') {
                preview = `<div style="font-size:40px; margin-bottom:10px;">👨‍🎓</div>`;
            }
            if (type === 'text') {
                preview = `<div class="${item.id !== 'none' ? item.id : ''}" data-text="Текст" style="font-size:20px; font-weight:bold; margin-bottom:10px; height:40px;">${item.title}</div>`;
            }
            if (type === 'bg') {
                preview = `<div class="${item.id !== 'none' ? item.id : ''}" style="height:60px; border-radius:6px; margin-bottom:10px; border:1px solid var(--border);"></div>`;
            }
            if (type === 'card') {
                preview = `<div class="${item.id !== 'none' ? item.id : ''}" style="height:60px; background:var(--card-soft); border-radius:6px; margin-bottom:10px; border:1px solid var(--accent); display:flex; align-items:center; justify-content:center;">Карта</div>`;
            }

            html += `<div class="module" style="padding:15px; text-align:center; display:flex; flex-direction:column; justify-content:space-between; margin-bottom:0;">
                <div>${preview}<h4 style="margin:0 0 10px 0; font-size:14px;">${item.title}</h4></div>
                ${btnHtml}
            </div>`;
        });
        html += `</div>`;
        return html;
    }

    app.innerHTML += renderCategory("🎨 Темы оформления", THEMES, "theme");
    app.innerHTML += renderCategory("👤 Аватары", AVATARS, "avatar");
    app.innerHTML += renderCategory("✨ Эффекты текста", TEXT_EFFECTS, "text");
    app.innerHTML += renderCategory("🌌 Эффекты фона", BG_EFFECTS, "bg");
    app.innerHTML += renderCategory("🃏 Эффекты карточек", CARD_EFFECTS, "card");
};

window.buyShopItem = function(type, id, price, value) {
    if (!window.state.staff && window.state.xp < price) return window.showToast("Недостаточно XP!", "err");
    
    if (type === 'avatar' && value === 'url') {
        value = prompt("Введите прямую ссылку на картинку (URL):");
        if (!value || (!value.startsWith("http") && !value.startsWith("data:"))) return window.showToast("Неверный URL", "err");
    }

    if (window.state.staff || confirm(`Купить за ${price} XP?`)) {
        if (!window.state.staff) window.state.xp -= price;
        
        if (type === 'theme') { if(!window.state.purchasedThemes) window.state.purchasedThemes = []; window.state.purchasedThemes.push(id); }
        if (type === 'text') { if(!window.state.purchasedTextEffects) window.state.purchasedTextEffects = []; window.state.purchasedTextEffects.push(id); }
        if (type === 'bg') { if(!window.state.purchasedBgEffects) window.state.purchasedBgEffects = []; window.state.purchasedBgEffects.push(id); }
        if (type === 'card') { if(!window.state.purchasedCardEffects) window.state.purchasedCardEffects = []; window.state.purchasedCardEffects.push(id); }
        
        window.saveStudentData();
        window.showToast("Покупка успешна!", "ok");
        window.renderShopPage();
    }
};

window.applyShopItem = function(type, id, value) {
    if (type === 'theme') {
        localStorage.setItem("mdk.theme_active", id);
        document.documentElement.setAttribute("data-theme", id === "default" ? "dark" : id);
    } else if (type === 'avatar') {
        window.state.avatar = value || null;
    } else if (type === 'text') {
        window.state.activeTextEffect = id;
    } else if (type === 'bg') {
        window.state.activeBgEffect = id;
    } else if (type === 'card') {
        window.state.activeCardEffect = id;
    }
    
    window.saveStudentData();
    window.showToast("Применено!", "ok");
    window.renderShopPage();
    if (window.renderUserChip) window.renderUserChip();
    if (window.applyGlobalEffects) window.applyGlobalEffects();
};