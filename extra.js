/* ============================================================
   МДК 07.01 — extra.js (v21.1)
   ============================================================ */
"use strict";

window.renderProfilePage = function() {
  const app = document.getElementById("app"); app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Профиль";
  app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
  
  var isStaff = !!state.staff;
  var name = isStaff ? state.staff.name : (state.student ? state.student.name : "Гость");
  var group = isStaff ? "Учитель" : (state.student ? "Группа " + state.student.group : "—");
  var role = isStaff ? "👨‍🏫" : "👨‍🎓";
  
  app.appendChild(el(`<div class="module" style="display:flex;gap:20px;align-items:center;padding:30px;">
    <div style="font-size:60px;background:var(--card-soft);width:100px;height:100px;display:flex;align-items:center;justify-content:center;border-radius:20px;">${role}</div>
    <div><h2 style="margin:0">${name}</h2><p style="color:var(--muted);margin:5px 0 0;">${group}</p></div>
  </div>`));
  
  if (!isStaff) {
    app.appendChild(el(`<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <a href="#/dashboard" class="btn" style="text-align:center;padding:15px;">📊 Моя статистика</a>
      <a href="#/portfolio" class="btn ghost" style="text-align:center;padding:15px;">🎓 Портфолио</a>
    </div>`));
  }
};

window.renderDashboard = function(){
  var app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Статистика";
  app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
  
  var isTeacher = state.staff && (state.staff.role === "teacher" || state.staff.role === "admin");
  
  if (isTeacher) {
    var annForm = el(`<section class="module"><h2>📢 Объявления</h2><textarea id="annText" style="width:100%;height:80px;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);margin-bottom:10px;" placeholder="Текст объявления..."></textarea><button class="btn" id="annBtn">Отправить</button></section>`);
    app.appendChild(annForm);
    annForm.querySelector("#annBtn").addEventListener("click", () => {
      var txt = annForm.querySelector("#annText").value;
      if(!txt) return;
      fetch(APPS_SCRIPT_URL, { method: "POST", body: new URLSearchParams({ action: "setannounce", text: txt }) }).then(()=>window.showToast("Опубликовано!", "ok"));
    });

    fetch(APPS_SCRIPT_URL + "?action=teacherstats").then(r=>r.json()).then(d=>{
      if (!d.ok) return;
      app.appendChild(el(`<section class="module"><h2>🎓 Экзамен</h2><div style="max-width:400px;margin:0 auto;"><canvas id="examChart"></canvas></div></section>`));
      setTimeout(() => {
        new Chart(document.getElementById('examChart').getContext('2d'), {
          type: 'bar', data: { labels: ['2', '3', '4', '5'], datasets: [{ label: 'Количество', data: d.examGrades, backgroundColor: ['#c0392b', '#f0b400', '#4a90d9', '#2d7a4f'] }] }
        });
      }, 100);
    });
  } else {
    var totalTopics = 0, doneTopics = 0;
    COURSE.sections.forEach(sec => sec.topics.forEach(t => { totalTopics++; if ((state.progress[t.id]?.done || 0) >= 5) doneTopics++; }));
    app.appendChild(el(`<section class="module"><h2>📊 Мой прогресс</h2><div style="max-width:300px;margin:0 auto;"><canvas id="studentChart"></canvas></div></section>`));
    setTimeout(() => {
      new Chart(document.getElementById('studentChart').getContext('2d'), { type: 'doughnut', data: { labels: ['Пройдено', 'Осталось'], datasets: [{ data: [doneTopics, totalTopics-doneTopics], backgroundColor: ['#2d7a4f', '#e8e2d8'] }] }, options: { cutout: '70%' } });
    }, 100);
  }
};