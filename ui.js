/* ============================================================
   UI.js — Интерфейс (v190.0 — FULL FIX)
   ============================================================ */
"use strict";

window.$ = (id) => document.getElementById(id);
window.el = (html) => { const div = document.createElement("div"); div.innerHTML = html.trim(); return div.firstChild; };
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
        $("userChipGroup").textContent = "Учитель";
        $("userChipAvatar").innerHTML = "👨‍🏫";
    } else {
        var vipHtml = state.isPremium ? '<span class="vip-badge" style="background:#ffd700; color:#000; padding:2px 6px; border-radius:4px; font-size:10px; margin-left:5px;">VIP</span>' : '';
        $("userChipName").innerHTML = escapeHtml(state.student.name) + vipHtml;
        $("userChipGroup").textContent = "Гр. " + state.student.group;
        var avHtml = state.avatar ? '<img src="' + state.avatar + '" style="width:100%;height:100%;object-fit:cover;">' : "👨‍🎓";
        $("userChipAvatar").innerHTML = '<div class="av-container" style="width:100%; height:100%; font-size:24px;">' + avHtml + '</div>';
    }
    // Отображение VIP кнопок
    if ($("navVipCheats")) $("navVipCheats").style.display = state.isPremium ? "flex" : "none";
};

window.closeDrawer = () => { if($("drawer")) $("drawer").classList.remove("open"); if($("drawerOverlay")) $("drawerOverlay").classList.remove("open"); };
window.applyTheme = (theme) => { document.documentElement.setAttribute("data-theme", theme); localStorage.setItem("mdk.theme", theme); document.body.className = document.body.className.replace(/bg-\S+/g, ''); };

window.openThemeModal = function() {
  var current = document.documentElement.getAttribute("data-theme") || "light";
  var themes = ["light", "dark", "matrix", "cyber", "neon", "retro"]; 
  var names = ["Светлая", "Тёмная", "Матрица", "Кибер", "Неон", "Ретро"];
  var modal = el('<div style="position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:9999;display:flex;align-items:center;justify-content:center;" id="themeModal"><div style="background:var(--card);padding:24px;border-radius:16px;width:90%;max-width:400px;"><h3>Выберите тему</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0;" id="themeGrid"></div><button class="btn ghost" style="width:100%" onclick="document.getElementById(\'themeModal\').remove()">Закрыть</button></div></div>');
  var grid = modal.querySelector("#themeGrid");
  themes.forEach(function(t, i){ 
      var btn = el('<button class="btn ' + (t===current ? '' : 'ghost') + '" style="padding:12px;">' + names[i] + '</button>'); 
      btn.onclick = function() { window.applyTheme(t); modal.remove(); }; 
      grid.appendChild(btn); 
  });
  document.body.appendChild(modal);
};

/* ---------------- ГЛАВНАЯ ---------------- */
function renderHome() {
    var app = $("app"); app.innerHTML = "";
    var c = window.COURSE;
    if (!c) return app.innerHTML = "<div class='module'>Ошибка загрузки курса</div>";

    app.appendChild(el(`<section class="hero"><h1>${c.title}</h1><p>${c.module}</p></section>`));
    
    if (state.student && !state.isPremium) {
        app.appendChild(el(`
            <div class="module" style="background: linear-gradient(135deg, #2c3e50, #000); color: #fff; border: 1px solid #ffd700; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px; cursor:pointer;" onclick="location.hash='#/subscription'">
                <div><h3 style="margin: 0; color: #ffd700;">👑 Станьте VIP-Оператором</h3><p style="margin: 5px 0 0; font-size: 14px; opacity: 0.8;">x2 опыта, аналитика, чит-лист!</p></div>
                <button class="btn" style="background: #ffd700; color: #000; font-weight: bold;">Подробнее</button>
            </div>
        `));
    }

    app.appendChild(el(`
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:10px; margin:20px 0;">
            <a href="#/schedule" class="module" style="text-align:center; margin:0; padding:15px; cursor:pointer;"><div style="font-size:24px;">📅</div><div style="font-size:12px; font-weight:bold; margin-top:5px;">Расписание</div></a>
            <a href="#/videos" class="module" style="text-align:center; margin:0; padding:15px; cursor:pointer;"><div style="font-size:24px;">🎬</div><div style="font-size:12px; font-weight:bold; margin-top:5px;">Видео</div></a>
            <a href="#/passports" class="module" style="text-align:center; margin:0; padding:15px; cursor:pointer;"><div style="font-size:24px;">📄</div><div style="font-size:12px; font-weight:bold; margin-top:5px;">Паспорта</div></a>
            <a href="#/safety" class="module" style="text-align:center; margin:0; padding:15px; cursor:pointer;"><div style="font-size:24px;">🦺</div><div style="font-size:12px; font-weight:bold; margin-top:5px;">Охрана труда</div></a>
            <a href="#/formatting" class="module" style="text-align:center; margin:0; padding:15px; cursor:pointer;"><div style="font-size:24px;">📝</div><div style="font-size:12px; font-weight:bold; margin-top:5px;">Оформление</div></a>
        </div>
    `));

    app.appendChild(el('<div class="steps-title">Учебный план</div>'));
    c.sections.forEach(sec => {
        app.appendChild(el('<div style="font-weight:bold; margin:20px 0 10px; color:var(--accent); text-transform:uppercase; font-size:12px;">' + sec.title + '</div>'));
        var list = document.createElement("div");
        sec.topics.forEach(t => {
            var isDone = state.results[t.id];
            list.appendChild(el(`<div class="topic" onclick="location.hash='#/topic/${t.id}/lecture'"><span style="margin-right:15px; font-size:20px;">${isDone ? '✅' : '📖'}</span><div><div style="font-size:12px; color:var(--muted);">${t.code}</div><div style="font-weight:bold;">${t.title}</div></div></div>`));
        });
        app.appendChild(list);
    });
}

/* ---------------- ТЕМЫ ---------------- */
window.renderTopic = function(id, tab){
  tab = tab || "lecture"; 
  var c = window.COURSE; var t = null;
  for (var i = 0; i < c.sections.length; i++) { for (var j = 0; j < c.sections[i].topics.length; j++) { if (c.sections[i].topics[j].id === id) { t = c.sections[i].topics[j]; break; } } if (t) break; }
  if(!t) return renderHome();

  var app = $("app"); app.innerHTML = ""; 
  app.appendChild(el(`<a class="backlink" href="#/">← К программе</a><section class="topic-head"><h1>${t.title}</h1></section>`));
  
  var tw = el('<div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap;"></div>');
  [["lecture","01 Лекция"],["practice","02 Практика"],["test","03 Тест"]].forEach(item => { 
      tw.appendChild(el(`<button class="tab ${item[0] === tab ? 'active' : ''}" onclick="location.hash='#/topic/${id}/${item[0]}'">${item[1]}</button>`)); 
  });
  app.appendChild(tw); 
  
  var panel = el('<section class="panel module"></section>'); app.appendChild(panel);

  if (tab === "lecture") {
    if(t.lectures) t.lectures.forEach(l => { panel.appendChild(el(`<h3>${l.code}. ${l.title}</h3><div class="lecture-content">${l.content}</div>`)); });
    var markBtn = el('<button class="btn" style="width:100%;margin-top:20px;">Отметить как изученное (+50 XP)</button>');
    markBtn.onclick = function() { window.addXP(50); markBtn.textContent = "✅ Тема изучена"; markBtn.disabled = true; }; 
    panel.appendChild(markBtn);
  }
  
  if (tab === "practice") {
    if(t.practicals) {
        t.practicals.forEach(p => {
            panel.appendChild(el(`<div style="margin-bottom:20px; padding:20px; border:1px solid var(--border); border-radius:8px;"><h4>${p.code}. ${p.title}</h4><p><b>Цель:</b> ${p.goal}</p><button class="btn ghost">Сдать работу</button></div>`));
        });
    }
  }
  
  if (tab === "test" && t.test) {
      var testWrap = el('<div></div>'); panel.appendChild(testWrap);
      t.test.forEach((q, qi) => { 
          var qb = el(`<div class="question"><div class="q-text">${qi+1}. ${q.q}</div></div>`); 
          q.options.forEach((opt, oi) => { qb.appendChild(el(`<label class="option"><input type="radio" name="q${qi}" value="${oi}"><span>${opt}</span></label>`)); }); 
          testWrap.appendChild(qb); 
      });
      var finishBtn = el('<button class="btn" style="width:100%;margin-top:10px;">Завершить тест</button>'); panel.appendChild(finishBtn);
      finishBtn.onclick = function() {
        var correct = 0; 
        t.test.forEach((q, qi) => { var ch = testWrap.querySelector(`input[name="q${qi}"]:checked`); if (ch && Number(ch.value) === q.correct) correct++; });
        finishBtn.disabled = true; finishBtn.textContent = "Тест завершен";
        var grade = Math.max(2, Math.round((correct / t.test.length) * 5)); 
        state.results[id] = { grade: grade }; window.addXP(100); window.saveStudentData();
        window.showToast("Оценка: " + grade, "ok"); 
      };
  }
};

/* ---------------- ПРОФИЛЬ ---------------- */
window.renderProfilePage = function(targetKey){
  var app = $("app"); app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Личный кабинет";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  if (!state.student && !state.staff) return;
  
  var data = state.student || state.staff, isStaff = !!state.staff, level = getLevel(isStaff ? 1 : state.xp);
  var avatarHtml = state.avatar ? '<img src="' + state.avatar + '" style="width:100%; height:100%; object-fit:cover;">' : (isStaff ? "👨‍🏫" : "👨‍🎓");
  
  var card = `
    <div class="id-card">
        <div class="id-card-header">
            <div><h1 class="id-card-title">STUDENT DOCUMENT</h1><div class="id-card-subtitle">MDK · CNC OPERATOR</div></div>
            <div><div style="font-size:10px; font-weight:bold; border:1px solid #111; padding:2px 6px; display:inline-block;">REGISTERED</div></div>
        </div>
        <div class="id-card-body">
            <div class="id-photo">${avatarHtml}</div>
            <div class="id-info"><table>
                <tr><td class="label">NAME</td><td class="value">${escapeHtml(data.name)}</td></tr>
                <tr><td class="label">GROUP</td><td class="value">${isStaff ? 'STAFF' : escapeHtml(state.student.group)}</td></tr>
                <tr><td class="label">LEVEL</td><td class="value" style="color:#c14a2a;">${level} (${getLevelTitle(level)})</td></tr>
                <tr><td class="label">XP POINTS</td><td class="value">${isStaff ? '∞' : state.xp}</td></tr>
            </table></div>
        </div>
        <div class="id-barcode"></div>
    </div>
  `;
  app.appendChild(el(card));
};

/* ---------------- МАГАЗИН ---------------- */
window.renderShopPage = function() {
    var app = $("app"); app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Магазин XP";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>Магазин</h1><p>Баланс: <b>' + state.xp + ' XP</b></p></section>'));
    
    var items = [
        { id: "fx_gold", icon: "👑", title: "Маска: Золото", price: 2000, type: "avatar_effect", effect: "gold" },
        { id: "theme_matrix", icon: "🟢", title: "Тема: Матрица", price: 800, type: "theme", theme: "matrix" },
        { id: "theme_cyber", icon: "🌆", title: "Тема: Киберпанк", price: 1200, type: "theme", theme: "cyber" }
    ];
    
    var grid = el('<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));gap:16px;"></div>');
    items.forEach(it => {
        var owned = state.shop.includes(it.id) || (it.type === "theme" && state.shop.includes("theme_" + it.theme));
        var btn = el('<button class="btn" style="width:100%;margin-top:10px;">' + (owned ? 'Применить' : 'Купить') + '</button>');
        if (!owned && state.xp < it.price) { btn.disabled = true; btn.textContent = "Мало XP"; }
        btn.onclick = () => {
            if (!owned) { state.xp -= it.price; state.shop.push(it.id); }
            if (it.type === "avatar_effect") { state.avatarEffect = it.effect; window.renderUserChip(); }
            if (it.type === "theme") { window.applyTheme(it.theme); }
            window.saveStudentData(); window.renderShopPage();
            window.showToast(owned ? "Применено!" : "Куплено!", "ok");
        };
        grid.appendChild(el('<div class="module" style="text-align:center;"><div style="font-size:40px;">' + it.icon + '</div><div style="font-weight:bold;">' + it.title + '</div><div style="color:var(--gold); font-weight:bold; margin-top:5px;">' + it.price + ' XP</div></div>')).appendChild(btn);
    });
    app.appendChild(grid);
};

/* ---------------- АРКАДА ---------------- */
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

/* ---------------- ЧАТ ---------------- */
window.renderChatPage = function(){
  var app = $("app"); app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Чат группы";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  if (!state.student) { app.appendChild(el('<div class="module">Войдите как студент.</div>')); return; }

  app.appendChild(el('<section class="module"><h2>Чат группы ' + escapeHtml(state.student.group) + '</h2><div id="chatLog" style="height:400px;overflow-y:auto;background:var(--card-soft);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:16px;">Загрузка...</div><form id="chatForm" style="display:flex;gap:10px;"><input type="text" id="chatInput" placeholder="Сообщение..." style="flex:1;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text)"><button type="submit" class="btn">Отправить</button></form></section>'));
  var log = document.getElementById("chatLog");
  log.innerHTML = "<div style='color:var(--muted); text-align:center;'>Чат доступен при подключении к серверу.</div>";
};

/* ---------------- ВОССТАНОВЛЕННЫЕ СТРАНИЦЫ ---------------- */
window.renderSchedulePage = function() {
    var app = $("app"); app.innerHTML = "";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>Расписание</h1></section>'));
    app.appendChild(el('<div class="module"><p>Пн: 08:30 - 10:00</p><p>Ср: 12:30 - 14:00</p></div>'));
};

window.renderVideosPage = function() {
    var app = $("app"); app.innerHTML = "";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>🎬 Видео</h1></section>'));
    var list = el('<div class="module"></div>');
    (window.COURSE.videos || []).forEach(v => {
        list.appendChild(el(`<div style="padding:10px 0; border-bottom:1px solid var(--border); display:flex; justify-content:space-between;"><span>${v.title}</span><button class="btn ghost" onclick="window.showToast('Видео в разработке', 'info')">Смотреть</button></div>`));
    });
    app.appendChild(list);
};

window.renderPassportsPage = function() {
    var app = $("app"); app.innerHTML = "";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>📄 Паспорта</h1></section>'));
    var list = el('<div class="module"></div>');
    (window.COURSE.passports || []).forEach(p => {
        list.appendChild(el(`<div style="padding:10px 0; border-bottom:1px solid var(--border);"><b>${p.title}</b><p style="font-size:12px;">${p.summary}</p></div>`));
    });
    app.appendChild(list);
};

window.renderSafetyPage = function() {
    var app = $("app"); app.innerHTML = "";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>🦺 Охрана труда</h1></section>'));
    var list = el('<div class="module"></div>');
    (window.COURSE.safety || []).forEach(s => {
        list.appendChild(el(`<div style="padding:10px 0; border-bottom:1px solid var(--border);"><b>${s.title}</b></div>`));
    });
    app.appendChild(list);
};

window.renderFormattingPage = function() {
    var app = $("app"); app.innerHTML = "";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    var fmt = window.COURSE.formatting;
    if(!fmt) return app.appendChild(el('<div class="module">Информация готовится.</div>'));
    app.appendChild(el(`<section class="hero"><h1>📝 ${fmt.title}</h1><p>${fmt.intro}</p></section>`));
    var list = el('<div class="module"></div>');
    fmt.blocks.forEach(b => {
        list.appendChild(el(`<h3 style="color:var(--accent);">${b.title}</h3><ul>` + b.items.map(i => `<li>${i}</li>`).join('') + `</ul>`));
    });
    app.appendChild(list);
};

window.renderSubscriptionPage = function() {
    var app = $("app"); app.innerHTML = "";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    if (state.isPremium) {
        app.appendChild(el(`<section class="premium-card" style="text-align:center; padding:40px;"><h1>👑 VIP Активен</h1><button class="btn" onclick="window.cancelPremium()">Отменить</button></section>`));
        return;
    }
    app.appendChild(el(`
        <section class="premium-card" style="padding:40px; text-align:center;">
            <h1 style="color:#ffd700; margin-top:0;">Станьте VIP-Оператором!</h1>
            <ul class="premium-feature-list" style="text-align:left; display:inline-block; margin: 20px 0;">
                <li>🔥 x2 Опыта</li><li>🕵️ Чит-лист</li><li>📊 Аналитика</li>
            </ul><br>
            <button class="btn" id="buyPremiumBtn" style="background:#ffd700; color:#000; width:100%; max-width:300px; margin-top:20px;">Оформить за 299 ₽</button>
        </section>
    `));
    document.getElementById("buyPremiumBtn").onclick = function() {
        window.showToast("🛠️ Оплата временно недоступна (раздел в разработке)", "info");
    };
};

window.cancelPremium = function() {
    if(confirm("Отменить VIP?")) { state.isPremium = false; window.saveStudentData(); window.renderUserChip(); window.renderSubscriptionPage(); }
};

window.renderVipCheatsPage = function() {
    var app = $("app"); app.innerHTML = "";
    if (!state.isPremium) { app.appendChild(el('<div class="module">Доступно только VIP</div>')); return; }
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>🕵️ Чит-лист</h1></section>'));
    var list = el('<div class="module"></div>');
    window.COURSE.sections.forEach(s => s.topics.forEach(t => {
        if (t.test) {
            list.appendChild(el(`<h3>${t.title}</h3>`));
            t.test.forEach((q,i) => { list.appendChild(el(`<div style="margin-bottom:10px;"><b>${q.q}</b><br><span style="color:var(--ok)">✔ ${q.options[q.correct]}</span></div>`)); });
        }
    }));
    app.appendChild(list);
};

window.renderPortfolioPage = function() {
    var app = $("app"); app.innerHTML = "";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    if (!state.student) return;
    var portfolioHtml = `
        <div id="portfolioPrint" class="module" style="padding:40px; background:#fff; color:#000;">
            <h1 style="text-align:center;">РЕЗЮМЕ (${state.activeCourseId})</h1>
            <p><b>ФИО:</b> ${escapeHtml(state.student.name)}</p>
            <p><b>Курс:</b> ${window.COURSE.title}</p>
        </div>
        <div style="text-align:center; margin-top:20px;"><button class="btn" id="pdfBtn">📥 Скачать PDF</button></div>
    `;
    app.appendChild(el(portfolioHtml));
    var btn = document.getElementById("pdfBtn");
    if (btn) btn.onclick = function() { window.showToast("Генерация PDF...", "info"); setTimeout(()=>window.showToast("Готово!", "ok"), 1000); };
};

/* ---------------- РОУТЕР ---------------- */
window.route = function() {
    closeDrawer();
    var hash = location.hash.replace(/^#/, "") || "/", parts = hash.split("/").filter(Boolean), app = $("app");
    if (!app) return;
    if (!state.student && !state.staff) { app.innerHTML = ""; return; }
    
    if (!window.COURSE) window.COURSE = window.MDK_DATA[state.activeCourseId];

    try {
        if (parts[0] === "topic") window.renderTopic(parts[1], parts[2]);
        else if (parts[0] === "profile") window.renderProfilePage();
        else if (parts[0] === "shop") window.renderShopPage();
        else if (parts[0] === "subscription") window.renderSubscriptionPage();
        else if (parts[0] === "vip-cheats") window.renderVipCheatsPage();
        else if (parts[0] === "portfolio") window.renderPortfolioPage();
        else if (parts[0] === "videos") window.renderVideosPage();
        else if (parts[0] === "schedule") window.renderSchedulePage();
        else if (parts[0] === "passports") window.renderPassportsPage();
        else if (parts[0] === "safety") window.renderSafetyPage();
        else if (parts[0] === "formatting") window.renderFormattingPage();
        else if (parts[0] === "chat") window.renderChatPage();
        else if (parts[0] === "arcade") window.renderArcadePage();
        
        // Игры и экзамены
        else if (parts[0] === "casino") window.renderCasinoPage();
        else if (parts[0] === "roulette") window.renderRoulettePage();
        else if (parts[0] === "sudoku") window.renderSudokuPage();
        else if (parts[0] === "minesweeper") window.renderMinesweeperPage();
        else if (parts[0] === "spider") window.renderSpiderPage();
        else if (parts[0] === "tictactoe") window.renderTicTacToePage();
        else if (parts[0] === "gcode-test") window.renderGCodeTestPage();
        else if (parts[0] === "final") window.renderFinalExamPage();
        else if (parts[0] === "journal") window.renderJournalPage();
        else if (parts[0] === "rating") window.renderRatingPage();
        else if (parts[0] === "event") window.renderDeadlyPartyPage();
        
        else renderHome();
    } catch (err) { app.innerHTML = '<div class="module" style="color:var(--err);">Ошибка: ' + escapeHtml(err.message) + '</div>'; }
    window.scrollTo(0, 0);
};

window.addEventListener("DOMContentLoaded", () => {
    if (!state.student && !state.staff) $("loginOverlay").hidden = false; else $("loginOverlay").hidden = true;
    if (state.student) window.loadStudentData();
    
    if ($("themeToggle")) $("themeToggle").onclick = () => { $("themeModal") ? $("themeModal").remove() : window.openThemeModal(); };
    if ($("burgerBtn")) $("burgerBtn").onclick = () => { $("drawer").classList.toggle("open"); $("drawerOverlay").classList.toggle("open"); };
    if ($("drawerClose")) $("drawerClose").onclick = window.closeDrawer; 
    if ($("drawerOverlay")) $("drawerOverlay").onclick = window.closeDrawer;
    
    if ($("mdkSelector")) {
        $("mdkSelector").value = state.activeCourseId;
        $("mdkSelector").onchange = function(e) { window.switchCourse(e.target.value); };
    }
    
    document.querySelectorAll("[data-go]").forEach(item => {
        item.onclick = (e) => { e.preventDefault(); location.hash = item.getAttribute("data-go"); window.closeDrawer(); };
    });
    
    window.renderUserChip(); window.route();
});
window.addEventListener("hashchange", window.route);