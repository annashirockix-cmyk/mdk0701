window.renderRatingPage = function(){
  var app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Рейтинг";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a><section class="hero"><h1>Рейтинговая таблица</h1></section>'));
  
  fetch(APPS_SCRIPT_URL + "?action=rating").then(r => r.json()).then(d => {
    if(!d || !d.groups || !d.groups.length) { app.appendChild(el('<div class="module">Пока нет данных.</div>')); return; }
    
    // ТОП-10
    var topBlock = el('<section class="module"><h2>🏆 Топ-10 студентов</h2><div id="top10"></div></section>');
    app.appendChild(topBlock);
    var topWrap = topBlock.querySelector("#top10");
    d.top10.forEach(function(s, i) {
      var medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":(i+1)+".";
      topWrap.appendChild(el('<div style="display:flex;justify-content:space-between;padding:12px;border-bottom:1px solid var(--border);"><span><b>'+medal+'</b> '+s.name+' (гр. '+s.group+')</span> <b style="color:var(--accent)">'+s.score+'</b></div>'));
    });

    // Группы
    var gBlock = el('<section class="module"><h2>Рейтинг групп</h2><div id="gList"></div></section>');
    app.appendChild(gBlock);
    var gWrap = gBlock.querySelector("#gList");
    d.groups.forEach(function(g, i) {
      var medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":(i+1)+".";
      gWrap.appendChild(el('<div style="display:flex;justify-content:space-between;padding:12px;border-bottom:1px solid var(--border);"><span><b>'+medal+'</b> Группа '+g.group+' (балл: '+g.avgScore+')</span></div>'));
    });
  });
};