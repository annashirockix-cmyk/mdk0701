/* ============================================================
   МДК 07.01 — journal.js (v59.0 — BEAUTIFUL UI)
   ============================================================ */
"use strict";

window.renderJournalPage = function() {
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = ""; document.getElementById("crumbs").textContent = "Журнал";
  
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el('<section class="hero"><h1>Журнал успеваемости</h1></section>'));
  
  var isTeacher = state.staff && (state.staff.role === "teacher" || state.staff.role === "admin" || state.staff.role === "curator");
  
  if (isTeacher) {
    var topPanel = el('<div style="margin-bottom:16px; display:flex; justify-content:flex-end;"><button class="btn" id="reportBtn" style="background:var(--accent); color:#fff;">📧 Отправить отчет</button></div>');
    app.appendChild(topPanel);
    topPanel.querySelector("#reportBtn").onclick = function() {
      var email = prompt("Введите email для отчета:", "anna.shirockix@gmail.com"); if (!email) return;
      var p = new URLSearchParams(); p.append("action", "journalreport"); p.append("group", state.staff.group || "ТМ-3"); p.append("email", email);
      window.showToast("Отчет отправляется...", "info");
      fetch(APPS_SCRIPT_URL, { method: "POST", body: p }).then(r=>r.json()).then(res=>{
         if(res.ok) window.showToast("Отчет отправлен!", "ok"); else window.showToast("Ошибка отправки.", "err");
      });
    };
  }

  var tableWrap = el('<section class="module"><div class="skeleton" style="height:200px;"></div></section>'); app.appendChild(tableWrap);

  fetch(APPS_SCRIPT_URL + "?action=getstudents").then(r => r.json()).then(d => {
    tableWrap.innerHTML = "";
    if (!d.ok || !d.students.length) { tableWrap.innerHTML = "Студентов пока нет."; return; }
    
    var displayStudents = d.students;
    if (!state.staff && state.student) {
      displayStudents = d.students.filter(function(s) {
        return s.name.trim().toLowerCase() === state.student.name.trim().toLowerCase() && 
               s.group.trim().toUpperCase() === state.student.group.trim().toUpperCase();
      });
    }
    if (!displayStudents.length) { tableWrap.innerHTML = "<p class='sub'>Ваших данных пока нет.</p>"; return; }
    
    var tableContainer = el('<div class="journal-container" style="overflow-x:auto;"></div>');
    var table = el('<table class="journal-table" style="width:100%; border-collapse:collapse; text-align:left; font-size:14px;"></table>');
    
    // Обновленная шапка таблицы
    table.appendChild(el('<thead><tr>'
        + '<th style="border-bottom:2px solid var(--border); padding:12px; width:25%;">Студент</th>'
        + '<th style="border-bottom:2px solid var(--border); padding:12px; width:50%;">Сданные темы и работы</th>'
        + '<th style="border-bottom:2px solid var(--border); padding:12px; width:25%; text-align:center;">Оценка / Попытка</th>'
        + '</tr></thead>'));
        
    var tbody = el('<tbody></tbody>');
    
    displayStudents.forEach(s => {
      var tr = el('<tr style="border-bottom:1px solid var(--border);"></tr>');
      
      // 1. ФИО
      tr.appendChild(el('<td style="padding:12px; vertical-align:top; font-weight:bold;">' + s.name + '<br><span style="font-size:12px;color:var(--muted);font-weight:normal;">гр. ' + s.group + '</span></td>'));
      
      var tdWorks = el('<td style="padding:12px; vertical-align:top;"></td>');
      var tdStats = el('<td style="padding:12px; vertical-align:top; text-align:center;"></td>');
      
      var worksHtml = "";
      var statsHtml = "";
      var hasWorks = false;

      try {
        var p = JSON.parse(s.payload);
        
        if (p.results) {
          Object.keys(p.results).forEach(k => {
             var tName = k === "__final_exam__" ? "Итоговый экзамен" : k;
             var topic = findTopic(k);
             if (topic) tName = topic.topic.code + ' - ' + topic.topic.title;
             
             worksHtml += `<div style="margin-bottom:8px; padding-bottom:8px; border-bottom:1px dashed var(--border);"><b>${tName}</b> <span style="font-size:11px;color:var(--muted);">(Тест)</span></div>`;
             statsHtml += `<div style="margin-bottom:8px; padding-bottom:8px; border-bottom:1px dashed var(--border);">Оценка: <b style="color:var(--accent); font-size:16px;">${p.results[k].grade}</b></div>`;
             hasWorks = true;
          });
        }
        
        if (p.selfResults) {
          Object.keys(p.selfResults).forEach(k => { 
            var topic = findTopic(k);
            var tName = topic ? topic.topic.code + ' - ' + topic.topic.title : k;
            worksHtml += `<div style="margin-bottom:8px; padding-bottom:8px; border-bottom:1px dashed var(--border);"><b>${tName}</b> <span style="font-size:11px;color:var(--muted);">(Сам. работа)</span></div>`;
            statsHtml += `<div style="margin-bottom:8px; padding-bottom:8px; border-bottom:1px dashed var(--border);">Оценка: <b style="color:var(--accent); font-size:16px;">${p.selfResults[k].grade}</b></div>`;
            hasWorks = true;
          });
        }
      } catch(e) {}
      
      if (hasWorks) {
          tdWorks.innerHTML = worksHtml;
          tdStats.innerHTML = statsHtml;
      } else {
          tdWorks.innerHTML = '<i style="color:var(--muted);">Нет сданных работ</i>';
          tdStats.innerHTML = '—';
      }
      
      tr.appendChild(tdWorks);
      tr.appendChild(tdStats);
      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    tableWrap.appendChild(tableContainer);
  }).catch(() => { tableWrap.innerHTML = "Ошибка загрузки."; });
};