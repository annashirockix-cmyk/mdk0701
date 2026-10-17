/* ============================================================
   МДК 07.01 — journal.js (v19.0 — DYNAMIC)
   ============================================================ */
"use strict";

window.renderJournalPage = function() {
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = ""; document.getElementById("crumbs").textContent = "Журнал";
  
  app.appendChild(el('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  app.appendChild(el('<section class="hero"><h1>Журнал успеваемости</h1></section>'));
  
  var tableWrap = el('<section class="module"><div class="skeleton" style="height:200px;"></div></section>'); app.appendChild(tableWrap);

  fetch(APPS_SCRIPT_URL + "?action=getstudents")
    .then(r => r.json()).then(d => {
      tableWrap.innerHTML = "";
      if (!d.ok || !d.students.length) { tableWrap.innerHTML = "Студентов пока нет."; return; }
      
      var table = el('<table class="journal-table" style="width:100%;border-collapse:collapse;"><thead><tr><th>Студент</th><th>Группа</th><th>Оценки</th></tr></thead><tbody></tbody></table>');
      var tbody = table.querySelector("tbody");
      d.students.forEach(s => {
        tbody.appendChild(el(`<tr><td style="border:1px solid var(--border);padding:10px;">${s.name}</td><td style="border:1px solid var(--border);padding:10px;">${s.group}</td><td style="border:1px solid var(--border);padding:10px;color:var(--muted);">Автоматически</td></tr>`));
      });
      tableWrap.appendChild(table);
    }).catch(() => { tableWrap.innerHTML = "Ошибка загрузки журнала."; });
};