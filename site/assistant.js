/* ============================================================
   МДК 07.01 — assistant.js (v20.0 — FIXED)
   ============================================================ */
"use strict";

window.openAssistant = function(){
  var existing = document.getElementById("assistantPanel");
  if (existing){ existing.classList.toggle("open"); return; }
  
  var panel = document.createElement("div");
  panel.id = "assistantPanel"; 
  panel.style = "position:fixed;bottom:90px;right:20px;width:350px;max-width:90vw;background:var(--card);border:1px solid var(--border);border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,0.5);z-index:99999;display:flex;flex-direction:column;transform:translateY(120%);transition:transform 0.3s;";
  
  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;padding:16px;border-bottom:1px solid var(--border);background:var(--card-soft);border-radius:16px 16px 0 0;">
      <b>🤖 Помощник</b>
      <button id="asClose" style="background:none;border:none;color:var(--text);cursor:pointer;">✕</button>
    </div>
    <div id="asLog" style="height:300px;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px;font-size:14px;"></div>
    <form id="asForm" style="display:flex;padding:10px;border-top:1px solid var(--border);">
      <input type="text" id="asInput" placeholder="Спроси про G-код..." style="flex:1;padding:8px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);margin-right:8px;">
      <button type="submit" class="btn">➤</button>
    </form>
  `;
  document.body.appendChild(panel); 
  setTimeout(()=>panel.style.transform = "translateY(0)", 20);

  var log = panel.querySelector("#asLog"), input = panel.querySelector("#asInput");
  function addBot(text) { log.appendChild(el(`<div style="background:var(--card-soft);padding:8px 12px;border-radius:8px;align-self:flex-start;">${text}</div>`)); log.scrollTop = log.scrollHeight; }
  function addUser(text) { log.appendChild(el(`<div style="background:var(--accent);color:#fff;padding:8px 12px;border-radius:8px;align-self:flex-end;">${text}</div>`)); log.scrollTop = log.scrollHeight; }

  addBot("Привет! Я помогу найти тему или G-код.");

  panel.querySelector("#asClose").addEventListener("click", ()=>panel.remove());
  panel.querySelector("#asForm").addEventListener("submit", (e)=>{
    e.preventDefault(); var val = input.value.trim(); if(!val) return;
    input.value = ""; addUser(val);
    setTimeout(() => {
      var results = searchCourse(val);
      if (results.length) addBot(`Нашел: <a href="#/topic/${results[0].id}/lecture" style="color:var(--accent)" onclick="document.getElementById('assistantPanel').remove()">${results[0].title}</a>`);
      else addBot("Не нашел ответа. Попробуйте переформулировать.");
    }, 500);
  });
};

function initAssistantButton(){
  if (document.getElementById("asFab")) return;
  var btn = document.createElement("button");
  btn.id = "asFab";
  btn.style = "position:fixed;bottom:20px;right:20px;width:60px;height:60px;border-radius:50%;background:var(--accent);color:#fff;font-size:30px;box-shadow:0 4px 12px rgba(0,0,0,0.3);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;";
  btn.innerHTML = "🤖";
  btn.addEventListener("click", window.openAssistant);
  document.body.appendChild(btn);
}
window.initAssistantButton = initAssistantButton;
window.addEventListener("DOMContentLoaded", () => {
  initAssistantButton();
});