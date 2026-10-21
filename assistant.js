/* ============================================================
   МДК — assistant.js
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
    <div style="padding: 10px; border-top: 1px solid var(--border); display: flex; gap: 8px;">
      <button class="btn" id="asTourBtn" style="flex:1; font-size:12px; padding:8px; background:var(--gold); color:#000;">🗺️ Экскурсия по сайту</button>
    </div>
    <form id="asForm" style="display:flex;padding:10px;border-top:1px solid var(--border);">
      <input type="text" id="asInput" placeholder="Спроси про G-код, XP или Игры..." style="flex:1;padding:8px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);margin-right:8px;">
      <button type="submit" class="btn">➤</button>
    </form>
  `;
  document.body.appendChild(panel); 
  setTimeout(()=>panel.style.transform = "translateY(0)", 20);

  var log = panel.querySelector("#asLog"), input = panel.querySelector("#asInput");
  function addBot(text) { log.appendChild(el(`<div style="background:var(--card-soft);padding:8px 12px;border-radius:8px;align-self:flex-start;">${text}</div>`)); log.scrollTop = log.scrollHeight; }
  function addUser(text) { log.appendChild(el(`<div style="background:var(--accent);color:#fff;padding:8px 12px;border-radius:8px;align-self:flex-end;">${text}</div>`)); log.scrollTop = log.scrollHeight; }

  addBot("Привет! Я помогу найти тему или объясню, как пользоваться порталом. Спроси меня про <b>игры</b>, <b>XP</b>, <b>экзамены</b> или нажми на кнопку экскурсии!");

  panel.querySelector("#asClose").addEventListener("click", ()=>panel.remove());
  
  panel.querySelector("#asTourBtn").addEventListener("click", function() {
    panel.remove();
    startTour();
  });

  panel.querySelector("#asForm").addEventListener("submit", (e)=>{
    e.preventDefault(); var val = input.value.trim(); if(!val) return;
    input.value = ""; addUser(val);
    setTimeout(() => {
      var v = val.toLowerCase();
      var reply = "Я не совсем понял вопрос. Попробуйте спросить про <b>игры</b>, <b>рейтинг</b>, <b>XP</b> или <b>экзамены</b>.";
      
      if (v.includes("игр") || v.includes("аркад") || v.includes("развлеч")) {
          reply = "🎮 Игровая комната доступна в левом меню. Там есть Сапёр, Судоку, Паук и другие!";
      } else if (v.includes("xp") || v.includes("опыт") || v.includes("балл")) {
          reply = "⭐ XP дают за прохождение тестов, решение задач и победы в играх. Следи за полоской опыта в профиле!";
      } else if (v.includes("профил")) {
          reply = "👤 Твой профиль в левом меню. Там можно сменить аватар, поставить эффект и посмотреть достижения.";
      } else if (v.includes("тест") || v.includes("мдк") || v.includes("вопрос")) {
          reply = "📚 Тесты и вопросы по МДК находятся на главной странице или в разделе 'Тренировка'.";
      } else if (v.includes("экзамен")) {
          reply = "📋 Итоговые экзамены находятся в левом меню. 10 вопросов, 10 минут.";
      } else if (v.includes("рейтинг") || v.includes("почет")) {
          reply = "🏆 Доска почета показывает лучших студентов по XP. Проверь, на каком месте ты!";
      }
      
      addBot(reply);
    }, 500);
  });
};

function initAssistantButton(){
  if (document.getElementById("asFab")) return;
  var btn = document.createElement("button");
  btn.id = "asFab";
  btn.innerHTML = "🤖";
  btn.style = "position:fixed;bottom:20px;right:20px;width:60px;height:60px;border-radius:50%;background:var(--accent);color:#fff;font-size:30px;box-shadow:0 4px 12px rgba(0,0,0,0.3);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;transition:transform 0.2s;";
  btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
  btn.onmouseout = () => btn.style.transform = 'scale(1)';
  btn.addEventListener("click", window.openAssistant);
  document.body.appendChild(btn);
}
window.initAssistantButton = initAssistantButton;
window.addEventListener("DOMContentLoaded", () => { initAssistantButton(); });

/* ============================================================
   ТУР ПО САЙТУ
   ============================================================ */
function startTour() {
    var steps = [
        { el: '#burgerBtn', title: "Навигация", text: "Здесь находится главное меню. Через него можно попасть в Журнал, Игры, Расписание и другие разделы." },
        { el: '#mdkSelector', title: "Выбор предмета", text: "Используйте этот выпадающий список, чтобы переключаться между МДК. Вопросы, лекции и тесты обновятся автоматически." },
        { el: '#app', title: "Учебный план", text: "Здесь отображаются все темы. Нажмите на любую тему, чтобы открыть лекции, тесты и практические задания." },
        { el: '#xpCount', title: "Опыт и Уровень", text: "За просмотр лекций и прохождение тестов вы получаете XP. Чем больше XP, тем выше ваш уровень!" },
        { el: '#themeToggle', title: "Смена темы", text: "Нажмите сюда, чтобы переключить сайт в светлую или темную тему." }
    ];
    var currentStep = 0;
    var overlay = document.createElement("div");
    overlay.style = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.5); z-index:99998; pointer-events:none;";
    document.body.appendChild(overlay);
    
    function showStep() {
        var oldTip = document.getElementById("tourTip");
        if (oldTip) oldTip.remove();
        var oldHighlight = document.querySelector(".tour-highlight");
        if (oldHighlight) oldHighlight.classList.remove("tour-highlight");

        if (currentStep >= steps.length) {
            overlay.remove();
            if (window.showToast) window.showToast("Экскурсия завершена!", "ok");
            return;
        }

        var step = steps[currentStep];
        var target = document.querySelector(step.el);
        
        if (!target) { currentStep++; showStep(); return; }

        target.classList.add("tour-highlight");
        target.style.position = "relative";
        target.style.zIndex = "99999";
        
        var rect = target.getBoundingClientRect();
        var tip = document.createElement("div");
        tip.id = "tourTip";
        tip.style = `position:fixed; background:var(--card); color:var(--text); border:2px solid var(--gold); padding:15px; border-radius:12px; width:300px; max-width:90vw; z-index:100000; box-shadow:0 10px 30px rgba(0,0,0,0.5); font-size:14px;`;
        
        var top = rect.bottom + 15;
        var left = rect.left;
        if (top + 150 > window.innerHeight) { top = rect.top - 150; }
        if (left + 300 > window.innerWidth) { left = window.innerWidth - 320; }
        if (left < 10) left = 10;
        
        tip.style.top = top + "px";
        tip.style.left = left + "px";
        
        tip.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:var(--gold);">${step.title}</h4>
            <p style="margin:0 0 15px 0; line-height:1.4;">${step.text}</p>
            <div style="display:flex; justify-content:space-between;">
                <button class="btn ghost" id="tourSkip" style="padding:6px 12px; font-size:12px;">Пропустить</button>
                <button class="btn" id="tourNext" style="padding:6px 12px; font-size:12px; background:var(--gold); color:#000;">Далее (${currentStep+1}/${steps.length})</button>
            </div>
        `;
        document.body.appendChild(tip);
        
        tip.querySelector("#tourNext").onclick = function() {
            target.style.position = ""; target.style.zIndex = "";
            currentStep++; showStep();
        };
        tip.querySelector("#tourSkip").onclick = function() {
            target.style.position = ""; target.style.zIndex = "";
            overlay.remove(); tip.remove(); target.classList.remove("tour-highlight");
        };
    }
    showStep();
}