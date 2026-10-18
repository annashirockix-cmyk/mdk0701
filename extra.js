window.renderProfilePage = function() {
  const app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Профиль";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  if (!state.student && !state.staff) return;
  app.appendChild(el(`<div class="module" style="display:flex;gap:20px;align-items:center;padding:30px;"><div style="font-size:60px;">${state.staff ? "👨‍🏫" : "👨‍🎓"}</div><div><h2 style="margin:0">${state.staff ? state.staff.name : state.student.name}</h2><p style="color:var(--muted);margin:5px 0 0;">${state.staff ? "Учитель" : "Гр. "+state.student.group}</p></div></div>`));
  app.appendChild(el(`<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;"><a href="#/dashboard" class="btn" style="text-align:center;padding:15px;">📊 Моя статистика</a><a href="#/portfolio" class="btn ghost" style="text-align:center;padding:15px;">🎓 Портфолио</a></div>`));
};
window.renderDashboard = function(){
  var app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Статистика";
  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el(`<section class="module"><h2>📊 Мой прогресс</h2><div style="max-width:300px;margin:0 auto;"><canvas id="studentChart"></canvas></div></section>`));
  setTimeout(() => { new Chart(document.getElementById('studentChart').getContext('2d'), { type: 'doughnut', data: { labels: ['Пройдено', 'Осталось'], datasets: [{ data: [5, 15], backgroundColor: ['#2d7a4f', '#e8e2d8'] }] }, options: { cutout: '70%' } }); }, 100);
};
window.renderChatPage = function(){
  const app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Чат группы";
  app.appendChild(el(`<a class="backlink" href="#/">← На главную</a><section class="module"><h2>Чат группы</h2><div id="chatLog" style="height:300px;overflow-y:auto;background:var(--card-soft);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:16px;"></div><form id="chatForm" style="display:flex;gap:10px;"><input type="text" id="chatInput" placeholder="Сообщение..." style="flex:1;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text)"><button type="submit" class="btn">Отправить</button></form></section>`));
  document.getElementById("chatForm").onsubmit = (e)=>{ e.preventDefault(); const t = document.getElementById("chatInput").value; if(!t) return; document.getElementById("chatInput").value=""; document.getElementById("chatLog").innerHTML += `<div style="margin-bottom:8px;"><b style="color:var(--accent)">Вы:</b> ${t}</div>`; };
};
window.renderCommentsPage = function(){
  const app = document.getElementById("app"); app.innerHTML = ""; document.getElementById("crumbs").textContent = "Отзывы";
  app.appendChild(el(`<a class="backlink" href="#/">← На главную</a><section class="module"><h2>Отзывы о курсе</h2><p class="sub">Поделитесь мнением.</p><textarea style="width:100%;height:100px;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);margin-bottom:10px;"></textarea><button class="btn">Отправить</button></section>`));
};