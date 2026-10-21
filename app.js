"use strict";

window.$ = (id) => document.getElementById(id);
window.escapeHtml = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
window.el = (html) => { var div = document.createElement("div"); div.innerHTML = html.trim(); return div.firstChild; };
window.studentKey = (s) => { s = s || window.state.student; return s ? (s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase()) : null; };

// --- УВЕДОМЛЕНИЯ ---
window.showToast = function(msg, type) {
  var container = document.querySelector(".toast-container");
  if (!container) { container = document.createElement("div"); container.className = "toast-container"; document.body.appendChild(container); }
  var toast = document.createElement("div");
  toast.className = "toast " + (type || "");
  toast.innerHTML = (type === "ok" ? "✅ " : type === "err" ? "❌ " : "ℹ️ ") + window.escapeHtml(msg);
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add("out"); setTimeout(() => toast.remove(), 300); }, 3000);
};

// --- СОСТОЯНИЕ ---
window.state = {
  activeCourseId: localStorage.getItem("mdk.active") || "07.01",
  student: null, staff: null, xp: 0, results: {},
  purchasedThemes: [], unlockedAchievements: [], avatar: null, effect: null
};

// Проверка наличия данных курса
if (!window.MDK_DATA || !window.MDK_DATA[window.state.activeCourseId]) {
    window.state.activeCourseId = "07.01";
}
window.COURSE = (window.MDK_DATA && window.MDK_DATA[window.state.activeCourseId]) || null;

// Восстановление сессии
try {
  var _s = JSON.parse(localStorage.getItem("mdk.student") || "null"); if (_s && _s.name) window.state.student = _s;
  var _st = JSON.parse(localStorage.getItem("mdk.staff") || "null"); if (_st && _st.name) window.state.staff = _st;
} catch (e) {}

// --- УРОВЕНЬ И ОПЫТ ---
window.getLevel = (xp) => !xp || xp <= 0 ? 1 : Math.min(Math.floor(Math.sqrt(xp / 100)) + 1, 100);

window.updateXpDisplay = function() {
  var el = window.$("xpCount"); if (!el) return;
  if (window.state.staff) el.textContent = "👨‍🏫 " + window.state.staff.name;
  else el.textContent = "🌟 " + window.state.xp + " XP · Lv." + window.getLevel(window.state.xp);
};

window.addXP = function(amount) {
  window.state.xp += amount;
  window.saveStudentData();
  window.showToast((amount > 0 ? "+" : "") + amount + " XP", amount > 0 ? "ok" : "err");
  if (window.checkAchievements) window.checkAchievements();
};

// --- СОХРАНЕНИЕ / ЗАГРУЗКА ДАННЫХ СТУДЕНТА ---
window.saveStudentData = function() {
  var k = window.studentKey(); if (!k) return;
  var ek = encodeURIComponent(k);
  try {
    localStorage.setItem("mdk.xp." + ek, window.state.xp);
    localStorage.setItem("mdk.results." + ek, JSON.stringify(window.state.results || {}));
    localStorage.setItem("mdk.shop." + ek, JSON.stringify({ 
        purchasedThemes: window.state.purchasedThemes || [], 
        unlockedAchievements: window.state.unlockedAchievements || [],
        avatar: window.state.avatar || null,
        effect: window.state.effect || null
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
  
  // Загрузка из локального хранилища (для мгновенного отображения)
  try {
    window.state.xp = parseInt(localStorage.getItem("mdk.xp." + ek) || "0", 10);
    var r = localStorage.getItem("mdk.results." + ek); 
    window.state.results = r ? JSON.parse(r) : {};
    var s = localStorage.getItem("mdk.shop." + ek); 
    if(s) { 
        var sh = JSON.parse(s); 
        window.state.purchasedThemes = sh.purchasedThemes || []; 
        window.state.unlockedAchievements = sh.unlockedAchievements || [];
        window.state.avatar = sh.avatar || null; 
        window.state.effect = sh.effect || null; 
    }
  } catch (e) {}
  
  window.updateXpDisplay();

  // Синхронизация с сервером (если доступен)
  if (window.API && window.API.getStudentData) {
      window.API.getStudentData(k).then(res => {
          if (res && res.ok && res.payload) {
              try {
                  var p = JSON.parse(res.payload);
                  if (p.purchasedThemes) window.state.purchasedThemes = p.purchasedThemes;
                  if (p.unlockedAchievements) window.state.unlockedAchievements = p.unlockedAchievements;
                  if (p.xp !== undefined) window.state.xp = p.xp;
                  if (p.avatar) window.state.avatar = p.avatar;
                  if (p.effect) window.state.effect = p.effect;
                  window.saveStudentData(); // Сохраняем локально обновленные данные
              } catch(e){}
          }
          window.updateXpDisplay();
          window.renderUserChip();
          if (window.checkAchievements) window.checkAchievements();
      }).catch(() => {});
  }
};

// --- АВТОРИЗАЦИЯ ---
window.doStudentLogin = function() {
  var n = $("loginName").value.trim(); 
  var g = $("loginGroup").value.trim();
  
  if (!n || !g) { window.showToast("Введите ФИО и Группу!", "err"); return; }
  
  window.state.student = { name: n, group: g.toUpperCase() }; 
  window.state.staff = null;
  
  localStorage.setItem("mdk.student", JSON.stringify(window.state.student)); 
  localStorage.removeItem("mdk.staff");
  
  $("loginOverlay").style.display = "none"; 
  window.renderUserChip(); 
  window.loadStudentData(); 
  window.route();
};

window.doTeacherLogin = function() {
  var u = $("teacherUser").value.trim(); 
  var p = $("teacherPass").value.trim();
  var errEl = $("teacherLoginError");
  
  if (!u || !p) { errEl.textContent = "Введите логин и пароль"; errEl.style.display = "block"; return; }
  
  if ((u === "admin" && p === "admin") || (u === "teacher" && p === "teacher")) {
      window.state.staff = { name: u === "admin" ? "Администратор" : "Анна Анатольевна", role: u === "admin" ? "admin" : "teacher" };
      window.state.student = null;
      
      localStorage.setItem("mdk.staff", JSON.stringify(window.state.staff)); 
      localStorage.removeItem("mdk.student");
      
      $("loginOverlay").style.display = "none"; 
      window.renderUserChip(); 
      window.updateXpDisplay(); 
      window.route();
  } else { 
      errEl.textContent = "Неверный логин или пароль"; 
      errEl.style.display = "block"; 
  }
};

window.handleLogout = function() {
  if (!confirm("Выйти из системы?")) return;
  window.state.student = null; 
  window.state.staff = null;
  localStorage.removeItem("mdk.student"); 
  localStorage.removeItem("mdk.staff");
  
  $("loginOverlay").style.display = "flex"; // Показываем окно входа
  $("app").innerHTML = ""; // Очищаем контент
  window.closeDrawer(); 
  window.route();
};

// --- ИНТЕРФЕЙС И ТЕМЫ ---
window.switchCourse = function(id) { 
    localStorage.setItem("mdk.active", id); 
    window.state.activeCourseId = id; 
    window.COURSE = window.MDK_DATA[id] || null; 
    window.route(); 
};

window.closeDrawer = function() { 
    if ($("drawer")) $("drawer").classList.remove("open"); 
    if ($("drawerOverlay")) $("drawerOverlay").classList.remove("open"); 
};

window.applyTheme = function(theme) { 
    document.documentElement.setAttribute("data-theme", theme); 
    localStorage.setItem("mdk.theme", theme); 
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

// --- РОУТЕР ---
window.route = function() {
  window.closeDrawer();
  
  // Если не авторизован - показываем окно входа и прерываем роутинг
  if (!window.state.student && !window.state.staff) { 
      $("loginOverlay").style.display = "flex"; 
      $("app").innerHTML = ""; // Очищаем экран от старых данных
      return; 
  }

  var hash = location.hash.replace(/^#/, "") || "/"; 
  var parts = hash.split("/").filter(Boolean);
  var app = $("app"); if (!app) return;

  try {
    var page = parts[0] || "/";
    
    if (page === "topic" && window.renderTopic) window.renderTopic(parts[1], parts[2]);
    else if (page === "profile" && window.renderProfilePage) window.renderProfilePage();
    else if (page === "videos" && window.renderSimplePage) window.renderSimplePage("Видео", window.GLOBAL_DATA ? window.GLOBAL_DATA.videos : [], "🎬");
    else if (page === "passports" && window.renderSimplePage) window.renderSimplePage("Паспорта", window.GLOBAL_DATA ? window.GLOBAL_DATA.passports : [], "📄");
    else if (page === "safety" && window.renderSimplePage) window.renderSimplePage("Охрана труда", window.GLOBAL_DATA ? window.GLOBAL_DATA.safety : [], "🦺");
    else if (page === "formatting" && window.renderSimplePage) window.renderSimplePage("Оформление", [{title: "Требования", content: "Times New Roman 14"}], "📝");
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
    else if (page === "achievements" && window.renderAchievementsPage) window.renderAchievementsPage();
    else renderHome();
  } catch (err) { 
      app.innerHTML = '<div class="module" style="color:var(--err);">Ошибка при загрузке страницы: ' + window.escapeHtml(err.message) + '</div>'; 
      console.error(err);
  }
  window.scrollTo(0, 0);
};

function renderHome() {
  var app = $("app"); app.innerHTML = "";
  var c = window.COURSE;
  
  if (!c) { 
      app.innerHTML = "<div class='module'>Ошибка загрузки данных курса.</div>"; 
      return; 
  }
  
  var html = '<section class="hero"><h1>' + window.escapeHtml(c.title) + '</h1><p>' + window.escapeHtml(c.module || "") + '</p></section>';
  html += '<div class="steps-title">Учебный план</div>';
  
  (c.sections || []).forEach(sec => {
    html += '<div style="font-weight:bold; margin:20px 0 10px; color:var(--accent); text-transform:uppercase; font-size:12px;">' + window.escapeHtml(sec.title) + '</div>';
    (sec.topics || []).forEach(t => {
      var badges = []; 
      if (t.lectures) badges.push("📖"); 
      if (t.practicals) badges.push("🛠"); 
      if (t.test) badges.push("📝");
      
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

// --- ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ---
window.addEventListener("DOMContentLoaded", function() {
  // Применяем сохраненную тему
  var savedTheme = localStorage.getItem("mdk.theme_active") || "default"; 
  document.documentElement.setAttribute("data-theme", savedTheme !== "default" ? savedTheme : (localStorage.getItem("mdk.theme") || "dark"));

  // Обработчики кнопок входа
  if ($("btnLoginStudent")) $("btnLoginStudent").onclick = window.doStudentLogin;
  if ($("btnLoginTeacher")) $("btnLoginTeacher").onclick = window.doTeacherLogin;
  
  // Тема
  if ($("themeToggle")) {
      $("themeToggle").onclick = () => { 
          var cur = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light"; 
          window.applyTheme(cur); 
      };
  }
  
  // Бургер меню
  if ($("burgerBtn")) $("burgerBtn").onclick = () => { $("drawer").classList.toggle("open"); $("drawerOverlay").classList.toggle("open"); };
  if ($("drawerClose")) $("drawerClose").onclick = window.closeDrawer;
  if ($("drawerOverlay")) $("drawerOverlay").onclick = window.closeDrawer;
  
  // Селектор курса
  if ($("mdkSelector")) { 
      $("mdkSelector").value = window.state.activeCourseId; 
      $("mdkSelector").onchange = (e) => window.switchCourse(e.target.value); 
  }
  
  // Навигация в боковом меню
  document.querySelectorAll("[data-go]").forEach(item => { 
      item.onclick = (e) => { 
          e.preventDefault(); 
          location.hash = item.getAttribute("data-go"); 
          window.closeDrawer(); 
      }; 
  });

  // Восстановление UI
  window.renderUserChip(); 
  
  // Проверка, авторизован ли пользователь, и запуск роутера
  if (window.state.student) window.loadStudentData();
  window.route();
});

window.addEventListener("hashchange", window.route);