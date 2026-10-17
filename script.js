/* ============================================================
   МДК 07.01 — script.js (v17.0 — CORE)
   ============================================================ */
"use strict";

var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzB0v37m5pC0jSnEmCEllIlN3IlRmgOhaPEW9giHbS6wNIYFHClxJv8Z5HyG4-AJBpdaQ/exec";
var DEFAULT_AVATAR = "👨‍🎓";

var AVATARS = ["👨‍🎓","👩‍🎓","🧑‍🎓","👨‍🔧","👩‍🔧","🧑‍🔧","👷","👨‍🏭","👩‍🏭","🧑‍🏭","🦾","🤖","⚙️","🔧","🛠️","🔩","🧰","📐","📏","✈️","🚀","🛰️","⚡","🔥","💡","🎓","🏆","🎯","🧠","🧑‍💻"];
var THEMES = [
  { id:"light", name:"Светлая", colors:["#f5f2ec","#ffffff","#c14a2a","#4a4a4a"] },
  { id:"dark", name:"Тёмная", colors:["#0e0e10","#171719","#ff6b3d","#c8c5bd"] },
  { id:"sepia", name:"Сепия", colors:["#f4ecd8","#fbf5e6","#a0522d","#5c4a32"] },
  { id:"ocean", name:"Океан", colors:["#eef4f8","#ffffff","#1a6da8","#3c5361"] },
  { id:"forest", name:"Лес", colors:["#eef3ec","#ffffff","#3d7a3d","#3f5238"] },
  { id:"contrast", name:"Контраст", colors:["#ffffff","#f5f5f5","#0033cc","#000000"] }
];
var QUOTES = ["Точность — вежливость королей.","Семь раз отмерь — один раз отрежь.","Практика без теории слепа.","Станок не прощает спешки.","Стружка — это металл, который вы потеряли.","Качество не бывает случайным.","Ошибка в кадре стоит часа работы.","Знание G-кода открывает любые станки."];
var FLASHCARDS = [
  { q: "Что такое G-код?", a: "Язык программирования станков с ЧПУ (ISO 6983).", topic: "Основы" },
  { q: "Что делает команда G00?", a: "Быстрое позиционирование (ускоренный ход).", topic: "G-коды" },
  { q: "Что делает команда G01?", a: "Линейная интерполяция (рабочая подача).", topic: "G-коды" },
  { q: "Что делают G02 и G03?", a: "G02 — дуга по часовой, G03 — против.", topic: "G-коды" },
  { q: "Что такое M03?", a: "Включение шпинделя по часовой стрелке.", topic: "M-коды" }
];
var GLOSSARY = [
  { term: "СОЖ", def: "Смазочно-охлаждающая жидкость." },
  { term: "Люнет", def: "Приспособление для поддержки длинных заготовок." },
  { term: "Борштанга", def: "Оправка для установки резца." },
  { term: "Шпиндель", def: "Вращающийся вал станка." },
  { term: "Подача (S, F)", def: "Перемещение инструмента." },
  { term: "Глубина резания (t)", def: "Толщина слоя металла за проход." },
  { term: "Скорость резания (Vc)", def: "Скорость кромки относительно заготовки." }
];
var ROLE_LABELS = { student: "🎓 Студент", admin: "🛡 Админ", teacher: "👨‍🏫 Преподаватель", curator: "🎓 Куратор", tester: "🧪 Тестировщик" };

var state = { student: null, staff: null, progress: {}, results: {}, selfResults: {}, practiceStatus: {}, activity: [], favorites: [], achievements: {}, lastSync: "" };

try { var _s = JSON.parse(localStorage.getItem("mdk0701.student") || "null"); if (_s && _s.name) state.student = _s; } catch (e){}
try { var _st = JSON.parse(sessionStorage.getItem("mdk0701.staff") || "null"); if (_st && _st.role) state.staff = _st; } catch (e){}

function getCourse(){ try { return COURSE; } catch(e){} try { return window.COURSE; } catch(e){} return null; }
function $(id){ return document.getElementById(id); }
function el(html){ var t = document.createElement("template"); t.innerHTML = String(html).trim(); return t.content.firstChild; }
function escapeHtml(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ if (c === "&") return "&amp;"; if (c === "<") return "&lt;"; if (c === ">") return "&gt;"; if (c === '"') return "&quot;"; if (c === "'") return "&#39;"; return c; }); }
function findTopic(id){ var c = getCourse(); if (!c) return null; for (var i = 0; i < c.sections.length; i++){ var s = c.sections[i]; if (!s.topics) continue; for (var j = 0; j < s.topics.length; j++){ if (s.topics[j].id === id) return { section: s, topic: s.topics[j] }; } } return null; }
function studentKey(s){ s = s || state.student; if (!s || !s.name) return null; return (s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase()); }
function getAvatar(){ return (state.student && state.student.avatar) || DEFAULT_AVATAR; }
function quoteOfDay(){ return QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length]; }

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

/* --- Стрик, XP и Достижения --- */
function updateStreakAndBonus() {
  if (!state.student) return;
  var today = new Date().toDateString();
  var lastVisit = localStorage.getItem("mdk0701.lastVisit");
  var streak = parseInt(localStorage.getItem("mdk0701.streak") || "0");
  var xp = parseInt(localStorage.getItem("mdk0701.xp") || "0");

  if (lastVisit !== today) {
    var yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    if (lastVisit === yesterday.toDateString()) streak++;
    else streak = 1;
    
    // Ежедневный бонус
    xp += 10;
    localStorage.setItem("mdk0701.lastVisit", today);
    localStorage.setItem("mdk0701.streak", streak);
    localStorage.setItem("mdk0701.xp", xp);
    window.showToast("🎁 Ежедневный бонус: +10 XP! (Стрик: " + streak + " дн.)", "ok");
  }
  if ($("xpCount")) $("xpCount").textContent = "🌟 " + xp + " XP";
  checkAchievements();
}

function checkAchievements() {
  if (!state.student) return;
  var changed = false;
  var testsCount = Object.keys(state.results || {}).length;
  if (testsCount >= 1 && !state.achievements["first_test"]) { state.achievements["first_test"] = true; changed = true; window.showToast("🏆 Достижение: Первый шаг", "ok"); }
  
  var grades = [...Object.values(state.results || {}).map(x=>x.grade), ...Object.values(state.selfResults || {}).map(x=>x.grade)].filter(x=>x>0);
  var avg = grades.length ? grades.reduce((a,b)=>a+b,0)/grades.length : 0;
  if (avg >= 4.5 && !state.achievements["excellent"]) { state.achievements["excellent"] = true; changed = true; window.showToast("🏆 Достижение: Отличник", "ok"); }
  
  var doneCount = 0; var c = getCourse();
  if(c) c.sections.forEach(sec => sec.topics.forEach(t => { if ((state.progress[t.id]?.done || 0) >= 5) doneCount++; }));
  if (doneCount >= 5 && !state.achievements["worker"]) { state.achievements["worker"] = true; changed = true; window.showToast("🏆 Достижение: Трудяга", "ok"); }

  // Новые ачивки
  var hour = new Date().getHours();
  if (hour >= 0 && hour < 5 && !state.achievements["night_turner"]) { state.achievements["night_turner"] = true; changed = true; window.showToast("🏆 Достижение: Ночной токарь", "ok"); }
  
  if (state.results["__final_exam__"] && state.results["__final_exam__"].grade === 5 && !state.achievements["flawless"]) { state.achievements["flawless"] = true; changed = true; window.showToast("🏆 Достижение: Безошибочный", "ok"); }

  if (localStorage.getItem("mdk0701.chat_count") >= 5 && !state.achievements["communicator"]) { state.achievements["communicator"] = true; changed = true; window.showToast("🏆 Достижение: Коммуникатор", "ok"); }

  if (changed) saveStudentData();
}

/* --- Данные --- */
function loadStudentData(){
  var k = studentKey(); if (!k){ state.progress = {}; state.favorites = []; state.achievements = {}; return; }
  var ek = encodeURIComponent(k);
  state.progress = JSON.parse(localStorage.getItem("mdk0701.progress." + ek) || "{}");
  state.results = JSON.parse(localStorage.getItem("mdk0701.results." + ek) || "{}");
  state.selfResults = JSON.parse(localStorage.getItem("mdk0701.selfResults." + ek) || "{}");
  state.practiceStatus = JSON.parse(localStorage.getItem("mdk0701.practiceStatus." + ek) || "{}");
  state.activity = JSON.parse(localStorage.getItem("mdk0701.activity." + ek) || "[]");
  state.favorites = JSON.parse(localStorage.getItem("mdk0701.favorites." + ek) || "[]");
  state.achievements = JSON.parse(localStorage.getItem("mdk0701.achievements." + ek) || "{}");
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
  localStorage.setItem("mdk0701.achievements." + ek, JSON.stringify(state.achievements));
  if (state.lastSync) localStorage.setItem("mdk0701.lastSync." + ek, state.lastSync);
}
function saveStudent(){ if (state.student) localStorage.setItem("mdk0701.student", JSON.stringify(state.student)); else localStorage.removeItem("mdk0701.student"); }
function saveStaffSession(){ if (state.staff) sessionStorage.setItem("mdk0701.staff", JSON.stringify(state.staff)); else sessionStorage.removeItem("mdk0701.staff"); }

var cloudTimer = null, cloudBusy = false;
function scheduleCloudSave(){ if (cloudTimer) clearTimeout(cloudTimer); cloudTimer = setTimeout(function(){ cloudSave(true); }, 3000); }
function cloudSave(silent){
  if (!state.student || cloudBusy || !APPS_SCRIPT_URL || !navigator.onLine) return Promise.resolve(false);
  cloudBusy = true;
  var params = new URLSearchParams();
  params.append("action", "save"); params.append("key", studentKey()); params.append("name", state.student.name); params.append("group", state.student.group);
  params.append("payload", JSON.stringify({ avatar: state.student.avatar, progress: state.progress, results: state.results, selfResults: state.selfResults, practiceStatus: state.practiceStatus, favorites: state.favorites }));
  return fetch(APPS_SCRIPT_URL, { method:"POST", body: params }).then(r=>r.json()).then(data=>{
    if (data && data.ok){ state.lastSync = data.savedAt; localStorage.setItem("mdk0701.lastSync." + encodeURIComponent(studentKey()), state.lastSync); cloudBusy = false; return true; }
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

/* --- Авторизация --- */
function applyTheme(theme){
  document.documentElement.setAttribute("data-theme", theme); localStorage.setItem("mdk0701.theme", theme);
}
function initTheme(){ var saved = localStorage.getItem("mdk0701.theme"); if (saved && THEMES.some(t=>t.id===saved)) applyTheme(saved); var btn = $("themeToggle"); if (btn) btn.addEventListener("click", openThemeModal); }
function openThemeModal(){
  document.querySelectorAll(".theme-overlay").forEach(x=>x.remove());
  var current = document.documentElement.getAttribute("data-theme") || "light";
  var modal = el('<div class="theme-overlay" style="background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;top:0;left:0;right:0;bottom:0;"><div class="theme-modal" style="background:var(--card);padding:24px;border-radius:16px;max-width:400px;width:90%;"><h3>Цветовая тема</h3><div class="theme-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0;"></div><button class="btn ghost" id="themeClose" style="width:100%">Закрыть</button></div></div>');
  var grid = modal.querySelector(".theme-grid");
  THEMES.forEach(t=>{
    var card = el('<button type="button" class="theme-card ' + (t.id===current?'selected':'') + '" style="padding:10px;border:2px solid var(--border);border-radius:8px;text-align:center;"><div style="height:20px;background:'+t.colors[0]+';border-radius:4px;margin-bottom:6px;"></div><div>'+t.name+'</div></button>');
    card.addEventListener("click", ()=>{ grid.querySelectorAll(".theme-card").forEach(x=>x.style.borderColor="var(--border)"); card.style.borderColor="var(--accent)"; applyTheme(t.id); });
    grid.appendChild(card);
  });
  document.body.appendChild(modal); modal.querySelector("#themeClose").addEventListener("click", ()=>modal.remove()); modal.addEventListener("click", e=>{ if(e.target===modal) modal.remove(); });
}

function buildAvatarPicker(selected, onPick){
  var wrap = el('<div class="avatar-picker-inline" style="display:flex;flex-wrap:wrap;gap:8px;max-height:100px;overflow-y:auto;"></div>');
  AVATARS.forEach(a=>{
    var b = el('<button type="button" class="avatar-option ' + (a===selected?'selected':'') + '" style="font-size:20px;padding:4px;border:1px solid transparent;border-radius:6px;">' + a + '</button>');
    b.addEventListener("click", ()=>{ wrap.querySelectorAll(".avatar-option").forEach(x=>x.style.borderColor="transparent"); b.style.borderColor="var(--accent)"; if(onPick) onPick(a); });
    wrap.appendChild(b);
  });
  return wrap;
}

function normalizeName(v){ return v.trim().split(/\s+/).map(p=>p?p[0].toUpperCase()+p.slice(1).toLowerCase():"").filter(Boolean).slice(0,3).join(" "); }
function validateName(v){ var parts = v.trim().split(/\s+/).filter(Boolean); if (parts.length < 2) return { ok:false, msg:"Введите минимум фамилию и имя" }; return {ok:true,msg:"",normalized:normalizeName(v)}; }
function validateGroup(v){ var t = v.trim().toUpperCase(); if(t.length<2) return {ok:false,msg:"Слишком короткая группа"}; return {ok:true,msg:"",normalized:t}; }

function openDrawer(){ $("drawer").classList.add("open"); $("drawerOverlay").classList.add("open"); document.body.style.overflow="hidden"; }
function closeDrawer(){ $("drawer").classList.remove("open"); $("drawerOverlay").classList.remove("open"); document.body.style.overflow=""; }
function toggleDrawer(){ $("drawer").classList.contains("open") ? closeDrawer() : openDrawer(); }
function initDrawer(){
  if(!$("burgerBtn")) return;
  $("burgerBtn").addEventListener("click", toggleDrawer); $("drawerOverlay").addEventListener("click", closeDrawer); $("drawerClose").addEventListener("click", closeDrawer);
  document.querySelectorAll("#drawerNav [data-go]").forEach(item=>{
    item.addEventListener("click", e=>{ e.preventDefault(); closeDrawer(); setTimeout(()=>location.hash = item.dataset.go, 120); });
  });
  $("drawerSearch").addEventListener("click", ()=>{ closeDrawer(); if(window.openSearch) window.openSearch(); });
  $("drawerAssistant").addEventListener("click", ()=>{ closeDrawer(); if(window.openAssistant) window.openAssistant(); });
  document.querySelector('#drawer [data-act="role"]').addEventListener("click", ()=>{ closeDrawer(); openRoleModal(); });
  document.querySelector('#drawer [data-act="theme"]').addEventListener("click", ()=>{ closeDrawer(); openThemeModal(); });
  $("drawerSyncBtn").addEventListener("click", ()=>{ closeDrawer(); cloudSave(false).then(ok=>{ if(ok) window.showToast("Синхронизировано", "ok"); }); });
  document.querySelector('#drawer [data-act="logout"]').addEventListener("click", ()=>{ closeDrawer(); handleLogout(); });
}
function handleLogout(){
  if (state.staff){ state.staff=null; saveStaffSession(); renderUserChip(); location.hash="#/"; route(); return; }
  if (state.student){ if(!confirm("Выйти из аккаунта?")) return; saveStudentData(); state.student=null; saveStudent(); renderUserChip(); $("loginOverlay").hidden=false; document.body.style.overflow="hidden"; route(); }
}

function initAuth(){
  var overlay = $("loginOverlay"), nameInput = $("loginName"), groupInput = $("loginGroup");
  if(!overlay) return;
  var loginAvatar = DEFAULT_AVATAR; $("loginAvatarPicker").appendChild(buildAvatarPicker(loginAvatar, a=>loginAvatar=a));
  if (!state.student && !state.staff) { overlay.hidden=false; document.body.style.overflow="hidden"; } else overlay.hidden=true;
  if (state.student){
    loadStudentData(); updateStreakAndBonus();
    cloudLoad().then(cloud=>{
      if (cloud && cloud.savedAt && cloud.savedAt > (state.lastSync||"")){ if(cloud.payload.avatar) state.student.avatar=cloud.payload.avatar; applyCloudPayload(cloud.payload); state.lastSync=cloud.savedAt; saveStudentData(); route(); }
    });
  }
  $("loginBtn").addEventListener("click", ()=>{
    var rn = validateName(nameInput.value), rg = validateGroup(groupInput.value);
    if (!rn.ok){ nameInput.focus(); return; } if(!rg.ok){ groupInput.focus(); return; }
    if (state.staff){ state.staff=null; saveStaffSession(); }
    state.student = { name: rn.normalized, group: rg.normalized, avatar: loginAvatar, loginAt: new Date().toISOString() };
    saveStudent(); loadStudentData(); updateStreakAndBonus(); overlay.hidden=true; document.body.style.overflow=""; renderUserChip();
    cloudLoad().then(()=>route());
  });
  $("loginStaffLink").addEventListener("click", e=>{ e.preventDefault(); openRoleModal(); });
}

function openRoleModal(){
  document.querySelectorAll(".avatar-overlay").forEach(x=>x.remove());
  var modal = el('<div class="avatar-overlay" style="background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;top:0;left:0;right:0;bottom:0;"><div style="background:var(--card);padding:24px;border-radius:16px;width:90%;max-width:400px;"><h3>Выбор роли</h3><div class="role-list" style="display:flex;flex-direction:column;gap:8px;margin:16px 0">'+
    Object.keys(ROLE_LABELS).map(r=>'<button class="btn ghost role-pick" data-role="'+r+'">'+ROLE_LABELS[r]+'</button>').join("")+
    '</div><div id="roleForm"></div><button class="btn ghost" id="roleCancel" style="width:100%;margin-top:16px;">Закрыть</button></div></div>');
  document.body.appendChild(modal); modal.querySelector("#roleCancel").addEventListener("click", ()=>modal.remove());
  modal.querySelectorAll(".role-pick").forEach(b=>{
    b.addEventListener("click", ()=>{
      var role = b.dataset.role, formBox = modal.querySelector("#roleForm");
      if(role==="student"){ formBox.innerHTML='<button class="btn" id="toStudent" style="width:100%">Ввести ФИО</button>'; formBox.querySelector("#toStudent").addEventListener("click", ()=>{ modal.remove(); state.staff=null; saveStaffSession(); $("loginOverlay").hidden=false; }); }
      else {
        formBox.innerHTML='<form><input type="text" id="rUser" placeholder="Логин" style="width:100%;margin-bottom:8px;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text)"><input type="password" id="rPass" placeholder="Пароль" style="width:100%;margin-bottom:8px;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text)"><button type="submit" class="btn" style="width:100%">Войти</button><div class="comment-status" id="rStatus"></div></form>';
        formBox.querySelector("form").addEventListener("submit", e=>{
          e.preventDefault();
          fetch(APPS_SCRIPT_URL+"?action=login&username="+encodeURIComponent(formBox.querySelector("#rUser").value)+"&password="+encodeURIComponent(formBox.querySelector("#rPass").value))
          .then(r=>r.json()).then(d=>{
            if(d && d.ok){ state.staff={username:formBox.querySelector("#rUser").value, role:d.role, name:d.name, group:d.group||""}; saveStaffSession(); modal.remove(); $("loginOverlay").hidden=true; renderUserChip(); route(); }
            else { formBox.querySelector("#rStatus").textContent="Ошибка входа"; formBox.querySelector("#rStatus").style.color="var(--err)"; }
          });
        });
      }
    });
  });
}

function renderUserChip(){
  if(!$("userChipAvatar")) return;
  if (state.staff){ $("userChipAvatar").textContent="👨‍🏫"; $("userChipName").textContent=state.staff.name; $("userChipGroup").textContent=ROLE_LABELS[state.staff.role]; $("drawerCabinetBtn").hidden=false; $("drawerSyncBtn").hidden=true; return; }
  if (state.student){ $("userChipAvatar").textContent=getAvatar(); $("userChipName").textContent=state.student.name; $("userChipGroup").textContent="Гр. "+state.student.group; $("drawerCabinetBtn").hidden=true; $("drawerSyncBtn").hidden=false; return; }
  $("userChipAvatar").textContent="👨‍🎓"; $("userChipName").textContent="Гость"; $("userChipGroup").textContent="Роль: Гость"; $("drawerCabinetBtn").hidden=true; $("drawerSyncBtn").hidden=true;
}

/* --- Главная --- */
function renderHome(){
  var app = $("app"); if (!app) return; app.innerHTML = ""; var c = getCourse(); if (!c) return;
  app.appendChild(el(`<section class="hero"><div class="meta">${c.specialty}</div><h1>${c.title}</h1><p>${c.module}</p><div class="hero-quote">${quoteOfDay()}</div></section>`));
  
  if (state.favorites && state.favorites.length){
    var favBlock = el('<section class="module"><h2>⭐ Избранные темы</h2><div class="fav-list" style="display:flex;flex-direction:column;gap:8px;"></div></section>');
    state.favorites.forEach(id=>{
      var t = findTopic(id); if(!t) return;
      favBlock.querySelector(".fav-list").appendChild(el(`<div class="fav-item" style="padding:12px;background:var(--card-soft);border:1px solid var(--gold);border-radius:8px;cursor:pointer;" onclick="location.hash='#/topic/${id}'"><b style="color:var(--gold)">${t.topic.code}</b> · ${t.topic.title}</div>`));
    });
    app.appendChild(favBlock);
  }

  c.sections.forEach(sec=>{
    app.appendChild(el(`<div class="steps-title">${sec.code} · ${sec.title}</div>`));
    var list = el('<div class="topics" style="display:flex;flex-direction:column;gap:12px;"></div>');
    sec.topics.forEach(t=>{
      var done = (state.progress[t.id] && state.progress[t.id].done) || 0;
      var card = el(`
        <div class="topic" style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;display:flex;gap:16px;cursor:pointer;align-items:center;">
          <div style="color:var(--accent);font-weight:bold;">${t.code}</div>
          <div style="flex:1"><div style="font-weight:600;">${t.title}</div><div style="font-size:12px;color:var(--muted);">${t.hours ? t.hours.total : '—'} ак.ч</div></div>
          <div style="font-size:14px;">${done}/5</div>
        </div>
      `);
      card.addEventListener("click", ()=>location.hash="#/topic/"+t.id);
      list.appendChild(card);
    });
    app.appendChild(list);
  });

  // Блок карточек (ИСПРАВЛЕНО)
  var flashBlock = el('<section class="module"><h2>🎴 Карточки знаний</h2><div class="home-flashcards-wrap" id="homeFlashcardArea"></div><div style="text-align:center;"><button class="btn ghost" id="nextHomeCard">Следующая →</button></div></section>');
  app.appendChild(flashBlock); var hArea = flashBlock.querySelector("#homeFlashcardArea"), hIndex = 0;
  
  function renderHomeCard() { 
    var card = FLASHCARDS[hIndex]; 
    hArea.innerHTML = `<div class="flashcard"><div class="flashcard-inner"><div class="flashcard-front"><div style="color:var(--accent);margin-bottom:10px">${card.topic}</div><h3>${card.q}</h3></div><div class="flashcard-back"><h3>Ответ</h3><p>${card.a}</p></div></div></div>`; 
    hArea.querySelector(".flashcard").addEventListener("click", function(){ this.classList.toggle("flipped"); }); 
  }
  renderHomeCard(); 
  flashBlock.querySelector("#nextHomeCard").addEventListener("click", ()=>{ hIndex=(hIndex+1)%FLASHCARDS.length; renderHomeCard(); });
}

/* --- Роутинг --- */
function goHome(e){ if(e) e.preventDefault(); location.hash="#/"; }
function route(){
  document.querySelectorAll(".theme-overlay, .avatar-overlay, .search-overlay").forEach(x=>x.remove());
  var hash = location.hash.replace(/^#/, "") || "/"; var parts = hash.split("/").filter(Boolean); var app = $("app"); if(!app) return;
  if (!state.student && !state.staff){ app.innerHTML=""; return; }
  
  var pages = {
    profile: ()=>window.renderProfilePage && window.renderProfilePage(),
    dashboard: ()=>window.renderDashboard && window.renderDashboard(),
    chat: ()=>window.renderChatPage && window.renderChatPage(),
    gallery: ()=>window.renderGalleryPage && window.renderGalleryPage(),
    gosts: ()=>window.renderGostsPage && window.renderGostsPage(),
    "final-training": ()=>window.renderFinalTrainingPage && window.renderFinalTrainingPage(), 
    "final-exam": ()=>window.renderFinalExamPage && window.renderFinalExamPage(),
    "gcode-reference": ()=>window.renderGCodeReferencePage && window.renderGCodeReferencePage(), 
    links: ()=>window.renderLinksPage && window.renderLinksPage(),
    rating: ()=>window.renderRatingPage && window.renderRatingPage(), 
    schedule: ()=>window.renderSchedulePage && window.renderSchedulePage(),
    journal: ()=>window.renderJournalPage && window.renderJournalPage(), 
    calculator: renderCalculatorPage, 
    glossary: renderGlossaryPage,
    events: ()=>window.renderEventsPage && window.renderEventsPage(),
    tictactoe: ()=>window.renderTicTacToePage && window.renderTicTacToePage(),
    sudoku: ()=>window.renderSudokuPage && window.renderSudokuPage(),
    crossword: ()=>window.renderCrosswordPage && window.renderCrosswordPage()
  };
  
  if (parts[0] === "topic" && parts[1]) renderTopic(parts[1], parts[2]||"passport");
  else if (parts[0] === "staff" && window.renderStaffPage) window.renderStaffPage();
  else if (pages[parts[0]]) pages[parts[0]]();
  else renderHome();
  window.scrollTo(0, 0);
}

/* --- Страница темы --- */
function renderTopic(id, tab){
  tab = tab || "passport"; var t = findTopic(id); if(!t) return renderHome();
  var app = $("app"); app.innerHTML = ""; $("crumbs").textContent = t.topic.code + " · " + t.topic.title;
  var h = t.topic.hours || { total: "—", theory: "—", practice: "—" };
  
  app.appendChild(el(`
    <a class="backlink" href="#/">← К программе</a>
    <section class="topic-head">
      <div class="crumb">ПМ.07 · ${t.section.code}</div>
      <h1>${t.topic.title}</h1>
      <div class="meta">${h.total} ак. ч / практ. ${h.practice} ак. ч</div>
    </section>
  `));
  
  var tabs = [["passport","01","Паспорт часов"],["lecture","02","Лекция"],["practice","03","Практические"],["self","04","Самостоятельная"],["test","05","Контроль темы"]];
  var tw = el('<div class="tabs"></div>');
  tabs.forEach(item=>{
    var b = el(`<button class="tab ${item[0]===tab?'active':''}"><span class="t-num">${item[1]}</span><span class="t-name">${item[2]}</span></button>`);
    b.addEventListener("click", ()=>location.hash="#/topic/"+id+"/"+item[0]); tw.appendChild(b);
  });
  app.appendChild(tw); var panel = el('<section class="panel"></section>'); app.appendChild(panel);
  panel.appendChild(el('<button class="btn ghost" style="margin-bottom:12px;font-size:12px" onclick="window.print()">🖨 Распечатать</button>'));

  if (tab === "passport") {
    panel.appendChild(el(`<h2>Паспорт часов</h2><p>Тема <b>${t.topic.code}</b> — ${t.topic.title}.</p><div class="kpi-row"><div class="kpi"><div class="k-label">Всего</div><div class="k-value">${h.total} ч</div></div><div class="kpi"><div class="k-label">Теория</div><div class="k-value">${h.theory} ч</div></div><div class="kpi"><div class="k-label">Практика</div><div class="k-value">${h.practice} ч</div></div></div>`));
  }
  
  if (tab === "lecture") {
    panel.appendChild(el('<h2>Лекция</h2>'));
    (t.topic.lectures||[]).forEach(l=>{
      panel.appendChild(el(`<h3>${l.code}. ${l.title}</h3><div class="lecture-content">${l.content || '<p><i>Материал готовится.</i></p>'}</div>`));
    });
  }
  
  if (tab === "practice") {
    panel.appendChild(el('<h2>Практические работы</h2>'));
    (t.topic.practicals||[]).forEach(p=>{
      var html = `<div class="practice" style="border:1px solid var(--border);padding:16px;border-radius:12px;margin-bottom:16px;background:var(--card-soft)"><div style="color:var(--accent);font-weight:bold">${p.code}</div><div style="font-weight:bold;margin-bottom:8px">${p.title}</div>`;
      if(p.task) html += `<div style="margin-bottom:8px"><b>Задание:</b> ${p.task}</div>`;
      html += `<div class="test-actions"><input type="file" id="file_${p.code}" style="display:none" onchange="window.uploadFile(event, '${p.code}', '${p.title}')"><button class="btn" onclick="document.getElementById('file_${p.code}').click()">📎 Прикрепить работу</button></div></div>`;
      panel.appendChild(el(html));
    });
  }
  
  if (tab === "self") {
    panel.appendChild(el('<h2>Самостоятельная работа</h2>'));
    var selfWrap = el('<div id="selfWrap"></div>'); panel.appendChild(selfWrap);
    (t.topic.selfChecks||[]).forEach((q, i)=>{
      var block = el(`<div class="question"><div class="q-text">${i+1}. ${q.q}</div><input type="text" class="self-input" data-idx="${i}" placeholder="Ваш ответ" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);margin-bottom:8px;"><div class="self-feedback" id="fb_${i}" style="font-size:13px;"></div></div>`);
      selfWrap.appendChild(block);
    });
    // ЕДИНАЯ КНОПКА ПРОВЕРКИ
    var checkBtn = el('<button class="btn" style="width:100%">Проверить все ответы</button>');
    checkBtn.addEventListener("click", ()=>{
      var inputs = selfWrap.querySelectorAll(".self-input");
      var correctCount = 0;
      inputs.forEach(inp => {
        var idx = Number(inp.dataset.idx);
        var q = t.topic.selfChecks[idx];
        var fb = selfWrap.querySelector("#fb_" + idx);
        if (inp.value.trim().toLowerCase() === q.a.trim().toLowerCase()) {
          fb.textContent = "✔ Верно"; fb.style.color = "var(--ok)"; correctCount++;
        } else {
          fb.textContent = "✘ Неверно. Правильный ответ: " + q.a; fb.style.color = "var(--err)";
        }
      });
      if (correctCount === inputs.length) window.showToast("Все ответы верны! Молодец!", "ok");
    });
    panel.appendChild(checkBtn);
  }
  
  if (tab === "test") {
    panel.appendChild(el('<h2>Контроль темы</h2>'));
    var timerBox = el('<div style="font-size:20px;font-weight:bold;color:var(--err);margin-bottom:16px;">⏱ 15:00</div>');
    panel.appendChild(timerBox);
    var testWrap = el('<div id="testWrap"></div>'); panel.appendChild(testWrap);
    
    (t.topic.test||[]).forEach((q, qi)=>{
      var qb = el(`<div class="question"><div class="q-text">${qi+1}. ${q.q}</div></div>`);
      q.options.forEach((opt, oi)=>qb.appendChild(el(`<label class="option"><input type="radio" name="q${qi}" value="${oi}"><span>${opt}</span></label>`)));
      testWrap.appendChild(qb);
    });
    
    var finishBtn = el('<button class="btn" style="width:100%">Подвести итог</button>');
    panel.appendChild(finishBtn);

    // ТАЙМЕР ТЕСТА
    var timeLeft = 15 * 60;
    var timerId = setInterval(() => {
      if (!document.body.contains(timerBox)) { clearInterval(timerId); return; }
      timeLeft--;
      var m = Math.floor(timeLeft / 60), s = timeLeft % 60;
      timerBox.textContent = "⏱ " + String(m).padStart(2,"0") + ":" + String(s).padStart(2,"0");
      if (timeLeft <= 0) { clearInterval(timerId); finishBtn.click(); }
    }, 1000);

    finishBtn.addEventListener("click", () => {
      clearInterval(timerId);
      var correct = 0;
      (t.topic.test||[]).forEach((q, qi) => {
        var ch = testWrap.querySelector(`input[name="q${qi}"]:checked`);
        var opts = testWrap.querySelectorAll(".question")[qi].querySelectorAll(".option");
        opts.forEach(o=>o.classList.remove("correct","wrong"));
        if (ch && Number(ch.value) === q.correct) { correct++; opts[Number(ch.value)].classList.add("correct"); }
        else { if(ch) opts[Number(ch.value)].classList.add("wrong"); opts[q.correct].classList.add("correct"); }
      });
      var grade = Math.round((correct / t.topic.test.length) * 100);
      state.results[t.topic.id] = { grade: Math.round(grade/20), total: correct, date: new Date().toISOString() };
      saveStudentData(); scheduleCloudSave(); checkAchievements();
      window.showToast(`Результат: ${correct} из ${t.topic.test.length}`, "ok");
      finishBtn.disabled = true;
    });
  }
  window.scrollTo(0, 0);
}

/* Загрузка файлов */
window.uploadFile = function(event, code, title) {
  var file = event.target.files[0]; if (!file) return;
  if (file.size > 5 * 1024 * 1024) { window.showToast("Файл больше 5 МБ", "err"); return; }
  window.showToast("Загрузка файла... Пожалуйста, подождите.", "info");
  var reader = new FileReader();
  reader.onload = function(e) {
    var base64 = e.target.result.split(',')[1];
    var params = new URLSearchParams();
    params.append("action", "uploadwork");
    params.append("key", studentKey());
    params.append("name", state.student.name);
    params.append("group", state.student.group);
    params.append("topicId", location.hash.split("/")[2] || "");
    params.append("workCode", code);
    params.append("workTitle", title);
    params.append("fileName", file.name);
    params.append("fileType", file.type);
    params.append("fileData", base64);

    fetch(APPS_SCRIPT_URL, { method: "POST", body: params })
    .then(r => r.json()).then(d => {
      if (d.ok) window.showToast("Файл успешно загружен!", "ok");
      else window.showToast("Ошибка загрузки: " + (d.error||""), "err");
    }).catch(() => window.showToast("Ошибка сети", "err"));
  };
  reader.readAsDataURL(file);
};

/* PWA Install */
var deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); deferredPrompt = e;
  if ($("pwaBanner")) $("pwaBanner").hidden = false;
});
if ($("pwaInstallBtn")) {
  $("pwaInstallBtn").addEventListener("click", () => {
    if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.then(() => { $("pwaBanner").hidden = true; deferredPrompt = null; }); }
  });
  $("pwaCloseBtn").addEventListener("click", () => { $("pwaBanner").hidden = true; });
}

function renderCalculatorPage(){
  var app = $("app"); if (!app) return; app.innerHTML = ""; $("crumbs").textContent = "Калькулятор";
  app.appendChild(el('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  var box = el('<section class="module"><h2>Расчет частоты вращения (n)</h2><div style="display:flex;gap:10px;margin-bottom:12px;"><input type="number" id="calcVc" value="180" style="padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);width:50%"><input type="number" id="calcD" value="50" style="padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);width:50%"></div><button class="btn" id="calcBtn" style="width:100%">Рассчитать</button><div class="calc-result" id="calcResult" style="margin-top:16px;font-size:20px;font-weight:bold;"></div></section>');
  app.appendChild(box);
  box.querySelector("#calcBtn").addEventListener("click", ()=>{
    var vc = parseFloat(box.querySelector("#calcVc").value), d = parseFloat(box.querySelector("#calcD").value);
    if (!vc || !d) return;
    box.querySelector("#calcResult").innerHTML = "n = <b>" + Math.round((1000 * vc) / (Math.PI * d)) + " об/мин</b>";
  });
}

function renderGlossaryPage(){
  var app = $("app"); if (!app) return; app.innerHTML = ""; $("crumbs").textContent = "Глоссарий";
  app.appendChild(el('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  var box = el('<section class="module"><input type="text" id="gSearch" placeholder="Поиск..." style="width:100%;padding:12px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);margin-bottom:16px;"><div id="gList" style="display:flex;flex-direction:column;gap:12px;"></div></section>');
  app.appendChild(box);
  function draw(f){ box.querySelector("#gList").innerHTML = ""; GLOSSARY.filter(x=>x.term.toLowerCase().includes(f.toLowerCase())).forEach(x=>box.querySelector("#gList").appendChild(el(`<div style="background:var(--card-soft);padding:16px;border-radius:8px;border:1px solid var(--border)"><b style="color:var(--accent)">${x.term}</b><br>${x.def}</div>`))); }
  draw(""); box.querySelector("#gSearch").addEventListener("input", e=>draw(e.target.value));
}

window.addEventListener("hashchange", ()=>{ closeDrawer(); route(); });
window.addEventListener("DOMContentLoaded", ()=>{ initTheme(); initAuth(); initDrawer(); renderUserChip(); updateStreakAndBonus(); route(); });