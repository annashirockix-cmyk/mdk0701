/* ============================================================
   МДК 07.01 — script.js (v115.0 — LEVELS & PERKS)
   ============================================================ */
"use strict";

var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzB0v37m5pC0jSnEmCEllIlN3IlRmgOhaPEW9giHbS6wNIYFHClxJv8Z5HyG4-AJBpdaQ/exec";

var state = { 
  student: null, staff: null, progress: {}, results: {}, selfResults: {}, 
  practicalsDone: {}, practicalGrades: {}, requests: {}, allowedAttempts: {},
  favorites: [], xp: 0, shop: [], achievements: {},
  loginStreak: 0, lastLoginDate: null, nick: null, sign: null,
  notifications: [], schedule: [], avatar: null, effects: [], customBg: null
};

// Безопасная загрузка сессии
try { 
  var _s = JSON.parse(localStorage.getItem("mdk0701.student") || sessionStorage.getItem("mdk0701.student") || "null"); 
  if (_s && _s.name) state.student = _s; 
} catch (e){}

try { 
  var _st = JSON.parse(sessionStorage.getItem("mdk0701.staff") || "null"); 
  if (_st && _st.role) state.staff = _st; 
} catch (e){}

/* ---------------- УРОВНИ И ПЛЮШКИ ---------------- */

function getLevel(xp) { 
    if (!xp || xp <= 0) return 1;
    return Math.floor(Math.sqrt(xp / 100)) + 1; 
}

function getXpForNextLevel(level) { 
    return Math.pow(level, 2) * 100; 
}

function getLevelBonuses(level) {
    var bonuses = [];
    if (level >= 5)   bonuses.push({ lvl: 5, name: "+5% к получаемому XP" });
    if (level >= 10)  bonuses.push({ lvl: 10, name: "+10% XP, Скидка 5% в магазине" });
    if (level >= 20)  bonuses.push({ lvl: 20, name: "+20% XP, Скидка 10%" });
    if (level >= 30)  bonuses.push({ lvl: 30, name: "+30% XP, Скидка 15%" });
    if (level >= 40)  bonuses.push({ lvl: 40, name: "+40% XP, Скидка 20%" });
    if (level >= 50)  bonuses.push({ lvl: 50, name: "+50% XP, Скидка 25%" });
    if (level >= 100) bonuses.push({ lvl: 100, name: "Максимальный уровень! Скидка 50%, +100% XP" });
    return bonuses;
}

function updateXpDisplay() {
    if ($("xpCount")) {
        var lvl = getLevel(state.xp);
        $("xpCount").textContent = "🌟 " + state.xp + " XP · Ур. " + lvl;
    }
}

/* ---------------- УТИЛИТЫ ---------------- */

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

/* ---------------- УВЕДОМЛЕНИЯ ---------------- */

window.addNotification = function(text, type) {
    type = type || "info";
    if (!state.notifications) state.notifications = [];
    state.notifications.unshift({ id: Date.now() + Math.random(), text: text, type: type, date: new Date().toISOString(), read: false });
    if (state.notifications.length > 50) state.notifications.pop();
    updateNotifBadge();
};

function updateNotifBadge() {
    var badge = $("notifBadge");
    if (!badge) return;
    var unread = (state.notifications || []).filter(function(n){ return !n.read; }).length;
    if (unread > 0) { badge.textContent = unread; badge.style.display = "inline-block"; }
    else { badge.style.display = "none"; }
}

/* ---------------- XP ---------------- */

window.addXP = function(amount) {
    var level = getLevel(state.xp);
    var multiplier = 1 + Math.floor(level / 10) * 0.1;
    var finalAmount = Math.round(amount * multiplier);
    
    state.xp += finalAmount;
    checkAchievements();
    if (window.saveStudentData) saveStudentData();
    updateXpDisplay();
    
    var lvlMsg = multiplier > 1 ? " (x" + multiplier.toFixed(1) + ")" : "";
    window.showToast("+" + finalAmount + " XP" + lvlMsg, "ok");
};

/* ---------------- ДОСТИЖЕНИЯ (500+) ---------------- */

function getAchievementsList() {
    var list = [];
    for (var i = 1; i <= 500; i++) {
        var xpReq = i * 100;
        var rank = "Новичок";
        if (i > 450) rank = "Легенда";
        else if (i > 350) rank = "Гуру";
        else if (i > 250) rank = "Эксперт";
        else if (i > 150) rank = "Мастер";
        else if (i > 80) rank = "Профессионал";
        else if (i > 40) rank = "Специалист";
        else if (i > 15) rank = "Стажер";
        else if (i > 5) rank = "Ученик";
        
        var icon = "🌟";
        if (i % 100 === 0) icon = "🏆";
        else if (i % 50 === 0) icon = "👑";
        else if (i % 10 === 0) icon = "⭐";
        
        list.push({
            id: "xp_" + i,
            xp: xpReq,
            title: rank + " " + i,
            icon: icon,
            desc: "Набрать " + xpReq + " XP"
        });
    }
    // Спец. достижения
    list.push({ id: "t_theme", title: "Модник", icon: "🎨", desc: "Купить и применить тему", xp: 0 });
    list.push({ id: "t_avatar", title: "Свой стиль", icon: "🖼️", desc: "Установить свой аватар", xp: 0 });
    list.push({ id: "t_ttt", title: "Победитель ИИ", icon: "❌", desc: "Победить в крестики-нолики 4×4", xp: 0 });
    list.push({ id: "t_sudoku", title: "Логик", icon: "🔢", desc: "Решить судоку", xp: 0 });
    list.push({ id: "t_minesweeper", title: "Сапёр", icon: "💣", desc: "Пройти сапёра", xp: 0 });
    list.push({ id: "t_final_exam", title: "Выпускник", icon: "🎓", desc: "Сдать итоговый экзамен", xp: 0 });
    list.push({ id: "t_nick", title: "Инкогнито", icon: "🏷️", desc: "Установить ник", xp: 0 });
    list.push({ id: "t_sign", title: "Философ", icon: "✍️", desc: "Добавить подпись в профиль", xp: 0 });
    
    return list;
}

function checkAchievements() {
    var achList = getAchievementsList();
    var hasNew = false;
    achList.forEach(function(a) {
        if (a.xp > 0 && state.xp >= a.xp && !state.achievements[a.id]) {
            state.achievements[a.id] = true;
            if (!state.notifications) state.notifications = [];
            state.notifications.unshift({ id: Date.now() + Math.random(), text: "Получено достижение: " + a.title, type: "ok", date: new Date().toISOString(), read: false });
            hasNew = true;
        }
    });
    if (hasNew) updateNotifBadge();
}

window.unlockAchievement = function(id) {
    if (!state.achievements) state.achievements = {};
    if (!state.achievements[id]) {
        state.achievements[id] = true;
        if (window.saveStudentData) saveStudentData();
        var a = getAchievementsList().find(function(x){ return x.id === id; });
        var title = a ? a.title : id;
        window.showToast("🏆 Достижение: " + title, "ok");
        addNotification("Получено достижение: " + title, "ok");
    }
};

/* ---------------- ЗАГРУЗКА/СОХРАНЕНИЕ ---------------- */

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
    state.xp = parseInt(localStorage.getItem("mdk0701.xp." + ek) || "0", 10);
    state.shop = JSON.parse(localStorage.getItem("mdk0701.shop." + ek) || "[]");
    state.loginStreak = parseInt(localStorage.getItem("mdk0701.loginStreak." + ek) || "0", 10);
    state.lastLoginDate = localStorage.getItem("mdk0701.lastLoginDate." + ek) || null;
    state.avatar = localStorage.getItem("mdk0701.avatar." + ek) || null;
    state.effects = JSON.parse(localStorage.getItem("mdk0701.effects." + ek) || "[]");
    state.customBg = localStorage.getItem("mdk0701.customBg." + ek) || null;
  } catch (e) { console.warn("LocalStorage error", e); }
  
  updateXpDisplay();
  updateNotifBadge();

  if (APPS_SCRIPT_URL && state.student) {
      fetch(APPS_SCRIPT_URL + "?action=getstudentdata&key=" + encodeURIComponent(k) + "&t=" + Date.now())
        .then(function(r){ return r.json(); })
        .then(function(d) {
            if (d && d.ok && d.payload) {
                var serverData = {};
                try { serverData = JSON.parse(d.payload) || {}; } catch(e){}
                var changed = false;
                
                if (serverData.practicalGrades) { state.practicalGrades = serverData.practicalGrades; changed = true; }
                if (serverData.allowedAttempts) { state.allowedAttempts = serverData.allowedAttempts; changed = true; }
                if (serverData.practicalsDone) { state.practicalsDone = serverData.practicalsDone; changed = true; }
                if (serverData.xp !== undefined) { state.xp = serverData.xp; changed = true; }
                if (serverData.requests) { state.requests = serverData.requests; changed = true; }
                else { state.requests = {}; changed = true; }
                if (serverData.avatar) { state.avatar = serverData.avatar; changed = true; }
                if (serverData.effects) { state.effects = serverData.effects; changed = true; }
                if (serverData.customBg !== undefined) { state.customBg = serverData.customBg || null; changed = true; }

                if (changed) {
                    try {
                        localStorage.setItem("mdk0701.practicalGrades." + ek, JSON.stringify(state.practicalGrades));
                        localStorage.setItem("mdk0701.allowedAttempts." + ek, JSON.stringify(state.allowedAttempts));
                        localStorage.setItem("mdk0701.requests." + ek, JSON.stringify(state.requests));
                        localStorage.setItem("mdk0701.practicalsDone." + ek, JSON.stringify(state.practicalsDone));
                        localStorage.setItem("mdk0701.xp." + ek, state.xp);
                        if (state.avatar) localStorage.setItem("mdk0701.avatar." + ek, state.avatar);
                        localStorage.setItem("mdk0701.effects." + ek, JSON.stringify(state.effects));
                        if (state.customBg) localStorage.setItem("mdk0701.customBg." + ek, state.customBg);
                        else localStorage.removeItem("mdk0701.customBg." + ek);
                    } catch (e) {}
                    
                    updateXpDisplay();
                    renderUserChip();
                }
            }
        }).catch(function(e){ console.warn("Sync error", e); });
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
    if (state.customBg) localStorage.setItem("mdk0701.customBg." + ek, state.customBg);
    else localStorage.removeItem("mdk0701.customBg." + ek);
    localStorage.setItem("mdk0701.notifications." + ek, JSON.stringify(state.notifications));
    localStorage.setItem("mdk0701.schedule", JSON.stringify(state.schedule));
  } catch (e) { console.warn("LocalStorage save error", e); }
  
  updateXpDisplay();
  checkAchievements();

  if (APPS_SCRIPT_URL && state.student) {
    var p = new URLSearchParams();
    p.append("action", "save"); p.append("key", k);
    p.append("name", state.student.name); p.append("group", state.student.group);
    p.append("payload", JSON.stringify({ 
      progress: state.progress, results: state.results, selfResults: state.selfResults, 
      practicalsDone: state.practicalsDone, practicalGrades: state.practicalGrades,
      requests: state.requests, allowedAttempts: state.allowedAttempts, favorites: state.favorites,
      xp: state.xp, nick: state.nick, sign: state.sign, notifications: state.notifications,
      avatar: state.avatar, effects: state.effects, customBg: state.customBg
    }));
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p }).catch(function(){});
  }
}

/* ---------------- ЕЖЕДНЕВНЫЙ ВХОД ---------------- */

function checkDailyLogin() {
    if (!state.student) return;
    var today = new Date().toDateString();
    if (state.lastLoginDate !== today) {
        var xpGained = 20;
        var streakMsg = "";
        if (state.lastLoginDate) {
            var lastDate = new Date(state.lastLoginDate);
            var now = new Date(today);
            lastDate.setHours(0,0,0,0); now.setHours(0,0,0,0);
            var diffDays = Math.round((now - lastDate) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                state.loginStreak++;
                var bonus = Math.min(state.loginStreak * 10, 100);
                xpGained += bonus;
                streakMsg = " (🔥 Серия: " + state.loginStreak + " дней! Бонус +" + bonus + " XP)";
            } else {
                state.loginStreak = 1; streakMsg = " (Серия сброшена)";
            }
        } else {
            state.loginStreak = 1;
        }
        state.lastLoginDate = today;
        window.addXP(xpGained);
        setTimeout(function() { window.showToast("Ежедневный вход: +" + xpGained + " XP" + streakMsg, "ok"); }, 1000);
    }
}

/* ---------------- ДЕЙСТВИЯ СТУДЕНТА ---------------- */

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

/* ---------------- ДЕЙСТВИЯ ПРЕПОДАВАТЕЛЯ ---------------- */

window.approvePractical = function(studentKeyStr, topicId, code, grade) {
    var p = new URLSearchParams();
    p.append("action", "approvework"); p.append("key", studentKeyStr); 
    p.append("topicId", topicId); p.append("code", code); p.append("grade", grade);
    
    window.showToast("Сохранение оценки...", "info");
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p })
        .then(function(r){ return r.json(); })
        .then(function(d) {
            if (d && d.ok) {
                window.showToast("Оценка " + grade + " выставлена!", "ok");
                var elToRemove = document.getElementById("req_" + topicId + "_" + code);
                if (elToRemove) elToRemove.remove();
            } else window.showToast("Ошибка сохранения", "err");
        }).catch(function(){ window.showToast("Ошибка сети", "err"); });
};

window.approveAttempt = function(studentKeyStr, reqKey) {
    var p = new URLSearchParams();
    p.append("action", "approveattempt"); p.append("key", studentKeyStr); p.append("reqKey", reqKey);
    var elToRemove = document.getElementById("req_" + reqKey);
    if (elToRemove) elToRemove.remove();
    window.showToast("Попытка одобрена!", "ok");
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p }).catch(function(){});
};

window.grantXP = function(studentKeyStr, studentName, presetAmount) {
    if (!state.staff) return;
    
    var amount = presetAmount;
    if (amount === undefined || amount === null) {
        amount = prompt("Сколько XP начислить студенту " + studentName + "?\n(Отрицательное число — чтобы снять XP)", "50");
    }
    
    var numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount === 0) return;
    
    var p = new URLSearchParams();
    p.append("action", "grantxp"); p.append("key", studentKeyStr); p.append("amount", numAmount);
    
    var verb = numAmount > 0 ? "Начисление " : "Списание ";
    window.showToast(verb + Math.abs(numAmount) + " XP...", "info");
    
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p })
      .then(function(r){ return r.json(); })
      .then(function(d) {
        if (d && d.ok) {
            var newXp = (d.xp !== undefined) ? d.xp : "?";
            var delta = (d.delta !== undefined) ? d.delta : numAmount;
            var sign = delta > 0 ? "+" : "";
            window.showToast("XP " + sign + delta + " (итого: " + newXp + ")", "ok");
        } else window.showToast("Ошибка: " + ((d && d.error) || "Неизвестно"), "err");
      }).catch(function(){ window.showToast("Ошибка сети.", "err"); });
};

/* ---------------- ТЕМЫ, ЭФФЕКТЫ, ФОН ---------------- */

function applyTheme(theme){ document.documentElement.setAttribute("data-theme", theme); localStorage.setItem("mdk0701.theme", theme); }

function applyCustomBg() {
    var cls = Array.from(document.body.classList);
    cls.forEach(function(c){ if (c.indexOf("bg-") === 0) document.body.classList.remove(c); });
    if (state.customBg) document.body.classList.add("bg-" + state.customBg);
}
window.applyCustomBg = applyCustomBg;

function applyEffects() {
    document.body.classList.remove('effect-waves', 'effect-pulse', 'effect-matrix');
    if (state.effects && state.effects.length > 0) {
        state.effects.forEach(function(eff){ document.body.classList.add('effect-' + eff); });
    }
    applyCustomBg();
}

function openThemeModal(){
  var current = document.documentElement.getAttribute("data-theme") || "light";
  var themes = ["light", "dark", "sepia", "ocean", "forest", "matrix", "cosmos", "gold", "anime", "hacker", "cyber", "matrioska", "rgb"]; 
  var names = ["Светлая", "Тёмная", "Сепия", "Океан", "Лес", "Матрица", "Космос", "Золото", "Аниме", "Хакер", "Кибер", "Матрешка", "RGB"];
  var modal = el('<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center;" id="themeModal"><div style="background:var(--card);padding:24px;border-radius:16px;width:90%;max-width:400px; animation: popIn 0.3s;"><h3 style="margin-top:0;">Выберите тему</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0;" id="themeGrid"></div><button class="btn ghost" style="width:100%" onclick="document.getElementById(\'themeModal\').remove()">Закрыть</button></div></div>');
  var grid = modal.querySelector("#themeGrid");
  
  themes.forEach(function(t, i){ 
      var btn = el('<button class="btn ' + (t===current ? '' : 'ghost') + '" style="padding:12px;">' + names[i] + '</button>'); 
      btn.onclick = function() { 
          if (!state.staff && ["matrix", "cosmos", "gold", "anime", "hacker", "cyber", "matrioska", "rgb"].indexOf(t) !== -1 && !state.shop.includes("theme_" + t)) {
              window.showToast("Тема не куплена!", "err"); return;
          }
          applyTheme(t); modal.remove(); 
      }; 
      grid.appendChild(btn); 
  });
  document.body.appendChild(modal);
}

/* ---------------- ВХОД/ВЫХОД ---------------- */

window.doStudentLogin = function() {
  var n = $("loginName").value.trim(); var g = $("loginGroup").value.trim();
  if (!n || !g) { window.showToast("Введите ФИО и Группу!", "err"); return; }
  state.student = { name: n, group: g.toUpperCase() };
  try { localStorage.setItem("mdk0701.student", JSON.stringify(state.student)); } catch(e){}
  $("loginOverlay").hidden = true; renderUserChip(); loadStudentData(); checkDailyLogin(); route();
};

window.doTeacherLogin = function() {
  var user = $("loginStaffName").value.trim(); var pass = $("loginStaffPass").value.trim(); var btn = $("staffLoginBtn");
  if (!user || !pass) { window.showToast("Введите логин и пароль!", "err"); return; }
  btn.textContent = "Проверяем..."; btn.disabled = true;
  fetch(APPS_SCRIPT_URL + "?action=login&username=" + encodeURIComponent(user) + "&password=" + encodeURIComponent(pass) + "&t=" + new Date().getTime())
    .then(function(r){ return r.json(); })
    .then(function(d) {
      if (d && d.ok) { 
          state.staff = { role: d.role, name: d.name }; 
          try { sessionStorage.setItem("mdk0701.staff", JSON.stringify(state.staff)); } catch(e){}
          $("loginOverlay").hidden = true; renderUserChip(); route(); 
      } else { 
          window.showToast("Неверный логин или пароль.", "err"); 
          btn.textContent = "Войти как сотрудник"; btn.disabled = false; 
      }
    }).catch(function() { 
        window.showToast("Ошибка сети.", "err"); btn.textContent = "Войти как сотрудник"; btn.disabled = false; 
    });
};

window.handleLogout = function() {
  if (confirm("Выйти из аккаунта?")) {
    state.student = null; state.staff = null; state.customBg = null;
    try { localStorage.removeItem("mdk0701.student"); sessionStorage.removeItem("mdk0701.staff"); } catch(e){}
    $("loginOverlay").hidden = false; 
    $("userChipName").textContent = "Гость"; $("userChipGroup").textContent = "Роль: Гость"; $("userChipAvatar").innerHTML = "👨‍🎓"; 
    updateXpDisplay(); applyCustomBg(); closeDrawer(); route();
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
          $("userChipAvatar").innerHTML = '<img src="' + state.avatar + '" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">';
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

/* ---------------- ГЛАВНАЯ ---------------- */

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

  var eventBlock = el('<div class="event-card" onclick="location.hash=\'#/event\'">' +
      '<div style="display:flex; justify-content:space-between; align-items:flex-start;">' +
          '<div><h2 style="margin:0 0 10px 0; font-size:24px; color:#ff003c; text-shadow: 0 0 10px rgba(255,0,60,0.5);">🚨 СМЕРТЕЛЬНАЯ ВЕЧЕРИНКА</h2>' +
          '<p style="margin:0; color:#aaa; font-size:14px;">Пройди викторину, чтобы отключить протокол самоуничтожения.</p></div>' +
          '<div style="font-size:40px; animation: pulse 1s infinite;">💀</div>' +
      '</div>' +
      '<div style="margin-top:20px; display:inline-block; background:#ff003c; color:#000; padding:8px 16px; border-radius:8px; font-weight:bold; font-size:14px;">Войти в терминал →</div>' +
  '</div>');
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

  if (c.videos && c.videos.length) {
    app.appendChild(el('<div class="steps-title">Видеоматериалы</div>'));
    var vGrid = el('<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:16px;"></div>');
    c.videos.forEach(function(v) { vGrid.appendChild(el('<div class="module" style="margin:0;padding:16px;"><div style="font-weight:bold;margin-bottom:8px;">' + v.title + '</div><video controls src="' + v.src + '" style="width:100%;border-radius:8px;background:#000;"></video></div>')); });
    app.appendChild(vGrid);
  }
}

/* ---------------- G-CODE СПРАВОЧНИК ---------------- */

window.renderGCodeReferencePage = function() {
  var app = $("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Справочник G/M";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  
  if (!window.GCODE_REFERENCE) { app.appendChild(el('<div class="module">Справочник не загружен.</div>')); return; }

  app.appendChild(el('<section class="hero"><h1>Справочник G- и M-кодов</h1><p>' + window.GCODE_REFERENCE.intro + '</p></section>'));
  
  window.GCODE_REFERENCE.groups.forEach(function(group) {
      var block = el('<section class="module"><h2>' + group.title + '</h2><div class="gcode-ref-list"></div></section>');
      var list = block.querySelector('.gcode-ref-list');
      group.items.forEach(function(item) {
          list.appendChild(el('<div class="gcode-ref-item"><div class="gcode-ref-code">' + item.code + '</div><div><div class="gcode-ref-name">' + item.name + '</div><div class="gcode-ref-desc">' + item.desc + '</div><div class="gcode-ref-example"><code>' + escapeHtml(item.example) + '</code></div></div></div>'));
      });
      app.appendChild(block);
  });
};

/* ---------------- ТЕМЫ ---------------- */

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
    var markBtn = el('<button class="btn" style="width:100%; margin-top:20px;" ' + (isDone ? 'disabled' : '') + '>' + (isDone ? '✅ Тема изучена' : 'Отметить как изученное (+50 XP)') + '</button>');
    markBtn.onclick = function() { if (!state.progress[id]) state.progress[id] = {}; state.progress[id].done = 5; addXP(50); markBtn.textContent = "✅ Тема изучена"; markBtn.disabled = true; };
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
        
        html += '<div style="margin-top:20px; padding-top:16px; border-top:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">';
        if (status === "approved") {
            html += '<div style="color:var(--ok); font-weight:bold;">✅ Работа подтверждена преподавателем.</div>';
            if (grade) html += '<div style="background:var(--card); padding:8px 16px; border-radius:8px; border:1px solid var(--border);">Оценка: <b style="font-size:18px; color:var(--accent);">' + grade + '</b></div>';
        } else if (status === "pending") {
            html += '<div style="color:#d97706; font-weight:bold;">⏳ На проверке у преподавателя.</div>';
        } else {
            html += '<button class="btn" onclick="window.markPracticalDone(\'' + id + '\', \'' + p.code + '\')">✅ Сделал</button>';
        }
        html += '</div></div>';
        panel.appendChild(el(html));
      });
    }
  }

  if (tab === "self" || tab === "test") {
    var result = (tab === "self") ? state.selfResults[id] : state.results[id];
    var reqKey = id + "_" + tab;
    var reqStatus = state.requests && state.requests[reqKey];
    var attempts = state.allowedAttempts && state.allowedAttempts[reqKey] ? state.allowedAttempts[reqKey] : 1;
    
    if (result && attempts <= 1) {
      panel.appendChild(el('<div style="text-align:center;padding:40px;">' +
        '<h2 style="font-size:28px;">✅ Работа сдана</h2>' +
        '<p style="font-size:18px;color:var(--text-soft);margin:16px 0;">Ваша оценка: <b style="font-size:24px;color:var(--accent);">' + result.grade + '</b></p>' +
        '<p class="sub">Повторное прохождение закрыто.</p>' +
        (reqStatus === 'pending' ? '<p style="color:#d97706;font-weight:bold;">⏳ Запрос на попытку отправлен</p>' : '<button class="btn" onclick="window.requestAttempt(\'' + id + '\', \'' + tab + '\')">Запросить доп. попытку</button>') +
      '</div>'));
    } else if (tab === "self" && t.topic.selfChecks) {
      var selfWrap = el('<div></div>'); panel.appendChild(selfWrap);
      t.topic.selfChecks.forEach(function(q, i){ selfWrap.appendChild(el('<div class="question"><div class="q-text">' + (i+1) + '. ' + q.q + '</div><input type="text" class="self-input" data-idx="' + i + '" placeholder="Ваш ответ"><div class="self-feedback" id="fb_' + i + '" style="font-size:13px; margin-top:4px;"></div></div>')); });
      
      var checkBtn = el('<button class="btn" style="width:100%;margin-top:10px;">Завершить и проверить</button>');
      panel.appendChild(checkBtn);
      
      checkBtn.onclick = function() {
        var correctCount = 0;
        selfWrap.querySelectorAll(".self-input").forEach(function(inp) { 
          var idx = Number(inp.getAttribute("data-idx")); 
          var q = t.topic.selfChecks[idx]; 
          var isCorrect = (inp.value.trim().toLowerCase() === q.a.trim().toLowerCase());
          if (isCorrect) correctCount++;
        });
        checkBtn.disabled = true; checkBtn.textContent = "Результаты сохранены";
        var grade = Math.max(2, Math.round((correctCount/t.topic.selfChecks.length)*5)); 
        state.selfResults[id] = { grade: grade }; addXP(100); saveStudentData();
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
      
      var finishBtn = el('<button class="btn" style="width:100%;margin-top:10px;">Завершить тест</button>'); panel.appendChild(finishBtn);
      
      var timeLeft = 15 * 60; var timerId = setInterval(function() {
        if (!document.body.contains(timerBox)) { clearInterval(timerId); return; }
        timeLeft--; timerBox.textContent = "⏱ " + String(Math.floor(timeLeft/60)).padStart(2,'0') + ":" + String(timeLeft%60).padStart(2,'0');
        if (timeLeft <= 0) { clearInterval(timerId); finishBtn.click(); }
      }, 1000);
      
      finishBtn.onclick = function() {
        clearInterval(timerId); 
        var correct = 0;
        t.topic.test.forEach(function(q, qi) {
          var ch = testWrap.querySelector('input[name="q' + qi + '"]:checked');
          if (ch && Number(ch.value) === q.correct) correct++;
        });
        finishBtn.disabled = true; finishBtn.textContent = "Тест завершен";
        var grade = Math.max(2, Math.round((correct / t.topic.test.length) * 5)); 
        state.results[id] = { grade: grade }; 
        if (state.allowedAttempts && state.allowedAttempts[reqKey]) state.allowedAttempts[reqKey] = 1; 
        addXP(150); saveStudentData();
        window.showToast("Тест сдан! Оценка: " + grade, "ok"); 
      };
    }
  }
}

/* ---------------- СИМУЛЯТОР ---------------- */

function renderSimulatorPage(){
  var app = $("app"); app.innerHTML = ""; app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  var block = el('<section class="module"><h2>🖥️ Симулятор</h2><textarea id="gcodeInput" style="width:100%;height:120px;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--card-soft);margin-bottom:10px;font-family:monospace;">G00 X0 Y0\nG01 X50 Y50\nG01 X100 Y50\nG01 X100 Y0\nG01 X0 Y0</textarea><button class="btn" id="runCodeBtn" style="width:100%;margin-bottom:10px;">▶ Выполнить</button><div style="background:var(--card-soft);border:1px solid var(--border);border-radius:8px;overflow:hidden;"><canvas id="simCanvas" width="600" height="400" style="width:100%;height:auto;background:#fff;"></canvas></div></section>');
  app.appendChild(block); var canvas = block.querySelector("#simCanvas"), ctx = canvas.getContext("2d"); var runBtn = block.querySelector("#runCodeBtn"), input = block.querySelector("#gcodeInput");
  function drawGrid() { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.strokeStyle = "#eee"; for (var i = 0; i < canvas.width; i += 20) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); } for (var j = 0; j < canvas.height; j += 20) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke(); } ctx.strokeStyle = "#333"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, canvas.height/2); ctx.lineTo(canvas.width, canvas.height/2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(canvas.width/2, 0); ctx.lineTo(canvas.width/2, canvas.height); ctx.stroke(); }
  drawGrid(); runBtn.onclick = function() { drawGrid(); var lines = input.value.split("\n"); var curX = canvas.width/2, curY = canvas.height/2; ctx.beginPath(); ctx.moveTo(curX, curY); ctx.strokeStyle = "red"; ctx.lineWidth = 3; var isDown = false; lines.forEach(function(line) { line = line.trim().toUpperCase(); if(!line) return; var gMatch = line.match(/G0[0-3]/); if(!gMatch) return; var xMatch = line.match(/X(-?\d+(\.\d+)?)/); var yMatch = line.match(/Y(-?\d+(\.\d+)?)/); if(xMatch) curX = canvas.width/2 + parseFloat(xMatch[1]) * 2; if(yMatch) curY = canvas.height/2 - parseFloat(yMatch[1]) * 2; if(gMatch[0] === "G00") { ctx.moveTo(curX, curY); } else { ctx.lineTo(curX, curY); isDown = true; } }); if(isDown) ctx.stroke(); window.showToast("Траектория построена!", "ok"); };
}

/* ---------------- МАГАЗИН ---------------- */

function renderShopPage(){
  var app = $("app"); app.innerHTML = ""; app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  
  var lvl = getLevel(state.xp);
  var discount = Math.floor(lvl / 10) * 0.05;
  var discountPct = Math.round(discount * 100);
  
  app.appendChild(el('<section class="hero"><h1>Магазин XP</h1><p>У вас: 🌟 <b>' + state.xp + ' XP</b> (Ур. ' + lvl + ')' + (discount > 0 ? '<br><span style="color:var(--ok);font-size:14px;">🎁 Ваша скидка: ' + discountPct + '%</span>' : '') + '</p></section>'));
  
  var items = [
    { id: "avatar_custom", icon: "🖼️", title: "Загрузить аватар", price: 1500, type: "upload" },
    { id: "nick", icon: "🏷️", title: "Кастомный Ник", price: 500, type: "input", field: "nick" },
    { id: "sign", icon: "✍️", title: "Подпись в профиле", price: 500, type: "input", field: "sign" },
    { id: "effect_waves", icon: "🌊", title: "Эффект 'Волны'", price: 800, type: "effect", effect: "waves" },
    { id: "effect_pulse", icon: "💓", title: "Эффект 'Пульс'", price: 1200, type: "effect", effect: "pulse" },
    { id: "effect_matrix", icon: "🟩", title: "Эффект 'Матрица'", price: 2000, type: "effect", effect: "matrix" },
    { id: "theme_matrix", icon: "🟩", title: "Тема 'Матрица'", price: 500, type: "theme", theme: "matrix" },
    { id: "theme_cyber", icon: "🤖", title: "Тема 'Кибер'", price: 1500, type: "theme", theme: "cyber" },
    { id: "bg_dots", icon: "🔵", title: "Фон: Точки", price: 300, type: "bg", bg: "dots" },
    { id: "bg_grid", icon: "▦", title: "Фон: Сетка", price: 400, type: "bg", bg: "grid" },
    { id: "bg_waves", icon: "〰️", title: "Фон: Волны", price: 500, type: "bg", bg: "waves" },
    { id: "bg_stars", icon: "✨", title: "Фон: Звёзды", price: 700, type: "bg", bg: "stars" }
  ];
  
  var grid = el('<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:16px;"></div>');
  
  items.forEach(function(it){
    var owned = state.shop.indexOf(it.id) !== -1 || !!state.staff;
    var btnText = "", btnDisabled = false, btnHandler = null;
    var finalPrice = Math.floor(it.price * (1 - discount));
    
    if (state.staff) {
        if (it.type === "bg") {
            var isActiveBg = state.customBg === it.bg;
            btnText = isActiveBg ? "Снять фон" : "Применить";
            btnHandler = function() { state.customBg = isActiveBg ? null : it.bg; applyCustomBg(); renderShopPage(); };
        } else if (it.type === "theme") {
            btnText = "Применить тему"; btnHandler = function() { applyTheme(it.theme); window.showToast("Тема применена", "ok"); };
        } else if (it.type === "effect") {
            var active = (state.effects || []).indexOf(it.effect) !== -1;
            btnText = active ? "Отключить" : "Включить";
            btnHandler = function() {
                if (active) state.effects = state.effects.filter(function(e){ return e !== it.effect; });
                else state.effects.push(it.effect);
                applyEffects(); renderShopPage();
            };
        } else { btnText = "Доступно (Учитель)"; btnDisabled = true; }
    } else if (!owned) {
        if (state.xp < finalPrice) { btnText = "Мало XP"; btnDisabled = true; } 
        else {
            btnText = "Купить";
            btnHandler = function() {
                state.xp -= finalPrice;
                state.shop.push(it.id);
                
                if (it.type === "theme") { applyTheme(it.theme); unlockAchievement('t_theme'); }
                else if (it.type === "effect") { if (state.effects.indexOf(it.effect) === -1) state.effects.push(it.effect); applyEffects(); }
                else if (it.type === "bg") { state.customBg = it.bg; applyCustomBg(); }
                else if (it.type === "input") { var val = prompt("Введите значение:", state[it.field] || ""); if (val !== null) state[it.field] = val.trim(); }
                else if (it.type === "upload") {
                    var fileInput = document.createElement('input'); fileInput.type = 'file'; fileInput.accept = "image/*";
                    fileInput.onchange = function(e) {
                        var file = e.target.files[0]; if (!file) return;
                        var reader = new FileReader();
                        reader.onload = function(ev) { state.avatar = ev.target.result; saveStudentData(); renderUserChip(); renderShopPage(); unlockAchievement('t_avatar'); };
                        reader.readAsDataURL(file);
                    }; fileInput.click();
                }
                saveStudentData(); renderShopPage(); renderUserChip(); window.showToast("Покупка совершена!", "ok");
            };
        }
    } else {
        if (it.type === "bg") {
            var isActiveOwned = state.customBg === it.bg;
            btnText = isActiveOwned ? "Снять фон" : "Применить";
            btnHandler = function() { state.customBg = isActiveOwned ? null : it.bg; applyCustomBg(); saveStudentData(); renderShopPage(); };
        } else if (it.type === "theme") { btnText = "Применить тему"; btnHandler = function() { applyTheme(it.theme); }; }
        else if (it.type === "effect") {
            var activeOwned = state.effects.indexOf(it.effect) !== -1;
            btnText = activeOwned ? "Отключить" : "Включить";
            btnHandler = function() {
                if (activeOwned) state.effects = state.effects.filter(function(e){ return e !== it.effect; });
                else state.effects.push(it.effect);
                applyEffects(); saveStudentData(); renderShopPage();
            };
        } else { btnText = "Куплено"; btnDisabled = true; }
    }
    
    var card = el('<div style="background:var(--card);border:1px solid var(--border);padding:16px;border-radius:12px;text-align:center;display:flex;flex-direction:column;justify-content:space-between;">' +
        '<div><div style="font-size:40px;margin-bottom:10px;">' + it.icon + '</div><div style="font-weight:bold;">' + it.title + '</div></div>' +
        '<div style="margin-top:10px;">' +
            '<div style="color:var(--accent);font-weight:bold;margin-bottom:8px;">' + 
            (discount > 0 && !owned ? '<span style="text-decoration:line-through;color:var(--muted);font-size:12px;">' + it.price + '</span> ' : '') + 
            finalPrice + ' XP</div>' +
        '</div></div>');
    
    var btn = el('<button class="btn" style="width:100%;margin-top:10px;">' + btnText + '</button>');
    if (btnDisabled) { btn.disabled = true; btn.classList.add("ghost"); }
    if (btnHandler) btn.onclick = btnHandler;
    if (state.staff && btnDisabled) { btn.style.background = "var(--accent-soft)"; btn.style.color = "var(--accent)"; }
    
    card.appendChild(btn); grid.appendChild(card);
  });
  app.appendChild(grid);
}

/* ---------------- РАСПИСАНИЕ ---------------- */

function normalizeSchDate(v) {
    if (v == null || v === "") return "";
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    var s = String(v).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    var d = new Date(s);
    if (!isNaN(d.getTime())) {
        var y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), dd = String(d.getDate()).padStart(2,'0');
        return y + "-" + m + "-" + dd;
    }
    return s;
}

function formatSchDate(dateStr) {
    if (!dateStr) return "Без даты";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        var p = dateStr.split("-");
        var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
        var days = ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"];
        var months = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
        return days[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
    }
    return dateStr;
}

function renderSchedulePage() {
    var app = $("app"); if (!app) return; app.innerHTML = "";
    var crumbs = $("crumbs"); if (crumbs) crumbs.textContent = "Расписание";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    app.appendChild(el('<section class="hero"><h1>Расписание занятий</h1><p>Осенний семестр 2026-2027</p></section>'));

    var isTeacher = state.staff && (state.staff.role === "teacher" || state.staff.role === "admin");
    var pairs = [
        { num: "0", time: "08:00 - 08:30" }, { num: "1", time: "08:40 - 10:15" },
        { num: "2", time: "10:25 - 12:00" }, { num: "3", time: "12:30 - 14:05" },
        { num: "4", time: "14:15 - 15:50" }, { num: "5", time: "16:00 - 17:35" },
        { num: "6", time: "17:45 - 19:20" }
    ];

    if (isTeacher) {
        var formBlock = el('<section class="module" style="background:var(--accent-soft); border-color:var(--accent);">' +
            '<h3 style="margin-top:0; color:var(--accent);">Добавить занятие</h3>' +
            '<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:10px;">' +
                '<div><label style="font-size:12px;color:var(--muted);">Дата</label><input id="schDate" type="date" class="self-input" style="margin:0; width:100%;"></div>' +
                '<div><label style="font-size:12px;color:var(--muted);">Пара</label><select id="schPeriod" class="self-input" style="margin:0; width:100%;">' + 
                    pairs.map(function(p){ return '<option value="' + p.num + '" data-time="' + p.time + '">' + p.num + ' пара</option>'; }).join('') + 
                '</select></div>' +
                '<div><label style="font-size:12px;color:var(--muted);">Время</label><input id="schTime" type="text" class="self-input" style="margin:0; width:100%;" value="' + pairs[0].time + '"></div>' +
            '</div>' +
            '<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:10px;">' +
                '<div><label style="font-size:12px;color:var(--muted);">Группа</label><input id="schGroup" type="text" class="self-input" style="margin:0; width:100%;" placeholder="ТМП 4-3"></div>' +
                '<div><label style="font-size:12px;color:var(--muted);">Предмет</label><input id="schSubject" type="text" class="self-input" style="margin:0; width:100%;" placeholder="Разработка ТП"></div>' +
                '<div><label style="font-size:12px;color:var(--muted);">Преподаватель</label><input id="schTeacher" type="text" class="self-input" style="margin:0; width:100%;" placeholder="Никитин"></div>' +
            '</div>' +
            '<button class="btn" id="addSchBtn" style="width:100%; margin-top:10px;">Добавить в расписание</button>' +
        '</section>');
        app.appendChild(formBlock);

        formBlock.querySelector("#schPeriod").onchange = function() {
            var opt = this.options[this.selectedIndex];
            formBlock.querySelector("#schTime").value = opt.getAttribute("data-time");
        };
        formBlock.querySelector("#addSchBtn").onclick = function() {
            var date = formBlock.querySelector("#schDate").value;
            var period = formBlock.querySelector("#schPeriod").value;
            var time = formBlock.querySelector("#schTime").value.trim();
            var group = formBlock.querySelector("#schGroup").value.trim();
            var subject = formBlock.querySelector("#schSubject").value.trim();
            var teacher = formBlock.querySelector("#schTeacher").value.trim();
            if (!date || !group || !subject || !time) { alert("Заполните поля!"); return; }
            var p = new URLSearchParams();
            p.append("action", "saveschedule"); p.append("mode", "add");
            p.append("date", date); p.append("period", period); p.append("time", time);
            p.append("group", group); p.append("subject", subject); p.append("teacher", teacher);
            window.showToast("Сохранение...", "info");
            fetch(APPS_SCRIPT_URL, { method: "POST", body: p })
              .then(function(r){ return r.json(); })
              .then(function(res) {
                if (res && res.ok) { window.showToast("Занятие добавлено!", "ok"); renderSchedulePage(); }
                else window.showToast("Ошибка сохранения: " + ((res && res.error) || "?"), "err");
              }).catch(function(){ window.showToast("Ошибка сети", "err"); });
        };
    }

    var schedBlock = el('<section class="module"><div id="scheduleWrap"><div style="text-align:center; padding:40px; color:var(--muted);">Загрузка расписания...</div></div></section>');
    app.appendChild(schedBlock);
    var wrap = schedBlock.querySelector("#scheduleWrap");

    fetch(APPS_SCRIPT_URL + "?action=getschedules&t=" + Date.now(), { cache: "no-store" })
        .then(function(r) {
            if (!r.ok) throw new Error("HTTP " + r.status);
            return r.text();
        })
        .then(function(text) {
            try { return JSON.parse(text); }
            catch (e) { throw new Error("Не JSON: " + text.substring(0, 80)); }
        })
        .then(function(d) {
            wrap.innerHTML = "";
            if (!d || !d.ok) {
                wrap.innerHTML = '<div style="text-align:center; padding:40px; color:var(--err);">Ошибка: ' + escapeHtml((d && d.error) || "неизвестно") + '</div>';
                return;
            }
            var schedule = Array.isArray(d.schedule) ? d.schedule : [];
            if (schedule.length === 0) {
                wrap.innerHTML = '<div style="text-align:center; padding:40px; color:var(--muted);">Расписание пока пусто.</div>';
                return;
            }

            var rows = schedule.map(function(r) {
                var timeStr = String(r[1] || "");
                var isShifted = /^\d{1,2}[:.-]\d{2}/.test(timeStr);
                
                if (isShifted) {
                    return {
                        date:    normalizeSchDate(r[0]),
                        period:  "", 
                        time:    String(r[1] || ""),
                        group:   String(r[2] || ""),
                        subject: String(r[3] || ""),
                        teacher: String(r[4] || "")
                    };
                }
                return {
                    date:    normalizeSchDate(r[0]),
                    period:  String(r[1] || ""),
                    time:    String(r[2] || ""),
                    group:   String(r[3] || ""),
                    subject: String(r[4] || ""),
                    teacher: String(r[5] || "")
                };
            });

            var byDate = {};
            rows.forEach(function(r) {
                if (!byDate[r.date]) byDate[r.date] = [];
                byDate[r.date].push(r);
            });

            Object.keys(byDate).sort().forEach(function(dateKey) {
                var items = byDate[dateKey].sort(function(a, b) {
                    return (parseInt(a.period, 10) || 0) - (parseInt(b.period, 10) || 0);
                });

                var rowsHtml = items.map(function(it) {
                    var delBtn = isTeacher
                        ? '<button class="btn ghost" data-del="1" style="padding:4px 10px; font-size:11px; border-color:var(--err); color:var(--err);">Удалить</button>'
                        : "";
                    
                    var periodTd = it.period 
                        ? '<td style="border:1px solid var(--border); padding:8px; text-align:center;">' + escapeHtml(it.period) + '</td>' 
                        : '';

                    return '<tr>' +
                        periodTd +
                        '<td style="border:1px solid var(--border); padding:8px; text-align:center;">' + escapeHtml(it.time) + '</td>' +
                        '<td style="border:1px solid var(--border); padding:8px;">' + escapeHtml(it.group) + '</td>' +
                        '<td style="border:1px solid var(--border); padding:8px;">' + escapeHtml(it.subject) + '</td>' +
                        '<td style="border:1px solid var(--border); padding:8px;">' + escapeHtml(it.teacher) + '</td>' +
                        '<td style="border:1px solid var(--border); padding:8px; text-align:center;" data-date="' + escapeHtml(it.date) + '" data-period="' + escapeHtml(it.period) + '" data-group="' + escapeHtml(it.group) + '">' + delBtn + '</td>' +
                    '</tr>';
                }).join("");

                var hasPeriod = items.some(function(it) { return it.period !== ""; });
                var headerHtml = '<tr>' +
                    (hasPeriod ? '<th style="border:1px solid var(--border); padding:8px; background:var(--card-soft);">Пара</th>' : '') +
                    '<th style="border:1px solid var(--border); padding:8px; background:var(--card-soft);">Время</th>' +
                    '<th style="border:1px solid var(--border); padding:8px; background:var(--card-soft);">Группа</th>' +
                    '<th style="border:1px solid var(--border); padding:8px; background:var(--card-soft);">Предмет</th>' +
                    '<th style="border:1px solid var(--border); padding:8px; background:var(--card-soft);">Преподаватель</th>' +
                    '<th style="border:1px solid var(--border); padding:8px; background:var(--card-soft);"></th>' +
                '</tr>';

                wrap.appendChild(el(
                    '<div style="margin-bottom:24px; text-align:left;">' +
                    '<h3 style="color:var(--accent); border-bottom:2px solid var(--border); padding-bottom:8px;">' + escapeHtml(formatSchDate(dateKey)) + '</h3>' +
                    '<table style="width:100%; border-collapse:collapse; font-size:14px;"><thead>' + headerHtml + '</thead><tbody>' + rowsHtml + '</tbody></table></div>'
                ));
            });

            wrap.querySelectorAll('td[data-date]').forEach(function(td) {
                var btn = td.querySelector('[data-del]');
                if (!btn) return;
                btn.onclick = function() {
                    window.deleteSchedule(td.getAttribute("data-date"), td.getAttribute("data-period"), td.getAttribute("data-group"));
                };
            });
        })
        .catch(function(err) {
            console.error("Schedule load error:", err);
            wrap.innerHTML = '<div style="text-align:center; padding:40px; color:var(--err);">Ошибка загрузки расписания.<br><small style="color:var(--muted);">' + escapeHtml(err.message || String(err)) + '</small><br><br><button class="btn ghost" onclick="window.renderSchedulePage()">Повторить</button></div>';
        });
}

window.renderSchedulePage = renderSchedulePage;

window.deleteSchedule = function(date, period, group) {
    if (!confirm("Удалить занятие?\n" + date + " · " + (period ? period + " пара · " : "") + group)) return;
    var p = new URLSearchParams();
    p.append("action", "saveschedule"); p.append("mode", "delete");
    p.append("date", date); p.append("period", period); p.append("group", group);
    window.showToast("Удаление...", "info");
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p })
        .then(function(r){ return r.json(); })
        .then(function(d){
            if (d && d.ok) { window.showToast("Удалено", "ok"); window.renderSchedulePage(); }
            else window.showToast("Ошибка удаления: " + ((d && d.error) || "?"), "err");
        }).catch(function(){ window.showToast("Ошибка сети", "err"); });
};

/* ---------------- ПОРТФОЛИО ---------------- */

function renderPortfolioPage(){
  var app = $("app"); app.innerHTML = ""; app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  if (!state.student) { app.appendChild(el('<div class="module">Войдите как студент, чтобы увидеть портфолио.</div>')); return; }
  app.appendChild(el('<div id="portfolioPrint" class="module" style="padding:40px;"><h1 style="text-align:center;">ПОРТФОЛИО</h1><hr style="margin:20px 0;"><p><b>ФИО:</b> ' + escapeHtml(state.student.name) + '</p><p><b>Группа:</b> ' + escapeHtml(state.student.group) + '</p><p><b>XP:</b> ' + state.xp + ' (Уровень ' + getLevel(state.xp) + ')</p></div><button class="btn" style="margin-top:20px;width:100%;" onclick="window.print()">🖨 В PDF</button>'));
}

/* ---------------- РОУТИНГ ---------------- */

function route(){
  closeDrawer();
  if (state.student) loadStudentData();

  var hash = location.hash.replace(/^#/, "") || "/"; 
  var parts = hash.split("/").filter(Boolean); 
  var app = $("app"); if (!app) return;
  if (!state.student && !state.staff) { app.innerHTML = ""; return; }
  
  try {
      if (parts[0] === "topic" && parts[1]) renderTopic(parts[1], parts[2]);
      else if (parts[0] === "simulator") renderSimulatorPage();
      else if (parts[0] === "shop") renderShopPage();
      else if (parts[0] === "portfolio") renderPortfolioPage();
      else if (parts[0] === "profile") window.renderProfilePage && window.renderProfilePage();
      else if (parts[0] === "certificate") window.renderCertificatePage && window.renderCertificatePage();
      else if (parts[0] === "dashboard") window.renderDashboard && window.renderDashboard();
      else if (parts[0] === "journal") window.renderJournalPage && window.renderJournalPage();
      else if (parts[0] === "requests") window.renderRequestsPage && window.renderRequestsPage();
      else if (parts[0] === "notifications") window.renderNotificationsPage && window.renderNotificationsPage();
      else if (parts[0] === "schedule") renderSchedulePage();
      else if (parts[0] === "rating") window.renderRatingPage && window.renderRatingPage();
      else if (parts[0] === "links") window.renderLinksPage && window.renderLinksPage();
      else if (parts[0] === "gcode-reference") window.renderGCodeReferencePage && window.renderGCodeReferencePage();
      else if (parts[0] === "final-exam") window.renderFinalExamPage && window.renderFinalExamPage();
      else if (parts[0] === "final-training") window.renderFinalTrainingPage && window.renderFinalTrainingPage();
      else if (parts[0] === "event") window.renderDeadlyPartyPage && window.renderDeadlyPartyPage();
      else if (parts[0] === "tictactoe") window.renderTicTacToePage && window.renderTicTacToePage();
      else if (parts[0] === "sudoku") window.renderSudokuPage && window.renderSudokuPage();
      else if (parts[0] === "minesweeper") window.renderMinesweeperPage && window.renderMinesweeperPage(); 
      else if (parts[0] === "spider") window.renderSpiderPage && window.renderSpiderPage(); 
      else if (parts[0] === "checkers") window.renderCheckersPage && window.renderCheckersPage();
      else if (parts[0] === "chess") window.renderChessPage && window.renderChessPage();
      else if (parts[0] === "chat") window.renderChatPage && window.renderChatPage();
      else if (parts[0] === "comments") window.renderCommentsPage && window.renderCommentsPage();
      else renderHome();
  } catch (err) {
      console.error("Routing error:", err);
      app.innerHTML = '<div class="module" style="text-align:center; padding:40px;"><h2>Ошибка загрузки страницы</h2><p class="sub" style="color:var(--err);">' + escapeHtml(err.message || String(err)) + '</p><button class="btn" onclick="location.reload()">Обновить страницу</button></div>';
  }
  window.scrollTo(0, 0);
}

window.addEventListener("DOMContentLoaded", function() {
  window.renderSchedulePage = renderSchedulePage;
  try {
      if (!state.student && !state.staff) { $("loginOverlay").hidden = false; } else { $("loginOverlay").hidden = true; }
      if (state.student) { loadStudentData(); checkDailyLogin(); }
  } catch(e) { console.error("Init error:", e); }
  
  if ($("themeToggle")) $("themeToggle").addEventListener("click", openThemeModal);
  if ($("burgerBtn")) $("burgerBtn").addEventListener("click", toggleDrawer);
  if ($("drawerOverlay")) $("drawerOverlay").addEventListener("click", closeDrawer);
  if ($("drawerClose")) $("drawerClose").addEventListener("click", closeDrawer);
  document.querySelectorAll("[data-go]").forEach(function(item) { 
      item.addEventListener("click", function(e) { e.preventDefault(); location.hash = item.getAttribute("data-go"); closeDrawer(); }); 
  });
  
  if (window.initAssistantButton) window.initAssistantButton();
  try { renderUserChip(); route(); } catch(e) { console.error("Render error:", e); }
});

window.addEventListener("hashchange", route);