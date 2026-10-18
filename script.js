/* ============================================================
   МДК 07.01 — script.js (v70.0)
   ============================================================ */
"use strict";

var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzB0v37m5pC0jSnEmCEllIlN3IlRmgOhaPEW9giHbS6wNIYFHClxJv8Z5HyG4-AJBpdaQ/exec";
var state = { 
  student: null, staff: null, progress: {}, results: {}, selfResults: {}, 
  practicalsDone: {}, practicalGrades: {}, requests: {}, allowedAttempts: {},
  favorites: [], xp: 0, shop: [], achievements: {},
  loginStreak: 0, lastLoginDate: null, nick: null, sign: null
};

try { var _s = JSON.parse(localStorage.getItem("mdk0701.student") || "null"); if (_s && _s.name) state.student = _s; } catch (e){}
try { var _st = JSON.parse(sessionStorage.getItem("mdk0701.staff") || "null"); if (_st && _st.role) state.staff = _st; } catch (e){}

function getCourse(){ try { return COURSE; } catch(e){} try { return window.COURSE; } catch(e){} return null; }
function $(id){ return document.getElementById(id); }
function el(html){ var t = document.createElement("template"); t.innerHTML = String(html).trim(); return t.content.firstChild; }
function escapeHtml(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function findTopic(id){ var c = getCourse(); if (!c) return null; for (var i = 0; i < c.sections.length; i++){ if (!c.sections[i].topics) continue; for (var j = 0; j < c.sections[i].topics.length; j++){ if (c.sections[i].topics[j].id === id) return { section: c.sections[i], topic: c.sections[i].topics[j] }; } } return null; }
function studentKey(s){ s = s || state.student; if (!s || !s.name) return null; return (s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase()); }

window.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') { e.target.style.display = 'none'; }
}, true);

window.showToast = function(msg, type) {
  var container = document.querySelector(".toast-container");
  if (!container) { container = document.createElement("div"); container.className = "toast-container"; document.body.appendChild(container); }
  var toast = document.createElement("div"); toast.className = "toast " + (type || "");
  toast.innerHTML = (type === "ok" ? "✅ " : type === "err" ? "❌ " : "ℹ️ ") + escapeHtml(msg);
  container.appendChild(toast);
  setTimeout(function() { toast.classList.add("out"); setTimeout(function() { if (toast.parentNode) toast.remove(); }, 300); }, 3000);
};

// ПРОВЕРКА ДОСТИЖЕНИЙ И ВСПЛЫВАШКИ
function checkAchievements() {
    // Простая логика: если XP достиг порога, а ачивки нет - выдаем
    var achList = [
        { id: "t1", xp: 10, title: "Новичок" },
        { id: "t2", xp: 50, title: "Студент" },
        { id: "t3", xp: 100, title: "Книжный червь" },
        { id: "t4", xp: 200, title: "Умник" },
        { id: "t5", xp: 500, title: "Знаток" },
        { id: "t6", xp: 1000, title: "Мастер" }
    ];

    achList.forEach(a => {
        if (state.xp >= a.xp && !state.achievements[a.id]) {
            state.achievements[a.id] = true;
            window.showToast("🏆 Достижение: " + a.title + "!", "ok");
            // Можно добавить звук или анимацию
        }
    });
}

function loadStudentData(){
  var k = studentKey(); if (!k) return; var ek = encodeURIComponent(k);
  state.progress = JSON.parse(localStorage.getItem("mdk0701.progress." + ek) || "{}");
  state.results = JSON.parse(localStorage.getItem("mdk0701.results." + ek) || "{}");
  state.selfResults = JSON.parse(localStorage.getItem("mdk0701.selfResults." + ek) || "{}");
  state.practicalsDone = JSON.parse(localStorage.getItem("mdk0701.practicalsDone." + ek) || "{}");
  state.practicalGrades = JSON.parse(localStorage.getItem("mdk0701.practicalGrades." + ek) || "{}");
  state.requests = JSON.parse(localStorage.getItem("mdk0701.requests." + ek) || "{}");
  state.allowedAttempts = JSON.parse(localStorage.getItem("mdk0701.allowedAttempts." + ek) || "{}");
  state.achievements = JSON.parse(localStorage.getItem("mdk0701.achievements." + ek) || "{}");
  state.nick = localStorage.getItem("mdk0701.nick." + ek) || null;
  state.sign = localStorage.getItem("mdk0701.sign." + ek) || null;
  
  state.xp = parseInt(localStorage.getItem("mdk0701.xp." + ek) || "0");
  state.shop = JSON.parse(localStorage.getItem("mdk0701.shop." + ek) || "[]");
  state.loginStreak = parseInt(localStorage.getItem("mdk0701.loginStreak." + ek) || "0");
  state.lastLoginDate = localStorage.getItem("mdk0701.lastLoginDate." + ek) || null;
  
  if ($("xpCount")) $("xpCount").textContent = "🌟 " + state.xp + " XP";
}
function saveStudentData(){
  var k = studentKey(); if (!k) return; var ek = encodeURIComponent(k);
  localStorage.setItem("mdk0701.progress." + ek, JSON.stringify(state.progress));
  localStorage.setItem("mdk0701.results." + ek, JSON.stringify(state.results));
  localStorage.setItem("mdk0701.selfResults." + ek, JSON.stringify(state.selfResults));
  localStorage.setItem("mdk0701.practicalsDone." + ek, JSON.stringify(state.practicalsDone));
  localStorage.setItem("mdk0701.practicalGrades." + ek, JSON.stringify(state.practicalGrades));
  localStorage.setItem("mdk0701.requests." + ek, JSON.stringify(state.requests));
  localStorage.setItem("mdk0701.allowedAttempts." + ek, JSON.stringify(state.allowedAttempts));
  localStorage.setItem("mdk0701.achievements." + ek, JSON.stringify(state.achievements));
  
  localStorage.setItem("mdk0701.xp." + ek, state.xp);
  localStorage.setItem("mdk0701.shop." + ek, JSON.stringify(state.shop));
  localStorage.setItem("mdk0701.loginStreak." + ek, state.loginStreak);
  localStorage.setItem("mdk0701.lastLoginDate." + ek, state.lastLoginDate || "");
  if (state.nick) localStorage.setItem("mdk0701.nick." + ek, state.nick);
  if (state.sign) localStorage.setItem("mdk0701.sign." + ek, state.sign);
  
  if ($("xpCount")) $("xpCount").textContent = "🌟 " + state.xp + " XP";
  
  checkAchievements(); // Проверяем после сохранения

  if(APPS_SCRIPT_URL && state.student) {
    var p = new URLSearchParams();
    p.append("action", "save"); p.append("key", k); p.append("name", state.student.name); p.append("group", state.student.group);
    p.append("payload", JSON.stringify({ 
      progress: state.progress, results: state.results, selfResults: state.selfResults, 
      practicalsDone: state.practicalsDone, practicalGrades: state.practicalGrades,
      requests: state.requests, allowedAttempts: state.allowedAttempts, favorites: state.favorites,
      xp: state.xp, nick: state.nick, sign: state.sign
    }));
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p }).catch(function(){});
  }
}

function checkDailyLogin() {
    if (!state.student) return;
    var today = new Date().toDateString();
    if (state.lastLoginDate !== today) {
        var xpGained = 10;
        var streakMsg = "";
        if (state.lastLoginDate) {
            var lastDate = new Date(state.lastLoginDate);
            var now = new Date(today);
            lastDate.setHours(0,0,0,0); now.setHours(0,0,0,0);
            var diffDays = Math.round((now - lastDate) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                state.loginStreak++;
                var bonus = Math.min(state.loginStreak * 5, 50);
                xpGained += bonus;
                streakMsg = " (🔥 Серия: " + state.loginStreak + " дней! Бонус +" + bonus + " XP)";
            } else {
                state.loginStreak = 1; streakMsg = " (Серия сброшена)";
            }
        } else {
            state.loginStreak = 1;
        }
        state.lastLoginDate = today;
        state.xp += xpGained;
        saveStudentData();
        setTimeout(function() { window.showToast("Ежедневный вход: +" + xpGained + " XP" + streakMsg, "ok"); }, 1000);
    }
}

window.markPracticalDone = function(topicId, code) {
    if (!state.practicalsDone[topicId]) state.practicalsDone[topicId] = {};
    state.practicalsDone[topicId][code] = "pending";
    saveStudentData(); renderTopic(topicId, "practice");
    window.showToast("Заявка на проверку отправлена!", "ok");
};

window.requestAttempt = function(topicId, type) {
    var reqKey = topicId + "_" + type;
    if (!state.requests) state.requests = {};
    state.requests[reqKey] = "pending";
    saveStudentData(); renderTopic(topicId, type);
    window.showToast("Запрос на доп. попытку отправлен!", "ok");
};

window.approvePractical = function(studentKeyStr, topicId, code, grade) {
    var p = new URLSearchParams();
    p.append("action", "approvework"); p.append("key", studentKeyStr); p.append("topicId", topicId); p.append("code", code); p.append("grade", grade);
    var elToRemove = document.getElementById("req_" + topicId + "_" + code);
    if (elToRemove) elToRemove.remove();
    window.showToast("Оценка " + grade + " выставлена!", "ok");
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p }).catch(console.error);
};

window.approveAttempt = function(studentKeyStr, reqKey) {
    var p = new URLSearchParams();
    p.append("action", "approveattempt"); p.append("key", studentKeyStr); p.append("reqKey", reqKey);
    var elToRemove = document.getElementById("req_" + reqKey);
    if (elToRemove) elToRemove.remove();
    window.showToast("Попытка одобрена!", "ok");
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p }).catch(console.error);
};

function applyTheme(theme){ document.documentElement.setAttribute("data-theme", theme); localStorage.setItem("mdk0701.theme", theme); }
function openThemeModal(){
  var current = document.documentElement.getAttribute("data-theme") || "light";
  var themes = ["light", "dark", "sepia", "ocean", "forest", "matrix", "cosmos", "gold"]; 
  var names = ["Светлая", "Тёмная", "Сепия", "Океан", "Лес", "Матрица", "Космос", "Золото"];
  var modal = el(`<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center;" id="themeModal"><div style="background:var(--card);padding:24px;border-radius:16px;width:90%;max-width:400px; animation: popIn 0.3s;"><h3 style="margin-top:0;">Выберите тему</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0;" id="themeGrid"></div><button class="btn ghost" style="width:100%" onclick="document.getElementById('themeModal').remove()">Закрыть</button></div></div>`);
  var grid = modal.querySelector("#themeGrid");
  themes.forEach(function(t, i){ 
      var btn = el('<button class="btn ' + (t===current ? '' : 'ghost') + '" style="padding:12px;">' + names[i] + '</button>'); 
      btn.onclick = function() { 
          if (["matrix", "cosmos", "gold"].includes(t) && !state.shop.includes("theme_" + t)) {
              window.showToast("Тема не куплена!", "err"); return;
          }
          applyTheme(t); modal.remove(); 
      }; 
      grid.appendChild(btn); 
  });
  document.body.appendChild(modal);
}

window.doStudentLogin = function() {
  var n = $("loginName").value.trim(); var g = $("loginGroup").value.trim();
  if (!n || !g) { alert("Введите ФИО и Группу!"); return; }
  state.student = { name: n, group: g.toUpperCase() };
  localStorage.setItem("mdk0701.student", JSON.stringify(state.student));
  $("loginOverlay").hidden = true; renderUserChip(); loadStudentData(); checkDailyLogin(); route();
};
window.doTeacherLogin = function() {
  var user = $("loginStaffName").value.trim(); var pass = $("loginStaffPass").value.trim(); var btn = $("staffLoginBtn");
  if (!user || !pass) { alert("Введите логин и пароль!"); return; }
  btn.textContent = "Проверяем..."; btn.disabled = true;
  fetch(APPS_SCRIPT_URL + "?action=login&username=" + encodeURIComponent(user) + "&password=" + encodeURIComponent(pass) + "&t=" + new Date().getTime())
    .then(function(r){ return r.json(); }).then(function(d) {
      if (d && d.ok) { state.staff = { role: d.role, name: d.name }; sessionStorage.setItem("mdk0701.staff", JSON.stringify(state.staff)); $("loginOverlay").hidden = true; renderUserChip(); route(); } 
      else { alert("Неверный логин или пароль."); btn.textContent = "Войти как сотрудник"; btn.disabled = false; }
    }).catch(function() { alert("Ошибка сети."); btn.textContent = "Войти как сотрудник"; btn.disabled = false; });
};
window.handleLogout = function() {
  if (confirm("Выйти из аккаунта?")) {
    state.student = null; state.staff = null; localStorage.removeItem("mdk0701.student"); sessionStorage.removeItem("mdk0701.staff");
    $("loginOverlay").hidden = false; $("userChipName").textContent = "Гость"; $("userChipGroup").textContent = "Роль: Гость"; $("userChipAvatar").textContent = "👨‍🎓"; if ($("xpCount")) $("xpCount").textContent = "🌟 0 XP"; closeDrawer(); route();
  }
};

function renderUserChip(){
  if (state.staff) { 
      $("userChipName").textContent = state.staff.name; 
      $("userChipGroup").textContent = "Учитель"; 
      $("userChipAvatar").textContent = "👨‍🏫"; 
      var reqEl = document.getElementById("navRequests");
      if (reqEl) reqEl.style.display = "flex";
  } 
  else if (state.student) { 
      $("userChipName").textContent = state.nick || state.student.name; 
      $("userChipGroup").textContent = "Гр. " + state.student.group; 
      
      // ЗОЛОТОЙ АВАТАР
      if (state.shop.includes("golden")) {
          $("userChipAvatar").textContent = "👑";
      } else {
          $("userChipAvatar").textContent = "👨‍🎓";
      }
  }
}
function closeDrawer(){ $("drawer").classList.remove("open"); $("drawerOverlay").classList.remove("open"); }
function toggleDrawer(){ $("drawer").classList.toggle("open"); $("drawerOverlay").classList.toggle("open"); }

// ... (renderHome, renderGCodeReferencePage, renderTopic, renderSimulatorPage, renderPortfolioPage, route без изменений, вставьте их из предыдущего ответа) ...

function renderShopPage(){
  var app = $("app"); app.innerHTML = ""; app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el('<section class="hero"><h1>Магазин XP</h1><p>У вас: 🌟 <b>' + state.xp + ' XP</b></p></section>'));
  
  var items = [
    { id: "golden", icon: "👑", title: "Золотой аватар", price: 100, type: "avatar" },
    { id: "nick", icon: "🏷️", title: "Кастомный Ник", price: 200, type: "input", field: "nick", placeholder: "Введите ваш ник..." },
    { id: "sign", icon: "✍️", title: "Подпись в профиле", price: 300, type: "input", field: "sign", placeholder: "Введите вашу подпись..." },
    { id: "theme_matrix", icon: "🟩", title: "Тема 'Матрица'", price: 500, type: "theme", theme: "matrix" },
    { id: "theme_cosmos", icon: "🌌", title: "Тема 'Космос'", price: 800, type: "theme", theme: "cosmos" },
    { id: "theme_gold", icon: "🪙", title: "Тема 'Золото'", price: 1000, type: "theme", theme: "gold" }
  ];
  
  var grid = el('<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));gap:16px;"></div>');
  
  items.forEach(function(it){
    var has = state.shop.includes(it.id);
    
    var btn = el('<button class="btn" style="width:100%;margin-top:10px;" ' + (has || state.xp < it.price ? 'disabled' : '') + '>' + (has ? 'Куплено' : (state.xp < it.price ? 'Мало XP' : 'Купить')) + '</button>');
    
    if (!has && state.xp >= it.price) { 
        btn.onclick = function() { 
            if (it.type === "input") {
                var val = prompt(it.placeholder, state[it.field] || "");
                if (val === null) return;
                state[it.field] = val.trim();
            }
            if (it.type === "theme") {
                applyTheme(it.theme); // Сразу применяем тему
            }
            state.xp -= it.price; 
            state.shop.push(it.id); 
            saveStudentData(); 
            renderShopPage(); 
            renderUserChip(); // Обновляем аватар/ник
            window.showToast("Покупка совершена!", "ok"); 
        }; 
    }
    
    var card = el(`<div style="background:var(--card);border:1px solid var(--border);padding:16px;border-radius:12px;text-align:center;display:flex;flex-direction:column;justify-content:space-between;"><div><div style="font-size:40px;margin-bottom:10px;">${it.icon}</div><div style="font-weight:bold;">${it.title}</div></div><div style="margin-top:10px;"><div style="color:var(--accent);font-weight:bold;margin-bottom:8px;">${it.price} XP</div></div></div>`);
    card.appendChild(btn); 
    grid.appendChild(card);
  });
  
  app.appendChild(grid);
}

// ... (route и DOMContentLoaded без изменений, вставьте из предыдущего кода) ...