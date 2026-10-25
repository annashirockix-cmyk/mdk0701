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
    var app = document.getElementById("app"); 
    if (!app) return; 
    app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Игровая комната";
    
    app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
    app.appendChild(el('<section class="hero"><h1>🎮 Игровая комната</h1><p>Зарабатывай XP и развлекайся!</p></section>'));

    var allGames = [
        { id: "snake", title: "🐍 Cursor Snake", desc: "Управляйте змейкой курсором мыши." },
        { id: "pumpkin", title: "🎃 Carve Pumpkin", desc: "Вырежи лицо на тыкве." },
        { id: "slime", title: "🟢 Желейный слайм", desc: "Интерактивный слайм." },
        { id: "dragon", title: "🐉 Пиксельный дракон", desc: "Анимация дракона." },
        { id: "gravity_pass", title: "🔐 Гравитационный пароль", desc: "Анимация ввода пароля." },
        { id: "heavy_ball", title: "⚫ Тяжелый шар", desc: "Переключатель темы." },
        { id: "captcha_cat", title: "🐱 Кот-капча", desc: "Разбуди кота." },
        { id: "lanterns", title: "🏮 Бумажные фонарики", desc: "Зажги улицу." },
        { id: "liquid_login", title: "💧 Жидкий металл", desc: "Анимация входа." },
        { id: "gcode", title: "📐 G-код Рисование", desc: "Изучи команды ЧПУ." },
        { id: "minesweeper", title: "💣 Сапёр", desc: "Классический сапёр." },
        { id: "tictactoe", title: "❌ Крестики-нолики", desc: "Победи робота!" },
        { id: "sudoku", title: "🔢 Судоку", desc: "Тренируй логику." },
        { id: "blackjack", title: "🃏 Очко (21)", desc: "Блэкджек." },
        { id: "memory", title: "🧠 Найди пару", desc: "Тренируй память." },
        { id: "casino", title: "🎰 Казино", desc: "Слоты." },
        { id: "roulette", title: "🎡 Рулетка", desc: "Красное или черное?" },
        { id: "spider", title: "🕷️ Паук", desc: "Солитёр." },
        { id: "party", title: "☠️ Вечеринка", desc: "Викторина." },
        { id: "starfield", title: "✨ Звездный дождь", desc: "Анимация." },
        { id: "solar", title: "🪐 Солнечная система", desc: "Планеты." }
    ];

    var grid = el('<div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:16px;"></div>');
    
    allGames.forEach(g => {
        var best = localStorage.getItem('hs_' + g.id) || 0;
        var bestTxt = best > 0 ? `<div style="color:var(--gold); font-size:13px; font-weight:bold; margin-top:10px;">⭐ Рекорд: ${best}</div>` : '';
        
        grid.appendChild(el(`<div class="module" style="cursor:pointer; transition:0.2s; display:flex; flex-direction:column; justify-content:space-between; margin-bottom:0;" onclick="window.startGame('${g.id}')" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
            <div>
                <h3 style="margin-top:0; color:var(--accent);">${g.title}</h3>
                <p style="color:var(--muted); font-size:14px;">${g.desc}</p>
                ${bestTxt}
            </div>
            <button class="btn ghost" style="width:100%; margin-top:15px;">Запустить</button>
        </div>`));
    });
    app.appendChild(grid);
};

window.startGame = function(gameId) {
    var app = document.getElementById("app"); 
    if (!app) return;
    app.innerHTML = "";
    app.appendChild(el('<a class="backlink" href="javascript:void(0)" onclick="window.renderArcadePage()" style="color:var(--accent); cursor:pointer;">← В меню игр</a>'));

    if (window.unlockAchievement) window.unlockAchievement('gamer');

    var rules = {
        snake: "Управляйте змейкой курсором мыши или стрелками.",
        pumpkin: "Вырезайте лицо на тыкве, ведя курсором по разметке.",
        slime: "Двигайте мышкой, тяните слайма, кликайте для печенья.",
        dragon: "Просто наблюдайте за анимацией дракона.",
        gravity_pass: "Введите пароль и наблюдайте за гравитацией.",
        heavy_ball: "Бросайте шар, чтобы переключить тему.",
        captcha_cat: "Разбудите кота, проведя клубком мимо него.",
        lanterns: "Поднесите огонь к фонарю, чтобы зажечь улицу.",
        liquid_login: "Введите логин и пароль в анимированную форму.",
        gcode: "Вводите команды в формате G01 X50 Y50.",
        minesweeper: "Клик открывает клетку. Правая кнопка мыши ставит флаг.",
        tictactoe: "Соберите линию из 3 символов раньше робота.",
        sudoku: "Заполните поле цифрами без повторений.",
        blackjack: "Наберите сумму очков ближе к 21.",
        memory: "Открывайте по две карточки за ход.",
        casino: "Сделайте ставку и крутите слоты.",
        roulette: "Угадайте число или чёт/нечет.",
        spider: "Собирайте от Короля до Туза.",
        party: "У вас 15 секунд на ответ.",
        starfield: "Просто наблюдайте.",
        solar: "Анимация движения планет."
    };

    app.appendChild(el(`<details style="margin-bottom:15px; background:var(--card-soft); padding:12px; border-radius:8px; border:1px solid var(--border);">
        <summary style="cursor:pointer; font-weight:bold; color:var(--accent);">❓ Как играть</summary>
        <p style="margin-top:10px; font-size:14px; color:var(--muted);">${rules[gameId] || "Правила не указаны."}</p>
    </details>`));

    // Контейнер адаптирован под мобильные устройства и разные игры
    var container = el('<div class="module" id="gameContainer" style="min-height:400px; padding:0; overflow-x:auto; overflow-y:hidden; position:relative;"></div>');
    app.appendChild(container);

    // HTML игры, которые открываются через iframe
    var iframeGames = {
        snake: 'snake.html',
        pumpkin: 'carve_pumpkin.html',
        slime: 'jelly_slime.html',
        dragon: 'pixel_dragon.html',
        gravity_pass: 'gravity_password_v2.html',
        heavy_ball: 'heavy_ball_switch.html',
        captcha_cat: 'captcha_wake_cat.html',
        lanterns: 'paper_lantern.html',
        liquid_login: 'login_v3b.html'
    };

    if (iframeGames[gameId]) {
        var height = (gameId === 'dragon' || gameId === 'heavy_ball') ? '60vh' : '80vh';
        var bgStyle = gameId === 'dragon' ? 'background:#a3a3a3;' : '';
        container.innerHTML = `<iframe src="./${iframeGames[gameId]}" style="width:100%; height:${height}; border:none; display:block; border-radius:8px; ${bgStyle}"></iframe>`;
    } 
    // Встроенные JS-игры
    else if (gameId === 'gcode') { startGcode(container); }
    else if (gameId === 'minesweeper') { startMinesweeper(container); }
    else if (gameId === 'tictactoe') { startTicTacToe(container); }
    else if (gameId === 'sudoku') { startSudoku(container); }
    else if (gameId === 'blackjack') { startBlackjack(container); }
    else if (gameId === 'memory') { startMemory(container); }
    else if (gameId === 'casino') { startCasino(container); }
    else if (gameId === 'roulette') { startRoulette(container); }
    else if (gameId === 'party') { startParty(container); }
    else if (gameId === 'spider') { startSpider(container); }
    else if (gameId === 'starfield') { startStarfield(container); }
    else if (gameId === 'solar') { startSolarSystem(container); }
};

// ================= 1. G-КОД РИСОВАНИЕ =================
function startGcode(container) {
    container.innerHTML = `<div style="padding: 20px;">
        <div style="display:flex; gap:10px; margin-bottom:15px;">
            <input type="text" id="gcodeInput" class="self-input" style="margin:0; flex:1;" placeholder="G01 X50 Y50">
            <button class="btn" onclick="window.runGcode()">Выполнить</button>
        </div>
        <canvas id="gcodeCanvas" width="400" height="400" class="gcode-canvas"></canvas>
    </div>`;
    var canvas=document.getElementById("gcodeCanvas"), ctx=canvas.getContext("2d"), curX=200, curY=200; 
    ctx.beginPath(); ctx.moveTo(curX, curY);
    window.runGcode = function() { 
        var cmd=document.getElementById("gcodeInput").value.toUpperCase().trim(); if(!cmd) return; 
        document.getElementById("gcodeInput").value=""; var parts=cmd.split(" "), g=parts[0], params={}; 
        parts.slice(1).forEach(p=>{params[p[0]]=parseFloat(p.slice(1));}); 
        ctx.strokeStyle='#39E6FF'; ctx.lineWidth=2; 
        if(g==="G00"){ if(params.X!==undefined)curX=params.X; if(params.Y!==undefined)curY=params.Y; ctx.moveTo(curX,curY);}
        else if(g==="G01"){ if(params.X!==undefined)curX=params.X; if(params.Y!==undefined)curY=params.Y; ctx.lineTo(curX,curY); ctx.stroke();} 
    }; 
    document.getElementById("gcodeInput").addEventListener("keydown", function(e) { if(e.key==="Enter") window.runGcode(); });
}

// ================= 2. САПЁР =================
function startMinesweeper(container) {
    var ROWS = 10, COLS = 10, MINES = 15;
    var board = [], gameOver = false, flags = 0, revealed = 0;
    
    function init() {
        board = []; gameOver = false; flags = 0; revealed = 0;
        for (var r = 0; r < ROWS; r++) {
            board[r] = [];
            for (var c = 0; c < COLS; c++) {
                board[r][c] = { mine: false, revealed: false, flagged: false, count: 0 };
            }
        }
        var placed = 0;
        while (placed < MINES) {
            var r = Math.floor(Math.random() * ROWS), c = Math.floor(Math.random() * COLS);
            if (!board[r][c].mine) { board[r][c].mine = true; placed++; }
        }
        for (var r = 0; r < ROWS; r++) {
            for (var c = 0; c < COLS; c++) {
                if (board[r][c].mine) continue;
                var cnt = 0;
                for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) {
                    if (r+dr >= 0 && r+dr < ROWS && c+dc >= 0 && c+dc < COLS && board[r+dr][c+dc].mine) cnt++;
                }
                board[r][c].count = cnt;
            }
        }
    }

    function render() {
        var html = `<div style="padding:20px; text-align:center; min-width:320px;">
            <div style="margin-bottom:15px; font-size:18px;">💣 Сапёр | Флаги: <span style="color:var(--err);">${flags}</span>/${MINES}</div>
            <div style="display:inline-grid; grid-template-columns:repeat(${COLS}, 30px); gap:2px; background:var(--border); padding:5px; border-radius:8px;">`;
        for (var r = 0; r < ROWS; r++) {
            for (var c = 0; c < COLS; c++) {
                var cell = board[r][c], color = "var(--card-soft)", text = "";
                if (cell.revealed) {
                    color = "var(--card)";
                    if (cell.mine) { text = "💥"; color = "var(--err)"; }
                    else { text = cell.count > 0 ? cell.count : ""; }
                } else if (cell.flagged) {
                    text = "🚩";
                }
                html += `<div onclick="window.msClick(${r},${c})" oncontextmenu="window.msFlag(event,${r},${c})" style="width:30px; height:30px; background:${color}; display:flex; align-items:center; justify-content:center; font-weight:bold; cursor:pointer; border-radius:4px;">${text}</div>`;
            }
        }
        html += `</div><div style="margin-top:15px;"><button class="btn" onclick="window.msRestart()">Заново</button></div></div>`;
        container.innerHTML = html;
    }

    function reveal(r, c) {
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
        var cell = board[r][c];
        if (cell.revealed || cell.flagged) return;
        cell.revealed = true; revealed++;
        if (cell.mine) { gameOver = true; return; }
        if (cell.count === 0) {
            for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) reveal(r+dr, c+dc);
        }
    }

    window.msClick = function(r, c) {
        if (gameOver || board[r][c].flagged) return;
        reveal(r, c);
        if (gameOver) { 
            for (var i=0;i<ROWS;i++) for(var j=0;j<COLS;j++) board[i][j].revealed = true;
            render(); setTimeout(()=>alert("💥 Вы подорвались! Игра окончена."), 100); 
            return; 
        }
        if (revealed === ROWS * COLS - MINES) {
            render(); setTimeout(()=>alert("🏆 Победа! Вы обезвредили все мины!"), 100);
            if (window.unlockAchievement) window.unlockAchievement('minesweeper_win');
            return;
        }
        render();
    };

    window.msFlag = function(e, r, c) {
        e.preventDefault();
        if (gameOver || board[r][c].revealed) return;
        board[r][c].flagged = !board[r][c].flagged;
        flags += board[r][c].flagged ? 1 : -1;
        render();
    };

    window.msRestart = function() { init(); render(); };
    init(); render();
}

// ================= 3. КРЕСТИКИ-НОЛИКИ =================
function startTicTacToe(container) {
    var board = Array(9).fill(null), turn = "X", gameOver = false;
    
    function render() {
        var html = `<div style="padding:20px; text-align:center; min-width:260px;">
            <div style="margin-bottom:15px; font-size:18px;">${gameOver ? 'Игра окончена' : 'Ход: ' + turn}</div>
            <div style="display:inline-grid; grid-template-columns:repeat(3, 80px); gap:5px; background:var(--border); padding:5px; border-radius:8px;">`;
        for (var i = 0; i < 9; i++) {
            html += `<div onclick="window.tttClick(${i})" style="width:80px; height:80px; background:var(--card-soft); display:flex; align-items:center; justify-content:center; font-size:40px; cursor:pointer; font-weight:bold; color:${board[i] === 'X' ? 'var(--accent)' : 'var(--gold)'};">${board[i] || ''}</div>`;
        }
        html += `</div><div style="margin-top:15px;"><button class="btn" onclick="window.tttRestart()">Заново</button></div></div>`;
        container.innerHTML = html;
    }

    function checkWin() {
        var lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for (var i = 0; i < lines.length; i++) {
            var [a,b,c] = lines[i];
            if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
        }
        return board.includes(null) ? null : "Tie";
    }

    window.tttClick = function(i) {
        if (gameOver || board[i] || turn !== "X") return;
        board[i] = "X"; turn = "O"; render();
        var win = checkWin();
        if (win) { gameOver = true; render(); setTimeout(()=>alert(win === "Tie" ? "Ничья!" : "Вы победили!"), 100); return; }
        
        // AI
        setTimeout(function() {
            var empty = []; for (var j = 0; j < 9; j++) if (!board[j]) empty.push(j);
            if (empty.length > 0) {
                board[empty[Math.floor(Math.random() * empty.length)]] = "O";
                turn = "X"; render();
                var win2 = checkWin();
                if (win2) { gameOver = true; render(); setTimeout(()=>alert(win2 === "Tie" ? "Ничья!" : "Робот победил!"), 100); }
            }
        }, 300);
    };

    window.tttRestart = function() { board = Array(9).fill(null); turn = "X"; gameOver = false; render(); };
    render();
}

// ================= 4. СУДОКУ (Упрощенное) =================
function startSudoku(container) {
    var puzzle = [
        [5,3,0,0,7,0,0,0,0], [6,0,0,1,9,5,0,0,0], [0,9,8,0,0,0,0,6,0],
        [8,0,0,0,6,0,0,0,3], [4,0,0,8,0,3,0,0,1], [7,0,0,0,2,0,0,0,6],
        [0,6,0,0,0,0,2,8,0], [0,0,0,4,1,9,0,0,5], [0,0,0,0,8,0,0,7,9]
    ];
    var current = JSON.parse(JSON.stringify(puzzle));

    function render() {
        var html = `<div style="padding:20px; text-align:center; min-width:340px;">
            <div style="margin-bottom:15px;">🔢 Судоку</div>
            <div style="display:inline-grid; grid-template-columns:repeat(9, 35px); gap:1px; background:var(--border); padding:2px; border-radius:4px;">`;
        for (var r = 0; r < 9; r++) {
            for (var c = 0; c < 9; c++) {
                var val = current[r][c] || "";
                var bg = puzzle[r][c] ? "var(--card)" : "var(--card-soft)";
                var style = `width:35px; height:35px; background:${bg}; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:16px; ${puzzle[r][c] ? 'color:var(--accent);' : 'color:var(--text);'}`;
                if (c % 3 === 2 && c !== 8) style += "margin-right:2px;";
                if (r % 3 === 2 && r !== 8) style += "margin-bottom:2px;";
                html += puzzle[r][c] ? `<div style="${style}">${val}</div>` : `<input type="text" maxlength="1" value="${val}" onchange="window.sdkChange(${r},${c},this.value)" style="${style} border:none; text-align:center; outline:none;">`;
            }
        }
        html += `</div></div>`;
        container.innerHTML = html;
    }

    window.sdkChange = function(r, c, v) {
        var num = parseInt(v);
        if (isNaN(num) || num < 1 || num > 9) { current[r][c] = 0; render(); return; }
        current[r][c] = num;
        render();
    };
    render();
}

// ================= 5. БЛЭКДЖЕК =================
function startBlackjack(container) {
    var deck = [], player = [], dealer = [], gameOver = false, msg = "";
    
    function newDeck() {
        var suits = ['♠','♥','♦','♣'], vals = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
        deck = [];
        for (var s of suits) for (var v of vals) deck.push({s, v});
        deck.sort(() => Math.random() - 0.5);
    }
    
    function calc(hand) {
        var sum = 0, aces = 0;
        for (var c of hand) {
            if (c.v === 'A') { aces++; sum += 11; }
            else if (['J','Q','K'].includes(c.v)) sum += 10;
            else sum += parseInt(c.v);
        }
        while (sum > 21 && aces > 0) { sum -= 10; aces--; }
        return sum;
    }

    function render() {
        var html = `<div style="padding:20px; text-align:center; min-width:280px;">
            <h3 style="margin-top:0;">🃏 Очко</h3>
            <div style="margin-bottom:10px;">Дилер: ${dealer.map(c => c.v+c.s).join(' ')} (${gameOver ? calc(dealer) : '?'})</div>
            <div style="margin-bottom:20px;">Вы: ${player.map(c => c.v+c.s).join(' ')} (${calc(player)})</div>
            <div style="font-size:18px; font-weight:bold; margin-bottom:15px; color:var(--accent);">${msg}</div>`;
        if (!gameOver) html += `<button class="btn" onclick="window.bjHit()">Взять</button> <button class="btn" style="background:var(--gold); color:#000;" onclick="window.bjStand()">Хватит</button>`;
        else html += `<button class="btn" onclick="window.bjRestart()">Заново</button>`;
        html += `</div>`;
        container.innerHTML = html;
    }

    window.bjHit = function() {
        player.push(deck.pop());
        if (calc(player) > 21) { gameOver = true; msg = "Перебор! Вы проиграли."; }
        render();
    };

    window.bjStand = function() {
        while (calc(dealer) < 17) dealer.push(deck.pop());
        var p = calc(player), d = calc(dealer);
        if (d > 21 || p > d) msg = "Вы победили!";
        else if (p < d) msg = "Дилер победил!";
        else msg = "Ничья!";
        gameOver = true; render();
    };

    window.bjRestart = function() {
        newDeck(); player = [deck.pop(), deck.pop()]; dealer = [deck.pop(), deck.pop()];
        gameOver = false; msg = ""; render();
    };
    window.bjRestart();
}

// ================= 6. ПАМЯТЬ (НАЙДИ ПАРУ) =================
function startMemory(container) {
    var emojis = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼'];
    var cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    var flipped = [], matched = 0, lock = false;

    function render() {
        var html = `<div style="padding:20px; text-align:center; min-width:320px;">
            <div style="margin-bottom:15px; font-size:18px;">🧠 Найди пару (Совпадений: ${matched}/8)</div>
            <div style="display:inline-grid; grid-template-columns:repeat(4, 70px); gap:10px;">`;
        cards.forEach((c, i) => {
            var isFlipped = flipped.includes(i) || c === 'done';
            html += `<div onclick="window.memClick(${i})" style="width:70px; height:70px; background:${isFlipped ? 'var(--card)' : 'var(--accent)'}; display:flex; align-items:center; justify-content:center; font-size:32px; cursor:pointer; border-radius:8px; transition:0.3s; transform:${isFlipped ? 'rotateY(0)' : 'rotateY(180deg)'};">${isFlipped ? (c === 'done' ? '✅' : c) : ''}</div>`;
        });
        html += `</div><div style="margin-top:15px;"><button class="btn" onclick="window.memRestart()">Заново</button></div></div>`;
        container.innerHTML = html;
    }

    window.memClick = function(i) {
        if (lock || flipped.includes(i) || cards[i] === 'done') return;
        flipped.push(i); render();
        if (flipped.length === 2) {
            lock = true;
            if (cards[flipped[0]] === cards[flipped[1]]) {
                cards[flipped[0]] = 'done'; cards[flipped[1]] = 'done';
                matched++; flipped = []; lock = false; render();
                if (matched === 8) { alert("🏆 Вы нашли все пары!"); }
            } else {
                setTimeout(() => { flipped = []; lock = false; render(); }, 800);
            }
        }
    };
    window.memRestart = function() { cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5); flipped = []; matched = 0; lock = false; render(); };
    render();
}

// ================= 7. КАЗИНО (СЛОТЫ) =================
function startCasino(container) {
    var symbols = ['🍒','🍋','🔔','⭐','💎'];
    var reels = ['❓','❓','❓'], msg = "Сделайте ставку!";
    
    function render() {
        var html = `<div style="padding:20px; text-align:center; min-width:280px;">
            <h3>🎰 Казино</h3>
            <div style="display:flex; justify-content:center; gap:15px; font-size:50px; margin:20px 0;">${reels.map(r => `<div style="width:80px; height:80px; background:var(--card-soft); display:flex; align-items:center; justify-content:center; border:2px solid var(--border); border-radius:10px;">${r}</div>`).join('')}</div>
            <div style="font-size:18px; font-weight:bold; margin-bottom:15px; color:var(--gold);">${msg}</div>
            <button class="btn" onclick="window.casSpin()">Крутить (10 XP)</button>
        </div>`;
        container.innerHTML = html;
    }

    window.casSpin = function() {
        if (window.state.xp < 10 && !window.state.staff) return alert("Недостаточно XP!");
        if (!window.state.staff) { window.state.xp -= 10; if(window.saveStudentData) window.saveStudentData(); if(window.renderUserChip) window.renderUserChip(); }
        
        reels = [0,0,0].map(() => symbols[Math.floor(Math.random() * symbols.length)]);
        render();
        
        if (reels[0] === reels[1] && reels[1] === reels[2]) {
            msg = "🎉 ДЖЕКПОТ! +100 XP";
            if (window.addXP) window.addXP(100);
            if (window.saveStudentData) window.saveStudentData();
            if (window.renderUserChip) window.renderUserChip();
        } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
            msg = "✨ Две одинаковые! +20 XP";
            if (window.addXP) window.addXP(20);
            if (window.saveStudentData) window.saveStudentData();
            if (window.renderUserChip) window.renderUserChip();
        } else {
            msg = "Повезет в следующий раз!";
        }
        setTimeout(render, 100);
    };
    render();
}

// ================= 8. РУЛЕТКА =================
function startRoulette(container) {
    var msg = "Выберите цвет или число";
    var spinResult = null;

    function render() {
        var html = `<div style="padding:20px; text-align:center; min-width:280px;">
            <h3>🎡 Рулетка</h3>
            <div style="font-size:60px; margin:20px 0; font-weight:bold; color:${spinResult === null ? 'var(--muted)' : (spinResult % 2 === 0 ? 'var(--err)' : '#000')}; background:${spinResult === null ? 'var(--card-soft)' : (spinResult === 0 ? 'var(--ok)' : (spinResult % 2 === 0 ? 'var(--err)' : '#333'))}; width:100px; height:100px; display:flex; align-items:center; justify-content:center; margin:0 auto; border-radius:50%; border:4px solid var(--border);">${spinResult !== null ? spinResult : '?'}</div>
            <div style="font-size:16px; font-weight:bold; margin-bottom:15px;">${msg}</div>
            <button class="btn" style="background:var(--err); color:#fff;" onclick="window.roulPlay('red', 2)">Красное (x2)</button>
            <button class="btn" style="background:#333; color:#fff;" onclick="window.roulPlay('black', 2)">Черное (x2)</button>
            <button class="btn" style="background:var(--ok); color:#000;" onclick="window.roulPlay('green', 35)">Зеро (x35)</button>
        </div>`;
        container.innerHTML = html;
    }

    window.roulPlay = function(color, mult) {
        var bet = 10;
        if (window.state.xp < bet && !window.state.staff) return alert("Недостаточно XP!");
        if (!window.state.staff) { window.state.xp -= bet; if(window.saveStudentData) window.saveStudentData(); if(window.renderUserChip) window.renderUserChip(); }
        
        spinResult = Math.floor(Math.random() * 37);
        var isRed = spinResult !== 0 && spinResult % 2 === 0;
        var isBlack = spinResult !== 0 && spinResult % 2 !== 0;
        var isGreen = spinResult === 0;
        
        if ((color === 'red' && isRed) || (color === 'black' && isBlack) || (color === 'green' && isGreen)) {
            msg = `Выигрыш! +${bet * mult} XP`;
            if (window.addXP) window.addXP(bet * mult);
        } else {
            msg = "Вы проиграли!";
        }
        render();
    };
    render();
}

// ================= 9. ВЕЧЕРИНКА (ВИКТОРИНА) =================
function startParty(container) {
    var questions = [
        { q: "Что такое G00?", a: ["Быстрый ход", "Линейная интерполяция", "Дуга", "Резьба"], c: 0 },
        { q: "Что означает ЧПУ?", a: ["Числовое программное управление", "Частная программа", "Чертеж", "Цикл"], c: 0 },
        { q: "Какой код задает подачу?", a: ["S", "F", "T", "M"], c: 1 }
    ];
    var idx = 0, lives = 3, score = 0, time = 15, tId = null;

    function render() {
        if (idx >= questions.length) {
            container.innerHTML = `<div style="padding:40px; text-align:center;"><h2>Вы выжили!</h2><p>Счет: ${score}</p><button class="btn" onclick="window.partyRestart()">Заново</button></div>`;
            return;
        }
        if (lives <= 0) {
            container.innerHTML = `<div style="padding:40px; text-align:center;"><h2 style="color:var(--err);">Вы погибли!</h2><p>Счет: ${score}</p><button class="btn" onclick="window.partyRestart()">Заново</button></div>`;
            return;
        }
        var q = questions[idx];
        var html = `<div style="padding:20px; text-align:center; min-width:280px;">
            <div style="display:flex; justify-content:space-between; font-size:18px; margin-bottom:15px;">
                <span>❤️ Жизни: ${lives}</span><span>⏱ Время: <span id="partyTimer" style="color:var(--err);">${time}</span></span>
            </div>
            <h3>${q.q}</h3>
            <div style="display:flex; flex-direction:column; gap:10px; margin-top:20px;">`;
        q.a.forEach((opt, i) => { html += `<button class="btn ghost" onclick="window.partyAns(${i})">${opt}</button>`; });
        html += `</div></div>`;
        container.innerHTML = html;
        
        clearInterval(tId);
        time = 15;
        tId = setInterval(function() {
            time--; var el = document.getElementById("partyTimer"); if (el) el.textContent = time;
            if (time <= 0) { clearInterval(tId); lives--; idx++; render(); }
        }, 1000);
    }

    window.partyAns = function(i) {
        clearInterval(tId);
        if (i === questions[idx].c) { score += 10; } else { lives--; }
        idx++; render();
    };
    window.partyRestart = function() { idx = 0; lives = 3; score = 0; render(); };
    render();
}

// ================= 10. ПАУК (Упрощенный солитёр) =================
function startSpider(container) {
    container.innerHTML = `<div style="padding:40px; text-align:center;"><h3>🕷️ Пасьянс Паук</h3><p style="color:var(--muted); margin-bottom:20px;">Упрощенная версия находится в разработке. Сыграйте в "Найди пару" или "Косынку"!</p><button class="btn" onclick="window.startGame('memory')">Перейти к памяти</button></div>`;
}

// ================= 11. АНИМАЦИИ (Звезды и Планеты) =================
function startStarfield(container) {
    container.innerHTML = `<canvas id="starfieldCanvas" style="width:100%; height:400px; background:#000; border-radius:8px; display:block;"></canvas>`;
    var canvas = document.getElementById("starfieldCanvas"), ctx = canvas.getContext("2d");
    canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight;
    class Star { constructor() { this.reset(); } reset() { this.x = Math.random()*canvas.width; this.y = Math.random()*canvas.height; this.size = Math.random()*2; this.speed = Math.random()*3+1; } update() { this.y += this.speed; if (this.y > canvas.height) this.reset(); } draw() { ctx.fillStyle="white"; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI*2); ctx.fill(); } }
    var stars = Array.from({ length: 200 }, () => new Star());
    function animate() { if (!document.getElementById("starfieldCanvas")) return; ctx.clearRect(0,0,canvas.width,canvas.height); stars.forEach(s=>{s.update();s.draw();}); requestAnimationFrame(animate); }
    animate();
}
function startSolarSystem(container) {
    container.innerHTML = `<canvas id="solarCanvas" style="width:100%; height:400px; background:#000; border-radius:8px; display:block;"></canvas>`;
    var canvas = document.getElementById("solarCanvas"), ctx = canvas.getContext("2d");
    canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight;
    var sun = { x: canvas.width/2, y: canvas.height/2, radius: 15 };
    var planets = [ { r: 3, dist: 40, speed: 0.04, angle: 0, color: '#a9a9a9' }, { r: 5, dist: 70, speed: 0.03, angle: 0, color: '#ffd700' }, { r: 6, dist: 100, speed: 0.02, angle: 0, color: '#0000ff' }, { r: 4, dist: 130, speed: 0.015, angle: 0, color: '#ffa500' } ];
    function draw() { if (!document.getElementById("solarCanvas")) return; ctx.clearRect(0,0,canvas.width,canvas.height); ctx.beginPath(); ctx.arc(sun.x, sun.y, sun.radius, 0, Math.PI*2); ctx.fillStyle='yellow'; ctx.fill(); planets.forEach(p=>{ p.angle+=p.speed; var x=sun.x+p.dist*Math.cos(p.angle), y=sun.y+p.dist*Math.sin(p.angle); ctx.beginPath(); ctx.arc(sun.x, sun.y, p.dist, 0, Math.PI*2); ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, p.r, 0, Math.PI*2); ctx.fillStyle=p.color; ctx.fill(); }); requestAnimationFrame(draw); }
    draw();
}