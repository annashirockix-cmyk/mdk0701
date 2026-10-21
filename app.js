"use strict";

window.$ = (id) => document.getElementById(id);
window.escapeHtml = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
window.el = (html) => { var div = document.createElement("div"); div.innerHTML = html.trim(); return div.firstChild; };
window.studentKey = (s) => { s = s || window.state.student; return s ? (s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase()) : null; };

window.showToast = function(msg, type) {
  var container = document.querySelector(".toast-container");
  if (!container) { container = document.createElement("div"); container.className = "toast-container"; document.body.appendChild(container); }
  var toast = document.createElement("div");
  toast.className = "toast " + (type || "");
  toast.innerHTML = (type === "ok" ? "✅ " : type === "err" ? "❌ " : "ℹ️ ") + window.escapeHtml(msg);
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add("out"); setTimeout(() => toast.remove(), 300); }, 3000);
};

window.state = {
  activeCourseId: "07.01",
  student: null, staff: null, xp: 0, results: {},
  purchasedThemes: [], unlockedAchievements: [], avatar: null, effect: null
};

try {
  window.state.activeCourseId = localStorage.getItem("mdk.active") || "07.01";
  var _s = JSON.parse(localStorage.getItem("mdk.student") || "null"); if (_s && _s.name) window.state.student = _s;
  var _st = JSON.parse(localStorage.getItem("mdk.staff") || "null"); if (_st && _st.name) window.state.staff = _st;
} catch (e) { console.warn("LocalStorage недоступен"); }

if (!window.MDK_DATA || !window.MDK_DATA[window.state.activeCourseId]) window.state.activeCourseId = "07.01";
window.COURSE = (window.MDK_DATA && window.MDK_DATA[window.state.activeCourseId]) || null;

window.getLevel = (xp) => !xp || xp <= 0 ? 1 : Math.min(Math.floor(Math.sqrt(xp / 100)) + 1, 100);

window.updateXpDisplay = function() {
  var el = window.$("xpCount"); if (!el) return;
  if (window.state.staff) {
      el.textContent = "👨‍🏫 Преподаватель";
  } else {
      el.textContent = "🌟 " + window.state.xp + " XP · Lv." + window.getLevel(window.state.xp);
  }
};

window.addXP = function(amount) {
  if (window.state.staff) return; 
  window.state.xp += amount;
  window.saveStudentData();
  window.showToast((amount > 0 ? "+" : "") + amount + " XP", amount > 0 ? "ok" : "err");
  if (window.checkAchievements) window.checkAchievements();
};

window.saveStudentData = function() {
  var k = window.studentKey(); if (!k) return;
  var ek = encodeURIComponent(k);
  try {
    localStorage.setItem("mdk.xp." + ek, window.state.xp);
    localStorage.setItem("mdk.results." + ek, JSON.stringify(window.state.results || {}));
    localStorage.setItem("mdk.shop." + ek, JSON.stringify({ 
        purchasedThemes: window.state.purchasedThemes || [], 
        unlockedAchievements: window.state.unlockedAchievements || [],
        avatar: window.state.avatar || null, effect: window.state.effect || null
    }));
  } catch (e) {}
  
  window.updateXpDisplay();
  if (window.API && window.API.saveStudent) {
    window.API.saveStudent(k, window.state.student.name, window.state.student.group,
      JSON.stringify({ xp: window.state.xp, results: window.state.results,
          purchasedThemes: window.state.purchasedThemes || [], unlockedAchievements: window.state.unlockedAchievements || [],
          avatar: window.state.avatar || null, effect: window.state.effect || null })
    ).catch(() => {});
  }
};

window.loadStudentData = function() {
  var k = window.studentKey(); if (!k) return;
  var ek = encodeURIComponent(k);
  try {
    window.state.xp = parseInt(localStorage.getItem("mdk.xp." + ek) || "0", 10);
    var r = localStorage.getItem("mdk.results." + ek); 
    window.state.results = r ? JSON.parse(r) : {};
    var s = localStorage.getItem("mdk.shop." + ek); 
    if(s) { 
        var sh = JSON.parse(s); 
        window.state.purchasedThemes = sh.purchasedThemes || []; 
        window.state.unlockedAchievements = sh.unlockedAchievements || [];
        window.state.avatar = sh.avatar || null; window.state.effect = sh.effect || null; 
    }
  } catch (e) {}
  window.updateXpDisplay();
  window.renderUserChip();
};

window.doStudentLogin = function() {
  var n = $("loginName").value.trim(); var g = $("loginGroup").value.trim();
  if (!n || !g) { window.showToast("Введите ФИО и Группу!", "err"); return; }
  window.state.student = { name: n, group: g.toUpperCase() }; window.state.staff = null;
  try { localStorage.setItem("mdk.student", JSON.stringify(window.state.student)); localStorage.removeItem("mdk.staff"); } catch(e){}
  window.renderUserChip(); window.loadStudentData(); window.route();
};

window.doTeacherLogin = function() {
  var u = $("teacherUser").value.trim(); var p = $("teacherPass").value.trim();
  var errEl = $("teacherLoginError");
  if (!u || !p) { errEl.textContent = "Введите логин и пароль"; errEl.style.display = "block"; return; }
  
  if ((u === "admin" && p === "admin") || (u === "teacher" && p === "teacher")) {
      window.state.staff = { name: u === "admin" ? "Администратор" : "Анна Анатольевна", role: u === "admin" ? "admin" : "teacher" };
      window.state.student = null;
      window.state.xp = 999999; 
      try { localStorage.setItem("mdk.staff", JSON.stringify(window.state.staff)); localStorage.removeItem("mdk.student"); } catch(e){}
      window.renderUserChip(); window.updateXpDisplay(); window.route();
  } else { errEl.textContent = "Неверный логин или пароль"; errEl.style.display = "block"; }
};

window.handleLogout = function() {
  if (!confirm("Выйти из системы?")) return;
  window.state.student = null; window.state.staff = null; window.state.xp = 0;
  try { localStorage.removeItem("mdk.student"); localStorage.removeItem("mdk.staff"); } catch(e){}
  if ($("loginName")) $("loginName").value = "";
  if ($("loginGroup")) $("loginGroup").value = "";
  window.closeDrawer(); window.route();
};

window.switchCourse = function(id) { 
    window.state.activeCourseId = id; window.COURSE = window.MDK_DATA[id] || null; window.route(); 
};

window.closeDrawer = function() { 
    if ($("drawer")) $("drawer").classList.remove("open"); 
    if ($("drawerOverlay")) $("drawerOverlay").classList.remove("open"); 
};

window.applyTheme = function(theme) { 
    document.documentElement.setAttribute("data-theme", theme); 
    try { localStorage.setItem("mdk.theme", theme); } catch(e){}
};

window.renderUserChip = function() {
  if (!$("userChipName")) return;
  if (window.state.staff) { 
      $("userChipName").textContent = window.state.staff.name; 
      $("userChipGroup").textContent = "Преподаватель"; 
      $("userChipAvatar").innerHTML = "👨‍🏫"; 
      return; 
  }
  if (!window.state.student) return;
  $("userChipName").textContent = window.state.student.name; 
  $("userChipGroup").textContent = "Гр. " + window.state.student.group;
  $("userChipAvatar").innerHTML = window.state.avatar ? `<img src="${window.state.avatar}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">` : "👨‍🎓";
};

// ================= РОУТЕР =================
window.route = function() {
  window.closeDrawer();
  var overlay = $("loginOverlay");
  var fab = document.getElementById("asFab");
  var isLoggedIn = !!(window.state.student || window.state.staff);

  if (!isLoggedIn) { 
      if (overlay) overlay.style.display = "block"; 
      if (fab) fab.style.display = "none";
      if ($("app")) $("app").innerHTML = ""; 
      return; 
  }

  if (overlay) overlay.style.display = "none";
  if (fab) fab.style.display = "flex";

  var hash = location.hash.replace(/^#/, "") || "/"; 
  var parts = hash.split("/").filter(Boolean);
  var app = $("app"); if (!app) return;

  try {
    var page = parts[0] || "/";
    
    if (page === "topic") window.renderTopic(parts[1], parts[2]);
    else if (page === "profile" && window.renderProfilePage) window.renderProfilePage();
    else if (page === "videos") window.renderSimplePage("Видеоуроки", window.GLOBAL_DATA?.videos, "🎬");
    else if (page === "passports") window.renderSimplePage("Паспорта станков", window.GLOBAL_DATA?.passports, "📄");
    else if (page === "safety") window.renderSimplePage("Охрана труда", window.GLOBAL_DATA?.safety, "🦺");
    else if (page === "formatting") window.renderSimplePage("Оформление работ", [{title: "Требования к оформлению", content: "Times New Roman 14, интервал 1.5."}], "📝");
    else if (page === "links" && window.renderLinksPage) window.renderLinksPage();
    else if (page === "training") { 
        if (window.state.activeCourseId === "02.01" && window.renderTraining_0201) window.renderTraining_0201(parts[1]); 
        else if (window.state.activeCourseId === "02.02" && window.renderTraining_0202) window.renderTraining_0202(parts[1]); 
        else if (window.state.activeCourseId === "04.01" && window.renderTraining_0401) window.renderTraining_0401(parts[1]); 
        else if (window.state.activeCourseId === "07.01" && window.renderTraining_0701) window.renderTraining_0701(parts[1]); 
    }
    else if (page === "final") { 
        if (window.state.activeCourseId === "02.01" && window.renderFinal_0201) window.renderFinal_0201(parts[1]); 
        else if (window.state.activeCourseId === "02.02" && window.renderFinal_0202) window.renderFinal_0202(parts[1]); 
        else if (window.state.activeCourseId === "04.01" && window.renderFinal_0401) window.renderFinal_0401(parts[1]); 
        else if (window.state.activeCourseId === "07.01" && window.renderFinal_0701) window.renderFinal_0701(parts[1]); 
    }
    else if (page === "arcade" && window.renderArcadePage) window.renderArcadePage();
    else if (page === "shop" && window.renderShopPage) window.renderShopPage();
    else if (page === "rating" && window.renderRatingPage) window.renderRatingPage();
    else if (page === "journal" && window.renderJournalPage) window.renderJournalPage();
    else if (page === "reports" && window.renderCourseReportsPage) window.renderCourseReportsPage();
    else if (page === "schedule" && window.renderSchedulePage) window.renderSchedulePage();
    else if (page === "achievements") window.renderAchievementsPage();
    else renderHome();
  } catch (err) { 
      app.innerHTML = '<div class="module" style="color:var(--err);">Ошибка: ' + window.escapeHtml(err.message) + '</div>'; 
  }
  window.scrollTo(0, 0);
};

// ================= РЕНДЕР ТЕМЫ (ИСПРАВЛЕНО) =================
window.renderTopic = function(topicId, activeTab) {
    var app = $("app"); if (!app) return; app.innerHTML = "";
    var topic = null;
    
    if (window.COURSE && window.COURSE.sections) {
        window.COURSE.sections.forEach(s => {
            s.topics.forEach(t => { if (t.id === topicId) topic = t; });
        });
    }

    if (!topic) { app.innerHTML = '<div class="module">Тема не найдена.</div>'; return; }

    app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
    app.appendChild(el(`<section class="hero"><span class="brand-badge">${topic.code}</span><h1>${topic.title}</h1></section>`));
    
    var tabs = [];
    if (topic.lectures && topic.lectures.length) tabs.push({ id: 'lectures', label: '📖 Лекции' });
    if (topic.practicals && topic.practicals.length) tabs.push({ id: 'practicals', label: '🛠 Практика' });
    if (topic.selfWork && topic.selfWork.length) tabs.push({ id: 'selfWork', label: '✍️ Самостоятельная' });
    if (topic.test && topic.test.length) tabs.push({ id: 'test', label: '📝 Тест' });
    if (topic.presentations && topic.presentations.length) tabs.push({ id: 'presentations', label: '📊 Презентации' });

    // Исправление: URL приходит как 'lecture', а ID вкладки 'lectures'
    if (!activeTab || activeTab === 'lecture') activeTab = 'lectures';
    if (activeTab === 'practical') activeTab = 'practicals';
    if (activeTab === 'test') activeTab = 'test';

    var tabHtml = '<div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap;">';
    tabs.forEach(t => {
        var activeClass = (t.id === activeTab) ? 'active' : '';
        tabHtml += `<button class="tab ${activeClass}" onclick="window.renderTopic('${topicId}', '${t.id}')">${t.label}</button>`;
    });
    tabHtml += '</div>';
    app.appendChild(el(tabHtml));

    var contentBox = el('<div class="module"></div>');
    app.appendChild(contentBox);

    if (activeTab === 'lectures' && topic.lectures) {
        topic.lectures.forEach(lec => {
            contentBox.innerHTML += `<h3>${lec.code} ${lec.title}</h3><div style="line-height:1.6; margin-bottom:30px;">${lec.content}</div>`;
        });
    } 
    else if (activeTab === 'practicals' && topic.practicals) {
        topic.practicals.forEach(p => {
            contentBox.innerHTML += `<div style="margin-bottom:20px; padding:15px; background:var(--card-soft); border-radius:8px; border:1px solid var(--border);">
                <h4 style="margin-top:0; color:var(--accent);">${p.code} ${p.title}</h4>
                <p><b>Цель:</b> ${p.goal}</p>
                <p><b>Задание:</b> ${p.task}</p>
                ${p.variants ? '<p><b>Варианты:</b></p><ul>' + p.variants.map(v => `<li>${v}</li>`).join('') + '</ul>' : ''}
            </div>`;
        });
    } 
    else if (activeTab === 'selfWork' && topic.selfWork) {
        topic.selfWork.forEach(sw => {
            contentBox.innerHTML += `<div style="margin-bottom:20px; padding:15px; background:var(--card-soft); border-radius:8px; border:1px solid var(--border);">
                <h4 style="margin-top:0; color:var(--accent);">${sw.code} ${sw.title}</h4>
                <p><b>Задание:</b> ${sw.task}</p>
                ${sw.questions ? '<p><b>Контрольные вопросы:</b></p><ul>' + sw.questions.map(q => `<li>${q}</li>`).join('') + '</ul>' : ''}
            </div>`;
        });
    } 
    else if (activeTab === 'test' && topic.test) {
        contentBox.innerHTML = `<p>В этой теме доступен тест для проверки знаний.</p>
            <div style="display:flex; gap:10px; margin-top:20px; flex-wrap:wrap;">
                <a href="#/training/${window.state.activeCourseId}" class="btn">🎯 Перейти к тренировке</a>
                <a href="#/final/${window.state.activeCourseId}" class="btn ghost">📋 Пройти экзамен</a>
            </div>`;
    } 
    else if (activeTab === 'presentations' && topic.presentations) {
        topic.presentations.forEach(p => {
            contentBox.innerHTML += `<div style="margin-bottom:15px; padding:15px; background:var(--card-soft); border-radius:8px;">
                <h4 style="margin-top:0;">${p.code} ${p.title}</h4>
                <p>${p.description}</p>
                <a href="${p.file}" download class="btn ghost" style="padding:6px 12px; font-size:12px;">Скачать (${p.slides} слайдов)</a>
            </div>`;
        });
    }
};

// ================= ДОСТИЖЕНИЯ =================
window.renderAchievementsPage = function() {
    var app = $("app"); if (!app) return; app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Достижения";
    app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
    app.appendChild(el('<section class="hero"><h1>🏆 Достижения</h1><p>Твои награды за усердную учебу</p></section>'));

    var achievements = [
        { id: "welcome", title: "Первый шаг", desc: "Войти в систему", icon: "🚪" },
        { id: "reader", title: "Книжный червь", desc: "Изучить первую лекцию", icon: "📖" },
        { id: "hacker", title: "Хакер", desc: "Пройти первый тест", icon: "💻" },
        { id: "gamer", title: "Геймер", desc: "Сыграть в мини-игру", icon: "🎮" },
        { id: "level_5", title: "Опытный", desc: "Достичь 5 уровня", icon: "⭐" },
        { id: "rich", title: "Богач", desc: "Накопить 1000 XP", icon: "💰" }
    ];

    var box = el('<div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:16px;"></div>');
    var unlocked = window.state.unlockedAchievements || [];
    
    achievements.forEach(a => {
        var isUnlocked = unlocked.includes(a.id) || (a.id === "welcome" && window.state.student);
        var opacity = isUnlocked ? "1" : "0.4";
        var filter = isUnlocked ? "none" : "grayscale(100%)";
        
        box.appendChild(el(`<div class="module" style="text-align:center; padding:20px; opacity:${opacity};">
            <div style="font-size:40px; margin-bottom:10px; filter:${filter};">${a.icon}</div>
            <h3 style="margin:0 0 5px 0; font-size:16px;">${a.title}</h3>
            <p style="font-size:12px; color:var(--muted); margin:0;">${a.desc}</p>
        </div>`));
    });
    app.appendChild(box);
};

window.renderSimplePage = function(title, items, icon) {
    var app = document.getElementById("app"); app.innerHTML = "";
    document.getElementById("crumbs").textContent = title;
    app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
    app.appendChild(el(`<section class="hero"><h1>${icon} ${title}</h1></section>`));
    var list = el(`<div class="module"></div>`);
    
    if (!items || !items.length) {
        list.innerHTML = "<p>Материалы пока не добавлены.</p>";
    } else {
        items.forEach(item => {
            list.innerHTML += `<div style="margin-bottom:10px; padding:15px; border:1px solid var(--border); border-radius:8px; background:var(--card-soft);">
                <b style="color:var(--accent); font-size:16px;">${item.title || 'Без названия'}</b><br>
                <span style="font-size:14px; color:var(--muted);">${item.description || item.content || ''}</span>
                ${item.file ? `<br><a href="${item.file}" target="_blank" class="btn" style="margin-top:8px; padding:6px 12px; font-size:12px;">📥 Открыть файл</a>` : ''}
            </div>`;
        });
    }
    app.appendChild(list);
};

function renderHome() {
  var app = $("app"); app.innerHTML = "";
  var c = window.COURSE;
  if (!c) { app.innerHTML = "<div class='module'>Ошибка загрузки данных курса.</div>"; return; }
  
  var html = '<section class="hero"><h1>' + window.escapeHtml(c.title) + '</h1><p>' + window.escapeHtml(c.module || "") + '</p></section>';
  html += '<div class="steps-title">Учебный план</div>';
  
  (c.sections || []).forEach(sec => {
    html += '<div style="font-weight:bold; margin:20px 0 10px; color:var(--accent); text-transform:uppercase; font-size:12px;">' + window.escapeHtml(sec.title) + '</div>';
    (sec.topics || []).forEach(t => {
      var badges = []; 
      if (t.lectures) badges.push("📖"); if (t.practicals) badges.push("🛠"); if (t.test) badges.push("📝");
      html += `<div class="topic" onclick="location.hash='#/topic/${t.id}/lecture'">
        <div style="flex:1;">
            <div style="font-size:12px; color:var(--muted);">${t.code}</div>
            <div style="font-weight:bold;">${t.title}</div>
            <div style="font-size:13px; margin-top:4px; color:var(--muted);">${badges.join(" ")}</div>
        </div>
      </div>`;
    });
  });
  app.innerHTML = html;
}

window.addEventListener("DOMContentLoaded", function() {
  var savedTheme = "dark";
  try { savedTheme = localStorage.getItem("mdk.theme") || "dark"; } catch(e){}
  document.documentElement.setAttribute("data-theme", savedTheme);

  if ($("btnLoginStudent")) $("btnLoginStudent").onclick = window.doStudentLogin;
  if ($("btnLoginTeacher")) $("btnLoginTeacher").onclick = window.doTeacherLogin;
  
  if ($("themeToggle")) {
      $("themeToggle").onclick = () => { 
          var cur = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light"; 
          window.applyTheme(cur); 
      };
  }
  
  if ($("burgerBtn")) $("burgerBtn").onclick = () => { $("drawer").classList.toggle("open"); $("drawerOverlay").classList.toggle("open"); };
  if ($("drawerClose")) $("drawerClose").onclick = window.closeDrawer;
  if ($("drawerOverlay")) $("drawerOverlay").onclick = window.closeDrawer;
  
  if ($("mdkSelector")) { 
      $("mdkSelector").value = window.state.activeCourseId; 
      $("mdkSelector").onchange = (e) => window.switchCourse(e.target.value); 
  }
  
  document.querySelectorAll("[data-go]").forEach(item => { 
      item.onclick = (e) => { 
          e.preventDefault(); 
          var target = item.getAttribute("data-go");
          if(location.hash === target) {
              window.route(); 
          } else {
              location.hash = target; 
          }
          window.closeDrawer(); 
      }; 
  });

  window.renderUserChip(); 
  if (window.state.student) window.loadStudentData();
  window.route();
});

window.addEventListener("hashchange", window.route);
