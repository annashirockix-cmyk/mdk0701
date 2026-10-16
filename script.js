/* ============================================================
   SPA-роутер и рендер МДК 07.01
   + авторизация
   + синхронизация прогресса через Google Apps Script
   + PDF в модалке
   + отчёт
   + отдельная страница «Комментарии» (#/comments)
   + аватарки
   + режимы теста: Контроль (таймер, shuffle) и Тренировка
   + разбор ошибок
   + CSV/JSON экспорт
   + дашборд статистики
   + журнал активности
   + глобальный поиск (Ctrl+K) и горячие клавиши
   ============================================================ */

const REPORT_EMAIL    = "camelia.2110@yandex.ru";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzB0v37m5pC0jSnEmCEllIlN3IlRmgOhaPEW9giHbS6wNIYFHClxJv8Z5HyG4-AJBpdaQ/exec";

const TEST_TIME_LIMIT_SEC = 15 * 60;   /* 15 минут на контрольный тест */
const ACTIVITY_MAX        = 100;       /* сколько последних действий хранить */

/* ---------- Аватарки ---------- */
const AVATARS = [
  "👨‍🎓","👩‍🎓","🧑‍🎓","👨‍🔧","👩‍🔧","🧑‍🔧",
  "👷","👨‍🏭","👩‍🏭","🧑‍🏭","🦾","🤖",
  "⚙️","🔧","🛠️","🔩","🧰","📐",
  "📏","✈️","🚀","🛰️","⚡","🔥",
  "💡","🎓","🏆","🎯","🧠","🧑‍💻"
];
const DEFAULT_AVATAR = AVATARS[0];

const state = {
  student: JSON.parse(localStorage.getItem("mdk0701.student") || "null"),
  progress: {},
  results: {},
  selfResults: {},
  activity: [],
  lastSync: ""
};

/* ---------- ключ студента ---------- */
function studentKey(s){
  s = s || state.student;
  if (!s || !s.name || !s.group) return null;
  return (s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase());
}
function getAvatar(){
  return (state.student && state.student.avatar) || DEFAULT_AVATAR;
}

/* ---------- локальное хранилище ---------- */
function loadStudentData(){
  const k = studentKey();
  if (!k){
    state.progress = {}; state.results = {}; state.selfResults = {}; state.activity = [];
    return;
  }
  const ek = encodeURIComponent(k);
  state.progress    = JSON.parse(localStorage.getItem("mdk0701.progress."    + ek) || "{}");
  state.results     = JSON.parse(localStorage.getItem("mdk0701.results."     + ek) || "{}");
  state.selfResults = JSON.parse(localStorage.getItem("mdk0701.selfResults." + ek) || "{}");
  state.activity    = JSON.parse(localStorage.getItem("mdk0701.activity."    + ek) || "[]");
  state.lastSync    = localStorage.getItem("mdk0701.lastSync." + ek) || "";
}
function saveStudentData(){
  const k = studentKey();
  if (!k) return;
  const ek = encodeURIComponent(k);
  localStorage.setItem("mdk0701.progress."    + ek, JSON.stringify(state.progress));
  localStorage.setItem("mdk0701.results."     + ek, JSON.stringify(state.results));
  localStorage.setItem("mdk0701.selfResults." + ek, JSON.stringify(state.selfResults));
  localStorage.setItem("mdk0701.activity."    + ek, JSON.stringify(state.activity));
  if (state.lastSync){
    localStorage.setItem("mdk0701.lastSync." + ek, state.lastSync);
  }
}
function saveStudent(){ localStorage.setItem("mdk0701.student", JSON.stringify(state.student)); }
function saveProgress(){ saveStudentData(); scheduleCloudSave(); }
function saveResults(){ saveStudentData(); scheduleCloudSave(); }
function saveSelfResults(){ saveStudentData(); scheduleCloudSave(); }
function saveActivity(){ saveStudentData(); }

/* ---------- журнал активности ---------- */
function logActivity(type, text){
  state.activity = state.activity || [];
  state.activity.push({ type, text, date: new Date().toISOString() });
  if (state.activity.length > ACTIVITY_MAX) state.activity = state.activity.slice(-ACTIVITY_MAX);
  saveActivity();
}
function activityIcon(type){
  return ({
    login:  "🚪",
    topic:  "📖",
    test:   "🎯",
    self:   "✍️",
    comment:"💬",
    avatar: "🎨",
    report: "📧"
  })[type] || "•";
}
function formatRelDate(iso){
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return "только что";
  if (diff < 3600) return Math.floor(diff/60) + " мин назад";
  if (diff < 86400) return Math.floor(diff/3600) + " ч назад";
  if (diff < 86400*7) return Math.floor(diff/86400) + " дн назад";
  return d.toLocaleDateString("ru-RU");
}

/* ---------- синхронизация с облаком ---------- */
let cloudTimer = null;
let cloudBusy  = false;
function scheduleCloudSave(){
  if (cloudTimer) clearTimeout(cloudTimer);
  cloudTimer = setTimeout(()=>{ cloudSave(true); }, 3000);
}
async function cloudSave(silent){
  if (!state.student || cloudBusy) return false;
  cloudBusy = true;
  if (!silent) setSyncStatus("Отправляем…");

  const params = new URLSearchParams();
  params.append("action",  "save");
  params.append("key",     studentKey());
  params.append("name",    state.student.name);
  params.append("group",   state.student.group);
  params.append("payload", JSON.stringify({
    avatar:      state.student.avatar || DEFAULT_AVATAR,
    progress:    state.progress,
    results:     state.results,
    selfResults: state.selfResults
  }));

  try {
    const res  = await fetch(APPS_SCRIPT_URL, { method:"POST", body: params });
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
    if (!silent) setSyncStatus("Нет связи с облаком");
  }
  cloudBusy = false;
  return false;
}
async function cloudLoad(){
  if (!state.student) return null;
  const params = new URLSearchParams();
  params.append("action", "load");
  params.append("key",    studentKey());
  try {
    const res  = await fetch(APPS_SCRIPT_URL + "?" + params.toString(), { method:"GET" });
    const data = await res.json();
    if (data && data.ok && data.payload){
      return { payload: JSON.parse(data.payload), savedAt: data.savedAt || "" };
    }
  } catch (err){ /* оффлайн */ }
  return null;
}
function setSyncStatus(text){
  const node = document.getElementById("syncStatus");
  if (!node) return;
  node.textContent = text;
  node.className = "sync-status";
  setTimeout(()=>{ if (node.textContent === text) node.textContent = ""; }, 3000);
}

/* ---------- утилиты ---------- */
function el(html){
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstChild;
}
function findTopic(id){
  for (const s of COURSE.sections)
    for (const t of s.topics) if (t.id === id) return { section: s, topic: t };
  return null;
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function stripHtml(html){
  const d = document.createElement("div");
  d.innerHTML = html || "";
  return d.textContent || "";
}
function shuffled(arr){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ============================================================
   АВАТАРКИ
   ============================================================ */
function buildAvatarPicker(selected, onPick){
  const wrap = el(`<div class="avatar-picker-inline"></div>`);
  AVATARS.forEach(a=>{
    const b = el(`<button type="button" class="avatar-option ${a===selected?"selected":""}" data-av="${a}">${a}</button>`);
    b.addEventListener("click", ()=>{
      wrap.querySelectorAll(".avatar-option").forEach(x=>x.classList.remove("selected"));
      b.classList.add("selected");
      if (onPick) onPick(a);
    });
    wrap.appendChild(b);
  });
  return wrap;
}
function openAvatarModal(){
  if (!state.student) return;
  document.querySelectorAll(".avatar-overlay").forEach(x=>x.remove());

  let picked = getAvatar();
  const modal = el(`
    <div class="avatar-overlay">
      <div class="avatar-modal">
        <h3>Выберите аватар</h3>
        <p class="avatar-sub">Отображается в шапке профиля и рядом с вашими отзывами.</p>
        <div class="avatar-grid"></div>
        <div class="avatar-modal-actions">
          <button class="btn ghost" id="avatarCancel">Отмена</button>
          <button class="btn" id="avatarSave">Сохранить</button>
        </div>
      </div>
    </div>
  `);
  const grid = modal.querySelector(".avatar-grid");
  AVATARS.forEach(a=>{
    const b = el(`<button type="button" class="avatar-option ${a===picked?"selected":""}" data-av="${a}">${a}</button>`);
    b.addEventListener("click", ()=>{
      grid.querySelectorAll(".avatar-option").forEach(x=>x.classList.remove("selected"));
      b.classList.add("selected");
      picked = a;
    });
    grid.appendChild(b);
  });
  document.body.appendChild(modal);
  const close = ()=> modal.remove();
  modal.querySelector("#avatarCancel").addEventListener("click", close);
  modal.addEventListener("click", (e)=>{ if (e.target === modal) close(); });
  modal.querySelector("#avatarSave").addEventListener("click", ()=>{
    state.student.avatar = picked;
    saveStudent(); saveStudentData();
    renderUserChip();
    logActivity("avatar", "Сменил аватар");
    cloudSave(true);
    close();
  });
}

/* ============================================================
   АВТОРИЗАЦИЯ
   ============================================================ */
function initAuth(){
  const overlay    = document.getElementById("loginOverlay");
  const nameInput  = document.getElementById("loginName");
  const groupInput = document.getElementById("loginGroup");
  const btn        = document.getElementById("loginBtn");

  let loginAvatar = DEFAULT_AVATAR;
  const loginPicker = document.getElementById("loginAvatarPicker");
  if (loginPicker) loginPicker.appendChild(buildAvatarPicker(loginAvatar, (a)=>{ loginAvatar = a; }));

  if (!state.student){
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    if (nameInput) nameInput.focus();
  } else {
    loadStudentData();
    overlay.hidden = true;
    document.body.style.overflow = "";
    setTimeout(async ()=>{
      const cloud = await cloudLoad();
      if (cloud && cloud.savedAt && cloud.savedAt > (state.lastSync || "")){
        if (cloud.payload.avatar && !state.student.avatar){ state.student.avatar = cloud.payload.avatar; saveStudent(); }
        state.progress    = cloud.payload.progress    || {};
        state.results     = cloud.payload.results     || {};
        state.selfResults = cloud.payload.selfResults || {};
        state.lastSync    = cloud.savedAt;
        saveStudentData();
        route();
      }
    }, 500);
  }

  btn.addEventListener("click", async ()=>{
    const name  = (nameInput.value  || "").trim();
    const group = (groupInput.value || "").trim();
    if (!name || name.length < 3){ nameInput.focus(); nameInput.style.borderColor = "var(--err)"; return; }
    if (!group || group.length < 2){ groupInput.focus(); groupInput.style.borderColor = "var(--err)"; return; }

    if (state.student) saveStudentData();

    state.student = { name, group, avatar: loginAvatar, loginAt: new Date().toISOString() };
    saveStudent();
    loadStudentData();

    overlay.hidden = true;
    document.body.style.overflow = "";
    renderUserChip();

    const cloud = await cloudLoad();
    let restored = false;
    if (cloud && cloud.savedAt && cloud.savedAt > (state.lastSync || "")){
      if (cloud.payload.avatar){
        state.student.avatar = cloud.payload.avatar;
        saveStudent();
        renderUserChip();
      }
      state.progress    = cloud.payload.progress    || {};
      state.results     = cloud.payload.results     || {};
      state.selfResults = cloud.payload.selfResults || {};
      state.lastSync    = cloud.savedAt;
      saveStudentData();
      restored = true;
    }

    logActivity("login", "Вход в систему");
    route();
    if (restored) setTimeout(()=>alert("Прогресс восстановлен из облака."), 200);
  });

  [nameInput, groupInput].forEach(inp=>{
    if (!inp) return;
    inp.addEventListener("keydown", (e)=>{ if (e.key === "Enter") btn.click(); });
    inp.addEventListener("input", ()=>{ inp.style.borderColor = ""; });
  });

  const chip = document.getElementById("userChip");
  if (chip) chip.addEventListener("click", openUserMenu);
}

function renderUserChip(){
  const chip    = document.getElementById("userChip");
  const avEl    = document.getElementById("userChipAvatar");
  const nameEl  = document.getElementById("userChipName");
  const groupEl = document.getElementById("userChipGroup");
  if (!chip || !state.student) return;
  chip.hidden = false;
  if (avEl) avEl.textContent = getAvatar();
  nameEl.textContent  = state.student.name;
  groupEl.textContent = "Гр. " + state.student.group;
}

/* ---------- меню профиля ---------- */
function openUserMenu(){
  document.querySelectorAll(".user-menu").forEach(m=>m.remove());
  const chip = document.getElementById("userChip");
  const rect = chip.getBoundingClientRect();

  const menu = el(`
    <div class="user-menu">
      <div class="user-menu-head">
        <span class="user-menu-avatar">${getAvatar()}</span>
        <div class="user-menu-headtext">
          <div class="user-menu-name">${state.student.name}</div>
          <div class="user-menu-group">Группа ${state.student.group}</div>
        </div>
      </div>
      <button class="user-menu-item" data-act="avatar">🎨 Сменить аватар</button>
      <button class="user-menu-item" data-act="dashboard">📊 Статистика</button>
      <button class="user-menu-item" data-act="comments">💬 Комментарии</button>
      <button class="user-menu-item" data-act="sync">☁ Синхронизировать сейчас</button>
      <button class="user-menu-item" data-act="switch">🔄 Сменить пользователя</button>
      <button class="user-menu-item" data-act="export">⬇️ Скачать профиль (.json)</button>
      <button class="user-menu-item" data-act="import">⬆️ Загрузить профиль (.json)</button>
      <button class="user-menu-item danger" data-act="clear">🗑 Очистить мой прогресс</button>
    </div>
  `);
  document.body.appendChild(menu);
  menu.style.position = "fixed";
  menu.style.top  = (rect.bottom + 8) + "px";
  menu.style.right = Math.max(8, window.innerWidth - rect.right) + "px";

  const close = (e)=>{
    if (!menu.contains(e.target) && e.target !== chip){
      menu.remove();
      document.removeEventListener("click", close);
    }
  };
  setTimeout(()=>document.addEventListener("click", close), 0);

  menu.querySelector('[data-act="avatar"]').addEventListener("click", ()=>{ menu.remove(); openAvatarModal(); });
  menu.querySelector('[data-act="dashboard"]').addEventListener("click", ()=>{ menu.remove(); location.hash = "#/dashboard"; });
  menu.querySelector('[data-act="comments"]').addEventListener("click", ()=>{ menu.remove(); location.hash = "#/comments"; });
  menu.querySelector('[data-act="sync"]').addEventListener("click", async ()=>{
    menu.remove();
    const ok = await cloudSave(false);
    if (ok) alert("Прогресс отправлен в облако.");
  });
  menu.querySelector('[data-act="switch"]').addEventListener("click", ()=>{
    menu.remove();
    if (!confirm("Сменить пользователя? Ваш прогресс сохранён локально и в облаке.")) return;
    saveStudentData();
    state.student = null;
    state.progress = {}; state.results = {}; state.selfResults = {}; state.activity = [];
    saveStudent();
    document.getElementById("loginOverlay").hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("loginName").value = "";
    document.getElementById("loginGroup").value = "";
    document.getElementById("loginName").focus();
    document.getElementById("userChip").hidden = true;
  });
  menu.querySelector('[data-act="export"]').addEventListener("click", ()=>{ menu.remove(); exportProfile(); });
  menu.querySelector('[data-act="import"]').addEventListener("click", ()=>{
    menu.remove();
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".json,application/json";
    input.addEventListener("change", (e)=>{ const f = e.target.files[0]; if (f) importProfile(f); });
    input.click();
  });
  menu.querySelector('[data-act="clear"]').addEventListener("click", ()=>{
    menu.remove();
    if (!confirm("Очистить ВЕСЬ прогресс (тесты, самостоятельные, открытые вкладки)?")) return;
    state.progress = {}; state.results = {}; state.selfResults = {};
    saveStudentData(); route(); cloudSave(true);
  });
}

function exportProfile(){
  const s = state.student; if (!s) return;
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    student: s,
    progress: state.progress,
    results: state.results,
    selfResults: state.selfResults
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type:"application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  const safeName  = s.name.replace(/[^\wа-яё\-]+/gi, "_");
  const safeGroup = s.group.replace(/[^\wа-яё\-]+/gi, "_");
  a.href = url;
  a.download = "mdk0701_" + safeName + "_" + safeGroup + ".json";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function importProfile(file){
  const reader = new FileReader();
  reader.onload = (e)=>{
    let data;
    try { data = JSON.parse(e.target.result); }
    catch (err){ alert("Не удалось прочитать файл: " + err.message); return; }
    if (!data || !data.student || !data.student.name){ alert("Это не файл профиля МДК 07.01."); return; }
    if (!confirm("Загрузить профиль:\n" + data.student.name + " (гр. " + data.student.group + ")\n\nТекущий прогресс будет заменён.")) return;
    state.student = data.student;
    if (!state.student.avatar) state.student.avatar = DEFAULT_AVATAR;
    state.progress = data.progress || {};
    state.results = data.results || {};
    state.selfResults = data.selfResults || {};
    saveStudent(); saveStudentData();
    renderUserChip(); route(); cloudSave(true);
    alert("✔ Профиль загружен.");
  };
  reader.readAsText(file);
}

/* ============================================================
   ТЕМА
   ============================================================ */
function initTheme(){
  const saved = localStorage.getItem("mdk0701.theme");
  const systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (systemDark ? "dark" : "light"));
  const btn = document.getElementById("themeToggle");
  if (btn) btn.addEventListener("click", toggleTheme);
}
function applyTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  const icon = document.getElementById("themeIcon");
  if (icon) icon.textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem("mdk0701.theme", theme);
}
function toggleTheme(){
  const cur = document.documentElement.getAttribute("data-theme") || "light";
  applyTheme(cur === "dark" ? "light" : "dark");
}
function initNav(){
  const back = document.getElementById("navBack");
  const fwd  = document.getElementById("navForward");
  if (back) back.addEventListener("click", ()=>window.history.back());
  if (fwd)  fwd.addEventListener("click", ()=>window.history.forward());
}

/* ============================================================
   ГЛАВНАЯ
   ============================================================ */
function renderHome(){
  const app = document.getElementById("app");
  app.innerHTML = "";
  document.getElementById("crumbs").textContent = "";
  setActiveTopBtn("");

  app.appendChild(el(`
    <section class="hero">
      <div class="meta">${COURSE.specialty} · набор 2024</div>
      <h1>${COURSE.title}</h1>
      <p>${COURSE.module}</p>
      ${state.student ? `<div class="hello">
        <span class="hello-avatar">${getAvatar()}</span>
        <span>Вы вошли как <b>${state.student.name}</b>, группа <b>${state.student.group}</b>.
        <span class="sync-status" id="syncStatus"></span></span>
      </div>` : ""}
    </section>
  `));

  app.appendChild(el(`<div class="steps-title">Как устроена тема</div>`));
  const steps = [["01","Паспорт часов"],["02","Лекция"],["03","Практические"],["04","Самостоятельная"],["05","Контроль темы"]];
  const stepsWrap = el(`<div class="steps"></div>`);
  steps.forEach(([n,name])=>{
    stepsWrap.appendChild(el(`<div class="step"><div class="num">${n}</div><div class="name">${name}</div></div>`));
  });
  app.appendChild(stepsWrap);

  app.appendChild(el(`
    <section class="module">
      <div class="meta">${COURSE.module.split(" ")[0]}</div>
      <h2>${COURSE.module}</h2>
      <div class="kpis">
        <div class="kpi"><div class="k-label">Всего по плану</div><div class="k-value">${COURSE.totals.plan} ч</div></div>
        <div class="kpi"><div class="k-label">МДК</div><div class="k-value">${COURSE.totals.mdk} ч</div></div>
        <div class="kpi"><div class="k-label">Практика</div><div class="k-value">Уч. ${COURSE.totals.uchPr} ч · Пр. ${COURSE.totals.prPr} ч</div></div>
        <div class="kpi"><div class="k-label">Аттестация</div><div class="k-value">Экзамен ${COURSE.totals.exam} ч</div></div>
      </div>
      <p class="desc">Сумма тем: теория 58, практика 70, вместе 128. Плюс практика 72 и 36 и экзамен 12 — ровно ${COURSE.totals.plan}.
      Практическая подготовка модуля 70+72+36 = 178 ч.</p>
    </section>
  `));

  if (COURSE.practiceFormatting){
    const f = COURSE.practiceFormatting;
    const infoBlock = el(`
      <section class="info-block">
        <div class="info-head">
          <span class="info-badge">ИНФОРМАЦИЯ!</span>
          <h2>${f.title}</h2>
        </div>
        <p class="info-intro">${f.intro}</p>
        <div class="fmt-grid"></div>
      </section>
    `);
    const grid = infoBlock.querySelector(".fmt-grid");
    f.blocks.forEach(b=>{
      grid.appendChild(el(`
        <div class="fmt-block">
          <h4>${b.title}</h4>
          <ul>${b.items.map(i=>`<li>${i}</li>`).join("")}</ul>
        </div>
      `));
    });
    app.appendChild(infoBlock);
  }

  COURSE.sections.forEach(sec=>{
    app.appendChild(el(`<div class="steps-title">${sec.code} · ${sec.title} · ${sec.hours} ак. ч</div>`));
    const list = el(`<div class="topics"></div>`);
    sec.topics.forEach(t=>{
      const totalDone = state.progress[t.id]?.done || 0;
      const card = el(`
        <div class="topic" data-id="${t.id}">
          <div class="t-code">${t.code}</div>
          <div class="t-body">
            <div class="t-title">${t.title}</div>
            <div class="t-meta">${t.hours.total} ак. ч / в т.ч. практическая подготовка ${t.hours.practice} ак. ч</div>
          </div>
          <div class="t-hours">${t.hours.total}\\${t.hours.practice}</div>
          <div class="t-progress">${totalDone}/5</div>
        </div>
      `);
      card.addEventListener("click", ()=>location.hash = "#/topic/" + t.id);
      list.appendChild(card);
    });
    app.appendChild(list);
  });

  if (COURSE.passports && COURSE.passports.length){
    app.appendChild(el(`<div class="steps-title">Паспорта станков</div>`));
    const block = el(`<section class="module">
      <div class="meta">Справочные материалы</div>
      <h2>Паспорта станков</h2>
      <p class="sub">PDF-файлы из папки <code>passport/</code>. Открываются прямо на странице.</p>
      <div class="doc-grid"></div>
    </section>`);
    const grid = block.querySelector(".doc-grid");
    COURSE.passports.forEach(p=>{
      const card = el(`
        <div class="doc-card" role="button" tabindex="0">
          <div class="doc-code">${p.code}</div>
          <div class="doc-title">${p.title}</div>
          <div class="doc-summary">${p.summary}</div>
          <div class="doc-action">Открыть PDF →</div>
        </div>
      `);
      card.addEventListener("click", ()=>openPdfModal(p.file, p.title));
      card.addEventListener("keydown", (e)=>{
        if (e.key === "Enter" || e.key === " "){ e.preventDefault(); openPdfModal(p.file, p.title); }
      });
      grid.appendChild(card);
    });
    app.appendChild(block);
  }

  if (COURSE.safety && COURSE.safety.length){
    app.appendChild(el(`<div class="steps-title">Охрана труда</div>`));
    const block = el(`<section class="module">
      <div class="meta">Нормативные документы</div>
      <h2>Инструкции по охране труда</h2>
      <p class="sub">DOCX-файлы из папки <code>ohranatruda/</code>. При клике скачиваются на компьютер.</p>
      <div class="doc-grid"></div>
    </section>`);
    const grid = block.querySelector(".doc-grid");
    COURSE.safety.forEach(s=>{
      grid.appendChild(el(`
        <a class="doc-card" href="${s.file}" download>
          <div class="doc-code">${s.code}</div>
          <div class="doc-title">${s.title}</div>
          <div class="doc-summary">${s.summary}</div>
          <div class="doc-action">Скачать .docx →</div>
        </a>
      `));
    });
    app.appendChild(block);
  }

  app.appendChild(el(`<div class="steps-title">История робототехники СССР</div>`));
  const vids = el(`<section class="module">
    <div class="meta">Модуль 4 · Видеоматериалы</div>
    <h2>История робототехники СССР</h2>
    <p class="sub">Видеоматериалы к разделу. Просмотр — прямо на странице.</p>
    <div class="videos"></div>
  </section>`);
  const vwrap = vids.querySelector(".videos");
  COURSE.videos.forEach((v)=>{
    vwrap.appendChild(el(`
      <div class="video-card">
        <video controls preload="metadata">
          <source src="${v.src}" type="video/mp4">
        </video>
        <div class="v-cap">${v.title}</div>
      </div>
    `));
  });
  app.appendChild(vids);

  app.appendChild(el(`<div class="steps-title">Итоговое задание</div>`));
  app.appendChild(el(`
    <section class="module">
      <h2>${COURSE.final.title}</h2>
      <p class="desc"><b>Задание:</b> ${COURSE.final.task}</p>
      <h3>Требования:</h3>
      <ul>${COURSE.final.requirements.map(r=>`<li>${r}</li>`).join("")}</ul>
      <h3>Критерии оценки:</h3>
      <div class="kpis">
        ${COURSE.final.criteria.map(c=>`<div class="kpi"><div class="k-label">${c.weight}</div><div class="k-value" style="font-size:14px">${c.name}</div></div>`).join("")}
      </div>
      <p class="desc"><b>Срок:</b> ${COURSE.final.deadline}</p>
    </section>
  `));

  app.appendChild(renderCommentsBlock());
}

/* ============================================================
   КОММЕНТАРИИ / СТРАНИЦА
   ============================================================ */
function renderCommentsPage(){
  const app = document.getElementById("app");
  app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Комментарии";
  setActiveTopBtn("comments");
  app.appendChild(el(`<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>`));
  const wrap = el(`<div class="comments-page"></div>`);
  wrap.appendChild(renderCommentsBlock());
  app.appendChild(wrap);
}

/* ============================================================
   ТЕМА
   ============================================================ */
function renderTopic(id, tab = "passport", extra = ""){
  const found = findTopic(id);
  if (!found) return renderHome();
  const { section, topic } = found;
  const app = document.getElementById("app");
  app.innerHTML = "";
  document.getElementById("crumbs").textContent = topic.code + " · " + topic.title;
  setActiveTopBtn("");

  app.appendChild(el(`
    <a class="backlink" href="#/" onclick="goHome(event)">← К программе</a>
    <section class="topic-head">
      <div class="crumb">ПМ.07 · ${topic.code} · ${section.title}</div>
      <h1>${topic.title}</h1>
      <div class="meta">${topic.hours.total}\\${topic.hours.practice} · ${topic.hours.total} ак. ч / в т.ч. практическая подготовка ${topic.hours.practice} ак. ч</div>
    </section>
  `));

  const tabs = [
    ["passport","01","Паспорт часов"],
    ["lecture","02","Лекция"],
    ["practice","03","Практические"],
    ["self","04","Самостоятельная"],
    ["test","05","Контроль темы"]
  ];
  const tabsWrap = el(`<div class="tabs"></div>`);
  tabs.forEach(([key,num,name])=>{
    const t = el(`<button class="tab ${key===tab?"active":""}"><span class="t-num">${num}</span><span class="t-name">${name}</span></button>`);
    t.addEventListener("click", ()=>{ location.hash = `#/topic/${id}/${key}`; });
    tabsWrap.appendChild(t);
  });
  app.appendChild(tabsWrap);

  const panel = el(`<section class="panel"></section>`);
  app.appendChild(panel);

  if (tab === "passport") renderPassport(panel, topic);
  if (tab === "lecture") renderLecture(panel, topic);
  if (tab === "practice") renderPractice(panel, topic);
  if (tab === "self") renderSelf(panel, topic);
  if (tab === "test") renderTest(panel, topic, extra || "control");

  markDone(topic.id, tab);
}

function markDone(topicId, tab){
  state.progress[topicId] = state.progress[topicId] || { done: 0, tabs: {} };
  if (!state.progress[topicId].tabs[tab]){
    const before = state.progress[topicId].done || 0;
    state.progress[topicId].tabs[tab] = true;
    const after = Object.keys(state.progress[topicId].tabs).length;
    state.progress[topicId].done = after;
    saveProgress();
    const t = findTopic(topicId)?.topic;
    if (before === 0 && t) logActivity("topic", `Начата тема ${t.code}`);
    if (after === 5 && before < 5 && t) logActivity("topic", `Пройдена тема ${t.code} полностью`);
  }
}

function renderPassport(panel, t){
  panel.innerHTML = `
    <h2>Паспорт часов</h2>
    <p>Тема <b>${t.code}</b> — ${t.title}.</p>
    <div class="kpi-row">
      <div class="kpi"><div class="k-label">Всего по теме</div><div class="k-value">${t.hours.total} ч</div></div>
      <div class="kpi"><div class="k-label">Теория</div><div class="k-value">${t.hours.theory} ч</div></div>
      <div class="kpi"><div class="k-label">Практическая подготовка</div><div class="k-value">${t.hours.practice} ч</div></div>
    </div>
    <h3>Содержание по рабочей программе</h3>
    <ul>${t.lectures.map(l=>`<li><b>${l.code}</b> ${l.title}</li>`).join("")}</ul>
    <h3>Практические занятия</h3>
    <ul>${t.practicals.map(p=>`<li><b>${p.code}</b> ${p.title}</li>`).join("")}</ul>
  `;
}
function renderLecture(panel, t){
  panel.innerHTML = `<h2>Лекция</h2><p class="accent">Теория, схема, вопросы для самопроверки.</p>`;
  t.lectures.forEach(l=>{
    panel.appendChild(el(`<h3>${l.code}. ${l.title}</h3>`));
    panel.appendChild(el(`<div>${l.content || "<p><i>Материал готовится.</i></p>"}</div>`));
  });
}
function renderPractice(panel, t){
  panel.innerHTML = `<h2>Практические работы с примером выполнения</h2><p class="accent">${t.hours.practice} ч практической подготовки.</p>`;
  t.practicals.forEach(p=>{
    const box = el(`
      <div class="practice">
        <div class="p-code">${p.code}</div>
        <div class="p-title">${p.title}</div>
        ${p.goal ? `<div class="p-goal">Цель: ${p.goal}</div>` : ""}
        ${p.task ? `<div class="p-task"><b>Задание:</b> ${p.task}</div>` : ""}
        ${p.example ? `<div class="p-example"><b>Пример выполнения:</b> ${p.example}</div>` : ""}
        ${p.solution && p.solution.length ? `
          <div class="p-solution">
            <h4>Ход решения по этапам</h4>
            <ol>${p.solution.map(s=>`<li>${s}</li>`).join("")}</ol>
          </div>` : ""}
      </div>
    `);
    if (p.variants && p.variants.rows && p.variants.rows.length){
      const v = el(`<div class="variants">
        <div class="v-title">Варианты (1–${p.variants.rows.length})</div>
        <div class="v-scroll"></div>
      </div>`);
      const tbl = el(`<table class="v-table"></table>`);
      if (p.variants.header){
        const thead = el(`<thead><tr></tr></thead>`);
        p.variants.header.forEach(h => thead.firstChild.appendChild(el(`<th>${h}</th>`)));
        tbl.appendChild(thead);
      }
      const tbody = el(`<tbody></tbody>`);
      p.variants.rows.forEach(row=>{
        const tr = el(`<tr></tr>`);
        row.forEach(cell => tr.appendChild(el(`<td>${cell}</td>`)));
        tbody.appendChild(tr);
      });
      tbl.appendChild(tbody);
      v.querySelector(".v-scroll").appendChild(tbl);
      box.appendChild(v);
    }
    panel.appendChild(box);
  });
}
function renderSelf(panel, t){
  panel.innerHTML = `
    <h2>Самостоятельная работа</h2>
    <p>Закрепление материала темы <b>${t.code}</b> «${t.title}».</p>
    <p class="accent">Введите ответ в поле и нажмите «Проверить». Регистр и лишние пробелы не важны.</p>
  `;
  const tasks = (t.selfChecks && t.selfChecks.length) ? t.selfChecks : [
    { q: "Как называется главное движение при точении?", a: "вращение заготовки", accept: ["вращение детали"] }
  ];
  const form = el(`<form class="self-form"></form>`);
  tasks.forEach((task, i)=>{
    const block = el(`<div class="question self-q">
      <div class="q-text">${i+1}. ${task.q}</div>
      <div class="self-row">
        <input type="text" class="self-input" placeholder="Ваш ответ">
        <button type="button" class="btn ghost self-check">Проверить</button>
      </div>
      <div class="self-feedback"></div>
    </div>`);
    const input = block.querySelector(".self-input");
    const btn   = block.querySelector(".self-check");
    const fb    = block.querySelector(".self-feedback");
    btn.addEventListener("click", ()=>{
      const userAns  = (input.value || "").trim().toLowerCase();
      const correct  = task.a.trim().toLowerCase();
      const accepted = Array.isArray(task.accept) ? task.accept.map(x=>x.trim().toLowerCase()) : [];
      const ok = userAns === correct || accepted.includes(userAns);
      fb.textContent = ok ? "✔ Верно" : ("✘ Неверно. Правильный ответ: " + task.a);
      fb.className = "self-feedback " + (ok ? "ok" : "bad");
    });
    input.addEventListener("keydown", (e)=>{ if (e.key === "Enter"){ e.preventDefault(); btn.click(); } });
    form.appendChild(block);
  });
  const result = el(`<div class="test-result"></div>`);
  const actions = el(`<div class="test-actions">
    <button type="button" class="btn" id="selfCount">Подвести итог</button>
    <button type="button" class="btn ghost" id="selfReset">Сбросить</button>
  </div>`);
  form.appendChild(actions);
  form.appendChild(result);
  form.querySelector("#selfCount").addEventListener("click", ()=>{
    let ok = 0;
    form.querySelectorAll(".self-q").forEach((q)=>{
      if (q.querySelector(".self-feedback").classList.contains("ok")) ok++;
    });
    const total = tasks.length;
    const pct   = Math.round(ok / total * 100);
    const grade = pct >= 90 ? 5 : pct >= 75 ? 4 : pct >= 60 ? 3 : 2;
    result.textContent = `Верных: ${ok} из ${total} (${pct}%). Оценка: ${grade}.`;
    result.className = "test-result " + (grade >= 3 ? "ok" : "bad");
    state.selfResults[t.id] = { ok, total, pct, grade, date: new Date().toISOString() };
    saveSelfResults();
    logActivity("self", `Самостоятельная ${t.code}: ${ok}/${total} (оценка ${grade})`);
  });
  form.querySelector("#selfReset").addEventListener("click", ()=>{
    form.querySelectorAll(".self-input").forEach(i=>i.value="");
    form.querySelectorAll(".self-feedback").forEach(f=>{ f.textContent=""; f.className="self-feedback"; });
    result.textContent = ""; result.className = "test-result";
  });
  panel.appendChild(form);
}

/* ============================================================
   ТЕСТ: РЕЖИМЫ «КОНТРОЛЬ» И «ТРЕНИРОВКА»
   ============================================================ */
function renderTest(panel, t, mode = "control"){
  panel.innerHTML = "";
  panel.appendChild(el(`<h2>Контроль темы</h2>
    <p class="accent">Выберите режим: <b>🎯 Контроль</b> — с таймером, перемешиванием и разбором ошибок, идёт в отчёт.
    <b>🎓 Тренировка</b> — мгновенная проверка, без оценки.</p>
    <div class="test-mode-tabs">
      <button class="test-mode-tab ${mode==='control'?'active':''}" data-mode="control">🎯 Контроль</button>
      <button class="test-mode-tab ${mode==='training'?'active':''}" data-mode="training">🎓 Тренировка</button>
    </div>
  `));
  panel.querySelectorAll(".test-mode-tab").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      location.hash = `#/topic/${t.id}/test/${btn.dataset.mode}`;
    });
  });

  const body = el(`<div class="test-body"></div>`);
  panel.appendChild(body);

  if (!t.test || !t.test.length){
    body.appendChild(el(`<p><i>Тест по теме готовится.</i></p>`));
    return;
  }
  if (mode === "training") renderTestTraining(body, t);
  else                     renderTestControl(body, t);
}

/* --- ТРЕНИРОВКА --- */
function renderTestTraining(body, t){
  body.innerHTML = "";
  body.appendChild(el(`<p class="accent">Отвечайте в любом порядке. После выбора сразу увидите правильный ответ. Оценка не сохраняется.</p>`));

  const items = shuffled(t.test.map(q => ({ q })));
  items.forEach(item=>{
    const opts = item.q.options.map((opt, oi) => ({ opt, oi }));
    item.shuffledOpts = shuffled(opts);
    item.newCorrect   = item.shuffledOpts.findIndex(o => o.oi === item.q.correct);
  });

  const form = el(`<form class="train-form"></form>`);
  items.forEach((item, qi)=>{
    const qBox = el(`<div class="question">
      <div class="q-text">${qi+1}. ${item.q.q}</div>
    </div>`);
    item.shuffledOpts.forEach((o, oi)=>{
      const optEl = el(`<label class="option">
        <input type="radio" name="t${qi}" value="${oi}">
        <span>${o.opt}</span>
      </label>`);
      qBox.appendChild(optEl);
    });
    const fb = el(`<div class="train-feedback"></div>`);
    qBox.appendChild(fb);
    qBox.querySelectorAll('input[type=radio]').forEach(inp=>{
      inp.addEventListener("change", ()=>{
        const idx = Number(inp.value);
        const allOpts = qBox.querySelectorAll(".option");
        allOpts.forEach(o => o.classList.remove("correct","wrong"));
        if (idx === item.newCorrect){
          allOpts[idx].classList.add("correct");
          fb.textContent = "✔ Верно!";
          fb.className = "train-feedback ok";
        } else {
          allOpts[idx].classList.add("wrong");
          allOpts[item.newCorrect].classList.add("correct");
          fb.textContent = "✘ Неверно. Правильный ответ выделен зелёным.";
          fb.className = "train-feedback bad";
        }
      });
    });
    form.appendChild(qBox);
  });

  const actions = el(`<div class="test-actions">
    <button type="button" class="btn ghost" id="trainReset">🔄 Начать заново</button>
  </div>`);
  form.appendChild(actions);
  form.querySelector("#trainReset").addEventListener("click", ()=>{ renderTestTraining(body, t); });
  body.appendChild(form);
}

/* --- КОНТРОЛЬ (с таймером, shuffle, разбором) --- */
let testTimerId = null;
function clearTestTimer(){
  if (testTimerId){ clearInterval(testTimerId); testTimerId = null; }
}
function startTestTimer(seconds, displayEl, onEnd){
  clearTestTimer();
  let remaining = seconds;
  function tick(){
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    displayEl.textContent = `⏱ ${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    displayEl.classList.toggle("warn", remaining <= 60);
    if (remaining <= 0){ clearTestTimer(); onEnd(); return; }
    remaining--;
  }
  tick();
  testTimerId = setInterval(tick, 1000);
}

function renderTestControl(body, t){
  body.innerHTML = "";

  const items = shuffled(t.test.map(q => ({ q })));
  items.forEach(item=>{
    const opts = item.q.options.map((opt, oi) => ({ opt, oi }));
    item.shuffledOpts = shuffled(opts);
    item.newCorrect   = item.shuffledOpts.findIndex(o => o.oi === item.q.correct);
  });

  const timerBox = el(`<div class="test-timer" id="testTimer">⏱ --:--</div>`);
  body.appendChild(timerBox);
  body.appendChild(el(`<p class="accent">Вопросы и варианты перемешаны. На весь тест — 15 минут. По истечении время выйдет, и тест будет сдан автоматически.</p>`));

  const form = el(`<form class="control-form"></form>`);
  items.forEach((item, qi)=>{
    const qBox = el(`<div class="question">
      <div class="q-text">${qi+1}. ${item.q.q}</div>
    </div>`);
    item.shuffledOpts.forEach((o, oi)=>{
      const optEl = el(`<label class="option">
        <input type="radio" name="q${qi}" value="${oi}">
        <span>${o.opt}</span>
      </label>`);
      qBox.appendChild(optEl);
    });
    form.appendChild(qBox);
  });

  const result = el(`<div class="test-result"></div>`);
  const report = el(`<div class="test-report"></div>`);
  const actions = el(`<div class="test-actions">
    <button type="button" class="btn" id="gradeBtn">Подвести итог</button>
    <button type="button" class="btn ghost" id="resetTest">Сбросить</button>
  </div>`);
  form.appendChild(actions);
  form.appendChild(result);
  form.appendChild(report);
  body.appendChild(form);

  let graded = false;
  function grade(){
    if (graded) return;
    graded = true;
    clearTestTimer();

    let ok = 0;
    const wrongItems = [];
    items.forEach((item, qi)=>{
      const chosen = form.querySelector(`input[name="q${qi}"]:checked`);
      const qBox   = form.querySelectorAll(".question")[qi];
      qBox.querySelectorAll(".option").forEach(o => o.classList.remove("correct","wrong"));
      if (chosen){
        const idx = Number(chosen.value);
        const opt = qBox.querySelectorAll(".option")[idx];
        if (idx === item.newCorrect){ ok++; opt.classList.add("correct"); }
        else {
          opt.classList.add("wrong");
          qBox.querySelectorAll(".option")[item.newCorrect].classList.add("correct");
          wrongItems.push({
            q: item.q.q,
            userAnswer: item.shuffledOpts[idx].opt,
            correct: item.q.options[item.q.correct]
          });
        }
      } else {
        qBox.querySelectorAll(".option")[item.newCorrect].classList.add("correct");
        wrongItems.push({
          q: item.q.q,
          userAnswer: "(нет ответа)",
          correct: item.q.options[item.q.correct]
        });
      }
    });

    const total = items.length;
    const pct   = Math.round(ok / total * 100);
    let grade5 = 2;
    if (pct >= 90) grade5 = 5; else if (pct >= 75) grade5 = 4; else if (pct >= 60) grade5 = 3;

    result.textContent = `Верных: ${ok} из ${total} (${pct}%). Оценка: ${grade5}.`;
    result.className = "test-result " + (grade5 >= 3 ? "ok" : "bad");

    state.results[t.id] = { ok, total, pct, grade: grade5, date: new Date().toISOString() };
    saveResults();
    logActivity("test", `Тест ${t.code}: ${ok}/${total} (оценка ${grade5})`);

    if (wrongItems.length){
      report.appendChild(el(`<h3>Разбор ошибок</h3>`));
      wrongItems.forEach(w=>{
        report.appendChild(el(`<div class="error-item">
          <div class="error-q">${escapeHtml(w.q)}</div>
          <div class="error-line error-bad">Ваш ответ: ${escapeHtml(w.userAnswer)}</div>
          <div class="error-line error-ok">Верно: ${escapeHtml(w.correct)}</div>
        </div>`));
      });
      const link = el(`<a class="backlink" href="#/topic/${t.id}/lecture">📖 Перечитать лекцию →</a>`);
      report.appendChild(link);
    } else {
      report.appendChild(el(`<p class="test-perfect">🎉 Все ответы верные!</p>`));
    }
    actions.querySelector("#gradeBtn").disabled = true;
  }

  form.querySelector("#gradeBtn").addEventListener("click", grade);
  form.querySelector("#resetTest").addEventListener("click", ()=>{
    clearTestTimer();
    form.querySelectorAll("input[type=radio]").forEach(i => i.checked = false);
    form.querySelectorAll(".option").forEach(o => o.classList.remove("correct","wrong"));
    result.textContent = ""; result.className = "test-result";
    report.innerHTML = "";
    graded = false;
    actions.querySelector("#gradeBtn").disabled = false;
    startTestTimer(TEST_TIME_LIMIT_SEC, timerBox, grade);
  });

  startTestTimer(TEST_TIME_LIMIT_SEC, timerBox, grade);
}

/* ============================================================
   ПРОСМОТР PDF
   ============================================================ */
function openPdfModal(file, title){
  document.querySelectorAll(".pdf-overlay").forEach(x=>x.remove());
  const modal = el(`
    <div class="pdf-overlay">
      <div class="pdf-modal">
        <div class="pdf-head">
          <div class="pdf-title">${title}</div>
          <div class="pdf-actions">
            <a class="btn ghost" href="${file}" download>⬇ Скачать</a>
            <a class="btn ghost" href="${file}" target="_blank" rel="noopener">↗ В новой вкладке</a>
            <button class="btn" id="pdfClose">✕ Закрыть</button>
          </div>
        </div>
        <div class="pdf-body">
          <iframe src="${file}#view=FitH" title="${title}" loading="lazy"></iframe>
        </div>
      </div>
    </div>
  `);
  document.body.appendChild(modal);
  document.body.style.overflow = "hidden";
  modal.querySelector("#pdfClose").addEventListener("click", closePdf);
  modal.addEventListener("click", (e)=>{ if (e.target === modal) closePdf(); });
  function closePdf(){ modal.remove(); document.body.style.overflow = ""; }
}

/* ============================================================
   КОММЕНТАРИИ
   ============================================================ */
async function loadComments(){
  try {
    const res = await fetch(APPS_SCRIPT_URL + "?action=loadcomments");
    const data = await res.json();
    if (data && data.ok && Array.isArray(data.comments)) return data.comments;
  } catch (err){}
  return null;
}
async function saveComment(name, group, rating, text, avatar){
  const params = new URLSearchParams();
  params.append("action", "savecomment");
  params.append("name",   name);
  params.append("group",  group);
  params.append("rating", String(rating));
  params.append("text",   text);
  params.append("avatar", avatar || DEFAULT_AVATAR);
  try {
    const res = await fetch(APPS_SCRIPT_URL, { method:"POST", body: params });
    const data = await res.json();
    return data && data.ok;
  } catch (err){ return false; }
}
function renderCommentsBlock(){
  const block = el(`
    <section class="module comments-module">
      <div class="meta">Отзывы выпускников</div>
      <h2>Комментарии прошедших курс</h2>
      <p class="sub">Оставить отзыв может любой студент после прохождения курса.
        Комментарии старше 5 лет удаляются автоматически.</p>

      <form class="comment-form" id="commentForm">
        <div class="cf-row">
          <label>Оценка курса</label>
          <div class="star-rating" id="starRating">
            <input type="radio" name="rating" value="5" id="r5" checked><label for="r5">★</label>
            <input type="radio" name="rating" value="4" id="r4"><label for="r4">★</label>
            <input type="radio" name="rating" value="3" id="r3"><label for="r3">★</label>
            <input type="radio" name="rating" value="2" id="r2"><label for="r2">★</label>
            <input type="radio" name="rating" value="1" id="r1"><label for="r1">★</label>
          </div>
        </div>
        <textarea id="commentText" class="comment-text" maxlength="600"
          placeholder="Что помогло, что запомнилось, что стоит улучшить… (до 600 символов)"></textarea>
        <div class="cf-footer">
          <div class="cf-counter"><span id="commentCounter">0</span> / 600</div>
          <button type="submit" class="btn">Оставить отзыв</button>
        </div>
        <div class="comment-status" id="commentStatus"></div>
      </form>

      <div class="comments-list" id="commentsList">
        <div class="comment-empty">Загружаем отзывы…</div>
      </div>
    </section>
  `);

  const ta = block.querySelector("#commentText");
  const counter = block.querySelector("#commentCounter");
  ta.addEventListener("input", ()=>{ counter.textContent = ta.value.length; });

  block.querySelector("#commentForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const status = block.querySelector("#commentStatus");
    const text = ta.value.trim();
    if (text.length < 10){
      status.textContent = "Слишком короткий отзыв (мин. 10 символов).";
      status.className = "comment-status bad";
      return;
    }
    const rating = Number((block.querySelector('input[name="rating"]:checked') || {}).value || 5);
    status.textContent = "Отправляем…";
    status.className = "comment-status";

    const ok = await saveComment(
      state.student ? state.student.name  : "Гость",
      state.student ? state.student.group : "—",
      rating, text, getAvatar()
    );
    if (ok){
      status.textContent = "✔ Спасибо! Отзыв опубликован.";
      status.className = "comment-status ok";
      ta.value = ""; counter.textContent = "0";
      logActivity("comment", "Оставлен отзыв о курсе");
      await refreshComments(block.querySelector("#commentsList"));
    } else {
      status.textContent = "Не удалось отправить. Проверьте интернет.";
      status.className = "comment-status bad";
    }
  });

  setTimeout(()=>refreshComments(block.querySelector("#commentsList")), 50);
  return block;
}
async function refreshComments(container){
  const list = await loadComments();
  container.innerHTML = "";
  if (list === null){
    container.appendChild(el(`<div class="comment-empty">Не удалось загрузить отзывы. Проверьте интернет.</div>`));
    return;
  }
  if (list.length === 0){
    container.appendChild(el(`<div class="comment-empty">Пока нет отзывов. Будьте первым!</div>`));
    return;
  }
  list.forEach(c=>{
    const date    = new Date(c.date);
    const dateStr = date.toLocaleDateString("ru-RU", { day:"2-digit", month:"long", year:"numeric" });
    const r = Math.max(1, Math.min(5, c.rating));
    const stars = "★".repeat(r) + "☆".repeat(5 - r);
    const avatar = c.avatar || DEFAULT_AVATAR;
    container.appendChild(el(`
      <div class="comment-card">
        <div class="comment-head">
          <div class="comment-author">
            <span class="comment-avatar">${escapeHtml(avatar)}</span>
            <div class="comment-author-text">
              <span class="comment-name">${escapeHtml(c.name)}</span>
              <span class="comment-group">гр. ${escapeHtml(c.group)}</span>
            </div>
          </div>
          <div class="comment-meta">
            <span class="comment-stars">${stars}</span>
            <span class="comment-date">${dateStr}</span>
          </div>
        </div>
        <div class="comment-text-body">${escapeHtml(c.text)}</div>
      </div>
    `));
  });
}

/* ============================================================
   ОТЧЁТ
   ============================================================ */
function buildReport(){
  const now = new Date();
  const fmt = d => d.toLocaleString("ru-RU", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" });
  const s = state.student || { name: "—", group: "—" };

  let totalTopics = 0, topicsDone = 0;
  COURSE.sections.forEach(sec=>sec.topics.forEach(t=>{
    totalTopics++;
    if ((state.progress[t.id]?.done || 0) >= 5) topicsDone++;
  }));

  const lines = [];
  lines.push("ОТЧЁТ О ПРОХОЖДЕНИИ МДК 07.01");
  lines.push("Технология обработки деталей на станках с ПУ");
  lines.push("");
  lines.push("Студент: " + s.name);
  lines.push("Группа:  " + s.group);
  if (s.avatar) lines.push("Аватар:  " + s.avatar);
  lines.push("Дата:    " + fmt(now));
  lines.push("");
  lines.push("ОБЩИЙ ПРОГРЕСС");
  lines.push("Пройдено тем полностью: " + topicsDone + " из " + totalTopics);
  lines.push("");
  lines.push("ПРОГРЕСС ПО ТЕМАМ");
  COURSE.sections.forEach(sec=>{
    lines.push("— " + sec.code + ". " + sec.title);
    sec.topics.forEach(t=>{
      const p = state.progress[t.id];
      const done = p?.done || 0;
      const mark = done >= 5 ? "✓" : (done > 0 ? "…" : "·");
      lines.push("  " + mark + " " + t.code + " " + t.title + " — " + done + "/5 вкладок");
    });
  });
  lines.push("");

  const testKeys = Object.keys(state.results);
  lines.push("РЕЗУЛЬТАТЫ КОНТРОЛЬНЫХ ТЕСТОВ");
  if (!testKeys.length) lines.push("  (нет пройденных тестов)");
  else testKeys.forEach(id=>{
    const t = findTopic(id)?.topic;
    const r = state.results[id];
    lines.push("  " + (t ? t.code + " " + t.title : id) + " — " + r.ok + "/" + r.total + " (" + r.pct + "%), оценка " + r.grade + " — " + fmt(new Date(r.date)));
  });
  lines.push("");

  const selfKeys = Object.keys(state.selfResults);
  lines.push("РЕЗУЛЬТАТЫ САМОСТОЯТЕЛЬНЫХ РАБОТ");
  if (!selfKeys.length) lines.push("  (нет пройденных самостоятельных)");
  else selfKeys.forEach(id=>{
    const t = findTopic(id)?.topic;
    const r = state.selfResults[id];
    lines.push("  " + (t ? t.code + " " + t.title : id) + " — " + r.ok + "/" + r.total + " (" + r.pct + "%), оценка " + r.grade + " — " + fmt(new Date(r.date)));
  });

  lines.push("");
  lines.push("— Конец отчёта —");
  return lines.join("\n");
}

function openReportModal(){
  document.querySelectorAll(".report-overlay").forEach(x=>x.remove());
  setActiveTopBtn("report");
  const modal = el(`
    <div class="report-overlay">
      <div class="report-modal">
        <h2>Отправка отчёта</h2>
        <p class="report-sub">Проверьте данные ниже и нажмите «Отправить». Отчёт уйдёт на <b>${REPORT_EMAIL}</b>.</p>
        <pre></pre>
        <div class="report-actions">
          <button class="btn ghost" id="reportCancel">Отмена</button>
          <button class="btn" id="reportSend">Отправить</button>
        </div>
        <div class="report-status"></div>
      </div>
    </div>
  `);
  modal.querySelector("pre").textContent = buildReport();
  document.body.appendChild(modal);
  const close = ()=>{ modal.remove(); setActiveTopBtn(""); };
  modal.querySelector("#reportCancel").addEventListener("click", close);
  modal.addEventListener("click", (e)=>{ if (e.target === modal) close(); });

  modal.querySelector("#reportSend").addEventListener("click", async ()=>{
    const status = modal.querySelector(".report-status");
    const btn = modal.querySelector("#reportSend");
    btn.disabled = true;
    status.textContent = "Отправляем…";
    status.className = "report-status";
    const s = state.student || { name: "—", group: "—" };
    const params = new URLSearchParams();
    params.append("action",  "report");
    params.append("student", s.name);
    params.append("group",   s.group);
    params.append("avatar",  s.avatar || DEFAULT_AVATAR);
    params.append("report",  buildReport());
    try {
      await fetch(APPS_SCRIPT_URL, { method:"POST", body: params });
      status.textContent = "✔ Отчёт отправлен на camelia.2110@yandex.ru и anna.shirockix@gmail.com";
      status.className = "report-status ok";
      btn.textContent = "Отправлено";
      logActivity("report", "Отправлен отчёт преподавателю");
    } catch (err){
      const subject = encodeURIComponent("МДК 07.01 — отчёт " + s.name + " (гр. " + s.group + ")");
      const body    = encodeURIComponent(buildReport());
      const mailto  = "mailto:" + REPORT_EMAIL + "?subject=" + subject + "&body=" + body;
      status.innerHTML = "Не удалось отправить автоматически. " +
        '<a href="' + mailto + '" style="color:var(--accent);text-decoration:underline">Открыть письмо в почтовом клиенте →</a>';
      status.className = "report-status bad";
      btn.disabled = false;
    }
  });
}

/* ============================================================
   CSV-ЭКСПОРТ
   ============================================================ */
function exportResultsCsv(){
  const rows = [];
  rows.push(["Тип","Код","Название","Верных","Всего","Процент","Оценка","Дата"]);
  Object.keys(state.results).forEach(id=>{
    const t = findTopic(id)?.topic;
    const r = state.results[id];
    rows.push(["Тест", t?t.code:id, t?t.title:"", r.ok, r.total, r.pct, r.grade, new Date(r.date).toLocaleString("ru-RU")]);
  });
  Object.keys(state.selfResults).forEach(id=>{
    const t = findTopic(id)?.topic;
    const r = state.selfResults[id];
    rows.push(["Самостоятельная", t?t.code:id, t?t.title:"", r.ok, r.total, r.pct, r.grade, new Date(r.date).toLocaleString("ru-RU")]);
  });
  COURSE.sections.forEach(sec=>{
    sec.topics.forEach(t=>{
      const p = state.progress[t.id];
      const done = p?.done || 0;
      rows.push(["Прогресс", t.code, t.title, done, 5, Math.round(done/5*100), "", ""]);
    });
  });

  const csv = rows.map(r => r.map(cell => {
    const s = String(cell ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")){
      return '"' + s.replace(/"/g,'""') + '"';
    }
    return s;
  }).join(",")).join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type:"text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const s = state.student || { name:"student", group:"" };
  const safe = (s.name + "_" + s.group).replace(/[^\wа-яё\-]+/gi, "_");
  a.href = url;
  a.download = "mdk0701_" + safe + "_results.csv";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function computeStats(){
  let topicsTotal = 0, topicsDone = 0;
  let theoryTotal = 0, theoryDone = 0;
  let practiceTotal = 0, practiceDone = 0;
  COURSE.sections.forEach(sec=>sec.topics.forEach(t=>{
    topicsTotal++;
    const p = state.progress[t.id];
    if ((p?.done || 0) >= 5) topicsDone++;
    theoryTotal += 2; practiceTotal += 2;
    if (p?.tabs?.passport) theoryDone++;
    if (p?.tabs?.lecture)  theoryDone++;
    if (p?.tabs?.practice) practiceDone++;
    if (p?.tabs?.self)     practiceDone++;
  }));
  const testsTaken = Object.keys(state.results).length;
  const testsTotal = COURSE.sections.reduce((s,sec) => s + sec.topics.filter(t => t.test && t.test.length).length, 0);
  const selfTaken  = Object.keys(state.selfResults).length;
  const grades = [
    ...Object.values(state.results).map(r => r.grade),
    ...Object.values(state.selfResults).map(r => r.grade)
  ];
  const avgGrade = grades.length ? grades.reduce((a,b)=>a+b,0) / grades.length : 0;
  return { topicsTotal, topicsDone, theoryTotal, theoryDone, practiceTotal, practiceDone, testsTotal, testsTaken, selfTaken, avgGrade };
}

function svgPie(slices){
  const total = slices.reduce((s,x) => s + Math.max(0, x.value), 0);
  if (total <= 0){
    return `<svg viewBox="0 0 140 140" class="pie-svg"><circle cx="70" cy="70" r="60" fill="var(--border)"/></svg>`;
  }
  const R = 60, cx = 70, cy = 70, ir = 35;
  let acc = 0;
  const paths = slices.map(s=>{
    if (s.value <= 0) return "";
    const a0 = acc / total * Math.PI * 2 - Math.PI/2;
    acc += s.value;
    const a1 = acc / total * Math.PI * 2 - Math.PI/2;
    const large = (a1 - a0) > Math.PI ? 1 : 0;
    const x0o = cx + R*Math.cos(a0), y0o = cy + R*Math.sin(a0);
    const x1o = cx + R*Math.cos(a1), y1o = cy + R*Math.sin(a1);
    const x0i = cx + ir*Math.cos(a1), y0i = cy + ir*Math.sin(a1);
    const x1i = cx + ir*Math.cos(a0), y1i = cy + ir*Math.sin(a0);
    return `<path d="M${x0o} ${y0o} A${R} ${R} 0 ${large} 1 ${x1o} ${y1o} L${x0i} ${y0i} A${ir} ${ir} 0 ${large} 0 ${x1i} ${y1i} Z" fill="${s.color}"/>`;
  }).join("");
  return `<svg viewBox="0 0 140 140" class="pie-svg">${paths}</svg>`;
}

function activityByWeek(){
  const weeks = [];
  const now = new Date();
  const day = now.getDay() || 7;
  for (let i = 7; i >= 0; i--){
    const start = new Date(now);
    start.setDate(now.getDate() - i*7 - (day - 1));
    start.setHours(0,0,0,0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    weeks.push({ start, end, count: 0 });
  }
  (state.activity || []).forEach(a=>{
    const d = new Date(a.date);
    for (const w of weeks){
      if (d >= w.start && d < w.end){ w.count++; break; }
    }
  });
  return weeks;
}

function getHardestTopics(){
  const items = [];
  Object.keys(state.results).forEach(id=>{
    const t = findTopic(id)?.topic;
    if (!t) return;
    items.push({ code: t.code, title: t.title, avg: state.results[id].grade });
  });
  items.sort((a,b) => a.avg - b.avg);
  return items.slice(0, 3);
}

async function loadGroupStats(container){
  const params = new URLSearchParams();
  params.append("action", "groupstats");
  params.append("group", state.student.group);
  try {
    const res = await fetch(APPS_SCRIPT_URL + "?" + params.toString());
    const data = await res.json();
    if (data && data.ok && data.stats){
      container.innerHTML = "";
      const s = data.stats;
      if (s.rank || s.total){
        container.appendChild(el(`<div class="group-stat-row">
          <div class="gs-value">${s.rank || "—"}</div>
          <div class="gs-label">Ваше место в группе ${s.total ? "из " + s.total : ""}</div>
        </div>`));
      }
      if (s.avgGroup){
        const v = typeof s.avgGroup === "number" ? s.avgGroup.toFixed(2) : s.avgGroup;
        container.appendChild(el(`<div class="group-stat-row">
          <div class="gs-value">${v}</div>
          <div class="gs-label">Средний балл группы</div>
        </div>`));
      }
      if (s.avgTests && Array.isArray(s.avgTests)){
        s.avgTests.forEach(t=>{
          container.appendChild(el(`<div class="group-stat-row">
            <div class="gs-value">${t.avg ? t.avg.toFixed(1) : "—"}</div>
            <div class="gs-label">${escapeHtml(t.code || "")} ${escapeHtml(t.title || "")}</div>
          </div>`));
        });
      }
      return;
    }
  } catch (err){}
  container.innerHTML = "";
  container.appendChild(el(`<p class="sub">Данные группы пока недоступны. Преподаватель может включить эту функцию в Apps Script (действие <code>groupstats</code>).</p>`));
}

function renderDashboard(){
  const app = document.getElementById("app");
  app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Статистика";
  setActiveTopBtn("dashboard");

  app.appendChild(el(`<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>`));
  app.appendChild(el(`
    <section class="hero">
      <div class="meta">Аналитика</div>
      <h1>Мой прогресс</h1>
      <p>Здесь видно, что уже пройдено, что даётся сложнее, и как выглядит ваша динамика за последние недели.</p>
    </section>
  `));

  /* KPI */
  const stats = computeStats();
  const kpi = el(`<section class="module"><h2>Общие показатели</h2><div class="kpis"></div></section>`);
  const kgrid = kpi.querySelector(".kpis");
  kgrid.appendChild(el(`<div class="kpi"><div class="k-label">Пройдено тем</div><div class="k-value">${stats.topicsDone} / ${stats.topicsTotal}</div></div>`));
  kgrid.appendChild(el(`<div class="kpi"><div class="k-label">Средняя оценка</div><div class="k-value">${stats.avgGrade ? stats.avgGrade.toFixed(2) : "—"}</div></div>`));
  kgrid.appendChild(el(`<div class="kpi"><div class="k-label">Сдано тестов</div><div class="k-value">${stats.testsTaken} / ${stats.testsTotal}</div></div>`));
  kgrid.appendChild(el(`<div class="kpi"><div class="k-label">Сдано сам. работ</div><div class="k-value">${stats.selfTaken}</div></div>`));
  app.appendChild(kpi);

  /* Pie */
  const pieSection = el(`<section class="module"><h2>Структура прогресса</h2>
    <p class="sub">Сколько пройдено в каждой части курса.</p>
    <div class="pie-wrap"></div></section>`);
  const pw = pieSection.querySelector(".pie-wrap");
  const slices = [
    { value: stats.theoryDone,   color: "var(--accent)", label: `Теория (${stats.theoryDone}/${stats.theoryTotal})` },
    { value: stats.practiceDone, color: "var(--blue)",   label: `Практика (${stats.practiceDone}/${stats.practiceTotal})` },
    { value: stats.testsTaken,   color: "var(--ok)",     label: `Тесты (${stats.testsTaken}/${stats.testsTotal})` }
  ];
  pw.appendChild(el(`<div class="pie-chart">${svgPie(slices)}</div>`));
  const legend = el(`<div class="pie-legend"></div>`);
  slices.forEach(s=>{
    legend.appendChild(el(`<div class="legend-row"><span class="legend-dot" style="background:${s.color}"></span><span>${s.label}</span></div>`));
  });
  pw.appendChild(legend);
  app.appendChild(pieSection);

  /* Bar by weeks */
  const weeks = activityByWeek();
  const chartSection = el(`<section class="module"><h2>Активность по неделям</h2>
    <p class="sub">Количество действий за последние 8 недель.</p>
    <div class="week-chart"></div></section>`);
  const bars = chartSection.querySelector(".week-chart");
  const maxC = Math.max(1, ...weeks.map(w => w.count));
  weeks.forEach((w, i)=>{
    const h = Math.round(w.count / maxC * 100);
    bars.appendChild(el(`<div class="week-bar">
      <div class="wb-count">${w.count}</div>
      <div class="wb-bar" style="height:${h}%"></div>
      <div class="wb-label">${i === weeks.length - 1 ? "сейчас" : "−" + (weeks.length - i - 1) + "н"}</div>
    </div>`));
  });
  app.appendChild(chartSection);

  /* Top-3 difficult */
  const difficult = getHardestTopics();
  const dSection = el(`<section class="module"><h2>Самые сложные темы</h2>
    <p class="sub">Топ-3 темы по средней оценке теста (от меньшей к большей).</p>
    <div class="diff-list"></div></section>`);
  const dlist = dSection.querySelector(".diff-list");
  if (!difficult.length){
    dlist.appendChild(el(`<p class="sub">Пока недостаточно данных — пройдите хотя бы один тест.</p>`));
  } else {
    difficult.forEach((d, i)=>{
      dlist.appendChild(el(`<div class="diff-item">
        <span class="diff-num">${i+1}</span>
        <span class="diff-title">${d.code} · ${d.title}</span>
        <span class="diff-grade">Оценка: <b>${d.avg}</b></span>
      </div>`));
    });
  }
  app.appendChild(dSection);

  /* Group stats */
  const groupSection = el(`<section class="module"><h2>Сравнение с группой</h2>
    <p class="sub">Данные анонимны и обновляются автоматически.</p>
    <div id="groupStats"><p class="sub">Загружаем данные…</p></div></section>`);
  app.appendChild(groupSection);
  loadGroupStats(groupSection.querySelector("#groupStats"));

  /* Export buttons */
  const exportSection = el(`<section class="module">
    <h2>Экспорт результатов</h2>
    <p class="sub">Скачайте свой прогресс в удобном формате.</p>
    <div class="test-actions">
      <button class="btn" id="exportCsvBtn">⬇ Скачать CSV</button>
      <button class="btn ghost" id="exportJsonBtn">⬇ Скачать профиль (.json)</button>
    </div>
  </section>`);
  app.appendChild(exportSection);
  exportSection.querySelector("#exportCsvBtn").addEventListener("click", exportResultsCsv);
  exportSection.querySelector("#exportJsonBtn").addEventListener("click", exportProfile);

  /* Activity */
  const actSection = el(`<section class="module"><h2>Последние действия</h2>
    <div class="activity-list"></div></section>`);
  const alist = actSection.querySelector(".activity-list");
  const recent = (state.activity || []).slice(-10).reverse();
  if (!recent.length){
    alist.appendChild(el(`<p class="sub">Пока пусто.</p>`));
  } else {
    recent.forEach(a=>{
      alist.appendChild(el(`<div class="activity-item">
        <span class="act-icon">${activityIcon(a.type)}</span>
        <span class="act-text">${escapeHtml(a.text)}</span>
        <span class="act-date">${formatRelDate(a.date)}</span>
      </div>`));
    });
  }
  app.appendChild(actSection);
}

/* ============================================================
   ГЛОБАЛЬНЫЙ ПОИСК
   ============================================================ */
function makeSnippet(text, query){
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx < 0) return escapeHtml(text.slice(0, 120)) + "…";
  const start = Math.max(0, idx - 40);
  const end   = Math.min(text.length, idx + q.length + 60);
  const before = text.slice(start, idx);
  const match  = text.slice(idx, idx + q.length);
  const after  = text.slice(idx + q.length, end);
  return (start > 0 ? "…" : "") + escapeHtml(before) + "<mark>" + escapeHtml(match) + "</mark>" + escapeHtml(after) + (end < text.length ? "…" : "");
}

function searchCourse(query){
  query = (query || "").trim().toLowerCase();
  if (query.length < 2) return [];
  const out = [];
  COURSE.sections.forEach(sec=>{
    const secLabel = sec.code + " · " + sec.title;
    sec.topics.forEach(t=>{
      if ((t.title + " " + t.code).toLowerCase().includes(query)){
        out.push({ icon:"📚", title: t.code + " · " + t.title, topicId: t.id, tab:"passport", section: secLabel });
      }
      t.lectures.forEach(l=>{
        const text = stripHtml(l.content || "");
        if (l.title.toLowerCase().includes(query)){
          out.push({ icon:"📖", title: l.code + ". " + l.title, topicId: t.id, tab:"lecture", section: secLabel });
        } else if (text.toLowerCase().includes(query)){
          out.push({ icon:"📖", title: l.code + ". " + l.title, snippet: makeSnippet(text, query), topicId: t.id, tab:"lecture", section: secLabel });
        }
      });
      t.practicals.forEach(p=>{
        const hay = (p.code + " " + p.title + " " + (p.goal || "") + " " + (p.task || "")).toLowerCase();
        if (hay.includes(query)){
          out.push({ icon:"🛠️", title: p.code + ". " + p.title, topicId: t.id, tab:"practice", section: secLabel });
        }
      });
    });
  });
  return out.slice(0, 40);
}

function openSearch(){
  document.querySelectorAll(".search-overlay").forEach(x=>x.remove());
  const modal = el(`
    <div class="search-overlay">
      <div class="search-modal">
        <div class="search-head">
          <input type="text" id="searchInput" class="search-input" placeholder="Поиск по темам, лекциям, практикам… (Ctrl+K)" autocomplete="off">
          <button class="btn ghost" id="searchClose">Esc</button>
        </div>
        <div class="search-results" id="searchResults">
          <div class="search-hint">Начните вводить запрос — покажем до 40 совпадений.</div>
        </div>
      </div>
    </div>
  `);
  document.body.appendChild(modal);
  document.body.style.overflow = "hidden";

  const input   = modal.querySelector("#searchInput");
  const results = modal.querySelector("#searchResults");
  setTimeout(()=>input.focus(), 0);

  input.addEventListener("input", ()=>{
    const q = input.value.trim();
    results.innerHTML = "";
    if (q.length < 2){
      results.appendChild(el(`<div class="search-hint">Введите хотя бы 2 символа.</div>`));
      return;
    }
    const found = searchCourse(q);
    if (!found.length){
      results.appendChild(el(`<div class="search-hint">Ничего не найдено.</div>`));
      return;
    }
    found.forEach(r=>{
      const item = el(`<div class="search-item">
        <div class="search-item-title">${r.icon || "📄"} ${escapeHtml(r.title)}</div>
        ${r.snippet ? `<div class="search-item-snippet">${r.snippet}</div>` : ""}
        <div class="search-item-meta">${escapeHtml(r.section || "")}</div>
      </div>`);
      item.addEventListener("click", ()=>{
        closeSearch();
        location.hash = `#/topic/${r.topicId}/${r.tab}`;
      });
      results.appendChild(item);
    });
  });
  input.addEventListener("keydown", (e)=>{
    if (e.key === "Escape") closeSearch();
    if (e.key === "Enter"){
      const first = results.querySelector(".search-item");
      if (first) first.click();
    }
  });
  modal.addEventListener("click", (e)=>{ if (e.target === modal) closeSearch(); });
  modal.querySelector("#searchClose").addEventListener("click", closeSearch);
}
function closeSearch(){
  document.querySelectorAll(".search-overlay").forEach(x=>x.remove());
  document.body.style.overflow = "";
}
function closeAllModals(){
  document.querySelectorAll(".pdf-overlay, .report-overlay, .avatar-overlay, .search-overlay").forEach(x=>x.remove());
  document.querySelectorAll(".user-menu").forEach(x=>x.remove());
  if (!document.getElementById("loginOverlay").hidden){
    // оставляем экран входа
    return;
  }
  document.body.style.overflow = "";
}

/* ============================================================
   ГОРЯЧИЕ КЛАВИШИ
   ============================================================ */
function initHotkeys(){
  document.addEventListener("keydown", (e)=>{
    const tag = (document.activeElement?.tagName || "").toLowerCase();
    const inField = tag === "input" || tag === "textarea";

    /* Ctrl+K / Cmd+K — поиск */
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")){
      e.preventDefault();
      openSearch();
      return;
    }

    /* Esc — закрыть модалки */
    if (e.key === "Escape"){
      if (document.querySelector(".search-overlay, .pdf-overlay, .report-overlay, .avatar-overlay, .user-menu")){
        closeAllModals();
        return;
      }
    }

    /* ← / → — переключение вкладок темы (только не в полях) */
    if (inField) return;
    const hash = location.hash.replace(/^#/, "");
    const parts = hash.split("/").filter(Boolean);
    if (parts[0] === "topic" && parts[1]){
      const order = ["passport","lecture","practice","self","test"];
      const cur   = parts[2] || "passport";
      const idx   = order.indexOf(cur);
      if (e.key === "ArrowLeft" && idx > 0){
        location.hash = `#/topic/${parts[1]}/${order[idx-1]}`;
      } else if (e.key === "ArrowRight" && idx < order.length - 1){
        location.hash = `#/topic/${parts[1]}/${order[idx+1]}`;
      }
    }
  });
}

/* ============================================================
   ВЕРХНЕЕ МЕНЮ
   ============================================================ */
function initComments(){
  const btn = document.getElementById("commentsBtn");
  if (btn) btn.addEventListener("click", ()=>{ location.hash = "#/comments"; });
}
function initDashboard(){
  const btn = document.getElementById("dashboardBtn");
  if (btn) btn.addEventListener("click", ()=>{ location.hash = "#/dashboard"; });
}
function initSearchBtn(){
  const btn = document.getElementById("searchBtn");
  if (btn) btn.addEventListener("click", openSearch);
}
function initReport(){
  const btn = document.getElementById("reportBtn");
  if (btn) btn.addEventListener("click", openReportModal);
}
function setActiveTopBtn(which){
  const ids = { comments:"commentsBtn", dashboard:"dashboardBtn", report:"reportBtn" };
  Object.keys(ids).forEach(k=>{
    const el_ = document.getElementById(ids[k]);
    if (el_) el_.classList.toggle("active", which === k);
  });
}

/* ============================================================
   ROUTER
   ============================================================ */
function goHome(e){ if (e) e.preventDefault(); location.hash = "#/"; }

function route(){
  clearTestTimer();
  closeAllModals();
  if (!state.student){
    document.getElementById("app").innerHTML = "";
    return;
  }
  const hash  = location.hash.replace(/^#/, "") || "/";
  const parts = hash.split("/").filter(Boolean);

  if (parts[0] === "comments"){
    renderCommentsPage();
  } else if (parts[0] === "dashboard"){
    renderDashboard();
  } else if (parts[0] === "topic" && parts[1]){
    renderTopic(parts[1], parts[2] || "passport", parts[3] || "");
  } else {
    renderHome();
  }
  window.scrollTo(0,0);
}

window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", ()=>{
  initTheme();
  initNav();
  initAuth();
  initReport();
  initComments();
  initDashboard();
  initSearchBtn();
  initHotkeys();
  renderUserChip();
  route();
});