/* ============================================================
   МДК 07.01 — script.js (v23.0 FULL)
   ============================================================ */
"use strict";

var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzB0v37m5pC0jSnEmCEllIlN3IlRmgOhaPEW9giHbS6wNIYFHClxJv8Z5HyG4-AJBpdaQ/exec";
var state = { student: null, staff: null, progress: {}, results: {}, selfResults: {}, favorites: [], xp: 0, shop: [] };

// Восстановление данных из памяти
try { var _s = JSON.parse(localStorage.getItem("mdk0701.student") || "null"); if (_s && _s.name) state.student = _s; } catch (e){}
try { var _st = JSON.parse(sessionStorage.getItem("mdk0701.staff") || "null"); if (_st && _st.role) state.staff = _st; } catch (e){}

// Утилиты
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

// Сохранение/Загрузка
function loadStudentData(){
  var k = studentKey(); if (!k) return; var ek = encodeURIComponent(k);
  state.progress = JSON.parse(localStorage.getItem("mdk0701.progress." + ek) || "{}");
  state.results = JSON.parse(localStorage.getItem("mdk0701.results." + ek) || "{}");
  state.selfResults = JSON.parse(localStorage.getItem("mdk0701.selfResults." + ek) || "{}");
  state.xp = parseInt(localStorage.getItem("mdk0701.xp." + ek) || "0");
  state.shop = JSON.parse(localStorage.getItem("mdk0701.shop." + ek) || "[]");
  if ($("xpCount")) $("xpCount").textContent = "🌟 " + state.xp + " XP";
}
function saveStudentData(){
  var k = studentKey(); if (!k) return; var ek = encodeURIComponent(k);
  localStorage.setItem("mdk0701.progress." + ek, JSON.stringify(state.progress));
  localStorage.setItem("mdk0701.results." + ek, JSON.stringify(state.results));
  localStorage.setItem("mdk0701.selfResults." + ek, JSON.stringify(state.selfResults));
  localStorage.setItem("mdk0701.xp." + ek, state.xp);
  localStorage.setItem("mdk0701.shop." + ek, JSON.stringify(state.shop));
  if ($("xpCount")) $("xpCount").textContent = "🌟 " + state.xp + " XP";
}

// АВТОРИЗАЦИЯ
function initAuth(){
  var overlay = $("loginOverlay");
  if (!overlay) return;

  if (!state.student && !state.staff) overlay.hidden = false; else overlay.hidden = true;
  if (state.student) loadStudentData();

  // 1. Кнопка Входа Студента
  $("loginBtn").addEventListener("click", () => {
    var n = $("loginName").value.trim();
    var g = $("loginGroup").value.trim();
    if (!n || !g) { window.showToast("Введите ФИО и группу", "err"); return; }
    
    state.student = { name: n, group: g.toUpperCase() };
    localStorage.setItem("mdk0701.student", JSON.stringify(state.student));
    loadStudentData(); overlay.hidden = true; renderUserChip(); route();
    window.showToast("Вы вошли как " + n, "ok");
  });

  // 2. Кнопка Входа Сотрудника
  $("staffLoginBtn").addEventListener("click", () => {
    var user = $("loginStaffName").value.trim();
    var pass = $("loginStaffPass").value.trim();
    if (!user || !pass) { window.showToast("Введите логин и пароль", "err"); return; }

    fetch(APPS_SCRIPT_URL + "?action=login&username=" + encodeURIComponent(user) + "&password=" + encodeURIComponent(pass))
      .then(r => r.json()).then(d => {
        if (d.ok) { 
          state.staff = { role: d.role, name: d.name }; 
          sessionStorage.setItem("mdk0701.staff", JSON.stringify(state.staff)); 
          overlay.hidden = true; renderUserChip(); route(); 
          window.showToast("Добро пожаловать, " + d.name, "ok");
        } else {
          window.showToast("Неверный логин или пароль", "err");
        }
      }).catch(() => window.showToast("Ошибка сети", "err"));
  });
}

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

// МЕНЮ (ШТОРКА)
function closeDrawer(){ if($("drawer")) $("drawer").classList.remove("open"); if($("drawerOverlay")) $("drawerOverlay").classList.remove("open"); }
function toggleDrawer(){ if($("drawer")) $("drawer").classList.toggle("open"); if($("drawerOverlay")) $("drawerOverlay").classList.toggle("open"); }
function initDrawer(){
  if(!$("burgerBtn")) return;
  $("burgerBtn").addEventListener("click", toggleDrawer);
  $("drawerOverlay").addEventListener("click", closeDrawer);
  $("drawerClose").addEventListener("click", closeDrawer);
  document.querySelectorAll("[data-go]").forEach(el => el.addEventListener("click", (e) => { 
    e.preventDefault(); 
    location.hash = el.dataset.go; 
    closeDrawer(); 
  }));
}

// ГЛАВНАЯ СТРАНИЦА
function renderHome(){
  var app = $("app"); if (!app) return; app.innerHTML = ""; var c = getCourse();
  
  fetch(APPS_SCRIPT_URL+"?action=announcement").then(r=>r.json()).then(d=>{
    if(d.ok && d.text) app.prepend(el(`<div style="background:var(--accent);color:#fff;padding:16px;border-radius:8px;margin-bottom:24px;font-weight:bold;">📢 ${d.text}</div>`));
  }).catch(()=>{});

  app.appendChild(el(`<section class="hero"><h1>${c.title}</h1><p>${c.module}</p></section>`));
  
  c.sections.forEach(sec => {
    app.appendChild(el(`<div class="steps-title" style="margin:24px 0 10px;font-size:14px;color:var(--muted);text-transform:uppercase;">${sec.code} · ${sec.title}</div>`));
    var list = el('<div class="topics" style="display:flex;flex-direction:column;gap:12px;"></div>');
    sec.topics.forEach(t => {
      var card = el(`<div class="topic" onclick="location.hash='#/topic/${t.id}'"><b style="color:var(--accent)">${t.code}</b> · ${t.title}</div>`);
      list.appendChild(card);
    });
    app.appendChild(list);
  });
}

// СТРАНИЦА ТЕМЫ
function renderTopic(id, tab){
  tab = tab || "lecture"; var t = findTopic(id); if(!t) return renderHome();
  var app = $("app"); app.innerHTML = "";
  
  app.appendChild(el(`<a class="backlink" href="#/">← К программе</a><section class="topic-head"><h1>${t.topic.title}</h1></section>`));
  
  var tabs = [["lecture","01 Лекция"],["practice","02 Практика"],["self","03 Сам. работа"],["test","04 Тест"]];
  var tw = el('<div class="tabs"></div>');
  tabs.forEach(item=>{
    var b = el(`<button class="tab ${item[0]===tab?'active':''}">${item[1]}</button>`);
    b.addEventListener("click", ()=>location.hash="#/topic/"+id+"/"+item[0]); tw.appendChild(b);
  });
  app.appendChild(tw); 
  var panel = el('<section class="panel"></section>'); app.appendChild(panel);

  // 1. ЛЕКЦИЯ
  if (tab === "lecture") {
    if(t.topic.lectures && t.topic.lectures.length) {
      t.topic.lectures.forEach(l=>{
        panel.appendChild(el(`<h3>${l.code}. ${l.title}</h3>`));
        panel.appendChild(el(`<div class="lecture-content">${l.content || '<p>Материал готовится.</p>'}</div>`));
      });
    } else panel.appendChild(el('<p>Лекция пока не добавлена.</p>'));
  }
  
  // 2. ПРАКТИКА
  if (tab === "practice") {
    if(t.topic.practicals && t.topic.practicals.length) {
      t.topic.practicals.forEach(p=>{
        var html = `<div class="practice" style="margin-bottom:16px;border:1px solid var(--border);padding:16px;border-radius:8px;">
          <b style="color:var(--accent)">${p.code}</b>
          <div style="font-weight:bold;margin:4px 0">${p.title}</div>
          <div>${p.task}</div>
          <div style="margin-top:12px;">
            <input type="file" id="file_${p.code}" style="display:none" onchange="window.uploadFile(event, '${p.code}', '${p.title}')">
            <button class="btn" onclick="document.getElementById('file_${p.code}').click()">📎 Прикрепить работу</button>
          </div>
        </div>`;
        panel.appendChild(el(html));
      });
    } else panel.appendChild(el('<p>Практических работ нет.</p>'));
  }

  // 3. САМОСТОЯТЕЛЬНАЯ
  if (tab === "self") {
    if(t.topic.selfChecks && t.topic.selfChecks.length) {
      var selfWrap = el('<div id="selfWrap"></div>'); panel.appendChild(selfWrap);
      t.topic.selfChecks.forEach((q, i)=>{
        selfWrap.appendChild(el(`<div class="question"><div class="q-text">${i+1}. ${q.q}</div><input type="text" class="self-input" data-idx="${i}" placeholder="Ваш ответ" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);margin:8px 0;"><div class="self-feedback" id="fb_${i}" style="font-size:13px;"></div></div>`));
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

  // 4. ТЕСТ (С таймером)
  if (tab === "test") {
    if(t.topic.test && t.topic.test.length) {
      var timerBox = el('<div style="font-size:20px;font-weight:bold;color:var(--err);margin-bottom:16px;">⏱ 15:00</div>');
      panel.appendChild(timerBox);
      var testWrap = el('<div id="testWrap"></div>'); panel.appendChild(testWrap);
      
      t.topic.test.forEach((q, qi)=>{
        var qb = el(`<div class="question"><div class="q-text">${qi+1}. ${q.q}</div></div>`);
        q.options.forEach((opt, oi)=>qb.appendChild(el(`<label class="option"><input type="radio" name="q${qi}" value="${oi}"><span>${opt}</span></label>`)));
        testWrap.appendChild(qb);
      });
      
      var finishBtn = el('<button class="btn" style="width:100%">Подвести итог</button>'); panel.appendChild(finishBtn);

      var timeLeft = 15 * 60;
      var timerId = setInterval(() => {
        if (!document.body.contains(timerBox)) { clearInterval(timerId); return; }
        timeLeft--;
        timerBox.textContent = "⏱ " + String(Math.floor(timeLeft/60)).padStart(2,'0') + ":" + String(timeLeft%60).padStart(2,'0');
        if (timeLeft <= 0) { clearInterval(timerId); finishBtn.click(); }
      }, 1000);

      finishBtn.addEventListener("click", () => {
        clearInterval(timerId);
        var correct = 0;
        t.topic.test.forEach((q, qi) => {
          var ch = testWrap.querySelector(`input[name="q${qi}"]:checked`);
          if (ch && Number(ch.value) === q.correct) correct++;
        });
        var grade = Math.round((correct / t.topic.test.length) * 5);
        state.results[t.topic.id] = { grade: grade, date: new Date().toISOString() };
        state.xp += correct * 10; 
        saveStudentData(); 
        window.showToast(`Результат: ${correct}. Оценка: ${grade}. Получено XP: ${correct*10}`, "ok");
        finishBtn.disabled = true;
      });
    } else panel.appendChild(el('<p>Тестов нет.</p>'));
  }
}

// ЗАГРУЗКА ФАЙЛОВ
window.uploadFile = function(event, code, title) {
  var file = event.target.files[0]; if (!file) return;
  if (file.size > 2 * 1024 * 1024) { window.showToast("Файл слишком большой (макс 2МБ)", "err"); return; }
  
  window.showToast("Загрузка файла...", "info");
  var reader = new FileReader();
  reader.onload = function(e) {
    var base64 = e.target.result.split(',')[1];
    var params = new URLSearchParams();
    params.append("action", "uploadwork");
    params.append("key", studentKey());
    params.append("name", state.student.name);
    params.append("group", state.student.group);
    params.append("workCode", code);
    params.append("workTitle", title);
    params.append("fileName", file.name);
    params.append("fileType", file.type);
    params.append("fileData", base64);

    fetch(APPS_SCRIPT_URL, { method: "POST", body: params })
    .then(r => r.json()).then(d => {
      if (d.ok) window.showToast("Работа успешно загружена!", "ok");
      else window.showToast("Ошибка: " + (d.error||""), "err");
    }).catch(() => window.showToast("Ошибка сети", "err"));
  };
  reader.readAsDataURL(file);
};

// СИМУЛЯТОР G-КОДА
function renderSimulatorPage(){
  var app = $("app"); app.innerHTML = ""; 
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  var block = el(`
    <section class="module">
      <h2>🖥️ Симулятор</h2>
      <p class="sub">Введите G-код (G00, G01, X, Y). Пример: G01 X100 Y50</p>
      <textarea id="gcodeInput" style="width:100%;height:120px;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--card-soft);color:var(--text);margin-bottom:10px;font-family:monospace;">G00 X0 Y0
G01 X50 Y50
G01 X100 Y50
G01 X100 Y0
G01 X0 Y0</textarea>
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
    ctx.beginPath(); ctx.moveTo(0, canvas.height/2); ctx.lineTo(canvas.width, canvas.height/2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(canvas.width/2, 0); ctx.lineTo(canvas.width/2, canvas.height); ctx.stroke();
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
      
      var xMatch = line.match(/X(-?\d+(\.\d+)?)/);
      var yMatch = line.match(/Y(-?\d+(\.\d+)?)/);
      
      if(xMatch) curX = canvas.width/2 + parseFloat(xMatch[1]) * 2;
      if(yMatch) curY = canvas.height/2 - parseFloat(yMatch[1]) * 2;

      if(gMatch[0] === "G00") { ctx.moveTo(curX, curY); }
      else { ctx.lineTo(curX, curY); isDown = true; }
    });
    if(isDown) ctx.stroke();
    window.showToast("Траектория построена!", "ok");
  });
}

// МАГАЗИН
function renderShopPage(){
  var app = $("app"); app.innerHTML = ""; 
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el(`<section class="hero"><h1>Магазин XP</h1><p>У вас: 🌟 <b>${state.xp} XP</b></p></section>`));
  
  var items = [
    { id: "golden", icon: "👑", title: "Золотой аватар", price: 100 },
    { id: "exam_time", icon: "⏱", title: "+5 минут к экзамену", price: 150 },
    { id: "theme", icon: "🌌", title: "Тема 'Космос'", price: 200 }
  ];
  
  var grid = el('<div class="shop-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;"></div>');
  items.forEach(it => {
    var has = state.shop.includes(it.id);
    var btn = el(`<button class="btn" style="width:100%;margin-top:10px;" ${has || state.xp < it.price ? 'disabled' : ''}>${has ? 'Куплено' : (state.xp < it.price ? 'Мало XP' : 'Купить за ' + it.price)}</button>`);
    if (!has && state.xp >= it.price) {
      btn.addEventListener("click", () => { 
        state.xp -= it.price; 
        state.shop.push(it.id); 
        saveStudentData(); 
        renderShopPage(); 
        window.showToast("Покупка успешна!", "ok"); 
      });
    }
    var card = el(`<div class="shop-item" style="background:var(--card);border:1px solid var(--border);padding:16px;border-radius:12px;text-align:center;"><div style="font-size:40px;">${it.icon}</div><div style="font-weight:bold;margin:10px 0;">${it.title}</div></div>`);
    card.appendChild(btn); 
    grid.appendChild(card);
  });
  app.appendChild(grid);
}

// ПОРТФОЛИО
function renderPortfolioPage(){
  var app = $("app"); app.innerHTML = ""; 
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  var html = `
    <div id="portfolioPrint" class="module" style="padding:40px;">
      <h1 style="text-align:center;">ПОРТФОЛИО СТУДЕНТА</h1>
      <p style="text-align:center;color:var(--muted);">МДК 07.01 — Технология обработки деталей на станках с ЧПУ</p>
      <hr style="margin:20px 0;border:none;border-top:1px solid var(--border);">
      <h3>Личные данные</h3>
      <p><b>ФИО:</b> ${state.student.name}</p>
      <p><b>Группа:</b> ${state.student.group}</p>
      <p><b>Опыт (XP):</b> ${state.xp}</p>
      <h3>Статистика</h3>
      <p><b>Пройдено тем:</b> ${Object.keys(state.progress).length}</p>
      <p><b>Сдано тестов:</b> ${Object.keys(state.results).length}</p>
    </div>
    <button class="btn" style="margin-top:20px;width:100%;" onclick="window.print()">🖨 Сохранить в PDF</button>
  `;
  app.appendChild(el(html));
}

// КАЛЬКУЛЯТОР
function renderCalculatorPage(){
  var app = $("app"); app.innerHTML = ""; 
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el(`<section class="module"><h2>Калькулятор Vc</h2>
    <input type="number" id="vc" value="180" placeholder="Vc" style="padding:10px;margin-bottom:10px;width:100%;border-radius:8px;border:1px solid var(--border);">
    <input type="number" id="d" value="50" placeholder="Диаметр" style="padding:10px;margin-bottom:10px;width:100%;border-radius:8px;border:1px solid var(--border);">
    <button class="btn" style="width:100%" onclick="var n=Math.round((1000*document.getElementById('vc').value)/(Math.PI*document.getElementById('d').value)); document.getElementById('res').innerText='n = '+n+' об/мин';">Рассчитать</button>
    <div id="res" style="margin-top:15px;font-weight:bold;font-size:18px;"></div>
  </section>`));
}

// РОУТИНГ
function route(){
  closeDrawer();
  document.querySelectorAll(".theme-overlay, .avatar-overlay, .search-overlay").forEach(x=>x.remove());
  var hash = location.hash.replace(/^#/, "") || "/"; 
  var parts = hash.split("/").filter(Boolean); 
  var app = $("app"); if(!app) return;
  
  if (!state.student && !state.staff) { app.innerHTML = ""; return; }
  
  if (parts[0] === "topic" && parts[1]) renderTopic(parts[1], parts[2]);
  else if (parts[0] === "simulator") renderSimulatorPage();
  else if (parts[0] === "shop") renderShopPage();
  else if (parts[0] === "portfolio") renderPortfolioPage();
  else if (parts[0] === "calculator") renderCalculatorPage();
  else if (parts[0] === "profile") window.renderProfilePage && window.renderProfilePage();
  else if (parts[0] === "dashboard") window.renderDashboard && window.renderDashboard();
  else if (parts[0] === "journal") window.renderJournalPage && window.renderJournalPage();
  else if (parts[0] === "rating") window.renderRatingPage && window.renderRatingPage();
  else if (parts[0] === "schedule") window.renderSchedulePage && window.renderSchedulePage();
  else if (parts[0] === "links") window.renderLinksPage && window.renderLinksPage();
  else if (parts[0] === "gcode-reference") window.renderGCodeReferencePage && window.renderGCodeReferencePage();
  else if (parts[0] === "final-exam") window.renderFinalExamPage && window.renderFinalExamPage();
  else if (parts[0] === "final-training") window.renderFinalTrainingPage && window.renderFinalTrainingPage();
  else if (parts[0] === "tictactoe") window.renderTicTacToePage && window.renderTicTacToePage();
  else renderHome();
  
  window.scrollTo(0, 0);
}

// ИНИЦИАЛИЗАЦИЯ
window.addEventListener("DOMContentLoaded", () => {
  initAuth();
  initDrawer();
  renderUserChip();
  route();
});
window.addEventListener("hashchange", route);