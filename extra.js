/* ============================================================
   МДК 07.01 — extra.js (v17.0)
   ============================================================ */
"use strict";

window.renderDashboard = function(){
  const app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Статистика";
  app.appendChild(el(`<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>`));
  
  var totalTopics = 0, doneTopics = 0;
  COURSE.sections.forEach(sec => sec.topics.forEach(t => { totalTopics++; if ((state.progress[t.id]?.done || 0) >= 5) doneTopics++; }));
  var percent = totalTopics ? Math.round((doneTopics / totalTopics) * 100) : 0;

  // ГРАФИК
  app.appendChild(el(`<section class="module"><h2>📊 Прогресс курса</h2><div style="max-width:300px;margin:0 auto;"><canvas id="progressChart"></canvas></div></section>`));
  
  setTimeout(() => {
    var ctx = document.getElementById('progressChart').getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Пройдено', 'Осталось'],
        datasets: [{ data: [percent, 100 - percent], backgroundColor: ['#2d7a4f', '#e8e2d8'], borderWidth: 0 }]
      },
      options: { cutout: '70%', plugins: { legend: { display: false } } }
    });
  }, 100);

  // ДОСТИЖЕНИЯ
  app.appendChild(el(`<section class="module"><h2>🏆 Мои достижения</h2><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:16px;" id="achGrid"></div></section>`));
  var grid = document.getElementById("achGrid");
  var allAch = [
    { id: "first_test", icon: "🥉", title: "Первый шаг", desc: "Сдан 1 тест" },
    { id: "worker", icon: "💪", title: "Трудяга", desc: "Пройдено 5 тем" },
    { id: "excellent", icon: "🎓", title: "Отличник", desc: "Средний балл > 4.5" },
    { id: "night_turner", icon: "🌙", title: "Ночной токарь", desc: "Зашел после 00:00" },
    { id: "flawless", icon: "💯", title: "Безошибочный", desc: "Экзамен на 5" },
    { id: "communicator", icon: "💬", title: "Коммуникатор", desc: "5 сообщений в чат" }
  ];
  allAch.forEach(a => {
    var unlocked = state.achievements && state.achievements[a.id];
    grid.appendChild(el(`<div style="background:var(--card-soft);border:1px solid ${unlocked ? 'var(--gold)' : 'var(--border)'};padding:16px;border-radius:12px;text-align:center;opacity:${unlocked ? '1' : '0.4'};"><div style="font-size:32px;margin-bottom:8px;">${unlocked ? a.icon : '🔒'}</div><div style="font-weight:bold;font-size:13px;">${a.title}</div><div style="font-size:11px;color:var(--muted);margin-top:4px;">${a.desc}</div></div>`));
  });
};

window.renderProfilePage = function() {
  const app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Личный кабинет";
  app.appendChild(el('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  if (!state.student && !state.staff) return;
  var isStaff = !!state.staff;
  var name = isStaff ? state.staff.name : state.student.name;
  var group = isStaff ? (state.staff.group || "Сотрудник") : ("Группа " + state.student.group);
  var role = isStaff ? (ROLE_LABELS[state.staff.role] || state.staff.role) : "🎓 Студент";
  var avatar = isStaff ? "👨‍🏫" : getAvatar();
  var xp = localStorage.getItem("mdk0701.xp") || "0";

  app.appendChild(el(`<div class="profile-card" style="display:flex;gap:20px;align-items:center;background:var(--card);padding:24px;border-radius:16px;border:1px solid var(--border);margin-bottom:24px;"><div style="font-size:60px;">${avatar}</div><div><h2 style="margin:0">${name}</h2><div style="color:var(--muted)">${group}</div><div style="margin-top:8px;font-weight:bold;color:var(--accent)">${role}</div><div style="margin-top:4px;font-weight:bold;color:var(--gold)">🌟 ${xp} XP</div></div></div>`));
  
  if (!isStaff) {
    app.appendChild(el(`<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;"><a href="#/dashboard" class="btn" style="text-align:center">📊 Статистика</a><a href="#/final-exam" class="btn ghost" style="text-align:center">🎓 Экзамен</a></div>`));
  }
};

window.renderChatPage = function(){
  const app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Чат группы";
  app.appendChild(el(`<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>`));
  app.appendChild(el(`<section class="module"><h2>Чат группы ${state.student ? state.student.group : ""}</h2><div style="height:300px;overflow-y:auto;background:var(--card-soft);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:16px;" id="chatLog"></div><form id="chatForm" style="display:flex;gap:10px;"><input type="text" id="chatInput" placeholder="Сообщение..." style="flex:1;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text)"><button type="submit" class="btn">Отправить</button></form></section>`));
  document.getElementById("chatForm").addEventListener("submit", (e)=>{ e.preventDefault(); const t = document.getElementById("chatInput").value; if(!t) return; document.getElementById("chatInput").value=""; document.getElementById("chatLog").appendChild(el(`<div style="margin-bottom:8px;"><b style="color:var(--accent)">Вы:</b> ${escapeHtml(t)}</div>`)); 
    let c = parseInt(localStorage.getItem("mdk0701.chat_count")||"0") + 1; localStorage.setItem("mdk0701.chat_count", c); checkAchievements();
  });
};

window.renderGalleryPage = function(){
  const app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Галерея";
  app.appendChild(el(`<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>`));
  app.appendChild(el(`<section class="module"><h2>Галерея работ</h2><p>Здесь будут отображаться загруженные файлы.</p></section>`));
};

window.renderGostsPage = function(){
  const app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "ГОСТы";
  app.appendChild(el(`<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>`));
  app.appendChild(el(`<section class="module"><h2>ГОСТы</h2><ul><li><a href="https://docs.cntd.ru/document/1200015818" target="_blank" style="color:var(--accent)">ГОСТ 18097-93</a></li><li><a href="https://docs.cntd.ru/document/1200015819" target="_blank" style="color:var(--accent)">ГОСТ 8-82</a></li></ul></section>`));
};