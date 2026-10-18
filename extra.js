/* ============================================================
   МДК 07.01 — extra.js (v70.0)
   ============================================================ */
"use strict";

window.renderProfilePage = function() {
  const app = document.getElementById("app"); app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Личный кабинет";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  
  if (!state.student && !state.staff) return;
  var isStaff = !!state.staff;
  var name = isStaff ? state.staff.name : (state.nick || state.student.name);
  var group = isStaff ? "Сотрудник" : "Группа " + state.student.group;
  var role = isStaff ? "👨‍🏫" : (state.shop.includes("golden") ? "👑" : "👨‍🎓");
  var sign = state.sign ? `<p style="color:var(--accent); font-style:italic; margin-top:10px;">"${state.sign}"</p>` : "";

  app.appendChild(el(`<div class="module" style="display:flex;gap:20px;align-items:center;padding:30px;">
    <div style="font-size:60px;background:var(--card-soft);width:100px;height:100px;display:flex;align-items:center;justify-content:center;border-radius:20px;">${role}</div>
    <div><h2 style="margin:0">${name}</h2><p style="color:var(--muted);margin:5px 0 0;">${group}</p>${sign}</div>
  </div>`));
  
  if (!isStaff) {
    app.appendChild(el(`<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <a href="#/dashboard" class="btn" style="text-align:center;padding:15px;">📊 Статистика и Достижения</a>
      <a href="#/portfolio" class="btn ghost" style="text-align:center;padding:15px;">🎓 Портфолио</a>
    </div>`));
  }
};

window.renderDashboard = function(){
  var app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Статистика";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  
  var isTeacher = state.staff && (state.staff.role === "teacher" || state.staff.role === "admin");
  if (isTeacher) {
    app.appendChild(el('<section class="module"><h2>📊 Панель преподавателя</h2><p>Данные доступны во вкладке "Журнал" и "Заявки".</p></section>'));
    return;
  }

  // Прикол / Шутка
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

  // ТЯЖЕЛЫЕ ДОСТИЖЕНИЯ
  var achList = [
    { id: "t1", icon: "🥉", title: "Новичок", desc: "Первый вход", check: () => state.xp >= 10 },
    { id: "t2", icon: "🎓", title: "Студент", desc: "Накопить 50 XP", check: () => state.xp >= 50 },
    { id: "t3", icon: "📚", title: "Книжный червь", desc: "Накопить 100 XP", check: () => state.xp >= 100 },
    { id: "t4", icon: "🧠", title: "Умник", desc: "Накопить 500 XP", check: () => state.xp >= 500 },
    { id: "t5", icon: "🏆", title: "Знаток", desc: "Накопить 1000 XP", check: () => state.xp >= 1000 },
    { id: "t6", icon: "🔥", title: "В ударе", desc: "Серия входов 3 дня", check: () => state.loginStreak >= 3 },
    { id: "t7", icon: "🌟", title: "Звезда", desc: "Серия входов 7 дней", check: () => state.loginStreak >= 7 },
    { id: "t8", icon: "👑", title: "Король", desc: "Серия входов 30 дней", check: () => state.loginStreak >= 30 },
    { id: "t9", icon: "💰", title: "Богач", desc: "Купить что-то в магазине", check: () => state.shop.length > 0 },
    { id: "t10", icon: "🎯", title: "Снайпер", desc: "Сдать 5 тестов", check: () => Object.keys(state.results).length >= 5 },
    { id: "t11", icon: "🏹", title: "Меткий стрелок", desc: "Сдать 10 тестов", check: () => Object.keys(state.results).length >= 10 },
    { id: "t12", icon: "💀", title: "Выживший", desc: "Победить в Смертельной вечеринке", check: () => localStorage.getItem("mdk0701.survivor_leaderboard") !== null },
    { id: "t13", icon: "🤖", title: "Технарь", desc: "Написать УП в симуляторе", check: () => localStorage.getItem("mdk0701.simulator_used") === "true" }, // Пример
    { id: "t14", icon: "🗣", title: "Комментатор", desc: "Оставить отзыв", check: () => false }, // Проверка на сервере
    { id: "t15", icon: "💬", title: "Болтун", desc: "Написать в чат", check: () => false }
  ];

  app.appendChild(el(`<section class="module"><h2>🏆 Мои достижения (${achList.length})</h2><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;" id="achGrid"></div></section>`));
  var grid = document.getElementById("achGrid");
  
  achList.forEach(a => {
    var isUnlocked = (state.achievements && state.achievements[a.id]) || a.check();
    
    // Автоматически выдаем, если условие выполнено, но не сохранено
    if (isUnlocked && (!state.achievements || !state.achievements[a.id])) {
        if (!state.achievements) state.achievements = {};
        state.achievements[a.id] = true;
        // saveStudentData(); // Вызовет рекурсию, сохраним отдельно при следующем действии
    }

    grid.appendChild(el(`<div style="background:var(--card-soft);border:1px solid ${isUnlocked ? 'var(--gold)' : 'var(--border)'};padding:16px;border-radius:12px;text-align:center;opacity:${isUnlocked ? '1' : '0.4'};"><div style="font-size:32px;margin-bottom:8px;">${isUnlocked ? a.icon : '🔒'}</div><div style="font-weight:bold;font-size:13px;">${a.title}</div><div style="font-size:11px;color:var(--muted);margin-top:4px;">${a.desc}</div></div>`));
  });
};

// ... (renderChatPage, renderCommentsPage, renderRequestsPage без изменений) ...
// (Вставьте их из предыдущего ответа extra.js)