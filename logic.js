/* ============================================================
   МДК 07.01 — logic.js (v170.0)
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

window.getLevel = function(xp) { return !xp || xp <= 0 ? 1 : Math.min(Math.floor(Math.sqrt(xp / 100)) + 1, 100); }; // Ограничили до 100 уровней
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

// Ачивки за реальные действия
window.getAchievementsList = function() {
    var list = [];
    for (var i = 1; i <= 100; i++) {
        var xpReq = i * 100;
        list.push({ id: "xp_" + i, xp: xpReq, title: "Ранг " + i, icon: i%10===0?"🏆":"🌟", desc: "Набрать " + xpReq + " XP" });
    }
    list.push({ id: "t_chat_100", title: "Болтун", icon: "💬", desc: "Написать 100 сообщений в чат", xp: 0 });
    list.push({ id: "t_streak_30", title: "Верный сайту", icon: "🔥", desc: "Заходить 30 дней подряд", xp: 0 });
    list.push({ id: "t_practical_5", title: "Идеальный студент", icon: "📝", desc: "Сдать 5 практических без ошибок", xp: 0 });
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
    if (state.practicalStreak >= 5 && !state.achievements["t_practical_5"]) { state.achievements["t_practical_5"] = true; hasNew = true; }
    
    if (hasNew) {
        window.showToast("🏆 Получено новое достижение!", "ok");
        window.saveStudentData();
    }
};

window.checkDailyLogin = function() {
    if (!state.student) return;
    var today = new Date().toDateString();
    if (state.lastLoginDate !== today) {
        var xpGained = 20;
        if (state.lastLoginDate) {
            var lastDate = new Date(state.lastLoginDate);
            var now = new Date(today);
            lastDate.setHours(0,0,0,0); now.setHours(0,0,0,0);
            var diffDays = Math.round((now - lastDate) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                state.loginStreak++;
                xpGained += Math.min(state.loginStreak * 10, 100);
            } else { state.loginStreak = 1; }
        } else { state.loginStreak = 1; }
        state.lastLoginDate = today;
        window.addXP(xpGained);
        checkAchievements();
    }
};

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
        state.practicalStreak = parseInt(localStorage.getItem("mdk0701.practicalStreak." + ek) || "0", 10);
    } catch(e) {}
    window.updateXpDisplay();
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
        localStorage.setItem("mdk0701.achievements." + ek, JSON.stringify(state.achievements));
        localStorage.setItem("mdk0701.chatCount." + ek, state.chatMessageCount);
        localStorage.setItem("mdk0701.practicalStreak." + ek, state.practicalStreak);
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
    window.updateXpDisplay();
    window.showToast("+" + finalAmount + " XP", "ok");
};

// Вход/Выход
window.doStudentLogin = function() {
  var n = document.getElementById("loginName").value.trim(), g = document.getElementById("loginGroup").value.trim();
  if (!n || !g) return window.showToast("Введите ФИО и Группу!", "err");
  state.student = { name: n, group: g.toUpperCase() };
  localStorage.setItem("mdk0701.student", JSON.stringify(state.student));
  document.getElementById("loginOverlay").hidden = true;
  window.renderUserChip(); window.loadStudentData(); window.checkDailyLogin(); window.route();
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
    state.student = null; state.staff = null; state.customBg = null; state.avatarEffect = null;
    localStorage.removeItem("mdk0701.student"); sessionStorage.removeItem("mdk0701.staff");
    document.getElementById("loginOverlay").hidden = false;
    document.getElementById("userChipName").textContent = "Гость"; document.getElementById("userChipGroup").textContent = "Роль: Гость"; document.getElementById("userChipAvatar").innerHTML = "👨‍🎓";
    window.updateXpDisplay(); window.applyCustomBg(); window.closeDrawer(); window.route();
  }
};