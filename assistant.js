/* ============================================================
   МДК 07.01 — assistant.js (Финальная версия)
   ============================================================ */
"use strict";

var ASSISTANT_KB = [
  { keys: ["привет","hi","hello"], answer: "Привет! Я помощник МДК 07.01. Могу рассказать про G- и M-коды, темы курса, расписание, экзамен." },
  { keys: ["g-код","gcode"], answer: "G-код — язык программирования станков с ЧПУ. Справочник в разделе «📖 G- и M-коды».", link: { hash: "#/gcode-reference", text: "Открыть справочник" } },
  { keys: ["расписание"], answer: "Расписание — в разделе «📅 Расписание».", link: { hash: "#/schedule", text: "Открыть расписание" } },
  { keys: ["журнал"], answer: "Журнал — в разделе «📔 Журнал».", link: { hash: "#/journal", text: "Открыть журнал" } },
  { keys: ["экзамен"], answer: "Итоговый экзамен — 25 вопросов, 30 минут, 3 попытки.", link: { hash: "#/final-exam", text: "Открыть экзамен" } }
];

function assistantAnswer(q){
  var lower = (q || "").toLowerCase().trim(); if (!lower) return null;
  var best = null, bestLen = 0;
  ASSISTANT_KB.forEach(item => { (item.keys || []).forEach(k => { if (lower.indexOf(k) !== -1 && k.length > bestLen){ best = item; bestLen = k.length; } }); });
  return best;
}

function assistantMsgEl(text, role){
  var div = document.createElement("div"); div.className = "as-msg as-" + role;
  var safe = String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\n/g, "<br>");
  div.innerHTML = safe; return div;
}

window.openAssistant = function(){
  var existing = document.getElementById("assistantPanel");
  if (existing){ existing.classList.toggle("open"); return; }
  
  var panel = document.createElement("div");
  panel.id = "assistantPanel"; panel.className = "as-panel";
  panel.innerHTML = '<div class="as-head"><div style="display:flex;align-items:center;gap:8px;"><span style="font-size:20px">🤖</span><div class="as-title">Помощник</div></div><button class="as-close" id="asClose">✕</button></div><div class="as-log" id="asLog"></div><div class="as-quick" id="asQuick"></div><form class="as-form" id="asForm"><input type="text" class="as-input" id="asInput" placeholder="Спроси про G-код..." autocomplete="off"><button type="submit" class="as-send">➤</button></form>';
  document.body.appendChild(panel); setTimeout(()=>panel.classList.add("open"), 20);

  var log = panel.querySelector("#asLog"), quick = panel.querySelector("#asQuick"), input = panel.querySelector("#asInput");

  function addBot(html, links){
    var m = assistantMsgEl(html, "bot");
    if (links && links.length){
      var box = document.createElement("div"); box.className = "as-links";
      links.forEach(l=>{
        var a = document.createElement("a"); a.href = "#"; a.className = "as-link"; a.textContent = l.text;
        a.addEventListener("click", e=>{ e.preventDefault(); location.hash = l.hash; window.closeAssistant(); });
        box.appendChild(a);
      });
      m.appendChild(box);
    }
    log.appendChild(m); log.scrollTop = log.scrollHeight;
  }
  function addUser(text){ log.appendChild(assistantMsgEl(text, "user")); log.scrollTop = log.scrollHeight; }
  function renderQuick(items){
    quick.innerHTML = "";
    items.forEach(q=>{ var b = document.createElement("button"); b.type="button"; b.className="as-quick-btn"; b.textContent=q; b.addEventListener("click", ()=>handle(q)); quick.appendChild(b); });
  }
  function handle(text){
    text = (text || "").trim(); if (!text) return; addUser(text);
    var kb = assistantAnswer(text);
    if (kb){ var links = []; if (kb.link) links.push({ text: kb.link.text, hash: kb.link.hash }); addBot(kb.answer, links.length ? links : null); return; }
    addBot("Не нашёл ответа. Спроси иначе или открой раздел через меню.");
  }

  addBot("Привет! Спроси меня про G-коды, экзамен или расписание."); renderQuick(["Что такое G01?","Где расписание?","Как сдать экзамен?"]);
  panel.querySelector("#asClose").addEventListener("click", window.closeAssistant);
  panel.querySelector("#asForm").addEventListener("submit", e=>{ e.preventDefault(); var t=input.value; input.value=""; handle(t); });
  setTimeout(()=>input.focus(), 100);
};

window.closeAssistant = function(){
  var panel = document.getElementById("assistantPanel"); if (!panel) return;
  panel.classList.remove("open"); setTimeout(()=>{ if(panel && panel.parentNode) panel.remove(); }, 250);
};

function initAssistantButton(){
  if (document.getElementById("asFab")) return;
  var btn = document.createElement("button"); btn.id = "asFab"; btn.className = "as-fab"; btn.innerHTML = "🤖";
  btn.addEventListener("click", window.openAssistant); document.body.appendChild(btn);
}
window.addEventListener("DOMContentLoaded", ()=>{ initAssistantButton(); });