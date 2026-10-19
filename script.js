/* ============================================================
   МДК 07.01 — script.js (v125.0 — LOGIN FIX)
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

// Загрузка сессии
try { 
  var _s = JSON.parse(localStorage.getItem("mdk0701.student") || sessionStorage.getItem("mdk0701.student") || "null"); 
  if (_s && _s.name) state.student = _s; 
} catch (e){}

try { 
  var _st = JSON.parse(sessionStorage.getItem("mdk0701.staff") || "null"); 
  if (_st && _st.role) state.staff = _st; 
} catch (e){}

/* ---------------- УРОВНИ ---------------- */
function getLevel(xp) { 
    if (!xp || xp <= 0) return 1;
    var lvl = Math.floor(Math.sqrt(xp / 100)) + 1;
    return Math.min(lvl, 9999);
}
function getXpForNextLevel(level) { return Math.pow(level, 2) * 100; }

function getLevelTitle(level) {
    if (level >= 9999) return "Бесконечность";
    if (level >= 5000) return "Создатель ЧПУ";
    if (level >= 1000) return "Легенда Станков";
    if (level >= 500) return "Бог Фрез";
    if (level >= 100) return "Мастер Точения";
    if (level >= 50) return "Инженер-Программист";
    if (level >= 20) return "Оператор ЧПУ";
    if (level >= 10) return "Станочник";
    if (level >= 5) return "Ученик";
    return "Новичок";
}

function getLevelBonuses(level) {
    var bonuses = [];
    if (level >= 5)   bonuses.push({ lvl: 5, name: "+5% к получаемому XP" });
    if (level >= 10)  bonuses.push({ lvl: 10, name: "+10% XP, Скидка 5% в магазине" });
    if (level >= 20)  bonuses.push({ lvl: 20, name: "+20% XP, Скидка 10%" });
    if (level >= 50)  bonuses.push({ lvl: 50, name: "+50% XP, Скидка 25%" });
    if (level >= 100) bonuses.push({ lvl: 100, name: "Максимальный уровень! Скидка 50%, +100% XP" });
    return bonuses;
}

function updateXpDisplay() {
    if ($("xpCount")) {
        var lvl = getLevel(state.xp);
        var title = getLevelTitle(lvl);
        $("xpCount").textContent = "🌟 " + state.xp + " XP · Lv." + lvl + " (" + title + ")";
    }
}

/* ---------------- УТИЛИТЫ ---------------- */
function getCourse(){ try { return COURSE; } catch(e){} try { return window.COURSE; } catch(e){} return null; }
function $(id){ return document.getElementById(id); }
function el(html){ var t = document.createElement("template"); t.innerHTML = String(html).trim(); return t.content.firstChild; }
function escapeHtml(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function findTopic(id){ var c = getCourse(); if (!c) return null; for (var i = 0; i < c.sections.length; i++){ if (!c.sections[i].topics) continue; for (var j = 0; j < c.sections[i].topics.length; j++){ if (c.sections[i].topics[j].id === id) return { section: c.sections[i], topic: c.sections[i].topics[j] }; } } return null; }
function studentKey(s){ s = s || state.student; if (!s || !s.name) return null; return (s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase()); }

window.addEventListener('error', function(e) { if (e.target.tagName === 'IMG') e.target.style.display = 'none'; }, true);

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

/* ---------------- ДОСТИЖЕНИЯ ---------------- */
function getAchievementsList() {
    var list = [];
    for (var i = 1; i <= 500; i++) {
        var xpReq = i * 100;
        var rank = getLevelTitle(Math.floor(Math.sqrt(xpReq / 100)) + 1);
        var icon = i % 100 === 0 ? "🏆" : (i % 50 === 0 ? "👑" : "🌟");
        list.push({ id: "xp_" + i, xp: xpReq, title: rank + " " + i, icon: icon, desc: "Набрать " + xpReq + " XP" });
    }
    list.push({ id: "t_theme", title: "Модник", icon: "🎨", desc: "Купить и применить тему", xp: 0 });
    list.push({ id: "t_avatar", title: "Свой стиль", icon: "🖼️", desc: "Установить свой аватар", xp: 0 });
    list.push({ id: "t_ttt", title: "Победитель ИИ", icon: "❌", desc: "Победить в крестики-нолики 4×4", xp: 0 });
    list.push({ id: "t_sudoku", title: "Логик", icon: "🔢", desc: "Решить судоку", xp: 0 });
    list.push({ id: "t_minesweeper", title: "Сапёр", icon: "💣", desc: "Пройти сапёра", xp: 0 });
    list.push({ id: "t_final_exam", title: "Выпускник", icon: "🎓", desc: "Сдать итоговый экзамен", xp: 0 });
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
  
  updateXpDisplay(); updateNotifBadge();

  if (APPS_SCRIPT_URL && state.student) {
      fetch(APPS_SCRIPT_URL + "?action=getstudentdata&key=" + encodeURIComponent(k) + "&t=" + Date.now(), { cache: "no-store" })
        .then(function(r){ return r.json(); })
        .then(function(d) {
            if (d && d.ok && d.payload) {
                var serverData = {}; try { serverData = JSON.parse(d.payload) || {}; } catch(e){}
                if (serverData.practicalGrades) state.practicalGrades = serverData.practicalGrades;
                if (serverData.allowedAttempts) state.allowedAttempts = serverData.allowedAttempts;
                if (serverData.practicalsDone) state.practicalsDone = serverData.practicalsDone;
                if (serverData.xp !== undefined) state.xp = serverData.xp;
                if (serverData.requests) state.requests = serverData.requests;
                if (serverData.avatar) state.avatar = serverData.avatar;
                if (serverData.effects) state.effects = serverData.effects;
                if (serverData.customBg !== undefined) state.customBg = serverData.customBg || null;
                if (serverData.achievements) state.achievements = Object.assign(state.achievements, serverData.achievements);
                
                updateXpDisplay(); renderUserChip();
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
    if (state.avatar) localStorage.setItem("mdk0701.avatar." + ek, state.avatar);
    localStorage.setItem("mdk0701.effects." + ek, JSON.stringify(state.effects));
    if (state.customBg) localStorage.setItem("mdk0701.customBg." + ek, state.customBg);
  } catch (e) { console.warn("LocalStorage save error", e); }
  
  updateXpDisplay(); checkAchievements();

  if (APPS_SCRIPT_URL && state.student) {
    var p = new URLSearchParams();
    p.append("action", "save"); p.append("key", k);
    p.append("name", state.student.name); p.append("group", state.student.group);
    p.append("payload", JSON.stringify({ 
      progress: state.progress, results: state.results, selfResults: state.selfResults, 
      practicalsDone: state.practicalsDone, practicalGrades: state.practicalGrades,
      requests: state.requests, allowedAttempts: state.allowedAttempts, favorites: state.favorites,
      xp: state.xp, nick: state.nick, sign: state.sign, notifications: state.notifications,
      avatar: state.avatar, effects: state.effects, customBg: state.customBg, achievements: state.achievements
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
            } else { state.loginStreak = 1; }
        } else { state.loginStreak = 1; }
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
    saveStudentData(); renderTopic(topicId, "practice");
    window.showToast("Заявка на проверку отправлена!", "ok");
};
window.requestAttempt = function(topicId, type) {
    var reqKey = topicId + "_" + type;
    if (!state.requests) state.requests = {};
    state.requests[reqKey] = "pending";
    addNotification("Вы запросили дополнительную попытку", "info");
    saveStudentData(); renderTopic(topicId, type);
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
    if (amount === undefined) amount = prompt("Сколько XP начислить студенту " + studentName + "?\n(Отрицательное число — чтобы снять XP)", "50");
    var numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount === 0) return;
    var p = new URLSearchParams();
    p.append("action", "grantxp"); p.append("key", studentKeyStr); p.append("amount", numAmount);
    window.showToast((numAmount > 0 ? "Начисление " : "Списание ") + Math.abs(numAmount) + " XP...", "info");
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p })
      .then(function(r){ return r.json(); })
      .then(function(d) {
        if (d && d.ok) {
            var newXp = (d.xp !== undefined) ? d.xp : "?";
            var delta = (d.delta !== undefined) ? d.delta : numAmount;
            window.showToast("XP " + (delta>0?"+":"") + delta + " (итого: " + newXp + ")", "ok");
        } else window.showToast("Ошибка: " + ((d && d.error) || "Неизвестно"), "err");
      }).catch(function(){ window.showToast("Ошибка сети.", "err"); });
};
window.giveCustomAchievement = function(studentKeyStr, studentName) {
    if (!state.staff) return;
    var title = prompt("Введите название ачивки для " + studentName + ":");
    if (!title) return;
    var icon = prompt("Введите эмодзи (иконку):", "🏅");
    if (!icon) icon = "🏅";
    
    var p = new URLSearchParams();
    p.append("action", "giveachievement"); p.append("key", studentKeyStr); p.append("title", title); p.append("icon", icon);
    
    window.showToast("Выдача ачивки...", "info");
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p })
      .then(function(r){ return r.json(); })
      .then(function(d) {
        if (d && d.ok) window.showToast("Ачивка выдана!", "ok");
        else window.showToast("Ошибка выдачи", "err");
      }).catch(function(){ window.showToast("Ошибка сети", "err"); });
};

/* ---------------- ТЕМЫ, ШРИФТЫ, ЭФФЕКТЫ ---------------- */
function applyTheme(theme){ document.documentElement.setAttribute("data-theme", theme); localStorage.setItem("mdk0701.theme", theme); }
function applyFont(font){ document.documentElement.style.setProperty('--font-main', font); localStorage.setItem("mdk0701.font", font); }
function applyCustomBg() {
    var cls = Array.from(document.body.classList);
    cls.forEach(function(c){ if (c.indexOf("bg-") === 0) document.body.classList.remove(c); });
    if (state.customBg) document.body.classList.add("bg-" + state.customBg);
}
function applyEffects() {
    document.body.classList.remove('effect-waves', 'effect-pulse', 'effect-matrix');
    if (state.effects && state.effects.length > 0) {
        state.effects.forEach(function(eff){ document.body.classList.add('effect-' + eff); });
    }
    applyCustomBg();
}
function openThemeModal(){
  var current = document.documentElement.getAttribute("data-theme") || "light";
  var themes = ["light", "dark", "sepia", "ocean", "forest", "matrix", "gold", "anime", "hacker", "cyber", "matrioska", "rgb", "neon", "pastel", "retro"]; 
  var names = ["Светлая", "Тёмная", "Сепия", "Океан", "Лес", "Матрица", "Золото", "Аниме", "Хакер", "Кибер", "Матрешка", "RGB", "Неон", "Пастель", "Ретро"];
  var modal = el('<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center;" id="themeModal"><div style="background:var(--card);padding:24px;border-radius:16px;width:90%;max-width:400px;max-height:80vh;overflow-y:auto;animation: popIn 0.3s;"><h3 style="margin-top:0;">Выберите тему</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0;" id="themeGrid"></div><button class="btn ghost" style="width:100%" onclick="document.getElementById(\'themeModal\').remove()">Закрыть</button></div></div>');
  var grid = modal.querySelector("#themeGrid");
  themes.forEach(function(t, i){ 
      var btn = el('<button class="btn ' + (t===current ? '' : 'ghost') + '" style="padding:12px;">' + names[i] + '</button>'); 
      btn.onclick = function() { 
          if (!state.staff && ["matrix", "gold", "anime", "hacker", "cyber", "matrioska", "rgb", "neon", "pastel", "retro"].indexOf(t) !== -1 && !state.shop.includes("theme_" + t)) {
              window.showToast("Тема не куплена!", "err"); return;
          }
          applyTheme(t); modal.remove(); 
      }; 
      grid.appendChild(btn); 
  });
  document.body.appendChild(modal);
}

/* ---------------- ВХОД/ВЫХОД (ИСПРАВЛЕНО) ---------------- */
window.doStudentLogin = function() {
  var n = $("loginName").value.trim(); var g = $("loginGroup").value.trim();
  if (!n || !g) { window.showToast("Введите ФИО и Группу!", "err"); return; }
  
  state.student = { name: n, group: g.toUpperCase() };
  try { localStorage.setItem("mdk0701.student", JSON.stringify(state.student)); } catch(e){}
  
  $("loginOverlay").hidden = true; 
  try {
      renderUserChip(); 
      loadStudentData(); 
      checkDailyLogin(); 
      route();
  } catch (err) {
      console.error("Login transition error:", err);
  }
};

window.doTeacherLogin = function() {
  var user = $("loginStaffName").value.trim(); var pass = $("loginStaffPass").value.trim(); var btn = $("staffLoginBtn");
  if (!user || !pass) { window.showToast("Введите логин и пароль!", "err"); return; }
  if (btn.disabled) return; // Защита от двойного клика
  
  btn.textContent = "Проверяем..."; btn.disabled = true;
  
  fetch(APPS_SCRIPT_URL + "?action=login&username=" + encodeURIComponent(user) + "&password=" + encodeURIComponent(pass) + "&t=" + new Date().getTime(), { cache: "no-store" })
    .then(function(r) { 
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text(); 
    })
    .then(function(text) {
        var d;
        try { d = JSON.parse(text); } 
        catch(e) { throw new Error("Invalid JSON: " + text.substring(0, 50)); }
        
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
    }).catch(function(err) { 
        console.error("Teacher login error:", err);
        window.showToast("Ошибка сети или сервера. Попробуйте еще раз.", "err"); 
        btn.textContent = "Войти как сотрудник"; 
        btn.disabled = false; 
    });
};

window.handleLogout = function() {
  if (confirm("Выйти из аккаунта?")) {
    state.student = null; state.staff = null; state.customBg = null;
    try { localStorage.removeItem("mdk0701.student"); sessionStorage.removeItem("mdk0701.staff"); } catch(e){}
    
    $("loginOverlay").hidden = false; 
    $("userChipName").textContent = "Гость"; 
    $("userChipGroup").textContent = "Роль: Гость"; 
    $("userChipAvatar").innerHTML = "👨‍🎓"; 
    
    // Очистка полей ввода
    if ($("loginName")) $("loginName").value = "";
    if ($("loginGroup")) $("loginGroup").value = "";
    if ($("loginStaffName")) $("loginStaffName").value = "";
    if ($("loginStaffPass")) $("loginStaffPass").value = "";
    if ($("staffLoginBtn")) { $("staffLoginBtn").textContent = "Войти как сотрудник"; $("staffLoginBtn").disabled = false; }

    updateXpDisplay(); applyCustomBg(); closeDrawer(); route();
  }
};

function renderUserChip(){
  if (state.staff) { 
      $("userChipName").textContent = state.staff.name; $("userChipGroup").textContent = "Учитель"; $("userChipAvatar").innerHTML = "👨‍🏫"; 
      var reqEl = document.getElementById("navRequests"); if (reqEl) reqEl.style.display = "flex";
  } else if (state.student) { 
      $("userChipName").textContent = state.nick || state.student.name; $("userChipGroup").textContent = "Гр. " + state.student.group; 
      if (state.avatar) $("userChipAvatar").innerHTML = '<img src="' + state.avatar + '" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">';
      else if (state.shop.includes("golden") || state.staff) $("userChipAvatar").innerHTML = "👑";
      else $("userChipAvatar").innerHTML = "👨‍🎓";
  }
  updateNotifBadge(); applyEffects();
}

function closeDrawer(){ $("drawer").classList.remove("open"); $("drawerOverlay").classList.remove("open"); }
function toggleDrawer(){ $("drawer").classList.toggle("open"); $("drawerOverlay").classList.toggle("open"); }

/* ---------------- ГЛАВНАЯ ---------------- */
function renderHome(){
  var app = $("app"); app.innerHTML = ""; var c = getCourse();
  if(!c) { app.innerHTML = "<p>Ошибка загрузки курса.</p>"; return; }
  
  app.appendChild(el('<section class="hero"><h1>' + c.title + '</h1><p>' + c.module + '</p></section>'));
  
  // Ссылка на МДК 04.01
  app.appendChild(el('<a href="https://annashirockix-cmyk.github.io/mdk0401/" target="_blank" style="display:block; text-decoration:none; margin-bottom:24px;"><div class="module" style="background:linear-gradient(135deg, var(--accent), var(--gold)); color:#fff; text-align:center; font-weight:bold; font-size:18px; border:none; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">🚀 Перейти на курс МДК 04.01 →</div></a>'));

  // Баннер Казино
  app.appendChild(el('<div class="event-card" style="border-color: #f1c40f; box-shadow: 0 0 20px rgba(241, 196, 15, 0.4), inset 0 0 20px rgba(241, 196, 15, 0.1); background: #1a1a10;" onclick="location.hash=\'#/casino\'"><div style="display:flex; justify-content:space-between; align-items:flex-start;"><div><h2 style="margin:0 0 10px 0; font-size:24px; color:#f1c40f; text-shadow: 0 0 10px rgba(241, 196, 15, 0.5);">🎰 КАЗИНО XP</h2><p style="margin:0; color:#aaa; font-size:14px;">Испытай удачу! Умножь свой опыт или потеряй всё.</p></div><div style="font-size:40px; animation: pulse 1s infinite;">💰</div></div><div style="margin-top:20px; display:inline-block; background:#f1c40f; color:#000; padding:8px 16px; border-radius:8px; font-weight:bold; font-size:14px;">Играть →</div></div>'));

  // Баннер Рулетка
  app.appendChild(el('<div class="event-card" style="border-color: #8e44ad; box-shadow: 0 0 20px rgba(142, 68, 173, 0.4), inset 0 0 20px rgba(142, 68, 173, 0.1); background: #150a1a; margin-top:20px; margin-bottom:24px;" onclick="location.hash=\'#/roulette\'"><div style="display:flex; justify-content:space-between; align-items:flex-start;"><div><h2 style="margin:0 0 10px 0; font-size:24px; color:#9b59b6; text-shadow: 0 0 10px rgba(155, 89, 182, 0.5);">🎡 КОЛЕСО ФОРТУНЫ</h2><p style="margin:0; color:#aaa; font-size:14px;">Крути рулетку и выигрывай до x10 от ставки!</p></div><div style="font-size:40px; animation: pulse 1s infinite;">🎰</div></div><div style="margin-top:20px; display:inline-block; background:#8e44ad; color:#fff; padding:8px 16px; border-radius:8px; font-weight:bold; font-size:14px;">Крутить →</div></div>'));

  // Темы
  c.sections.forEach(function(sec) {
    app.appendChild(el('<div class="steps-title">' + sec.code + ' · ' + sec.title + '</div>'));
    var list = document.createElement("div");
    sec.topics.forEach(function(t) { list.appendChild(el('<div class="topic" onclick="location.hash=\'#/topic/' + t.id + '\'"><span class="t-code">' + t.code + '</span><span class="t-title">' + t.title + '</span></div>')); });
    app.appendChild(list);
  });

  // Смертельная вечеринка
  var eventBlock = el('<div class="event-card" onclick="location.hash=\'#/event\'"><div style="display:flex; justify-content:space-between; align-items:flex-start;"><div><h2 style="margin:0 0 10px 0; font-size:24px; color:#ff003c; text-shadow: 0 0 10px rgba(255,0,60,0.5);">🚨 СМЕРТЕЛЬНАЯ ВЕЧЕРИНКА</h2><p style="margin:0; color:#aaa; font-size:14px;">Пройди викторину, чтобы отключить протокол самоуничтожения.</p></div><div style="font-size:40px; animation: pulse 1s infinite;">💀</div></div><div style="margin-top:20px; display:inline-block; background:#ff003c; color:#000; padding:8px 16px; border-radius:8px; font-weight:bold; font-size:14px;">Войти в терминал →</div></div>');
  app.appendChild(eventBlock);

  // Паспорта станков
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

  // Охрана труда
  if (c.safety && c.safety.length) {
    app.appendChild(el('<div class="steps-title">Охрана труда</div>'));
    var sGrid = el('<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:16px;"></div>');
    c.safety.forEach(function(s) {
      sGrid.appendChild(el('<a class="module" href="' + s.file + '" download style="margin:0;padding:16px;display:flex;flex-direction:column;justify-content:space-between;"><div><b style="color:var(--accent)">' + s.code + '</b><div style="font-weight:bold;margin:8px 0;">' + s.title + '</div><div style="font-size:12px;color:var(--muted);">' + s.summary + '</div></div><div style="margin-top:12px;color:var(--accent);font-weight:bold;">Скачать .docx →</div></a>'));
    });
    app.appendChild(sGrid);
  }

  // Видео
  if (c.videos && c.videos.length) {
    app.appendChild(el('<div class="steps-title">Видеоматериалы</div>'));
    var vGrid = el('<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:16px;"></div>');
    c.videos.forEach(function(v) { vGrid.appendChild(el('<div class="module" style="margin:0;padding:16px;"><div style="font-weight:bold;margin-bottom:8px;">' + v.title + '</div><video controls src="' + v.src + '" style="width:100%;border-radius:8px;background:#000;"></video></div>')); });
    app.appendChild(vGrid);
  }

  // Карточки знаний
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
    hArea.innerHTML = '<div class="flashcard" onclick="this.classList.toggle(\'flipped\')"><div class="flashcard-inner"><div class="flashcard-front"><div style="color:var(--accent);margin-bottom:10px">' + card.topic + '</div><h3>' + card.q + '</h3></div><div class="flashcard-back"><h3>Ответ</h3><p>' + card.a + '</p></div></div></div>'; 
  }
  renderHomeCard(); 
  flashBlock.querySelector("#nextHomeCard").addEventListener("click", function(){ hIndex=(hIndex+1)%flashCards.length; renderHomeCard(); });

  // Требования к оформлению
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
  var app = $("app"); app.innerHTML = ""; app.appendChild(el('<a class="backlink" href="#/">← К программе</a><section class="topic-head"><h1>' + t.topic.title + '</h1></section>'));
  var tw = el('<div class="tabs"></div>');
  [["lecture","01 Лекция"],["practice","02 Практика"],["self","03 Сам. работа"],["test","04 Тест"]].forEach(function(item){ tw.appendChild(el('<button class="tab ' + (item[0] === tab ? 'active' : '') + '" onclick="location.hash=\'#/topic/' + id + '/' + item[0] + '\'">' + item[1] + '</button>')); });
  app.appendChild(tw); var panel = el('<section class="panel"></section>'); app.appendChild(panel);

  if (tab === "lecture") {
    if(t.topic.lectures) t.topic.lectures.forEach(function(l){ panel.appendChild(el('<h3>' + l.code + '. ' + l.title + '</h3><div class="lecture-content">' + (l.content || '<p>Материал готовится.</p>') + '</div>')); });
    var isDone = state.progress[id] && state.progress[id].done >= 5;
    var markBtn = el('<button class="btn" style="width:100%;margin-top:20px;" ' + (isDone ? 'disabled' : '') + '>' + (isDone ? '✅ Тема изучена' : 'Отметить как изученное (+50 XP)') + '</button>');
    markBtn.onclick = function() { if (!state.progress[id]) state.progress[id] = {}; state.progress[id].done = 5; addXP(50); markBtn.textContent = "✅ Тема изучена"; markBtn.disabled = true; }; panel.appendChild(markBtn);
  }
  if (tab === "practice") {
    if(t.topic.practicals) t.topic.practicals.forEach(function(p){
        var status = state.practicalsDone[id] && state.practicalsDone[id][p.code], grade = state.practicalGrades[id] && state.practicalGrades[id][p.code];
        var html = '<div class="practice" style="margin-bottom:24px;border:1px solid var(--border);padding:20px;border-radius:12px;background:var(--card-soft);"><div style="color:var(--accent);font-weight:bold;">' + p.code + '</div><div style="font-weight:bold;margin:4px 0 12px 0;font-size:18px;">' + p.title + '</div>';
        if(p.goal) html += '<div style="font-size:14px;color:var(--muted);margin-bottom:12px;"><b>Цель:</b> ' + p.goal + '</div>';
        html += '<div style="margin-top:20px;border-top:1px solid var(--border);padding-top:16px;">';
        if (status === "approved") html += '<div style="color:var(--ok);font-weight:bold;">✅ Работа подтверждена. Оценка: <b>' + (grade||'') + '</b></div>';
        else if (status === "pending") html += '<div style="color:#d97706;font-weight:bold;">⏳ На проверке.</div>';
        else html += '<button class="btn" onclick="window.markPracticalDone(\'' + id + '\', \'' + p.code + '\')">✅ Сделал</button>';
        html += '</div></div>'; panel.appendChild(el(html));
    });
  }
  if (tab === "test" && t.topic.test) {
      var testWrap = el('<div></div>'); panel.appendChild(testWrap);
      t.topic.test.forEach(function(q, qi){ var qb = el('<div class="question"><div class="q-text">' + (qi+1) + '. ' + q.q + '</div></div>'); q.options.forEach(function(opt, oi){ qb.appendChild(el('<label class="option"><input type="radio" name="q' + qi + '" value="' + oi + '"><span>' + opt + '</span></label>')); }); testWrap.appendChild(qb); });
      var finishBtn = el('<button class="btn" style="width:100%;margin-top:10px;">Завершить тест</button>'); panel.appendChild(finishBtn);
      finishBtn.onclick = function() {
        var correct = 0; t.topic.test.forEach(function(q, qi) { var ch = testWrap.querySelector('input[name="q' + qi + '"]:checked'); if (ch && Number(ch.value) === q.correct) correct++; });
        finishBtn.disabled = true; finishBtn.textContent = "Тест завершен";
        var grade = Math.max(2, Math.round((correct / t.topic.test.length) * 5)); state.results[id] = { grade: grade }; addXP(150); saveStudentData();
        window.showToast("Тест сдан! Оценка: " + grade, "ok"); 
      };
  }
  if (tab === "self" && t.topic.selfChecks) {
      var selfWrap = el('<div></div>'); panel.appendChild(selfWrap);
      t.topic.selfChecks.forEach(function(q, i){ selfWrap.appendChild(el('<div class="question"><div class="q-text">' + (i+1) + '. ' + q.q + '</div><input type="text" class="self-input" data-idx="' + i + '" placeholder="Ваш ответ"></div>')); });
      var checkBtn = el('<button class="btn" style="width:100%;margin-top:10px;">Завершить и проверить</button>'); panel.appendChild(checkBtn);
      checkBtn.onclick = function() {
        var correctCount = 0; selfWrap.querySelectorAll(".self-input").forEach(function(inp) { var idx = Number(inp.getAttribute("data-idx")); if (inp.value.trim().toLowerCase() === t.topic.selfChecks[idx].a.trim().toLowerCase()) correctCount++; });
        checkBtn.disabled = true; checkBtn.textContent = "Результаты сохранены";
        var grade = Math.max(2, Math.round((correctCount/t.topic.selfChecks.length)*5)); state.selfResults[id] = { grade: grade }; addXP(100); saveStudentData(); window.showToast("Работа сдана! Оценка: " + grade, "ok");
      };
  }
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
    { id: "font_mono", icon: "⌨️", title: "Шрифт: Моно", price: 400, type: "font", font: "'Share Tech Mono', monospace" },
    { id: "font_serif", icon: "📖", title: "Шрифт: Сериф", price: 400, type: "font", font: "Georgia, serif" },
    { id: "font_cursive", icon: "✍️", title: "Шрифт: Курсив", price: 600, type: "font", font: "'Comic Sans MS', cursive, sans-serif" },
    { id: "effect_waves", icon: "🌊", title: "Эффект 'Волны'", price: 800, type: "effect", effect: "waves" },
    { id: "theme_neon", icon: "💡", title: "Тема 'Неон'", price: 800, type: "theme", theme: "neon" },
    { id: "theme_cyber", icon: "🤖", title: "Тема 'Кибер'", price: 1500, type: "theme", theme: "cyber" },
    { id: "bg_dots", icon: "🔵", title: "Фон: Точки", price: 300, type: "bg", bg: "dots" },
    { id: "bg_grid", icon: "▦", title: "Фон: Сетка", price: 400, type: "bg", bg: "grid" },
    { id: "bg_stars", icon: "✨", title: "Фон: Звёзды", price: 700, type: "bg", bg: "stars" }
  ];
  
  var grid = el('<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:16px;"></div>');
  
  items.forEach(function(it){
    var owned = state.shop.indexOf(it.id) !== -1 || !!state.staff;
    var btnText = "", btnDisabled = false, btnHandler = null;
    var finalPrice = Math.floor(it.price * (1 - discount));
    
    if (state.staff) {
        if (it.type === "bg") { var isActive = state.customBg === it.bg; btnText = isActive ? "Снять фон" : "Применить"; btnHandler = function() { state.customBg = isActive ? null : it.bg; applyCustomBg(); renderShopPage(); }; }
        else if (it.type === "theme") { btnText = "Применить тему"; btnHandler = function() { applyTheme(it.theme); window.showToast("Тема применена", "ok"); }; }
        else if (it.type === "font") { btnText = "Применить шрифт"; btnHandler = function() { applyFont(it.font); window.showToast("Шрифт применен", "ok"); }; }
        else if (it.type === "effect") { var active = (state.effects || []).indexOf(it.effect) !== -1; btnText = active ? "Отключить" : "Включить"; btnHandler = function() { if (active) state.effects = state.effects.filter(function(e){ return e !== it.effect; }); else state.effects.push(it.effect); applyEffects(); renderShopPage(); }; }
        else { btnText = "Доступно (Учитель)"; btnDisabled = true; }
    } else if (!owned) {
        if (state.xp < finalPrice) { btnText = "Мало XP"; btnDisabled = true; } 
        else {
            btnText = "Купить";
            btnHandler = function() {
                state.xp -= finalPrice; state.shop.push(it.id);
                if (it.type === "theme") { applyTheme(it.theme); unlockAchievement('t_theme'); }
                else if (it.type === "font") { applyFont(it.font); }
                else if (it.type === "effect") { if (state.effects.indexOf(it.effect) === -1) state.effects.push(it.effect); applyEffects(); }
                else if (it.type === "bg") { state.customBg = it.bg; applyCustomBg(); }
                else if (it.type === "input") { var val = prompt("Введите значение:", state[it.field] || ""); if (val !== null) state[it.field] = val.trim(); }
                else if (it.type === "upload") {
                    var fileInput = document.createElement('input'); fileInput.type = 'file'; fileInput.accept = "image/*";
                    fileInput.onchange = function(e) { var file = e.target.files[0]; if (!file) return; var reader = new FileReader(); reader.onload = function(ev) { state.avatar = ev.target.result; saveStudentData(); renderUserChip(); renderShopPage(); unlockAchievement('t_avatar'); }; reader.readAsDataURL(file); }; fileInput.click();
                }
                saveStudentData(); renderShopPage(); renderUserChip(); window.showToast("Покупка совершена!", "ok");
            };
        }
    } else {
        if (it.type === "bg") { var isActiveO = state.customBg === it.bg; btnText = isActiveO ? "Снять фон" : "Применить"; btnHandler = function() { state.customBg = isActiveO ? null : it.bg; applyCustomBg(); saveStudentData(); renderShopPage(); }; }
        else if (it.type === "theme") { btnText = "Применить тему"; btnHandler = function() { applyTheme(it.theme); }; }
        else if (it.type === "font") { btnText = "Применить шрифт"; btnHandler = function() { applyFont(it.font); }; }
        else if (it.type === "effect") { var activeO = state.effects.indexOf(it.effect) !== -1; btnText = activeO ? "Отключить" : "Включить"; btnHandler = function() { if (activeO) state.effects = state.effects.filter(function(e){ return e !== it.effect; }); else state.effects.push(it.effect); applyEffects(); saveStudentData(); renderShopPage(); }; }
        else { btnText = "Куплено"; btnDisabled = true; }
    }
    
    var card = el('<div style="background:var(--card);border:1px solid var(--border);padding:16px;border-radius:12px;text-align:center;display:flex;flex-direction:column;justify-content:space-between;"><div><div style="font-size:40px;margin-bottom:10px;">' + it.icon + '</div><div style="font-weight:bold;">' + it.title + '</div></div><div style="margin-top:10px;"><div style="color:var(--accent);font-weight:bold;margin-bottom:8px;">' + (discount > 0 && !owned ? '<span style="text-decoration:line-through;color:var(--muted);font-size:12px;">' + it.price + '</span> ' : '') + finalPrice + ' XP</div></div></div>');
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
    if (!isNaN(d.getTime())) { return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,'0') + "-" + String(d.getDate()).padStart(2,'0'); }
    return s;
}
function formatSchDate(dateStr) {
    if (!dateStr) return "Без даты";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        var p = dateStr.split("-"); var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
        var days = ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"]; var months = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
        return days[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
    }
    return dateStr;
}
function renderSchedulePage() {
    var app = $("app"); if (!app) return; app.innerHTML = ""; var crumbs = $("crumbs"); if (crumbs) crumbs.textContent = "Расписание";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>Расписание</h1></section>'));
    var isTeacher = state.staff && (state.staff.role === "teacher" || state.staff.role === "admin");
    
    if (isTeacher) {
        var formBlock = el('<section class="module" style="background:var(--accent-soft);"><h3>Добавить занятие</h3><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:10px;"><input id="schDate" type="date" class="self-input" style="margin:0;"><select id="schPeriod" class="self-input" style="margin:0;"><option value="1">1 пара</option><option value="2">2 пара</option><option value="3">3 пара</option></select><input id="schTime" type="text" class="self-input" style="margin:0;" value="08:00-10:00"></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:10px;"><input id="schGroup" type="text" class="self-input" style="margin:0;" placeholder="Группа"><input id="schSubject" type="text" class="self-input" style="margin:0;" placeholder="Предмет"><input id="schTeacher" type="text" class="self-input" style="margin:0;" placeholder="Преподаватель"></div><button class="btn" id="addSchBtn" style="width:100%;">Добавить</button></section>');
        app.appendChild(formBlock);
        formBlock.querySelector("#addSchBtn").onclick = function() {
            var p = new URLSearchParams(); p.append("action", "saveschedule"); p.append("mode", "add");
            p.append("date", formBlock.querySelector("#schDate").value); p.append("period", formBlock.querySelector("#schPeriod").value); p.append("time", formBlock.querySelector("#schTime").value);
            p.append("group", formBlock.querySelector("#schGroup").value); p.append("subject", formBlock.querySelector("#schSubject").value); p.append("teacher", formBlock.querySelector("#schTeacher").value);
            fetch(APPS_SCRIPT_URL, { method: "POST", body: p }).then(function(){ renderSchedulePage(); });
        };
    }
    var schedBlock = el('<section class="module"><div id="scheduleWrap">Загрузка...</div></section>'); app.appendChild(schedBlock); var wrap = schedBlock.querySelector("#scheduleWrap");
    fetch(APPS_SCRIPT_URL + "?action=getschedules&t=" + Date.now()).then(function(r){ return r.json(); }).then(function(d) {
        wrap.innerHTML = "";
        if (!d.ok || !d.schedule.length) { wrap.innerHTML = "Расписание пусто."; return; }
        var rows = d.schedule.map(function(r) { var isShifted = /^\d{1,2}[:.-]\d{2}/.test(String(r[1])); return { date: normalizeSchDate(r[0]), period: isShifted ? "" : String(r[1]), time: String(isShifted ? r[1] : r[2]), group: String(isShifted ? r[2] : r[3]), subject: String(isShifted ? r[3] : r[4]), teacher: String(isShifted ? r[4] : r[5]) }; });
        var byDate = {}; rows.forEach(function(r) { if (!byDate[r.date]) byDate[r.date] = []; byDate[r.date].push(r); });
        Object.keys(byDate).sort().forEach(function(dk) {
            var html = '<div style="margin-bottom:24px;"><h3>' + escapeHtml(formatSchDate(dk)) + '</h3><table style="width:100%;border-collapse:collapse;"><tbody>';
            byDate[dk].forEach(function(it){ html += '<tr><td style="border:1px solid var(--border);padding:8px;">' + (it.period?it.period:"") + '</td><td style="border:1px solid var(--border);padding:8px;">' + it.time + '</td><td style="border:1px solid var(--border);padding:8px;">' + it.group + '</td><td style="border:1px solid var(--border);padding:8px;">' + it.subject + '</td><td style="border:1px solid var(--border);padding:8px;">' + it.teacher + '</td></tr>'; });
            html += '</tbody></table></div>'; wrap.appendChild(el(html));
        });
    });
}
window.renderSchedulePage = renderSchedulePage;

/* ---------------- ПОРТФОЛИО ---------------- */
function renderPortfolioPage(){
  var app = $("app"); app.innerHTML = ""; app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  if (!state.student) { app.appendChild(el('<div class="module">Войдите как студент.</div>')); return; }
  app.appendChild(el('<div id="portfolioPrint" class="module" style="padding:40px;"><h1 style="text-align:center;">ПОРТФОЛИО</h1><hr style="margin:20px 0;"><p><b>ФИО:</b> ' + escapeHtml(state.student.name) + '</p><p><b>Группа:</b> ' + escapeHtml(state.student.group) + '</p><p><b>XP:</b> ' + state.xp + ' (Уровень ' + getLevel(state.xp) + ')</p></div><button class="btn" style="margin-top:20px;width:100%;" onclick="window.print()">🖨 В PDF</button>'));
}

/* ---------------- РОУТИНГ ---------------- */
function route(){
  closeDrawer(); if (state.student) loadStudentData();
  var hash = location.hash.replace(/^#/, "") || "/"; var parts = hash.split("/").filter(Boolean); var app = $("app"); if (!app) return;
  if (!state.student && !state.staff) { app.innerHTML = ""; return; }
  try {
      if (parts[0] === "topic" && parts[1]) renderTopic(parts[1], parts[2]);
      else if (parts[0] === "simulator") renderSimulatorPage();
      else if (parts[0] === "shop") renderShopPage();
      else if (parts[0] === "portfolio") renderPortfolioPage();
      else if (parts[0] === "profile") window.renderProfilePage && window.renderProfilePage(parts[1]);
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
      else if (parts[0] === "casino") window.renderCasinoPage && window.renderCasinoPage();
      else if (parts[0] === "roulette") window.renderRoulettePage && window.renderRoulettePage();
      else if (parts[0] === "tictactoe") window.renderTicTacToePage && window.renderTicTacToePage();
      else if (parts[0] === "sudoku") window.renderSudokuPage && window.renderSudokuPage();
      else if (parts[0] === "minesweeper") window.renderMinesweeperPage && window.renderMinesweeperPage(); 
      else if (parts[0] === "spider") window.renderSpiderPage && window.renderSpiderPage(); 
      else if (parts[0] === "chat") window.renderChatPage && window.renderChatPage();
      else if (parts[0] === "comments") window.renderCommentsPage && window.renderCommentsPage();
      else renderHome();
  } catch (err) {
      app.innerHTML = '<div class="module" style="text-align:center;padding:40px;"><h2>Ошибка загрузки</h2><p style="color:var(--err);">' + escapeHtml(err.message) + '</p><button class="btn" onclick="location.reload()">Обновить</button></div>';
  }
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);

/* ---------------- INIT ---------------- */
window.addEventListener("DOMContentLoaded", function() {
  try {
      if (!state.student && !state.staff) { $("loginOverlay").hidden = false; } else { $("loginOverlay").hidden = true; }
      if (state.student) { loadStudentData(); checkDailyLogin(); }
  } catch(e) { console.error(e); }
  
  var savedFont = localStorage.getItem("mdk0701.font");
  if (savedFont) applyFont(savedFont);

  if ($("themeToggle")) $("themeToggle").addEventListener("click", openThemeModal);
  if ($("burgerBtn")) $("burgerBtn").addEventListener("click", toggleDrawer);
  if ($("drawerOverlay")) $("drawerOverlay").addEventListener("click", closeDrawer);
  if ($("drawerClose")) $("drawerClose").addEventListener("click", closeDrawer);
  document.querySelectorAll("[data-go]").forEach(function(item) { item.addEventListener("click", function(e) { e.preventDefault(); location.hash = item.getAttribute("data-go"); closeDrawer(); }); });
  try { renderUserChip(); route(); } catch(e) { console.error(e); }
});