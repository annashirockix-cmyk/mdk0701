/* ============================================================
   МДК 07.01 — Полный script.js с ролевой моделью авторизации
   ============================================================ */

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
  for (const s of COURSE.sections) for (const t of s.topics) if (t.id === id) return { section: s, topic: t };
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
function fmtRel(iso){
  const d = new Date(iso), now = new Date(), diff = (now - d) / 1000;
  if (diff < 60) return "только что";
  if (diff < 3600) return Math.floor(diff/60) + " мин назад";
  if (diff < 86400) return Math.floor(diff/3600) + " ч назад";
  if (diff < 86400*7) return Math.floor(diff/86400) + " дн назад";
  return d.toLocaleDateString("ru-RU");
}
async function sha256(str){
  const buf = new TextEncoder().encode(str);
  const h = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, "0")).join("");
}

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
function saveProgress(){ saveStudentData(); scheduleCloudSave(); }
function saveResults(){ saveStudentData(); scheduleCloudSave(); }
function saveSelfResults(){ saveStudentData(); scheduleCloudSave(); }
function saveCorrections(){ saveStudentData(); scheduleCloudSave(); }

/* ---------- Журнал ---------- */
function logActivity(type, text){
  state.activity = state.activity || [];
  state.activity.push({ type, text, date: new Date().toISOString() });
  if (state.activity.length > ACTIVITY_MAX) state.activity = state.activity.slice(-ACTIVITY_MAX);
  saveStudentData();
}
function activityIcon(type){
  return ({ login:"🚪", topic:"📖", test:"🎯", self:"✍️", comment:"💬",
    avatar:"🎨", report:"📧", chat:"💭", question:"❓", upload:"📎", correction:"✏️" })[type] || "•";
}

/* ---------- Облако ---------- */
let cloudTimer = null, cloudBusy = false;
function scheduleCloudSave(){
  if (cloudTimer) clearTimeout(cloudTimer);
  cloudTimer = setTimeout(()=>cloudSave(true), 3000);
}
async function cloudSave(silent){
  if (!state.student || cloudBusy) return false;
  if (!navigator.onLine){
    if (window.OfflineQueue) window.OfflineQueue.enqueue({ kind:"save", payload: buildCloudPayload() });
    if (!silent) setSyncStatus("Офлайн — в очередь");
    return false;
  }
  cloudBusy = true;
  if (!silent) setSyncStatus("Отправляем…");
  const params = new URLSearchParams();
  params.append("action", "save");
  params.append("key", studentKey());
  params.append("name", state.student.name);
  params.append("group", state.student.group);
  params.append("payload", JSON.stringify(buildCloudPayload()));
  try {
    const res = await fetch(APPS_SCRIPT_URL, { method:"POST", body: params });
    const data = await res.json();
    if (data && data.ok){
      state.lastSync = data.savedAt || new Date().toISOString();
      const k = studentKey();
      if (k) localStorage.setItem("mdk0701.lastSync." + encodeURIComponent(k), state.lastSync);
      if (!silent) setSyncStatus("✔ Синхронизировано");
      cloudBusy = false;
      return true;
    }
    if (!silent) setSyncStatus("Ошибка сервера");
  } catch (err){
    if (window.OfflineQueue) window.OfflineQueue.enqueue({ kind:"save", payload: buildCloudPayload() });
    if (!silent) setSyncStatus("Нет связи — в queue");
  }
  cloudBusy = false;
  return false;
}
function buildCloudPayload(){
  return {
    avatar: state.student.avatar || DEFAULT_AVATAR,
    progress: state.progress,
    results: state.results,
    selfResults: state.selfResults,
    corrections: state.corrections
  };
}
async function cloudLoad(){
  if (!state.student || !navigator.onLine) return null;
  const params = new URLSearchParams();
  params.append("action", "load");
  params.append("key", studentKey());
  try {
    const res = await fetch(APPS_SCRIPT_URL + "?" + params.toString(), { method:"GET" });
    const data = await res.json();
    if (data && data.ok && data.payload) return { payload: JSON.parse(data.payload), savedAt: data.savedAt || "" };
  } catch (err){}
  return null;
}
function setSyncStatus(text){
  const node = document.getElementById("syncStatus");
  if (!node) return;
  node.textContent = text;
  node.className = "sync-status";
  setTimeout(()=>{ if (node.textContent === text) node.textContent = ""; }, 3000);
}
function applyCloudPayload(p){
  state.progress    = p.progress    || {};
  state.results     = p.results     || {};
  state.selfResults = p.selfResults || {};
  state.corrections = p.corrections || {};
}

/* ---------- Авто-бэкап ---------- */
function startAutoBackup(){
  if (window._backupTimer) clearInterval(window._backupTimer);
  window._backupTimer = setInterval(()=>{
    if (state.student && navigator.onLine){
      saveBackupSnapshot();
      cloudSave(true);
    }
  }, BACKUP_INTERVAL_MS);
}
function saveBackupSnapshot(){
  const k = studentKey(); if (!k) return;
  const ek = encodeURIComponent(k);
  const snap = { savedAt: new Date().toISOString(), payload: buildCloudPayload() };
  const key = "mdk0701.backupList." + ek;
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  list.push(snap);
  while (list.length > 3) list.shift();
  localStorage.setItem(key, JSON.stringify(list));
}
function showBackupModal(){
  const k = studentKey(); if (!k) return;
  const ek = encodeURIComponent(k);
  const list = JSON.parse(localStorage.getItem("mdk0701.backupList." + ek) || "[]");
  document.querySelectorAll(".report-overlay").forEach(x=>x.remove());
  const modal = el(`
    <div class="report-overlay">
      <div class="report-modal">
        <h2>Резервные копии</h2>
        <p class="report-sub">Автосохранение каждые 5 минут. Хранится 3 последних.</p>
        <div class="backup-list"></div>
        <div class="report-actions"><button class="btn ghost" id="bkClose">Закрыть</button></div>
      </div>
    </div>
  `);
  const listEl = modal.querySelector(".backup-list");
  if (!list.length) listEl.appendChild(el(`<p class="sub">Пока нет копий.</p>`));
  else list.slice().reverse().forEach((s, i)=>{
    const row = el(`<div class="event-item">
      <span class="ev-date">${fmtDate(s.savedAt)}</span>
      <span class="ev-text">Тем: ${Object.keys(s.payload.progress||{}).length}, тестов: ${Object.keys(s.payload.results||{}).length}</span>
      <button class="btn ghost" data-idx="${list.length - 1 - i}">Восстановить</button>
    </div>`);
    listEl.appendChild(row);
  });
  modal.querySelectorAll("button[data-idx]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const idx = Number(b.dataset.idx);
      const snap = list[idx];
      if (!snap) return;
      if (!confirm("Восстановить из копии от " + fmtDate(snap.savedAt) + "?")) return;
      applyCloudPayload(snap.payload);
      saveStudentData(); modal.remove(); route();
      alert("✔ Восстановлено.");
    });
  });
  document.body.appendChild(modal);
  modal.querySelector("#bkClose").addEventListener("click", ()=>modal.remove());
}

/* ---------- Валидация ---------- */
function normalizeName(v){
const parts = v.trim().split(/\s+/).map(p => p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : "").filter(Boolean);
return parts.slice(0, 3).join(" ");
}
function validateName(v){
const parts = v.trim().split(/\s+/).filter(Boolean);
if (parts.length < 2) return { ok:false, msg:"Введите минимум фамилию и имя" };
if (parts.some(p => p.length < 2)) return { ok:false, msg:"Слишком короткое слово" };
return { ok:true, msg:"Похоже на ФИО", normalized: normalizeName(v) };
}
function validateGroup(v){
const t = v.trim().toUpperCase();
if (t.length < 2) return { ok:false, msg:"Слишком короткая группа" };
return { ok:true, msg:"", normalized: t };
}
/* ============================================================
ТЕМА ОФОРМЛЕНИЯ
============================================================ */
function currentTheme(){ return document.documentElement.getAttribute("data-theme") || "light"; }
function applyTheme(theme){
document.documentElement.setAttribute("data-theme", theme);
localStorage.setItem("mdk0701.theme", theme);
const icon = document.getElementById("themeIcon");
if (icon) icon.textContent = "🎨";
const meta = document.querySelector('meta[name="theme-color"]');
if (meta){
const map = { light:"#c14a2a", dark:"#0e0e10", sepia:"#a0522d", ocean:"#1a6da8", forest:"#3d7a3d", contrast:"#0033cc" };
meta.setAttribute("content", map[theme] || "#c14a2a");
}
}
function systemPrefersDark(){ return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches; }
function initTheme(){
const saved = localStorage.getItem("mdk0701.theme");
if (saved && THEMES.some(t => t.id === saved)) applyTheme(saved);
else applyTheme(systemPrefersDark() ? "dark" : "light");
const btn = document.getElementById("themeToggle");
if (btn) btn.addEventListener("click", openThemeModal);
}
function openThemeModal(){
document.querySelectorAll(".theme-overlay").forEach(x => x.remove());
const current = currentTheme();
const isAuto  = !localStorage.getItem("mdk0701.theme");
const modal = el(`

Цветовая тема

<input type="checkbox" id="themeAuto" ${isAuto ? "checked" : ""}> Следовать системе
Закрыть


); const grid = modal.querySelector(".theme-grid"); THEMES.forEach(t => { const card = el(<button type="button" class="theme-card ${t.id===current?"selected":""}">
${t.name}`);
card.addEventListener("click", () => { applyTheme(t.id); modal.remove(); });
grid.appendChild(card);
});
modal.querySelector("#themeClose").addEventListener("click", () => { modal.remove(); });
document.body.appendChild(modal);
}
function initNav(){
document.getElementById("navBack").addEventListener("click", ()=>window.history.back());
document.getElementById("navForward").addEventListener("click", ()=>window.history.forward());
}
/* ============================================================
АВАТАРЫ И ИНИЦИАЛИЗАЦИЯ ПРОФИЛЯ СТУДЕНТА
============================================================ */
function buildAvatarPicker(selected, onPick){
const wrap = el(<div class="avatar-picker-inline"></div>);
AVATARS.forEach(a=>{
const b = el(<button type="button" class="avatar-option ${a===selected?"selected":""}">${a}</button>);
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
overlay.hidden = false; document.body.style.overflow = "hidden"; nameInput.focus();
} else {
loadStudentData(); overlay.hidden = true; document.body.style.overflow = "";
renderUserChip();
}
btn.addEventListener("click", ()=>{
const rn = validateName(nameInput.value);
const rg = validateGroup(groupInput.value);
if (!rn.ok || !rg.ok) return;
state.student = { name: rn.normalized, group: rg.normalized, avatar: loginAvatar, loginAt: new Date().toISOString() };
saveStudent(); loadStudentData();
overlay.hidden = true; document.body.style.overflow = "";
renderUserChip(); startAutoBackup(); route();
});
document.getElementById("userChip").addEventListener("click", openUserMenu);
}
function renderUserChip(){
const chip = document.getElementById("userChip");
if (!chip || !state.student) return;
chip.hidden = false;
document.getElementById("userChipAvatar").textContent = getAvatar();
document.getElementById("userChipName").textContent = state.student.name;
document.getElementById("userChipGroup").textContent = "Гр. " + state.student.group;
}
function openUserMenu(){
document.querySelectorAll(".user-menu").forEach(m => m.remove());
const chip = document.getElementById("userChip");
const rect = chip.getBoundingClientRect();
const menu = el( <div class="user-menu" style="position:fixed; top:${rect.bottom + 8}px; right:8px; z-index:999; background:var(--card); border:1px solid var(--border); border-radius:12px; padding:12px; box-shadow:var(--shadow);"> <div class="user-menu-head" style="margin-bottom:8px;"><b>${state.student.name}</b><br><span style="font-size:12px; color:var(--muted)">Группа ${state.student.group}</span></div> <button class="user-menu-item" id="muDashboard" style="display:block; width:100%; text-align:left; padding:6px 0; background:none; border:none; cursor:pointer;">📊 Статистика прогресса</button> <button class="user-menu-item" id="muLogout" style="display:block; width:100%; text-align:left; padding:6px 0; background:none; border:none; cursor:pointer; color:var(--err)">🔄 Выйти из аккаунт</button> </div>);
document.body.appendChild(menu);
menu.querySelector("#muDashboard").addEventListener("click", ()=>{ menu.remove(); location.hash = "#/dashboard"; });
menu.querySelector("#muLogout").addEventListener("click", ()=>{
menu.remove(); sessionStorage.clear(); localStorage.removeItem("mdk0701.student");
location.reload();
});
setTimeout(()=>document.addEventListener("click", function c(e){ if(!menu.contains(e.target) && e.target!==chip){ menu.remove(); document.removeEventListener("click", c); } }),0);
}
/* ============================================================
ОСНОВНОЙ ЭКРАН (ГЛАВНАЯ СТРАНИЦА КУРСА)
============================================================ */
function renderHome(){
const app = document.getElementById("app"); app.innerHTML = "";
document.getElementById("crumbs").textContent = "";
setActiveTopBtn("");
app.appendChild(el(`
${COURSE.specialty}
${COURSE.title}
${COURSE.module}

`));
COURSE.sections.forEach(sec=>{
app.appendChild(el(<div class="steps-title">${sec.code} · ${sec.title}</div>));
const list = el(<div class="topics"></div>);
sec.topics.forEach(t=>{
const totalDone = state.progress[t.id]?.done || 0;
const card = el( <div class="topic" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:14px; margin-bottom:8px; cursor:pointer;"> <div class="t-body"><div class="t-title" style="font-weight:600;">${t.code} · ${t.title}</div></div> <div class="t-progress" style="font-size:12px; color:var(--muted);">${totalDone}/5 шагов выполнено</div> </div>);
card.addEventListener("click", ()=>location.hash = "#/topic/" + t.id);
list.appendChild(card);
});
app.appendChild(list);
});
if (COURSE.passports?.length){
app.appendChild(el(<div class="steps-title">Паспорта станков</div>));
const grid = el(<div class="doc-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:12px;"></div>);
COURSE.passports.forEach(p=>{
const c = el(<div class="doc-card" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:12px; cursor:pointer;"><h4>${p.code}</h4><p style="font-size:12px; color:var(--muted);">${p.title}</p></div>);
c.addEventListener("click", ()=>openPdfModal(p.file, p.title));
grid.appendChild(c);
});
app.appendChild(grid);
}
}
/* ============================================================
ПАНЕЛЬ УПРАВЛЕНИЯ / КАБИНЕТЫ
============================================================ */
window.renderTeacherPage = function() {
const app = document.getElementById("app"); app.innerHTML = "";
document.getElementById("crumbs").textContent = "Кабинеты доступа";
setActiveTopBtn("teacher");
app.appendChild(el(<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>));
const currentRole = sessionStorage.getItem("mdk0701.userRole");
const currentUserName = sessionStorage.getItem("mdk0701.userName");
// Показываем форму входа, если сессия пуста
if (!currentRole) {
const loginBlock = el(`
Личный кабинет персонала
Логин
Пароль
Авторизоваться


`);
app.appendChild(loginBlock);
loginBlock.querySelector("#roleLoginForm").addEventListener("submit", async e => {
e.preventDefault();
const user = loginBlock.querySelector("#panelUser").value;
const pass = loginBlock.querySelector("#panelPass").value;
const st = loginBlock.querySelector("#panelStatus");
st.textContent = "Связь со спутником…";
st.style.color = "var(--text)";
try {
const url = APPS_SCRIPT_URL + "?action=login&username=" + encodeURIComponent(user) + "&password=" + encodeURIComponent(pass);
const res = await fetch(url);
const d = await res.json();
if (d && d.ok) {
sessionStorage.setItem("mdk0701.userRole", d.role);
sessionStorage.setItem("mdk0701.userName", d.name);
renderTeacherPage();
} else {
st.textContent = d.error || "Доступ заблокирован"; st.style.color = "var(--err)";
}
} catch (err) { st.textContent = "Сервер недоступен"; st.style.color = "var(--err)"; }
});
return;
}
// Шапка открытого кабинета
const header = el(<div class="teacher-bar" style="display:flex; justify-content:space-between; align-items:center; background:var(--card-soft); border:1px solid var(--border); border-radius:12px; padding:14px; margin-bottom:20px;"> <div>Пользователь: <b>${currentUserName}</b> | Роль: <span style="color:var(--accent); font-weight:bold;">${currentRole.toUpperCase()}</span></div> <button class="btn ghost" id="panelLogoutBtn" style="padding:6px 14px;">Выйти</button> </div>);
app.appendChild(header);
header.querySelector("#panelLogoutBtn").addEventListener("click", () => {
sessionStorage.clear(); renderTeacherPage();
});
// 1. Интерфейс куратора группы ТМ-3 (Серверная фильтрация)
if (currentRole === "curator") {
app.appendChild(el(<section class="module" style="background:var(--card); border:1px solid var(--border); border-radius:14px; padding:20px;"> <h2>Кабинет куратора группы ТМ-3</h2> <p style="color:var(--muted)">Вам предоставлен защищенный доступ только к ведомостям успеваемости вашей группы ТМ-3.</p> <div id="teacherTableWrap"><div class="comment-empty">Загрузка закрытых ведомостей ТМ-3…</div></div> </section>));
loadProtectedStudentList("curator");
}
// 2. Интерфейс преподавателя или администратора
if (currentRole === "teacher" || currentRole === "admin") {
app.appendChild(el(<section class="module" style="background:var(--card); border:1px solid var(--border); border-radius:14px; padding:20px;"> <h2>Глобальный журнал оценок</h2> <div id="teacherTableWrap"><div class="comment-empty">Сбор информации по всем группам…</div></div> <h3 style="margin-top:24px">Вопросы от студентов</h3> <div id="teacherQuestions"><div class="comment-empty">Загрузка очереди вопросов…</div></div> </section>));
loadProtectedStudentList(currentRole);
}
// 3. Интерфейс для 5 аккаунтов тестировщиков
if (currentRole === "tester") {
app.appendChild(el(<section class="module" style="background:var(--card); border:1px solid var(--border); border-radius:14px; padding:20px;"> <h2>Песочница тестировщика систем релизов</h2> <p class="sub">Текущий тестовый профиль авторизован для отладки UI-компонентов платформы.</p> <div class="test-actions" style="display:flex; gap:10px; margin-top:14px;"> <button class="btn ghost" onclick="window.celebrate();">🎇 Эмуляция победы (Конфетти)</button> <button class="btn ghost" onclick="window.openSearch();">🔍 Проверка индексатора поиска</button> </div> </section>));
}
};
/* ---------- Загрузка списков с ролевой фильтрацией ---------- */
async function loadProtectedStudentList(role) {
const wrap = document.getElementById("teacherTableWrap"); if (!wrap) return;
try {
const url = APPS_SCRIPT_URL + "?action=teacherlist&userRole=" + encodeURIComponent(role);
const res = await fetch(url); const d = await res.json();
wrap.innerHTML = "";
if (!d.ok || !d.students.length) { wrap.innerHTML = <div class="comment-empty">Нет активных данных для вашей роли.</div>; return; }
const tbl = el(`
ФИО студента
Группа
Шагов сдано
Успеваемость
`);
const tbody = tbl.querySelector("tbody");
d.students.forEach(s => {
tbody.appendChild(el(`
${escapeHtml(s.name)}
${escapeHtml(s.group)}
\({s.topicsDone} / \){s.topicsTotal}
${(s.avgGrade || 0).toFixed(2)} балла
)); }); wrap.appendChild(tbl); } catch (err) { wrap.innerHTML = Ошибка связи с базой данных Таблиц.`; }
}
/* ============================================================
МАРШРУТИЗАТОР (ROUTER) И СТРАНИЦЫ ТЕМЫ
============================================================ */
function route(){
clearTestTimer();
document.querySelectorAll(".pdf-overlay, .user-menu, .theme-overlay").forEach(x => x.remove());
const hash = location.hash.replace(/^#/, "") || "/";
const parts = hash.split("/").filter(Boolean);
const pages = {
comments:  ()=>window.renderCommentsPage?.(),
dashboard: ()=>window.renderDashboard?.(),
chat:      ()=>window.renderChatPage?.(),
questions: ()=>window.renderQuestionsPage?.(),
gallery:   ()=>window.renderGalleryPage?.(),
teacher:   ()=>window.renderTeacherPage?.(),
calendar:  ()=>window.renderCalendarPage?.(),
gosts:     ()=>window.renderGostsPage?.(),
qr:        ()=>window.renderQrPage?.()
};
if (parts[0] === "topic" && parts[1]) renderTopic(parts[1], parts[2] || "passport");
else if (pages[parts[0]]) pagesparts[0];
else renderHome();
window.scrollTo(0, 0);
}
function renderTopic(id, tab = "passport") {
const found = findTopic(id); if (!found) return renderHome();
const { topic } = found;
const app = document.getElementById("app"); app.innerHTML = "";
document.getElementById("crumbs").textContent = topic.code + " · " + topic.title;
app.appendChild(el(`← К списку тем
${topic.code} · ${topic.title}
`));
const p = el(<section class="panel" style="background:var(--card); border:1px solid var(--border); border-radius:14px; padding:24px;"> <h3>Содержимое вкладки: ${tab.toUpperCase()}</h3> </section>);
if (tab === "passport") p.appendChild(el(<p>Всего академических часов на изучение: <b>${topic.hours.total} ч.</b> (Теория: ${topic.hours.theory} ч. / Практическая подготовка: ${topic.hours.practice} ч.)</p>));
app.appendChild(p);
}
function goHome(e){ if (e) e.preventDefault(); location.hash = "#/"; }
function setActiveTopBtn(which){}
function clearTestTimer(){}
/* ============================================================
ИНИЦИАЛИЗАЦИЯ И ЗАПУСК ПРИЛОЖЕНИЯ
============================================================ */
window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", ()=>{
initTheme();
initNav();
initAuth();
route();
});