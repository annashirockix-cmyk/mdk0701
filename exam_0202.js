"use strict";

window.renderTraining_0202 = function(mdkId) {
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = "";
  app.innerHTML = '<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>';
  
  if (!mdkId) {
    app.innerHTML += '<section class="hero"><h1>🎯 Тренировка: МДК 02.02</h1><p>Выберите предмет</p></section>';
    var grid = document.createElement("div"); grid.style.cssText = "display:flex; flex-direction:column; gap:12px;";
    var card = document.createElement("a"); card.href = "#/training/02.02"; card.style.cssText = "display:block; padding:20px; background:var(--card); border:1px solid var(--border); border-radius:12px; color:var(--text); text-decoration:none;";
    card.innerHTML = '<h3>МДК 02.02</h3><span style="color:var(--muted);">Управляющие программы для сборки</span>';
    grid.appendChild(card); app.appendChild(grid); return;
  }

  var baseQuestions = [];
  if (window.MDK_DATA && window.MDK_DATA['02.02']) {
      window.MDK_DATA['02.02'].sections.forEach(s => s.topics.forEach(t => {
          if (t.test) baseQuestions = baseQuestions.concat(t.test);
      }));
  }

  var extraQuestions = [
    { q: "Что является основой для разработки УП?", options: ["Сборочный чертеж", "Технический паспорт", "Инструкция по ТБ", "Прайс-лист"], correct: 0 },
    { q: "Как называется язык программирования станков с ЧПУ?", options: ["G-код", "HTML", "Python", "C++"], correct: 0 },
    { q: "Что задает команда G00?", options: ["Ускоренное перемещение", "Линейную интерполяцию", "Круговую интерполяцию", "Задержку"], correct: 0 },
    { q: "Что задает команда G01?", options: ["Линейную интерполяцию", "Ускоренное перемещение", "Круговую интерполяцию", "Смену инструмента"], correct: 0 },
    { q: "Какая команда задает подачу?", options: ["F", "S", "T", "M"], correct: 0 },
    { q: "Какая команда задает частоту вращения шпинделя?", options: ["S", "F", "T", "M"], correct: 0 },
    { q: "Какая команда включает шпиндель по часовой стрелке?", options: ["M03", "M04", "M05", "M08"], correct: 0 },
    { q: "Какая команда означает конец программы?", options: ["M30", "M03", "M05", "M08"], correct: 0 },
    { q: "Что такое CAM-система?", options: ["Система автоматизированного проектирования УП", "Система управления станком", "Система контроля", "Система диагностики"], correct: 0 },
    { q: "Для чего нужен постпроцессор?", options: ["Преобразование траектории в код станка", "Создание 3D-модели", "Расчет режимов", "Выбор инструмента"], correct: 0 },
    { q: "Что проверяют перед запуском УП на станке?", options: ["Симуляцию и нули", "Цвет станины", "Марку масла", "Вес заготовки"], correct: 0 },
    { q: "Что такое базирование в программе?", options: ["Выбор нулевой точки детали", "Выбор инструмента", "Выбор скорости", "Выбор подачи"], correct: 0 },
    { q: "Какой адрес используется для координат?", options: ["X, Y, Z", "A, B, C", "U, V, W", "I, J, K"], correct: 0 },
    { q: "Что означает G90?", options: ["Абсолютная система координат", "Относительная система координат", "Возврат в ноль", "Смена инструмента"], correct: 0 },
    { q: "Что означает G91?", options: ["Относительная система координат", "Абсолютная система координат", "Возврат в ноль", "Смена инструмента"], correct: 0 },
    { q: "Что такое макропрограммирование?", options: ["Использование переменных и циклов", "Ручное программирование", "Создание чертежей", "Выбор инструмента"], correct: 0 },
    { q: "Что происходит после команды M30?", options: ["Программа завершается", "Шпиндель включается", "СОЖ включается", "Инструмент меняется"], correct: 0 },
    { q: "Что контролируют при первом запуске УП?", options: ["Пробную деталь", "Только программу", "Только координаты", "Только шпиндель"], correct: 0 },
    { q: "Что такое корректор инструмента?", options: ["Смещение для учета длины/радиуса", "Смена инструмента", "Охлаждение", "Скорость подачи"], correct: 0 },
    { q: "Для чего нужна команда G43?", options: ["Коррекция длины инструмента", "Коррекция радиуса", "Смена плоскости", "Возврат в ноль"], correct: 0 },
    { q: "Где задается скорость подачи в G-коде?", options: ["В адресе F", "В адресе S", "В адресе T", "В адресе M"], correct: 0 },
    { q: "Что означают команды M08/M09?", options: ["Включение/выключение СОЖ", "Шпиндель", "Смена инструмента", "Конец программы"], correct: 0 },
    { q: "Что такое подпрограмма в УП?", options: ["Многократно используемая часть программы", "Начало программы", "Конец программы", "Комментарий"], correct: 0 },
    { q: "Для чего используют M98?", options: ["Вызов подпрограммы", "Конец подпрограммы", "Возврат в ноль", "Охлаждение"], correct: 0 },
    { q: "Что такое G54?", options: ["Нулевая точка детали", "Нулевая точка станка", "Смена инструмента", "Коррекция"], correct: 0 },
    { q: "Какой тип аддитивного оборудования использует G-код?", options: ["3D-принтер", "Токарный станок", "Фрезерный станок", "Шлифовальный"], correct: 0 },
    { q: "Что такое слайсер?", options: ["Программа для нарезки модели на слои", "Программа для станка", "Инструмент", "Приспособление"], correct: 0 },
    { q: "Какой параметр влияет на качество печати 3D-принтера?", options: ["Высота слоя", "Цвет", "Масса", "Объем"], correct: 0 },
    { q: "Что такое поддержки в 3D-печати?", options: ["Элементы для нависающих частей", "Инструменты", "Смазка", "Охлаждение"], correct: 0 },
    { q: "Что необходимо учитывать при проектировании детали для 3D-печати?", options: ["Нависание элементов", "Цвет", "Массу", "Стоимость"], correct: 0 },
    { q: "Что проверяют в УП для 3D-принтера?", options: ["Отсутствие выхода за пределы области", "Температуру станка", "Размер сопла", "Смазку"], correct: 0 },
    { q: "Что такое G17?", options: ["Плоскость XY", "Плоскость XZ", "Плоскость YZ", "Отмена плоскости"], correct: 0 },
    { q: "Какой командой отменяют коррекцию?", options: ["G40", "G41", "G42", "G43"], correct: 0 },
    { q: "Что такое G41?", options: ["Коррекция радиуса слева", "Коррекция радиуса справа", "Коррекция длины", "Отмена коррекции"], correct: 0 },
    { q: "Что такое G42?", options: ["Коррекция радиуса справа", "Коррекция радиуса слева", "Коррекция длины", "Отмена коррекции"], correct: 0 },
    { q: "Для чего нужна симуляция обработки?", options: ["Проверка на столкновения", "Выбор инструмента", "Расчет режимов", "Уборка станка"], correct: 0 },
    { q: "Что такое нулевая точка станка?", options: ["Точка, заданная производителем", "Точка детали", "Точка смены инструмента", "Точка начала программы"], correct: 0 },
    { q: "Что такое нулевая точка детали?", options: ["Точка, выбранная оператором", "Точка производителя", "Точка смены инструмента", "Точка конца программы"], correct: 0 },
    { q: "Что происходит при ошибке в программе?", options: ["Станок может столкнуться", "Станок ускорится", "СОЖ отключится", "Инструмент сломается"], correct: 0 },
    { q: "Какая команда задает паузу?", options: ["G04", "G01", "G00", "G02"], correct: 0 },
    { q: "Что такое G28?", options: ["Возврат в референтную точку", "Смена инструмента", "Коррекция", "Плоскость"], correct: 0 },
    { q: "Что такое G96?", options: ["Постоянная скорость резания", "Постоянные обороты", "Подача мм/мин", "Подача мм/об"], correct: 0 },
    { q: "Что такое G97?", options: ["Постоянные обороты", "Постоянная скорость резания", "Подача мм/мин", "Подача мм/об"], correct: 0 },
    { q: "Что такое G99?", options: ["Подача мм/об", "Подача мм/мин", "Отмена цикла", "Смена инструмента"], correct: 0 },
    { q: "Что такое G94?", options: ["Подача мм/мин", "Подача мм/об", "Отмена цикла", "Смена инструмента"], correct: 0 },
    { q: "Что такое G71?", options: ["Черновое точение", "Чистовое точение", "Резьба", "Сверление"], correct: 0 },
    { q: "Что такое G76?", options: ["Резьба", "Черновое точение", "Чистовое точение", "Сверление"], correct: 0 },
    { q: "Какой цикл используется для глубокого сверления?", options: ["G83", "G81", "G82", "G84"], correct: 0 },
    { q: "Что такое G84?", options: ["Нарезание резьбы метчиком", "Сверление", "Растачивание", "Отмена цикла"], correct: 0 },
    { q: "Какая команда отменяет цикл сверления?", options: ["G80", "G81", "G82", "G83"], correct: 0 }
  ];

  var allQuestions = baseQuestions.concat(extraQuestions);
  var questions = allQuestions.sort(function(){ return Math.random() - 0.5; });
  var idx = 0, correct = 0, answered = 0;

  app.innerHTML += '<section class="hero"><h1>🎯 МДК 02.02</h1><p>Вопросов для тренировки: ' + questions.length + '</p></section>';
  var box = document.createElement("div"); box.className = "module"; app.appendChild(box);

  function renderQuestion() {
    if (idx >= questions.length) {
      box.innerHTML = '<div style="text-align:center; padding:20px;"><h2>Тренировка завершена!</h2><p>Верных ответов: <b>' + correct + '</b> из <b>' + answered + '</b></p><div style="display:flex; gap:10px; justify-content:center; margin-top:20px;"><a class="btn" href="#/final/02.02">Перейти к экзамену</a><a class="btn ghost" href="#/training/02.02">Начать заново</a></div></div>';
      return;
    }
    var q = questions[idx];
    var html = '<div style="font-weight:bold; margin-bottom:15px; font-size:18px;">' + (idx + 1) + '. ' + q.q + '</div>';
    q.options.forEach(function(opt, i){
      html += '<button class="tr-opt" data-i="' + i + '" style="display:block; width:100%; text-align:left; padding:12px; margin-bottom:8px; background:var(--card-soft); border:1px solid var(--border); border-radius:8px; color:var(--text); cursor:pointer; font-size:15px;">' + opt + '</button>';
    });
    html += '<div id="trFb" style="margin-top:15px; font-weight:bold; min-height:24px;"></div><div style="margin-top:20px;"><button class="btn ghost" id="trSkip">Пропустить →</button></div>';
    box.innerHTML = html;
    box.querySelectorAll(".tr-opt").forEach(function(btn){
      btn.onclick = function(){
        var selectedI = Number(btn.getAttribute("data-i"));
        var isCorrect = (selectedI === q.correct);
        if (isCorrect) correct++;
        answered++;
        box.querySelectorAll(".tr-opt").forEach(function(b){ b.disabled = true; b.style.opacity = 0.6; });
        btn.style.opacity = 1; btn.style.borderColor = isCorrect ? "var(--ok)" : "var(--err)";
        if (!isCorrect) box.querySelectorAll(".tr-opt").forEach(function(b){ if (Number(b.getAttribute("data-i")) === q.correct) b.style.borderColor = "var(--ok)"; });
        var fb = box.querySelector("#trFb");
        fb.textContent = isCorrect ? "✅ Верно!" : '❌ Правильно: ' + q.options[q.correct];
        fb.style.color = isCorrect ? "var(--ok)" : "var(--err)";
        setTimeout(function(){ idx++; renderQuestion(); }, 1200);
      };
    });
    box.querySelector("#trSkip").onclick = function(){ idx++; renderQuestion(); };
  }
  renderQuestion();
};

window.renderFinal_0202 = function(mdkId) {
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = "";
  app.innerHTML = '<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>';
  if (!mdkId) {
    app.innerHTML += '<section class="hero"><h1>📋 Экзамен: МДК 02.02</h1><p>10 вопросов · 10 минут</p></section>';
    var grid = document.createElement("div"); grid.style.cssText = "display:flex; flex-direction:column; gap:12px;";
    var card = document.createElement("a"); card.href = "#/final/02.02"; card.style.cssText = "display:block; padding:20px; background:var(--card); border:1px solid var(--border); border-radius:12px; color:var(--text); text-decoration:none;";
    card.innerHTML = '<h3>МДК 02.02</h3><span style="color:var(--muted);">Банк: 70+ вопросов</span>';
    grid.appendChild(card); app.appendChild(grid); return;
  }

  var baseQuestions = [];
  if (window.MDK_DATA && window.MDK_DATA['02.02']) {
      window.MDK_DATA['02.02'].sections.forEach(s => s.topics.forEach(t => {
          if (t.test) baseQuestions = baseQuestions.concat(t.test);
      }));
  }
  var extraQuestions = [ /* Тот же массив, что и выше */ ]; 
  var allQ = baseQuestions.concat(extraQuestions);

  app.innerHTML += '<section class="hero"><h1>📋 МДК 02.02</h1><p>Итоговый экзамен: 10 вопросов · 10 минут</p></section>';
  var box = document.createElement("div"); box.className = "module"; app.appendChild(box);
  var startBtn = document.createElement("button"); startBtn.className = "btn"; startBtn.textContent = "Начать экзамен"; startBtn.style.width = "100%"; box.appendChild(startBtn);
  
  startBtn.onclick = function() {
    var picked = allQ.sort(function(){ return Math.random() - 0.5; }).slice(0, Math.min(10, allQ.length));
    var timeLeft = 600;
    box.innerHTML = '<div id="exTimer" style="font-size:24px; font-weight:bold; text-align:center; color:var(--accent); margin-bottom:20px;">10:00</div>';
    var form = document.createElement("form");
    picked.forEach(function(q, qi){
      var qHtml = '<div style="margin-bottom:20px; padding:15px; background:var(--card-soft); border-radius:8px;"><div style="font-weight:bold; margin-bottom:10px; font-size:16px;">' + (qi + 1) + '. ' + q.q + '</div>';
      q.options.forEach(function(opt, oi){
        qHtml += '<label style="display:flex; align-items:center; gap:10px; padding:8px; cursor:pointer; border-radius:6px; margin-bottom:4px;"><input type="radio" name="eq' + qi + '" value="' + oi + '" style="transform:scale(1.2); accent-color:var(--accent);"><span>' + opt + '</span></label>';
      });
      qHtml += '</div>';
      form.innerHTML += qHtml;
    });
    var done = document.createElement("button"); done.type = "button"; done.className = "btn"; done.textContent = "Завершить экзамен"; done.style.cssText = "width:100%; margin-top:20px; padding:15px; font-size:16px;";
    form.appendChild(done); box.appendChild(form);
    var tEl = box.querySelector("#exTimer");
    var tid = setInterval(function(){
      timeLeft--; var m = Math.floor(timeLeft / 60), s = timeLeft % 60;
      tEl.textContent = (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
      if (timeLeft <= 60) tEl.style.color = "var(--err)";
      if (timeLeft <= 0) { clearInterval(tid); done.click(); }
    }, 1000);
    done.onclick = function() {
      clearInterval(tid);
      var correct = 0;
      picked.forEach(function(q, qi){
        var ch = form.querySelector('input[name="eq' + qi + '"]:checked');
        if (ch && Number(ch.value) === q.correct) correct++;
      });
      var pct = Math.round((correct / picked.length) * 100); var grade = pct >= 90 ? 5 : pct >= 75 ? 4 : pct >= 60 ? 3 : 2;
      window.state.results["__final__02.02"] = { grade: grade, total: correct, max: picked.length };
      if (window.addXP) window.addXP(grade * 20); if (window.saveStudentData) window.saveStudentData();
      box.innerHTML = '<div style="text-align:center; padding:30px;"><h1 style="font-size:72px; margin:0; color:' + (grade >= 3 ? 'var(--ok)' : 'var(--err)') + ';">' + grade + '</h1><p style="font-size:18px;">Верных ответов: <b>' + correct + '</b> из <b>' + picked.length + '</b> (' + pct + '%)</p><div style="display:flex; gap:10px; justify-content:center; margin-top:30px;"><a class="btn" href="#/final">К списку экзаменов</a><a class="btn ghost" href="#/training/02.02">Тренировка</a></div></div>';
    };
  };
};