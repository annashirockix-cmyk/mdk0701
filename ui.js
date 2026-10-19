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

window.updateXpDisplay = function() { if ($("xpCount")) $("xpCount").textContent = "🌟 " + state.xp + " XP · Lv." + getLevel(state.xp); };
window.renderUserChip = function() {
    if (!state.student && !state.staff) return;
    if (state.staff) {
        $("userChipName").textContent = state.staff.name;
        $("userChipGroup").textContent = "Учитель";
        $("userChipAvatar").innerHTML = "👨‍🏫";
    } else {
        var vipHtml = state.isPremium ? '<span class="vip-badge">VIP</span>' : '';
        $("userChipName").innerHTML = escapeHtml(state.student.name) + vipHtml;
        $("userChipGroup").textContent = "Гр. " + state.student.group;
        var avHtml = state.avatar ? '<img src="' + state.avatar + '" style="width:100%;height:100%;object-fit:cover;">' : "👨‍🎓";
        $("userChipAvatar").innerHTML = '<div class="av-container" style="width:100%; height:100%; font-size:24px;">' + avHtml + '</div>';
    }
    // Показ VIP кнопок
    if ($("navVipDash")) $("navVipDash").style.display = state.isPremium ? "flex" : "none";
    if ($("navVipCheats")) $("navVipCheats").style.display = state.isPremium ? "flex" : "none";
};

window.closeDrawer = () => { $("drawer").classList.remove("open"); $("drawerOverlay").classList.remove("open"); };
window.applyTheme = (theme) => { document.documentElement.setAttribute("data-theme", theme); localStorage.setItem("mdk.theme", theme); document.body.className = document.body.className.replace(/bg-\S+/g, ''); };

// --- ГЛАВНАЯ ---
function renderHome() {
    var app = $("app"); app.innerHTML = "";
    var c = window.COURSE;
    app.appendChild(el(`<section class="hero"><h1>${c.title}</h1><p>${c.module}</p></section>`));
    
    if (state.student && !state.isPremium) {
        app.appendChild(el(`
            <div class="module" style="background: linear-gradient(135deg, #2c3e50, #000); color: #fff; border: 1px solid #ffd700; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
                <div><h3 style="margin: 0; color: #ffd700;">👑 Станьте VIP-Оператором</h3><p style="margin: 5px 0 0; font-size: 14px; opacity: 0.8;">x2 опыта, аналитика, чит-лист!</p></div>
                <button class="btn" onclick="location.hash='#/subscription'" style="background: #ffd700; color: #000; font-weight: bold;">Подробнее</button>
            </div>
        `));
    }

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

// --- ТЕМЫ ---
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
    if(t.lectures) t.lectures.forEach(l => { 
        panel.appendChild(el(`<h3>${l.code}. ${l.title}</h3><div class="lecture-content">${l.content}</div>`)); 
    });
    var markBtn = el('<button class="btn" style="width:100%;margin-top:20px;">Отметить как изученное (+50 XP)</button>');
    markBtn.onclick = function() { window.addXP(50); markBtn.textContent = "✅ Тема изучена"; markBtn.disabled = true; }; 
    panel.appendChild(markBtn);
  }
  
  if (tab === "practice") {
    if(t.practicals) t.practicals.forEach(p => {
        panel.appendChild(el(`<div style="margin-bottom:20px; padding:20px; border:1px solid var(--border); border-radius:8px;"><h4>${p.code}. ${p.title}</h4><p><b>Цель:</b> ${p.goal}</p><button class="btn ghost">Сдать работу</button></div>`));
    });
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
        state.results[id] = { grade: grade }; 
        window.addXP(100); window.saveStudentData();
        window.showToast("Оценка: " + grade, "ok"); 
      };
  }
};

// --- ВОССТАНОВЛЕННЫЕ СТРАНИЦЫ ---
window.renderSchedulePage = function() {
    var app = $("app"); app.innerHTML = "";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>Расписание</h1></section>'));
    app.appendChild(el('<div class="module"><p>Пн: 08:30 - 10:00 (204)</p><p>Ср: 12:30 - 14:00 (Цех)</p></div>'));
};

window.renderVideosPage = function() {
    var app = $("app"); app.innerHTML = "";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>Видеоматериалы</h1></section>'));
    var list = el('<div class="module"></div>');
    (window.COURSE.videos || []).forEach(v => {
        list.appendChild(el(`<div style="padding:10px 0; border-bottom:1px solid var(--border); display:flex; justify-content:space-between;"><span>${v.title}</span><button class="btn ghost" onclick="window.showToast('Видео недоступно в демо', 'info')">Смотреть</button></div>`));
    });
    app.appendChild(list);
};

window.renderVipMaterialsPage = function() {
    var app = $("app"); app.innerHTML = "";
    if (!state.isPremium) { app.appendChild(el('<div class="module">Доступно только VIP</div>')); return; }
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>📚 База знаний VIP</h1></section>'));
    app.appendChild(el('<div class="module"><p>Чертежи, 3D модели и примеры УП доступны для скачивания.</p></div>'));
};

window.renderSubscriptionPage = function() {
    var app = $("app"); app.innerHTML = "";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    
    if (state.isPremium) {
        app.appendChild(el(`<section class="premium-card" style="text-align:center; padding:40px;"><h1>👑 VIP Активен</h1><p>Действует до: ${new Date(state.premiumUntil).toLocaleDateString()}</p><button class="btn" onclick="window.cancelPremium()">Отменить</button></section>`));
        return;
    }

    app.appendChild(el(`
        <section class="premium-card" style="padding:40px;">
            <h1 style="color:#ffd700; margin-top:0;">Станьте VIP-Оператором!</h1>
            <ul class="premium-feature-list">
                <li>🔥 x2 Опыта за все действия</li>
                <li>🕵️ Чит-лист (ответы на тесты)</li>
                <li>📊 Аналитика успеваемости</li>
                <li>📄 PRO Резюме для работы</li>
            </ul>
            <button class="btn" id="buyPremiumBtn" style="background:#ffd700; color:#000; width:100%; max-width:300px; margin-top:20px;">Оформить за 299 ₽</button>
        </section>
    `));

    document.getElementById("buyPremiumBtn").onclick = function() {
        state.isPremium = true;
        state.premiumUntil = Date.now() + (30 * 24 * 60 * 60 * 1000);
        window.saveStudentData(); window.renderUserChip(); window.renderSubscriptionPage();
        window.showToast("VIP успешно оформлен!", "ok");
    };
};

window.cancelPremium = function() {
    if(confirm("Отменить VIP?")) {
        state.isPremium = false; window.saveStudentData(); window.renderUserChip(); window.renderSubscriptionPage();
    }
};

window.renderVipCheatsPage = function() {
    var app = $("app"); app.innerHTML = "";
    if (!state.isPremium) { app.appendChild(el('<div class="module">Доступно только VIP</div>')); return; }
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>🕵️ Чит-лист</h1></section>'));
    var list = el('<div class="module"></div>');
    window.COURSE.sections.forEach(s => s.topics.forEach(t => {
        if (t.test) {
            list.appendChild(el(`<h3>${t.title}</h3>`));
            t.test.forEach((q,i) => {
                list.appendChild(el(`<div style="margin-bottom:10px;"><b>${q.q}</b><br><span style="color:var(--ok)">✔ ${q.options[q.correct]}</span></div>`));
            });
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
            <p><b>Группа:</b> ${escapeHtml(state.student.group)}</p>
            <p><b>Курс:</b> ${window.COURSE.title}</p>
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

// --- РОУТЕР ---
window.route = function() {
    closeDrawer();
    var hash = location.hash.replace(/^#/, "") || "/", parts = hash.split("/").filter(Boolean), app = $("app");
    if (!app) return;
    if (!state.student && !state.staff) { app.innerHTML = ""; return; }
    try {
        if (parts[0] === "topic") renderTopic(parts[1], parts[2]);
        else if (parts[0] === "profile") window.renderProfilePage();
        else if (parts[0] === "subscription") window.renderSubscriptionPage();
        else if (parts[0] === "vip-materials") window.renderVipMaterialsPage();
        else if (parts[0] === "vip-cheats") window.renderVipCheatsPage();
        else if (parts[0] === "portfolio") window.renderPortfolioPage();
        else if (parts[0] === "videos") window.renderVideosPage();
        else if (parts[0] === "schedule") window.renderSchedulePage();
        else if (parts[0] === "arcade") window.renderArcadePage();
        else if (parts[0] === "gcode-test") window.renderGCodeTestPage();
        else if (parts[0] === "final") window.renderFinalExamPage();
        else renderHome();
    } catch (err) { app.innerHTML = '<div class="module">Ошибка: ' + escapeHtml(err.message) + '</div>'; }
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