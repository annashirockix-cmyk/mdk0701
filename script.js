/* ============================================================
   МДК 07.01 — Ядро (script.js)
   Авторизация студента, темы оформления, аватары, прогресс,
   облачная синхронизация, темы, тесты, отчёты, PDF, роутер.
   ============================================================ */

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzB0v37m5pC0jSnEmCEllIlN3IlRmgOhaPEW9giHbS6wNIYFHClxJv8Z5HyG4-AJBpdaQ/exec";

const DEFAULT_AVATAR      = "👨‍🎓";
const ACTIVITY_MAX        = 100;
const ONLINE_TIMEOUT_SEC  = 90;
const TEST_TIME_LIMIT_SEC = 15 * 60;

const AVATARS = [
  "👨‍🎓","👩‍🎓","🧑‍🎓","👨‍🔧","👩‍🔧","🧑‍🔧",
  "👷","👨‍🏭","👩‍🏭","🧑‍🏭","🦾","🤖",
  "⚙️","🔧","🛠️","🔩","🧰","📐",
  "📏","✈️","🚀","🛰️","⚡","🔥",
  "💡","🎓","🏆","🎯","🧠","🧑‍💻"
];

const THEMES = [
  { id:"light",    name:"Светлая",  colors:["#f5f2ec","#ffffff","#c14a2a","#4a4a4a"] },
  { id:"dark",     name:"Тёмная",   colors:["#0e0e10","#171719","#ff6b3d","#c8c5bd"] },
  { id:"sepia",    name:"Сепия",    colors:["#f4ecd8","#fbf5e6","#a0522d","#5c4a32"] },
  { id:"ocean",    name:"Океан",    colors:["#eef4f8","#ffffff","#1a6da8","#3c5361"] },
  { id:"forest",   name:"Лес",      colors:["#eef3ec","#ffffff","#3d7a3d","#3f5238"] },
  { id:"contrast", name:"Контраст", colors:["#ffffff","#f5f5f5","#0033cc","#000000"] }
];

const GOSTS = [
  { code:"ГОСТ 18097-93",     url:"https://docs.cntd.ru/document/901852946", title:"Станки токарные. Нормы точности" },
  { code:"ГОСТ 8-82",         url:"https://docs.cntd.ru/document/1200007574", title:"Станки металлорежущие. Нормы точности" },
  { code:"ГОСТ 8593-81",      url:"https://docs.cntd.ru/document/1200012830", title:"Конусы и конические соединения" },
  { code:"ГОСТ 20999-83",     url:"https://docs.cntd.ru/document/1200005144", title:"Устройства ЧПУ. Коды" },
  { code:"ГОСТ 2.105-2019",   url:"https://docs.cntd.ru/document/1200166805", title:"ЕСКД. Общие требования к текстовым документам" },
  { code:"ГОСТ 12.0.003-2015",url:"https://docs.cntd.ru/document/1200136071", title:"Классификация опасных и вредных факторов" }
];

const QUOTES = [
  "Точность — вежливость королей.",
  "Семь раз отмерь — один раз отрежь.",
  "Практика без теории слепа, теория без практики мертва.",
  "Станок не прощает спешки.",
  "Стружка — это металл, который вы потеряли.",
  "Качество не бывает случайным.",
  "Ошибка в кадре стоит часа работы.",
  "Знание G-кода открывает любые станки."
];

const state = {
  student: JSON.parse(localStorage.getItem("mdk0701.student") || "null"),
  progress: {},
  results: {},
  selfResults: {},
  activity: [],
  lastSync: ""
};

/* ---------- Утилиты ---------- */
function studentKey(s){
  s = s || state.student;
  if (!s || !s.name || !s.group) return null;
  return (s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase());
}
function getAvatar(){
  return (state.student && state.student.avatar) || DEFAULT_AVATAR;
}
function el(html){
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstChild;
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function stripHtml(h){
  const d = document.createElement("div");
  d.innerHTML = h || "";
  return d.textContent || "";
}
function findTopic(id){
  if (!window.COURSE || !COURSE.sections) return null;
  for (const s of COURSE.sections){
    if (!s.topics) continue;
    for (const t of s.topics) if (t.id === id) return { section: s, topic: t };
  }
  return null;
}
function shuffled(a){
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}
function quoteOfDay(){
  return QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length];
}
function fmtDate(d){
  return new Date(d).toLocaleString("ru-RU", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" });
}
function fmtRel(iso){
  const d = new Date(iso), diff = (Date.now() - d) / 1000;
  if (diff < 60) return "только что";
  if (diff < 3600) return Math.floor(diff/60) + " мин назад";
  if (diff < 86400) return Math.floor(diff/3600) + " ч назад";
  if (diff < 86400 * 7) return Math.floor(diff/86400) + " дн назад";
  return d.toLocaleDateString("ru-RU");
}

/* ---------- Локальное хранилище ---------- */
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
  const k = studentKey(); if (!k) return;
  const ek = encodeURIComponent(k);
  localStorage.setItem("mdk0701.progress."    + ek, JSON.stringify(state.progress));
  localStorage.setItem("mdk0701.results."     + ek, JSON.stringify(state.results));
  localStorage.setItem("mdk0701.selfResults." + ek, JSON.stringify(state.selfResults));
  localStorage.setItem("mdk0701.activity."    + ek, JSON.stringify(state.activity));
  if (state.lastSync) localStorage.setItem("mdk0701.lastSync." + ek, state.lastSync);
}
function saveStudent(){
  localStorage.setItem("mdk0701.student", JSON.stringify(state.student));
}
function saveProgress(){ saveStudentData(); scheduleCloudSave(); }
function saveResults(){ saveStudentData(); scheduleCloudSave(); }
function saveSelfResults(){ saveStudentData(); scheduleCloudSave(); }

/* ---------- Журнал действий ---------- */
function logActivity(type, text){
  state.activity = state.activity || [];
  state.activity.push({ type, text, date: new Date().toISOString() });
  if (state.activity.length > ACTIVITY_MAX) state.activity = state.activity.slice(-ACTIVITY_MAX);
  saveStudentData();
}
function activityIcon(type){
  return ({
    login:"🚪", topic:"📖", test:"🎯", self:"✍️", comment:"💬",
    avatar:"🎨", report:"📧", chat:"💭", question:"❓", upload:"📎"
  })[type] || "•";
}

/* ---------- Облако ---------- */
let cloudTimer = null;
let cloudBusy = false;
function scheduleCloudSave(){
  if (cloudTimer) clearTimeout(cloudTimer);
  cloudTimer = setTimeout(() => cloudSave(true), 3000);
}
async function cloudSave(silent){
  if (!state.student || cloudBusy || !APPS_SCRIPT_URL) return false;
  if (!navigator.onLine) return false;
  cloudBusy = true;
  if (!silent) setSyncStatus("Отправляем…");

  const params = new URLSearchParams();
  params.append("action", "save");
  params.append("key",    studentKey());
  params.append("name",   state.student.name);
  params.append("group",  state.student.group);
  params.append("payload", JSON.stringify({
    avatar: state.student.avatar || DEFAULT_AVATAR,
    progress: state.progress,
    results: state.results,
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
    if (!silent) setSyncStatus("Нет связи");
  }
  cloudBusy = false;
  return false;
}
async function cloudLoad(){
  if (!state.student || !APPS_SCRIPT_URL) return null;
  const params = new URLSearchParams();
  params.append("action", "load");
  params.append("key",    studentKey());
  try {
    const res  = await fetch(APPS_SCRIPT_URL + "?" + params.toString());
    const data = await res.json();
    if (data && data.ok && data.payload){
      return { payload: JSON.parse(data.payload), savedAt: data.savedAt || "" };
    }
  } catch (err){}
  return null;
}
function setSyncStatus(text){
  const node = document.getElementById("syncStatus");
  if (!node) return;
  node.textContent = text;
  node.className = "sync-status";
  setTimeout(() => { if (node.textContent === text) node.textContent = ""; }, 3000);
}
function applyCloudPayload(p){
  state.progress    = p.progress    || {};
  state.results     = p.results     || {};
  state.selfResults = p.selfResults || {};
}

/* ---------- Валидация ---------- */
function normalizeName(v){
  return v.trim().split(/\s+/).map(p => p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : "").filter(Boolean).slice(0, 3).join(" ");
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

/* ---------- Тема оформления ---------- */
function applyTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("mdk0701.theme", theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta){
    const map = { light:"#c14a2a", dark:"#0e0e10", sepia:"#a0522d", ocean:"#1a6da8", forest:"#3d7a3d", contrast:"#0033cc" };
    meta.setAttribute("content", map[theme] || "#c14a2a");
  }
}
function initTheme(){
  const saved = localStorage.getItem("mdk0701.theme");
  if (saved && THEMES.some(t => t.id === saved)) applyTheme(saved);
  const btn = document.getElementById("themeToggle");
  if (btn) btn.addEventListener("click", openThemeModal);
}
function openThemeModal(){
  document.querySelectorAll(".theme-overlay").forEach(x => x.remove());
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const modal = el(`<div class="theme-overlay">
    <div class="theme-modal">
      <h3>Цветовая тема</h3>
      <p class="theme-sub">Выберите оформление — оно сохранится на этом устройстве.</p>
      <div class="theme-grid"></div>
      <div class="theme-actions">
        <button class="btn ghost" id="themeClose">Закрыть</button>
      </div>
    </div>
  </div>`);
  const grid = modal.querySelector(".theme-grid");
  THEMES.forEach(t => {
    const card = el(`<button type="button" class="theme-card ${t.id===current?"selected":""}">
      <div class="theme-preview">
        <span style="background:${t.colors[0]}"></span>
        <span style="background:${t.colors[1]}"></span>
        <span style="background:${t.colors[2]}"></span>
        <span style="background:${t.colors[3]}"></span>
      </div>
      <div class="theme-name"><span>${t.name}</span><span class="check">✓</span></div>
    </button>`);
    card.addEventListener("click", () => {
      grid.querySelectorAll(".theme-card").forEach(x => x.classList.remove("selected"));
      card.classList.add("selected");
      applyTheme(t.id);
    });
    grid.appendChild(card);
  });
  document.body.appendChild(modal);
  modal.querySelector("#themeClose").addEventListener("click", () => modal.remove());
  modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
  const onEsc = e => { if (e.key === "Escape"){ modal.remove(); document.removeEventListener("keydown", onEsc); } };
  document.addEventListener("keydown", onEsc);
}

/* ---------- Аватары ---------- */
function buildAvatarPicker(selected, onPick){
  const wrap = el(`<div class="avatar-picker-inline"></div>`);
  AVATARS.forEach(a => {
    const b = el(`<button type="button" class="avatar-option ${a===selected?"selected":""}">${a}</button>`);
    b.addEventListener("click", () => {
      wrap.querySelectorAll(".avatar-option").forEach(x => x.classList.remove("selected"));
      b.classList.add("selected");
      if (onPick) onPick(a);
    });
    wrap.appendChild(b);
  });
  return wrap;
}
function openAvatarModal(){
  if (!state.student) return;
  document.querySelectorAll(".avatar-overlay").forEach(x => x.remove());
  let picked = getAvatar();
  const modal = el(`<div class="avatar-overlay">
    <div class="avatar-modal">
      <h3>Выберите аватар</h3>
      <p class="avatar-sub">Отображается в шапке и рядом с вашими отзывами.</p>
      <div class="avatar-grid"></div>
      <div class="avatar-modal-actions">
        <button class="btn ghost" id="avatarCancel">Отмена</button>
        <button class="btn" id="avatarSave">Сохранить</button>
      </div>
    </div>
  </div>`);
  const grid = modal.querySelector(".avatar-grid");
  AVATARS.forEach(a => {
    const b = el(`<button type="button" class="avatar-option ${a===picked?"selected":""}">${a}</button>`);
    b.addEventListener("click", () => {
      grid.querySelectorAll(".avatar-option").forEach(x => x.classList.remove("selected"));
      b.classList.add("selected");
      picked = a;
    });
    grid.appendChild(b);
  });
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector("#avatarCancel").addEventListener("click", close);
  modal.addEventListener("click", e => { if (e.target === modal) close(); });
  modal.querySelector("#avatarSave").addEventListener("click", () => {
    state.student.avatar = picked;
    saveStudent(); saveStudentData();
    renderUserChip();
    logActivity("avatar", "Сменил аватар");
    cloudSave(true);
    close();
  });
}

/* ---------- Вход студента ---------- */
function initAuth(){
  const overlay    = document.getElementById("loginOverlay");
  const nameInput  = document.getElementById("loginName");
  const groupInput = document.getElementById("loginGroup");
  const nameHint   = document.getElementById("nameHint");
  const groupHint  = document.getElementById("groupHint");
  const btn        = document.getElementById("loginBtn");

  let loginAvatar = DEFAULT_AVATAR;
  const picker = document.getElementById("loginAvatarPicker");
  if (picker) picker.appendChild(buildAvatarPicker(loginAvatar, a => { loginAvatar = a; }));

  if (!state.student){
    if (overlay){ overlay.hidden = false; document.body.style.overflow = "hidden"; }
    if (nameInput) nameInput.focus();
  } else {
    loadStudentData();
    if (overlay) overlay.hidden = true;
    document.body.style.overflow = "";
  }

  if (nameInput) nameInput.addEventListener("input", () => {
    const r = validateName(nameInput.value);
    nameHint.textContent = !nameInput.value.trim() ? "" : (r.ok ? "✔ " + r.msg : "✘ " + r.msg);
    nameHint.className = "field-hint " + (r.ok ? "ok" : "bad");
  });
  if (groupInput) groupInput.addEventListener("input", () => {
    const r = validateGroup(groupInput.value);
    groupHint.textContent = !groupInput.value.trim() ? "" : (r.ok ? "✔ ОК" : "✘ " + r.msg);
    groupHint.className = "field-hint " + (r.ok ? "ok" : "bad");
  });

  if (btn) btn.addEventListener("click", async () => {
    const rn = validateName(nameInput.value);
    const rg = validateGroup(groupInput.value);
    if (!rn.ok){ nameInput.focus(); return; }
    if (!rg.ok){ groupInput.focus(); return; }
    if (state.student) saveStudentData();

    state.student = {
      name: rn.normalized,
      group: rg.normalized,
      avatar: loginAvatar,
      loginAt: new Date().toISOString()
    };
    saveStudent();
    loadStudentData();

    if (overlay) overlay.hidden = true;
    document.body.style.overflow = "";
    renderUserChip();

    const cloud = await cloudLoad();
    if (cloud && cloud.savedAt && cloud.savedAt > (state.lastSync || "")){
      if (cloud.payload.avatar){ state.student.avatar = cloud.payload.avatar; saveStudent(); renderUserChip(); }
      applyCloudPayload(cloud.payload);
      state.lastSync = cloud.savedAt;
      saveStudentData();
    }

    logActivity("login", "Вход в систему");
    route();
  });

  [nameInput, groupInput].forEach(inp => {
    if (!inp) return;
    inp.addEventListener("keydown", e => { if (e.key === "Enter") btn.click(); });
  });

  const chip = document.getElementById("userChip");
  if (chip) chip.addEventListener("click", openUserMenu);
}

function renderUserChip(){
  const chip = document.getElementById("userChip");
  if (!chip || !state.student) return;
  chip.hidden = false;
  const a = document.getElementById("userChipAvatar");
  const n = document.getElementById("userChipName");
  const g = document.getElementById("userChipGroup");
  if (a) a.textContent = getAvatar();
  if (n) n.textContent = state.student.name;
  if (g) g.textContent = "Гр. " + state.student.group;
}

function openUserMenu(){
  document.querySelectorAll(".user-menu, .more-menu").forEach(m => m.remove());
  const chip = document.getElementById("userChip");
  const rect = chip.getBoundingClientRect();
  const menu = el(`<div class="user-menu">
    <div class="user-menu-head">
      <span class="user-menu-avatar">${getAvatar()}</span>
      <div class="user-menu-headtext">
        <div class="user-menu-name">${escapeHtml(state.student.name)}</div>
        <div class="user-menu-group">Группа ${escapeHtml(state.student.group)}</div>
      </div>
    </div>
    <button class="user-menu-item" data-act="avatar">🎨 Сменить аватар</button>
    <button class="user-menu-item" data-act="theme">🌈 Сменить тему</button>
    <button class="user-menu-item" data-act="dashboard">📊 Статистика</button>
    <button class="user-menu-item" data-act="sync">☁ Синхронизировать</button>
    <button class="user-menu-item" data-act="staff">👤 Служебный вход</button>
    <button class="user-menu-item" data-act="switch">🔄 Сменить пользователя</button>
    <button class="user-menu-item danger" data-act="clear">🗑 Очистить прогресс</button>
  </div>`);
  document.body.appendChild(menu);
  menu.style.position = "fixed";
  menu.style.top = (rect.bottom + 8) + "px";
  menu.style.right = Math.max(8, window.innerWidth - rect.right) + "px";

  const close = e => {
    if (!menu.contains(e.target) && e.target !== chip){
      menu.remove();
      document.removeEventListener("click", close);
    }
  };
  setTimeout(() => document.addEventListener("click", close), 0);

  menu.querySelector('[data-act="avatar"]').addEventListener("click", () => { menu.remove(); openAvatarModal(); });
  menu.querySelector('[data-act="theme"]').addEventListener("click", () => { menu.remove(); openThemeModal(); });
  menu.querySelector('[data-act="dashboard"]').addEventListener("click", () => { menu.remove(); location.hash = "#/dashboard"; });
  menu.querySelector('[data-act="staff"]').addEventListener("click", () => { menu.remove(); location.hash = "#/staff"; });
  menu.querySelector('[data-act="sync"]').addEventListener("click", async () => {
    menu.remove();
    if (await cloudSave(false)) alert("Прогресс отправлен в облако.");
  });
  menu.querySelector('[data-act="switch"]').addEventListener("click", () => {
    menu.remove();
    if (!confirm("Сменить пользователя? Прогресс сохранён локально.")) return;
    saveStudentData();
    state.student = null;
    state.progress = {}; state.results = {}; state.selfResults = {}; state.activity = [];
    saveStudent();
    const ov = document.getElementById("loginOverlay");
    if (ov) ov.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("loginName").value = "";
    document.getElementById("loginGroup").value = "";
    document.getElementById("userChip").hidden = true;
  });
  menu.querySelector('[data-act="clear"]').addEventListener("click", () => {
    menu.remove();
    if (!confirm("Очистить ВЕСЬ прогресс?")) return;
    state.progress = {}; state.results = {}; state.selfResults = {};
    saveStudentData(); route(); cloudSave(true);
  });
}

/* ---------- Главная ---------- */
function renderHome(){
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = "";
  const crumbs = document.getElementById("crumbs");
  if (crumbs) crumbs.textContent = "";
  setActiveTopBtn("");

  app.appendChild(el(`<section class="hero">
    <div class="meta">${COURSE.specialty} · набор 2024</div>
    <h1>${COURSE.title}</h1>
    <p>${COURSE.module}</p>
    ${state.student ? `<div class="hello">
      <span class="hello-avatar">${getAvatar()}</span>
      <span>Вы вошли как <b>${escapeHtml(state.student.name)}</b>, группа <b>${escapeHtml(state.student.group)}</b>.
      <span class="sync-status" id="syncStatus"></span></span>
    </div>` : ""}
    <div class="hero-quote">${quoteOfDay()}</div>
  </section>`));

  app.appendChild(el(`<div class="steps-title">Как устроена тема</div>`));
  const stepsWrap = el(`<div class="steps"></div>`);
  [["01","Паспорт часов"],["02","Лекция"],["03","Практические"],["04","Самостоятельная"],["05","Контроль темы"]]
    .forEach(([n, name]) => stepsWrap.appendChild(el(`<div class="step"><div class="num">${n}</div><div class="name">${name}</div></div>`)));
  app.appendChild(stepsWrap);

  if (COURSE.sections && COURSE.sections.length){
    COURSE.sections.forEach(sec => {
      app.appendChild(el(`<div class="steps-title">${sec.code} · ${sec.title} · ${sec.hours} ак. ч</div>`));
      const list = el(`<div class="topics"></div>`);
      if (sec.topics){
        sec.topics.forEach(t => {
          const done = state.progress[t.id]?.done || 0;
          const card = el(`<div class="topic">
            <div class="t-code">${t.code}</div>
            <div class="t-body">
              <div class="t-title">${t.title}</div>
              <div class="t-meta">${t.hours.total} ак. ч / практ. ${t.hours.practice} ак. ч</div>
            </div>
            <div class="t-hours">${t.hours.total}\\${t.hours.practice}</div>
            <div class="t-progress">${done}/5</div>
          </div>`);
          card.addEventListener("click", () => location.hash = "#/topic/" + t.id);
          list.appendChild(card);
        });
      }
      app.appendChild(list);
    });
  }

  if (COURSE.passports && COURSE.passports.length){
    app.appendChild(el(`<div class="steps-title">Паспорта станков</div>`));
    const block = el(`<section class="module">
      <h2>Паспорта станков</h2>
      <p class="sub">PDF-файлы. Открываются прямо на странице.</p>
      <div class="doc-grid"></div>
    </section>`);
    const grid = block.querySelector(".doc-grid");
    COURSE.passports.forEach(p => {
      const c = el(`<div class="doc-card" role="button" tabindex="0">
        <div class="doc-code">${p.code}</div>
        <div class="doc-title">${p.title}</div>
        <div class="doc-summary">${p.summary}</div>
        <div class="doc-action">Открыть PDF →</div>
      </div>`);
      c.addEventListener("click", () => openPdfModal(p.file, p.title));
      grid.appendChild(c);
    });
    app.appendChild(block);
  }

  if (COURSE.safety && COURSE.safety.length){
    app.appendChild(el(`<div class="steps-title">Охрана труда</div>`));
    const block = el(`<section class="module">
      <h2>Инструкции по охране труда</h2>
      <p class="sub">DOCX-файлы. Скачиваются на компьютер.</p>
      <div class="doc-grid"></div>
    </section>`);
    const grid = block.querySelector(".doc-grid");
    COURSE.safety.forEach(s => grid.appendChild(el(`<a class="doc-card" href="${s.file}" download>
      <div class="doc-code">${s.code}</div>
      <div class="doc-title">${s.title}</div>
      <div class="doc-summary">${s.summary}</div>
      <div class="doc-action">Скачать .docx →</div>
    </a>`)));
    app.appendChild(block);
  }

  if (window.renderCommentsBlock) app.appendChild(window.renderCommentsBlock());
}

/* ---------- Страница темы ---------- */
function renderTopic(id, tab, mode){
  tab = tab || "passport";
  mode = mode || "control";
  const found = findTopic(id);
  if (!found) return renderHome();
  const { section, topic } = found;
  const app = document.getElementById("app");
  app.innerHTML = "";
  const crumbs = document.getElementById("crumbs");
  if (crumbs) crumbs.textContent = topic.code + " · " + topic.title;
  setActiveTopBtn("");

  app.appendChild(el(`<a class="backlink" href="#/" onclick="goHome(event)">← К программе</a>
    <section class="topic-head">
      <div class="crumb">ПМ.07 · ${topic.code} · ${section.title}</div>
      <h1>${topic.title}</h1>
      <div class="meta">${topic.hours.total}\\${topic.hours.practice} · ${topic.hours.total} ак. ч / практ. ${topic.hours.practice} ак. ч</div>
    </section>`));

  const tabs = [
    ["passport","01","Паспорт часов"],
    ["lecture","02","Лекция"],
    ["practice","03","Практические"],
    ["self","04","Самостоятельная"],
    ["test","05","Контроль темы"]
  ];
  const tw = el(`<div class="tabs"></div>`);
  tabs.forEach(([k, n, name]) => {
    const t = el(`<button class="tab ${k===tab?"active":""}">
      <span class="t-num">${n}</span><span class="t-name">${name}</span>
    </button>`);
    t.addEventListener("click", () => { location.hash = `#/topic/${id}/${k}`; });
    tw.appendChild(t);
  });
  app.appendChild(tw);

  const panel = el(`<section class="panel"></section>`);
  app.appendChild(panel);

  if (tab === "passport") renderPassport(panel, topic);
  if (tab === "lecture")  renderLecture(panel, topic);
  if (tab === "practice") renderPractice(panel, topic);
  if (tab === "self")     renderSelf(panel, topic);
  if (tab === "test")     renderTest(panel, topic, mode);

  markDone(topic.id, tab);
}

function markDone(topicId, tab){
  state.progress[topicId] = state.progress[topicId] || { done:0, tabs:{} };
  if (!state.progress[topicId].tabs[tab]){
    const before = state.progress[topicId].done || 0;
    state.progress[topicId].tabs[tab] = true;
    const after = Object.keys(state.progress[topicId].tabs).length;
    state.progress[topicId].done = after;
    saveProgress();
    const t = findTopic(topicId)?.topic;
    if (before === 0 && t) logActivity("topic", `Начата тема ${t.code}`);
    if (after === 5 && before < 5 && t) logActivity("topic", `Пройдена тема ${t.code}`);
  }
}

function renderPassport(panel, t){
  panel.innerHTML = `
    <h2>Паспорт часов</h2>
    <p>Тема <b>${t.code}</b> — ${t.title}.</p>
    <div class="kpi-row">
      <div class="kpi"><div class="k-label">Всего</div><div class="k-value">${t.hours.total} ч</div></div>
      <div class="kpi"><div class="k-label">Теория</div><div class="k-value">${t.hours.theory} ч</div></div>
      <div class="kpi"><div class="k-label">Практика</div><div class="k-value">${t.hours.practice} ч</div></div>
    </div>
    <h3>Содержание по рабочей программе</h3>
    <ul>${(t.lectures||[]).map(l => `<li><b>${l.code}</b> ${l.title}</li>`).join("")}</ul>
    <h3>Практические занятия</h3>
    <ul>${(t.practicals||[]).map(p => `<li><b>${p.code}</b> ${p.title}</li>`).join("")}</ul>
  `;
}
function renderLecture(panel, t){
  panel.innerHTML = `<h2>Лекция</h2><p class="accent">Теория, схема, вопросы для самопроверки.</p>`;
  (t.lectures || []).forEach(l => {
    panel.appendChild(el(`<h3>${l.code}. ${l.title}</h3>`));
    panel.appendChild(el(`<div>${l.content || "<p><i>Материал готовится.</i></p>"}</div>`));
  });
}
function renderPractice(panel, t){
  panel.innerHTML = `<h2>Практические работы</h2><p class="accent">${t.hours.practice} ч практической подготовки.</p>`;
  (t.practicals || []).forEach(p => {
    const box = el(`<div class="practice">
      <div class="p-code">${p.code}</div>
      <div class="p-title">${p.title}</div>
      ${p.goal ? `<div class="p-goal">Цель: ${p.goal}</div>` : ""}
      ${p.task ? `<div class="p-task"><b>Задание:</b> ${p.task}</div>` : ""}
      ${p.example ? `<div class="p-example"><b>Пример выполнения:</b> ${p.example}</div>` : ""}
      ${p.solution && p.solution.length ? `<div class="p-solution"><h4>Ход решения по этапам</h4>
        <ol>${p.solution.map(s => `<li>${s}</li>`).join("")}</ol></div>` : ""}
      <div class="test-actions">
        <button class="btn ghost work-upload-btn">📎 Прикрепить работу</button>
        <button class="btn ghost gcode-btn">👨‍💻 G-code просмотрщик</button>
      </div>
    </div>`);
    box.querySelector(".work-upload-btn").addEventListener("click", () => window.openUploadModal && window.openUploadModal(t.id, p.code, p.title));
    box.querySelector(".gcode-btn").addEventListener("click", () => window.openGCodeModal && window.openGCodeModal(p.code));
    if (p.variants && p.variants.rows && p.variants.rows.length){
      const v = el(`<div class="variants">
        <div class="v-title">Варианты (1–${p.variants.rows.length})</div>
        <div class="v-scroll"></div>
      </div>`);
      const tbl = el(`<table class="v-table"></table>`);
      if (p.variants.header){
        const th = el(`<thead><tr></tr></thead>`);
        p.variants.header.forEach(h => th.firstChild.appendChild(el(`<th>${h}</th>`)));
        tbl.appendChild(th);
      }
      const tb = el(`<tbody></tbody>`);
      p.variants.rows.forEach(row => {
        const tr = el(`<tr></tr>`);
        row.forEach(c => tr.appendChild(el(`<td>${c}</td>`)));
        tb.appendChild(tr);
      });
      tbl.appendChild(tb);
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
    <p class="accent">Введите ответ. Регистр и лишние пробелы не важны.</p>
  `;
  const tasks = (t.selfChecks && t.selfChecks.length)
    ? t.selfChecks
    : [{ q:"Как называется главное движение при точении?", a:"вращение заготовки", accept:["вращение детали"] }];

  const form = el(`<form></form>`);
  tasks.forEach((task, i) => {
    const block = el(`<div class="question self-q">
      <div class="q-text">${i+1}. ${task.q}</div>
      <div class="self-row">
        <input type="text" class="self-input" placeholder="Ваш ответ">
        <button type="button" class="btn ghost self-check">Проверить</button>
      </div>
      <div class="self-feedback"></div>
    </div>`);
    const inp = block.querySelector(".self-input");
    const btn = block.querySelector(".self-check");
    const fb  = block.querySelector(".self-feedback");
    btn.addEventListener("click", () => {
      const ua = (inp.value || "").trim().toLowerCase();
      const correct = task.a.trim().toLowerCase();
      const accepted = Array.isArray(task.accept) ? task.accept.map(x => x.trim().toLowerCase()) : [];
      const ok = ua === correct || accepted.includes(ua);
      fb.textContent = ok ? "✔ Верно" : ("✘ Неверно. Правильный ответ: " + task.a);
      fb.className = "self-feedback " + (ok ? "ok" : "bad");
    });
    inp.addEventListener("keydown", e => { if (e.key === "Enter"){ e.preventDefault(); btn.click(); } });
    form.appendChild(block);
  });
  const result = el(`<div class="test-result"></div>`);
  const actions = el(`<div class="test-actions">
    <button type="button" class="btn" id="selfCount">Подвести итог</button>
    <button type="button" class="btn ghost" id="selfReset">Сбросить</button>
  </div>`);
  form.appendChild(actions);
  form.appendChild(result);
  form.querySelector("#selfCount").addEventListener("click", () => {
    let ok = 0;
    form.querySelectorAll(".self-q").forEach(q => { if (q.querySelector(".self-feedback").classList.contains("ok")) ok++; });
    const total = tasks.length;
    const pct = Math.round(ok / total * 100);
    const g = pct >= 90 ? 5 : pct >= 75 ? 4 : pct >= 60 ? 3 : 2;
    result.textContent = `Верных: ${ok} из ${total} (${pct}%). Оценка: ${g}.`;
    result.className = "test-result " + (g >= 3 ? "ok" : "bad");
    state.selfResults[t.id] = { ok, total, pct, grade: g, date: new Date().toISOString() };
    saveSelfResults();
    logActivity("self", `Самостоятельная ${t.code}: ${ok}/${total}`);
    if (g === 5 && window.celebrate) window.celebrate();
  });
  form.querySelector("#selfReset").addEventListener("click", () => {
    form.querySelectorAll(".self-input").forEach(i => i.value = "");
    form.querySelectorAll(".self-feedback").forEach(f => { f.textContent = ""; f.className = "self-feedback"; });
    result.textContent = "";
    result.className = "test-result";
  });
  panel.appendChild(form);
}

/* ---------- Тесты ---------- */
let testTimerId = null;
function clearTestTimer(){
  if (testTimerId){ clearInterval(testTimerId); testTimerId = null; }
}
function startTestTimer(sec, display, onEnd){
  clearTestTimer();
  let r = sec;
  const tick = () => {
    const m = Math.floor(r / 60), s = r % 60;
    display.textContent = `⏱ ${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    display.classList.toggle("warn", r <= 60);
    if (r <= 0){ clearTestTimer(); onEnd(); return; }
    r--;
  };
  tick();
  testTimerId = setInterval(tick, 1000);
}
function renderTest(panel, t, mode){
  mode = mode || "control";
  panel.innerHTML = "";
  panel.appendChild(el(`<h2>Контроль темы</h2>
    <p class="accent">🎯 <b>Контроль</b> — с таймером и разбором ошибок, идёт в отчёт.
    🎓 <b>Тренировка</b> — мгновенная проверка, без оценки.</p>
    <div class="test-mode-tabs">
      <button class="test-mode-tab ${mode==='control'?'active':''}" data-mode="control">🎯 Контроль</button>
      <button class="test-mode-tab ${mode==='training'?'active':''}" data-mode="training">🎓 Тренировка</button>
    </div>`));
  panel.querySelectorAll(".test-mode-tab").forEach(b => b.addEventListener("click", () => {
    location.hash = `#/topic/${t.id}/test/${b.dataset.mode}`;
  }));
  const body = el(`<div></div>`);
  panel.appendChild(body);
  if (!t.test || !t.test.length){
    body.appendChild(el(`<p><i>Тест готовится.</i></p>`));
    return;
  }
  if (mode === "training") renderTestTraining(body, t);
  else renderTestControl(body, t);
}
function renderTestTraining(body, t){
  body.innerHTML = "";
  body.appendChild(el(`<p class="accent">Отвечайте в любом порядке. После выбора сразу увидите правильный ответ. Оценка не сохраняется.</p>`));
  const items = shuffled(t.test.map(q => ({ q })));
  items.forEach(it => {
    const opts = it.q.options.map((opt, oi) => ({ opt, oi }));
    it.s = shuffled(opts);
    it.correctIdx = it.s.findIndex(o => o.oi === it.q.correct);
  });
  const form = el(`<form></form>`);
  items.forEach((item, qi) => {
    const qb = el(`<div class="question"><div class="q-text">${qi+1}. ${item.q.q}</div></div>`);
    item.s.forEach((o, oi) => qb.appendChild(el(`<label class="option"><input type="radio" name="t${qi}" value="${oi}"><span>${o.opt}</span></label>`)));
    const fb = el(`<div class="train-feedback"></div>`);
    qb.appendChild(fb);
    qb.querySelectorAll("input[type=radio]").forEach(inp => inp.addEventListener("change", () => {
      const all = qb.querySelectorAll(".option");
      all.forEach(o => o.classList.remove("correct", "wrong"));
      const idx = Number(inp.value);
      if (idx === item.correctIdx){
        all[idx].classList.add("correct");
        fb.textContent = "✔ Верно!";
        fb.className = "train-feedback ok";
      } else {
        all[idx].classList.add("wrong");
        all[item.correctIdx].classList.add("correct");
        fb.textContent = "✘ Неверно. Правильный выделен зелёным.";
        fb.className = "train-feedback bad";
      }
    }));
    form.appendChild(qb);
  });
  const reset = el(`<div class="test-actions"><button type="button" class="btn ghost">🔄 Начать заново</button></div>`);
  reset.querySelector("button").addEventListener("click", () => renderTestTraining(body, t));
  form.appendChild(reset);
  body.appendChild(form);
}
function renderTestControl(body, t){
  body.innerHTML = "";
  const items = shuffled(t.test.map(q => ({ q })));
  items.forEach(it => {
    const opts = it.q.options.map((opt, oi) => ({ opt, oi }));
    it.s = shuffled(opts);
    it.correctIdx = it.s.findIndex(o => o.oi === it.q.correct);
  });
  const timer = el(`<div class="test-timer">⏱ --:--</div>`);
  body.appendChild(timer);
  body.appendChild(el(`<p class="accent">Вопросы и варианты перемешаны. Время — 15 минут.</p>`));
  const form = el(`<form></form>`);
  items.forEach((item, qi) => {
    const qb = el(`<div class="question"><div class="q-text">${qi+1}. ${item.q.q}</div></div>`);
    item.s.forEach((o, oi) => qb.appendChild(el(`<label class="option"><input type="radio" name="q${qi}" value="${oi}"><span>${o.opt}</span></label>`)));
    form.appendChild(qb);
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
  const grade = () => {
    if (graded) return;
    graded = true;
    clearTestTimer();
    let ok = 0;
    const wrong = [];
    items.forEach((item, qi) => {
      const ch = form.querySelector(`input[name="q${qi}"]:checked`);
      const qb = form.querySelectorAll(".question")[qi];
      qb.querySelectorAll(".option").forEach(o => o.classList.remove("correct","wrong"));
      if (ch){
        const idx = Number(ch.value);
        const opt = qb.querySelectorAll(".option")[idx];
        if (idx === item.correctIdx){ ok++; opt.classList.add("correct"); }
        else {
          opt.classList.add("wrong");
          qb.querySelectorAll(".option")[item.correctIdx].classList.add("correct");
          wrong.push({ q: item.q.q, u: item.s[idx].opt, c: item.q.options[item.q.correct] });
        }
      } else {
        qb.querySelectorAll(".option")[item.correctIdx].classList.add("correct");
        wrong.push({ q: item.q.q, u: "(нет ответа)", c: item.q.options[item.q.correct] });
      }
    });
    const total = items.length;
    const pct = Math.round(ok / total * 100);
    let g = 2;
    if (pct >= 90) g = 5; else if (pct >= 75) g = 4; else if (pct >= 60) g = 3;
    result.textContent = `Верных: ${ok} из ${total} (${pct}%). Оценка: ${g}.`;
    result.className = "test-result " + (g >= 3 ? "ok" : "bad");
    state.results[t.id] = { ok, total, pct, grade: g, date: new Date().toISOString() };
    saveResults();
    logActivity("test", `Тест ${t.code}: ${ok}/${total} (оценка ${g})`);
    if (g === 5 && window.celebrate) window.celebrate();
    if (wrong.length){
      report.appendChild(el(`<h3>Разбор ошибок</h3>`));
      wrong.forEach(w => report.appendChild(el(`<div class="error-item">
        <div class="error-q">${escapeHtml(w.q)}</div>
        <div class="error-line error-bad">Ваш ответ: ${escapeHtml(w.u)}</div>
        <div class="error-line error-ok">Верно: ${escapeHtml(w.c)}</div>
      </div>`)));
      report.appendChild(el(`<a class="backlink" href="#/topic/${t.id}/lecture">📖 Перечитать лекцию →</a>`));
    } else {
      report.appendChild(el(`<p class="test-perfect">🎉 Все ответы верные!</p>`));
    }
    actions.querySelector("#gradeBtn").disabled = true;
  };
  form.querySelector("#gradeBtn").addEventListener("click", grade);
  form.querySelector("#resetTest").addEventListener("click", () => {
    clearTestTimer();
    form.querySelectorAll("input[type=radio]").forEach(i => i.checked = false);
    form.querySelectorAll(".option").forEach(o => o.classList.remove("correct","wrong"));
    result.textContent = ""; result.className = "test-result";
    report.innerHTML = "";
    graded = false;
    actions.querySelector("#gradeBtn").disabled = false;
    startTestTimer(TEST_TIME_LIMIT_SEC, timer, grade);
  });
  startTestTimer(TEST_TIME_LIMIT_SEC, timer, grade);
}

/* ---------- PDF ---------- */
function openPdfModal(file, title){
  document.querySelectorAll(".pdf-overlay").forEach(x => x.remove());
  const modal = el(`<div class="pdf-overlay">
    <div class="pdf-modal">
      <div class="pdf-head">
        <div class="pdf-title">${escapeHtml(title)}</div>
        <div class="pdf-actions">
          <button class="btn ghost" id="pdfDark">🌙 Тема</button>
          <a class="btn ghost" href="${file}" download>⬇ Скачать</a>
          <a class="btn ghost" href="${file}" target="_blank" rel="noopener">↗ Новая вкладка</a>
          <button class="btn" id="pdfClose">✕ Закрыть</button>
        </div>
      </div>
      <div class="pdf-body"><iframe src="${file}#view=FitH" title="${escapeHtml(title)}"></iframe></div>
    </div>
  </div>`);
  document.body.appendChild(modal);
  document.body.style.overflow = "hidden";
  const close = () => { modal.remove(); document.body.style.overflow = ""; };
  modal.querySelector("#pdfClose").addEventListener("click", close);
  modal.addEventListener("click", e => { if (e.target === modal) close(); });
  modal.querySelector("#pdfDark").addEventListener("click", () => modal.classList.toggle("dark"));
  const onEsc = e => { if (e.key === "Escape"){ close(); document.removeEventListener("keydown", onEsc); } };
  document.addEventListener("keydown", onEsc);
}

/* ---------- Верхнее меню ---------- */
function setActiveTopBtn(which){
  const map = { comments:"commentsBtn", dashboard:"dashboardBtn", chat:"chatBtn", questions:"questionsBtn", staff:"staffBtn" };
  Object.keys(map).forEach(k => {
    const b = document.getElementById(map[k]);
    if (b) b.classList.toggle("active", which === k);
  });
}
function initTopMenus(){
  const s = document.getElementById("searchBtn");
  if (s) s.addEventListener("click", () => window.openSearch && window.openSearch());
  const c = document.getElementById("chatBtn");
  if (c) c.addEventListener("click", () => location.hash = "#/chat");
  const q = document.getElementById("questionsBtn");
  if (q) q.addEventListener("click", () => location.hash = "#/questions");
  const d = document.getElementById("dashboardBtn");
  if (d) d.addEventListener("click", () => location.hash = "#/dashboard");
  const st = document.getElementById("staffBtn");
  if (st) st.addEventListener("click", () => location.hash = "#/staff");
  const m = document.getElementById("moreBtn");
  if (m) m.addEventListener("click", openMoreMenu);
}
function openMoreMenu(){
  document.querySelectorAll(".more-menu, .user-menu").forEach(x => x.remove());
  const btn = document.getElementById("moreBtn");
  const rect = btn.getBoundingClientRect();
  const menu = el(`<div class="more-menu">
    <button class="more-menu-item" data-go="#/comments">💬 Отзывы о курсе</button>
    <button class="more-menu-item" data-go="#/gallery">🖼 Галерея работ</button>
    <button class="more-menu-item" data-go="#/calendar">📅 Календарь</button>
    <button class="more-menu-item" data-go="#/gosts">📐 ГОСТы</button>
    <button class="more-menu-item" data-go="#/qr">📱 QR-код</button>
    <button class="more-menu-item" data-go="#/staff">👤 Служебный вход</button>
  </div>`);
  menu.style.position = "fixed";
  menu.style.top = (rect.bottom + 8) + "px";
  menu.style.right = Math.max(8, window.innerWidth - rect.right) + "px";
  document.body.appendChild(menu);
  const close = e => {
    if (!menu.contains(e.target) && e.target !== btn){ menu.remove(); document.removeEventListener("click", close); }
  };
  setTimeout(() => document.addEventListener("click", close), 0);
  menu.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => {
    menu.remove();
    location.hash = b.dataset.go;
  }));
}

/* ---------- Отчёт ---------- */
function buildReport(){
  const s = state.student || { name:"—", group:"—" };
  const lines = [];
  lines.push("ОТЧЁТ О ПРОХОЖДЕНИИ МДК 07.01");
  lines.push("");
  lines.push("Студент: " + s.name);
  lines.push("Группа:  " + s.group);
  lines.push("Дата:    " + fmtDate(new Date()));
  lines.push("");
  lines.push("ПРОГРЕСС ПО ТЕМАМ");
  COURSE.sections.forEach(sec => sec.topics.forEach(t => {
    const d = state.progress[t.id]?.done || 0;
    lines.push("  " + t.code + " " + t.title + " — " + d + "/5");
  }));
  lines.push("");
  lines.push("РЕЗУЛЬТАТЫ ТЕСТОВ");
  Object.keys(state.results).forEach(id => {
    const t = findTopic(id)?.topic;
    const r = state.results[id];
    lines.push("  " + (t ? t.code + " " + t.title : id) + " — " + r.ok + "/" + r.total + " (оценка " + r.grade + ")");
  });
  return lines.join("\n");
}
function openReportModal(){
  document.querySelectorAll(".report-overlay").forEach(x => x.remove());
  const modal = el(`<div class="report-overlay">
    <div class="report-modal">
      <h2>Отправка отчёта</h2>
      <p class="report-sub">Проверьте данные и нажмите «Отправить».</p>
      <pre></pre>
      <div class="report-actions">
        <button class="btn ghost" id="reportCancel">Отмена</button>
        <button class="btn" id="reportSend">Отправить</button>
      </div>
      <div class="report-status"></div>
    </div>
  </div>`);
  modal.querySelector("pre").textContent = buildReport();
  document.body.appendChild(modal);
  modal.querySelector("#reportCancel").addEventListener("click", () => modal.remove());
  modal.querySelector("#reportSend").addEventListener("click", async () => {
    const status = modal.querySelector(".report-status");
    const btn = modal.querySelector("#reportSend");
    btn.disabled = true;
    status.textContent = "Отправляем…";
    const s = state.student || { name:"—", group:"—" };
    const p = new URLSearchParams();
    p.append("action", "report");
    p.append("student", s.name);
    p.append("group",   s.group);
    p.append("avatar",  s.avatar || DEFAULT_AVATAR);
    p.append("report",  buildReport());
    try {
      await fetch(APPS_SCRIPT_URL, { method:"POST", body: p });
      status.textContent = "✔ Отчёт отправлен.";
      status.className = "report-status ok";
      btn.textContent = "Отправлено";
    } catch (err){
      status.textContent = "Не удалось отправить. Попробуйте позже.";
      status.className = "report-status bad";
      btn.disabled = false;
    }
  });
}

/* ---------- Роутер ---------- */
function goHome(e){ if (e) e.preventDefault(); location.hash = "#/"; }
function route(){
  clearTestTimer();
  document.querySelectorAll(".pdf-overlay, .theme-overlay, .user-menu, .more-menu, .avatar-overlay").forEach(x => x.remove());
  if (typeof closeSearch === "function") closeSearch();

  const hash = location.hash.replace(/^#/, "") || "/";
  const parts = hash.split("/").filter(Boolean);

  // Служебный вход доступен без студенческой авторизации
  if (parts[0] === "staff"){
    document.getElementById("crumbs").textContent = "Служебный вход";
    if (window.renderStaffPage) window.renderStaffPage();
    window.scrollTo(0, 0);
    return;
  }

  // Все остальные страницы — только для авторизованного студента
  if (!state.student){
    const app = document.getElementById("app");
    if (app) app.innerHTML = "";
    return;
  }

  const pages = {
    comments:  () => window.renderCommentsPage && window.renderCommentsPage(),
    dashboard: () => window.renderDashboard && window.renderDashboard(),
    chat:      () => window.renderChatPage && window.renderChatPage(),
    questions: () => window.renderQuestionsPage && window.renderQuestionsPage(),
    gallery:   () => window.renderGalleryPage && window.renderGalleryPage(),
    calendar:  () => window.renderCalendarPage && window.renderCalendarPage(),
    gosts:     () => window.renderGostsPage && window.renderGostsPage(),
    qr:        () => window.renderQrPage && window.renderQrPage()
  };

  if (parts[0] === "topic" && parts[1]){
    renderTopic(parts[1], parts[2] || "passport", parts[3] || "control");
  } else if (pages[parts[0]]){
    pages[parts[0]]();
  } else {
    renderHome();
  }
  window.scrollTo(0, 0);
}

/* ---------- Онлайн-счётчик ---------- */
let heartbeatTimer = null;
async function sendHeartbeat(){
  if (!state.student || !APPS_SCRIPT_URL) return;
  const p = new URLSearchParams();
  p.append("action", "heartbeat");
  p.append("key", studentKey());
  p.append("name", state.student.name);
  p.append("group", state.student.group);
  try { await fetch(APPS_SCRIPT_URL, { method:"POST", body: p }); } catch (err){}
}
async function refreshOnline(){
  const node = document.getElementById("onlineCount");
  if (!node || !APPS_SCRIPT_URL) return;
  try {
    const res = await fetch(APPS_SCRIPT_URL + "?action=online&window=" + ONLINE_TIMEOUT_SEC);
    const data = await res.json();
    if (data && data.ok) node.textContent = "🌐 " + data.count;
  } catch (err){}
}
function startHeartbeat(){
  sendHeartbeat();
  refreshOnline();
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = setInterval(() => { sendHeartbeat(); refreshOnline(); }, 60000);
}

/* ---------- Сеть ---------- */
function updateNetStatus(){
  const n = document.getElementById("netStatus");
  if (!n) return;
  if (!navigator.onLine){ n.textContent = "📶 Офлайн"; n.classList.add("offline"); }
  else { n.textContent = "📶 Онлайн"; n.classList.remove("offline"); }
}

/* ---------- Объявления ---------- */
async function loadAnnouncement(){
  const bar = document.getElementById("announceBar");
  if (!bar || !APPS_SCRIPT_URL) return;
  const dismissed = localStorage.getItem("mdk0701.announceDismissed") || "";
  try {
    const res = await fetch(APPS_SCRIPT_URL + "?action=announcement");
    const data = await res.json();
    if (data && data.ok && data.text){
      const id = data.id || String(data.text).slice(0, 40);
      if (dismissed === id) return;
      document.getElementById("announceText").textContent = data.text;
      bar.hidden = false;
      document.getElementById("announceClose").addEventListener("click", () => {
        localStorage.setItem("mdk0701.announceDismissed", id);
        bar.hidden = true;
      });
    }
  } catch (err){}
}

/* ---------- Инициализация ---------- */
window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initAuth();
  initTopMenus();
  renderUserChip();
  updateNetStatus();
  route();
  loadAnnouncement();
  startHeartbeat();
  if (window.renderReportBtn === undefined){
    const rb = document.getElementById("reportBtn");
    if (rb) rb.addEventListener("click", openReportModal);
  }
});
window.addEventListener("online",  () => { updateNetStatus(); if (window.OfflineQueue) window.OfflineQueue.flush(); });
window.addEventListener("offline", updateNetStatus);