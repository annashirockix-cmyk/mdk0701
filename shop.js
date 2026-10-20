/* ============================================================
   МДК — shop.js (Магазин, Темы и Достижения)
   ============================================================ */
"use strict";

// --- СПИСОК ДОСТИЖЕНИЙ ---
const ACHIEVEMENTS = [
    { id: "welcome", title: "Первый шаг", desc: "Войти в систему", icon: "🚪", check: (s) => !!s.student },
    { id: "reader", title: "Книжный червь", desc: "Изучить первую лекцию", icon: "📖", check: (s) => Object.keys(s.results).length > 0 },
    { id: "hacker", title: "Хакер", desc: "Пройти первый тест", icon: "💻", check: (s) => Object.keys(s.results).some(k => k.includes('_test')) },
    { id: "gamer", title: "Геймер", desc: "Сыграть в мини-игру", icon: "🎮", check: (s) => s.xp >= 50 }, // Упрощенно, т.к. XP дается за игры
    { id: "level_5", title: "Опытный", desc: "Достичь 5 уровня", icon: "⭐", check: (s) => window.getLevel(s.xp) >= 5 },
    { id: "rich", title: "Богач", desc: "Накопить 1000 XP", icon: "💰", check: (s) => s.xp >= 1000 }
];

// --- СПИСОК ТЕМ ДЛЯ ПОКУПКИ ---
const THEMES = [
    { id: "default", title: "Стандартная", desc: "Темная/Светлая", price: 0, color: "#ff6b3d" },
    { id: "neon", title: "Киберпанк", desc: "Яркий неон и розовый", price: 500, color: "#ff00cc" },
    { id: "matrix", title: "Матрица", desc: "Зеленый на черном", price: 500, color: "#00ff00" },
    { id: "ocean", title: "Глубина", desc: "Синие оттенки", price: 800, color: "#00bfff" },
    { id: "gold", title: "VIP", desc: "Золотой люкс", price: 1500, color: "#ffd700" }
];

// --- ПРОВЕРКА И ВЫДАЧА ДОСТИЖЕНИЙ ---
window.checkAchievements = function() {
    if (!state.student) return;
    if (!state.unlockedAchievements) state.unlockedAchievements = [];
    
    var newUnlocked = [];
    ACHIEVEMENTS.forEach(ach => {
        if (!state.unlockedAchievements.includes(ach.id) && ach.check(state)) {
            state.unlockedAchievements.push(ach.id);
            newUnlocked.push(ach);
        }
    });
    
    if (newUnlocked.length > 0) {
        window.saveStudentData();
        newUnlocked.forEach(a => {
            window.showToast(`🏆 Достижение: ${a.title}!`, "ok");
        });
    }
};

// --- РЕНДЕР СТРАНИЦЫ ДОСТИЖЕНИЙ ---
window.renderAchievementsPage = function() {
    var app = document.getElementById("app"); if (!app) return; app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Достижения";
    app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
    app.appendChild(el('<section class="hero"><h1>🏆 Ваши достижения</h1></section>'));
    
    window.checkAchievements(); // Обновляем перед показом
    
    var grid = el('<div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:16px;"></div>');
    var unlocked = state.unlockedAchievements || [];
    
    ACHIEVEMENTS.forEach(ach => {
        var isUnlocked = unlocked.includes(ach.id);
        var card = el(`<div class="module" style="text-align:center; opacity:${isUnlocked ? 1 : 0.5}; border:1px solid ${isUnlocked ? 'var(--accent)' : 'var(--border)'};">
            <div style="font-size:40px; margin-bottom:10px; filter:${isUnlocked ? 'none' : 'grayscale(100%)'};">${ach.icon}</div>
            <h3 style="margin:0; color:${isUnlocked ? 'var(--accent)' : 'var(--text)'};">${ach.title}</h3>
            <p style="font-size:12px; color:var(--muted); margin-top:5px;">${ach.desc}</p>
            <div style="margin-top:10px; font-size:11px; font-weight:bold; color:${isUnlocked ? 'var(--ok)' : 'var(--err)'};">
                ${isUnlocked ? "ПОЛУЧЕНО" : "ЗАКРЫТО"}
            </div>
        </div>`);
        grid.appendChild(card);
    });
    app.appendChild(grid);
};

// --- РЕНДЕР МАГАЗИНА ---
window.renderShopPage = function() {
    var app = document.getElementById("app"); if (!app) return; app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Магазин XP";
    app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
    app.appendChild(el(`<section class="hero"><h1>🛒 Магазин</h1><p>Ваш баланс: <b style="color:var(--gold); font-size:20px;">${state.xp} XP</b></p></section>`));
    
    var grid = el('<div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:16px;"></div>');
    
    if (!state.purchasedThemes) state.purchasedThemes = ["default"];
    var activeTheme = localStorage.getItem("mdk.theme_active") || "default";

    THEMES.forEach(theme => {
        var isOwned = state.purchasedThemes.includes(theme.id);
        var isActive = activeTheme === theme.id;
        
        var btnHtml = "";
        if (isActive) {
            btnHtml = `<button class="btn ghost" disabled style="width:100%; border-color:var(--ok); color:var(--ok);">✅ Активна</button>`;
        } else if (isOwned) {
            btnHtml = `<button class="btn" onclick="window.applyShopTheme('${theme.id}')" style="width:100%; background:var(--card-soft); color:var(--text); border:1px solid var(--border);">Применить</button>`;
        } else {
            btnHtml = `<button class="btn" onclick="window.buyTheme('${theme.id}', ${theme.price})" style="width:100%; background:var(--gold); color:#000;">Купить за ${theme.price} XP</button>`;
        }

        var card = el(`<div class="module" style="text-align:center; border-top:4px solid ${theme.color};">
            <h3 style="margin-top:0; color:${theme.color};">${theme.title}</h3>
            <p style="font-size:13px; color:var(--muted); margin-bottom:20px;">${theme.desc}</p>
            ${btnHtml}
        </div>`);
        grid.appendChild(card);
    });
    app.appendChild(grid);
};

// --- ЛОГИКА ПОКУПКИ И ПРИМЕНЕНИЯ ---
window.buyTheme = function(id, price) {
    if (state.xp < price) {
        window.showToast("Недостаточно XP для покупки!", "err");
        return;
    }
    if (confirm(`Купить тему за ${price} XP?`)) {
        state.xp -= price;
        if (!state.purchasedThemes) state.purchasedThemes = [];
        state.purchasedThemes.push(id);
        
        // Если это первая покупка, сразу применяем
        if (state.purchasedThemes.length === 2) { // default + 1 новая
            window.applyShopTheme(id);
        } else {
            window.saveStudentData();
            window.updateXpDisplay();
            window.renderShopPage();
        }
        window.showToast("Покупка успешна!", "ok");
    }
};

window.applyShopTheme = function(id) {
    localStorage.setItem("mdk.theme_active", id);
    if (id === "default") {
        document.documentElement.setAttribute("data-theme", localStorage.getItem("mdk.theme") || "dark");
    } else {
        document.documentElement.setAttribute("data-theme", id);
    }
    window.renderShopPage();
    window.showToast("Тема применена", "ok");
};