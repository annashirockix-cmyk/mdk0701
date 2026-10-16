/* ============================================================
   МДК 07.01 — rating.js
   Рейтинговая таблица: группы и студенты внутри групп.
   За всё время. Куратор видит только свою группу.
   ============================================================ */

"use strict";

function rState(){ try { return state; } catch(e){ return null; } }
function rEl(html){
  var t = document.createElement("template");
  t.innerHTML = String(html).trim();
  return t.content.firstChild;
}
function rEsc(s){
  return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
    if (c === "&") return "&amp;";
    if (c === "<") return "&lt;";
    if (c === ">") return "&gt;";
    if (c === '"') return "&quot;";
    if (c === "'") return "&#39;";
    return c;
  });
}

function loadRatingFromServer(){
  if (!APPS_SCRIPT_URL) return Promise.resolve(null);
  var p = new URLSearchParams();
  p.append("action", "rating");
  var st = rState();
  if (st && st.staff){
    p.append("userRole", st.staff.role);
    p.append("username", st.staff.username);
  }
  return fetch(APPS_SCRIPT_URL + "?" + p.toString())
    .then(function(r){ return r.json(); })
    .then(function(d){ return (d && d.ok) ? d : null; })
    .catch(function(){ return null; });
}

window.renderRatingPage = function(){
  var app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = "";
  var crumbs = document.getElementById("crumbs");
  if (crumbs) crumbs.textContent = "Рейтинг";

  app.appendChild(rEl('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));
  app.appendChild(rEl(
    '<section class="hero">' +
      '<div class="meta">Соревнование</div>' +
      '<h1>Рейтинговая таблица</h1>' +
      '<p>Сравнение групп и студентов за всё время обучения. Учитываются средний балл, пройденные темы и сданные работы.</p>' +
    '</section>'
  ));

  var mount = rEl('<div id="ratingMount"><section class="module"><div class="comment-empty">Загружаем рейтинг…</div></section></div>');
  app.appendChild(mount);

  loadRatingFromServer().then(function(data){
    mount.innerHTML = "";
    if (!data || !data.groups || !data.groups.length){
      mount.appendChild(rEl(
        '<section class="module">' +
          '<h2>Пока нет данных</h2>' +
          '<p class="sub">Рейтинг появится, когда хотя бы один студент сохранит прогресс.</p>' +
        '</section>'
      ));
      return;
    }

    /* ----- 1. Таблица групп ----- */
    var groupsBlock = rEl(
      '<section class="module">' +
        '<div class="meta">Общий зачёт</div>' +
        '<h2>🏆 Рейтинг групп</h2>' +
        '<p class="sub">Сортировка по сводному баллу группы.</p>' +
        '<div class="rating-groups" id="ratingGroups"></div>' +
      '</section>'
    );
    var gWrap = groupsBlock.querySelector("#ratingGroups");
    data.groups.forEach(function(g, i){
      var medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (i + 1) + ".";
      gWrap.appendChild(rEl(
        '<div class="rating-group-card ' + (i === 0 ? "winner" : "") + '">' +
          '<div class="rg-medal">' + medal + '</div>' +
          '<div class="rg-body">' +
            '<div class="rg-title">Группа ' + rEsc(g.group) + '</div>' +
            '<div class="rg-meta">' + g.studentsCount + ' студ. · средний балл ' + g.avgGrade.toFixed(2) +
            ' · тем пройдено ' + g.avgTopicsDone + '</div>' +
          '</div>' +
          '<div class="rg-score">' +
            '<div class="rg-score-value">' + g.avgScore + '</div>' +
            '<div class="rg-score-label">балл</div>' +
          '</div>' +
        '</div>'
      ));
    });
    mount.appendChild(groupsBlock);

    /* ----- 2. Студенты внутри групп ----- */
    var studentsBlock = rEl(
      '<section class="module">' +
        '<div class="meta">Внутри группы</div>' +
        '<h2>👥 Студенты по группам</h2>' +
        '<p class="sub">Рейтинг внутри каждой группы.</p>' +
        '<div id="ratingStudents"></div>' +
      '</section>'
    );
    var sWrap = studentsBlock.querySelector("#ratingStudents");
    data.groups.forEach(function(g){
      var list = (data.studentsByGroup && data.studentsByGroup[g.group]) || [];
      if (!list.length) return;

      var groupBox = rEl(
        '<div class="rating-student-group">' +
          '<h3 class="rsg-title">Группа ' + rEsc(g.group) + '</h3>' +
          '<table class="teacher-table rating-table">' +
            '<thead><tr>' +
              '<th style="width:50px">#</th>' +
              '<th>Студент</th>' +
              '<th style="width:100px">Средний балл</th>' +
              '<th style="width:100px">Тем пройдено</th>' +
              '<th style="width:100px">Работ сдано</th>' +
              '<th style="width:90px">Балл</th>' +
            '</tr></thead>' +
            '<tbody></tbody>' +
          '</table>' +
        '</div>'
      );
      var tb = groupBox.querySelector("tbody");
      list.forEach(function(s, i){
        var medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (i + 1);
        var tr = rEl(
          '<tr>' +
            '<td>' + medal + '</td>' +
            '<td><b>' + rEsc(s.name) + '</b></td>' +
            '<td>' + (s.avgGrade ? s.avgGrade.toFixed(2) : "—") + '</td>' +
            '<td>' + s.topicsDone + '</td>' +
            '<td>' + s.worksCount + '</td>' +
            '<td><b style="color:var(--accent)">' + s.score + '</b></td>' +
          '</tr>'
        );
        tb.appendChild(tr);
      });
      sWrap.appendChild(groupBox);
    });
    mount.appendChild(studentsBlock);

    /* ----- 3. Пояснение ----- */
    mount.appendChild(rEl(
      '<section class="module">' +
        '<h2>Как считается балл</h2>' +
        '<p class="sub">Балл = 70% от среднего балла (оценки в 5-балльной системе × 20) + 30% от прогресса по темам (максимум 100).</p>' +
        '<p class="sub">Учитываются все тесты, самостоятельные работы и открытые темы за всё время обучения.</p>' +
      '</section>'
    ));
  });
};

console.log("[rating.js] Модуль рейтинга загружен.");