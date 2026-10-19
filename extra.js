/* ============================================================
   МДК 07.01 — extra.js (v102.0 — CERTIFICATE)
   ============================================================ */
"use strict";

// ... (остальные функции без изменений) ...

window.renderProfilePage = function() {
  const app = document.getElementById("app"); app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Личный кабинет";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  
  if (!state.student && !state.staff) return;
  var isStaff = !!state.staff;
  var name = isStaff ? state.staff.name : (state.nick || state.student.name);
  var group = isStaff ? "Сотрудник" : "Группа " + state.student.group;
  var role = isStaff ? "👨‍🏫" : ((state.shop && state.shop.includes("golden")) ? "👑" : "👨‍🎓");
  var sign = state.sign ? `<p style="color:var(--accent); font-style:italic; margin-top:10px;">"${state.sign}"</p>` : "";

  app.appendChild(el(`<div class="module" style="display:flex;gap:20px;align-items:center;padding:30px;">
    <div style="font-size:60px;background:var(--card-soft);width:100px;height:100px;display:flex;align-items:center;justify-content:center;border-radius:20px; overflow:hidden;">
        ${state.avatar ? `<img src="${state.avatar}" style="width:100%; height:100%; object-fit:cover;">` : role}
    </div>
    <div><h2 style="margin:0">${name}</h2><p style="color:var(--muted);margin:5px 0 0;">${group}</p>${sign}</div>
  </div>`));
  
  if (!isStaff) {
    app.appendChild(el(`<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px; margin-bottom:16px;">
      <a href="#/dashboard" class="btn" style="text-align:center;padding:15px;">📊 Статистика</a>
      <a href="#/portfolio" class="btn ghost" style="text-align:center;padding:15px;">🎓 Портфолио</a>
    </div>`));
    app.appendChild(el(`<div style="margin-bottom:16px;">
      <a href="#/certificate" class="btn" style="width:100%; text-align:center; padding:15px; background:var(--gold); color:#000; font-size:16px;">📜 Получить сертификат</a>
    </div>`));
  }
};

// ... (renderDashboard, renderChatPage, renderCommentsPage, renderRequestsPage) ...

// ФУНКЦИЯ СЕРТИФИКАТА
window.renderCertificatePage = function() {
    var app = document.getElementById("app"); app.innerHTML = "";
    document.getElementById("crumbs").textContent = "Сертификат";
    app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
    
    if (!state.student) { app.appendChild(el('<div class="module">Войдите как студент.</div>')); return; }
    
    // Проверка: выдать сертификат можно, если набрано хотя бы 500 XP
    var isEligible = state.xp >= 500;
    
    if (!isEligible) {
        app.appendChild(el(`<section class="module" style="text-align:center; padding:40px;">
            <h2>🔒 Сертификат пока недоступен</h2>
            <p>Для получения сертификата нужно набрать минимум <b>500 XP</b>.</p>
            <p>У вас сейчас: <b>${state.xp} XP</b>.</p>
            <p>Проходите тесты, сдавайте практические и играйте в игры, чтобы накопить нужное количество!</p>
        </section>`));
        return;
    }
    
    var date = new Date().toLocaleDateString('ru-RU');
    var certHtml = `
    <div id="certificatePrint" style="background:#fff; color:#000; padding:40px; border:10px solid #c14a2a; border-radius:10px; text-align:center; font-family:'Montserrat', sans-serif; position:relative;">
        <div style="font-size:14px; letter-spacing:2px; text-transform:uppercase; color:#c14a2a; margin-bottom:20px;">ГБПОУ МО «Луховицкий авиационный технический техникум»</div>
        <h1 style="font-size:36px; margin:0 0 10px 0; font-weight:900;">СЕРТИФИКАТ</h1>
        <div style="font-size:18px; margin-bottom:30px;">о прохождении курса</div>
        <div style="font-size:24px; font-weight:bold; margin-bottom:20px;">«МДК 07.01. Технология обработки деталей на станках с ПУ»</div>
        <div style="font-size:16px; margin-bottom:30px;">Настоящим подтверждается, что</div>
        <div style="font-size:32px; font-weight:bold; margin-bottom:30px; border-bottom:2px solid #ccc; display:inline-block; padding:0 20px 10px 20px;">${state.student.name}</div>
        <div style="font-size:16px; margin-bottom:30px;">успешно освоил(а) программу курса и набрал(а) <b>${state.xp} XP</b>.</div>
        <div style="display:flex; justify-content:space-between; margin-top:50px; padding:0 40px;">
            <div style="text-align:left;">
                <div style="font-size:12px; color:#666;">Дата выдачи:</div>
                <div style="font-weight:bold; border-bottom:1px solid #000; padding-top:5px;">${date}</div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:12px; color:#666;">Подпись преподавателя:</div>
                <div style="font-weight:bold; font-style:italic; border-bottom:1px solid #000; padding-top:5px;">/ А. А. Широких /</div>
            </div>
        </div>
    </div>
    <button class="btn" style="margin-top:20px; width:100%;" onclick="window.print()">🖨 Распечатать / Сохранить в PDF</button>
    `;
    app.appendChild(el(certHtml));
};