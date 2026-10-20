"use strict";

window.state = { 
  student: null, xp: 0, results: {}, selfResults: {}, progress: {}
};

try { 
    var _s = JSON.parse(localStorage.getItem("mdk.student") || "null"); 
    if (_s && _s.name) window.state.student = _s; 
} catch (e){}

window.getLevel = function(xp) { return !xp || xp <= 0 ? 1 : Math.min(Math.floor(Math.sqrt(xp / 100)) + 1, 100); };

window.loadStudentData = function() {
    var k = window.studentKey(); if (!k) return;
    var ek = encodeURIComponent(k);
    try {
        state.xp = parseInt(localStorage.getItem("mdk.xp." + ek) || "0", 10);
        state.results = JSON.parse(localStorage.getItem("mdk.results." + ek) || "{}");
        state.selfResults = JSON.parse(localStorage.getItem("mdk.selfResults." + ek) || "{}");
    } catch(e) {}
    window.updateXpDisplay();
};

window.saveStudentData = function() {
    var k = window.studentKey(); if (!k) return;
    var ek = encodeURIComponent(k);
    try {
        localStorage.setItem("mdk.xp." + ek, state.xp);
        localStorage.setItem("mdk.results." + ek, JSON.stringify(state.results));
        localStorage.setItem("mdk.selfResults." + ek, JSON.stringify(state.selfResults));
    } catch (e) {}
    window.updateXpDisplay();
};

window.addXP = function(amount) {
    state.xp += amount;
    window.saveStudentData();
    window.showToast("+" + amount + " XP", "ok");
};

window.doStudentLogin = function() {
  var n = document.getElementById("loginName").value.trim(), g = document.getElementById("loginGroup").value.trim();
  if (!n || !g) return window.showToast("Введите ФИО и Группу!", "err");
  state.student = { name: n, group: g.toUpperCase() };
  try { localStorage.setItem("mdk.student", JSON.stringify(state.student)); } catch(e){}
  document.getElementById("loginOverlay").hidden = true;
  window.renderUserChip(); window.loadStudentData(); window.route();
};

window.doTeacherLogin = function() {
  alert("Вход для преподавателей в разработке. Используйте вход студента.");
};

window.handleLogout = function() {
  if (confirm("Выйти?")) {
    state.student = null;
    try { localStorage.removeItem("mdk.student"); } catch(e){}
    document.getElementById("loginOverlay").hidden = false;
    window.closeDrawer(); window.route();
  }
};