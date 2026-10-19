/* ============================================================
   МДК 07.01 — extra.js (v160.0)
   ============================================================ */
"use strict";

window.renderChatPage = function(){
  var app = document.getElementById("app"); app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Чат группы";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  if (!state.student) { app.appendChild(el('<div class="module">Войдите как студент.</div>')); return; }

  app.appendChild(el('<section class="module"><h2>Чат группы ' + escapeHtml(state.student.group) + '</h2><div id="chatLog" style="height:400px;overflow-y:auto;background:var(--card-soft);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:16px;">Загрузка...</div><form id="chatForm" style="display:flex;gap:10px;"><input type="text" id="chatInput" placeholder="Сообщение..." style="flex:1;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text)"><button type="submit" class="btn">Отправить</button></form></section>'));
  var log = document.getElementById("chatLog");
  
  function loadChat() {
    API.getChat(state.student.group).then(d => {
        log.innerHTML = "";
        if (d && d.ok && d.messages) { d.messages.forEach(m => { log.innerHTML += '<div style="margin-bottom:12px;background:var(--card);padding:8px 12px;border-radius:8px;"><b style="color:var(--accent)">' + escapeHtml(m.name) + '</b><br>' + escapeHtml(m.text) + '</div>'; }); log.scrollTop = log.scrollHeight; } 
        else log.innerHTML = "Нет сообщений";
    });
  }
  loadChat();
  document.getElementById("chatForm").onsubmit = function(e){
    e.preventDefault(); var t = document.getElementById("chatInput").value.trim(); if (!t) return; document.getElementById("chatInput").value = "";
    API.sendChat(state.student.group, studentKey(), state.student.name, t).then(loadChat);
  };
};

// ПОРТФОЛИО С PDF
window.renderPortfolioPage = function() {
    var app = document.getElementById("app"); app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Портфолио";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));

    if (!state.student) { app.appendChild(el('<div class="module">Войдите.</div>')); return; }

    var portfolioHtml = `
        <div id="portfolioPrint" class="module" style="padding:40px; background:#fff; color:#000;">
            <h1 style="text-align:center; color:#c14a2a;">ПОРТФОЛИО СТУДЕНТА</h1>
            <hr style="margin:20px 0; border:1px solid #ccc;">
            <p><b>ФИО:</b> ${escapeHtml(state.student.name)}</p>
            <p><b>Группа:</b> ${escapeHtml(state.student.group)}</p>
            <p><b>Уровень:</b> ${getLevel(state.xp)} (${getLevelTitle(getLevel(state.xp))})</p>
            <p><b>Всего опыта (XP):</b> ${state.xp}</p>
            
            <h3 style="margin-top:30px; color:#c14a2a;">Достижения:</h3>
            <ul>
                ${Object.keys(state.achievements || {}).slice(0, 20).map(id => `<li>${id}</li>`).join('')}
            </ul>
        </div>
        <div style="text-align:center; margin-top:20px;">
            <button class="btn" id="pdfBtn">📥 Скачать PDF</button>
        </div>
    `;
    app.appendChild(el(portfolioHtml));

    document.getElementById("pdfBtn").onclick = function() {
        var element = document.getElementById('portfolioPrint');
        var opt = { margin: 10, filename: 'portfolio_' + state.student.name + '.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
        window.showToast("Генерация PDF...", "info");
        html2pdf().set(opt).from(element).save().then(() => window.showToast("PDF готов!", "ok"));
    };
};

// 3D СТАНОК
window.render3DMachinePage = function() {
    var app = document.getElementById("app"); app.innerHTML = "";
    document.getElementById("crumbs").textContent = "3D Станок";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>🖥️ 3D Модель станка</h1><p>Вращайте мышкой для просмотра</p></section>'));

    var container = el('<div id="3dContainer" style="width:100%; height:500px; background:var(--card-soft); border-radius:16px; overflow:hidden; position:relative;"></div>');
    app.appendChild(container);

    setTimeout(() => {
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        var ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        scene.add(dirLight);

        var machineGroup = new THREE.Group();
        var bedGeo = new THREE.BoxGeometry(10, 1, 3);
        var bedMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
        var bed = new THREE.Mesh(bedGeo, bedMat); bed.position.set(0, -1, 0); machineGroup.add(bed);

        var headGeo = new THREE.BoxGeometry(2, 3, 3);
        var head = new THREE.Mesh(headGeo, bedMat); head.position.set(-4, 0.5, 0); machineGroup.add(head);

        var chuckGeo = new THREE.CylinderGeometry(1, 1, 1, 16);
        var chuckMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        var chuck = new THREE.Mesh(chuckGeo, chuckMat); chuck.rotation.z = Math.PI / 2; chuck.position.set(-2.5, 0.5, 0); machineGroup.add(chuck);

        var tailGeo = new THREE.BoxGeometry(1.5, 2, 2);
        var tail = new THREE.Mesh(tailGeo, bedMat); tail.position.set(4, 0, 0); machineGroup.add(tail);

        var toolGeo = new THREE.BoxGeometry(1, 1.5, 1);
        var toolMat = new THREE.MeshStandardMaterial({ color: 0xc14a2a });
        var tool = new THREE.Mesh(toolGeo, toolMat); tool.position.set(0, 0.5, 1); machineGroup.add(tool);

        scene.add(machineGroup);
        camera.position.set(8, 8, 12);
        camera.lookAt(0, 0, 0);

        function animate() {
            requestAnimationFrame(animate);
            machineGroup.rotation.y += 0.005;
            renderer.render(scene, camera);
        }
        animate();
    }, 100);
};

// СМЕРТЕЛЬНАЯ ВЕЧЕРИНКА (30 ВОПРОСОВ)
window.renderDeadlyPartyPage = function(){
  var app = document.getElementById("app"); app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Смертельная вечеринка";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));

  var allQuestions = [
    // === ЧПУ ===
    { q: "Что означает G00?", options: ["Быстрое позиционирование", "Линейная интерполяция", "Пауза", "Резьба"], correct: 0 },
    { q: "Что означает M03?", options: ["Стоп шпинделя", "Шпиндель по часовой", "Смена инструмента", "Конец"], correct: 1 },
    { q: "Угол профиля метрической резьбы", options: ["55°", "60°", "30°", "33°"], correct: 1 },
    { q: "Какой код отменяет постоянный цикл?", options: ["G80", "G00", "G90", "M30"], correct: 0 },
    { q: "Что такое ЧПУ?", options: ["Числовое программное управление", "Частное производственное устройство", "Часто повторяющийся узел", "Черновая правка углов"], correct: 0 },
    { q: "Какой код задает круговую интерполяцию по часовой стрелке?", options: ["G01", "G02", "G03", "G04"], correct: 1 },
    { q: "Что означает M05?", options: ["Включить шпиндель", "Остановить шпиндель", "Включить СОЖ", "Пауза"], correct: 1 },
    { q: "Как расшифровывается CAD?", options: ["Computer-Aided Design", "Computer-Aided Drafting", "Control Automatic Design", "Central Automated Device"], correct: 0 },
    { q: "Угол профиля трапецеидальной резьбы", options: ["60°", "55°", "30°", "40°"], correct: 2 },
    { q: "Какой инструмент используется для чистовой обработки отверстий?", options: ["Сверло", "Зенкер", "Развертка", "Метчик"], correct: 2 },
    { q: "Что означает строка G21 G40 G54?", options: ["Дюймы, коррекция, СК", "Метры, без коррекции, СК", "Миллиметры, отмена коррекции, рабочая СК", "Градусы, цикл, СК"], correct: 2 },
    { q: "Какая ось на токарном станке направлена вдоль шпинделя?", options: ["X", "Y", "Z", "W"], correct: 2 },
    { q: "Сколько степеней свободы у 5D обработки?", options: ["3", "4", "5", "6"], correct: 2 },
    { q: "Какой код вызывает подпрограмму?", options: ["M98", "M99", "M30", "G80"], correct: 0 },
    { q: "Какой код задает паузу?", options: ["G01", "G02", "G03", "G04"], correct: 3 },

    // === ANIME ===
    { q: "Как зовут главного героя аниме «Наруто»?", options: ["Саске", "Наруто", "Какаши", "Итачи"], correct: 1 },
    { q: "Какая техника является визитной карточкой Наруто?", options: ["Расенган", "Чидори", "Огненный шар", "Теневой клон"], correct: 0 },
    { q: "В аниме «Атака Титанов» кто съел мать Эрена?", options: ["Титан-Колосс", "Титан-Броня", "Улыбающийся Титан", "Титан-Женщина"], correct: 2 },
    { q: "Какой цвет волос у Гоку в форме Супер Сайяна Бога (SSG)?", options: ["Золотой", "Синий", "Красный", "Серебряный"], correct: 2 },
    { q: "Какое дыхание использует Танджиро в «Клинке, рассекающем демонов»?", options: ["Воды", "Грома", "Солнца", "Пламени"], correct: 0 },

    // === HOYOVERSE ===
    { q: "Какой элемент у Архонта Пиро в Genshin Impact?", options: ["Пиро", "Гидро", "Электро", "Крио"], correct: 0 },
    { q: "Как называется игра от HoYoverse про космические путешествия на поезде?", options: ["Genshin Impact", "Honkai Impact 3rd", "Honkai: Star Rail", "Zenless Zone Zero"], correct: 2 },
    { q: "Кто является Гео Архонтом в Genshin Impact?", options: ["Венти", "Чжун Ли", "Райден", "Нахида"], correct: 1 },
    { q: "Как зовут главного героя (Стелларон) в Honkai: Star Rail?", options: ["Трейлблейзер", "Путешественник", "Капитан", "Мастер"], correct: 0 },
    { q: "Какая стихия у Инь Синь (Yinlin) в Wuthering Waves?", options: ["Хаос", "Электро", "Спектро", "Аэро"], correct: 1 },

    // === GAMES/IT ===
    { q: "В Atomic Heart кто является главным антагонистом (в финале)?", options: ["Нейросеть КОЛЛЕКТИВ", "Сеченов", "Петров", "Менделеев"], correct: 0 },
    { q: "Какой робот-близнец сопровождает майора Нечаева в Atomic Heart?", options: ["Чарльз", "Нора", "Близняшки", "Баба Яга"], correct: 2 },
    { q: "В какой игре есть персонаж по имени Кратос?", options: ["Dark Souls", "God of War", "Devil May Cry", "Bloodborne"], correct: 1 },
    { q: "Как называется главный герой Cyberpunk 2077?", options: ["Джеки", "V", "Джонни", "Адам"], correct: 1 },
    { q: "Что означает аббревиатура RPG?", options: ["Role-Playing Game", "Real-Playing Game", "Rocket-Propelled Grenade", "Rapid Program Generation"], correct: 0 }
  ];

  var questions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 5);
  var currentQ = 0, lives = 3;

  function renderQ(){
    app.innerHTML = "";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    app.appendChild(el('<section class="module" style="background:#1a0a0a;border:2px solid #ff003c;color:#fff; padding:20px;"><div style="display:flex;justify-content:space-between;margin-bottom:16px;font-size:14px;"><span>Вопрос ' + (currentQ + 1) + ' / ' + questions.length + '</span><span>❤️ '.repeat(lives) + '🤍 '.repeat(3 - lives) + '</span></div><h2 style="margin:0 0 20px 0;color:#ff003c; font-size:20px; line-height:1.4;">' + escapeHtml(questions[currentQ].q) + '</h2><div id="qOptions"></div></section>'));
    var qo = document.getElementById("qOptions");
    questions[currentQ].options.forEach(function(opt, idx){
      var b = el('<button class="btn" style="width:100%;margin-bottom:8px;text-align:left;background:#2a0a0a;border:1px solid #ff003c;color:#fff;font-size:14px; padding:12px;">' + escapeHtml(opt) + '</button>');
      b.onclick = function(){
        if (idx === questions[currentQ].correct) {
          currentQ++;
          if (currentQ >= questions.length) {
            app.innerHTML = ""; app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
            app.appendChild(el('<section class="module" style="text-align:center;background:#0a1a0a;border:2px solid #00ff00;color:#fff;padding:50px;"><h1 style="color:#00ff00;">Вы выжили!</h1><button class="btn" style="margin-top:20px;" onclick="if(window.addXP) window.addXP(100);location.hash=\'#/\'">+100 XP и на главную</button></section>'));
          } else renderQ();
        } else {
          lives--;
          if (lives <= 0) {
            app.innerHTML = ""; app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
            app.appendChild(el('<section class="module" style="text-align:center;background:#1a0000;border:2px solid #ff003c;color:#fff;padding:50px;"><h1 style="color:#ff003c;">Проигрыш</h1><button class="btn" style="margin-top:20px;" onclick="window.renderDeadlyPartyPage()">Заново</button></section>'));
          } else {
             window.showToast("❌ Неверно! Осталось жизней: " + lives, "err");
          }
        }
      };
      qo.appendChild(b);
    });
  }
  renderQ();
};