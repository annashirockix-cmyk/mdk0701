/* ============================================================
   МДК 07.01 — logic.js (v150.0)
   ============================================================ */
"use strict";

window.state = { 
  student: null, staff: null, progress: {}, results: {}, selfResults: {}, 
  practicalsDone: {}, practicalGrades: {}, requests: {}, allowedAttempts: {},
  favorites: [], xp: 0, shop: [], achievements: {},
  loginStreak: 0, lastLoginDate: null, nick: null, sign: null,
  notifications: [], schedule: [], avatar: null, effects: [], customBg: null, avatarEffect: null,
  dailyQuests: { read: false, game: false, chat: false, lastReset: null }
};

try { 
  var _s = JSON.parse(localStorage.getItem("mdk0701.student") || sessionStorage.getItem("mdk0701.student") || "null"); 
  if (_s && _s.name) state.student = _s; 
} catch (e){}
try { 
  var _st = JSON.parse(sessionStorage.getItem("mdk0701.staff") || "null"); 
  if (_st && _st.role) state.staff = _st; 
} catch (e){}

window.getLevel = function(xp) { return !xp || xp <= 0 ? 1 : Math.min(Math.floor(Math.sqrt(xp / 100)) + 1, 9999); };
window.getXpForNextLevel = function(level) { return Math.pow(level, 2) * 100; };
window.getLevelTitle = function(level) {
    if (level >= 9999) return "Бесконечность";
    if (level >= 1000) return "Легенда Станков";
    if (level >= 500) return "Бог Фрез";
    if (level >= 100) return "Мастер Точения";
    if (level >= 50) return "Инженер";
    if (level >= 20) return "Оператор ЧПУ";
    if (level >= 10) return "Станочник";
    if (level >= 5) return "Ученик";
    return "Новичок";
};

window.checkDailyQuests = function() {
    var today = new Date().toDateString();
    if (state.dailyQuests.lastReset !== today) {
        state.dailyQuests = { read: false, game: false, chat: false, lastReset: today };
        window.saveStudentData();
    }
};

window.completeQuest = function(type) {
    if (state.dailyQuests[type]) return;
    state.dailyQuests[type] = true;
    window.showToast("Квест выполнен: " + type, "ok");
    window.saveStudentData();
    if (window.renderQuestsWidget && document.getElementById("questPanel")) {
        document.getElementById("questPanel").outerHTML = window.renderQuestsWidget();
    }
    if (state.dailyQuests.read && state.dailyQuests.game && state.dailyQuests.chat) {
        window.showToast("🎉 ВСЕ КВЕСТЫ ВЫПОЛНЕНЫ! +200 XP", "ok");
        window.addXP(200);
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
    } catch(e) {}
    window.updateXpDisplay();
    window.checkDailyQuests();
    try {
        const d = await API.getStudentData(k);
        if (d && d.ok && d.payload) {
            const serverData = JSON.parse(d.payload);
            if (serverData.xp !== undefined && serverData.xp > state.xp) state.xp = serverData.xp;
            if (serverData.achievements) state.achievements = Object.assign(state.achievements, serverData.achievements);
            if (serverData.avatarEffect) state.avatarEffect = serverData.avatarEffect;
            window.updateXpDisplay();
            window.renderUserChip();
            window.saveStudentData();
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