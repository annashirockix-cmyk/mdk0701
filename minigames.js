/* ============================================================
   МДК 07.01 — minigames.js (v99.0 — DEADLY PARTY FIX)
   ============================================================ */
"use strict";

// ... (TicTacToe, Sudoku, Minesweeper, Spider оставьте как были, код ниже только для вечеринки) ...

window.renderDeadlyPartyPage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = ""; 
  document.getElementById("crumbs").textContent = "Терминал МДК";
  app.appendChild(el('<a class="backlink" href="#/" style="color:#ff003c; font-weight:bold;">← Прервать связь</a>'));

  var questionsPool = [];
  try {
      var c = window.COURSE;
      if (c) {
          c.sections.forEach(sec => {
              (sec.topics || []).forEach(t => {
                  (t.test || []).forEach(q => {
                      questionsPool.push({ q: q.q, options: q.options, correct: q.correct });
                  });
              });
          });
      }
  } catch(e) {}

  var extraQuestions = [
      {q:"Сколько будет 15 * 3?", a:"45", b:["30", "50", "60"]},
      {q:"Как зовут самого известного кота из мема?", a:"Шлёпа", b:["Барсик", "Мурзик", "Том"]},
      {q:"Что означает G00?", a:"Быстрое позиционирование", b:["Линейная интерполяция", "Круговая", "Пауза"]},
      {q:"Столица Франции?", a:"Париж", b:["Лондон", "Берлин", "Мадрид"]},
      {q:"Сколько лап у паука?", a:"8", b:["6", "4", "10"]},
      {q:"Какая планета самая большая?", a:"Юпитер", b:["Сатурн", "Земля", "Марс"]},
      {q:"Что делает M03?", a:"Включает шпиндель", b:["Выключает", "Смена инструмента", "Пауза"]},
      {q:"Какой газ мы вдыхаем?", a:"Кислород", b:["Углекислый газ", "Азот", "Водород"]},
      {q:"Сколько будет 2+2*2?", a:"6", b:["8", "4", "10"]},
      {q:"В каком году человек полетел в космос?", a:"1961", b:["1957", "1969", "1980"]},
      {q:"Что такое CAD?", a:"Проектирование", b:["Изготовление", "Управление", "Расчет"]},
      {q:"Самый твердый минерал?", a:"Алмаз", b:["Кварц", "Золото", "Железо"]},
      {q:"Что делает G01?", a:"Линейная интерполяция", b:["Круговая", "Быстрое", "Резьба"]},
      {q:"Сколько цветов в радуге?", a:"7", b:["6", "8", "5"]},
      {q:"Кто написал «Войну и мир»?", a:"Лев Толстой", b:["Пушкин", "Достоевский", "Чехов"]},
      {q:"Что такое ЧПУ?", a:"Числовое программное управление", b:["Частное предприятие", "Центр управления", "Чип"]},
      {q:"Какой код задает подачу в мм/мин?", a:"G94", b:["G95", "G96", "G97"]},
      {q:"Сколько сторон у куба?", a:"6", b:["4", "8", "12"]},
      {q:"Что означает HTML?", a:"Язык разметки", b:["Язык программирования", "База данных", "Сеть"]},
      {q:"Что делает M05?", a:"Стоп шпинделя", b:["Старт", "Смена", "Конец"]}
  ];
  
  for(var i=0; i<80; i++) {
      var num = i + 10;
      extraQuestions.push({
          q: "Вопрос на эрудицию №" + num + ": Сколько будет " + num + " + " + (num*2) + "?",
          a: (num + num*2).toString(),
          b: [(num + num*2 + 1).toString(), (num + num*2 - 1).toString(), (num + num*3).toString()]
      });
  }

  extraQuestions.forEach(q => {
      var opts = mgShuffle([q.a, ...q.b]);
      questionsPool.push({ q: q.q, options: opts, correct: opts.indexOf(q.a) });
  });

  var gameBlock = el(`<section id="deadlyGameBlock" class="module" style="background:#0a0a0c; border:2px solid #ff003c; padding:32px; border-radius:16px; box-shadow:0 0 40px rgba(255,0,60,0.3); color:#fff; min-height:500px; display:flex; flex-direction:column; transition: all 0.3s;">
    <h2 style="color:#ff003c; text-transform:uppercase; letter-spacing:3px; text-shadow: 0 0 15px rgba(255,0,60,0.8); font-size:28px; margin-top:0; text-align:center;">СМЕРТЕЛЬНАЯ ВЕЧЕРИНКА</h2>
    <div id="eventContent" style="flex:1; display:flex; flex-direction:column;"></div>
  </section>`);
  app.appendChild(gameBlock);
  var content = gameBlock.querySelector("#eventContent");
  var currentQuestions = [], currentIndex = 0, score = 0, timerId = null, timeLeft = 15;

  function mgShuffle(a){ var r = a.slice(); for (var i = r.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)); var t = r[i]; r[i] = r[j]; r[j] = t; } return r; }
  function mgEsc(s){ return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function getLeaderboard() { try { return JSON.parse(localStorage.getItem("mdk0701.survivor_leaderboard") || "[]"); } catch(e) { return []; } }
  function saveScore() {
      if (!window.state || !window.state.student) return;
      var lb = getLeaderboard();
      lb.push({ name: state.student.name, group: state.student.group, score: score, date: new Date().toISOString() });
      lb.sort((a, b) => b.score - a.score || new Date(a.date) - new Date(b.date));
      localStorage.setItem("mdk0701.survivor_leaderboard", JSON.stringify(lb.slice(0, 10)));
  }

  function renderStartScreen() {
      var lb = getLeaderboard();
      var topHTML = "";
      if (lb.length > 0) {
          topHTML = `<div style="background:#111; border:1px solid #333; border-radius:12px; padding:16px; margin-top:20px; text-align:left;"><h4 style="margin:0 0 12px 0; color:#ff003c; font-size:14px;">🏆 Топ-3</h4><div style="display:flex; flex-direction:column; gap:8px;">`;
          lb.slice(0, 3).forEach((item, i) => {
              topHTML += `<div style="display:flex; justify-content:space-between; border-bottom:1px solid #222;"><span>${i===0?"🥇":i===1?"🥈":"🥉"} ${mgEsc(item.name)}</span><span style="color:#00ffcc;">${item.score}</span></div>`;
          });
          topHTML += `</div></div>`;
      }
      content.innerHTML = `<div style="text-align:center; margin:auto; max-width:600px;">
              <div style="font-size:60px; margin-bottom:20px; animation: pulse 2s infinite;">💀</div>
              <h3 style="margin-bottom:10px; font-size:22px; color:#fff;">Протокол активирован</h3>
              <p style="color:#aaa; font-size:15px; margin-bottom:20px;">Ответь на 10 вопросов. Выживи (6+ правильных).</p>
              <button class="btn" style="background:#ff003c; color:#fff; border:none; font-size:18px; padding:16px 40px; width:100%; margin-bottom:24px;" id="startQuizBtn">НАЧАТЬ ВЗЛОМ</button>
              ${topHTML}
          </div>`;
      content.querySelector("#startQuizBtn").onclick = startGame;
  }

  function startGame() {
      currentQuestions = mgShuffle(questionsPool).slice(0, 10); // УВЕЛИЧЕНО ДО 10
      currentIndex = 0; score = 0; renderQuestion();
  }

  function renderQuestion() {
      if (currentIndex >= currentQuestions.length) return endGame();
      var q = currentQuestions[currentIndex]; timeLeft = 15;
      content.innerHTML = `<div style="max-width:700px; margin:0 auto; width:100%; animation: fadeInUp 0.3s;"><div style="display:flex; justify-content:space-between; margin-bottom:20px; border-bottom:1px solid #333; padding-bottom:10px;"><span style="color:#ff003c; font-weight:bold;">ВОПРОС ${currentIndex+1} ИЗ 10</span><span id="timerDisplay" style="color:#00ffcc; font-weight:bold;">00:15</span></div><div style="font-size:20px; font-weight:bold; margin-bottom:24px; color:#eee; text-align:center;">${mgEsc(q.q)}</div><div style="display:grid; gap:12px;" id="optionsWrap"></div><div id="feedback" style="margin-top:20px; font-weight:bold; min-height:30px; text-align:center;"></div></div>`;
      var wrap = content.querySelector("#optionsWrap"), fb = content.querySelector("#feedback"), timerDisplay = content.querySelector("#timerDisplay");
      
      if (timerId) clearInterval(timerId);
      timerId = setInterval(() => {
          timeLeft--; timerDisplay.textContent = `00:${String(timeLeft).padStart(2, '0')}`;
          if (timeLeft <= 5) timerDisplay.style.color = "#ff003c";
          if (timeLeft <= 0) { clearInterval(timerId); handleAnswer(-1, wrap, fb, q); }
      }, 1000);

      var opts = mgShuffle(q.options.map((o, i) => ({ text: o, isCorrect: i === q.correct })));
      opts.forEach((o) => {
          var btn = el(`<button class="btn ghost" style="padding:16px; border-color:#444; color:#ddd; background:#151515; text-align:left;">${mgEsc(o.text)}</button>`);
          btn.onclick = function() { if (wrap.dataset.answered) return; wrap.dataset.answered = "1"; clearInterval(timerId); handleAnswer(o.isCorrect, wrap, fb, q); };
          wrap.appendChild(btn);
      });
  }

  function handleAnswer(isCorrect, wrap, fb, q) {
      wrap.dataset.answered = "1";
      wrap.querySelectorAll("button").forEach(b => b.disabled = true);
      if (isCorrect === true) {
          score++;
          fb.innerHTML = "<span style='color:#00ffcc;'>✅ ВЕРНО! +5 XP</span>";
          if (window.addXP) window.addXP(5);
      } else {
          fb.innerHTML = "<span style='color:#ff003c;'>❌ ОШИБКА</span>";
          // ЭФФЕКТ ТРЯСКИ
          var block = document.getElementById("deadlyGameBlock");
          block.style.transform = "translateX(-10px)";
          setTimeout(() => block.style.transform = "translateX(10px)", 50);
          setTimeout(() => block.style.transform = "translateX(-10px)", 100);
          setTimeout(() => block.style.transform = "translateX(10px)", 150);
          setTimeout(() => block.style.transform = "translateX(0)", 200);
      }
      wrap.querySelectorAll("button").forEach(btn => { if (btn.textContent === q.options[q.correct]) { btn.style.borderColor = "#00ffcc"; btn.style.color = "#00ffcc"; } });
      currentIndex++;
      setTimeout(() => { if (currentIndex < currentQuestions.length) renderQuestion(); else endGame(); }, 1800);
  }

  function endGame() {
      var isWinner = score >= 6; // ПОРОГ 6 ИЗ 10
      var bonusXP = isWinner ? 30 : 0;
      if (bonusXP > 0 && window.addXP) window.addXP(bonusXP);
      if (isWinner && window.unlockAchievement) window.unlockAchievement('t_deadly');
      saveScore();
      
      var color = isWinner ? "#00ffcc" : "#ff003c", title = isWinner ? "ВЫ ВЫЖИЛИ!" : "ВЫ ПОГИБЛИ", icon = isWinner ? "🏆" : "💀";
      
      // ЭФФЕКТ ФЕЙЕРВЕРКА ПРИ ПОБЕДЕ
      if (isWinner && window.confetti) {
          window.confetti();
          window.confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
      }

      content.innerHTML = `<div style="text-align:center; margin:auto; max-width:600px;"><div style="font-size:80px; margin-bottom:20px; animation: popIn 0.5s;">${icon}</div><h3 style="color:${color}; font-size:28px; margin-bottom:10px;">${title}</h3><div style="display:flex; justify-content:center; gap:20px; margin-bottom:30px;"><div style="background:#111; border:1px solid #333; padding:16px; border-radius:12px;"><div style="color:#888; font-size:12px;">Результат</div><div style="font-size:28px; font-weight:bold; color:#fff;">${score} / 10</div></div><div style="background:#111; border:1px solid ${isWinner?'#ffd700':'#333'}; padding:16px; border-radius:12px;"><div style="color:#888; font-size:12px;">XP</div><div style="font-size:28px; font-weight:bold; color:${isWinner?'#ffd700':'#fff'};">+${(score*5)+bonusXP}</div></div></div><button class="btn" style="background:#ff003c; color:#fff; border:none; width:100%;" onclick="location.reload()">Играть снова</button></div>`;
  }
  renderStartScreen();
};