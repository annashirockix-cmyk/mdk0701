/* ============================================================
   МДК 07.01 — journal.js (v83.0 — REPORT FIX)
   ============================================================ */
"use strict";

window.renderJournalPage = function() {
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = ""; document.getElementById("crumbs").textContent = "Журнал";
  
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el('<section class="hero"><h1>Журнал успеваемости</h1></section>'));
  
  var isTeacher = state.staff && (state.staff.role === "teacher" || state.staff.role === "admin" || state.staff.role === "curator");
  
  // ПАНЕЛЬ БЫСТРОЙ ВЫДАЧИ XP
  if (isTeacher) {
      var quickPanel = el(`<section class="module" style="background:var(--accent-soft); border-color:var(--accent); margin-bottom:24px;">
          <h3 style="margin-top:0; color:var(--accent);">🎁 Быстрая выдача XP</h3>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <select id="quickStudentSelect" class="self-input" style="flex:1; min-width:200px; margin:0;"></select>
              <input id="quickXPAmount" type="number" class="self-input" style="width:100px; margin:0;" placeholder="XP" value="50" min="1">
              <button class="btn" id="quickGrantBtn" style="background:var(--gold); color:#000;">Выдать</button>
          </div>
      </section>`);
      app.appendChild(quickPanel);
  }

  // КНОПКА ОТПРАВКИ ОТЧЕТА
  if (isTeacher) {
    var topPanel = el('<div style="margin-bottom:16px; display:flex; justify-content:flex-end;"><button class="btn" id="reportBtn" style="background:var(--accent); color:#fff;">📧 Отправить отчет</button></div>');
    app.appendChild(topPanel);
    
    topPanel.querySelector("#reportBtn").onclick = function() {
      var email = prompt("Введите email для отчета:", "anna.shirockix@gmail.com"); 
      if (!email) return;
      
      var btn = this;
      btn.textContent = "Отправка...";
      btn.disabled = true;
      
      var p = new URLSearchParams(); 
      p.append("action", "journalreport"); 
      p.append("group", state.staff.group || "Все"); 
      p.append("email", email);
      
      window.showToast("Отчет отправляется...", "info");
      
      fetch(APPS_SCRIPT_URL, { method: "POST", body: p })
        .then(r => r.json())
        .then(res => {
            if(res.ok) {
                window.showToast("Отчет успешно отправлен!", "ok");
            } else {
                window.showToast("Ошибка сервера: " + (res.error || "Неизвестно"), "err");
            }
        })
        .catch(err => {
            console.error(err);
            window.showToast("Ошибка сети при отправке.", "err");
        })
        .finally(() => {
            btn.textContent = "📧 Отправить отчет";
            btn.disabled = false;
        });
    };
  }

  var tableWrap = el('<section class="module"><div class="skeleton" style="height:200px;"></div></section>'); app.appendChild(tableWrap);

  fetch(APPS_SCRIPT_URL + "?action=getstudents").then(r => r.json()).then(d => {
    tableWrap.innerHTML = "";
    if (!d.ok || !d.students.length) { tableWrap.innerHTML = "Студентов пока нет."; return; }
    
    if (isTeacher) {
        var sel = document.getElementById("quickStudentSelect");
        d.students.forEach(s => {
            sel.appendChild(el(`<option value="${(s.name + "|" + s.group).toLowerCase()}">${s.name} (${s.group})</option>`));
        });
        
        document.getElementById("quickGrantBtn").onclick = function() {
            var sKey = sel.value;
            var sName = sel.options[sel.selectedIndex].text.split(' (')[0];
            var amount = parseInt(document.getElementById("quickXPAmount").value) || 50;
            if (!sKey) return;
            if (confirm(`Выдать ${amount} XP студенту ${sName}?`)) {
                window.grantXP(sKey, sName, amount);
            }
        };
    }

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
    
    table.appendChild(el('<thead><tr>'
        + '<th style="border-bottom:2px solid var(--border); padding:12px; width:20%;">Студент</th>'
        + '<th style="border-bottom:2px solid var(--border); padding:12px; width:10%; text-align:center;">Средний балл</th>'
        + '<th style="border-bottom:2px solid var(--border); padding:12px; width:45%;">Сданные темы и работы</th>'
        + '<th style="border-bottom:2px solid var(--border); padding:12px; width:25%;">Практические</th>'
        + '</tr></thead>'));
        
    var tbody = el('<tbody></tbody>');
    
    displayStudents.forEach(s => {
      var tr = el('<tr style="border-bottom:1px solid var(--border);"></tr>');
      var currentStudentKey = s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase();
      
      var nameCellHtml = `<div style="font-weight:bold; font-size:16px;">${s.name}</div>
                          <div style="font-size:12px;color:var(--muted);font-weight:normal;margin-bottom:8px;">гр. ${s.group}</div>`;
      if (isTeacher) {
          nameCellHtml += `<button class="btn" style="padding:6px 12px; font-size:12px; background:var(--gold); color:#000; font-weight:bold;" onclick="window.grantXP('${currentStudentKey}', '${s.name}')">🎁 Выдать XP</button>`;
      }
      tr.appendChild(el(`<td style="padding:12px; vertical-align:top;">${nameCellHtml}</td>`));
      
      var tdWorks = el('<td style="padding:12px; vertical-align:top;"></td>');
      var tdPracticals = el('<td style="padding:12px; vertical-align:top;"></td>');
      
      var worksHtml = "";
      var pracHtml = "";
      var hasWorks = false;
      var sum = 0, count = 0;
      
      try {
        var p = JSON.parse(s.payload || "{}");
        
        if (p.results) {
          Object.keys(p.results).forEach(k => {
             var tName = k === "__final_exam__" ? "Итоговый экзамен" : k;
             var topic = findTopic(k);
             if (topic) tName = topic.topic.code + ' - ' + topic.topic.title;
             
             worksHtml += `<div style="margin-bottom:8px; padding-bottom:8px; border-bottom:1px dashed var(--border);"><b>${tName}</b> <span style="font-size:11px;color:var(--muted);">(Тест)</span></div>`;
             sum += p.results[k].grade; count++;
             hasWorks = true;
          });
        }
        
        if (p.selfResults) {
          Object.keys(p.selfResults).forEach(k => { 
            var topic = findTopic(k);
            var tName = topic ? topic.topic.code + ' - ' + topic.topic.title : k;
            worksHtml += `<div style="margin-bottom:8px; padding-bottom:8px; border-bottom:1px dashed var(--border);"><b>${tName}</b> <span style="font-size:11px;color:var(--muted);">(Сам. работа)</span></div>`;
            sum += p.selfResults[k].grade; count++;
            hasWorks = true;
          });
        }

        if (p.practicalsDone) {
            Object.keys(p.practicalsDone).forEach(topicId => {
                Object.keys(p.practicalsDone[topicId]).forEach(pCode => {
                    var isDone = p.practicalsDone[topicId][pCode];
                    if (!isDone) return;
                    
                    var topic = findTopic(topicId);
                    var tName = topic ? topic.topic.code : topicId;
                    var grade = (p.practicalGrades && p.practicalGrades[topicId] && p.practicalGrades[topicId][pCode]) || "";
                    
                    pracHtml += `<div style="margin-bottom:8px; padding:8px; background:var(--card-soft); border-radius:8px; border:1px solid var(--border);">
                        <div style="font-size:12px; margin-bottom:4px;"><b>${tName}</b> - ${pCode}</div>`;
                    
                    if (isTeacher) {
                        pracHtml += `<select onchange="window.approvePractical('${currentStudentKey}', '${topicId}', '${pCode}', this.value)" style="padding:4px; border-radius:4px; border:1px solid var(--border); background:var(--bg); color:var(--text); font-weight:bold;">
                            <option value="">— Оценка —</option>
                            <option value="5" ${grade == "5" ? "selected" : ""}>5</option>
                            <option value="4" ${grade == "4" ? "selected" : ""}>4</option>
                            <option value="3" ${grade == "3" ? "selected" : ""}>3</option>
                            <option value="2" ${grade == "2" ? "selected" : ""}>2</option>
                        </select>`;
                    } else {
                        pracHtml += `<span style="font-size:14px; font-weight:bold; color:var(--accent);">${grade ? "Оценка: " + grade : "На проверке"}</span>`;
                    }
                    pracHtml += `</div>`;
                });
            });
        }
      } catch(e) { console.error(e); }
      
      var avg = count > 0 ? (sum / count).toFixed(2) : "—";
      
      tr.appendChild(el(`<td style="padding:12px; vertical-align:top; text-align:center; font-size:18px; font-weight:bold; color:var(--accent);">${avg}</td>`));
      
      if (hasWorks) tdWorks.innerHTML = worksHtml;
      else tdWorks.innerHTML = '<i style="color:var(--muted);">Нет сданных тестов</i>';
      
      if (pracHtml) tdPracticals.innerHTML = pracHtml;
      else tdPracticals.innerHTML = '<i style="color:var(--muted);">Нет заявок</i>';
      
      tr.appendChild(tdWorks);
      tr.appendChild(tdPracticals);
      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    tableWrap.appendChild(tableContainer);
  }).catch(() => { tableWrap.innerHTML = "Ошибка загрузки."; });
};