"use strict";

window.renderTicTacToePage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = ""; 
  document.getElementById("crumbs").textContent = "Игра";
  app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
  
  var block = el(`<section class="module">
    <h2>Крестики-нолики</h2>
    <div id="tttBoard" style="display:grid; grid-template-columns:repeat(3, 80px); gap:10px; justify-content:center; margin:20px auto;"></div>
    <div id="tttStatus" style="text-align:center; font-weight:bold; font-size:18px; color:var(--accent);"></div>
    <div style="text-align:center; margin-top:20px;"><button class="btn" id="tttReset">Сбросить</button></div>
  </section>`);
  app.appendChild(block);
  
  var board = block.querySelector("#tttBoard"), status = block.querySelector("#tttStatus");
  var cells = Array(9).fill(null), gameOver = false;
  var wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  function checkWin() {
    for (let w of wins) {
      if (cells[w[0]] && cells[w[0]] === cells[w[1]] && cells[w[0]] === cells[w[2]]) return cells[w[0]];
    }
    return cells.includes(null) ? null : "draw";
  }

  function render() {
    board.innerHTML = "";
    cells.forEach((c, i) => {
      var btn = el(`<button class="btn ghost" style="height:80px; font-size:32px; display:flex; align-items:center; justify-content:center;">${c || ""}</button>`);
      btn.addEventListener("click", () => {
        if (cells[i] || gameOver) return;
        cells[i] = "❌";
        update();
        if (!gameOver) setTimeout(compMove, 300);
      });
      board.appendChild(btn);
    });
  }

  function compMove() {
    if (gameOver) return;
    var empty = cells.map((c, i) => c === null ? i : null).filter(v => v !== null);
    if (empty.length) {
      cells[empty[Math.floor(Math.random() * empty.length)]] = "⭕";
      update();
    }
  }

  function update() {
    render();
    var w = checkWin();
    if (w) {
      gameOver = true;
      if (w === "draw") status.textContent = "Ничья! 🤝";
      else if (w === "❌") { status.textContent = "Вы победили! 🎉"; if(window.celebrate) window.celebrate(); }
      else status.textContent = "Победил станок... ⚙️";
    } else {
      status.textContent = "Ваш ход";
    }
  }

  block.querySelector("#tttReset").addEventListener("click", () => {
    cells = Array(9).fill(null); gameOver = false; status.textContent = "Ваш ход"; render();
  });
  render();
};