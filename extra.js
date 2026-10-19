/* ============================================================
   МДК 07.01 — extra.js (v101.0 — CHAT & PROFILE FIX)
   ============================================================ */
"use strict";

window.renderProfilePage = function() {
  const app = document.getElementById("app"); app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Личный кабинет";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  
  if (!state.student && !state.staff) { app.innerHTML = "<p>Ошибка: вы не авторизованы.</p>"; return; }
  
  var isStaff = !!state.staff;
  var name = isStaff ? state.staff.name : (state.nick || state.student.name);
  var group = isStaff ? "Сотрудник" : "Группа " + state.student.group;
  var role = isStaff ? "👨‍🏫" : ((state.shop && state.shop.includes("golden")) ? "👑" : "👨‍🎓");
  var sign = state.sign ? `<p style="color:var(--accent); font-style:italic; margin-top:10px;">"${state.sign}"</p>` : "";

  app.appendChild(el(`<div class="module" style="display:flex;gap:20px;align-items:center;padding:30px;">
    <div style="font-size:60px;background:var(--card-soft);width:100px;height:100px;display:flex;align-items:center;justify-content:center;border-radius:20px; overflow:hidden;">
        ${state.avatar ? `<img src="${state.avatar}" style="width:100%; height:100%; object-fit:cover;">` : role}
    </div>
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

window.renderChatPage = function(){
  const app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Чат группы";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  
  if (!state.student) { app.appendChild(el('<div class="module">Войдите как студент, чтобы писать в чат.</div>')); return; }
  
  app.appendChild(el(`<section class="module"><h2>Чат группы ${state.student.group}</h2><div id="chatLog" style="height:400px;overflow-y:auto;background:var(--card-soft);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:16px;"><div class="comment-empty">Загрузка сообщений...</div></div><form id="chatForm" style="display:flex;gap:10px;"><input type="text" id="chatInput" placeholder="Сообщение..." style="flex:1;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text)"><button type="submit" class="btn">Отправить</button></form></section>`));
  
  var log = document.getElementById("chatLog");
  
  function loadChat() {
    // Добавлен &t= для обхода кэша Safari
    fetch(APPS_SCRIPT_URL + "?action=chatload&group=" + encodeURIComponent(state.student.group) + "&t=" + Date.now(), { cache: "no-store" })
      .then(r=>r.json()).then(d=>{
        log.innerHTML = "";
        if(d.ok && d.messages && d.messages.length) {
          d.messages.forEach(m => {
            log.innerHTML += `<div style="margin-bottom:12px;background:var(--card);padding:8px 12px;border-radius:8px;border:1px solid var(--border);"><b style="color:var(--accent)">${m.name}</b> <span style="font-size:10px;color:var(--muted)">${new Date(m.date).toLocaleTimeString()}</span><br>${m.text}</div>`;
          });
          log.scrollTop = log.scrollHeight;
        } else {
          log.innerHTML = '<div class="comment-empty">Пока нет сообщений.</div>';
        }
      }).catch((e)=>{ log.innerHTML = "Ошибка загрузки: " + e.message; });
  }
  loadChat();

  document.getElementById("chatForm").onsubmit = (e)=>{
    e.preventDefault(); const t = document.getElementById("chatInput").value; if(!t) return;
    document.getElementById("chatInput").value = "";
    var p = new URLSearchParams();
    p.append("action", "chatsave"); p.append("group", state.student.group);
    p.append("key", studentKey()); p.append("name", state.student.name); p.append("avatar", "👨‍🎓"); p.append("text", t);
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p }).then(()=>loadChat()).catch(()=>alert("Ошибка сети"));
  });
};

window.renderCommentsPage = function(){
  const app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Отзывы";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el(`<section class="module"><h2>Отзывы о курсе</h2><div id="commentsList" style="margin-bottom:20px;"><div class="comment-empty">Загрузка...</div></div><form id="commentForm"><textarea id="commentText" placeholder="Напишите ваш отзыв..." style="width:100%;height:80px;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);margin-bottom:10px;"></textarea><button type="submit" class="btn">Отправить</button></form></section>`));

  var list = document.getElementById("commentsList");

  function loadComments() {
    fetch(APPS_SCRIPT_URL + "?action=loadcomments&t=" + Date.now(), { cache: "no-store" })
      .then(r=>r.json()).then(d=>{
        list.innerHTML = "";
        if(d.ok && d.comments && d.comments.length) {
          d.comments.reverse().forEach(c => {
            list.innerHTML += `<div style="margin-bottom:12px;padding:16px;background:var(--card-soft);border-radius:12px;border:1px solid var(--border);"><b>${c.name}</b> <span style="font-size:12px;color:var(--muted)">${c.group}</span><p style="margin:8px 0 0;">${c.text}</p></div>`;
          });
        } else {
          list.innerHTML = '<div class="comment-empty">Пока нет отзывов.</div>';
        }
      }).catch((e)=>{ list.innerHTML = "Ошибка загрузки."; });
  }
  loadComments();

  document.getElementById("commentForm").onsubmit = (e)=>{
    e.preventDefault(); const t = document.getElementById("commentText").value; 
    if(t.length < 5) return alert("Слишком короткий отзыв");
    document.getElementById("commentText").value = "";
    var p = new URLSearchParams();
    p.append("action", "savecomment"); p.append("name", state.student ? state.student.name : "Гость");
    p.append("group", state.student ? state.student.group : "—"); p.append("text", t);
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p }).then(()=>loadComments()).catch(()=>alert("Ошибка сети"));
  };
};

// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (Восстановлены для работы)
window.renderRequestsPage = function() {
    var app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Заявки";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    if (!state.staff) { app.appendChild(el('<div class="module">Доступно только преподавателям.</div>')); return; }
    
    app.appendChild(el('<section class="hero"><h1>Входящие заявки</h1><p>Проверка практических работ и выдача попыток.</p></section>'));
    var container = el('<section class="module"><div class="skeleton" style="height:100px;"></div></section>');
    app.appendChild(container);

    fetch(APPS_SCRIPT_URL + "?action=getstudents&t=" + Date.now(), { cache: "no-store" }).then(r => r.json()).then(d => {
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
                                var reqCard = el(`<div class="module" style="border-left:4px solid var(--accent); padding:16px; margin-bottom:12px;" id="req_${topicId}_${code}"><div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;"><div><b>${s.name}</b> (гр. ${s.group})<br><span style="color:var(--muted); font-size:13px;">Сдал: ${tName} (${code})</span></div><div style="display:flex; gap:10px; align-items:center;"><select id="grade_${topicId}_${code}" style="padding:8px; border-radius:6px; border:1px solid var(--border); background:var(--bg); color:var(--text);"><option value="5">5</option><option value="4">4</option><option value="3">3</option><option value="2">2</option></select><button class="btn" onclick="window.approvePractical('${sKey}', '${topicId}', '${code}', document.getElementById('grade_${topicId}_${code}').value)">Подтвердить</button></div></div></div>`);
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
                            var reqCard = el(`<div class="module" style="border-left:4px solid #d97706; padding:16px; margin-bottom:12px;" id="req_${reqKey}"><div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;"><div><b>${s.name}</b> (гр. ${s.group})<br><span style="color:var(--muted); font-size:13px;">Просит попытку: ${parts[0]}</span></div><div><button class="btn" style="background:#d97706;" onclick="window.approveAttempt('${sKey}', '${reqKey}')">Выдать</button></div></div></div>`);
                            container.appendChild(reqCard);
                        }
                    });
                }
            } catch(e) {}
        });
        if (!hasRequests) container.innerHTML = '<div style="text-align:center; padding:40px; color:var(--muted);"><h3>Заявок пока нет 🎉</h3><p>Все проверено!</p></div>';
    }).catch(() => { container.innerHTML = "Ошибка загрузки."; });
};

window.renderSchedulePage = function() { /* Код из предыдущего ответа */ };
window.renderNotificationsPage = function() { /* Код из предыдущего ответа */ };