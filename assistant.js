/* ============================================================
   МДК — assistant.js (Умный ассистент с обучением)
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
      <b>🤖 Умный помощник</b>
      <button id="asClose" style="background:none;border:none;color:var(--text);cursor:pointer;">✕</button>
    </div>
    <div id="asLog" style="height:300px;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px;font-size:14px;"></div>
    <div style="padding: 10px; border-top: 1px solid var(--border); display: flex; gap: 8px;">
      <button class="btn" id="asTourBtn" style="flex:1; font-size:12px; padding:8px; background:var(--gold); color:#000;">🗺️ Экскурсия по сайту</button>
      <button class="btn ghost" id="asClearBrain" style="font-size:12px; padding:8px;" title="Сбросить память бота">🧠 Сброс</button>
    </div>
    <form id="asForm" style="display:flex;padding:10px;border-top:1px solid var(--border);">
      <input type="text" id="asInput" placeholder="Спроси про G-код, XP, Оценки..." style="flex:1;padding:8px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);margin-right:8px;">
      <button type="submit" class="btn">➤</button>
    </form>
  `;
  document.body.appendChild(panel); 
  setTimeout(()=>panel.style.transform = "translateY(0)", 20);

  var log = panel.querySelector("#asLog"), input = panel.querySelector("#asInput");
  function addBot(text) { log.appendChild(el(`<div style="background:var(--card-soft);padding:8px 12px;border-radius:8px;align-self:flex-start;line-height:1.4;">${text}</div>`)); log.scrollTop = log.scrollHeight; }
  function addUser(text) { log.appendChild(el(`<div style="background:var(--accent);color:#fff;padding:8px 12px;border-radius:8px;align-self:flex-end;">${text}</div>`)); log.scrollTop = log.scrollHeight; }

  addBot("Привет! Я умный помощник. Спроси меня про <b>МДК</b>, <b>XP</b>, <b>тесты</b>, <b>сертификат</b> или <b>G-код</b>. Если я не знаю ответа — научи меня!");

  panel.querySelector("#asClose").addEventListener("click", ()=>panel.remove());
  panel.querySelector("#asTourBtn").addEventListener("click", function() { panel.remove(); if(window.startTour) startTour(); });
  
  panel.querySelector("#asClearBrain").addEventListener("click", function() {
      if(confirm("Сбросить память бота? Все, чему вы его научили, будет удалено.")) {
          localStorage.removeItem('mdk_bot_brain');
          addBot("🧠 Моя память очищена. Теперь я снова как чистый лист.");
      }
  });

  panel.querySelector("#asForm").addEventListener("submit", (e)=>{
    e.preventDefault(); var val = input.value.trim(); if(!val) return;
    input.value = ""; addUser(val);
    
    setTimeout(() => {
      var v = val.toLowerCase();
      
      // 1. Загружаем базу знаний из localStorage (самообучение)
      var brain = JSON.parse(localStorage.getItem('mdk_bot_brain') || '{}');
      
      // 2. Ищем точное совпадение в базе самообучения
      if (brain[v]) {
          addBot(brain[v]);
          return;
      }

      // 3. Если нет, ищем по встроенным скриптам (базовые знания)
      var reply = null;
      
      if (v.includes("привет") || v.includes("здравствуй")) {
          reply = "Привет! Я помогу тебе разобраться с порталом. Спроси про учебу или игры.";
      } else if (v.includes("мдк") || v.includes("что такое мдк")) {
          reply = "📚 <b>МДК</b> — это Междисциплинарный курс. У нас их четыре: 07.01 (ЧПУ), 04.01 (Диагностика), 02.01 (Сборка) и 02.02 (Программирование сборки). Переключай их в самом верху страницы!";
      } else if (v.includes("g90") || v.includes("g91") || v.includes("g0") || v.includes("g1") || v.includes("g2") || v.includes("g3") || v.includes("m3") || v.includes("m5") || v.includes("m30") || v.includes("g-код") || v.includes("gcode") || v.includes("чпу")) {
          reply = "📐 <b>G-код</b> — это язык программирования станков с ЧПУ. Основные команды: <br>• G00 — быстрый ход<br>• G01 — линейная интерполяция<br>• G02/G03 — дуги<br>• G90 — абсолютные координаты<br>• G91 — относительные координаты<br>• M03 — включить шпиндель<br>• M05 — остановить шпиндель<br>• M30 — конец программы.<br> Попробуй сыграть в мини-игру «G-код Рисование» в Игровой комнате!";
      } else if (v.includes("xp") || v.includes("опыт") || v.includes("балл") || v.includes("уровень")) {
          reply = "⭐ <b>XP (Опыт)</b> дают за прохождение тестов, практик, сдачу самостоятельных и победы в играх. Чем больше XP, тем выше твой уровень в профиле.";
      } else if (v.includes("ачивк") || v.includes("достижен")) {
          reply = "🏆 <b>Ачивки (Достижения)</b> — это награды за твои действия. Зайди в раздел «Достижения» в левом меню, чтобы посмотреть, что уже открыто, а что еще нужно заработать (например, за победу в играх).";
      } else if (v.includes("сертификат") || v.includes("вкладыш")) {
          reply = "📜 Сертификат и вкладыш с оценками находятся в левом меню. Там можно выбрать красивый фон (они сгенерированы кодом) и распечатать их.";
      } else if (v.includes("средний") || v.includes("ср. балл")) {
          reply = "📊 Твой <b>средний балл</b> автоматически считается на основе всех полученных оценок. Посмотреть его можно в профиле или в разделе «Мои оценки».";
      } else if (v.includes("тест") || v.includes("вопрос")) {
          reply = "🎯 Тесты находятся внутри каждой темы. Выбери тему в учебном плане, перейди на вкладку «Тест» и нажми «Начать». На прохождение дается 10 минут, а правильные ответы скрываются после завершения.";
      } else if (v.includes("самостоятельн") || v.includes("ср")) {
          reply = "📝 Самостоятельные работы тоже внутри тем (вкладка «Самостоятельная»). Там может быть встроенный тест, или просто кнопка «Сдать работу», если теста нет.";
      } else if (v.includes("практик") || v.includes("пз") || v.includes("лр")) {
          reply = "🛠️ Практические работы и Лабораторные находятся во вкладке «Практика» внутри темы. В некоторых нужно вписать ответ в поле и нажать «Проверить».";
      } else if (v.includes("экзамен") || v.includes("итогов")) {
          reply = "📋 Итоговый экзамен в левом меню. Там 30 тестовых вопросов (с автопроверкой) и 2 письменных задания (их проверяет преподаватель).";
      } else if (v.includes("журнал") || v.includes("оценки")) {
          reply = "📒 Журнал доступен только преподавателям. А студенты могут посмотреть свои оценки в разделе «Мои оценки» в профиле.";
      } else if (v.includes("расписание")) {
          reply = "📅 Расписание занятий на семестр можно посмотреть в левом меню.";
      } else if (v.includes("игр") || v.includes("аркад") || v.includes("развлеч")) {
          reply = "🎮 В игровой комнате (левое меню) доступны: G-код, Сапёр, Крестики-нолики, Судоку, 21 (Блэкджек), Найди пару, Казино, Рулетка, Паук и Смертельная вечеринка!";
      } else if (v.includes("видео")) {
          reply = "🎬 Видеоуроки находятся в левом меню. Если видео не грузится прямо на сайте, нажми кнопку «Скачать / Открыть в новой вкладке».";
      } else if (v.includes("ошибк") || v.includes("не работает") || v.includes("сломалось")) {
          reply = "⚠️ Если что-то не работает, проверь интернет или попробуй обновить страницу (Ctrl+F5). Если ошибка в тесте — сообщи преподавателю.";
      } else if (v.includes("спасибо") || v.includes("благодар")) {
          reply = "Всегда пожалуйста! Обращайся, если что-то еще понадобится.";
      }

      // 4. Если нашли ответ во встроенной базе — выдаем
      if (reply) {
          addBot(reply);
      } else {
          // 5. Если не нашли — просим научить (Самообучение)
          addBot("🤔 Я не знаю, что ответить на это. Хочешь меня научить? Напиши правильный ответ в появившемся окне.");
          setTimeout(() => {
              var answer = prompt("Научи меня! Что нужно ответить на вопрос: \"" + val + "\"?");
              if (answer && answer.trim()) {
                  brain[v] = answer.trim();
                  localStorage.setItem('mdk_bot_brain', JSON.stringify(brain));
                  addBot("🎓 Спасибо! Я запомнил. Теперь я знаю, что на вопрос \"" + val + "\" нужно отвечать: \"" + answer.trim() + "\"");
              } else {
                  addBot("Жаль, что ты не захотел меня учить. Если что, я всегда тут!");
              }
          }, 500);
      }
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

function startTour() {
    var steps = [
        { el: '#burgerBtn', title: "Навигация", text: "Здесь находится главное меню. Через него можно попасть в Журнал, Игры, Расписание и другие разделы." },
        { el: '#mdkSelector', title: "Выбор предмета", text: "Используйте этот выпадающий список, чтобы переключаться между МДК. Вопросы, лекции и тесты обновятся автоматически." },
        { el: '#app', title: "Учебный план", text: "Здесь отображаются все темы. Нажмите на любую тему, чтобы открыть лекции, тесты и практические задания." },
        { el: '#xpCount', title: "Опыт и Уровень", text: "За просмотр лекций и прохождение тестов вы получаете XP. Чем больше XP, тем выше ваш уровень!" }
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