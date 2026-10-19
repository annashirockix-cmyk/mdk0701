/* ============================================================
   МДК 07.01 — extra.js (v97.0 — ACHIEVEMENTS UI)
   ============================================================ */
"use strict";

// ... (renderProfilePage, renderChatPage, renderCommentsPage оставьте без изменений) ...

window.renderDashboard = function(){
  var app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Статистика";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  
  var isTeacher = state.staff && (state.staff.role === "teacher" || state.staff.role === "admin");
  if (isTeacher) {
    app.appendChild(el('<section class="module"><h2>📊 Панель преподавателя</h2><p>Данные доступны во вкладке "Журнал" и "Заявки".</p></section>'));
    return;
  }

  var jokes = [
      "Станок не прощает ошибок. Как и преподаватель.",
      "Если сомневаешься — жми G00. Но лучше не надо.",
      "Стружка в кармане — это не баг, это фича.",
      "Не работает? Проверь, включен ли станок в розетку.",
      "G-код — это язык, на котором говорят железки."
  ];
  var randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
  app.appendChild(el(`<div style="text-align:center; color:var(--muted); font-style:italic; margin-bottom:20px;">"${randomJoke}"</div>`));

  app.appendChild(el(`<section class="module" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px;">
    <div>
        <h2 style="margin:0 0 10px 0;">📈 Мой прогресс</h2>
        <div style="font-size:18px; color:var(--text-soft);">🔥 Серия входов: <b style="color:var(--accent); font-size:22px;">${state.loginStreak || 0}</b> дн.</div>
        <div style="font-size:18px; color:var(--text-soft); margin-top:5px;">🌟 Всего XP: <b style="color:var(--accent); font-size:22px;">${state.xp}</b></div>
    </div>
    <div style="max-width:200px; width:100%;"><canvas id="studentChart"></canvas></div>
  </section>`));
  
  setTimeout(() => {
    new Chart(document.getElementById('studentChart').getContext('2d'), { type: 'doughnut', data: { labels: ['Пройдено', 'Осталось'], datasets: [{ data: [state.xp/10, 100 - (state.xp/10)], backgroundColor: ['#2d7a4f', '#e8e2d8'] }] }, options: { cutout: '70%' } });
  }, 100);

  var achList = [
    { id: "t1", icon: "🥉", title: "Новичок", desc: "Накопить 50 XP", check: () => state.xp >= 50 },
    { id: "t2", icon: "🎓", title: "Студент", desc: "Накопить 200 XP", check: () => state.xp >= 200 },
    { id: "t3", icon: "📚", title: "Книжный червь", desc: "Накопить 500 XP", check: () => state.xp >= 500 },
    { id: "t4", icon: "🧠", title: "Умник", desc: "Накопить 1000 XP", check: () => state.xp >= 1000 },
    { id: "t5", icon: "🏆", title: "Знаток", desc: "Накопить 2500 XP", check: () => state.xp >= 2500 },
    { id: "t6", icon: "👑", title: "Мастер", desc: "Накопить 5000 XP", check: () => state.xp >= 5000 },
    { id: "t_ttt", icon: "❌", title: "Крестики", desc: "Победить станок", check: () => state.achievements && state.achievements['t_ttt'] },
    { id: "t_sudoku", icon: "🔢", title: "Судоку", desc: "Решить судоку", check: () => state.achievements && state.achievements['t_sudoku'] },
    { id: "t_sapper", icon: "💣", title: "Сапер", desc: "Разминировать поле", check: () => state.achievements && state.achievements['t_sapper'] },
    { id: "t_spider", icon: "🕷️", title: "Пасьянс", desc: "Собрать пасьянс", check: () => state.achievements && state.achievements['t_spider'] },
    { id: "t_deadly", icon: "💀", title: "Выживший", desc: "Победить в вечеринке", check: () => state.achievements && state.achievements['t_deadly'] },
    { id: "t_theme", icon: "🎨", title: "Стиляга", desc: "Купить тему", check: () => state.achievements && state.achievements['t_theme'] },
    { id: "t_avatar", icon: "🖼️", title: "Аватар", desc: "Установить аватар", check: () => state.achievements && state.achievements['t_avatar'] }
  ];

  app.appendChild(el(`<section class="module"><h2>🏆 Мои достижения (${achList.length})</h2><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;" id="achGrid"></div></section>`));
  var grid = document.getElementById("achGrid");
  
  achList.forEach(a => {
    var isUnlocked = a.check();
    if (isUnlocked && (!state.achievements || !state.achievements[a.id])) {
        if (!state.achievements) state.achievements = {};
        state.achievements[a.id] = true;
    }
    grid.appendChild(el(`<div style="background:var(--card-soft);border:1px solid ${isUnlocked ? 'var(--gold)' : 'var(--border)'};padding:16px;border-radius:12px;text-align:center;opacity:${isUnlocked ? '1' : '0.4'};"><div style="font-size:32px;margin-bottom:8px;">${isUnlocked ? a.icon : '🔒'}</div><div style="font-weight:bold;font-size:13px;">${a.title}</div><div style="font-size:11px;color:var(--muted);margin-top:4px;">${a.desc}</div></div>`));
  });
};