/* ============================================================
   МДК 07.01 — extra.js (v86.0 — CUSTOM TIME & PERIODS)
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
  var role = isStaff ? "👨‍🏫" : ((state.shop.includes("golden") || state.staff) ? "👑" : "👨‍🎓");
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
  } else {
      app.appendChild(el(`<div class="module" style="background:var(--accent-soft); border-color:var(--accent);">
          <h3 style="margin-top:0; color:var(--accent);">Панель преподавателя</h3>
          <p>Вам доступны все премиум-функции (темы, ники, аватары) без затрат XP.</p>
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
    { id: "t13", icon: "🤖", title: "Технарь", desc: "Написать УП в симуляторе", check: () => localStorage.getItem("mdk0701.simulator_used") === "true" },
    { id: "t14", icon: "🗣", title: "Комментатор", desc: "Оставить отзыв", check: () => false },
    { id: "t15", icon: "💬", title: "Болтун", desc: "Написать в чат", check: () => false }
  ];

  app.appendChild(el(`<section class="module"><h2>🏆 Мои достижения (${achList.length})</h2><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;" id="achGrid"></div></section>`));
  var grid = document.getElementById("achGrid");
  
  achList.forEach(a => {
    var isUnlocked = (state.achievements && state.achievements[a.id]) || a.check();
    if (isUnlocked && (!state.achievements || !state.achievements[a.id])) {
        if (!state.achievements) state.achievements = {};
        state.achievements[a.id] = true;
    }
    grid.appendChild(el(`<div style="background:var(--card-soft);border:1px solid ${isUnlocked ? 'var(--gold)' : 'var(--border)'};padding:16px;border-radius:12px;text-align:center;opacity:${isUnlocked ? '1' : '0.4'};"><div style="font-size:32px;margin-bottom:8px;">${isUnlocked ? a.icon : '🔒'}</div><div style="font-weight:bold;font-size:13px;">${a.title}</div><div style="font-size:11px;color:var(--muted);margin-top:4px;">${a.desc}</div></div>`));
  });
};

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

window.renderRequestsPage = function() {
    var app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Заявки";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    
    if (!state.staff) { app.appendChild(el('<div class="module">Доступно только преподавателям.</div>')); return; }
    
    app.appendChild(el('<section class="hero"><h1>Входящие заявки</h1><p>Проверка практических работ и выдача попыток.</p></section>'));
    var container = el('<section class="module"><div class="skeleton" style="height:100px;"></div></section>');
    app.appendChild(container);

    fetch(APPS_SCRIPT_URL + "?action=getstudents").then(r => r.json()).then(d => {
        container.innerHTML = "";
        if (!d.ok || !d.students.length) { container.innerHTML = "Студентов пока нет."; return; }
        
        var hasRequests = false;

        d.students.forEach(s => {
            try {
                var p = JSON.parse(s.payload || "{}");
                var sKey = (s.name + "|" + s.group).toLowerCase();
                
                if (p.practicalsDone) {
                    Object.keys(p.practicalsDone).forEach(topicId => {
                        Object.keys(p.practicalsDone[topicId]).forEach(code => {
                            if (p.practicalsDone[topicId][code] === "pending") {
                                hasRequests = true;
                                var topic = findTopic(topicId);
                                var tName = topic ? topic.topic.title : topicId;
                                
                                var reqCard = el(`<div class="module" style="border-left:4px solid var(--accent); padding:16px; margin-bottom:12px;" id="req_${topicId}_${code}">
                                    <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;">
                                        <div>
                                            <b>${s.name}</b> (гр. ${s.group})<br>
                                            <span style="color:var(--muted); font-size:13px;">Сдал практическую: ${tName} (${code})</span>
                                        </div>
                                        <div style="display:flex; gap:10px; align-items:center;">
                                            <select id="grade_${topicId}_${code}" style="padding:8px; border-radius:6px; border:1px solid var(--border); background:var(--bg); color:var(--text);">
                                                <option value="5">Оценка 5</option>
                                                <option value="4">Оценка 4</option>
                                                <option value="3">Оценка 3</option>
                                                <option value="2">Оценка 2</option>
                                            </select>
                                            <button class="btn" onclick="window.approvePractical('${sKey}', '${topicId}', '${code}', document.getElementById('grade_${topicId}_${code}').value)">Подтвердить</button>
                                        </div>
                                    </div>
                                </div>`);
                                container.appendChild(reqCard);
                            }
                        });
                    });
                }

                if (p.requests) {
                    Object.keys(p.requests).forEach(reqKey => {
                        if (p.requests[reqKey] === "pending") {
                            hasRequests = true;
                            var parts = reqKey.split("_");
                            var topicId = parts[0];
                            var type = parts[1];
                            var typeName = type === "test" ? "Тест" : "Сам. работа";
                            var topic = findTopic(topicId);
                            var tName = topic ? topic.topic.title : topicId;

                            var reqCard = el(`<div class="module" style="border-left:4px solid #d97706; padding:16px; margin-bottom:12px;" id="req_${reqKey}">
                                <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;">
                                    <div>
                                        <b>${s.name}</b> (гр. ${s.group})<br>
                                        <span style="color:var(--muted); font-size:13px;">Просит доп. попытку: ${tName} (${typeName})</span>
                                    </div>
                                    <div>
                                        <button class="btn" style="background:#d97706;" onclick="window.approveAttempt('${sKey}', '${reqKey}')">Выдать попытку</button>
                                    </div>
                                </div>
                            </div>`);
                            container.appendChild(reqCard);
                        }
                    });
                }

            } catch(e) {}
        });

        if (!hasRequests) {
            container.innerHTML = '<div style="text-align:center; padding:40px; color:var(--muted);"><h3>Заявок пока нет 🎉</h3><p>Все проверено!</p></div>';
        }
    }).catch(() => { container.innerHTML = "Ошибка загрузки."; });
};

window.renderSchedulePage = function() {
    var app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Расписание";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    app.appendChild(el('<section class="hero"><h1>Расписание занятий</h1><p>Осенний семестр 2026-2027</p></section>'));

    var isTeacher = state.staff && (state.staff.role === "teacher" || state.staff.role === "admin");
    
    // СТАНДАРТНЫЕ ПАРЫ И НУЛЕВОЙ УРОК
    var pairs = [
        { num: "0", time: "08:00 - 08:30" },
        { num: "1", time: "08:40 - 10:15" },
        { num: "2", time: "10:25 - 12:00" },
        { num: "3", time: "12:30 - 14:05" },
        { num: "4", time: "14:15 - 15:50" },
        { num: "5", time: "16:00 - 17:35" },
        { num: "6", time: "17:45 - 19:20" }
    ];

    // ПАНЕЛЬ УЧИТЕЛЯ (ДОБАВЛЕНИЕ)
    if (isTeacher) {
        var formBlock = el(`<section class="module" style="background:var(--accent-soft); border-color:var(--accent);">
            <h3 style="margin-top:0; color:var(--accent);">Добавить занятие</h3>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:10px;">
                <div>
                    <label style="font-size:12px;color:var(--muted);">Дата</label>
                    <input id="schDate" type="date" class="self-input" style="margin:0; width:100%;">
                </div>
                <div>
                    <label style="font-size:12px;color:var(--muted);">Пара</label>
                    <select id="schPeriod" class="self-input" style="margin:0; width:100%;">
                        ${pairs.map(p => `<option value="${p.num}" data-time="${p.time}">${p.num} пара</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label style="font-size:12px;color:var(--muted);">Время (редактируемое)</label>
                    <input id="schTime" type="text" class="self-input" style="margin:0; width:100%;" value="08:00 - 08:30">
                </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:10px;">
                <div>
                    <label style="font-size:12px;color:var(--muted);">Группа</label>
                    <input id="schGroup" type="text" class="self-input" style="margin:0; width:100%;" placeholder="ТМП 4-3">
                </div>
                <div>
                    <label style="font-size:12px;color:var(--muted);">Предмет</label>
                    <input id="schSubject" type="text" class="self-input" style="margin:0; width:100%;" placeholder="Разработка ТП">
                </div>
                <div>
                    <label style="font-size:12px;color:var(--muted);">Преподаватель</label>
                    <input id="schTeacher" type="text" class="self-input" style="margin:0; width:100%;" placeholder="Никитин">
                </div>
            </div>
            <button class="btn" id="addSchBtn" style="width:100%; margin-top:10px;">Добавить в расписание</button>
        </section>`);
        app.appendChild(formBlock);

        // Обработчик смены пары (подставляет время)
        formBlock.querySelector("#schPeriod").onchange = function() {
            var opt = this.options[this.selectedIndex];
            document.getElementById("schTime").value = opt.getAttribute("data-time");
        };

        formBlock.querySelector("#addSchBtn").onclick = function() {
            var date = document.getElementById("schDate").value;
            var period = document.getElementById("schPeriod").value;
            var time = document.getElementById("schTime").value.trim();
            var group = document.getElementById("schGroup").value.trim();
            var subject = document.getElementById("schSubject").value.trim();
            var teacher = document.getElementById("schTeacher").value.trim();
            
            if (!date || !group || !subject || !time) { alert("Заполните дату, группу, предмет и время!"); return; }
            
            var p = new URLSearchParams();
            p.append("action", "saveschedule"); p.append("mode", "add");
            p.append("date", date); p.append("period", period); p.append("time", time);
            p.append("group", group); p.append("subject", subject); p.append("teacher", teacher);
            
            window.showToast("Сохранение...", "info");
            fetch(APPS_SCRIPT_URL, { method: "POST", body: p }).then(r => r.json()).then(res => {
                if(res.ok) { window.showToast("Занятие добавлено!", "ok"); renderSchedulePage(); }
                else window.showToast("Ошибка сохранения", "err");
            });
        };
    }

    // ПАНЕЛЬ ФИЛЬТРОВ
    var filterBlock = el(`<section class="module" style="margin-bottom:16px;">
        <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
            <div style="flex:1;">
                <label style="font-size:12px;color:var(--muted);">Фильтр по группе</label>
                <input id="filterGroup" type="text" class="self-input" style="margin:0; width:100%;" placeholder="Все группы">
            </div>
            <div style="flex:1;">
                <label style="font-size:12px;color:var(--muted);">Фильтр по дате</label>
                <input id="filterDate" type="date" class="self-input" style="margin:0; width:100%;">
            </div>
            <div>
                <button class="btn ghost" id="resetFilterBtn" style="margin-top:18px;">Сбросить</button>
            </div>
        </div>
    </section>`);
    app.appendChild(filterBlock);

    var schedBlock = el('<section class="module"><div id="scheduleWrap" style="text-align:center; padding:20px;"><div class="skeleton" style="height:100px;"></div></div></section>');
    app.appendChild(schedBlock);
    var wrap = schedBlock.querySelector("#scheduleWrap");

    fetch(APPS_SCRIPT_URL + "?action=getschedules").then(r => r.json()).then(d => {
        
        function renderFiltered(filterG, filterD) {
            wrap.innerHTML = "";
            var schedule = d.schedule || [];
            
            if (schedule.length === 0) {
                wrap.innerHTML = '<div style="text-align:center; padding:40px; color:var(--muted);">Расписание пока пусто.</div>';
                return;
            }

            var filtered = schedule.filter(x => {
                var rowDate = x[0] || "";
                var rowGroup = (x[3] || "").toLowerCase();
                var matchGroup = filterG ? rowGroup.includes(filterG.toLowerCase()) : true;
                var matchDate = filterD ? rowDate === filterD : true;
                return matchGroup && matchDate;
            });

            if (filtered.length === 0) {
                wrap.innerHTML = '<div style="text-align:center; padding:40px; color:var(--muted);">По вашему запросу занятий нет.</div>';
                return;
            }

            filtered.sort((a, b) => {
                if (a[0] !== b[0]) return a[0].localeCompare(b[0]);
                return parseInt(a[1]) - parseInt(b[1]);
            });

            var html = '<div style="overflow-x:auto;"><table style="width:100%; border-collapse:collapse; font-size:14px;">';
            html += '<thead><tr>';
            html += '<th style="border:1px solid var(--border); padding:10px; text-align:left; background:var(--card-soft);">Дата / День</th>';
            html += '<th style="border:1px solid var(--border); padding:10px; text-align:left; background:var(--card-soft);">Пара / Время</th>';
            html += '<th style="border:1px solid var(--border); padding:10px; text-align:left; background:var(--card-soft);">Группа</th>';
            html += '<th style="border:1px solid var(--border); padding:10px; text-align:left; background:var(--card-soft);">Предмет</th>';
            html += '<th style="border:1px solid var(--border); padding:10px; text-align:left; background:var(--card-soft);">Преподаватель</th>';
            if (isTeacher) html += '<th style="border:1px solid var(--border); padding:10px; text-align:center; background:var(--card-soft);"></th>';
            html += '</tr></thead><tbody>';

            var daysOfWeek = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

            filtered.forEach(item => {
                var dateStr = item[0]; 
                var period = item[1];
                var time = item[2];
                var group = item[3];
                var subject = item[4];
                var teacher = item[5];

                var dateObj = new Date(dateStr);
                var dayName = daysOfWeek[dateObj.getDay()];
                var displayDate = dateStr.split('-').reverse().join('.');

                html += `<tr>
                    <td style="border:1px solid var(--border); padding:10px;"><b>${displayDate}</b><br><span style="font-size:12px;color:var(--muted);">${dayName}</span></td>
                    <td style="border:1px solid var(--border); padding:10px;"><b>${period}</b> пара<br><span style="font-size:12px;color:var(--muted);">${time}</span></td>
                    <td style="border:1px solid var(--border); padding:10px; font-weight:bold; color:var(--accent);">${group}</td>
                    <td style="border:1px solid var(--border); padding:10px;">${subject}</td>
                    <td style="border:1px solid var(--border); padding:10px;">${teacher}</td>`;
                
                if (isTeacher) {
                    html += `<td style="border:1px solid var(--border); padding:10px; text-align:center;">
                        <button class="btn ghost" style="padding:4px 8px; border-color:var(--err); color:var(--err); font-size:12px;" onclick="window.deleteScheduleItem('${dateStr}', '${period}', '${group}')">✕</button>
                    </td>`;
                }
                html += `</tr>`;
            });

            html += '</tbody></table></div>';
            wrap.innerHTML = html;
        }

        renderFiltered("", "");

        var fG = document.getElementById("filterGroup");
        var fD = document.getElementById("filterDate");
        var rB = document.getElementById("resetFilterBtn");

        if (fG) fG.oninput = () => renderFiltered(fG.value, fD.value);
        if (fD) fD.onchange = () => renderFiltered(fG.value, fD.value);
        if (rB) rB.onclick = () => { fG.value = ""; fD.value = ""; renderFiltered("", ""); };

    }).catch(() => { wrap.innerHTML = "Ошибка загрузки расписания."; });
};

window.deleteScheduleItem = function(date, period, group) {
    if(!confirm("Удалить эту пару?")) return;
    var p = new URLSearchParams();
    p.append("action", "saveschedule"); p.append("mode", "delete");
    p.append("date", date); p.append("period", period); p.append("group", group);
    
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p }).then(r => r.json()).then(res => {
        if(res.ok) { 
            window.showToast("Пара удалена", "info"); 
            window.renderSchedulePage(); 
        }
    });
};

window.renderNotificationsPage = function() {
    var app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Уведомления";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    app.appendChild(el('<section class="hero"><h1>Центр уведомлений</h1></section>'));

    if (state.notifications) {
        state.notifications.forEach(n => n.read = true);
        saveStudentData();
        updateNotifBadge();
    }

    var block = el('<section class="module"><div id="notifList" style="display:flex; flex-direction:column; gap:12px;"></div></section>');
    app.appendChild(block);
    var list = block.querySelector("#notifList");

    if (!state.notifications || state.notifications.length === 0) {
        list.innerHTML = '<div style="text-align:center; padding:40px; color:var(--muted);"><h3>Уведомлений пока нет</h3><p>Здесь будут появляться сообщения об оценках, изменениях в расписании и начислениях XP.</p></div>';
        return;
    }

    state.notifications.forEach(n => {
        var icon = "ℹ️";
        var color = "var(--accent)";
        if (n.type === "ok") { icon = "✅"; color = "var(--ok)"; }
        if (n.type === "err") { icon = "❌"; color = "var(--err)"; }
        if (n.text.includes("XP")) { icon = "🌟"; color = "var(--gold)"; }
        if (n.text.includes("оценка") || n.text.includes("Оценка")) { icon = "📝"; color = "var(--blue)"; }

        var dateObj = new Date(n.date);
        var dateStr = dateObj.toLocaleDateString() + " " + dateObj.toLocaleTimeString();

        list.appendChild(el(`<div style="display:flex; gap:16px; background:var(--card-soft); border:1px solid var(--border); padding:16px; border-radius:12px; align-items:flex-start;">
            <div style="font-size:24px;">${icon}</div>
            <div style="flex:1;">
                <div style="font-size:15px; color:var(--text); margin-bottom:4px;">${n.text}</div>
                <div style="font-size:12px; color:var(--muted);">${dateStr}</div>
            </div>
        </div>`));
    });
};