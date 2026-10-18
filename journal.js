/* ============================================================
   МДК 07.01 — journal.js (v46.0 — FULL RESTORE)
   ============================================================ */
"use strict";

window.renderJournalPage = function() {
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = ""; document.getElementById("crumbs").textContent = "Журнал";
  
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el('<section class="hero"><h1>Журнал успеваемости</h1></section>'));
  
  var tableWrap = el('<section class="module"><div class="skeleton" style="height:200px;"></div></section>'); app.appendChild(tableWrap);

  var isTeacher = state.staff && (state.staff.role === "teacher" || state.staff.role === "admin" || state.staff.role === "curator");

  fetch(APPS_SCRIPT_URL + "?action=getstudents")
    .then(r => r.json()).then(d => {
      tableWrap.innerHTML = "";
      if (!d.ok || !d.students.length) { tableWrap.innerHTML = "Студентов пока нет."; return; }
      
      // ФИЛЬТРАЦИЯ
      var displayStudents = d.students;
      if (!state.staff && state.student) {
        displayStudents = d.students.filter(function(s) {
          return s.name.trim().toLowerCase() === state.student.name.trim().toLowerCase() && 
                 s.group.trim().toUpperCase() === state.student.group.trim().toUpperCase();
        });
      }

      if (!displayStudents.length) { tableWrap.innerHTML = "<p class='sub'>Ваших данных в журнале пока нет. Пройдите тесты, чтобы оценки появились.</p>"; return; }
      
      // Панель управления для учителя
      if (isTeacher) {
        var topPanel = el('<div style="margin-bottom:16px; display:flex; justify-content:flex-end;"><button class="btn" id="reportBtn" style="background:var(--blue);">📧 Отправить отчет по группе</button></div>');
        tableWrap.appendChild(topPanel);
        topPanel.querySelector("#reportBtn").onclick = function() {
          var email = prompt("Введите email для отчета:", "anna.shirockix@gmail.com"); if (!email) return;
          var p = new URLSearchParams(); p.append("action", "journalreport"); p.append("group", state.staff.group || "ТМ-3"); p.append("email", email);
          window.showToast("Отчет отправляется...", "info");
          fetch(APPS_SCRIPT_URL, { method: "POST", body: p }).then(r=>r.json()).then(res=>{
             if(res.ok) window.showToast("Отчет отправлен!", "ok"); else window.showToast("Ошибка отправки.", "err");
          });
        };
      }

      var table = el('<table class="journal-table" style="width:100%;border-collapse:collapse;"><thead><tr><th>Студент</th><th>Группа</th><th>Оценки</th></tr></thead><tbody></tbody></table>');
      var tbody = table.querySelector("tbody");
      
      displayStudents.forEach(s => {
        var tr = el('<tr></tr>');
        tr.appendChild(el('<td style="border:1px solid var(--border);padding:10px;">' + s.name + '</td>'));
        tr.appendChild(el('<td style="border:1px solid var(--border);padding:10px;">' + s.group + '</td>'));
        
        var tdGrade = el('<td style="border:1px solid var(--border);padding:10px;"></td>');
        if (isTeacher) {
          var input = el('<input type="text" class="grade-input" value="' + (s.grade || '') + '" placeholder="Оценка" style="width:80px;padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--bg);color:var(--text);">');
          input.onchange = function() {
            var p = new URLSearchParams();
            p.append("action", "journalsave"); p.append("group", s.group); p.append("student", s.name); p.append("date", new Date().toLocaleDateString("ru-RU")); p.append("grade", this.value); p.append("teacher", state.staff.name);
            fetch(APPS_SCRIPT_URL, { method: "POST", body: p }).then(()=>window.showToast("Оценка сохранена", "ok"));
          };
          tdGrade.appendChild(input);
        } else {
          tdGrade.textContent = s.grade || "—";
        }
        tr.appendChild(tdGrade);
        tbody.appendChild(tr);
      });
      
      tableWrap.appendChild(table);
    }).catch(() => { tableWrap.innerHTML = "Ошибка загрузки журнала."; });
};