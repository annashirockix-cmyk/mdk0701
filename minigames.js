/* ============================================================
   МДК 07.01 — minigames.js (v113.0 — HARD TIC-TAC-TOE 4x4)
   ============================================================ */
"use strict";

window.renderTicTacToePage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Крестики-нолики 4×4";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));

  var block = el(`<section class="module" style="text-align:center;">
    <h2>Крестики-нолики 4×4</h2>
    <p class="sub" style="margin-bottom:15px;">Соберите 4 в ряд (по горизонтали, вертикали или диагонали)</p>
    <div style="margin-bottom:20px;">
      <select id="tttDiff" class="self-input" style="width:auto;display:inline-block;">
        <option value="easy">Легкий</option>
        <option value="medium">Средний</option>
        <option value="hard">Невозможный</option>
      </select>
    </div>
    <div id="tttBoard" style="display:grid;grid-template-columns:repeat(4,70px);gap:8px;justify-content:center;margin:20px auto;"></div>
    <div id="tttStatus" style="font-weight:bold;font-size:18px;color:var(--accent);min-height:28px;"></div>
    <div style="margin-top:20px;"><button class="btn ghost" id="tttReset">Сбросить</button></div>
  </section>`);
  app.appendChild(block);

  var boardEl = block.querySelector("#tttBoard"), status = block.querySelector("#tttStatus");
  var cells = Array(16).fill(null), gameOver = false;

  var LINES = [
    [0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15],
    [0,4,8,12], [1,5,9,13], [2,6,10,14], [3,7,11,15],
    [0,5,10,15], [3,6,9,12]
  ];

  function checkWin(board) {
    for (var i = 0; i < LINES.length; i++) {
      var l = LINES[i];
      if (board[l[0]] && board[l[0]] === board[l[1]] && board[l[0]] === board[l[2]] && board[l[0]] === board[l[3]]) {
        return board[l[0]];
      }
    }
    return board.indexOf(null) === -1 ? "draw" : null;
  }

  function render() {
    boardEl.innerHTML = "";
    cells.forEach(function(c, i){
      var btn = el(`<button class="btn ghost" style="height:70px;font-size:28px;display:flex;align-items:center;justify-content:center;">${c || ""}</button>`);
      btn.onclick = function(){ playerMove(i); };
      boardEl.appendChild(btn);
    });
  }

  function playerMove(i) {
    if (cells[i] || gameOver) return;
    cells[i] = "❌"; render();
    var w = checkWin(cells);
    if (w) return endGame(w);
    
    status.textContent = "Ход станка...";
    setTimeout(function() {
      aiMove();
    }, 100);
  }

  function evaluateBoard(board) {
    var score = 0;
    for (var i = 0; i < LINES.length; i++) {
      var oCount = 0, xCount = 0;
      var l = LINES[i];
      for (var j = 0; j < 4; j++) {
        if (board[l[j]] === "⭕") oCount++;
        if (board[l[j]] === "❌") xCount++;
      }
      if (oCount > 0 && xCount === 0) score += Math.pow(10, oCount);
      if (xCount > 0 && oCount === 0) score -= Math.pow(10, xCount);
    }
    return score;
  }

  function minimax(board, depth, isMax, alpha, beta) {
    var result = checkWin(board);
    if (result === "⭕") return 100000;
    if (result === "❌") return -100000;
    if (result === "draw") return 0;
    if (depth === 0) return evaluateBoard(board);

    if (isMax) {
      var maxEval = -Infinity;
      for (var i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = "⭕";
          var eval = minimax(board, depth - 1, false, alpha, beta);
          board[i] = null;
          maxEval = Math.max(maxEval, eval);
          alpha = Math.max(alpha, eval);
          if (beta <= alpha) break;
        }
      }
      return maxEval;
    } else {
      var minEval = Infinity;
      for (var j = 0; j < board.length; j++) {
        if (board[j] === null) {
          board[j] = "❌";
          var eval2 = minimax(board, depth - 1, true, alpha, beta);
          board[j] = null;
          minEval = Math.min(minEval, eval2);
          beta = Math.min(beta, eval2);
          if (beta <= alpha) break;
        }
      }
      return minEval;
    }
  }

  function getBestMove(board, depth) {
    var bestScore = -Infinity;
    var move = -1;
    for (var i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = "⭕";
        var score = minimax(board, depth - 1, false, -Infinity, Infinity);
        board[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move === -1 ? board.indexOf(null) : move;
  }

  function aiMove() {
    var diff = block.querySelector("#tttDiff").value;
    var empty = cells.map(function(c, i){ return c === null ? i : null; }).filter(function(v){ return v !== null; });
    if (!empty.length) return;

    var move;
    if (diff === "easy") {
      move = empty[Math.floor(Math.random() * empty.length)];
    } else if (diff === "medium") {
      move = getBestMove(cells, 3);
    } else {
      // На сложном смотрим на 5 шагов вперед (Alpha-Beta)
      // Если свободно больше 10 клеток, ограничиваем глубину для скорости
      var d = cells.filter(function(c){ return c === null; }).length > 10 ? 4 : 6;
      move = getBestMove(cells, d);
    }

    if (move === undefined || move === -1) {
       move = empty[Math.floor(Math.random() * empty.length)];
    }

    cells[move] = "⭕"; render();
    var w = checkWin(cells);
    if (w) return endGame(w);
    status.textContent = "Ваш ход";
  }

  function endGame(w) {
    gameOver = true;
    if (w === "draw") status.textContent = "Ничья! 🤝";
    else if (w === "❌") {
      status.textContent = "Вы победили! 🎉";
      var diff = block.querySelector("#tttDiff").value;
      var xp = diff === "easy" ? 20 : (diff === "medium" ? 50 : 150);
      if (window.addXP) window.addXP(xp);
      if (window.unlockAchievement) window.unlockAchievement('t_ttt');
    } else status.textContent = "Победил станок... ⚙️";
  }

  block.querySelector("#tttReset").onclick = function(){
    cells = Array(16).fill(null); gameOver = false; status.textContent = "Ваш ход"; render();
  };
  render();
};