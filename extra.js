/* ============================================================
   МДК 07.01 — extra.js (v19.0 — TEACHER DASHBOARD & SMART SEARCH)
   ============================================================ */
"use strict";

window.renderDashboard = function(){
  var app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Статистика";
  app.appendChild(el('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  
  var isTeacher = state.staff && (state.staff.role === "teacher" || state.staff.role === "admin");
  
  if (isTeacher) {
    // ДАШБОРД УЧИТЕЛЯ
    var loadBox = el('<div class="skeleton" style="height:300px;"></div>'); app.appendChild(loadBox);
    fetch(APPS_SCRIPT_URL + "?action=teacherstats").then(r=>r.json()).then(d=>{
      loadBox.remove();
      if (!d.ok) return;
      
      // Онлайн
      app.appendChild(el(`<section class="module"><h2>👨‍🎓 Онлайн сейчас</h2><div style="font-size:36px;font-weight:bold;color:var(--ok)">${d.online}</div><p class="sub">студентов в сети (за последние 15 минут)</p></section>`));
      
      // График оценок
      app.appendChild(el(`<section class="module"><h2>🎓 Итоговый экзамен</h2><div style="max-width:400px;margin:0 auto;"><canvas id="examChart"></canvas></div></section>`));
      setTimeout(() => {
        var ctx = document.getElementById('examChart').getContext('2d');
        new Chart(ctx, {
          type: 'bar',
          data: { labels: ['Оценка 2', 'Оценка 3', 'Оценка 4', 'Оценка 5'], datasets: [{ label: 'Количество', data: d.examGrades, backgroundColor: ['#c0392b', '#f0b400', '#4a90d9', '#2d7a4f'] }] },
          options: { scales: { y: { beginAtZero: true } } }
        });
      }, 100);

      // Сложные темы
      var hardBox = el('<section class="module"><h2>🔥 Самые сложные темы</h2><div class="pw-list"></div></section>');
      d.hardestTopics.forEach(t => {
        hardBox.querySelector(".pw-list").appendChild(el(`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span>Тема ${t.topic}</span><b style="color:var(--err)">${t.count} ошибок</b></div>`));
      });
      app.appendChild(hardBox);
    });
  } else {
    // ДАШБОРД СТУДЕНТА (Прогресс)
    var totalTopics = 0, doneTopics = 0;
    COURSE.sections.forEach(sec => sec.topics.forEach(t => { totalTopics++; if ((state.progress[t.id]?.done || 0) >= 5) doneTopics++; }));
    app.appendChild(el(`<section class="module"><h2>📊 Мой прогресс</h2><div style="max-width:300px;margin:0 auto;"><canvas id="studentChart"></canvas></div></section>`));
    setTimeout(() => {
      var ctx = document.getElementById('studentChart').getContext('2d');
      new Chart(ctx, { type: 'doughnut', data: { labels: ['Пройдено', 'Осталось'], datasets: [{ data: [doneTopics, totalTopics-doneTopics], backgroundColor: ['#2d7a4f', '#e8e2d8'] }] }, options: { cutout: '70%' } });
    }, 100);
  }
};

// УМНЫЙ ПОИСК
function searchCourse(query){
  query = query.trim().toLowerCase(); if (query.length < 2) return [];
  var out = [];
  COURSE.sections.forEach(sec => { sec.topics.forEach(t => {
    if ((t.title + " " + t.code).toLowerCase().includes(query)) out.push({ title: t.code + " · " + t.title, id: t.id, tab: "lecture" });
    t.lectures.forEach(l => {
      var text = l.content ? l.content.replace(/<[^>]+>/g, " ").toLowerCase() : "";
      if (text.includes(query)) out.push({ title: l.code + ". " + l.title, snippet: text.substring(Math.max(0, text.indexOf(query)-30), text.indexOf(query)+50) + "...", id: t.id, tab: "lecture" });
    });
  }); });
  return out.slice(0, 20);
}
window.openSearch = function(){
  document.querySelectorAll(".search-overlay").forEach(x=>x.remove());
  var modal = el('<div class="search-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding-top:50px;"><div style="background:var(--card);width:90%;max-width:600px;border-radius:12px;padding:20px;"><input type="text" id="searchInput" placeholder="Поиск по тексту..." style="width:100%;padding:12px;font-size:18px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);"><div id="searchResults" style="margin-top:16px;max-height:400px;overflow-y:auto;"></div><button class="btn ghost" style="margin-top:16px;" id="searchClose">Закрыть</button></div></div>');
  document.body.appendChild(modal);
  var input = modal.querySelector("#searchInput"), res = modal.querySelector("#searchResults");
  input.focus();
  input.addEventListener("input", () => {
    res.innerHTML = ""; if (input.value.length < 2) return;
    searchCourse(input.value).forEach(r => {
      res.appendChild(el(`<div style="padding:10px;border-bottom:1px solid var(--border);cursor:pointer;" onclick="location.hash='#/topic/${r.id}/${r.tab}';document.querySelector('.search-overlay').remove();"><b>${r.title}</b><br><span style="font-size:12px;color:var(--muted);">${r.snippet||""}</span></div>`));
    });
  });
  modal.querySelector("#searchClose").addEventListener("click", ()=>modal.remove());
};