/* ============================================================
   МДК 07.01 — Дополнительные модули:
   PWA, офлайн-очередь, комментарии (ветки+лайки), чат,
   вопросы, галерея, панель преподавателя, поиск, дашборд,
   конфетти, звуки, календарь, ГОСТы, QR, горячие клавиши.
   ============================================================ */

/* ============================================================
   PWA
   ============================================================ */
if ("serviceWorker" in navigator){
  window.addEventListener("load", ()=>{
    navigator.serviceWorker.register("./sw.js").catch(()=>{});
  });
}

/* ============================================================
   Офлайн-очередь на IndexedDB
   ============================================================ */
window.OfflineQueue = (()=>{
  const DB_NAME = "mdk0701-queue";
  const STORE   = "queue";
  let db = null;
  function open(){
    return new Promise((res, rej)=>{
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = ()=>{ req.result.createObjectStore(STORE, { keyPath:"id", autoIncrement:true }); };
      req.onsuccess = ()=>{ db = req.result; res(db); };
      req.onerror   = ()=> rej(req.error);
    });
  }
  async function enqueue(item){
    if (!db) await open();
    return new Promise((res, rej)=>{
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).add({ ...item, ts: Date.now() });
      tx.oncomplete = ()=>res(); tx.onerror = ()=>rej(tx.error);
    });
  }
  async function all(){
    if (!db) await open();
    return new Promise(res=>{
      const tx = db.transaction(STORE, "readonly");
      const r = tx.objectStore(STORE).getAll();
      r.onsuccess = ()=>res(r.result || []);
      r.onerror = ()=>res([]);
    });
  }
  async function clear(){
    if (!db) await open();
    return new Promise(res=>{
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).clear();
      tx.oncomplete = ()=>res(); tx.onerror = ()=>res();
    });
  }
  async function flush(){
    if (!navigator.onLine || !state.student) return;
    const items = await all();
    if (!items.length) return;
    for (const item of items){
      try {
        if (item.kind === "save"){
          const params = new URLSearchParams();
          params.append("action", "save");
          params.append("key", studentKey());
          params.append("name", state.student.name);
          params.append("group", state.student.group);
          params.append("payload", JSON.stringify(item.payload));
          const res = await fetch(APPS_SCRIPT_URL, { method:"POST", body: params });
          const data = await res.json();
          if (!data.ok) break;
        }
      } catch (err){ return; }
    }
    await clear();
    setSyncStatus("✔ Очередь синхронизирована");
  }
  return { enqueue, flush, all, clear };
})();

/* ============================================================
   КОНФЕТТИ + ЗВУКИ
   ============================================================ */
window.celebrate = function(){
  const c = document.getElementById("confettiCanvas");
  if (!c) return;
  c.width = window.innerWidth; c.height = window.innerHeight;
  c.classList.add("active");
  const ctx = c.getContext("2d");
  const pieces = Array.from({ length: 120 }, ()=>({
    x: Math.random() * c.width,
    y: -20 - Math.random() * c.height * 0.3,
    r: 4 + Math.random() * 6,
    vy: 2 + Math.random() * 4,
    vx: -1 + Math.random() * 2,
    color: ["#c14a2a","#f0b400","#2d7a4f","#4a90d9","#ff6b3d"][Math.floor(Math.random()*5)],
    rot: Math.random() * Math.PI * 2,
    vr: -0.15 + Math.random() * 0.3
  }));
  let frames = 0;
  (function draw(){
    ctx.clearRect(0, 0, c.width, c.height);
    pieces.forEach(p=>{
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.color; ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r * 0.6);
      ctx.restore();
    });
    frames++;
    if (frames < 200) requestAnimationFrame(draw);
    else { ctx.clearRect(0, 0, c.width, c.height); c.classList.remove("active"); }
  })();
};

window.playSound = (()=>{
  const ctx = (()=>{ try { return new (window.AudioContext || window.webkitAudioContext)(); } catch(e){ return null; } })();
  const enabled = ()=> localStorage.getItem("mdk0701.sound") !== "off";
  function beep(freq, dur, type="sine", vol=0.06){
    if (!ctx || !enabled()) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g).connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.stop(ctx.currentTime + dur);
  }
  return function(kind){
    if (kind === "ok")  beep(880, 0.08);
    if (kind === "win"){ beep(523,0.1); setTimeout(()=>beep(659,0.1),90); setTimeout(()=>beep(784,0.15),190); }
    if (kind === "done") beep(660, 0.12);
    if (kind === "click") beep(440, 0.03, "square", 0.03);
  };
})();

/* ============================================================
   ПОИСК
   ============================================================ */
function makeSnippet(text, query){
  const l = text.toLowerCase(), q = query.toLowerCase();
  const idx = l.indexOf(q);
  if (idx < 0) return escapeHtml(text.slice(0, 120)) + "…";
  const start = Math.max(0, idx - 40), end = Math.min(text.length, idx + q.length + 60);
  return (start > 0 ? "…" : "") + escapeHtml(text.slice(start, idx)) +
         "<mark>" + escapeHtml(text.slice(idx, idx + q.length)) + "</mark>" +
         escapeHtml(text.slice(idx + q.length, end)) + (end < text.length ? "…" : "");
}
function searchCourse(query){
  query = (query || "").trim().toLowerCase();
  if (query.length < 2) return [];
  const out = [];
  COURSE.sections.forEach(sec => {
    const secLabel = sec.code + " · " + sec.title;
    sec.topics.forEach(t => {
      if ((t.title + " " + t.code).toLowerCase().includes(query))
        out.push({ icon:"📚", title: t.code + " · " + t.title, topicId: t.id, tab:"passport", section: secLabel });
      t.lectures.forEach(l => {
        const text = stripHtml(l.content || "");
        if (l.title.toLowerCase().includes(query))
          out.push({ icon:"📖", title: l.code + ". " + l.title, topicId: t.id, tab:"lecture", section: secLabel });
        else if (text.toLowerCase().includes(query))
          out.push({ icon:"📖", title: l.code + ". " + l.title, snippet: makeSnippet(text, query), topicId: t.id, tab:"lecture", section: secLabel });
      });
      t.practicals.forEach(p => {
        const hay = (p.code + " " + p.title + " " + (p.goal || "") + " " + (p.task || "")).toLowerCase();
        if (hay.includes(query))
          out.push({ icon:"🛠️", title: p.code + ". " + p.title, topicId: t.id, tab:"practice", section: secLabel });
      });
    });
  });
  return out.slice(0, 40);
}
window.openSearch = function(){
  document.querySelectorAll(".search-overlay").forEach(x => x.remove());
  const modal = el(`<div class="search-overlay"><div class="search-modal">
    <div class="search-head">
      <input type="text" id="searchInput" class="search-input" placeholder="Поиск по темам, лекциям, практикам… (Ctrl+K)" autocomplete="off">
      <button class="btn ghost" id="searchClose">Esc</button>
    </div>
    <div class="search-results" id="searchResults"><div class="search-hint">Введите минимум 2 символа.</div></div>
  </div></div>`);
  document.body.appendChild(modal);
  const input = modal.querySelector("#searchInput");
  const results = modal.querySelector("#searchResults");
  setTimeout(()=>input.focus(), 0);
  input.addEventListener("input", ()=>{
    const q = input.value.trim();
    results.innerHTML = "";
    if (q.length < 2){ results.appendChild(el(`<div class="search-hint">Введите хотя бы 2 символа.</div>`)); return; }
    const found = searchCourse(q);
    if (!found.length){ results.appendChild(el(`<div class="search-hint">Ничего не найдено.</div>`)); return; }
    found.forEach(r => {
      const item = el(`<div class="search-item">
        <div class="search-item-title">${r.icon} ${escapeHtml(r.title)}</div>
        ${r.snippet ? `<div class="search-item-snippet">${r.snippet}</div>` : ""}
        <div class="search-item-meta">${escapeHtml(r.section || "")}</div></div>`);
      item.addEventListener("click", ()=>{
        closeSearch();
        location.hash = `#/topic/${r.topicId}/${r.tab}`;
      });
      results.appendChild(item);
    });
  });
  input.addEventListener("keydown", e => {
    if (e.key === "Escape") closeSearch();
    if (e.key === "Enter"){ const f = results.querySelector(".search-item"); if (f) f.click(); }
  });
  modal.addEventListener("click", e => { if (e.target === modal) closeSearch(); });
  modal.querySelector("#searchClose").addEventListener("click", closeSearch);
};
function closeSearch(){
  document.querySelectorAll(".search-overlay").forEach(x => x.remove());
  document.body.style.overflow = "";
}

/* ============================================================
   КОММЕНТАРИИ: ВЕТКИ + ЛАЙКИ
   ============================================================ */
async function loadComments(){
  try {
    const res = await fetch(APPS_SCRIPT_URL + "?action=loadcomments");
    const data = await res.json();
    if (data && data.ok && Array.isArray(data.comments)) return data.comments;
  } catch (err){}
  return null;
}
async function saveComment(payload){
  const p = new URLSearchParams();
  p.append("action", "savecomment");
  p.append("name", payload.name);
  p.append("group", payload.group);
  p.append("rating", String(payload.rating || 5));
  p.append("text", payload.text);
  p.append("avatar", payload.avatar || DEFAULT_AVATAR);
  p.append("parentId", payload.parentId || "");
  try {
    const res = await fetch(APPS_SCRIPT_URL, { method:"POST", body: p });
    const d = await res.json();
    return d && d.ok;
  } catch (err){ return false; }
}
async function likeComment(id, kind){
  const p = new URLSearchParams();
  p.append("action", "likecomment");
  p.append("id", id);
  p.append("kind", kind);
  p.append("key", studentKey());
  try {
    const res = await fetch(APPS_SCRIPT_URL, { method:"POST", body: p });
    const d = await res.json();
    return d && d.ok;
  } catch (err){ return false; }
}
function buildCommentTree(flat){
  const byId = {}, roots = [];
  flat.forEach(c => { byId[c.id] = { ...c, children: [] }; });
  flat.forEach(c => {
    if (c.parentId && byId[c.parentId]) byId[c.parentId].children.push(byId[c.id]);
    else roots.push(byId[c.id]);
  });
  const sortFn = (a, b)=> new Date(b.date) - new Date(a.date);
  roots.sort(sortFn); Object.values(byId).forEach(c => c.children.sort(sortFn));
  return roots;
}
window.renderCommentsBlock = function(){
  const block = el(`<section class="module comments-module">
    <div class="meta">Отзывы выпускников</div>
    <h2>Комментарии прошедших курс</h2>
    <p class="sub">Ответить можно на любой отзыв. Комментарии старше 5 лет удаляются автоматически.</p>

    <form class="comment-form" id="commentForm">
      <div class="cf-row"><label>Оценка</label>
        <div class="star-rating" id="starRating">
          <input type="radio" name="rating" value="5" id="r5" checked><label for="r5">★</label>
          <input type="radio" name="rating" value="4" id="r4"><label for="r4">★</label>
          <input type="radio" name="rating" value="3" id="r3"><label for="r3">★</label>
          <input type="radio" name="rating" value="2" id="r2"><label for="r2">★</label>
          <input type="radio" name="rating" value="1" id="r1"><label for="r1">★</label>
        </div></div>
      <textarea id="commentText" class="comment-text" maxlength="600" placeholder="Что помогло, что запомнилось… (до 600 символов)"></textarea>
      <div class="cf-footer"><div class="cf-counter"><span id="commentCounter">0</span> / 600</div>
        <button type="submit" class="btn">Оставить отзыв</button></div>
      <div class="comment-status" id="commentStatus"></div>
    </form>

    <div class="comments-list" id="commentsList"><div class="comment-empty">Загружаем отзывы…</div></div>
  </section>`);
  const ta = block.querySelector("#commentText");
  const counter = block.querySelector("#commentCounter");
  ta.addEventListener("input", ()=>{ counter.textContent = ta.value.length; });
  block.querySelector("#commentForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const status = block.querySelector("#commentStatus");
    const text = ta.value.trim();
    if (text.length < 10){ status.textContent = "Слишком короткий отзыв."; status.className = "comment-status bad"; return; }
    const rating = Number((block.querySelector('input[name="rating"]:checked') || {}).value || 5);
    status.textContent = "Отправляем…"; status.className = "comment-status";
    const ok = await saveComment({
      name: state.student?.name || "Гость", group: state.student?.group || "—",
      rating, text, avatar: getAvatar()
    });
    if (ok){
      status.textContent = "✔ Спасибо!"; status.className = "comment-status ok";
      ta.value = ""; counter.textContent = "0";
      logActivity("comment", "Оставлен отзыв");
      await refreshComments(block.querySelector("#commentsList"));
    } else {
      status.textContent = "Не удалось отправить."; status.className = "comment-status bad";
    }
  });
  setTimeout(()=>refreshComments(block.querySelector("#commentsList")), 50);
  return block;
};
async function refreshComments(container){
  const list = await loadComments();
  container.innerHTML = "";
  if (list === null){ container.appendChild(el(`<div class="comment-empty">Не удалось загрузить отзывы.</div>`)); return; }
  if (!list.length){ container.appendChild(el(`<div class="comment-empty">Пока нет отзывов.</div>`)); return; }
  const tree = buildCommentTree(list);
  tree.forEach(c => container.appendChild(renderComment(c, 0)));
}
function renderComment(c, depth){
  const date = new Date(c.date);
  const dateStr = date.toLocaleDateString("ru-RU", { day:"2-digit", month:"long", year:"numeric" });
  const r = Math.max(1, Math.min(5, c.rating));
  const stars = "★".repeat(r) + "☆".repeat(5 - r);
  const liked = (c.likedBy || []).includes(studentKey());
  const card = el(`<div class="comment-card" data-id="${c.id}">
    <div class="comment-head">
      <div class="comment-author">
        <span class="comment-avatar">${escapeHtml(c.avatar || DEFAULT_AVATAR)}</span>
        <div class="comment-author-text">
          <span class="comment-name">${escapeHtml(c.name)}</span>
          <span class="comment-group">гр. ${escapeHtml(c.group)}${c.children?.length ? ` <span class="replies-badge">${c.children.length} ответ${c.children.length===1?"":"ов"}</span>` : ""}</span>
        </div>
      </div>
      <div class="comment-meta">
        <span class="comment-stars">${stars}</span>
        <span class="comment-date">${dateStr}</span>
      </div>
    </div>
    <div class="comment-text-body">${escapeHtml(c.text)}</div>
    <div class="comment-actions">
      <button class="comment-action like-btn ${liked ? "active" : ""}" data-kind="like">👍 ${c.likes || 0}</button>
      <button class="comment-action like-btn" data-kind="heart">❤️ ${c.hearts || 0}</button>
      <button class="comment-action reply-btn">↩ Ответить</button>
    </div>
    <div class="comment-reply-form" hidden>
      <textarea placeholder="Ваш ответ…" maxlength="500"></textarea>
      <div class="test-actions">
        <button class="btn reply-send">Отправить</button>
        <button class="btn ghost reply-cancel">Отмена</button>
      </div>
    </div>
    ${c.children?.length ? `<div class="comment-children"></div>` : ""}
  </div>`);

  card.querySelectorAll(".like-btn").forEach(b => b.addEventListener("click", async ()=>{
    const kind = b.dataset.kind;
    b.disabled = true;
    await likeComment(c.id, kind);
    b.disabled = false;
    refreshComments(document.getElementById("commentsList"));
  }));

  const replyForm = card.querySelector(".comment-reply-form");
  card.querySelector(".reply-btn").addEventListener("click", ()=> replyForm.hidden = !replyForm.hidden);
  card.querySelector(".reply-cancel").addEventListener("click", ()=> replyForm.hidden = true);
  card.querySelector(".reply-send").addEventListener("click", async ()=>{
    const text = replyForm.querySelector("textarea").value.trim();
    if (text.length < 2) return;
    const ok = await saveComment({
      name: state.student?.name || "Гость", group: state.student?.group || "—",
      rating: 5, text, avatar: getAvatar(), parentId: c.id
    });
    if (ok) refreshComments(document.getElementById("commentsList"));
  });

  if (c.children?.length){
    const box = card.querySelector(".comment-children");
    c.children.forEach(ch => box.appendChild(renderComment(ch, depth + 1)));
  }
  return card;
}
window.renderCommentsPage = function(){
  const app = document.getElementById("app");
  app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Комментарии";
  setActiveTopBtn("comments");
  app.appendChild(el(`<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>`));
  const wrap = el(`<div class="comments-page"></div>`);
  wrap.appendChild(window.renderCommentsBlock());
  app.appendChild(wrap);
};

/* ============================================================
   ЧАТ ГРУППЫ
   ============================================================ */
async function loadChat(since){
  const p = new URLSearchParams();
  p.append("action", "chatload");
  p.append("group", state.student.group);
  if (since) p.append("since", since);
  try {
    const res = await fetch(APPS_SCRIPT_URL + "?" + p.toString());
    const d = await res.json();
    if (d && d.ok && Array.isArray(d.messages)) return d.messages;
  } catch (err){}
  return [];
}
async function sendChat(text){
  const p = new URLSearchParams();
  p.append("action", "chatsave");
  p.append("group", state.student.group);
  p.append("key",   studentKey());
  p.append("name",  state.student.name);
  p.append("avatar", getAvatar());
  p.append("text",  text);
  try {
    const res = await fetch(APPS_SCRIPT_URL, { method:"POST", body: p });
    const d = await res.json();
    return d && d.ok;
  } catch (err){ return false; }
}
window.renderChatPage = function(){
  const app = document.getElementById("app");
  app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Чат группы " + state.student.group;
  setActiveTopBtn("chat");
  app.appendChild(el(`<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>`));
  app.appendChild(el(`<section class="module">
    <div class="meta">Общение</div>
    <h2>Чат группы ${state.student.group}</h2>
    <p class="sub">Сообщения обновляются автоматически каждые 5 секунд.</p>
    <div class="chat-wrap">
      <div class="chat-log" id="chatLog"><div class="comment-empty">Загружаем сообщения…</div></div>
      <form class="chat-form" id="chatForm">
        <input type="text" class="chat-input" id="chatInput" maxlength="500" placeholder="Ваше сообщение…" autocomplete="off">
        <button type="submit" class="btn">Отправить</button>
      </form>
    </div>
  </section>`));

  const log = document.getElementById("chatLog");
  const input = document.getElementById("chatInput");
  let lastTs = "";

  async function refresh(){
    const msgs = await loadChat(lastTs);
    if (!msgs.length) return;
    if (log.querySelector(".comment-empty")) log.innerHTML = "";
    msgs.forEach(m=>{
      const own = m.key === studentKey();
      const wrap = el(`<div class="chat-msg ${own ? "own" : ""}">
        <span class="chat-msg-avatar">${escapeHtml(m.avatar || DEFAULT_AVATAR)}</span>
        <div>
          <div class="chat-msg-head">
            <span class="chat-msg-name">${escapeHtml(m.name)}</span>
            <span class="chat-msg-date">${fmtRel(m.date)}</span>
          </div>
          <div class="chat-msg-body">${escapeHtml(m.text)}</div>
        </div></div>`);
      log.appendChild(wrap);
      lastTs = m.date;
    });
    log.scrollTop = log.scrollHeight;
  }
  refresh();
  const tick = setInterval(()=>{
    if (!document.body.contains(log)){ clearInterval(tick); return; }
    refresh();
  }, 5000);

  document.getElementById("chatForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    if (await sendChat(text)){
      logActivity("chat", "Сообщение в чате");
      refresh();
    }
  });
};

/* ============================================================
   АНОНИМНЫЕ ВОПРОСЫ
   ============================================================ */
async function loadQuestions(){
  try {
    const res = await fetch(APPS_SCRIPT_URL + "?action=questionsload");
    const d = await res.json();
    if (d && d.ok && Array.isArray(d.questions)) return d.questions;
  } catch (err){}
  return [];
}
async function sendQuestion(text){
  const p = new URLSearchParams();
  p.append("action", "questionsave");
  p.append("text", text);
  p.append("key", studentKey());
  try {
    const res = await fetch(APPS_SCRIPT_URL, { method:"POST", body: p });
    const d = await res.json();
    return d && d.ok;
  } catch (err){ return false; }
}
window.renderQuestionsPage = function(){
  const app = document.getElementById("app");
  app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Вопросы преподавателю";
  setActiveTopBtn("questions");
  app.appendChild(el(`<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>`));
  app.appendChild(el(`<section class="module">
    <div class="meta">Обратная связь</div>
    <h2>Анонимные вопросы</h2>
    <p class="sub">Вопрос отправляется без имени. Преподаватель видит его в своей панели и отвечает публично.</p>
    <form class="comment-form" id="questionForm">
      <textarea id="questionText" class="comment-text" maxlength="500" placeholder="Что хотите уточнить? (до 500 символов)"></textarea>
      <div class="cf-footer"><div class="cf-counter"><span id="questionCounter">0</span> / 500</div>
        <button type="submit" class="btn">Отправить анонимно</button></div>
      <div class="comment-status" id="questionStatus"></div>
    </form>
    <h3>Общий список</h3>
    <div id="questionsList"><div class="comment-empty">Загружаем…</div></div>
  </section>`));

  const ta = document.getElementById("questionText");
  const c = document.getElementById("questionCounter");
  ta.addEventListener("input", ()=>{ c.textContent = ta.value.length; });
  document.getElementById("questionForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const st = document.getElementById("questionStatus");
    const text = ta.value.trim();
    if (text.length < 5){ st.textContent = "Слишком коротко."; st.className = "comment-status bad"; return; }
    st.textContent = "Отправляем…"; st.className = "comment-status";
    if (await sendQuestion(text)){
      st.textContent = "✔ Вопрос отправлен."; st.className = "comment-status ok";
      ta.value = ""; c.textContent = "0";
      logActivity("question", "Анонимный вопрос");
      refreshQ();
    } else { st.textContent = "Не удалось отправить."; st.className = "comment-status bad"; }
  });

  async function refreshQ(){
    const list = document.getElementById("questionsList");
    const qs = await loadQuestions();
    list.innerHTML = "";
    if (!qs.length){ list.appendChild(el(`<div class="comment-empty">Пока нет вопросов.</div>`)); return; }
    qs.reverse().forEach(q=>{
      list.appendChild(el(`<div class="question-card ${q.answer ? "answered" : "pending"}">
        <div class="qhead">
          <span class="qmeta">${fmtRel(q.date)} · ${q.answer ? "Отвечено" : "Ожидает ответа"}</span>
        </div>
        <div class="qtext">${escapeHtml(q.text)}</div>
        ${q.answer ? `<div class="qanswer">${escapeHtml(q.answer)}</div>` : ""}
      </div>`));
    });
  }
  refreshQ();
};

/* ============================================================
   ГАЛЕРЕЯ РАБОТ
   ============================================================ */
window.openUploadModal = function(topicId, workCode, workTitle){
  document.querySelectorAll(".avatar-overlay").forEach(x => x.remove());
  const modal = el(`<div class="avatar-overlay">
    <div class="avatar-modal">
      <h3>Прикрепить работу</h3>
      <p class="avatar-sub">${workCode} — ${workTitle}</p>
      <div class="upload-zone" id="uploadZone">
        <div class="uz-title">📎 Перетащите файл сюда</div>
        <div class="uz-hint">или нажмите для выбора. До 5 МБ: PDF, DOCX, PNG, JPG, NC, TXT, ZIP</div>
        <input type="file" id="uploadInput" hidden accept=".pdf,.docx,.png,.jpg,.jpeg,.nc,.txt,.zip">
      </div>
      <div class="test-actions">
        <button class="btn ghost" id="uploadCancel">Отмена</button>
        <button class="btn" id="uploadSend" disabled>Загрузить</button>
      </div>
      <div class="comment-status" id="uploadStatus"></div>
    </div>
  </div>`);
  document.body.appendChild(modal);
  const zone = modal.querySelector("#uploadZone");
  const inp = modal.querySelector("#uploadInput");
  const sendBtn = modal.querySelector("#uploadSend");
  const status = modal.querySelector("#uploadStatus");
  let file = null;

  const pick = ()=>{
    if (file){
      zone.querySelector(".uz-title").textContent = "📎 " + file.name;
      zone.querySelector(".uz-hint").textContent = (file.size / 1024).toFixed(1) + " КБ";
      sendBtn.disabled = false;
    }
  };
  zone.addEventListener("click", ()=>inp.click());
  inp.addEventListener("change", ()=>{ file = inp.files[0]; pick(); });
  zone.addEventListener("dragover", e => { e.preventDefault(); zone.classList.add("drag"); });
  zone.addEventListener("dragleave", ()=>zone.classList.remove("drag"));
  zone.addEventListener("drop", e => { e.preventDefault(); zone.classList.remove("drag"); file = e.dataTransfer.files[0]; pick(); });

  modal.querySelector("#uploadCancel").addEventListener("click", ()=>modal.remove());
  sendBtn.addEventListener("click", async ()=>{
    if (!file) return;
    if (file.size > 5 * 1024 * 1024){ status.textContent = "Файл > 5 МБ"; status.className = "comment-status bad"; return; }
    status.textContent = "Загружаем…"; status.className = "comment-status";
    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = String(reader.result).split(",")[1];
      const p = new URLSearchParams();
      p.append("action", "uploadwork");
      p.append("key", studentKey());
      p.append("name", state.student.name);
      p.append("group", state.student.group);
      p.append("avatar", getAvatar());
      p.append("topicId", topicId);
      p.append("workCode", workCode);
      p.append("workTitle", workTitle);
      p.append("fileName", file.name);
      p.append("fileType", file.type || "application/octet-stream");
      p.append("fileData", b64);
      try {
        const res = await fetch(APPS_SCRIPT_URL, { method:"POST", body: p });
        const d = await res.json();
        if (d && d.ok){
          status.textContent = "✔ Загружено!"; status.className = "comment-status ok";
          logActivity("upload", `Прикреплена работа ${workCode}`);
          setTimeout(()=>modal.remove(), 900);
        } else {
          status.textContent = "Ошибка: " + (d.error || "—"); status.className = "comment-status bad";
        }
      } catch (err){
        status.textContent = "Ошибка загрузки"; status.className = "comment-status bad";
      }
    };
    reader.readAsDataURL(file);
  });
};
async function loadWorks(){
  try {
    const p = new URLSearchParams();
    p.append("action", "worksload");
    p.append("group", state.student.group);
    const res = await fetch(APPS_SCRIPT_URL + "?" + p.toString());
    const d = await res.json();
    if (d && d.ok && Array.isArray(d.works)) return d.works;
  } catch (err){}
  return [];
}
window.renderGalleryPage = function(){
  const app = document.getElementById("app");
  app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Галерея работ";
  app.appendChild(el(`<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>`));
  app.appendChild(el(`<section class="module">
    <div class="meta">Обмен опытом</div>
    <h2>Галерея выполненных работ</h2>
    <p class="sub">Работы студентов группы. Каждый видит только то, что было загружено с разрешения автора.</p>
    <div class="test-actions" style="margin-bottom:14px">
      <label class="btn ghost"><input type="checkbox" id="myOnly" style="margin-right:6px">Только мои</label>
    </div>
    <div class="gallery-grid" id="galleryGrid"><div class="comment-empty">Загружаем…</div></div>
  </section>`));

  async function refresh(){
    const grid = document.getElementById("galleryGrid");
    const myOnly = document.getElementById("myOnly").checked;
    grid.innerHTML = "";
    let works = await loadWorks();
    if (myOnly) works = works.filter(w => w.key === studentKey());
    if (!works.length){ grid.appendChild(el(`<div class="comment-empty">Пока нет работ. Прикрепите первую в практическом задании!</div>`)); return; }
    works.reverse().forEach(w=>{
      const ext = (w.fileName || "").split(".").pop().toLowerCase();
      const icon = ext === "pdf" ? "📄" : ["png","jpg","jpeg"].includes(ext) ? "🖼" : ext === "zip" ? "🗜" : "📎";
      grid.appendChild(el(`<div class="gallery-card">
        <div class="gc-thumb">${icon}</div>
        <div class="gc-body">
          <div class="gc-title">${escapeHtml(w.workCode)} — ${escapeHtml(w.workTitle)}</div>
          <div class="gc-meta">${escapeHtml(w.name)} · гр. ${escapeHtml(w.group)} · ${fmtRel(w.date)}</div>
          <div class="gc-meta">${escapeHtml(w.fileName)}</div>
          <div class="gc-actions">
            <a class="btn ghost" href="${w.fileUrl}" target="_blank" rel="noopener">↗ Открыть</a>
          </div>
        </div></div>`));
    });
  }
  document.getElementById("myOnly").addEventListener("change", refresh);
  refresh();
};

/* ============================================================
   ПАНЕЛЬ ПРЕПОДАВАТЕЛЯ
   ============================================================ */
async function teacherLoad(){
  try {
    const res = await fetch(APPS_SCRIPT_URL + "?action=teacherlist");
    const d = await res.json();
    if (d && d.ok && Array.isArray(d.students)) return d.students;
  } catch (err){}
  return [];
}
async function teacherCorrect(payload){
  const p = new URLSearchParams();
  p.append("action", "teachercorrect");
  p.append("key", payload.key);
  p.append("topicId", payload.topicId);
  p.append("grade", String(payload.grade || ""));
  p.append("note", payload.note || "");
  try {
    const res = await fetch(APPS_SCRIPT_URL, { method:"POST", body: p });
    const d = await res.json();
    return d && d.ok;
  } catch (err){ return false; }
}
async function teacherAnswerQuestion(id, answer){
  const p = new URLSearchParams();
  p.append("action", "questionanswer");
  p.append("id", id);
  p.append("answer", answer);
  try {
    const res = await fetch(APPS_SCRIPT_URL, { method:"POST", body: p });
    const d = await res.json();
    return d && d.ok;
  } catch (err){ return false; }
}
window.renderTeacherPage = function(){
  const app = document.getElementById("app");
  app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Панель преподавателя";
  setActiveTopBtn("teacher");
  app.appendChild(el(`<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>`));

  const authed = sessionStorage.getItem("mdk0701.teacher") === "1";
  if (!authed){
    const loginBlock = el(`<section class="module teacher-login">
      <div class="meta">Только для преподавателя</div>
      <h2>Вход в панель</h2>
      <form id="teacherLoginForm" style="margin-top:14px">
        <label style="font-size:12px;color:var(--muted);letter-spacing:.06em;text-transform:uppercase">Пароль</label>
        <input type="password" id="teacherPass" autocomplete="current-password" style="width:100%;padding:12px 14px;border:1px solid var(--border);border-radius:10px;background:var(--card-soft);color:var(--text);font:inherit;margin-top:6px">
        <button class="btn" style="width:100%;margin-top:16px">Войти</button>
        <div class="comment-status" id="teacherStatus" style="margin-top:10px"></div>
      </form>
    </section>`);
    app.appendChild(loginBlock);
    loginBlock.querySelector("#teacherLoginForm").addEventListener("submit", async e => {
      e.preventDefault();
      const pass = loginBlock.querySelector("#teacherPass").value;
      const st = loginBlock.querySelector("#teacherStatus");
      st.textContent = "Проверяем…";
      const hash = await sha256(pass);
      if (hash === TEACHER_PASS_HASH){
        sessionStorage.setItem("mdk0701.teacher", "1");
        renderTeacherPage();
      } else {
        st.textContent = "Неверный пароль"; st.className = "comment-status bad";
      }
    });
    return;
  }

  app.appendChild(el(`<section class="module">
    <div class="teacher-bar">
      <div>👨‍🏫 <b>Панель преподавателя</b></div>
      <div class="test-actions">
        <button class="btn ghost" id="teacherExport">⬇ Экспорт группы (CSV)</button>
        <button class="btn ghost" id="teacherLogout">Выйти</button>
      </div>
    </div>
    <h2>Студенты</h2>
    <div id="teacherTableWrap"><div class="comment-empty">Загружаем данные…</div></div>
    <h2 style="margin-top:26px">Анонимные вопросы</h2>
    <div id="teacherQuestions"><div class="comment-empty">Загружаем…</div></div>
  </section>`));

  app.querySelector("#teacherLogout").addEventListener("click", ()=>{
    sessionStorage.removeItem("mdk0701.teacher");
    renderTeacherPage();
  });
  app.querySelector("#teacherExport").addEventListener("click", exportGroupCsv);

  async function refresh(){
    const students = await teacherLoad();
    const wrap = document.getElementById("teacherTableWrap");
    wrap.innerHTML = "";
    if (!students.length){
      wrap.appendChild(el(`<div class="comment-empty">Нет сохранённых студентов.</div>`));
      return;
    }
    students.sort((a, b) => (a.topicsDone || 0) - (b.topicsDone || 0));
    const table = el(`<table class="teacher-table"><thead><tr>
      <th>Студент</th><th>Группа</th><th>Тем пройдено</th><th>Тестов</th>
      <th>Средний балл</th><th>Корректировка</th></tr></thead><tbody></tbody></table>`);
    const tbody = table.querySelector("tbody");
    students.forEach(s=>{
      const tr = el(`<tr>
        <td>${escapeHtml(s.name)}</td>
        <td>${escapeHtml(s.group)}</td>
        <td>${s.topicsDone || 0} / ${s.topicsTotal || "—"}</td>
        <td>${s.testsTaken || 0}</td>
        <td>${(s.avgGrade || 0).toFixed(2)}</td>
        <td>
          <div class="grade-edit">
            <input type="text" placeholder="оценка" data-topic="all" value="${escapeHtml(s.correction || "")}">
            <button class="btn ghost save-grade" style="padding:6px 10px;font-size:12px">OK</button>
          </div>
          <div class="teacher-note">${escapeHtml(s.correctionNote || "")}</div>
        </td></tr>`);
      tr.querySelector(".save-grade").addEventListener("click", async ()=>{
        const val = tr.querySelector('input[data-topic]').value.trim();
        if (await teacherCorrect({ key: s.key, topicId: "all", grade: val, note: "" })){
          tr.querySelector(".teacher-note").textContent = "✔ Сохранено";
        }
      });
      tbody.appendChild(tr);
    });
    wrap.appendChild(table);
  }

  async function refreshQuestions(){
    const list = document.getElementById("teacherQuestions");
    list.innerHTML = "";
    const qs = await loadQuestions();
    if (!qs.length){ list.appendChild(el(`<div class="comment-empty">Вопросов нет.</div>`)); return; }
    qs.reverse().forEach(q=>{
      const card = el(`<div class="question-card ${q.answer ? "answered" : "pending"}">
        <div class="qhead"><span class="qmeta">${fmtRel(q.date)} · ${q.answer ? "отвечено" : "ожидает"}</span></div>
        <div class="qtext">${escapeHtml(q.text)}</div>
        ${q.answer ? `<div class="qanswer">${escapeHtml(q.answer)}</div>` : ""}
        <div class="comment-reply-form" ${q.answer ? "hidden" : ""}>
          <textarea placeholder="Ответ…" maxlength="500"></textarea>
          <div class="test-actions">
            <button class="btn answer-send">Ответить</button>
          </div>
        </div>
      </div>`);
      card.querySelector(".answer-send").addEventListener("click", async ()=>{
        const ta = card.querySelector("textarea");
        const text = ta.value.trim();
        if (!text) return;
        if (await teacherAnswerQuestion(q.id, text)){ refreshQuestions(); }
      });
      list.appendChild(card);
    });
  }

  async function exportGroupCsv(){
    const students = await teacherLoad();
    const rows = [["Студент","Группа","Пройдено тем","Всего тем","Тестов","Средний балл"]];
    students.forEach(s => rows.push([s.name, s.group, s.topicsDone || 0, s.topicsTotal || "", s.testsTaken || 0, (s.avgGrade || 0).toFixed(2)]));
    const csv = rows.map(r => r.map(c => {
      const v = String(c ?? "");
      return (v.includes(",") || v.includes('"') || v.includes("\n")) ? '"' + v.replace(/"/g,'""') + '"' : v;
    }).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type:"text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "mdk0701_group.csv";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  refresh();
  refreshQuestions();
};

/* ============================================================
   КАЛЕНДАРЬ
   ============================================================ */
const CALENDAR_EVENTS = [
  { date:"09-01", title:"День знаний" },
  { date:"10-05", title:"День учителя" },
  { date:"11-04", title:"День народного единства" },
  { date:"12-31", title:"Новогодние каникулы" },
  { date:"02-23", title:"День защитника Отечества" },
  { date:"03-08", title:"Международный женский день" },
  { date:"05-01", title:"Праздник весны и труда" },
  { date:"05-09", title:"День Победы" },
  { date:"07-01", title:"Начало летних каникул" }
];
window.renderCalendarPage = function(){
  const app = document.getElementById("app");
  app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Календарь";
  app.appendChild(el(`<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>`));

  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const monthName = firstDay.toLocaleDateString("ru-RU", { month:"long", year:"numeric" });
  const today = now.getDate();

  const events = CALENDAR_EVENTS.map(e => {
    const [mm, dd] = e.date.split("-").map(Number);
    return { ...e, mm, dd };
  });
  const monthEvents = events.filter(e => e.mm === month + 1).sort((a,b) => a.dd - b.dd);

  const block = el(`<section class="module">
    <div class="meta">Учебный год</div>
    <h2>${monthName[0].toUpperCase() + monthName.slice(1)}</h2>
    <div class="calendar-grid">
      ${["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map(d => `<div class="calendar-head">${d}</div>`).join("")}
      ${Array.from({length:startWeekday}).map(() => `<div class="calendar-day empty"></div>`).join("")}
      ${Array.from({length:lastDate}).map((_, i) => {
        const d = i + 1;
        const dayEvents = events.filter(e => e.mm === month + 1 && e.dd === d);
        const cls = ["calendar-day"];
        if (d === today) cls.push("today");
        if (dayEvents.length) cls.push("event");
        return `<div class="${cls.join(" ")}">
          <div class="cd-num">${d}</div>
          ${dayEvents.map(e => `<div class="cd-event">${escapeHtml(e.title)}</div>`).join("")}
        </div>`;
      }).join("")}
    </div>
    <h3 style="margin-top:20px">События месяца</h3>
    <div class="event-list">
      ${monthEvents.length ? monthEvents.map(e => `<div class="event-item">
        <span class="ev-date">${String(e.dd).padStart(2,"0")}.${String(e.mm).padStart(2,"0")}</span>
        <span class="ev-text">${escapeHtml(e.title)}</span>
      </div>`).join("") : `<div class="comment-empty">В этом месяце событий нет.</div>`}
    </div>
  </section>`);
  app.appendChild(block);
};

/* ============================================================
   ГОСТы
   ============================================================ */
window.renderGostsPage = function(){
  const app = document.getElementById("app");
  app.innerHTML = "";
  document.getElementById("crumbs").textContent = "ГОСТы";
  app.appendChild(el(`<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>`));
  const block = el(`<section class="module">
    <div class="meta">Нормативные документы</div>
    <h2>Быстрые ссылки на ГОСТы</h2>
    <p class="sub">Открываются на docs.cntd.ru в новой вкладке.</p>
    <div class="gost-grid"></div>
  </section>`);
  const grid = block.querySelector(".gost-grid");
  GOSTS.forEach(g => grid.appendChild(el(`<a class="gost-item" href="${g.url}" target="_blank" rel="noopener">
    <b>${escapeHtml(g.code)}</b><span>${escapeHtml(g.title)}</span></a>`)));
  app.appendChild(block);
};

/* ============================================================
   QR-код
   ============================================================ */
window.renderQrPage = function(){
  const app = document.getElementById("app");
  app.innerHTML = "";
  document.getElementById("crumbs").textContent = "QR-код";
  app.appendChild(el(`<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>`));
  
  const url = location.origin + location.pathname;
  // ИСПОЛЬЗУЕМ QUICKCHART ВМЕСТО API.QRSERVER
  const qrUrl = "https://quickchart.io/qr?text=" + encodeURIComponent(url) + "&size=400&margin=2";
  
  app.appendChild(el(`<section class="module">
    <div class="meta">Для телефонов</div>
    <h2>QR-код сайта</h2>
    <p class="sub">Наведите камеру телефона, чтобы открыть приложение на другом устройстве.</p>
    <div class="qr-wrap">
      <img src="${qrUrl}" alt="QR-код" loading="lazy">
      <div class="qr-info">
        <p><b>Ссылка:</b><br><a href="${url}" style="color:var(--accent);word-break:break-all">${url}</a></p>
        <p class="sub">Добавьте сайт на главный экран: «Поделиться → На экран Домой» в Safari, или «⋮ → Установить приложение» в Chrome.</p>
      </div>
    </div>
  </section>`));
};

/* ============================================================
   G-CODE ПРОСМОТРЩИК
   ============================================================ */
const GCODE_SAMPLES = {
  "ПЗ 4": `N10 G21 G40 G90
N20 T0101
N30 S1200 M3
N40 G0 X42 Z2
N50 G1 Z0 F0.15
N60 X-0.5
N70 G0 X42 Z2
N80 T0202
N90 S1400 M3
N100 G1 X30 Z-40 F0.1
N110 G3 X20 Z-45 R5
N120 G0 X50 Z50
N130 M5
N140 M30`,
  "ПЗ 13": `G0 X22 Z5
G76 P021060 Q100 R0.05
G76 X17.30 Z-40 P1350 Q300 F2.5
G0 X50 Z50
M5
M30`,
  "ПЗ 19": `N10 G21 G40 G54 G80 G90
N20 T0101
N30 S800 M3
N40 G0 X52 Z2
N50 G1 Z0 F0.15
N60 X-0.5
N70 G0 X52 Z2
N80 T0202
N90 S1200 M3
N100 G71 U2 R1
N110 G71 P120 Q160 U0.4 W0.1 F0.3
N120 G0 X30
N130 G1 Z0
N140 X30 Z-80
N150 X48
N160 Z-120
N170 G70 P120 Q160 F0.1
N180 G0 X52 Z2
N190 M5
N200 M30`
};
function highlightGCode(text){
  return text.split("\n").map(line => {
    let safe = escapeHtml(line);
    safe = safe.replace(/(\([^)]*\))/g, '<span class="comment">$1</span>');
    safe = safe.replace(/\b(G\d+(\.\d+)?)/g, '<span class="g">$1</span>');
    safe = safe.replace(/\b(M\d+)/g, '<span class="m">$1</span>');
    safe = safe.replace(/\b([XYZIJKRUW]-?\d+(\.\d+)?)/g, '<span class="xyz">$1</span>');
    safe = safe.replace(/\b([FSTP]-?\d+(\.\d+)?)/g, '<span class="f">$1</span>');
    safe = safe.replace(/\b(N\d+)/g, '<span class="n">$1</span>');
    return '<span class="gcode-line">' + safe + '</span>';
  }).join("\n");
}
window.openGCodeModal = function(workCode){
  const samples = Object.keys(GCODE_SAMPLES);
  const initial = GCODE_SAMPLES[workCode] || GCODE_SAMPLES[samples[0]];
  const modal = el(`<div class="avatar-overlay">
    <div class="avatar-modal" style="max-width:900px">
      <h3>G-code просмотрщик</h3>
      <p class="avatar-sub">Введите программу и сравните с эталонным примером.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <div style="font-size:12px;color:var(--muted);margin-bottom:4px">Эталон (${workCode || samples[0]})</div>
          <pre class="gcode-view" id="gcodeRef">${highlightGCode(initial)}</pre>
        </div>
        <div>
          <div style="font-size:12px;color:var(--muted);margin-bottom:4px">Ваш код</div>
          <textarea class="gcode-view" id="gcodeUser" style="min-height:180px;color:var(--code-text);background:var(--code-bg);border:1px solid var(--border);border-radius:10px;padding:14px;width:100%;font-family:Consolas,monospace;font-size:13px;resize:vertical"></textarea>
        </div>
      </div>
      <div class="test-actions" style="margin-top:14px">
        <button class="btn" id="gcodeCompare">Сравнить</button>
        <button class="btn ghost" id="gcodeClose">Закрыть</button>
      </div>
      <div id="gcodeDiff" style="margin-top:14px;max-height:300px;overflow:auto;border:1px solid var(--border);border-radius:10px"></div>
    </div>
  </div>`);
  document.body.appendChild(modal);
  modal.querySelector("#gcodeClose").addEventListener("click", ()=>modal.remove());
  modal.querySelector("#gcodeCompare").addEventListener("click", ()=>{
    const userLines = modal.querySelector("#gcodeUser").value.split("\n").map(l => l.trim()).filter(Boolean);
    const refLines = initial.split("\n").map(l => l.trim()).filter(Boolean);
    const max = Math.max(userLines.length, refLines.length);
    const diff = modal.querySelector("#gcodeDiff");
    diff.innerHTML = "";
    for (let i = 0; i < max; i++){
      const l = refLines[i] || "", r = userLines[i] || "";
      const cls = l === r ? "" : (!l ? "added" : (!r ? "removed" : "changed"));
      diff.appendChild(el(`<div class="gcode-diff-row ${cls}">
        <span class="lno">${i+1}</span>
        <span class="l">${escapeHtml(l)}</span>
        <span class="r">${escapeHtml(r)}</span>
      </div>`));
    }
  });
};

/* ============================================================
   ГОРЯЧИЕ КЛАВИШИ
   ============================================================ */
document.addEventListener("keydown", e => {
  const tag = (document.activeElement?.tagName || "").toLowerCase();
  const inField = tag === "input" || tag === "textarea";

  // Ctrl+K / Cmd+K — поиск
  if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")){
    e.preventDefault();
    window.openSearch?.();
    return;
  }

  // Esc — закрыть все модалки и меню
  if (e.key === "Escape"){
    document.querySelectorAll(
      ".search-overlay, .pdf-overlay, .report-overlay, .avatar-overlay, " +
      ".theme-overlay, .user-menu, .more-menu"
    ).forEach(x => x.remove());
    document.body.style.overflow = "";
    return;
  }

  if (inField) return;

  // ← / → — переключение вкладок темы
  const hash = location.hash.replace(/^#/, "").split("/").filter(Boolean);
  if (hash[0] === "topic" && hash[1]){
    const order = ["passport","lecture","practice","self","test"];
    const idx = order.indexOf(hash[2] || "passport");
    if (e.key === "ArrowLeft" && idx > 0) location.hash = `#/topic/${hash[1]}/${order[idx-1]}`;
    else if (e.key === "ArrowRight" && idx < order.length - 1) location.hash = `#/topic/${hash[1]}/${order[idx+1]}`;
  }
});

/* ============================================================
   ДАШБОРД
   ============================================================ */
window.renderDashboard = function(){
  const app = document.getElementById("app");
  app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Статистика";
  setActiveTopBtn("dashboard");
  app.appendChild(el(`<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>`));

  let topicsTotal = 0, topicsDone = 0, theoryTotal = 0, theoryDone = 0, practiceTotal = 0, practiceDone = 0;
  COURSE.sections.forEach(sec => sec.topics.forEach(t => {
    topicsTotal++;
    const p = state.progress[t.id];
    if ((p?.done || 0) >= 5) topicsDone++;
    theoryTotal += 2; practiceTotal += 2;
    if (p?.tabs?.passport) theoryDone++;
    if (p?.tabs?.lecture)  theoryDone++;
    if (p?.tabs?.practice) practiceDone++;
    if (p?.tabs?.self)     practiceDone++;
  }));
  const testsTotal = COURSE.sections.reduce((s,sec) => s + sec.topics.filter(t => t.test?.length).length, 0);
  const testsTaken = Object.keys(state.results).length;
  const selfTaken  = Object.keys(state.selfResults).length;
  const grades = [...Object.values(state.results).map(r => r.grade), ...Object.values(state.selfResults).map(r => r.grade)];
  const avgGrade = grades.length ? grades.reduce((a,b) => a+b, 0) / grades.length : 0;

  app.appendChild(el(`<section class="hero"><div class="meta">Аналитика</div><h1>Мой прогресс</h1>
    <p>Видно, что пройдено, что даётся сложнее, и ваша динамика.</p></section>`));

  const kpi = el(`<section class="module"><h2>Общие показатели</h2><div class="kpis"></div></section>`);
  const kgrid = kpi.querySelector(".kpis");
  kgrid.appendChild(el(`<div class="kpi"><div class="k-label">Тем пройдено</div><div class="k-value">${topicsDone} / ${topicsTotal}</div></div>`));
  kgrid.appendChild(el(`<div class="kpi"><div class="k-label">Средняя оценка</div><div class="k-value">${avgGrade ? avgGrade.toFixed(2) : "—"}</div></div>`));
  kgrid.appendChild(el(`<div class="kpi"><div class="k-label">Тестов сдано</div><div class="k-value">${testsTaken} / ${testsTotal}</div></div>`));
  kgrid.appendChild(el(`<div class="kpi"><div class="k-label">Сам. работ</div><div class="k-value">${selfTaken}</div></div>`));
  app.appendChild(kpi);

  // Pie
  const pieSection = el(`<section class="module"><h2>Структура прогресса</h2><div class="pie-wrap"></div></section>`);
  const pw = pieSection.querySelector(".pie-wrap");
  const slices = [
    { value: theoryDone,   color: "var(--accent)", label: `Теория (${theoryDone}/${theoryTotal})` },
    { value: practiceDone, color: "var(--blue)",   label: `Практика (${practiceDone}/${practiceTotal})` },
    { value: testsTaken,   color: "var(--ok)",     label: `Тесты (${testsTaken}/${testsTotal})` }
  ];
  pw.appendChild(el(`<div class="pie-chart">${svgPie(slices)}</div>`));
  const legend = el(`<div class="pie-legend"></div>`);
  slices.forEach(s => legend.appendChild(el(`<div class="legend-row"><span class="legend-dot" style="background:${s.color}"></span><span>${s.label}</span></div>`)));
  pw.appendChild(legend);
  app.appendChild(pieSection);

  // Activity bars
  const weeks = activityByWeek();
  const chart = el(`<section class="module"><h2>Активность по неделям</h2><div class="week-chart"></div></section>`);
  const bars = chart.querySelector(".week-chart");
  const maxC = Math.max(1, ...weeks.map(w => w.count));
  weeks.forEach((w, i) => {
    bars.appendChild(el(`<div class="week-bar">
      <div class="wb-count">${w.count}</div>
      <div class="wb-bar" style="height:${Math.round(w.count / maxC * 100)}%"></div>
      <div class="wb-label">${i === weeks.length - 1 ? "сейчас" : "−" + (weeks.length - i - 1) + "н"}</div>
    </div>`));
  });
  app.appendChild(chart);

  // Difficult topics
  const diff = Object.keys(state.results).map(id => {
    const t = findTopic(id)?.topic; if (!t) return null;
    return { code: t.code, title: t.title, avg: state.results[id].grade };
  }).filter(Boolean).sort((a,b) => a.avg - b.avg).slice(0, 3);
  const dSec = el(`<section class="module"><h2>Самые сложные темы</h2><div class="diff-list"></div></section>`);
  const dList = dSec.querySelector(".diff-list");
  if (!diff.length) dList.appendChild(el(`<p class="sub">Недостаточно данных.</p>`));
  else diff.forEach((d, i) => dList.appendChild(el(`<div class="diff-item">
    <span class="diff-num">${i+1}</span>
    <span class="diff-title">${d.code} · ${d.title}</span>
    <span class="diff-grade">Оценка: <b>${d.avg}</b></span></div>`)));
  app.appendChild(dSec);

  // Export
  const exp = el(`<section class="module"><h2>Экспорт</h2>
    <div class="test-actions">
      <button class="btn" id="expCsv">⬇ CSV результатов</button>
      <button class="btn ghost" id="expJson">⬇ Профиль (.json)</button>
    </div></section>`);
  app.appendChild(exp);
  exp.querySelector("#expCsv").addEventListener("click", exportResultsCsv);
  exp.querySelector("#expJson").addEventListener("click", exportProfile);

  // Activity log
  const act = el(`<section class="module"><h2>Последние действия</h2><div class="activity-list"></div></section>`);
  const aList = act.querySelector(".activity-list");
  const recent = (state.activity || []).slice(-10).reverse();
  if (!recent.length) aList.appendChild(el(`<p class="sub">Пусто.</p>`));
  else recent.forEach(a => aList.appendChild(el(`<div class="activity-item">
    <span class="act-icon">${activityIcon(a.type)}</span>
    <span class="act-text">${escapeHtml(a.text)}</span>
    <span class="act-date">${fmtRel(a.date)}</span></div>`)));
  app.appendChild(act);
};
function svgPie(slices){
  const total = slices.reduce((s,x) => s + Math.max(0, x.value), 0);
  if (total <= 0) return `<svg viewBox="0 0 140 140" class="pie-svg"><circle cx="70" cy="70" r="60" fill="var(--border)"/></svg>`;
  const R = 60, cx = 70, cy = 70, ir = 35;
  let acc = 0;
  const paths = slices.map(s => {
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
    const end = new Date(start); end.setDate(start.getDate() + 7);
    weeks.push({ start, end, count: 0 });
  }
  (state.activity || []).forEach(a => {
    const d = new Date(a.date);
    for (const w of weeks) if (d >= w.start && d < w.end){ w.count++; break; }
  });
  return weeks;
}
function exportResultsCsv(){
  const rows = [["Тип","Код","Название","Верных","Всего","Процент","Оценка","Дата"]];
  Object.keys(state.results).forEach(id => {
    const t = findTopic(id)?.topic, r = state.results[id];
    rows.push(["Тест", t?t.code:id, t?t.title:"", r.ok, r.total, r.pct, r.grade, fmtDate(r.date)]);
  });
  Object.keys(state.selfResults).forEach(id => {
    const t = findTopic(id)?.topic, r = state.selfResults[id];
    rows.push(["Самостоятельная", t?t.code:id, t?t.title:"", r.ok, r.total, r.pct, r.grade, fmtDate(r.date)]);
  });
  COURSE.sections.forEach(sec => sec.topics.forEach(t => {
    const p = state.progress[t.id]; const done = p?.done || 0;
    rows.push(["Прогресс", t.code, t.title, done, 5, Math.round(done/5*100), "", ""]);
  }));
  const csv = rows.map(r => r.map(c => {
    const v = String(c ?? "");
    return (v.includes(",") || v.includes('"') || v.includes("\n")) ? '"' + v.replace(/"/g,'""') + '"' : v;
  }).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type:"text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const s = state.student || { name:"student", group:"" };
  a.href = url;
  a.download = "mdk0701_" + (s.name + "_" + s.group).replace(/[^\wа-яё\-]+/gi, "_") + "_results.csv";
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

/* ============================================================
   Кнопка "Комментарии" в шапке
   ============================================================ */
document.addEventListener("DOMContentLoaded", ()=>{
  document.getElementById("commentsBtn")?.addEventListener("click", ()=>location.hash = "#/comments");
});