/* ============================================================
   МДК 07.01 — minigames.js
   ============================================================ */
"use strict";

function mEl(html) { var t = document.createElement("template"); t.innerHTML = String(html).trim(); return t.content.firstChild; }

// 1. ИВЕНТЫ
window.renderEventsPage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = ""; document.getElementById("crumbs").textContent = "Ивенты";
  app.appendChild(mEl('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  app.appendChild(mEl('<section class="hero"><h1>Предстоящие события</h1></section>'));
  var box = mEl('<section class="module"><div class="event-list"></div></section>');
  var events = [
    { date: "25.10", title: "Конкурс «Лучший G-код»", desc: "Соревнование по программированию станков. Победитель получает автомат по МДК." },
    { date: "01.11", title: "Экскурсия на завод", desc: "Посещение цеха с ЧПУ. Сбор у главного корпуса в 10:00." }
  ];
  events.forEach(e => box.querySelector(".event-list").appendChild(mEl(`<div style="margin-bottom:12px;padding:16px;background:var(--card-soft);border-radius:12px;border-left:4px solid var(--accent);"><span style="font-weight:bold;color:var(--accent);font-size:18px;">${e.date}</span><br><b>${e.title}</b><br><span style="color:var(--muted);font-size:14px">${e.desc}</span></div>`)));
  app.appendChild(box);
};

// 2. КРЕСТИКИ-НОЛИКИ (Адаптировано)
window.renderTicTacToePage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = ""; document.getElementById("crumbs").textContent = "Игра";
  app.appendChild(mEl('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  var block = mEl(`<section class="module"><h2>Крестики-нолики</h2><div id="tttBoard" style="display:grid;grid-template-columns:repeat(3, 80px);gap:10px;justify-content:center;margin:20px auto;"></div><div id="tttStatus" style="text-align:center;font-weight:bold;font-size:18px;margin-top:20px;color:var(--accent);"></div><div style="text-align:center;margin-top:20px;"><button class="btn ghost" onclick="window.renderTicTacToePage()">Сбросить</button></div></section>`);
  app.appendChild(block);
  
  var board = block.querySelector("#tttBoard"), status = block.querySelector("#tttStatus");
  var cells = Array(9).fill(null), gameOver = false;
  var wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  function checkWin() { for (let w of wins) { if (cells[w[0]] && cells[w[0]] === cells[w[1]] && cells[w[0]] === cells[w[2]]) return cells[w[0]]; } return cells.includes(null) ? null : "draw"; }

  function render() {
    board.innerHTML = "";
    cells.forEach((c, i) => {
      var btn = mEl(`<button class="btn ghost" style="height:80px;font-size:32px;">${c || ""}</button>`);
      btn.addEventListener("click", () => { if (cells[i] || gameOver) return; cells[i] = "❌"; update(); if (!gameOver) setTimeout(comp, 300); });
      board.appendChild(btn);
    });
  }
  function comp() { if (gameOver) return; var empty = cells.map((c, i) => c === null ? i : null).filter(v => v !== null); if (empty.length) { cells[empty[Math.floor(Math.random() * empty.length)]] = "⭕"; update(); } }
  function update() {
    render(); var w = checkWin();
    if (w) { gameOver = true; status.textContent = w === "draw" ? "Ничья! 🤝" : w === "❌" ? "Вы победили! 🎉" : "Победил станок... ⚙️"; if(w==="❌" && window.celebrate) window.celebrate(); } else { status.textContent = "Ваш ход"; }
  }
  render();
};

// 3. СУДОКУ
window.renderSudokuPage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = ""; document.getElementById("crumbs").textContent = "Судоку";
  app.appendChild(mEl('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  var block = mEl(`<section class="module"><h2>Судоку</h2><div id="sudokuBoard" style="display:grid;grid-template-columns:repeat(9, 1fr);gap:2px;max-width:450px;margin:0 auto;background:var(--border);padding:4px;border-radius:8px;"></div></section>`);
  app.appendChild(block);
  var puzzle = [5,3,0,0,7,0,0,0,0,6,0,0,1,9,5,0,0,0,0,9,8,0,0,0,0,6,0,8,0,0,0,6,0,0,0,3,4,0,0,8,0,3,0,0,1,7,0,0,0,2,0,0,0,6,0,6,0,0,0,0,2,8,0,0,0,0,4,1,9,0,0,5,0,0,0,0,8,0,0,7,9];
  puzzle.forEach(v => {
    var isFixed = v !== 0;
    block.querySelector("#sudokuBoard").appendChild(mEl(`<input type="text" maxlength="1" value="${isFixed ? v : ''}" ${isFixed ? 'readonly' : ''} style="width:100%;aspect-ratio:1;text-align:center;font-size:16px;border:none;background:${isFixed ? 'var(--card-soft)' : 'var(--card)'};color:${isFixed ? 'var(--muted)' : 'var(--accent)'};font-weight:${isFixed ? 'normal' : 'bold'};border-radius:4px;">`));
  });
};

// 4. КРОССВОРД
window.renderCrosswordPage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = ""; document.getElementById("crumbs").textContent = "Кроссворд";
  app.appendChild(mEl('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  app.appendChild(mEl(`<section class="module"><h2>Кроссворд (Демо)</h2><p>Сетка 8х8. Впишите слова по горизонтали и вертикали.</p><div style="display:grid;grid-template-columns:repeat(8, 1fr);gap:2px;background:var(--border);padding:2px;width:max-content;margin:0 auto;border-radius:8px;" id="cwGrid"></div></section>`));
  for(var i=0; i<64; i++) {
    var cell = mEl(`<input type="text" maxlength="1" style="width:40px;height:40px;text-align:center;font-size:16px;border:none;background:var(--card);text-transform:uppercase;">`);
    if(i % 3 === 0 && i > 10 && i < 30) { cell.style.background = "var(--card-soft)"; cell.disabled = true; }
    document.getElementById("cwGrid").appendChild(cell);
  }
};