/* ============================================================
   МДК 07.01 — Защищенный script.js с ролевой моделью
   ============================================================ */

// Безопасная инициализация глобальных констант (если они не заданы в других файлах)
const DEFAULT_AVATAR = window.DEFAULT_AVATAR || "👨‍🎓";
const ACTIVITY_MAX = window.ACTIVITY_MAX || 50;
const BACKUP_INTERVAL_MS = window.BACKUP_INTERVAL_MS || 300000; // 5 минут
const APPS_SCRIPT_URL = window.APPS_SCRIPT_URL || ""; 

const THEMES = window.THEMES || [
  { id: "light", name: "Светлая" },
  { id: "dark", name: "Темная" }
];
const AVATARS = window.AVATARS || ["👨‍🎓", "👩‍🎓", "🧑‍💻", "👩‍💻", "🛠", "⚙️"];
const QUOTES = window.QUOTES || ["Учиться, учиться и еще раз учиться!"];

// Защищенный объект курса
const COURSE = window.COURSE || {
  title: "Оператор станков с ПУ",
  module: "МДК 07.01",
  specialty: "Технология металлообрабатывающего производства",
  sections: [],
  passports: []
};

/* ---------- Состояние ---------- */
const state = {
  student: JSON.parse(localStorage.getItem("mdk0701.student") || "null"),
  progress: {},
  results: {},
  selfResults: {},
  activity: [],
  corrections: {},
  lastSync: ""
};

/* ---------- Ключи и утилиты ---------- */
function studentKey(s){
  s = s || state.student;
  if (!s || !s.name || !s.group) return null;
  return (s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase());
}
function getAvatar(){ return (state.student && state.student.avatar) || DEFAULT_AVATAR; }
function el(html){ const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function stripHtml(html){ const d = document.createElement("div"); d.innerHTML = html || ""; return d.textContent || ""; }

function findTopic(id){
  if (!COURSE || !COURSE.sections) return null;
  for (const s of COURSE.sections) {
    if (s.topics) {
      for (const t of s.topics) if (t.id === id) return { section: s, topic: t };
    }
  }
  return null;
}
function shuffled(a){
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}
function todayIndex(){ return Math.floor(Date.now() / 86400000); }
function quoteOfDay(){ return QUOTES[todayIndex() % QUOTES.length]; }
function fmtDate(d){ return new Date(d).toLocaleString("ru-RU", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }); }

/* ---------- Локальное хранилище ---------- */
function loadStudentData(){
  const k = studentKey();
  if (!k){ state.progress = {}; state.results = {}; state.selfResults = {}; state.activity = []; state.corrections = {}; return; }
  const ek = encodeURIComponent(k);
  state.progress    = JSON.parse(localStorage.getItem("mdk0701.progress."    + ek) || "{}");
  state.results     = JSON.parse(localStorage.getItem("mdk0701.results."     + ek) || "{}");
  state.selfResults = JSON.parse(localStorage.getItem("mdk0701.selfResults." + ek) || "{}");
  state.activity    = JSON.parse(localStorage.getItem("mdk0701.activity."    + ek) || "[]");
  state.corrections = JSON.parse(localStorage.getItem("mdk0701.corrections." + ek) || "{}");
  state.lastSync    = localStorage.getItem("mdk0701.lastSync." + ek) || "";
}

function saveStudentData(){
  const k = studentKey(); if (!k) return;
  const ek = encodeURIComponent(k);
  localStorage.setItem("mdk0701.progress."    + ek, JSON.stringify(state.progress));
  localStorage.setItem("mdk0701.results."     + ek, JSON.stringify(state.results));
  localStorage.setItem("mdk0701.selfResults." + ek, JSON.stringify(state.selfResults));
  localStorage.setItem("mdk0701.activity."    + ek, JSON.stringify(state.activity));
  localStorage.setItem("mdk0701.corrections." + ek, JSON.stringify(state.corrections));
  if (state.lastSync) localStorage.setItem("mdk0701.lastSync." + ek, state.lastSync);
}
function saveStudent(){ localStorage.setItem("mdk0701.student", JSON.stringify(state.student)); }

/* ---------- Облако и синхронизация ---------- */
let cloudTimer = null, cloudBusy = false;
function scheduleCloudSave(){
  if (cloudTimer) clearTimeout(cloudTimer);
  cloudTimer = setTimeout(()=>cloudSave(true), 3000);
}
async function cloudSave(silent){
  if (!state.student || cloudBusy || !APPS_SCRIPT_URL) return false;
  if (!navigator.onLine) return false;
  cloudBusy = true;
  const params = new URLSearchParams();
  params.append("action", "save");
  params.append("key", studentKey());
  params.append("name", state.student.name);
  params.append("group", state.student.group);
  params.append("payload", JSON.stringify({
    avatar: state.student.avatar || DEFAULT_AVATAR,
    progress: state.progress,
    results: state.results,
    selfResults: state.selfResults,
    corrections: state.corrections
  }));
  try {
    const res = await fetch(APPS_SCRIPT_URL, { method:"POST", body: params });
    const data = await res.json();
    if (data && data.ok){
      state.lastSync = data.savedAt || new Date().toISOString();
      const k = studentKey();
      if (k) localStorage.setItem("mdk0701.lastSync." + encodeURIComponent(k), state.lastSync);
      cloudBusy = false; return true;
    }
  } catch (err){}
  cloudBusy = false; return false;
}

/* ---------- Валидация ФИО ---------- */
function normalizeName(v){
  return v.trim().split(/\s+/).map(p => p ? p.toUpperCase() + p.slice(1).toLowerCase() : "").filter(Boolean).slice(0, 3).join(" ");
}
function validateName(v){
  const parts = v.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { ok:false, msg:"Введите минимум фамилию и имя" };
  return { ok:true, msg:"", normalized: normalizeName(v) };
}
function validateGroup(v){
  return { ok:true, msg:"", normalized: v.trim().toUpperCase() };
}

/* ---------- Интерфейс Тем ---------- */
function currentTheme(){ return document.documentElement.getAttribute("data-theme") || "light"; }
function applyTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("mdk0701.theme", theme);
}
function initTheme(){
  const saved = localStorage.getItem("mdk0701.theme");
  if (saved) applyTheme(saved);
  const btn = document.getElementById("themeToggle");
  if (btn) btn.addEventListener("click", openThemeModal);
}
function openThemeModal(){
  document.querySelectorAll(".theme-overlay").forEach(x => x.remove());
  const current = currentTheme();
  const modal = el(`<div class="theme-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000;">
    <div class="theme-modal" style="background:var(--card); border:1px solid var(--border); padding:20px; border-radius:14px; max-width:320px; width:100%;">
      <h3>Цветовая тема</h3>
      <div class="theme-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;"></div>
      <button class="btn ghost" id="themeClose" style="width:100%;">Закрыть</button>
    </div>
  </div>`);
  const grid = modal.querySelector(".theme-grid");
  THEMES.forEach(t => {
    const card = el(`<button type="button" class="btn ${t.id===current?"":"ghost"}" style="padding:10px;">${t.name}</button>`);
    card.addEventListener("click", () => { applyTheme(t.id); modal.remove(); });
    grid.appendChild(card);
  });
  modal.querySelector("#themeClose").addEventListener("click", () => modal.remove());
  document.body.appendChild(modal);
}

/* ---------- Авторизация Студентов ---------- */
function buildAvatarPicker(selected, onPick){
  const wrap = el(`<div class="avatar-picker-inline" style="display:flex; gap:6px; margin:10px 0;"></div>`);
  AVATARS.forEach(a=>{
    const b = el(`<button type="button" class="avatar-option" style="font-size:20px; cursor:pointer; background:none; border:none; padding:4px; border-radius:6px; ${a===selected?"border:2px solid var(--accent);":""}">${a}</button>`);
    b.addEventListener("click", ()=>{ onPick(a); });
    wrap.appendChild(b);
  });
  return wrap;
}

function initAuth(){
  const overlay = document.getElementById("loginOverlay");
  const nameInput = document.getElementById("loginName");
  const groupInput = document.getElementById("loginGroup");
  const btn = document.getElementById("loginBtn");
  let loginAvatar = DEFAULT_AVATAR;

  const loginPicker = document.getElementById("loginAvatarPicker");
  if (loginPicker) loginPicker.appendChild(buildAvatarPicker(loginAvatar, a => { loginAvatar = a; }));

  if (!state.student){
    if(overlay) { overlay.hidden = false; document.body.style.overflow = "hidden"; if(nameInput) nameInput.focus(); }
  } else {
    loadStudentData(); if(overlay) overlay.hidden = true; document.body.style.overflow = "";
    renderUserChip();
  }

  if(btn) {
    btn.addEventListener("click", ()=>{
      if(!nameInput || !groupInput) return;
      const rn = validateName(nameInput.value);
      const rg = validateGroup(groupInput.value);
      if (!rn.ok || !rg.ok) return;
      state.student = { name: rn.normalized, group: rg.normalized, avatar: loginAvatar, loginAt: new Date().toISOString() };
      saveStudent(); loadStudentData();
      if(overlay) overlay.hidden = true; document.body.style.overflow = "";
      renderUserChip(); route();
    });
  }
  const chip = document.getElementById("userChip");
  if(chip) chip.addEventListener("click", openUserMenu);
}

function renderUserChip(){
  const chip = document.getElementById("userChip");
  if (!chip || !state.student) return;
  chip.hidden = false;
  const av = document.getElementById("userChipAvatar");
  const nm = document.getElementById("userChipName");
  const gr = document.getElementById("userChipGroup");
  if(av) av.textContent = getAvatar();
  if(nm) nm.textContent = state.student.name;
if(gr) gr.textContent = "Гр. " + state.student.group;
}
function openUserMenu(){
document.querySelectorAll(".user-menu").forEach(m => m.remove());
const chip = document.getElementById("userChip");
const rect = chip.getBoundingClientRect();
const menu = el( <div class="user-menu" style="position:fixed; top:${rect.bottom + 8}px; right:8px; z-index:999; background:var(--card); border:1px solid var(--border); border-radius:12px; padding:12px; box-shadow:0 4px 12px rgba(0,0,0,0.15);"> <div class="user-menu-head" style="margin-bottom:8px;"><b>${state.student.name}</b><br><span style="font-size:12px; color:var(--muted)">Группа ${state.student.group}</span></div> <button class="user-menu-item" id="muLogout" style="display:block; width:100%; text-align:left; padding:6px 0; background:none; border:none; cursor:pointer; color:red">🔄 Сменить аккаунт</button> </div>);
document.body.appendChild(menu);
menu.querySelector("#muLogout").addEventListener("click", ()=>{
menu.remove(); sessionStorage.clear(); localStorage.removeItem("mdk0701.student"); location.reload();
});
setTimeout(()=>document.addEventListener("click", function c(e){ if(!menu.contains(e.target) && e.target!==chip){ menu.remove(); document.removeEventListener("click", c); } }),0);
}
/* ---------- Рендеринг интерфейса ---------- */
function renderHome(){
const app = document.getElementById("app"); if(!app) return;
app.innerHTML = "";
const crumbs = document.getElementById("crumbs"); if(crumbs) crumbs.textContent = "";
app.appendChild(el(`
${COURSE.specialty}
${COURSE.title}
${COURSE.module}

`));
if(COURSE.sections && COURSE.sections.length > 0) {
COURSE.sections.forEach(sec=>{
app.appendChild(el(<div class="steps-title" style="margin:20px 0 10px; font-weight:bold; color:var(--accent);">${sec.code} · ${sec.title}</div>));
const list = el(<div class="topics"></div>);
if(sec.topics) {
sec.topics.forEach(t=>{
const totalDone = state.progress[t.id]?.done || 0;
const card = el( <div class="topic" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:14px; margin-bottom:8px; cursor:pointer; display:flex; justify-content:between; align-items:center;"> <div class="t-body"><div class="t-title" style="font-weight:600;">${t.code} · ${t.title}</div></div> <div class="t-progress" style="font-size:12px; color:var(--muted); margin-left:auto;">${totalDone}/5 шагов</div> </div>);
card.addEventListener("click", ()=>location.hash = "#/topic/" + t.id);
list.appendChild(card);
});
}
app.appendChild(list);
});
} else {
app.appendChild(el(<div style="text-align:center; color:var(--muted); margin-top:40px;">Курс успешно загружен. Зайдите в меню управления или выберите нужный раздел.</div>));
}
}
/* ============================================================
ПАНЕЛЬ УПРАВЛЕНИЯ / КАБИНЕТЫ АДМИНИСТРАТОРА, ПРЕПОДАВАТЕЛЯ, КУРАТОРА
============================================================ */
window.renderTeacherPage = function() {
const app = document.getElementById("app"); if(!app) return;
app.innerHTML = "";
const crumbs = document.getElementById("crumbs"); if(crumbs) crumbs.textContent = "Авторизация";
app.appendChild(el(<a class="backlink" href="#/" onclick="goHome(event)" style="display:block; margin-bottom:15px; color:var(--accent);">← На главную</a>));
const currentRole = sessionStorage.getItem("mdk0701.userRole");
const currentUserName = sessionStorage.getItem("mdk0701.userName");
if (!currentRole) {
const loginBlock = el(`
Вход для персонала

Логин
Пароль
Войти в кабинет


`);
app.appendChild(loginBlock);
loginBlock.querySelector("#roleLoginForm").addEventListener("submit", async e => {
e.preventDefault();
const user = loginBlock.querySelector("#panelUser").value;
const pass = loginBlock.querySelector("#panelPass").value;
const st = loginBlock.querySelector("#panelStatus");
if(!st) return;
st.textContent = "Авторизация в системе…";
st.style.color = "var(--text)";
try {
const url = APPS_SCRIPT_URL + "?action=login&username=" + encodeURIComponent(user) + "&password=" + encodeURIComponent(pass);
const res = await fetch(url);
const d = await res.json();
if (d && d.ok) {
sessionStorage.setItem("mdk0701.userRole", d.role);
sessionStorage.setItem("mdk0701.userName", d.name);
window.renderTeacherPage();
} else {
st.textContent = d.error || "Неверные данные доступа"; st.style.color = "red";
}
} catch (err) { st.textContent = "Ошибка бэкенда Google Таблиц"; st.style.color = "red"; }
});
return;
}
const header = el(<div class="teacher-bar" style="display:flex; justify-content:between; align-items:center; background:var(--card-soft); border:1px solid var(--border); border-radius:12px; padding:12px; margin-bottom:20px;"> <div>Профиль: <b>${currentUserName}</b> | Роль: <span style="color:var(--accent); font-weight:bold;">${currentRole.toUpperCase()}</span></div> <button class="btn ghost" id="panelLogoutBtn" style="padding:6px 12px; margin-left:auto; cursor:pointer;">Выйти</button> </div>);
app.appendChild(header);
header.querySelector("#panelLogoutBtn").addEventListener("click", () => {
sessionStorage.clear(); window.renderTeacherPage();
});
if (currentRole === "curator") {
app.appendChild(el(<section class="module" style="background:var(--card); border:1px solid var(--border); border-radius:14px; padding:20px;"> <h2>Кабинет куратора группы ТМ-3</h2> <p style="color:var(--muted)">Вам предоставлен защищенный доступ только к спискам успеваемости группы ТМ-3.</p> <div id="teacherTableWrap"><div class="comment-empty">Загрузка защищенного списка студентов…</div></div> </section>));
loadProtectedStudentList("curator");
}
if (currentRole === "teacher" || currentRole === "admin") {
app.appendChild(el(<section class="module" style="background:var(--card); border:1px solid var(--border); border-radius:14px; padding:20px;"> <h2>Сводный журнал успеваемости (Все группы)</h2> <div id="teacherTableWrap"><div class="comment-empty">Загрузка таблиц успеваемости…</div></div> </section>));
loadProtectedStudentList(currentRole);
}
if (currentRole === "tester") {
app.appendChild(el(<section class="module" style="background:var(--card); border:1px solid var(--border); border-radius:14px; padding:20px;"> <h2>Инструменты верификации (Тестировщик)</h2> <p class="sub">Аккаунт успешно авторизован для отладки UI-компонентов.</p> </section>));
}
};
async function loadProtectedStudentList(role) {
const wrap = document.getElementById("teacherTableWrap"); if (!wrap) return;
if (!APPS_SCRIPT_URL) { wrap.innerHTML = <div class="comment-empty">Ошибка: Не задан адрес бэкенда (APPS_SCRIPT_URL).</div>; return; }
try {
const url = APPS_SCRIPT_URL + "?action=teacherlist&userRole=" + encodeURIComponent(role);
const res = await fetch(url); const d = await res.json();
wrap.innerHTML = "";
if (!d.ok || !d.students || !d.students.length) { wrap.innerHTML = <div class="comment-empty">Записей студентов не найдено.</div>; return; }
const tbl = el(`
ФИО
Группа
Тем сдано
Ср. балл
`);
const tbody = tbl.querySelector("tbody");
d.students.forEach(s => {
tbody.appendChild(el(`
${escapeHtml(s.name)}
${escapeHtml(s.group)}
\({s.topicsDone} / \){s.topicsTotal}
${(s.avgGrade || 0).toFixed(2)}
)); }); wrap.appendChild(tbl); } catch (err) { wrap.innerHTML = Не удалось получить данные с сервера.`; }
}
/* ---------- Маршрутизатор ---------- */
function route(){
document.querySelectorAll(".pdf-overlay, .user-menu, .theme-overlay").forEach(x => x.remove());
const hash = location.hash.replace(/^#/, "") || "/";
const parts = hash.split("/").filter(Boolean);
if (parts[0] === "teacher") {
window.renderTeacherPage();
} else if (parts[0] === "topic" && parts[1]) {
renderTopic(parts[1]);
} else {
renderHome();
}
}
function renderTopic(id) {
const found = findTopic(id); if (!found) return renderHome();
const { topic } = found;
const app = document.getElementById("app"); if(!app) return;
app.innerHTML = "";
const crumbs = document.getElementById("crumbs"); if(crumbs) crumbs.textContent = topic.code + " · " + topic.title;
app.appendChild(el(`← К списку тем
${topic.title}
Всего академических часов на изучение: ${topic.hours?.total || 0} ч.
`));
}
function goHome(e){ if (e) e.preventDefault(); location.hash = "#/"; }
function setActiveTopBtn(which){}
function clearTestTimer(){}
/* ---------- Инициализация ---------- */
window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", ()=>{
initTheme();
initNav();
initAuth();
route();
});