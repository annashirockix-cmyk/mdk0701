/* ============================================================
   МДК 07.01 — minigames.js (v121.0 — FLAGS & OPTIMIZED)
   ============================================================ */
"use strict";

/* ---------- САПЁР С ФЛАЖКАМИ ---------- */
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

/* Остальные игры (Крестики-нолики, Судоку, Паук) остались без изменений. 
   Удалены renderChessPage и renderCheckersPage. */