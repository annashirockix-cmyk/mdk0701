"use strict";

var FINAL_EXAM_SIZE = 30;
var FINAL_EXAM_TIME = 45 * 60; // 45 минут

function programById(id) {
  if (window.MDK_DATA && window.MDK_DATA[id]) return window.MDK_DATA[id];
  return null;
}

function questionCount(course) {
  if (!course || !course.sections) return 0;
  var n = 0;
  (course.sections || []).forEach(function (s) {
    (s.topics || []).forEach(function (t) { if (t.test) n += t.test.length; });
  });
  return n;
}

window.renderFinalExamPage = function (mdkId) {
  var app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = "";

  if (!mdkId) {
    app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
    app.appendChild(el('<section class="hero"><h1>Итоговые экзамены</h1><p>Экзамен по каждому МДК: 30 вопросов и 2 письменных задания. Время: 45 минут.</p></section>'));
    var grid = document.createElement("div");
    grid.style = "display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px;";
    
    Object.values(window.MDK_DATA || {}).forEach(function (p) {
      var n = questionCount(p);
      var card = document.createElement("a");
      card.className = "module exam-card";
      card.style = "display:block; padding:20px; text-decoration:none; color:var(--text); background:var(--card-soft); border:1px solid var(--border); border-radius:12px;";
      card.href = "#/final/" + p.id;
      card.innerHTML = '<span class="brand-badge">' + p.shortName + '</span><h3 style="margin:15px 0 5px 0;">' + p.title + '</h3><p style="color:var(--muted); font-size:14px;">В банке ' + n + ' вопросов</p>';
      grid.appendChild(card);
    });
    app.appendChild(grid);
    return;
  }

  var course = programById(mdkId);
  if (!course) { location.hash = "#/final"; return; }

  app.appendChild(el('<a class="backlink" href="#/final" style="color:var(--accent);">← К списку экзаменов</a>'));
  app.appendChild(el('<section class="hero"><span class="brand-badge">' + course.shortName + '</span><h1>Итоговый экзамен</h1><p>30 вопросов + 2 письменных задания · 45 минут.</p></section>'));

  var mount = el('<div class="module"><button class="btn" id="startBtn" type="button" style="width:100%; padding:15px; font-size:16px;">Начать экзамен</button></div>');
  app.appendChild(mount);

  mount.querySelector("#startBtn").addEventListener("click", function () {
    var allQ = [];
    course.sections.forEach(function (s) {
      s.topics.forEach(function (t) {
        if (t.test) t.test.forEach(function (q) { allQ.push(q); });
      });
    });
    
    // Если вопросов мало, дублируем их с перемешиванием
    if (allQ.length < FINAL_EXAM_SIZE) {
        var originalLength = allQ.length;
        while (allQ.length < FINAL_EXAM_SIZE) {
            allQ = allQ.concat(allQ.slice(0, Math.min(originalLength, FINAL_EXAM_SIZE - allQ.length)));
        }
    }
    allQ = allQ.sort(function () { return Math.random() - 0.5; }).slice(0, FINAL_EXAM_SIZE);
    
    mount.innerHTML = "";

    var form = el("<form></form>");
    var timerBox = el('<div class="exam-timer" style="font-size:24px; font-weight:bold; color:var(--accent); text-align:center; margin-bottom:20px;">45:00</div>');
    mount.appendChild(timerBox);
    
    // Тестовая часть
    allQ.forEach(function (item, qi) {
      var qb = el('<div class="question" style="margin-bottom:15px; padding:15px; background:var(--card-soft); border-radius:8px;"><div class="q-text" style="font-weight:bold; margin-bottom:10px;">' + (qi + 1) + ". " + item.q + "</div></div>");
      item.options.forEach(function (opt, oi) {
        qb.appendChild(el('<label class="option" style="display:flex; align-items:center; gap:10px; padding:8px; cursor:pointer; border-radius:6px; margin-bottom:4px;"><input type="radio" name="fq' + qi + '" value="' + oi + '" style="transform:scale(1.2); accent-color:var(--accent);"><span>' + opt + "</span></label>"));
      });
      form.appendChild(qb);
    });

    // Письменная часть
    form.appendChild(el('<h3 style="margin-top:30px; color:var(--accent);">✍️ Письменные задания (на проверку преподавателю)</h3>'));
    form.appendChild(el('<div style="margin-bottom:15px; padding:15px; background:var(--card-soft); border-radius:8px; border:1px solid var(--border);"><b>31. Опишите алгоритм наладки станка с ЧПУ.</b><br><textarea name="written1" class="self-input" rows="4" style="margin-top:10px;" placeholder="Ваш ответ..."></textarea></div>'));
    form.appendChild(el('<div style="margin-bottom:15px; padding:15px; background:var(--card-soft); border-radius:8px; border:1px solid var(--border);"><b>32. Рассчитайте частоту вращения шпинделя, если V=120 м/мин, D=50 мм.</b><br><textarea name="written2" class="self-input" rows="2" style="margin-top:10px;" placeholder="Ваш ответ..."></textarea></div>'));
    
    var gradeBtn = el('<button type="button" class="btn" style="width:100%; margin-top:20px; padding:15px; font-size:16px;">Завершить экзамен</button>');
    form.appendChild(gradeBtn);
    mount.appendChild(form);

    var timeLeft = FINAL_EXAM_TIME;
    var tId = setInterval(function () {
      if (!document.body.contains(timerBox)) { clearInterval(tId); return; }
      timeLeft--;
      var mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
      var ss = String(timeLeft % 60).padStart(2, "0");
      timerBox.textContent = mm + ":" + ss;
      if (timeLeft <= 60) timerBox.style.color = "var(--err)";
      if (timeLeft <= 0) gradeBtn.click();
    }, 1000);

    gradeBtn.addEventListener("click", function () {
      clearInterval(tId);
      var ok = 0;
      allQ.forEach(function (item, qi) {
        var ch = form.querySelector('input[name="fq' + qi + '"]:checked');
        if (ch && Number(ch.value) === item.correct) ok++;
      });
      
      var w1 = form.querySelector('textarea[name="written1"]').value;
      var w2 = form.querySelector('textarea[name="written2"]').value;

      // Сохраняем в отправленные на проверку
      if (!window.state.examSubmissions) window.state.examSubmissions = [];
      window.state.examSubmissions.push({
          date: new Date().toLocaleString(),
          courseId: course.id,
          student: window.state.student ? window.state.student.name : "Неизвестный",
          group: window.state.student ? window.state.student.group : "",
          testScore: ok,
          maxTest: allQ.length,
          written1: w1,
          written2: w2,
          status: "На проверке",
          teacherGrade: null,
          finalGrade: null
      });

      var pct = Math.round(ok / allQ.length * 100);
      var g = pct >= 90 ? 5 : pct >= 75 ? 4 : pct >= 60 ? 3 : 2;
      
      // Предварительная оценка за тест
      window.state.results["__final__" + course.id] = { grade: g, total: ok };
      if (window.saveStudentData) window.saveStudentData();
      
      mount.innerHTML = '<div class="exam-result" style="text-align:center; padding:30px;"><h2>' + course.shortName + '</h2><p style="font-size:18px;">Верных: <b>' + ok + '</b> из <b>' + allQ.length + '</b></p><p>Письменные задания отправлены преподавателю.</p><h1 class="exam-grade" style="font-size:64px; margin:20px 0; color:' + (g >= 3 ? "var(--ok)" : "var(--err)") + '">Оценка за тест: ' + g + '</h1><a class="btn" href="#/final">К списку экзаменов</a></div>';
    });
  });
};