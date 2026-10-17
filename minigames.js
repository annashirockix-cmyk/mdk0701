/* ============================================================
   МДК 07.01 — minigames.js (Ивенты, Судоку, Крестики-нолики, Кроссворд)
   ============================================================ */
"use strict";

function mEl(html) { var t = document.createElement("template"); t.innerHTML = String(html).trim(); return t.content.firstChild; }

// 1. ИВЕНТЫ
window.renderEventsPage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = ""; document.getElementById("crumbs").textContent = "Ивенты";
  app.appendChild(mEl('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  app.appendChild(mEl('<section class="hero"><div class="meta">Жизнь техникума</div><h1>Предстоящие события</h1><p>Не пропустите самое интересное!</p></section>'));
  
  var events = [
    { date: "25.10", title: "Конкурс «Лучший G-код»", desc: "Соревнование по программированию станков. Победитель получает автомат по МДК." },
    { date: "01.11", title: "Экскурсия на завод", desc: "Посещение цеха с ЧПУ. Сбор у главного корпуса в 10:00." },
    { date: "15.11", title: "День Станочника", desc: "Чай с баранками в кабинете 204. Приносите свои мемы про стружку." }
  ];
  
  var box = mEl('<section class="module"><div class="event-list"></div></section>');
  var list = box.querySelector(".event-list");
  events.forEach(e => {
    list.appendChild(mEl(`<div class="event-item" style="margin-bottom:12px; padding:16px; background:var(--card-soft); border-radius:12px; border-left:4px solid var(--accent);">
      <span class="ev-date" style="font-weight:bold; color:var(--accent); font-size:18px; display:block; margin-bottom:4px">${e.date}</span>
      <div class="ev-text"><b style="font-size:16px">${e.title}</b><br><span style="color:var(--muted); font-size:14px">${e.desc}</span></div>
    </div>`));
  });
  app.appendChild(box);
};

// 2. КРЕСТИКИ-НОЛИКИ
window.renderTicTacToePage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = ""; document.getElementById("crumbs").textContent = "Крестики-нолики";
  app.appendChild(mEl('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  app.appendChild(mEl('<section class="hero"><div class="meta">Перемена</div><h1>Крестики-нолики</h1><p>Отвлекитесь от G-кодов. Вы играете за ❌.</p></section>'));
  
  var block = mEl(`<section class="module"><div id="tttBoard" style="display:grid; grid-template-columns:repeat(3, 80px); gap:10px; justify-content:center; margin:20px auto;"></div>
  <div id="tttStatus" style="text-align:center; font-size:18px; font-weight:bold; margin-top:20px; color:var(--accent)">Ваш ход</div>
  <div style="text-align:center; margin-top:20px;"><button class="btn ghost" onclick="window.renderTicTacToePage()">Сбросить</button></div></section>`);
  app.appendChild(block);
  
  var board = block.querySelector("#tttBoard");
  var status = block.querySelector("#tttStatus");
  var cells = Array(9).fill(null);
  var gameOver = false;

  var wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  function checkWin() {
    for (let w of wins) {
      if (cells[w[0]] && cells[w[0]] === cells[w[1]] && cells[w[0]] === cells[w[2]]) return cells[w[0]];
    }
    return cells.includes(null) ? null : "draw";
  }

  function renderBoard() {
    board.innerHTML = "";
    cells.forEach((c, i) => {
      var btn = mEl(`<button class="btn ghost" style="height:80px; font-size:32px; display:flex; align-items:center; justify-content:center;">${c || ""}</button>`);
      btn.addEventListener("click", () => {
        if (cells[i] || gameOver) return;
        cells[i] = "❌";
        update();
        if (!gameOver) setTimeout(computerMove, 300);
      });
      board.appendChild(btn);
    });
  }

  function computerMove() {
    if (gameOver) return;
    var empty = cells.map((c, i) => c === null ? i : null).filter(v => v !== null);
    if (empty.length) {
      var move = empty[Math.floor(Math.random() * empty.length)];
      cells[move] = "⭕";
      update();
    }
  }

  function update() {
    renderBoard();
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
  renderBoard();
};

// 3. СУДОКУ
window.renderSudokuPage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = ""; document.getElementById("crumbs").textContent = "Судоку";
  app.appendChild(mEl('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  app.appendChild(mEl('<section class="hero"><div class="meta">Логика</div><h1>Судоку ЧПУ-шника</h1><p>Впишите цифры от 1 до 9 так, чтобы они не повторялись в строках, столбцах и блоках 3х3.</p></section>'));
  
  var block = mEl(`<section class="module"><div id="sudokuBoard" style="display:grid; grid-template-columns:repeat(9, 1fr); gap:2px; max-width:450px; margin:0 auto; background:var(--border); padding:4px; border:2px solid var(--border); border-radius:8px;"></div>
  <div style="text-align:center; margin-top:20px;"><button class="btn" onclick="alert('Проверка пока в разработке! Но вы молодец :)')">Проверить</button></div></section>`);
  app.appendChild(block);
  
  var board = block.querySelector("#sudokuBoard");
  var puzzle = [
    5,3,0, 0,7,0, 0,0,0,
    6,0,0, 1,9,5, 0,0,0,
    0,9,8, 0,0,0, 0,6,0,
    
    8,0,0, 0,6,0, 0,0,3,
    4,0,0, 8,0,3, 0,0,1,
    7,0,0, 0,2,0, 0,0,6,
    
    0,6,0, 0,0,0, 2,8,0,
    0,0,0, 4,1,9, 0,0,5,
    0,0,0, 0,8,0, 0,7,9
  ];

  puzzle.forEach((val, i) => {
    var isFixed = val !== 0;
    var input = mEl(`<input type="text" maxlength="1" value="${isFixed ? val : ''}" ${isFixed ? 'readonly' : ''} style="width:100%; aspect-ratio:1; text-align:center; font-size:20px; border:none; background:${isFixed ? 'var(--card-soft)' : 'var(--card)'}; color:${isFixed ? 'var(--muted)' : 'var(--accent)'}; font-weight:${isFixed ? 'normal' : 'bold'}; border-radius:4px;">`);
    // Добавляем жирные границы для блоков 3х3
    var row = Math.floor(i / 9);
    var col = i % 9;
    if (col === 2 || col === 5) input.style.marginRight = "2px";
    if (row === 2 || row === 5) input.style.marginBottom = "2px";
    board.appendChild(input);
  });
};

// 4. КРОССВОРД
window.renderCrosswordPage = function() {
  var app = document.getElementById("app"); if(!app) return; app.innerHTML = ""; document.getElementById("crumbs").textContent = "Кроссворд";
  app.appendChild(mEl('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  app.appendChild(mEl('<section class="hero"><div class="meta">Разминка для ума</div><h1>Кроссворд «Токарь»</h1><p>Разгадайте слова, связанные с обработкой металла.</p></section>'));
  
  var block = mEl(`<section class="module">
    <div style="display:flex; gap:30px; flex-wrap:wrap;">
      <div style="flex:1; min-width:300px;">
        <div id="cwGrid" style="display:grid; grid-template-columns:repeat(8, 40px); gap:2px; background:var(--border); padding:2px; width:max-content; border:2px solid var(--border);"></div>
      </div>
      <div style="flex:1; min-width:250px;">
        <h3>Вопросы:</h3>
        <ol style="line-height:1.8; font-size:14px;">
          <li>Инструмент для нарезания резьбы (6 букв) — <i>по горизонтали 1</i></li>
          <li>Смазочно-охлаждающая жидкость (4 буквы) — <i>по вертикали 2</i></li>
          <li>Вращающийся вал станка (8 букв) — <i>по горизонтали 3</i></li>
          <li>Профессия рабочего (5 букв) — <i>по вертикали 4</i></li>
        </ol>
        <button class="btn" style="margin-top:20px;" onclick="alert('Вы справились! (Даже если не вписали)')">Проверить</button>
      </div>
    </div>
  </section>`);
  app.appendChild(block);

  // Простая сетка (симуляция кроссворда)
  var grid = block.querySelector("#cwGrid");
  for(var i=0; i<64; i++) {
    var cell = mEl(`<input type="text" maxlength="1" style="width:40px; height:40px; text-align:center; font-size:18px; border:none; background:var(--card); text-transform:uppercase;">`);
    // Рисуем пустые клетки для красоты
    if(i % 3 === 0 && i > 10 && i < 30) {
      cell.style.background = "var(--card-soft)";
      cell.disabled = true;
    }
    grid.appendChild(cell);
  }
};