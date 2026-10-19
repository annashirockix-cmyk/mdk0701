/* ============================================================
   МДК 07.01 — journal.js (v110.0 — FULL REWRITE)
   Добавлено: кнопки +/− для быстрой выдачи/списания XP
   ============================================================ */
"use strict";

window.renderJournalPage = function() {
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = "";
  var crumbs = document.getElementById("crumbs"); if (crumbs) crumbs.textContent = "Журнал";
  
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el('<section class="hero"><h1>Журнал успеваемости</h1></section>'));
  
  var isTeacher = state.staff && (state.staff.role === "teacher" || state.staff.role === "admin" || state.staff.role === "curator");
  
  /* ------- Быстрая панель XP для учителя ------- */
  if (isTeacher) {
      var quickPanel = el(
          '<section class="module" style="background:var(--accent-soft); border-color:var(--accent); margin-bottom:24px;">' +
              '<h3 style="margin-top:0; color:var(--accent);">🎁 Быстрая выдача / списание XP</h3>' +
              '<div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">' +
                  '<select id="quickStudentSelect" class="self-input" style="flex:1; min-width:200px; margin:0;">' +
                      '<option value="">— Выберите студента —</option>' +
                  '</select>' +
                  '<input id="quickXPAmount" type="number" class="self-input" style="width:110px; margin:0;" placeholder="XP" value="50" min="1">' +
                  '<button class="btn" id="quickAddBtn" style="background:var(--gold); color:#000;">+ Начислить</button>' +
                  '<button class="btn ghost" id="quickSubBtn" style="border-color:var(--err); color:var(--err);">− Списать</button>' +
              '</div>' +
          '</section>');
      app.appendChild(quickPanel);
  }

  var tableWrap = el('<section class="module"><div class="skeleton" style="height:200px;"></div></section>'); 
  app.appendChild(tableWrap);

  fetch(APPS_SCRIPT_URL + "?action=getstudents&t=" + Date.now(), { cache: "no-store" })
    .then(function(r){ return r.json(); })
    .then(function(d) {
      tableWrap.innerHTML = "";
      if (!d || !d.ok || !d.students || !d.students.length) {
          tableWrap.innerHTML = "Студентов пока нет.";
          return;
      }
      
      /* ------- Наполняем селектор и вешаем обработчики ------- */
      if (isTeacher) {
          var sel = document.getElementById("quickStudentSelect");
          var studentsList = d.students;
          studentsList.forEach(function(s) {
              var opt = el('<option></option>');
              var sKey = (String(s.name || "").trim().toLowerCase() + "|" + String(s.group || "").trim().toLowerCase());
              opt.value = sKey;
              opt.textContent = String(s.name) + " (" + String(s.group) + ")";
              sel.appendChild(opt);
          });
          
          var getSelectedInfo = function() {
              if (!sel.value) return null;
              return {
                  key: sel.value,
                  name: sel.options[sel.selectedIndex].text.replace(/\s*\([^)]*\)\s*$/, "").trim()
              };
          };
          var getAmount = function() {
              var v = parseInt(document.getElementById("quickXPAmount").value, 10);
              return isNaN(v) || v <= 0 ? 50 : v;
          };
          
          document.getElementById("quickAddBtn").onclick = function() {
              var info = getSelectedInfo();
              if (!info) { window.showToast("Выберите студента", "err"); return; }
              var amount = getAmount();
              if (confirm("Начислить +" + amount + " XP студенту " + info.name + "?")) {
                  window.grantXP(info.key, info.name, amount);
              }
          };
          document.getElementById("quickSubBtn").onclick = function() {
              var info = getSelectedInfo();
              if (!info) { window.showToast("Выберите студента", "err"); return; }
              var amount = -getAmount();
              if (confirm("Списать " + Math.abs(amount) + " XP у студента " + info.name + "?")) {
                  window.grantXP(info.key, info.name, amount);
              }
          };
      }

      /* ------- Фильтр для студента ------- */
      var displayStudents = d.students;
      if (!state.staff && state.student) {
          displayStudents = d.students.filter(function(s) {
              return String(s.name || "").trim().toLowerCase() === state.student.name.trim().toLowerCase() && 
                     String(s.group || "").trim().toUpperCase() === state.student.group.trim().toUpperCase();
          });
      }
      if (!displayStudents.length) { 
          tableWrap.innerHTML = "<p class='sub'>Ваших данных пока нет.</p>"; 
          return; 
      }
      
      var tableContainer = el('<div class="journal-container" style="overflow-x:auto;"></div>');
      var table = el('<table class="journal-table" style="width:100%; border-collapse:collapse; text-align:left; font-size:14px;"></table>');
      
      table.appendChild(el('<thead><tr>' +
          '<th style="border-bottom:2px solid var(--border); padding:12px; width:25%;">Студент</th>' +
          '<th style="border-bottom:2px solid var(--border); padding:12px; width:10%; text-align:center;">Ср. балл</th>' +
          '<th style="border-bottom:2px solid var(--border); padding:12px; width:40%;">Сданные работы</th>' +
          '<th style="border-bottom:2px solid var(--border); padding:12px; width:25%;">Практические</th>' +
      '</tr></thead>'));
          
      var tbody = el('<tbody></tbody>');
      
      displayStudents.forEach(function(s) {
          var tr = el('<tr style="border-bottom:1px solid var(--border);"></tr>');
          var currentStudentKey = String(s.name || "").trim().toLowerCase() + "|" + String(s.group || "").trim().toLowerCase();
          
          var nameCellHtml = '<div style="font-weight:bold; font-size:16px;">' + escapeHtml(s.name) + '</div>' +
                             '<div style="font-size:12px;color:var(--muted);font-weight:normal;margin-bottom:8px;">гр. ' + escapeHtml(s.group) + '</div>';
          
          if (isTeacher) {
              nameCellHtml += '<div style="display:flex; gap:8px; flex-wrap:wrap;">' +
                  '<button class="btn" style="padding:6px 12px; font-size:12px; background:var(--gold); color:#000; font-weight:bold;" data-action="grant" data-key="' + escapeHtml(currentStudentKey) + '" data-name="' + escapeHtml(s.name) + '">🎁 XP</button>' +
                  '<button class="btn ghost" style="padding:6px 12px; font-size:12px; border-color:var(--err); color:var(--err);" data-action="delete" data-name="' + escapeHtml(s.name) + '" data-group="' + escapeHtml(s.group) + '">🗑️ Удалить</button>' +
              '</div>';
          }
          tr.appendChild(el('<td style="padding:12px; vertical-align:top;">' + nameCellHtml + '</td>'));
          
          var tdWorks = el('<td style="padding:12px; vertical-align:top;"></td>');
          var tdPracticals = el('<td style="padding:12px; vertical-align:top;"></td>');
          
          var worksHtml = "";
          var pracHtml = "";
          var hasWorks = false;
          var sum = 0, count = 0;
          
          try {
              var p = JSON.parse(s.payload || "{}") || {};
              
              if (p.results) {
                  Object.keys(p.results).forEach(function(k) {
                      var tName = k === "__final_exam__" ? "Экзамен" : k;
                      var topic = findTopic(k);
                      if (topic) tName = topic.topic.code + ' - ' + topic.topic.title;
                      worksHtml += '<div style="margin-bottom:8px; padding-bottom:8px; border-bottom:1px dashed var(--border);"><b>' + escapeHtml(tName) + '</b> <span style="font-size:11px;color:var(--muted);">(Тест)</span></div>';
                      sum += p.results[k].grade || 0; count++; hasWorks = true;
                  });
              }
              
              if (p.selfResults) {
                  Object.keys(p.selfResults).forEach(function(k) { 
                      var topic = findTopic(k);
                      var tName = topic ? topic.topic.code + ' - ' + topic.topic.title : k;
                      worksHtml += '<div style="margin-bottom:8px; padding-bottom:8px; border-bottom:1px dashed var(--border);"><b>' + escapeHtml(tName) + '</b> <span style="font-size:11px;color:var(--muted);">(Сам. работа)</span></div>';
                      sum += p.selfResults[k].grade || 0; count++; hasWorks = true;
                  });
              }

              if (p.practicalsDone) {
                  Object.keys(p.practicalsDone).forEach(function(topicId) {
                      Object.keys(p.practicalsDone[topicId]).forEach(function(pCode) {
                          if (p.practicalsDone[topicId][pCode] !== "approved" && p.practicalsDone[topicId][pCode] !== "pending") return;
                          var topic = findTopic(topicId);
                          var tName = topic ? topic.topic.code : topicId;
                          var grade = (p.practicalGrades && p.practicalGrades[topicId] && p.practicalGrades[topicId][pCode]) || "";
                          pracHtml += '<div style="margin-bottom:8px; padding:8px; background:var(--card-soft); border-radius:8px; border:1px solid var(--border);">' +
                              '<div style="font-size:12px; margin-bottom:4px;"><b>' + escapeHtml(tName) + '</b> - ' + escapeHtml(pCode) + '</div>';
                          if (isTeacher) {
                              pracHtml += '<select onchange="window.approvePractical(\'' + currentStudentKey + '\', \'' + topicId + '\', \'' + pCode + '\', this.value)" ' +
                                  'style="padding:4px; border-radius:4px; border:1px solid var(--border); background:var(--bg); color:var(--text); font-weight:bold;">' +
                                  '<option value="">— Оценка —</option>' +
                                  '<option value="5" ' + (grade == "5" ? "selected" : "") + '>5</option>' +
                                  '<option value="4" ' + (grade == "4" ? "selected" : "") + '>4</option>' +
                                  '<option value="3" ' + (grade == "3" ? "selected" : "") + '>3</option>' +
                                  '<option value="2" ' + (grade == "2" ? "selected" : "") + '>2</option>' +
                              '</select>';
                          } else {
                              pracHtml += '<span style="font-size:14px; font-weight:bold; color:var(--accent);">' + (grade ? "Оценка: " + escapeHtml(grade) : "На проверке") + '</span>';
                          }
                          pracHtml += '</div>';
                      });
                  });
              }
          } catch(e) { console.warn("Ошибка парсинга данных", e); }
          
          var avg = count > 0 ? (sum / count).toFixed(2) : "—";
          tr.appendChild(el('<td style="padding:12px; vertical-align:top; text-align:center; font-size:18px; font-weight:bold; color:var(--accent);">' + avg + '</td>'));
          
          if (hasWorks) tdWorks.innerHTML = worksHtml; else tdWorks.innerHTML = '<i style="color:var(--muted);">Нет сданных тестов</i>';
          if (pracHtml) tdPracticals.innerHTML = pracHtml; else tdPracticals.innerHTML = '<i style="color:var(--muted);">Нет заявок</i>';
          
          tr.appendChild(tdWorks);
          tr.appendChild(tdPracticals);
          tbody.appendChild(tr);
      });
      
      table.appendChild(tbody);
      tableContainer.appendChild(table);
      tableWrap.appendChild(tableContainer);
      
      /* ------- Делегирование кнопок в таблице ------- */
      if (isTeacher) {
          tableWrap.querySelectorAll('button[data-action]').forEach(function(btn) {
              btn.addEventListener("click", function() {
                  var action = btn.getAttribute("data-action");
                  if (action === "grant") {
                      window.grantXP(btn.getAttribute("data-key"), btn.getAttribute("data-name"));
                  } else if (action === "delete") {
                      window.deleteStudent(btn.getAttribute("data-name"), btn.getAttribute("data-group"));
                  }
              });
          });
      }
    })
    .catch(function(err) {
        console.error("Journal load error:", err);
        tableWrap.innerHTML = "Ошибка загрузки журнала.";
    });
};

/* ---------------- УДАЛЕНИЕ СТУДЕНТА ---------------- */

window.deleteStudent = function(name, group) {
    if (!confirm("Вы уверены, что хотите удалить студента " + name + " (" + group + ")?\nЕго данные будут стерты навсегда!")) return;
    
    var p = new URLSearchParams();
    p.append("action", "deleteStudent");
    p.append("name", name);
    p.append("group", group);
    
    window.showToast("Удаление...", "info");
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p })
      .then(function(r){ return r.json(); })
      .then(function(d) {
        if (d && d.ok) {
            window.showToast("Студент удален!", "ok");
            window.renderJournalPage();
        } else {
            window.showToast("Ошибка удаления: " + ((d && d.error) || "Неизвестно"), "err");
        }
      }).catch(function(){ window.showToast("Ошибка сети.", "err"); });
};