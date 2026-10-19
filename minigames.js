/* ============================================================
   МДК 07.01 — minigames.js (v116.0 — STABLE)
   ============================================================ */
"use strict";

/* ---------- КРЕСТИКИ-НОЛИКИ 4×4 ---------- */
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
      if (board[l[0]] && board[l[0]] === board[l[1]] && board[l[0]] === board[l[2]] && board[l[0]] === board[l[3]]) return board[l[0]];
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
    setTimeout(function() { aiMove(); }, 100);
  }

  function evaluateBoard(board) {
    var score = 0;
    for (var i = 0; i < LINES.length; i++) {
      var oCount = 0, xCount = 0, l = LINES[i];
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
    var bestScore = -Infinity, move = -1;
    for (var i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = "⭕";
        var score = minimax(board, depth - 1, false, -Infinity, Infinity);
        board[i] = null;
        if (score > bestScore) { bestScore = score; move = i; }
      }
    }
    return move === -1 ? board.indexOf(null) : move;
  }

  function aiMove() {
    var diff = block.querySelector("#tttDiff").value;
    var empty = cells.map(function(c, i){ return c === null ? i : null; }).filter(function(v){ return v !== null; });
    if (!empty.length) return;

    var move;
    if (diff === "easy") move = empty[Math.floor(Math.random() * empty.length)];
    else if (diff === "medium") move = getBestMove(cells, 2);
    else {
      var d = cells.filter(function(c){ return c === null; }).length > 10 ? 4 : 6;
      move = getBestMove(cells, d);
    }

    if (move === undefined || move === -1) move = empty[Math.floor(Math.random() * empty.length)];

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

/* ---------- ШАХМАТЫ ---------- */
window.renderChessPage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Шахматы";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));

  var board = [
    ["♜","♞","♝","♛","♚","♝","♞","♜"], ["♟","♟","♟","♟","♟","♟","♟","♟"],
    [" "," "," "," "," "," "," "," "], [" "," "," "," "," "," "," "," "],
    [" "," "," "," "," "," "," "," "], [" "," "," "," "," "," "," "," "],
    ["♙","♙","♙","♙","♙","♙","♙","♙"], ["♖","♘","♗","♕","♔","♗","♘","♖"]
  ];
  var selected = null, isWhiteTurn = true;

  var block = el(`<section class="module" style="text-align:center; background:var(--card); border:1px solid var(--border);">
    <h2 style="color:var(--text);">♞ Шахматы</h2>
    <div style="color:var(--accent);font-weight:bold;margin-bottom:15px;" id="chessStatus">Ход белых</div>
    <div style="display:flex; justify-content:center;">
      <div id="chessBoard" style="display:grid;grid-template-columns:repeat(8,50px);gap:0;border:2px solid var(--border);user-select:none;"></div>
    </div>
    <div style="margin-top:20px;"><button class="btn" id="chessReset">Начать заново</button></div>
  </section>`);
  app.appendChild(block);

  var boardEl = block.querySelector("#chessBoard"), statusEl = block.querySelector("#chessStatus");

  function render() {
    boardEl.innerHTML = "";
    for (var r = 0; r < 8; r++) {
      for (var c = 0; c < 8; c++) {
        var piece = board[r][c], isDark = (r + c) % 2 === 1;
        var color = isDark ? "#769656" : "#eeeed2";
        var isWhitePiece = piece !== " " && piece === piece.toUpperCase();
        var pieceColor = isWhitePiece ? "#ffffff" : "#000000";
        var shadow = isWhitePiece ? "0 0 2px #000, 0 0 2px #000" : "0 0 2px #fff";

        var cell = el(`<div style="width:50px;height:50px;background:${color};display:flex;align-items:center;justify-content:center;font-size:36px;cursor:pointer;color:${pieceColor};text-shadow:${shadow};">${piece}</div>`);
        if (selected && selected.r === r && selected.c === c) cell.style.boxShadow = "inset 0 0 0 4px #ffcc00";
        cell.onclick = (function(r,c){ return function(){ handleClick(r,c); }; })(r,c);
        boardEl.appendChild(cell);
      }
    }
  }

  function handleClick(r, c) {
    if (selected) {
      if (isValidMove(selected.r, selected.c, r, c)) {
        board[r][c] = board[selected.r][selected.c];
        board[selected.r][selected.c] = " ";
        selected = null; isWhiteTurn = !isWhiteTurn;
        statusEl.textContent = isWhiteTurn ? "Ход белых" : "Ход черных";
      } else selected = null;
    } else {
      var piece = board[r][c];
      if (piece !== " ") {
        var isWhite = piece === piece.toUpperCase();
        if (isWhite === isWhiteTurn) selected = { r: r, c: c };
      }
    }
    render();
  }

  function isPathClear(r1, c1, r2, c2) {
    var dr = Math.sign(r2 - r1), dc = Math.sign(c2 - c1);
    var r = r1 + dr, c = c1 + dc;
    while (r !== r2 || c !== c2) {
      if (board[r][c] !== " ") return false;
      r += dr; c += dc;
    }
    return true;
  }

  function isValidMove(r1, c1, r2, c2) {
    var p = board[r1][c1], dr = r2 - r1, dc = c2 - c1, target = board[r2][c2];
    if (target !== " ") {
      var tw = target === target.toUpperCase(), sw = p === p.toUpperCase();
      if (sw === tw) return false;
    }
    if (p === "♙" || p === "♟") {
      var dir = p === "♙" ? -1 : 1;
      if (dc === 0 && dr === dir && target === " ") return true;
      if (Math.abs(dc) === 1 && dr === dir && target !== " ") return true;
      if (dc === 0 && dr === dir * 2 && target === " " && board[r1 + dir][c1] === " ") return true;
      return false;
    }
    if (p === "♖" || p === "♜") { if (dr === 0 || dc === 0) return isPathClear(r1, c1, r2, c2); }
    if (p === "♗" || p === "♝") { if (Math.abs(dr) === Math.abs(dc)) return isPathClear(r1, c1, r2, c2); }
    if (p === "♕" || p === "♛") { if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) return isPathClear(r1, c1, r2, c2); }
    if (p === "♘" || p === "♞") { if ((Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2)) return true; }
    if (p === "♔" || p === "♚") { if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1) return true; }
    return false;
  }

  block.querySelector("#chessReset").onclick = function(){ window.renderChessPage(); };
  render();
};

/* ---------- СУДОКУ ---------- */
window.renderSudokuPage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Судоку 4×4";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));

  var solution = [[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]];
  var puzzle = [[1,0,0,4],[0,4,1,0],[0,1,4,0],[4,0,0,1]];
  var grid = puzzle.map(function(row){ return row.slice(); });

  var block = el('<section class="module" style="text-align:center;"><h2>Судоку 4×4</h2><p class="sub">Заполните пустые клетки цифрами 1–4.</p><div id="sudokuGrid" style="display:inline-grid;grid-template-columns:repeat(4,60px);gap:2px;margin:20px auto;"></div><div id="sudokuStatus" style="font-weight:bold;min-height:28px;color:var(--accent);"></div><div style="margin-top:20px;"><button class="btn ghost" id="sudokuReset">Сбросить</button></div></section>');
  app.appendChild(block);

  function render() {
    var gridEl = block.querySelector("#sudokuGrid");
    gridEl.innerHTML = "";
    for (var r = 0; r < 4; r++) {
      for (var c = 0; c < 4; c++) {
        var val = grid[r][c], isFixed = puzzle[r][c] !== 0;
        var cell = el('<input type="number" min="1" max="4" value="' + (val || "") + '" style="width:60px;height:60px;font-size:24px;text-align:center;font-weight:bold;border:1px solid var(--border);background:' + (isFixed ? 'var(--accent-soft)' : 'var(--card)') + ';color:var(--text);border-radius:8px;" ' + (isFixed ? "disabled" : "") + ' data-r="' + r + '" data-c="' + c + '">');
        cell.oninput = (function(r,c){ return function(e){
            var v = parseInt(e.target.value, 10) || 0;
            if (v < 1 || v > 4) { e.target.value = ""; grid[r][c] = 0; return; }
            grid[r][c] = v; checkWin();
        }; })(r, c);
        gridEl.appendChild(cell);
      }
    }
  }

  function checkWin() {
    var status = block.querySelector("#sudokuStatus");
    for (var r = 0; r < 4; r++) {
      for (var c = 0; c < 4; c++) {
        if (grid[r][c] !== solution[r][c]) { status.textContent = ""; return; }
      }
    }
    status.textContent = "🎉 Решено! +50 XP"; status.style.color = "var(--ok)";
    if (window.addXP) window.addXP(50);
    if (window.unlockAchievement) window.unlockAchievement('t_sudoku');
  }

  block.querySelector("#sudokuReset").onclick = function(){
    grid = puzzle.map(function(row){ return row.slice(); });
    block.querySelector("#sudokuStatus").textContent = "";
    render();
  };
  render();
};

/* ---------- САПЁР ---------- */
window.renderMinesweeperPage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Сапёр";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));

  var SIZE = 8, MINES = 10;
  var mines = [], revealed = [], gameOver = false;

  function init() {
    mines = []; revealed = []; gameOver = false;
    for (var r = 0; r < SIZE; r++) {
      mines.push(Array(SIZE).fill(false));
      revealed.push(Array(SIZE).fill(false));
    }
    var placed = 0;
    while (placed < MINES) {
      var r = Math.floor(Math.random() * SIZE), c = Math.floor(Math.random() * SIZE);
      if (!mines[r][c]) { mines[r][c] = true; placed++; }
    }
  }

  function countNear(r, c) {
    var n = 0;
    for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      var nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && mines[nr][nc]) n++;
    }
    return n;
  }

  function reveal(r, c) {
    if (gameOver || revealed[r][c]) return;
    revealed[r][c] = true;
    if (mines[r][c]) { gameOver = true; render(); return; }
    if (countNear(r, c) === 0) {
      for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        var nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && !revealed[nr][nc]) reveal(nr, nc);
      }
    }
  }

  var block = el('<section class="module" style="text-align:center;"><h2>💣 Сапёр 8×8</h2><div id="msGrid" style="display:inline-grid;grid-template-columns:repeat(8,40px);gap:2px;margin:20px auto;"></div><div id="msStatus" style="font-weight:bold;min-height:28px;color:var(--accent);"></div><div style="margin-top:20px;"><button class="btn ghost" id="msReset">Заново</button></div></section>');
  app.appendChild(block);

  function render() {
    var gridEl = block.querySelector("#msGrid"); gridEl.innerHTML = "";
    var won = true;
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        var isRev = revealed[r][c], isMine = mines[r][c];
        var near = isRev ? countNear(r, c) : 0;
        var label = "";
        if (isRev) {
          if (isMine) { label = "💥"; won = false; }
          else if (near > 0) label = String(near);
        } else if (!isMine) { won = false; }
        var cell = el('<button style="width:40px;height:40px;font-size:16px;font-weight:bold;border:1px solid var(--border);border-radius:6px;background:' + (isRev ? 'var(--card-soft)' : 'var(--card)') + ';color:var(--text);cursor:pointer;">' + label + '</button>');
        cell.onclick = (function(r, c){ return function(){
            if (gameOver || revealed[r][c]) return;
            reveal(r, c);
            if (mines[r][c]) {
              gameOver = true;
              for (var rr = 0; rr < SIZE; rr++) for (var cc = 0; cc < SIZE; cc++) if (mines[rr][cc]) revealed[rr][cc] = true;
            }
            render();
        }; })(r, c);
        gridEl.appendChild(cell);
      }
    }
    var status = block.querySelector("#msStatus");
    if (gameOver) { status.textContent = "💥 Вы подорвались!"; status.style.color = "var(--err)"; }
    else if (won) { status.textContent = "🎉 Победа! +100 XP"; status.style.color = "var(--ok)"; if (window.addXP) window.addXP(100); if (window.unlockAchievement) window.unlockAchievement('t_minesweeper'); }
    else { status.textContent = ""; }
  }

  block.querySelector("#msReset").onclick = function(){ init(); render(); };
  init(); render();
};

/* ---------- ПАСЬЯНС ПАУК ---------- */
window.renderSpiderPage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Пасьянс Паук";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  
  var deck = [], suits = ["♠", "♥", "♦", "♣"];
  for (var i=0; i<8; i++) for (var r=1; r<=13; r++) deck.push({ rank: r, suit: suits[i % 4], faceUp: false });
  for (var i=deck.length-1; i>0; i--) {
    var j = Math.floor(Math.random()*(i+1)), t = deck[i]; deck[i] = deck[j]; deck[j] = t;
  }
  
  var cols = [[],[],[],[],[],[],[],[],[],[]];
  for (var c=0; c<10; c++) {
    var count = c < 4 ? 6 : 5;
    for (var k=0; k<count; k++) {
      var card = deck.pop(); if (k === count-1) card.faceUp = true; cols[c].push(card);
    }
  }
  var stock = deck, selected = null;

  var block = el(`<section class="module" style="text-align:center;">
    <h2>🕷️ Пасьянс Паук</h2>
    <div style="display:flex; justify-content:center; gap:10px; margin-bottom:20px;">
      <button class="btn" id="spiderDeal">Раздать (<span id="stockCount">${stock.length/10}</span>)</button>
      <button class="btn ghost" id="spiderReset">Заново</button>
    </div>
    <div id="spiderBoard" style="display:flex; gap:10px; justify-content:center; min-height:400px; align-items:flex-start; overflow-x:auto; padding-bottom:100px;"></div>
    <div id="spiderStatus" style="font-weight:bold; margin-top:20px; color:var(--ok);"></div>
  </section>`);
  app.appendChild(block);

  function render() {
    var board = block.querySelector("#spiderBoard"); board.innerHTML = "";
    cols.forEach((col, cIdx) => {
      var colEl = el(`<div style="width:60px; min-height:300px; background:rgba(0,0,0,0.05); border:1px dashed var(--border); border-radius:8px; display:flex; flex-direction:column; align-items:center; padding-top:10px;" data-col="${cIdx}"></div>`);
      col.forEach((card, rIdx) => {
        if (!card.faceUp) {
          colEl.appendChild(el(`<div style="width:50px; height:70px; background:var(--accent); border-radius:6px; border:1px solid var(--border); margin-bottom:-50px; box-shadow: 0 1px 2px rgba(0,0,0,0.2); z-index:${rIdx};"></div>`));
        } else {
          var isSelected = selected && selected.col === cIdx && selected.idx === rIdx;
          var color = (card.suit === "♥" || card.suit === "♦") ? "#e74c3c" : "#000";
          var cardEl = el(`<div style="width:50px; height:70px; background:#fff; color:${color}; border-radius:6px; border:${isSelected ? '3px solid var(--accent)' : '1px solid #ccc'}; display:flex; flex-direction:column; align-items:center; justify-content:center; font-weight:bold; font-size:18px; margin-bottom:-50px; box-shadow: 0 1px 3px rgba(0,0,0,0.3); z-index:${rIdx}; cursor:pointer; position:relative;"><div>${card.suit}</div><div>${card.rank}</div></div>`);
          cardEl.onclick = function(e) { e.stopPropagation(); handleCardClick(cIdx, rIdx); };
          colEl.appendChild(cardEl);
        }
      });
      colEl.appendChild(el(`<div style="height:70px; width:50px;"></div>`));
      board.appendChild(colEl);
    });
  }

  function handleCardClick(c, r) {
    var card = cols[c][r]; if (!card.faceUp) return;
    if (selected) {
      if (selected.col === c && selected.idx === r) { selected = null; render(); return; }
      var srcCards = cols[selected.col].slice(selected.idx), dstCol = cols[c], dstCard = dstCol[dstCol.length - 1];
      var canMove = false;
      if (!dstCard) canMove = true;
      else if (dstCard.rank === srcCards[0].rank + 1) {
        var validSeq = true;
        for (var i=0; i<srcCards.length-1; i++) if (srcCards[i].rank !== srcCards[i+1].rank + 1) { validSeq = false; break; }
        if (validSeq) canMove = true;
      }
      if (canMove) {
        var moving = cols[selected.col].splice(selected.idx);
        cols[c] = cols[c].concat(moving);
        if (cols[selected.col].length > 0) cols[selected.col][cols[selected.col].length-1].faceUp = true;
        selected = null; checkWin();
      } else selected = { col: c, idx: r };
    } else selected = { col: c, idx: r };
    render();
  }

  function checkWin() {
    for (var c=0; c<10; c++) {
      var col = cols[c];
      if (col.length >= 13) {
        var top13 = col.slice(-13), isSeq = true;
        for (var i=0; i<12; i++) if (top13[i].rank !== top13[i+1].rank + 1) { isSeq = false; break; }
        if (isSeq) {
          col.splice(-13, 13);
          block.querySelector("#spiderStatus").textContent = "🎉 Собрана последовательность! +20 XP";
          if (col.length > 0) col[col.length-1].faceUp = true;
          if (window.addXP) window.addXP(20);
          setTimeout(function(){ block.querySelector("#spiderStatus").textContent = ""; }, 3000);
          render(); return;
        }
      }
    }
  }

  block.querySelector("#spiderReset").onclick = function() { window.renderSpiderPage(); };
  block.querySelector("#spiderDeal").onclick = function() {
    if (stock.length === 0) return;
    if (cols.some(c => c.length === 0)) { window.showToast("Нельзя раздавать при пустой колонке", "err"); return; }
    for (var c=0; c<10; c++) { var card = stock.pop(); card.faceUp = true; cols[c].push(card); }
    selected = null; render(); block.querySelector("#stockCount").textContent = stock.length / 10;
  };
  render();
};

/* ---------- ШАШКИ ---------- */
window.renderCheckersPage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Шашки";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  var board = [], selected = null, isWhiteTurn = true, gameOver = false;

  function init() {
    board = []; selected = null; isWhiteTurn = true; gameOver = false;
    for (var r = 0; r < 8; r++) {
      var row = [];
      for (var c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1 && r < 3) row.push("⚫");
        else if ((r + c) % 2 === 1 && r > 4) row.push("⚪");
        else row.push("");
      }
      board.push(row);
    }
  }

  var block = el('<section class="module" style="text-align:center;"><h2>⚪ Шашки</h2><div style="font-weight:bold;margin-bottom:12px;" id="chkStatus">Ход белых</div><div id="chkBoard" style="display:inline-grid;grid-template-columns:repeat(8,45px);gap:0;border:2px solid var(--border);"></div><div style="margin-top:16px;"><button class="btn ghost" id="chkReset">Заново</button></div></section>');
  app.appendChild(block);

  function render() {
    var gridEl = block.querySelector("#chkBoard"); gridEl.innerHTML = "";
    for (var r = 0; r < 8; r++) {
      for (var c = 0; c < 8; c++) {
        var isDark = (r + c) % 2 === 1, bg = isDark ? "#8b6f47" : "#f0d9b5";
        var piece = board[r][c];
        var cell = el('<div style="width:45px;height:45px;background:' + bg + ';display:flex;align-items:center;justify-content:center;font-size:30px;cursor:pointer;">' + piece + '</div>');
        if (selected && selected.r === r && selected.c === c) cell.style.boxShadow = "inset 0 0 0 3px #ffcc00";
        cell.onclick = (function(r,c){ return function(){ handleClick(r,c); }; })(r,c);
        gridEl.appendChild(cell);
      }
    }
  }

  function canMove(r1, c1, r2, c2) {
    if (r2 < 0 || r2 > 7 || c2 < 0 || c2 > 7) return false;
    if (board[r2][c2] !== "") return false;
    var p = board[r1][c1], dir = p === "⚪" ? -1 : 1;
    if (r2 - r1 === dir && Math.abs(c2 - c1) === 1) return true;
    if (r2 - r1 === 2 * dir && Math.abs(c2 - c1) === 2) {
      var mid = board[r1 + dir][(c1 + c2) / 2];
      if (mid && mid !== p) return true;
    }
    return false;
  }

  function handleClick(r, c) {
    if (gameOver) return;
    if (selected) {
      if (canMove(selected.r, selected.c, r, c)) {
        var p = board[selected.r][selected.c];
        if (Math.abs(r - selected.r) === 2) board[(selected.r + r) / 2][(selected.c + c) / 2] = "";
        board[r][c] = p; board[selected.r][selected.c] = "";
        selected = null; isWhiteTurn = false;
        block.querySelector("#chkStatus").textContent = "Ход чёрных";
        render(); setTimeout(aiMove, 400); return;
      }
      selected = null; render(); return;
    }
    var piece = board[r][c];
    if (piece && piece === (isWhiteTurn ? "⚪" : "⚫")) { selected = { r: r, c: c }; render(); }
  }

  function aiMove() {
    if (gameOver) return;
    var moves = [];
    for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
      if (board[r][c] !== "⚫") continue;
      var dir = 1;
      [[dir, -1], [dir, 1], [2*dir, -2], [2*dir, 2]].forEach(function(m){
        var nr = r + m[0], nc = c + m[1];
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === "") {
          if (Math.abs(m[0]) === 1) moves.push({ from: { r: r, c: c }, to: { r: nr, c: nc }, kill: null });
          else {
            var mid = board[r + dir][(c + nc) / 2];
            if (mid === "⚪") moves.push({ from: { r: r, c: c }, to: { r: nr, c: nc }, kill: { r: r + dir, c: (c + nc) / 2 } });
          }
        }
      });
    }
    if (!moves.length) {
      gameOver = true; block.querySelector("#chkStatus").textContent = "🎉 Вы победили! +80 XP";
      if (window.addXP) window.addXP(80); return;
    }
    var move = moves[Math.floor(Math.random() * moves.length)];
    board[move.to.r][move.to.c] = "⚫"; board[move.from.r][move.from.c] = "";
    if (move.kill) board[move.kill.r][move.kill.c] = "";
    isWhiteTurn = true; block.querySelector("#chkStatus").textContent = "Ход белых"; render();
  }

  block.querySelector("#chkReset").onclick = function(){ init(); render(); };
  init(); render();
};