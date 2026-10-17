/* ============================================================
   МДК 07.01 — extra.js (v20.0)
   ============================================================ */
"use strict";

window.renderDashboard = function(){
  var app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Статистика";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  
  var isTeacher = state.staff && (state.staff.role === "teacher" || state.staff.role === "admin");
  
  if (isTeacher) {
    // ДАШБОРД УЧИТЕЛЯ
    var loadBox = el('<div class="skeleton" style="height:100px;"></div>'); app.appendChild(loadBox);
    
    // Форма объявлений
    var annForm = el(`<section class="module"><h2>📢 Доска объявлений</h2><textarea id="annText" style="width:100%;height:80px;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);margin-bottom:10px;" placeholder="Текст объявления..."></textarea><button class="btn" id="annBtn">Отправить</button></section>`);
    app.appendChild(annForm);
    annForm.querySelector("#annBtn").addEventListener("click", () => {
      var txt = annForm.querySelector("#annText").value;
      if(!txt) return;
      fetch(APPS_SCRIPT_URL, { method: "POST", body: new URLSearchParams({ action: "setannounce", text: txt }) }).then(()=>window.showToast("Объявление опубликовано!", "ok"));
    });

    fetch(APPS_SCRIPT_URL + "?action=teacherstats").then(r=>r.json()).then(d=>{
      loadBox.remove();
      if (!d.ok) return;
      app.appendChild(el(`<section class="module"><h2>👨‍🎓 Онлайн</h2><div style="font-size:36px;font-weight:bold;color:var(--ok)">${d.online}</div></section>`));
      app.appendChild(el(`<section class="module"><h2>🎓 Экзамен</h2><div style="max-width:400px;margin:0 auto;"><canvas id="examChart"></canvas></div></section>`));
      setTimeout(() => {
        new Chart(document.getElementById('examChart').getContext('2d'), {
          type: 'bar', data: { labels: ['2', '3', '4', '5'], datasets: [{ label: 'Количество', data: d.examGrades, backgroundColor: ['#c0392b', '#f0b400', '#4a90d9', '#2d7a4f'] }] }
        });
      }, 100);
    });
  } else {
    // ДАШБОРД СТУДЕНТА
    var totalTopics = 0, doneTopics = 0;
    COURSE.sections.forEach(sec => sec.topics.forEach(t => { totalTopics++; if ((state.progress[t.id]?.done || 0) >= 5) doneTopics++; }));
    app.appendChild(el(`<section class="module"><h2>📊 Мой прогресс</h2><div style="max-width:300px;margin:0 auto;"><canvas id="studentChart"></canvas></div></section>`));
    setTimeout(() => {
      new Chart(document.getElementById('studentChart').getContext('2d'), { 
        type: 'doughnut', data: { labels: ['Пройдено', 'Осталось'], datasets: [{ data: [doneTopics, totalTopics-doneTopics], backgroundColor: ['#2d7a4f', '#e8e2d8'] }] }, options: { cutout: '70%' } 
      });
    }, 100);
  }
};