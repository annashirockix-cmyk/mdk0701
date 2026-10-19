/* ============================================================
   МДК 07.01 — ui.js (v182.0 — FULL RESTORE & FIXES)
   ============================================================ */
"use strict";

window.$ = (id) => document.getElementById(id);
window.el = (html) => { 
    const div = document.createElement("div"); 
    div.innerHTML = html.trim(); 
    return div.firstChild; 
};
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
        var vipHtml = state.isPremium ? '<span class="vip-badge">VIP</span>' : '';
        $("userChipName").innerHTML = escapeHtml(state.student.name) + vipHtml;
        $("userChipGroup").textContent = "Гр. " + state.student.group;
        var avHtml = state.avatar ? '<img src="' + state.avatar + '" style="width:100%;height:100%;object-fit:cover;">' : "👨‍🎓";
        var effClass = state.avatarEffect ? " av-fx-" + state.avatarEffect : "";
        if (state.isPremium) effClass = " av-fx-gold";
        $("userChipAvatar").innerHTML = '<div class="av-container' + effClass + '" style="width:100%; height:100%; font-size:24px;">' + avHtml + '</div>';
    }
};

window.closeDrawer = () => { $("drawer").classList.remove("open"); $("drawerOverlay").classList.remove("open"); };

window.applyTheme = (theme) => { 
    document.documentElement.setAttribute("data-theme", theme); 
    localStorage.setItem("mdk0701.theme", theme); 
    document.body.classList.remove("bg-space", "bg-hyper", "bg-matrix-code", "bg-brutal");
    state.customBg = null;
};

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
          if (!state.staff && !state.isPremium && ["matrix", "cyber", "neon", "retro", "space", "hyper", "matrix-code", "brutal"].includes(t) && !state.shop.includes("theme_" + t)) {
              window.showToast("Тема не куплена в магазине!", "err"); return;
          }
          if (["space", "hyper", "matrix-code", "brutal"].includes(t)) {
              window.applyTheme("light");
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
        app.innerHTML = '<div class="module" style="text-align:center; padding:40px; margin-top:40px;"><h2>Ошибка загрузки данных</h2><p>Файл data.js не загружен.</p><button class="btn" onclick="location.reload()">Обновить</button></div>';
        return;
    }
    app.appendChild(el('<section class="hero"><h1>' + c.title + '</h1><p>' + c.module + '</p></section>'));
    
    // Баннер VIP
    if (state.student && !state.isPremium) {
        app.appendChild(el(`
            <div class="module" style="background: linear-gradient(135deg, #2c3e50, #000); color: #fff; border: 1px solid #ffd700; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
                <div>
                    <h3 style="margin: 0; color: #ffd700;">👑 Станьте VIP-Оператором</h3>
                    <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.8;">Получите PRO-симулятор, аналитику и резюме!</p>
                </div>
                <button class="btn" onclick="location.hash='#/subscription'" style="background: #ffd700; color: #000; font-weight: bold;">Подробнее</button>
            </div>
        `));
    }

    app.appendChild(el(window.renderQuestsWidget()));
    
    // Блок полезных ссылок
    app.appendChild(el(`
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:10px; margin:20px 0;">
            <a href="#/schedule" class="module" style="text-align:center; margin:0; padding:15px; cursor:pointer;"><div style="font-size:24px;">📅</div><div style="font-size:12px; font-weight:bold; margin-top:5px;">Расписание</div></a>
            <a href="#/videos" class="module" style="text-align:center; margin:0; padding:15px; cursor:pointer;"><div style="font-size:24px;">🎬</div><div style="font-size:12px; font-weight:bold; margin-top:5px;">Видео</div></a>
            <a href="#/passports" class="module" style="text-align:center; margin:0; padding:15px; cursor:pointer;"><div style="font-size:24px;">📄</div><div style="font-size:12px; font-weight:bold; margin-top:5px;">Паспорта</div></a>
            <a href="#/safety" class="module" style="text-align:center; margin:0; padding:15px; cursor:pointer;"><div style="font-size:24px;">🦺</div><div style="font-size:12px; font-weight:bold; margin-top:5px;">Охрана труда</div></a>
            <a href="#/formatting" class="module" style="text-align:center; margin:0; padding:15px; cursor:pointer;"><div style="font-size:24px;">📝</div><div style="font-size:12px; font-weight:bold; margin-top:5px;">Оформление</div></a>
            <a href="#/glossary" class="module" style="text-align:center; margin:0; padding:15px; cursor:pointer;"><div style="font-size:24px;">📖</div><div style="font-size:12px; font-weight:bold; margin-top:5px;">Глоссарий</div></a>
        </div>
    `));

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

/* ---------------- ВОССТАНОВЛЕННЫЕ СТРАНИЦЫ ---------------- */

window.renderSchedulePage = function() {
    var app = $("app"); app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Расписание";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    app.appendChild(el('<section class="hero"><h1>Расписание занятий</h1></section>'));
    
    var block = el(`<section class="module"><div style="font-size:16px; margin-bottom:10px;">Пн: 08:30 - 10:00 (МДК 07.01, 204)</div><div style="font-size:16px; margin-bottom:20px;">Ср: 12:30 - 14:00 (Практика, Цех)</div><button class="btn" id="icalBtn" style="width:100%; max-width:300px;">📅 Добавить в календарь (.ics)</button></section>`);
    app.appendChild(block);

    block.querySelector("#icalBtn").onclick = () => {
        var ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//MDK0701//RU\n";
        var dt = new Date(); dt.setDate(dt.getDate() + 1);
        var y = dt.getFullYear(), m = String(dt.getMonth()+1).padStart(2,'0'), d = String(dt.getDate()).padStart(2,'0');
        ics += `BEGIN:VEVENT\nSUMMARY:МДК 07.01\nLOCATION:204\nDTSTART:${y}${m}${d}T083000\nDTEND:${y}${m}${d}T100000\nEND:VEVENT\nEND:VCALENDAR`;
        var blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
        var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "schedule.ics"; a.click();
    };
};

window.renderVideosPage = function() {
    var app = $("app"); app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Видеоматериалы";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    app.appendChild(el('<section class="hero"><h1>🎬 Видеоматериалы</h1></section>'));
    var c = window.COURSE || COURSE;
    var list = el('<div style="display:flex; flex-direction:column; gap:15px;"></div>');
    if(c.videos) c.videos.forEach(v => {
        list.appendChild(el(`<div class="module" style="margin:0; display:flex; justify-content:space-between; align-items:center; padding:15px;">
            <div style="font-weight:bold;">${v.title}</div>
            <button class="btn ghost" onclick="window.showToast('Видео ${v.src} будет доступно позже', 'info')">Смотреть</button>
        </div>`));
    });
    app.appendChild(list);
};

window.renderPassportsPage = function() {
    var app = $("app"); app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Паспорта станков";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    app.appendChild(el('<section class="hero"><h1>📄 Паспорта станков</h1></section>'));
    var c = window.COURSE || COURSE;
    var list = el('<div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;"></div>');
    if(c.passports) c.passports.forEach(p => {
        list.appendChild(el(`<div class="module" style="margin:0;">
            <h3 style="margin-top:0; color:var(--accent);">${p.title}</h3>
            <p style="font-size:13px; color:var(--muted); min-height:40px;">${p.summary}</p>
            <a href="${p.file}" target="_blank" class="btn ghost" style="width:100%; text-align:center; display:block;">Скачать PDF</a>
        </div>`));
    });
    app.appendChild(list);
};

window.renderSafetyPage = function() {
    var app = $("app"); app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Охрана труда";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    app.appendChild(el('<section class="hero"><h1>🦺 Инструкции по охране труда (ИОТ)</h1></section>'));
    var c = window.COURSE || COURSE;
    var list = el('<div style="display:flex; flex-direction:column; gap:10px;"></div>');
    if(c.safety) c.safety.forEach(s => {
        list.appendChild(el(`<div class="module" style="margin:0; display:flex; justify-content:space-between; align-items:center;">
            <div><div style="font-weight:bold;">${s.title}</div><div style="font-size:12px; color:var(--muted); max-width:500px;">${s.summary}</div></div>
            <a href="${s.file}" target="_blank" class="btn">Скачать</a>
        </div>`));
    });
    app.appendChild(list);
};

window.renderFormattingPage = function() {
    var app = $("app"); app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Требования к оформлению";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    var c = window.COURSE || COURSE;
    if(!c.practiceFormatting) return;
    
    app.appendChild(el(`<section class="hero"><h1>📝 ${c.practiceFormatting.title}</h1><p>${c.practiceFormatting.intro}</p></section>`));
    
    var list = el('<div class="module"></div>');
    c.practiceFormatting.blocks.forEach(b => {
        var blockHtml = `<h3 style="color:var(--accent); margin-top:20px; border-bottom:1px solid var(--border); padding-bottom:5px;">${b.title}</h3><ul style="margin-top:10px;">`;
        b.items.forEach(i => blockHtml += `<li style="margin-bottom:8px;">${i}</li>`);
        blockHtml += `</ul>`;
        list.appendChild(el(blockHtml));
    });
    app.appendChild(list);
};

window.renderGlossaryPage = function() {
    var app = $("app"); app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Глоссарий";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    app.appendChild(el('<section class="hero"><h1>📖 Глоссарий терминов</h1></section>'));
    
    var terms = [
        { t: "G-код", d: "Язык программирования для станков с ЧПУ." },
        { t: "ЧПУ", d: "Числовое программное управление." },
        { t: "УП", d: "Управляющая программа." },
        { t: "Интерполяция", d: "Расчет промежуточных точек траектории." },
        { t: "Люнет", d: "Приспособление для поддержки длинных валов." }
    ];
    var list = el('<div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;"></div>');
    terms.forEach(item => {
        list.appendChild(el(`<div class="module" style="margin:0;"><b style="color:var(--accent); font-size:16px;">${item.t}</b><p style="margin:5px 0 0; font-size:14px; color:var(--text-soft);">${item.d}</p></div>`));
    });
    app.appendChild(list);
};

// --- ОБНОВЛЕННЫЙ renderTopic (Исправлен вывод HTML) ---
window.renderTopic = function(id, tab){
  tab = tab || "lecture"; 
  var c = window.COURSE || COURSE; if (!c) return renderHome();
  var t = null;
  for (var i = 0; i < c.sections.length; i++) { for (var j = 0; j < c.sections[i].topics.length; j++) { if (c.sections[i].topics[j].id === id) { t = { section: c.sections[i], topic: c.sections[i].topics[j] }; break; } } if (t) break; }
  if(!t) return renderHome();

  var app = $("app"); app.innerHTML = ""; 
  app.appendChild(el('<a class="backlink" href="#/">← К программе</a><section class="topic-head"><h1>' + t.topic.title + '</h1></section>'));
  
  // Правильные стили для вкладок
  var tw = el('<div style="display:flex; gap:10px; margin-bottom:20px; overflow-x:auto; padding-bottom:5px;"></div>');
  [["lecture","01 Лекция"],["practice","02 Практика"],["self","03 Сам. работа"],["test","04 Тест"]].forEach(function(item){ 
      var btn = el(`<button style="padding:10px 20px; border-radius:8px; border:1px solid var(--border); background:${item[0] === tab ? 'var(--accent)' : 'var(--card)'}; color:${item[0] === tab ? '#fff' : 'var(--text)'}; cursor:pointer; font-weight:bold;" onclick="location.hash='#/topic/${id}/${item[0]}'">${item[1]}</button>`);
      tw.appendChild(btn); 
  });
  app.appendChild(tw); 
  
  var panel = el('<section class="panel module"></section>'); 
  app.appendChild(panel);

  if (tab === "lecture") {
    if(t.topic.lectures) t.topic.lectures.forEach(function(l){ 
        // ИСПРАВЛЕНИЕ: Создаем контейнер и вставляем HTML напрямую
        var h = el('<h3 style="color:var(--accent); margin-top:30px; border-bottom:1px solid var(--border); padding-bottom:5px;">' + l.code + '. ' + l.title + '</h3>');
        panel.appendChild(h);
        var contentDiv = document.createElement("div");
        contentDiv.className = "lecture-content";
        contentDiv.innerHTML = l.content || '<p>Материал готовится.</p>';
        panel.appendChild(contentDiv);
    });
    
    var isDone = state.progress[id] && state.progress[id].done >= 5;
    var markBtn = el('<button class="btn" style="width:100%;margin-top:20px; padding:15px;" ' + (isDone ? 'disabled' : '') + '>' + (isDone ? '✅ Тема изучена' : 'Отметить как изученное (+50 XP)') + '</button>');
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
        var html = '<div style="margin-bottom:24px;border:1px solid var(--border);padding:20px;border-radius:12px;background:var(--card-soft);"><div style="color:var(--accent);font-weight:bold;">' + p.code + '</div><div style="font-weight:bold;margin:4px 0 12px 0;font-size:18px;">' + p.title + '</div>';
        if(p.goal) html += '<div style="font-size:14px;color:var(--muted);margin-bottom:12px;"><b>Цель:</b> ' + p.goal + '</div>';
        html += '<div style="margin-top:20px;border-top:1px solid var(--border);padding-top:16px;">';
        if (status === "approved") html += '<div style="color:var(--ok);font-weight:bold;">✅ Работа подтверждена. Оценка: <b>' + (grade||'') + '</b></div>';
        else if (status === "pending") html += '<div style="color:#d97706;font-weight:bold;">⏳ На проверке.</div>';
        else html += '<button class="btn" onclick="window.markPracticalDone(\'' + id + '\', \'' + p.code + '\')">✅ Сделал</button>';
        html += '</div></div>'; 
        panel.appendChild(el(html));
    });
  }
  
  if (tab === "test" && t.topic.test) {
      var testWrap = el('<div></div>'); panel.appendChild(testWrap);
      t.topic.test.forEach(function(q, qi){ 
          var qb = el('<div style="margin-bottom:20px;"><div style="font-weight:bold; margin-bottom:10px;">' + (qi+1) + '. ' + q.q + '</div></div>'); 
          q.options.forEach(function(opt, oi){ 
              qb.appendChild(el('<label style="display:block; padding:8px; border:1px solid var(--border); border-radius:6px; margin-bottom:5px; cursor:pointer;"><input type="radio" name="q' + qi + '" value="' + oi + '" style="margin-right:10px;">' + opt + '</label>')); 
          }); 
          testWrap.appendChild(qb); 
      });
      var finishBtn = el('<button class="btn" style="width:100%;margin-top:10px; padding:15px;">Завершить тест</button>'); panel.appendChild(finishBtn);
      finishBtn.onclick = function() {
        var correct = 0; t.topic.test.forEach(function(q, qi) { var ch = testWrap.querySelector('input[name="q' + qi + '"]:checked'); if (ch && Number(ch.value) === q.correct) correct++; });
        finishBtn.disabled = true; finishBtn.textContent = "Тест завершен";
        var grade = Math.max(2, Math.round((correct / t.topic.test.length) * 5)); state.results[id] = { grade: grade }; window.addXP(150); window.saveStudentData();
        window.showToast("Тест сдан! Оценка: " + grade, "ok"); 
      };
  }
  
  if (tab === "self" && t.topic.selfChecks) {
      var selfWrap = el('<div></div>'); panel.appendChild(selfWrap);
      t.topic.selfChecks.forEach(function(q, i){ 
          selfWrap.appendChild(el('<div style="margin-bottom:20px;"><div style="font-weight:bold; margin-bottom:10px;">' + (i+1) + '. ' + q.q + '</div><input type="text" style="width:100%; padding:10px; border:1px solid var(--border); border-radius:6px; background:var(--bg); color:var(--text);" data-idx="' + i + '" placeholder="Ваш ответ"></div>')); 
      });
      var checkBtn = el('<button class="btn" style="width:100%;margin-top:10px; padding:15px;">Завершить и проверить</button>'); panel.appendChild(checkBtn);
      checkBtn.onclick = function() {
        var correctCount = 0; selfWrap.querySelectorAll("input").forEach(function(inp) { var idx = Number(inp.getAttribute("data-idx")); if (inp.value.trim().toLowerCase() === t.topic.selfChecks[idx].a.trim().toLowerCase()) correctCount++; });
        checkBtn.disabled = true; checkBtn.textContent = "Результаты сохранены";
        var grade = Math.max(2, Math.round((correctCount/t.topic.selfChecks.length)*5)); state.selfResults[id] = { grade: grade }; window.addXP(100); window.saveStudentData(); window.showToast("Работа сдана! Оценка: " + grade, "ok");
      };
  }
};

window.markPracticalDone = function(topicId, code) {
    if (!state.practicalsDone[topicId]) state.practicalsDone[topicId] = {};
    if (!state.practicalGrades[topicId]) state.practicalGrades[topicId] = {};
    
    if (state.isPremium) {
        state.practicalsDone[topicId][code] = "approved";
        state.practicalGrades[topicId][code] = 5;
        window.showToast("👑 VIP: Работа подтверждена! Оценка: 5", "ok");
    } else {
        state.practicalsDone[topicId][code] = "pending";
        window.showToast("Отправлено на проверку!", "ok");
    }
    window.saveStudentData(); window.renderTopic(topicId, "practice");
};

/* ---------------- МАГАЗИН И ПРОФИЛЬ ---------------- */
window.renderShopPage = function() {
    var app = $("app"); app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Магазин XP";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>Магазин</h1><p>Баланс: <b>' + state.xp + ' XP</b></p></section>'));
    
    var items = [
        { id: "fx_gold", icon: "👑", title: "Маска: Золото", price: 2000, type: "avatar_effect", effect: "gold" },
        { id: "theme_space", icon: "🌍", title: "Фон: Космос", price: 1000, type: "bg", bg: "space" },
        { id: "theme_hyper", icon: "🧮", title: "Фон: Формулы", price: 1500, type: "bg", bg: "hyper" },
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
  var vipHtml = state.isPremium ? '<span class="vip-badge">VIP</span>' : '';
  
  var card = `
    <div class="id-card">
        <div class="id-card-header">
            <div><h1 class="id-card-title">STUDENT DOCUMENT</h1><div class="id-card-subtitle">MDK 07.01 · CNC OPERATOR</div></div>
            <div><div style="font-size:10px; font-weight:bold; border:1px solid #111; padding:2px 6px; display:inline-block;">${state.isPremium ? 'VIP' : 'REGISTERED'}</div></div>
        </div>
        <div class="id-card-body">
            <div class="id-photo">${avatarHtml}</div>
            <div class="id-info"><table>
                <tr><td class="label">NAME</td><td class="value">${escapeHtml(data.name)} ${vipHtml}</td></tr>
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

/* ---------------- РОУТЕР ---------------- */
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
        
        // --- ВОССТАНОВЛЕННЫЕ СТРАНИЦЫ ---
        else if (parts[0] === "schedule") window.renderSchedulePage();
        else if (parts[0] === "videos") window.renderVideosPage();
        else if (parts[0] === "passports") window.renderPassportsPage();
        else if (parts[0] === "safety") window.renderSafetyPage();
        else if (parts[0] === "formatting") window.renderFormattingPage();
        else if (parts[0] === "glossary") window.renderGlossaryPage();

        // --- ИГРЫ И VIP ---
        else if (parts[0] === "gcode-test") window.renderGCodeTestPage();
        else if (parts[0] === "casino") window.renderCasinoPage();
        else if (parts[0] === "roulette") window.renderRoulettePage();
        else if (parts[0] === "sudoku") window.renderSudokuPage();
        else if (parts[0] === "minesweeper") window.renderMinesweeperPage();
        else if (parts[0] === "spider") window.renderSpiderPage();
        else if (parts[0] === "tictactoe") window.renderTicTacToePage();
        else if (parts[0] === "subscription") window.renderSubscriptionPage();
        else if (parts[0] === "dashboard") window.renderDashboardPage();
        else if (parts[0] === "vip-materials") window.renderVipMaterialsPage();

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
            var c = window.COURSE || COURSE;
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