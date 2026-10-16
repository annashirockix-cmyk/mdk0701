/* ============================================================
   SPA-роутер и рендер МДК 07.01
   + авторизация с хранением прогресса по каждому студенту
   + экспорт/импорт профиля (.json)
   + отправка отчёта через Google Apps Script
   ============================================================ */

const REPORT_EMAIL = "camelia.2110@yandex.ru";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzB0v37m5pC0jSnEmCEllIlN3IlRmgOhaPEW9giHbS6wNIYFHClxJv8Z5HyG4-AJBpdaQ/exec";

/* ---------- состояние ---------- */
const state = {
  student: JSON.parse(localStorage.getItem("mdk0701.student") || "null"),
  progress: {},
  results: {},
  selfResults: {}
};

/* ---------- ключ студента ---------- */
function studentKey(s){
  s = s || state.student;
  if (!s || !s.name || !s.group) return null;
  return encodeURIComponent(
    s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase()
  );
}

/* ---------- сохранение/загрузка данных студента ---------- */
function loadStudentData(){
  const k = studentKey();
  if (!k){
    state.progress = {};
    state.results = {};
    state.selfResults = {};
    return;
  }
  state.progress    = JSON.parse(localStorage.getItem("mdk0701.progress." + k)    || "{}");
  state.results     = JSON.parse(localStorage.getItem("mdk0701.results." + k)     || "{}");
  state.selfResults = JSON.parse(localStorage.getItem("mdk0701.selfResults." + k) || "{}");
}

function saveStudentData(){
  const k = studentKey();
  if (!k) return;
  localStorage.setItem("mdk0701.progress."    + k, JSON.stringify(state.progress));
  localStorage.setItem("mdk0701.results."     + k, JSON.stringify(state.results));
  localStorage.setItem("mdk0701.selfResults." + k, JSON.stringify(state.selfResults));
}

function saveStudent(){ localStorage.setItem("mdk0701.student", JSON.stringify(state.student)); }

/* обёртки — совместимы с вызовами в renderXxx */
function saveProgress(){ saveStudentData(); }
function saveResults(){ saveStudentData(); }
function saveSelfResults(){ saveStudentData(); }

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

/* ============================================================
   АВТОРИЗАЦИЯ
   ============================================================ */
function initAuth(){
  const overlay = document.getElementById("loginOverlay");
  const nameInput = document.getElementById("loginName");
  const groupInput = document.getElementById("loginGroup");
  const btn = document.getElementById("loginBtn");

  if (!state.student){
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    if (nameInput) nameInput.focus();
  } else {
    loadStudentData();
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  btn.addEventListener("click", ()=>{
    const name = (nameInput.value || "").trim();
    const group = (groupInput.value || "").trim();
    if (!name || name.length < 3){
      nameInput.focus();
      nameInput.style.borderColor = "var(--err)";
      return;
    }
    if (!group || group.length < 2){
      groupInput.focus();
      groupInput.style.borderColor = "var(--err)";
      return;
    }

    // был другой студент → сохранить его данные
    if (state.student) saveStudentData();

    const isReturning = localStorage.getItem(
      "mdk0701.progress." + encodeURIComponent(name.toLowerCase() + "|" + group.toLowerCase())
    ) !== null;

    state.student = { name, group, loginAt: new Date().toISOString() };
    saveStudent();
    loadStudentData();

    overlay.hidden = true;
    document.body.style.overflow = "";
    renderUserChip();
    renderHome();

    if (!isReturning){
      setTimeout(()=>{
        alert(
          "Добро пожаловать!\n\n" +
          "Ваш прогресс сохраняется в этом браузере.\n" +
          "Чтобы перенести его на другое устройство —\n" +
          "нажмите на свой профиль в правом верхнем углу\n" +
          "и выберите «Скачать профиль»."
        );
      }, 300);
    }
  });

  [nameInput, groupInput].forEach(inp=>{
    if (!inp) return;
    inp.addEventListener("keydown", (e)=>{
      if (e.key === "Enter") btn.click();
    });
    inp.addEventListener("input", ()=>{ inp.style.borderColor = ""; });
  });

  // Клик по чипу — меню профиля
  const chip = document.getElementById("userChip");
  if (chip){
    chip.addEventListener("click", openUserMenu);
  }
}

/* ---------- чип пользователя ---------- */
function renderUserChip(){
  const chip = document.getElementById("userChip");
  const nameEl = document.getElementById("userChipName");
  const groupEl = document.getElementById("userChipGroup");
  if (!chip || !state.student) return;
  chip.hidden = false;
  nameEl.textContent = state.student.name;
  groupEl.textContent = "Гр. " + state.student.group;
}

/* ---------- меню профиля ---------- */
function openUserMenu(){
  // закрыть старое, если открыто
  document.querySelectorAll(".user-menu").forEach(m=>m.remove());

  const chip = document.getElementById("userChip");
  const rect = chip.getBoundingClientRect();

  const menu = el(`
    <div class="user-menu">
      <div class="user-menu-head">
        <div class="user-menu-name">${state.student.name}</div>
        <div class="user-menu-group">Группа ${state.student.group}</div>
      </div>
      <button class="user-menu-item" data-act="switch">🔄 Сменить пользователя</button>
      <button class="user-menu-item" data-act="export">⬇️ Скачать профиль (.json)</button>
      <button class="user-menu-item" data-act="import">⬆️ Загрузить профиль (.json)</button>
      <button class="user-menu-item danger" data-act="clear">🗑 Очистить мой прогресс</button>
    </div>
  `);
  document.body.appendChild(menu);

  // позиционирование
  menu.style.position = "fixed";
  menu.style.top = (rect.bottom + 8) + "px";
  menu.style.right = (window.innerWidth - rect.right) + "px";

  // закрытие по клику вне
  const close = (e)=>{
    if (!menu.contains(e.target) && e.target !== chip) {
      menu.remove();
      document.removeEventListener("click", close);
    }
  };
  setTimeout(()=>document.addEventListener("click", close), 0);

  // обработчики
  menu.querySelector('[data-act="switch"]').addEventListener("click", ()=>{
    menu.remove();
    if (!confirm("Сменить пользователя? Ваш прогресс сохранён и будет доступен при следующем входе с теми же ФИО и группой.")) return;
    saveStudentData();
    state.student = null;
    state.progress = {};
    state.results = {};
    state.selfResults = {};
    saveStudent();
    const ov = document.getElementById("loginOverlay");
    ov.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("loginName").value = "";
    document.getElementById("loginGroup").value = "";
    document.getElementById("loginName").focus();
    document.getElementById("userChip").hidden = true;
  });

  menu.querySelector('[data-act="export"]').addEventListener("click", ()=>{
    menu.remove();
    exportProfile();
  });

  menu.querySelector('[data-act="import"]').addEventListener("click", ()=>{
    menu.remove();
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.addEventListener("change", (e)=>{
      const file = e.target.files[0];
      if (file) importProfile(file);
    });
    input.click();
  });

  menu.querySelector('[data-act="clear"]').addEventListener("click", ()=>{
    menu.remove();
    if (!confirm("Очистить ВЕСЬ прогресс (тесты, самостоятельные, открытые вкладки)?")) return;
    state.progress = {};
    state.results = {};
    state.selfResults = {};
    saveStudentData();
    renderHome();
  });
}

/* ---------- экспорт профиля ---------- */
function exportProfile(){
  const s = state.student;
  if (!s) return;
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    student: s,
    progress: state.progress,
    results: state.results,
    selfResults: state.selfResults
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type:"application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName = s.name.replace(/[^\wа-яё\-]+/gi, "_");
  const safeGroup = s.group.replace(/[^\wа-яё\-]+/gi, "_");
  a.href = url;
  a.download = "mdk0701_" + safeName + "_" + safeGroup + ".json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ---------- импорт профиля ---------- */
function importProfile(file){
  const reader = new FileReader();
  reader.onload = (e)=>{
    let data;
    try { data = JSON.parse(e.target.result); }
    catch (err){ alert("Не удалось прочитать файл: " + err.message); return; }

    if (!data || !data.student || !data.student.name){
      alert("Это не файл профиля МДК 07.01.");
      return;
    }

    if (!confirm(
      "Загрузить профиль:\n" +
      data.student.name + " (гр. " + data.student.group + ")\n\n" +
      "Текущий прогресс в этом браузере будет заменён."
    )) return;

    state.student = data.student;
    state.progress = data.progress || {};
    state.results = data.results || {};
    state.selfResults = data.selfResults || {};
    saveStudent();
    saveStudentData();
    renderUserChip();
    renderHome();
    alert("✔ Профиль загружен.");
  };
  reader.readAsText(file);
}

/* ============================================================
   ТЕМА (светлая / тёмная)
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

/* ============================================================
   НАВИГАЦИЯ
   ============================================================ */
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

  app.appendChild(el(`
    <section class="hero">
      <div class="meta">${COURSE.specialty} · набор 2024</div>
      <h1>${COURSE.title}</h1>
      <p>${COURSE.module}</p>
      ${state.student ? `
        <div class="hello">Вы вошли как <b>${state.student.name}</b>, группа <b>${state.student.group}</b>.</div>
      ` : ""}
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
      <p class="sub">PDF-файлы из папки <code>passport/</code>. Открываются в новой вкладке.</p>
      <div class="doc-grid"></div>
    </section>`);
    const grid = block.querySelector(".doc-grid");
    COURSE.passports.forEach(p=>{
      grid.appendChild(el(`
        <a class="doc-card" href="${p.file}" target="_blank" rel="noopener">
          <div class="doc-code">${p.code}</div>
          <div class="doc-title">${p.title}</div>
          <div class="doc-summary">${p.summary}</div>
          <div class="doc-action">Открыть PDF →</div>
        </a>
      `));
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
}

/* ============================================================
   ТЕМА
   ============================================================ */
function renderTopic(id, tab = "passport"){
  const found = findTopic(id);
  if (!found) return renderHome();
  const { section, topic } = found;
  const app = document.getElementById("app");
  app.innerHTML = "";
  document.getElementById("crumbs").textContent = topic.code + " · " + topic.title;

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
  if (tab === "test") renderTest(panel, topic);

  markDone(topic.id, tab);
}

function markDone(topicId, tab){
  state.progress[topicId] = state.progress[topicId] || { done: 0, tabs: {} };
  if (!state.progress[topicId].tabs[tab]){
    state.progress[topicId].tabs[tab] = true;
    state.progress[topicId].done = Object.keys(state.progress[topicId].tabs).length;
    saveProgress();
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
    const btn = block.querySelector(".self-check");
    const fb = block.querySelector(".self-feedback");
    btn.addEventListener("click", ()=>{
      const userAns = (input.value || "").trim().toLowerCase();
      const correct = task.a.trim().toLowerCase();
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
    const pct = Math.round(ok / total * 100);
    const grade = pct >= 90 ? 5 : pct >= 75 ? 4 : pct >= 60 ? 3 : 2;
    result.textContent = `Верных: ${ok} из ${total} (${pct}%). Оценка: ${grade}.`;
    result.className = "test-result " + (grade >= 3 ? "ok" : "bad");

    state.selfResults[t.id] = { ok, total, pct, grade, date: new Date().toISOString() };
    saveSelfResults();
  });
  form.querySelector("#selfReset").addEventListener("click", ()=>{
    form.querySelectorAll(".self-input").forEach(i=>i.value="");
    form.querySelectorAll(".self-feedback").forEach(f=>{ f.textContent=""; f.className="self-feedback"; });
    result.textContent = ""; result.className = "test-result";
  });
  panel.appendChild(form);
}

function renderTest(panel, t){
  panel.innerHTML = `<h2>Контроль темы</h2>
    <p class="accent">Выберите один правильный ответ в каждом вопросе. В конце нажмите «Подвести итог».</p>`;
  if (!t.test || !t.test.length){
    panel.appendChild(el(`<p><i>Тест по теме готовится.</i></p>`));
    return;
  }
  const form = el(`<form></form>`);
  t.test.forEach((q, qi)=>{
    const qBox = el(`<div class="question">
      <div class="q-text">${qi+1}. ${q.q}</div>
    </div>`);
    q.options.forEach((opt, oi)=>{
      const optEl = el(`<label class="option">
        <input type="radio" name="q${qi}" value="${oi}">
        <span>${opt}</span>
      </label>`);
      qBox.appendChild(optEl);
    });
    form.appendChild(qBox);
  });
  const result = el(`<div class="test-result"></div>`);
  const actions = el(`<div class="test-actions">
    <button type="button" class="btn" id="gradeBtn">Подвести итог</button>
    <button type="button" class="btn ghost" id="resetTest">Сбросить</button>
  </div>`);
  form.appendChild(actions);
  form.appendChild(result);
  form.querySelector("#gradeBtn").addEventListener("click", ()=>{
    let ok = 0;
    t.test.forEach((q, qi)=>{
      const chosen = form.querySelector(`input[name="q${qi}"]:checked`);
      const qBox = form.querySelectorAll(".question")[qi];
      qBox.querySelectorAll(".option").forEach(o=>o.classList.remove("correct","wrong"));
      if (chosen){
        const idx = Number(chosen.value);
        const opt = qBox.querySelectorAll(".option")[idx];
        if (idx === q.correct){ ok++; opt.classList.add("correct"); }
        else {
          opt.classList.add("wrong");
          qBox.querySelectorAll(".option")[q.correct].classList.add("correct");
        }
      } else {
        qBox.querySelectorAll(".option")[q.correct].classList.add("correct");
      }
    });
    const total = t.test.length;
    const pct = Math.round(ok / total * 100);
    let grade = 2;
    if (pct >= 90) grade = 5; else if (pct >= 75) grade = 4; else if (pct >= 60) grade = 3;
    result.textContent = `Верных: ${ok} из ${total} (${pct}%). Оценка: ${grade}.`;
    result.className = "test-result " + (grade >= 3 ? "ok" : "bad");

    state.results[t.id] = { ok, total, pct, grade, date: new Date().toISOString() };
    saveResults();
  });
  form.querySelector("#resetTest").addEventListener("click", ()=>{
    form.querySelectorAll("input[type=radio]").forEach(i=>i.checked=false);
    form.querySelectorAll(".option").forEach(o=>o.classList.remove("correct","wrong"));
    result.textContent = ""; result.className = "test-result";
  });
  panel.appendChild(form);
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
  if (testKeys.length === 0){
    lines.push("  (нет пройденных тестов)");
  } else {
    testKeys.forEach(id=>{
      const t = findTopic(id)?.topic;
      const r = state.results[id];
      lines.push("  " + (t ? t.code + " " + t.title : id) + " — " + r.ok + "/" + r.total + " (" + r.pct + "%), оценка " + r.grade + " — " + fmt(new Date(r.date)));
    });
  }
  lines.push("");

  const selfKeys = Object.keys(state.selfResults);
  lines.push("РЕЗУЛЬТАТЫ САМОСТОЯТЕЛЬНЫХ РАБОТ");
  if (selfKeys.length === 0){
    lines.push("  (нет пройденных самостоятельных)");
  } else {
    selfKeys.forEach(id=>{
      const t = findTopic(id)?.topic;
      const r = state.selfResults[id];
      lines.push("  " + (t ? t.code + " " + t.title : id) + " — " + r.ok + "/" + r.total + " (" + r.pct + "%), оценка " + r.grade + " — " + fmt(new Date(r.date)));
    });
  }

  lines.push("");
  lines.push("— Конец отчёта —");
  return lines.join("\n");
}

function openReportModal(){
  document.querySelectorAll(".report-overlay").forEach(x=>x.remove());

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

  modal.querySelector("#reportCancel").addEventListener("click", ()=>modal.remove());

  modal.querySelector("#reportSend").addEventListener("click", async ()=>{
    const status = modal.querySelector(".report-status");
    const btn = modal.querySelector("#reportSend");
    btn.disabled = true;
    status.textContent = "Отправляем…";
    status.className = "report-status";

    const s = state.student || { name: "—", group: "—" };

    const params = new URLSearchParams();
    params.append("student", s.name);
    params.append("group",   s.group);
    params.append("report",  buildReport());

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: params
      });
      status.textContent = "✔ Отчёт отправлен на camelia.2110@yandex.ru и anna.shirockix@gmail.com";
      status.className = "report-status ok";
      btn.textContent = "Отправлено";
    } catch (err){
      const subject = encodeURIComponent("МДК 07.01 — отчёт " + s.name + " (гр. " + s.group + ")");
      const body = encodeURIComponent(buildReport());
      const mailto = "mailto:" + REPORT_EMAIL + "?subject=" + subject + "&body=" + body;
      status.innerHTML = "Не удалось отправить автоматически. " +
        '<a href="' + mailto + '" style="color:var(--accent);text-decoration:underline">Открыть письмо в почтовом клиенте →</a>';
      status.className = "report-status bad";
      btn.disabled = false;
    }
  });
}

function initReport(){
  const btn = document.getElementById("reportBtn");
  if (btn) btn.addEventListener("click", openReportModal);
}

/* ============================================================
   ROUTER
   ============================================================ */
function goHome(e){ if (e) e.preventDefault(); location.hash = "#/"; }
function route(){
  if (!state.student){
    document.getElementById("app").innerHTML = "";
    return;
  }
  const hash = location.hash.replace(/^#/, "") || "/";
  const parts = hash.split("/").filter(Boolean);
  if (parts[0] === "topic" && parts[1]){
    renderTopic(parts[1], parts[2] || "passport");
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
  renderUserChip();
  route();
});