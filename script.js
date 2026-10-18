/* ============================================================
   МДК 07.01 — script.js (v30.0 — DEBUG)
   ============================================================ */
"use strict";

console.log("🟢 [script.js] Файл успешно загружен!");

var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzB0v37m5pC0jSnEmCEllIlN3IlRmgOhaPEW9giHbS6wNIYFHClxJv8Z5HyG4-AJBpdaQ/exec";
var state = { student: null, staff: null, progress: {}, results: {}, selfResults: {}, favorites: [], xp: 0, shop: [] };

try { var _s = JSON.parse(localStorage.getItem("mdk0701.student") || "null"); if (_s && _s.name) state.student = _s; } catch (e){}
try { var _st = JSON.parse(sessionStorage.getItem("mdk0701.staff") || "null"); if (_st && _st.role) state.staff = _st; } catch (e){}

function getCourse(){ try { return COURSE; } catch(e){} try { return window.COURSE; } catch(e){} return null; }
function $(id){ return document.getElementById(id); }
function el(html){ var t = document.createElement("template"); t.innerHTML = String(html).trim(); return t.content.firstChild; }
function escapeHtml(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function findTopic(id){ var c = getCourse(); if (!c) return null; for (var i = 0; i < c.sections.length; i++){ if (!c.sections[i].topics) continue; for (var j = 0; j < c.sections[i].topics.length; j++){ if (c.sections[i].topics[j].id === id) return { section: c.sections[i], topic: c.sections[i].topics[j] }; } } return null; }
function studentKey(s){ s = s || state.student; if (!s || !s.name) return null; return (s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase()); }

window.showToast = function(msg, type) {
  var container = document.querySelector(".toast-container");
  if (!container) { container = document.createElement("div"); container.className = "toast-container"; document.body.appendChild(container); }
  var toast = document.createElement("div"); toast.className = "toast " + (type || "");
  toast.innerHTML = (type === "ok" ? "✅ " : type === "err" ? "❌ " : "ℹ️ ") + escapeHtml(msg);
  container.appendChild(toast);
  setTimeout(function() { toast.classList.add("out"); setTimeout(function() { if (toast.parentNode) toast.remove(); }, 300); }, 3000);
};

/* ====== ВХОД ====== */

window.doStudentLogin = function(event) {
  if(event) event.preventDefault();
  console.log("🔵 Нажата кнопка ВХОДА СТУДЕНТА");
  
  var n = $("loginName") ? $("loginName").value.trim() : "";
  var g = $("loginGroup") ? $("loginGroup").value.trim() : "";
  
  if (!n || !g) { alert("Введите ФИО и Группу!"); return; }
  
  state.student = { name: n, group: g.toUpperCase() };
  localStorage.setItem("mdk0701.student", JSON.stringify(state.student));
  
  if($("loginOverlay")) $("loginOverlay").hidden = true; 
  renderUserChip(); 
  route();
  window.showToast("Вы вошли как " + n, "ok");
};

window.doTeacherLogin = function(event) {
  if(event) event.preventDefault();
  console.log("🔵 Нажата кнопка ВХОДА УЧИТЕЛЯ");

  var user = $("loginStaffName") ? $("loginStaffName").value.trim() : "";
  var pass = $("loginStaffPass") ? $("loginStaffPass").value.trim() : "";
  var btn = $("staffLoginBtn");

  if (!user || !pass) { alert("Введите логин и пароль!"); return; }
  
  if(btn) { btn.textContent = "Проверяем..."; btn.disabled = true; }

  var xhr = new XMLHttpRequest();
  var url = APPS_SCRIPT_URL + "?action=login&username=" + encodeURIComponent(user) + "&password=" + encodeURIComponent(pass) + "&t=" + new Date().getTime();
  
  xhr.open("GET", url, true);
  
  xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        var d = JSON.parse(xhr.responseText);
        if (d && d.ok) { 
          state.staff = { role: d.role, name: d.name }; 
          sessionStorage.setItem("mdk0701.staff", JSON.stringify(state.staff)); 
          if($("loginOverlay")) $("loginOverlay").hidden = true; 
          renderUserChip(); 
          route(); 
          window.showToast("Добро пожаловать, " + d.name, "ok");
        } else {
          alert("ОШИБКА: Неверный логин или пароль.");
          if(btn) { btn.textContent = "Войти как сотрудник"; btn.disabled = false; }
        }
      } catch(e) {
        alert("Ошибка сервера: " + xhr.responseText);
        if(btn) { btn.textContent = "Войти как сотрудник"; btn.disabled = false; }
      }
    } else {
      alert("Ошибка HTTP: " + xhr.status);
      if(btn) { btn.textContent = "Войти как сотрудник"; btn.disabled = false; }
    }
  };

  xhr.onerror = function() {
    alert("❌ ОШИБКА СЕТИ. Браузер заблокировал запрос к Google.\n\nПопробуйте отключить AdBlock или открыть сайт в Инкогнито.");
    if(btn) { btn.textContent = "Войти как сотрудник"; btn.disabled = false; }
  };

  xhr.timeout = 10000;
  xhr.send();
};

function renderUserChip(){
  if (state.staff) { 
    if($("userChipName")) $("userChipName").textContent = state.staff.name; 
    if($("userChipGroup")) $("userChipGroup").textContent = "Учитель"; 
    if($("userChipAvatar")) $("userChipAvatar").textContent = "👨‍🏫"; 
  } else if (state.student) { 
    if($("userChipName")) $("userChipName").textContent = state.student.name; 
    if($("userChipGroup")) $("userChipGroup").textContent = "Гр. " + state.student.group; 
    if($("userChipAvatar")) $("userChipAvatar").textContent = "👨‍🎓"; 
  }
}

function closeDrawer(){ if($("drawer")) $("drawer").classList.remove("open"); if($("drawerOverlay")) $("drawerOverlay").classList.remove("open"); }
function toggleDrawer(){ if($("drawer")) $("drawer").classList.toggle("open"); if($("drawerOverlay")) $("drawerOverlay").classList.toggle("open"); }

function renderHome(){
  var app = $("app"); if (!app) return; app.innerHTML = ""; var c = getCourse();
  if(!c) { app.innerHTML = "<p>Ошибка загрузки курса.</p>"; return; }
  
  app.appendChild(el(`<section class="hero"><h1>${c.title}</h1><p>${c.module}</p></section>`));
  
  c.sections.forEach(sec => {
    app.appendChild(el(`<div class="steps-title" style="margin:24px 0 10px;font-size:14px;color:var(--muted);text-transform:uppercase;">${sec.code} · ${sec.title}</div>`));
    var list = el('<div class="topics" style="display:flex;flex-direction:column;gap:12px;"></div>');
    sec.topics.forEach(t => {
      var card = el(`<div class="topic" style="background:var(--card);border:1px solid var(--border);padding:16px;border-radius:12px;cursor:pointer;" onclick="location.hash='#/topic/${t.id}'"><b style="color:var(--accent)">${t.code}</b> · ${t.title}</div>`);
      list.appendChild(card);
    });
    app.appendChild(list);
  });
}

function route(){
  closeDrawer();
  var hash = location.hash.replace(/^#/, "") || "/"; 
  var app = $("app"); if(!app) return;
  if (!state.student && !state.staff) { app.innerHTML = ""; return; }
  
  if (hash === "/") renderHome();
  else if (hash === "/profile") app.innerHTML = "<div class='module'><h2>Профиль</h2></div>";
  else if (hash === "/simulator") app.innerHTML = "<div class='module'><h2>Симулятор</h2></div>";
  else app.innerHTML = "<div class='module'><h1>Раздел в разработке</h1></div>";
  window.scrollTo(0, 0);
}

window.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 [script.js] DOM полностью загружен");
  
  if (!state.student && !state.staff) { 
    if($("loginOverlay")) $("loginOverlay").hidden = false; 
  } else { 
    if($("loginOverlay")) $("loginOverlay").hidden = true; 
  }
  
  if($("burgerBtn")) $("burgerBtn").addEventListener("click", toggleDrawer);
  if($("drawerOverlay")) $("drawerOverlay").addEventListener("click", closeDrawer);
  if($("drawerClose")) $("drawerClose").addEventListener("click", closeDrawer);
  
  renderUserChip();
  route();
});