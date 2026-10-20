window.renderSchedulePage = function(){
  var app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Расписание";
  app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
  app.appendChild(el('<section class="hero"><h1>Расписание</h1></section>'));

  var block = el(`<section class="module"><div>Пн: 08:30 - 10:00 (МДК 07.01, 204)</div><div>Ср: 12:30 - 14:00 (Практика, Цех)</div><button class="btn" id="icalBtn" style="margin-top:20px;width:100%;">📅 Добавить в календарь (.ics)</button></section>`);
  app.appendChild(block);

  block.querySelector("#icalBtn").addEventListener("click", () => {
    var ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//MDK0701//RU\n";
    var dt = new Date(); dt.setDate(dt.getDate() + 1);
    var y = dt.getFullYear(), m = String(dt.getMonth()+1).padStart(2,'0'), d = String(dt.getDate()).padStart(2,'0');
    ics += `BEGIN:VEVENT\nSUMMARY:МДК 07.01\nLOCATION:204\nDTSTART:${y}${m}${d}T083000\nDTEND:${y}${m}${d}T100000\nEND:VEVENT\nEND:VCALENDAR`;
    var blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "schedule.ics"; a.click();
  });
};