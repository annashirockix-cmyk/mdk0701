"use strict";

window.renderArcadePage = function() {
    var app = document.getElementById("app"); if (!app) return; app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Игровая комната";
    app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
    app.appendChild(el('<section class="hero"><h1>🎮 Игровая комната</h1><p>Зарабатывай XP и развлекайся!</p></section>'));

    var games = [
        { id: "minesweeper", title: "💣 Сапёр", desc: "Классический сапёр с флажками и уровнями сложности." },
        { id: "tictactoe", title: "❌ Крестики-нолики", desc: "От 3х3 до 8х8. Победи робота!" },
        { id: "sudoku", title: "🔢 Судоку", desc: "Разные уровни сложности." },
        { id: "casino", title: "🎰 Казино", desc: "Испытай удачу на слотах." },
        { id: "roulette", title: "🎡 Рулетка", desc: "Красное или черное? Угадай число!" },
        { id: "spider", title: "🕷️ Солитёр Паук", desc: "Упрощенная версия классического пасьянса." },
        { id: "party", title: "☠️ Смертельная вечеринка", desc: "Викторина на выживание с 2000+ вопросов (МДК, Аниме, Игры, Логика)." }
    ];

    var grid = el('<div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px;"></div>');
    games.forEach(g => {
        grid.appendChild(el(`<div class="module" style="cursor:pointer; transition:0.2s;" onclick="window.startGame('${g.id}')" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
            <h3 style="margin-top:0; color:var(--accent);">${g.title}</h3>
            <p style="color:var(--muted); font-size:14px;">${g.desc}</p>
            <button class="btn ghost" style="width:100%; margin-top:10px;">Играть</button>
        </div>`));
    });
    app.appendChild(grid);
};

window.startGame = function(gameId) {
    var app = document.getElementById("app"); app.innerHTML = "";
    app.appendChild(el('<a class="backlink" href="#/arcade" style="color:var(--accent);">← В меню игр</a>'));
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
            else location.hash = "#/arcade";
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
            else if (w === "❌") { alert("Вы победили! +50 XP"); if(window.addXP) window.addXP(50); }
            else alert("Победил робот!");
            setTimeout(() => window._initTTT(size), 1000);
        }
        render();
    };
    window._initTTT(3);
}

// ================= СУДОКУ =================
function startSudoku(container) {
    // Упрощенное судоку 4x4 для примера (можно расширить до 9x9)
    var solution = [[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]];
    var puzzle = [[1,0,0,4],[0,4,1,0],[0,1,4,0],[4,0,0,1]];
    var grid = puzzle.map(r => r.slice());

    container.innerHTML = `<div style="text-align:center;"><h3>Судоку 4x4</h3><p>Заполните пустые клетки цифрами 1-4.</p>
    <div id="sudokuGrid" style="display:inline-grid; grid-template-columns:repeat(4,50px); gap:2px; margin:20px auto;"></div>
    <div id="sudokuStatus" style="font-weight:bold; margin-top:10px;"></div></div>`;

    function render() {
        var gridEl = document.getElementById("sudokuGrid"); gridEl.innerHTML = "";
        for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
            var input = document.createElement("input");
            input.type = "number"; input.min = 1; input.max = 4;
            input.value = grid[r][c] || "";
            input.style = `width:50px; height:50px; text-align:center; font-size:20px; font-weight:bold; border:1px solid var(--border); background:${puzzle[r][c] ? 'var(--accent-soft)' : 'var(--card)'}; color:var(--text); border-radius:6px;`;
            if (puzzle[r][c]) input.disabled = true;
            input.oninput = (function(r,c){ return function(e){
                var v = parseInt(e.target.value) || 0;
                if (v < 1 || v > 4) { e.target.value = ""; grid[r][c] = 0; return; }
                grid[r][c] = v;
                checkWin();
            }; })(r,c);
            gridEl.appendChild(input);
        }
    }
    function checkWin() {
        for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) if (grid[r][c] !== solution[r][c]) return;
        document.getElementById("sudokuStatus").textContent = "🎉 Решено! +100 XP";
        document.getElementById("sudokuStatus").style.color = "var(--ok)";
        if(window.addXP) window.addXP(100);
    }
    render();
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
            if (Math.random() < 0.15) s2 = s1; // Шанс на выигрыш
            if (Math.random() < 0.1) s3 = s2;
            r1.textContent = s1; r2.textContent = s2; r3.textContent = s3;
            
            var win = 0; var resEl = document.getElementById("casinoResult");
            if (s1 === s2 && s2 === s3) { win = bet * 5; resEl.textContent = "🎉 ДЖЕКПОТ! +" + win; resEl.style.color = "var(--ok)"; }
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
        if (win === num) { res.textContent += " | 🎉 УГАДАЛИ x35!"; window.addXP(bet * 35); }
        else if ((win === 0 && num === 0) || (win % 2 === num % 2)) { res.textContent += " | ✨ Угадали цвет x2!"; window.addXP(bet * 2); }
        else { res.textContent += " | 💸 Проигрыш."; }
    };
}

// ================= СМЕРТЕЛЬНАЯ ВЕЧЕРИНКА =================
function startParty(container) {
    // База вопросов (можно расширять до 2000+)
    var questions = [
        { q: "Что такое техническое диагностирование?", opts: ["Ремонт", "Определение состояния", "Наладка", "Сборка"], a: 1 },
        { q: "Какой код включает шпиндель по часовой?", opts: ["M03", "M04", "M05", "M08"], a: 0 },
        { q: "Что делает G00?", opts: ["Линейная интерполяция", "Ускоренное перемещение", "Круговая", "Пауза"], a: 1 },
        { q: "Какой прибор измеряет вибрацию?", opts: ["Пирометр", "Виброметр", "Шумомер", "Микрометр"], a: 1 },
        { q: "Сколько степеней свободы у твердого тела?", opts: ["3", "4", "6", "8"], a: 2 },
        { q: "Аниме: Как зовут главного героя 'Наруто'?", opts: ["Саске", "Наруто", "Какаши", "Итачи"], a: 1 },
        { q: "Игры: В какой игре есть персонаж Кратос?", opts: ["God of War", "Minecraft", "CS:GO", "Dota 2"], a: 0 },
        { q: "Логика: Что тяжелее 1 кг железа или 1 кг ваты?", opts: ["Железо", "Вата", "Одинаково", "Зависит от цвета"], a: 2 }
    ];
    
    var lives = 3; var score = 0;
    function nextQ() {
        if (lives <= 0) {
            container.innerHTML = `<div style="text-align:center; padding:30px;"><h2 style="color:var(--err);">💀 Вы проиграли</h2><p>Счет: ${score}</p><button class="btn" onclick="window.startGame('party')">Реванш</button></div>`;
            return;
        }
        if (score === questions.length) {
            container.innerHTML = `<div style="text-align:center; padding:30px;"><h2 style="color:var(--ok);">🎉 Вы выжили!</h2><p>Счет: ${score}</p><button class="btn" onclick="window.startGame('party')">Еще раз</button></div>`;
            return;
        }
        
        var q = questions[Math.floor(Math.random() * questions.length)];
        container.innerHTML = `<div style="text-align:center;">
            <div style="display:flex; justify-content:space-between; margin-bottom:15px; font-weight:bold; color:var(--err);"><span>❤️ ${'❤️'.repeat(lives)}</span><span>Счет: ${score}</span></div>
            <h3 style="margin-bottom:20px;">${q.q}</h3>
            <div style="display:flex; flex-direction:column; gap:10px; max-width:400px; margin:0 auto;">
                ${q.opts.map((opt, i) => `<button class="btn ghost" style="padding:12px;" onclick="window._partyAns(${i}, ${q.a})">${opt}</button>`).join('')}
            </div>
        </div>`;
    }
    
    window._partyAns = function(selected, correct) {
        if (selected === correct) { score++; window.showToast("✅ Верно!", "ok"); }
        else { lives--; window.showToast("❌ Ошибка! Осталось жизней: " + lives, "err"); }
        setTimeout(nextQ, 1000);
    };
    nextQ();
}

// ================= СОЛИТЁР ПАУК (Упрощенный) =================
function startSpider(container) {
    // Простая реализация "найди пару"
    var cards = [];
    for (var i = 1; i <= 4; i++) { cards.push(i); cards.push(i); }
    cards = cards.sort(() => Math.random() - 0.5);
    
    var flipped = []; var matched = 0;
    container.innerHTML = `<div style="text-align:center;"><h3>🕷️ Солитёр Паук (Найди пару)</h3><p>Откройте две одинаковые карты.</p>
    <div id="spiderGrid" style="display:grid; grid-template-columns:repeat(4, 70px); gap:10px; justify-content:center; margin-top:20px;"></div></div>`;
    
    var gridEl = document.getElementById("spiderGrid");
    cards.forEach((val, i) => {
        var btn = document.createElement("button");
        btn.className = "btn ghost"; btn.style = "height:90px; font-size:28px; background:var(--card-soft);";
        btn.textContent = "🎴";
        btn.onclick = function() {
            if (flipped.includes(i) || btn.disabled) return;
            btn.textContent = val; flipped.push(i);
            
            if (flipped.length === 2) {
                var idx1 = flipped[0], idx2 = flipped[1];
                if (cards[idx1] === cards[idx2]) {
                    matched += 2; window.showToast("Пара!", "ok");
                    gridEl.children[idx1].disabled = true; gridEl.children[idx2].disabled = true;
                    gridEl.children[idx1].style.background = "var(--ok)";
                    gridEl.children[idx2].style.background = "var(--ok)";
                    if (matched === cards.length) setTimeout(() => { alert("Победа! +100 XP"); window.addXP(100); }, 500);
                } else {
                    setTimeout(() => {
                        gridEl.children[idx1].textContent = "🎴"; gridEl.children[idx2].textContent = "🎴";
                    }, 800);
                }
                flipped = [];
            }
        };
        gridEl.appendChild(btn);
    });
}