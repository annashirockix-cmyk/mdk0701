/* ============================================================
   МДК 07.01 — script.js (v55.0 — SHOP & ASSISTANT FIX)
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
  
  if(APPS_SCRIPT_URL) {
    var p = new URLSearchParams();
    p.append("action", "save"); p.append("key", k); p.append("name", state.student.name); p.append("group", state.student.group);
    p.append("payload", JSON.stringify({ progress: state.progress, results: state.results, selfResults: state.selfResults, favorites: state.favorites }));
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p }).catch(function(){});
  }
}

window.uploadFile = function(event, code, title) {
  var file = event.target.files[0]; if (!file) return;
  if (file.size > 15 * 1024 * 1024) { alert("Файл больше 15 МБ!"); return; }
  alert("Начинаем отправку файла " + file.name + "...");
  var reader = new FileReader();
  reader.onload = function(e) {
    var base64 = e.target.result.split(',')[1];
    var params = new URLSearchParams();
    params.append("action", "uploadwork"); params.append("key", studentKey()); params.append("name", state.student.name); params.append("group", state.student.group); params.append("workCode", code); params.append("workTitle", title); params.append("fileName", file.name); params.append("fileType", file.type); params.append("fileData", base64);
    fetch(APPS_SCRIPT_URL, { method: "POST", body: params }).then(r => r.json()).then(d => { if (d.ok) alert("✅ УСПЕХ! Работа загружена."); else alert("❌ ОШИБКА: " + (d.error||"")); }).catch(() => alert("❌ ОШИБКА СЕТИ."));
  };
  reader.readAsDataURL(file);
};

function applyTheme(theme){ document.documentElement.setAttribute("data-theme", theme); localStorage.setItem("mdk0701.theme", theme); }
function openThemeModal(){
  var current = document.documentElement.getAttribute("data-theme") || "light";
  var themes = ["light", "dark", "sepia", "ocean", "forest"]; var names = ["Светлая", "Тёмная", "Сепия", "Океан", "Лес"];
  var modal = el(`<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center;" id="themeModal"><div style="background:var(--card);padding:24px;border-radius:16px;width:90%;max-width:400px;"><h3 style="margin-top:0;">Выберите тему</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0;" id="themeGrid"></div><button class="btn ghost" style="width:100%" onclick="document.getElementById('themeModal').remove()">Закрыть</button></div></div>`);
  var grid = modal.querySelector("#themeGrid");
  themes.forEach(function(t, i){ var btn = el('<button class="btn ' + (t===current ? '' : 'ghost') + '" style="padding:12px;">' + names[i] + '</button>'); btn.onclick = function() { applyTheme(t); modal.remove(); }; grid.appendChild(btn); });
  document.body.appendChild(modal);
}

window.doStudentLogin = function() {
  var n = $("loginName").value.trim(); var g = $("loginGroup").value.trim();
  if (!n || !g) { alert("Введите ФИО и Группу!"); return; }
  state.student = { name: n, group: g.toUpperCase() };
  localStorage.setItem("mdk0701.student", JSON.stringify(state.student));
  $("loginOverlay").hidden = true; renderUserChip(); loadStudentData(); route();
};
window.doTeacherLogin = function() {
  var user = $("loginStaffName").value.trim(); var pass = $("loginStaffPass").value.trim(); var btn = $("staffLoginBtn");
  if (!user || !pass) { alert("Введите логин и пароль!"); return; }
  btn.textContent = "Проверяем..."; btn.disabled = true;
  fetch(APPS_SCRIPT_URL + "?action=login&username=" + encodeURIComponent(user) + "&password=" + encodeURIComponent(pass) + "&t=" + new Date().getTime())
    .then(function(r){ return r.json(); }).then(function(d) {
      if (d && d.ok) { state.staff = { role: d.role, name: d.name }; sessionStorage.setItem("mdk0701.staff", JSON.stringify(state.staff)); $("loginOverlay").hidden = true; renderUserChip(); route(); } 
      else { alert("Неверный логин или пароль."); btn.textContent = "Войти как сотрудник"; btn.disabled = false; }
    }).catch(function() { alert("Ошибка сети."); btn.textContent = "Войти как сотрудник"; btn.disabled = false; });
};
window.handleLogout = function() {
  if (confirm("Выйти из аккаунта?")) {
    state.student = null; state.staff = null; localStorage.removeItem("mdk0701.student"); sessionStorage.removeItem("mdk0701.staff");
    $("loginOverlay").hidden = false; $("userChipName").textContent = "Гость"; $("userChipGroup").textContent = "Роль: Гость"; $("userChipAvatar").textContent = "👨‍🎓"; if ($("xpCount")) $("xpCount").textContent = "🌟 0 XP"; closeDrawer(); route();
  }
};

function renderUserChip(){
  if (state.staff) { $("userChipName").textContent = state.staff.name; $("userChipGroup").textContent = "Учитель"; $("userChipAvatar").textContent = "👨‍🏫"; } 
  else if (state.student) { $("userChipName").textContent = state.student.name; $("userChipGroup").textContent = "Гр. " + state.student.group; $("userChipAvatar").textContent = "👨‍🎓"; }
}
function closeDrawer(){ $("drawer").classList.remove("open"); $("drawerOverlay").classList.remove("open"); }
function toggleDrawer(){ $("drawer").classList.toggle("open"); $("drawerOverlay").classList.toggle("open"); }

function renderHome(){
  var app = $("app"); app.innerHTML = ""; var c = getCourse();
  if(!c) { app.innerHTML = "<p>Ошибка загрузки курса.</p>"; return; }
  app.appendChild(el('<section class="hero"><h1>' + c.title + '</h1><p>' + c.module + '</p></section>'));
  c.sections.forEach(function(sec) {
    app.appendChild(el('<div class="steps-title">' + sec.code + ' · ' + sec.title + '</div>'));
    var list = document.createElement("div");
    sec.topics.forEach(function(t) { list.appendChild(el('<div class="topic" onclick="location.hash=\'#/topic/' + t.id + '\'"><span class="t-code">' + t.code + '</span><span class="t-title">' + t.title + '</span></div>')); });
    app.appendChild(list);
  });
  if (c.passports && c.passports.length) { app.appendChild(el('<div class="steps-title">Паспорта станков</div><div class="module"><p>Раздел доступен в полной версии.</p></div>')); }
  if (c.videos && c.videos.length) { app.appendChild(el('<div class="steps-title">Видеоматериалы</div><div class="module"><p>Раздел доступен в полной версии.</p></div>')); }
  // Карточки
  app.appendChild(el('<div class="steps-title">Интерактив</div><section class="module"><h2>🎴 Карточки знаний</h2><div class="flashcard" onclick="this.classList.toggle(\'flipped\')" style="width:100%;height:150px;cursor:pointer;perspective:1000px;"><div class="flashcard-inner" style="position:relative;width:100%;height:100%;text-align:center;transition:transform 0.6s;transform-style:preserve-3d;"><div style="position:absolute;width:100%;height:100%;backface-visibility:hidden;background:var(--card-soft);border:2px solid var(--border);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;">Что такое G-код?</div><div style="position:absolute;width:100%;height:100%;backface-visibility:hidden;background:var(--card-soft);border:2px solid var(--accent);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;transform:rotateY(180deg);">Язык ЧПУ</div></div></div></section>'));
}

function renderTopic(id, tab){
  tab = tab || "lecture"; var t = findTopic(id); if(!t) return renderHome();
  var app = $("app"); app.innerHTML = "";
  app.appendChild(el('<a class="backlink" href="#/">← К программе</a><section class="topic-head"><h1>' + t.topic.title + '</h1></section>'));
  var tabs = [["lecture","01 Лекция"],["practice","02 Практика"],["self","03 Сам. работа"],["test","04 Тест"]];
  var tw = el('<div class="tabs"></div>');
  tabs.forEach(function(item){ tw.appendChild(el('<button class="tab ' + (item[0] === tab ? 'active' : '') + '" onclick="location.hash=\'#/topic/' + id + '/' + item[0] + '\'">' + item[1] + '</button>')); });
  app.appendChild(tw); var panel = el('<section class="panel"></section>'); app.appendChild(panel);

  if (tab === "lecture") {
    if(t.topic.lectures) t.topic.lectures.forEach(function(l){ panel.appendChild(el('<h3>' + l.code + '. ' + l.title + '</h3><div class="lecture-content">' + (l.content || '<p>Материал готовится.</p>') + '</div>')); });
    var isDone = state.progress[id] && state.progress[id].done >= 5;
    var markBtn = el('<button class="btn" style="width:100%; margin-top:20px;" ' + (isDone ? 'disabled' : '') + '>' + (isDone ? '✅ Тема изучена' : 'Отметить как изученное (+20 XP)') + '</button>');
    markBtn.onclick = function() { if (!state.progress[id]) state.progress[id] = {}; state.progress[id].done = 5; state.xp += 20; saveStudentData(); window.showToast("Лекция изучена!", "ok"); markBtn.textContent = "✅ Тема изучена"; markBtn.disabled = true; };
    panel.appendChild(markBtn);
  }
  if (tab === "practice") {
    if(t.topic.practicals) t.topic.practicals.forEach(function(p){
      var html = '<div class="practice" style="margin-bottom:24px;border:1px solid var(--border);padding:20px;border-radius:12px;background:var(--card-soft);"><div style="color:var(--accent);font-weight:bold;font-size:16px;">' + p.code + '</div><div style="font-weight:bold;margin:4px 0 12px 0;font-size:18px;">' + p.title + '</div>';
      if(p.task) html += '<div style="margin-bottom:12px;"><b>Задание:</b> ' + p.task + '</div>';
      if(p.variants && p.variants.rows) { html += '<div style="margin-top:16px;"><b style="color:var(--accent);">Варианты:</b><div style="overflow-x:auto;margin-top:8px;"><table style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr>'; if(p.variants.header) p.variants.header.forEach(function(h){ html += '<th style="border:1px solid var(--border);padding:8px;background:var(--card);">' + h + '</th>'; }); html += '</tr></thead><tbody>'; p.variants.rows.forEach(function(r){ html += '<tr>'; r.forEach(function(c){ html += '<td style="border:1px solid var(--border);padding:8px;">' + c + '</td>'; }); html += '</tr>'; }); html += '</tbody></table></div></div>'; }
      html += '<div style="margin-top:16px;"><input type="file" id="file_' + p.code.replace(/\s+/g, '') + '" style="display:none" onchange="window.uploadFile(event, \'' + p.code + '\', \'' + p.title + '\')"><button class="btn" onclick="document.getElementById(\'file_' + p.code.replace(/\s+/g, '') + '\').click()">📎 Прикрепить работу</button></div></div>';
      panel.appendChild(el(html));
    });
  }
  if (tab === "self") {
    if(t.topic.selfChecks) {
      var selfWrap = el('<div></div>'); panel.appendChild(selfWrap);
      t.topic.selfChecks.forEach(function(q, i){ selfWrap.appendChild(el('<div class="question"><div class="q-text">' + (i+1) + '. ' + q.q + '</div><input type="text" class="self-input" data-idx="' + i + '" placeholder="Ваш ответ"><div class="self-feedback" id="fb_' + i + '" style="font-size:13px; margin-top:4px;"></div></div>')); });
      var resultBox = el('<div id="selfResult" style="font-size:20px;font-weight:bold;margin-top:20px;text-align:center;"></div>'); panel.appendChild(resultBox);
      var checkBtn = el('<button class="btn" style="width:100%;margin-top:10px;">Проверить все ответы</button>'); panel.appendChild(checkBtn);
      checkBtn.onclick = function() {
        var correctCount = 0;
        selfWrap.querySelectorAll(".self-input").forEach(function(inp) { var idx = Number(inp.getAttribute("data-idx")); var q = t.topic.selfChecks[idx]; var fb = selfWrap.querySelector("#fb_" + idx); if (inp.value.trim().toLowerCase() === q.a.trim().toLowerCase()) { fb.textContent = "✔ Верно"; fb.style.color = "var(--ok)"; correctCount++; } else { fb.textContent = "✘ Неверно. Ответ: " + q.a; fb.style.color = "var(--err)"; } });
        var grade = Math.max(2, Math.round((correctCount/t.topic.selfChecks.length)*5)); state.selfResults[id] = { grade: grade }; saveStudentData();
        resultBox.textContent = "Правильных ответов: " + correctCount + " из " + t.topic.selfChecks.length + " (Оценка: " + grade + ")";
      };
    }
  }
  if (tab === "test") {
    if(t.topic.test) {
      var timerBox = el('<div style="font-size:20px;font-weight:bold;color:var(--err);margin-bottom:16px;">⏱ 15:00</div>'); panel.appendChild(timerBox);
      var testWrap = el('<div></div>'); panel.appendChild(testWrap);
      t.topic.test.forEach(function(q, qi){ var qb = el('<div class="question"><div class="q-text">' + (qi+1) + '. ' + q.q + '</div></div>'); q.options.forEach(function(opt, oi){ qb.appendChild(el('<label class="option"><input type="radio" name="q' + qi + '" value="' + oi + '"><span>' + opt + '</span></label>')); }); testWrap.appendChild(qb); });
      var resultBox = el('<div id="testResult" style="font-size:20px;font-weight:bold;margin-top:20px;text-align:center;"></div>'); panel.appendChild(resultBox);
      var finishBtn = el('<button class="btn" style="width:100%;margin-top:10px;">Подвести итог</button>'); panel.appendChild(finishBtn);
      var timeLeft = 15 * 60; var timerId = setInterval(function() { if (!document.body.contains(timerBox)) { clearInterval(timerId); return; } timeLeft--; timerBox.textContent = "⏱ " + String(Math.floor(timeLeft/60)).padStart(2,'0') + ":" + String(timeLeft%60).padStart(2,'0'); if (timeLeft <= 0) { clearInterval(timerId); finishBtn.click(); } }, 1000);
      finishBtn.onclick = function() {
        clearInterval(timerId); var correct = 0;
        t.topic.test.forEach(function(q, qi) { var ch = testWrap.querySelector('input[name="q' + qi + '"]:checked'); var opts = testWrap.querySelectorAll('.question')[qi].querySelectorAll('.option'); opts.forEach(function(o){ o.classList.remove('correct','wrong'); }); if (ch) { var chosen = Number(ch.value); if (chosen === q.correct) { correct++; opts[chosen].classList.add('correct'); } else { opts[chosen].classList.add('wrong'); opts[q.correct].classList.add('correct'); } } else { opts[q.correct].classList.add('correct'); } });
        var grade = Math.max(2, Math.round((correct / t.topic.test.length) * 5)); state.results[id] = { grade: grade }; saveStudentData();
        resultBox.textContent = "Ваш результат: " + correct + " из " + t.topic.test.length + " (Оценка: " + grade + ")"; finishBtn.disabled = true;
      };
    }
  }
}

/* МАГАЗИН С ЦЕНАМИ И НОВЫМИ ТОВАРАМИ */
function renderShopPage(){
  var app = $("app"); app.innerHTML = ""; app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el('<section class="hero"><h1>Магазин XP</h1><p>У вас: 🌟 <b>' + state.xp + ' XP</b></p></section>'));
  
  var items = [
    { id: "golden", icon: "👑", title: "Золотой аватар", price: 100 },
    { id: "nick", icon: "🏷️", title: "Кастомный Ник", price: 200 },
    { id: "sign", icon: "✍️", title: "Подпись в профиле", price: 300 },
    { id: "exam_time", icon: "⏱", title: "+5 минут к экзамену", price: 500 },
    { id: "theme", icon: "🌌", title: "Тема 'Космос'", price: 1000 }
  ];
  
  var grid = el('<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));gap:16px;"></div>');
  items.forEach(function(it){
    var has = state.shop.includes(it.id);
    var btn = el('<button class="btn" style="width:100%;margin-top:10px;" ' + (has || state.xp < it.price ? 'disabled' : '') + '>' + (has ? 'Куплено' : (state.xp < it.price ? 'Мало XP' : 'Купить')) + '</button>');
    if (!has && state.xp >= it.price) { btn.onclick = function() { state.xp -= it.price; state.shop.push(it.id); saveStudentData(); renderShopPage(); window.showToast("Покупка совершена!", "ok"); }; }
    
    var card = el(`<div style="background:var(--card);border:1px solid var(--border);padding:16px;border-radius:12px;text-align:center;display:flex;flex-direction:column;justify-content:space-between;">
      <div><div style="font-size:40px;margin-bottom:10px;">${it.icon}</div><div style="font-weight:bold;">${it.title}</div></div>
      <div style="margin-top:10px;">
        <div style="color:var(--accent);font-weight:bold;margin-bottom:8px;">${it.price} XP</div>
      </div>
    </div>`);
    card.appendChild(btn); grid.appendChild(card);
  });
  app.appendChild(grid);
}

function renderPortfolioPage(){
  var app = $("app"); app.innerHTML = ""; app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el('<div id="portfolioPrint" class="module" style="padding:40px;"><h1 style="text-align:center;">ПОРТФОЛИО</h1><hr style="margin:20px 0;"><p><b>ФИО:</b> ' + state.student.name + '</p><p><b>Группа:</b> ' + state.student.group + '</p><p><b>XP:</b> ' + state.xp + '</p></div><button class="btn" style="margin-top:20px;width:100%;" onclick="window.print()">🖨 В PDF</button>'));
}
function renderSimulatorPage(){ var app = $("app"); app.innerHTML = ""; app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="module"><h2>Симулятор</h2><p>Раздел доступен в полной версии.</p></section>')); }

function route(){
  closeDrawer();
  var hash = location.hash.replace(/^#/, "") || "/"; var parts = hash.split("/").filter(Boolean); var app = $("app"); if(!app) return;
  if (!state.student && !state.staff) { app.innerHTML = ""; return; }
  
  if (parts[0] === "topic" && parts[1]) renderTopic(parts[1], parts[2]);
  else if (parts[0] === "simulator") renderSimulatorPage();
  else if (parts[0] === "shop") renderShopPage();
  else if (parts[0] === "portfolio") renderPortfolioPage();
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
  else if (parts[0] === "chat") window.renderChatPage && window.renderChatPage();
  else if (parts[0] === "comments") window.renderCommentsPage && window.renderCommentsPage();
  else renderHome();
  window.scrollTo(0, 0);
}

window.addEventListener("DOMContentLoaded", function() {
  if (!state.student && !state.staff) { $("loginOverlay").hidden = false; } else { $("loginOverlay").hidden = true; }
  if (state.student) loadStudentData();
  
  if($("themeToggle")) $("themeToggle").addEventListener("click", openThemeModal);
  if($("burgerBtn")) $("burgerBtn").addEventListener("click", toggleDrawer);
  if($("drawerOverlay")) $("drawerOverlay").addEventListener("click", closeDrawer);
  if($("drawerClose")) $("drawerClose").addEventListener("click", closeDrawer);
  document.querySelectorAll("[data-go]").forEach(function(item) { item.addEventListener("click", function(e) { e.preventDefault(); location.hash = item.getAttribute("data-go"); closeDrawer(); }); });
  
  // ПРИНУДИТЕЛЬНЫЙ ЗАПУСК ПОМОЩНИКА
  if (window.initAssistantButton) window.initAssistantButton();

  renderUserChip(); route();
});
window.addEventListener("hashchange", route);