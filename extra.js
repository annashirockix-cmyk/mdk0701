/* ============================================================
   МДК 07.01 — extra.js (С достижениями, G-кодом и тостами)
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

window.renderCommentsBlock = function(){
  const block = el(`<section class="module comments-module"><div class="meta">Отзывы</div><h2>Комментарии</h2><form class="comment-form" id="commentForm"><textarea id="commentText" class="comment-text" maxlength="600" placeholder="Ваш отзыв..."></textarea><div class="cf-footer"><div class="cf-counter"><span id="commentCounter">0</span> / 600</div><button type="submit" class="btn">Оставить отзыв</button></div><div class="comment-status" id="commentStatus"></div></form><div class="comments-list" id="commentsList"><div class="comment-empty">Загружаем…</div></div></section>`);
  const ta = block.querySelector("#commentText"); ta.addEventListener("input", ()=>{ block.querySelector("#commentCounter").textContent = ta.value.length; });
  block.querySelector("#commentForm").addEventListener("submit", async (e)=>{
    e.preventDefault(); const text = ta.value.trim(); if (text.length < 10){ window.showToast("Слишком короткий отзыв", "err"); return; }
    const p = new URLSearchParams(); p.append("action", "savecomment"); p.append("name", state.student?.name || "Гость"); p.append("group", state.student?.group || "—"); p.append("text", text); p.append("rating", "5");
    try { const res = await fetch(APPS_SCRIPT_URL, { method:"POST", body: p }); const d = await res.json(); if (d && d.ok){ window.showToast("Спасибо за отзыв!", "ok"); ta.value = ""; } else { window.showToast("Ошибка отправки", "err"); } } catch(err) { window.showToast("Нет сети", "err"); }
  });
  setTimeout(()=>{ block.querySelector("#commentsList").innerHTML = '<div class="comment-empty">Пока нет отзывов.</div>'; }, 500);
  return block;
};
window.renderCommentsPage = function(){ const app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Комментарии"; app.appendChild(el(`<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>`)); app.appendChild(window.renderCommentsBlock()); };

window.openUploadModal = function(topicId, workCode, workTitle){
  document.querySelectorAll(".avatar-overlay").forEach(x => x.remove());
  const modal = el(`<div class="avatar-overlay"><div class="avatar-modal"><h3>Прикрепить работу</h3><p class="avatar-sub">${workCode} — ${workTitle}</p><div class="upload-zone" id="uploadZone"><div class="uz-title">📎 Выберите файл</div><input type="file" id="uploadInput" hidden></div><div class="test-actions"><button class="btn ghost" id="uploadCancel">Отмена</button><button class="btn" id="uploadSend" disabled>Загрузить</button></div></div></div>`);
  document.body.appendChild(modal); const zone = modal.querySelector("#uploadZone"), inp = modal.querySelector("#uploadInput"), sendBtn = modal.querySelector("#uploadSend"); let file = null;
  zone.addEventListener("click", ()=>inp.click()); inp.addEventListener("change", ()=>{ file = inp.files[0]; if (file){ zone.querySelector(".uz-title").textContent = "📎 " + file.name; sendBtn.disabled = false; } });
  modal.querySelector("#uploadCancel").addEventListener("click", ()=>modal.remove());
  sendBtn.addEventListener("click", ()=>{ window.showToast("Файл загружен (демо)", "ok"); modal.remove(); });
};

window.renderTeacherPage = function(){ const app = document.getElementById("app"); app.innerHTML = "<h2>Панель преподавателя</h2><p>В разработке</p>"; };

/* ДАШБОРД С ДОСТИЖЕНИЯМИ */
window.renderDashboard = function(){
  const app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Статистика";
  app.appendChild(el(`<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>`));
  app.appendChild(el(`<section class="hero"><div class="meta">Аналитика</div><h1>Мой прогресс</h1></section>`));

  // ДОСТИЖЕНИЯ
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
  achData.forEach(a => {
    grid.appendChild(el(`<div class="ach-card ${a.unlocked ? 'unlocked' : ''}"><span class="ach-icon">${a.icon}</span><div class="ach-title">${a.title}</div><div class="ach-desc">${a.desc}</div></div>`));
  });
  app.appendChild(achBlock);

  // Прогресс
  app.appendChild(el(`<section class="module"><h2>Общие показатели</h2><div class="kpis"><div class="kpi"><div class="k-label">Тем пройдено</div><div class="k-value">${topicsDone}</div></div><div class="kpi"><div class="k-label">Отличных тестов</div><div class="k-value">${tests5}</div></div></div></section>`));
};

/* G-CODE С ВИЗУАЛИЗАТОРОМ */
const GCODE_SAMPLES = {
  "ПЗ 4": `N10 G21 G40 G90\nN20 T0101\nN30 S1200 M3\nN40 G0 X42 Z2\nN50 G1 Z0 F0.15\nN60 X-0.5\nN70 G0 X42 Z2\nN80 T0202\nN90 S1400 M3\nN100 G1 X30 Z-40 F0.1\nN110 G3 X20 Z-45 R5\nN120 G0 X50 Z50\nN130 M5\nN140 M30`
};
function highlightGCode(text){
  return text.split("\n").map(line => {
    let safe = escapeHtml(line);
    safe = safe.replace(/(\([^)]*\))/g, '<span class="comment">$1</span>').replace(/\b(G\d+(\.\d+)?)/g, '<span class="g">$1</span>').replace(/\b(M\d+)/g, '<span class="m">$1</span>').replace(/\b([XYZIJKRUW]-?\d+(\.\d+)?)/g, '<span class="xyz">$1</span>').replace(/\b([FSTP]-?\d+(\.\d+)?)/g, '<span class="f">$1</span>').replace(/\b(N\d+)/g, '<span class="n">$1</span>');
    return '<span class="gcode-line">' + safe + '</span>';
  }).join("\n");
}
window.openGCodeModal = function(workCode){
  const samples = Object.keys(GCODE_SAMPLES);
  const initial = GCODE_SAMPLES[workCode] || GCODE_SAMPLES[samples[0]];
  const modal = el(`<div class="avatar-overlay"><div class="avatar-modal" style="max-width:900px"><h3>Просмотрщик G-кода</h3><div style="display:grid;grid-template-columns:1fr;gap:12px"><div><pre class="gcode-view" id="gcodeRef">${highlightGCode(initial)}</pre></div><div class="gcode-canvas-wrap"><canvas id="gcodeCanvas" class="gcode-canvas"></canvas></div></div><div class="test-actions" style="margin-top:14px"><button class="btn" id="gcodeDraw">Нарисовать траекторию</button><button class="btn ghost" id="gcodeClose">Закрыть</button></div></div></div>`);
  document.body.appendChild(modal); modal.querySelector("#gcodeClose").addEventListener("click", ()=>modal.remove());
  
  modal.querySelector("#gcodeDraw").addEventListener("click", ()=>{
    const canvas = modal.querySelector("#gcodeCanvas"); const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Рисуем сетку
    ctx.strokeStyle = "#333"; ctx.lineWidth = 1;
    for(let i=0; i<canvas.width; i+=30) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); ctx.stroke(); }
    for(let i=0; i<canvas.height; i+=30) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(canvas.width,i); ctx.stroke(); }
    
    // Парсим G-код (только G00, G01, X, Z)
    let cx = 50, cz = 50; // Начало координат
    ctx.beginPath(); ctx.moveTo(cx, cz);
    const lines = initial.split("\n");
    lines.forEach(line => {
      const matchG = line.match(/G(\d+)/);
      const matchX = line.match(/X(-?\d+\.?\d*)/);
      const matchZ = line.match(/Z(-?\d+\.?\d*)/);
      if (matchG) {
        const g = parseInt(matchG[1]);
        if (g === 0 || g === 1) {
          if (matchX) cx += parseFloat(matchX[1]) * 1.5;
          if (matchZ) cz += parseFloat(matchZ[1]) * 1.5;
          ctx.strokeStyle = g === 0 ? "#ffeb3b" : "#4caf50"; // Желтый для быстрых, зеленый для рабочих
          ctx.lineTo(cx, cz); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx, cz);
        }
      }
    });
    window.showToast("Траектория построена", "ok");
  });
};

window.renderGCodeReferencePage = function(){ const app = document.getElementById("app"); app.innerHTML = "<h2>Справочник G/M</h2><button class='btn' onclick='openGCodeModal()'>Открыть визуализатор</button>"; };

window.renderChatPage = function(){ document.getElementById("app").innerHTML = "<h2>Чат группы</h2><p>В разработке</p>"; };
window.renderQuestionsPage = function(){ document.getElementById("app").innerHTML = "<h2>Вопросы</h2><p>В разработке</p>"; };
window.renderGalleryPage = function(){ document.getElementById("app").innerHTML = "<h2>Галерея</h2><p>В разработке</p>"; };
window.renderCalendarPage = function(){ document.getElementById("app").innerHTML = "<h2>Календарь</h2><p>В разработке</p>"; };
window.renderGostsPage = function(){ document.getElementById("app").innerHTML = "<h2>ГОСТы</h2><p>В разработке</p>"; };
window.renderQrPage = function(){ document.getElementById("app").innerHTML = "<h2>QR-код</h2><p>В разработке</p>"; };

function activityIcon(type){ return type === "login" ? "🚪" : type === "topic" ? "📖" : type === "test" ? "📝" : type === "upload" ? "📎" : "🔔"; }