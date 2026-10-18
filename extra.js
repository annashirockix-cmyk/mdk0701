/* ============================================================
   МДК 07.01 — extra.js (v55.0 — FULL FEATURES)
   ============================================================ */
"use strict";

window.renderProfilePage = function() {
  const app = document.getElementById("app"); app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Личный кабинет";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  
  if (!state.student && !state.staff) return;
  var isStaff = !!state.staff;
  var name = isStaff ? state.staff.name : state.student.name;
  var group = isStaff ? "Сотрудник" : "Группа " + state.student.group;
  var role = isStaff ? "👨‍🏫" : "👨‍🎓";

  app.appendChild(el(`<div class="module" style="display:flex;gap:20px;align-items:center;padding:30px;">
    <div style="font-size:60px;background:var(--card-soft);width:100px;height:100px;display:flex;align-items:center;justify-content:center;border-radius:20px;">${role}</div>
    <div><h2 style="margin:0">${name}</h2><p style="color:var(--muted);margin:5px 0 0;">${group}</p></div>
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
    app.appendChild(el('<section class="module"><h2>📊 Панель преподавателя</h2><p>Данные доступны во вкладке "Журнал".</p></section>'));
    return;
  }

  // ГРАФИК
  app.appendChild(el(`<section class="module"><h2>📈 Мой прогресс</h2><div style="max-width:300px;margin:0 auto;"><canvas id="studentChart"></canvas></div></section>`));
  setTimeout(() => {
    new Chart(document.getElementById('studentChart').getContext('2d'), { type: 'doughnut', data: { labels: ['Пройдено', 'Осталось'], datasets: [{ data: [state.xp/10, 100 - (state.xp/10)], backgroundColor: ['#2d7a4f', '#e8e2d8'] }] }, options: { cutout: '70%' } });
  }, 100);

  // 25 ДОСТИЖЕНИЙ
  var achList = [
    { id: "t1", icon: "🥉", title: "Новичок", desc: "Первый вход" },
    { id: "t2", icon: "🎓", title: "Студент", desc: "Пройти 1 лекцию" },
    { id: "t3", icon: "📚", title: "Книжный червь", desc: "Пройти 5 лекций" },
    { id: "t4", icon: "🧠", title: "Умник", desc: "Пройти 10 лекций" },
    { id: "t5", icon: "🏆", title: "Знаток", desc: "Пройти 20 лекций" },
    { id: "t6", icon: "✍️", title: "Испытатель", desc: "Сдать 1 тест" },
    { id: "t7", icon: "📝", title: "Экзаменатор", desc: "Сдать 5 тестов" },
    { id: "t8", icon: "🎯", title: "Снайпер", desc: "Сдать 10 тестов" },
    { id: "t9", icon: "🔥", title: "В ударе", desc: "Сдать 20 тестов" },
    { id: "t10", icon: "🌟", title: "Звезда", desc: "Средний балл 4.0" },
    { id: "t11", icon: "💎", title: "Бриллиант", desc: "Средний балл 4.5" },
    { id: "t12", icon: "👑", title: "Король", desc: "Средний балл 5.0" },
    { id: "t13", icon: "💰", title: "Богач", desc: "Накопить 100 XP" },
    { id: "t14", icon: "💸", title: "Транжира", desc: "Купить в магазине" },
    { id: "t15", icon: "💬", title: "Болтун", desc: "Написать в чат" },
    { id: "t16", icon: "🗣", title: "Комментатор", desc: "Оставить отзыв" },
    { id: "t17", icon: "⏱", title: "Торопыга", desc: "Сдать тест за 2 мин" },
    { id: "t18", icon: "🦉", title: "Сова", desc: "Зайти после 00:00" },
    { id: "t19", icon: "🐓", title: "Ранняя пташка", desc: "Зайти до 06:00" },
    { id: "t20", icon: "🕹", title: "Геймер", desc: "Сыграть в крестики" },
    { id: "t21", icon: "⚙️", title: "Инженер", desc: "Открыть симулятор" },
    { id: "t22", icon: "📖", title: "Эрудит", desc: "Открыть глоссарий" },
    { id: "t23", icon: "🏋️", title: "Спортсмен", desc: "Пройти тренировку" },
    { id: "t24", icon: "🎓", title: "Выпускник", desc: "Сдать экзамен" },
    { id: "t25", icon: "🏅", title: "Легенда", desc: "Все достижения" }
  ];

  app.appendChild(el(`<section class="module"><h2>🏆 Мои достижения (${achList.length})</h2><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;" id="achGrid"></div></section>`));
  var grid = document.getElementById("achGrid");
  
  achList.forEach(a => {
    // Для простоты считаем, что если XP > 50, то ачивка открыта (визуальная имитация)
    var isUnlocked = state.xp > (a.id.replace("t","") * 10) || state.achievements[a.id];
    grid.appendChild(el(`<div style="background:var(--card-soft);border:1px solid ${isUnlocked ? 'var(--gold)' : 'var(--border)'};padding:16px;border-radius:12px;text-align:center;opacity:${isUnlocked ? '1' : '0.4'};"><div style="font-size:32px;margin-bottom:8px;">${isUnlocked ? a.icon : '🔒'}</div><div style="font-weight:bold;font-size:13px;">${a.title}</div><div style="font-size:11px;color:var(--muted);margin-top:4px;">${a.desc}</div></div>`));
  });
};

/* ЧАТ */
window.renderChatPage = function(){
  const app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Чат группы";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el(`<section class="module"><h2>Чат группы ${state.student ? state.student.group : ""}</h2><div id="chatLog" style="height:400px;overflow-y:auto;background:var(--card-soft);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:16px;"><div class="comment-empty">Загрузка сообщений...</div></div><form id="chatForm" style="display:flex;gap:10px;"><input type="text" id="chatInput" placeholder="Сообщение..." style="flex:1;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text)"><button type="submit" class="btn">Отправить</button></form></section>`));
  
  function loadChat() {
    var group = state.student ? state.student.group : "ALL";
    fetch(APPS_SCRIPT_URL + "?action=chatload&group=" + encodeURIComponent(group)).then(r=>r.json()).then(d=>{
      var log = document.getElementById("chatLog"); if(!log) return;
      log.innerHTML = "";
      if(d.ok && d.messages.length) {
        d.messages.forEach(m => {
          log.innerHTML += `<div style="margin-bottom:12px;background:var(--card);padding:8px 12px;border-radius:8px;border:1px solid var(--border);"><b style="color:var(--accent)">${m.name}</b> <span style="font-size:10px;color:var(--muted)">${new Date(m.date).toLocaleTimeString()}</span><br>${m.text}</div>`;
        });
        log.scrollTop = log.scrollHeight;
      } else {
        log.innerHTML = '<div class="comment-empty">Пока нет сообщений.</div>';
      }
    }).catch(()=>{ document.getElementById("chatLog").innerHTML = "Ошибка загрузки."; });
  }
  loadChat();

  document.getElementById("chatForm").onsubmit = (e)=>{
    e.preventDefault(); const t = document.getElementById("chatInput").value; if(!t) return;
    document.getElementById("chatInput").value = "";
    var p = new URLSearchParams();
    p.append("action", "chatsave"); p.append("group", state.student ? state.student.group : "ALL");
    p.append("key", studentKey()); p.append("name", state.student.name); p.append("avatar", "👨‍🎓"); p.append("text", t);
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p }).then(()=>loadChat());
  };
};

/* ОТЗЫВЫ */
window.renderCommentsPage = function(){
  const app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Отзывы";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el(`<section class="module"><h2>Отзывы о курсе</h2><div id="commentsList" style="margin-bottom:20px;"><div class="comment-empty">Загрузка...</div></div><form id="commentForm"><textarea id="commentText" placeholder="Напишите ваш отзыв..." style="width:100%;height:80px;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);margin-bottom:10px;"></textarea><button type="submit" class="btn">Отправить</button></form></section>`));

  function loadComments() {
    fetch(APPS_SCRIPT_URL + "?action=loadcomments").then(r=>r.json()).then(d=>{
      var list = document.getElementById("commentsList"); list.innerHTML = "";
      if(d.ok && d.comments.length) {
        d.comments.reverse().forEach(c => {
          list.innerHTML += `<div style="margin-bottom:12px;padding:16px;background:var(--card-soft);border-radius:12px;border:1px solid var(--border);"><b>${c.name}</b> <span style="font-size:12px;color:var(--muted)">${c.group}</span><p style="margin:8px 0 0;">${c.text}</p></div>`;
        });
      } else {
        list.innerHTML = '<div class="comment-empty">Пока нет отзывов.</div>';
      }
    }).catch(()=>{ document.getElementById("commentsList").innerHTML = "Ошибка загрузки."; });
  }
  loadComments();

  document.getElementById("commentForm").onsubmit = (e)=>{
    e.preventDefault(); const t = document.getElementById("commentText").value; if(t.length < 5) return alert("Слишком короткий отзыв");
    document.getElementById("commentText").value = "";
    var p = new URLSearchParams();
    p.append("action", "savecomment"); p.append("name", state.student ? state.student.name : "Гость");
    p.append("group", state.student ? state.student.group : "—"); p.append("text", t);
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p }).then(()=>loadComments());
  };
};