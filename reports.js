"use strict";

window.renderCourseReportsPage = function() {
  var app = document.getElementById("app"); 
  if (!app) return; app.innerHTML = ""; 
  document.getElementById("crumbs").textContent = "Отчеты по курсам";
  app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));

  if (!window.state.staff) { 
      app.innerHTML += '<div class="module" style="color:var(--err); padding:40px; text-align:center;">⛔ Доступ только для преподавателя.</div>'; 
      return; 
  }

  var tabsHtml = `<div style="display:flex; gap:10px; margin-bottom:20px;">
    <button class="btn tab active" id="tab-students" onclick="window.switchReportTab('students')">👨‍🎓 Студенты (БД)</button>
    <button class="btn tab ghost" id="tab-written" onclick="window.switchReportTab('written')">✍️ Письменные задания</button>
  </div>
  <div id="reportsContent"></div>`;
  app.innerHTML += tabsHtml;

  window.switchReportTab = function(tabName) {
    document.querySelectorAll(".tab").forEach(btn => { btn.classList.remove("active"); btn.classList.add("ghost"); });
    document.getElementById(`tab-${tabName}`).classList.add("active");
    document.getElementById(`tab-${tabName}`).classList.remove("ghost");
    if (tabName === 'students') renderStudentsTable();
    else renderWrittenTable();
  };

  function renderStudentsTable() {
      var contentWrap = document.getElementById("reportsContent");
      contentWrap.innerHTML = '<div class="skeleton" style="height:200px;"></div>';
      
      window.API.getStudents().then(d => {
          contentWrap.innerHTML = "";
          if (!d || !d.ok || !d.students || !d.students.length) { contentWrap.innerHTML = "<div class='module'>Нет студентов.</div>"; return; }
          
          var table = document.createElement("table"); 
          table.className = "journal-table"; 
          table.style = "width:100%; border-collapse:collapse; text-align:left; font-size:14px;";
          table.innerHTML = `<thead><tr style="background:var(--card-soft);">
              <th style="padding:10px; border:1px solid var(--border);">Студент</th>
              <th style="padding:10px; border:1px solid var(--border); text-align:center;">XP</th>
              <th style="padding:10px; border:1px solid var(--border); text-align:center;">Сдано (Авто)</th>
              <th style="padding:10px; border:1px solid var(--border); text-align:center;">Действия</th>
          </tr></thead>`;

          var tbody = document.createElement("tbody");
          d.students.forEach((s) => {
              var p = {}; try { p = JSON.parse(s.payload || "{}"); } catch(e) {}
              var xp = p.xp || 0; 
              var results = p.results || {};
              var sKey = s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase();
              var passedWorks = Object.keys(results).length;

              var tr = document.createElement("tr"); tr.style = "border-bottom:1px solid var(--border);";
              tr.innerHTML += `<td style="padding:10px; border:1px solid var(--border);"><b>${window.escapeHtml(s.name)}</b><br><span style="font-size:12px; color:var(--muted);">гр. ${window.escapeHtml(s.group)}</span></td>`;
              tr.innerHTML += `<td style="padding:10px; border:1px solid var(--border); text-align:center;"><span style="color:var(--gold); font-weight:bold;">${xp}</span></td>`;
              tr.innerHTML += `<td style="padding:10px; border:1px solid var(--border); text-align:center;"><span style="color:var(--ok); font-weight:bold;">${passedWorks}</span></td>`;
              tr.innerHTML += `<td style="padding:10px; border:1px solid var(--border); text-align:center;">
                  <button class="btn" style="padding:4px 8px; font-size:12px; background:var(--gold); color:#000;" onclick="window.grantXP('${sKey}', false)">+ XP</button>
                  <button class="btn ghost" style="padding:4px 8px; font-size:12px; border-color:var(--err); color:var(--err);" onclick="window.grantXP('${sKey}', true)">- XP</button>
              </td>`;
              tbody.appendChild(tr);
          });
          table.appendChild(tbody); 
          var wrap = document.createElement("div"); wrap.className = "module"; wrap.style = "overflow-x:auto;"; wrap.appendChild(table); contentWrap.appendChild(wrap);
      });
  }

  function renderWrittenTable() {
      var contentWrap = document.getElementById("reportsContent");
      contentWrap.innerHTML = '<div class="skeleton" style="height:200px;"></div>';
      
      window.API.getStudents().then(d => {
          contentWrap.innerHTML = "";
          if (!d || !d.ok || !d.students) { contentWrap.innerHTML = "<div class='module'>Ошибка загрузки данных.</div>"; return; }
          
          var allSubs = [];
          d.students.forEach(s => {
              var p = {}; try { p = JSON.parse(s.payload || "{}"); } catch(e){}
              if (p.examSubmissions && p.examSubmissions.length > 0) {
                  p.examSubmissions.forEach((sub, idx) => {
                      allSubs.push({
                          ...sub,
                          studentName: s.name,
                          studentGroup: s.group,
                          sKey: s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase(),
                          subIndex: idx
                      });
                  });
              }
          });

          if (allSubs.length === 0) { contentWrap.innerHTML = "<div class='module'>Письменных работ пока нет.</div>"; return; }
          
          var table = document.createElement("table"); table.className = "journal-table"; table.style = "width:100%; border-collapse:collapse; font-size:14px;";
          table.innerHTML = `<thead><tr style="background:var(--card-soft);">
              <th>Студент</th>
              <th>МДК</th>
              <th>Задание 1</th>
              <th>Задание 2</th>
              <th>Тест</th>
              <th>Оценка препода (0-10)</th>
              <th>Итог</th>
          </tr></thead>`;
          var tbody = document.createElement("tbody");
          
          allSubs.forEach((sub) => {
              var tr = document.createElement("tr"); tr.style = "border-bottom:1px solid var(--border);";
              tr.innerHTML += `<td style="padding:10px; border:1px solid var(--border);"><b>${window.escapeHtml(sub.studentName)}</b><br><span style="font-size:12px; color:var(--muted);">${window.escapeHtml(sub.studentGroup)}</span></td>`;
              tr.innerHTML += `<td style="padding:10px; border:1px solid var(--border);">${sub.courseId || '—'}</td>`;
              tr.innerHTML += `<td style="padding:10px; border:1px solid var(--border); font-size:12px; max-width:200px;">${window.escapeHtml(sub.written1 || 'Пусто')}</td>`;
              tr.innerHTML += `<td style="padding:10px; border:1px solid var(--border); font-size:12px; max-width:200px;">${window.escapeHtml(sub.written2 || 'Пусто')}</td>`;
              tr.innerHTML += `<td style="padding:10px; border:1px solid var(--border); text-align:center;">${sub.testScore}/${sub.maxTest}</td>`;
              tr.innerHTML += `<td style="padding:10px; border:1px solid var(--border); text-align:center;">
                  <input type="number" min="0" max="10" value="${sub.teacherGrade !== null && sub.teacherGrade !== undefined ? sub.teacherGrade : ''}" placeholder="0-10" style="width:60px; padding:5px; border-radius:4px; border:1px solid var(--border); background:var(--bg); color:var(--text);" onchange="window.gradeWritten('${sub.sKey}', ${sub.subIndex}, this.value)">
              </td>`;
              tr.innerHTML += `<td style="padding:10px; border:1px solid var(--border); text-align:center; font-weight:bold; color:var(--gold);">${sub.finalGrade || '—'}</td>`;
              tbody.appendChild(tr);
          });
          table.appendChild(tbody);
          var wrap = document.createElement("div"); wrap.className = "module"; wrap.style = "overflow-x:auto;"; wrap.appendChild(table); contentWrap.appendChild(wrap);
      });
  }

  window.gradeWritten = function(sKey, subIdx, val) {
      var amount = parseInt(val);
      if (isNaN(amount)) amount = 0;
      
      window.API.getStudentData(sKey).then(res => {
          if (!res || !res.ok) return window.showToast("Ошибка данных студента", "err");
          var p = {}; try { p = JSON.parse(res.payload || "{}"); } catch(e){}
          if (!p.examSubmissions || !p.examSubmissions[subIdx]) return;
          
          var sub = p.examSubmissions[subIdx];
          sub.teacherGrade = amount;
          
          // Пересчет итоговой оценки
          var testGrade = sub.testScore >= 27 ? 5 : sub.testScore >= 22 ? 4 : sub.testScore >= 18 ? 3 : 2; 
          var writtenGrade = amount >= 8 ? 5 : amount >= 6 ? 4 : amount >= 4 ? 3 : 2;
          var finalGrade = Math.round((testGrade + writtenGrade) / 2);
          
          if (!p.results) p.results = {};
          p.results["__final__" + sub.courseId] = { grade: finalGrade, total: sub.testScore, max: sub.maxTest };
          sub.finalGrade = finalGrade;
          
          window.API.saveStudent(sKey, sKey.split("|")[0], sKey.split("|")[1], JSON.stringify(p)).then(() => {
              window.showToast("Оценка сохранена! Итог: " + finalGrade, "ok");
              renderWrittenTable();
          });
      });
  };

  window.grantXP = function(sKey, isSubtract) {
      var amount = parseInt(prompt("Сколько XP?", "50"));
      if (isNaN(amount)) return;
      if (isSubtract) amount = -amount;
      window.API.grantXP(sKey, amount).then(res => { if(res.ok) { window.showToast("XP изменен", "ok"); renderStudentsTable(); } });
  };

  renderStudentsTable();
};