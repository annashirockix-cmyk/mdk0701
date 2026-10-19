/* ============================================================
   МДК 07.01 — logic.js (v177.0 — FIXED QUESTS & STATE)
   ============================================================ */
"use strict";

window.state = { 
  student: null, staff: null, progress: {}, results: {}, selfResults: {}, 
  practicalsDone: {}, practicalGrades: {}, requests: {}, allowedAttempts: {},
  favorites: [], xp: 0, shop: [], achievements: {},
  loginStreak: 0, lastLoginDate: null, nick: null, sign: null,
  notifications: [], schedule: [], avatar: null, effects: [], customBg: null, avatarEffect: null,
  dailyQuests: { read: false, game: false, chat: false, lastReset: null },
  chatMessageCount: 0, practicalStreak: 0
};

try { 
  var _s = JSON.parse(localStorage.getItem("mdk0701.student") || sessionStorage.getItem("mdk0701.student") || "null"); 
  if (_s && _s.name) state.student = _s; 
} catch (e){}
try { 
  var _st = JSON.parse(sessionStorage.getItem("mdk0701.staff") || "null"); 
  if (_st && _st.role) state.staff = _st; 
} catch (e){}

/* ---------------- УРОВНИ ---------------- */
window.getLevel = function(xp) { return !xp || xp <= 0 ? 1 : Math.min(Math.floor(Math.sqrt(xp / 100)) + 1, 100); };
window.getXpForNextLevel = function(level) { return Math.pow(level, 2) * 100; };
window.getLevelTitle = function(level) {
    if (level >= 100) return "Бесконечность";
    if (level >= 80) return "Легенда Станков";
    if (level >= 50) return "Бог Фрез";
    if (level >= 30) return "Мастер Точения";
    if (level >= 20) return "Инженер";
    if (level >= 10) return "Станочник";
    if (level >= 5) return "Ученик";
    return "Новичок";
};

/* ---------------- КВЕСТЫ ---------------- */
window.checkDailyQuests = function() {
    var today = new Date().toDateString();
    if (!state.dailyQuests || state.dailyQuests.lastReset !== today) {
        state.dailyQuests = { read: false, game: false, chat: false, lastReset: today };
        window.saveStudentData();
    }
};

window.completeQuest = function(type) {
    if (!state.dailyQuests) state.dailyQuests = { read: false, game: false, chat: false };
    if (state.dailyQuests[type]) return; // Уже выполнено
    
    state.dailyQuests[type] = true;
    window.showToast("Квест выполнен: " + type, "ok");
    window.saveStudentData();
    
    // Обновляем виджет на главной, если мы на ней
    var qp = document.getElementById("questPanel");
    if (qp && window.renderQuestsWidget) {
        qp.outerHTML = window.renderQuestsWidget();
    }
    
    // Проверяем, все ли квесты выполнены
    if (state.dailyQuests.read && state.dailyQuests.game && state.dailyQuests.chat) {
        window.showToast("🎉 ВСЕ КВЕСТЫ ВЫПОЛНЕНЫ! +200 XP", "ok");
        window.addXP(200);
    }
};

/* ---------------- ДОСТИЖЕНИЯ ---------------- */
window.getAchievementsList = function() {
    var list = [];
    for (var i = 1; i <= 100; i++) {
        list.push({ id: "xp_" + i, xp: i * 100, title: "Ранг " + i, icon: i%10===0?"🏆":"🌟", desc: "Набрать " + (i*100) + " XP" });
    }
    list.push({ id: "t_chat_100", title: "Болтун", icon: "💬", desc: "Написать 100 сообщений", xp: 0 });
    list.push({ id: "t_streak_30", title: "Верный сайту", icon: "🔥", desc: "Заходить 30 дней подряд", xp: 0 });
    return list;
};

window.checkAchievements = function() {
    var achList = getAchievementsList();
    var hasNew = false;
    achList.forEach(a => {
        if (a.xp > 0 && state.xp >= a.xp && !state.achievements[a.id]) {
            state.achievements[a.id] = true;
            hasNew = true;
        }
    });
    if (state.chatMessageCount >= 100 && !state.achievements["t_chat_100"]) { state.achievements["t_chat_100"] = true; hasNew = true; }
    if (state.loginStreak >= 30 && !state.achievements["t_streak_30"]) { state.achievements["t_streak_30"] = true; hasNew = true; }
    
    if (hasNew) {
        window.showToast("🏆 Получено новое достижение!", "ok");
        window.saveStudentData();
    }
};

/* ---------------- ЗАГРУЗКА/СОХРАНЕНИЕ ---------------- */
window.loadStudentData = async function() {
    var k = window.studentKey(); if (!k) return;
    var ek = encodeURIComponent(k);
    try {
        state.xp = parseInt(localStorage.getItem("mdk0701.xp." + ek) || "0", 10);
        state.shop = JSON.parse(localStorage.getItem("mdk0701.shop." + ek) || "[]");
        state.achievements = JSON.parse(localStorage.getItem("mdk0701.achievements." + ek) || "{}");
        state.avatar = localStorage.getItem("mdk0701.avatar." + ek) || null;
        state.avatarEffect = localStorage.getItem("mdk0701.avatarEffect." + ek) || null;
        state.chatMessageCount = parseInt(localStorage.getItem("mdk0701.chatCount." + ek) || "0", 10);
        state.dailyQuests = JSON.parse(localStorage.getItem("mdk0701.quests." + ek) || '{"read":false,"game":false,"chat":false,"lastReset":null}');
    } catch(e) {}
    
    window.updateXpDisplay();
    window.checkDailyQuests();
    
    try {
        const d = await API.getStudentData(k);
        if (d && d.ok && d.payload) {
            const serverData = JSON.parse(d.payload);
            if (serverData.xp !== undefined && serverData.xp > state.xp) state.xp = serverData.xp;
            if (serverData.achievements) state.achievements = Object.assign(state.achievements, serverData.achievements);
            window.updateXpDisplay(); window.renderUserChip(); window.saveStudentData();
        }
    } catch (err) { console.warn("Sync error:", err.message); }
};

window.saveStudentData = function() {
    var k = window.studentKey(); if (!k) return;
    var ek = encodeURIComponent(k);
    try {
        localStorage.setItem("mdk0701.xp." + ek, state.xp);
        localStorage.setItem("mdk0701.shop." + ek, JSON.stringify(state.shop));
        localStorage.setItem("mdk0701.achievements." + ek, JSON.stringify(state.achievements));
        localStorage.setItem("mdk0701.chatCount." + ek, state.chatMessageCount);
        localStorage.setItem("mdk0701.quests." + ek, JSON.stringify(state.dailyQuests));
        if (state.avatarEffect) localStorage.setItem("mdk0701.avatarEffect." + ek, state.avatarEffect);
        if (state.avatar) localStorage.setItem("mdk0701.avatar." + ek, state.avatar);
    } catch (e) {}
    
    window.updateXpDisplay();
    if (state.student) {
        API.saveStudent(k, state.student.name, state.student.group, JSON.stringify({
            xp: state.xp, achievements: state.achievements, avatar: state.avatar, avatarEffect: state.avatarEffect
        })).catch(err => console.warn("Save error:", err.message));
    }
};

window.addXP = function(amount) {
    var mult = 1 + Math.floor(getLevel(state.xp) / 10) * 0.1;
    var finalAmount = Math.round(amount * mult);
    state.xp += finalAmount;
    window.saveStudentData();
    window.checkAchievements();
    window.updateXpDisplay();
    window.showToast("+" + finalAmount + " XP", "ok");
};

/* ---------------- ВХОД/ВЫХОД ---------------- */
window.doStudentLogin = function() {
  var n = document.getElementById("loginName").value.trim(), g = document.getElementById("loginGroup").value.trim();
  if (!n || !g) return window.showToast("Введите ФИО и Группу!", "err");
  state.student = { name: n, group: g.toUpperCase() };
  localStorage.setItem("mdk0701.student", JSON.stringify(state.student));
  document.getElementById("loginOverlay").hidden = true;
  window.renderUserChip(); 
  window.loadStudentData(); 
  window.checkDailyLogin(); 
  window.route();
};

window.doTeacherLogin = function() {
  var u = document.getElementById("loginStaffName").value.trim(), p = document.getElementById("loginStaffPass").value.trim();
  if (!u || !p) return window.showToast("Введите логин и пароль!", "err");
  API.login(u, p).then(d => {
      if (d && d.ok) {
          state.staff = { role: d.role, name: d.name };
          sessionStorage.setItem("mdk0701.staff", JSON.stringify(state.staff));
          document.getElementById("loginOverlay").hidden = true;
          window.renderUserChip(); window.route();
      } else { window.showToast("Неверный логин или пароль.", "err"); }
  }).catch(() => window.showToast("Ошибка сети.", "err"));
};

window.handleLogout = function() {
  if (confirm("Выйти?")) {
    state.student = null; state.staff = null;
    localStorage.removeItem("mdk0701.student"); sessionStorage.removeItem("mdk0701.staff");
    document.getElementById("loginOverlay").hidden = false;
    document.getElementById("userChipName").textContent = "Гость"; document.getElementById("userChipGroup").textContent = "Роль: Гость"; document.getElementById("userChipAvatar").innerHTML = "👨‍🎓";
    window.updateXpDisplay(); window.applyCustomBg(); window.closeDrawer(); window.route();
  }
};