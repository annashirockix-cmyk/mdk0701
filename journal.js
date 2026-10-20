/* ============================================================
   МДК — journal.js (v205.0 — Полный журнал с управлением)
   ============================================================ */
"use strict";

const JOURNAL_DATES = [
    "05.11", "11.11", "12.11", "18.11", "19.11", "25.11", "26.11", 
    "02.12", "03.12", "09.12", "10.12", "16.12", "17.12"
];

window.renderJournalPage = function() {
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = ""; 
  document.getElementById("crumbs").textContent = "Журнал";
  
  app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
  
  var isTeacher = state.staff && (state.staff.role === "teacher" || state.staff.role === "admin");
  
  if (isTeacher) {
      app.appendChild(el('<div style="display:flex; gap:10px; margin-bottom:20px;">' +
          '<button class="btn" id="tabGradesBtn" style="flex:1;">📒 Журнал оценок</button>' +
          '<button class="btn ghost" id="tabReportBtn" style="flex:1;">📊 Отчет по курсу</button>' +
      '</div>'));
      
      var contentWrap = el('<div id="journalContent"></div>');
      app.appendChild(contentWrap);

      document.getElementById("tabGradesBtn").onclick = function() {
          this.className = "btn"; this.nextElementSibling.className = "btn ghost";
          renderGradesTable(contentWrap);
      };
      document.getElementById("tabReportBtn").onclick = function() {
          this.className = "btn"; this.previousElementSibling.className = "btn ghost";
          renderReportTable(contentWrap, false);
      };
      
      renderGradesTable(contentWrap);
      
  } else {
      var contentWrap = el('<div id="journalContent"></div>');
      app.appendChild(contentWrap);
      renderReportTable(contentWrap, true); // true = режим студента
  }
};

// --- РЕЖИМ 1: БУМАЖНЫЙ ЖУРНАЛ (Только для учителя) ---
function renderGradesTable(container) {
    container.innerHTML = '<div class="skeleton" style="height:200px;"></div>';
    
    window.API.getStudents().then(d => {
        container.innerHTML = "";
        if (!d || !d.ok || !d.students || !d.students.length) {
            container.innerHTML = "<div class='module'>Студентов пока нет.</div>"; return;
        }

        var tableWrap = el(`<div class="module" style="overflow-x:auto; padding: 10px;">
            <table class="journal-table" style="width:100%; border-collapse:collapse; text-align:center; font-size:14px;">
                <thead>
                    <tr>
                        <th rowspan="2" style="border:1px solid var(--border); padding:8px; width:40px;">№</th>
                        <th rowspan="2" style="border:1px solid var(--border); padding:8px; text-align:left; min-width:150px;">ФИО</th>
                        <th colspan="7" style="border:1px solid var(--border); padding:8px;">Ноябрь</th>
                        <th colspan="6" style="border:1px solid var(--border); padding:8px;">Декабрь</th>
                    </tr>
                    <tr>
                        ${JOURNAL_DATES.map(date => `<th style="border:1px solid var(--border); padding:4px; font-size:12px; font-weight:normal;">${date}</th>`).join('')}
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>`);

        var tbody = tableWrap.querySelector("tbody");
        
        d.students.forEach((s, index) => {
            var sKey = s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase();
            var tr = el(`<tr></tr>`);
            
            tr.appendChild(el(`<td style="border:1px solid var(--border); padding:8px; font-weight:bold;">${index + 1}</td>`));
            tr.appendChild(el(`<td style="border:1px solid var(--border); padding:8px; text-align:left; font-weight:bold;">${s.name}<br><span style="font-size:11px;color:var(--muted);font-weight:normal;">гр. ${s.group}</span></td>`));

            var p = {};
            try { p = JSON.parse(s.payload || "{}"); } catch(e) {}
            var manualGrades = p.manualGrades || {};

            JOURNAL_DATES.forEach(date => {
                var grade = manualGrades[date] || "";
                var input = el(`<input type="text" value="${grade}" maxlength="3" style="width:35px; height:35px; text-align:center; font-weight:bold; border:1px solid transparent; background:transparent; color:var(--text); border-radius:4px; font-size:16px;" placeholder="-">`);
                
                input.onchange = function() {
                    var val = this.value.trim();
                    var newPayload = { ...p };
                    if (!newPayload.manualGrades) newPayload.manualGrades = {};
                    
                    if (val) newPayload.manualGrades[date] = val;
                    else delete newPayload.manualGrades[date];

                    this.style.background = "var(--card-soft)";
                    window.API.saveStudent(sKey, s.name, s.group, JSON.stringify(newPayload)).then(res => {
                        if(res.ok) {
                            setTimeout(() => input.style.background = "transparent", 500);
                            p = newPayload;
                        } else {
                            window.showToast("Ошибка сохранения", "err");
                        }
                    });
                };
                
                input.onfocus = function() { this.style.borderColor = "var(--accent)"; this.style.background = "var(--card-soft)"; };
                input.onblur = function() { this.style.borderColor = "transparent"; this.style.background = "transparent"; };

                tr.appendChild(el(`<td style="border:1px solid var(--border); padding:2px;"></td>`)).appendChild(input);
            });
            
            tbody.appendChild(tr);
        });

        container.appendChild(tableWrap);
    }).catch(() => { container.innerHTML = "Ошибка загрузки."; });
}

// --- РЕЖИМ 2: ОТЧЕТ ПО КУРСУ ---
function renderReportTable(container, isStudent) {
    container.innerHTML = '<div class="skeleton" style="height:200px;"></div>';
    
    window.API.getStudents().then(d => {
        container.innerHTML = "";
        if (!d || !d.ok || !d.students || !d.students.length) {
            container.innerHTML = "<div class='module'>Студентов пока нет.</div>"; return;
        }

        var displayStudents = d.students;
        if (isStudent && state.student) {
            displayStudents = d.students.filter(s => 
                s.name.trim().toLowerCase() === state.student.name.trim().toLowerCase() && 
                s.group.trim().toUpperCase() === state.student.group.trim().toUpperCase()
            );
        }
        if (!displayStudents.length) { container.innerHTML = "<div class='module'>Ваших данных пока нет.</div>"; return; }

        var tableWrap = el(`<div class="module" style="overflow-x:auto;">
            <table class="journal-table" style="width:100%; border-collapse:collapse; text-align:left; font-size:14px;">
                <thead>
                    <tr>
                        <th style="border-bottom:2px solid var(--border); padding:12px;">Студент</th>
                        <th style="border-bottom:2px solid var(--border); padding:12px; text-align:center;">Ср. балл</th>
                        <th style="border-bottom:2px solid var(--border); padding:12px;">Сданные темы и работы</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>`);

        var tbody = tableWrap.querySelector("tbody");

        displayStudents.forEach(s => {
            var tr = el(`<tr style="border-bottom:1px solid var(--border);"></tr>`);
            var p = {};
            try { p = JSON.parse(s.payload || "{}"); } catch(e) {}
            
            // Ячейка ФИО
            var nameCell = el(`<td style="padding:12px; vertical-align:top;">
                <div style="font-weight:bold; font-size:16px;">${s.name}</div>
                <div style="font-size:12px;color:var(--muted); margin-bottom:8px;">гр. ${s.group} · ${p.xp || 0} XP</div>
            </td>`);

            // Кнопки для учителя
            if (!isStudent) {
                var sKey = s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase();
                var actionsHtml = `<div style="display:flex; gap:5px; flex-wrap:wrap;">
                    <button class="btn" style="padding:4px 8px; font-size:12px; background:var(--gold); color:#000;" onclick="window.grantXP('${sKey}', '${s.name}')">+ XP</button>
                    <button class="btn ghost" style="padding:4px 8px; font-size:12px; border-color:var(--err); color:var(--err);" onclick="window.deductXP('${sKey}', '${s.name}')">- XP</button>
                    <button class="btn ghost" style="padding:4px 8px; font-size:12px; border-color:#d97706; color:#d97706;" onclick="window.levelDown('${sKey}', '${s.name}', ${p.xp || 0})">📉 Ур.</button>
                    <button class="btn ghost" style="padding:4px 8px; font-size:12px; border-color:var(--err); color:var(--err);" onclick="window.deleteStudent('${sKey}', '${s.name}')">🗑 Удалить</button>
                </div>`;
                nameCell.innerHTML += actionsHtml;
            }
            tr.appendChild(nameCell);

            // Средний балл
            var sum = 0, count = 0;
            var worksHtml = "";
            
            if (p.results) {
                Object.keys(p.results).forEach(k => {
                    var tName = k === "__final_exam__" ? "Итоговый экзамен" : k;
                    worksHtml += `<div style="margin-bottom:6px; font-size:13px;"><b>${tName}</b> <span style="color:var(--accent)">(Тест)</span></div>`;
                    sum += (p.results[k].grade || 0); count++;
                });
            }
            if (p.selfResults) {
                Object.keys(p.selfResults).forEach(k => {
                    worksHtml += `<div style="margin-bottom:6px; font-size:13px;"><b>${k}</b> <span style="color:var(--accent)">(Сам. работа)</span></div>`;
                    sum += (p.selfResults[k].grade || 0); count++;
                });
            }

            var avg = count > 0 ? (sum / count).toFixed(2) : "—";
            
            tr.appendChild(el(`<td style="padding:12px; text-align:center; font-size:18px; font-weight:bold; color:var(--accent);">${avg}</td>`));
            tr.appendChild(el(`<td style="padding:12px; vertical-align:top;">${worksHtml || '<i style="color:var(--muted);">Нет сданных работ</i>'}</td>`));
            
            tbody.appendChild(tr);
        });

        container.appendChild(tableWrap);
    }).catch(() => { container.innerHTML = "Ошибка загрузки."; });
}