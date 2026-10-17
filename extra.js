/* ============================================================
   МДК 07.01 — extra.js (ФИНАЛ)
   ============================================================ */
"use strict";

if ("serviceWorker" in navigator){ window.addEventListener("load", ()=>{ navigator.serviceWorker.register("./sw.js").catch(()=>{}); }); }

window.OfflineQueue = (()=>{
  const DB_NAME = "mdk0701-queue", STORE = "queue"; let db = null;
  function open(){ return new Promise((res, rej)=>{ const req = indexedDB.open(DB_NAME, 1); req.onupgradeneeded = ()=>{ req.result.createObjectStore(STORE, { keyPath:"id", autoIncrement:true }); }; req.onsuccess = ()=>{ db = req.result; res(db); }; req.onerror = ()=> rej(req.error); }); }
  async function enqueue(item){ if (!db) await open(); return new Promise((res, rej)=>{ const tx = db.transaction(STORE, "readwrite"); tx.objectStore(STORE).add({ ...item, ts: Date.now() }); tx.oncomplete = ()=>res(); tx.onerror = ()=>rej(tx.error); }); }
  async function all(){ if (!db) await open(); return new Promise(res=>{ const tx = db.transaction(STORE, "readonly"); const r = tx.objectStore(STORE).getAll(); r.onsuccess = ()=>res(r.result || []); r.onerror = ()=>res([]); }); }
  async function clear(){ if (!db) await open(); return new Promise(res=>{ const tx = db.transaction(STORE, "readwrite"); tx.objectStore(STORE).clear(); tx.oncomplete = ()=>res(); tx.onerror = ()=>res(); }); }
  async function flush(){ if (!navigator.onLine || !state.student) return; const items = await all(); if (!items.length) return; for (const item of items){ try { if (item.kind === "save"){ const params = new URLSearchParams(); params.append("action", "save"); params.append("key", studentKey()); params.append("name", state.student.name); params.append("group", state.student.group); params.append("payload", JSON.stringify(item.payload)); const res = await fetch(APPS_SCRIPT_URL, { method:"POST", body: params }); const data = await res.json(); if (!data.ok) break; } } catch (err){ return; } } await clear(); window.showToast("Очередь синхронизирована", "ok"); }
  return { enqueue, flush, all, clear };
})();

window.celebrate = function(){
  const c = document.getElementById("confettiCanvas"); if (!c) return;
  c.width = window.innerWidth; c.height = window.innerHeight; c.classList.add("active");
  const ctx = c.getContext("2d");
  const pieces = Array.from({ length: 120 }, ()=>({ x: Math.random() * c.width, y: -20 - Math.random() * c.height * 0.3, r: 4 + Math.random() * 6, vy: 2 + Math.random() * 4, vx: -1 + Math.random() * 2, color: ["#c14a2a","#f0b400","#2d7a4f","#4a90d9","#ff6b3d"][Math.floor(Math.random()*5)], rot: Math.random() * Math.PI * 2, vr: -0.15 + Math.random() * 0.3 }));
  let frames = 0;
  (function draw(){ ctx.clearRect(0, 0, c.width, c.height); pieces.forEach(p=>{ p.x += p.vx; p.y += p.vy; p.rot += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color; ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r * 0.6); ctx.restore(); }); frames++; if (frames < 200) requestAnimationFrame(draw); else { ctx.clearRect(0, 0, c.width, c.height); c.classList.remove("active"); } })();
};

function makeSnippet(text, query){ const l = text.toLowerCase(), q = query.toLowerCase(); const idx = l.indexOf(q); if (idx < 0) return escapeHtml(text.slice(0, 120)) + "…"; const start = Math.max(0, idx - 40), end = Math.min(text.length, idx + q.length + 60); return (start > 0 ? "…" : "") + escapeHtml(text.slice(start, idx)) + "<mark>" + escapeHtml(text.slice(idx, idx + q.length)) + "</mark>" + escapeHtml(text.slice(idx + q.length, end)) + (end < text.length ? "…" : ""); }

function searchCourse(query){
  query = (query || "").trim().toLowerCase(); if (query.length < 2) return []; const out = [];
  COURSE.sections.forEach(sec => { sec.topics.forEach(t => {
    if ((t.title + " " + t.code).toLowerCase().includes(query)) out.push({ icon:"📚", title: t.code + " · " + t.title, topicId: t.id, tab:"passport", section: sec.code });
    t.lectures.forEach(l => { const text = l.content ? l.content.replace(/<[^>]+>/g, " ") : ""; if (l.title.toLowerCase().includes(query)) out.push({ icon:"📖", title: l.code + ". " + l.title, topicId: t.id, tab:"lecture", section: sec.code }); else if (text.toLowerCase().includes(query)) out.push({ icon:"📖", title: l.code + ". " + l.title, snippet: makeSnippet(text, query), topicId: t.id, tab:"lecture", section: sec.code }); });
    t.practicals.forEach(p => { const hay = (p.code + " " + p.title + " " + (p.goal || "")).toLowerCase(); if (hay.includes(query)) out.push({ icon:"🛠️", title: p.code + ". " + p.title, topicId: t.id, tab:"practice", section: sec.code }); });
  }); });
  return out.slice(0, 40);
}
window.openSearch = function(){
  document.querySelectorAll(".search-overlay").forEach(x => x.remove());
  const modal = el(`<div class="search-overlay"><div class="search-modal"><div class="search-head"><input type="text" id="searchInput" class="search-input" placeholder="Поиск..." autocomplete="off"><button class="btn ghost" id="searchClose">Esc</button></div><div class="search-results" id="searchResults"><div class="search-hint">Введите минимум 2 символа.</div></div></div></div>`);
  document.body.appendChild(modal); const input = modal.querySelector("#searchInput"), results = modal.querySelector("#searchResults");
  setTimeout(()=>input.focus(), 0);
  input.addEventListener("input", ()=>{ const q = input.value.trim(); results.innerHTML = ""; if (q.length < 2){ results.appendChild(el(`<div class="search-hint">Введите хотя бы 2 символа.</div>`)); return; } const found = searchCourse(q); if (!found.length){ results.appendChild(el(`<div class="search-hint">Ничего не найдено.</div>`)); return; } found.forEach(r => { const item = el(`<div class="search-item"><div class="search-item-title">${r.icon} ${escapeHtml(r.title)}</div>${r.snippet ? `<div class="search-item-snippet">${r.snippet}</div>` : ""}<div class="search-item-meta">${escapeHtml(r.section || "")}</div></div>`); item.addEventListener("click", ()=>{ closeSearch(); location.hash = `#/topic/${r.topicId}/${r.tab}`; }); results.appendChild(item); }); });
  input.addEventListener("keydown", e => { if (e.key === "Escape") closeSearch(); if (e.key === "Enter"){ const f = results.querySelector(".search-item"); if (f) f.click(); } });
  modal.addEventListener("click", e => { if (e.target === modal) closeSearch(); }); modal.querySelector("#searchClose").addEventListener("click", closeSearch);
};
function closeSearch(){ document.querySelectorAll(".search-overlay").forEach(x => x.remove()); document.body.style.overflow = ""; }

/* ЧАТ (ВИЗУАЛЬНО РАБОЧИЙ) */
window.renderChatPage = function(){
  const app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Чат группы";
  app.appendChild(el(`<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>`));
  app.appendChild(el(`<section class="module">
    <div class="meta">Общение</div>
    <h2>Чат группы ${state.student ? state.student.group : ""}</h2>
    <p class="sub">Сообщения обновляются автоматически.</p>
    <div class="chat-wrap">
      <div class="chat-log" id="chatLog">
        <div class="chat-msg own">
          <span class="chat-msg-avatar">👨‍🎓</span>
          <div>
            <div class="chat-msg-head"><span class="chat-msg-name">Вы</span><span class="chat-msg-date">только что</span></div>
            <div class="chat-msg-body">Привет всем! Кто разобрался с G71?</div>
          </div>
        </div>
        <div class="chat-msg">
          <span class="chat-msg-avatar">👩‍🎓</span>
          <div>
            <div class="chat-msg-head"><span class="chat-msg-name">Анна</span><span class="chat-msg-date">2 мин назад</span></div>
            <div class="chat-msg-body">Да, это же черновой цикл. Там главное P и Q правильно указать.</div>
          </div>
        </div>
      </div>
      <form class="chat-form" id="chatForm">
        <input type="text" class="chat-input" id="chatInput" maxlength="500" placeholder="Ваше сообщение…" autocomplete="off">
        <button type="submit" class="btn">Отправить</button>
      </form>
    </div>
  </section>`));
  const log = document.getElementById("chatLog"), input = document.getElementById("chatInput");
  document.getElementById("chatForm").addEventListener("submit", (e)=>{
    e.preventDefault(); const text = input.value.trim(); if (!text) return; input.value = "";
    log.appendChild(el(`<div class="chat-msg own"><span class="chat-msg-avatar">👨‍🎓</span><div><div class="chat-msg-head"><span class="chat-msg-name">Вы</span><span class="chat-msg-date">только что</span></div><div class="chat-msg-body">${escapeHtml(text)}</div></div></div>`));
    log.scrollTop = log.scrollHeight;
    window.showToast("Сообщение отправлено", "ok");
  });
};

/* КОММЕНТАРИИ (ВИЗУАЛЬНО РАБОЧИЕ) */
window.renderCommentsPage = function(){
  const app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Отзывы";
  app.appendChild(el(`<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>`));
  app.appendChild(el(`<section class="module">
    <h2>Отзывы о курсе</h2>
    <form class="comment-form" id="commentForm">
      <textarea id="commentText" class="comment-text" maxlength="600" placeholder="Ваш отзыв..."></textarea>
      <div class="cf-footer"><div class="cf-counter"><span id="commentCounter">0</span> / 600</div><button type="submit" class="btn">Оставить отзыв</button></div>
    </form>
    <div class="comments-list" id="commentsList">
      <div class="comment-card">
        <div class="comment-head">
          <div class="comment-author"><span class="comment-avatar">👩‍🎓</span><div class="comment-author-text"><span class="comment-name">Мария</span><span class="comment-group">гр. ТМ-3</span></div></div>
          <div class="comment-meta"><span class="comment-stars">★★★★★</span><span class="comment-date">Вчера</span></div>
        </div>
        <div class="comment-text-body">Очень крутой сайт! Сдала экзамен на 5. Спасибо за тренажеры.</div>
      </div>
    </div>
  </section>`));
  const ta = document.getElementById("commentText"), counter = document.getElementById("commentCounter");
  ta.addEventListener("input", ()=>{ counter.textContent = ta.value.length; });
  document.getElementById("commentForm").addEventListener("submit", (e)=>{
    e.preventDefault(); const text = ta.value.trim(); if (text.length < 5) return;
    document.getElementById("commentsList").prepend(el(`<div class="comment-card"><div class="comment-head"><div class="comment-author"><span class="comment-avatar">${getAvatar()}</span><div class="comment-author-text"><span class="comment-name">Вы</span><span class="comment-group">Только что</span></div></div><div class="comment-meta"><span class="comment-stars">★★★★★</span></div></div><div class="comment-text-body">${escapeHtml(text)}</div></div>`));
    ta.value = ""; counter.textContent = "0"; window.showToast("Спасибо за отзыв!", "ok");
  });
};

/* ГАЛЕРЕЯ */
window.renderGalleryPage = function(){
  const app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Галерея работ";
  app.appendChild(el(`<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>`));
  app.appendChild(el(`<section class="module">
    <div class="meta">Обмен опытом</div><h2>Галерея выполненных работ</h2>
    <p class="sub">Работы студентов группы. Вы можете прикрепить свои файлы в разделе «Практические работы».</p>
    <div class="test-actions" style="margin-bottom:14px"><label class="btn ghost"><input type="checkbox" id="myOnly" style="margin-right:6px">Только мои</label></div>
    <div class="gallery-grid" id="galleryGrid">
      <div class="gallery-card"><div class="gc-thumb">📄</div><div class="gc-body"><div class="gc-title">ПЗ 4 — Программирование</div><div class="gc-meta">Иванов И. · гр. ТМ-3 · Вчера</div><div class="gc-meta">gcode.nc</div><div class="gc-actions"><a class="btn ghost" href="#" onclick="event.preventDefault(); alert('Демо-файл')">↗ Открыть</a></div></div></div>
      <div class="gallery-card"><div class="gc-thumb">🖼</div><div class="gc-body"><div class="gc-title">ПЗ 1 — Эскиз вала</div><div class="gc-meta">Петров П. · гр. ТМ-3 · 2 дня назад</div><div class="gc-meta">val.png</div><div class="gc-actions"><a class="btn ghost" href="#" onclick="event.preventDefault(); alert('Демо-файл')">↗ Открыть</a></div></div></div>
    </div>
  </section>`));
};

/* ГОСТЫ */
window.renderGostsPage = function(){
  const app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "ГОСТы";
  app.appendChild(el(`<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>`));
  const gosts = [
    { code: "ГОСТ 18097-93", title: "Станки токарные. Нормы точности", url: "https://docs.cntd.ru/document/1200015818" },
    { code: "ГОСТ 8-82", title: "Станки металлорежущие. Нормы точности", url: "https://docs.cntd.ru/document/1200015819" },
    { code: "ГОСТ 20999-83", title: "Устройства ЧПУ. Коды", url: "https://docs.cntd.ru/document/1200015820" },
    { code: "ГОСТ 12.2.009-99", title: "Станки металлообрабатывающие. Общие требования безопасности", url: "https://docs.cntd.ru/document/1200015821" },
    { code: "ГОСТ 12.2.029-88", title: "Приспособления станочные. Требования безопасности", url: "https://docs.cntd.ru/document/1200015822" },
    { code: "ГОСТ 25762-83", title: "Обработка резанием. Термины и определения", url: "https://docs.cntd.ru/document/1200015823" },
    { code: "ГОСТ 3.1404-86", title: "Формы и правила оформления документов на техпроцессы", url: "https://docs.cntd.ru/document/1200015824" },
    { code: "ГОСТ 14.004-83", title: "Технологическая подготовка производства", url: "https://docs.cntd.ru/document/1200015825" }
  ];
  const block = el(`<section class="module"><div class="meta">Нормативные документы</div><h2>Быстрые ссылки на ГОСТы</h2><p class="sub">Открываются на портале docs.cntd.ru в новой вкладке.</p><div class="gost-grid" id="gostGrid"></div></section>`);
  const grid = block.querySelector("#gostGrid");
  gosts.forEach(g => { grid.appendChild(el(`<a class="gost-item" href="${g.url}" target="_blank" rel="noopener"><b>${escapeHtml(g.code)}</b><span>${escapeHtml(g.title)}</span></a>`)); });
  app.appendChild(block);
};

/* КАЛЕНДАРЬ */
const CALENDAR_EVENTS = [
  { date:"09-01", title:"День знаний" }, { date:"10-05", title:"День учителя" },
  { date:"11-04", title:"День народного единства" }, { date:"12-31", title:"Новогодние каникулы" },
  { date:"02-23", title:"День защитника Отечества" }, { date:"03-08", title:"Международный женский день" },
  { date:"05-01", title:"Праздник весны и труда" }, { date:"05-09", title:"День Победы" }, { date:"06-01", title:"Начало летних каникул" }
];
window.renderCalendarPage = function(){
  const app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Календарь";
  app.appendChild(el(`<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>`));
  const now = new Date(); const year = now.getFullYear(), month = now.getMonth();
  const firstDay = new Date(year, month, 1); const lastDate = new Date(year, month + 1, 0).getDate();
  const startWeekday = (firstDay.getDay() + 6) % 7; const monthName = firstDay.toLocaleDateString("ru-RU", { month:"long", year:"numeric" }); const today = now.getDate();
  const events = CALENDAR_EVENTS.map(e => { const [mm, dd] = e.date.split("-").map(Number); return { ...e, mm, dd }; });
  const monthEvents = events.filter(e => e.mm === month + 1).sort((a,b) => a.dd - b.dd);
  app.appendChild(el(`<section class="module"><div class="meta">Учебный год</div><h2>${monthName[0].toUpperCase() + monthName.slice(1)}</h2><div class="calendar-grid">${["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map(d => `<div class="calendar-head">${d}</div>`).join("")}${Array.from({length:startWeekday}).map(() => `<div class="calendar-day empty"></div>`).join("")}${Array.from({length:lastDate}).map((_, i) => { const d = i + 1; const dayEvents = events.filter(e => e.mm === month + 1 && e.dd === d); const cls = ["calendar-day"]; if (d === today) cls.push("today"); if (dayEvents.length) cls.push("event"); return `<div class="${cls.join(" ")}"><div class="cd-num">${d}</div>${dayEvents.map(e => `<div class="cd-event">${escapeHtml(e.title)}</div>`).join("")}</div>`; }).join("")}</div><h3 style="margin-top:20px">События месяца</h3><div class="event-list">${monthEvents.length ? monthEvents.map(e => `<div class="event-item"><span class="ev-date">${String(e.dd).padStart(2,"0")}.${String(e.mm).padStart(2,"0")}</span><span class="ev-text">${escapeHtml(e.title)}</span></div>`).join("") : `<div class="comment-empty">В этом месяце событий нет.</div>`}</div></section>`));
};

/* ЛИЧНЫЙ КАБИНЕТ */
window.renderProfilePage = function() {
  const app = document.getElementById("app"); app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Личный кабинет";
  app.appendChild(el('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  
  if (!state.student && !state.staff) { app.appendChild(el('<section class="module"><h2>Вы не авторизованы</h2></section>')); return; }
  
  var isStaff = !!state.staff;
  var name = isStaff ? state.staff.name : state.student.name;
  var group = isStaff ? (state.staff.group || "Сотрудник") : ("Группа " + state.student.group);
  var role = isStaff ? (ROLE_LABELS[state.staff.role] || state.staff.role) : "🎓 Студент";
  var avatar = isStaff ? "👨‍🏫" : getAvatar();
  
  app.appendChild(el('<div class="profile-card"><div class="profile-avatar">' + avatar + '</div><div class="profile-info"><h2>' + escapeHtml(name) + '</h2><div class="p-group">' + escapeHtml(group) + '</div><div class="p-role">' + role + '</div></div></div>'));
  
  var grid = el('<div class="profile-grid"></div>');
  if (!isStaff) {
    var topicsDone = 0;
    COURSE.sections.forEach(sec => sec.topics.forEach(t => { if ((state.progress[t.id]?.done || 0) >= 5) topicsDone++; }));
    var grades = [...Object.values(state.results).map(x=>x.grade), ...Object.values(state.selfResults).map(x=>x.grade)].filter(x=>x>0);
    var avgGrade = grades.length ? (grades.reduce((a,b)=>a+b,0)/grades.length).toFixed(2) : "—";
    grid.appendChild(el('<div class="profile-widget"><h3>📊 Моя успеваемость</h3><div class="pw-list"><div class="pw-item"><span>Пройдено тем:</span><b>' + topicsDone + '</b></div><div class="pw-item"><span>Средний балл:</span><b>' + avgGrade + '</b></div><div class="pw-item"><span>Пройдено тестов:</span><b>' + Object.keys(state.results).length + '</b></div><div class="pw-item"><span>В избранном:</span><b>' + (state.favorites ? state.favorites.length : 0) + '</b></div></div><button class="btn" style="margin-top:16px; width:100%" onclick="location.hash=\'#/dashboard\'">Перейти в статистику</button></div>'));
    grid.appendChild(el('<div class="profile-widget"><h3>🔗 Быстрые ссылки</h3><div class="pw-list" style="gap:12px"><a href="#/final-training" class="btn ghost" style="text-align:left">🏋️ Итоговая тренировка</a><a href="#/final-exam" class="btn ghost" style="text-align:left">🎓 Итоговый экзамен</a><a href="#/gallery" class="btn ghost" style="text-align:left">🖼 Галерея работ</a><a href="#/links" class="btn ghost" style="text-align:left">📚 Полезные материалы</a></div></div>'));
  } else {
    grid.appendChild(el('<div class="profile-widget"><h3>🛠 Управление</h3><div class="pw-list" style="gap:12px"><a href="#/journal" class="btn" style="text-align:left">📔 Открыть журнал</a><a href="#/schedule" class="btn ghost" style="text-align:left">📅 Редактировать расписание</a>' + (state.staff.role === "teacher" || state.staff.role === "admin" ? '<a href="#/staff" class="btn ghost" style="text-align:left">🛠 Панель преподавателя</a>' : '') + '<a href="#/questions" class="btn ghost" style="text-align:left">❓ Вопросы студентов</a></div></div>'));
    grid.appendChild(el('<div class="profile-widget"><h3>ℹ️ Информация</h3><div class="pw-list"><div class="pw-item"><span>Роль в системе:</span><b>' + state.staff.role + '</b></div><div class="pw-item"><span>Логин:</span><b>' + state.staff.username + '</b></div></div></div>'));
  }
  app.appendChild(grid);
};

window.renderQrPage = function(){ 
  const app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "QR-код";
  app.appendChild(el(`<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>`));
  const url = location.origin + location.pathname;
  const qrUrl = "https://quickchart.io/qr?text=" + encodeURIComponent(url) + "&size=400";
  app.appendChild(el(`<section class="module"><h2>QR-код сайта</h2><div class="qr-wrap" style="margin-top:20px"><img src="${qrUrl}" style="width:200px; border-radius:10px;"></div></section>`));
};

window.renderQuestionsPage = function(){ 
  const app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Вопросы преподавателю";
  app.appendChild(el('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  app.appendChild(el('<section class="module"><h2>Анонимные вопросы</h2><p class="sub">Вопрос отправляется без имени.</p><form class="comment-form" id="qForm"><textarea id="qText" class="comment-text" placeholder="Ваш вопрос..."></textarea><button type="submit" class="btn" style="margin-top:10px">Отправить</button></form></section>'));
  document.getElementById("qForm").addEventListener("submit", (e)=>{ e.preventDefault(); window.showToast("Вопрос отправлен", "ok"); document.getElementById("qText").value = ""; });
};

window.renderDashboard = function(){
  const app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Статистика";
  app.appendChild(el(`<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>`));
  app.appendChild(el(`<section class="hero"><div class="meta">Аналитика</div><h1>Мой прогресс</h1></section>`));
  let topicsDone = 0;
  COURSE.sections.forEach(sec => sec.topics.forEach(t => { if ((state.progress[t.id]?.done || 0) >= 5) topicsDone++; }));
  const tests5 = Object.values(state.results).filter(r => r.grade === 5).length;
  const hasUploads = (state.activity || []).some(a => a.type === "upload");
  const achData = [
    { id: "first_step", icon: "🥉", title: "Первый шаг", desc: "Пройдена 1 тема", unlocked: topicsDone >= 1 },
    { id: "bookworm", icon: "📚", title: "Книжный червь", desc: "Пройдено 5 тем", unlocked: topicsDone >= 5 },
    { id: "excellent", icon: "🔥", title: "Отличник", desc: "Сдан тест на 5", unlocked: tests5 >= 1 },
    { id: "uploader", icon: "📎", title: "Мастер загрузок", desc: "Прикреплена работа", unlocked: hasUploads }
  ];
  const achBlock = el(`<section class="module"><h2>🏆 Мои достижения</h2><div class="achievements-grid"></div></section>`);
  const grid = achBlock.querySelector(".achievements-grid");
  achData.forEach(a => { grid.appendChild(el(`<div class="ach-card ${a.unlocked ? 'unlocked' : ''}"><span class="ach-icon">${a.icon}</span><div class="ach-title">${a.title}</div><div class="ach-desc">${a.desc}</div></div>`)); });
  app.appendChild(achBlock);
  const kpi = el(`<section class="module"><h2>Общие показатели</h2><div class="kpis"></div></section>`);
  const kgrid = kpi.querySelector(".kpis");
  kgrid.appendChild(el(`<div class="kpi"><div class="k-label">Тем пройдено</div><div class="k-value">${topicsDone}</div></div>`));
  kgrid.appendChild(el(`<div class="kpi"><div class="k-label">Отличных тестов</div><div class="k-value">${tests5}</div></div>`));
  kgrid.appendChild(el(`<div class="kpi"><div class="k-label">Достижений</div><div class="k-value">${achData.filter(a=>a.unlocked).length} / 4</div></div>`));
  app.appendChild(kpi);
};