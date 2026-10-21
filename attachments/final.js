"use strict";

// 10 МИНУТ = 600 СЕКУНД
var FINAL_EXAM_SIZE = 10;
var FINAL_EXAM_TIME = 10 * 60; 

window.renderFinalExamPage = function(){
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = "";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>Итоговый экзамен</h1><p>10 вопросов · 10 минут. Предмет: ' + window.COURSE.shortName + '</p></section>'));

  var mount = el('<div class="module"><button class="btn" id="startBtn">🚀 Начать экзамен</button></div>');
  app.appendChild(mount);

  mount.querySelector("#startBtn").addEventListener("click", () => {
    mount.innerHTML = "";
    
    // Собираем вопросы только для текущего предмета
    var allQ = [];
    window.COURSE.sections.forEach(s => s.topics.forEach(t => {
        if(t.test) t.test.forEach(q => allQ.push(q));
    }));
    
    if (allQ.length < FINAL_EXAM_SIZE) {
        mount.innerHTML = "<p>Мало вопросов для экзамена.</p>"; return;
    }

    // Перемешиваем и берем 10
    allQ = allQ.sort(() => 0.5 - Math.random()).slice(0, FINAL_EXAM_SIZE);
    
    var form = el('<form></form>');
    var timerBox = el('<div style="font-size:24px;font-weight:bold;color:var(--err);margin-bottom:16px;">⏱ 10:00</div>');
    mount.appendChild(timerBox);

    allQ.forEach((item, qi) => {
      var qb = el(`<div class="question"><div class="q-text">${qi+1}. ${item.q}</div></div>`);
      item.options.forEach((opt, oi) => qb.appendChild(el(`<label class="option"><input type="radio" name="fq${qi}" value="${oi}"><span>${opt}</span></label>`)));
      form.appendChild(qb);
    });
    
    var gradeBtn = el('<button type="button" class="btn" style="width:100%; margin-top:20px;">Завершить</button>');
    form.appendChild(gradeBtn);
    mount.appendChild(form);

    var timeLeft = FINAL_EXAM_TIME;
    var tId = setInterval(() => {
      if (!document.body.contains(timerBox)) { clearInterval(tId); return; }
      timeLeft--;
      timerBox.textContent = `⏱ ${String(Math.floor(timeLeft/60)).padStart(2,'0')}:${String(timeLeft%60).padStart(2,'0')}`;
      if (timeLeft <= 0) gradeBtn.click();
    }, 1000);

    gradeBtn.addEventListener("click", () => {
      clearInterval(tId);
      var ok = 0;
      allQ.forEach((item, qi) => { 
        var ch = form.querySelector(`input[name="fq${qi}"]:checked`); 
        if (ch && Number(ch.value) === item.correct) ok++; 
      });
      var pct = Math.round(ok / allQ.length * 100);
      var g = pct >= 90 ? 5 : pct >= 75 ? 4 : pct >= 60 ? 3 : 2;
      
      window.state.results["__final_exam__"] = { grade: g, total: ok };
      window.saveStudentData();
      
      mount.innerHTML = `
        <div style="text-align:center; padding: 30px;">
          <h2>Результат (${window.COURSE.shortName})</h2>
          <p>Верных: <b>${ok}</b> из <b>${allQ.length}</b></p>
          <p style="font-size:28px; font-weight:bold; color:${g >= 3 ? 'var(--ok)' : 'var(--err)'};">Оценка: ${g}</p>
          <button class="btn" onclick="location.hash='#/'">На главную</button>
        </div>
      `;
    });
  });
};