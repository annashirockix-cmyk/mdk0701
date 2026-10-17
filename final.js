/* ============================================================
   МДК 07.01 — final.js (v16.1 — ANTICHEAT + EXAMS)
   ============================================================ */

"use strict";

var FINAL_EXAM_SIZE = 25;
var FINAL_EXAM_TIME = 30 * 60;
var DEFAULT_EXAM_ATTEMPTS = 3;

function fGetCourse(){ try { if (typeof COURSE !== "undefined" && COURSE && COURSE.sections) return COURSE; } catch (e){} try { if (typeof window !== "undefined" && window.COURSE && window.COURSE.sections) return window.COURSE; } catch (e){} return null; }
function fState(){ try { return state; } catch (e){ return null; } }
function fStudentKey(){ try { return (typeof studentKey === "function") ? studentKey() : null; } catch (e){ return null; } }
function fSaveResults(){ try { if (typeof saveResults === "function") saveResults(); } catch (e){} }
function fLogActivity(t, x){ try { if (typeof logActivity === "function") logActivity(t, x); } catch (e){} }
function fFmtRel(iso){ try { if (typeof fmtRel === "function") return fmtRel(iso); } catch (e){} return ""; }

function fEl(html){ var t = document.createElement("template"); t.innerHTML = String(html).trim(); return t.content.firstChild; }
function fEsc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ if (c === "&") return "&amp;"; if (c === "<") return "&lt;"; if (c === ">") return "&gt;"; if (c === '"') return "&quot;"; if (c === "'") return "&#39;"; return c; }); }
function fShuffle(a){ var r = a.slice(); for (var i = r.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)); var t = r[i]; r[i] = r[j]; r[j] = t; } return r; }

function collectAllQuestions(){
  var out = []; var c = fGetCourse(); if (!c || !c.sections) return out;
  c.sections.forEach(function(sec){ (sec.topics || []).forEach(function(t){ (t.test || []).forEach(function(q, qi){ out.push({ q: q.q, options: (q.options || []).slice(), correct: q.correct, topicId: t.id, topicCode: t.code, topicTitle: t.title, sectionCode: sec.code, uid: t.id + "_" + qi }); }); }); });
  return out;
}

function examStatusFetch(){
  var st = fState(); if (!st || !st.student || !APPS_SCRIPT_URL) return Promise.resolve({ allowed: DEFAULT_EXAM_ATTEMPTS, used: 0 });
  var p = new URLSearchParams(); p.append("action", "examstatus"); p.append("key", fStudentKey());
  return fetch(APPS_SCRIPT_URL + "?" + p.toString()).then(function(r){ return r.json(); }).then(function(d){ if (d && d.ok) return { allowed: d.allowed, used: d.used, request: d.request || null }; return { allowed: DEFAULT_EXAM_ATTEMPTS, used: 0 }; }).catch(function(){ return { allowed: DEFAULT_EXAM_ATTEMPTS, used: 0 }; });
}
function examUseFetch(){
  var st = fState(); if (!st || !st.student || !APPS_SCRIPT_URL) return Promise.resolve(false);
  var p = new URLSearchParams(); p.append("action", "examuse"); p.append("key", fStudentKey()); p.append("name", st.student.name); p.append("group", st.student.group);
  return fetch(APPS_SCRIPT_URL, { method:"POST", body: p }).then(function(r){ return r.json(); }).then(function(d){ return d && d.ok; }).catch(function(){ return false; });
}
function examRequestFetch(comment){
  var st = fState(); if (!st || !st.student || !APPS_SCRIPT_URL) return Promise.resolve(false);
  var p = new URLSearchParams(); p.append("action", "examrequest"); p.append("key", fStudentKey()); p.append("name", st.student.name); p.append("group", st.student.group); p.append("comment", comment || "");
  return fetch(APPS_SCRIPT_URL, { method:"POST", body: p }).then(function(r){ return r.json(); }).then(function(d){ return d && d.ok; }).catch(function(){ return false; });
}

window.renderFinalTrainingPage = function(){
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = "";
  if (document.getElementById("crumbs")) document.getElementById("crumbs").textContent = "Итоговая тренировка";
  var all = collectAllQuestions();
  app.appendChild(fEl('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  app.appendChild(fEl('<section class="hero"><div class="meta">Подготовка к экзамену</div><h1>Итоговая тренировка</h1><p>Все вопросы курса. Отвечайте в любом порядке — сразу увидите правильный ответ. Без оценки, без таймера.</p></section>'));
  if (!all.length){ app.appendChild(fEl('<section class="module"><h2>Вопросов пока нет</h2></section>')); return; }
  
  var items = fShuffle(all);
  var form = fEl('<form class="train-form"></form>');
  items.forEach(function(item, qi){
    var opts = item.options.map(function(opt, oi){ return { opt: opt, oi: oi }; });
    var sh = fShuffle(opts);
    var correctIdx = -1;
    for (var k = 0; k < sh.length; k++) if (sh[k].oi === item.correct){ correctIdx = k; break; }
    var qb = fEl('<div class="question"><div class="q-text">' + (qi+1) + '. ' + fEsc(item.q) + '</div><div class="q-meta" style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">' + fEsc(item.topicCode) + ' · ' + fEsc(item.topicTitle) + '</div></div>');
    sh.forEach(function(o, oi){ qb.appendChild(fEl('<label class="option"><input type="radio" name="ft' + qi + '" value="' + oi + '"><span>' + fEsc(o.opt) + '</span></label>')); });
    var fb = fEl('<div class="train-feedback"></div>'); qb.appendChild(fb);
    qb.querySelectorAll("input[type=radio]").forEach(function(inp){
      inp.addEventListener("change", function(){
        var allO = qb.querySelectorAll(".option"); allO.forEach(function(o){ o.classList.remove("correct"); o.classList.remove("wrong"); });
        var idx = Number(inp.value);
        if (idx === correctIdx){ allO[idx].classList.add("correct"); fb.textContent = "✔ Верно!"; fb.className = "train-feedback ok"; }
        else { allO[idx].classList.add("wrong"); allO[correctIdx].classList.add("correct"); fb.textContent = "✘ Неверно."; fb.className = "train-feedback bad"; }
      });
    });
    form.appendChild(qb);
  });
  form.appendChild(fEl('<div class="test-actions" style="margin-top:18px"><button type="button" class="btn ghost" id="ftReset">🔄 Начать заново</button><button type="button" class="btn" id="ftTop">↑ В начало</button></div>'));
  app.appendChild(form);
  form.querySelector("#ftReset").addEventListener("click", function(){ window.renderFinalTrainingPage(); });
  form.querySelector("#ftTop").addEventListener("click", function(){ window.scrollTo({ top: 0, behavior:"smooth" }); });
};

window.renderFinalExamPage = function(){
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = "";
  if (document.getElementById("crumbs")) document.getElementById("crumbs").textContent = "Итоговый экзамен";
  var all = collectAllQuestions();
  app.appendChild(fEl('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  app.appendChild(fEl('<section class="hero"><div class="meta">Контроль знаний</div><h1>Итоговый экзамен</h1><p>' + FINAL_EXAM_SIZE + ' случайных вопросов · ' + (FINAL_EXAM_TIME/60) + ' минут · результат идёт в отчёт.</p></section>'));
  if (all.length < FINAL_EXAM_SIZE){ app.appendChild(fEl('<section class="module"><h2>Недостаточно вопросов в базе</h2><p class="sub">Сейчас в курсе <b>' + all.length + '</b>, для экзамена нужно минимум <b>' + FINAL_EXAM_SIZE + '</b>.</p></section>')); return; }

  var mount = fEl('<div id="feMount"><section class="module"><div class="comment-empty">Проверяем попытки…</div></section></div>');
  app.appendChild(mount);
  var todayKey = "mdk0701.finalExam." + new Date().toISOString().slice(0,10) + "." + (fStudentKey() || "guest");

  examStatusFetch().then(function(status){
    mount.innerHTML = "";
    var allowed = status.allowed || DEFAULT_EXAM_ATTEMPTS;
    var used = status.used || 0;
    var left = Math.max(0, allowed - used);
    var pending = status.request && status.request.status === "pending";
    var lastResult = null; try { lastResult = JSON.parse(localStorage.getItem(todayKey) || "null"); } catch(e){}

    var intro = fEl('<section class="module"><div class="kpis"><div class="kpi"><div class="k-label">Вопросов</div><div class="k-value">' + FINAL_EXAM_SIZE + '</div></div><div class="kpi"><div class="k-label">Время</div><div class="k-value">' + (FINAL_EXAM_TIME/60) + ' мин</div></div><div class="kpi"><div class="k-label">Всего попыток</div><div class="k-value">' + allowed + '</div></div><div class="kpi"><div class="k-label">Осталось</div><div class="k-value">' + left + '</div></div></div><p class="sub" style="margin-top:12px">Использовано попыток: <b>' + used + '</b> из <b>' + allowed + '</b>.</p><div id="feActionBox" style="margin-top:14px"></div>' + (lastResult ? '<p class="sub" style="margin-top:12px">Сегодня уже сдавали: <b>' + lastResult.ok + '/' + lastResult.total + '</b> (оценка ' + lastResult.grade + ')</p>' : '') + '</section>');
    mount.appendChild(intro);
    var actBox = intro.querySelector("#feActionBox");

    if (left > 0){
      var startBtn = fEl('<button class="btn" id="feStartBtn">🚀 Начать экзамен (осталось попыток: ' + left + ')</button>');
      actBox.appendChild(startBtn); startBtn.addEventListener("click", function(){ startExam(); });
    } else if (pending){
      actBox.appendChild(fEl('<div class="comment-status ok" style="font-size:14px">⏳ Запрос дополнительной попытки отправлен. Ожидайте решения преподавателя.</div>'));
    } else {
      actBox.appendChild(fEl('<div class="comment-status bad" style="font-size:14px;margin-bottom:10px">✘ Попытки исчерпаны (' + used + ' из ' + allowed + ').</div>'));
      var reqBtn = fEl('<button class="btn" id="feRequestBtn">📩 Запросить дополнительную попытку</button>'); actBox.appendChild(reqBtn);
      reqBtn.addEventListener("click", function(){
        var comment = prompt("Комментарий для преподавателя (необязательно):", "") || ""; reqBtn.disabled = true; reqBtn.textContent = "Отправляем…";
        examRequestFetch(comment).then(function(ok){ if (ok){ actBox.innerHTML = '<div class="comment-status ok" style="font-size:14px">✔ Запрос отправлен. Ожидайте решения преподавателя.</div>'; } else { reqBtn.disabled = false; reqBtn.textContent = "📩 Запросить дополнительную попытку"; alert("Не удалось отправить запрос. Проверьте соединение."); } });
      });
    }

    function startExam(){
      intro.innerHTML = "";
      var items = fShuffle(all).slice(0, FINAL_EXAM_SIZE);
      items.forEach(function(it){
        var opts = it.options.map(function(opt, oi){ return { opt: opt, oi: oi }; });
        it.s = fShuffle(opts); it.correctIdx = -1;
        for (var k = 0; k < it.s.length; k++) if (it.s[k].oi === it.correct){ it.correctIdx = k; break; }
      });

      var timer = fEl('<div class="test-timer">⏱ --:--</div>');
      intro.appendChild(timer);
      intro.appendChild(fEl('<p class="accent">Вопросы и варианты перемешаны. По истечении времени тест сдаётся автоматически.</p>'));
      
      var form = fEl('<form></form>');
      items.forEach(function(item, qi){
        var qb = fEl('<div class="question"><div class="q-text">' + (qi+1) + '. ' + fEsc(item.q) + '</div><div class="q-meta" style="font-size:11px;color:var(--muted);margin-bottom:8px">' + fEsc(item.topicCode) + '</div></div>');
        item.s.forEach(function(o, oi){ qb.appendChild(fEl('<label class="option"><input type="radio" name="fq' + qi + '" value="' + oi + '"><span>' + fEsc(o.opt) + '</span></label>')); });
        form.appendChild(qb);
      });
      var actions = fEl('<div class="test-actions"><button type="button" class="btn" id="feGradeBtn">Подвести итог</button></div>');
      var result = fEl('<div class="test-result"></div>');
      var report = fEl('<div class="test-report"></div>');
      form.appendChild(actions); form.appendChild(result); form.appendChild(report);
      intro.appendChild(form);

      var graded = false;
      var timerId = null;
      var r = FINAL_EXAM_TIME;

      // ФУНКЦИЯ АНТИ-ЧИТА
      function handleVisibilityChange() {
        if (document.hidden && !graded) {
          window.showToast("⚠️ Не переключайте вкладки во время экзамена! Штраф: -30 секунд.", "err");
          r = Math.max(0, r - 30); // Штраф 30 секунд
        }
      }
      document.addEventListener("visibilitychange", handleVisibilityChange);

      function grade(){
        if (graded) return;
        graded = true;
        
        // Отключаем анти-чит при сдаче
        document.removeEventListener("visibilitychange", handleVisibilityChange);

        if (timerId){ clearInterval(timerId); timerId = null; }
        var ok = 0; var wrong = [];
        items.forEach(function(item, qi){
          var ch = form.querySelector('input[name="fq' + qi + '"]:checked');
          var qb = form.querySelectorAll(".question")[qi];
          qb.querySelectorAll(".option").forEach(function(o){ o.classList.remove("correct"); o.classList.remove("wrong"); });
          if (ch){
            var idx = Number(ch.value);
            var opt = qb.querySelectorAll(".option")[idx];
            if (idx === item.correctIdx){ ok++; opt.classList.add("correct"); }
            else { opt.classList.add("wrong"); qb.querySelectorAll(".option")[item.correctIdx].classList.add("correct"); wrong.push({ q: item.q, u: item.s[idx].opt, c: item.options[item.correct], code: item.topicCode }); }
          } else {
            qb.querySelectorAll(".option")[item.correctIdx].classList.add("correct");
            wrong.push({ q: item.q, u: "(нет ответа)", c: item.options[item.correct], code: item.topicCode });
          }
        });
        var total = items.length;
        var pct = Math.round(ok / total * 100);
        var g = 2; if (pct >= 90) g = 5; else if (pct >= 75) g = 4; else if (pct >= 60) g = 3;
        
        result.textContent = "Верных: " + ok + " из " + total + " (" + pct + "%). Оценка: " + g + ".";
        result.className = "test-result " + (g >= 3 ? "ok" : "bad");
        var record = { ok: ok, total: total, pct: pct, grade: g, date: new Date().toISOString() };
        var st = fState(); if (st){ st.results = st.results || {}; st.results["__final_exam__"] = record; fSaveResults(); }
        try { localStorage.setItem(todayKey, JSON.stringify(record)); } catch(e){}
        fLogActivity("test", "Итоговый экзамен: " + ok + "/" + total + " (оценка " + g + ")");
        if (g === 5 && window.celebrate) window.celebrate();

        examUseFetch().then(function(done){ if (done){ report.appendChild(fEl('<p class="sub" style="margin-top:12px">✔ Попытка отмечена как использованная.</p>')); } });
        
        if (wrong.length){
          report.appendChild(fEl('<h3>Разбор ошибок</h3>'));
          wrong.forEach(function(w){ report.appendChild(fEl('<div class="error-item"><div class="error-q">' + fEsc(w.q) + '</div><div class="error-line" style="color:var(--muted);font-size:12px">' + fEsc(w.code) + '</div><div class="error-line error-bad">Ваш ответ: ' + fEsc(w.u) + '</div><div class="error-line error-ok">Верно: ' + fEsc(w.c) + '</div></div>')); });
        } else { report.appendChild(fEl('<p class="test-perfect">🎉 Все ответы верные!</p>')); }
        actions.querySelector("#feGradeBtn").disabled = true;
      }

      actions.querySelector("#feGradeBtn").addEventListener("click", grade);

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
  });
};

window.renderGCodeReferencePage = function(){
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = "";
  if (document.getElementById("crumbs")) document.getElementById("crumbs").textContent = "Справочник G/M-кодов";
  app.appendChild(fEl('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  var ref = window.GCODE_REFERENCE;
  if (!ref){ app.appendChild(fEl('<section class="module"><h2>Справочник недоступен</h2><p>Файл <code>data-extra.js</code> не подключён.</p></section>')); return; }
  app.appendChild(fEl('<section class="hero"><div class="meta">Справочные материалы</div><h1>Базовые G- и M-коды</h1><p>' + fEsc(ref.intro) + '</p></section>'));
  
  ref.groups.forEach(function(g){
    var block = fEl('<section class="module"><h2>' + fEsc(g.title) + '</h2><div class="gcode-ref-list"></div></section>');
    var list = block.querySelector(".gcode-ref-list");
    g.items.forEach(function(it){ list.appendChild(fEl('<div class="gcode-ref-item"><div class="gcode-ref-code">' + fEsc(it.code) + '</div><div class="gcode-ref-body"><div class="gcode-ref-name">' + fEsc(it.name) + '</div><div class="gcode-ref-desc">' + fEsc(it.desc) + '</div><div class="gcode-ref-example"><code>' + fEsc(it.example) + '</code></div></div></div>')); });
    app.appendChild(block);
  });
  
  var exBlock = fEl('<section class="module"><h2>Примеры программ</h2></section>');
  (ref.examples || []).forEach(function(ex){
    var box = fEl('<div class="gcode-example"><h3>' + fEsc(ex.title) + '</h3><pre class="gcode-view">' + fEsc(ex.code) + '</pre><div class="gcode-example-expl"><ul></ul></div></div>');
    var ul = box.querySelector("ul"); (ex.explanation || []).forEach(function(line){ ul.appendChild(fEl('<li>' + fEsc(line) + '</li>')); });
    exBlock.appendChild(box);
  });
  app.appendChild(exBlock);
};

function loadExamRequests(){
  if (!APPS_SCRIPT_URL) return Promise.resolve([]);
  var st = fState(); var role = (st && st.staff && st.staff.role) || ""; var user = (st && st.staff && st.staff.username) || "";
  var p = new URLSearchParams(); p.append("action", "examrequests"); p.append("userRole", role); p.append("username", user);
  return fetch(APPS_SCRIPT_URL + "?" + p.toString()).then(function(r){ return r.json(); }).then(function(d){ return (d && d.ok && d.requests) ? d.requests : []; }).catch(function(){ return []; });
}

function grantExamAttempt(key){
  if (!APPS_SCRIPT_URL) return Promise.resolve(false);
  var st = fState(); var role = (st && st.staff && st.staff.role) || ""; var user = (st && st.staff && st.staff.username) || "";
  var p = new URLSearchParams(); p.append("action", "examgrant"); p.append("userRole", role); p.append("username", user); p.append("key", key);
  return fetch(APPS_SCRIPT_URL, { method:"POST", body: p }).then(function(r){ return r.json(); }).then(function(d){ return d && d.ok; }).catch(function(){ return false; });
}

(function(){
  var orig = window.renderStaffPage;
  window.renderStaffPage = function(){
    if (typeof orig === "function") orig();
    var app = document.getElementById("app"); if (!app) return;
    var st = fState(); var role = st && st.staff && st.staff.role;
    if (role !== "teacher" && role !== "admin") return;

    var block = fEl('<section class="module"><h2>Запросы на дополнительные попытки экзамена</h2><p class="sub">Студент нажимает «Запросить попытку» — здесь появляется запрос. Нажмите «Выдать», чтобы увеличить лимит на 1.</p><div id="examReqBox"><div class="comment-empty">Загружаем…</div></div></section>');
    app.appendChild(block); var box = block.querySelector("#examReqBox");

    function refresh(){
      box.innerHTML = '<div class="comment-empty">Загружаем…</div>';
      loadExamRequests().then(function(list){
        box.innerHTML = ""; if (!list.length){ box.appendChild(fEl('<p class="sub">Запросов пока нет.</p>')); return; }
        list.forEach(function(req){
          var card = fEl('<div class="question-card pending"><div class="qhead"><span class="qmeta">' + fFmtRel(req.date) + ' · ' + fEsc(req.status) + '</span></div><div class="qtext"><b>' + fEsc(req.name) + '</b> · гр. ' + fEsc(req.group) + '<br><span style="color:var(--muted);font-size:13px">' + fEsc(req.comment || "—") + '</span></div><div class="test-actions"><button class="btn grant-btn">✅ Выдать попытку</button></div></div>');
          card.querySelector(".grant-btn").addEventListener("click", function(){
            var btn = card.querySelector(".grant-btn"); btn.disabled = true; btn.textContent = "Выдаём…";
            grantExamAttempt(req.key).then(function(ok){ if (ok){ btn.textContent = "✔ Выдано"; btn.classList.add("ghost"); setTimeout(refresh, 800); } else { btn.disabled = false; btn.textContent = "✅ Выдать попытку"; alert("Не удалось выдать попытку."); } });
          });
          box.appendChild(card);
        });
      });
    }
    refresh();
    var interval = setInterval(function(){ if (!document.body.contains(box)){ clearInterval(interval); return; } if (box.querySelector(".comment-empty")) refresh(); }, 30000);
  };
})();

console.log("[final.js] Готов. Вопросов: " + collectAllQuestions().length);