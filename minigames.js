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
/* ---------- КАЗИНО (МИНИ-ИВЕНТ) ---------- */
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

    // Списываем ставку
    state.xp -= bet;
    window.saveStudentData();
    if (window.updateXpDisplay) window.updateXpDisplay();

    btn.disabled = true;
    betSelect.disabled = true;
    resDiv.textContent = "";
    
    // Анимация кручения
    var spinning = setInterval(function() {
      r1.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      r2.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      r3.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    }, 50);

    // Остановка и подсчет результатов
    setTimeout(function() {
      clearInterval(spinning);
      
      var res1, res2, res3;
      var roll = Math.random();

      // Логика выпадения (шансы)
      if (roll < 0.03) { // 3% Джекпот
          res1 = res2 = res3 = "7️⃣";
      } else if (roll < 0.10) { // 7% Крупный выигрыш
          res1 = res2 = res3 = symbols[Math.floor(Math.random() * 4)];
      } else if (roll < 0.40) { // 30% Мелкий выигрыш (2 совпадения)
          res1 = res2 = symbols[Math.floor(Math.random() * symbols.length)];
          res3 = symbols[Math.floor(Math.random() * symbols.length)];
          if (res1 === res3) res3 = symbols[0]; // Избегаем джекпота
      } else { // 60% Проигрыш
          res1 = symbols[Math.floor(Math.random() * symbols.length)];
          res2 = symbols[Math.floor(Math.random() * symbols.length)];
          res3 = symbols[Math.floor(Math.random() * symbols.length)];
          if (res1 === res2 && res2 === res3) res3 = symbols[(symbols.indexOf(res3) + 1) % symbols.length];
          if (res1 === res2 || res2 === res3 || res1 === res3) {
             // Принудительно ломаем совпадение
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
          if (res1 === "7️⃣") { winAmount = bet * 10; message = "🎉 ДЖЕКПОТ!!! x10"; }
          else { winAmount = bet * 5; message = "🔥 БОЛЬШОЙ ВЫИГРЫШ! x5"; }
      } else if (res1 === res2 || res2 === res3 || res1 === res3) {
          winAmount = Math.floor(bet * 1.5);
          message = "✨ Неплохо! Вы вернули ставку с прибылью.";
      } else {
          winAmount = 0;
          message = "💸 Вы проиграли ставку.";
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