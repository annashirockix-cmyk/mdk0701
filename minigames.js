"use strict";

window.renderArcadePage = function() {
  var app = document.getElementById("app"); app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Игровая комната";
  app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a><section class="hero"><h1>🎮 Игровая комната</h1></section>'));
  
  var games = [
    { name: "Крестики-нолики 4×4", render: window.renderTicTacToePage },
    { name: "Викторина по G-коду", render: window.renderGCodeTestPage }
  ];
  
  var grid = el('<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;"></div>');
  games.forEach(g => {
    var card = el(`<div class="module" style="cursor:pointer;text-align:center;padding:20px;"><h3>${g.name}</h3></div>`);
    card.onclick = g.render;
    grid.appendChild(card);
  });
  app.appendChild(grid);
};

window.renderTicTacToePage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Крестики-нолики 4×4";
  app.appendChild(el('<a class="backlink" href="#/arcade" style="color:var(--accent);">← Назад в комнату</a>'));
  
  var block = el(`<section class="module" style="text-align:center;">
    <h2>Крестики-нолики 4×4</h2>
    <p class="sub" style="margin-bottom:15px;">Соберите 4 в ряд (X - вы, O - компьютер)</p>
    <div id="tttBoard" style="display:grid;grid-template-columns:repeat(4, 1fr);gap:8px;max-width:320px;margin:20px auto;width:100%;"></div>
    <div id="tttStatus" style="font-weight:bold;font-size:18px;color:var(--accent);min-height:28px;"></div>
    <div style="margin-top:20px;"><button class="btn ghost" id="tttReset">Сбросить</button></div>
  </section>`);
  app.appendChild(block);
  
  var board = Array(16).fill("");
  var boardEl = block.querySelector("#tttBoard");
  var statusEl = block.querySelector("#tttStatus");
  
  function renderBoard() {
    boardEl.innerHTML = "";
    board.forEach(function(cell, i) {
      var b = document.createElement("button");
      b.className = "btn ghost";
      b.style = "height: 60px; font-size: 24px; font-weight: bold; display: flex; align-items: center; justify-content: center; border-radius: 8px;";
      if (cell === "X") b.style.color = "var(--accent)";
      if (cell === "O") b.style.color = "var(--ok)";
      b.textContent = cell;
      b.onclick = function() { play(i); };
      if (cell !== "" || statusEl.textContent !== "") b.disabled = true;
      boardEl.appendChild(b);
    });
  }
  
  function checkWin(player) {
    const lines = [
        [0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15],
        [0,4,8,12],[1,5,9,13],[2,6,10,14],[3,7,11,15],
        [0,5,10,15],[3,6,9,12]
    ];
    return lines.some(line => line.every(idx => board[idx] === player));
  }
  
  function play(i) {
    if (board[i] !== "" || statusEl.textContent !== "") return;
    board[i] = "X";
    renderBoard();
    if (checkWin("X")) { statusEl.textContent = "Вы победили!"; return; }
    if (!board.includes("")) { statusEl.textContent = "Ничья!"; return; }
    
    setTimeout(function() {
        let empty = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
        if (empty.length > 0) {
            let aiMove = empty[Math.floor(Math.random() * empty.length)];
            board[aiMove] = "O";
            renderBoard();
            if (checkWin("O")) { statusEl.textContent = "Компьютер победил!"; return; }
            if (!board.includes("")) { statusEl.textContent = "Ничья!"; }
        }
    }, 300);
  }
  
  block.querySelector("#tttReset").onclick = function() {
    board = Array(16).fill("");
    statusEl.textContent = "";
    renderBoard();
  };
  
  renderBoard();
};

window.renderGCodeTestPage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Тест G-кода";
  app.appendChild(el('<a class="backlink" href="#/arcade" style="color:var(--accent);">← Назад в комнату</a>'));
  
  var block = el(`<section class="module" style="text-align:center;">
    <h2>Тест на знание G-кода</h2>
    <div id="gcodeQuestion" style="font-size: 18px; margin: 20px 0; font-weight: bold;"></div>
    <div id="gcodeOptions" style="display: flex; flex-direction: column; gap: 10px; max-width: 400px; margin: 0 auto;"></div>
    <div id="gcodeResult" style="font-weight: bold; margin-top: 20px; min-height: 28px;"></div>
  </section>`);
  app.appendChild(block);
  
  var qEl = block.querySelector("#gcodeQuestion");
  var optsEl = block.querySelector("#gcodeOptions");
  var resEl = block.querySelector("#gcodeResult");
  
  var questions = [
    { q: "Что означает G00?", options: ["Линейная интерполяция", "Быстрое перемещение", "Круговая интерполяция"], correct: 1 },
    { q: "Что означает M30?", options: ["Конец программы", "Включение шпинделя", "Включение СОЖ"], correct: 0 },
    { q: "Какая команда задаёт подачу?", options: ["S", "F", "T"], correct: 1 },
    { q: "Какой код отвечает за коррекцию длины инструмента?", options: ["G41", "G42", "G43"], correct: 2 }
  ];
  
  var current = 0;
  var score = 0;
  
  function renderQ() {
    if (current >= questions.length) {
      qEl.textContent = "Тест завершен!";
      optsEl.innerHTML = "";
      resEl.innerHTML = `Ваш результат: ${score} из ${questions.length}<br><button class="btn" onclick="window.renderGCodeTestPage()" style="margin-top:15px;">Пройти снова</button>`;
      return;
    }
    var q = questions[current];
    qEl.textContent = (current + 1) + ". " + q.q;
    optsEl.innerHTML = "";
    resEl.textContent = "";
    
    q.options.forEach(function(opt, i) {
      var btn = document.createElement("button");
      btn.className = "btn ghost";
      btn.textContent = opt;
      btn.onclick = function() {
        if (i === q.correct) {
          score++;
          resEl.textContent = "✅ Верно!";
          resEl.style.color = "var(--ok)";
        } else {
          resEl.textContent = "❌ Неверно. Правильно: " + q.options[q.correct];
          resEl.style.color = "var(--err)";
        }
        current++;
        setTimeout(renderQ, 1000);
        optsEl.querySelectorAll("button").forEach(b => b.disabled = true);
      };
      optsEl.appendChild(btn);
    });
  }
  renderQ();
};