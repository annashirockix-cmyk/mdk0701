/* ============================================================
   МДК 07.01 — final.js (v17.0)
   ============================================================ */
"use strict";

var FINAL_EXAM_SIZE = 25;
var FINAL_EXAM_TIME = 30 * 60;

function fGetCourse(){ try { return COURSE; } catch (e){} return null; }
function fState(){ return state; }
function fStudentKey(){ return studentKey(); }
function fEl(html){ var t = document.createElement("template"); t.innerHTML = String(html).trim(); return t.content.firstChild; }
function fEsc(s){ return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function fShuffle(a){ var r = a.slice(); for (var i = r.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)); var t = r[i]; r[i] = r[j]; r[j] = t; } return r; }

function collectAllQuestions(){
  var out = []; var c = fGetCourse(); if (!c) return out;
  c.sections.forEach(sec => { (sec.topics || []).forEach(t => { (t.test || []).forEach((q, qi) => { out.push({ q: q.q, options: q.options, correct: q.correct, topicCode: t.code, uid: t.id + "_" + qi }); }); }); });
  return out;
}

window.renderFinalTrainingPage = function(){
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Тренировка";
  var all = collectAllQuestions();
  app.appendChild(fEl('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  app.appendChild(fEl('<section class="hero"><h1>Тренировка</h1><p>Без таймера и оценок. Для самопроверки.</p></section>'));
  if (!all.length) return;

  var form = fEl('<form></form>');
  fShuffle(all).forEach((item, qi) => {
    var qb = fEl('<div class="question"><div class="q-text">'+(qi+1)+'. '+fEsc(item.q)+'</div></div>');
    var opts = fShuffle(item.options.map((o, i) => ({ text: o, isCorrect: i === item.correct })));
    opts.forEach(o => qb.appendChild(fEl('<label class="option"><input type="radio" name="ft'+qi+'" '+(o.isCorrect?'data-correct="1"':'')+'><span>'+fEsc(o.text)+'</span></label>')));
    var fb = fEl('<div class="train-feedback" style="margin-top:8px;font-weight:bold;"></div>');
    qb.querySelectorAll("input").forEach(inp => {
      inp.addEventListener("change", () => {
        var isCor = inp.dataset.correct === "1";
        fb.textContent = isCor ? "✔ Верно!" : "✘ Неверно";
        fb.style.color = isCor ? "var(--ok)" : "var(--err)";
      });
    });
    qb.appendChild(fb);
    form.appendChild(qb);
  });
  app.appendChild(form);
};

window.renderFinalExamPage = function(){
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Экзамен";
  var all = collectAllQuestions();
  app.appendChild(fEl('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  app.appendChild(fEl('<section class="hero"><h1>Итоговый экзамен</h1><p>25 вопросов · 30 минут.</p></section>'));

  if (all.length < FINAL_EXAM_SIZE) { app.appendChild(fEl('<div class="module">Мало вопросов в базе.</div>')); return; }

  var mount = fEl('<div class="module"><button class="btn" id="startBtn">🚀 Начать экзамен</button></div>');
  app.appendChild(mount);
  mount.querySelector("#startBtn").addEventListener("click", () => {
    mount.innerHTML = "";
    var items = fShuffle(all).slice(0, FINAL_EXAM_SIZE);
    var form = fEl('<form></form>');
    var timerBox = fEl('<div style="font-size:24px;font-weight:bold;color:var(--err);margin-bottom:16px;">⏱ 30:00</div>');
    mount.appendChild(timerBox);

    items.forEach((item, qi) => {
      var qb = fEl('<div class="question"><div class="q-text">'+(qi+1)+'. '+fEsc(item.q)+'</div></div>');
      item.options.forEach((opt, oi) => qb.appendChild(fEl('<label class="option"><input type="radio" name="fq'+qi+'" value="'+oi+'"><span>'+fEsc(opt)+'</span></label>')));
      form.appendChild(qb);
    });
    var gradeBtn = fEl('<button type="button" class="btn" style="width:100%">Завершить</button>');
    form.appendChild(gradeBtn);
    mount.appendChild(form);

    var timeLeft = FINAL_EXAM_TIME;
    var tId = setInterval(() => {
      if (!document.body.contains(timerBox)) { clearInterval(tId); return; }
      timeLeft--;
      timerBox.textContent = "⏱ " + String(Math.floor(timeLeft/60)).padStart(2,'0') + ":" + String(timeLeft%60).padStart(2,'0');
      if (timeLeft <= 0) gradeBtn.click();
    }, 1000);

    gradeBtn.addEventListener("click", () => {
      clearInterval(tId);
      var ok = 0;
      items.forEach((item, qi) => { var ch = form.querySelector(`input[name="fq${qi}"]:checked`); if (ch && Number(ch.value) === item.correct) ok++; });
      var pct = Math.round(ok / items.length * 100);
      var g = pct >= 90 ? 5 : pct >= 75 ? 4 : pct >= 60 ? 3 : 2;
      
      state.results["__final_exam__"] = { grade: g, total: ok, date: new Date().toISOString() };
      saveStudentData(); scheduleCloudSave(); checkAchievements();

      mount.innerHTML = `<h2>Результат: ${ok} из ${items.length} (Оценка: ${g})</h2><button class="btn" onclick="location.hash='#/profile'">В профиль</button>`;
      if (g === 5 && window.celebrate) window.celebrate();
    });
  });
};

window.renderGCodeReferencePage = function(){
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Справочник";
  app.appendChild(fEl('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  var ref = window.GCODE_REFERENCE || { groups: [], examples: [] };
  ref.groups.forEach(g => {
    var block = fEl('<section class="module"><h2>'+fEsc(g.title)+'</h2><div class="gcode-ref-list"></div></section>');
    g.items.forEach(it => block.querySelector(".gcode-ref-list").appendChild(fEl(`<div class="gcode-ref-item"><div class="gcode-ref-code">${fEsc(it.code)}</div><div><div class="gcode-ref-name">${fEsc(it.name)}</div><div class="gcode-ref-desc">${fEsc(it.desc)}</div><div class="gcode-ref-example"><code>${fEsc(it.example)}</code></div></div></div>`)));
    app.appendChild(block);
  });
};