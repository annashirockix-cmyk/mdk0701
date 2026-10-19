/* ============================================================
   МДК 07.01 — rating.js (v95.0 — STABLE FIX)
   ============================================================ */
window.renderRatingPage = function(){
  var app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Рейтинг";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>Рейтинговая таблица</h1></section>'));
  
  var loader = el('<div class="module" style="text-align:center; padding:40px;"><div class="skeleton" style="height:200px;"></div></div>');
  app.appendChild(loader);

  fetch(APPS_SCRIPT_URL + "?action=getstudents&t=" + Date.now())
    .then(r => { if(!r.ok) throw new Error("Network error"); return r.json(); })
    .then(d => {
      loader.remove();
      
      if(!d || !d.students || !d.students.length) { 
          app.appendChild(el('<div class="module" style="text-align:center; padding:40px;">Пока нет данных для рейтинга.</div>')); 
          return; 
      }
      
      var list = [];
      d.students.forEach(s => {
          var p = {};
          try { p = JSON.parse(s.payload || "{}"); } catch(e){}
          
          var sum = 0, count = 0;
          if (p.results) Object.keys(p.results).forEach(k => { sum += p.results[k].grade; count++; });
          if (p.selfResults) Object.keys(p.selfResults).forEach(k => { sum += p.selfResults[k].grade; count++; });
          var avg = count > 0 ? (sum / count) : 0;
          
          list.push({ name: s.name, group: s.group, xp: p.xp || 0, avg: avg });
      });

      // Топ по XP
      list.sort((a, b) => b.xp - a.xp);
      var topBlock = el('<section class="module"><h2>🏆 Топ-10 студентов (по XP)</h2><div id="top10"></div></section>');
      app.appendChild(topBlock);
      var topWrap = topBlock.querySelector("#top10");
      
      list.slice(0, 10).forEach(function(s, i) {
        var medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":(i+1)+".";
        topWrap.appendChild(el('<div style="display:flex;justify-content:space-between;padding:12px;border-bottom:1px solid var(--border);"><span><b>'+medal+'</b> '+s.name+' (гр. '+s.group+')</span> <b style="color:var(--accent)">'+s.xp+' XP</b></div>'));
      });

      // Группы
      var groupsMap = {};
      list.forEach(s => {
          if(!groupsMap[s.group]) groupsMap[s.group] = { xp: 0, count: 0 };
          groupsMap[s.group].xp += s.xp;
          groupsMap[s.group].count++;
      });
      
      var groupsList = [];
      Object.keys(groupsMap).forEach(g => {
          groupsList.push({ group: g, avgXp: Math.round(groupsMap[g].xp / groupsMap[g].count) });
      });
      groupsList.sort((a, b) => b.avgXp - a.avgXp);

      var gBlock = el('<section class="module"><h2>Рейтинг групп</h2><div id="gList"></div></section>');
      app.appendChild(gBlock);
      var gWrap = gBlock.querySelector("#gList");
      
      groupsList.forEach(function(g, i) {
        var medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":(i+1)+".";
        gWrap.appendChild(el('<div style="display:flex;justify-content:space-between;padding:12px;border-bottom:1px solid var(--border);"><span><b>'+medal+'</b> Группа '+g.group+'</span> <span style="color:var(--muted)">Ср. XP: <b>'+g.avgXp+'</b></span></div>'));
      });
    }).catch((e) => {
        console.error(e);
        loader.innerHTML = "<div style='color:var(--err); padding:20px;'>Ошибка загрузки рейтинга. Проверьте подключение к интернету.</div>";
    });
};