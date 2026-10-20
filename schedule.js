"use strict";

window.renderSchedulePage = function(){
  var app = document.getElementById("app"); 
  if (!app) return; 
  app.innerHTML = ""; 
  document.getElementById("crumbs").textContent = "Расписание";
  
  app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
  
  var isTeacher = state.staff && (state.staff.role === "teacher" || state.staff.role === "admin");
  
  app.appendChild(el(`<section class="hero"><h1>Расписание занятий (1 семестр)</h1><p>${isTeacher ? 'Режим редактирования. Нажмите "Сохранить" после изменений.' : 'Расписание на семестр'}</p></section>`));

  // Оставляем только нужные группы
  var groups = ["ТМ 2-5", "ТМ 2-6", "ТМ 3-4", "ТМ 4-3"];

  // Структура дней и пар (разное время в пн и остальные дни)
  var scheduleStructure = [
    { 
      name: "ПОНЕДЕЛЬНИК", 
      times: [
        { t: "8.00-8.45", label: "0 пара" },
        { t: "8.50-10.25", label: "1 пара" },
        { t: "10.35-12.10", label: "2 пара" },
        { t: "12.30-14.05", label: "3 пара" },
        { t: "14.15-15.50", label: "4 пара" }
      ]
    },
    { 
      name: "ВТОРНИК", 
      times: [
        { t: "8.00-9.35", label: "1 пара" },
        { t: "9.45-11.20", label: "2 пара" },
        { t: "11.40-13.15", label: "3 пара" },
        { t: "13.25-15.00", label: "4 пара" },
        { t: "15.10-16.45", label: "5 пара" },
        { t: "16.55-18.30", label: "6 пара" }
      ]
    },
    { 
      name: "СРЕДА", 
      times: [
        { t: "8.00-9.35", label: "1 пара" },
        { t: "9.45-11.20", label: "2 пара" },
        { t: "11.40-13.15", label: "3 пара" },
        { t: "13.25-15.00", label: "4 пара" },
        { t: "15.10-16.45", label: "5 пара" },
        { t: "16.55-18.30", label: "6 пара" }
      ]
    },
    { 
      name: "ЧЕТВЕРГ", 
      times: [
        { t: "8.00-9.35", label: "1 пара" },
        { t: "9.45-11.20", label: "2 пара" },
        { t: "11.40-13.15", label: "3 пара" },
        { t: "13.25-15.00", label: "4 пара" },
        { t: "15.10-16.45", label: "5 пара" },
        { t: "16.55-18.30", label: "6 пара" }
      ]
    },
    { 
      name: "ПЯТНИЦА", 
      times: [
        { t: "8.00-9.35", label: "1 пара" },
        { t: "9.45-11.20", label: "2 пара" },
        { t: "11.40-13.15", label: "3 пара" },
        { t: "13.25-15.00", label: "4 пара" },
        { t: "15.10-16.45", label: "5 пара" },
        { t: "16.55-18.30", label: "6 пара" }
      ]
    },
    { 
      name: "СУББОТА", 
      times: [
        { t: "8.00-9.35", label: "1 пара" },
        { t: "9.45-11.20", label: "2 пара" },
        { t: "11.40-13.15", label: "3 пара" },
        { t: "13.25-15.00", label: "4 пара" }
      ]
    }
  ];

  // Предзаполненные данные из Excel (чтобы не вводить вручную)
  var defaultData = {
    // ПОНЕДЕЛЬНИК
    "ПОНЕДЕЛЬНИК_8.00-8.45_ТМ 2-5": { sub1: "Разговор о важном", sub2: "" },
    "ПОНЕДЕЛЬНИК_8.00-8.45_ТМ 2-6": { sub1: "Разговор о важном", sub2: "" },
    "ПОНЕДЕЛЬНИК_8.00-8.45_ТМ 3-4": { sub1: "Разговор о важном", sub2: "" },
    "ПОНЕДЕЛЬНИК_8.00-8.45_ТМ 4-3": { sub1: "Разговор о важном", sub2: "" },

    "ПОНЕДЕЛЬНИК_8.50-10.25_ТМ 2-5": { sub1: "ТЕХ МЕХ\nЛабзов", sub2: "" },
    "ПОНЕДЕЛЬНИК_8.50-10.25_ТМ 2-6": { sub1: "ФИНАНСОВАЯ ГРАМОТН\nКорнеева", sub2: "" },
    "ПОНЕДЕЛЬНИК_8.50-10.25_ТМ 3-4": { sub1: "ПРАКТИКА", sub2: "" },
    "ПОНЕДЕЛЬНИК_8.50-10.25_ТМ 4-3": { sub1: "РАЗРАБОТКА ТП\nНикитин", sub2: "" },

    "ПОНЕДЕЛЬНИК_10.35-12.10_ТМ 2-5": { sub1: "ФИНАНСОВАЯ ГРАМОТН\nКорнеева", sub2: "" },
    "ПОНЕДЕЛЬНИК_10.35-12.10_ТМ 2-6": { sub1: "ТЕХ МЕХ\nЛабзов", sub2: "" },
    "ПОНЕДЕЛЬНИК_10.35-12.10_ТМ 3-4": { sub1: "ПРАКТИКА", sub2: "" },
    "ПОНЕДЕЛЬНИК_10.35-12.10_ТМ 4-3": { sub1: "НАЛАДКА\nКоптелов", sub2: "" },

    "ПОНЕДЕЛЬНИК_12.30-14.05_ТМ 2-5": { sub1: "МАТЕРИАЛОВЕДЕНИЕ\nРемишевская", sub2: "" },
    "ПОНЕДЕЛЬНИК_12.30-14.05_ТМ 2-6": { sub1: "", sub2: "" },
    "ПОНЕДЕЛЬНИК_12.30-14.05_ТМ 3-4": { sub1: "ПРАКТИКА", sub2: "" },
    "ПОНЕДЕЛЬНИК_12.30-14.05_ТМ 4-3": { sub1: "ПЛАНИРОВАНИЕ\nИванова", sub2: "" },

    "ПОНЕДЕЛЬНИК_14.15-15.50_ТМ 2-5": { sub1: "", sub2: "" },
    "ПОНЕДЕЛЬНИК_14.15-15.50_ТМ 2-6": { sub1: "", sub2: "" },
    "ПОНЕДЕЛЬНИК_14.15-15.50_ТМ 3-4": { sub1: "ПРАКТИКА", sub2: "" },
    "ПОНЕДЕЛЬНИК_14.15-15.50_ТМ 4-3": { sub1: "", sub2: "" },

    // ВТОРНИК
    "ВТОРНИК_8.00-9.35_ТМ 2-5": { sub1: "", sub2: "" },
    "ВТОРНИК_8.00-9.35_ТМ 2-6": { sub1: "МАТЕМАТИКА\nЧеремушкина", sub2: "" },
    "ВТОРНИК_8.00-9.35_ТМ 3-4": { sub1: "ПРАКТИКА", sub2: "" },
    "ВТОРНИК_8.00-9.35_ТМ 4-3": { sub1: "НАЛАДКА\nКоптелов", sub2: "" },

    "ВТОРНИК_9.45-11.20_ТМ 2-5": { sub1: "ЛИТЕРАТУРА\nКамагина", sub2: "" },
    "ВТОРНИК_9.45-11.20_ТМ 2-6": { sub1: "МЕТРОЛОГИЯ\nРемишевская", sub2: "" },
    "ВТОРНИК_9.45-11.20_ТМ 3-4": { sub1: "ПРАКТИКА", sub2: "" },
    "ВТОРНИК_9.45-11.20_ТМ 4-3": { sub1: "РАЗРАБОТКА ТП\nНикитин", sub2: "" },

    "ВТОРНИК_11.40-13.15_ТМ 2-5": { sub1: "ФИЗ-РА\nКотов", sub2: "" },
    "ВТОРНИК_11.40-13.15_ТМ 2-6": { sub1: "ТЕХ МАШ\nДанасас", sub2: "" },
    "ВТОРНИК_11.40-13.15_ТМ 3-4": { sub1: "ПРАКТИКА", sub2: "" },
    "ВТОРНИК_11.40-13.15_ТМ 4-3": { sub1: "ПЛАНИРОВАНИЕ\nИванова", sub2: "" },

    "ВТОРНИК_13.25-15.00_ТМ 2-5": { sub1: "БИОЛОГИЯ\nБЖ", sub2: "" },
    "ВТОРНИК_13.25-15.00_ТМ 2-6": { sub1: "МАТЕРИАЛОВЕДЕНИЕ", sub2: "" },
    "ВТОРНИК_13.25-15.00_ТМ 3-4": { sub1: "ПРАКТИКА", sub2: "" },
    "ВТОРНИК_13.25-15.00_ТМ 4-3": { sub1: "НАЛАДКА\nСБОРКА УЗЛОВ", sub2: "" },

    "ВТОРНИК_15.10-16.45_ТМ 2-5": { sub1: "ИСТОРИЯ\nАлексеева", sub2: "" },
    
    // СРЕДА
    "СРЕДА_8.00-9.35_ТМ 2-5": { sub1: "МАТЕМАТИКА\nЧеремушкина", sub2: "" },
    "СРЕДА_8.00-9.35_ТМ 2-6": { sub1: "ИСТОРИЯ\nАлексеева", sub2: "" },
    "СРЕДА_8.00-9.35_ТМ 3-4": { sub1: "ПРАКТИКА", sub2: "" },
    "СРЕДА_8.00-9.35_ТМ 4-3": { sub1: "", sub2: "" },

    "СРЕДА_9.45-11.20_ТМ 2-5": { sub1: "МАТЕМАТИКА\nЧеремушкина", sub2: "" },
    "СРЕДА_9.45-11.20_ТМ 2-6": { sub1: "БИОЛОГИЯ\nБЖ", sub2: "" },
    "СРЕДА_9.45-11.20_ТМ 3-4": { sub1: "ПРАКТИКА", sub2: "" },
    "СРЕДА_9.45-11.20_ТМ 4-3": { sub1: "ФИЗ-РА\nКотов", sub2: "" },

    "СРЕДА_11.40-13.15_ТМ 2-5": { sub1: "ТЕХ МАШ\nПФИ", sub2: "" },
    "СРЕДА_11.40-13.15_ТМ 2-6": { sub1: "ПФИ\nТЕХ МАШ", sub2: "" },
    "СРЕДА_11.40-13.15_ТМ 3-4": { sub1: "ПРАКТИКА", sub2: "" },
    "СРЕДА_11.40-13.15_ТМ 4-3": { sub1: "РАЗРАБОТКА ТП\nНикитин", sub2: "" },

    "СРЕДА_13.25-15.00_ТМ 2-5": { sub1: "МЕТРОЛОГИЯ\nРемишевская", sub2: "" },
    "СРЕДА_13.25-15.00_ТМ 2-6": { sub1: "КОМП ГРАФИКА\nЛабзов", sub2: "" },
    "СРЕДА_13.25-15.00_ТМ 3-4": { sub1: "ПРАКТИКА", sub2: "" },
    "СРЕДА_13.25-15.00_ТМ 4-3": { sub1: "ПЛАНИРОВАНИЕ\nИванова", sub2: "" },

    // ЧЕТВЕРГ
    "ЧЕТВЕРГ_8.00-9.35_ТМ 2-5": { sub1: "ИНФОРМАТИКА*\nМахонина", sub2: "" },
    "ЧЕТВЕРГ_8.00-9.35_ТМ 2-6": { sub1: "МАТЕРИАЛОВЕДЕНИЕ\nРемишевская", sub2: "" },
    "ЧЕТВЕРГ_8.00-9.35_ТМ 3-4": { sub1: "ПРАКТИКА", sub2: "" },
    "ЧЕТВЕРГ_8.00-9.35_ТМ 4-3": { sub1: "НАЛАДКА\nКоптелов", sub2: "" },

    "ЧЕТВЕРГ_9.45-11.20_ТМ 2-5": { sub1: "ИН ЯЗЫК\nБычкова/Лазутина", sub2: "" },
    "ЧЕТВЕРГ_9.45-11.20_ТМ 2-6": { sub1: "ИСТОРИЯ\nОБЩЕСТВОЗНАНИЕ", sub2: "" },
    "ЧЕТВЕРГ_9.45-11.20_ТМ 3-4": { sub1: "ПРАКТИКА", sub2: "" },
    "ЧЕТВЕРГ_9.45-11.20_ТМ 4-3": { sub1: "РАЗРАБОТКА ТП\nПЛАНИРОВАНИЕ", sub2: "" },

    "ЧЕТВЕРГ_11.40-13.15_ТМ 2-5": { sub1: "ТЕХ МАШ\nДанасас", sub2: "" },
    "ЧЕТВЕРГ_11.40-13.15_ТМ 2-6": { sub1: "МАТЕМАТИКА\nЧеремушкина", sub2: "" },
    "ЧЕТВЕРГ_11.40-13.15_ТМ 3-4": { sub1: "ПРАКТИКА", sub2: "" },
    "ЧЕТВЕРГ_11.40-13.15_ТМ 4-3": { sub1: "ИН ЯЗЫК\nБычкова/Лазутина", sub2: "" },

    "ЧЕТВЕРГ_13.25-15.00_ТМ 2-5": { sub1: "ИНФОРМАТИКА**\nМахонина", sub2: "" },
    "ЧЕТВЕРГ_13.25-15.00_ТМ 2-6": { sub1: "ИН ЯЗЫК\nБычкова/Лазутина", sub2: "" },
    "ЧЕТВЕРГ_13.25-15.00_ТМ 3-4": { sub1: "ПРАКТИКА", sub2: "" },
    "ЧЕТВЕРГ_13.25-15.00_ТМ 4-3": { sub1: "СБОРКА УЗЛОВ\nШироких", sub2: "" },

    // ПЯТНИЦА
    "ПЯТНИЦА_8.00-9.35_ТМ 2-5": { sub1: "МЕТРОЛОГИЯ\nМАТЕРИАЛОВЕДЕНИЕ", sub2: "" },
    "ПЯТНИЦА_8.00-9.35_ТМ 2-6": { sub1: "ИНФОРМАТИКА*\nТазина", sub2: "" },
    "ПЯТНИЦА_8.00-9.35_ТМ 3-4": { sub1: "ПРАКТИКА", sub2: "" },
    "ПЯТНИЦА_8.00-9.35_ТМ 4-3": { sub1: "СБОРКА УЗЛОВ\nШироких", sub2: "" },

    "ПЯТНИЦА_9.45-11.20_ТМ 2-5": { sub1: "КОМП ГРАФИКА\nЛабзов", sub2: "" },
    "ПЯТНИЦА_9.45-11.20_ТМ 2-6": { sub1: "БЖ\nГлазкова", sub2: "" },
    "ПЯТНИЦА_9.45-11.20_ТМ 3-4": { sub1: "ПРАКТИКА", sub2: "" },
    "ПЯТНИЦА_9.45-11.20_ТМ 4-3": { sub1: "СБОРКА УЗЛОВ\nШироких", sub2: "" },

    "ПЯТНИЦА_11.40-13.15_ТМ 2-5": { sub1: "ИСТОРИЯ\nОБЩЕСТВОЗНАНИЕ", sub2: "" },
    "ПЯТНИЦА_11.40-13.15_ТМ 2-6": { sub1: "ЛИТЕРАТУРА\nКамагина", sub2: "" },
    "ПЯТНИЦА_11.40-13.15_ТМ 3-4": { sub1: "ПРАКТИКА", sub2: "" },
    "ПЯТНИЦА_11.40-13.15_ТМ 4-3": { sub1: "ПЛАНИРОВАНИЕ\nИванова", sub2: "" },

    "ПЯТНИЦА_13.25-15.00_ТМ 2-5": { sub1: "БЖ\nГлазкова", sub2: "" },
    "ПЯТНИЦА_13.25-15.00_ТМ 2-6": { sub1: "ФИЗ-РА\nКотов", sub2: "" },
    "ПЯТНИЦА_13.25-15.00_ТМ 3-4": { sub1: "ПРАКТИКА", sub2: "" },
    "ПЯТНИЦА_13.25-15.00_ТМ 4-3": { sub1: "", sub2: "" }
  };

  var scheduleData = {};

  window.API.getSchedule().then(res => {
    if (res && res.ok && res.schedule) {
      try { 
          var parsed = JSON.parse(res.schedule); 
          // Если данных с сервера нет, используем дефолтные
          if (Object.keys(parsed).length === 0) {
              scheduleData = JSON.parse(JSON.stringify(defaultData));
          } else {
              scheduleData = parsed;
          }
      } catch(e) { scheduleData = JSON.parse(JSON.stringify(defaultData)); }
    } else {
      scheduleData = JSON.parse(JSON.stringify(defaultData));
    }
    buildTable();
  }).catch(err => {
    app.appendChild(el('<div class="module" style="color:var(--err);">Ошибка загрузки. Используются данные по умолчанию.</div>'));
    scheduleData = JSON.parse(JSON.stringify(defaultData));
    buildTable(); 
  });

  function buildTable() {
    var tableHtml = `<div class="module" style="overflow-x:auto; padding:10px;">
      <table class="schedule-table" style="width:100%; border-collapse:collapse; text-align:center; font-size:12px; min-width:800px;">
        <thead>
          <tr style="background:var(--card-soft);">
            <th style="border:1px solid var(--border); padding:8px; width:120px;">День</th>
            <th style="border:1px solid var(--border); padding:8px; width:100px;">Время</th>`;
            
    groups.forEach(g => {
      tableHtml += `<th style="border:1px solid var(--border); padding:8px;">${g}</th>`;
    });
    
    tableHtml += `</tr></thead><tbody>`;

    scheduleStructure.forEach(dayObj => {
      var day = dayObj.name;
      var times = dayObj.times;
      
      times.forEach((timeObj, timeIdx) => {
        tableHtml += `<tr>`;
        
        // Ячейка дня (объединяем строки)
        if (timeIdx === 0) {
          tableHtml += `<td rowspan="${times.length}" style="border:1px solid var(--border); font-weight:bold; background:var(--card-soft); vertical-align:middle; writing-mode:vertical-rl; transform:rotate(180deg);">${day}</td>`;
        }

        // Ячейка времени + номер пары
        tableHtml += `<td style="border:1px solid var(--border); padding:4px; font-size:12px;">
            <b>${timeObj.t}</b><br>
            <span style="font-size:10px; color:var(--muted);">${timeObj.label}</span>
        </td>`;

        // Ячейки для групп
        groups.forEach(group => {
          var cellKey = `${day}_${timeObj.t}_${group}`;
          var cellData = scheduleData[cellKey] || { sub1: "", sub2: "" };

          if (isTeacher) {
            tableHtml += `<td style="border:1px solid var(--border); padding:4px; vertical-align:top;">
              <div style="margin-bottom:2px;">
                <textarea class="sched-input" data-key="${cellKey}" data-sub="sub1" style="width:100%; border:none; background:transparent; color:var(--text); resize:vertical; font-size:11px; min-height:40px;" placeholder="...">${cellData.sub1 || ''}</textarea>
              </div>
              <div style="border-top:1px dashed var(--border); margin:2px 0;"></div>
              <div>
                <textarea class="sched-input" data-key="${cellKey}" data-sub="sub2" style="width:100%; border:none; background:transparent; color:var(--text); resize:vertical; font-size:11px; min-height:40px;" placeholder="...">${cellData.sub2 || ''}</textarea>
              </div>
            </td>`;
          } else {
            var sub1Html = cellData.sub1 ? `<div style="font-weight:bold; color:var(--text); margin-bottom:4px; white-space:pre-wrap;">${cellData.sub1}</div>` : '';
            var sub2Html = cellData.sub2 ? `<div style="border-top:1px dashed var(--border); padding-top:4px; color:var(--text-soft); white-space:pre-wrap;">${cellData.sub2}</div>` : '';
            var emptyHtml = (!cellData.sub1 && !cellData.sub2) ? '<span style="color:var(--border);">—</span>' : '';
            
            tableHtml += `<td style="border:1px solid var(--border); padding:6px; vertical-align:top; text-align:left; line-height:1.3;">
              ${sub1Html}${sub2Html}${emptyHtml}
            </td>`;
          }
        });

        tableHtml += `</tr>`;
      });
      
      if (day !== "СУББОТА") {
        tableHtml += `<tr><td colspan="${groups.length + 2}" style="height:10px; background:var(--bg); border:none;"></td></tr>`;
      }
    });

    tableHtml += `</tbody></table></div>`;
    
    if (isTeacher) {
      tableHtml += `<div style="margin-top:20px; text-align:center;">
        <button class="btn" id="saveScheduleBtn" style="padding:12px 30px; font-size:16px;">💾 Сохранить расписание</button>
        <p style="font-size:12px; color:var(--muted); margin-top:8px;">Нажмите, чтобы применить изменения</p>
      </div>`;
    }

    app.appendChild(el(tableHtml));

    if (isTeacher) {
      var saveBtn = document.getElementById("saveScheduleBtn");
      if (saveBtn) {
          saveBtn.onclick = function() {
            var btn = this;
            btn.textContent = "Сохранение...";
            btn.disabled = true;

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
  }
};