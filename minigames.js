/* ============================================================
   МДК 07.01 — minigames.js (v100.0 — ALL GAMES RESTORED)
   ============================================================ */
"use strict";

/* ============================================================
   1. КРЕСТИКИ-НОЛИКИ
   ============================================================ */
window.renderTicTacToePage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = ""; 
  document.getElementById("crumbs").textContent = "Игра";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  
  var block = el(`<section class="module">
    <h2 style="text-align:center;">Крестики-нолики</h2>
    <div id="tttBoard" style="display:grid; grid-template-columns:repeat(3, 80px); gap:10px; justify-content:center; margin:20px auto;"></div>
    <div id="tttStatus" style="text-align:center; font-weight:bold; font-size:18px; color:var(--accent); min-height:28px;"></div>
    <div style="text-align:center; margin-top:20px;"><button class="btn" id="tttReset">Сбросить</button></div>
  </section>`);
  app.appendChild(block);
  
  var board = block.querySelector("#tttBoard"), status = block.querySelector("#tttStatus");
  var cells = Array(9).fill(null), gameOver = false;
  var wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  function checkWin() {
    for (let w of wins) { if (cells[w[0]] && cells[w[0]] === cells[w[1]] && cells[w[0]] === cells[w[2]]) return cells[w[0]]; }
    return cells.includes(null) ? null : "draw";
  }
  function render() {
    board.innerHTML = "";
    cells.forEach((c, i) => {
      var btn = el(`<button class="btn ghost" style="height:80px; font-size:32px; display:flex; align-items:center; justify-content:center;">${c || ""}</button>`);
      btn.addEventListener("click", () => { if (cells[i] || gameOver) return; cells[i] = "❌"; update(); if (!gameOver) setTimeout(compMove, 300); });
      board.appendChild(btn);
    });
  }
  function compMove() {
    if (gameOver) return;
    var empty = cells.map((c, i) => c === null ? i : null).filter(v => v !== null);
    if (empty.length) { cells[empty[Math.floor(Math.random() * empty.length)]] = "⭕"; update(); }
  }
  function update() {
    render(); var w = checkWin();
    if (w) {
      gameOver = true;
      if (w === "draw") status.textContent = "Ничья! 🤝";
      else if (w === "❌") { status.textContent = "Вы победили! +10 XP"; window.addXP(10); window.unlockAchievement('t_ttt'); }
      else status.textContent = "Победил станок... ⚙️";
    } else status.textContent = "Ваш ход";
  }
  block.querySelector("#tttReset").addEventListener("click", () => { cells = Array(9).fill(null); gameOver = false; status.textContent = "Ваш ход"; render(); });
  render();
};

/* ============================================================
   2. СУДОКУ (Сложности + Проверка)
   ============================================================ */
window.renderSudokuPage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = ""; 
  document.getElementById("crumbs").textContent = "Судоку";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));

  var solution = [5,3,4,6,7,8,9,1,2, 6,7,2,1,9,5,3,4,8, 1,9,8,3,4,2,5,6,7, 8,5,9,7,6,1,4,2,3, 4,2,6,8,5,3,7,9,1, 7,1,3,9,2,4,8,5,6, 9,6,1,5,3,7,2,8,4, 2,8,7,4,1,9,6,3,5, 3,4,5,2,8,6,1,7,9];
  
  var block = el(`<section class="module">
    <h2 style="text-align:center;">Судоку</h2>
    <div style="text-align:center; margin-bottom:20px;">
        <select id="sudokuDiff" class="self-input" style="width:auto; display:inline-block; margin-right:10px;">
            <option value="easy">Легкий (30 пустых)</option>
            <option value="medium" selected>Средний (40 пустых)</option>
            <option value="hard">Сложный (50 пустых)</option>
        </select>
        <button class="btn" id="sudokuCheck" style="background:var(--ok);">Проверить</button>
    </div>
    <div id="sudokuBoard" style="display:grid; grid-template-columns:repeat(9, 40px); gap:2px; justify-content:center; margin:20px auto; background:var(--border); padding:2px; border-radius:8px;"></div>
    <div id="sudokuStatus" style="text-align:center; font-weight:bold; font-size:18px; color:var(--accent); margin-top:10px; min-height:28px;"></div>
    <div style="text-align:center; margin-top:20px;"><button class="btn ghost" id="sudokuReset">Новая игра</button></div>
  </section>`);
  app.appendChild(block);
  
  var board = block.querySelector("#sudokuBoard"), status = block.querySelector("#sudokuStatus");
  var currentPuzzle = [];
  var isGameOver = false;

  function generatePuzzle(diff) {
      var emptyCount = diff === 'easy' ? 30 : (diff === 'medium' ? 40 : 50);
      var puzzle = solution.slice();
      var indices = Array.from({length: 81}, (_, i) => i).sort(() => Math.random() - 0.5);
      for (var i = 0; i < emptyCount; i++) puzzle[indices[i]] = 0;
      return puzzle;
  }

  function renderBoard() {
    board.innerHTML = "";
    isGameOver = false; status.textContent = "";
    currentPuzzle.forEach((val, i) => {
      var isFixed = val !== 0;
      var cell = el(`<input type="text" maxlength="1" value="${val !== 0 ? val : ''}" ${isFixed ? 'disabled' : ''} style="width:40px; height:40px; text-align:center; font-size:20px; font-weight:bold; border:none; background:${isFixed ? 'var(--card-soft)' : 'var(--card)'}; color:${isFixed ? 'var(--muted)' : 'var(--text)'}; outline:none; border-radius:4px;">`);
      var row = Math.floor(i / 9); var col = i % 9;
      if (col === 2 || col === 5) cell.style.borderRight = "2px solid var(--text)";
      if (row === 2 || row === 5) cell.style.borderBottom = "2px solid var(--text)";
      if (!isFixed) {
          cell.addEventListener("input", (e) => { e.target.value = e.target.value.replace(/[^1-9]/g, ''); });
      }
      board.appendChild(cell);
    });
  }

  block.querySelector("#sudokuCheck").addEventListener("click", () => {
      if (isGameOver) return;
      var inputs = board.querySelectorAll("input");
      var allCorrect = true; var hasEmpty = false;
      for (let i = 0; i < 81; i++) {
          var val = Number(inputs[i].value);
          if (val === 0) { hasEmpty = true; allCorrect = false; }
          else if (val !== solution[i]) { allCorrect = false; inputs[i].style.color = "var(--err)"; inputs[i].style.background = "rgba(192,57,43,0.1)"; }
          else { inputs[i].style.color = "var(--ok)"; }
      }
      if (allCorrect) {
          status.textContent = "🎉 Поздравляем, судоку решено! +50 XP";
          window.addXP(50); window.unlockAchievement('t_sudoku');
          isGameOver = true; if (window.celebrate) window.celebrate();
      } else if (hasEmpty) status.textContent = "Остались пустые клетки!";
      else status.textContent = "Есть ошибки (красные клетки).";
  });

  block.querySelector("#sudokuReset").addEventListener("click", () => {
      var diff = block.querySelector("#sudokuDiff").value;
      currentPuzzle = generatePuzzle(diff); renderBoard();
  });

  currentPuzzle = generatePuzzle("medium");
  renderBoard();
};

/* ============================================================
   3. СМЕРТЕЛЬНАЯ ВЕЧЕРИНКА (150+ вопросов)
   ============================================================ */
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
      {q:"Столица Франции?", a:"Париж", b:["Лондон", "Берлин", "Мадрид"]},
      {q:"Сколько лап у паука?", a:"8", b:["6", "4", "10"]},
      {q:"Какая планета самая большая?", a:"Юпитер", b:["Сатурн", "Земля", "Марс"]},
      {q:"Какой газ мы вдыхаем?", a:"Кислород", b:["Углекислый газ", "Азот", "Водород"]},
      {q:"Сколько будет 2+2*2?", a:"6", b:["8", "4", "10"]},
      {q:"В каком году человек полетел в космос?", a:"1961", b:["1957", "1969", "1980"]},
      {q:"Самый твердый минерал?", a:"Алмаз", b:["Кварц", "Золото", "Железо"]},
      {q:"Сколько цветов в радуге?", a:"7", b:["6", "8", "5"]},
      {q:"Кто написал «Войну и мир»?", a:"Лев Толстой", b:["Пушкин", "Достоевский", "Чехов"]},
      {q:"Сколько сторон у куба?", a:"6", b:["4", "8", "12"]},
      {q:"Что означает HTML?", a:"Язык разметки", b:["Язык программирования", "База данных", "Сеть"]},
      {q:"Какая самая длинная река в мире?", a:"Амазонка", b:["Нил", "Янцзы", "Миссисипи"]},
      {q:"Кто изобрел лампочку?", a:"Томас Эдисон", b:["Никола Тесла", "Александр Белл", "Джеймс Уатт"]},
      {q:"Сколько градусов в прямом угле?", a:"90", b:["180", "360", "45"]},
      {q:"Что такое H2O?", a:"Вода", b:["Кислород", "Водород", "Соль"]},
      {q:"Какой самый быстрый наземный транспорт?", a:"Поезд на магнитной подушке", b:["Болид Ф1", "Мотоцикл", "Гепард"]},
      {q:"Какой язык программирования самый популярный?", a:"JavaScript", b:["Python", "C++", "Java"]},
      {q:"Что делает команда G28?", a:"Возврат в исходную точку", b:["Пауза", "Резьба", "Отмена"]},
      {q:"Что делает команда G04?", a:"Пауза", b:["Ускорение", "Резьба", "Возврат"]}
  ];
  
  // Генерация 150 дополнительных вопросов на логику и арифметику
  for(var i=0; i<150; i++) {
      var num = i + 10;
      extraQuestions.push({
          q: "Вопрос на эрудицию №" + num + ": Сколько будет " + num + " * 2?",
          a: (num * 2).toString(),
          b: [(num * 2 + 1).toString(), (num * 2 - 1).toString(), (num * 3).toString()]
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
      currentQuestions = mgShuffle(questionsPool).slice(0, 10); // 10 ВОПРОСОВ
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
          // ЭФФЕКТ ТРЯСКИ ПРИ ОШИБКЕ
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

/* ============================================================
   4. САПЕР
   ============================================================ */
window.renderMinesweeperPage = function() {
    var app = document.getElementById("app"); if(!app) return; app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Сапер";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    
    var size = 10, minesCount = 15;
    var board = [], revealed = [], flags = [];
    var gameOver = false, flagsCount = 0;

    var block = el(`<section class="module" style="text-align:center;">
        <h2>💣 Сапер</h2>
        <div style="margin-bottom:15px; font-size:18px;">Флагов: <span id="mineFlags">0</span> / ${minesCount}</div>
        <div id="mineBoard" style="display:grid; grid-template-columns:repeat(${size}, 32px); gap:2px; justify-content:center; margin:0 auto;"></div>
        <button class="btn" style="margin-top:20px;" onclick="window.renderMinesweeperPage()">Начать заново</button>
    </section>`);
    app.appendChild(block);
    var grid = block.querySelector("#mineBoard");
    var flagDisplay = block.querySelector("#mineFlags");

    function initGame() {
        board = Array(size).fill(0).map(() => Array(size).fill(0));
        revealed = Array(size).fill(false).map(() => Array(size).fill(false));
        flags = Array(size).fill(false).map(() => Array(size).fill(false));
        gameOver = false; flagsCount = 0;
        
        var placed = 0;
        while(placed < minesCount) {
            var r = Math.floor(Math.random() * size);
            var c = Math.floor(Math.random() * size);
            if (board[r][c] !== -1) { board[r][c] = -1; placed++; }
        }
        for (var r = 0; r < size; r++) {
            for (var c = 0; c < size; c++) {
                if (board[r][c] === -1) continue;
                var count = 0;
                for (var i = -1; i <= 1; i++) for (var j = -1; j <= 1; j++) {
                    if (r+i >= 0 && r+i < size && c+j >= 0 && c+j < size && board[r+i][c+j] === -1) count++;
                }
                board[r][c] = count;
            }
        }
        renderBoard();
    }

    function reveal(r, c) {
        if (r < 0 || r >= size || c < 0 || c >= size || revealed[r][c] || flags[r][c] || gameOver) return;
        revealed[r][c] = true;
        if (board[r][c] === 0) {
            for (var i = -1; i <= 1; i++) for (var j = -1; j <= 1; j++) reveal(r+i, c+j);
        }
        if (board[r][c] === -1) { gameOver = true; alert("💥 БУМ! Вы подорвались."); }
        renderBoard();
        checkWin();
    }

    function toggleFlag(e, r, c) {
        e.preventDefault();
        if (revealed[r][c] || gameOver) return;
        flags[r][c] = !flags[r][c];
        flagsCount += flags[r][c] ? 1 : -1;
        flagDisplay.textContent = flagsCount;
        renderBoard();
    }

    function checkWin() {
        var opened = 0;
        for (var r = 0; r < size; r++) for (var c = 0; c < size; c++) if (revealed[r][c]) opened++;
        if (opened === size*size - minesCount) { 
            gameOver = true; 
            alert("🎉 ПОБЕДА! +30 XP"); 
            if(window.addXP) window.addXP(30); 
            if(window.unlockAchievement) window.unlockAchievement('t_sapper');
        }
    }

    function renderBoard() {
        grid.innerHTML = "";
        for (var r = 0; r < size; r++) {
            for (var c = 0; c < size; c++) {
                var cell = el(`<div style="width:32px; height:32px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:14px; cursor:pointer; border-radius:4px; background:${revealed[r][c] ? 'var(--card-soft)' : 'var(--border)'}; color:var(--text);"></div>`);
                if (revealed[r][c]) {
                    if (board[r][c] === -1) { cell.textContent = "💥"; cell.style.background = "var(--err)"; }
                    else if (board[r][c] > 0) {
                        cell.textContent = board[r][c];
                        var colors = ["", "#0000ff", "#008000", "#ff0000", "#000080", "#800000", "#008080", "#000000", "#808080"];
                        cell.style.color = colors[board[r][c]];
                    }
                } else if (flags[r][c]) {
                    cell.textContent = "🚩";
                }
                cell.addEventListener("click", (function(r,c){ return function(){ reveal(r,c); }; })(r,c));
                cell.addEventListener("contextmenu", (function(r,c){ return function(e){ toggleFlag(e,r,c); }; })(r,c));
                grid.appendChild(cell);
            }
        }
    }
    initGame();
};

/* ============================================================
   5. ПАСЬЯНС ПАУК (1 масть)
   ============================================================ */
window.renderSpiderPage = function() {
    var app = document.getElementById("app"); if(!app) return; app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Пасьянс Паук";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));

    var suits = ["♠"]; 
    var ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    var deck = [];
    
    for (var i = 0; i < 8; i++) {
        ranks.forEach(r => deck.push({ r: r, s: suits[0], val: ranks.indexOf(r) + 1 }));
    }
    deck = deck.sort(() => Math.random() - 0.5);

    var columns = Array(10).fill(null).map(() => []);
    var selectedCard = null; 
    var stock = []; 

    for (var i = 0; i < 10; i++) {
        var count = i < 4 ? 6 : 5;
        for (var j = 0; j < count; j++) {
            var card = deck.pop();
            card.faceUp = (j === count - 1); 
            columns[i].push(card);
        }
    }
    stock = deck; 

    var block = el(`<section class="module" style="background:#1a472a; min-height:600px;">
        <h2 style="text-align:center; color:#fff;">🕷️ Пасьянс Паук</h2>
        <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
            <div style="color:#fff;">Ходы: <span id="movesCount">0</span></div>
            <button class="btn" id="dealBtn" style="background:#ffcc00; color:#000;">Раздать из колоды (<span id="stockCount">${stock.length}</span>)</button>
        </div>
        <div id="spiderBoard" style="display:flex; gap:10px; justify-content:center; overflow-x:auto; padding-bottom:20px;"></div>
    </section>`);
    app.appendChild(block);
    
    var boardEl = block.querySelector("#spiderBoard");
    var moves = 0;

    function renderBoard() {
        boardEl.innerHTML = "";
        columns.forEach((col, cIdx) => {
            var colEl = el(`<div style="display:flex; flex-direction:column; min-width:70px; min-height:400px; background:rgba(0,0,0,0.2); border-radius:8px; padding:4px;" data-col="${cIdx}"></div>`);
            
            col.forEach((card, rIdx) => {
                var cardEl = el(`<div style="width:70px; height:100px; border-radius:6px; border:1px solid #333; background:${card.faceUp ? '#fff' : '#1e3a8a'}; position:relative; margin-bottom:-80px; display:flex; flex-direction:column; justify-content:space-between; padding:4px; cursor:pointer;">
                    <div style="font-size:16px; color:${card.faceUp ? '#000' : 'transparent'}; font-weight:bold;">${card.faceUp ? card.r + card.s : ''}</div>
                    <div style="font-size:24px; text-align:center; color:${card.faceUp ? '#000' : 'transparent'};">${card.faceUp ? card.s : ''}</div>
                </div>`);
                
                if (selectedCard && selectedCard.col === cIdx && selectedCard.idx === rIdx) {
                    cardEl.style.boxShadow = "0 0 0 3px #ffcc00";
                    cardEl.style.transform = "translateY(-10px)";
                }

                cardEl.onclick = () => handleCardClick(cIdx, rIdx);
                colEl.appendChild(cardEl);
            });
            
            colEl.onclick = (e) => {
                if (e.target === colEl) handleColumnClick(cIdx);
            };
            boardEl.appendChild(colEl);
        });
    }

    function handleCardClick(colIdx, cardIdx) {
        var col = columns[colIdx];
        var card = col[cardIdx];
        if (!card.faceUp) return;

        if (selectedCard) {
            if (selectedCard.col === colIdx) { selectedCard = null; renderBoard(); return; }
            
            var movingCards = columns[selectedCard.col].slice(selectedCard.idx);
            var isValid = true;
            for (var i = 0; i < movingCards.length - 1; i++) {
                if (movingCards[i].val !== movingCards[i+1].val + 1) isValid = false;
            }
            
            var targetCol = columns[colIdx];
            var topCard = targetCol.length > 0 ? targetCol[targetCol.length - 1] : null;

            if (isValid && (!topCard || topCard.val === movingCards[0].val + 1)) {
                columns[selectedCard.col].splice(selectedCard.idx);
                columns[colIdx] = targetCol.concat(movingCards);
                selectedCard = null;
                moves++;
                block.querySelector("#movesCount").textContent = moves;
                
                columns.forEach(c => {
                    if (c.length > 0 && !c[c.length - 1].faceUp) c[c.length - 1].faceUp = true;
                });

                checkWin(); renderBoard();
            } else {
                selectedCard = { col: colIdx, idx: cardIdx };
                renderBoard();
            }
        } else {
            selectedCard = { col: colIdx, idx: cardIdx };
            renderBoard();
        }
    }

    function handleColumnClick(colIdx) {
        if (!selectedCard) return;
        if (selectedCard.col === colIdx) { selectedCard = null; renderBoard(); return; }
        
        var movingCards = columns[selectedCard.col].slice(selectedCard.idx);
        var isValid = true;
        for (var i = 0; i < movingCards.length - 1; i++) {
            if (movingCards[i].val !== movingCards[i+1].val + 1) isValid = false;
        }

        if (isValid && columns[colIdx].length === 0) {
            columns[selectedCard.col].splice(selectedCard.idx);
            columns[colIdx] = columns[colIdx].concat(movingCards);
            selectedCard = null;
            moves++;
            block.querySelector("#movesCount").textContent = moves;
            columns.forEach(c => { if (c.length > 0 && !c[c.length - 1].faceUp) c[c.length - 1].faceUp = true; });
            checkWin(); renderBoard();
        } else {
            selectedCard = null; renderBoard();
        }
    }

    block.querySelector("#dealBtn").onclick = () => {
        if (stock.length < 10) { alert("В колоде недостаточно карт!"); return; }
        for (var i = 0; i < 10; i++) {
            var card = stock.pop();
            card.faceUp = true;
            columns[i].push(card);
        }
        block.querySelector("#stockCount").textContent = stock.length;
        renderBoard();
    };

    function checkWin() {
        var won = columns.every(c => c.length === 0 || (c.length === 13 && c[0].val === 13));
        if (won) { 
            setTimeout(() => {
                alert("🎉 ПОБЕДА! +100 XP"); 
                if(window.addXP) window.addXP(100); 
                if(window.unlockAchievement) window.unlockAchievement('t_spider');
            }, 100); 
        }
    }

    renderBoard();
};