window.renderJournalPage = function() {
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = ""; document.getElementById("crumbs").textContent = "Журнал";
  
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el('<section class="hero"><h1>Журнал успеваемости</h1></section>'));
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
    
    var table = el('<table class="journal-table" style="width:100%;border-collapse:collapse;"><thead><tr><th>Студент</th><th>Группа</th><th>Оценки</th></tr></thead><tbody></tbody></table>');
    var tbody = table.querySelector("tbody");
    
    displayStudents.forEach(s => {
      var tr = el('<tr></tr>');
      tr.appendChild(el('<td style="border:1px solid var(--border);padding:10px;">' + s.name + '</td>'));
      tr.appendChild(el('<td style="border:1px solid var(--border);padding:10px;">' + s.group + '</td>'));
      
      var tdGrade = el('<td style="border:1px solid var(--border);padding:10px;"></td>');
      
      var html = "";
      try {
        var p = JSON.parse(s.payload);
        var gradesList = [];
        if (p.results) {
          Object.keys(p.results).forEach(k => {
             if(k !== "__final_exam__") gradesList.push("Тест: " + p.results[k].grade);
             else gradesList.push("Экзамен: " + p.results[k].grade);
          });
        }
        if (p.selfResults) {
          Object.keys(p.selfResults).forEach(k => { gradesList.push("Сам.: " + p.selfResults[k].grade); });
        }
        if (gradesList.length) html = gradesList.join(" | ");
        else html = "<i>Нет оценок (только лекции)</i>";
      } catch(e) { html = "<i>Нет данных</i>"; }
      
      tdGrade.innerHTML = html;
      tr.appendChild(tdGrade);
      tbody.appendChild(tr);
    });
    
    tableWrap.appendChild(table);
  }).catch(() => { tableWrap.innerHTML = "Ошибка загрузки."; });
};