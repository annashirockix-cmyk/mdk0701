/* ============================================================
   МДК 07.01 — journal.js (v58.0 — FIX)
   ============================================================ */
"use strict";

window.renderJournalPage = function() {
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = ""; document.getElementById("crumbs").textContent = "Журнал";
  
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el('<section class="hero"><h1>Журнал успеваемости</h1></section>'));
  
  var isTeacher = state.staff && (state.staff.role === "teacher" || state.staff.role === "admin" || state.staff.role === "curator");
  
  if (isTeacher) {
    // Исправлена кнопка (var(--blue) заменен на var(--accent))
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
    
    var tableContainer = el('<div class="journal-container"></div>');
    var table = el('<table class="journal-table"></table>');
    table.appendChild(el('<thead><tr><th>Студент</th><th>Группа</th><th>Оценки (Детализация)</th></tr></thead>'));
    var tbody = el('<tbody></tbody>');
    
    displayStudents.forEach(s => {
      var tr = el('<tr></tr>');
      tr.appendChild(el('<td style="text-align:left; font-weight:bold;">' + s.name + '</td>'));
      tr.appendChild(el('<td style="font-weight:bold;">' + s.group + '</td>'));
      
      var tdGrade = el('<td style="text-align:left; font-size:13px;"></td>');
      
      var html = "";
      try {
        var p = JSON.parse(s.payload);
        var gradesList = [];
        if (p.results) {
          Object.keys(p.results).forEach(k => {
             var tName = k === "__final_exam__" ? "Экзамен" : k;
             var topic = findTopic(k);
             if (topic) tName = topic.topic.code;
             gradesList.push(`<span style="display:inline-block;background:var(--card-soft);padding:2px 6px;border-radius:4px;margin:2px;">${tName}: <b>${p.results[k].grade}</b></span>`);
          });
        }
        if (p.selfResults) {
          Object.keys(p.selfResults).forEach(k => { 
            var topic = findTopic(k);
            var tName = topic ? topic.topic.code : k;
            gradesList.push(`<span style="display:inline-block;background:var(--card-soft);padding:2px 6px;border-radius:4px;margin:2px;">${tName} (Сам.): <b>${p.selfResults[k].grade}</b></span>`); 
          });
        }
        if (gradesList.length) html = gradesList.join(" ");
        else html = "<i>Нет оценок за тесты</i>";
      } catch(e) { html = "<i>Нет данных</i>"; }
      
      tdGrade.innerHTML = html;
      tr.appendChild(tdGrade);
      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    tableWrap.appendChild(tableContainer);
  }).catch(() => { tableWrap.innerHTML = "Ошибка загрузки."; });
};