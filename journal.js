"use strict";

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

  app.innerHTML += `<div style="display:flex; gap:10px; margin-bottom:20px;">
    <button class="btn" id="tabAuto" style="flex:1;">📊 Успеваемость по МДК</button>
    <button class="btn ghost" id="tabManual" style="flex:1;">📝 Выставить оценки по дате</button>
  </div>`;

  var contentWrap = el('<div id="journalContent"></div>');
  app.appendChild(contentWrap);

  // --- ВКЛАДКА 1: УСПЕВАЕМОСТЬ ПО МДК (Автоматическая) ---
  function renderAuto() {
      contentWrap.innerHTML = '<div class="skeleton" style="height:200px;"></div>';
      var courseId = window.state.activeCourseId;
      var course = window.MDK_DATA ? window.MDK_DATA[courseId] : null;
      if (!course) { contentWrap.innerHTML = '<div class="module">Курс не найден.</div>'; return; }

      var works = [];
      course.sections.forEach(s => {
          s.topics.forEach(t => {
              if (t.practicals) t.practicals.forEach((p, i) => works.push({ id: `prac_${t.id}_${i}`, title: `${t.code} ${p.code}`, type: 'prac' }));
              if (t.selfWork) t.selfWork.forEach((sw, i) => works.push({ id: `self_${t.id}_${i}`, title: `${t.code} ${sw.code || ''}`, type: 'self' }));
              if (t.test) works.push({ id: `test_${t.id}`, title: `${t.code} Тест`, type: 'test' });
          });
      });

      window.API.getStudents().then(d => {
          contentWrap.innerHTML = "";
          if (!d || !d.ok || !d.students || !d.students.length) { contentWrap.innerHTML = "<div class='module'>Студентов пока нет.</div>"; return; }

          var students = d.students;
          CURRENT_STUDENTS_CACHE = students;

          var table = document.createElement("table");
          table.className = "journal-table";
          table.style = "border-collapse:collapse; text-align:center; font-size:13px; min-width:max-content;";

          var thead = document.createElement("thead");
          var trHead = document.createElement("tr");
          
          var thName = document.createElement("th");
          thName.style = "border:1px solid var(--border); padding:8px; position:sticky; left:0; background:var(--card); z-index:2; text-align:left; min-width:180px;";
          thName.textContent = "ФИО студента / Группа";
          trHead.appendChild(thName);

          works.forEach(w => {
              var th = document.createElement("th");
              th.style = "border:1px solid var(--border); padding:4px; min-width:80px; font-size:11px; writing-mode:vertical-rl; transform:rotate(180deg); height:100px;";
              th.textContent = w.title;
              trHead.appendChild(th);
          });

          thead.appendChild(trHead);
          table.appendChild(thead);

          var tbody = document.createElement("tbody");

          students.forEach((s) => {
              var sKey = s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase();
              var tr = document.createElement("tr");
              var p = {}; try { p = JSON.parse(s.payload || "{}"); } catch(e) {}
              var results = p.results || {};

              var tdName = document.createElement("td");
              tdName.style = "border:1px solid var(--border); padding:8px; text-align:left; font-weight:bold; position:sticky; left:0; background:var(--card); z-index:1;";
              tdName.innerHTML = `<a href="#/profile/${encodeURIComponent(sKey)}" style="color:var(--text); text-decoration:none; border-bottom:1px dashed var(--muted);"><b>${window.escapeHtml(s.name)}</b></a><br><span style='font-size:11px;color:var(--accent);font-weight:normal;'>гр. ${window.escapeHtml(s.group)}</span>`;
              tr.appendChild(tdName);

              works.forEach(w => {
                  var td = document.createElement("td");
                  td.style = "border:1px solid var(--border); padding:4px; text-align:center;";
                  var grade = results[w.id] ? results[w.id].grade : "—";
                  var color = grade >= 4 ? "var(--ok)" : (grade >= 3 ? "var(--gold)" : (grade === "—" ? "var(--muted)" : "var(--err)"));
                  td.innerHTML = `<b style="color:${color}; font-size:16px;">${grade}</b>`;
                  tr.appendChild(td);
              });

              tbody.appendChild(tr);
          });

          table.appendChild(tbody);
          var wrap = document.createElement("div");
          wrap.className = "module";
          wrap.style = "overflow-x:auto; padding:10px;";
          wrap.appendChild(table);
          contentWrap.appendChild(wrap);
      }).catch(err => {
          contentWrap.innerHTML = `<div class="module" style="color:var(--err);">Ошибка: ${err.message}</div>`;
      });
  }

  // --- ВКЛАДКА 2: РУЧНЫЕ ОЦЕНКИ ПО ДАТЕ (Новый удобный интерфейс) ---
  function renderManual() {
      contentWrap.innerHTML = `
          <div class="module" style="padding:20px; margin-bottom:20px; background:var(--card-soft);">
              <h3 style="margin-top:0; color:var(--accent);">Выберите дату и группу для выставления оценок</h3>
              <div style="display:flex; gap:15px; flex-wrap:wrap; align-items:center;">
                  <div>
                      <label style="font-size:12px; font-weight:bold; display:block; margin-bottom:5px;">Дата</label>
                      <input type="date" id="manualDate" class="self-input" style="margin:0; width:200px;" value="${new Date().toISOString().split('T')[0]}">
                  </div>
                  <div>
                      <label style="font-size:12px; font-weight:bold; display:block; margin-bottom:5px;">Группа</label>
                      <select id="manualGroup" class="self-input" style="margin:0; width:200px;">
                          <option value="all">Все группы</option>
                          <option value="ТМ 4-3">ТМ 4-3</option>
                          <option value="ТМ 3-4">ТМ 3-4</option>
                          <option value="ТМ 2-5">ТМ 2-5</option>
                          <option value="ТМ 2-6">ТМ 2-6</option>
                      </select>
                  </div>
                  <button class="btn" id="loadManualBtn" style="margin-top:18px; padding:12px 24px;">Показать студентов</button>
              </div>
          </div>
          <div id="manualTableWrap"></div>
      `;

      document.getElementById("loadManualBtn").onclick = function() {
          var dateInput = document.getElementById("manualDate").value;
          var groupFilter = document.getElementById("manualGroup").value;
          var wrap = document.getElementById("manualTableWrap");

          if (!dateInput) return window.showToast("Выберите дату", "err");

          // Форматируем дату в ДД.ММ.ГГ
          var parts = dateInput.split('-');
          var formattedDate = `${parts[2]}.${parts[1]}.${parts[0].slice(2)}`;

          wrap.innerHTML = '<div class="skeleton" style="height:200px;"></div>';

          window.API.getStudents().then(d => {
              wrap.innerHTML = "";
              if (!d || !d.ok || !d.students || !d.students.length) { wrap.innerHTML = "<div class='module'>Нет студентов.</div>"; return; }

              var students = d.students;
              if (groupFilter !== "all") {
                  students = students.filter(s => s.group === groupFilter);
              }

              if (students.length === 0) { wrap.innerHTML = "<div class='module'>В этой группе нет студентов.</div>"; return; }

              var tableHtml = `<div class="module" style="padding:10px; overflow-x:auto;">
                  <h3 style="margin-top:0;">Оценки за ${formattedDate} (Группа: ${groupFilter === 'all' ? 'Все' : groupFilter})</h3>
                  <table style="width:100%; border-collapse:collapse; font-size:14px;">
                      <thead><tr style="background:var(--card-soft);">
                          <th style="padding:12px; border:1px solid var(--border); text-align:left;">Студент</th>
                          <th style="padding:12px; border:1px solid var(--border); width:150px;">Оценка</th>
                          <th style="padding:12px; border:1px solid var(--border);">Статус</th>
                      </tr></thead><tbody>`;

              students.forEach(s => {
                  var sKey = s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase();
                  var p = {}; try { p = JSON.parse(s.payload || "{}"); } catch(e) {}
                  var manualGrades = p.manualGrades || {};
                  var currentVal = manualGrades[formattedDate] || "";

                  tableHtml += `<tr>
                      <td style="padding:12px; border:1px solid var(--border);"><b>${window.escapeHtml(s.name)}</b> <span style="font-size:12px; color:var(--muted);">(${s.group})</span></td>
                      <td style="padding:12px; border:1px solid var(--border); text-align:center;">
                          <input type="text" id="grade_${sKey}_${formattedDate}" class="self-input" style="margin:0; text-align:center; font-size:18px; font-weight:bold; height:40px;" maxlength="3" placeholder="-" value="${currentVal}">
                      </td>
                      <td style="padding:12px; border:1px solid var(--border); text-align:center;" id="status_${sKey}_${formattedDate}">
                          ${currentVal ? '<span style="color:var(--ok);">Сохранено</span>' : '<span style="color:var(--muted);">Не выставлено</span>'}
                      </td>
                  </tr>`;
              });

              tableHtml += `</tbody></table>
                  <button class="btn" id="saveManualBtn" style="margin-top:20px; width:100%; padding:15px; font-size:16px;">💾 Сохранить все оценки</button>
              </div>`;

              wrap.innerHTML = tableHtml;

              document.getElementById("saveManualBtn").onclick = function() {
                  var btn = this;
                  btn.textContent = "Сохранение..."; btn.disabled = true;
                  var promises = [];

                  students.forEach(s => {
                      var sKey = s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase();
                      var input = document.getElementById(`grade_${sKey}_${formattedDate}`);
                      if (!input) return;
                      var val = input.value.trim();
                      
                      var p = {}; try { p = JSON.parse(s.payload || "{}"); } catch(e) {}
                      if (!p.manualGrades) p.manualGrades = {};
                      
                      if (val) p.manualGrades[formattedDate] = val;
                      else delete p.manualGrades[formattedDate];

                      promises.push(window.API.saveStudent(sKey, s.name, s.group, JSON.stringify(p)));
                  });

                  Promise.all(promises).then(() => {
                      window.showToast("Оценки за " + formattedDate + " сохранены!", "ok");
                      btn.textContent = "💾 Сохранить все оценки"; btn.disabled = false;
                      // Обновляем статусы
                      students.forEach(s => {
                          var sKey = s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase();
                          var input = document.getElementById(`grade_${sKey}_${formattedDate}`);
                          var st = document.getElementById(`status_${sKey}_${formattedDate}`);
                          if (st) {
                              if (input.value.trim()) st.innerHTML = '<span style="color:var(--ok);">Сохранено</span>';
                              else st.innerHTML = '<span style="color:var(--muted);">Не выставлено</span>';
                          }
                      });
                  }).catch(() => {
                      window.showToast("Ошибка при сохранении", "err");
                      btn.textContent = "Повторить"; btn.disabled = false;
                  });
              };
          });
      };
  }

  document.getElementById("tabAuto").onclick = function() {
      this.classList.remove("ghost"); document.getElementById("tabManual").classList.add("ghost");
      renderAuto();
  };
  document.getElementById("tabManual").onclick = function() {
      this.classList.remove("ghost"); document.getElementById("tabAuto").classList.add("ghost");
      renderManual();
  };

  renderAuto();
};