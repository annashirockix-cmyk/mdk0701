"use strict";

window.renderTrainingPage = function(mdkId) {
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = "";
  app.innerHTML = '<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>';

  if (!mdkId) {
    app.innerHTML += '<section class="hero"><h1>🎯 Тренировка перед экзаменом</h1><p>Выберите МДК</p></section>';
    Object.keys(window.MDK_DATA).forEach(function(id) {
      var c = window.MDK_DATA[id], count = 0;
      (c.sections || []).forEach(function(s){ (s.topics || []).forEach(function(t){ count += (t.test || []).length; }); });
      var card = document.createElement("a");
      card.href = "#/training/" + id;
      card.style.cssText = "display:block;padding:16px;margin-bottom:10px;background:var(--card);border:1px solid var(--border);border-radius:8px;color:var(--text);text-decoration:none;";
      card.innerHTML = "<b>" + (c.shortName || id) + "</b> · " + count + " вопросов<br><small style='color:var(--muted);'>" + c.title + "</small>";
      app.appendChild(card);
    });
    return;
  }

  var course = window.MDK_DATA[mdkId];
  if (!course) { app.innerHTML += "<p>МДК не найден.</p>"; return; }

  var all = [];
  (course.sections || []).forEach(function(s){ (s.topics || []).forEach(function(t){
    (t.test || []).forEach(function(q){ all.push(q); });
  }); });
  if (!all.length) { app.innerHTML += "<p>Нет вопросов.</p>"; return; }
  var questions = all.sort(function(){ return Math.random() - 0.5; });
  var idx = 0, correct = 0, answered = 0;

  app.innerHTML += '<section class="hero"><h1>🎯 ' + (course.shortName || mdkId) + '</h1><p>Вопросов: ' + questions.length + ' · ответ сразу</p></section>';
  var box = document.createElement("div"); box.className = "module training-box"; app.appendChild(box);

  function render() {
    if (idx >= questions.length) {
      box.innerHTML = "<h2>Тренировка завершена</h2><p>Верно: <b>" + correct + "</b> из <b>" + answered + "</b></p>"
        + '<a class="btn" href="#/final/' + mdkId + '" style="margin-right:8px;">Перейти к экзамену</a>'
        + '<a class="btn ghost" href="#/training/' + mdkId + '">Ещё раз</a>';
      return;
    }
    var q = questions[idx];
    var html = '<div style="font-weight:bold;margin-bottom:10px;">' + (idx+1) + '. ' + q.q + '</div>';
    q.options.forEach(function(opt, i){
      html += '<button class="tr-opt" data-i="' + i + '" style="display:block;width:100%;text-align:left;padding:10px;margin-bottom:8px;background:var(--card);border:1px solid var(--border);border-radius:6px;color:var(--text);cursor:pointer;">' + opt + '</button>';
    });
    html += '<div id="trFb" style="margin-top:10px;font-weight:bold;min-height:24px;"></div>';
    html += '<div style="margin-top:12px;"><button class="btn ghost" id="trSkip">Пропустить →</button></div>';
    box.innerHTML = html;
    box.querySelectorAll(".tr-opt").forEach(function(btn){
      btn.onclick = function(){
        var i = Number(btn.getAttribute("data-i"));
        var ok = i === q.correct;
        if (ok) correct++;
        answered++;
        box.querySelectorAll(".tr-opt").forEach(function(b){ b.disabled = true; b.style.opacity = 0.6; });
        btn.style.opacity = 1; btn.style.borderColor = ok ? "var(--ok)" : "var(--err)";
        var fb = box.querySelector("#trFb");
        fb.textContent = ok ? "✅ Верно!" : ("❌ Правильно: " + q.options[q.correct]);
        fb.style.color = ok ? "var(--ok)" : "var(--err)";
        setTimeout(function(){ idx++; render(); }, 900);
      };
    });
    box.querySelector("#trSkip").onclick = function(){ idx++; render(); };
  }
  render();
};

window.renderFinalPage = function(mdkId) {
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = "";
  app.innerHTML = '<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>';

  if (!mdkId) {
    app.innerHTML += '<section class="hero"><h1>📋 Итоговые экзамены</h1><p>10 вопросов · 10 минут на каждый МДК</p></section>';
    Object.keys(window.MDK_DATA).forEach(function(id) {
      var c = window.MDK_DATA[id], count = 0;
      (c.sections || []).forEach(function(s){ (s.topics || []).forEach(function(t){ count += (t.test || []).length; }); });
      var card = document.createElement("a");
      card.href = "#/final/" + id;
      card.style.cssText = "display:block;padding:16px;margin-bottom:10px;background:var(--card);border:1px solid var(--border);border-radius:8px;color:var(--text);text-decoration:none;";
      card.innerHTML = "<b>" + (c.shortName || id) + "</b> · банк " + count + " вопросов<br><small style='color:var(--muted);'>" + c.title + "</small>";
      app.appendChild(card);
    });
    return;
  }

  var course = window.MDK_DATA[mdkId];
  if (!course) { app.innerHTML += "<p>МДК не найден.</p>"; return; }
  var all = [];
  (course.sections || []).forEach(function(s){ (s.topics || []).forEach(function(t){
    (t.test || []).forEach(function(q){ all.push(q); });
  }); });
  if (all.length < 5) { app.innerHTML += "<p>Мало вопросов.</p>"; return; }

  app.innerHTML += '<section class="hero"><h1>📋 ' + (course.shortName || mdkId) + '</h1><p>10 вопросов · 10 минут</p></section>';
  var box = document.createElement("div"); box.className = "module"; app.appendChild(box);

  var startBtn = document.createElement("button");
  startBtn.className = "btn"; startBtn.textContent = "Начать экзамен"; startBtn.style.width = "100%";
  box.appendChild(startBtn);

  startBtn.onclick = function() {
    var picked = all.sort(function(){ return Math.random() - 0.5; }).slice(0, Math.min(10, all.length));
    var left = 600;

    box.innerHTML = '<div id="exTimer" style="font-size:20px;font-weight:bold;text-align:center;color:var(--accent);margin-bottom:16px;">10:00</div>';
    var form = document.createElement("form");
    picked.forEach(function(q, qi){
      var d = document.createElement("div");
      d.style.cssText = "margin-bottom:14px;padding:12px;background:var(--card);border-radius:8px;";
      var html = '<div style="font-weight:bold;margin-bottom:8px;">' + (qi+1) + '. ' + q.q + '</div>';
      q.options.forEach(function(o, oi){ html += '<label style="display:block;padding:5px;cursor:pointer;"><input type="radio" name="eq'+qi+'" value="'+oi+'"> '+o+'</label>'; });
      d.innerHTML = html; form.appendChild(d);
    });
    var done = document.createElement("button");
    done.type = "button"; done.className = "btn"; done.textContent = "Завершить";
    done.style.cssText = "width:100%;margin-top:16px;";
    form.appendChild(done); box.appendChild(form);

    var tEl = box.querySelector("#exTimer");
    var tid = setInterval(function(){
      left--;
      var m = Math.floor(left/60), s = left%60;
      tEl.textContent = (m<10?"0":"")+m+":"+(s<10?"0":"")+s;
      if (left <= 0) { clearInterval(tid); done.click(); }
    }, 1000);

    done.onclick = function() {
      clearInterval(tid);
      var correct = 0;
      picked.forEach(function(q, qi){
        var c = form.querySelector('input[name="eq'+qi+'"]:checked');
        if (c && Number(c.value) === q.correct) correct++;
      });
      var pct = Math.round(correct / picked.length * 100);
      var grade = pct >= 90 ? 5 : pct >= 75 ? 4 : pct >= 60 ? 3 : 2;
      window.state.results["__final__" + mdkId] = { grade: grade, total: correct, max: picked.length };
      window.addXP(grade * 20);
      window.saveStudentData();
      box.innerHTML = '<div class="exam-result">'
        + '<h2 style="font-size:48px;margin:0;color:' + (grade>=3?"var(--ok)":"var(--err)") + ';">' + grade + '</h2>'
        + '<p>Верно: <b>' + correct + '</b> из <b>' + picked.length + '</b> (' + pct + '%)</p>'
        + '<a class="btn" href="#/final">К экзаменам</a> <a class="btn ghost" href="#/training/' + mdkId + '" style="margin-left:8px;">Тренировка</a></div>';
    };
  };
};