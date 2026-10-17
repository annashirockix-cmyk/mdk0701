/* ============================================================
   МДК 07.01 — script.js (v20.0)
   ============================================================ */
"use strict";

var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzB0v37m5pC0jSnEmCEllIlN3IlRmgOhaPEW9giHbS6wNIYFHClxJv8Z5HyG4-AJBpdaQ/exec";
var state = { student: null, staff: null, progress: {}, results: {}, selfResults: {}, practiceStatus: {}, activity: [], favorites: [], achievements: {}, xp: 0, shop: [] };

try { var _s = JSON.parse(localStorage.getItem("mdk0701.student") || "null"); if (_s && _s.name) state.student = _s; } catch (e){}
try { var _st = JSON.parse(sessionStorage.getItem("mdk0701.staff") || "null"); if (_st && _st.role) state.staff = _st; } catch (e){}

function getCourse(){ try { return COURSE; } catch(e){} return null; }
function $(id){ return document.getElementById(id); }
function el(html){ var t = document.createElement("template"); t.innerHTML = String(html).trim(); return t.content.firstChild; }
function escapeHtml(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function findTopic(id){ var c = getCourse(); if (!c) return null; for (var i = 0; i < c.sections.length; i++){ for (var j = 0; j < c.sections[i].topics.length; j++){ if (c.sections[i].topics[j].id === id) return { section: c.sections[i], topic: c.sections[i].topics[j] }; } } return null; }
function studentKey(s){ s = s || state.student; if (!s || !s.name) return null; return (s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase()); }

window.showToast = function(msg, type) {
  var c = document.querySelector(".toast-container") || (function(){ var d = document.createElement("div"); d.className = "toast-container"; document.body.appendChild(d); return d; })();
  var t = document.createElement("div"); t.className = "toast " + (type || "");
  t.innerHTML = (type === "ok" ? "✅ " : type === "err" ? "❌ " : "ℹ️ ") + escapeHtml(msg);
  c.appendChild(t); setTimeout(() => { t.remove(); }, 3000);
};

function loadStudentData(){
  var k = studentKey(); if (!k) return; var ek = encodeURIComponent(k);
  state.progress = JSON.parse(localStorage.getItem("mdk0701.progress." + ek) || "{}");
  state.results = JSON.parse(localStorage.getItem("mdk0701.results." + ek) || "{}");
  state.xp = parseInt(localStorage.getItem("mdk0701.xp." + ek) || "0");
  state.shop = JSON.parse(localStorage.getItem("mdk0701.shop." + ek) || "[]");
  if ($("xpCount")) $("xpCount").textContent = "🌟 " + state.xp + " XP";
}
function saveStudentData(){
  var k = studentKey(); if (!k) return; var ek = encodeURIComponent(k);
  localStorage.setItem("mdk0701.progress." + ek, JSON.stringify(state.progress));
  localStorage.setItem("mdk0701.results." + ek, JSON.stringify(state.results));
  localStorage.setItem("mdk0701.xp." + ek, state.xp);
  localStorage.setItem("mdk0701.shop." + ek, JSON.stringify(state.shop));
  if ($("xpCount")) $("xpCount").textContent = "🌟 " + state.xp + " XP";
}

/* АВТОРИЗАЦИЯ */
function initAuth(){
  var overlay = $("loginOverlay");
  if (!state.student && !state.staff) { overlay.hidden=false; } else overlay.hidden=true;
  
  if (state.student) loadStudentData();

  $("loginBtn").addEventListener("click", ()=>{
    var n = $("loginName").value, g = $("loginGroup").value;
    if (!n || !g) { window.showToast("Введите имя и группу", "err"); return; }
    state.student = { name: n, group: g.toUpperCase() };
    localStorage.setItem("mdk0701.student", JSON.stringify(state.student));
    loadStudentData(); overlay.hidden=true; renderUserChip(); route();
  });
  
  $("loginStaffLink").addEventListener("click", (e)=>{
    e.preventDefault();
    var user = prompt("Логин (admin):"), pass = prompt("Пароль (Admin!Mdk0701_Core):");
    if(!user || !pass) return;
    fetch(APPS_SCRIPT_URL+"?action=login&username="+user+"&password="+pass).then(r=>r.json()).then(d=>{
      if(d.ok){ state.staff = { role: d.role, name: d.name }; sessionStorage.setItem("mdk0701.staff", JSON.stringify(state.staff)); overlay.hidden=true; renderUserChip(); route(); }
      else window.showToast("Неверный пароль", "err");
    });
  });
}
function renderUserChip(){
  if (state.staff) { $("userChipName").textContent = state.staff.name; $("userChipGroup").textContent = "Учитель"; $("userChipAvatar").textContent = "👨‍🏫"; }
  else if (state.student) { $("userChipName").textContent = state.student.name; $("userChipGroup").textContent = "Гр. " + state.student.group; }
}

/* ГЛАВНАЯ */
function renderHome(){
  var app = $("app"); app.innerHTML = ""; var c = getCourse();
  
  // ДОСКА ОБЪЯВЛЕНИЙ
  fetch(APPS_SCRIPT_URL+"?action=announcement").then(r=>r.json()).then(d=>{
    if(d.ok && d.text) app.prepend(el(`<div style="background:var(--accent);color:#fff;padding:16px;border-radius:8px;margin-bottom:24px;font-weight:bold;">📢 ${d.text}</div>`));
  });

  app.appendChild(el(`<section class="hero"><h1>${c.title}</h1><p>${c.module}</p></section>`));
  c.sections.forEach(sec => {
    app.appendChild(el(`<div class="steps-title">${sec.code} · ${sec.title}</div>`));
    var list = el('<div class="topics" style="display:flex;flex-direction:column;gap:12px;"></div>');
    sec.topics.forEach(t => {
      var card = el(`<div class="topic" style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;cursor:pointer;" onclick="location.hash='#/topic/${t.id}'"><b>${t.code}</b> · ${t.title}</div>`);
      list.appendChild(card);
    });
    app.appendChild(list);
  });
}

/* СТРАНИЦА ТЕМЫ */
function renderTopic(id, tab){
  tab = tab || "lecture"; var t = findTopic(id); if(!t) return renderHome();
  var app = $("app"); app.innerHTML = "";
  app.appendChild(el(`<a class="backlink" href="#/">← К программе</a><section class="topic-head"><h1>${t.topic.title}</h1></section>`));
  
  var tabs = [["lecture","01 Лекция"],["practice","02 Практические"],["test","03 Контроль темы"]];
  var tw = el('<div class="tabs"></div>');
  tabs.forEach(item=>{
    var b = el(`<button class="tab ${item[0]===tab?'active':''}">${item[1]}</button>`);
    b.addEventListener("click", ()=>location.hash="#/topic/"+id+"/"+item[0]); tw.appendChild(b);
  });
  app.appendChild(tw); var panel = el('<section class="panel"></section>'); app.appendChild(panel);

  if (tab === "lecture") {
    (t.topic.lectures||[]).forEach(l=>{
      panel.appendChild(el(`<h3>${l.code}. ${l.title}</h3><div class="lecture-content">${l.content || '<p>Материал готовится.</p>'}</div>`));
    });
  }
  if (tab === "practice") {
    (t.topic.practicals||[]).forEach(p=>{
      panel.appendChild(el(`<div class="practice" style="margin-bottom:16px;"><div style="color:var(--accent);font-weight:bold">${p.code}</div><div style="font-weight:bold">${p.title}</div><div>${p.task}</div></div>`));
    });
  }
  if (tab === "test") {
    var testWrap = el('<div></div>'); panel.appendChild(testWrap);
    (t.topic.test||[]).forEach((q, qi)=>{
      var qb = el(`<div class="question"><div class="q-text">${qi+1}. ${q.q}</div></div>`);
      q.options.forEach((opt, oi)=>qb.appendChild(el(`<label class="option"><input type="radio" name="q${qi}" value="${oi}"><span>${opt}</span></label>`)));
      testWrap.appendChild(qb);
    });
    var finishBtn = el('<button class="btn" style="width:100%">Подвести итог</button>'); panel.appendChild(finishBtn);
    finishBtn.addEventListener("click", () => {
      var correct = 0;
      (t.topic.test||[]).forEach((q, qi) => { var ch = testWrap.querySelector(`input[name="q${qi}"]:checked`); if (ch && Number(ch.value) === q.correct) correct++; });
      state.results[t.topic.id] = { grade: Math.round((correct / t.topic.test.length) * 5) };
      state.xp += correct * 10; saveStudentData(); window.showToast("Результат: " + correct + ". Получено XP: " + (correct*10), "ok"); finishBtn.disabled = true;
    });
  }
}

/* СИМУЛЯТОР G-КОДА (2D) */
function renderSimulatorPage(){
  var app = $("app"); app.innerHTML = ""; $("crumbs").textContent = "Симулятор G-кода";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  
  var block = el(`
    <section class="module">
      <h2>🖥️ 2D Симулятор</h2>
      <p class="sub">Введите G-код (G00, G01, G02, G03). Например: G01 X100 Y100</p>
      <textarea id="gcodeInput" style="width:100%;height:150px;font-family:monospace;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--card-soft);color:var(--text);margin-bottom:10px;">G00 X50 Y50
G01 X100 Y100
G01 X100 Y50
G01 X50 Y50</textarea>
      <button class="btn" id="runCodeBtn" style="width:100%;margin-bottom:10px;">▶ Выполнить</button>
      <div style="background:var(--card-soft);border:1px solid var(--border);border-radius:8px;overflow:hidden;">
        <canvas id="simCanvas" width="600" height="400" style="width:100%;height:auto;background:#fff;"></canvas>
      </div>
    </section>
  `);
  app.appendChild(block);

  var canvas = block.querySelector("#simCanvas"), ctx = canvas.getContext("2d");
  var runBtn = block.querySelector("#runCodeBtn"), input = block.querySelector("#gcodeInput");

  function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#eee"; ctx.lineWidth = 1;
    for (var i = 0; i < canvas.width; i += 20) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
    for (var j = 0; j < canvas.height; j += 20) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke(); }
    ctx.strokeStyle = "#333"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, canvas.height/2); ctx.lineTo(canvas.width, canvas.height/2); ctx.stroke(); // X
    ctx.beginPath(); ctx.moveTo(canvas.width/2, 0); ctx.lineTo(canvas.width/2, canvas.height); ctx.stroke(); // Y
  }
  drawGrid();

  runBtn.addEventListener("click", () => {
    drawGrid();
    var lines = input.value.split("\n");
    var curX = canvas.width/2, curY = canvas.height/2;
    ctx.beginPath(); ctx.moveTo(curX, curY); ctx.strokeStyle = "red"; ctx.lineWidth = 3;
    var isDown = false;

    lines.forEach(line => {
      line = line.trim().toUpperCase();
      if(!line) return;
      var gMatch = line.match(/G0[0-3]/);
      if(!gMatch) return;
      var gCode = gMatch[0];
      
      var xMatch = line.match(/X(-?\d+(\.\d+)?)/);
      var yMatch = line.match(/Y(-?\d+(\.\d+)?)/);
      
      if(xMatch) curX = canvas.width/2 + parseFloat(xMatch[1]) * 2; // Масштаб 2x
      if(yMatch) curY = canvas.height/2 - parseFloat(yMatch[1]) * 2; // Y инвертирован

      if(gCode === "G00") { ctx.moveTo(curX, curY); }
      else { ctx.lineTo(curX, curY); isDown = true; }
    });
    if(isDown) ctx.stroke();
    window.showToast("Траектория построена!", "ok");
  });
}

/* МАГАЗИН XP */
function renderShopPage(){
  var app = $("app"); app.innerHTML = ""; $("crumbs").textContent = "Магазин";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el(`<section class="hero"><h1>Магазин XP</h1><p>У вас: 🌟 <b>${state.xp} XP</b></p></section>`));
  
  var items = [
    { id: "golden_avatar", icon: "👑", title: "Золотой аватар", desc: "Крутая рамка в профиле", price: 100 },
    { id: "exam_time", icon: "⏱", title: "+5 минут к экзамену", desc: "Больше времени на сдачу", price: 150 },
    { id: "theme_dark_plus", icon: "🌌", title: "Тема 'Космос'", desc: "Секретная тема", price: 200 }
  ];
  
  var grid = el('<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;"></div>');
  items.forEach(it => {
    var has = state.shop.includes(it.id);
    var btn = el(`<button class="btn" style="width:100%;margin-top:10px;" ${has || state.xp < it.price ? 'disabled' : ''}>${has ? 'Куплено' : (state.xp < it.price ? 'Не хватает XP' : 'Купить за ' + it.price)}</button>`);
    if (!has && state.xp >= it.price) {
      btn.addEventListener("click", () => { state.xp -= it.price; state.shop.push(it.id); saveStudentData(); renderShopPage(); window.showToast("Покупка успешна!", "ok"); });
    }
    var card = el(`<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;text-align:center;"><div style="font-size:40px;">${it.icon}</div><div style="font-weight:bold;margin:10px 0;">${it.title}</div><div style="font-size:12px;color:var(--muted);margin-bottom:10px;">${it.desc}</div></div>`);
    card.appendChild(btn); grid.appendChild(card);
  });
  app.appendChild(grid);
}

/* ПОРТФОЛИО (СЕРТИФИКАТ) */
function renderPortfolioPage(){
  var app = $("app"); app.innerHTML = ""; $("crumbs").textContent = "Портфолио";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  
  var c = getCourse();
  var html = `
    <div id="portfolioPrint" style="background:var(--card);padding:40px;border-radius:16px;border:1px solid var(--border);">
      <div style="text-align:center;margin-bottom:30px;">
        <h1 style="font-size:32px;margin:0;">ПОРТФОЛИО СТУДЕНТА</h1>
        <p style="color:var(--muted);">МДК 07.01 — Технология обработки деталей на станках с ЧПУ</p>
      </div>
      
      <div style="margin-bottom:20px;">
        <h3>Личные данные</h3>
        <p><b>ФИО:</b> ${state.student.name}</p>
        <p><b>Группа:</b> ${state.student.group}</p>
        <p><b>XP:</b> ${state.xp}</p>
      </div>

      <div style="margin-bottom:20px;">
        <h3>Статистика обучения</h3>
        <p><b>Пройдено тем:</b> ${Object.keys(state.progress).length} из 21</p>
        <p><b>Сдано тестов:</b> ${Object.keys(state.results).length}</p>
      </div>
    </div>
    <button class="btn" style="margin-top:20px;width:100%;" onclick="window.print()">🖨 Сохранить в PDF</button>
  `;
  app.appendChild(el(html));
}

/* РОУТИНГ */
function route(){
  closeDrawer(); var hash = location.hash.replace(/^#/, "") || "/"; var parts = hash.split("/").filter(Boolean); var app = $("app"); if(!app) return;
  if (!state.student && !state.staff) { app.innerHTML = ""; return; }
  
  if (parts[0] === "topic" && parts[1]) renderTopic(parts[1], parts[2]);
  else if (parts[0] === "simulator") renderSimulatorPage();
  else if (parts[0] === "shop") renderShopPage();
  else if (parts[0] === "portfolio") renderPortfolioPage();
  else if (parts[0] === "dashboard") window.renderDashboard();
  else if (parts[0] === "journal") window.renderJournalPage();
  else if (parts[0] === "rating") window.renderRatingPage();
  else if (parts[0] === "schedule") window.renderSchedulePage();
  else if (parts[0] === "links") window.renderLinksPage();
  else if (parts[0] === "gcode-reference") window.renderGCodeReferencePage();
  else renderHome();
  window.scrollTo(0, 0);
}

function closeDrawer(){ $("drawer").classList.remove("open"); $("drawerOverlay").classList.remove("open"); }
function toggleDrawer(){ $("drawer").classList.toggle("open"); $("drawerOverlay").classList.toggle("open"); }

window.addEventListener("DOMContentLoaded", () => {
  $("burgerBtn").addEventListener("click", toggleDrawer);
  $("drawerOverlay").addEventListener("click", closeDrawer);
  $("drawerClose").addEventListener("click", closeDrawer);
  document.querySelectorAll("[data-go]").forEach(el => el.addEventListener("click", (e) => { e.preventDefault(); location.hash = el.dataset.go; closeDrawer(); }));
  
  initAuth(); route();
});
window.addEventListener("hashchange", route);