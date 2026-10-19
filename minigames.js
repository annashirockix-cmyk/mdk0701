/* ============================================================
   МДК 07.01 — extra.js (v115.0 — LEVELS & PROFILE UI)
   ============================================================ */
"use strict";

/* ---------------- ЧАТ ---------------- */
window.renderChatPage = function(){
  var app = document.getElementById("app"); app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Чат группы";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));

  if (!state.student) {
    app.appendChild(el('<div class="module">Войдите как студент, чтобы писать в чат.</div>'));
    return;
  }

  app.appendChild(el('<section class="module"><h2>Чат группы ' + escapeHtml(state.student.group) + '</h2>' +
    '<div id="chatLog" style="height:400px;overflow-y:auto;background:var(--card-soft);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:16px;"><div style="color:var(--muted);">Загрузка сообщений...</div></div>' +
    '<form id="chatForm" style="display:flex;gap:10px;">' +
      '<input type="text" id="chatInput" placeholder="Сообщение..." style="flex:1;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text)">' +
      '<button type="submit" class="btn">Отправить</button>' +
    '</form></section>'));

  var log = document.getElementById("chatLog");

  function loadChat() {
    fetch(APPS_SCRIPT_URL + "?action=chatload&group=" + encodeURIComponent(state.student.group) + "&t=" + Date.now(), { cache: "no-store" })
      .then(function(r){ return r.json(); })
      .then(function(d){
        log.innerHTML = "";
        if (d && d.ok && d.messages && d.messages.length) {
          d.messages.forEach(function(m){
            log.innerHTML += '<div style="margin-bottom:12px;background:var(--card);padding:8px 12px;border-radius:8px;border:1px solid var(--border);">' +
              '<b style="color:var(--accent)">' + escapeHtml(m.name) + '</b> ' +
              '<span style="font-size:10px;color:var(--muted)">' + new Date(m.date).toLocaleTimeString() + '</span><br>' +
              escapeHtml(m.text) + '</div>';
          });
          log.scrollTop = log.scrollHeight;
        } else {
          log.innerHTML = '<div style="color:var(--muted);">Пока нет сообщений.</div>';
        }
      }).catch(function(e){ log.innerHTML = "Ошибка загрузки: " + e.message; });
  }
  loadChat();

  document.getElementById("chatForm").onsubmit = function(e){
    e.preventDefault();
    var t = document.getElementById("chatInput").value.trim(); if (!t) return;
    document.getElementById("chatInput").value = "";
    var p = new URLSearchParams();
    p.append("action", "chatsave"); p.append("group", state.student.group); p.append("key", studentKey());
    p.append("name", state.student.name); p.append("avatar", "👨‍🎓"); p.append("text", t);
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p }).then(loadChat).catch(function(){ alert("Ошибка сети"); });
  };
};

/* ---------------- ОТЗЫВЫ ---------------- */
window.renderCommentsPage = function(){
  var app = document.getElementById("app"); app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Отзывы";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el('<section class="module"><h2>Отзывы о курсе</h2>' +
    '<div id="commentsList" style="margin-bottom:20px;"><div style="color:var(--muted);">Загрузка...</div></div>' +
    '<form id="commentForm">' +
      '<textarea id="commentText" placeholder="Напишите ваш отзыв..." style="width:100%;height:80px;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);margin-bottom:10px;"></textarea>' +
      '<button type="submit" class="btn">Отправить</button>' +
    '</form></section>'));

  var list = document.getElementById("commentsList");

  function loadComments() {
    fetch(APPS_SCRIPT_URL + "?action=loadcomments&t=" + Date.now(), { cache: "no-store" })
      .then(function(r){ return r.json(); })
      .then(function(d){
        list.innerHTML = "";
        if (d && d.ok && d.comments && d.comments.length) {
          d.comments.slice().reverse().forEach(function(c){
            list.innerHTML += '<div style="margin-bottom:12px;padding:16px;background:var(--card-soft);border-radius:12px;border:1px solid var(--border);">' +
              '<b>' + escapeHtml(c.name) + '</b> <span style="font-size:12px;color:var(--muted)">' + escapeHtml(c.group) + '</span>' +
              '<p style="margin:8px 0 0;">' + escapeHtml(c.text) + '</p></div>';
          });
        } else {
          list.innerHTML = '<div style="color:var(--muted);">Пока нет отзывов.</div>';
        }
      }).catch(function(){ list.innerHTML = "Ошибка загрузки."; });
  }
  loadComments();

  document.getElementById("commentForm").onsubmit = function(e){
    e.preventDefault();
    var t = document.getElementById("commentText").value.trim();
    if (t.length < 5) { alert("Слишком короткий отзыв"); return; }
    document.getElementById("commentText").value = "";
    var p = new URLSearchParams();
    p.append("action", "savecomment");
    p.append("name", state.student ? state.student.name : "Гость");
    p.append("group", state.student ? state.student.group : "—");
    p.append("text", t);
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p }).then(loadComments).catch(function(){ alert("Ошибка сети"); });
  };
};

/* ---------------- ЛИЧНЫЙ КАБИНЕТ (С УРОВНЯМИ) ---------------- */
window.renderProfilePage = function(){
  var app = document.getElementById("app"); app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Профиль";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));

  if (!state.student && !state.staff) {
    app.appendChild(el('<div class="module">Войдите, чтобы увидеть профиль.</div>'));
    return;
  }

  var level = getLevel(state.xp);
  var currentXp = state.xp;
  var nextLevelXp = getXpForNextLevel(level);
  var prevLevelXp = getXpForNextLevel(level - 1);
  var progress = Math.min(100, Math.max(0, ((currentXp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100));
  
  var avatar = state.avatar 
    ? '<img src="' + state.avatar + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">' 
    : (state.staff ? "👨‍🏫" : (state.shop.includes("golden") ? "👑" : "👨‍🎓"));
  
  var name = state.staff ? state.staff.name : (state.nick || (state.student && state.student.name) || "Гость");
  var role = state.staff ? "Роль: " + state.staff.role : ("Студент · Гр. " + (state.student ? state.student.group : "—"));

  // Шапка профиля
  app.appendChild(el('<section class="hero" style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;">' +
    '<div style="width:90px;height:90px;border-radius:50%;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;font-size:44px;overflow:hidden;flex-shrink:0;border:3px solid var(--accent);">' + avatar + '</div>' +
    '<div style="flex:1;min-width:200px;">' +
      '<h1 style="margin:0 0 6px 0;font-size:24px;">' + escapeHtml(name) + ' <span style="font-size:16px;background:var(--gold);color:#000;padding:2px 8px;border-radius:8px;">Lv. ' + level + '</span></h1>' +
      '<div style="color:var(--muted);">' + escapeHtml(role) + '</div>' +
      (state.sign ? '<div style="margin-top:8px;font-style:italic;color:var(--text-soft);">' + escapeHtml(state.sign) + '</div>' : '') +
    '</div>' +
  '</section>'));

  if (state.student) {
    // Прогресс-бар уровня
    var lvlBlock = el('<section class="module"><h2>📈 Уровень ' + level + '</h2>' +
      '<div style="margin:16px 0;">' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:14px;">' +
          '<span>' + currentXp + ' XP</span><span>' + (level >= 100 ? 'Максимум' : nextLevelXp + ' XP') + '</span>' +
        '</div>' +
        '<div style="height:16px;background:var(--card-soft);border-radius:8px;overflow:hidden;border:1px solid var(--border);">' +
          '<div style="height:100%;background:linear-gradient(90deg, var(--accent), var(--gold));width:' + progress + '%;transition:width 0.5s;"></div>' +
        '</div>' +
      '</div>' +
      '<p class="sub" style="font-size:13px;">До следующего уровня осталось: <b>' + (nextLevelXp - currentXp) + ' XP</b></p>' +
    '</section>');
    app.appendChild(lvlBlock);

    // Бонусы уровня
    var bonuses = getLevelBonuses(level);
    var bonusBlock = el('<section class="module"><h2>🎁 Ваши бонусы</h2><div style="display:grid;grid-template-columns:1fr;gap:10px;" id="bonusList"></div></section>');
    var bWrap = bonusBlock.querySelector("#bonusList");
    if (bonuses.length === 0) {
        bWrap.appendChild(el('<div style="color:var(--muted);">Пока нет бонусов. Достигните 5 уровня!</div>'));
    } else {
        bonuses.forEach(function(b) {
            bWrap.appendChild(el('<div style="background:var(--card-soft); padding:12px; border-radius:8px; border:1px solid var(--border);"><b>Ур. ' + b.lvl + ':</b> ' + b.name + '</div>'));
        });
    }
    app.appendChild(bonusBlock);

    // Достижения
    var achList = getAchievementsList();
    var unlocked = achList.filter(function(a){ return state.achievements[a.id]; });
    var locked = achList.filter(function(a){ return !state.achievements[a.id]; });
    locked.sort(function(a, b){ return (a.xp || 0) - (b.xp || 0); });

    var achBlock = el('<section class="module"><h2>🏅 Достижения (' + unlocked.length + ' / ' + achList.length + ')</h2>' +
      '<div id="achList" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(130px, 1fr));gap:10px; max-height:400px; overflow-y:auto; padding-right:10px;"></div>' +
    '</section>');
    var achWrap = achBlock.querySelector("#achList");
    
    unlocked.forEach(function(a) {
        achWrap.appendChild(el('<div style="background:var(--accent-soft); padding:10px; border-radius:8px; text-align:center; border:1px solid var(--accent);">' +
            '<div style="font-size:24px;">' + a.icon + '</div>' +
            '<div style="font-weight:bold; font-size:12px; margin-top:4px; color:var(--accent);">' + escapeHtml(a.title) + '</div>' +
            '<div style="font-size:10px; color:var(--text-soft); margin-top:2px;">' + escapeHtml(a.desc) + '</div>' +
        '</div>'));
    });
    locked.slice(0, 20).forEach(function(a) {
        achWrap.appendChild(el('<div style="background:var(--card-soft); padding:10px; border-radius:8px; text-align:center; border:1px solid var(--border); opacity:0.6;">' +
            '<div style="font-size:24px; filter:grayscale(100%);">' + a.icon + '</div>' +
            '<div style="font-weight:bold; font-size:12px; margin-top:4px;">' + escapeHtml(a.title) + '</div>' +
            '<div style="font-size:10px; color:var(--text-soft); margin-top:2px;">' + escapeHtml(a.desc) + '</div>' +
        '</div>'));
    });
    app.appendChild(achBlock);
  }

  app.appendChild(el('<section class="module"><div style="display:flex;gap:10px;flex-wrap:wrap;">' +
    (state.student ? (
      '<button class="btn" onclick="location.hash=\'#/portfolio\'">🎓 Портфолио</button>' +
      '<button class="btn ghost" onclick="location.hash=\'#/certificate\'">📜 Сертификат</button>' +
      '<button class="btn ghost" onclick="location.hash=\'#/shop\'">🛒 Магазин</button>'
    ) : '') +
  '</div></section>'));
};

/* ---------------- ДАШБОРД ---------------- */
window.renderDashboard = function(){
  var app = document.getElementById("app"); app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Статистика";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el('<section class="hero"><h1>Статистика</h1></section>'));

  if (!state.student) {
    app.appendChild(el('<div class="module">Доступно только для студента.</div>'));
    return;
  }

  var c = getCourse();
  var totalTopics = 0, doneTopics = 0, gradesList = [];
  if (c) {
    c.sections.forEach(function(sec){
      (sec.topics || []).forEach(function(t){
        totalTopics++;
        if (state.results[t.id] || state.selfResults[t.id]) doneTopics++;
      });
    });
  }
  var doneResults = Object.keys(state.results || {}).map(function(k){ return state.results[k].grade; });
  var doneSelf = Object.keys(state.selfResults || {}).map(function(k){ return state.selfResults[k].grade; });
  var allGrades = doneResults.concat(doneSelf);
  var avg = allGrades.length ? (allGrades.reduce(function(a,b){ return a+b; }, 0) / allGrades.length).toFixed(2) : "—";
  var pct = totalTopics > 0 ? Math.round(doneTopics / totalTopics * 100) : 0;

  app.appendChild(el('<section class="module"><h2>📈 Прогресс</h2>' +
    '<div style="margin:16px 0;">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:14px;">' +
        '<span>Пройдено тем</span><b>' + doneTopics + ' / ' + totalTopics + '</b>' +
      '</div>' +
      '<div style="height:14px;background:var(--card-soft);border-radius:7px;overflow:hidden;">' +
        '<div style="height:100%;background:var(--accent);width:' + pct + '%;transition:width 0.5s;"></div>' +
      '</div>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px;">' +
      '<div style="background:var(--card-soft);padding:16px;border-radius:12px;text-align:center;">' +
        '<div style="font-size:26px;font-weight:bold;color:var(--accent);">' + avg + '</div>' +
        '<div style="font-size:12px;color:var(--muted);">Средний балл</div>' +
      '</div>' +
      '<div style="background:var(--card-soft);padding:16px;border-radius:12px;text-align:center;">' +
        '<div style="font-size:26px;font-weight:bold;color:var(--gold);">' + state.xp + '</div>' +
        '<div style="font-size:12px;color:var(--muted);">XP</div>' +
      '</div>' +
    '</div>' +
  '</section>'));

  if (typeof Chart !== "undefined" && allGrades.length) {
    var canvasBlock = el('<section class="module"><h2>📊 Оценки</h2><div style="position:relative;height:240px;"><canvas id="gradesChart"></canvas></div></section>');
    app.appendChild(canvasBlock);
    setTimeout(function(){
      var ctx = document.getElementById("gradesChart");
      if (!ctx) return;
      try {
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["2", "3", "4", "5"],
            datasets: [{
              label: "Количество",
              data: [
                allGrades.filter(function(g){ return g === 2; }).length,
                allGrades.filter(function(g){ return g === 3; }).length,
                allGrades.filter(function(g){ return g === 4; }).length,
                allGrades.filter(function(g){ return g === 5; }).length
              ],
              backgroundColor: ["#c0392b", "#e67e22", "#3498db", "#2d7a4f"]
            }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
      } catch (e) { console.warn("Chart error", e); }
    }, 50);
  }
};

/* ---------------- ЗАЯВКИ ---------------- */
window.renderRequestsPage = function(){
  var app = document.getElementById("app"); app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Заявки";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el('<section class="hero"><h1>Заявки</h1><p>Практические и доп. попытки</p></section>'));

  if (!state.staff) {
    app.appendChild(el('<div class="module">Доступно только преподавателю.</div>'));
    return;
  }

  var wrap = el('<section class="module"><div style="color:var(--muted);">Загрузка...</div></section>');
  app.appendChild(wrap);

  fetch(APPS_SCRIPT_URL + "?action=getstudents&t=" + Date.now(), { cache: "no-store" })
    .then(function(r){ return r.json(); })
    .then(function(d){
      wrap.innerHTML = "";
      if (!d || !d.ok || !d.students || !d.students.length) {
        wrap.innerHTML = '<div style="color:var(--muted);">Нет данных.</div>';
        return;
      }
      var hasAny = false;
      d.students.forEach(function(s){
        var p = {}; try { p = JSON.parse(s.payload || "{}") || {}; } catch(e){}
        var sKey = String(s.name).trim().toLowerCase() + "|" + String(s.group).trim().toLowerCase();
        var items = [];

        if (p.practicalsDone) {
          Object.keys(p.practicalsDone).forEach(function(tid){
            Object.keys(p.practicalsDone[tid]).forEach(function(code){
              if (p.practicalsDone[tid][code] === "pending") {
                items.push({ kind: "practical", topicId: tid, code: code, label: "Практика " + code + " · " + (findTopic(tid) ? findTopic(tid).topic.title : tid) });
              }
            });
          });
        }
        if (p.requests) {
          Object.keys(p.requests).forEach(function(reqKey){
            if (p.requests[reqKey] === "pending") {
              items.push({ kind: "attempt", reqKey: reqKey, label: "Доп. попытка: " + reqKey });
            }
          });
        }

        if (!items.length) return;
        hasAny = true;

        var block = el('<div style="border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;background:var(--card-soft);">' +
          '<div style="font-weight:bold;margin-bottom:10px;">' + escapeHtml(s.name) + ' <span style="color:var(--muted);font-weight:normal;font-size:13px;">гр. ' + escapeHtml(s.group) + '</span></div>' +
        '</div>');

        items.forEach(function(it, idx){
          var row = el('<div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--card);border-radius:8px;margin-bottom:8px;gap:10px;flex-wrap:wrap;">' +
            '<div style="flex:1;min-width:200px;">' + escapeHtml(it.label) + '</div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;" id="req_' + it.kind + '_' + idx + '"></div>' +
          '</div>');
          var actionsWrap = row.querySelector("#req_" + it.kind + "_" + idx);
          if (it.kind === "practical") {
            [5,4,3,2].forEach(function(g){
              var b = el('<button class="btn" style="padding:6px 12px;font-size:13px;">' + g + '</button>');
              b.onclick = function(){ window.approvePractical(sKey, it.topicId, it.code, String(g)); };
              actionsWrap.appendChild(b);
            });
          } else if (it.kind === "attempt") {
            var b = el('<button class="btn" style="padding:6px 12px;font-size:13px;">✅ Одобрить</button>');
            b.onclick = function(){ window.approveAttempt(sKey, it.reqKey); };
            actionsWrapper.appendChild(b);
          }
          block.appendChild(row);
        });
        wrap.appendChild(block);
      });
      if (!hasAny) wrap.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);">Заявок нет 🎉</div>';
    }).catch(function(){ wrap.innerHTML = "Ошибка загрузки."; });
};

/* ---------------- УВЕДОМЛЕНИЯ ---------------- */
window.renderNotificationsPage = function(){
  var app = document.getElementById("app"); app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Уведомления";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el('<section class="hero"><h1>🔔 Уведомления</h1></section>'));

  var list = state.notifications || [];
  if (!list.length) {
    app.appendChild(el('<div class="module" style="text-align:center;padding:30px;color:var(--muted);">Пока нет уведомлений.</div>'));
    return;
  }

  var block = el('<section class="module"></section>');
  list.forEach(function(n){
    var icon = n.type === "ok" ? "✅ " : n.type === "err" ? "❌ " : "ℹ️ ";
    var dateStr = "";
    try { dateStr = new Date(n.date).toLocaleString(); } catch(e){}
    block.appendChild(el('<div style="padding:12px;border-bottom:1px solid var(--border);">' +
      '<div>' + icon + escapeHtml(n.text) + '</div>' +
      '<div style="font-size:11px;color:var(--muted);margin-top:4px;">' + dateStr + '</div>' +
    '</div>'));
  });
  app.appendChild(block);

  list.forEach(function(n){ n.read = true; });
  if (typeof updateNotifBadge === "function") updateNotifBadge();
  if (typeof saveStudentData === "function") saveStudentData();
};

/* ---------------- СЕРТИФИКАТ ---------------- */
window.renderCertificatePage = function(){
  var app = document.getElementById("app"); app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Сертификат";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));

  if (!state.student) {
    app.appendChild(el('<div class="module">Войдите как студент.</div>'));
    return;
  }

  var totalTopics = 0, doneTopics = 0;
  var c = getCourse();
  if (c) {
    c.sections.forEach(function(sec){
      (sec.topics || []).forEach(function(t){
        totalTopics++;
        if (state.results[t.id] || state.selfResults[t.id]) doneTopics++;
      });
    });
  }
  var pct = totalTopics > 0 ? Math.round(doneTopics / totalTopics * 100) : 0;
  var lvl = getLevel(state.xp);
  var eligible = pct >= 70 && lvl >= 10;

  app.appendChild(el('<div style="max-width:800px;margin:0 auto;">' +
    '<div style="background:linear-gradient(135deg,var(--card),var(--card-soft));border:3px solid var(--accent);border-radius:20px;padding:50px 40px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,0.2);">' +
      '<div style="font-size:48px;margin-bottom:16px;">📜</div>' +
      '<h1 style="margin:0 0 8px 0;font-size:28px;color:var(--accent);">СЕРТИФИКАТ</h1>' +
      '<p style="color:var(--muted);margin:0 0 24px 0;">об успешном прохождении курса</p>' +
      '<p style="font-size:14px;color:var(--muted);margin:0;">Настоящим подтверждается, что</p>' +
      '<h2 style="margin:12px 0;font-size:24px;">' + escapeHtml(state.student.name) + '</h2>' +
      '<p style="font-size:14px;color:var(--muted);margin:0;">группы ' + escapeHtml(state.student.group) + '</p>' +
      '<p style="margin:24px 0 8px 0;font-size:14px;color:var(--muted);">прошёл(ла) обучение по модулю</p>' +
      '<p style="font-weight:bold;margin:0 0 24px 0;">МДК 07.01 — Технология обработки деталей на станках с программным управлением</p>' +
      '<div style="display:flex;justify-content:space-around;margin:32px 0;flex-wrap:wrap;gap:20px;">' +
        '<div><div style="font-size:11px;color:var(--muted);text-transform:uppercase;">Прогресс</div><div style="font-size:22px;font-weight:bold;color:var(--accent);">' + pct + '%</div></div>' +
        '<div><div style="font-size:11px;color:var(--muted);text-transform:uppercase;">Уровень</div><div style="font-size:22px;font-weight:bold;color:var(--gold);">' + lvl + '</div></div>' +
        '<div><div style="font-size:11px;color:var(--muted);text-transform:uppercase;">Дата</div><div style="font-size:16px;font-weight:bold;">' + new Date().toLocaleDateString() + '</div></div>' +
      '</div>' +
      (eligible ? '<p style="color:var(--ok);font-weight:bold;">✅ Требования выполнены</p>' : '<p style="color:var(--muted);font-size:13px;">⚠️ Для сертификата нужно: ≥ 70% тем и 10 Уровень</p>') +
    '</div>' +
    '<div style="text-align:center;margin-top:20px;">' +
      '<button class="btn" onclick="window.print()" ' + (eligible ? '' : 'disabled') + '>🖨 Распечатать</button>' +
    '</div>' +
  '</div>'));
};

/* ---------------- СОБЫТИЕ ---------------- */
window.renderDeadlyPartyPage = function(){
  var app = document.getElementById("app"); app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Смертельная вечеринка";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));

  var questions = [
    { q: "Что означает G00?", options: ["Быстрое позиционирование", "Линейная интерполяция", "Пауза", "Резьба"], correct: 0 },
    { q: "Что означает M03?", options: ["Стоп шпинделя", "Шпиндель по часовой", "Смена инструмента", "Конец"], correct: 1 },
    { q: "Угол профиля метрической резьбы", options: ["55°", "60°", "30°", "33°"], correct: 1 },
    { q: "Какой код отменяет постоянный цикл?", options: ["G80", "G00", "G90", "M30"], correct: 0 },
    { q: "Что такое ЧПУ?", options: ["Числовое программное управление", "Частное производственное устройство", "Часто повторяющийся узел", "Черновая правка углов"], correct: 0 }
  ];
  var currentQ = 0, lives = 3;

  function renderQ(){
    app.innerHTML = "";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    app.appendChild(el('<section class="module" style="background:#1a0a0a;border:2px solid #ff003c;color:#fff;">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:16px;font-size:14px;">' +
        '<span>Вопрос ' + (currentQ + 1) + ' / ' + questions.length + '</span>' +
        '<span>❤️ '.repeat(lives) + '🤍 '.repeat(3 - lives) + '</span>' +
      '</div>' +
      '<h2 style="margin:0 0 20px 0;color:#ff003c;">' + escapeHtml(questions[currentQ].q) + '</h2>' +
      '<div id="qOptions"></div>' +
    '</section>'));
    var qo = document.getElementById("qOptions");
    questions[currentQ].options.forEach(function(opt, idx){
      var b = el('<button class="btn" style="width:100%;margin-bottom:8px;text-align:left;background:#2a0a0a;border:1px solid #ff003c;color:#fff;">' + escapeHtml(opt) + '</button>');
      b.onclick = function(){
        if (idx === questions[currentQ].correct) {
          if (window.showToast) window.showToast("✅ Верно!", "ok");
          currentQ++;
          if (currentQ >= questions.length) {
            app.innerHTML = "";
            app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
            app.appendChild(el('<section class="module" style="text-align:center;background:#0a1a0a;border:2px solid #00ff00;color:#fff;padding:50px;">' +
              '<div style="font-size:64px;margin-bottom:16px;">🎉</div>' +
              '<h1 style="color:#00ff00;">Протокол самоуничтожения отключён!</h1>' +
              '<p>Вы прошли все ' + questions.length + ' вопросов.</p>' +
              '<button class="btn" onclick="if(window.addXP) window.addXP(100);location.hash=\'#/\'">+100 XP и на главную</button>' +
            '</section>'));
          } else renderQ();
        } else {
          lives--;
          if (window.showToast) window.showToast("❌ Неверно! Осталось жизней: " + lives, "err");
          if (lives <= 0) {
            app.innerHTML = "";
            app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
            app.appendChild(el('<section class="module" style="text-align:center;background:#1a0000;border:2px solid #ff003c;color:#fff;padding:50px;">' +
              '<div style="font-size:64px;margin-bottom:16px;">💀</div>' +
              '<h1 style="color:#ff003c;">Проигрыш</h1>' +
              '<button class="btn" onclick="window.renderDeadlyPartyPage()">Попробовать снова</button>' +
            '</section>'));
          }
        }
      };
      qo.appendChild(b);
    });
  }
  renderQ();
};