/* ============================================================
   МДК 07.01 — final.js
   Итоговая тренировка (все вопросы курса)
   Итоговый экзамен (25 случайных вопросов)
   Статистика загруженных работ
   ============================================================ */

"use strict";

/* ============================================================
   Сбор всех вопросов из курса
   ============================================================ */
function collectAllQuestions(){
  var out = [];
  var c = null;
  try { c = (typeof COURSE !== "undefined") ? COURSE : window.COURSE; } catch (e){}
  if (!c || !c.sections) return out;
  c.sections.forEach(function(sec){
    (sec.topics || []).forEach(function(t){
      (t.test || []).forEach(function(q, qi){
        out.push({
          q: q.q,
          options: q.options.slice(),
          correct: q.correct,
          topicId: t.id,
          topicCode: t.code,
          topicTitle: t.title,
          sectionCode: sec.code,
          uid: t.id + "_" + qi
        });
      });
    });
  });
  return out;
}

/* ============================================================
   ИТОГОВАЯ ТРЕНИРОВКА — все вопросы курса
   ============================================================ */
window.renderFinalTrainingPage = function(){
  var app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Итоговая тренировка";

  var all = collectAllQuestions();
  var totalTopics = 0;
  try {
    var c = (typeof COURSE !== "undefined") ? COURSE : window.COURSE;
    if (c && c.sections) c.sections.forEach(function(s){ totalTopics += (s.topics || []).length; });
  } catch(e){}

  app.appendChild(el('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  app.appendChild(el(
    '<section class="hero">' +
      '<div class="meta">Подготовка к экзамену</div>' +
      '<h1>Итоговая тренировка</h1>' +
      '<p>Все вопросы курса в одном блоке. Отвечайте в любом порядке — сразу увидите правильный ответ. Без оценки, без таймера.</p>' +
    '</section>'
  ));

  if (!all.length){
    app.appendChild(el('<section class="module"><p class="sub">В базе курса пока нет вопросов.</p></section>'));
    return;
  }

  app.appendChild(el(
    '<section class="module">' +
      '<div class="kpis">' +
        '<div class="kpi"><div class="k-label">Всего вопросов</div><div class="k-value">' + all.length + '</div></div>' +
        '<div class="kpi"><div class="k-label">Тем в курсе</div><div class="k-value">' + totalTopics + '</div></div>' +
        '<div class="kpi"><div class="k-label">Режим</div><div class="k-value">Тренировка</div></div>' +
      '</div>' +
      '<p class="sub">Каждый вопрос подписан темой — удобно понять, что повторить.</p>' +
    '</section>'
  ));

  var items = shuffled(all);
  var form = el('<form class="train-form"></form>');

  items.forEach(function(item, qi){
    var opts = item.options.map(function(opt, oi){ return { opt: opt, oi: oi }; });
    var sh = shuffled(opts);
    var correctIdx = -1;
    for (var k = 0; k < sh.length; k++){
      if (sh[k].oi === item.correct){ correctIdx = k; break; }
    }
    var qb = el(
      '<div class="question">' +
        '<div class="q-text">' + (qi+1) + '. ' + escapeHtml(item.q) + '</div>' +
        '<div class="q-meta" style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">' +
          escapeHtml(item.topicCode) + ' · ' + escapeHtml(item.topicTitle) +
        '</div>' +
      '</div>'
    );
    sh.forEach(function(o, oi){
      qb.appendChild(el(
        '<label class="option">' +
          '<input type="radio" name="ft' + qi + '" value="' + oi + '">' +
          '<span>' + escapeHtml(o.opt) + '</span>' +
        '</label>'
      ));
    });
    var fb = el('<div class="train-feedback"></div>');
    qb.appendChild(fb);
    qb.querySelectorAll("input[type=radio]").forEach(function(inp){
      inp.addEventListener("change", function(){
        var allOpts = qb.querySelectorAll(".option");
        allOpts.forEach(function(o){ o.classList.remove("correct"); o.classList.remove("wrong"); });
        var idx = Number(inp.value);
        if (idx === correctIdx){
          allOpts[idx].classList.add("correct");
          fb.textContent = "✔ Верно!";
          fb.className = "train-feedback ok";
        } else {
          allOpts[idx].classList.add("wrong");
          allOpts[correctIdx].classList.add("correct");
          fb.textContent = "✘ Неверно. Правильный ответ выделен зелёным.";
          fb.className = "train-feedback bad";
        }
      });
    });
    form.appendChild(qb);
  });

  var actions = el(
    '<div class="test-actions" style="margin-top:18px">' +
      '<button type="button" class="btn ghost" id="ftReset">🔄 Начать заново</button>' +
      '<button type="button" class="btn" id="ftTop">↑ В начало</button>' +
    '</div>'
  );
  form.appendChild(actions);
  app.appendChild(form);

  form.querySelector("#ftReset").addEventListener("click", function(){
    window.renderFinalTrainingPage();
  });
  form.querySelector("#ftTop").addEventListener("click", function(){
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
};

/* ============================================================
   ИТОГОВЫЙ ЭКЗАМЕН — 25 вопросов, таймер, оценка
   ============================================================ */
var FINAL_EXAM_SIZE = 25;
var FINAL_EXAM_TIME = 30 * 60; // 30 минут

window.renderFinalExamPage = function(){
  var app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Итоговый экзамен";

  var all = collectAllQuestions();

  app.appendChild(el('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  app.appendChild(el(
    '<section class="hero">' +
      '<div class="meta">Контроль знаний</div>' +
      '<h1>Итоговый экзамен</h1>' +
      '<p>' + FINAL_EXAM_SIZE + ' случайных вопросов · ' + (FINAL_EXAM_TIME/60) + ' минут · результат идёт в отчёт.</p>' +
    '</section>'
  ));

  if (all.length < FINAL_EXAM_SIZE){
    app.appendChild(el(
      '<section class="module">' +
        '<h2>Недостаточно вопросов в базе</h2>' +
        '<p class="sub">Сейчас в курсе ' + all.length + ' вопросов, для экзамена нужно минимум ' + FINAL_EXAM_SIZE + '.</p>' +
      '</section>'
    ));
    return;
  }

  var todayKey = "mdk0701.finalExam." + new Date().toISOString().slice(0,10) + "." + (studentKey() || "guest");
  var lastResult = null;
  try { lastResult = JSON.parse(localStorage.getItem(todayKey) || "null"); } catch(e){}

  var intro = el(
    '<section class="module">' +
      '<div class="kpis">' +
        '<div class="kpi"><div class="k-label">Вопросов</div><div class="k-value">' + FINAL_EXAM_SIZE + '</div></div>' +
        '<div class="kpi"><div class="k-label">Время</div><div class="k-value">' + (FINAL_EXAM_TIME/60) + ' мин</div></div>' +
        '<div class="kpi"><div class="k-label">Порог</div><div class="k-value">60%</div></div>' +
        '<div class="kpi"><div class="k-label">Оценка в отчёт</div><div class="k-value">да</div></div>' +
      '</div>' +
      '<div class="test-actions" style="margin-top:14px">' +
        '<button class="btn" id="feStartBtn">🚀 Начать экзамен</button>' +
      '</div>' +
      (lastResult ? '<p class="sub" style="margin-top:12px">Сегодня уже сдавали: <b>' + lastResult.ok + '/' + lastResult.total + '</b> (оценка ' + lastResult.grade + ')</p>' : '') +
    '</section>'
  );
  app.appendChild(intro);

  intro.querySelector("#feStartBtn").addEventListener("click", startExam);

  function startExam(){
    intro.innerHTML = "";
    var items = shuffled(all).slice(0, FINAL_EXAM_SIZE);
    items.forEach(function(it){
      var opts = it.options.map(function(opt, oi){ return { opt: opt, oi: oi }; });
      it.s = shuffled(opts);
      it.correctIdx = -1;
      for (var k = 0; k < it.s.length; k++) if (it.s[k].oi === it.correct){ it.correctIdx = k; break; }
    });

    var timer = el('<div class="test-timer">⏱ --:--</div>');
    intro.appendChild(timer);
    intro.appendChild(el('<p class="accent">Вопросы и варианты перемешаны. По истечении времени тест сдаётся автоматически.</p>'));

    var form = el('<form></form>');
    items.forEach(function(item, qi){
      var qb = el(
        '<div class="question">' +
          '<div class="q-text">' + (qi+1) + '. ' + escapeHtml(item.q) + '</div>' +
          '<div class="q-meta" style="font-size:11px;color:var(--muted);margin-bottom:8px">' +
            escapeHtml(item.topicCode) +
          '</div>' +
        '</div>'
      );
      item.s.forEach(function(o, oi){
        qb.appendChild(el(
          '<label class="option">' +
            '<input type="radio" name="fq' + qi + '" value="' + oi + '">' +
            '<span>' + escapeHtml(o.opt) + '</span>' +
          '</label>'
        ));
      });
      form.appendChild(qb);
    });

    var actions = el(
      '<div class="test-actions">' +
        '<button type="button" class="btn" id="feGradeBtn">Подвести итог</button>' +
      '</div>'
    );
    var result = el('<div class="test-result"></div>');
    var report = el('<div class="test-report"></div>');
    form.appendChild(actions);
    form.appendChild(result);
    form.appendChild(report);
    intro.appendChild(form);

    var graded = false;
    var timerId = null;

    function grade(){
      if (graded) return;
      graded = true;
      if (timerId){ clearInterval(timerId); timerId = null; }

      var ok = 0;
      var wrong = [];
      items.forEach(function(item, qi){
        var ch = form.querySelector('input[name="fq' + qi + '"]:checked');
        var qb = form.querySelectorAll(".question")[qi];
        qb.querySelectorAll(".option").forEach(function(o){ o.classList.remove("correct"); o.classList.remove("wrong"); });
        if (ch){
          var idx = Number(ch.value);
          var opt = qb.querySelectorAll(".option")[idx];
          if (idx === item.correctIdx){ ok++; opt.classList.add("correct"); }
          else {
            opt.classList.add("wrong");
            qb.querySelectorAll(".option")[item.correctIdx].classList.add("correct");
            wrong.push({ q: item.q, u: item.s[idx].opt, c: item.options[item.correct], code: item.topicCode });
          }
        } else {
          qb.querySelectorAll(".option")[item.correctIdx].classList.add("correct");
          wrong.push({ q: item.q, u: "(нет ответа)", c: item.options[item.correct], code: item.topicCode });
        }
      });

      var total = items.length;
      var pct = Math.round(ok / total * 100);
      var g = 2;
      if (pct >= 90) g = 5; else if (pct >= 75) g = 4; else if (pct >= 60) g = 3;

      result.textContent = "Верных: " + ok + " из " + total + " (" + pct + "%). Оценка: " + g + ".";
      result.className = "test-result " + (g >= 3 ? "ok" : "bad");

      var record = { ok: ok, total: total, pct: pct, grade: g, date: new Date().toISOString() };
      try {
        state.results["__final_exam__"] = record;
        saveResults();
      } catch(e){}
      try { localStorage.setItem(todayKey, JSON.stringify(record)); } catch(e){}
      try { logActivity("test", "Итоговый экзамен: " + ok + "/" + total + " (оценка " + g + ")"); } catch(e){}
      if (g === 5 && window.celebrate) window.celebrate();

      if (wrong.length){
        report.appendChild(el('<h3>Разбор ошибок</h3>'));
        wrong.forEach(function(w){
          report.appendChild(el(
            '<div class="error-item">' +
              '<div class="error-q">' + escapeHtml(w.q) + '</div>' +
              '<div class="error-line" style="color:var(--muted);font-size:12px">' + escapeHtml(w.code) + '</div>' +
              '<div class="error-line error-bad">Ваш ответ: ' + escapeHtml(w.u) + '</div>' +
              '<div class="error-line error-ok">Верно: ' + escapeHtml(w.c) + '</div>' +
            '</div>'
          ));
        });
      } else {
        report.appendChild(el('<p class="test-perfect">🎉 Все ответы верные!</p>'));
      }
      actions.querySelector("#feGradeBtn").disabled = true;
    }

    actions.querySelector("#feGradeBtn").addEventListener("click", grade);

    var r = FINAL_EXAM_TIME;
    function tick(){
      var m = Math.floor(r / 60), s = r % 60;
      timer.textContent = "⏱ " + String(m).padStart(2,"0") + ":" + String(s).padStart(2,"0");
      timer.classList.toggle("warn", r <= 60);
      if (r <= 0){ grade(); return; }
      r--;
    }
    tick();
    timerId = setInterval(tick, 1000);
  }
};

/* ============================================================
   Статистика загруженных работ — подмешиваем в дашборд
   ============================================================ */
function loadMyWorksForStats(){
  if (!state.student || !APPS_SCRIPT_URL) return Promise.resolve([]);
  var p = new URLSearchParams();
  p.append("action", "worksload");
  p.append("group", state.student.group);
  return fetch(APPS_SCRIPT_URL + "?" + p.toString())
    .then(function(res){ return res.json(); })
    .then(function(d){
      if (d && d.ok && Array.isArray(d.works)){
        return d.works.filter(function(w){ return w.key === studentKey(); });
      }
      return [];
    })
    .catch(function(){ return []; });
}

/* Подменяем renderDashboard: сначала вызываем оригинал, затем добавляем свой блок */
var __origRenderDashboard = window.renderDashboard;
window.renderDashboard = function(){
  if (typeof __origRenderDashboard === "function"){
    __origRenderDashboard();
  }
  var app = document.getElementById("app");
  if (!app) return;

  // Отдельная секция — статистика загрузок
  var block = el(
    '<section class="module">' +
      '<h2>Мои загруженные работы</h2>' +
      '<p class="sub">Файлы, которые вы прикрепили к практическим заданиям.</p>' +
      '<div id="myWorksStats"><div class="comment-empty">Загружаем…</div></div>' +
    '</section>'
  );
  app.appendChild(block);
  var box = block.querySelector("#myWorksStats");

  loadMyWorksForStats().then(function(works){
    box.innerHTML = "";
    if (!works.length){
      box.appendChild(el('<p class="sub">Файлов пока нет. Откройте любую практическую и нажмите «Прикрепить работу».</p>'));
      return;
    }
    // Разбивка по типам
    var byType = {};
    works.forEach(function(w){
      var ext = (w.fileName || "").split(".").pop().toLowerCase();
      byType[ext] = (byType[ext] || 0) + 1;
    });

    var kpiHtml = '<div class="kpis">' +
      '<div class="kpi"><div class="k-label">Всего файлов</div><div class="k-value">' + works.length + '</div></div>';
    Object.keys(byType).forEach(function(ext){
      kpiHtml += '<div class="kpi"><div class="k-label">.' + escapeHtml(ext) + '</div><div class="k-value">' + byType[ext] + '</div></div>';
    });
    kpiHtml += '</div>';
    box.appendChild(el(kpiHtml));

    var list = el('<div class="activity-list" style="margin-top:12px"></div>');
    works.slice().reverse().forEach(function(w){
      list.appendChild(el(
        '<div class="activity-item">' +
          '<span class="act-icon">📎</span>' +
          '<span class="act-text">' +
            '<b>' + escapeHtml(w.workCode || "—") + '</b> — ' + escapeHtml(w.workTitle || "—") +
            '<br><span style="font-size:12px;color:var(--muted)">' + escapeHtml(w.fileName || "") + '</span>' +
          '</span>' +
          '<span class="act-date">' + fmtRel(w.date) + '</span>' +
          '<a class="btn ghost" href="' + w.fileUrl + '" target="_blank" rel="noopener" style="padding:4px 10px;font-size:12px">↗</a>' +
        '</div>'
      ));
    });
    box.appendChild(list);
  });
};

console.log("[final.js] Итоговые модули загружены. Вопросов в базе: " + collectAllQuestions().length);