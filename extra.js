/* ============================================================
   МДК 07.01 — extra.js (v73.0 — SCHEDULE SERVER SYNC)
   ============================================================ */
"use strict";

// ... (renderProfilePage, renderDashboard, renderChatPage, renderCommentsPage, renderRequestsPage оставьте без изменений) ...

/* РАСПИСАНИЕ С СИНХРОНИЗАЦИЕЙ */
window.renderSchedulePage = function() {
    var app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Расписание";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    app.appendChild(el('<section class="hero"><h1>Расписание занятий</h1><p>Осенний семестр 2026-2027</p></section>'));

    var isTeacher = state.staff && (state.staff.role === "teacher" || state.staff.role === "admin");
    
    if (isTeacher) {
        var formBlock = el(`<section class="module" style="background:var(--accent-soft); border-color:var(--accent);">
            <h3 style="margin-top:0; color:var(--accent);">Добавить занятие</h3>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:10px;">
                <select id="schDay" class="self-input" style="margin:0;"><option>Понедельник</option><option>Вторник</option><option>Среда</option><option>Четверг</option><option>Пятница</option><option>Суббота</option></select>
                <input id="schTime" type="text" class="self-input" style="margin:0;" placeholder="Время (8:00-9:35)">
                <select id="schGroup" class="self-input" style="margin:0;"><option>ТМ 2-5</option><option>ТМ 2-6</option><option>ТМ 3-4</option><option>ТМ 4-3</option><option>ЭО 2-2</option><option>ЭО 3-1</option><option>ТЭО 4-25</option><option>ПОАТ 2-11</option><option>ПОАТ 3-10</option><option>ПОАТ 4-9</option></select>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
                <input id="schSubject" type="text" class="self-input" style="margin:0;" placeholder="Предмет">
                <input id="schTeacher" type="text" class="self-input" style="margin:0;" placeholder="Преподаватель">
            </div>
            <button class="btn" id="addSchBtn" style="width:100%;">Добавить в расписание</button>
        </section>`);
        app.appendChild(formBlock);

        formBlock.querySelector("#addSchBtn").onclick = function() {
            var day = document.getElementById("schDay").value;
            var time = document.getElementById("schTime").value;
            var group = document.getElementById("schGroup").value;
            var subject = document.getElementById("schSubject").value;
            var teacher = document.getElementById("schTeacher").value;
            
            if (!time || !subject) { alert("Заполните время и предмет!"); return; }
            
            var p = new URLSearchParams();
            p.append("action", "saveschedule"); p.append("mode", "add");
            p.append("day", day); p.append("time", time); p.append("group", group);
            p.append("subject", subject); p.append("teacher", teacher);
            
            window.showToast("Сохранение...", "info");
            fetch(APPS_SCRIPT_URL, { method: "POST", body: p }).then(r => r.json()).then(res => {
                if(res.ok) { window.showToast("Занятие добавлено!", "ok"); renderSchedulePage(); }
                else window.showToast("Ошибка сохранения", "err");
            });
        };
    }

    var schedBlock = el('<section class="module"><div id="scheduleWrap" style="text-align:center; padding:20px;"><div class="skeleton" style="height:100px;"></div></div></section>');
    app.appendChild(schedBlock);
    var wrap = schedBlock.querySelector("#scheduleWrap");

    // Загружаем с сервера
    fetch(APPS_SCRIPT_URL + "?action=getschedules").then(r => r.json()).then(d => {
        wrap.innerHTML = "";
        if (!d.ok || !d.schedule || d.schedule.length === 0) {
            wrap.innerHTML = '<div style="text-align:center; padding:40px; color:var(--muted);">Расписание пока пусто.</div>';
            return;
        }

        var days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
        
        days.forEach(day => {
            var dayItems = d.schedule.filter(x => x[0] === day);
            if (dayItems.length === 0) return;

            var dayBlock = el(`<div style="margin-bottom:24px; text-align:left;"><h3 style="color:var(--accent); border-bottom:2px solid var(--border); padding-bottom:8px;">${day}</h3><div style="overflow-x:auto;"><table style="width:100%; border-collapse:collapse; font-size:14px;"><thead><tr><th style="border:1px solid var(--border); padding:8px; text-align:left;">Время</th><th style="border:1px solid var(--border); padding:8px; text-align:left;">Группа</th><th style="border:1px solid var(--border); padding:8px; text-align:left;">Предмет</th><th style="border:1px solid var(--border); padding:8px; text-align:left;">Преподаватель</th>${isTeacher ? '<th style="border:1px solid var(--border); padding:8px;"></th>' : ''}</tr></thead><tbody></tbody></table></div></div>`);
            
            var tbody = dayBlock.querySelector("tbody");
            dayItems.forEach(item => {
                // item = [Day, Time, Group, Subject, Teacher]
                var tr = el(`<tr>
                    <td style="border:1px solid var(--border); padding:8px; font-weight:bold;">${item[1]}</td>
                    <td style="border:1px solid var(--border); padding:8px;">${item[2]}</td>
                    <td style="border:1px solid var(--border); padding:8px;">${item[3]}</td>
                    <td style="border:1px solid var(--border); padding:8px;">${item[4]}</td>
                    ${isTeacher ? `<td style="border:1px solid var(--border); padding:8px; text-align:center;"><button class="btn ghost" style="padding:4px 8px; font-size:12px; border-color:var(--err); color:var(--err);" onclick="window.deleteScheduleItem('${item[0]}', '${item[1]}', '${item[2]}')">✕</button></td>` : ''}
                </tr>`);
                tbody.appendChild(tr);
            });
            wrap.appendChild(dayBlock);
        });
    }).catch(() => { wrap.innerHTML = "Ошибка загрузки расписания."; });
};

window.deleteScheduleItem = function(day, time, group) {
    if(!confirm("Удалить эту пару?")) return;
    var p = new URLSearchParams();
    p.append("action", "saveschedule"); p.append("mode", "delete");
    p.append("day", day); p.append("time", time); p.append("group", group);
    
    fetch(APPS_SCRIPT_URL, { method: "POST", body: p }).then(r => r.json()).then(res => {
        if(res.ok) { window.showToast("Пара удалена", "info"); window.renderSchedulePage(); }
    });
};