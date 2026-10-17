/* ============================================================
   МДК 07.01 — journal.js (v17.0 — CSV Export)
   ============================================================ */
"use strict";

const DEFAULT_STUDENTS = ["Абрамов Олег", "Баладзе Давид", "Галкин Арсений", "Гладский Константин", "Дадашев Павел", "Дубынин Дмитрий", "Дятлов Даниил", "Евлан Даниил", "Измайлов Рашит", "Калкатинге Генадие", "Калугин Иван", "Карташов Павел", "Костылев Александр", "Кулиш Денис", "Луканов Артём", "Мелешко Антон", "Миронов Артём", "Надина Алиса", "Новиков Арсений", "Орлов Сергей", "Пятышев Артём", "Смирнов Олег", "Соломатин Артём", "Харитонов Максим", "Целилов Антон", "Шлыков Леонид", "Якунин Игорь"];
const DEFAULT_DATES = ["05.11", "11.11", "12.11", "18.11", "19.11", "25.11", "26.11", "02.12", "03.12", "09.12", "10.12", "16.12", "17.12"];

function jEl(html) { var t = document.createElement("template"); t.innerHTML = String(html).trim(); return t.content.firstChild; }
function jEsc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

window.renderJournalPage = function() {
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = ""; document.getElementById("crumbs").textContent = "Журнал";
  var isAdmin = state.staff && state.staff.role === "admin", isTeacher = state.staff && state.staff.role === "teacher", isCurator = state.staff && state.staff.role === "curator";
  var canEdit = isAdmin || isTeacher;
  var targetGroup = "ТМ-3"; if (isCurator) targetGroup = state.staff.group || "ТМ-3"; if (canEdit) targetGroup = localStorage.getItem("mdk0701.journal.group") || "ТМ-3";

  app.appendChild(jEl('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  app.appendChild(jEl('<section class="hero"><h1>Журнал группы ' + jEsc(targetGroup) + '</h1></section>'));

  var contentBox = jEl('<div id="journalContent"></div>'); app.appendChild(contentBox);

  function drawTable() {
    contentBox.innerHTML = "";
    var topPanel = jEl('<div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;"></div>');
    contentBox.appendChild(topPanel);

    // Кнопка экспорта CSV
    var csvBtn = jEl('<button class="btn" style="background:var(--ok)">📥 Скачать CSV</button>');
    csvBtn.addEventListener("click", () => {
      let csv = "Студент;" + DEFAULT_DATES.join(";") + "\n";
      DEFAULT_STUDENTS.forEach(s => {
        let row = [s];
        DEFAULT_DATES.forEach(d => {
          let input = document.querySelector(`input[data-student="${s}"][data-date="${d}"]`);
          row.push(input ? input.value : "");
        });
        csv += row.join(";") + "\n";
      });
      var blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
      var link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Журнал_" + targetGroup + ".csv";
      link.click();
    });
    topPanel.appendChild(csvBtn);

    var tableWrap = jEl('<div class="journal-container"></div>'); contentBox.appendChild(tableWrap);
    
    var table = jEl('<table class="journal-table"></table>');
    var thead = jEl('<thead><tr><th>Студент</th></tr></thead>');
    DEFAULT_DATES.forEach(d => thead.firstChild.appendChild(jEl('<th>' + d + '</th>')));
    table.appendChild(thead);

    var tbody = jEl('<tbody></tbody>');
    DEFAULT_STUDENTS.forEach(studentName => {
      var tr = jEl('<tr></tr>');
      tr.appendChild(jEl('<td style="text-align:left;font-weight:bold;">' + jEsc(studentName) + '</td>'));
      DEFAULT_DATES.forEach(date => {
        var td = jEl('<td></td>');
        if (canEdit) { 
          var input = jEl('<input type="text" class="grade-input" maxlength="2" data-student="'+studentName+'" data-date="'+date+'">'); 
          td.appendChild(input); 
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody); tableWrap.appendChild(table);
  }
  drawTable();
};