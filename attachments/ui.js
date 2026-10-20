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
    if (!window.state.student) return;
    window.$("userChipName").textContent = window.state.student.name;
    window.$("userChipGroup").textContent = "Гр. " + window.state.student.group;
    window.$("userChipAvatar").innerHTML = "👨‍🎓";
};

window.closeDrawer = () => { if(window.$("drawer")) window.$("drawer").classList.remove("open"); if(window.$("drawerOverlay")) window.$("drawerOverlay").classList.remove("open"); };
window.applyTheme = (theme) => { document.documentElement.setAttribute("data-theme", theme); try { localStorage.setItem("mdk.theme", theme); } catch(e){} };

/* ---------------- ГЛАВНАЯ ---------------- */
function renderHome() {
    var app = window.$("app"); app.innerHTML = "";
    var c = window.COURSE;
    app.appendChild(window.el(`<section class="hero"><h1>${c.title}</h1><p>${c.module}</p></section>`));
    
    app.appendChild(window.el(`
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:10px; margin:20px 0;">
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
            var isDone = window.state.results[t.id] || window.state.selfResults[t.id];
            list.appendChild(window.el(`<div class="topic" onclick="location.hash='#/topic/${t.id}/lecture'"><span style="margin-right:15px; font-size:20px;">${isDone ? '✅' : '📖'}</span><div><div style="font-size:12px; color:var(--muted);">${t.code}</div><div style="font-weight:bold;">${t.title}</div></div></div>`));
        });
        app.appendChild(list);
    });
}

/* ---------------- ТЕМЫ (ВКЛЮЧАЯ САМ. РАБОТУ) ---------------- */
window.renderTopic = function(id, tab){
  tab = tab || "lecture"; 
  var c = window.COURSE; var t = null;
  for (var i = 0; i < c.sections.length; i++) { for (var j = 0; j < c.sections[i].topics.length; j++) { if (c.sections[i].topics[j].id === id) { t = c.sections[i].topics[j]; break; } } if (t) break; }
  if(!t) return renderHome();

  var app = window.$("app"); app.innerHTML = ""; 
  app.appendChild(window.el(`<a class="backlink" href="#/">← К программе</a><section class="topic-head"><h1>${t.title}</h1></section>`));
  
  var tw = window.el('<div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap;"></div>');
  [["lecture","01 Лекция"],["practice","02 Практика"],["self","03 Сам. работа"],["test","04 Тест"]].forEach(item => { 
      tw.appendChild(window.el(`<button class="tab ${item[0] === tab ? 'active' : ''}" onclick="location.hash='#/topic/${id}/${item[0]}'">${item[1]}</button>`)); 
  });
  app.appendChild(tw); 
  
  var panel = window.el('<section class="panel module"></section>'); app.appendChild(panel);

  // 1. ЛЕКЦИИ
  if (tab === "lecture") {
    if(t.lectures) t.lectures.forEach(l => { panel.appendChild(window.el(`<h3>${l.code}. ${l.title}</h3><div class="lecture-content">${l.content}</div>`)); });
    var markBtn = window.el('<button class="btn" style="width:100%;margin-top:20px;">Отметить как изученное (+50 XP)</button>');
    markBtn.onclick = function() { window.addXP(50); markBtn.textContent = "✅ Изучено"; markBtn.disabled = true; }; 
    panel.appendChild(markBtn);
  }
  
  // 2. ПРАКТИКА
  if (tab === "practice") {
    if(t.practicals) {
        t.practicals.forEach(p => {
            var html = `<div style="margin-bottom:20px; padding:20px; border:1px solid var(--border); border-radius:8px;">
                <h4>${p.code}. ${p.title}</h4>
                <p><b>Цель:</b> ${p.goal || ''}</p>
                <p><b>Задание:</b> ${p.task || ''}</p>
                <p><b>Пример:</b> <i>${p.example || ''}</i></p>
                <details style="margin-top:10px;"><summary style="cursor:pointer; color:var(--accent);">Показать решение</summary>
                <ul style="margin-top:10px;">${(p.solution || []).map(s => `<li>${s}</li>`).join('')}</ul>
                </details>
                <button class="btn ghost" style="margin-top:10px;">Сдать</button>
            </div>`;
            panel.appendChild(window.el(html));
        });
    }
  }

  // 3. САМОСТОЯТЕЛЬНАЯ РАБОТА (ВОССТАНОВЛЕНА)
  if (tab === "self" && t.selfChecks) {
      var selfWrap = window.el('<div></div>'); panel.appendChild(selfWrap);
      t.selfChecks.forEach(function(q, i){ 
          selfWrap.appendChild(window.el(`<div style="margin-bottom:20px;"><div style="font-weight:bold; margin-bottom:8px;">${i+1}. ${q.q}</div><input type="text" class="self-input" data-idx="${i}" placeholder="Ваш ответ" style="width:100%; padding:10px; border:1px solid var(--border); border-radius:6px;"></div>`)); 
      });
      var checkBtn = window.el('<button class="btn" style="width:100%;margin-top:10px;">Завершить и проверить</button>'); panel.appendChild(checkBtn);
      checkBtn.onclick = function() {
        var correctCount = 0; 
        selfWrap.querySelectorAll(".self-input").forEach(function(inp) { 
            var idx = Number(inp.getAttribute("data-idx")); 
            if (inp.value.trim().toLowerCase() === t.selfChecks[idx].a.trim().toLowerCase()) correctCount++; 
        });
        checkBtn.disabled = true; checkBtn.textContent = "Результаты сохранены";
        var grade = Math.max(2, Math.round((correctCount/t.selfChecks.length)*5)); 
        window.state.selfResults[id] = { grade: grade }; 
        window.addXP(100); window.showToast("Работа сдана! Оценка: " + grade, "ok");
      };
  }
  
  // 4. ТЕСТ
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

/* ---------------- ОСТАЛЬНЫЕ СТРАНИЦЫ ---------------- */
window.renderFormattingPage = function() {
    var app = window.$("app"); app.innerHTML = "";
    app.appendChild(window.el('<a class="backlink" href="#/">← На главную</a>'));
    var fmt = window.COURSE.practiceFormatting;
    if(!fmt) return app.appendChild(window.el('<div class="module">Нет данных.</div>'));
    app.appendChild(window.el(`<section class="hero"><h1>📝 ${fmt.title}</h1><p>${fmt.intro}</p></section>`));
    var list = window.el('<div class="module"></div>');
    fmt.blocks.forEach(b => {
        list.appendChild(window.el(`<h3 style="color:var(--accent);">${b.title}</h3><ul>` + b.items.map(i => `<li>${i}</li>`).join('') + `</ul>`));
    });
    app.appendChild(list);
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
    (window.COURSE.passports || []).forEach(p => { list.appendChild(window.el(`<div style="padding:10px 0; border-bottom:1px solid var(--border);"><b>${p.title}</b><br><span style="font-size:12px; color:var(--muted);">${p.summary}</span></div>`)); });
    app.appendChild(list);
};

window.renderSafetyPage = function() {
    var app = window.$("app"); app.innerHTML = "";
    app.appendChild(window.el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>🦺 Охрана труда</h1></section>'));
    var list = window.el('<div class="module"></div>');
    (window.COURSE.safety || []).forEach(s => { list.appendChild(window.el(`<div style="padding:10px 0; border-bottom:1px solid var(--border);"><b>${s.title}</b></div>`)); });
    app.appendChild(list);
};

// Заглушки для страниц, которые вызывали ошибки
window.renderProfilePage = function() { window.$("app").innerHTML = "<div class='module'>Профиль в разработке</div>"; };
window.renderJournalPage = function() { window.$("app").innerHTML = "<div class='module'>Журнал доступен только преподавателям (API в разработке)</div>"; };
window.renderRatingPage = function() { window.$("app").innerHTML = "<div class='module'>Доска почета (API в разработке)</div>"; };
window.renderChatPage = function() { window.$("app").innerHTML = "<div class='module'>Чат (API в разработке)</div>"; };
window.renderArcadePage = function() { window.$("app").innerHTML = "<div class='module'>Игровая комната</div>"; };
window.renderFinalExamPage = function() { window.$("app").innerHTML = "<div class='module'>Экзамен</div>"; };

/* ---------------- РОУТЕР ---------------- */
window.route = function() {
    window.closeDrawer();
    var hash = location.hash.replace(/^#/, "") || "/", parts = hash.split("/").filter(Boolean), app = window.$("app");
    if (!app) return;
    if (!window.state.student) { app.innerHTML = "<div class='module' style='text-align:center;'><h2>Войдите в систему</h2></div>"; return; }

    try {
        if (parts[0] === "topic") window.renderTopic(parts[1], parts[2]);
        else if (parts[0] === "profile") window.renderProfilePage();
        else if (parts[0] === "formatting") window.renderFormattingPage();
        else if (parts[0] === "videos") window.renderVideosPage();
        else if (parts[0] === "passports") window.renderPassportsPage();
        else if (parts[0] === "safety") window.renderSafetyPage();
        else if (parts[0] === "arcade") window.renderArcadePage();
        else if (parts[0] === "journal") window.renderJournalPage();
        else if (parts[0] === "rating") window.renderRatingPage();
        else if (parts[0] === "chat") window.renderChatPage();
        else if (parts[0] === "final") window.renderFinalExamPage();
        else renderHome();
    } catch (err) { app.innerHTML = '<div class="module">Ошибка: ' + window.escapeHtml(err.message) + '</div>'; }
    window.scrollTo(0, 0);
};

window.addEventListener("DOMContentLoaded", () => {
    if (!window.state.student) window.$("loginOverlay").hidden = false; else window.$("loginOverlay").hidden = true;
    if (window.state.student) window.loadStudentData();
    
    if (window.$("themeToggle")) window.$("themeToggle").onclick = () => { 
        var t = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
        window.applyTheme(t);
    };
    
    if (window.$("burgerBtn")) window.$("burgerBtn").onclick = () => { window.$("drawer").classList.toggle("open"); window.$("drawerOverlay").classList.toggle("open"); };
    if (window.$("drawerClose")) window.$("drawerClose").onclick = window.closeDrawer; 
    if (window.$("drawerOverlay")) window.$("drawerOverlay").onclick = window.closeDrawer;
    
    document.querySelectorAll("[data-go]").forEach(item => {
        item.onclick = (e) => { e.preventDefault(); location.hash = item.getAttribute("data-go"); window.closeDrawer(); };
    });
    
    window.renderUserChip(); window.route();
});
window.addEventListener("hashchange", window.route);