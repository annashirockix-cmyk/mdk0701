/* ============================================================
   ui.js — Интерфейс и Роутинг (v196.0 — FULL LECTURES & BUG FIX)
   ============================================================ */
"use strict";

window.$ = (id) => document.getElementById(id);
window.el = (html) => { const div = document.createElement("div"); div.innerHTML = html.trim(); return div.firstChild; };
window.escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.studentKey = (s) => { s = s || window.state.student; return s ? (s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase()) : null; };

window.showToast = function(msg, type) {
  var container = document.querySelector(".toast-container");
  if (!container) { container = document.createElement("div"); container.className = "toast-container"; document.body.appendChild(container); }
  var toast = document.createElement("div"); toast.className = "toast " + (type || "");
  toast.innerHTML = (type === "ok" ? "✅ " : type === "err" ? "❌ " : "ℹ️ ") + window.escapeHtml(msg);
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add("out"); setTimeout(() => toast.remove(), 300); }, 3000);
};

window.updateXpDisplay = function() { if (window.$("xpCount")) window.$("xpCount").textContent = "🌟 " + window.state.xp + " XP · Lv." + window.getLevel(window.state.xp); };

window.renderUserChip = function() {
    if (!window.state.student && !window.state.staff) return;
    if (window.state.staff) {
        window.$("userChipName").textContent = window.state.staff.name;
        window.$("userChipGroup").textContent = "Учитель";
        window.$("userChipAvatar").innerHTML = "👨‍🏫";
    } else {
        var vipHtml = window.state.isPremium ? '<span class="vip-badge" style="background:#ffd700; color:#000; padding:2px 6px; border-radius:4px; font-size:10px; margin-left:5px;">VIP</span>' : '';
        window.$("userChipName").innerHTML = window.escapeHtml(window.state.student.name) + vipHtml;
        window.$("userChipGroup").textContent = "Гр. " + window.state.student.group;
        var avHtml = window.state.avatar ? '<img src="' + window.state.avatar + '" style="width:100%;height:100%;object-fit:cover;">' : "👨‍🎓";
        window.$("userChipAvatar").innerHTML = '<div class="av-container" style="width:100%; height:100%; font-size:24px;">' + avHtml + '</div>';
    }
    if (window.$("navVipCheats")) window.$("navVipCheats").style.display = window.state.isPremium ? "flex" : "none";
};

window.closeDrawer = () => { if(window.$("drawer")) window.$("drawer").classList.remove("open"); if(window.$("drawerOverlay")) window.$("drawerOverlay").classList.remove("open"); };
window.applyTheme = (theme) => { document.documentElement.setAttribute("data-theme", theme); try { localStorage.setItem("mdk.theme", theme); } catch(e){} };

window.openThemeModal = function() {
  var current = document.documentElement.getAttribute("data-theme") || "light";
  var themes = ["light", "dark", "matrix", "cyber", "neon", "retro"]; 
  var names = ["Светлая", "Тёмная", "Матрица", "Кибер", "Неон", "Ретро"];
  var modal = window.el('<div style="position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:9999;display:flex;align-items:center;justify-content:center;" id="themeModal"><div style="background:var(--card);padding:24px;border-radius:16px;width:90%;max-width:400px;"><h3>Тема</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0;" id="themeGrid"></div><button class="btn ghost" style="width:100%" onclick="document.getElementById(\'themeModal\').remove()">Закрыть</button></div></div>');
  var grid = modal.querySelector("#themeGrid");
  themes.forEach(function(t, i){ 
      var btn = window.el('<button class="btn ' + (t===current ? '' : 'ghost') + '" style="padding:12px;">' + names[i] + '</button>'); 
      btn.onclick = function() { window.applyTheme(t); modal.remove(); }; 
      grid.appendChild(btn); 
  });
  document.body.appendChild(modal);
};

/* ---------------- ГЛАВНАЯ ---------------- */
function renderHome() {
    var app = window.$("app"); app.innerHTML = "";
    var c = window.COURSE;
    app.appendChild(window.el(`<section class="hero"><h1>${c.title}</h1><p>${c.module}</p></section>`));
    
    if (window.state.student && !window.state.isPremium) {
        app.appendChild(window.el(`
            <div class="module" style="background: linear-gradient(135deg, #2c3e50, #000); color: #fff; border: 1px solid #ffd700; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px; cursor:pointer;" onclick="location.hash='#/subscription'">
                <div><h3 style="margin: 0; color: #ffd700;">👑 VIP-Подписка</h3><p style="margin: 5px 0 0; font-size: 14px; opacity: 0.8;">x2 опыта, аналитика!</p></div>
                <button class="btn" style="background: #ffd700; color: #000; font-weight: bold;">Подробнее</button>
            </div>
        `));
    }

    app.appendChild(window.el(`
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:10px; margin:20px 0;">
            <a href="#/schedule" class="module" style="text-align:center; margin:0; padding:15px;"><div style="font-size:24px;">📅</div><div style="font-size:12px; font-weight:bold; margin-top:5px;">Расписание</div></a>
            <a href="#/videos" class="module" style="text-align:center; margin:0; padding:15px;"><div style="font-size:24px;">🎬</div><div style="font-size:12px; font-weight:bold; margin-top:5px;">Видео</div></a>
            <a href="#/passports" class="module" style="text-align:center; margin:0; padding:15px;"><div style="font-size:24px;">📄</div><div style="font-size:12px; font-weight:bold; margin-top:5px;">Паспорта</div></a>
            <a href="#/safety" class="module" style="text-align:center; margin:0; padding:15px;"><div style="font-size:24px;">🦺</div><div style="font-size:12px; font-weight:bold; margin-top:5px;">Охрана труда</div></a>
            <a href="#/formatting" class="module" style="text-align:center; margin:0; padding:15px;"><div style="font-size:24px;">📝</div><div style="font-size:12px; font-weight:bold; margin-top:5px;">Оформление</div></a>
        </div>
    `));

    app.appendChild(window.el('<div class="steps-title">Учебный план</div>'));
    c.sections.forEach(sec => {
        app.appendChild(window.el('<div style="font-weight:bold; margin:20px 0 10px; color:var(--accent); text-transform:uppercase; font-size:12px;">' + sec.title + '</div>'));
        var list = document.createElement("div");
        sec.topics.forEach(t => {
            var isDone = window.state.results[t.id];
            list.appendChild(window.el(`<div class="topic" onclick="location.hash='#/topic/${t.id}/lecture'"><span style="margin-right:15px; font-size:20px;">${isDone ? '✅' : '📖'}</span><div><div style="font-size:12px; color:var(--muted);">${t.code}</div><div style="font-weight:bold;">${t.title}</div></div></div>`));
        });
        app.appendChild(list);
    });
}

/* ---------------- ТЕМЫ (Лекции) ---------------- */
window.renderTopic = function(id, tab){
  tab = tab || "lecture"; 
  var c = window.COURSE; var t = null;
  for (var i = 0; i < c.sections.length; i++) { for (var j = 0; j < c.sections[i].topics.length; j++) { if (c.sections[i].topics[j].id === id) { t = c.sections[i].topics[j]; break; } } if (t) break; }
  if(!t) return renderHome();

  var app = window.$("app"); app.innerHTML = ""; 
  app.appendChild(window.el(`<a class="backlink" href="#/">← К программе</a><section class="topic-head"><h1>${t.title}</h1></section>`));
  
  var tw = window.el('<div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap;"></div>');
  [["lecture","01 Лекция"],["practice","02 Практика"],["test","03 Тест"]].forEach(item => { 
      tw.appendChild(window.el(`<button class="tab ${item[0] === tab ? 'active' : ''}" onclick="location.hash='#/topic/${id}/${item[0]}'">${item[1]}</button>`)); 
  });
  app.appendChild(tw); 
  
  var panel = window.el('<section class="panel module"></section>'); app.appendChild(panel);

  if (tab === "lecture") {
    if(t.lectures) t.lectures.forEach(l => { panel.appendChild(window.el(`<h3>${l.code}. ${l.title}</h3><div class="lecture-content">${l.content}</div>`)); });
    var markBtn = window.el('<button class="btn" style="width:100%;margin-top:20px;">Отметить как изученное (+50 XP)</button>');
    markBtn.onclick = function() { window.addXP(50); markBtn.textContent = "✅ Изучено"; markBtn.disabled = true; }; 
    panel.appendChild(markBtn);
  }
  
  if (tab === "practice") {
    if(t.practicals) {
        t.practicals.forEach(p => {
            panel.appendChild(window.el(`<div style="margin-bottom:20px; padding:20px; border:1px solid var(--border); border-radius:8px;"><h4>${p.code}. ${p.title}</h4><p><b>Цель:</b> ${p.goal}</p><button class="btn ghost">Сдать</button></div>`));
        });
    }
  }
  
  if (tab === "test" && t.test) {
      var testWrap = window.el('<div></div>'); panel.appendChild(testWrap);
      t.test.forEach((q, qi) => { 
          var qb = window.el(`<div class="question"><div class="q-text">${qi+1}. ${q.q}</div></div>`); 
          q.options.forEach((opt, oi) => { qb.appendChild(window.el(`<label class="option"><input type="radio" name="q${qi}" value="${oi}"><span>${opt}</span></label>`)); }); 
          testWrap.appendChild(qb); 
      });
      var finishBtn = window.el('<button class="btn" style="width:100%;margin-top:10px;">Завершить</button>'); panel.appendChild(finishBtn);
      finishBtn.onclick = function() {
        var correct = 0; 
        t.test.forEach((q, qi) => { var ch = testWrap.querySelector(`input[name="q${qi}"]:checked`); if (ch && Number(ch.value) === q.correct) correct++; });
        finishBtn.disabled = true; finishBtn.textContent = "Завершено";
        var grade = Math.max(2, Math.round((correct / t.test.length) * 5)); 
        window.state.results[id] = { grade: grade }; window.addXP(100);
        window.showToast("Оценка: " + grade, "ok"); 
      };
  }
};

/* ---------------- ПРОФИЛЬ И ПОРТФОЛИО ---------------- */
window.renderProfilePage = function() {
    var app = window.$("app"); app.innerHTML = "";
    app.appendChild(window.el('<a class="backlink" href="#/">← На главную</a>'));
    if (!window.state.student && !window.state.staff) return;
    
    var data = window.state.student || window.state.staff, isStaff = !!window.state.staff, level = window.getLevel(isStaff ? 1 : window.state.xp);
    var avatarHtml = window.state.avatar ? '<img src="' + window.state.avatar + '" style="width:100%; height:100%; object-fit:cover;">' : (isStaff ? "👨‍🏫" : "👨‍🎓");
    
    var card = `
      <div class="id-card">
          <div class="id-card-header">
              <div><h1 class="id-card-title">STUDENT DOCUMENT</h1><div class="id-card-subtitle">MDK PORTAL</div></div>
              <div><div style="font-size:10px; font-weight:bold; border:1px solid #111; padding:2px 6px; display:inline-block;">REGISTERED</div></div>
          </div>
          <div class="id-card-body">
              <div class="id-photo">${avatarHtml}</div>
              <div class="id-info"><table>
                  <tr><td class="label">NAME</td><td class="value">${window.escapeHtml(data.name)}</td></tr>
                  <tr><td class="label">GROUP</td><td class="value">${isStaff ? 'STAFF' : window.escapeHtml(window.state.student.group)}</td></tr>
                  <tr><td class="label">LEVEL</td><td class="value" style="color:#c14a2a;">${level}</td></tr>
                  <tr><td class="label">XP</td><td class="value">${isStaff ? '∞' : window.state.xp}</td></tr>
              </table></div>
          </div>
          <div class="id-barcode"></div>
      </div>
    `;
    app.appendChild(window.el(card));
};

window.renderPortfolioPage = function() {
    var app = window.$("app"); app.innerHTML = "";
    app.appendChild(window.el('<a class="backlink" href="#/">← На главную</a>'));
    if (!window.state.student) return;
    
    var html = `
        <div id="portfolioPrint" class="module" style="padding:40px; background:#fff; color:#000;">
            <h1 style="text-align:center;">РЕЗЮМЕ (${window.state.activeCourseId})</h1>
            <p><b>ФИО:</b> ${window.escapeHtml(window.state.student.name)}</p>
            <p><b>Группа:</b> ${window.escapeHtml(window.state.student.group)}</p>
            <p><b>Курс:</b> ${window.COURSE.title}</p>
            <p><b>Опыт (XP):</b> ${window.state.xp}</p>
        </div>
        <div style="text-align:center; margin-top:20px;"><button class="btn" id="pdfBtn">📥 Скачать PDF</button></div>
    `;
    app.appendChild(window.el(html));

    // Безопасное добавление обработчика (защита от null)
    var btn = document.getElementById("pdfBtn");
    if (btn) {
        btn.onclick = function() { window.showToast("Генерация PDF...", "info"); setTimeout(()=>window.showToast("Готово!", "ok"), 1000); };
    }
};

/* ---------------- МАТЕРИАЛЫ ---------------- */
window.renderSchedulePage = function() {
    var app = window.$("app"); app.innerHTML = "";
    app.appendChild(window.el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>Расписание</h1></section><div class="module"><p>Пн: 08:30 - 10:00</p><p>Ср: 12:30 - 14:00</p></div>'));
};

window.renderVideosPage = function() {
    var app = window.$("app"); app.innerHTML = "";
    app.appendChild(window.el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>🎬 Видео</h1></section>'));
    var list = window.el('<div class="module"></div>');
    (window.COURSE.videos || []).forEach(v => { list.appendChild(window.el(`<div style="padding:10px 0; border-bottom:1px solid var(--border);"><b>${v.title}</b></div>`)); });
    app.appendChild(list);
};

window.renderPassportsPage = function() {
    var app = window.$("app"); app.innerHTML = "";
    app.appendChild(window.el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>📄 Паспорта</h1></section>'));
    var list = window.el('<div class="module"></div>');
    (window.COURSE.passports || []).forEach(p => { list.appendChild(window.el(`<div style="padding:10px 0; border-bottom:1px solid var(--border);"><b>${p.title}</b></div>`)); });
    app.appendChild(list);
};

window.renderSafetyPage = function() {
    var app = window.$("app"); app.innerHTML = "";
    app.appendChild(window.el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>🦺 Охрана труда</h1></section>'));
    var list = window.el('<div class="module"></div>');
    (window.COURSE.safety || []).forEach(s => { list.appendChild(window.el(`<div style="padding:10px 0; border-bottom:1px solid var(--border);"><b>${s.title}</b></div>`)); });
    app.appendChild(list);
};

window.renderFormattingPage = function() {
    var app = window.$("app"); app.innerHTML = "";
    app.appendChild(window.el('<a class="backlink" href="#/">← На главную</a>'));
    var fmt = window.COURSE.formatting;
    if(!fmt) return app.appendChild(window.el('<div class="module">Нет данных.</div>'));
    app.appendChild(window.el(`<section class="hero"><h1>📝 ${fmt.title}</h1><p>${fmt.intro}</p></section><div class="module"><ul>` + fmt.blocks.map(b => `<li>${b.title}</li>`).join('') + `</ul></div>`));
};

/* ---------------- VIP ---------------- */
window.renderSubscriptionPage = function() {
    var app = window.$("app"); app.innerHTML = "";
    app.appendChild(window.el('<a class="backlink" href="#/">← На главную</a>'));
    if (window.state.isPremium) {
        app.appendChild(window.el(`<section class="premium-card" style="text-align:center; padding:40px;"><h1>👑 VIP Активен</h1><button class="btn" onclick="window.cancelPremium()">Отменить</button></section>`));
        return;
    }
    app.appendChild(window.el(`
        <section class="premium-card" style="padding:40px; text-align:center;">
            <h1 style="color:#ffd700;">VIP-Доступ</h1>
            <p>🔥 x2 Опыта, 🕵️ Чит-лист</p>
            <button class="btn" id="buyPremiumBtn" style="background:#ffd700; color:#000; width:100%; max-width:300px; margin-top:20px;">Оформить за 299 ₽</button>
        </section>
    `));
    var btn = document.getElementById("buyPremiumBtn");
    if (btn) btn.onclick = function() { window.showToast("🛠️ В разработке", "info"); };
};

window.cancelPremium = function() {
    if(confirm("Отменить VIP?")) { window.state.isPremium = false; window.saveStudentData(); window.renderUserChip(); window.renderSubscriptionPage(); }
};

window.renderVipCheatsPage = function() {
    var app = window.$("app"); app.innerHTML = "";
    if (!window.state.isPremium) return app.appendChild(window.el('<div class="module">Только для VIP</div>'));
    app.appendChild(window.el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>🕵️ Чит-лист</h1></section>'));
    var list = window.el('<div class="module"></div>');
    window.COURSE.sections.forEach(s => s.topics.forEach(t => {
        if (t.test) {
            list.appendChild(window.el(`<h3>${t.title}</h3>`));
            t.test.forEach((q) => { list.appendChild(window.el(`<div><b>${q.q}</b> <span style="color:var(--ok)">✔ ${q.options[q.correct]}</span></div>`)); });
        }
    }));
    app.appendChild(list);
};

window.renderArcadePage = function() {
    var app = window.$("app"); app.innerHTML = "";
    app.appendChild(window.el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>🕹️ Игровая комната</h1></section>'));
    var games = [
        { title: "Казино", icon: "🎰", route: "#/casino" }, { title: "Рулетка", icon: "🎡", route: "#/roulette" },
        { title: "Судоку", icon: "🔢", route: "#/sudoku" }, { title: "Сапёр", icon: "💣", route: "#/minesweeper" },
        { title: "Крестики-нолики", icon: "❌", route: "#/tictactoe" }, { title: "Тест G-кода", icon: "🛠️", route: "#/gcode-test" }
    ];
    var grid = window.el('<div class="arcade-grid"></div>');
    games.forEach(g => {
        grid.appendChild(window.el('<div class="arcade-card" onclick="location.hash=\'' + g.route + '\'"><div style="font-size:50px;">' + g.icon + '</div><div style="font-weight:bold; margin-top:10px;">' + g.title + '</div></div>'));
    });
    app.appendChild(grid);
};

/* ---------------- РОУТЕР ---------------- */
window.route = function() {
    window.closeDrawer();
    var hash = location.hash.replace(/^#/, "") || "/", parts = hash.split("/").filter(Boolean), app = window.$("app");
    if (!app) return;
    
    // Защита от пустого экрана
    if (!window.state.student && !window.state.staff) { 
        app.innerHTML = "<div class='module' style='text-align:center; margin-top:50px;'><h2>Доступ ограничен</h2><p>Пожалуйста, войдите в систему, чтобы просматривать материалы.</p><button class='btn' onclick='location.reload()'>Войти</button></div>";
        return; 
    }

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
        else if (parts[0] === "arcade") window.renderArcadePage();
        else if (parts[0] === "casino") window.renderCasinoPage();
        else if (parts[0] === "roulette") window.renderRoulettePage();
        else if (parts[0] === "sudoku") window.renderSudokuPage();
        else if (parts[0] === "minesweeper") window.renderMinesweeperPage();
        else if (parts[0] === "spider") window.renderSpiderPage();
        else if (parts[0] === "tictactoe") window.renderTicTacToePage();
        else if (parts[0] === "gcode-test") window.renderGCodeTestPage();
        else if (parts[0] === "event") window.renderDeadlyPartyPage();
        else if (parts[0] === "3d-machine") window.render3DMachinePage();
        else if (parts[0] === "journal") window.renderJournalPage();
        else if (parts[0] === "rating") window.renderRatingPage();
        else if (parts[0] === "final") window.renderFinalExamPage();
        else if (parts[0] === "chat") window.renderChatPage();
        else if (parts[0] === "links") window.renderLinksPage();
        else renderHome();
    } catch (err) { app.innerHTML = '<div class="module">Ошибка: ' + window.escapeHtml(err.message) + '</div>'; }
    window.scrollTo(0, 0);
};

window.addEventListener("DOMContentLoaded", () => {
    if (!window.state.student && !window.state.staff) window.$("loginOverlay").hidden = false; else window.$("loginOverlay").hidden = true;
    if (window.state.student) window.loadStudentData();
    
    if (window.$("themeToggle")) window.$("themeToggle").onclick = () => { window.$("themeModal") ? window.$("themeModal").remove() : window.openThemeModal(); };
    if (window.$("burgerBtn")) window.$("burgerBtn").onclick = () => { window.$("drawer").classList.toggle("open"); window.$("drawerOverlay").classList.toggle("open"); };
    if (window.$("drawerClose")) window.$("drawerClose").onclick = window.closeDrawer; 
    if (window.$("drawerOverlay")) window.$("drawerOverlay").onclick = window.closeDrawer;
    
    if (window.$("mdkSelector")) {
        window.$("mdkSelector").value = window.state.activeCourseId;
        window.$("mdkSelector").onchange = function(e) { window.switchCourse(e.target.value); };
    }
    
    document.querySelectorAll("[data-go]").forEach(item => {
        item.onclick = (e) => { e.preventDefault(); location.hash = item.getAttribute("data-go"); window.closeDrawer(); };
    });
    
    window.renderUserChip(); window.route();
});
window.addEventListener("hashchange", window.route);