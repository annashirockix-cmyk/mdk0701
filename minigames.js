/* ============================================================
   МДК 07.01 — minigames.js (v126.0 — FULL UPDATE)
   ============================================================ */
"use strict";

/* ============================================================
   1. КРЕСТИКИ-НОЛИКИ 4×4 (Сложный ИИ)
   ============================================================ */
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
          var evalScore = minimax(board, depth - 1, false, alpha, beta);
          board[i] = null;
          maxEval = Math.max(maxEval, evalScore);
          alpha = Math.max(alpha, evalScore);
          if (beta <= alpha) break;
        }
      }
      return maxEval;
    } else {
      var minEval = Infinity;
      for (var j = 0; j < board.length; j++) {
        if (board[j] === null) {
          board[j] = "❌";
          var evalScore2 = minimax(board, depth - 1, true, alpha, beta);
          board[j] = null;
          minEval = Math.min(minEval, evalScore2);
          beta = Math.min(beta, evalScore2);
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

/* ============================================================
   2. СУДОКУ 4×4
   ============================================================ */
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

/* ============================================================
   3. САПЁР (С ФЛАЖКАМИ)
   ============================================================ */
window.renderMinesweeperPage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Сапёр";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));

  var SIZE = 8, MINES = 10;
  var mines = [], revealed = [], flagged = [], gameOver = false, flagMode = false;

  function init() {
    mines = []; revealed = []; flagged = []; gameOver = false; flagMode = false;
    for (var r = 0; r < SIZE; r++) {
      mines.push(Array(SIZE).fill(false));
      revealed.push(Array(SIZE).fill(false));
      flagged.push(Array(SIZE).fill(false));
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
    if (gameOver || revealed[r][c] || flagged[r][c]) return;
    revealed[r][c] = true;
    if (mines[r][c]) { gameOver = true; return; }
    if (countNear(r, c) === 0) {
      for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        var nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && !revealed[nr][nc]) reveal(nr, nc);
      }
    }
  }

  var block = el('<section class="module" style="text-align:center;"><h2>💣 Сапёр 8×8</h2>' +
    '<div style="margin-bottom:16px;"><button class="btn ' + (flagMode ? '' : 'ghost') + '" id="msFlagBtn">🚩 Режим флажка: ВЫКЛ</button></div>' +
    '<div id="msGrid" style="display:inline-grid;grid-template-columns:repeat(8,40px);gap:2px;margin:20px auto;"></div>' +
    '<div id="msStatus" style="font-weight:bold;min-height:28px;color:var(--accent);"></div>' +
    '<div style="margin-top:20px;"><button class="btn ghost" id="msReset">Заново</button></div></section>');
  app.appendChild(block);

  var flagBtn = block.querySelector("#msFlagBtn");

  function render() {
    var gridEl = block.querySelector("#msGrid"); gridEl.innerHTML = "";
    var won = true;
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        var isRev = revealed[r][c], isMine = mines[r][c], isFlag = flagged[r][c];
        var near = isRev ? countNear(r, c) : 0;
        var label = "";
        var bg = 'var(--card)';
        
        if (isRev) {
          bg = 'var(--card-soft)';
          if (isMine) { label = "💥"; won = false; }
          else if (near > 0) label = String(near);
        } else if (isFlag) {
          label = "🚩";
        } else if (!isMine) { won = false; }

        var cell = el('<button style="width:40px;height:40px;font-size:16px;font-weight:bold;border:1px solid var(--border);border-radius:6px;background:' + bg + ';color:var(--text);cursor:pointer;user-select:none;">' + label + '</button>');
        
        cell.onclick = (function(r, c){ return function(e){
            if (gameOver || revealed[r][c]) return;
            if (flagMode) {
                flagged[r][c] = !flagged[r][c];
                render();
            } else {
                if (flagged[r][c]) return;
                reveal(r, c);
                if (mines[r][c]) {
                  gameOver = true;
                  for (var rr = 0; rr < SIZE; rr++) for (var cc = 0; cc < SIZE; cc++) if (mines[rr][cc]) revealed[rr][cc] = true;
                }
                render();
            }
        }; })(r, c);

        cell.oncontextmenu = (function(r, c){ return function(e){
            e.preventDefault();
            if (gameOver || revealed[r][c]) return;
            flagged[r][c] = !flagged[r][c];
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

  flagBtn.onclick = function() {
    flagMode = !flagMode;
    flagBtn.textContent = "🚩 Режим флажка: " + (flagMode ? "ВКЛ" : "ВЫКЛ");
    flagBtn.className = "btn " + (flagMode ? "" : "ghost");
  };

  block.querySelector("#msReset").onclick = function(){ init(); render(); flagBtn.textContent = "🚩 Режим флажка: ВЫКЛ"; flagBtn.className = "btn ghost"; };
  init(); render();
};

/* ============================================================
   4. ПАСЬЯНС ПАУК (Упрощенный)
   ============================================================ */
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

/* ============================================================
   5. КАЗИНО (СЛОТЫ) — НЕРФ
   ============================================================ */
window.renderCasinoPage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = "";
  document.getElementById("crumbs").textContent = "🎰 Казино";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));

  if (!state.student) {
    app.appendChild(el('<div class="module">Войдите как студент, чтобы испытать удачу.</div>'));
    return;
  }

  var block = el('<section class="module" style="text-align:center;">' +
    '<h2>🎰 Испытай удачу</h2>' +
    '<p class="sub">Собери 3 одинаковых символа и сорви куш!</p>' +
    '<div style="display:flex; justify-content:center; gap:15px; margin:40px 0; flex-wrap:wrap;">' +
      '<div id="reel1" style="font-size:64px; width:100px; height:120px; background:var(--card-soft); border:2px solid var(--border); border-radius:12px; display:flex; align-items:center; justify-content:center; box-shadow: inset 0 0 15px rgba(0,0,0,0.1);">❓</div>' +
      '<div id="reel2" style="font-size:64px; width:100px; height:120px; background:var(--card-soft); border:2px solid var(--border); border-radius:12px; display:flex; align-items:center; justify-content:center; box-shadow: inset 0 0 15px rgba(0,0,0,0.1);">❓</div>' +
      '<div id="reel3" style="font-size:64px; width:100px; height:120px; background:var(--card-soft); border:2px solid var(--border); border-radius:12px; display:flex; align-items:center; justify-content:center; box-shadow: inset 0 0 15px rgba(0,0,0,0.1);">❓</div>' +
    '</div>' +
    '<div style="margin-bottom:20px;">' +
      '<label style="font-weight:bold; margin-right:10px;">Ставка:</label>' +
      '<select id="casinoBet" class="self-input" style="width:auto; font-weight:bold; padding:8px;">' +
        '<option value="10">10 XP</option>' +
        '<option value="50" selected>50 XP</option>' +
        '<option value="100">100 XP</option>' +
        '<option value="500">500 XP</option>' +
        '<option value="1000">1000 XP</option>' +
      '</select>' +
    '</div>' +
    '<button class="btn" id="spinBtn" style="font-size:20px; padding:15px 40px; width:100%; max-width:300px; background:linear-gradient(45deg, #f1c40f, #e67e22); color:#000; text-shadow:none;">🎰 Крутить!</button>' +
    '<div id="casinoResult" style="margin-top:20px; font-size:24px; font-weight:bold; min-height:40px;"></div>' +
  '</section>');
  app.appendChild(block);

  var btn = block.querySelector("#spinBtn");
  var betSelect = block.querySelector("#casinoBet");
  var r1 = block.querySelector("#reel1");
  var r2 = block.querySelector("#reel2");
  var r3 = block.querySelector("#reel3");
  var resDiv = block.querySelector("#casinoResult");

  var symbols = ["🍒", "🍋", "🔔", "💎", "7️⃣"];

  btn.onclick = function() {
    var bet = parseInt(betSelect.value, 10);
    if (state.xp < bet) {
      window.showToast("Недостаточно XP для такой ставки!", "err");
      return;
    }

    state.xp -= bet;
    window.saveStudentData();
    if (window.updateXpDisplay) window.updateXpDisplay();

    btn.disabled = true;
    betSelect.disabled = true;
    resDiv.textContent = "";
    
    var spinning = setInterval(function() {
      r1.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      r2.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      r3.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    }, 50);

    setTimeout(function() {
      clearInterval(spinning);
      
      var res1, res2, res3;
      var roll = Math.random();

      // НЕРФ: Шансы снижены
      if (roll < 0.01) { // 1% Джекпот (3 семерки)
          res1 = res2 = res3 = "7️⃣";
      } else if (roll < 0.05) { // 4% Крупный выигрыш (3 одинаковых)
          res1 = res2 = res3 = symbols[Math.floor(Math.random() * 4)];
      } else if (roll < 0.10) { // 5% Возврат ставки (2 семерки)
          res1 = res2 = "7️⃣";
          res3 = symbols[Math.floor(Math.random() * 4)];
      } else { // 90% Проигрыш
          res1 = symbols[Math.floor(Math.random() * symbols.length)];
          res2 = symbols[Math.floor(Math.random() * symbols.length)];
          res3 = symbols[Math.floor(Math.random() * symbols.length)];
          if (res1 === res2 && res2 === res3) res3 = symbols[(symbols.indexOf(res3) + 1) % symbols.length];
          if (res1 === res2 || res2 === res3 || res1 === res3) {
             res3 = symbols[(symbols.indexOf(res1) + 1) % symbols.length];
             if (res2 === res3) res3 = symbols[(symbols.indexOf(res2) + 1) % symbols.length];
          }
      }

      r1.textContent = res1;
      r2.textContent = res2;
      r3.textContent = res3;

      var winAmount = 0;
      var message = "";

      if (res1 === res2 && res2 === res3) {
          if (res1 === "7️⃣") { winAmount = bet * 5; message = "🎉 ДЖЕКПОТ! x5"; }
          else { winAmount = bet * 2; message = "🔥 Выигрыш! x2"; }
      } else if (res1 === "7️⃣" && res2 === "7️⃣") {
          winAmount = bet;
          message = "✨ Возврат ставки.";
      } else if (res2 === "7️⃣" && res3 === "7️⃣") {
          winAmount = bet;
          message = "✨ Возврат ставки.";
      } else {
          winAmount = 0;
          message = "💸 Вы проиграли.";
      }

      if (winAmount > 0) {
          state.xp += winAmount;
          window.saveStudentData();
          if (window.updateXpDisplay) window.updateXpDisplay();
          
          resDiv.style.color = "var(--ok)";
          resDiv.textContent = message + " +" + winAmount + " XP";
          window.showToast("Выигрыш: +" + winAmount + " XP", "ok");
          
          if (res1 === "7️⃣" && typeof confetti === 'function') {
              confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
          }
      } else {
          resDiv.style.color = "var(--err)";
          resDiv.textContent = message + " (-" + bet + " XP)";
      }

      btn.disabled = false;
      betSelect.disabled = false;
    }, 2000);
  };
};

/* ============================================================
   6. РУЛЕТКА (КОЛЕСО ФОРТУНЫ)
   ============================================================ */
window.renderRoulettePage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = "";
  document.getElementById("crumbs").textContent = "🎡 Рулетка";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));

  if (!state.student) {
    app.appendChild(el('<div class="module">Войдите как студент, чтобы играть.</div>'));
    return;
  }

  var block = el('<section class="module" style="text-align:center; overflow:hidden;">' +
    '<h2>🎡 Колесо Фортуны</h2>' +
    '<p class="sub" style="margin-bottom:20px;">Испытай судьбу! Выиграй до x10 от своей ставки.</p>' +
    
    '<div style="position:relative; width:320px; height:320px; margin:0 auto 30px;">' +
      '<div style="position:absolute; top:-15px; left:50%; transform:translateX(-50%); font-size:40px; z-index:10; filter:drop-shadow(0 4px 2px rgba(0,0,0,0.5));">▼</div>' +
      '<canvas id="rouletteCanvas" width="320" height="320" style="transition:transform 4s cubic-bezier(0.1, 0.8, 0.1, 1);"></canvas>' +
    '</div>' +

    '<div style="margin-bottom:20px;">' +
      '<label style="font-weight:bold; margin-right:10px;">Ставка:</label>' +
      '<select id="rouletteBet" class="self-input" style="width:auto; font-weight:bold; padding:8px;">' +
        '<option value="10">10 XP</option>' +
        '<option value="50" selected>50 XP</option>' +
        '<option value="100">100 XP</option>' +
        '<option value="500">500 XP</option>' +
      '</select>' +
    '</div>' +
    '<button class="btn" id="spinRouletteBtn" style="font-size:20px; padding:15px 40px; width:100%; max-width:300px; background:linear-gradient(45deg, #e74c3c, #8e44ad); color:#fff;">🎡 Крутить</button>' +
    '<div id="rouletteResult" style="margin-top:20px; font-size:24px; font-weight:bold; min-height:40px;"></div>' +
  '</section>');
  app.appendChild(block);

  var canvas = document.getElementById("rouletteCanvas");
  var ctx = canvas.getContext("2d");
  var btn = document.getElementById("spinRouletteBtn");
  var betSelect = document.getElementById("rouletteBet");
  var resDiv = document.getElementById("rouletteResult");

  var sectors = [
    { mult: 0, color: "#2c3e50", text: "0" },
    { mult: 2, color: "#c0392b", text: "x2" },
    { mult: 1.5, color: "#2c3e50", text: "x1.5" },
    { mult: 0, color: "#c0392b", text: "0" },
    { mult: 5, color: "#27ae60", text: "x5" },
    { mult: 0, color: "#c0392b", text: "0" },
    { mult: 10, color: "#f39c12", text: "x10" },
    { mult: 0, color: "#c0392b", text: "0" }
  ];

  var currentRotation = 0;
  var isSpinning = false;

  function drawWheel() {
    var numSectors = sectors.length;
    var anglePerSector = (2 * Math.PI) / numSectors;
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var radius = centerX - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < numSectors; i++) {
      var startAngle = i * anglePerSector;
      var endAngle = startAngle + anglePerSector;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.fillStyle = sectors[i].color;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerSector / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 20px Arial";
      ctx.fillText(sectors[i].text, radius - 20, 8);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  drawWheel();

  btn.onclick = function() {
    if (isSpinning) return;
    var bet = parseInt(betSelect.value, 10);
    
    if (state.xp < bet) {
      window.showToast("Недостаточно XP!", "err");
      return;
    }

    state.xp -= bet;
    window.saveStudentData();
    if (window.updateXpDisplay) window.updateXpDisplay();

    isSpinning = true;
    btn.disabled = true;
    betSelect.disabled = true;
    resDiv.textContent = "";
    resDiv.style.color = "inherit";

    var winIndex = Math.floor(Math.random() * sectors.length);
    var sectorAngleDeg = 360 / sectors.length;
    var targetAngle = (winIndex * sectorAngleDeg) + (Math.random() * (sectorAngleDeg - 10) + 5);
    
    var spins = 5 + Math.floor(Math.random() * 3);
    var finalRotation = (spins * 360) + (360 - targetAngle);

    currentRotation += finalRotation;
    canvas.style.transform = "rotate(" + currentRotation + "deg)";

    setTimeout(function() {
      var mult = sectors[winIndex].mult;
      var winAmount = Math.floor(bet * mult);

      if (winAmount > 0) {
        state.xp += winAmount;
        window.saveStudentData();
        if (window.updateXpDisplay) window.updateXpDisplay();
        
        resDiv.style.color = "var(--ok)";
        resDiv.textContent = "🎉 Выигрыш: x" + mult + " (+" + winAmount + " XP)";
        window.showToast("Выигрыш: +" + winAmount + " XP", "ok");
        
        if (mult >= 5 && typeof confetti === 'function') {
            confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
        }
      } else {
        resDiv.style.color = "var(--err)";
        resDiv.textContent = "💸 Вы проиграли (-" + bet + " XP)";
      }

      isSpinning = false;
      btn.disabled = false;
      betSelect.disabled = false;
    }, 4100);
  };
};