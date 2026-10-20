"use strict";

window.renderArcadePage = function() {
  var app = document.getElementById("app"); app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Игровая комната";
  app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a><section class="hero"><h1>🎮 Игровая комната</h1></section>'));
  
  var games = [
    { name: "Крестики-нолики", render: window.renderTicTacToePage },
    { name: "Судоку", render: window.renderSudokuPage },
    { name: "Сапёр", render: window.renderMinesweeperPage },
    { name: "Казино", render: window.renderCasinoPage },
    { name: "Рулетка", render: window.renderRoulettePage },
    { name: "Тест G-кода", render: window.renderGCodeTestPage }
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
  app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));

  var block = el(`<section class="module" style="text-align:center;">
    <h2>Крестики-нолики 4×4</h2>
    <p class="sub" style="margin-bottom:15px;">Соберите 4 в ряд</p>
    <div style="margin-bottom:20px;">
      <select id="tttDiff" class="self-input" style="width:auto;display:inline-block; padding:8px; border-radius:8px; border:1px solid var(--border); background:var(--card); color:var(--text);">
        <option value="easy">Легкий</option>
        <option value="medium">Средний</option>
        <option value="hard">Невозможный</option>
      </select>
    </div>
    <div id="tttBoard" style="display:grid;grid-template-columns:repeat(4, 1fr);gap:8px;max-width:320px;margin:20px auto;width:100%;"></div>
    <div id="tttStatus" style="font-weight:bold;font-size:18px;color:var(--accent);min-height:28px;"></div>
    <div style="margin-top:20px;"><button class="btn ghost" id="tttReset">Сбросить</button></div>
  </section>`);
  app.appendChild(block);
  // ... (логика игры)
  block.querySelector("#tttReset").onclick = function(){ window.renderTicTacToePage(); };
};

window.renderSudokuPage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Судоку 4×4";
  app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
  app.appendChild(el('<div class="module" style="text-align:center;"><h2>Судоку 4×4</h2><p>В разработке</p></div>'));
};

window.renderMinesweeperPage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Сапёр";
  app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
  app.appendChild(el('<div class="module" style="text-align:center;"><h2>Сапёр</h2><p>В разработке</p></div>'));
};

window.renderCasinoPage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Казино";
  app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
  app.appendChild(el('<div class="module" style="text-align:center;"><h2>Казино</h2><p>В разработке</p></div>'));
};

window.renderRoulettePage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Рулетка";
  app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
  app.appendChild(el('<div class="module" style="text-align:center;"><h2>Рулетка</h2><p>В разработке</p></div>'));
};

window.renderGCodeTestPage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Тест G-кода";
  app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
  app.appendChild(el('<div class="module" style="text-align:center;"><h2>Тест G-кода</h2><p>В разработке</p></div>'));
};