"use strict";

window.renderChatPage = function(){
  var app = document.getElementById("app"); app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Чат группы";
  app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
  if (!state.student) { app.appendChild(el('<div class="module">Войдите как студент.</div>')); return; }

  app.appendChild(el('<section class="module"><h2>Чат группы ' + escapeHtml(state.student.group) + '</h2><div id="chatLog" style="height:400px;overflow-y:auto;background:var(--card-soft);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:16px;">Загрузка...</div><form id="chatForm" style="display:flex;gap:10px;"><input type="text" id="chatInput" placeholder="Сообщение..." style="flex:1;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text)"><button type="submit" class="btn">Отправить</button></form></section>'));
  var log = document.getElementById("chatLog");
  
  function loadChat() {
    API.getChat(state.student.group).then(d => {
        log.innerHTML = "";
        if (d && d.ok && d.messages) { d.messages.forEach(m => { log.innerHTML += '<div style="margin-bottom:12px;background:var(--card);padding:8px 12px;border-radius:8px;"><b style="color:var(--accent)">' + escapeHtml(m.name) + '</b><br>' + escapeHtml(m.text) + '</div>'; }); log.scrollTop = log.scrollHeight; } 
        else log.innerHTML = "Нет сообщений";
    });
  }
  loadChat();
  document.getElementById("chatForm").onsubmit = function(e){
    e.preventDefault(); var t = document.getElementById("chatInput").value.trim(); if (!t) return; document.getElementById("chatInput").value = "";
    API.sendChat(state.student.group, studentKey(), state.student.name, t).then(loadChat);
  };
};

window.renderPortfolioPage = function() {
    var app = document.getElementById("app"); app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Портфолио";
    app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));

    if (!state.student) { app.appendChild(el('<div class="module">Войдите.</div>')); return; }

    var portfolioHtml = `
        <div id="portfolioPrint" class="module" style="padding:40px; background:#fff; color:#000;">
            <h1 style="text-align:center; color:#c14a2a;">ПОРТФОЛИО СТУДЕНТА</h1>
            <hr style="margin:20px 0; border:1px solid #ccc;">
            <p><b>ФИО:</b> ${escapeHtml(state.student.name)}</p>
            <p><b>Группа:</b> ${escapeHtml(state.student.group)}</p>
            <p><b>Уровень:</b> ${getLevel(state.xp)} (${getLevelTitle(getLevel(state.xp))})</p>
            <p><b>Всего опыта (XP):</b> ${state.xp}</p>
        </div>
    `;
    app.appendChild(el(portfolioHtml));
};