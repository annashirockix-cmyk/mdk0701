/* ============================================================
   МДК 07.01 — minigames.js (v102.0 — CHESS, CHECKERS & TTT)
   ============================================================ */
"use strict";

/* ============================================================
   1. КРЕСТИКИ-НОЛИКИ (Сложности)
   ============================================================ */
window.renderTicTacToePage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = ""; 
  document.getElementById("crumbs").textContent = "Игра";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  
  var block = el(`<section class="module" style="text-align:center;">
    <h2>Крестики-нолики</h2>
    <div style="margin-bottom:20px;">
        <select id="tttDiff" class="self-input" style="width:auto; display:inline-block;">
            <option value="easy">Легкий (Новичок)</option>
            <option value="medium">Средний (Воин)</option>
            <option value="hard">Невозможный (Терминатор)</option>
        </select>
    </div>
    <div id="tttBoard" style="display:grid; grid-template-columns:repeat(3, 80px); gap:10px; justify-content:center; margin:20px auto;"></div>
    <div id="tttStatus" style="font-weight:bold; font-size:18px; color:var(--accent); min-height:28px;"></div>
    <div style="margin-top:20px;"><button class="btn ghost" id="tttReset">Сбросить</button></div>
  </section>`);
  app.appendChild(block);
  
  var boardEl = block.querySelector("#tttBoard"), status = block.querySelector("#tttStatus");
  var cells = Array(9).fill(null), gameOver = false;

  function checkWin(board) {
    var wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let w of wins) { if (board[w[0]] && board[w[0]] === board[w[1]] && board[w[0]] === board[w[2]]) return board[w[0]]; }
    return board.includes(null) ? null : "draw";
  }

  function render() {
    boardEl.innerHTML = "";
    cells.forEach((c, i) => {
      var btn = el(`<button class="btn ghost" style="height:80px; font-size:32px; display:flex; align-items:center; justify-content:center;">${c || ""}</button>`);
      btn.addEventListener("click", () => playerMove(i));
      boardEl.appendChild(btn);
    });
  }

  function playerMove(i) {
    if (cells[i] || gameOver) return;
    cells[i] = "❌"; render();
    var w = checkWin(cells);
    if (w) return endGame(w);
    
    status.textContent = "Ход станка...";
    setTimeout(aiMove, 300);
  }

  function aiMove() {
    var diff = block.querySelector("#tttDiff").value;
    var empty = cells.map((c, i) => c === null ? i : null).filter(v => v !== null);
    if (empty.length === 0) return;

    var move;
    if (diff === "easy") {
        move = empty[Math.floor(Math.random() * empty.length)];
    } else if (diff === "medium") {
        move = findBestMove(cells, 2); // Смотрит на 2 хода вперед
    } else {
        move = findBestMove(cells, 9); // Просчитывает до конца
    }

    cells[move] = "⭕"; render();
    var w = checkWin(cells);
    if (w) return endGame(w);
    status.textContent = "Ваш ход";
  }

  // Минимакс для ИИ
  function findBestMove(board, depth) {
    var bestScore = -Infinity;
    var move = -1;
    for (var i = 0; i < board.length; i++) {
        if (board[i] === null) {
            board[i] = "⭕";
            var score = minimax(board, 0, false, depth);
            board[i] = null;
            if (score > bestScore) { bestScore = score; move = i; }
        }
    }
    return move === -1 ? board.indexOf(null) : move;
  }

  function minimax(board, depth, isMaximizing, maxDepth) {
    var result = checkWin(board);
    if (result === "⭕") return 10 - depth;
    if (result === "❌") return depth - 10;
    if (result === "draw" || depth >= maxDepth) return 0;

    if (isMaximizing) {
        var best = -Infinity;
        for (var i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = "⭕";
                best = Math.max(best, minimax(board, depth + 1, false, maxDepth));
                board[i] = null;
            }
        }
        return best;
    } else {
        var best = Infinity;
        for (var i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = "❌";
                best = Math.min(best, minimax(board, depth + 1, true, maxDepth));
                board[i] = null;
            }
        }
        return best;
    }
  }

  function endGame(w) {
    gameOver = true;
    if (w === "draw") status.textContent = "Ничья! 🤝";
    else if (w === "❌") { 
        status.textContent = "Вы победили! 🎉"; 
        var diff = block.querySelector("#tttDiff").value;
        var xp = diff === "easy" ? 10 : (diff === "medium" ? 30 : 100);
        window.addXP(xp); window.unlockAchievement('t_ttt');
        if (window.celebrate) window.celebrate();
    }
    else status.textContent = "Победил станок... ⚙️";
  }

  block.querySelector("#tttReset").addEventListener("click", () => {
    cells = Array(9).fill(null); gameOver = false; status.textContent = "Ваш ход"; render();
  });
  render();
};

/* ============================================================
   2. ШАШКИ
   ============================================================ */
window.renderCheckersPage = function() {
    var app = document.getElementById("app"); if(!app) return; app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Шашки";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));

    var board = Array(8).fill(null).map(() => Array(8).fill(0));
    var selected = null;
    var turn = 1; // 1 = белые (игрок), 2 = черные (игрок 2)

    // Расстановка
    for (var r = 0; r < 8; r++) {
        for (var c = 0; c < 8; c++) {
            if ((r + c) % 2 === 1) {
                if (r < 3) board[r][c] = 2; // Черные
                else if (r > 4) board[r][c] = 1; // Белые
            }
        }
    }

    var block = el(`<section class="module" style="text-align:center; background:#1a1a1a;">
        <h2 style="color:#fff;">♟️ Шашки</h2>
        <div style="color:#ffcc00; font-weight:bold; margin-bottom:15px;" id="checkersStatus">Ход белых</div>
        <div id="checkersBoard" style="display:inline-grid; grid-template-columns:repeat(8, 50px); gap:2px; background:#444; padding:4px; border-radius:8px;"></div>
        <button class="btn" style="margin-top:20px;" onclick="window.renderCheckersPage()">Начать заново</button>
    </section>`);
    app.appendChild(block);

    var boardEl = block.querySelector("#checkersBoard");
    var statusEl = block.querySelector("#checkersStatus");

    function render() {
        boardEl.innerHTML = "";
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                var piece = board[r][c];
                var isDark = (r + c) % 2 === 1;
                var color = isDark ? "#b58863" : "#f0d9b5";
                var cell = el(`<div style="width:50px; height:50px; background:${color}; display:flex; align-items:center; justify-content:center; font-size:32px; cursor:pointer; border-radius:4px;"></div>`);
                
                if (piece === 1) cell.innerHTML = "⚪";
                if (piece === 2) cell.innerHTML = "⚫";

                if (selected && selected.r === r && selected.c === c) {
                    cell.style.boxShadow = "inset 0 0 0 4px #ffcc00";
                }
                
                cell.onclick = (function(r,c){ return function(){ handleClick(r,c); }; })(r,c);
                boardEl.appendChild(cell);
            }
        }
    }

    function handleClick(r, c) {
        if (selected) {
            // Ход
            if (isValidMove(selected.r, selected.c, r, c)) {
                board[r][c] = board[selected.r][selected.c];
                board[selected.r][selected.c] = 0;
                selected = null;
                turn = turn === 1 ? 2 : 1;
                statusEl.textContent = turn === 1 ? "Ход белых" : "Ход черных";
                checkWin();
            } else {
                selected = null;
            }
        } else {
            // Выбор
            if (board[r][c] === turn) {
                selected = {r, c};
            }
        }
        render();
    }

    function isValidMove(r1, c1, r2, c2) {
        if (board[r2][c2] !== 0) return false;
        var dr = r2 - r1;
        var dc = Math.abs(c2 - c1);
        
        if (board[r1][c1] === 1) { // Белые
            if (dr === -1 && dc === 1) return true;
            if (dr === -2 && dc === 2 && board[r1-1][(c1+c2)/2] === 2) {
                board[r1-1][(c1+c2)/2] = 0; return true; // Взятие
            }
        } else if (board[r1][c1] === 2) { // Черные
            if (dr === 1 && dc === 1) return true;
            if (dr === 2 && dc === 2 && board[r1+1][(c1+c2)/2] === 1) {
                board[r1+1][(c1+c2)/2] = 0; return true; // Взятие
            }
        }
        return false;
    }

    function checkWin() {
        var white = 0, black = 0;
        for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) {
            if (board[r][c] === 1) white++;
            if (board[r][c] === 2) black++;
        }
        if (white === 0) { statusEl.textContent = "Победили Черные!"; window.addXP(50); window.unlockAchievement('t_checkers'); }
        if (black === 0) { statusEl.textContent = "Победили Белые!"; window.addXP(50); window.unlockAchievement('t_checkers'); }
    }

    render();
};

/* ============================================================
   3. ШАХМАТЫ (Базовые)
   ============================================================ */
window.renderChessPage = function() {
    var app = document.getElementById("app"); if(!app) return; app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Шахматы";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));

    var board = [
        ["♜","♞","♝","♛","♚","♝","♞","♜"],
        ["♟","♟","♟","♟","♟","♟","♟","♟"],
        [" "," "," "," "," "," "," "," "],
        [" "," "," "," "," "," "," "," "],
        [" "," "," "," "," "," "," "," "],
        [" "," "," "," "," "," "," "," "],
        ["♙","♙","♙","♙","♙","♙","♙","♙"],
        ["♖","♘","♗","♕","♔","♗","♘","♖"]
    ];
    var selected = null;
    var isWhiteTurn = true;

    var block = el(`<section class="module" style="text-align:center; background:#1a1a1a;">
        <h2 style="color:#fff;">♞ Шахматы</h2>
        <div style="color:#ffcc00; font-weight:bold; margin-bottom:15px;" id="chessStatus">Ход белых</div>
        <div id="chessBoard" style="display:inline-grid; grid-template-columns:repeat(8, 50px); gap:0; border:2px solid #555;"></div>
        <button class="btn" style="margin-top:20px;" onclick="window.renderChessPage()">Начать заново</button>
    </section>`);
    app.appendChild(block);

    var boardEl = block.querySelector("#chessBoard");
    var statusEl = block.querySelector("#chessStatus");

    function render() {
        boardEl.innerHTML = "";
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                var piece = board[r][c];
                var isDark = (r + c) % 2 === 1;
                var color = isDark ? "#769656" : "#eeeed2";
                var cell = el(`<div style="width:50px; height:50px; background:${color}; display:flex; align-items:center; justify-content:center; font-size:36px; cursor:pointer; color:${piece === piece.toUpperCase() ? '#000' : '#fff'}; text-shadow: 0 0 2px #000;">${piece}</div>`);
                
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
                selected = null;
                isWhiteTurn = !isWhiteTurn;
                statusEl.textContent = isWhiteTurn ? "Ход белых" : "Ход черных";
            } else {
                selected = null;
            }
        } else {
            var piece = board[r][c];
            if (piece !== " ") {
                var isWhite = piece === piece.toUpperCase();
                if (isWhite === isWhiteTurn) selected = {r, c};
            }
        }
        render();
    }

    function isValidMove(r1, c1, r2, c2) {
        var p = board[r1][c1];
        var dr = r2 - r1;
        var dc = c2 - c1;
        var target = board[r2][c2];

        // Нельзя бить своих
        if (target !== " ") {
            var isTargetWhite = target === target.toUpperCase();
            var isSourceWhite = p === p.toUpperCase();
            if (isSourceWhite === isTargetWhite) return false;
        }

        // Пешки
        if (p === "♙" || p === "♟") {
            var dir = p === "♙" ? -1 : 1;
            if (dc === 0 && dr === dir && target === " ") return true;
            if (Math.abs(dc) === 1 && dr === dir && target !== " ") return true; // Взятие
            if (dc === 0 && dr === dir * 2 && target === " " && board[r1+dir][c1] === " ") return true; // Первый ход
            return false;
        }

        // Ладья
        if (p === "♖" || p === "♜") {
            if (dr === 0 || dc === 0) return true; // (Без учета препятствий для упрощения)
        }

        // Слон
        if (p === "♗" || p === "♝") {
            if (Math.abs(dr) === Math.abs(dc)) return true;
        }

        // Ферзь
        if (p === "♕" || p === "♛") {
            if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) return true;
        }

        // Конь
        if (p === "♘" || p === "♞") {
            if ((Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2)) return true;
        }

        // Король
        if (p === "♔" || p === "♚") {
            if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1) return true;
        }

        return false;
    }

    render();
};