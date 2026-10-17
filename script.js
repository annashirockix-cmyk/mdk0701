/* ============================================================
   МДК 07.01 — script.js (v16.0)
   ============================================================ */
"use strict";

var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzB0v37m5pC0jSnEmCEllIlN3IlRmgOhaPEW9giHbS6wNIYFHClxJv8Z5HyG4-AJBpdaQ/exec";
var DEFAULT_AVATAR = "👨‍🎓";
var ACTIVITY_MAX = 100;
var ONLINE_TIMEOUT_SEC = 90;
var TEST_TIME_LIMIT_SEC = 15 * 60;

var AVATARS = ["👨‍🎓","👩‍🎓","🧑‍🎓","👨‍🔧","👩‍🔧","🧑‍🔧","👷","👨‍🏭","👩‍🏭","🧑‍🏭","🦾","🤖","⚙️","🔧","🛠️","🔩","🧰","📐","📏","✈️","🚀","🛰️","⚡","🔥","💡","🎓","🏆","🎯","🧠","🧑‍💻"];

var THEMES = [
  { id:"light", name:"Светлая", colors:["#f5f2ec","#ffffff","#c14a2a","#4a4a4a"] },
  { id:"dark", name:"Тёмная", colors:["#0e0e10","#171719","#ff6b3d","#c8c5bd"] },
  { id:"sepia", name:"Сепия", colors:["#f4ecd8","#fbf5e6","#a0522d","#5c4a32"] },
  { id:"ocean", name:"Океан", colors:["#eef4f8","#ffffff","#1a6da8","#3c5361"] },
  { id:"forest", name:"Лес", colors:["#eef3ec","#ffffff","#3d7a3d","#3f5238"] },
  { id:"contrast", name:"Контраст", colors:["#ffffff","#f5f5f5","#0033cc","#000000"] }
];

var QUOTES = ["Точность — вежливость королей.","Семь раз отмерь — один раз отрежь.","Практика без теории слепа, теория без практики мертва.","Станок не прощает спешки.","Стружка — это металл, который вы потеряли.","Качество не бывает случайным.","Ошибка в кадре стоит часа работы.","Знание G-кода открывает любые станки."];

var FLASHCARDS = [
  { q: "Что такое G-код?", a: "Язык программирования станков с ЧПУ (ISO 6983).", topic: "Основы" },
  { q: "Что делает команда G00?", a: "Быстрое позиционирование (ускоренный ход).", topic: "G-коды" },
  { q: "Что делает команда G01?", a: "Линейная интерполяция (рабочая подача по прямой).", topic: "G-коды" },
  { q: "Что делают G02 и G03?", a: "G02 — дуга по часовой, G03 — против часовой.", topic: "G-коды" },
  { q: "Что такое M03?", a: "Включение шпинделя по часовой стрелке.", topic: "M-коды" }
];

var GLOSSARY = [
  { term: "СОЖ", def: "Смазочно-охлаждающая жидкость. Применяется для отвода тепла, смазки и удаления стружки из зоны резания." },
  { term: "Люнет", def: "Приспособление для поддержки длинных заготовок при токарной обработке." },
  { term: "Борштанга", def: "Оправка для установки резца при растачивании внутренних отверстий." },
  { term: "Шпиндель", def: "Вращающийся вал станка, на котором закрепляется заготовка." },
  { term: "Подача (S, F)", def: "Перемещение инструмента за один оборот (мм/об) или минуту (мм/мин)." },
  { term: "Глубина резания (t)", def: "Толщина слоя металла за проход. (D - d) / 2." },
  { term: "Скорость резания (Vc)", def: "Скорость кромки относительно заготовки. м/мин." },
  { term: "УЧПУ", def: "Устройство числового программного управления." }
];

var ROLE_LABELS = { student: "🎓 Студент", admin: "🛡 Администратор", teacher: "👨‍🏫 Преподаватель", curator: "🎓 Куратор группы", tester: "🧪 Тестировщик" };

var state = { student: null, staff: null, progress: {}, results: {}, selfResults: {}, practiceStatus: {}, activity: [], favorites: [], lastSync: "" };

try { var _s = JSON.parse(localStorage.getItem("mdk0701.student") || "null"); if (_s && _s.name) state.student = _s; } catch (e){}
try { var _st = JSON.parse(sessionStorage.getItem("mdk0701.staff") || "null"); if (_st && _st.role) state.staff = _st; } catch (e){}

function getCourse(){ try { if (typeof COURSE !== "undefined" && COURSE && COURSE.sections) return COURSE; } catch (e){} try { if (window.COURSE) return window.COURSE; } catch(e){} return null; }
function $(id){ return document.getElementById(id); }
function el(html){ var t = document.createElement("template"); t.innerHTML = String(html).trim(); return t.content.firstChild; }
function escapeHtml(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ if (c === "&") return "&amp;"; if (c === "<") return "&lt;"; if (c === ">") return "&gt;"; if (c === '"') return "&quot;"; if (c === "'") return "&#39;"; return c; }); }
function findTopic(id){ var c = getCourse(); if (!c) return null; for (var i = 0; i < c.sections.length; i++){ var s = c.sections[i]; if (!s.topics) continue; for (var j = 0; j < s.topics.length; j++){ if (s.topics[j].id === id) return { section: s, topic: s.topics[j] }; } } return null; }
function studentKey(s){ s = s || state.student; if (!s || !s.name) return null; return (s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase()); }
function getAvatar(){ return (state.student && state.student.avatar) || DEFAULT_AVATAR; }
function shuffled(a){ var r = a.slice(); for (var i = r.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)); var t = r[i]; r[i] = r[j]; r[j] = t; } return r; }
function quoteOfDay(){ return QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length]; }
function fmtRel(iso){ var d = new Date(iso), diff = (Date.now() - d) / 1000; if (diff < 60) return "только что"; if (diff < 3600) return Math.floor(diff / 60) + " мин назад"; if (diff < 86400) return Math.floor(diff / 3600) + " ч назад"; return d.toLocaleDateString("ru-RU"); }
function setSyncStatus(text){ var n = $("syncStatus"); if (!n) return; n.textContent = text; setTimeout(function(){ if (n.textContent === text) n.textContent = ""; }, 3000); }

window.showToast = function(msg, type) {
  var container = document.querySelector(".toast-container");
  if (!container) { container = document.createElement("div"); container.className = "toast-container"; document.body.appendChild(container); }
  var toast = document.createElement("div"); toast.className = "toast " + (type || "");
  toast.innerHTML = (type === "ok" ? "✅ " : type === "err" ? "❌ " : "ℹ️ ") + escapeHtml(msg);
  container.appendChild(toast);
  setTimeout(function() { toast.classList.add("out"); setTimeout(function() { if (toast.parentNode) toast.remove(); }, 300); }, 3000);
};

function toggleFavorite(topicId, event) {
  if (event) event.stopPropagation();
  if (!state.favorites) state.favorites = [];
  var idx = state.favorites.indexOf(topicId);
  if (idx >= 0) { state.favorites.splice(idx, 1); window.showToast("Удалено из избранного"); } 
  else { state.favorites.push(topicId); window.showToast("Добавлено в избранное", "ok"); }
  saveStudentData();
  if (location.hash === "#/" || location.hash === "") renderHome(); else renderTopic(topicId, "passport");
}

function loadStudentData(){
  var k = studentKey(); if (!k){ state.progress = {}; state.results = {}; state.selfResults = {}; state.practiceStatus = {}; state.activity = []; state.favorites = []; return; }
  var ek = encodeURIComponent(k);
  state.progress = JSON.parse(localStorage.getItem("mdk0701.progress." + ek) || "{}");
  state.results = JSON.parse(localStorage.getItem("mdk0701.results." + ek) || "{}");
  state.selfResults = JSON.parse(localStorage.getItem("mdk0701.selfResults." + ek) || "{}");
  state.practiceStatus = JSON.parse(localStorage.getItem("mdk0701.practiceStatus." + ek) || "{}");
  state.activity = JSON.parse(localStorage.getItem("mdk0701.activity." + ek) || "[]");
  state.favorites = JSON.parse(localStorage.getItem("mdk0701.favorites." + ek) || "[]");
  state.lastSync = localStorage.getItem("mdk0701.lastSync." + ek) || "";
}
function saveStudentData(){
  var k = studentKey(); if (!k) return; var ek = encodeURIComponent(k);
  localStorage.setItem("mdk0701.progress." + ek, JSON.stringify(state.progress));
  localStorage.setItem("mdk0701.results." + ek, JSON.stringify(state.results));
  localStorage.setItem("mdk0701.selfResults." + ek, JSON.stringify(state.selfResults));
  localStorage.setItem("mdk0701.practiceStatus." + ek, JSON.stringify(state.practiceStatus));
  localStorage.setItem("mdk0701.activity." + ek, JSON.stringify(state.activity));
  localStorage.setItem("mdk0701.favorites." + ek, JSON.stringify(state.favorites));
  if (state.lastSync) localStorage.setItem("mdk0701.lastSync." + ek, state.lastSync);
}
function saveStudent(){ if (state.student) localStorage.setItem("mdk0701.student", JSON.stringify(state.student)); else localStorage.removeItem("mdk0701.student"); }
function saveStaffSession(){ if (state.staff) sessionStorage.setItem("mdk0701.staff", JSON.stringify(state.staff)); else sessionStorage.removeItem("mdk0701.staff"); }
function logActivity(type, text){ state.activity.push({ type, text, date: new Date().toISOString() }); if (state.activity.length > ACTIVITY_MAX) state.activity = state.activity.slice(-ACTIVITY_MAX); saveStudentData(); }
function saveProgress(){ saveStudentData(); scheduleCloudSave(); }
function saveResults(){ saveStudentData(); scheduleCloudSave(); }
function saveSelfResults(){ saveStudentData(); scheduleCloudSave(); }

var cloudTimer = null, cloudBusy = false;
function scheduleCloudSave(){ if (cloudTimer) clearTimeout(cloudTimer); cloudTimer = setTimeout(function(){ cloudSave(true); }, 3000); }
function cloudSave(silent){
  if (!state.student || cloudBusy || !APPS_SCRIPT_URL || !navigator.onLine) return Promise.resolve(false);
  cloudBusy = true; if (!silent) setSyncStatus("Отправляем…");
  var params = new URLSearchParams();
  params.append("action", "save"); params.append("key", studentKey()); params.append("name", state.student.name); params.append("group", state.student.group);
  params.append("payload", JSON.stringify({ avatar: state.student.avatar, progress: state.progress, results: state.results, selfResults: state.selfResults, practiceStatus: state.practiceStatus, favorites: state.favorites }));
  return fetch(APPS_SCRIPT_URL, { method:"POST", body: params }).then(r=>r.json()).then(data=>{
    if (data && data.ok){ state.lastSync = data.savedAt; localStorage.setItem("mdk0701.lastSync." + encodeURIComponent(studentKey()), state.lastSync); if (!silent) setSyncStatus("✔ Синхронизировано"); cloudBusy = false; return true; }
    cloudBusy = false; return false;
  }).catch(()=>{ cloudBusy = false; return false; });
}
function cloudLoad(){
  if (!state.student || !APPS_SCRIPT_URL) return Promise.resolve(null);
  var params = new URLSearchParams(); params.append("action", "load"); params.append("key", studentKey());
  return fetch(APPS_SCRIPT_URL + "?" + params.toString()).then(r=>r.json()).then(data=>{
    if (data && data.ok && data.payload) return { payload: JSON.parse(data.payload), savedAt: data.savedAt || "" };
    return null;
  }).catch(()=>null);
}
function applyCloudPayload(p){
  state.progress = p.progress || {}; state.results = p.results || {}; state.selfResults = p.selfResults || {};
  state.practiceStatus = p.practiceStatus || {}; state.favorites = p.favorites || [];
}

function applyTheme(theme){
  document.documentElement.setAttribute("data-theme", theme); localStorage.setItem("mdk0701.theme", theme);
  var meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute("content", ({ light:"#c14a2a", dark:"#0e0e10", sepia:"#a0522d", ocean:"#1a6da8", forest:"#3d7a3d", contrast:"#0033cc" })[theme] || "#c14a2a");
}
function initTheme(){ var saved = localStorage.getItem("mdk0701.theme"); if (saved && THEMES.some(t=>t.id===saved)) applyTheme(saved); var btn = $("themeToggle"); if (btn) btn.addEventListener("click", openThemeModal); }
function openThemeModal(){
  document.querySelectorAll(".theme-overlay").forEach(x=>x.remove());
  var current = document.documentElement.getAttribute("data-theme") || "light";
  var modal = el('<div class="theme-overlay"><div class="theme-modal"><h3>Цветовая тема</h3><p class="theme-sub">Выберите оформление.</p><div class="theme-grid"></div><div class="theme-actions"><button class="btn ghost" id="themeClose">Закрыть</button></div></div></div>');
  var grid = modal.querySelector(".theme-grid");
  THEMES.forEach(t=>{
    var card = el('<button type="button" class="theme-card ' + (t.id===current?'selected':'') + '"><div class="theme-preview"><span style="background:'+t.colors[0]+'"></span><span style="background:'+t.colors[1]+'"></span><span style="background:'+t.colors[2]+'"></span><span style="background:'+t.colors[3]+'"></span></div><div class="theme-name"><span>'+t.name+'</span><span class="check">✓</span></div></button>');
    card.addEventListener("click", ()=>{ grid.querySelectorAll(".theme-card").forEach(x=>x.classList.remove("selected")); card.classList.add("selected"); applyTheme(t.id); });
    grid.appendChild(card);
  });
  document.body.appendChild(modal); modal.querySelector("#themeClose").addEventListener("click", ()=>modal.remove()); modal.addEventListener("click", e=>{ if(e.target===modal) modal.remove(); });
}

function buildAvatarPicker(selected, onPick){
  var wrap = el('<div class="avatar-picker-inline"></div>');
  AVATARS.forEach(a=>{
    var b = el('<button type="button" class="avatar-option ' + (a===selected?'selected':'') + '">' + a + '</button>');
    b.addEventListener("click", ()=>{ wrap.querySelectorAll(".avatar-option").forEach(x=>x.classList.remove("selected")); b.classList.add("selected"); if(onPick) onPick(a); });
    wrap.appendChild(b);
  });
  return wrap;
}

function normalizeName(v){ return v.trim().split(/\s+/).map(p=>p?p[0].toUpperCase()+p.slice(1).toLowerCase():"").filter(Boolean).slice(0,3).join(" "); }
function validateName(v){ var parts = v.trim().split(/\s+/).filter(Boolean); if (parts.length < 2) return { ok:false, msg:"Введите минимум фамилию и имя" }; for (var i=0;i<parts.length;i++) if(parts[i].length<2) return {ok:false,msg:"Слишком короткое слово"}; return {ok:true,msg:"Похоже на ФИО",normalized:normalizeName(v)}; }
function validateGroup(v){ var t = v.trim().toUpperCase(); if(t.length<2) return {ok:false,msg:"Слишком короткая группа"}; return {ok:true,msg:"",normalized:t}; }

function openDrawer(){ $("drawer").classList.add("open"); $("drawerOverlay").classList.add("open"); document.body.style.overflow="hidden"; }
function closeDrawer(){ $("drawer").classList.remove("open"); $("drawerOverlay").classList.remove("open"); document.body.style.overflow=""; }
function toggleDrawer(){ $("drawer").classList.contains("open") ? closeDrawer() : openDrawer(); }
function initDrawer(){
  $("burgerBtn").addEventListener("click", toggleDrawer); $("drawerOverlay").addEventListener("click", closeDrawer); $("drawerClose").addEventListener("click", closeDrawer);
  document.querySelectorAll("#drawerNav [data-go]").forEach(item=>{
    item.addEventListener("click", e=>{ e.preventDefault(); closeDrawer(); setTimeout(()=>location.hash = item.dataset.go, 120); });
  });
  $("drawerSearch").addEventListener("click", ()=>{ closeDrawer(); if(window.openSearch) window.openSearch(); });
  $("drawerAssistant").addEventListener("click", ()=>{ closeDrawer(); if(window.openAssistant) window.openAssistant(); });
  document.querySelector('#drawer [data-act="role"]').addEventListener("click", ()=>{ closeDrawer(); openRoleModal(); });
  document.querySelector('#drawer [data-act="theme"]').addEventListener("click", ()=>{ closeDrawer(); openThemeModal(); });
  $("drawerSyncBtn").addEventListener("click", ()=>{ closeDrawer(); cloudSave(false).then(ok=>{ if(ok) window.showToast("Синхронизировано", "ok"); }); });
  $("drawerCabinetBtn").addEventListener("click", ()=>{ closeDrawer(); location.hash="#/staff"; });
  document.querySelector('#drawer [data-act="logout"]').addEventListener("click", ()=>{ closeDrawer(); handleLogout(); });
}
function handleLogout(){
  if (state.staff){ state.staff=null; saveStaffSession(); renderUserChip(); location.hash="#/"; route(); return; }
  if (state.student){ if(!confirm("Выйти из аккаунта?")) return; saveStudentData(); state.student=null; saveStudent(); renderUserChip(); $("loginOverlay").hidden=false; document.body.style.overflow="hidden"; route(); }
}

function initAuth(){
  var overlay = $("loginOverlay"), nameInput = $("loginName"), groupInput = $("loginGroup");
  var loginAvatar = DEFAULT_AVATAR; $("loginAvatarPicker").appendChild(buildAvatarPicker(loginAvatar, a=>loginAvatar=a));
  
  if (!state.student && !state.staff) { overlay.hidden=false; document.body.style.overflow="hidden"; } else overlay.hidden=true;
  if (state.student){
    loadStudentData();
    cloudLoad().then(cloud=>{
      if (cloud && cloud.savedAt && cloud.savedAt > (state.lastSync||"")){ if(cloud.payload.avatar) state.student.avatar=cloud.payload.avatar; applyCloudPayload(cloud.payload); state.lastSync=cloud.savedAt; saveStudentData(); route(); }
    });
  }
  nameInput.addEventListener("input", ()=>{ var r = validateName(nameInput.value); $("nameHint").textContent = !nameInput.value.trim() ? "" : (r.ok?"✔ ":"✘ ")+r.msg; $("nameHint").className="field-hint "+(r.ok?"ok":"bad"); });
  groupInput.addEventListener("input", ()=>{ var r = validateGroup(groupInput.value); $("groupHint").textContent = !groupInput.value.trim() ? "" : (r.ok?"✔ ОК":"✘ "+r.msg); $("groupHint").className="field-hint "+(r.ok?"ok":"bad"); });
  
  $("loginBtn").addEventListener("click", ()=>{
    var rn = validateName(nameInput.value), rg = validateGroup(groupInput.value);
    if (!rn.ok){ nameInput.focus(); return; } if(!rg.ok){ groupInput.focus(); return; }
    if (state.staff){ state.staff=null; saveStaffSession(); }
    state.student = { name: rn.normalized, group: rg.normalized, avatar: loginAvatar, loginAt: new Date().toISOString() };
    saveStudent(); loadStudentData(); overlay.hidden=true; document.body.style.overflow=""; renderUserChip();
    cloudLoad().then(cloud=>{
      if (cloud && cloud.savedAt && cloud.savedAt > (state.lastSync||"")){ if(cloud.payload.avatar) state.student.avatar=cloud.payload.avatar; applyCloudPayload(cloud.payload); state.lastSync=cloud.savedAt; saveStudentData(); }
      route();
    });
  });
  $("loginStaffLink").addEventListener("click", e=>{ e.preventDefault(); openRoleModal(); });
}

function openRoleModal(){
  document.querySelectorAll(".avatar-overlay").forEach(x=>x.remove());
  var modal = el('<div class="avatar-overlay" id="roleModal"><div class="avatar-modal"><h3>Выбор роли</h3><div class="role-list" style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">'+
    Object.keys(ROLE_LABELS).map(r=>'<button class="btn ghost role-pick" data-role="'+r+'">'+ROLE_LABELS[r]+'</button>').join("")+
    '</div><div id="roleForm"></div><div class="avatar-modal-actions"><button class="btn ghost" id="roleCancel">Закрыть</button></div></div></div>');
  document.body.appendChild(modal); modal.querySelector("#roleCancel").addEventListener("click", ()=>modal.remove());
  
  modal.querySelectorAll(".role-pick").forEach(b=>{
    b.addEventListener("click", ()=>{
      var role = b.dataset.role, formBox = modal.querySelector("#roleForm");
      if(role==="student"){ formBox.innerHTML='<button class="btn" id="toStudent">Ввести ФИО</button>'; formBox.querySelector("#toStudent").addEventListener("click", ()=>{ modal.remove(); state.staff=null; saveStaffSession(); $("loginOverlay").hidden=false; }); }
      else {
        formBox.innerHTML='<form><input type="text" id="rUser" placeholder="Логин" style="width:100%;margin-bottom:8px;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text)"><input type="password" id="rPass" placeholder="Пароль" style="width:100%;margin-bottom:8px;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text)"><button type="submit" class="btn">Войти</button><div class="comment-status" id="rStatus"></div></form>';
        formBox.querySelector("form").addEventListener("submit", e=>{
          e.preventDefault();
          fetch(APPS_SCRIPT_URL+"?action=login&username="+encodeURIComponent(formBox.querySelector("#rUser").value)+"&password="+encodeURIComponent(formBox.querySelector("#rPass").value))
          .then(r=>r.json()).then(d=>{
            if(d && d.ok){ state.staff={username:formBox.querySelector("#rUser").value, role:d.role, name:d.name, group:d.group||""}; saveStaffSession(); modal.remove(); $("loginOverlay").hidden=true; renderUserChip(); route(); }
            else { formBox.querySelector("#rStatus").textContent="Ошибка входа"; formBox.querySelector("#rStatus").className="comment-status bad"; }
          }).catch(()=>{ formBox.querySelector("#rStatus").textContent="Нет сети"; formBox.querySelector("#rStatus").className="comment-status bad"; });
        });
      }
    });
  });
}

function renderUserChip(){
  if (state.staff){ $("userChipAvatar").textContent="👨‍🏫"; $("userChipName").textContent=state.staff.name; $("userChipGroup").textContent=ROLE_LABELS[state.staff.role]||state.staff.role; $("drawerCabinetBtn").hidden=false; $("drawerSyncBtn").hidden=true; return; }
  if (state.student){ $("userChipAvatar").textContent=getAvatar(); $("userChipName").textContent=state.student.name; $("userChipGroup").textContent="Гр. "+state.student.group; $("drawerCabinetBtn").hidden=true; $("drawerSyncBtn").hidden=false; return; }
  $("userChipAvatar").textContent="👨‍🎓"; $("userChipName").textContent="Гость"; $("userChipGroup").textContent="Роль: Гость"; $("drawerCabinetBtn").hidden=true; $("drawerSyncBtn").hidden=true;
}

function renderHome(){
  var app = $("app"); if (!app) return; app.innerHTML = ""; var c = getCourse(); if (!c) return;
  app.appendChild(el('<section class="hero"><div class="meta">'+escapeHtml(c.specialty)+'</div><h1>'+escapeHtml(c.title)+'</h1><p>'+escapeHtml(c.module)+'</p><div class="hero-quote">'+quoteOfDay()+'</div></section>'));
  
  if (state.favorites && state.favorites.length){
    var favBlock = el('<section class="module fav-section"><h2>⭐ Избранные темы</h2><div class="fav-list"></div></section>');
    state.favorites.forEach(id=>{
      var t = findTopic(id); if(!t) return;
      var item = el('<div class="fav-item"><span class="fav-code">'+t.topic.code+'</span><span class="fav-title">'+t.topic.title+'</span><span>→</span></div>');
      item.addEventListener("click", ()=>location.hash="#/topic/"+id); favBlock.querySelector(".fav-list").appendChild(item);
    });
    app.appendChild(favBlock);
  }

  c.sections.forEach(sec=>{
    app.appendChild(el('<div class="steps-title">'+sec.code+' · '+sec.title+'</div>'));
    var list = el('<div class="topics"></div>');
    sec.topics.forEach(t=>{
      var done = (state.progress[t.id] && state.progress[t.id].done) || 0;
      var isFav = (state.favorites || []).indexOf(t.id) !== -1;
      var card = el('<div class="topic"><div class="t-code">'+t.code+'</div><div class="t-body"><div class="t-title">'+t.title+'</div><div class="t-meta">'+t.hours.total+' ак.ч</div></div><div class="t-right"><div class="t-progress">'+done+'/5</div><div class="t-fav '+(isFav?'active':'')+'">★</div></div></div>');
      card.addEventListener("click", ()=>location.hash="#/topic/"+t.id);
      card.querySelector(".t-fav").addEventListener("click", e=>toggleFavorite(t.id, e));
      list.appendChild(card);
    });
    app.appendChild(list);
  });

  if (c.passports && c.passports.length){
    app.appendChild(el('<div class="steps-title">Паспорта станков</div>'));
    var block = el('<section class="module"><h2>Паспорта станков</h2><p class="sub">PDF-файлы. Открываются прямо на странице.</p><div class="doc-grid"></div></section>');
    var grid = block.querySelector(".doc-grid");
    c.passports.forEach(function(p){
      var card = el('<div class="doc-card" role="button" tabindex="0"><div class="doc-code">'+escapeHtml(p.code)+'</div><div class="doc-title">'+escapeHtml(p.title)+'</div><div class="doc-summary">'+escapeHtml(p.summary)+'</div><div class="doc-action">Открыть PDF →</div></div>');
      card.addEventListener("click", function(){ if(window.openPdfModal) window.openPdfModal(p.file, p.title); });
      grid.appendChild(card);
    });
    app.appendChild(block);
  }

  if (c.safety && c.safety.length){
    app.appendChild(el('<div class="steps-title">Охрана труда</div>'));
    var block2 = el('<section class="module"><h2>Инструкции по охране труда</h2><p class="sub">DOCX-файлы. Скачиваются для ознакомления.</p><div class="doc-grid"></div></section>');
    var grid2 = block2.querySelector(".doc-grid");
    c.safety.forEach(function(s){
      grid2.appendChild(el('<a class="doc-card" href="' + s.file + '" download><div class="doc-code">' + escapeHtml(s.code) + '</div><div class="doc-title">' + escapeHtml(s.title) + '</div><div class="doc-summary">' + escapeHtml(s.summary) + '</div><div class="doc-action">Скачать .docx →</div></a>'));
    });
    app.appendChild(block2);
  }

  var flashBlock = el('<section class="module"><h2>🎴 Карточки знаний</h2><div class="home-flashcards-wrap" id="homeFlashcardArea"></div><div class="test-actions" style="justify-content:center"><button class="btn ghost" id="nextHomeCard">Следующая →</button></div></section>');
  app.appendChild(flashBlock); var hArea = flashBlock.querySelector("#homeFlashcardArea"), hIndex = 0;
  function renderHomeCard() { var card = FLASHCARDS[hIndex]; hArea.innerHTML = '<div class="flashcard"><div class="flashcard-inner"><div class="flashcard-front"><div style="color:var(--accent);margin-bottom:10px">'+card.topic+'</div><h3>'+card.q+'</h3></div><div class="flashcard-back"><h3>Ответ</h3><p>'+card.a+'</p></div></div></div>'; hArea.querySelector(".flashcard").addEventListener("click", function(){ this.classList.toggle("flipped"); }); }
  renderHomeCard(); flashBlock.querySelector("#nextHomeCard").addEventListener("click", ()=>{ hIndex=(hIndex+1)%FLASHCARDS.length; renderHomeCard(); });
  
  if (window.renderCommentsBlock && state.student) app.appendChild(window.renderCommentsBlock());
}

function renderCalculatorPage(){
  var app = $("app"); if (!app) return; app.innerHTML = ""; $("crumbs").textContent = "Калькулятор";
  app.appendChild(el('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  app.appendChild(el('<section class="hero"><div class="meta">Инструменты</div><h1>Калькулятор режимов</h1><p>Расчет частоты вращения шпинделя (n).</p></section>'));
  var box = el('<section class="module"><div class="calc-box"><div class="calc-row"><div class="calc-group"><label>Скорость Vc (м/мин)</label><input type="number" id="calcVc" value="180"></div><div class="calc-group"><label>Диаметр D (мм)</label><input type="number" id="calcD" value="50"></div></div><button class="btn" id="calcBtn" style="width:100%">Рассчитать</button><div class="calc-result" id="calcResult">—</div></div></section>');
  app.appendChild(box);
  box.querySelector("#calcBtn").addEventListener("click", ()=>{
    var vc = parseFloat(box.querySelector("#calcVc").value), d = parseFloat(box.querySelector("#calcD").value);
    if (!vc || !d) { window.showToast("Введите значения", "err"); return; }
    var n = Math.round((1000 * vc) / (Math.PI * d));
    box.querySelector("#calcResult").innerHTML = "Частота: <b>" + n + " об/мин</b>";
  });
}

function renderGlossaryPage(){
  var app = $("app"); if (!app) return; app.innerHTML = ""; $("crumbs").textContent = "Глоссарий";
  app.appendChild(el('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  app.appendChild(el('<section class="hero"><div class="meta">Справочник</div><h1>Глоссарий</h1><p>Основные термины обработки и ЧПУ.</p></section>'));
  var box = el('<section class="module"><input type="text" class="glossary-search" id="gSearch" placeholder="Поиск..."><div class="glossary-list" id="gList"></div></section>');
  app.appendChild(box);
  function drawList(filter){
    filter = filter.toLowerCase(); var list = box.querySelector("#gList"); list.innerHTML = "";
    GLOSSARY.filter(item=>item.term.toLowerCase().includes(filter)||item.def.toLowerCase().includes(filter)).forEach(item=>{
      list.appendChild(el('<div class="glossary-item"><div class="g-term">'+item.term+'</div><div class="g-def">'+item.def+'</div></div>'));
    });
  }
  drawList(""); box.querySelector("#gSearch").addEventListener("input", function(){ drawList(this.value); });
}

function goHome(e){ if(e) e.preventDefault(); location.hash="#/"; }
function route(){
  document.querySelectorAll(".pdf-overlay, .theme-overlay, .user-menu, .more-menu").forEach(x=>x.remove());
  var hash = location.hash.replace(/^#/, "") || "/"; var parts = hash.split("/").filter(Boolean); var app = $("app"); if(!app) return;
  
  if (!state.student && !state.staff){ app.innerHTML=""; return; }
  if (parts[0] === "staff"){ if(window.renderStaffPage) window.renderStaffPage(); else app.innerHTML=""; return; }
  
  var pages = {
    profile: ()=>window.renderProfilePage && window.renderProfilePage(),
    comments: ()=>window.renderCommentsPage&&window.renderCommentsPage(), 
    dashboard: ()=>window.renderDashboard&&window.renderDashboard(),
    chat: ()=>window.renderChatPage&&window.renderChatPage(), 
    questions: ()=>window.renderQuestionsPage&&window.renderQuestionsPage(),
    gallery: ()=>window.renderGalleryPage&&window.renderGalleryPage(), 
    calendar: ()=>window.renderCalendarPage&&window.renderCalendarPage(),
    gosts: ()=>window.renderGostsPage&&window.renderGostsPage(), 
    qr: ()=>window.renderQrPage&&window.renderQrPage(),
    "final-training": ()=>window.renderFinalTrainingPage&&window.renderFinalTrainingPage(), 
    "final-exam": ()=>window.renderFinalExamPage&&window.renderFinalExamPage(),
    "gcode-reference": ()=>window.renderGCodeReferencePage&&window.renderGCodeReferencePage(), 
    links: ()=>window.renderLinksPage&&window.renderLinksPage(),
    rating: ()=>window.renderRatingPage&&window.renderRatingPage(), 
    schedule: ()=>window.renderSchedulePage&&window.renderSchedulePage(),
    journal: ()=>window.renderJournalPage&&window.renderJournalPage(), 
    calculator: renderCalculatorPage, 
    glossary: renderGlossaryPage
  };
  
  if (parts[0] === "topic" && parts[1]) renderTopic(parts[1], parts[2]||"passport", parts[3]||"control");
  else if (pages[parts[0]]) pages[parts[0]]();
  else renderHome();
  window.scrollTo(0, 0);
}

function renderTopic(id, tab, mode){
  tab = tab || "passport"; mode = mode || "control"; var t = findTopic(id); if(!t) return renderHome();
  var app = $("app"); app.innerHTML = ""; $("crumbs").textContent = t.topic.code + " · " + t.topic.title;
  app.appendChild(el('<a class="backlink" href="#/">← К программе</a><section class="topic-head"><div class="crumb">ПМ.07 · '+t.section.code+'</div><h1>'+t.topic.title+'</h1><div class="meta">'+t.topic.hours.total+' ак. ч / практ. '+t.topic.hours.practice+' ак. ч</div></section>'));
  
  var tabs = [["passport","01","Паспорт часов"],["lecture","02","Лекция"],["practice","03","Практические"],["self","04","Самостоятельная"],["test","05","Контроль темы"]];
  var tw = el('<div class="tabs"></div>');
  tabs.forEach(item=>{
    var b = el('<button class="tab '+(item[0]===tab?'active':'')+'"><span class="t-num">'+item[1]+'</span><span class="t-name">'+item[2]+'</span></button>');
    b.addEventListener("click", ()=>location.hash="#/topic/"+id+"/"+item[0]); tw.appendChild(b);
  });
  app.appendChild(tw); var panel = el('<section class="panel"></section>'); app.appendChild(panel);

  var printBtn = el('<button class="btn ghost" style="margin-bottom:12px; font-size:12px" onclick="window.print()">🖨 Распечатать</button>');
  panel.appendChild(printBtn);

  if (tab === "passport") {
    panel.appendChild(el('<h2>Паспорт часов</h2><p>Тема <b>'+t.topic.code+'</b> — '+t.topic.title+'.</p><div class="kpi-row"><div class="kpi"><div class="k-label">Всего</div><div class="k-value">'+t.topic.hours.total+' ч</div></div><div class="kpi"><div class="k-label">Теория</div><div class="k-value">'+t.topic.hours.theory+' ч</div></div><div class="kpi"><div class="k-label">Практика</div><div class="k-value">'+t.topic.hours.practice+' ч</div></div></div>'));
  }
  if (tab === "lecture") {
    panel.appendChild(el('<h2>Лекция</h2><p class="accent">Теория, схема, вопросы для самопроверки.</p>'));
    (t.topic.lectures||[]).forEach(l=>{
      panel.appendChild(el('<h3>'+l.code+'. '+l.title+'</h3>'));
      panel.appendChild(el('<div class="lecture-content">'+(l.content || '<p><i>Материал готовится.</i></p>')+'</div>'));
    });
  }
  if (tab === "practice") {
    panel.appendChild(el('<h2>Практические работы</h2>'));
    (t.topic.practicals||[]).forEach(p=>{
      var html = '<div class="practice"><div class="practice-head"><div class="p-code">'+p.code+'</div></div><div class="p-title">'+p.title+'</div>';
      if(p.goal) html += '<div class="p-goal">Цель: '+p.goal+'</div>';
      if(p.task) html += '<div class="p-task"><b>Задание:</b> '+p.task+'</div>';
      if(p.example) html += '<div class="p-example"><b>Пример:</b> '+p.example+'</div>';
      if(p.solution && p.solution.length) { html += '<div class="p-solution"><h4>Ход решения:</h4><ol>'; p.solution.forEach(s=>html+='<li>'+s+'</li>'); html+='</ol></div>'; }
      if(p.variants && p.variants.rows && p.variants.rows.length) {
        html += '<div class="variants"><div class="v-title">Варианты</div><div class="v-scroll"><table class="v-table"><thead><tr>';
        if(p.variants.header) p.variants.header.forEach(h=>html+='<th>'+h+'</th>');
        html += '</tr></thead><tbody>';
        p.variants.rows.forEach(r=>{ html+='<tr>'; r.forEach(c=>html+='<td>'+c+'</td>'); html+='</tr>'; });
        html += '</tbody></table></div></div>';
      }
      html += '<div class="test-actions"><button class="btn" onclick="window.showToast(\'Демо-загрузка файла\', \'ok\')">📎 Прикрепить</button></div></div>';
      panel.appendChild(el(html));
    });
  }
  if (tab === "self") {
    panel.appendChild(el('<h2>Самостоятельная работа</h2>'));
    // Восстановлены поля ввода
    (t.topic.selfChecks||[]).forEach((q, i)=>{
      var block = el('<div class="question"><div class="q-text">' + (i+1) + '. ' + q.q + '</div><div class="self-row"><input type="text" class="self-input" placeholder="Ваш ответ"><button type="button" class="btn ghost self-check">Проверить</button></div><div class="self-feedback"></div></div>');
      var inp = block.querySelector(".self-input"), btn = block.querySelector(".self-check"), fb = block.querySelector(".self-feedback");
      btn.addEventListener("click", ()=>{
        if (inp.value.trim().toLowerCase() === q.a.trim().toLowerCase()) { fb.textContent = "✔ Верно"; fb.className = "self-feedback ok"; }
        else { fb.textContent = "✘ Неверно. Правильный ответ: " + q.a; fb.className = "self-feedback bad"; }
      });
      panel.appendChild(block);
    });
  }
  if (tab === "test") {
    panel.appendChild(el('<h2>Контроль темы</h2>'));
    // Восстановлены варианты ответов
    (t.topic.test||[]).forEach((q, qi)=>{
      var qb = el('<div class="question"><div class="q-text">' + (qi+1) + '. ' + q.q + '</div></div>');
      q.options.forEach((opt, oi)=>{
        qb.appendChild(el('<label class="option"><input type="radio" name="q'+qi+'" value="'+oi+'"><span>'+opt+'</span></label>'));
      });
      panel.appendChild(qb);
    });
    panel.appendChild(el('<div class="test-actions"><button class="btn" onclick="window.showToast(\'Тест пройден!\', \'ok\')">Подвести итог</button></div>'));
  }
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", ()=>{ closeDrawer(); route(); });
window.addEventListener("DOMContentLoaded", ()=>{ initTheme(); initAuth(); initDrawer(); renderUserChip(); route(); });