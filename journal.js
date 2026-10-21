/* ============================================================
   МДК — journal.js (v302.0 — Безопасное создание DOM)
   ============================================================ */
"use strict";

function getAcademicYearDates() {
    var dates = [];
    var start = new Date(2026, 8, 1); // 1 сентября 2026
    var end = new Date(2027, 7, 1);   // 1 августа 2027
    var current = new Date(start);
    
    while (current <= end) {
        var d = String(current.getDate()).padStart(2, '0');
        var m = String(current.getMonth() + 1).padStart(2, '0');
        var y = String(current.getFullYear()).slice(-2);
        dates.push(d + '.' + m + '.' + y);
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

var ACADEMIC_DATES = getAcademicYearDates();

window.renderJournalPage = function() {
  var app = document.getElementById("app"); 
  if (!app) return; 
  app.innerHTML = ""; 
  document.getElementById("crumbs").textContent = "Журнал";
  
  app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));

  var isTeacher = window.state.staff && (window.state.staff.role === "teacher" || window.state.staff.role === "admin");
  if (!isTeacher) {
      app.innerHTML += '<div class="module" style="text-align:center; color:var(--err); font-size:18px; padding:40px;">⛔ Доступ к журналу имеет только преподаватель.</div>';
      return;
  }

  // Панель управления
  var topPanel = el(`<div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap; align-items:center;">
      <h2 style="margin:0; font-size:20px;">Журнал успеваемости (2026-2027)</h2>
      <div style="margin-left:auto; display:flex; gap:10px;">
          <select id="journalGroupFilter" class="self-input" style="width:auto; margin:0; padding:10px; font-weight:bold; background:var(--card-soft); color:var(--accent); border:1px solid var(--accent);">
              <option value="all">Все группы</option>
              <option value="ТМ 4-3">ТМ 4-3</option>
              <option value="ТМ 3-4">ТМ 3-4</option>
          </select>
          <button class="btn" id="btnRefreshJournal" style="padding:10px 20px;">🔄 Обновить</button>
      </div>
  </div>`);
  app.appendChild(topPanel);

  var contentWrap = el('<div id="journalContent"></div>');
  app.appendChild(contentWrap);

  function renderTable() {
      var filterGroup = document.getElementById("journalGroupFilter").value;
      contentWrap.innerHTML = '<div class="skeleton" style="height:200px;"></div>';
      
      window.API.getStudents().then(d => {
          contentWrap.innerHTML = "";
          if (!d || !d.ok || !d.students || !d.students.length) {
              contentWrap.innerHTML = "<div class='module'>Студентов пока нет (или база данных пуста).</div>"; return;
          }

          var students = d.students;
          if (filterGroup !== "all") {
              students = students.filter(s => s.group === filterGroup);
          }

          if (students.length === 0) {
              contentWrap.innerHTML = "<div class='module'>В выбранной группе пока нет студентов.</div>"; return;
          }

          // Безопасное создание таблицы
          var tableWrap = document.createElement("div");
          tableWrap.className = "module";
          tableWrap.style = "overflow-x:auto; padding: 10px; max-width: 100%;";

          var table = document.createElement("table");
          table.className = "journal-table";
          table.style = "border-collapse:collapse; text-align:center; font-size:13px; min-width:max-content;";

          var thead = document.createElement("thead");
          var trHead = document.createElement("tr");
          
          var thName = document.createElement("th");
          thName.style = "border:1px solid var(--border); padding:8px; position:sticky; left:0; background:var(--card); z-index:2; text-align:left; min-width:180px; box-shadow: 2px 0 5px rgba(0,0,0,0.1);";
          thName.textContent = "ФИО студента / Группа";
          trHead.appendChild(thName);

          ACADEMIC_DATES.forEach(date => {
              var thDate = document.createElement("th");
              thDate.style = "border:1px solid var(--border); padding:4px; min-width:35px; font-size:11px; font-weight:normal; writing-mode:vertical-rl; transform:rotate(180deg); height:80px;";
              thDate.textContent = date;
              trHead.appendChild(thDate);
          });

          thead.appendChild(trHead);
          table.appendChild(thead);

          var tbody = document.createElement("tbody");

          students.forEach((s) => {
              var sKey = s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase();
              var tr = document.createElement("tr");

              // Колонка с ФИО
              var tdName = document.createElement("td");
              tdName.style = "border:1px solid var(--border); padding:8px; text-align:left; font-weight:bold; position:sticky; left:0; background:var(--card); z-index:1; box-shadow: 2px 0 5px rgba(0,0,0,0.1);";
              tdName.innerHTML = window.escapeHtml(s.name) + "<br><span style='font-size:11px;color:var(--accent);font-weight:normal;'>гр. " + window.escapeHtml(s.group) + "</span>";
              tr.appendChild(tdName);

              var p = {};
              try { p = JSON.parse(s.payload || "{}"); } catch(e) {}
              var manualGrades = p.manualGrades || {};

              // Колонки с оценками
              ACADEMIC_DATES.forEach(date => {
                  var tdGrade = document.createElement("td");
                  tdGrade.style = "border:1px solid var(--border); padding:2px;";
                  
                  var input = document.createElement("input");
                  input.type = "text";
                  input.maxLength = 3;
                  input.value = manualGrades[date] || "";
                  input.placeholder = "-";
                  input.style = "width:32px; height:32px; text-align:center; font-weight:bold; border:1px solid transparent; background:transparent; color:var(--text); border-radius:4px; font-size:14px;";

                  input.onchange = function() {
                      var val = this.value.trim();
                      var newPayload = { ...p };
                      if (!newPayload.manualGrades) newPayload.manualGrades = {};
                      
                      if (val) newPayload.manualGrades[date] = val;
                      else delete newPayload.manualGrades[date];

                      this.style.background = "var(--accent-soft)";
                      window.API.saveStudent(sKey, s.name, s.group, JSON.stringify(newPayload)).then(res => {
                          if(res.ok) {
                              setTimeout(() => input.style.background = "transparent", 500);
                              p = newPayload;
                              window.showToast("Сохранено", "ok");
                          } else {
                              window.showToast("Ошибка сохранения", "err");
                          }
                      }).catch(()=> window.showToast("Ошибка сети", "err"));
                  };
                  
                  input.onfocus = function() { this.style.borderColor = "var(--accent)"; this.style.background = "var(--card-soft)"; };
                  input.onblur = function() { this.style.borderColor = "transparent"; this.style.background = "transparent"; };

                  tdGrade.appendChild(input);
                  tr.appendChild(tdGrade);
              });

              tbody.appendChild(tr);
          });

          table.appendChild(tbody);
          tableWrap.appendChild(table);
          contentWrap.appendChild(tableWrap);

      }).catch((err) => { 
          var errorMsg = err && err.message ? err.message : "Неизвестная ошибка сети";
          contentWrap.innerHTML = `<div class="module" style="color:var(--err); padding:20px;">
              <b>Ошибка загрузки данных:</b><br>
              ${errorMsg}<br><br>
              <i>Проверьте консоль (F12) и настройки Google Apps Script.</i>
          </div>`; 
      });
  }

  document.getElementById("journalGroupFilter").onchange = renderTable;
  document.getElementById("btnRefreshJournal").onclick = renderTable;
  
  renderTable();
};