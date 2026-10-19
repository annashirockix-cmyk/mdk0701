/* ============================================================
   МДК 07.01 — extra.js (v104.0 — CHAT & COMMENTS FIX)
   ============================================================ */
"use strict";

// ... (renderProfilePage, renderDashboard, renderRequestsPage оставьте как были) ...

window.renderChatPage = function(){
  const app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Чат группы";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  
  if (!state.student) { app.appendChild(el('<div class="module">Войдите как студент, чтобы писать в чат.</div>')); return; }
  
  app.appendChild(el(`<section class="module"><h2>Чат группы ${state.student.group}</h2><div id="chatLog" style="height:400px;overflow-y:auto;background:var(--card-soft);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:16px;"><div class="comment-empty">Загрузка сообщений...</div></div><form id="chatForm" style="display:flex;gap:10px;"><input type="text" id="chatInput" placeholder="Сообщение..." style="flex:1;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text)"><button type="submit" class="btn">Отправить</button></form></section>`));
  
  var log = document.getElementById("chatLog");
  
  function loadChat() {
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

window.renderSchedulePage = function() {
    var app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Расписание";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    app.appendChild(el('<section class="hero"><h1>Расписание занятий</h1><p>Осенний семестр 2026-2027</p></section>'));

    var isTeacher = state.staff && (state.staff.role === "teacher" || state.staff.role === "admin");
    var pairs = [
        { num: "0", time: "08:00 - 08:30" }, { num: "1", time: "08:40 - 10:15" },
        { num: "2", time: "10:25 - 12:00" }, { num: "3", time: "12:30 - 14:05" },
        { num: "4", time: "14:15 - 15:50" }, { num: "5", time: "16:00 - 17:35" },
        { num: "6", time: "17:45 - 19:20" }
    ];

    if (isTeacher) {
        var formBlock = el(`<section class="module" style="background:var(--accent-soft); border-color:var(--accent);">
            <h3 style="margin-top:0; color:var(--accent);">Добавить занятие</h3>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:10px;">
                <div><label style="font-size:12px;color:var(--muted);">Дата</label><input id="schDate" type="date" class="self-input" style="margin:0; width:100%;"></div>
                <div><label style="font-size:12px;color:var(--muted);">Пара</label><select id="schPeriod" class="self-input" style="margin:0; width:100%;">${pairs.map(p => `<option value="${p.num}" data-time="${p.time}">${p.num} пара</option>`).join('')}</select></div>
                <div><label style="font-size:12px;color:var(--muted);">Время</label><input id="schTime" type="text" class="self-input" style="margin:0; width:100%;" value="08:00 - 08:30"></div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:10px;">
                <div><label style="font-size:12px;color:var(--muted);">Группа</label><input id="schGroup" type="text" class="self-input" style="margin:0; width:100%;" placeholder="ТМП 4-3"></div>
                <div><label style="font-size:12px;color:var(--muted);">Предмет</label><input id="schSubject" type="text" class="self-input" style="margin:0; width:100%;" placeholder="Разработка ТП"></div>
                <div><label style="font-size:12px;color:var(--muted);">Преподаватель</label><input id="schTeacher" type="text" class="self-input" style="margin:0; width:100%;" placeholder="Никитин"></div>
            </div>
            <button class="btn" id="addSchBtn" style="width:100%; margin-top:10px;">Добавить в расписание</button>
        </section>`);
        app.appendChild(formBlock);

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
            if (!date || !group || !subject || !time) { alert("Заполните поля!"); return; }
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

    var schedBlock = el('<section class="module"><div id="scheduleWrap" style="text-align:center; padding:20px;"><div class="skeleton" style="height:100px;"></div></div></section>');
    app.appendChild(schedBlock);
    var wrap = schedBlock.querySelector("#scheduleWrap");

    fetch(APPS_SCRIPT_URL + "?action=getschedules&t=" + Date.now(), { cache: "no-store" }).then(r => r.json()).then(d => {
        wrap.innerHTML = "";
        if (!d.ok || !d.schedule || d.schedule.length === 0) {
            wrap.innerHTML = '<div style="text-align:center; padding:40px; color:var(--muted);">Расписание пока пусто.</div>';
            return;
        }
        var days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
        d.schedule.sort((a, b) => a[0].localeCompare(b[0])).forEach(day => {
            var dayItems = d.schedule.filter(x => x[0] === day[0]);
            // Упрощенный рендер
            wrap.appendChild(el(`<div style="margin-bottom:24px; text-align:left;"><h3 style="color:var(--accent); border-bottom:2px solid var(--border); padding-bottom:8px;">Дата: ${day[0]}</h3>
            <table style="width:100%; border-collapse:collapse; font-size:14px;"><thead><tr><th style="border:1px solid var(--border); padding:8px;">Пара</th><th style="border:1px solid var(--border); padding:8px;">Время</th><th style="border:1px solid var(--border); padding:8px;">Группа</th><th style="border:1px solid var(--border); padding:8px;">Предмет</th><th style="border:1px solid var(--border); padding:8px;">Преподаватель</th></tr></thead><tbody>
                ${dayItems.map(item => `<tr><td style="border:1px solid var(--border); padding:8px;">${item[1]}</td><td style="border:1px solid var(--border); padding:8px;">${item[2]}</td><td style="border:1px solid var(--border); padding:8px;">${item[3]}</td><td style="border:1px solid var(--border); padding:8px;">${item[4]}</td><td style="border:1px solid var(--border); padding:8px;">${item[5]}</td></tr>`).join('')}
            </tbody></table></div>`));
        });
    }).catch(() => { wrap.innerHTML = "Ошибка загрузки расписания."; });
};