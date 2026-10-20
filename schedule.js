"use strict";

window.renderSchedulePage = function(){
  var app = document.getElementById("app"); 
  if (!app) return; 
  app.innerHTML = ""; 
  document.getElementById("crumbs").textContent = "Расписание";
  
  app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
  
  var isTeacher = state.staff && (state.staff.role === "teacher" || state.staff.role === "admin");
  
  app.appendChild(el(`<section class="hero"><h1>Расписание занятий</h1><p>${isTeacher ? 'Режим редактирования (Изменения сохраняются автоматически)' : 'Расписание на семестр'}</p></section>`));

  // Константы для таблицы (как в Excel)
  var days = ["ПОНЕДЕЛЬНИК", "ВТОРНИК", "СРЕДА", "ЧЕТВЕРГ", "ПЯТНИЦА", "СУББОТА"];
  var times = [
    "8.00-9.35", "9.45-11.20", "11.40-13.15", 
    "13.25-15.00", "15.10-16.45", "16.55-18.30"
  ];
  var groups = [
    "ТМ 2-5", "ТМ 2-6", "ТМ 3-4", "ТМ 4-3", 
    "ЭО 2-2", "ЭО 3-1", "ТЭО 4-25", 
    "ПОАТ 2-11", "ПОАТ 3-10", "ПОАТ 4-9"
  ];

  var scheduleData = {}; // Здесь будут храниться данные

  // Загрузка данных с сервера
  window.API.getSchedule().then(res => {
    if (res && res.ok && res.schedule) {
      try { scheduleData = JSON.parse(res.schedule); } catch(e) { scheduleData = {}; }
    }
    buildTable();
  }).catch(err => {
    app.appendChild(el('<div class="module" style="color:var(--err);">Ошибка загрузки расписания. Проверьте соединение.</div>'));
    buildTable(); // Строим пустую таблицу в случае ошибки
  });

  function buildTable() {
    var tableHtml = `<div class="module" style="overflow-x:auto; padding:10px;">
      <table class="schedule-table" style="width:100%; border-collapse:collapse; text-align:center; font-size:12px; min-width:1000px;">
        <thead>
          <tr style="background:var(--card-soft);">
            <th style="border:1px solid var(--border); padding:8px; width:100px;">День</th>
            <th style="border:1px solid var(--border); padding:8px; width:80px;">Время</th>`;
            
    groups.forEach(g => {
      tableHtml += `<th style="border:1px solid var(--border); padding:8px;">${g}</th>`;
    });
    
    tableHtml += `</tr></thead><tbody>`;

    days.forEach(day => {
      times.forEach((time, timeIdx) => {
        tableHtml += `<tr>`;
        
        // Ячейка дня (объединяем строки)
        if (timeIdx === 0) {
          tableHtml += `<td rowspan="${times.length}" style="border:1px solid var(--border); font-weight:bold; background:var(--card-soft); vertical-align:middle; writing-mode:vertical-rl; transform:rotate(180deg);">${day}</td>`;
        }

        // Ячейка времени
        tableHtml += `<td style="border:1px solid var(--border); padding:4px; font-size:11px; color:var(--muted);">${time}</td>`;

        // Ячейки для групп
        groups.forEach(group => {
          var cellKey = `${day}_${time}_${group}`;
          var cellData = scheduleData[cellKey] || { sub1: "", sub2: "" };

          if (isTeacher) {
            // Для учителя - режим редактирования
            tableHtml += `<td style="border:1px solid var(--border); padding:4px; vertical-align:top;">
              <div style="margin-bottom:2px;">
                <span style="font-size:10px; color:var(--accent);">Подгр.1:</span><br>
                <textarea class="sched-input" data-key="${cellKey}" data-sub="sub1" style="width:100%; border:none; background:transparent; color:var(--text); resize:vertical; font-size:11px; min-height:40px;" placeholder="...">${cellData.sub1 || ''}</textarea>
              </div>
              <div style="border-top:1px dashed var(--border); margin:2px 0;"></div>
              <div>
                <span style="font-size:10px; color:var(--accent);">Подгр.2:</span><br>
                <textarea class="sched-input" data-key="${cellKey}" data-sub="sub2" style="width:100%; border:none; background:transparent; color:var(--text); resize:vertical; font-size:11px; min-height:40px;" placeholder="...">${cellData.sub2 || ''}</textarea>
              </div>
            </td>`;
          } else {
            // Для студентов - режим чтения
            var sub1Html = cellData.sub1 ? `<div style="font-weight:bold; color:var(--text); margin-bottom:4px;">${cellData.sub1}</div>` : '';
            var sub2Html = cellData.sub2 ? `<div style="border-top:1px dashed var(--border); padding-top:4px; color:var(--text-soft);">${cellData.sub2}</div>` : '';
            var emptyHtml = (!cellData.sub1 && !cellData.sub2) ? '<span style="color:var(--border);">—</span>' : '';
            
            tableHtml += `<td style="border:1px solid var(--border); padding:6px; vertical-align:top; text-align:left; line-height:1.3;">
              ${sub1Html}${sub2Html}${emptyHtml}
            </td>`;
          }
        });

        tableHtml += `</tr>`;
      });
      
      // Пустая строка между днями для красоты
      if (day !== "СУББОТА") {
        tableHtml += `<tr><td colspan="${groups.length + 2}" style="height:10px; background:var(--bg); border:none;"></td></tr>`;
      }
    });

    tableHtml += `</tbody></table></div>`;
    
    // Добавляем кнопку сохранения для учителя
    if (isTeacher) {
      tableHtml += `<div style="margin-top:20px; text-align:center;">
        <button class="btn" id="saveScheduleBtn" style="padding:12px 30px; font-size:16px;">💾 Сохранить расписание</button>
        <p style="font-size:12px; color:var(--muted); margin-top:8px;">Нажмите, чтобы применить изменения</p>
      </div>`;
    }

    app.appendChild(el(tableHtml));

    // Обработчик сохранения
    if (isTeacher) {
      document.getElementById("saveScheduleBtn").onclick = function() {
        var btn = this;
        btn.textContent = "Сохранение...";
        btn.disabled = true;

        // Собираем данные из всех инпутов
        document.querySelectorAll(".sched-input").forEach(input => {
          var key = input.getAttribute("data-key");
          var sub = input.getAttribute("data-sub");
          var val = input.value.trim();

          if (!scheduleData[key]) scheduleData[key] = { sub1: "", sub2: "" };
          scheduleData[key][sub] = val;
        });

        window.API.saveSchedule(scheduleData).then(res => {
          if (res && res.ok) {
            window.showToast("Расписание успешно сохранено!", "ok");
            btn.textContent = "💾 Сохранить расписание";
            btn.disabled = false;
          } else {
            window.showToast("Ошибка сохранения", "err");
            btn.textContent = "Повторить";
            btn.disabled = false;
          }
        }).catch(() => {
          window.showToast("Ошибка сети", "err");
          btn.textContent = "Повторить";
          btn.disabled = false;
        });
      };
    }
  }
};