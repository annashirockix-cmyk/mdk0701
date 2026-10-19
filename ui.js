/* ============================================================
   МДК 07.01 — ui.js (v160.0)
   ============================================================ */
"use strict";

window.$ = (id) => document.getElementById(id);
window.el = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; };
window.escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.studentKey = (s) => { s = s || state.student; return s ? (s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase()) : null; };

window.showToast = function(msg, type) {
  var container = document.querySelector(".toast-container");
  if (!container) { container = document.createElement("div"); container.className = "toast-container"; document.body.appendChild(container); }
  var toast = document.createElement("div"); toast.className = "toast " + (type || "");
  toast.innerHTML = (type === "ok" ? "✅ " : type === "err" ? "❌ " : "ℹ️ ") + escapeHtml(msg);
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add("out"); setTimeout(() => toast.remove(), 300); }, 3000);
};

window.updateXpDisplay = function() {
    if ($("xpCount")) $("xpCount").textContent = "🌟 " + state.xp + " XP · Lv." + getLevel(state.xp);
};

window.renderUserChip = function() {
    if (!state.student && !state.staff) return;
    if (state.staff) {
        $("userChipName").textContent = state.staff.name;
        $("userChipGroup").textContent = state.staff.role === "admin" ? "Админ" : "Учитель";
        $("userChipAvatar").innerHTML = state.staff.role === "admin" ? "👑" : "👨‍🏫";
    } else {
        $("userChipName").textContent = state.student.name;
        $("userChipGroup").textContent = "Гр. " + state.student.group;
        var avHtml = state.avatar ? '<img src="' + state.avatar + '" style="width:100%;height:100%;object-fit:cover;">' : "👨‍🎓";
        var effClass = state.avatarEffect ? " av-fx-" + state.avatarEffect : "";
        $("userChipAvatar").innerHTML = '<div class="av-container' + effClass + '" style="width:100%; height:100%; font-size:24px;">' + avHtml + '</div>';
    }
};

window.renderQuestsWidget = function() {
    if (!state.student) return "";
    var q = state.dailyQuests;
    return '<div id="questPanel" class="quest-panel">' +
        '<h3 class="quest-title">📜 Ежедневные квесты</h3>' +
        '<div class="quest-grid">' +
            '<div class="quest-item ' + (q.read ? 'done' : '') + '"><div class="quest-checkbox">' + (q.read ? '✔' : '') + '</div>📖 Изучить лекцию</div>' +
            '<div class="quest-item ' + (q.game ? 'done' : '') + '"><div class="quest-checkbox">' + (q.game ? '✔' : '') + '</div>🎮 Сыграть в игру</div>' +
            '<div class="quest-item ' + (q.chat ? 'done' : '') + '"><div class="quest-checkbox">' + (q.chat ? '✔' : '') + '</div>💬 Написать в чат</div>' +
        '</div>' +
    '</div>';
};

// ГЛАВНАЯ (С кнопкой Продолжить)
function renderHome() {
    var app = $("app"); app.innerHTML = "";
    var c = window.COURSE;
    app.appendChild(el('<section class="hero"><h1>' + c.title + '</h1><p>' + c.module + '</p></section>'));
    
    // Кнопка продолжить
    var lastTopicId = localStorage.getItem("mdk0701.lastTopic." + studentKey());
    if (lastTopicId && state.student) {
        // Проверяем, существует ли такая тема
        var allTopics = [];
        c.sections.forEach(s => allTopics = allTopics.concat(s.topics));
        var t = allTopics.find(x => x.id === lastTopicId);
        if (t) {
            app.appendChild(el('<a href="#/topic/' + lastTopicId + '/lecture" style="text-decoration:none; display:block; margin-bottom:24px;"><div class="module" style="background:linear-gradient(135deg, var(--accent-soft), var(--card)); border-left:6px solid var(--accent); text-align:left; display:flex; justify-content:space-between; align-items:center;"><div><div style="font-size:12px; text-transform:uppercase; color:var(--muted); font-weight:bold; margin-bottom:4px;">Вы остановились на:</div><div style="font-size:18px; font-weight:bold; color:var(--text);">' + t.code + ' - ' + t.title + '</div></div><div style="font-size:30px;">▶️</div></div></a>'));
        }
    }

    app.appendChild(el(window.renderQuestsWidget()));
    
    app.appendChild(el('<div class="steps-title">Учебный план</div>'));
    c.sections.forEach(sec => {
        app.appendChild(el('<div style="font-weight:bold; margin:20px 0 10px; color:var(--accent); text-transform:uppercase; font-size:12px; letter-spacing:1px;">' + sec.title + '</div>'));
        var list = document.createElement("div");
        sec.topics.forEach(t => {
            var isDone = state.results[t.id] || state.selfResults[t.id];
            list.appendChild(el('<div class="topic" onclick="location.hash=\'#/topic/' + t.id + '/lecture\'" style="display:flex; align-items:center; padding:12px; border:1px solid var(--border); margin-bottom:8px; border-radius:8px; cursor:pointer; background:var(--card);"><span style="margin-right:15px; font-size:20px;">' + (isDone ? '✅' : '📖') + '</span><div><div style="font-size:12px; color:var(--muted);">' + t.code + '</div><div style="font-weight:bold;">' + t.title + '</div></div></div>'));
        });
        app.appendChild(list);
    });

    // Пасхалки (Мемы)
    if (state.student) {
        app.appendChild(el('<div class="steps-title">Секретный архив</div>'));
        app.appendChild(el('<div style="display:flex; gap:10px; overflow-x:auto; padding-bottom:10px;">' +
            '<img src="img/meme-js.jpg" onclick="window.showToast(\'JS — Король фронтенда!\', \'ok\')" style="height:150px; border-radius:8px; cursor:pointer; border:2px solid var(--border);">' +
            '<img src="img/meme-python.jpg" onclick="window.showToast(\'Python — Король бэкенда!\', \'ok\')" style="height:150px; border-radius:8px; cursor:pointer; border:2px solid var(--border);">' +
            '<img src="img/meme-vars.jpg" onclick="window.showToast(\'Лучшие имена переменных!\', \'ok\')" style="height:150px; border-radius:8px; cursor:pointer; border:2px solid var(--border);">' +
        '</div>'));
    }
}

// ПРОФИЛЬ (ID-КАРТА С ФОНОМ)
window.renderProfilePage = function(targetKey){
  var app = $("app"); app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Личный кабинет";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  if (!state.student && !state.staff) return;

  var data = state.student || state.staff;
  var isStaff = !!state.staff;
  var level = getLevel(isStaff ? 1 : state.xp);
  
  var avatarHtml = state.avatar 
      ? '<img src="' + state.avatar + '" style="width:100%; height:100%; object-fit:cover;">' 
      : (isStaff ? (state.staff.role === "admin" ? "👑" : "👨‍🏫") : "👨‍🎓");
      
  var card = `
    <div class="id-card">
        <div class="id-card-header">
            <div>
                <h1 class="id-card-title">STUDENT DOCUMENT</h1>
                <div class="id-card-subtitle">MDK 07.01 · CNC OPERATOR</div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:10px; font-weight:bold; border:1px solid #111; padding:2px 6px; display:inline-block;">REGISTERED</div>
            </div>
        </div>
        
        <div class="id-card-body">
            <div class="id-photo">${avatarHtml}</div>
            <div class="id-info">
                <table>
                    <tr><td class="label">NAME</td><td class="value">${escapeHtml(data.name)}</td></tr>
                    <tr><td class="label">GROUP</td><td class="value">${isStaff ? 'STAFF' : escapeHtml(state.student.group)}</td></tr>
                    <tr><td class="label">LEVEL</td><td class="value" style="color:#c14a2a;">${level} (${getLevelTitle(level)})</td></tr>
                    <tr><td class="label">XP POINTS</td><td class="value">${isStaff ? '∞' : state.xp}</td></tr>
                </table>
            </div>
        </div>
        
        <div class="id-barcode"></div>
        
        <div style="margin-top:30px; border-top:1px solid #111; padding-top:10px; display:flex; justify-content:space-between; align-items:flex-end;">
            <div>
                <div style="font-size:10px; text-transform:uppercase; color:#555;">Signature</div>
                <div style="font-family:'Caveat', cursive; font-size:26px; border-bottom:1px solid #111; min-width:150px; padding-bottom:2px;">
                    ${escapeHtml(state.nick || data.name)}
                </div>
            </div>
            <div style="text-align:center; border:2px solid #c14a2a; color:#c14a2a; border-radius:50%; width:60px; height:60px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:11px; transform:rotate(-15deg); opacity:0.7;">
                МДК<br>07.01
            </div>
        </div>
    </div>
  `;
  app.appendChild(el(card));

  if (!isStaff) {
      app.appendChild(el('<div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:20px;">' +
        '<button class="btn" onclick="location.hash=\'#/portfolio\'">🎓 Портфолио</button>' +
        '<button class="btn ghost" onclick="location.hash=\'#/shop\'">🛒 Магазин</button>' +
        '<a href="https://annashirockix-cmyk.github.io/mdk0401/" target="_blank" class="btn" style="background:#2b5797; color:#fff; text-decoration:none;">🚀 МДК 04.01</a>' +
      '</div>'));
  }
};

// МАГАЗИН (Добавлены ваши фоны)
window.renderShopPage = function() {
    var app = $("app"); app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Магазин XP";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>Магазин</h1><p>Баланс: <b>' + state.xp + ' XP</b></p></section>'));
    
    var items = [
        { id: "fx_gold", icon: "👑", title: "Маска: Золото", price: 2000, type: "avatar_effect", effect: "gold" },
        { id: "fx_neon", icon: "🟢", title: "Маска: Неон", price: 2500, type: "avatar_effect", effect: "neon" },
        { id: "bg_space", icon: "🌍", title: "Фон: Космос", price: 1000, type: "bg", bg: "space" },
        { id: "bg_hyper", icon: "🧮", title: "Фон: Формулы", price: 1500, type: "bg", bg: "hyper" },
        { id: "bg_code", icon: "👨‍💻", title: "Фон: Кибер-код", price: 1200, type: "bg", bg: "matrix-code" },
        { id: "bg_brutal", icon: "🏢", title: "Фон: Мегаполис", price: 800, type: "bg", bg: "brutal" }
    ];
    
    var grid = el('<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));gap:16px;"></div>');
    items.forEach(it => {
        var owned = state.shop.includes(it.id);
        var finalPrice = it.price;
        
        var btn = el('<button class="btn" style="width:100%;margin-top:10px;">' + (owned ? 'Применить' : 'Купить') + '</button>');
        if (!owned && state.xp < finalPrice) { btn.disabled = true; btn.textContent = "Мало XP"; }
        
        btn.onclick = () => {
            if (!owned) {
                if (state.xp < finalPrice) return;
                state.xp -= finalPrice; state.shop.push(it.id);
            }
            if (it.type === "avatar_effect") { state.avatarEffect = it.effect; window.renderUserChip(); }
            if (it.type === "bg") { 
                document.body.className = document.body.className.replace(/bg-\S+/g, ''); 
                document.body.classList.add('bg-' + it.bg); 
            }
            window.saveStudentData(); window.renderShopPage();
            window.showToast(owned ? "Применено!" : "Куплено!", "ok");
        };
        
        grid.appendChild(el('<div class="module" style="text-align:center;"><div style="font-size:40px;">' + it.icon + '</div><div style="font-weight:bold;">' + it.title + '</div><div style="color:var(--gold); font-weight:bold; margin-top:5px;">' + finalPrice + ' XP</div></div>')).appendChild(btn);
    });
    app.appendChild(grid);
};

window.renderArcadePage = function() {
    var app = $("app"); app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Игровая комната";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>🕹️ Игровая комната</h1></section>'));
    var games = [
        { title: "Казино", icon: "🎰", route: "#/casino" }, { title: "Рулетка", icon: "🎡", route: "#/roulette" },
        { title: "Судоку", icon: "🔢", route: "#/sudoku" }, { title: "Сапёр", icon: "💣", route: "#/minesweeper" },
        { title: "Пасьянс Паук", icon: "🕷️", route: "#/spider" }, { title: "Крестики-нолики", icon: "❌", route: "#/tictactoe" }
    ];
    var grid = el('<div class="arcade-grid"></div>');
    games.forEach(g => {
        grid.appendChild(el('<div class="arcade-card" onclick="location.hash=\'' + g.route + '\'"><div style="font-size:50px;">' + g.icon + '</div><div style="font-weight:bold; margin-top:10px;">' + g.title + '</div></div>'));
    });
    app.appendChild(grid);
};

// РОУТИНГ
window.route = function() {
    if (window.closeDrawer) closeDrawer();
    var hash = location.hash.replace(/^#/, "") || "/";
    var parts = hash.split("/").filter(Boolean);
    var app = $("app"); if (!app) return;
    if (!state.student && !state.staff) { app.innerHTML = ""; return; }
    try {
        if (parts[0] === "topic") window.renderTopic(parts[1], parts[2]);
        else if (parts[0] === "shop") window.renderShopPage();
        else if (parts[0] === "profile") window.renderProfilePage(parts[1]);
        else if (parts[0] === "arcade") window.renderArcadePage();
        else if (parts[0] === "3d-machine") window.render3DMachinePage();
        else if (parts[0] === "portfolio") window.renderPortfolioPage();
        else if (parts[0] === "journal") window.renderJournalPage();
        else if (parts[0] === "event") window.renderDeadlyPartyPage();
        else if (parts[0] === "casino") window.renderCasinoPage();
        else if (parts[0] === "roulette") window.renderRoulettePage();
        else if (parts[0] === "sudoku") window.renderSudokuPage();
        else if (parts[0] === "minesweeper") window.renderMinesweeperPage();
        else if (parts[0] === "spider") window.renderSpiderPage();
        else if (parts[0] === "tictactoe") window.renderTicTacToePage();
        else if (parts[0] === "chat") window.renderChatPage();
        else renderHome();
    } catch (err) { app.innerHTML = '<div class="module">Ошибка: ' + escapeHtml(err.message) + '</div>'; }
    window.scrollTo(0, 0);
};

window.addEventListener("DOMContentLoaded", () => {
    if (!state.student && !state.staff) { $("loginOverlay").hidden = false; } else { $("loginOverlay").hidden = true; }
    if (state.student) window.loadStudentData();
    
    // Поиск
    if ($("globalSearch")) {
        $("globalSearch").addEventListener("input", function() {
            var query = this.value.trim().toLowerCase();
            var resultsBox = $("searchResults");
            resultsBox.innerHTML = "";
            if (query.length < 2) { resultsBox.style.display = "none"; return; }
            var results = [];
            window.COURSE.sections.forEach(sec => {
                sec.topics.forEach(t => {
                    if (t.title.toLowerCase().includes(query) || t.code.toLowerCase().includes(query)) {
                        results.push({ type: "Тема", title: t.code + " - " + t.title, link: "#/topic/" + t.id + "/lecture" });
                    }
                });
            });
            if (window.GCODE_REFERENCE) {
                window.GCODE_REFERENCE.groups.forEach(g => {
                    g.items.forEach(item => {
                        if (item.code.toLowerCase().includes(query) || item.name.toLowerCase().includes(query)) {
                            results.push({ type: "G-код", title: item.code + " - " + item.name, link: "#/gcode-reference" });
                        }
                    });
                });
            }
            if (results.length === 0) {
                resultsBox.innerHTML = '<div style="padding:10px; color:var(--muted); font-size:13px;">Ничего не найдено</div>';
            } else {
                results.slice(0, 8).forEach(r => {
                    resultsBox.appendChild(el('<a class="search-res-item" href="' + r.link + '" onclick="document.getElementById(\'searchResults\').style.display=\'none\'; document.getElementById(\'globalSearch\').value=\'\';"><div>' + r.title + '</div><div class="search-res-type">' + r.type + '</div></a>'));
                });
            }
            resultsBox.style.display = "block";
        });
        document.addEventListener("click", function(e) {
            if (!e.target.closest(".search-container")) $("searchResults").style.display = "none";
        });
    }

    // Режим чтения
    if ($("fontSizeToggle")) {
        if (localStorage.getItem("mdk0701.readingMode") === "true") {
            document.body.classList.add("reading-mode");
            $("fontSizeToggle").textContent = "A-";
        }
        $("fontSizeToggle").onclick = function() {
            document.body.classList.toggle("reading-mode");
            var isReading = document.body.classList.contains("reading-mode");
            localStorage.setItem("mdk0701.readingMode", isReading);
            this.textContent = isReading ? "A-" : "A+";
        };
    }

    if ($("themeToggle")) $("themeToggle").onclick = () => { document.documentElement.setAttribute("data-theme", document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark"); };
    if ($("burgerBtn")) $("burgerBtn").onclick = () => { $("drawer").classList.toggle("open"); $("drawerOverlay").classList.toggle("open"); };
    if ($("drawerClose")) $("drawerClose").onclick = () => { $("drawer").classList.remove("open"); $("drawerOverlay").classList.remove("open"); };
    if ($("drawerOverlay")) $("drawerOverlay").onclick = () => { $("drawer").classList.remove("open"); $("drawerOverlay").classList.remove("open"); };
    document.querySelectorAll("[data-go]").forEach(item => {
        item.onclick = (e) => { e.preventDefault(); location.hash = item.getAttribute("data-go"); $("drawer").classList.remove("open"); $("drawerOverlay").classList.remove("open"); };
    });
    window.renderUserChip();
    window.route();
});
window.addEventListener("hashchange", window.route);