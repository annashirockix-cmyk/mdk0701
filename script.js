/* ============================================================
   МДК 07.01 — script.js (v31.0 — FIXED LOGIN)
   ============================================================ */
"use strict";

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

function hideLogin() {
  var overlay = $("loginOverlay");
  if (overlay) {
    overlay.hidden = true;
    overlay.style.display = "none"; // Принудительно скрываем
  }
}

/* ====== ВХОД ====== */

window.doStudentLogin = function() {
  var n = $("loginName") ? $("loginName").value.trim() : "";
  var g = $("loginGroup") ? $("loginGroup").value.trim() : "";
  
  if (!n || !g) { alert("Введите ФИО и Группу!"); return; }
  
  state.student = { name: n, group: g.toUpperCase() };
  localStorage.setItem("mdk0701.student", JSON.stringify(state.student));
  
  hideLogin(); 
  renderUserChip(); 
  route();
  window.showToast("Вы вошли как " + n, "ok");
};

window.doTeacherLogin = function() {
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
          hideLogin(); 
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
    alert("❌ ОШИБКА СЕТИ. Браузер заблокировал запрос к Google.\n\nПопробуйте отключить AdBlock.");
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

/* ====== СТРАНИЦЫ ====== */

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

function renderTopic(id, tab){
  tab = tab || "lecture"; var t = findTopic(id); if(!t) return renderHome();
  var app = $("app"); if (!app) return; app.innerHTML = "";
  
  app.appendChild(el(`<a class="backlink" href="#/" style="color:var(--accent);display:block;margin-bottom:10px;">← К программе</a><section class="topic-head"><h1>${t.topic.title}</h1></section>`));
  
  var tabs = [["lecture","01 Лекция"],["practice","02 Практика"],["self","03 Сам. работа"],["test","04 Тест"]];
  var tw = el('<div class="tabs" style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;"></div>');
  tabs.forEach(item=>{
    var b = el(`<button class="tab ${item[0]===tab?'active':''}" onclick="location.hash='#/topic/${id}/${item[0]}'">${item[1]}</button>`);
    tw.appendChild(b);
  });
  app.appendChild(tw); 
  var panel = el('<section class="panel" style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:24px;"></section>'); app.appendChild(panel);

  if (tab === "lecture") {
    if(t.topic.lectures && t.topic.lectures.length) {
      t.topic.lectures.forEach(l=>{
        panel.appendChild(el(`<h3>${l.code}. ${l.title}</h3><div class="lecture-content">${l.content || '<p>Материал готовится.</p>'}</div>`));
      });
    } else panel.appendChild(el('<p>Лекция пока не добавлена.</p>'));
  }
  
  if (tab === "practice") {
    if(t.topic.practicals && t.topic.practicals.length) {
      t.topic.practicals.forEach(p=>{
        panel.appendChild(el(`<div class="practice" style="margin-bottom:16px;border:1px solid var(--border);padding:16px;border-radius:8px;">
          <b style="color:var(--accent)">${p.code}</b>
          <div style="font-weight:bold;margin:4px 0">${p.title}</div>
          <div>${p.task}</div>
        </div>`));
      });
    } else panel.appendChild(el('<p>Практических работ нет.</p>'));
  }

  if (tab === "self") {
    if(t.topic.selfChecks && t.topic.selfChecks.length) {
      var selfWrap = el('<div id="selfWrap"></div>'); panel.appendChild(selfWrap);
      t.topic.selfChecks.forEach((q, i)=>{
        selfWrap.appendChild(el(`<div class="question" style="margin-bottom:16px;"><div class="q-text">${i+1}. ${q.q}</div><input type="text" class="self-input" data-idx="${i}" placeholder="Ваш ответ" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border);margin:8px 0;"><div class="self-feedback" id="fb_${i}" style="font-size:13px;"></div></div>`));
      });
      var checkBtn = el('<button class="btn" style="width:100%">Проверить все ответы</button>');
      checkBtn.addEventListener("click", ()=>{
        selfWrap.querySelectorAll(".self-input").forEach(inp => {
          var idx = Number(inp.dataset.idx), q = t.topic.selfChecks[idx], fb = selfWrap.querySelector("#fb_" + idx);
          if (inp.value.trim().toLowerCase() === q.a.trim().toLowerCase()) { fb.textContent = "✔ Верно"; fb.style.color = "var(--ok)"; }
          else { fb.textContent = "✘ Неверно. Ответ: " + q.a; fb.style.color = "var(--err)"; }
        });
      });
      panel.appendChild(checkBtn);
    } else panel.appendChild(el('<p>Вопросов нет.</p>'));
  }

  if (tab === "test") {
    if(t.topic.test && t.topic.test.length) {
      var testWrap = el('<div id="testWrap"></div>'); panel.appendChild(testWrap);
      
      t.topic.test.forEach((q, qi)=>{
        var qb = el(`<div class="question" style="margin-bottom:16px;"><div class="q-text">${qi+1}. ${q.q}</div></div>`);
        q.options.forEach((opt, oi)=>qb.appendChild(el(`<label class="option" style="display:flex;gap:10px;padding:10px;border:1px solid var(--border);border-radius:8px;margin-bottom:6px;cursor:pointer;"><input type="radio" name="q${qi}" value="${oi}"><span>${opt}</span></label>`)));
        testWrap.appendChild(qb);
      });
      
      var finishBtn = el('<button class="btn" style="width:100%">Подвести итог</button>'); panel.appendChild(finishBtn);

      finishBtn.addEventListener("click", () => {
        var correct = 0;
        t.topic.test.forEach((q, qi) => {
          var ch = testWrap.querySelector(`input[name="q${qi}"]:checked`);
          if (ch && Number(ch.value) === q.correct) correct++;
        });
        window.showToast(`Результат: ${correct} из ${t.topic.test.length}`, "ok");
        finishBtn.disabled = true;
      });
    } else panel.appendChild(el('<p>Тестов нет.</p>'));
  }
}

function renderSimulatorPage(){
  var app = $("app"); app.innerHTML = ""; 
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el('<section class="module"><h2>🖥️ Симулятор</h2><p>В разработке...</p></section>'));
}

function route(){
  closeDrawer();
  var hash = location.hash.replace(/^#/, "") || "/"; 
  var parts = hash.split("/").filter(Boolean); 
  var app = $("app"); if(!app) return;
  if (!state.student && !state.staff) { app.innerHTML = ""; return; }
  
  if (parts[0] === "topic" && parts[1]) renderTopic(parts[1], parts[2]);
  else if (parts[0] === "simulator") renderSimulatorPage();
  else if (parts[0] === "profile") app.innerHTML = "<div class='module'><h2>Профиль</h2></div>";
  else renderHome();
  window.scrollTo(0, 0);
}

window.addEventListener("DOMContentLoaded", () => {
  if (!state.student && !state.staff) { 
    var overlay = $("loginOverlay");
    if(overlay) { overlay.hidden = false; overlay.style.display = "flex"; }
  } else { 
    hideLogin();
  }
  
  if($("burgerBtn")) $("burgerBtn").addEventListener("click", toggleDrawer);
  if($("drawerOverlay")) $("drawerOverlay").addEventListener("click", closeDrawer);
  if($("drawerClose")) $("drawerClose").addEventListener("click", closeDrawer);
  document.querySelectorAll("[data-go]").forEach(item => item.addEventListener("click", (e) => { e.preventDefault(); location.hash = item.dataset.go; closeDrawer(); }));
  
  renderUserChip();
  route();
});
window.addEventListener("hashchange", route);