"use strict";

window.renderTraining_0201 = function(mdkId) {
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = "";
  app.innerHTML = '<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>';
  
  if (!mdkId) {
    app.innerHTML += '<section class="hero"><h1>🎯 Тренировка: МДК 02.01</h1><p>Выберите предмет</p></section>';
    var grid = document.createElement("div");
    grid.style.cssText = "display:flex; flex-direction:column; gap:12px;";
    var card = document.createElement("a");
    card.href = "#/training/02.01";
    card.style.cssText = "display:block; padding:20px; background:var(--card); border:1px solid var(--border); border-radius:12px; color:var(--text); text-decoration:none;";
    card.innerHTML = '<h3>МДК 02.01</h3><span style="color:var(--muted);">Сборка типовых сборочных единиц</span>';
    grid.appendChild(card);
    app.appendChild(grid);
    return;
  }

  var baseQuestions = [];
  if (window.MDK_DATA && window.MDK_DATA['02.01']) {
      window.MDK_DATA['02.01'].sections.forEach(s => s.topics.forEach(t => {
          if (t.test) baseQuestions = baseQuestions.concat(t.test);
      }));
  }

  var extraQuestions = [
    { q: "Что такое базирование?", options: ["Придание заготовке требуемого положения", "Установка детали", "Закрепление детали", "Разметка"], correct: 0 },
    { q: "Какая база лишает деталь трех степеней свободы?", options: ["Установочная", "Направляющая", "Опорная", "Скрытая"], correct: 0 },
    { q: "Что означает правило шести точек?", options: ["Шесть опорных точек", "Шесть деталей", "Шесть степеней свободы", "Шесть баз"], correct: 0 },
    { q: "Какая база лишает деталь двух степеней свободы?", options: ["Направляющая", "Установочная", "Опорная", "Явная"], correct: 0 },
    { q: "Какая база лишает деталь одной степени свободы?", options: ["Опорная", "Установочная", "Направляющая", "Скрытая"], correct: 0 },
    { q: "Что такое недобаз?", options: ["Меньше 6 связей", "Больше 6 связей", "Нет баз", "Одна база"], correct: 0 },
    { q: "Что такое перебазирование?", options: ["Больше 6 связей", "Меньше 6 связей", "Замена базы", "Установка на призмы"], correct: 0 },
    { q: "Для чего нужен зажим при базировании?", options: ["Для фиксации положения", "Для нагрева", "Для смазки", "Для окраски"], correct: 0 },
    { q: "Что такое конструкторская база?", options: ["Задана на чертеже", "Задана при сборке", "Задана при контроле", "Задана при ремонте"], correct: 0 },
    { q: "Что такое технологическая база?", options: ["Выбрана для сборки", "Задана на чертеже", "Задана при контроле", "Ось симметрии"], correct: 0 },
    { q: "Какой подшипник воспринимает только осевую нагрузку?", options: ["Упорный", "Радиальный", "Радиально-упорный", "Роликовый"], correct: 0 },
    { q: "Какой класс точности подшипника самый высокий?", options: ["2", "0", "6", "4"], correct: 0 },
    { q: "Как расшифровать подшипник 6205?", options: ["Внутренний диаметр 25 мм", "Наружный диаметр 25 мм", "Ширина 25 мм", "Масса 25 г"], correct: 0 },
    { q: "Что такое динамическая грузоподъемность?", options: ["Нагрузка при 1 млн оборотов", "Максимальная нагрузка", "Вес подшипника", "Скорость вращения"], correct: 0 },
    { q: "Как устанавливают подшипник на вращающийся вал?", options: ["С натягом", "С зазором", "Свободно", "На клей"], correct: 0 },
    { q: "При какой температуре разрушается термообработка подшипника?", options: ["Выше 120°C", "Выше 80°C", "Выше 100°C", "Выше 150°C"], correct: 0 },
    { q: "Что такое гидродинамический подшипник?", options: ["Смазка создается вращением", "Масло под давлением", "Воздушная смазка", "Без смазки"], correct: 0 },
    { q: "Из какого материала делают вкладыши подшипников?", options: ["Баббит", "Сталь", "Чугун", "Алюминий"], correct: 0 },
    { q: "Какой зазор называется диаметральным?", options: ["Разность диаметров", "Сумма диаметров", "Отношение диаметров", "Произведение диаметров"], correct: 0 },
    { q: "Какой тип муфты компенсирует несоосность?", options: ["УВП", "Втулочная", "Фланцевая", "Кулачковая"], correct: 0 },
    { q: "Что такое коленчатый вал?", options: ["Преобразует возвратно-поступательное в вращательное", "Передает момент", "Удерживает деталь", "Режет металл"], correct: 0 },
    { q: "Что такое галтель на коленчатом валу?", options: ["Плавный переход", "Резьба", "Шпоночный паз", "Отверстие"], correct: 0 },
    { q: "Какая сталь используется для коленчатых валов?", options: ["40Х", "Ст3", "У8", "12Х18Н10Т"], correct: 0 },
    { q: "Что устраняет дисбаланс коленчатого вала?", options: ["Сверление противовесов", "Балансировка маховика", "Замена подшипников", "Смазка"], correct: 0 },
    { q: "Каков зазор в замке кольца?", options: ["0,25–0,50 мм", "0,01–0,05 мм", "1–2 мм", "3–4 мм"], correct: 0 },
    { q: "Что такое плавающий поршневой палец?", options: ["Проворачивается в обеих головках", "Закреплен в шатуне", "Закреплен в поршне", "Не двигается"], correct: 0 },
    { q: "До какой температуры нагревают шатун перед запрессовкой?", options: ["60–80 °C", "20–30 °C", "100–120 °C", "150–200 °C"], correct: 0 },
    { q: "Что контролируют пластиковым индикатором?", options: ["Зазор", "Момент затяжки", "Температуру", "Биение"], correct: 0 },
    { q: "Какой зазор уменьшается при нагреве алюминиевого поршня?", options: ["Монтажный зазор", "Зазор в замке", "Осевой зазор", "Радиальный зазор"], correct: 0 },
    { q: "С какой точностью контролируют массу поршней?", options: ["0,1 г", "1 г", "10 г", "100 г"], correct: 0 },
    { q: "Какой метод используется для нарезания зубьев высокой точности?", options: ["Шлифование", "Копирование", "Обкатка", "Долбление"], correct: 0 },
    { q: "Какая норма ограничивает шум зубчатой передачи?", options: ["Кинематическая точность", "Плавность работы", "Контакт зубьев", "Боковой зазор"], correct: 0 },
    { q: "Как проверяют пятно контакта зубьев?", options: ["На краску", "На ощупь", "На слух", "По весу"], correct: 0 },
    { q: "Что проверяют щупом в зацеплении?", options: ["Боковой зазор", "Пятно контакта", "Соосность", "Биение"], correct: 0 },
    { q: "Куда смещают пятно контакта при перекосе осей?", options: ["К краю", "В центр", "На вершину", "К ножке"], correct: 0 },
    { q: "Какая передача требует совпадения вершин конусов?", options: ["Коническая", "Цилиндрическая", "Червячная", "Ременная"], correct: 0 },
    { q: "Что регулируют прокладками в червячной передаче?", options: ["Осевое положение колеса", "Натяг ремня", "Зазор в подшипниках", "Биение вала"], correct: 0 },
    { q: "Что контролируют линейкой в ременной передаче?", options: ["Параллельность шкивов", "Натяжение", "Длину ремня", "Ширину"], correct: 0 },
    { q: "Какое провисание допускается для цепи?", options: ["2% от межосевого", "10% от межосевого", "5 мм", "1 мм"], correct: 0 },
    { q: "Чем устраняют люфт в передаче винт-гайка скольжения?", options: ["Разрезной гайкой", "Заменой винта", "Смазкой", "Нагревом"], correct: 0 },
    { q: "Что такое ШВП?", options: ["Шариковая винтовая передача", "Широковинтовая передача", "Шлицевая втулочная передача", "Шарнирно-винтовой привод"], correct: 0 },
    { q: "Что компенсирует плавающая опора винта ШВП?", options: ["Тепловое удлинение", "Люфт", "Вибрацию", "Изгиб"], correct: 0 },
    { q: "Какая точность позиционирования у ШВП?", options: ["Высокая", "Низкая", "Средняя", "Зависит от износа"], correct: 0 },
    { q: "Что делают при сборке направляющих качения?", options: ["Выверяют параллельность", "Красят", "Смазывают", "Нагревают"], correct: 0 },
    { q: "Что такое КШМ?", options: ["Кривошипно-шатунный механизм", "Коробка скоростей", "Конический шариковый механизм", "Клиновой шпоночный механизм"], correct: 0 },
    { q: "С какой последовательностью затягивают коренные подшипники?", options: ["От середины к краям", "От краев к середине", "По часовой стрелке", "В любом порядке"], correct: 0 },
    { q: "Что проверяют после сборки КШМ?", options: ["Вращение вала от руки", "Цвет масла", "Уровень шума", "Массу"], correct: 0 },
    { q: "Для чего нужна муфта?", options: ["Передача крутящего момента", "Удержание детали", "Нагрев", "Охлаждение"], correct: 0 },
    { q: "Что такое гидроцилиндр?", options: ["Преобразует энергию жидкости в механическую", "Создает давление", "Управляет потоком", "Очищает жидкость"], correct: 0 },
    { q: "Что нужно сделать перед разборкой гидросистемы?", options: ["Сбросить давление", "Слить масло", "Нагреть", "Охладить"], correct: 0 },
    { q: "Что проверяют при опрессовке гидросистемы?", options: ["Герметичность", "Давление", "Температуру", "Расход"], correct: 0 },
    { q: "Какой подшипник применяют в высокоскоростных электрошпинделях?", options: ["Керамический", "Баббитовый", "Чугунный", "Бронзовый"], correct: 0 },
    { q: "Что контролируют у энкодера?", options: ["Соосность и зазор", "Цвет", "Массу", "Длину"], correct: 0 },
    { q: "Какие подшипники используются в прецизионных шпинделях?", options: ["Класса 2", "Класса 0", "Класса 6", "Класса 4"], correct: 0 },
    { q: "Что проверяют при сборке шпинделя?", options: ["Биение у торца", "Цвет смазки", "Длину вала", "Массу"], correct: 0 },
    { q: "Для чего нужна балансировка шпинделя?", options: ["Снижение вибрации", "Увеличение массы", "Уменьшение скорости", "Нагрев"], correct: 0 },
    { q: "Какой инструмент используют для контроля момента затяжки?", options: ["Динамометрический ключ", "Штангенциркуль", "Микрометр", "Индикатор"], correct: 0 },
    { q: "Какой документ описывает одну операцию?", options: ["Операционная карта", "Маршрутная карта", "Ведомость оснастки", "Титульный лист"], correct: 0 },
    { q: "Как рассчитывается штучно-калькуляционное время?", options: ["T_шт + T_пз/n", "T_опер + T_обсл", "T_шт - T_пз", "T_опер * n"], correct: 0 },
    { q: "Что означает аббревиатура ЕСТД?", options: ["Единая система технологической документации", "Единый стандарт труда и отдыха", "Единая схема технических данных", "Ежедневный стандарт текущей документации"], correct: 0 },
    { q: "Какой уровень автоматизации предполагает переналадку по программе?", options: ["Гибкая автоматизация", "Ручная", "Механизированная", "Жесткая линия"], correct: 0 },
    { q: "Для чего нужна система технического зрения в роботах?", options: ["Распознавание деталей", "Нагрев", "Смазка", "Охлаждение"], correct: 0 },
    { q: "Какой тип сборки исключает подгонку деталей?", options: ["Полная взаимозаменяемость", "Неполная", "Пригонка", "Индивидуальная подборка"], correct: 0 }
  ];

  var allQuestions = baseQuestions.concat(extraQuestions);
  var questions = allQuestions.sort(function(){ return Math.random() - 0.5; });
  var idx = 0, correct = 0, answered = 0;

  app.innerHTML += '<section class="hero"><h1>🎯 МДК 02.01</h1><p>Вопросов для тренировки: ' + questions.length + '</p></section>';
  var box = document.createElement("div"); box.className = "module"; app.appendChild(box);

  function renderQuestion() {
    if (idx >= questions.length) {
      box.innerHTML = '<div style="text-align:center; padding:20px;"><h2>Тренировка завершена!</h2><p>Верных ответов: <b>' + correct + '</b> из <b>' + answered + '</b></p><div style="display:flex; gap:10px; justify-content:center; margin-top:20px;"><a class="btn" href="#/final/02.01">Перейти к экзамену</a><a class="btn ghost" href="#/training/02.01">Начать заново</a></div></div>';
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

window.renderFinal_0201 = function(mdkId) {
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = "";
  app.innerHTML = '<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>';
  if (!mdkId) {
    app.innerHTML += '<section class="hero"><h1>📋 Экзамен: МДК 02.01</h1><p>10 вопросов · 10 минут</p></section>';
    var grid = document.createElement("div");
    grid.style.cssText = "display:flex; flex-direction:column; gap:12px;";
    var card = document.createElement("a");
    card.href = "#/final/02.01";
    card.style.cssText = "display:block; padding:20px; background:var(--card); border:1px solid var(--border); border-radius:12px; color:var(--text); text-decoration:none;";
    card.innerHTML = '<h3>МДК 02.01</h3><span style="color:var(--muted);">Банк: 80 вопросов</span>';
    grid.appendChild(card);
    app.appendChild(grid);
    return;
  }

  var baseQuestions = [];
  if (window.MDK_DATA && window.MDK_DATA['02.01']) {
      window.MDK_DATA['02.01'].sections.forEach(s => s.topics.forEach(t => {
          if (t.test) baseQuestions = baseQuestions.concat(t.test);
      }));
  }
  // Используем те же вопросы, что и для тренировки
  var extraQuestions = [ /* Тот же массив, что и выше */ ]; 
  var allQ = baseQuestions.concat(extraQuestions);

  app.innerHTML += '<section class="hero"><h1>📋 МДК 02.01</h1><p>Итоговый экзамен: 10 вопросов · 10 минут</p></section>';
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
      window.state.results["__final__02.01"] = { grade: grade, total: correct, max: picked.length };
      if (window.addXP) window.addXP(grade * 20); if (window.saveStudentData) window.saveStudentData();
      box.innerHTML = '<div style="text-align:center; padding:30px;"><h1 style="font-size:72px; margin:0; color:' + (grade >= 3 ? 'var(--ok)' : 'var(--err)') + ';">' + grade + '</h1><p style="font-size:18px;">Верных ответов: <b>' + correct + '</b> из <b>' + picked.length + '</b> (' + pct + '%)</p><div style="display:flex; gap:10px; justify-content:center; margin-top:30px;"><a class="btn" href="#/final">К списку экзаменов</a><a class="btn ghost" href="#/training/02.01">Тренировка</a></div></div>';
    };
  };
};