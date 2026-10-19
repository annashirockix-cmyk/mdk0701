/* ============================================================
   МДК 07.01 — script.js (v96.0 — FULL FINAL)
   ============================================================ */
"use strict";

var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzB0v37m5pC0jSnEmCEllIlN3IlRmgOhaPEW9giHbS6wNIYFHClxJv8Z5HyG4-AJBpdaQ/exec";
var state = { 
  student: null, staff: null, progress: {}, results: {}, selfResults: {}, 
  practicalsDone: {}, practicalGrades: {}, requests: {}, allowedAttempts: {},
  favorites: [], xp: 0, shop: [], achievements: {},
  loginStreak: 0, lastLoginDate: null, nick: null, sign: null,
  notifications: [], schedule: [], avatar: null, effects: []
};

// Безопасная загрузка сессии (Mobile Fix)
try { 
  var _s = JSON.parse(localStorage.getItem("mdk0701.student") || sessionStorage.getItem("mdk0701.student") || "null"); 
  if (_s && _s.name) state.student = _s; 
} catch (e){}

try { 
  var _st = JSON.parse(sessionStorage.getItem("mdk0701.staff") || "null"); 
  if (_st && _st.role) state.staff = _st; 
} catch (e){}

// --- УТИЛИТЫ ---
function getCourse(){ try { return COURSE; } catch(e){} try { return window.COURSE; } catch(e){} return null; }
function $(id){ return document.getElementById(id); }
function el(html){ var t = document.createElement("template"); t.innerHTML = String(html).trim(); return t.content.firstChild; }
function escapeHtml(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function findTopic(id){ var c = getCourse(); if (!c) return null; for (var i = 0; i < c.sections.length; i++){ if (!c.sections[i].topics) continue; for (var j = 0; j < c.sections[i].topics.length; j++){ if (c.sections[i].topics[j].id === id) return { section: c.sections[i], topic: c.sections[i].topics[j] }; } } return null; }
function studentKey(s){ s = s || state.student; if (!s || !s.name) return null; return (s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase()); }

// Глобальный перехватчик ошибок загрузки картинок (скрывает битые иконки)
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

// --- УВЕДОМЛЕНИЯ ---
window.addNotification = function(text, type = "info") {
    if (!state.notifications) state.notifications = [];
    state.notifications.unshift({ id: Date.now(), text: text, type: type, date: new Date().toISOString(), read: false });
    if (state.notifications.length > 50) state.notifications.pop();
    updateNotifBadge();
};

function updateNotifBadge() {
    var badge = $("notifBadge");
    if (!badge) return;
    var unread = state.notifications.filter(n => !n.read).length;
    if (unread > 0) {
        badge.textContent = unread;
        badge.style.display = "inline-block";
    } else {
        badge.style.display = "none";
    }
}

// --- ДОСТИЖЕНИЯ ---
function checkAchievements() {
    var achList = [
        { id: "t1", xp: 10, title: "Новичок" },
        { id: "t2", xp: 50, title: "Студент" },
        { id: "t3", xp: 100, title: "Книжный червь" },
        { id: "t4", xp: 200, title: "Умник" },
        { id: "t5", xp: 500, title: "Знаток" },
        { id: "t6", xp: 1000, title: "Мастер" }
    ];
    var hasNew = false;
    achList.forEach(a => {
        if (state.xp >= a.xp && !state.achievements[a.id]) {
            state.achievements[a.id] = true;
            window.showToast("🏆 Достижение: " + a.title + "!", "ok");
            if (!state.notifications) state.notifications = [];
            state.notifications.unshift({ id: Date.now(), text: "Получено достижение: " + a.title, type: "ok", date: new Date().toISOString(), read: false });
            hasNew = true;
        }
    });
    if (hasNew) updateNotifBadge();
}

// --- ЗАГРУЗКА И СОХРАНЕНИЕ ДАННЫХ ---
function loadStudentData(){
  var k = studentKey(); if (!k) return; var ek = encodeURIComponent(k);
  
  try {
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
    state.notifications = JSON.parse(localStorage.getItem("mdk0701.notifications." + ek) || "[]");
    state.schedule = JSON.parse(localStorage.getItem("mdk0701.schedule") || "[]");
    state.xp = parseInt(localStorage.getItem("mdk0701.xp." + ek) || "0");
    state.shop = JSON.parse(localStorage.getItem("mdk0701.shop." + ek) || "[]");
    state.loginStreak = parseInt(localStorage.getItem("mdk0701.loginStreak." + ek) || "0");
    state.lastLoginDate = localStorage.getItem("mdk0701.lastLoginDate." + ek) || null;
    state.avatar = localStorage.getItem("mdk0701.avatar." + ek) || null;
    state.effects = JSON.parse(localStorage.getItem("mdk0701.effects." + ek) || "[]");
  } catch (e) { console.warn("LocalStorage error", e); }
  
  if ($("xpCount")) $("xpCount").textContent = "🌟 " + state.xp + " XP";
  updateNotifBadge();

  // Синхронизация с сервером
  if (APPS_SCRIPT_URL && state.student) {
      fetch(APPS_SCRIPT_URL + "?action=getstudentdata&key=" + encodeURIComponent(k) + "&t=" + Date.now())
        .then(r => r.json())
        .then(d => {
            if (d.ok && d.payload) {
                var serverData = JSON.parse(d.payload);
                var changed = false;
                
                if (serverData.practicalGrades) { state.practicalGrades = serverData.practicalGrades; changed = true; }
                if (serverData.allowedAttempts) { state.allowedAttempts = serverData.allowedAttempts; changed = true; }
                if (serverData.practicalsDone) { state.practicalsDone = serverData.practicalsDone; changed = true; }
                if (serverData.xp !== undefined) { state.xp = serverData.xp; changed = true; }
                if (serverData.requests) { state.requests = serverData.requests; changed = true; }
                else { state.requests = {}; changed = true; }
                if (serverData.avatar) { state.avatar = serverData.avatar; changed = true; }
                if (serverData.effects) { state.effects = serverData.effects; changed = true; }

                if (changed) {
                    try {
                        localStorage.setItem("mdk0701.practicalGrades." + ek, JSON.stringify(state.practicalGrades));
                        localStorage.setItem("mdk0701.allowedAttempts." + ek, JSON.stringify(state.allowedAttempts));
                        localStorage.setItem("mdk0701.requests." + ek, JSON.stringify(state.requests));
                        localStorage.setItem("mdk0701.practicalsDone." + ek, JSON.stringify(state.practicalsDone));
                        localStorage.setItem("mdk0701.xp." + ek, state.xp);
                        if (state.avatar) localStorage.setItem("mdk0701.avatar." + ek, state.avatar);
                        localStorage.setItem("mdk0701.effects." + ek, JSON.stringify(state.effects));
                    } catch (e) {}
                    
                    if ($("xpCount")) $("xpCount").textContent = "🌟 " + state.xp + " XP";
                    renderUserChip();
                    
                    if (location.hash.includes('/topic/')) {
                        var parts = location.hash.replace(/^#\//, "").split("/");
                        if(parts[0] === 'topic') renderTopic(parts[1], parts[2]);
                    }
                }
            }
        }).catch(e => console.warn("Sync error", e));
  }
}

function saveStudentData(){
  var k = studentKey(); if (!k) return; var ek = encodeURIComponent(k);
  
  try {
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
    if (state.avatar) localStorage.setItem("mdk0701.avatar." + ek, state.avatar);
    localStorage.setItem("mdk0701.effects." + ek, JSON.stringify(state.effects));
    localStorage.setItem("mdk0701.notifications." + ek, JSON.stringify(state.notifications));
    localStorage.setItem("mdk0701.schedule", JSON.stringify(state.schedule));
  } catch (e) { console.warn("LocalStorage save error", e); }
  
  if ($("xpCount")) $("xpCount").textContent = "🌟 " + state.xp + " XP";
  checkAchievements();

  if(APPS_SCRIPT_URL && state.student) {
    var p = new URLSearchParams();
    p.append("action", "save"); p.append("key", k); p.append("name", state.student.name); p.append("group", state.student.group);
    p.append("payload", JSON.stringify({ 
      progress: state.progress, results: state.results, selfResults: state.selfResults, 
      practicalsDone: state.practicalsDone, practicalGrades: state.practicalGrades,
      requests: state.requests, allowedAttempts: state.allowedAttempts, favorites: state.favorites,
      xp: state.xp, nick: state.nick, sign: state.sign, notifications: state.notifications,
      avatar: state.avatar, effects: state.effects
    }));
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p }).catch(function(){});
  }
}

// --- ЕЖЕДНЕВНЫЙ ВХОД ---
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

// --- ДЕЙСТВИЯ (Студент) ---
window.markPracticalDone = function(topicId, code) {
    if (!state.practicalsDone[topicId]) state.practicalsDone[topicId] = {};
    state.practicalsDone[topicId][code] = "pending";
    addNotification("Вы отправили на проверку работу " + code, "info");
    saveStudentData(); 
    renderTopic(topicId, "practice");
    window.showToast("Заявка на проверку отправлена!", "ok");
};

window.requestAttempt = function(topicId, type) {
    var reqKey = topicId + "_" + type;
    if (!state.requests) state.requests = {};
    state.requests[reqKey] = "pending";
    addNotification("Вы запросили дополнительную попытку", "info");
    saveStudentData(); 
    renderTopic(topicId, type);
    window.showToast("Запрос на доп. попытку отправлен!", "ok");
};

// --- ДЕЙСТВИЯ (Преподаватель) ---
window.approvePractical = function(studentKeyStr, topicId, code, grade) {
    var p = new URLSearchParams();
    p.append("action", "approvework"); 
    p.append("key", studentKeyStr); 
    p.append("topicId", topicId); 
    p.append("code", code); 
    p.append("grade", grade);
    
    window.showToast("Сохранение оценки...", "info");
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p })
        .then(r => r.json())
        .then(d => {
            if (d.ok) {
                window.showToast("Оценка " + grade + " выставлена!", "ok");
                var elToRemove = document.getElementById("req_" + topicId + "_" + code);
                if (elToRemove) elToRemove.remove();
            } else {
                window.showToast("Ошибка сохранения", "err");
            }
        }).catch(err => { window.showToast("Ошибка сети", "err"); });
};

window.approveAttempt = function(studentKeyStr, reqKey) {
    var p = new URLSearchParams();
    p.append("action", "approveattempt"); p.append("key", studentKeyStr); p.append("reqKey", reqKey);
    var elToRemove = document.getElementById("req_" + reqKey);
    if (elToRemove) elToRemove.remove();
    window.showToast("Попытка одобрена!", "ok");
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p }).catch(console.error);
};

window.grantXP = function(studentKeyStr, studentName, presetAmount) {
    if (!state.staff) return;
    
    var amount = presetAmount;
    if (!amount) {
        amount = prompt("Сколько XP выдать студенту " + studentName + "?", "50");
    }
    
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;
    
    var p = new URLSearchParams();
    p.append("action", "grantxp"); 
    p.append("key", studentKeyStr); 
    p.append("amount", parseInt(amount));
    
    window.showToast("Начисление " + amount + " XP...", "info");
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p })
      .then(r => r.json())
      .then(d => {
        if (d.ok) window.showToast("Успешно начислено " + amount + " XP!", "ok");
        else window.showToast("Ошибка: " + (d.error || "Неизвестно"), "err");
      })
      .catch(() => window.showToast("Ошибка сети.", "err"));
};

// --- ТЕМЫ И ЭФФЕКТЫ ---
function applyTheme(theme){ document.documentElement.setAttribute("data-theme", theme); localStorage.setItem("mdk0701.theme", theme); }
function applyEffects() {
    document.body.classList.remove('effect-waves', 'effect-pulse', 'effect-matrix');
    if (state.effects && state.effects.length > 0) {
        state.effects.forEach(eff => document.body.classList.add('effect-' + eff));
    }
}

function openThemeModal(){
  var current = document.documentElement.getAttribute("data-theme") || "light";
  var themes = ["light", "dark", "sepia", "ocean", "forest", "matrix", "cosmos", "gold", "anime", "hacker", "cyber", "matrioska"]; 
  var names = ["Светлая", "Тёмная", "Сепия", "Океан", "Лес", "Матрица", "Космос", "Золото", "Аниме", "Хакер", "Кибер", "Матрешка"];
  var modal = el(`<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center;" id="themeModal"><div style="background:var(--card);padding:24px;border-radius:16px;width:90%;max-width:400px; animation: popIn 0.3s;"><h3 style="margin-top:0;">Выберите тему</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0;" id="themeGrid"></div><button class="btn ghost" style="width:100%" onclick="document.getElementById('themeModal').remove()">Закрыть</button></div></div>`);
  var grid = modal.querySelector("#themeGrid");
  
  themes.forEach(function(t, i){ 
      var btn = el('<button class="btn ' + (t===current ? '' : 'ghost') + '" style="padding:12px;">' + names[i] + '</button>'); 
      btn.onclick = function() { 
          if (!state.staff && ["matrix", "cosmos", "gold", "anime", "hacker", "cyber", "matrioska"].includes(t) && !state.shop.includes("theme_" + t)) {
              window.showToast("Тема не куплена!", "err"); return;
          }
          applyTheme(t); modal.remove(); 
      }; 
      grid.appendChild(btn); 
  });
  document.body.appendChild(modal);
}

// --- ВХОД/ВЫХОД ---
window.doStudentLogin = function() {
  var n = $("loginName").value.trim(); 
  var g = $("loginGroup").value.trim();
  
  if (!n || !g) { window.showToast("Введите ФИО и Группу!", "err"); return; }
  
  state.student = { name: n, group: g.toUpperCase() };
  try { localStorage.setItem("mdk0701.student", JSON.stringify(state.student)); } catch(e){}
  
  $("loginOverlay").hidden = true; 
  renderUserChip(); 
  loadStudentData(); 
  checkDailyLogin(); 
  route();
};
window.doTeacherLogin = function() {
  var user = $("loginStaffName").value.trim(); 
  var pass = $("loginStaffPass").value.trim(); 
  var btn = $("staffLoginBtn");
  
  if (!user || !pass) { window.showToast("Введите логин и пароль!", "err"); return; }
  
  btn.textContent = "Проверяем..."; 
  btn.disabled = true;
  
  fetch(APPS_SCRIPT_URL + "?action=login&username=" + encodeURIComponent(user) + "&password=" + encodeURIComponent(pass) + "&t=" + new Date().getTime())
    .then(function(r){ return r.json(); })
    .then(function(d) {
      if (d && d.ok) { 
          state.staff = { role: d.role, name: d.name }; 
          try { sessionStorage.setItem("mdk0701.staff", JSON.stringify(state.staff)); } catch(e){}
          $("loginOverlay").hidden = true; 
          renderUserChip(); 
          route(); 
      } 
      else { 
          window.showToast("Неверный логин или пароль.", "err"); 
          btn.textContent = "Войти как сотрудник"; 
          btn.disabled = false; 
      }
    }).catch(function() { 
        window.showToast("Ошибка сети.", "err"); 
        btn.textContent = "Войти как сотрудник"; 
        btn.disabled = false; 
    });
};
window.handleLogout = function() {
  if (confirm("Выйти из аккаунта?")) {
    state.student = null; state.staff = null; 
    try { localStorage.removeItem("mdk0701.student"); sessionStorage.removeItem("mdk0701.staff"); } catch(e){}
    $("loginOverlay").hidden = false; $("userChipName").textContent = "Гость"; $("userChipGroup").textContent = "Роль: Гость"; $("userChipAvatar").innerHTML = "👨‍🎓"; if ($("xpCount")) $("xpCount").textContent = "🌟 0 XP"; closeDrawer(); route();
  }
};

function renderUserChip(){
  if (state.staff) { 
      $("userChipName").textContent = state.staff.name; 
      $("userChipGroup").textContent = "Учитель"; 
      $("userChipAvatar").innerHTML = "👨‍🏫"; 
      var reqEl = document.getElementById("navRequests");
      if (reqEl) reqEl.style.display = "flex";
  } 
  else if (state.student) { 
      $("userChipName").textContent = state.nick || state.student.name; 
      $("userChipGroup").textContent = "Гр. " + state.student.group; 
      
      if (state.avatar) {
          $("userChipAvatar").innerHTML = `<img src="${state.avatar}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">`;
      } else if (state.shop.includes("golden") || state.staff) { 
          $("userChipAvatar").innerHTML = "👑"; 
      } else { 
          $("userChipAvatar").innerHTML = "👨‍🎓"; 
      }
  }
  updateNotifBadge();
  applyEffects();
}

function closeDrawer(){ $("drawer").classList.remove("open"); $("drawerOverlay").classList.remove("open"); }
function toggleDrawer(){ $("drawer").classList.toggle("open"); $("drawerOverlay").classList.toggle("open"); }

// --- РЕНДЕР ГЛАВНОЙ ---
function renderHome(){
  var app = $("app"); app.innerHTML = ""; var c = getCourse();
  if(!c) { app.innerHTML = "<p>Ошибка загрузки курса.</p>"; return; }
  
  app.appendChild(el('<section class="hero"><h1>' + c.title + '</h1><p>' + c.module + '</p></section>'));
  
  c.sections.forEach(function(sec) {
    app.appendChild(el('<div class="steps-title">' + sec.code + ' · ' + sec.title + '</div>'));
    var list = document.createElement("div");
    sec.topics.forEach(function(t) { list.appendChild(el('<div class="topic" onclick="location.hash=\'#/topic/' + t.id + '\'"><span class="t-code">' + t.code + '</span><span class="t-title">' + t.title + '</span></div>')); });
    app.appendChild(list);
  });

  var eventBlock = el(`<div class="event-card" onclick="location.hash='#/event'">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
              <h2 style="margin:0 0 10px 0; font-size:24px; color:#ff003c; text-shadow: 0 0 10px rgba(255,0,60,0.5);">🚨 СМЕРТЕЛЬНАЯ ВЕЧЕРИНКА</h2>
              <p style="margin:0; color:#aaa; font-size:14px;">Пройди викторину, чтобы отключить протокол самоуничтожения.</p>
          </div>
          <div style="font-size:40px; animation: pulse 1s infinite;">💀</div>
      </div>
      <div style="margin-top:20px; display:inline-block; background:#ff003c; color:#000; padding:8px 16px; border-radius:8px; font-weight:bold; font-size:14px;">Войти в терминал →</div>
  </div>`);
  app.appendChild(eventBlock);

  if (c.passports && c.passports.length) {
    app.appendChild(el('<div class="steps-title">Паспорта станков</div>'));
    var pGrid = el('<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:16px;"></div>');
    c.passports.forEach(function(p) {
      var card = el('<div class="module" style="margin:0;padding:16px;cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;"><div><b style="color:var(--accent)">' + p.code + '</b><div style="font-weight:bold;margin:8px 0;">' + p.title + '</div><div style="font-size:12px;color:var(--muted);">' + p.summary + '</div></div><div style="margin-top:12px;color:var(--accent);font-weight:bold;">Открыть PDF →</div></div>');
      card.onclick = (function(file) { return function() { window.open(file, "_blank"); }; })(p.file);
      pGrid.appendChild(card);
    });
    app.appendChild(pGrid);
  }

  if (c.safety && c.safety.length) {
    app.appendChild(el('<div class="steps-title">Охрана труда</div>'));
    var sGrid = el('<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:16px;"></div>');
    c.safety.forEach(function(s) {
      sGrid.appendChild(el('<a class="module" href="' + s.file + '" download style="margin:0;padding:16px;display:flex;flex-direction:column;justify-content:space-between;"><div><b style="color:var(--accent)">' + s.code + '</b><div style="font-weight:bold;margin:8px 0;">' + s.title + '</div><div style="font-size:12px;color:var(--muted);">' + s.summary + '</div></div><div style="margin-top:12px;color:var(--accent);font-weight:bold;">Скачать .docx →</div></a>'));
    });
    app.appendChild(sGrid);
  }

  if (c.videos && c.videos.length) {
    app.appendChild(el('<div class="steps-title">Видеоматериалы</div>'));
    var vGrid = el('<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:16px;"></div>');
    c.videos.forEach(function(v) { vGrid.appendChild(el('<div class="module" style="margin:0;padding:16px;"><div style="font-weight:bold;margin-bottom:8px;">' + v.title + '</div><video controls src="' + v.src + '" style="width:100%;border-radius:8px;background:#000;"></video></div>')); });
    app.appendChild(vGrid);
  }

  var flashCards = [
    { q: "Что такое G-код?", a: "Язык программирования станков с ЧПУ.", topic: "Основы" },
    { q: "Что делает G00?", a: "Быстрое позиционирование.", topic: "G-коды" },
    { q: "Что делает G01?", a: "Линейная интерполяция.", topic: "G-коды" }
  ];
  app.appendChild(el('<div class="steps-title">Интерактив</div>'));
  var flashBlock = el('<section class="module"><h2>🎴 Карточки знаний</h2><div class="home-flashcards-wrap" id="homeFlashcardArea"></div><div style="text-align:center;"><button class="btn ghost" id="nextHomeCard">Следующая →</button></div></section>');
  app.appendChild(flashBlock);
  var hArea = flashBlock.querySelector("#homeFlashcardArea"), hIndex = 0;
  function renderHomeCard() { 
    var card = flashCards[hIndex]; 
    hArea.innerHTML = `<div class="flashcard" onclick="this.classList.toggle('flipped')"><div class="flashcard-inner"><div class="flashcard-front"><div style="color:var(--accent);margin-bottom:10px">${card.topic}</div><h3>${card.q}</h3></div><div class="flashcard-back"><h3>Ответ</h3><p>${card.a}</p></div></div></div>`; 
  }
  renderHomeCard(); 
  flashBlock.querySelector("#nextHomeCard").addEventListener("click", ()=>{ hIndex=(hIndex+1)%flashCards.length; renderHomeCard(); });

  if (c.practiceFormatting) {
    app.appendChild(el('<div class="steps-title">' + c.practiceFormatting.title + '</div>'));
    var fmtBlock = el('<section class="module"><p style="color:var(--text-soft); margin-bottom:20px;">' + c.practiceFormatting.intro + '</p><div id="fmtBlocks"></div></section>');
    var fmtContainer = fmtBlock.querySelector("#fmtBlocks");
    c.practiceFormatting.blocks.forEach(function(b) {
      var bEl = el('<div style="margin-bottom:24px; background:var(--card-soft); padding:20px; border-radius:12px; border:1px solid var(--border);"><h3 style="margin-top:0; margin-bottom:12px; color:var(--accent);">' + b.title + '</h3><ul style="margin-top:0; padding-left:20px;"></ul></div>');
      var ul = bEl.querySelector("ul");
      b.items.forEach(function(item) { ul.appendChild(el('<li style="margin-bottom:8px;">' + item + '</li>')); });
      fmtContainer.appendChild(bEl);
    });
    app.appendChild(fmtBlock);
  }
}

// --- РЕНДЕР СПРАВОЧНИКА ---
window.renderGCodeReferencePage = function() {
  var app = $("app"); app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Справочник G/M";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  
  if (!window.GCODE_REFERENCE) {
      app.appendChild(el('<div class="module">Справочник не загружен.</div>'));
      return;
  }

  app.appendChild(el('<section class="hero"><h1>Справочник G- и M-кодов</h1><p>' + window.GCODE_REFERENCE.intro + '</p></section>'));
  
  window.GCODE_REFERENCE.groups.forEach(function(group) {
      var block = el('<section class="module"><h2>' + group.title + '</h2><div class="gcode-ref-list"></div></section>');
      var list = block.querySelector('.gcode-ref-list');
      group.items.forEach(function(item) {
          list.appendChild(el('<div class="gcode-ref-item"><div class="gcode-ref-code">' + item.code + '</div><div><div class="gcode-ref-name">' + item.name + '</div><div class="gcode-ref-desc">' + item.desc + '</div><div class="gcode-ref-example"><code>' + escapeHtml(item.example) + '</code></div></div></div>'));
      });
      app.appendChild(block);
  });
  
  if (window.GCODE_REFERENCE.examples) {
      var exBlock = el('<section class="module"><h2>Примеры программ</h2></section>');
      window.GCODE_REFERENCE.examples.forEach(function(ex) {
          var exDiv = el('<div style="margin-bottom:24px;"><h3>' + ex.title + '</h3><pre style="background:var(--card-soft);padding:16px;border-radius:8px;overflow-x:auto;font-size:14px;border:1px solid var(--border);"><code>' + escapeHtml(ex.code) + '</code></pre><ul style="font-size:14px;color:var(--text-soft);"></ul></div>');
          var ul = exDiv.querySelector('ul');
          ex.explanation.forEach(function(exp) { ul.appendChild(el('<li>' + exp + '</li>')); });
          exBlock.appendChild(exDiv);
      });
      app.appendChild(exBlock);
  }
};

// --- РЕНДЕР ТЕМЫ ---
function renderTopic(id, tab){
  tab = tab || "lecture"; var t = findTopic(id); if(!t) return renderHome();
  var app = $("app"); app.innerHTML = "";
  app.appendChild(el('<a class="backlink" href="#/">← К программе</a><section class="topic-head"><h1>' + t.topic.title + '</h1></section>'));
  var tabs = [["lecture","01 Лекция"],["practice","02 Практика"],["self","03 Сам. работа"],["test","04 Тест"]];
  var tw = el('<div class="tabs"></div>');
  tabs.forEach(function(item){ tw.appendChild(el('<button class="tab ' + (item[0] === tab ? 'active' : '') + '" onclick="location.hash=\'#/topic/' + id + '/' + item[0] + '\'">' + item[1] + '</button>')); });
  app.appendChild(tw); var panel = el('<section class="panel"></section>'); app.appendChild(panel);

  if (tab === "lecture") {
    if(t.topic.lectures) {
      t.topic.lectures.forEach(function(l){
        panel.appendChild(el('<h3>' + l.code + '. ' + l.title + '</h3>'));
        panel.appendChild(el('<div class="lecture-content">' + (l.content || '<p>Материал готовится.</p>') + '</div>'));
      });
    }
    var isDone = state.progress[id] && state.progress[id].done >= 5;
    var markBtn = el('<button class="btn" style="width:100%; margin-top:20px;" ' + (isDone ? 'disabled' : '') + '>' + (isDone ? '✅ Тема изучена' : 'Отметить как изученное (+20 XP)') + '</button>');
    markBtn.onclick = function() { if (!state.progress[id]) state.progress[id] = {}; state.progress[id].done = 5; state.xp += 20; saveStudentData(); window.showToast("Лекция изучена!", "ok"); markBtn.textContent = "✅ Тема изучена"; markBtn.disabled = true; };
    panel.appendChild(markBtn);
  }
  
  if (tab === "practice") {
    if(t.topic.practicals) {
      t.topic.practicals.forEach(function(p){
        var status = state.practicalsDone[id] && state.practicalsDone[id][p.code];
        var grade = state.practicalGrades[id] && state.practicalGrades[id][p.code];
        
        var html = '<div class="practice" style="margin-bottom:24px;border:1px solid var(--border);padding:20px;border-radius:12px;background:var(--card-soft);">';
        html += '<div style="color:var(--accent);font-weight:bold;font-size:16px;">' + p.code + '</div>';
        html += '<div style="font-weight:bold;margin:4px 0 12px 0;font-size:18px;">' + p.title + '</div>';
        if(p.goal) html += '<div style="font-size:14px;color:var(--muted);margin-bottom:12px;"><b>Цель:</b> ' + p.goal + '</div>';
        if(p.task) html += '<div style="margin-bottom:12px;"><b>Задание:</b> ' + p.task + '</div>';
        if(p.example) html += '<div style="margin-bottom:12px;background:var(--accent-soft);padding:12px;border-radius:8px;border-left:4px solid var(--accent);"><b>Пример:</b> ' + p.example + '</div>';
        if(p.solution && p.solution.length) {
          html += '<div style="margin-bottom:16px;border:1px dashed var(--border);padding:12px;border-radius:8px;background:var(--card);"><b style="color:var(--accent);">Ход решения:</b><ol style="margin:8px 0 0 20px;padding:0;font-size:14px;">';
          p.solution.forEach(function(s){ html += '<li style="margin-bottom:6px;">' + s + '</li>'; });
          html += '</ol></div>';
        }
        if(p.variants && p.variants.rows) {
          html += '<div style="margin-top:16px;"><b style="color:var(--accent);">Варианты:</b><div style="overflow-x:auto;margin-top:8px;"><table style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr>';
          if(p.variants.header) p.variants.header.forEach(function(h){ html += '<th style="border:1px solid var(--border);padding:8px;background:var(--card);">' + h + '</th>'; });
          html += '</tr></thead><tbody>';
          p.variants.rows.forEach(function(r){ html += '<tr>'; r.forEach(function(c){ html += '<td style="border:1px solid var(--border);padding:8px;">' + c + '</td>'; }); html += '</tr>'; });
          html += '</tbody></table></div></div>';
        }
        
        html += '<div style="margin-top:20px; padding-top:16px; border-top:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">';
        if (status === "approved") {
            html += '<div style="color:var(--ok); font-weight:bold;">✅ Работа подтверждена преподавателем.</div>';
            if (grade) html += '<div style="background:var(--card); padding:8px 16px; border-radius:8px; border:1px solid var(--border);">Оценка: <b style="font-size:18px; color:var(--accent);">' + grade + '</b></div>';
        } else if (status === "pending") {
            html += '<div style="color:#d97706; font-weight:bold;">⏳ На проверке у преподавателя.</div>';
        } else {
            html += '<div style="color:var(--muted); font-size:13px; flex: 1 1 100%; margin-bottom:10px;">📌 Все работы сдаются одной папкой в конце курса.</div>';
            html += '<button class="btn" onclick="window.markPracticalDone(\'' + id + '\', \'' + p.code + '\')">✅ Сделал</button>';
        }
        html += '</div>';
        html += '</div>';
        panel.appendChild(el(html));
      });
    }
  }

  if (tab === "self" || tab === "test") {
    var result = state.results[id] || state.selfResults[id];
    var reqKey = id + "_" + tab;
    var reqStatus = state.requests && state.requests[reqKey];
    var attempts = state.allowedAttempts && state.allowedAttempts[reqKey] ? state.allowedAttempts[reqKey] : 1;
    
    if (result && attempts <= 1) {
      panel.appendChild(el(`<div style="text-align:center;padding:40px;">
        <h2 style="font-size:28px;">✅ Работа сдана</h2>
        <p style="font-size:18px;color:var(--text-soft);margin:16px 0;">Ваша оценка: <b style="font-size:24px;color:var(--accent);">${result.grade}</b></p>
        <p class="sub">Повторное прохождение закрыто.</p>
        ${reqStatus === 'pending' 
            ? '<p style="color:#d97706;font-weight:bold;">⏳ Запрос на попытку отправлен</p>' 
            : `<button class="btn" onclick="window.requestAttempt('${id}', '${tab}')">Запросить доп. попытку</button>`}
      </div>`));
    } else if (tab === "self" && t.topic.selfChecks) {
      var selfWrap = el('<div></div>'); panel.appendChild(selfWrap);
      t.topic.selfChecks.forEach(function(q, i){ selfWrap.appendChild(el('<div class="question"><div class="q-text">' + (i+1) + '. ' + q.q + '</div><input type="text" class="self-input" data-idx="' + i + '" placeholder="Ваш ответ"><div class="self-feedback" id="fb_' + i + '" style="font-size:13px; margin-top:4px;"></div></div>')); });
      
      var reviewBox = el('<div id="selfReview" style="margin-top:20px;"></div>'); panel.appendChild(reviewBox);
      var checkBtn = el('<button class="btn" style="width:100%;margin-top:10px;">Завершить и проверить</button>');
      panel.appendChild(checkBtn);
      
      checkBtn.onclick = function() {
        var correctCount = 0;
        var reviewHtml = '<div style="background:var(--card-soft); padding:20px; border-radius:12px; border:1px solid var(--border);"><h3 style="margin-top:0;">📝 Разбор ответов</h3>';
        
        selfWrap.querySelectorAll(".self-input").forEach(function(inp) { 
          var idx = Number(inp.getAttribute("data-idx")); 
          var q = t.topic.selfChecks[idx]; 
          var userAns = inp.value.trim().toLowerCase();
          var isCorrect = (userAns === q.a.trim().toLowerCase());
          
          if (isCorrect) correctCount++;
          
          reviewHtml += `<div style="margin-bottom:12px; padding:12px; border-radius:8px; background:${isCorrect ? 'rgba(45,122,79,0.1)' : 'rgba(192,57,43,0.1)'}; border:1px solid ${isCorrect ? 'var(--ok)' : 'var(--err)'};">
              <div style="font-weight:bold; margin-bottom:4px;">${idx+1}. ${q.q}</div>
              <div style="font-size:14px; color:${isCorrect ? 'var(--ok)' : 'var(--err)'};">Ваш ответ: ${inp.value || '<i>Пусто</i>'}</div>
              <div style="font-size:14px; color:var(--text); margin-top:4px;">Правильный ответ: <b>${q.a}</b></div>
          </div>`;
        });
        
        reviewHtml += '</div>';
        reviewBox.innerHTML = reviewHtml;
        checkBtn.disabled = true;
        checkBtn.textContent = "Результаты сохранены";
        
        var grade = Math.max(2, Math.round((correctCount/t.topic.selfChecks.length)*5)); 
        state.selfResults[id] = { grade: grade }; 
        saveStudentData();
        window.showToast("Работа сдана! Оценка: " + grade, "ok");
      };
    } else if (tab === "test" && t.topic.test) {
      var timerBox = el('<div style="font-size:20px;font-weight:bold;color:var(--err);margin-bottom:16px;">⏱ 15:00</div>'); panel.appendChild(timerBox);
      var testWrap = el('<div></div>'); panel.appendChild(testWrap);
      
      t.topic.test.forEach(function(q, qi){
        var qb = el('<div class="question"><div class="q-text">' + (qi+1) + '. ' + q.q + '</div></div>');
        q.options.forEach(function(opt, oi){ qb.appendChild(el('<label class="option"><input type="radio" name="q' + qi + '" value="' + oi + '"><span>' + opt + '</span></label>')); });
        testWrap.appendChild(qb);
      });
      
      var reviewBox = el('<div id="testReview" style="margin-top:20px;"></div>'); panel.appendChild(reviewBox);
      var finishBtn = el('<button class="btn" style="width:100%;margin-top:10px;">Завершить тест</button>'); panel.appendChild(finishBtn);
      
      var timeLeft = 15 * 60; var timerId = setInterval(function() {
        if (!document.body.contains(timerBox)) { clearInterval(timerId); return; }
        timeLeft--; timerBox.textContent = "⏱ " + String(Math.floor(timeLeft/60)).padStart(2,'0') + ":" + String(timeLeft%60).padStart(2,'0');
        if (timeLeft <= 0) { clearInterval(timerId); finishBtn.click(); }
      }, 1000);
      
      finishBtn.onclick = function() {
        clearInterval(timerId); 
        var correct = 0;
        var reviewHtml = '<div style="background:var(--card-soft); padding:20px; border-radius:12px; border:1px solid var(--border);"><h3 style="margin-top:0;">📝 Разбор ответов</h3>';
        
        t.topic.test.forEach(function(q, qi) {
          var ch = testWrap.querySelector('input[name="q' + qi + '"]:checked');
          var userAns = ch ? Number(ch.value) : -1;
          var isCorrect = (userAns === q.correct);
          
          if (isCorrect) correct++;
          
          reviewHtml += `<div style="margin-bottom:12px; padding:12px; border-radius:8px; background:${isCorrect ? 'rgba(45,122,79,0.1)' : 'rgba(192,57,43,0.1)'}; border:1px solid ${isCorrect ? 'var(--ok)' : 'var(--err)'};">
              <div style="font-weight:bold; margin-bottom:4px;">${qi+1}. ${q.q}</div>
              <div style="font-size:14px; color:${isCorrect ? 'var(--ok)' : 'var(--err)'};">Ваш ответ: ${userAns !== -1 ? q.options[userAns] : '<i>Нет ответа</i>'}</div>
              <div style="font-size:14px; color:var(--text); margin-top:4px;">Правильный ответ: <b>${q.options[q.correct]}</b></div>
          </div>`;
        });
        
        reviewHtml += '</div>';
        reviewBox.innerHTML = reviewHtml;
        finishBtn.disabled = true;
        finishBtn.textContent = "Тест завершен";
        
        var grade = Math.max(2, Math.round((correct / t.topic.test.length) * 5)); 
        state.results[id] = { grade: grade }; 
        if (state.allowedAttempts && state.allowedAttempts[reqKey]) {
            state.allowedAttempts[reqKey] = 1; 
        }
        saveStudentData();
        window.showToast("Тест сдан! Оценка: " + grade, "ok"); 
      };
    }
  }
}

function renderSimulatorPage(){
  var app = $("app"); app.innerHTML = ""; app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  var block = el('<section class="module"><h2>🖥️ Симулятор</h2><textarea id="gcodeInput" style="width:100%;height:120px;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--card-soft);margin-bottom:10px;font-family:monospace;">G00 X0 Y0\nG01 X50 Y50\nG01 X100 Y50\nG01 X100 Y0\nG01 X0 Y0</textarea><button class="btn" id="runCodeBtn" style="width:100%;margin-bottom:10px;">▶ Выполнить</button><div style="background:var(--card-soft);border:1px solid var(--border);border-radius:8px;overflow:hidden;"><canvas id="simCanvas" width="600" height="400" style="width:100%;height:auto;background:#fff;"></canvas></div></section>');
  app.appendChild(block); var canvas = block.querySelector("#simCanvas"), ctx = canvas.getContext("2d"); var runBtn = block.querySelector("#runCodeBtn"), input = block.querySelector("#gcodeInput");
  function drawGrid() { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.strokeStyle = "#eee"; for (var i = 0; i < canvas.width; i += 20) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); } for (var j = 0; j < canvas.height; j += 20) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke(); } ctx.strokeStyle = "#333"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, canvas.height/2); ctx.lineTo(canvas.width, canvas.height/2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(canvas.width/2, 0); ctx.lineTo(canvas.width/2, canvas.height); ctx.stroke(); }
  drawGrid(); runBtn.onclick = function() { drawGrid(); var lines = input.value.split("\n"); var curX = canvas.width/2, curY = canvas.height/2; ctx.beginPath(); ctx.moveTo(curX, curY); ctx.strokeStyle = "red"; ctx.lineWidth = 3; var isDown = false; lines.forEach(function(line) { line = line.trim().toUpperCase(); if(!line) return; var gMatch = line.match(/G0[0-3]/); if(!gMatch) return; var xMatch = line.match(/X(-?\d+(\.\d+)?)/); var yMatch = line.match(/Y(-?\d+(\.\d+)?)/); if(xMatch) curX = canvas.width/2 + parseFloat(xMatch[1]) * 2; if(yMatch) curY = canvas.height/2 - parseFloat(yMatch[1]) * 2; if(gMatch[0] === "G00") { ctx.moveTo(curX, curY); } else { ctx.lineTo(curX, curY); isDown = true; } }); if(isDown) ctx.stroke(); window.showToast("Траектория построена!", "ok"); };
}

function renderShopPage(){
  var app = $("app"); app.innerHTML = ""; app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el('<section class="hero"><h1>Магазин XP</h1><p>У вас: 🌟 <b>' + state.xp + ' XP</b></p></section>'));
  
  var items = [
    { id: "avatar_custom", icon: "🖼️", title: "Загрузить аватар", price: 100000, type: "upload", desc: "Своя картинка вместо смайлика" },
    { id: "avatar_animated", icon: "🎞️", title: "Анимированный аватар", price: 500000, type: "upload_animated", desc: "GIF-аватар" },
    { id: "nick", icon: "🏷️", title: "Кастомный Ник", price: 200, type: "input", field: "nick", placeholder: "Введите ваш ник..." },
    { id: "sign", icon: "✍️", title: "Подпись в профиле", price: 300, type: "input", field: "sign", placeholder: "Введите вашу подпись..." },
    { id: "effect_waves", icon: "🌊", title: "Эффект 'Волны'", price: 50000, type: "effect", effect: "waves" },
    { id: "effect_pulse", icon: "💓", title: "Эффект 'Пульс'", price: 75000, type: "effect", effect: "pulse" },
    { id: "effect_matrix", icon: "🟩", title: "Эффект 'Матрица'", price: 100000, type: "effect", effect: "matrix" },
    { id: "theme_matrix", icon: "🟩", title: "Тема 'Матрица'", price: 500, type: "theme", theme: "matrix" },
    { id: "theme_cosmos", icon: "🌌", title: "Тема 'Космос'", price: 800, type: "theme", theme: "cosmos" },
    { id: "theme_gold", icon: "🪙", title: "Тема 'Золото'", price: 1000, type: "theme", theme: "gold" },
    { id: "theme_anime", icon: "⛩️", title: "Тема 'Аниме'", price: 1500, type: "theme", theme: "anime" },
    { id: "theme_hacker", icon: "💻", title: "Тема 'Хакер'", price: 2000, type: "theme", theme: "hacker" },
    { id: "theme_cyber", icon: "🤖", title: "Тема 'Кибер'", price: 2500, type: "theme", theme: "cyber" },
    { id: "theme_matrioska", icon: "🪆", title: "Тема 'Матрешка'", price: 3000, type: "theme", theme: "matrioska" }
  ];
  
  var grid = el('<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:16px;"></div>');
  
  items.forEach(function(it){
    var has = state.shop.includes(it.id) || state.staff;
    var btn = el('<button class="btn" style="width:100%;margin-top:10px;" ' + (has || state.xp < it.price ? 'disabled' : '') + '>' + (has ? 'Куплено' : (state.xp < it.price ? 'Мало XP' : 'Купить')) + '</button>');
    
    if (state.staff) {
        btn.textContent = "Доступно (Учитель)";
        btn.style.background = "var(--accent-soft)";
        btn.style.color = "var(--accent)";
        btn.style.border = "1px solid var(--accent)";
    } else if (!has && state.xp >= it.price) { 
        btn.onclick = function() { 
            if (it.type === "input") {
                var val = prompt(it.placeholder, state[it.field] || "");
                if (val === null) return;
                state[it.field] = val.trim();
            } else if (it.type === "theme") {
                applyTheme(it.theme);
            } else if (it.type === "effect") {
                state.effects.push(it.effect);
                applyEffects();
            } else if (it.type === "upload" || it.type === "upload_animated") {
                var fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = it.type === "upload" ? "image/*" : "image/gif";
                
                fileInput.onchange = function(e) {
                    var file = e.target.files[0];
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) { window.showToast("Файл слишком большой (макс 2МБ)", "err"); return; }
                    
                    var reader = new FileReader();
                    reader.onload = function(ev) {
                        state.avatar = ev.target.result;
                        saveStudentData();
                        renderUserChip();
                        renderShopPage();
                        window.showToast("Аватар установлен!", "ok");
                    };
                    reader.readAsDataURL(file);
                };
                fileInput.click();
            }
            
            if (it.type !== "upload" && it.type !== "upload_animated") {
                state.xp -= it.price; 
                state.shop.push(it.id); 
                saveStudentData(); 
                renderShopPage(); 
                renderUserChip();
                window.showToast("Покупка совершена!", "ok"); 
            }
        }; 
    }
    
    var descHtml = it.desc ? `<div style="font-size:12px; color:var(--muted); margin-top:4px;">${it.desc}</div>` : "";
    
    var card = el(`<div style="background:var(--card);border:1px solid var(--border);padding:16px;border-radius:12px;text-align:center;display:flex;flex-direction:column;justify-content:space-between;"><div><div style="font-size:40px;margin-bottom:10px;">${it.icon}</div><div style="font-weight:bold;">${it.title}</div>${descHtml}</div><div style="margin-top:10px;"><div style="color:var(--accent);font-weight:bold;margin-bottom:8px;">${it.price} XP</div></div></div>`);
    card.appendChild(btn); 
    grid.appendChild(card);
  });
  app.appendChild(grid);
}

function renderPortfolioPage(){
  var app = $("app"); app.innerHTML = ""; app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el('<div id="portfolioPrint" class="module" style="padding:40px;"><h1 style="text-align:center;">ПОРТФОЛИО</h1><hr style="margin:20px 0;"><p><b>ФИО:</b> ' + state.student.name + '</p><p><b>Группа:</b> ' + state.student.group + '</p><p><b>XP:</b> ' + state.xp + '</p></div><button class="btn" style="margin-top:20px;width:100%;" onclick="window.print()">🖨 В PDF</button>'));
}

function route(){
  closeDrawer();
  
  if (state.student) loadStudentData();

  var hash = location.hash.replace(/^#/, "") || "/"; var parts = hash.split("/").filter(Boolean); var app = $("app"); if(!app) return;
  if (!state.student && !state.staff) { app.innerHTML = ""; return; }
  
  try {
      if (parts[0] === "topic" && parts[1]) renderTopic(parts[1], parts[2]);
      else if (parts[0] === "simulator") renderSimulatorPage();
      else if (parts[0] === "shop") renderShopPage();
      else if (parts[0] === "portfolio") renderPortfolioPage();
      else if (parts[0] === "profile") window.renderProfilePage && window.renderProfilePage();
      else if (parts[0] === "dashboard") window.renderDashboard && window.renderDashboard();
      else if (parts[0] === "journal") window.renderJournalPage && window.renderJournalPage();
      else if (parts[0] === "requests") window.renderRequestsPage && window.renderRequestsPage();
      else if (parts[0] === "notifications") window.renderNotificationsPage && window.renderNotificationsPage();
      else if (parts[0] === "schedule") window.renderSchedulePage && window.renderSchedulePage();
      else if (parts[0] === "rating") window.renderRatingPage && window.renderRatingPage();
      else if (parts[0] === "links") window.renderLinksPage && window.renderLinksPage();
      else if (parts[0] === "gcode-reference") window.renderGCodeReferencePage && window.renderGCodeReferencePage();
      else if (parts[0] === "final-exam") window.renderFinalExamPage && window.renderFinalExamPage();
      else if (parts[0] === "final-training") window.renderFinalTrainingPage && window.renderFinalTrainingPage();
      else if (parts[0] === "event") window.renderDeadlyPartyPage && window.renderDeadlyPartyPage();
      else if (parts[0] === "tictactoe") window.renderTicTacToePage && window.renderTicTacToePage();
      else if (parts[0] === "sudoku") window.renderSudokuPage && window.renderSudokuPage();
      else if (parts[0] === "minesweeper") window.renderMinesweeperPage && window.renderMinesweeperPage(); // НОВОЕ
      else if (parts[0] === "spider") window.renderSpiderPage && window.renderSpiderPage(); // НОВОЕ
      else if (parts[0] === "chat") window.renderChatPage && window.renderChatPage();
      else if (parts[0] === "comments") window.renderCommentsPage && window.renderCommentsPage();
      else renderHome();
  } catch (err) {
      console.error("Routing error:", err);
      app.innerHTML = '<div class="module" style="text-align:center; padding:40px;"><h2>Ошибка загрузки страницы</h2><p class="sub" style="color:var(--err);">' + err.message + '</p><button class="btn" onclick="location.reload()">Обновить страницу</button></div>';
  }
  window.scrollTo(0, 0);
}

window.addEventListener("DOMContentLoaded", function() {
  try {
      if (!state.student && !state.staff) { $("loginOverlay").hidden = false; } else { $("loginOverlay").hidden = true; }
      if (state.student) {
          loadStudentData();
          checkDailyLogin();
      }
  } catch(e) { console.error("Init error:", e); }
  
  if($("themeToggle")) $("themeToggle").addEventListener("click", openThemeModal);
  if($("burgerBtn")) $("burgerBtn").addEventListener("click", toggleDrawer);
  if($("drawerOverlay")) $("drawerOverlay").addEventListener("click", closeDrawer);
  if($("drawerClose")) $("drawerClose").addEventListener("click", closeDrawer);
  document.querySelectorAll("[data-go]").forEach(function(item) { item.addEventListener("click", function(e) { e.preventDefault(); location.hash = item.getAttribute("data-go"); closeDrawer(); }); });
  
  if (window.initAssistantButton) window.initAssistantButton();
  
  try {
      renderUserChip(); 
      route();
  } catch(e) { console.error("Render error:", e); }
});
window.addEventListener("hashchange", route);