/* ============================================================
   МДК 07.01 — journal.js
   ============================================================ */
"use strict";

function jEl(html){ var t = document.createElement("template"); t.innerHTML = String(html).trim(); return t.content.firstChild; }
function jState(){ try { return state; } catch(e){ return null; } }

async function loadJournal() {
  const st = jState();
  if (!st || !st.student) return [];
  const p = new URLSearchParams();
  p.append("action", "journalload");
  p.append("group", st.student.group);
  try {
    const res = await fetch(APPS_SCRIPT_URL + "?" + p.toString());
    const d = await res.json();
    return d.ok ? d.journal : [];
  } catch(e) { return []; }
}

async function saveJournalEntry(group, student, subject, grade, teacher) {
  const st = jState();
  const p = new URLSearchParams();
  p.append("action", "journalsave");
  p.append("userRole", st.staff.role);
  p.append("username", st.staff.username);
  p.append("group", group);
  p.append("student", student);
  p.append("subject", subject);
  p.append("grade", grade);
  p.append("teacher", teacher);
  try {
    const res = await fetch(APPS_SCRIPT_URL, { method: "POST", body: p });
    const d = await res.json();
    return d.ok;
  } catch(e) { return false; }
}

window.renderJournalPage = function() {
  const app = document.getElementById("app");
  app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Журнал";
  
  const st = jState();
  const isStaff = st && st.staff && (st.staff.role === "teacher" || st.staff.role === "admin");
  const group = st.student ? st.student.group : (st.staff.group || "ТМ-3");

  app.appendChild(jEl('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  
  const block = jEl(`<section class="module">
    <div class="meta">Успеваемость</div>
    <h2>Журнал группы ${group}</h2>
    <p class="sub">${isStaff ? "Вы можете выставлять оценки." : "Ваши оценки и оценки одногруппников."}</p>
    
    ${isStaff ? `
    <form id="addGradeForm" style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;background:var(--card-soft);padding:14px;border-radius:10px;border:1px solid var(--border)">
      <input type="text" id="jStudent" placeholder="ФИО студента" required style="flex:1;min-width:200px;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--card);color:var(--text)">
      <input type="text" id="jSubject" placeholder="Предмет" required style="flex:1;min-width:150px;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--card);color:var(--text)">
      <input type="number" id="jGrade" placeholder="Оценка" min="1" max="5" required style="width:90px;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--card);color:var(--text)">
      <button type="submit" class="btn">Выставить</button>
    </form>` : ''}
    
    <div id="journalContent"><div class="comment-empty">Загружаем журнал…</div></div>
  </section>`);
  app.appendChild(block);

  const content = block.querySelector("#journalContent");

  async function refresh() {
    const data = await loadJournal();
    content.innerHTML = "";
    
    if (!data.length) {
      content.appendChild(jEl('<div class="comment-empty">Оценок пока нет.</div>'));
      return;
    }

    const table = jEl(`<table class="teacher-table">
      <thead><tr><th>Дата</th><th>Студент</th><th>Предмет</th><th>Оценка</th><th>Преподаватель</th></tr></thead>
      <tbody></tbody>
    </table>`);
    const tbody = table.querySelector("tbody");

    // Сортируем по дате (новые сверху)
    data.sort((a, b) => new Date(b.date) - new Date(a.date));

    data.forEach(j => {
      const tr = jEl(`<tr>
        <td>${new Date(j.date).toLocaleDateString("ru-RU")}</td>
        <td><b>${j.student}</b></td>
        <td>${j.subject}</td>
        <td style="color:var(--accent);font-weight:bold">${j.grade}</td>
        <td>${j.teacher}</td>
      </tr>`);
      tbody.appendChild(tr);
    });

    content.appendChild(table);
  }

  if (isStaff) {
    block.querySelector("#addGradeForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const student = block.querySelector("#jStudent").value.trim();
      const subject = block.querySelector("#jSubject").value.trim();
      const grade = block.querySelector("#jGrade").value;
      
      if (await saveJournalEntry(group, student, subject, grade, st.staff.name)) {
        block.querySelector("#addGradeForm").reset();
        refresh();
      } else {
        alert("Ошибка сохранения");
      }
    });
  }

  refresh();
};