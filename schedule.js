/* ============================================================
   МДК 07.01 — schedule.js
   ============================================================ */
"use strict";

function getScheduleData(){
  try {
    return JSON.parse(localStorage.getItem("mdk0701.schedule")) || [
      { day: "Понедельник", time: "08:30 - 10:00", subject: "МДК 07.01", teacher: "Широких А.А.", room: "204" },
      { day: "Вторник", time: "10:10 - 11:40", subject: "Практика", teacher: "Мастер п/о", room: "Цех" },
      { day: "Среда", time: "12:30 - 14:00", subject: "МДК 07.01", teacher: "Широких А.А.", room: "204" }
    ];
  } catch(e) { return []; }
}

function saveScheduleData(data){ localStorage.setItem("mdk0701.schedule", JSON.stringify(data)); }

window.renderSchedulePage = function(){
  var app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = "";
  var crumbs = document.getElementById("crumbs");
  if (crumbs) crumbs.textContent = "Расписание занятий";

  var isStaff = state.staff && (state.staff.role === "teacher" || state.staff.role === "admin");

  app.appendChild(el('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  app.appendChild(el('<section class="hero"><div class="meta">Учебный процесс</div><h1>Расписание занятий</h1><p>Актуальное расписание на неделю.</p></section>'));

  var block = el('<section class="module"><div class="meta">Неделя</div><h2>График</h2>' + (isStaff ? '<div class="test-actions" style="margin-bottom:12px"><button class="btn" id="addScheduleBtn">➕ Добавить занятие</button></div>' : '') + '<div id="scheduleList" class="teacher-table" style="margin-top:12px"></div></section>');
  app.appendChild(block);

  var list = block.querySelector("#scheduleList");
  var data = getScheduleData();

  function drawTable(){
    list.innerHTML = "";
    if (!data.length){ list.innerHTML = '<div class="comment-empty">Расписание пусто.</div>'; return; }
    
    var table = el('<table class="teacher-table" style="width:100%"><thead><tr><th>День</th><th>Время</th><th>Предмет</th><th>Преподаватель</th><th>Кабинет</th>' + (isStaff ? '<th>Действия</th>' : '') + '</tr></thead><tbody></tbody></table>');
    var tbody = table.querySelector("tbody");

    data.forEach(function(item, idx){
      var tr = el('<tr><td><b>' + escapeHtml(item.day) + '</b></td><td>' + escapeHtml(item.time) + '</td><td>' + escapeHtml(item.subject) + '</td><td>' + escapeHtml(item.teacher) + '</td><td>' + escapeHtml(item.room) + '</td>' + (isStaff ? '<td><button class="btn ghost del-sch" data-idx="'+idx+'" style="padding:4px 8px;color:var(--err)">✕</button></td>' : '') + '</tr>');
      tbody.appendChild(tr);
    });
    list.appendChild(table);

    if (isStaff) {
      list.querySelectorAll(".del-sch").forEach(function(btn){
        btn.addEventListener("click", function(){
          if (!confirm("Удалить эту пару?")) return;
          data.splice(Number(btn.dataset.idx), 1);
          saveScheduleData(data); drawTable();
        });
      });
    }
  }
  drawTable();

  if (isStaff) {
    block.querySelector("#addScheduleBtn").addEventListener("click", function(){
      var day = prompt("День недели:", "Понедельник"); if (!day) return;
      var time = prompt("Время:", "08:30 - 10:00"); if (!time) return;
      var subject = prompt("Предмет:", "МДК 07.01"); if (!subject) return;
      var teacher = prompt("Преподаватель:", state.staff.name); if (!teacher) return;
      var room = prompt("Кабинет:", "204"); if (!room) return;
      data.push({ day, time, subject, teacher, room });
      saveScheduleData(data); drawTable();
    });
  }
};