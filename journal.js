/* ============================================================
   МДК 07.01 — journal.js (v171.0 — Teacher Actions & UI)
   ============================================================ */
"use strict";

window.renderJournalPage = function() {
  var app = document.getElementById("app"); 
  if (!app) return; 
  app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Журнал";
  
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el('<section class="hero"><h1>Журнал успеваемости</h1></section>'));
  
  var isTeacher = state.staff && (state.staff.role === "teacher" || state.staff.role === "admin");
  
  // Панель быстрых действий для учителя
  if (isTeacher) {
      var quickPanel = el(
          '<section class="module" style="background:var(--accent-soft); border-color:var(--accent); margin-bottom:24px;">' +
              '<h3 style="margin-top:0; color:var(--accent);">🎁 Управление опытом</h3>' +
              '<div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">' +
                  '<select id="quickStudentSelect" class="self-input" style="flex:1; min-width:200px; margin:0;">' +
                      '<option value="">— Выберите студента —</option>' +
                  '</select>' +
                  '<input id="quickXPAmount" type="number" class="self-input" style="width:110px; margin:0;" placeholder="XP" value="50" min="1">' +
                  '<button class="btn" id="quickAddBtn" style="background:var(--gold); color:#000;">+ Начислить</button>' +
                  '<button class="btn ghost" id="quickSubBtn" style="border-color:var(--err); color:var(--err);">− Списать</button>' +
                  '<button class="btn" id="quickCasinoBtn" style="background:linear-gradient(45deg, #ff00cc, #333399); color:#fff;">🎰 Казино</button>' +
              '</div>' +
          '</section>');
      app.appendChild(quickPanel);
  }

  var tableWrap = el('<section class="module"><div class="skeleton" style="height:200px;"></div></section>'); 
  app.appendChild(tableWrap);

  // Загрузка данных
  API.getStudents().then(d => {
      tableWrap.innerHTML = "";
      if (!d || !d.ok || !d.students || !d.students.length) {
          tableWrap.innerHTML = "<div style='text-align:center; padding:20px;'>Студентов пока нет.</div>";
          return;
      }
      
      // Инициализация панели
      if (isTeacher) {
          var sel = document.getElementById("quickStudentSelect");
          d.students.forEach(s => {
              var opt = el('<option></option>');
              var sKey = (String(s.name).trim().toLowerCase() + "|" + String(s.group).trim().toLowerCase());
              opt.value = sKey;
              opt.textContent = String(s.name) + " (" + String(s.group) + ")";
              sel.appendChild(opt);
          });
          
          var getSelected = () => {
              if (!sel.value) return null;
              return { key: sel.value, name: sel.options[sel.selectedIndex].text.replace(/\s*\([^)]*\)\s*$/, "").trim() };
          };
          var getAmount = () => {
              var v = parseInt(document.getElementById("quickXPAmount").value, 10);
              return isNaN(v) || v <= 0 ? 50 : v;
          };
          
          document.getElementById("quickAddBtn").onclick = () => {
              var info = getSelected(); if (!info) return window.showToast("Выберите студента", "err");
              if (confirm(`Начислить +${getAmount()} XP студенту ${info.name}?`)) window.grantXP(info.key, info.name, getAmount());
          };
          document.getElementById("quickSubBtn").onclick = () => {
              var info = getSelected(); if (!info) return window.showToast("Выберите студента", "err");
              if (confirm(`Списать ${getAmount()} XP у студента ${info.name}?`)) window.grantXP(info.key, info.name, -getAmount());
          };
          document.getElementById("quickCasinoBtn").onclick = () => {
              var info = getSelected(); if (!info) return window.showToast("Выберите студента", "err");
              var win = Math.floor(Math.random() * 601) - 100;
              if (confirm(`🎰 Рулетка для ${info.name}?\nВыпало: ${win > 0 ? '+' : ''}${win} XP\nПодтвердить?`)) window.grantXP(info.key, info.name, win);
          };
      }

      // Фильтр для студента
      var displayStudents = d.students;
      if (!isTeacher && state.student) {
          displayStudents = d.students.filter(s => 
              String(s.name).trim().toLowerCase() === state.student.name.trim().toLowerCase() && 
              String(s.group).trim().toUpperCase() === state.student.group.trim().toUpperCase()
          );
      }
      if (!displayStudents.length) { tableWrap.innerHTML = "<p class='sub'>Ваших данных пока нет.</p>"; return; }
      
      // Построение таблицы
      var tableContainer = el('<div class="journal-container" style="overflow-x:auto;"></div>');
      var table = el('<table class="journal-table" style="width:100%; border-collapse:collapse; text-align:left; font-size:14px;"></table>');
      table.appendChild(el('<thead><tr>' +
          '<th style="padding:12px; border-bottom:2px solid var(--border); width:30%;">Студент</th>' +
          '<th style="padding:12px; border-bottom:2px solid var(--border); width:10%; text-align:center;">Ср. балл</th>' +
          '<th style="padding:12px; border-bottom:2px solid var(--border); width:20%; text-align:center;">XP</th>' +
          (isTeacher ? '<th style="padding:12px; border-bottom:2px solid var(--border); width:40%;">Действия</th>' : '<th style="padding:12px; border-bottom:2px solid var(--border); width:40%;">Работы</th>') +
      '</tr></thead>'));
      
      var tbody = el('<tbody></tbody>');
      
      displayStudents.forEach(s => {
          var tr = el('<tr style="border-bottom:1px solid var(--border);"></tr>');
          var sKey = String(s.name).trim().toLowerCase() + "|" + String(s.group).trim().toLowerCase();
          var p = {}; try { p = JSON.parse(s.payload || "{}"); } catch(e){}
          
          // Ячейка с ФИО
          var nameHtml = `<div style="font-weight:bold; font-size:16px;">${escapeHtml(s.name)}</div>
                          <div style="font-size:12px;color:var(--muted);">гр. ${escapeHtml(s.group)}</div>`;
          tr.appendChild(el(`<td style="padding:12px; vertical-align:top;">${nameHtml}</td>`));
          
          // Средний балл
          var sum = 0, count = 0;
          if (p.results) Object.keys(p.results).forEach(k => { sum += p.results[k].grade || 0; count++; });
          if (p.selfResults) Object.keys(p.selfResults).forEach(k => { sum += p.selfResults[k].grade || 0; count++; });
          var avg = count > 0 ? (sum / count).toFixed(2) : "—";
          tr.appendChild(el(`<td style="padding:12px; text-align:center; font-weight:bold; color:var(--accent); font-size:18px;">${avg}</td>`));
          
          // XP
          tr.appendChild(el(`<td style="padding:12px; text-align:center; font-weight:bold; color:var(--gold);">${p.xp || 0}</td>`));
          
          // Действия (для учителя) или сданные работы (для студента)
          if (isTeacher) {
              var actionsHtml = `<div style="display:flex; gap:5px; flex-wrap:wrap;">
                  <a href="#/profile/${encodeURIComponent(sKey)}" class="btn" style="padding:6px 10px; font-size:12px; text-decoration:none;">👤 Профиль</a>
                  <button class="btn" style="padding:6px 10px; font-size:12px; background:var(--gold); color:#000;" onclick="window.grantXP('${sKey}', '${escapeHtml(s.name)}')">+ XP</button>
                  <button class="btn ghost" style="padding:6px 10px; font-size:12px; border-color:var(--err); color:var(--err);" onclick="window.deductXP('${sKey}', '${escapeHtml(s.name)}')">- XP</button>
                  <button class="btn ghost" style="padding:6px 10px; font-size:12px; border-color:#d97706; color:#d97706;" onclick="window.levelDown('${sKey}', '${escapeHtml(s.name)}', ${p.xp || 0})">📉 Уровень</button>
              </div>`;
              tr.appendChild(el(`<td style="padding:12px;">${actionsHtml}</td>`));
          } else {
              var worksHtml = "";
              if (p.results) Object.keys(p.results).forEach(k => worksHtml += `Тест: ${p.results[k].grade}<br>`);
              if (p.selfResults) Object.keys(p.selfResults).forEach(k => worksHtml += `Сам.работа: ${p.selfResults[k].grade}<br>`);
              tr.appendChild(el(`<td style="padding:12px; font-size:12px; color:var(--muted);">${worksHtml || "Нет"}</td>`));
          }
          tbody.appendChild(tr);
      });
      
      table.appendChild(tbody); tableContainer.appendChild(table); tableWrap.appendChild(tableContainer);
  }).catch(err => {
      console.error(err);
      tableWrap.innerHTML = "<div style='color:var(--err); padding:20px;'>Ошибка загрузки журнала.</div>";
  });
};

// Вспомогательные функции для учителя
window.deductXP = function(key, name) {
    var amount = prompt(`Сколько XP списать у ${name}?`, "10");
    if (!amount || isNaN(amount)) return;
    window.grantXP(key, name, -Math.abs(parseInt(amount)));
};

window.levelDown = function(key, name, currentXp) {
    var level = getLevel(currentXp);
    if (level <= 1) return window.showToast("Уже 1 уровень!", "err");
    var amountToDrop = currentXp - (Math.pow(level - 1, 2) * 100) + 1;
    if (confirm(`Понизить уровень ${name} до ${level - 1}?\n(Спишется ${amountToDrop} XP)`)) {
        window.grantXP(key, name, -amountToDrop);
    }
};

window.grantXP = function(key, name, amount) {
    if (amount === undefined) amount = prompt(`Сколько XP начислить студенту ${name}?`, "50");
    if (!amount || isNaN(amount)) return;
    
    API.grantXP(key, parseInt(amount)).then(() => {
        window.showToast(`XP изменен на ${amount}`, "ok");
        window.renderJournalPage(); // Перерисовка
    }).catch(() => window.showToast("Ошибка сети", "err"));
};