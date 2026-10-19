"use strict";

window.state = { 
  activeCourseId: localStorage.getItem("mdk.courseId") || "07.01",
  student: null, staff: null, progress: {}, results: {}, selfResults: {}, 
  practicalsDone: {}, practicalGrades: {}, favorites: [], xp: 0, shop: [], achievements: {},
  isPremium: false, premiumUntil: null, avatar: null, avatarEffect: null,
  dailyQuests: { read: false, game: false, chat: false, lastReset: null }
};

window.COURSE = window.COURSES[state.activeCourseId];

try { var _s = JSON.parse(localStorage.getItem("mdk.student") || sessionStorage.getItem("mdk.student") || "null"); if (_s && _s.name) state.student = _s; } catch (e){}
try { var _st = JSON.parse(sessionStorage.getItem("mdk.staff") || "null"); if (_st && _st.role) state.staff = _st; } catch (e){}

window.switchCourse = function(id) {
    localStorage.setItem("mdk.courseId", id);
    location.reload();
};

window.getLevel = function(xp) { return !xp || xp <= 0 ? 1 : Math.min(Math.floor(Math.sqrt(xp / 100)) + 1, 100); };
window.getLevelTitle = function(level) { return level >= 10 ? "Мастер" : "Новичок"; };

window.loadStudentData = async function() {
    var k = window.studentKey(); if (!k) return;
    var ek = encodeURIComponent(k);
    try {
        state.xp = parseInt(localStorage.getItem("mdk.xp." + ek) || "0", 10);
        state.shop = JSON.parse(localStorage.getItem("mdk.shop." + ek) || "[]");
        state.isPremium = localStorage.getItem("mdk.premium." + ek) === "true";
        state.premiumUntil = parseInt(localStorage.getItem("mdk.premiumUntil." + ek) || "0", 10);
        
        if (state.isPremium && state.premiumUntil < Date.now()) {
            state.isPremium = false;
            window.showToast("Подписка VIP истекла", "err");
        }
    } catch(e) {}
    window.updateXpDisplay();
    window.renderUserChip();
};

window.saveStudentData = function() {
    var k = window.studentKey(); if (!k) return;
    var ek = encodeURIComponent(k);
    try {
        localStorage.setItem("mdk.xp." + ek, state.xp);
        localStorage.setItem("mdk.shop." + ek, JSON.stringify(state.shop));
        localStorage.setItem("mdk.premium." + ek, state.isPremium);
        localStorage.setItem("mdk.premiumUntil." + ek, state.premiumUntil);
    } catch (e) {}
    window.updateXpDisplay();
};

window.addXP = function(amount) {
    var mult = 1 + Math.floor(getLevel(state.xp) / 10) * 0.1;
    if (state.isPremium) {
        mult *= 2;
        window.showToast("🔥 VIP Бонус: x2 XP!", "ok");
    }
    var finalAmount = Math.round(amount * mult);
    state.xp += finalAmount;
    window.saveStudentData();
    window.updateXpDisplay();
    window.showToast("+" + finalAmount + " XP", "ok");
};

window.doStudentLogin = function() {
  var n = document.getElementById("loginName").value.trim(), g = document.getElementById("loginGroup").value.trim();
  if (!n || !g) return window.showToast("Введите ФИО и Группу!", "err");
  state.student = { name: n, group: g.toUpperCase() };
  localStorage.setItem("mdk.student", JSON.stringify(state.student));
  document.getElementById("loginOverlay").hidden = true;
  window.renderUserChip(); window.loadStudentData(); window.route();
};

window.handleLogout = function() {
  if (confirm("Выйти?")) {
    state.student = null; state.staff = null;
    localStorage.removeItem("mdk.student"); sessionStorage.removeItem("mdk.staff");
    document.getElementById("loginOverlay").hidden = false;
    window.closeDrawer(); window.route();
  }
};