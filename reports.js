"use strict";

window.renderCourseReportsPage = function() {
  var app = document.getElementById("app"); 
  if (!app) return; 
  app.innerHTML = ""; 
  document.getElementById("crumbs").textContent = "Отчеты по курсам";
  app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));

  if (!window.state.staff) { app.innerHTML += '<div class="module" style="color:var(--err); padding:40px; text-align:center;">⛔ Доступ только для преподавателя.</div>'; return; }

  var topPanel = el(`<div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap; align-items:center;">
      <h2 style="margin:0; font-size:20px;">📊 Отчеты и управление</h2>
      <div style="margin-left:auto; display:flex; gap:10px;">
          <select id="reportGroupFilter" class="self-input" style="width:auto; margin:0; padding:10px; font-weight:bold; background:var(--card-soft); color:var(--accent); border:1px solid var(--accent);">
              <option value="all">Все группы</option><option value="ТМ 4-3">ТМ 4-3</option><option value="ТМ 3-4">ТМ 3-4</option>
          </select>
          <button class="btn" id="btnRefreshReports" style="padding:10px 20px;">🔄 Обновить</button>
      </div>
  </div>`);
  app.appendChild(topPanel);
  var contentWrap = el('<div id="reportsContent"></div>'); app.appendChild(contentWrap);

  function getTopicName(id) {
      if (id === "__final__") return "Итоговый экзамен";
      var c = window.COURSE; if (!c) return id;
      var cleanId = id.replace("_selfwork", "");
      for (var i = 0; i < c.sections.length; i++) {
          for (var j = 0; j < c.sections[i].topics.length; j++) {
              if (c.sections[i].topics[j].id === cleanId) return c.sections[i].topics[j].title + (id.includes("_selfwork") ? " (Сам. раб)" : " (Тест)");
          }
      }
      return id;
  }

  function renderTable() {
      var filterGroup = document.getElementById("reportGroupFilter").value;
      contentWrap.innerHTML = '<div class="skeleton" style="height:200px;"></div>';
      
      window.API.getStudents().then(d => {
          contentWrap.innerHTML = "";
          if (!d || !d.ok || !d.students || !d.students.length) { contentWrap.innerHTML = "<div class='module'>Нет студентов.</div>"; return; }
          
          var students = filterGroup === "all" ? d.students : d.students.filter(s => s.group === filterGroup);
          if (!students.length) { contentWrap.innerHTML = "<div class='module'>В группе нет студентов.</div>"; return; }

          var table = document.createElement("table"); table.className = "journal-table"; table.style = "width:100%; border-collapse:collapse; text-align:left; font-size:14px;";
          table.innerHTML = `<thead><tr style="background:var(--card-soft);">
              <th style="padding:10px; border:1px solid var(--border);">Студент / Группа</th>
              <th style="padding:10px; border:1px solid var(--border); text-align:center;">XP / Уровень</th>
              <th style="padding:10px; border:1px solid var(--border); text-align:center;">Сданные работы</th>
              <th style="padding:10px; border:1px solid var(--border); text-align:center;">Действия</th>
          </tr></thead>`;

          var tbody = document.createElement("tbody");

          students.forEach((s, idx) => {
              var p = {}; try { p = JSON.parse(s.payload || "{}"); } catch(e) {}
              var xp = p.xp || 0; var lvl = window.getLevel(xp); var results = p.results || {};
              var sKey = s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase();

              var passedWorks = 0; var finalGrade = "—";
              Object.keys(results).forEach(k => { if (k.includes("__final__")) finalGrade = results[k].grade || "—"; else passedWorks++; });

              var tr = document.createElement("tr"); tr.style = "border-bottom:1px solid var(--border);";
              tr.innerHTML += `<td style="padding:10px; border:1px solid var(--border);"><b>${window.escapeHtml(s.name)}</b><br><span style="font-size:12px; color:var(--muted);">гр. ${window.escapeHtml(s.group)}</span></td>`;
              tr.innerHTML += `<td style="padding:10px; border:1px solid var(--border); text-align:center;"><span style="color:var(--gold); font-weight:bold;">${xp} XP</span><br><span style="font-size:12px;">Ур. ${lvl}</span></td>`;
              tr.innerHTML += `<td style="padding:10px; border:1px solid var(--border); text-align:center;">
                  <span style="color:var(--ok); font-weight:bold;">${passedWorks}</span> работ<br>
                  <span style="color:${finalGrade >= 3 ? 'var(--ok)' : 'var(--err)'}; font-weight:bold;">Экзамен: ${finalGrade}</span>
              </td>`;
              
              tr.innerHTML += `<td style="padding:10px; border:1px solid var(--border); text-align:center;">
                  <div style="display:flex; gap:5px; justify-content:center; flex-wrap:wrap;">
                      <button class="btn" style="padding:4px 8px; font-size:12px; background:var(--gold); color:#000;" onclick="window.grantXP('${sKey}')">+ XP</button>
                      <button class="btn ghost" style="padding:4px 8px; font-size:12px; border-color:var(--err); color:var(--err);" onclick="window.deductXP('${sKey}')">- XP</button>
                      <button class="btn ghost" style="padding:4px 8px; font-size:12px; border-color:#d97706; color:#d97706;" onclick="window.levelDown('${sKey}', ${xp})">📉 Ур.</button>
                      <button class="btn ghost" style="padding:4px 8px; font-size:12px; border-color:var(--err); color:var(--err);" onclick="window.deleteStudent('${sKey}', '${s.name}')">🗑 Удалить</button>
                  </div>
              </td>`;
              
              tbody.appendChild(tr);

              var detailTr = document.createElement("tr"); detailTr.style = "display:none; background:var(--card-soft);";
              var detailTd = document.createElement("td"); detailTd.colSpan = 4; detailTd.style = "padding:15px; border:1px solid var(--border);";
              var detailsHtml = "<h4 style='margin-top:0;'>История прохождения:</h4>";
              if (Object.keys(results).length === 0) detailsHtml += "<p style='color:var(--muted);'>Нет сданных работ.</p>";
              else {
                  detailsHtml += "<ul style='margin:0; padding-left:20px; font-size:13px;'>";
                  Object.keys(results).forEach(key => {
                      var grade = results[key].grade || "?"; var topicName = getTopicName(key);
                      detailsHtml += `<li><b>${topicName}</b> — Оценка: <span style="color:${grade >= 3 ? 'var(--ok)' : 'var(--err)'}; font-weight:bold;">${grade}</span></li>`;
                  });
                  detailsHtml += "</ul>";
              }
              detailTd.innerHTML = detailsHtml; detailTr.appendChild(detailTd); tbody.appendChild(detailTr);

              tr.querySelector("button").parentElement.innerHTML += `<button class="btn ghost" style="padding:4px 8px; font-size:12px;" onclick="this.closest('tr').nextElementSibling.style.display = this.closest('tr').nextElementSibling.style.display === 'none' ? 'table-row' : 'none'">👁</button>`;
          });
          table.appendChild(tbody); var wrap = document.createElement("div"); wrap.className = "module"; wrap.style = "overflow-x:auto; padding:10px;"; wrap.appendChild(table); contentWrap.appendChild(wrap);
      }).catch(err => { contentWrap.innerHTML = `<div class="module" style="color:var(--err);">Ошибка: ${err.message}</div>`; });
  }
  document.getElementById("reportGroupFilter").onchange = renderTable;
  document.getElementById("btnRefreshReports").onclick = renderTable;
  renderTable();
};

// --- УПРАВЛЕНИЕ СТУДЕНТАМИ (Вызывается из reports.js) ---
window.grantXP = function(key) {
  var amount = prompt("Сколько XP начислить?", "50"); if (!amount || isNaN(amount)) return;
  window.API.grantXP(key, parseInt(amount)).then(() => { window.showToast("Начислено +" + amount + " XP", "ok"); window.renderCourseReportsPage(); }).catch(() => window.showToast("Ошибка", "err"));
};
window.deductXP = function(key) {
  var amount = prompt("Сколько XP списать?", "10"); if (!amount || isNaN(amount)) return;
  window.API.grantXP(key, -Math.abs(parseInt(amount))).then(() => { window.showToast("Списано -" + amount + " XP", "ok"); window.renderCourseReportsPage(); }).catch(() => window.showToast("Ошибка", "err"));
};
window.levelDown = function(key, currentXp) {
  var lvl = window.getLevel(currentXp); if (lvl <= 1) return window.showToast("Уже 1 уровень!", "err");
  var drop = currentXp - (Math.pow(lvl - 1, 2) * 100) + 1;
  if (confirm(`Понизить уровень до ${lvl - 1}? Спишется ${drop} XP.`)) window.API.grantXP(key, -drop).then(() => { window.showToast("Уровень понижен", "ok"); window.renderCourseReportsPage(); });
};
window.deleteStudent = function(key, name) {
  if (!confirm(`Удалить студента ${name}? Это действие необратимо.`)) return;
  window.API.deleteStudent(key).then(res => { if(res && res.ok) { window.showToast("Удален", "ok"); window.renderCourseReportsPage(); } else window.showToast("Ошибка удаления", "err"); }).catch(() => window.showToast("Ошибка сети", "err"));
};