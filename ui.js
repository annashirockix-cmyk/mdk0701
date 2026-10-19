/* ============================================================
   Учебный портал — ui.js (v185.0 — FULL RESTORE & FIXES)
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
    // Отображение VIP кнопок в меню
    if ($("navVipCheats")) $("navVipCheats").style.display = state.isPremium ? "flex" : "none";
    if ($("navVipMat")) $("navVipMat").style.display = state.isPremium ? "flex" : "none";
};

window.closeDrawer = () => { 
    if($("drawer")) $("drawer").classList.remove("open"); 
    if($("drawerOverlay")) $("drawerOverlay").classList.remove("open"); 
};

window.applyTheme = (theme) => { 
    document.documentElement.setAttribute("data-theme", theme); 
    localStorage.setItem("mdk.theme", theme); 
    document.body.className = document.body.className.replace(/bg-\S+/g, ''); 
};

/* ---------------- ГЛАВНАЯ ---------------- */
function renderHome() {
    var app = $("app"); app.innerHTML = "";
    var c = window.COURSE || window.COURSES[state.activeCourseId];
    if (!c) return app.innerHTML = "<div class='module'>Ошибка загрузки курса</div>";

    app.appendChild(el(`<section class="hero"><h1>${c.title}</h1><p>${c.module}</p></section>`));
    
    // Баннер VIP
    if (state.student && !state.isPremium) {
        app.appendChild(el(`
            <div class="module" style="background: linear-gradient(135deg, #2c3e50, #000); color: #fff; border: 1px solid #ffd700; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px; cursor:pointer;" onclick="location.hash='#/subscription'">
                <div><h3 style="margin: 0; color: #ffd700;">👑 Станьте VIP-Оператором</h3><p style="margin: 5px 0 0; font-size: 14px; opacity: 0.8;">x2 опыта, аналитика, чит-лист!</p></div>
                <button class="btn" style="background: #ffd700; color: #000; font-weight: bold;">Подробнее</button>
            </div>
        `));
    }

    // Виджет квестов (если есть)
    if (state.student && window.renderQuestsWidget) {
        var qw = window.renderQuestsWidget();
        if (qw) app.appendChild(el(qw));
    }

    // Сетка быстрых ссылок
    app.appendChild(el(`
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:10px; margin:20px 0;">
            <a href="#/schedule" class="module" style="text-align:center; margin:0; padding:15px; cursor:pointer;"><div style="font-size:24px;">📅</div><div style="font-size:12px; font-weight:bold; margin-top:5px;">Расписание</div></a>
            <a href="#/videos" class="module" style="text-align:center; margin:0; padding:15px; cursor:pointer;"><div style="font-size:24px;">🎬</div><div style="font-size:12px; font-weight:bold; margin-top:5px;">Видео</div></a>
            <a href="#/passports" class="module" style="text-align:center; margin:0; padding:15px; cursor:pointer;"><div style="font-size:24px;">📄</div><div style="font-size:12px; font-weight:bold; margin-top:5px;">Паспорта</div></a>
            <a href="#/safety" class="module" style="text-align:center; margin:0; padding:15px; cursor:pointer;"><div style="font-size:24px;">🦺</div><div style="font-size:12px; font-weight:bold; margin-top:5px;">Охрана труда</div></a>
            <a href="#/formatting" class="module" style="text-align:center; margin:0; padding:15px; cursor:pointer;"><div style="font-size:24px;">📝</div><div style="font-size:12px; font-weight:bold; margin-top:5px;">Оформление</div></a>
            <a href="#/glossary" class="module" style="text-align:center; margin:0; padding:15px; cursor:pointer;"><div style="font-size:24px;">📖</div><div style="font-size:12px; font-weight:bold; margin-top:5px;">Глоссарий</div></a>
        </div>
    `));

    // Список тем
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

/* ---------------- ТЕМА (Лекция/Практика/Тест) ---------------- */
window.renderTopic = function(id, tab){
  tab = tab || "lecture"; 
  var c = window.COURSE || window.COURSES[state.activeCourseId]; 
  var t = null;
  for (var i = 0; i < c.sections.length; i++) { 
      for (var j = 0; j < c.sections[i].topics.length; j++) { 
          if (c.sections[i].topics[j].id === id) { t = c.sections[i].topics[j]; break; } 
      } 
      if (t) break; 
  }
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
    if(t.lectures) t.lectures.forEach(l => { 
        panel.appendChild(el(`<h3>${l.code}. ${l.title}</h3><div class="lecture-content">${l.content || '<p>Текст лекции готовится.</p>'}</div>`)); 
    });
    var markBtn = el('<button class="btn" style="width:100%;margin-top:20px;">Отметить как изученное (+50 XP)</button>');
    markBtn.onclick = function() { window.addXP(50); markBtn.textContent = "✅ Тема изучена"; markBtn.disabled = true; }; 
    panel.appendChild(markBtn);
  }
  
  if (tab === "practice") {
    if(t.practicals && t.practicals.length > 0) {
        t.practicals.forEach(p => {
            panel.appendChild(el(`<div style="margin-bottom:20px; padding:20px; border:1px solid var(--border); border-radius:8px;"><h4>${p.code}. ${p.title}</h4><p style="font-size:14px;"><b>Цель:</b> ${p.goal}</p><button class="btn ghost">Сдать работу</button></div>`));
        });
    } else {
        panel.appendChild(el('<p>Практические задания отсутствуют.</p>'));
    }
  }
  
  if (tab === "test" && t.test && t.test.length > 0) {
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
        state.results[id] = { grade: grade }; 
        window.addXP(100); window.saveStudentData();
        window.showToast("Тест сдан. Оценка: " + grade, "ok"); 
      };
  } else if (tab === "test") {
      panel.appendChild(el('<p>Тест для этой темы еще не добавлен.</p>'));
  }
};

/* ---------------- VIP & ПОДПИСКА ---------------- */
window.renderSubscriptionPage = function() {
    var app = $("app"); app.innerHTML = "";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    
    if (state.isPremium) {
        app.appendChild(el(`<section class="premium-card" style="text-align:center; padding:40px;"><h1>👑 VIP Активен</h1><p>Действует до: ${new Date(state.premiumUntil).toLocaleDateString()}</p><button class="btn" onclick="window.cancelPremium()">Отменить</button></section>`));
        return;
    }

    app.appendChild(el(`
        <section class="premium-card" style="padding:40px; text-align:center;">
            <h1 style="color:#ffd700; margin-top:0;">Станьте VIP-Оператором!</h1>
            <ul class="premium-feature-list" style="text-align:left; display:inline-block; margin: 20px 0;">
                <li>🔥 x2 Опыта за все действия</li>
                <li>🕵️ Чит-лист (ответы на тесты)</li>
                <li>📊 Аналитика успеваемости</li>
                <li>📄 PRO Резюме для работы</li>
            </ul>
            <br>
            <button class="btn" id="buyPremiumBtn" style="background:#ffd700; color:#000; width:100%; max-width:300px; margin-top:20px; font-size:18px;">Оформить за 299 ₽</button>
        </section>
    `));

    // ИЗМЕНЕНО: Теперь показывает уведомление о разработке
    document.getElementById("buyPremiumBtn").onclick = function() {
        window.showToast("🛠️ Оплата временно недоступна (раздел в разработке)", "info");
    };
};

window.cancelPremium = function() {
    if(confirm("Вы уверены, что хотите отменить VIP-подписку?")) {
        state.isPremium = false; state.premiumUntil = 0;
        window.saveStudentData(); window.renderUserChip(); window.renderSubscriptionPage();
        window.showToast("Подписка отменена", "info");
    }
};

window.renderVipCheatsPage = function() {
    var app = $("app"); app.innerHTML = "";
    if (!state.isPremium) { app.appendChild(el('<div class="module">Доступно только VIP</div>')); return; }
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>🕵️ Чит-лист</h1></section>'));
    var list = el('<div class="module"></div>');
    var c = window.COURSE || window.COURSES[state.activeCourseId];
    
    c.sections.forEach(s => s.topics.forEach(t => {
        if (t.test && t.test.length > 0) {
            list.appendChild(el(`<h3 style="color:var(--accent); margin-top:20px;">${t.title}</h3>`));
            t.test.forEach((q,i) => {
                list.appendChild(el(`<div style="margin-bottom:10px; font-size:14px;"><b>${q.q}</b><br><span style="color:var(--ok)">✔ ${q.options[q.correct]}</span></div>`));
            });
        }
    }));
    app.appendChild(list);
};

window.renderVipMaterialsPage = function() {
    var app = $("app"); app.innerHTML = "";
    if (!state.isPremium) { app.appendChild(el('<div class="module">Доступно только VIP</div>')); return; }
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>📚 База знаний VIP</h1></section>'));
    app.appendChild(el('<div class="module"><p>Здесь будут доступны чертежи, 3D модели и готовые УП.</p></div>'));
};

/* ---------------- ВОССТАНОВЛЕННЫЕ СТРАНИЦЫ ---------------- */
window.renderSchedulePage = function() {
    var app = $("app"); app.innerHTML = "";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>Расписание занятий</h1></section>'));
    app.appendChild(el('<div class="module"><p>Пн: 08:30 - 10:00 (МДК, 204)</p><p>Ср: 12:30 - 14:00 (Практика, Цех)</p><button class="btn" onclick="window.showToast(\'Добавлено в календарь\', \'ok\')" style="margin-top:15px;">📅 Добавить в календарь</button></div>'));
};

window.renderVideosPage = function() {
    var app = $("app"); app.innerHTML = "";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>🎬 Видеоматериалы</h1></section>'));
    var list = el('<div class="module"></div>');
    var vids = (window.COURSE || window.COURSES[state.activeCourseId]).videos || [];
    
    if (vids.length === 0) list.appendChild(el('<p>Видео пока нет.</p>'));
    
    vids.forEach(v => {
        list.appendChild(el(`<div style="padding:12px 0; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
            <span style="font-weight:bold;">${v.title}</span>
            <button class="btn ghost" onclick="window.showToast('Воспроизведение видео недоступно в демо-версии', 'info')">▶ Смотреть</button>
        </div>`));
    });
    app.appendChild(list);
};

window.renderPassportsPage = function() {
    var app = $("app"); app.innerHTML = "";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>📄 Паспорта станков</h1></section>'));
    var list = el('<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:15px;"></div>');
    var docs = (window.COURSE || window.COURSES[state.activeCourseId]).passports || [];
    
    if (docs.length === 0) list.appendChild(el('<p>Документы не загружены.</p>'));

    docs.forEach(p => {
        list.appendChild(el(`<div class="module" style="margin:0;">
            <h3 style="margin-top:0;">${p.title}</h3>
            <p style="font-size:13px; color:var(--muted);">${p.summary || ''}</p>
            <button class="btn ghost" style="width:100%;" onclick="window.showToast('Скачивание PDF недоступно в демо', 'info')">Скачать PDF</button>
        </div>`));
    });
    app.appendChild(list);
};

window.renderSafetyPage = function() {
    var app = $("app"); app.innerHTML = "";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>🦺 Инструкции по охране труда</h1></section>'));
    var list = el('<div class="module"></div>');
    var docs = (window.COURSE || window.COURSES[state.activeCourseId]).safety || [];
    
    if (docs.length === 0) list.appendChild(el('<p>Инструкции не загружены.</p>'));

    docs.forEach(s => {
        list.appendChild(el(`<div style="padding:15px 0; border-bottom:1px solid var(--border);">
            <h4 style="margin:0 0 5px 0;">${s.title}</h4>
            <p style="font-size:12px; color:var(--muted); margin-bottom:10px;">${s.summary || ''}</p>
            <button class="btn ghost" onclick="window.showToast('Скачивание документа недоступно в демо', 'info')">Скачать</button>
        </div>`));
    });
    app.appendChild(list);
};

window.renderFormattingPage = function() {
    var app = $("app"); app.innerHTML = "";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    var fmt = (window.COURSE || window.COURSES[state.activeCourseId]).formatting;
    
    if (!fmt) return app.appendChild(el('<div class="module">Информация готовится.</div>'));

    app.appendChild(el(`<section class="hero"><h1>📝 ${fmt.title}</h1><p>${fmt.intro}</p></section>`));
    
    var list = el('<div class="module"></div>');
    fmt.blocks.forEach(b => {
        list.appendChild(el(`<h3 style="color:var(--accent); margin-top:20px; border-bottom:1px solid var(--border); padding-bottom:5px;">${b.title}</h3>`));
        var ul = el('<ul style="margin-top:10px; padding-left:20px;"></ul>');
        b.items.forEach(i => ul.appendChild(el(`<li style="margin-bottom:8px;">${i}</li>`)));
        list.appendChild(ul);
    });
    app.appendChild(list);
};

window.renderGlossaryPage = function() {
    var app = $("app"); app.innerHTML = "";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>📖 Глоссарий</h1></section>'));
    
    var terms = [
        { t: "G-код", d: "Язык программирования для станков с ЧПУ." },
        { t: "ЧПУ", d: "Числовое программное управление." },
        { t: "Интерполяция", d: "Расчет промежуточных точек траектории." },
        { t: "Люнет", d: "Приспособление для поддержки длинных валов." }
    ];
    var list = el('<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:15px;"></div>');
    terms.forEach(item => {
        list.appendChild(el(`<div class="module" style="margin:0;"><b style="color:var(--accent); font-size:16px;">${item.t}</b><p style="margin:5px 0 0; font-size:14px;">${item.d}</p></div>`));
    });
    app.appendChild(list);
};

window.renderLinksPage = function() {
    var app = $("app"); app.innerHTML = "";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>🔗 Полезные ссылки</h1></section>'));
    app.appendChild(el(`
        <div class="module">
            <ul style="padding-left:20px; line-height:2;">
                <li><a href="https://tirapid.com/" target="_blank" style="color:var(--accent);">TiRapid — руководство по G-коду</a></li>
                <li><a href="https://www.youtube.com/@NYCNC" target="_blank" style="color:var(--accent);">NYC CNC — канал по практическому ЧПУ</a></li>
                <li><a href="https://intervespco.ru/" target="_blank" style="color:var(--accent);">Intervesp — модальные коды</a></li>
            </ul>
        </div>
    `));
};

window.renderPortfolioPage = function() {
    var app = $("app"); app.innerHTML = "";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    if (!state.student) return;

    var portfolioHtml = `
        <div id="portfolioPrint" class="module" style="padding:40px; background:#fff; color:#000;">
            <h1 style="text-align:center;">РЕЗЮМЕ (${state.activeCourseId})</h1>
            <hr style="margin:20px 0; border:1px solid #ccc;">
            <p><b>ФИО:</b> ${escapeHtml(state.student.name)}</p>
            <p><b>Группа:</b> ${escapeHtml(state.student.group)}</p>
            <p><b>Курс:</b> ${(window.COURSE || window.COURSES[state.activeCourseId]).title}</p>
            <p><b>Опыт (XP):</b> ${state.xp}</p>
        </div>
        <div style="text-align:center; margin-top:20px;">
            <button class="btn" id="pdfBtn">📥 Скачать PDF</button>
        </div>
    `;
    app.appendChild(el(portfolioHtml));

    var btn = document.getElementById("pdfBtn");
    if (btn) {
        btn.onclick = function() {
            if(typeof html2pdf === 'undefined') return window.showToast("Библиотека PDF не загружена", "err");
            var element = document.getElementById('portfolioPrint');
            html2pdf().from(element).save().then(() => window.showToast("PDF готов!", "ok"));
        };
    }
};

/* ---------------- РОУТЕР ---------------- */
window.route = function() {
    closeDrawer();
    var hash = location.hash.replace(/^#/, "") || "/", parts = hash.split("/").filter(Boolean), app = $("app");
    if (!app) return;
    
    // Если не залогинен, показываем экран входа
    if (!state.student && !state.staff) { app.innerHTML = ""; return; }
    
    // Проверка, что предмет загружен
    if (!window.COURSE) window.COURSE = window.COURSES[state.activeCourseId];

    try {
        if (parts[0] === "topic") window.renderTopic(parts[1], parts[2]);
        else if (parts[0] === "profile") window.renderProfilePage();
        else if (parts[0] === "subscription") window.renderSubscriptionPage();
        else if (parts[0] === "vip-materials") window.renderVipMaterialsPage();
        else if (parts[0] === "vip-cheats") window.renderVipCheatsPage();
        else if (parts[0] === "portfolio") window.renderPortfolioPage();
        else if (parts[0] === "videos") window.renderVideosPage();
        else if (parts[0] === "schedule") window.renderSchedulePage();
        else if (parts[0] === "passports") window.renderPassportsPage();
        else if (parts[0] === "safety") window.renderSafetyPage();
        else if (parts[0] === "formatting") window.renderFormattingPage();
        else if (parts[0] === "glossary") window.renderGlossaryPage();
        else if (parts[0] === "links") window.renderLinksPage();
        
        else if (parts[0] === "arcade" && window.renderArcadePage) window.renderArcadePage();
        else if (parts[0] === "gcode-test" && window.renderGCodeTestPage) window.renderGCodeTestPage();
        else if (parts[0] === "final" && window.renderFinalExamPage) window.renderFinalExamPage();
        
        else renderHome();
    } catch (err) { 
        app.innerHTML = '<div class="module" style="color:var(--err);">Ошибка загрузки страницы: ' + escapeHtml(err.message) + '</div>'; 
    }
    window.scrollTo(0, 0);
};

window.addEventListener("DOMContentLoaded", () => {
    if (!state.student && !state.staff) $("loginOverlay").hidden = false; else $("loginOverlay").hidden = true;
    if (state.student) window.loadStudentData();
    
    if ($("themeToggle")) $("themeToggle").onclick = () => { 
        var t = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
        window.applyTheme(t);
    };
    
    if ($("burgerBtn")) $("burgerBtn").onclick = () => { $("drawer").classList.toggle("open"); $("drawerOverlay").classList.toggle("open"); };
    if ($("drawerClose")) $("drawerClose").onclick = window.closeDrawer; 
    if ($("drawerOverlay")) $("drawerOverlay").onclick = window.closeDrawer;
    
    document.querySelectorAll("[data-go]").forEach(item => {
        item.onclick = (e) => { e.preventDefault(); location.hash = item.getAttribute("data-go"); window.closeDrawer(); };
    });
    
    window.renderUserChip(); window.route();
});
window.addEventListener("hashchange", window.route);