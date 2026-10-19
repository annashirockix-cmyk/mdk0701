/* ============================================================
   МДК 07.01 — extra.js (v99.0 — NOTIFICATION FIX)
   ============================================================ */
"use strict";

// ... (остальные функции без изменений) ...

window.renderNotificationsPage = function() {
    var app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Уведомления";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    app.appendChild(el('<section class="hero"><h1>Центр уведомлений</h1></section>'));

    if (state.notifications) {
        state.notifications.forEach(n => n.read = true);
        saveStudentData();
        updateNotifBadge();
    }

    var block = el('<section class="module"><div id="notifList" style="display:flex; flex-direction:column; gap:12px;"></div></section>');
    app.appendChild(block);
    var list = block.querySelector("#notifList");

    if (!state.notifications || state.notifications.length === 0) {
        list.innerHTML = '<div style="text-align:center; padding:40px; color:var(--muted);"><h3>Уведомлений пока нет</h3><p>Здесь будут появляться сообщения об оценках, изменениях в расписании и начислениях XP.</p></div>';
        return;
    }

    state.notifications.forEach(n => {
        var icon = "ℹ️";
        var color = "var(--accent)";
        if (n.type === "ok") { icon = "✅"; color = "var(--ok)"; }
        if (n.type === "err") { icon = "❌"; color = "var(--err)"; }
        if (n.text.includes("XP")) { icon = "🌟"; color = "var(--gold)"; }
        if (n.text.includes("оценка") || n.text.includes("Оценка")) { icon = "📝"; color = "var(--blue)"; }

        // БЕЗОПАСНЫЙ ПАРСИНГ ДАТЫ
        var dateStr = "Неизвестно";
        try {
            var dateObj = new Date(n.date);
            if (!isNaN(dateObj.getTime())) {
                dateStr = dateObj.toLocaleDateString() + " " + dateObj.toLocaleTimeString();
            }
        } catch(e) {}

        list.appendChild(el(`<div style="display:flex; gap:16px; background:var(--card-soft); border:1px solid var(--border); padding:16px; border-radius:12px; align-items:flex-start;">
            <div style="font-size:24px;">${icon}</div>
            <div style="flex:1;">
                <div style="font-size:15px; color:var(--text); margin-bottom:4px;">${n.text}</div>
                <div style="font-size:12px; color:var(--muted);">${dateStr}</div>
            </div>
        </div>`));
    });
};