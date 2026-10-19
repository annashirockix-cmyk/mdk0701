/* ============================================================
   МДК 07.01 — extra.js (v88.0 — NO CACHE)
   ============================================================ */
"use strict";

// ... (renderProfilePage, renderDashboard, renderChatPage, renderCommentsPage оставьте без изменений) ...

window.renderRequestsPage = function() {
    var app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Заявки";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    
    if (!state.staff) { app.appendChild(el('<div class="module">Доступно только преподавателям.</div>')); return; }
    
    app.appendChild(el('<section class="hero"><h1>Входящие заявки</h1><p>Проверка практических работ и выдача попыток.</p></section>'));
    var container = el('<section class="module"><div class="skeleton" style="height:100px;"></div></section>');
    app.appendChild(container);

    // ДОБАВЛЕН &t= ДЛЯ ОБХОДА КЭША
    fetch(APPS_SCRIPT_URL + "?action=getstudents&t=" + Date.now()).then(r => r.json()).then(d => {
        container.innerHTML = "";
        if (!d.ok || !d.students.length) { container.innerHTML = "Студентов пока нет."; return; }
        
        var hasRequests = false;

        d.students.forEach(s => {
            try {
                var p = JSON.parse(s.payload || "{}");
                var sKey = (s.name + "|" + s.group).toLowerCase();
                
                if (p.practicalsDone) {
                    Object.keys(p.practicalsDone).forEach(topicId => {
                        Object.keys(p.practicalsDone[topicId]).forEach(code => {
                            if (p.practicalsDone[topicId][code] === "pending") {
                                hasRequests = true;
                                var topic = findTopic(topicId);
                                var tName = topic ? topic.topic.title : topicId;
                                
                                var reqCard = el(`<div class="module" style="border-left:4px solid var(--accent); padding:16px; margin-bottom:12px;" id="req_${topicId}_${code}">
                                    <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;">
                                        <div>
                                            <b>${s.name}</b> (гр. ${s.group})<br>
                                            <span style="color:var(--muted); font-size:13px;">Сдал практическую: ${tName} (${code})</span>
                                        </div>
                                        <div style="display:flex; gap:10px; align-items:center;">
                                            <select id="grade_${topicId}_${code}" style="padding:8px; border-radius:6px; border:1px solid var(--border); background:var(--bg); color:var(--text);">
                                                <option value="5">Оценка 5</option>
                                                <option value="4">Оценка 4</option>
                                                <option value="3">Оценка 3</option>
                                                <option value="2">Оценка 2</option>
                                            </select>
                                            <button class="btn" onclick="window.approvePractical('${sKey}', '${topicId}', '${code}', document.getElementById('grade_${topicId}_${code}').value)">Подтвердить</button>
                                        </div>
                                    </div>
                                </div>`);
                                container.appendChild(reqCard);
                            }
                        });
                    });
                }

                if (p.requests) {
                    Object.keys(p.requests).forEach(reqKey => {
                        if (p.requests[reqKey] === "pending") {
                            hasRequests = true;
                            var parts = reqKey.split("_");
                            var topicId = parts[0];
                            var type = parts[1];
                            var typeName = type === "test" ? "Тест" : "Сам. работа";
                            var topic = findTopic(topicId);
                            var tName = topic ? topic.topic.title : topicId;

                            var reqCard = el(`<div class="module" style="border-left:4px solid #d97706; padding:16px; margin-bottom:12px;" id="req_${reqKey}">
                                <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;">
                                    <div>
                                        <b>${s.name}</b> (гр. ${s.group})<br>
                                        <span style="color:var(--muted); font-size:13px;">Просит доп. попытку: ${tName} (${typeName})</span>
                                    </div>
                                    <div>
                                        <button class="btn" style="background:#d97706;" onclick="window.approveAttempt('${sKey}', '${reqKey}')">Выдать попытку</button>
                                    </div>
                                </div>
                            </div>`);
                            container.appendChild(reqCard);
                        }
                    });
                }

            } catch(e) {}
        });

        if (!hasRequests) {
            container.innerHTML = '<div style="text-align:center; padding:40px; color:var(--muted);"><h3>Заявок пока нет 🎉</h3><p>Все проверено!</p></div>';
        }
    }).catch(() => { container.innerHTML = "Ошибка загрузки."; });
};

window.renderSchedulePage = function() {
    // ... (код расписания оставляем без изменений, он был в предыдущем ответе) ...
};

window.deleteScheduleItem = function(day, time, group) {
    // ... (код удаления оставляем без изменений) ...
};

window.renderNotificationsPage = function() {
    // ... (код уведомлений оставляем без изменений) ...
};