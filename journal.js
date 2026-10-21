/* ============================================================
   МДК — journal.js (v305.0 — Экспорт в Excel)
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
var CURRENT_STUDENTS_CACHE = []; // Для экспорта

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

  // Панель быстрого ввода
  var quickForm = el(`<div class="module no-print" style="padding:15px; margin-bottom:20px; background:var(--card-soft); border:1px solid var(--accent); border-radius:12px;">
      <h3 style="margin-top:0; color:var(--accent); font-size:18px;">⚡ Быстрый ввод оценки</h3>
      <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
          <select id="qgStudent" class="self-input" style="margin:0; max-width:300px; flex:1;"></select>
          <input type="text" id="qgDate" class="self-input" style="margin:0; width:120px;" placeholder="ДД.ММ.ГГ">
          <input type="text" id="qgGrade" class="self-input" style="margin:0; width:80px;" placeholder="Оценка (5)">
          <button class="btn" id="btnQuickAdd" style="padding:12px 20px;">Добавить</button>
      </div>
  </div>`);
  app.appendChild(quickForm);

  // Фильтр и обновление
  var topPanel = el(`<div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap; align-items:center;">
      <div style="margin-left:auto; display:flex; gap:10px;">
          <button class="btn no-print" id="btnExportExcel" style="padding:10px 20px; background:var(--ok); color:#000;">📊 Экспорт в Excel</button>
          <select id="journalGroupFilter" class="self-input no-print" style="width:auto; margin:0; padding:10px; font-weight:bold; background:var(--card-soft); color:var(--accent); border:1px solid var(--accent);">
              <option value="all">Все группы</option>
              <option value="ТМ 4-3">ТМ 4-3</option>
              <option value="ТМ 3-4">ТМ 3-4</option>
          </select>
          <button class="btn no-print" id="btnRefreshJournal" style="padding:10px 20px;">🔄 Обновить</button>
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
              contentWrap.innerHTML = "<div class='module'>Студентов пока нет.</div>"; return;
          }

          var students = d.students;
          if (filterGroup !== "all") {
              students = students.filter(s => s.group === filterGroup);
          }
          CURRENT_STUDENTS_CACHE = students;

          // Заполняем выпадающий список
          var qgSelect = document.getElementById("qgStudent");
          if (qgSelect) {
              qgSelect.innerHTML = '<option value="">-- Выберите студента --</option>';
              students.forEach(s => {
                  var key = s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase();
                  qgSelect.innerHTML += `<option value="${key}">${s.name} (${s.group})</option>`;
              });
          }

          if (students.length === 0) {
              contentWrap.innerHTML = "<div class='module'>В выбранной группе пока нет студентов.</div>"; return;
          }

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

          var thAvg = document.createElement("th");
          thAvg.style = "border:1px solid var(--border); padding:8px; background:var(--card); color:var(--gold); font-weight:bold; position:sticky; left:180px; z-index:2; box-shadow: 2px 0 5px rgba(0,0,0,0.1);";
          thAvg.textContent = "Ср. балл";
          trHead.appendChild(thAvg);

          var thCert = document.createElement("th");
          thCert.style = "border:1px solid var(--border); padding:8px; background:var(--card);";
          thCert.textContent = "Сертификат";
          trHead.appendChild(thCert);

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
              var p = {}; try { p = JSON.parse(s.payload || "{}"); } catch(e) {}
              var manualGrades = p.manualGrades || {};

              // ФИО
              var tdName = document.createElement("td");
              tdName.style = "border:1px solid var(--border); padding:8px; text-align:left; font-weight:bold; position:sticky; left:0; background:var(--card); z-index:1; box-shadow: 2px 0 5px rgba(0,0,0,0.1);";
              tdName.innerHTML = window.escapeHtml(s.name) + "<br><span style='font-size:11px;color:var(--accent);font-weight:normal;'>гр. " + window.escapeHtml(s.group) + "</span>";
              tr.appendChild(tdName);

              // Средний балл
              var sum = 0; var count = 0;
              for (var date in manualGrades) {
                  var gradeVal = parseFloat(manualGrades[date]);
                  if (!isNaN(gradeVal)) { sum += gradeVal; count++; }
              }
              var avg = count > 0 ? (sum / count).toFixed(2) : "—";
              var tdAvg = document.createElement("td");
              tdAvg.style = "border:1px solid var(--border); padding:8px; font-weight:bold; color:" + (avg !== "—" && avg >= 4 ? "var(--ok)" : (avg !== "—" && avg < 3 ? "var(--err)" : "var(--text)")) + "; background:var(--card); position:sticky; left:180px; z-index:1; box-shadow: 2px 0 5px rgba(0,0,0,0.1);";
              tdAvg.textContent = avg;
              tr.appendChild(tdAvg);

              // Сертификат
              var tdCert = document.createElement("td");
              tdCert.style = "border:1px solid var(--border); padding:8px; text-align:center;";
              var certStatus = p.certificateApproved ? "✅ Подтвержден" : (p.certificateRequested ? "⏳ Запрошен" : "—");
              var btnCert = p.certificateRequested && !p.certificateApproved ? `<button class="btn no-print" style="padding:4px 8px; font-size:12px; margin-top:5px;" onclick="window.approveCert('${sKey}')">Подтвердить</button>` : "";
              tdCert.innerHTML = `<span style="font-size:12px; font-weight:bold; color:var(--accent);">${certStatus}</span><br>${btnCert}`;
              tr.appendChild(tdCert);

              // Оценки
              ACADEMIC_DATES.forEach(date => {
                  var tdGrade = document.createElement("td");
                  tdGrade.style = "border:1px solid var(--border); padding:2px;";
                  var input = document.createElement("input");
                  input.type = "text"; input.maxLength = 3;
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
                              renderTable(); 
                          }
                      });
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
          contentWrap.innerHTML = `<div class="module" style="color:var(--err);">Ошибка: ${err.message}</div>`; 
      });
  }

  // Обработчик быстрого ввода
  document.getElementById("btnQuickAdd").onclick = function() {
      var sKey = document.getElementById("qgStudent").value;
      var date = document.getElementById("qgDate").value.trim();
      var grade = document.getElementById("qgGrade").value.trim();
      
      if (!sKey || !date || !grade) return window.showToast("Заполните все поля", "err");
      
      var s = CURRENT_STUDENTS_CACHE.find(x => (x.name.trim().toLowerCase() + "|" + x.group.trim().toLowerCase()) === sKey);
      if (!s) return;

      var p = {}; try { p = JSON.parse(s.payload || "{}"); } catch(e) {}
      if (!p.manualGrades) p.manualGrades = {};
      p.manualGrades[date] = grade;

      window.API.saveStudent(sKey, s.name, s.group, JSON.stringify(p)).then(res => {
          if(res.ok) {
              window.showToast("Оценка добавлена!", "ok");
              document.getElementById("qgGrade").value = "";
              renderTable();
          } else {
              window.showToast("Ошибка сохранения", "err");
          }
      });
  };

  // ЭКСПОРТ В EXCEL (CSV)
  document.getElementById("btnExportExcel").onclick = function() {
      if (CURRENT_STUDENTS_CACHE.length === 0) return window.showToast("Нет данных для экспорта", "err");
      
      var csvContent = "\uFEFF"; // BOM для корректного отображения кириллицы в Excel
      
      // Заголовки
      var headers = ["ФИО", "Группа", "Средний балл", "Сертификат"];
      ACADEMIC_DATES.forEach(d => headers.push(d));
      csvContent += headers.join(";") + "\n";
      
      // Данные
      CURRENT_STUDENTS_CACHE.forEach(s => {
          var p = {}; try { p = JSON.parse(s.payload || "{}"); } catch(e) {}
          var manualGrades = p.manualGrades || {};
          
          var sum = 0; var count = 0;
          for (var date in manualGrades) {
              var gradeVal = parseFloat(manualGrades[date]);
              if (!isNaN(gradeVal)) { sum += gradeVal; count++; }
          }
          var avg = count > 0 ? (sum / count).toFixed(2) : "";
          
          var certStatus = p.certificateApproved ? "Да" : (p.certificateRequested ? "Запрошен" : "Нет");
          
          var row = [`"${s.name}"`, `"${s.group}"`, avg, `"${certStatus}"`];
          ACADEMIC_DATES.forEach(d => {
              row.push(manualGrades[d] || "");
          });
          
          csvContent += row.join(";") + "\n";
      });
      
      // Скачивание файла
      var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      var link = document.createElement("a");
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `Журнал_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '_')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  document.getElementById("journalGroupFilter").onchange = renderTable;
  document.getElementById("btnRefreshJournal").onclick = renderTable;
  
  renderTable();
};

// Подтверждение сертификата
window.approveCert = function(sKey) {
    window.API.getStudents().then(d => {
        var s = d.students.find(x => (x.name.trim().toLowerCase() + "|" + x.group.trim().toLowerCase()) === sKey);
        if(!s) return;
        var p = {}; try { p = JSON.parse(s.payload || "{}"); } catch(e) {}
        p.certificateApproved = true;
        window.API.saveStudent(sKey, s.name, s.group, JSON.stringify(p)).then(res => {
            if(res.ok) { window.showToast("Сертификат подтвержден!", "ok"); window.renderJournalPage(); }
        });
    });
};