/* ============================================================
   МДК 07.01 — rating.js (v171.0 — Podium UI)
   ============================================================ */
"use strict";

window.renderRatingPage = function() {
  var app = document.getElementById("app"); app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Доска почета";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>🏆 Доска почета</h1></section>'));
  
  API.getStudents().then(d => {
      if (!d || !d.ok || !d.students || !d.students.length) {
          return app.appendChild(el('<div class="module" style="text-align:center;">Пока нет данных для рейтинга.</div>'));
      }

      // Парсинг и сортировка
      var list = d.students.map(s => {
          var p = {}; try { p = JSON.parse(s.payload || "{}"); } catch(e){}
          return { 
              name: s.name, 
              group: s.group, 
              xp: p.xp || 0, 
              avatar: p.avatar || null, 
              effect: p.avatarEffect 
          };
      }).sort((a, b) => b.xp - a.xp);

      // Функция для рендера аватара с маской
      var renderAv = (s, size, borderColor) => {
          var effClass = s.effect ? ` av-fx-${s.effect}` : "";
          var avHtml = s.avatar ? `<img src="${s.avatar}" style="width:100%; height:100%; object-fit:cover;">` : "👨‍🎓";
          return `<div class="av-container${effClass}" style="width:${size}px; height:${size}px; margin:0 auto; border:3px solid ${borderColor}; border-radius:50%; overflow:hidden; font-size:${size/2}px;">${avHtml}</div>`;
      };

      // Подиум Топ-3
      var podiumHtml = '<div style="display:flex; justify-content:center; align-items:flex-end; gap:20px; margin-bottom:40px; height:260px; flex-wrap:wrap;">';
      
      // 2 место
      if (list[1]) {
          podiumHtml += `<div style="text-align:center; width:120px;">
              <div style="font-size:50px; filter:drop-shadow(0 0 10px silver);">🥈</div>
              ${renderAv(list[1], 80, "silver")}
              <div style="font-weight:bold; margin-top:10px; font-size:14px;">${escapeHtml(list[1].name)}</div>
              <div style="color:var(--gold); font-size:12px;">${list[1].xp} XP</div>
          </div>`;
      }
      
      // 1 место
      if (list[0]) {
          podiumHtml += `<div style="text-align:center; width:140px; transform:translateY(-30px);">
              <div style="font-size:70px; filter:drop-shadow(0 0 15px gold);">🥇</div>
              ${renderAv(list[0], 100, "gold")}
              <div style="font-weight:bold; margin-top:10px; font-size:16px; color:var(--gold);">${escapeHtml(list[0].name)}</div>
              <div style="color:var(--gold); font-weight:bold;">${list[0].xp} XP</div>
          </div>`;
      }
      
      // 3 место
      if (list[2]) {
          podiumHtml += `<div style="text-align:center; width:120px;">
              <div style="font-size:50px; filter:drop-shadow(0 0 10px #cd7f32);">🥉</div>
              ${renderAv(list[2], 80, "#cd7f32")}
              <div style="font-weight:bold; margin-top:10px; font-size:14px;">${escapeHtml(list[2].name)}</div>
              <div style="color:var(--gold); font-size:12px;">${list[2].xp} XP</div>
          </div>`;
      }
      
      podiumHtml += '</div>';
      app.appendChild(el(`<section class="module">${podiumHtml}</section>`));

      // Остальной список
      var listBlock = el('<section class="module"><h3 style="margin-top:0;">Остальные участники</h3><div id="restList"></div></section>');
      var restWrap = listBlock.querySelector("#restList");
      
      list.slice(3).forEach((s, i) => {
          restWrap.appendChild(el(`<div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--border);">
              <div style="display:flex; align-items:center; gap:10px;">
                  <b style="color:var(--muted); font-size:16px;">${i+4}.</b>
                  <div>${escapeHtml(s.name)} <span style="font-size:11px; color:var(--muted);">(${escapeHtml(s.group)})</span></div>
              </div>
              <b style="color:var(--accent);">${s.xp} XP</b>
          </div>`));
      });
      app.appendChild(listBlock);

  }).catch(err => {
      console.error(err);
      app.appendChild(el('<div class="module" style="color:var(--err);">Ошибка загрузки рейтинга.</div>'));
  });
};