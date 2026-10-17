/* ============================================================
   МДК 07.01 — script.js (v19.0 — FINAL FIXES)
   ============================================================ */
"use strict";

var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzB0v37m5pC0jSnEmCEllIlN3IlRmgOhaPEW9giHbS6wNIYFHClxJv8Z5HyG4-AJBpdaQ/exec";
var state = { student: null, staff: null, progress: {}, results: {}, selfResults: {}, practiceStatus: {}, activity: [], favorites: [], achievements: {}, token: null };

try { var _s = JSON.parse(localStorage.getItem("mdk0701.student") || "null"); if (_s && _s.name) state.student = _s; } catch (e){}
try { var _st = JSON.parse(sessionStorage.getItem("mdk0701.staff") || "null"); if (_st && _st.role) { state.staff = _st; state.token = _st.token; } } catch (e){}

function $(id){ return document.getElementById(id); }
function el(html){ var t = document.createElement("template"); t.innerHTML = String(html).trim(); return t.content.firstChild; }
function escapeHtml(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function studentKey(s){ s = s || state.student; if (!s || !s.name) return null; return (s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase()); }

/* --- ОФЛАЙН ОЧЕРЕДЬ (IndexedDB) --- */
window.OfflineQueue = (() => {
  const DB_NAME = "mdk0701-queue";
  function open(){ return new Promise((res, rej)=>{ const req = indexedDB.open(DB_NAME, 1); req.onupgradeneeded = ()=>{ req.result.createObjectStore("queue", { keyPath:"id", autoIncrement:true }); }; req.onsuccess = ()=>{ res(req.result); }; req.onerror = ()=> rej(req.error); }); }
  async function enqueue(item){ const db = await open(); return new Promise((res, rej)=>{ const tx = db.transaction("queue", "readwrite"); tx.objectStore("queue").add({ ...item, ts: Date.now() }); tx.oncomplete = ()=>res(); tx.onerror = ()=>rej(tx.error); }); }
  async function flush(){ 
    if (!navigator.onLine || !state.student) return; 
    const db = await open(); const items = await new Promise(res => { const req = db.transaction("queue", "readonly").objectStore("queue").getAll(); req.onsuccess = ()=>res(req.result || []); });
    if (!items.length) return;
    for (const item of items){ try { const params = new URLSearchParams(); params.append("action", "save"); params.append("key", studentKey()); params.append("name", state.student.name); params.append("group", state.student.group); params.append("payload", JSON.stringify(item.payload)); const res = await fetch(APPS_SCRIPT_URL, { method:"POST", body: params }); if (!(await res.json()).ok) break; } catch(e){ return; } }
    const tx = db.transaction("queue", "readwrite"); tx.objectStore("queue").clear();
    window.showToast("Офлайн-данные синхронизированы", "ok");
  }
  return { enqueue, flush };
})();
window.addEventListener('online', () => OfflineQueue.flush());

function saveStudentData(){
  var k = studentKey(); if (!k) return;
  var ek = encodeURIComponent(k);
  localStorage.setItem("mdk0701.progress." + ek, JSON.stringify(state.progress));
  localStorage.setItem("mdk0701.results." + ek, JSON.stringify(state.results));
  localStorage.setItem("mdk0701.favorites." + ek, JSON.stringify(state.favorites));
}
function cloudSave(){
  if (!state.student) return;
  var payload = { progress: state.progress, results: state.results, selfResults: state.selfResults, favorites: state.favorites };
  if (!navigator.onLine) { OfflineQueue.enqueue({ payload }); return; }
  var params = new URLSearchParams(); params.append("action", "save"); params.append("key", studentKey()); params.append("name", state.student.name); params.append("group", state.student.group); params.append("payload", JSON.stringify(payload));
  fetch(APPS_SCRIPT_URL, { method:"POST", body: params }).catch(()=>OfflineQueue.enqueue({ payload }));
}

/* --- СЖАТИЕ КАРТИНОК ПЕРЕД ЗАГРУЗКОЙ --- */
window.uploadFile = function(event, code, title) {
  var file = event.target.files[0]; if (!file) return;
  if (file.size > 10 * 1024 * 1024) { window.showToast("Файл слишком большой (макс 10МБ)", "err"); return; }
  
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      var canvas = document.createElement("canvas");
      var MAX_WIDTH = 1200;
      var scale = Math.min(1, MAX_WIDTH / img.width);
      canvas.width = img.width * scale; canvas.height = img.height * scale;
      var ctx = canvas.getContext("2d"); ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      var base64 = canvas.toDataURL("image/jpeg", 0.7).split(',')[1]; // Сжатие в JPEG 70%
      
      var params = new URLSearchParams();
      params.append("action", "uploadwork"); params.append("key", studentKey()); params.append("name", state.student.name);
      params.append("group", state.student.group); params.append("workCode", code); params.append("workTitle", title);
      params.append("fileName", "photo.jpg"); params.append("fileType", "image/jpeg"); params.append("fileData", base64);
      
      window.showToast("Отправка...", "info");
      fetch(APPS_SCRIPT_URL, { method: "POST", body: params }).then(r=>r.json()).then(d => {
        if (d.ok) window.showToast("Файл загружен!", "ok"); else window.showToast("Ошибка", "err");
      }).catch(() => window.showToast("Ошибка CORS/Сети", "err"));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

/* --- ГЛАВНАЯ И РОУТИНГ --- */
function renderHome(){
  var app = $("app"); if (!app) return; app.innerHTML = ""; var c = getCourse();
  app.appendChild(el(`<section class="hero"><h1>${c.title}</h1><p>${c.module}</p></section>`));
  c.sections.forEach(sec => {
    app.appendChild(el(`<div class="steps-title">${sec.code} · ${sec.title}</div>`));
    var list = el('<div class="topics" style="display:flex;flex-direction:column;gap:12px;"></div>');
    sec.topics.forEach(t => {
      var card = el(`<div class="topic" style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;display:flex;gap:16px;cursor:pointer;" onclick="location.hash='#/topic/${t.id}'"><div style="color:var(--accent);font-weight:bold;">${t.code}</div><div style="flex:1"><div style="font-weight:600;">${t.title}</div></div></div>`);
      list.appendChild(card);
    });
    app.appendChild(list);
  });
}

function renderTopic(id, tab){
  tab = tab || "lecture"; // ПО УМОЛЧАНИЮ ЛЕКЦИЯ (Паспорт убран)
  var t = findTopic(id); if(!t) return renderHome();
  var app = $("app"); app.innerHTML = "";
  app.appendChild(el(`<a class="backlink" href="#/">← К программе</a><section class="topic-head"><h1>${t.topic.title}</h1></section>`));
  
  var tabs = [["lecture","01","Лекция"],["practice","02","Практические"],["self","03","Самостоятельная"],["test","04","Контроль темы"]];
  var tw = el('<div class="tabs"></div>');
  tabs.forEach(item=>{
    var b = el(`<button class="tab ${item[0]===tab?'active':''}"><span class="t-num">${item[1]}</span><span class="t-name">${item[2]}</span></button>`);
    b.addEventListener("click", ()=>location.hash="#/topic/"+id+"/"+item[0]); tw.appendChild(b);
  });
  app.appendChild(tw); var panel = el('<section class="panel"></section>'); app.appendChild(panel);

  if (tab === "lecture") {
    panel.appendChild(el('<h2>Лекция</h2>'));
    (t.topic.lectures||[]).forEach(l=>{
      panel.appendChild(el(`<h3>${l.code}. ${l.title}</h3>`));
      panel.appendChild(el(`<div class="lecture-content">${l.content || '<p>Материал готовится.</p>'}</div>`));
    });
  }
  if (tab === "practice") {
    panel.appendChild(el('<h2>Практические работы</h2>'));
    (t.topic.practicals||[]).forEach(p=>{
      panel.appendChild(el(`<div class="practice" style="margin-bottom:16px;"><div style="color:var(--accent);font-weight:bold">${p.code}</div><div style="font-weight:bold">${p.title}</div><div>${p.task}</div><input type="file" id="file_${p.code}" style="display:none" onchange="window.uploadFile(event, '${p.code}', '${p.title}')"><button class="btn" style="margin-top:8px" onclick="document.getElementById('file_${p.code}').click()">📎 Прикрепить</button></div>`));
    });
  }
  if (tab === "self") {
    panel.appendChild(el('<h2>Самостоятельная работа</h2>'));
    var selfWrap = el('<div id="selfWrap"></div>'); panel.appendChild(selfWrap);
    (t.topic.selfChecks||[]).forEach((q, i)=>{
      selfWrap.appendChild(el(`<div class="question"><div>${i+1}. ${q.q}</div><input type="text" class="self-input" data-idx="${i}" style="width:100%;padding:8px;margin:8px 0;"><div class="self-feedback" id="fb_${i}"></div></div>`));
    });
    var checkBtn = el('<button class="btn" style="width:100%">Проверить</button>');
    checkBtn.addEventListener("click", ()=>{
      selfWrap.querySelectorAll(".self-input").forEach(inp => {
        var idx = Number(inp.dataset.idx), q = t.topic.selfChecks[idx], fb = selfWrap.querySelector("#fb_" + idx);
        if (inp.value.trim().toLowerCase() === q.a.trim().toLowerCase()) { fb.textContent = "✔ Верно"; fb.style.color = "var(--ok)"; }
        else { fb.textContent = "✘ Неверно. Ответ: " + q.a; fb.style.color = "var(--err)"; }
      });
    });
    panel.appendChild(checkBtn);
  }
  if (tab === "test") {
    panel.appendChild(el('<h2>Контроль темы</h2>'));
    var timerBox = el('<div style="font-size:20px;color:var(--err);margin-bottom:16px;">⏱ 15:00</div>');
    panel.appendChild(timerBox);
    var testWrap = el('<div id="testWrap"></div>'); panel.appendChild(testWrap);
    (t.topic.test||[]).forEach((q, qi)=>{
      var qb = el(`<div class="question"><div class="q-text">${qi+1}. ${q.q}</div></div>`);
      q.options.forEach((opt, oi)=>qb.appendChild(el(`<label class="option"><input type="radio" name="q${qi}" value="${oi}"><span>${opt}</span></label>`)));
      testWrap.appendChild(qb);
    });
    var finishBtn = el('<button class="btn" style="width:100%">Подвести итог</button>'); panel.appendChild(finishBtn);
    var timeLeft = 900;
    var tId = setInterval(() => {
      if (!document.body.contains(timerBox)) { clearInterval(tId); return; }
      timeLeft--; timerBox.textContent = "⏱ " + String(Math.floor(timeLeft/60)).padStart(2,'0') + ":" + String(timeLeft%60).padStart(2,'0');
      if (timeLeft <= 0) { clearInterval(tId); finishBtn.click(); }
    }, 1000);
    finishBtn.addEventListener("click", () => {
      clearInterval(tId); var correct = 0;
      (t.topic.test||[]).forEach((q, qi) => {
        var ch = testWrap.querySelector(`input[name="q${qi}"]:checked`);
        if (ch && Number(ch.value) === q.correct) correct++;
      });
      state.results[t.topic.id] = { grade: Math.round((correct / t.topic.test.length) * 5), date: new Date().toISOString() };
      saveStudentData(); cloudSave(); window.showToast("Результат: " + correct, "ok"); finishBtn.disabled = true;
    });
  }
}

function route(){
  closeDrawer(); var hash = location.hash.replace(/^#/, "") || "/"; var parts = hash.split("/").filter(Boolean); var app = $("app"); if(!app) return;
  if (!state.student && !state.staff){ app.innerHTML=""; return; }
  var pages = {
    profile: ()=>window.renderProfilePage && window.renderProfilePage(),
    dashboard: ()=>window.renderDashboard && window.renderDashboard(),
    journal: ()=>window.renderJournalPage && window.renderJournalPage(),
    rating: ()=>window.renderRatingPage && window.renderRatingPage(),
    links: ()=>window.renderLinksPage && window.renderLinksPage(),
    "gcode-reference": ()=>window.renderGCodeReferencePage && window.renderGCodeReferencePage(),
    "final-exam": ()=>window.renderFinalExamPage && window.renderFinalExamPage(),
    "final-training": ()=>window.renderFinalTrainingPage && window.renderFinalTrainingPage()
  };
  if (parts[0] === "topic" && parts[1]) renderTopic(parts[1], parts[2]);
  else if (parts[0] === "staff" && window.renderStaffPage) window.renderStaffPage();
  else if (pages[parts[0]]) pages[parts[0]]();
  else renderHome();
  window.scrollTo(0,0);
}
window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", ()=>{ initTheme(); initAuth(); route(); });