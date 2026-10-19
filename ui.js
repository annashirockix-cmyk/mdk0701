/* ============================================================
   МДК 07.01 — ui.js (v181.0 — FULL FIXES & ROUTES)
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
        var reqEl = document.getElementById("navRequests"); if (reqEl) reqEl.style.display = "flex";
    } else {
        $("userChipName").textContent = state.student.name;
        $("userChipGroup").textContent = "Гр. " + state.student.group;
        var avHtml = state.avatar ? '<img src="' + state.avatar + '" style="width:100%;height:100%;object-fit:cover;">' : "👨‍🎓";
        var effClass = state.avatarEffect ? " av-fx-" + state.avatarEffect : "";
        $("userChipAvatar").innerHTML = '<div class="av-container' + effClass + '" style="width:100%; height:100%; font-size:24px;">' + avHtml + '</div>';
    }
};

window.closeDrawer = () => { $("drawer").classList.remove("open"); $("drawerOverlay").classList.remove("open"); };

// --- ИСПРАВЛЕННЫЕ ТЕМЫ ---
window.applyTheme = (theme) => { 
    document.documentElement.setAttribute("data-theme", theme); 
    localStorage.setItem("mdk0701.theme", theme); 
    // Сбрасываем кастомные фоны при смене обычной темы
    document.body.classList.remove("bg-space", "bg-hyper", "bg-matrix-code", "bg-brutal");
    state.customBg = null;
};

window.applyFont = (font) => { document.documentElement.style.setProperty('--font-main', font); localStorage.setItem("mdk0701.font", font); };

window.applyCustomBg = () => {
    document.body.className = document.body.className.replace(/bg-\S+/g, '');
    if (state.customBg) document.body.classList.add("bg-" + state.customBg);
};

window.openThemeModal = function() {
  var current = document.documentElement.getAttribute("data-theme") || "light";
  var themes = ["light", "dark", "matrix", "cyber", "neon", "retro", "space", "hyper", "matrix-code", "brutal"]; 
  var names = ["Светлая", "Тёмная", "Матрица", "Кибер", "Неон", "Ретро", "Космос", "Формулы", "Код", "Мегаполис"];
  var modal = el('<div style="position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:9999;display:flex;align-items:center;justify-content:center;" id="themeModal"><div style="background:var(--card);padding:24px;border-radius:16px;width:90%;max-width:400px;max-height:80vh;overflow-y:auto;"><h3>Выберите тему</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0;" id="themeGrid"></div><button class="btn ghost" style="width:100%" onclick="document.getElementById(\'themeModal\').remove()">Закрыть</button></div></div>');
  var grid = modal.querySelector("#themeGrid");
  themes.forEach(function(t, i){ 
      var btn = el('<button class="btn ' + (t===current ? '' : 'ghost') + '" style="padding:12px;">' + names[i] + '</button>'); 
      btn.onclick = function() { 
          if (!state.staff && ["matrix", "cyber", "neon", "retro", "space", "hyper", "matrix-code", "brutal"].includes(t) && !state.shop.includes("theme_" + t)) {
              window.showToast("Тема не куплена в магазине!", "err"); return;
          }
          if (["space", "hyper", "matrix-code", "brutal"].includes(t)) {
              window.applyTheme("light"); // Сначала сбрасываем
              state.customBg = t; window.applyCustomBg();
          } else {
              window.applyTheme(t); 
          }
          modal.remove(); 
      }; 
      grid.appendChild(btn); 
  });
  document.body.appendChild(modal);
};

window.renderQuestsWidget = function() {
    if (!state.student) return "";
    var q = state.dailyQuests || { read: false, game: false, chat: false };
    return '<div id="questPanel" class="quest-panel">' +
        '<h3 class="quest-title">📜 Ежедневные квесты</h3>' +
        '<div class="quest-grid">' +
            '<div class="quest-item ' + (q.read ? 'done' : '') + '"><div class="quest-checkbox">' + (q.read ? '✔' : '') + '</div>📖 Изучить лекцию</div>' +
            '<div class="quest-item ' + (q.game ? 'done' : '') + '"><div class="quest-checkbox">' + (q.game ? '✔' : '') + '</div>🎮 Сыграть в игру</div>' +
            '<div class="quest-item ' + (q.chat ? 'done' : '') + '"><div class="quest-checkbox">' + (q.chat ? '✔' : '') + '</div>💬 Написать в чат</div>' +
        '</div>' +
    '</div>';
};

/* ---------------- ГЛАВНАЯ ---------------- */
function renderHome() {
    var app = $("app"); app.innerHTML = "";
    var c = window.COURSE || (typeof COURSE !== 'undefined' ? COURSE : null);
    if (!c) {
        app.innerHTML = '<div class="module" style="text-align:center; padding:40px; margin-top:40px;"><h2>Ошибка загрузки данных</h2><p>Файл data.js не загружен или в нем нет <code>window.COURSE</code>.</p><button class="btn" onclick="location.reload()">Обновить</button></div>';
        return;
    }
    app.appendChild(el('<section class="hero"><h1>' + c.title + '</h1><p>' + c.module + '</p></section>'));
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
}

/* ---------------- СТРАНИЦЫ ---------------- */

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

window.render3DMachinePage = function() {
    var app = $("app"); app.innerHTML = "";
    document.getElementById("crumbs").textContent = "3D Станок";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>🖥️ 3D Модель станка</h1><p>Вращайте мышкой для просмотра</p></section>'));
    var container = el('<div id="3dContainer" style="width:100%; height:500px; background:var(--card-soft); border-radius:16px; overflow:hidden; position:relative;"></div>');
    app.appendChild(container);

    setTimeout(() => {
        if(typeof THREE === 'undefined') return;
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        var ambientLight = new THREE.AmbientLight(0xffffff, 0.6); scene.add(ambientLight);
        var dirLight = new THREE.DirectionalLight(0xffffff, 0.8); dirLight.position.set(10, 20, 10); scene.add(dirLight);

        var machineGroup = new THREE.Group();
        var bedGeo = new THREE.BoxGeometry(10, 1, 3);
        var bedMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
        var bed = new THREE.Mesh(bedGeo, bedMat); bed.position.set(0, -1, 0); machineGroup.add(bed);

        var headGeo = new THREE.BoxGeometry(2, 3, 3);
        var head = new THREE.Mesh(headGeo, bedMat); head.position.set(-4, 0.5, 0); machineGroup.add(head);

        var chuckGeo = new THREE.CylinderGeometry(1, 1, 1, 16);
        var chuckMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        var chuck = new THREE.Mesh(chuckGeo, chuckMat); chuck.rotation.z = Math.PI / 2; chuck.position.set(-2.5, 0.5, 0); machineGroup.add(chuck);

        var tailGeo = new THREE.BoxGeometry(1.5, 2, 2);
        var tail = new THREE.Mesh(tailGeo, bedMat); tail.position.set(4, 0, 0); machineGroup.add(tail);

        var toolGeo = new THREE.BoxGeometry(1, 1.5, 1);
        var toolMat = new THREE.MeshStandardMaterial({ color: 0xc14a2a });
        var tool = new THREE.Mesh(toolGeo, toolMat); tool.position.set(0, 0.5, 1); machineGroup.add(tool);

        scene.add(machineGroup);
        camera.position.set(8, 8, 12);
        camera.lookAt(0, 0, 0);

        function animate() {
            requestAnimationFrame(animate);
            machineGroup.rotation.y += 0.005;
            renderer.render(scene, camera);
        }
        animate();
    }, 100);
};

window.renderPortfolioPage = function() {
    var app = $("app"); app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Портфолио";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    if (!state.student) { app.appendChild(el('<div class="module">Войдите.</div>')); return; }

    var portfolioHtml = `
        <div id="portfolioPrint" class="module" style="padding:40px; background:#fff; color:#000;">
            <h1 style="text-align:center; color:#c14a2a;">ПОРТФОЛИО СТУДЕНТА</h1>
            <hr style="margin:20px 0; border:1px solid #ccc;">
            <p><b>ФИО:</b> ${escapeHtml(state.student.name)}</p>
            <p><b>Группа:</b> ${escapeHtml(state.student.group)}</p>
            <p><b>Уровень:</b> ${getLevel(state.xp)} (${getLevelTitle(getLevel(state.xp))})</p>
            <p><b>Всего опыта (XP):</b> ${state.xp}</p>
            <h3 style="margin-top:30px; color:#c14a2a;">Достижения:</h3>
            <ul>${Object.keys(state.achievements || {}).slice(0, 20).map(id => `<li>${id}</li>`).join('')}</ul>
        </div>
        <div style="text-align:center; margin-top:20px;">
            <button class="btn" id="pdfBtn">📥 Скачать PDF</button>
        </div>`;
    app.appendChild(el(portfolioHtml));

    document.getElementById("pdfBtn").onclick = function() {
        if(typeof html2pdf === 'undefined') return window.showToast("Библиотека PDF не загружена", "err");
        var element = document.getElementById('portfolioPrint');
        var opt = { margin: 10, filename: 'portfolio_' + state.student.name + '.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
        window.showToast("Генерация PDF...", "info");
        html2pdf().set(opt).from(element).save().then(() => window.showToast("PDF готов!", "ok"));
    };
};

window.renderTopic = function(id, tab){
  tab = tab || "lecture"; 
  var c = window.COURSE || (typeof COURSE !== 'undefined' ? COURSE : null); if (!c) return renderHome();
  var t = null;
  for (var i = 0; i < c.sections.length; i++) { for (var j = 0; j < c.sections[i].topics.length; j++) { if (c.sections[i].topics[j].id === id) { t = { section: c.sections[i], topic: c.sections[i].topics[j] }; break; } } if (t) break; }
  if(!t) return renderHome();

  var app = $("app"); app.innerHTML = ""; 
  app.appendChild(el('<a class="backlink" href="#/">← К программе</a><section class="topic-head"><h1>' + t.topic.title + '</h1></section>'));
  var tw = el('<div class="tabs"></div>');
  [["lecture","01 Лекция"],["practice","02 Практика"],["self","03 Сам. работа"],["test","04 Тест"]].forEach(function(item){ tw.appendChild(el('<button class="tab ' + (item[0] === tab ? 'active' : '') + '" onclick="location.hash=\'#/topic/' + id + '/' + item[0] + '\'">' + item[1] + '</button>')); });
  app.appendChild(tw); var panel = el('<section class="panel"></section>'); app.appendChild(panel);

  if (tab === "lecture") {
    if(t.topic.lectures) t.topic.lectures.forEach(function(l){ panel.appendChild(el('<h3>' + l.code + '. ' + l.title + '</h3><div class="lecture-content">' + (l.content || '<p>Материал готовится.</p>') + '</div>')); });
    var isDone = state.progress[id] && state.progress[id].done >= 5;
    var markBtn = el('<button class="btn" style="width:100%;margin-top:20px;" ' + (isDone ? 'disabled' : '') + '>' + (isDone ? '✅ Тема изучена' : 'Отметить как изученное (+50 XP)') + '</button>');
    markBtn.onclick = function() { 
        if (!state.progress[id]) state.progress[id] = {}; 
        state.progress[id].done = 5; 
        window.addXP(50); 
        window.completeQuest('read'); 
        markBtn.textContent = "✅ Тема изучена"; 
        markBtn.disabled = true; 
    }; 
    panel.appendChild(markBtn);
  }
  if (tab === "practice") {
    if(t.topic.practicals) t.topic.practicals.forEach(function(p){
        var status = state.practicalsDone[id] && state.practicalsDone[id][p.code], grade = state.practicalGrades[id] && state.practicalGrades[id][p.code];
        var html = '<div class="practice" style="margin-bottom:24px;border:1px solid var(--border);padding:20px;border-radius:12px;background:var(--card-soft);"><div style="color:var(--accent);font-weight:bold;">' + p.code + '</div><div style="font-weight:bold;margin:4px 0 12px 0;font-size:18px;">' + p.title + '</div>';
        if(p.goal) html += '<div style="font-size:14px;color:var(--muted);margin-bottom:12px;"><b>Цель:</b> ' + p.goal + '</div>';
        html += '<div style="margin-top:20px;border-top:1px solid var(--border);padding-top:16px;">';
        if (status === "approved") html += '<div style="color:var(--ok);font-weight:bold;">✅ Работа подтверждена. Оценка: <b>' + (grade||'') + '</b></div>';
        else if (status === "pending") html += '<div style="color:#d97706;font-weight:bold;">⏳ На проверке.</div>';
        else html += '<button class="btn" onclick="window.markPracticalDone(\'' + id + '\', \'' + p.code + '\')">✅ Сделал</button>';
        html += '</div></div>'; panel.appendChild(el(html));
    });
  }
  if (tab === "test" && t.topic.test) {
      var testWrap = el('<div></div>'); panel.appendChild(testWrap);
      t.topic.test.forEach(function(q, qi){ var qb = el('<div class="question"><div class="q-text">' + (qi+1) + '. ' + q.q + '</div></div>'); q.options.forEach(function(opt, oi){ qb.appendChild(el('<label class="option"><input type="radio" name="q' + qi + '" value="' + oi + '"><span>' + opt + '</span></label>')); }); testWrap.appendChild(qb); });
      var finishBtn = el('<button class="btn" style="width:100%;margin-top:10px;">Завершить тест</button>'); panel.appendChild(finishBtn);
      finishBtn.onclick = function() {
        var correct = 0; t.topic.test.forEach(function(q, qi) { var ch = testWrap.querySelector('input[name="q' + qi + '"]:checked'); if (ch && Number(ch.value) === q.correct) correct++; });
        finishBtn.disabled = true; finishBtn.textContent = "Тест завершен";
        var grade = Math.max(2, Math.round((correct / t.topic.test.length) * 5)); state.results[id] = { grade: grade }; window.addXP(150); window.saveStudentData();
        window.showToast("Тест сдан! Оценка: " + grade, "ok"); 
      };
  }
  if (tab === "self" && t.topic.selfChecks) {
      var selfWrap = el('<div></div>'); panel.appendChild(selfWrap);
      t.topic.selfChecks.forEach(function(q, i){ selfWrap.appendChild(el('<div class="question"><div class="q-text">' + (i+1) + '. ' + q.q + '</div><input type="text" class="self-input" data-idx="' + i + '" placeholder="Ваш ответ"></div>')); });
      var checkBtn = el('<button class="btn" style="width:100%;margin-top:10px;">Завершить и проверить</button>'); panel.appendChild(checkBtn);
      checkBtn.onclick = function() {
        var correctCount = 0; selfWrap.querySelectorAll(".self-input").forEach(function(inp) { var idx = Number(inp.getAttribute("data-idx")); if (inp.value.trim().toLowerCase() === t.topic.selfChecks[idx].a.trim().toLowerCase()) correctCount++; });
        checkBtn.disabled = true; checkBtn.textContent = "Результаты сохранены";
        var grade = Math.max(2, Math.round((correctCount/t.topic.selfChecks.length)*5)); state.selfResults[id] = { grade: grade }; window.addXP(100); window.saveStudentData(); window.showToast("Работа сдана! Оценка: " + grade, "ok");
      };
  }
};

window.markPracticalDone = function(topicId, code) {
    if (!state.practicalsDone[topicId]) state.practicalsDone[topicId] = {};
    state.practicalsDone[topicId][code] = "pending";
    window.saveStudentData(); window.renderTopic(topicId, "practice");
    window.showToast("Отправлено на проверку!", "ok");
};

window.renderShopPage = function() {
    var app = $("app"); app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Магазин XP";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>Магазин</h1><p>Баланс: <b>' + state.xp + ' XP</b></p></section>'));
    var items = [
        { id: "fx_gold", icon: "👑", title: "Маска: Золото", price: 2000, type: "avatar_effect", effect: "gold" },
        { id: "theme_space", icon: "🌍", title: "Фон: Космос", price: 1000, type: "bg", bg: "space" },
        { id: "theme_hyper", icon: "🧮", title: "Фон: Формулы", price: 1500, type: "bg", bg: "hyper" },
        { id: "theme_matrix", icon: "🟢", title: "Тема: Матрица", price: 800, type: "theme", theme: "matrix" }
    ];
    var grid = el('<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));gap:16px;"></div>');
    items.forEach(it => {
        var owned = state.shop.includes(it.id) || (it.type === "theme" && state.shop.includes("theme_" + it.theme));
        var btn = el('<button class="btn" style="width:100%;margin-top:10px;">' + (owned ? 'Применить' : 'Купить') + '</button>');
        if (!owned && state.xp < it.price) { btn.disabled = true; btn.textContent = "Мало XP"; }
        btn.onclick = () => {
            if (!owned) { state.xp -= it.price; state.shop.push(it.id); }
            if (it.type === "avatar_effect") { state.avatarEffect = it.effect; window.renderUserChip(); }
            if (it.type === "bg") { state.customBg = it.bg; window.applyCustomBg(); }
            if (it.type === "theme") { window.applyTheme(it.theme); }
            window.saveStudentData(); window.renderShopPage();
            window.showToast(owned ? "Применено!" : "Куплено!", "ok");
        };
        grid.appendChild(el('<div class="module" style="text-align:center;"><div style="font-size:40px;">' + it.icon + '</div><div style="font-weight:bold;">' + it.title + '</div><div style="color:var(--gold); font-weight:bold; margin-top:5px;">' + it.price + ' XP</div></div>')).appendChild(btn);
    });
    app.appendChild(grid);
};

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
            <div><h1 class="id-card-title">STUDENT DOCUMENT</h1><div class="id-card-subtitle">MDK 07.01 · CNC OPERATOR</div></div>
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

// --- ИСПРАВЛЕННЫЙ РОУТЕР (Добавлены все игры) ---
window.route = function() {
    closeDrawer();
    var hash = location.hash.replace(/^#/, "") || "/", parts = hash.split("/").filter(Boolean), app = $("app");
    if (!app) return;
    if (!state.student && !state.staff) { app.innerHTML = ""; return; }
    try {
        if (parts[0] === "topic") renderTopic(parts[1], parts[2]);
        else if (parts[0] === "shop") renderShopPage();
        else if (parts[0] === "profile") renderProfilePage(parts[1]);
        else if (parts[0] === "journal") window.renderJournalPage();
        else if (parts[0] === "requests") window.renderRequestsPage();
        else if (parts[0] === "event") window.renderDeadlyPartyPage();
        else if (parts[0] === "rating") window.renderRatingPage();
        else if (parts[0] === "chat") window.renderChatPage();
        else if (parts[0] === "arcade") renderArcadePage();
        else if (parts[0] === "3d-machine") render3DMachinePage();
        else if (parts[0] === "portfolio") renderPortfolioPage();
        else if (parts[0] === "gcode-test") window.renderGCodeTestPage();
        
        // --- РОУТЫ ДЛЯ МИНИ-ИГР ---
        else if (parts[0] === "casino") window.renderCasinoPage();
        else if (parts[0] === "roulette") window.renderRoulettePage();
        else if (parts[0] === "sudoku") window.renderSudokuPage();
        else if (parts[0] === "minesweeper") window.renderMinesweeperPage();
        else if (parts[0] === "spider") window.renderSpiderPage();
        else if (parts[0] === "tictactoe") window.renderTicTacToePage();

        else renderHome();
    } catch (err) { app.innerHTML = '<div class="module">Ошибка: ' + escapeHtml(err.message) + '</div>'; }
    window.scrollTo(0, 0);
};

window.addEventListener("DOMContentLoaded", () => {
    if (!state.student && !state.staff) $("loginOverlay").hidden = false; else $("loginOverlay").hidden = true;
    if (state.student) window.loadStudentData();
    
    if ($("themeToggle")) $("themeToggle").onclick = () => { $("themeModal") ? $("themeModal").remove() : openThemeModal(); };
    if ($("fontSizeToggle")) $("fontSizeToggle").onclick = function() {
        document.body.classList.toggle("reading-mode");
        this.textContent = document.body.classList.contains("reading-mode") ? "A-" : "A+";
    };

    if ($("globalSearch")) {
        $("globalSearch").addEventListener("input", function() {
            var query = this.value.trim().toLowerCase(), resultsBox = $("searchResults");
            resultsBox.innerHTML = ""; if (query.length < 2) { resultsBox.style.display = "none"; return; }
            var results = [];
            var c = window.COURSE || (typeof COURSE !== 'undefined' ? COURSE : null);
            if (c) {
                c.sections.forEach(sec => sec.topics.forEach(t => {
                    if (t.title.toLowerCase().includes(query) || t.code.toLowerCase().includes(query)) results.push({ type: "Тема", title: t.code + " - " + t.title, link: "#/topic/" + t.id + "/lecture" });
                }));
            }
            if (results.length === 0) resultsBox.innerHTML = '<div style="padding:10px;color:var(--muted);">Ничего не найдено</div>';
            else results.slice(0, 8).forEach(r => resultsBox.appendChild(el('<a class="search-res-item" href="' + r.link + '" onclick="document.getElementById(\'searchResults\').style.display=\'none\'"><div>' + r.title + '</div><div class="search-res-type">' + r.type + '</div></a>')));
            resultsBox.style.display = "block";
        });
        document.addEventListener("click", e => { if (!e.target.closest(".search-container") && $("searchResults")) $("searchResults").style.display = "none"; });
    }
    
    if ($("burgerBtn")) $("burgerBtn").onclick = () => { $("drawer").classList.toggle("open"); $("drawerOverlay").classList.toggle("open"); };
    if ($("drawerClose")) $("drawerClose").onclick = window.closeDrawer; 
    if ($("drawerOverlay")) $("drawerOverlay").onclick = window.closeDrawer;
    
    document.querySelectorAll("[data-go]").forEach(item => {
        item.onclick = (e) => { e.preventDefault(); location.hash = item.getAttribute("data-go"); window.closeDrawer(); };
    });
    window.renderUserChip(); window.route();
});
window.addEventListener("hashchange", window.route);