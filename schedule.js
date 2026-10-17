/* ============================================================
   МДК 07.01 — schedule.js (v20.0 iCal Export)
   ============================================================ */
"use strict";

window.renderSchedulePage = function(){
  var app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Расписание";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el('<section class="hero"><h1>Расписание</h1></section>'));

  var block = el(`<section class="module"><div id="schList"></div><button class="btn" id="icalBtn" style="margin-top:20px;width:100%;background:var(--blue);">📅 Добавить в календарь (.ics)</button></section>`);
  app.appendChild(block);

  var data = [
    { day: "Пн", time: "08:30 - 10:00", subj: "МДК 07.01", room: "204" },
    { day: "Ср", time: "12:30 - 14:00", subj: "Практика", room: "Цех" }
  ];

  var list = block.querySelector("#schList");
  data.forEach(d => list.appendChild(el(`<div style="display:flex;gap:10px;padding:10px;border-bottom:1px solid var(--border);"><b>${d.day}</b><span>${d.time}</span><span>${d.subj}</span><span style="color:var(--muted)">${d.room}</span></div>`)));

  block.querySelector("#icalBtn").addEventListener("click", () => {
    var ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//MDK0701//RU\n";
    // Генерируем события на завтра для теста
    var dt = new Date(); dt.setDate(dt.getDate() + 1);
    var y = dt.getFullYear(), m = String(dt.getMonth()+1).padStart(2,'0'), d = String(dt.getDate()).padStart(2,'0');
    
    data.forEach((ev, i) => {
      ics += `BEGIN:VEVENT\nSUMMARY:${ev.subj}\nLOCATION:${ev.room}\nDTSTART:${y}${m}${d}T083000\nDTEND:${y}${m}${d}T100000\nEND:VEVENT\n`;
    });
    ics += "END:VCALENDAR";

    var blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "schedule.ics"; a.click();
    window.showToast("Файл скачан! Откройте его в календаре.", "ok");
  });
};