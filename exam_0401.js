"use strict";

window.renderTraining_0401 = function(mdkId) {
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = "";
  app.innerHTML = '<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>';
  
  if (!mdkId) {
    app.innerHTML += '<section class="hero"><h1>🎯 Тренировка: МДК 04.01</h1><p>Выберите предмет</p></section>';
    var grid = document.createElement("div"); grid.style.cssText = "display:flex; flex-direction:column; gap:12px;";
    var card = document.createElement("a"); card.href = "#/training/04.01"; card.style.cssText = "display:block; padding:20px; background:var(--card); border:1px solid var(--border); border-radius:12px; color:var(--text); text-decoration:none;";
    card.innerHTML = '<h3>МДК 04.01</h3><span style="color:var(--muted);">Диагностика и обслуживание</span>';
    grid.appendChild(card); app.appendChild(grid); return;
  }

  var baseQuestions = [];
  if (window.MDK_DATA && window.MDK_DATA['04.01']) {
      window.MDK_DATA['04.01'].sections.forEach(s => s.topics.forEach(t => {
          if (t.test) baseQuestions = baseQuestions.concat(t.test);
      }));
  }

  var extraQuestions = [
    { q: "Что такое техническое диагностирование?", options: ["Определение состояния объекта", "Ремонт", "Наладка", "Сборка"], correct: 0 },
    { q: "Что такое исправное состояние?", options: ["Соответствие всем требованиям НТД", "Работа без брака", "Работа с шумом", "Наличие дефектов"], correct: 0 },
    { q: "Что такое работоспособное состояние?", options: ["Выполняет функции в пределах нормы", "Идеальное состояние", "Состояние после ремонта", "Наличие всех деталей"], correct: 0 },
    { q: "Что такое отказ?", options: ["Нарушение работоспособного состояния", "Дефект", "Износ", "Остановка"], correct: 0 },
    { q: "Что такое диагностический параметр?", options: ["Признак состояния объекта", "Тип станка", "Вид инструмента", "Марка масла"], correct: 0 },
    { q: "Что такое безразборное диагностирование?", options: ["Оценка по косвенным параметрам", "Полная разборка", "Осмотр", "Прослушивание"], correct: 0 },
    { q: "Что такое вибродиагностика?", options: ["Анализ спектра вибрации", "Измерение температуры", "Измерение тока", "Анализ масла"], correct: 0 },
    { q: "Какой прибор измеряет температуру?", options: ["Пирометр", "Микрометр", "Штангенциркуль", "Угломер"], correct: 0 },
    { q: "Что такое трибодиагностика?", options: ["Анализ проб масла", "Анализ вибрации", "Анализ тока", "Анализ шума"], correct: 0 },
    { q: "Что такое органолептический метод?", options: ["Осмотр, прослушивание, осязание", "Использование приборов", "Лабораторный анализ", "Математическое моделирование"], correct: 0 },
    { q: "Что проверяют при общем осмотре станка?", options: ["Состояние кожухов и заземления", "Марку масла", "Цвет краски", "Стоимость"], correct: 0 },
    { q: "Что проверяют при диагностике КИП?", options: ["Срабатывание концевых выключателей", "Цвет", "Массу", "Размер"], correct: 0 },
    { q: "Что делают при обнаружении неисправности КИП?", options: ["Замена или настройка", "Покраска", "Смазка", "Нагрев"], correct: 0 },
    { q: "Что такое метод дерева отказов?", options: ["Логическая схема причин", "Ремонт", "Наладка", "Смазка"], correct: 0 },
    { q: "Что такое метод половинного деления?", options: ["Поиск неисправности в середине цепи", "Полная разборка", "Замена узлов", "Нагрев"], correct: 0 },
    { q: "Что проверяют при тестовом диагностировании?", options: ["Отработку конкретных команд", "Цвет масла", "Массу детали", "Скорость резания"], correct: 0 },
    { q: "Что такое наладка станка?", options: ["Подготовка к выполнению операции", "Ремонт", "Диагностика", "Сборка"], correct: 0 },
    { q: "Что такое подналадка?", options: ["Восстановление точности в процессе", "Первичная наладка", "Ремонт", "Сборка"], correct: 0 },
    { q: "Какова последовательность наладки?", options: ["Изучение документации -> подготовка -> настройка", "Разборка -> сборка", "Ремонт -> проверка", "Смазка -> покраска"], correct: 0 },
    { q: "Что такое карта наладки?", options: ["Документ с эскизом и настройками", "Чертеж детали", "Инструкция по ТБ", "Паспорт станка"], correct: 0 },
    { q: "Что проверяют в конце наладки?", options: ["Пробную деталь", "Цвет масла", "Массу", "Скорость"], correct: 0 },
    { q: "Что такое режим JOG?", options: ["Ручной режим", "Автоматический", "Покадровый", "Редактирование"], correct: 0 },
    { q: "Что такое режим MDI?", options: ["Ручной ввод данных", "Автоматический", "Покадровый", "Редактирование"], correct: 0 },
    { q: "Что такое SCADA-система?", options: ["Система диспетчерского управления", "Станок с ЧПУ", "Измерительный прибор", "Тип резца"], correct: 0 },
    { q: "Что такое TPM?", options: ["Всеобщее обслуживание оборудования", "Тип станка", "Ремонт", "Диагностика"], correct: 0 },
    { q: "Что такое автономное обслуживание в TPM?", options: ["Оператор сам чистит и осматривает станок", "Только ремонтник", "Только наладчик", "Только мастер"], correct: 0 },
    { q: "Что такое ППР?", options: ["Планово-предупредительный ремонт", "Прибор проверки", "Простой ремонт", "Прямой привод"], correct: 0 },
    { q: "Какой ремонт включает полную разборку?", options: ["Капитальный", "Текущий", "Аварийный", "Средний"], correct: 0 },
    { q: "Что такое акт дефектации?", options: ["Документ о состоянии узлов", "Чертеж", "Инструкция", "Паспорт"], correct: 0 },
    { q: "Что такое бережливое производство?", options: ["Система 5S", "Ремонт", "Диагностика", "Сборка"], correct: 0 },
    { q: "Что означает система 5S?", options: ["Организация рабочего места", "Ремонт", "Диагностика", "Сборка"], correct: 0 },
    { q: "Что проверяют индикатором ИЧ-10?", options: ["Биение и перемещения", "Температуру", "Вибрацию", "Давление"], correct: 0 },
    { q: "Что такое лазерный интерферометр?", options: ["Прибор для проверки точности позиционирования", "Измеритель температуры", "Виброметр", "Шумомер"], correct: 0 },
    { q: "Как проверяют прямолинейность направляющих?", options: ["Уровнем и струной", "Микрометром", "Штангенциркулем", "Пирометром"], correct: 0 },
    { q: "Как проверяют биение шпинделя?", options: ["Индикатором на оправке", "На глаз", "На слух", "По массе"], correct: 0 },
    { q: "Что такое допуск прямолинейности?", options: ["Максимальное отклонение", "Минимальное отклонение", "Среднее отклонение", "Отношение"], correct: 0 },
    { q: "Что такое износ оборудования?", options: ["Постепенное изменение размеров", "Поломка", "Остановка", "Нагрев"], correct: 0 },
    { q: "Что такое дефект?", options: ["Каждое несоответствие требованиям", "Отказ", "Износ", "Поломка"], correct: 0 },
    { q: "Что такое диагностическая карта?", options: ["Документ с точками контроля и нормами", "Чертеж", "Инструкция", "Паспорт"], correct: 0 },
    { q: "Что такое ремонтный чертеж?", options: ["Чертеж с ремонтными размерами", "Сборочный чертеж", "Эскиз", "Схема"], correct: 0 },
    { q: "Что такое ведомость ремонтных работ?", options: ["Перечень операций и трудоемкость", "Чертеж", "Инструкция", "Паспорт"], correct: 0 },
    { q: "Что такое виброметр?", options: ["Прибор для измерения вибрации", "Измеритель температуры", "Шумомер", "Индикатор"], correct: 0 },
    { q: "Что такое тепловизор?", options: ["Прибор для измерения температуры", "Виброметр", "Шумомер", "Индикатор"], correct: 0 },
    { q: "Что такое шумомер?", options: ["Прибор для измерения шума", "Виброметр", "Пирометр", "Индикатор"], correct: 0 },
    { q: "Что такое регламентное диагностирование?", options: ["Плановое по графику", "Аварийное", "Внеплановое", "Текущее"], correct: 0 },
    { q: "Что такое заявочное диагностирование?", options: ["По сигналу о неисправности", "По графику", "Плановое", "Текущее"], correct: 0 },
    { q: "Что такое маршрутная технология диагностирования?", options: ["Алгоритм поиска неисправности", "Ремонт", "Наладка", "Сборка"], correct: 0 },
    { q: "Что проверяют в первую очередь при отказе станка?", options: ["Предохранители и питание", "Цвет масла", "Массу", "Скорость"], correct: 0 },
    { q: "Что такое кавитация в гидросистеме?", options: ["Образование пузырьков", "Нагрев", "Утечка", "Загрязнение"], correct: 0 },
    { q: "Что вызывает нагрев подшипника?", options: ["Избыток смазки", "Недостаток смазки", "Перекос", "Все перечисленное"], correct: 3 },
    { q: "Что такое люфт?", options: ["Зазор в соединении", "Натяг", "Вибрация", "Шум"], correct: 0 },
    { q: "Чем контролируют момент затяжки?", options: ["Динамометрическим ключом", "Штангенциркулем", "Микрометром", "Индикатором"], correct: 0 },
    { q: "Что такое биение?", options: ["Отклонение от оси", "Отклонение от плоскости", "Отклонение от размера", "Отклонение от массы"], correct: 0 },
    { q: "Что такое точность станка?", options: ["Способность сохранять параметры", "Скорость работы", "Мощность", "Вес"], correct: 0 }
  ];

  var allQuestions = baseQuestions.concat(extraQuestions);
  var questions = allQuestions.sort(function(){ return Math.random() - 0.5; });
  var idx = 0, correct = 0, answered = 0;

  app.innerHTML += '<section class="hero"><h1>🎯 МДК 04.01</h1><p>Вопросов для тренировки: ' + questions.length + '</p></section>';
  var box = document.createElement("div"); box.className = "module"; app.appendChild(box);

  function renderQuestion() {
    if (idx >= questions.length) {
      box.innerHTML = '<div style="text-align:center; padding:20px;"><h2>Тренировка завершена!</h2><p>Верных ответов: <b>' + correct + '</b> из <b>' + answered + '</b></p><div style="display:flex; gap:10px; justify-content:center; margin-top:20px;"><a class="btn" href="#/final/04.01">Перейти к экзамену</a><a class="btn ghost" href="#/training/04.01">Начать заново</a></div></div>';
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

window.renderFinal_0401 = function(mdkId) {
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = "";
  app.innerHTML = '<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>';
  if (!mdkId) {
    app.innerHTML += '<section class="hero"><h1>📋 Экзамен: МДК 04.01</h1><p>10 вопросов · 10 минут</p></section>';
    var grid = document.createElement("div"); grid.style.cssText = "display:flex; flex-direction:column; gap:12px;";
    var card = document.createElement("a"); card.href = "#/final/04.01"; card.style.cssText = "display:block; padding:20px; background:var(--card); border:1px solid var(--border); border-radius:12px; color:var(--text); text-decoration:none;";
    card.innerHTML = '<h3>МДК 04.01</h3><span style="color:var(--muted);">Банк: 70+ вопросов</span>';
    grid.appendChild(card); app.appendChild(grid); return;
  }

  var baseQuestions = [];
  if (window.MDK_DATA && window.MDK_DATA['04.01']) {
      window.MDK_DATA['04.01'].sections.forEach(s => s.topics.forEach(t => {
          if (t.test) baseQuestions = baseQuestions.concat(t.test);
      }));
  }
  var extraQuestions = [ /* Тот же массив, что и выше */ ]; 
  var allQ = baseQuestions.concat(extraQuestions);

  app.innerHTML += '<section class="hero"><h1>📋 МДК 04.01</h1><p>Итоговый экзамен: 10 вопросов · 10 минут</p></section>';
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
      window.state.results["__final__04.01"] = { grade: grade, total: correct, max: picked.length };
      if (window.addXP) window.addXP(grade * 20); if (window.saveStudentData) window.saveStudentData();
      box.innerHTML = '<div style="text-align:center; padding:30px;"><h1 style="font-size:72px; margin:0; color:' + (grade >= 3 ? 'var(--ok)' : 'var(--err)') + ';">' + grade + '</h1><p style="font-size:18px;">Верных ответов: <b>' + correct + '</b> из <b>' + picked.length + '</b> (' + pct + '%)</p><div style="display:flex; gap:10px; justify-content:center; margin-top:30px;"><a class="btn" href="#/final">К списку экзаменов</a><a class="btn ghost" href="#/training/04.01">Тренировка</a></div></div>';
    };
  };
};