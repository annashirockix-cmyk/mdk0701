/* ============================================================
   МДК 07.01 — journal.js
   ============================================================ */
"use strict";

const DEFAULT_STUDENTS = ["Абрамов Олег", "Баладзе Давид", "Галкин Арсений", "Гладский Константин", "Дадашев Павел", "Дубынин Дмитрий", "Дятлов Даниил", "Евлан Даниил", "Измайлов Рашит", "Калкатинге Генадие", "Калугин Иван", "Карташов Павел", "Костылев Александр", "Кулиш Денис", "Луканов Артём", "Мелешко Антон", "Миронов Артём", "Надина Алиса", "Новиков Арсений", "Орлов Сергей", "Пятышев Артём", "Смирнов Олег", "Соломатин Артём", "Харитонов Максим", "Целилов Антон", "Шлыков Леонид", "Якунин Игорь"];
const DEFAULT_DATES = ["05.11", "11.11", "12.11", "18.11", "19.11", "25.11", "26.11", "02.12", "03.12", "09.12", "10.12", "16.12", "17.12"];

function jEl(html) { var t = document.createElement("template"); t.innerHTML = String(html).trim(); return t.content.firstChild; }
function jEsc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

window.renderJournalPage = function() {
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = ""; document.getElementById("crumbs").textContent = "Журнал";
  var isAdmin = state.staff && state.staff.role === "admin", isTeacher = state.staff && state.staff.role === "teacher", isCurator = state.staff && state.staff.role === "curator", isStudent = !state.staff && state.student;
  var canEdit = isAdmin || isTeacher;
  var targetGroup = "ТМ-3"; if (isCurator) targetGroup = state.staff.group || "ТМ-3"; if (isStudent) targetGroup = state.student.group; if (canEdit) targetGroup = localStorage.getItem("mdk0701.journal.group") || "ТМ-3";

  app.appendChild(jEl('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  app.appendChild(jEl('<section class="hero"><div class="meta">Успеваемость</div><h1>Журнал группы ' + jEsc(targetGroup) + '</h1></section>'));

  var contentBox = jEl('<div id="journalContent"></div>'); app.appendChild(contentBox);

  function drawTable() {
    contentBox.innerHTML = "";
    var topPanel = jEl('<div style="margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px"></div>');
    if (canEdit) {
      var sel = jEl('<div style="display:flex; align-items:center; gap:10px"><label>Группа:</label><select id="groupSelect" class="login-card" style="margin:0; padding:8px"><option value="ТМ-3">ТМ-3</option><option value="ТМП 5-2">ТМП 5-2</option></select></div>');
      topPanel.appendChild(sel); sel.querySelector("#groupSelect").value = targetGroup;
      sel.querySelector("#groupSelect").addEventListener("change", e => { targetGroup = e.target.value; localStorage.setItem("mdk0701.journal.group", targetGroup); document.querySelector(".hero h1").textContent = "Журнал группы " + targetGroup; drawTable(); });
    } else if (isCurator) {
      var btn = jEl('<button class="btn" style="background:var(--blue); color:#fff">📧 Отправить отчет по группе</button>');
      btn.addEventListener("click", e => sendReportEmail(targetGroup, null, e.target)); topPanel.appendChild(btn);
    }
    contentBox.appendChild(topPanel);
    var tableWrap = jEl('<div class="journal-container"><div class="comment-empty">Загружаем данные…</div></div>'); contentBox.appendChild(tableWrap);

    var url = new URL(APPS_SCRIPT_URL); url.searchParams.append("action", "journalload"); url.searchParams.append("group", targetGroup); url.searchParams.append("userRole", state.staff ? state.staff.role : "student"); if (state.staff) url.searchParams.append("username", state.staff.username);
    fetch(url).then(r => r.json()).then(d => renderJournalData(d.ok && d.journal ? d.journal : [], tableWrap)).catch(() => renderJournalData([], tableWrap));
  }

  function renderJournalData(journalData, wrapper) {
    wrapper.innerHTML = ""; var gradesMap = {};
    journalData.forEach(item => { if (!gradesMap[item.student]) gradesMap[item.student] = {}; gradesMap[item.student][item.date] = item.grade; });

    if (window.innerWidth <= 768) {
      var mList = jEl('<div class="journal-mobile-list"></div>');
      DEFAULT_STUDENTS.forEach((studentName, idx) => {
        if (isStudent && state.student.name.toLowerCase().indexOf(studentName.toLowerCase().split(" ")[0]) === -1) return;
        var card = jEl('<div class="jmc-card"></div>');
        var nameHtml = '<div class="jmc-name">' + jEsc(studentName) + '</div>';
        if (isCurator) nameHtml = '<div class="jmc-name" style="display:flex;justify-content:space-between">' + jEsc(studentName) + '<span style="cursor:pointer" onclick="alert(\'Отчет\')">📧</span></div>';
        card.innerHTML = nameHtml;
        var gradesRow = jEl('<div class="jmc-grades"></div>');
        DEFAULT_DATES.forEach(date => {
          var grade = (gradesMap[studentName] && gradesMap[studentName][date]) ? gradesMap[studentName][date] : "";
          var itemHtml = '<div class="jmc-grade-item ' + (grade ? '' : 'empty') + '"><span>' + date + '</span><b>' + (grade || '—') + '</b></div>';
          gradesRow.appendChild(jEl(itemHtml));
        });
        card.appendChild(gradesRow); mList.appendChild(card);
      });
      wrapper.appendChild(mList); return;
    }

    var table = jEl('<table class="journal-table"></table>');
    var thead = jEl('<thead><tr><th rowspan="2">№</th><th rowspan="2">Фамилия и имя</th></tr></thead>');
    var dateTh = jEl('<tr></tr>'); DEFAULT_DATES.forEach(d => dateTh.appendChild(jEl('<th>' + d + '</th>')));
    thead.firstChild.appendChild(jEl('<th colspan="' + DEFAULT_DATES.length + '">Даты занятий</th>')); thead.appendChild(dateTh); table.appendChild(thead);
    var tbody = jEl('<tbody></tbody>');
    DEFAULT_STUDENTS.forEach((studentName, idx) => {
      if (isStudent && state.student.name.toLowerCase().indexOf(studentName.toLowerCase().split(" ")[0]) === -1) return;
      var tr = jEl('<tr></tr>'); tr.appendChild(jEl('<td>' + (idx + 1) + '</td>'));
      var nameTd = jEl('<td style="display:flex; justify-content:space-between; align-items:center"></td>'); nameTd.appendChild(jEl('<span>' + jEsc(studentName) + '</span>'));
      if (isCurator) { var mail = jEl('<button style="background:none;border:none;cursor:pointer;font-size:16px;color:var(--accent)">📧</button>'); mail.addEventListener("click", e => sendReportEmail(targetGroup, studentName, e.target)); nameTd.appendChild(mail); }
      tr.appendChild(nameTd);
      DEFAULT_DATES.forEach(date => {
        var grade = (gradesMap[studentName] && gradesMap[studentName][date]) ? gradesMap[studentName][date] : "";
        var td = jEl('<td></td>');
        if (canEdit) { var input = jEl('<input type="text" class="grade-input" maxlength="3" value="' + grade + '">'); input.addEventListener("change", function() { saveGrade(studentName, date, this.value); }); td.appendChild(input); }
        else { if (grade) td.innerHTML = '<b style="color:' + (grade === "5" ? "var(--ok)" : (grade === "2" ? "var(--err)" : "var(--text)")) + '; font-size:14px">' + jEsc(grade) + '</b>'; }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody); wrapper.appendChild(table);
  }

  function saveGrade(student, date, grade) {
    if (!APPS_SCRIPT_URL || !canEdit) return; var p = new URLSearchParams();
    p.append("action", "journalsave"); p.append("group", targetGroup); p.append("student", student); p.append("date", date); p.append("topic", "Занятие"); p.append("grade", grade); p.append("teacher", state.staff ? state.staff.name : "Учитель");
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p }).then(r => r.json()).then(d => { if (!d.ok) alert("Ошибка сохранения"); }).catch(() => alert("Нет сети"));
  }

  function sendReportEmail(group, student, btn) {
    var email = prompt("Введите email для отчета:", "anna.shirockix@gmail.com"); if (!email) return;
    var oldText = btn.innerHTML; btn.innerHTML = "⏳ Отправка..."; btn.disabled = true;
    var p = new URLSearchParams(); p.append("action", "journalreport"); p.append("group", group); p.append("email", email); if (student) p.append("student", student);
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p }).then(r => r.json()).then(d => { btn.innerHTML = oldText; btn.disabled = false; alert(d.ok ? "✅ Отчет отправлен!" : "❌ Ошибка: " + d.error); }).catch(() => { btn.innerHTML = oldText; btn.disabled = false; alert("❌ Ошибка сети."); });
  }
  drawTable();
};