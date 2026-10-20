"use strict";

window.renderArcadePage = function() {
    var app = document.getElementById("app"); 
    if (!app) return; 
    app.innerHTML = "";
    
    document.getElementById("crumbs").textContent = "Игровая комната";
    
    app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
    app.appendChild(el('<section class="hero"><h1>🎮 Игровая комната</h1><p>Проверь свои знания ЧПУ и получи бонусные XP!</p></section>'));

    var gameBox = el(`<div class="module" style="text-align:center; padding: 40px 20px;">
        <h2 id="gameQuestion" style="margin-bottom: 30px; font-size: 24px;">Загрузка...</h2>
        <div id="gameOptions" style="display:flex; flex-direction:column; gap:10px; max-width:400px; margin:0 auto;"></div>
        <div id="gameResult" style="margin-top:20px; font-weight:bold; font-size:18px; min-height:30px;"></div>
    </div>`);
    app.appendChild(gameBox);

    // База вопросов для игры
    var questions = [
        { q: "Какая команда задаёт ускоренное перемещение (холостой ход)?", a: "G00", opts: ["G00", "G01", "G02", "G03"] },
        { q: "Какая команда отвечает за линейную интерполяцию (рабочую подачу)?", a: "G01", opts: ["G00", "G01", "G04", "G28"] },
        { q: "Какой код включает шпиндель по часовой стрелке?", a: "M03", opts: ["M03", "M04", "M05", "M08"] },
        { q: "Что означает команда G90?", a: "Абсолютная система координат", opts: ["Относительная система координат", "Абсолютная система координат", "Круговая интерполяция", "Возврат в ноль"] },
        { q: "Какой адрес используется для задания скорости подачи?", a: "F", opts: ["S", "T", "F", "N"] },
        { q: "Что делает команда M30?", a: "Конец программы", opts: ["Пауза", "Смена инструмента", "Конец программы", "Включение СОЖ"] }
    ];

    var currentQ = null;
    var score = 0;
    var totalQuestions = 5;
    var currentIdx = 0;
    var usedIndices = [];

    function startGame() {
        score = 0;
        currentIdx = 0;
        usedIndices = [];
        document.getElementById("gameResult").innerHTML = "";
        nextQuestion();
    }

    function nextQuestion() {
        if (currentIdx >= totalQuestions) {
            finishGame();
            return;
        }

        // Выбираем случайный вопрос
        var idx = Math.floor(Math.random() * questions.length);
        while(usedIndices.includes(idx)) {
            idx = Math.floor(Math.random() * questions.length);
        }
        usedIndices.push(idx);
        currentQ = questions[idx];

        document.getElementById("gameQuestion").textContent = (currentIdx + 1) + "/" + totalQuestions + ". " + currentQ.q;
        var optsBox = document.getElementById("gameOptions");
        optsBox.innerHTML = "";

        // Перемешиваем варианты
        var shuffledOpts = [...currentQ.opts].sort(() => Math.random() - 0.5);

        shuffledOpts.forEach(opt => {
            var btn = document.createElement("button");
            btn.className = "btn ghost";
            btn.style.padding = "12px";
            btn.style.fontSize = "16px";
            btn.textContent = opt;
            btn.onclick = function() { checkAnswer(opt, btn); };
            optsBox.appendChild(btn);
        });
    }

    function checkAnswer(answer, btnElement) {
        var optsBox = document.getElementById("gameOptions");
        Array.from(optsBox.children).forEach(b => b.disabled = true); // Блокируем кнопки

        var resDiv = document.getElementById("gameResult");

        if (answer === currentQ.a) {
            btnElement.style.background = "var(--ok)";
            btnElement.style.color = "#fff";
            btnElement.style.borderColor = "var(--ok)";
            resDiv.innerHTML = "✅ Верно! +10 XP";
            resDiv.style.color = "var(--ok)";
            score++;
            if (window.addXP) window.addXP(10); // Начисляем XP через app.js
        } else {
            btnElement.style.background = "var(--err)";
            btnElement.style.color = "#fff";
            btnElement.style.borderColor = "var(--err)";
            resDiv.innerHTML = "❌ Ошибка. Правильно: " + currentQ.a;
            resDiv.style.color = "var(--err)";
            
            // Подсвечиваем правильный
            Array.from(optsBox.children).forEach(b => {
                if (b.textContent === currentQ.a) {
                    b.style.borderColor = "var(--ok)";
                    b.style.color = "var(--ok)";
                }
            });
        }

        currentIdx++;
        setTimeout(nextQuestion, 1500);
    }

    function finishGame() {
        document.getElementById("gameQuestion").textContent = "🏁 Игра завершена!";
        document.getElementById("gameOptions").innerHTML = "";
        var resDiv = document.getElementById("gameResult");
        resDiv.innerHTML = `Ваш результат: <b>${score} из ${totalQuestions}</b>.<br>Вы заработали ${score * 10} XP!`;
        resDiv.style.color = "var(--accent)";

        var playAgainBtn = document.createElement("button");
        playAgainBtn.className = "btn";
        playAgainBtn.style.marginTop = "20px";
        playAgainBtn.textContent = "Играть снова";
        playAgainBtn.onclick = startGame;
        document.getElementById("gameOptions").appendChild(playAgainBtn);
        
        if (window.checkAchievements) window.checkAchievements();
    }

    // Запуск игры
    startGame();
};