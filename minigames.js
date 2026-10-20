"use strict";

window.renderArcadePage = function() {
    var app = document.getElementById("app"); 
    if (!app) return; 
    app.innerHTML = "";
    
    document.getElementById("crumbs").textContent = "Игровая комната";
    
    app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
    app.appendChild(el('<section class="hero"><h1>🎮 Игровая комната</h1><p>Проверь свои знания ЧПУ и получи бонусные XP!</p></section>'));

    var gamesMenu = el(`<div class="module" style="text-align:center; padding: 20px;">
        <h2 style="margin-bottom: 20px;">Выберите игру:</h2>
        <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
            <button class="btn" onclick="window.startGCodeGame()" style="flex:1; min-width:200px; padding:20px;">📝 Угадай G-код</button>
            <button class="btn" onclick="window.startCoordGame()" style="flex:1; min-width:200px; padding:20px; background:var(--ok); color:#000;">🎯 Поиск координат</button>
            <button class="btn" onclick="window.startMatchGame()" style="flex:1; min-width:200px; padding:20px; background:var(--gold); color:#000;">🧩 Сопоставь команды</button>
        </div>
    </div>`);
    app.appendChild(gamesMenu);

    var gameContainer = el('<div id="gameContainer" class="module" style="display:none; margin-top:20px; padding:30px;"></div>');
    app.appendChild(gameContainer);
};

// ==========================================
// ИГРА 1: Угадай G-код (Квиз)
// ==========================================
window.startGCodeGame = function() {
    var container = document.getElementById("gameContainer");
    container.style.display = "block";
    document.getElementById("gameContainer").scrollIntoView({behavior: "smooth"});
    
    var questions = [
        { q: "Ускоренное перемещение (холостой ход)", a: "G00", opts: ["G00", "G01", "G02", "G03"] },
        { q: "Линейная интерполяция (рабочая подача)", a: "G01", opts: ["G00", "G01", "G04", "G28"] },
        { q: "Включение шпинделя по часовой стрелке", a: "M03", opts: ["M03", "M04", "M05", "M08"] },
        { q: "Абсолютная система координат", a: "G90", opts: ["G90", "G91", "G54", "G53"] },
        { q: "Смена инструмента", a: "M06", opts: ["M03", "M05", "M06", "M30"] },
        { q: "Круговая интерполяция по часовой стрелке", a: "G02", opts: ["G01", "G02", "G03", "G04"] },
        { q: "Конец программы", a: "M30", opts: ["M00", "M02", "M30", "M99"] }
    ];

    var score = 0;
    var idx = 0;

    function render() {
        if (idx >= questions.length) {
            container.innerHTML = `<div style="text-align:center;">
                <h2>🏁 Игра завершена!</h2>
                <p>Результат: <b>${score} из ${questions.length}</b></p>
                <p style="color:var(--accent);">Заработано XP: ${score * 10}</p>
                <button class="btn" onclick="window.startGCodeGame()" style="margin-top:20px;">Играть снова</button>
            </div>`;
            return;
        }

        var q = questions[idx];
        var optsHtml = [...q.opts].sort(() => Math.random() - 0.5).map(opt => 
            `<button class="btn ghost" style="width:100%; margin-bottom:10px; padding:12px;" onclick="window.checkGC(${opt === q.a}, '${opt}', '${q.a}')">${opt}</button>`
        ).join("");

        container.innerHTML = `<div style="text-align:center;">
            <h3>Вопрос ${idx + 1} из ${questions.length}</h3>
            <p style="font-size:18px; margin:20px 0;">Что означает: <b>${q.q}</b>?</p>
            <div style="max-width:400px; margin:0 auto;">${optsHtml}</div>
            <div id="gFeedback" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>
        </div>`;
    }

    window.checkGC = function(isCorrect, selected, correct) {
        var fb = document.getElementById("gFeedback");
        var btns = document.querySelectorAll("#gameContainer .btn");
        
        btns.forEach(b => { b.disabled = true; b.style.opacity = 0.5; });
        
        if (isCorrect) {
            score++;
            fb.textContent = "✅ Верно!";
            fb.style.color = "var(--ok)";
            if (window.addXP) window.addXP(10);
        } else {
            fb.textContent = `❌ Ошибка. Правильно: ${correct}`;
            fb.style.color = "var(--err)";
        }
        
        setTimeout(() => { idx++; render(); }, 1500);
    };

    render();
};

// ==========================================
// ИГРА 2: Поиск координат (Клик по сетке)
// ==========================================
window.startCoordGame = function() {
    var container = document.getElementById("gameContainer");
    container.style.display = "block";
    document.getElementById("gameContainer").scrollIntoView({behavior: "smooth"});

    var targetX = Math.floor(Math.random() * 8) + 1;
    var targetY = Math.floor(Math.random() * 8) + 1;
    var attempts = 0;

    function render() {
        var gridHtml = "";
        for (var y = 8; y >= 1; y--) {
            for (var x = 1; x <= 8; x++) {
                gridHtml += `<div onclick="window.checkCoord(${x}, ${y}, ${targetX}, ${targetY})" style="width:40px; height:40px; border:1px solid var(--border); display:inline-flex; align-items:center; justify-content:center; cursor:pointer; background:var(--card-soft); transition:0.1s;">${x},${y}</div>`;
            }
            gridHtml += "<br>";
        }

        container.innerHTML = `<div style="text-align:center;">
            <h3>🎯 Найди координату!</h3>
            <p>Найдите точку <b>X${targetX} Y${targetY}</b> на сетке.</p>
            <div style="margin: 20px auto; display:inline-block; background:var(--bg); padding:10px; border-radius:8px;">
                <div style="display:flex;">
                    <div style="width:40px;"></div>
                    ${[1,2,3,4,5,6,7,8].map(n => `<div style="width:40px; text-align:center; font-weight:bold; color:var(--accent);">${n}</div>`).join("")}
                </div>
                <div style="display:flex;">
                    <div style="width:40px; display:flex; flex-direction:column; justify-content:space-between; font-weight:bold; color:var(--accent);">
                        ${[8,7,6,5,4,3,2,1].map(n => `<div style="height:40px; line-height:40px; text-align:center;">${n}</div>`).join("")}
                    </div>
                    <div style="display:grid; grid-template-columns: repeat(8, 40px); grid-template-rows: repeat(8, 40px);">
                        ${gridHtml.replace(/<br>/g, "")}
                    </div>
                </div>
            </div>
            <div id="cFeedback" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>
        </div>`;
    }

    window.checkCoord = function(x, y, tx, ty) {
        attempts++;
        var fb = document.getElementById("cFeedback");
        
        if (x === tx && y === ty) {
            fb.textContent = `✅ Верно! Найдено за ${attempts} попыток. +20 XP`;
            fb.style.color = "var(--ok)";
            if (window.addXP) window.addXP(20);
            setTimeout(() => { 
                container.innerHTML = `<div style="text-align:center; padding:20px;">
                    <h2>🏆 Отлично!</h2>
                    <p>Вы нашли точку за ${attempts} попыток.</p>
                    <button class="btn" onclick="window.startCoordGame()">Ещё раз</button>
                </div>`;
            }, 2000);
        } else {
            fb.textContent = `❌ Неверно (выбрано X${x} Y${y}). Попыток: ${attempts}`;
            fb.style.color = "var(--err)";
        }
    };

    render();
};

// ==========================================
// ИГРА 3: Сопоставь команды (M-коды)
// ==========================================
window.startMatchGame = function() {
    var container = document.getElementById("gameContainer");
    container.style.display = "block";
    document.getElementById("gameContainer").scrollIntoView({behavior: "smooth"});

    var pool = [
        { code: "M03", desc: "Шпиндель по часовой" },
        { code: "M04", desc: "Шпиндель против часовой" },
        { code: "M05", desc: "Останов шпинделя" },
        { code: "M08", desc: "Включить СОЖ" },
        { code: "M09", desc: "Выключить СОЖ" },
        { code: "M30", desc: "Конец программы" }
    ];

    var currentCode = pool[Math.floor(Math.random() * pool.length)];
    var options = [currentCode.desc];
    while(options.length < 4) {
        var randomDesc = pool[Math.floor(Math.random() * pool.length)].desc;
        if (!options.includes(randomDesc)) options.push(randomDesc);
    }
    options.sort(() => Math.random() - 0.5);

    var optsHtml = options.map(o => 
        `<button class="btn ghost" style="width:100%; margin-bottom:10px; padding:12px;" onclick="window.checkMatch('${o}', '${currentCode.desc}')">${o}</button>`
    ).join("");

    container.innerHTML = `<div style="text-align:center;">
        <h3>🧩 Выберите правильное описание</h3>
        <p style="font-size:36px; font-weight:bold; color:var(--accent); margin:20px 0;">${currentCode.code}</p>
        <div style="max-width:400px; margin:0 auto;">${optsHtml}</div>
        <div id="mFeedback" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>
    </div>`;

    window.checkMatch = function(selected, correct) {
        var fb = document.getElementById("mFeedback");
        var btns = document.querySelectorAll("#gameContainer .btn");
        btns.forEach(b => { b.disabled = true; b.style.opacity = 0.5; });

        if (selected === correct) {
            fb.textContent = "✅ Верно! +15 XP";
            fb.style.color = "var(--ok)";
            if (window.addXP) window.addXP(15);
        } else {
            fb.textContent = `❌ Ошибка. ${currentCode.code} — это ${correct}`;
            fb.style.color = "var(--err)";
        }
        setTimeout(() => { window.startMatchGame(); }, 2000);
    };
};