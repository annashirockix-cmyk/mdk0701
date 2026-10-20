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
  if (!n || !g) return window.showToast("Введите ФИО и группу", "err");
  state.student = { name: n, group: g.toUpperCase(), role: "student" };
  try { localStorage.setItem("mdk.student", JSON.stringify(state.student)); } catch(e){}
  document.getElementById("loginOverlay").classList.add("off");
  window.renderUserChip(); window.loadStudentData(); window.route();
  if (window.API && window.API.saveStudent) {
    window.API.saveStudent(window.studentKey(), n, state.student.group, JSON.stringify({ xp: state.xp || 0 })).catch(function(){});
  }
};

window.doTeacherLogin = async function() {
  var user = document.getElementById("teacherUser").value.trim();
  var pass = document.getElementById("teacherPass").value;
  var err = document.getElementById("teacherLoginError");
  err.hidden = true;
  if (!user || !pass) { err.hidden = false; err.textContent = "Введите логин и пароль"; return; }
  try {
    var res = await window.API.login(user, pass);
    if (!res || !res.ok) throw new Error((res && res.error) || "Неверный логин или пароль");
    state.student = { name: res.name || user, group: (res.role || "teacher").toUpperCase(), role: res.role || "teacher" };
    try { localStorage.setItem("mdk.student", JSON.stringify(state.student)); } catch(e){}
    document.getElementById("loginOverlay").classList.add("off");
    window.renderUserChip(); window.loadStudentData(); window.route();
  } catch (e) {
    err.hidden = false;
    err.textContent = e && e.name === "AbortError" ? "Сервер не ответил. Проверьте публикацию Apps Script." : (e.message || "Ошибка входа");
  }
};

window.handleLogout = function() {
  if (confirm("Выйти?")) {
    state.student = null;
    try { localStorage.removeItem("mdk.student"); } catch(e){}
    document.getElementById("loginOverlay").classList.remove("off");
    window.closeDrawer(); window.route();
  }
};