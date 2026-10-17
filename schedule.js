/* ============================================================
   МДК 07.01 — schedule.js
   ============================================================ */
"use strict";

function sEl(html){ var t = document.createElement("template"); t.innerHTML = String(html).trim(); return t.content.firstChild; }
function sState(){ try { return state; } catch(e){ return null; } }

async function loadSchedule() {
  const st = sState();
  if (!st || !st.student) return [];
  const p = new URLSearchParams();
  p.append("action", "scheduleload");
  p.append("group", st.student.group);
  try {
    const res = await fetch(APPS_SCRIPT_URL + "?" + p.toString());
    const d = await res.json();
    return d.ok ? d.schedule : [];
  } catch(e) { return []; }
}

async function saveSchedule(group, items) {
  const st = sState();
  const p = new URLSearchParams();
  p.append("action", "schedulesave");
  p.append("userRole", st.staff.role);
  p.append("username", st.staff.username);
  p.append("group", group);
  p.append("payload", JSON.stringify(items));
  try {
    const res = await fetch(APPS_SCRIPT_URL, { method: "POST", body: p });
    const d = await res.json();
    return d.ok;
  } catch(e) { return false; }
}

window.renderSchedulePage = function() {
  const app = document.getElementById("app");
  app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Расписание";
  
  const st = sState();
  const isStaff = st && st.staff && (st.staff.role === "teacher" || st.staff.role === "admin");
  const group = st.student ? st.student.group : (st.staff.group || "ТМ-3");

  app.appendChild(sEl('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  
  const block = sEl(`<section class="module">
    <div class="meta">Учебный процесс</div>
    <h2>Расписание занятий (${group})</h2>
    <p class="sub">${isStaff ? "Вы можете редактировать расписание как преподаватель/администратор." : "Актуальное расписание на неделю."}</p>
    <div id="scheduleContent"><div class="comment-empty">Загружаем расписание…</div></div>
  </section>`);
  app.appendChild(block);

  const content = block.querySelector("#scheduleContent");
  const days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];

  async function refresh() {
    const data = await loadSchedule();
    content.innerHTML = "";

    if (isStaff) {
      const addBtn = sEl('<button class="btn" style="margin-bottom:14px">➕ Добавить пару</button>');
      addBtn.addEventListener("click", () => {
        data.push({ day: "Понедельник", time: "08:30", subject: "", teacher: "", room: "" });
        drawTable(data);
      });
      content.appendChild(addBtn);
    }

    function drawTable(items) {
      content.innerHTML = "";
      if (isStaff) {
        const addBtn = sEl('<button class="btn" style="margin-bottom:14px">➕ Добавить пару</button>');
        addBtn.addEventListener("click", () => {
          items.push({ day: "Понедельник", time: "08:30", subject: "", teacher: "", room: "" });
          drawTable(items);
        });
        content.appendChild(addBtn);
      }

      days.forEach(day => {
        const dayItems = items.filter(i => i.day === day);
        const dayBox = sEl(`<div style="margin-bottom:20px">
          <h3 style="border-bottom:1px solid var(--border);padding-bottom:6px;margin-bottom:10px">${day}</h3>
          <div class="day-list"></div>
        </div>`);
        const list = dayBox.querySelector(".day-list");

        if (!dayItems.length && !isStaff) {
          list.appendChild(sEl('<p class="sub" style="margin:0">Нет занятий</p>'));
        }

        dayItems.forEach((item, idx) => {
          if (isStaff) {
            const row = sEl(`<div style="display:flex;gap:10px;margin-bottom:8px;align-items:center;background:var(--card-soft);padding:10px;border-radius:8px;border:1px solid var(--border)">
              <input type="time" value="${item.time}" class="s-time" style="width:100px;padding:6px;border:1px solid var(--border);border-radius:6px;background:var(--card);color:var(--text)">
              <input type="text" value="${item.subject}" placeholder="Предмет" class="s-subject" style="flex:1;padding:6px;border:1px solid var(--border);border-radius:6px;background:var(--card);color:var(--text)">
              <input type="text" value="${item.teacher}" placeholder="Преподаватель" class="s-teacher" style="width:150px;padding:6px;border:1px solid var(--border);border-radius:6px;background:var(--card);color:var(--text)">
              <input type="text" value="${item.room}" placeholder="Каб." class="s-room" style="width:80px;padding:6px;border:1px solid var(--border);border-radius:6px;background:var(--card);color:var(--text)">
              <button class="btn ghost del-btn" style="padding:6px 10px;color:var(--err)">✕</button>
            </div>`);
            row.querySelector(".del-btn").addEventListener("click", () => {
              const index = items.indexOf(item);
              items.splice(index, 1);
              drawTable(items);
            });
            row.querySelectorAll("input").forEach(inp => {
              inp.addEventListener("input", () => {
                item.time = row.querySelector(".s-time").value;
                item.subject = row.querySelector(".s-subject").value;
                item.teacher = row.querySelector(".s-teacher").value;
                item.room = row.querySelector(".s-room").value;
              });
            });
            list.appendChild(row);
          } else {
            list.appendChild(sEl(`<div class="event-item">
              <span class="ev-date">${item.time}</span>
              <span class="ev-text"><b>${item.subject}</b> · ${item.teacher} · каб. ${item.room}</span>
            </div>`));
          }
        });
        content.appendChild(dayBox);
      });

      if (isStaff) {
        const saveBtn = sEl('<button class="btn" style="margin-top:10px">💾 Сохранить расписание</button>');
        saveBtn.addEventListener("click", async () => {
          saveBtn.disabled = true;
          saveBtn.textContent = "Сохранение...";
          const ok = await saveSchedule(group, items);
          if (ok) {
            saveBtn.textContent = "✔ Сохранено";
            setTimeout(() => refresh(), 1000);
          } else {
            saveBtn.textContent = "Ошибка";
            saveBtn.disabled = false;
          }
        });
        content.appendChild(saveBtn);
      }
    }

    drawTable(data);
  }

  refresh();
};