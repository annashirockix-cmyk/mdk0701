"use strict";

// --- БАЗОВЫЕ ФУНКЦИИ ---
window.$ = (id) => document.getElementById(id);
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

// --- СОСТОЯНИЕ ---
window.state = { 
  activeCourseId: localStorage.getItem("mdk.active") || "07.01",
  student: null, 
  staff: null, 
  xp: 0, results: {}
};

if (!window.MDK_DATA[window.state.activeCourseId]) {
    window.state.activeCourseId = "07.01";
    localStorage.setItem("mdk.active", "07.01");
}
window.COURSE = window.MDK_DATA[window.state.activeCourseId];

try { 
    var _s = JSON.parse(localStorage.getItem("mdk.student") || "null"); 
    if (_s && _s.name) window.state.student = _s; 
    var _st = JSON.parse(localStorage.getItem("mdk.staff") || "null");
    if (_st && _st.name) window.state.staff = _st;
} catch (e){}

window.getLevel = function(xp) { return !xp || xp <= 0 ? 1 : Math.min(Math.floor(Math.sqrt(xp / 100)) + 1, 100); };
window.getLevelTitle = function(lvl) { return "Уровень " + lvl; };

window.updateXpDisplay = function() { 
    if (window.$("xpCount")) {
        if (window.state.staff) {
            window.$("xpCount").textContent = "👨‍🏫 " + window.state.staff.name;
        } else {
            window.$("xpCount").textContent = "🌟 " + window.state.xp + " XP · Lv." + window.getLevel(window.state.xp);
        }
    }
};

window.saveStudentData = function() {
    var k = window.studentKey(); if (!k) return;
    var ek = encodeURIComponent(k);
    try {
        localStorage.setItem("mdk.xp." + ek, window.state.xp);
        localStorage.setItem("mdk.results." + ek, JSON.stringify(window.state.results || {}));
    } catch(e){}
    window.updateXpDisplay();
    if (window.API) window.API.saveStudent(k, window.state.student.name, window.state.student.group, JSON.stringify({ xp: window.state.xp, results: window.state.results })).catch(()=>{});
};

window.loadStudentData = function() {
    var k = window.studentKey(); if (!k) return;
    var ek = encodeURIComponent(k);
    try {
        window.state.xp = parseInt(localStorage.getItem("mdk.xp." + ek) || "0", 10);
        var r = localStorage.getItem("mdk.results." + ek);
        window.state.results = r ? JSON.parse(r) : {};
    } catch(e) {}
    window.updateXpDisplay();
};

window.addXP = function(amount) {
    window.state.xp += amount;
    window.saveStudentData();
    window.showToast("+" + amount + " XP", "ok");
};

// --- АВТОРИЗАЦИЯ ---
window.doStudentLogin = function() {
  var n = document.getElementById("loginName").value.trim();
  var g = document.getElementById("loginGroup").value.trim();
  
  if (!n || !g) return window.showToast("Введите ФИО и Группу!", "err");
  
  window.state.student = { name: n, group: g.toUpperCase() };
  window.state.staff = null;
  try { 
      localStorage.setItem("mdk.student", JSON.stringify(window.state.student)); 
      localStorage.removeItem("mdk.staff");
  } catch(e){}
  
  document.getElementById("loginOverlay").hidden = true;
  window.renderUserChip(); 
  window.loadStudentData(); 
  window.route();
};

window.doTeacherLogin = function() {
    var u = document.getElementById("teacherUser").value.trim();
    var p = document.getElementById("teacherPass").value.trim();
    var errBox = document.getElementById("teacherLoginError");
    var btn = document.getElementById("teacherLoginBtn");
    
    if (!u || !p) {
        errBox.textContent = "Введите логин и пароль!";
        errBox.style.display = "block";
        return;
    }

    errBox.style.display = "none";
    btn.textContent = "Проверка (ждем ответ от Google)...";
    btn.disabled = true;

    window.API.login(u, p).then(function(res) {
        btn.textContent = "Войти в журнал";
        btn.disabled = false;
        
        if (res && res.ok) {
            window.state.staff = { name: res.name, role: res.role };
            window.state.student = null;
            try { 
                localStorage.setItem("mdk.staff", JSON.stringify(window.state.staff));
                localStorage.removeItem("mdk.student");
            } catch(e){}
            
            document.getElementById("loginOverlay").hidden = true;
            window.showToast("Добро пожаловать, " + res.name, "ok");
            window.renderUserChip();
            window.updateXpDisplay();
            window.route();
        } else {
            errBox.textContent = res.error || "Неверный логин или пароль";
            errBox.style.display = "block";
        }
    }).catch(function(err) {
        btn.textContent = "Войти в журнал";
        btn.disabled = false;
        errBox.textContent = "Ошибка сети. Проверьте интернет или Google Скрипт.";
        errBox.style.display = "block";
    });
};

window.handleLogout = function() {
  if (confirm("Выйти из аккаунта?")) {
    window.state.student = null;
    window.state.staff = null;
    try { 
        localStorage.removeItem("mdk.student"); 
        localStorage.removeItem("mdk.staff");
    } catch(e){}
    document.getElementById("loginOverlay").hidden = false;
    window.closeDrawer(); 
    window.route();
  }
};

window.switchCourse = function(id) {
    try { localStorage.setItem("mdk.active", id); } catch(e){}
    location.reload();
};

window.closeDrawer = () => { if(window.$("drawer")) window.$("drawer").classList.remove("open"); if(window.$("drawerOverlay")) window.$("drawerOverlay").classList.remove("open"); };
window.applyTheme = (theme) => { document.documentElement.setAttribute("data-theme", theme); try { localStorage.setItem("mdk.theme", theme); } catch(e){} };

window.renderUserChip = function() {
    if (window.state.staff) {
        window.$("userChipName").textContent = window.state.staff.name;
        window.$("userChipGroup").textContent = "Преподаватель";
        window.$("userChipAvatar").innerHTML = "👨‍🏫";
        return;
    }
    if (!window.state.student) return;
    window.$("userChipName").textContent = window.state.student.name;
    window.$("userChipGroup").textContent = "Гр. " + window.state.student.group;
    window.$("userChipAvatar").innerHTML = "👨‍🎓";
};

// --- РЕНДЕРИНГ СТРАНИЦ ---
function renderHome() {
    var app = window.$("app"); app.innerHTML = "";
    var c = window.COURSE;
    if (!c) return app.innerHTML = "<div class='module'>Ошибка: Данные курса не загружены.</div>";

    var html = `<section class="hero"><h1>${c.title}</h1><p>${c.module}</p></section>`;
    
    html += '<div class="steps-title">Учебный план</div>';
    if (c.sections && c.sections.length > 0) {
        c.sections.forEach(sec => {
            html += `<div style="font-weight:bold; margin:20px 0 10px; color:var(--accent); text-transform:uppercase; font-size:12px;">${sec.title}</div>`;
            sec.topics.forEach(t => {
                var isDone = window.state.results[t.id];
                html += `<div class="topic" onclick="location.hash='#/topic/${t.id}/lecture'"><span style="margin-right:15px; font-size:20px;">${isDone ? '✅' : '📖'}</span><div><div style="font-size:12px; color:var(--muted);">${t.code}</div><div style="font-weight:bold;">${t.title}</div></div></div>`;
            });
        });
    } else {
        html += "<p>Темы для этого предмета пока не добавлены.</p>";
    }

    html += '<div style="display:flex;gap:10px;margin-top:24px;flex-wrap:wrap;">'
         + '<a class="btn ghost" href="#/training" style="flex:1;text-align:center;min-width:140px;">🎯 Тренировка</a>'
         + '<a class="btn" href="#/final" style="flex:1;text-align:center;min-width:140px;">📋 Экзамены</a>'
         + '</div>';

    app.innerHTML = html;
}

window.renderTopic = function(id, tab){
  tab = tab || "lecture"; 
  var c = window.COURSE; var t = null;
  if (c && c.sections) {
      for (var i = 0; i < c.sections.length; i++) { 
          for (var j = 0; j < c.sections[i].topics.length; j++) { 
              if (c.sections[i].topics[j].id === id) { t = c.sections[i].topics[j]; break; } 
          } if (t) break; 
      }
  }
  if(!t) return renderHome();

  var app = window.$("app"); 
  var html = `<a class="backlink" href="#/" style="color:var(--accent);">← К программе</a><section class="topic-head"><h1>${t.title}</h1></section>`;
  
  html += '<div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap;">';
  [["lecture","01 Лекция"],["practice","02 Практика"],["test","03 Тест"]].forEach(item => { 
      html += `<button class="tab ${item[0] === tab ? 'active' : ''}" onclick="location.hash='#/topic/${id}/${item[0]}'">${item[1]}</button>`; 
  });
  html += '</div>'; 
  
  var panelHtml = "";

  if (tab === "lecture" && t.lectures) {
    t.lectures.forEach(l => { panelHtml += `<h3>${l.code}. ${l.title}</h3><div class="lecture-content" style="margin-bottom:20px;">${l.content}</div>`; });
    panelHtml += `<button class="btn" id="markDoneBtn" style="width:100%;margin-top:20px;">Отметить как изученное (+50 XP)</button>`;
  }
  
  if (tab === "practice" && t.practicals) {
    t.practicals.forEach(p => {
      panelHtml += `<div style="margin-bottom:20px; padding:20px; border:1px solid var(--border); border-radius:8px;">
          <h4>${p.code}. ${p.title}</h4>
          <p><b>Цель:</b> ${p.goal || ''}</p>
          <p><b>Задание:</b> ${p.task || ''}</p>`;
      if (p.variants && p.variants.length) {
        panelHtml += "<p><b>Варианты:</b></p><ul>" + p.variants.map(function(v){ return "<li>"+v+"</li>"; }).join("") + "</ul>";
      }
      panelHtml += `</div>`;
    });
  }

  if (tab === "test" && t.test) {
      t.test.forEach((q, qi) => { 
          panelHtml += `<div class="question"><div class="q-text">${qi+1}. ${q.q}</div>`; 
          q.options.forEach((opt, oi) => { panelHtml += `<label class="option"><input type="radio" name="q${qi}" value="${oi}"><span>${opt}</span></label>`; }); 
          panelHtml += `</div>`; 
      });
      panelHtml += `<button class="btn" id="finishTestBtn" style="width:100%;margin-top:10px;">Завершить</button>`;
  }

  app.innerHTML = html + `<section class="panel module">${panelHtml}</section>`;

  if (tab === "lecture") {
      var markBtn = document.getElementById("markDoneBtn");
      if (markBtn) markBtn.onclick = function() { window.addXP(50); markBtn.textContent = "✅ Изучено"; markBtn.disabled = true; }; 
  }
  if (tab === "test") {
      var finishBtn = document.getElementById("finishTestBtn");
      if (finishBtn) finishBtn.onclick = function() {
        var correct = 0; 
        t.test.forEach((q, qi) => { var ch = document.querySelector(`input[name="q${qi}"]:checked`); if (ch && Number(ch.value) === q.correct) correct++; });
        finishBtn.disabled = true; finishBtn.textContent = "Завершено";
        var grade = Math.max(2, Math.round((correct / t.test.length) * 5)); 
        window.state.results[id] = { grade: grade }; window.addXP(100);
        window.showToast("Оценка: " + grade, "ok"); 
        window.saveStudentData();
      };
  }
};

window.renderProfilePage = function() {
    var app = window.$("app");
    if (window.state.staff) {
        app.innerHTML = `<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a><section class="hero"><h1>Профиль преподавателя</h1></section>
        <div class="module"><p><b>Имя:</b> ${window.state.staff.name}</p>
        <p><b>Роль:</b> ${window.state.staff.role === 'admin' ? 'Администратор' : 'Преподаватель'}</p>
        <p><a href="#/journal" class="btn" style="margin-top:10px;">📒 Перейти в журнал успеваемости</a></p></div>`;
        return;
    }
    app.innerHTML = `<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a><section class="hero"><h1>Личный кабинет</h1></section>
    <div class="module"><p><b>ФИО:</b> ${window.state.student ? window.state.student.name : 'Гость'}</p>
    <p><b>Группа:</b> ${window.state.student ? window.state.student.group : '—'}</p>
    <p><b>XP:</b> ${window.state.xp} (Уровень ${window.getLevel(window.state.xp)})</p></div>`;
};

window.renderSimplePage = function(title, items, icon) {
    var app = window.$("app"); var list = "";
    (items || []).forEach(s => { list += `<div style="padding:10px 0; border-bottom:1px solid var(--border);"><b>${s.title || s}</b></div>`; });
    app.innerHTML = `<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a><section class="hero"><h1>${icon} ${title}</h1></section><div class="module">${list || 'Нет данных'}</div>`;
};

// --- РОУТЕР ---
window.route = function() {
    window.closeDrawer();
    var hash = location.hash.replace(/^#/, "") || "/", parts = hash.split("/").filter(Boolean), app = window.$("app");
    if (!app) return;
    
    if (!window.state.student && !window.state.staff) { 
        if(window.$("loginOverlay")) window.$("loginOverlay").hidden = false;
        app.innerHTML = "<div class='module' style='text-align:center;'><h2>Войдите в систему</h2></div>"; 
        return; 
    }

    try {
        if (parts[0] === "topic") window.renderTopic(parts[1], parts[2]);
        else if (parts[0] === "profile") window.renderProfilePage();
        else if (parts[0] === "videos") window.renderSimplePage("Видео", window.COURSE.videos, "🎬");
        else if (parts[0] === "passports") window.renderSimplePage("Паспорта", window.COURSE.passports, "📄");
        else if (parts[0] === "safety") window.renderSimplePage("Охрана труда", window.COURSE.safety, "🦺");
        else if (parts[0] === "formatting") window.renderSimplePage("Оформление", window.COURSE.formatting ? [window.COURSE.formatting.title] : [], "📝");
        else if (parts[0] === "links" && window.renderLinksPage) window.renderLinksPage();
        else if (parts[0] === "training" && window.renderTrainingPage) window.renderTrainingPage(parts[1]);
        else if (parts[0] === "final" && window.renderFinalPage) window.renderFinalPage(parts[1]);
        else if (parts[0] === "arcade" && window.renderArcadePage) window.renderArcadePage();
        else if (parts[0] === "rating" && window.renderRatingPage) window.renderRatingPage();
        else if (parts[0] === "journal" && window.renderJournalPage) window.renderJournalPage();
        else if (parts[0] === "schedule" && window.renderSchedulePage) window.renderSchedulePage();
        else renderHome();
    } catch (err) { app.innerHTML = '<div class="module">Ошибка: ' + window.escapeHtml(err.message) + '</div>'; }
    window.scrollTo(0, 0);
};

// --- ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ---
window.addEventListener("DOMContentLoaded", () => {
    if (!window.state.student && !window.state.staff) window.$("loginOverlay").hidden = false;
    if (window.state.student) window.loadStudentData();
    if (window.state.staff) window.updateXpDisplay();

    if (window.$("themeToggle")) window.$("themeToggle").onclick = () => { var t = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light"; window.applyTheme(t); };
    if (window.$("burgerBtn")) window.$("burgerBtn").onclick = () => { window.$("drawer").classList.toggle("open"); window.$("drawerOverlay").classList.toggle("open"); };
    if (window.$("drawerClose")) window.$("drawerClose").onclick = window.closeDrawer; 
    if (window.$("drawerOverlay")) window.$("drawerOverlay").onclick = window.closeDrawer;
    if (window.$("topbarLogout")) window.$("topbarLogout").onclick = window.handleLogout;
    
    if (window.$("mdkSelector")) {
        window.$("mdkSelector").value = window.state.activeCourseId;
        window.$("mdkSelector").onchange = function(e) { window.switchCourse(e.target.value); };
    }
    
    document.querySelectorAll("[data-go]").forEach(item => {
        item.onclick = (e) => { e.preventDefault(); location.hash = item.getAttribute("data-go"); window.closeDrawer(); };
    });
    
    window.renderUserChip(); 
    window.route();
});
window.addEventListener("hashchange", window.route);