"use strict";

// ================= ГЛАВНАЯ СТРАНИЦА ИГР =================
window.saveScore = function(game, score) {
    var current = parseInt(localStorage.getItem('hs_' + game) || '0');
    if (score > current) {
        localStorage.setItem('hs_' + game, score);
        if(window.showToast) window.showToast("🏆 Новый рекорд!", "ok");
    }
};

window.renderArcadePage = function() {
    var app = document.getElementById("app"); if (!app) return; app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Игровая комната";
    app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
    app.appendChild(el('<section class="hero"><h1>🎮 Игровая комната</h1><p>Зарабатывай XP и развлекайся!</p></section>'));

    var allGames = [
        { id: "minesweeper", title: "💣 Сапёр", desc: "Классический сапёр с флажками и уровнями сложности.", courses: ["07.01", "04.01", "02.01", "02.02"] },
        { id: "tictactoe", title: "❌ Крестики-нолики", desc: "От 3х3 до 8х8. Победи робота!", courses: ["07.01", "04.01", "02.01", "02.02"] },
        { id: "sudoku", title: "🔢 Судоку", desc: "Разные уровни сложности. Тренируй логику!", courses: ["02.01", "04.01"] },
        { id: "casino", title: "🎰 Казино", desc: "Испытай удачу на слотах.", courses: ["07.01"] },
        { id: "roulette", title: "🎡 Рулетка", desc: "Красное или черное? Угадай число!", courses: ["07.01"] },
        { id: "spider", title: "🕷️ Солитёр Паук", desc: "Собирайте последовательности от Короля до Туза.", courses: ["02.01", "02.02"] },
        { id: "party", title: "☠️ Смертельная вечеринка", desc: "Викторина на выживание с таймером (вопросы по ЧПУ и логике).", courses: ["07.01", "04.01", "02.01", "02.02"] }
    ];

    // Фильтруем игры по текущему МДК
    var currentCourse = window.state.activeCourseId;
    var filteredGames = allGames.filter(g => g.courses.includes(currentCourse));

    var grid = el('<div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:16px;"></div>');
    
    filteredGames.forEach(g => {
        var best = localStorage.getItem('hs_' + g.id) || 0;
        var bestTxt = best > 0 ? `<div style="color:var(--gold); font-size:13px; font-weight:bold; margin-top:10px;">⭐ Рекорд: ${best}</div>` : '';
        
        grid.appendChild(el(`<div class="module" style="cursor:pointer; transition:0.2s; display:flex; flex-direction:column; justify-content:space-between;" onclick="window.startGame('${g.id}')" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
            <div>
                <h3 style="margin-top:0; color:var(--accent);">${g.title}</h3>
                <p style="color:var(--muted); font-size:14px;">${g.desc}</p>
                ${bestTxt}
            </div>
            <button class="btn ghost" style="width:100%; margin-top:15px;">Играть</button>
        </div>`));
    });
    
    if (filteredGames.length === 0) {
        grid.innerHTML = "<p style='color:var(--muted);'>Для этого предмета игры еще не добавлены.</p>";
    }
    
    app.appendChild(grid);
};

window.startGame = function(gameId) {
    var app = document.getElementById("app"); app.innerHTML = "";
    app.appendChild(el('<a class="backlink" href="javascript:void(0)" onclick="window.renderArcadePage()" style="color:var(--accent); cursor:pointer;">← В меню игр</a>'));

    var rules = {
        minesweeper: "Клик открывает клетку. Правая кнопка мыши ставит флажок. Цифры показывают мины рядом.",
        tictactoe: "Соберите линию из N символов (зависит от поля) раньше робота.",
        sudoku: "Заполните поле цифрами так, чтобы они не повторялись в строках, столбцах и блоках.",
        casino: "Сделайте ставку и крутите слоты. 3 одинаковых — джекпот.",
        roulette: "Угадайте число (х35) или чёт/нечет (х2).",
        spider: "Кликните по карте, чтобы взять её, и по другой колонке, чтобы положить. Собирайте от Короля до Туза в одной масти. Кнопка 'Раздать' выдает новый ряд.",
        party: "У вас 15 секунд на ответ и 3 жизни. Вопросы не повторяются. Ошибка или просрочка времени отнимает жизнь."
    };

    app.appendChild(el(`<details style="margin-bottom:15px; background:var(--card-soft); padding:12px; border-radius:8px; border:1px solid var(--border);">
        <summary style="cursor:pointer; font-weight:bold; color:var(--accent);">❓ Как играть</summary>
        <p style="margin-top:10px; font-size:14px; color:var(--muted); line-height:1.4;">${rules[gameId]}</p>
    </details>`));

    var container = el('<div class="module" id="gameContainer" style="min-height:400px;"></div>');
    app.appendChild(container);

    if (gameId === 'minesweeper') startMinesweeper(container);
    else if (gameId === 'tictactoe') startTicTacToe(container);
    else if (gameId === 'sudoku') startSudoku(container);
    else if (gameId === 'casino') startCasino(container);
    else if (gameId === 'roulette') startRoulette(container);
    else if (gameId === 'party') startParty(container);
    else if (gameId === 'spider') startSpider(container);
};

// ================= САПЁР =================
function startMinesweeper(container) {
    var SIZE = 8, MINES = 10, flags = 0, revealed = 0, gameOver = false, flagMode = false;
    var grid = [], cells = [];

    function init(diff) {
        if (diff === 'easy') { SIZE = 5; MINES = 4; }
        else if (diff === 'medium') { SIZE = 8; MINES = 10; }
        else { SIZE = 12; MINES = 25; }
        
        grid = Array(SIZE).fill().map(() => Array(SIZE).fill(0));
        cells = Array(SIZE).fill().map(() => Array(SIZE).fill(false));
        flags = 0; revealed = 0; gameOver = false; flagMode = false;

        var placed = 0;
        while (placed < MINES) {
            var r = Math.floor(Math.random() * SIZE), c = Math.floor(Math.random() * SIZE);
            if (grid[r][c] !== 'M') { grid[r][c] = 'M'; placed++; }
        }
        for (var r = 0; r < SIZE; r++) {
            for (var c = 0; c < SIZE; c++) {
                if (grid[r][c] !== 'M') {
                    var mines = 0;
                    for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) {
                        var nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && grid[nr][nc] === 'M') mines++;
                    }
                    grid[r][c] = mines;
                }
            }
        }
        render();
    }

    function reveal(r, c) {
        if (gameOver || cells[r][c] || grid[r][c] === 'F') return;
        cells[r][c] = true; revealed++;
        if (grid[r][c] === 'M') { gameOver = true; return; }
        if (grid[r][c] === 0) {
            for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) {
                var nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) reveal(nr, nc);
            }
        }
    }

    function render() {
        container.innerHTML = `<div style="text-align:center; margin-bottom:15px;">
            <button class="btn ${flagMode ? '' : 'ghost'}" onclick="this.classList.toggle('ghost'); window._msFlag = !window._msFlag">🚩 Флажок: ${flagMode ? 'ВКЛ' : 'ВЫКЛ'}</button>
            <select id="msDiff" style="padding:8px; border-radius:6px; margin-left:10px;" onchange="startMinesweeper(document.getElementById('gameContainer'))">
                <option value="easy" ${SIZE===5?'selected':''}>Легкий 5x5</option>
                <option value="medium" ${SIZE===8?'selected':''}>Средний 8x8</option>
                <option value="hard" ${SIZE===12?'selected':''}>Сложный 12x12</option>
            </select>
            <div style="margin-top:10px; font-weight:bold; color:var(--accent);">Мин: ${MINES - flags} | Открыто: ${revealed}/${SIZE*SIZE-MINES}</div>
        </div>`;
        
        var gridEl = document.createElement("div"); gridEl.style = `display:grid; grid-template-columns:repeat(${SIZE},35px); gap:2px; justify-content:center;`;
        for (var r = 0; r < SIZE; r++) for (var c = 0; c < SIZE; c++) {
            var btn = document.createElement("button");
            btn.style = `width:35px; height:35px; font-weight:bold; font-size:16px; border-radius:4px; border:1px solid var(--border); cursor:pointer;`;
            if (cells[r][c]) {
                btn.style.background = "var(--card-soft)";
                if (grid[r][c] === 'M') { btn.textContent = "💥"; btn.style.background = "var(--err)"; }
                else { btn.textContent = grid[r][c] || ""; btn.style.color = "var(--accent)"; }
            } else {
                btn.style.background = "var(--card)";
                if (grid[r][c] === 'F') btn.textContent = "🚩";
            }
            btn.onclick = (function(r,c){ return function(){ 
                if (gameOver) return;
                if (window._msFlag) {
                    if (!cells[r][c]) {
                        if (grid[r][c] === 'F') { grid[r][c] = 0; flags--; }
                        else { grid[r][c] = 'F'; flags++; }
                        flagMode = window._msFlag; render();
                    }
                } else { reveal(r, c); if(gameOver) showWin(); else render(); }
            }; })(r,c);
            btn.oncontextmenu = (function(r,c){ return function(e){ 
                e.preventDefault(); if (gameOver || cells[r][c]) return;
                if (grid[r][c] === 'F') { grid[r][c] = 0; flags--; }
                else { grid[r][c] = 'F'; flags++; }
                render();
            }; })(r,c);
            gridEl.appendChild(btn);
        }
        container.appendChild(gridEl);
    }

    function showWin() {
        setTimeout(() => {
            if (confirm("💥 БУМ! Вы подорвались. Начать заново?")) startMinesweeper(container);
            else window.renderArcadePage();
        }, 100);
    }
    init('medium');
}

// ================= КРЕСТИКИ-НОЛИКИ =================
function startTicTacToe(container) {
    container.innerHTML = `<div style="text-align:center;">
        <h3>Выберите размер поля:</h3>
        <button class="btn" onclick="window._initTTT(3)">3x3 (Классика)</button>
        <button class="btn" onclick="window._initTTT(5)">5x5 (Средний)</button>
        <button class="btn" onclick="window._initTTT(8)">8x8 (Сложный)</button>
        <div id="tttBoard" style="margin-top:20px; display:flex; justify-content:center; flex-wrap:wrap;"></div>
    </div>`;
    
    window._initTTT = function(size) {
        var board = Array(size*size).fill(null); var gameOver = false;
        var boardEl = document.getElementById("tttBoard");
        boardEl.style = `display:grid; grid-template-columns:repeat(${size},50px); gap:5px; justify-content:center;`;

        function checkWin() {
            var winLength = size === 3 ? 3 : (size === 5 ? 4 : 5);
            for (var r = 0; r < size; r++) for (var c = 0; c <= size - winLength; c++) {
                var first = board[r*size+c]; if (!first) continue;
                var win = true; for (var i = 1; i < winLength; i++) if (board[r*size+c+i] !== first) { win = false; break; }
                if (win) return first;
            }
            for (var c = 0; c < size; c++) for (var r = 0; r <= size - winLength; r++) {
                var first = board[r*size+c]; if (!first) continue;
                var win = true; for (var i = 1; i < winLength; i++) if (board[(r+i)*size+c] !== first) { win = false; break; }
                if (win) return first;
            }
            for (var r = 0; r <= size - winLength; r++) for (var c = 0; c <= size - winLength; c++) {
                var first = board[r*size+c]; if (!first) continue;
                var win = true; for (var i = 1; i < winLength; i++) if (board[(r+i)*size+c+i] !== first) { win = false; break; }
                if (win) return first;
            }
            for (var r = 0; r <= size - winLength; r++) for (var c = winLength - 1; c < size; c++) {
                var first = board[r*size+c]; if (!first) continue;
                var win = true; for (var i = 1; i < winLength; i++) if (board[(r+i)*size+c-i] !== first) { win = false; break; }
                if (win) return first;
            }
            return board.includes(null) ? null : "draw";
        }

        function render() {
            boardEl.innerHTML = "";
            board.forEach((val, i) => {
                var btn = document.createElement("button");
                btn.className = "btn ghost"; btn.style = "width:50px; height:50px; font-size:24px; font-weight:bold;";
                btn.textContent = val || "";
                btn.onclick = () => {
                    if (board[i] || gameOver) return;
                    board[i] = "❌"; render();
                    var w = checkWin(); if (w) return end(w);
                    // AI Move
                    var empty = board.map((v, idx) => v === null ? idx : null).filter(v => v !== null);
                    if (empty.length) {
                        var move = empty[Math.floor(Math.random() * empty.length)];
                        board[move] = "⭕"; render();
                        w = checkWin(); if (w) return end(w);
                    }
                };
                boardEl.appendChild(btn);
            });
        }

        function end(w) {
            gameOver = true;
            if (w === "draw") alert("Ничья!");
            else if (w === "❌") { alert("Вы победили! +50 XP"); if(window.addXP) window.addXP(50); window.saveScore('tictactoe', 50); }
            else alert("Победил робот!");
            setTimeout(() => window._initTTT(size), 1000);
        }
        render();
    };
    window._initTTT(3);
}

// ================= СУДОКУ =================
function startSudoku(container) {
    var solution = [], puzzle = [], size = 4;

    container.innerHTML = `<div style="text-align:center;">
        <h3>Судоку</h3>
        <select id="sudokuLevel" style="padding:8px; border-radius:6px; margin-bottom:15px;" onchange="window._initSudoku(parseInt(this.value))">
            <option value="4">Легкий (4x4)</option>
            <option value="6">Средний (6x6)</option>
            <option value="9">Сложный (9x9)</option>
        </select>
        <div id="sudokuStatus" style="font-weight:bold; margin-top:10px; color:var(--ok);"></div>
        <div style="display:flex; justify-content:center; margin-top:15px;">
            <div id="sudokuGrid" style="display:grid; gap:2px;"></div>
        </div>
    </div>`;

    window._initSudoku = function(lvl) {
        size = lvl;
        if (size === 4) {
            solution = [[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]];
            puzzle = [[1,0,0,4],[0,4,1,0],[0,1,4,0],[4,0,0,1]];
        } else if (size === 6) {
            solution = [[1,2,3,4,5,6],[4,5,6,1,2,3],[2,3,4,5,6,1],[5,6,1,2,3,4],[3,4,5,6,1,2],[6,1,2,3,4,5]];
            puzzle = [[1,0,3,4,0,6],[0,5,0,1,2,0],[2,0,4,0,6,1],[0,6,1,0,3,4],[3,4,0,6,0,2],[6,0,2,3,4,0]];
        } else {
            solution = [
                [5,3,4,6,7,8,9,1,2],[6,7,2,1,9,5,3,4,8],[1,9,8,3,4,2,5,6,7],
                [8,5,9,7,6,1,4,2,3],[4,2,6,8,5,3,7,9,1],[7,1,3,9,2,4,8,5,6],
                [9,6,1,5,3,7,2,8,4],[2,8,7,4,1,9,6,3,5],[3,4,5,2,8,6,1,7,9]
            ];
            puzzle = [
                [5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],
                [8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],
                [0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9]
            ];
        }
        var grid = puzzle.map(r => r.slice());
        var gridEl = document.getElementById("sudokuGrid"); gridEl.innerHTML = "";
        document.getElementById("sudokuStatus").textContent = "";
        
        gridEl.style.gridTemplateColumns = `repeat(${size}, ${size === 9 ? '35px' : '50px'})`;
        
        for (var r = 0; r < size; r++) for (var c = 0; c < size; c++) {
            var input = document.createElement("input");
            input.type = "number"; input.min = 1; input.max = size;
            input.value = grid[r][c] || "";
            input.style = `width:100%; height:100%; min-height:${size === 9 ? '35px' : '50px'}; text-align:center; font-size:${size === 9 ? '16px' : '20px'}; font-weight:bold; border:1px solid var(--border); background:${puzzle[r][c] ? 'var(--accent-soft)' : 'var(--card)'}; color:var(--text); border-radius:4px;`;
            if (puzzle[r][c]) input.disabled = true;
            input.oninput = (function(r,c, el){
                return function(e){
                    var v = parseInt(e.target.value) || 0;
                    if (v < 1 || v > size) { e.target.value = ""; grid[r][c] = 0; return; }
                    grid[r][c] = v;
                    var win = true;
                    for (var i = 0; i < size; i++) for (var j = 0; j < size; j++) if (grid[i][j] !== solution[i][j]) win = false;
                    if (win) {
                        document.getElementById("sudokuStatus").textContent = "🎉 Решено! +100 XP";
                        if(window.addXP) window.addXP(100);
                        window.saveScore('sudoku', 100);
                    }
                };
            })(r,c, input);
            gridEl.appendChild(input);
        }
    };
    window._initSudoku(4);
}

// ================= КАЗИНО (СЛОТЫ) =================
function startCasino(container) {
    container.innerHTML = `<div style="text-align:center;">
        <h3>🎰 Слоты</h3><p>Собери 3 одинаковых и умножь ставку!</p>
        <div style="display:flex; justify-content:center; gap:10px; margin:20px 0;">
            <div id="reel1" style="font-size:50px; width:80px; height:100px; border:2px solid var(--border); border-radius:10px; display:flex; align-items:center; justify-content:center; background:var(--card-soft);">❓</div>
            <div id="reel2" style="font-size:50px; width:80px; height:100px; border:2px solid var(--border); border-radius:10px; display:flex; align-items:center; justify-content:center; background:var(--card-soft);">❓</div>
            <div id="reel3" style="font-size:50px; width:80px; height:100px; border:2px solid var(--border); border-radius:10px; display:flex; align-items:center; justify-content:center; background:var(--card-soft);">❓</div>
        </div>
        <div style="margin-bottom:15px;">
            Ставка: <select id="casinoBet" style="padding:5px;"><option value="10">10 XP</option><option value="50" selected>50 XP</option><option value="100">100 XP</option></select>
        </div>
        <button class="btn" id="spinBtn" style="width:100%; padding:15px; font-size:20px; background:var(--gold); color:#000;">КРУТИТЬ</button>
        <div id="casinoResult" style="margin-top:15px; font-weight:bold; font-size:20px;"></div>
    </div>`;

    document.getElementById("spinBtn").onclick = function() {
        var bet = parseInt(document.getElementById("casinoBet").value);
        if (window.state.xp < bet) return window.showToast("Мало XP", "err");
        window.addXP(-bet);
        this.disabled = true;
        var symbols = ["🍒", "🍋", "🔔", "💎", "7️⃣"];
        var r1 = document.getElementById("reel1"), r2 = document.getElementById("reel2"), r3 = document.getElementById("reel3");
        
        var spin = setInterval(() => {
            r1.textContent = symbols[Math.floor(Math.random()*symbols.length)];
            r2.textContent = symbols[Math.floor(Math.random()*symbols.length)];
            r3.textContent = symbols[Math.floor(Math.random()*symbols.length)];
        }, 50);

        setTimeout(() => {
            clearInterval(spin);
            this.disabled = false;
            var s1 = symbols[Math.floor(Math.random()*symbols.length)], s2 = symbols[Math.floor(Math.random()*symbols.length)], s3 = symbols[Math.floor(Math.random()*symbols.length)];
            if (Math.random() < 0.15) s2 = s1; 
            if (Math.random() < 0.1) s3 = s2;
            r1.textContent = s1; r2.textContent = s2; r3.textContent = s3;
            
            var win = 0; var resEl = document.getElementById("casinoResult");
            if (s1 === s2 && s2 === s3) { win = bet * 5; resEl.textContent = "🎉 ДЖЕКПОТ! +" + win; resEl.style.color = "var(--ok)"; window.saveScore('casino', win); }
            else if (s1 === s2 || s2 === s3 || s1 === s3) { win = bet * 2; resEl.textContent = "✨ Выигрыш! +" + win; resEl.style.color = "var(--ok)"; }
            else { resEl.textContent = "💸 Проигрыш..."; resEl.style.color = "var(--err)"; }
            if (win > 0) window.addXP(win);
        }, 2000);
    };
}

// ================= РУЛЕТКА =================
function startRoulette(container) {
    container.innerHTML = `<div style="text-align:center;">
        <h3>🎡 Рулетка</h3><p>Угадай число от 0 до 36.</p>
        <input type="number" id="roulNum" class="self-input" placeholder="Число 0-36" style="max-width:150px; margin:0 auto 10px; text-align:center;">
        <div style="margin-bottom:15px;">Ставка: <select id="roulBet" style="padding:5px;"><option value="10">10 XP</option><option value="50" selected>50 XP</option></select></div>
        <button class="btn" id="roulBtn" style="width:100%; padding:15px; background:var(--accent); color:#fff;">Играть</button>
        <div id="roulRes" style="margin-top:20px; font-size:24px; font-weight:bold;"></div>
    </div>`;
    
    document.getElementById("roulBtn").onclick = function() {
        var num = parseInt(document.getElementById("roulNum").value);
        var bet = parseInt(document.getElementById("roulBet").value);
        if (isNaN(num) || num < 0 || num > 36) return window.showToast("Число от 0 до 36", "err");
        if (window.state.xp < bet) return window.showToast("Мало XP", "err");
        window.addXP(-bet);
        var win = Math.floor(Math.random() * 37);
        var res = document.getElementById("roulRes");
        res.textContent = "Выпало: " + win;
        if (win === num) { res.textContent += " | 🎉 УГАДАЛИ x35!"; window.addXP(bet * 35); window.saveScore('roulette', bet * 35); }
        else if ((win === 0 && num === 0) || (win % 2 === num % 2)) { res.textContent += " | ✨ Угадали цвет x2!"; window.addXP(bet * 2); }
        else { res.textContent += " | 💸 Проигрыш."; }
    };
}

// ================= СМЕРТЕЛЬНАЯ ВЕЧЕРИНКА =================
function startParty(container) {
    if (!window._Q) {
        container.innerHTML = '<div style="color:var(--err);">Нет файлов с вопросами!</div>'; return;
    }
    var TARGET = 20;
    var allQ = [].concat(_Q.mdk, _Q.anime, _Q.games, _Q.logic);
    var uniqueQ = [];
    var seen = new Set();
    for (var i = 0; i < allQ.length; i++) {
        if (!seen.has(allQ[i][0])) {
            seen.add(allQ[i][0]);
            uniqueQ.push(allQ[i]);
        }
    }

    var pool = _shuffle(uniqueQ);
    var lives = 3, score = 0;
    var timerId, timeLeft = 15;
    var isAnswering = false;

    function startTimer(correctIdx) {
        clearInterval(timerId);
        timeLeft = 15;
        var timerEl = document.getElementById("partyTimer");
        if (timerEl) timerEl.textContent = `⏱ ${timeLeft}с`;
        
        timerId = setInterval(() => {
            timeLeft--;
            if (timerEl) timerEl.textContent = `⏱ ${timeLeft}с`;
            if (timeLeft <= 0) {
                clearInterval(timerId);
                if (isAnswering) return;
                isAnswering = true;
                lives--;
                window.showToast("❌ Время вышло! Осталось жизней: " + lives, "err");
                
                var btns = document.querySelectorAll("#partyOpts button");
                btns.forEach(b => { b.disabled = true; b.style.opacity = 0.6; });
                btns.forEach(b => {
                    if (b.getAttribute("onclick").includes(` ${correctIdx})`)) {
                        b.style.borderColor = "var(--ok)";
                        b.style.background = "rgba(88, 201, 138, 0.2)";
                    }
                });
                
                setTimeout(() => { isAnswering = false; nextQ(); }, 1500);
            }
        }, 1000);
    }

    function nextQ() {
        clearInterval(timerId);
        if (lives <= 0) return showEnd('lose');
        if (score >= TARGET) return showEnd('win');
        
        if (pool.length === 0) { pool = _shuffle(uniqueQ); }

        var q = pool.pop();
        
        var correctText = q[1].split("|")[q[2]];
        var opts = _shuffle(q[1].split("|"));
        var correctIdx = opts.indexOf(correctText);

        container.innerHTML = `<div style="text-align:center;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; font-weight:bold; color:var(--err);">
                <span>${'❤️'.repeat(lives)}</span>
                <span id="partyTimer" style="color:var(--accent); font-size:20px;">⏱ 15с</span>
                <span>Счет: ${score}/${TARGET}</span>
            </div>
            <h3 style="margin-bottom:20px;">${q[0]}</h3>
            <div id="partyOpts" style="display:flex; flex-direction:column; gap:10px; max-width:400px; margin:0 auto;">
                ${opts.map((opt, i) => `<button class="btn ghost" style="padding:12px;" onclick="window._partyAns(this, ${i}, ${correctIdx})">${opt}</button>`).join('')}
            </div>
        </div>`;
        startTimer(correctIdx);
    }

    window._partyAns = function(btn, selected, correct) {
        if (isAnswering) return;
        isAnswering = true;
        clearInterval(timerId);
        
        var btns = document.querySelectorAll("#partyOpts button");
        btns.forEach(b => { b.disabled = true; b.style.opacity = 0.6; });
        btn.style.opacity = 1;
        btn.style.borderColor = (selected === correct) ? "var(--ok)" : "var(--err)";

        if (selected === correct) { 
            score++; 
            window.showToast("✅ Верно!", "ok"); 
            btn.style.background = "rgba(88, 201, 138, 0.2)";
        } else { 
            lives--; 
            window.showToast("❌ Ошибка! Осталось жизней: " + lives, "err"); 
            btn.style.background = "rgba(255, 110, 94, 0.2)";
            
            btns.forEach(b => {
                if (b.getAttribute("onclick").includes(` ${correct})`)) {
                    b.style.borderColor = "var(--ok)";
                    b.style.background = "rgba(88, 201, 138, 0.2)";
                }
            });
        }
        
        setTimeout(() => { isAnswering = false; nextQ(); }, 1500);
    };

    function showEnd(type) {
        clearInterval(timerId);
        if (type === 'win') {
            var best = parseInt(localStorage.getItem('hs_party') || '0');
            window.saveScore('party', score);
            if (window.addXP) window.addXP(200);
            container.innerHTML = `<div style="text-align:center;padding:30px;">
                <h2 style="color:var(--ok);">🎉 Вы выжили!</h2>
                <p>Счет: ${score}/${TARGET}</p>
                <p style="color:var(--gold);">Рекорд: ${Math.max(score, best)}</p>
                <button class="btn" onclick="window.startGame('party')">Еще раз</button></div>`;
        } else {
            window.saveScore('party', score);
            container.innerHTML = `<div style="text-align:center;padding:30px;">
                <h2 style="color:var(--err);">💀 Вы проиграли</h2>
                <p>Счет: ${score}/${TARGET}</p>
                <button class="btn" onclick="window.startGame('party')">Реванш</button></div>`;
        }
    }
    nextQ();
}

// ================= СОЛИТЁР ПАУК =================
function startSpider(container) {
    var suits = ['♠', '♥'];
    var deck = [];
    for (var s of suits) for (var r = 1; r <= 13; r++) deck.push({ suit: s, rank: r, faceUp: false });
    deck.sort(() => Math.random() - 0.5);

    var cols = [[], [], [], [], [], [], [], [], [], []];
    for (var i = 0; i < 10; i++) {
        var count = i < 4 ? 6 : 5;
        for (var j = 0; j < count; j++) {
            var card = deck.pop();
            if (j === count - 1) card.faceUp = true;
            cols[i].push(card);
        }
    }

    var selectedCol = null, selectedIdx = null;

    function render() {
        container.innerHTML = `<div style="text-align:center;">
            <h3>🕷️ Солитёр Паук</h3>
            <button class="btn ghost" onclick="window._dealSpider()" style="margin-bottom:15px;">Раздать (Осталось: ${deck.length})</button>
            <div id="spiderBoard" style="display:flex; gap:8px; justify-content:center; margin-top:10px; min-height:250px;"></div>
        </div>`;
        
        var boardEl = document.getElementById("spiderBoard");
        cols.forEach((col, cIdx) => {
            var colEl = document.createElement("div");
            colEl.style = "width:65px; min-height:200px; border:1px dashed var(--border); border-radius:5px; padding:5px 0; display:flex; flex-direction:column; align-items:center; background:var(--bg);";
            
            colEl.onclick = (e) => {
                if (e.target === colEl && selectedCol !== null) {
                    var movingCards = cols[selectedCol].slice(selectedIdx);
                    cols[selectedCol] = cols[selectedCol].slice(0, selectedIdx);
                    if (cols[selectedCol].length > 0) cols[selectedCol][cols[selectedCol].length - 1].faceUp = true;
                    cols[cIdx] = cols[cIdx].concat(movingCards);
                    selectedCol = null; selectedIdx = null;
                    checkWin(); render();
                }
            };

            col.forEach((card, rIdx) => {
                var cardEl = document.createElement("div");
                var rankStr = card.rank === 1 ? 'A' : card.rank === 11 ? 'J' : card.rank === 12 ? 'Q' : card.rank === 13 ? 'K' : card.rank;
                var isRed = card.suit === '♥';
                cardEl.style = `width:55px; height:75px; border-radius:5px; border:1px solid var(--border); margin-bottom:-55px; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:20px; font-weight:bold; background:${card.faceUp ? '#fff' : 'var(--card-soft)'}; color:${card.faceUp ? (isRed ? '#d32f2f' : '#000') : 'transparent'}; cursor:pointer; box-shadow:0 1px 3px rgba(0,0,0,0.3); z-index:${rIdx};`;
                if (selectedCol === cIdx && selectedIdx === rIdx) cardEl.style.border = "2px solid var(--gold)";
                if (card.faceUp) {
                    cardEl.innerHTML = `<div>${rankStr}</div><div>${card.suit}</div>`;
                    cardEl.onclick = (e) => {
                        e.stopPropagation();
                        if (selectedCol === null) {
                            var isValid = true;
                            for (var i = rIdx; i < col.length - 1; i++) {
                                if (col[i].rank - 1 !== col[i+1].rank || col[i].suit !== col[i+1].suit) { isValid = false; break; }
                            }
                            if (isValid) { selectedCol = cIdx; selectedIdx = rIdx; render(); }
                        } else {
                            if (selectedCol === cIdx) { selectedCol = null; selectedIdx = null; render(); return; }
                            var movingCards = cols[selectedCol].slice(selectedIdx);
                            var targetCol = cols[cIdx];
                            var validMove = true;
                            if (targetCol.length > 0) {
                                var topCard = targetCol[targetCol.length - 1];
                                if (!topCard.faceUp || topCard.rank !== movingCards[0].rank + 1 || topCard.suit !== movingCards[0].suit) validMove = false;
                            }
                            if (validMove) {
                                cols[selectedCol] = cols[selectedCol].slice(0, selectedIdx);
                                if (cols[selectedCol].length > 0 && !cols[selectedCol][cols[selectedCol].length - 1].faceUp) cols[selectedCol][cols[selectedCol].length - 1].faceUp = true;
                                cols[cIdx] = cols[cIdx].concat(movingCards);
                                selectedCol = null; selectedIdx = null;
                                checkWin(); render();
                            }
                        }
                    };
                }
                colEl.appendChild(cardEl);
            });
            boardEl.appendChild(colEl);
        });
    }

    window._dealSpider = function() {
        if (deck.length < 10) return window.showToast("Мало карт", "err");
        for (var i = 0; i < 10; i++) {
            var card = deck.pop();
            card.faceUp = true;
            cols[i].push(card);
        }
        render();
    };

    function checkWin() {
        var total = cols.reduce((acc, col) => acc + col.length, 0);
        if (total === 0) {
            window.showToast("🎉 Победа!", "ok");
            window.saveScore('spider', 100);
            if(window.addXP) window.addXP(100);
        }
    }
    render();
}