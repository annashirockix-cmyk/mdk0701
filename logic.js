/* ============================================================
   logic.js — Логика приложения
   ============================================================ */
"use strict";

window.state = { 
  activeCourseId: localStorage.getItem("mdk.active") || "07.01",
  student: null, staff: null, results: {}, xp: 0, 
  shop: [], isPremium: false, premiumUntil: null, avatar: null
};

// Инициализация текущего курса
window.COURSE = window.MDK_DATA[state.activeCourseId];

window.switchCourse = function(id) {
    localStorage.setItem("mdk.active", id);
    location.reload();
};

try { var _s = JSON.parse(localStorage.getItem("mdk.student") || "null"); if (_s && _s.name) state.student = _s; } catch (e){}
try { var _st = JSON.parse(sessionStorage.getItem("mdk.staff") || "null"); if (_st && _st.role) state.staff = _st; } catch (e){}

window.getLevel = function(xp) { return !xp || xp <= 0 ? 1 : Math.min(Math.floor(Math.sqrt(xp / 100)) + 1, 100); };
window.getLevelTitle = function(level) { return level >= 10 ? "Мастер" : "Новичок"; };

window.loadStudentData = function() {
    var k = window.studentKey(); if (!k) return;
    var ek = encodeURIComponent(k);
    try {
        state.xp = parseInt(localStorage.getItem("mdk.xp." + ek) || "0", 10);
        state.shop = JSON.parse(localStorage.getItem("mdk.shop." + ek) || "[]");
        state.isPremium = localStorage.getItem("mdk.premium." + ek) === "true";
        state.premiumUntil = parseInt(localStorage.getItem("mdk.premiumUntil." + ek) || "0", 10);
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
    if (state.isPremium) mult *= 2;
    var finalAmount = Math.round(amount * mult);
    state.xp += finalAmount;
    window.saveStudentData();
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

window.doTeacherLogin = function() {
  var u = document.getElementById("loginStaffName").value.trim(), p = document.getElementById("loginStaffPass").value.trim();
  // Заглушка для входа преподавателя
  if(u === "admin" && p === "admin") {
      state.staff = { role: "admin", name: "Преподаватель" };
      sessionStorage.setItem("mdk.staff", JSON.stringify(state.staff));
      document.getElementById("loginOverlay").hidden = true;
      window.renderUserChip(); window.route();
  } else {
      window.showToast("Неверный логин. (Для теста: admin / admin)", "err");
  }
};

window.handleLogout = function() {
  if (confirm("Выйти?")) {
    state.student = null; state.staff = null;
    localStorage.removeItem("mdk.student"); sessionStorage.removeItem("mdk.staff");
    document.getElementById("loginOverlay").hidden = false;
    window.closeDrawer(); window.route();
  }
};