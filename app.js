"use strict";

// ============================================================
// МДК Портал — app.js (полностью переписан)
// ============================================================

// --- УТИЛИТЫ ---
window.$ = (id) => document.getElementById(id);
window.escapeHtml = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]));
window.el = (html) => {
  var div = document.createElement("div");
  div.innerHTML = html.trim();
  return div.firstChild;
};
window.studentKey = (s) => {
  s = s || window.state.student;
  return s ? (s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase()) : null;
};

window.showToast = function(msg, type) {
  var container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  var toast = document.createElement("div");
  toast.className = "toast " + (type || "");
  var icon = type === "ok" ? "✅ " : type === "err" ? "❌ " : "ℹ️ ";
  toast.innerHTML = icon + window.escapeHtml(msg);
  container.appendChild(toast);
  setTimeout(function() {
    toast.classList.add("out");
    setTimeout(function() { toast.remove(); }, 300);
  }, 3000);
};

// --- СОСТОЯНИЕ ---
window.state = {
  activeCourseId: localStorage.getItem("mdk.active") || "07.01",
  student: null, staff: null, xp: 0, results: {}
};

if (!window.MDK_DATA || !window.MDK_DATA[window.state.activeCourseId]) {
  window.state.activeCourseId = "07.01";
}
window.COURSE = (window.MDK_DATA && window.MDK_DATA[window.state.activeCourseId]) || null;

try {
  var _s = JSON.parse(localStorage.getItem("mdk.student") || "null");
  if (_s && _s.name) window.state.student = _s;
  var _st = JSON.parse(localStorage.getItem("mdk.staff") || "null");
  if (_st && _st.name) window.state.staff = _st;
} catch (e) {}

window.getLevel = function(xp) {
  return !xp || xp <= 0 ? 1 : Math.min(Math.floor(Math.sqrt(xp / 100)) + 1, 100);
};
window.getLevelTitle = function(lvl) { return "Уровень " + lvl; };

window.updateXpDisplay = function() {
  var el = window.$("xpCount");
  if (!el) return;
  if (window.state.staff) {
    el.textContent = "👨‍🏫 " + window.state.staff.name;
  } else {
    el.textContent = "🌟 " + window.state.xp + " XP · Lv." + window.getLevel(window.state.xp);
  }
};

window.saveStudentData = function() {
  var k = window.studentKey(); if (!k) return;
  var ek = encodeURIComponent(k);
  try {
    localStorage.setItem("mdk.xp." + ek, window.state.xp);
    localStorage.setItem("mdk.results." + ek, JSON.stringify(window.state.results || {}));
  } catch (e) {}
  window.updateXpDisplay();
  if (window.API) {
    window.API.saveStudent(
      k, window.state.student.name, window.state.student.group,
      JSON.stringify({ xp: window.state.xp, results: window.state.results })
    ).catch(function() {});
  }
};

window.loadStudentData = function() {
  var k = window.studentKey(); if (!k) return;
  var ek = encodeURIComponent(k);
  try {
    window.state.xp = parseInt(localStorage.getItem("mdk.xp." + ek) || "0", 10);
    var r = localStorage.getItem("mdk.results." + ek);
    window.state.results = r ? JSON.parse(r) : {};
  } catch (e) {}
  window.updateXpDisplay();
};

window.addXP = function(amount) {
  window.state.xp += amount;
  window.saveStudentData();
  window.showToast("+" + amount + " XP", "ok");
};

// --- АВТОРИЗАЦИЯ ---
window.doStudentLogin = function() {
  var n = document.getElementById("loginName").value.trim();
  var g = document.getElementById("loginGroup").value.trim();
  if (!n || !g) { alert("Введите ФИО и Группу!"); return; }

  window.state.student = { name: n, group: g.toUpperCase() };
  window.state.staff = null;
  try {
    localStorage.setItem("mdk.student", JSON.stringify(window.state.student));
    localStorage.removeItem("mdk.staff");
  } catch (e) {}

  document.getElementById("loginOverlay").style.display = "none";
  window.renderUserChip();
  window.loadStudentData();
  window.route();
};

window.doTeacherLogin = function() {
  var u = document.getElementById("teacherUser").value.trim();
  var p = document.getElementById("teacherPass").value.trim();
  var errBox = document.getElementById("teacherLoginError");
  var btn = document.getElementById("btnLoginTeacher");

  if (!u || !p) {
    errBox.textContent = "Введите логин и пароль!";
    errBox.style.display = "block";
    return;
  }
  errBox.style.display = "none";
  btn.textContent = "Проверка...";
  btn.disabled = true;

  function finishOk(staff) {
    window.state.staff = staff;
    window.state.student = null;
    try {
      localStorage.setItem("mdk.staff", JSON.stringify(staff));
      localStorage.removeItem("mdk.student");
    } catch (e) {}
    document.getElementById("loginOverlay").style.display = "none";
    btn.textContent = "Войти в журнал";
    btn.disabled = false;
    window.renderUserChip();
    window.updateXpDisplay();
    window.route();
  }

  function finishErr(msg) {
    btn.textContent = "Войти в журнал";
    btn.disabled = false;
    errBox.textContent = msg;
    errBox.style.display = "block";
  }

  if (u === "admin" && p === "admin") {
    finishOk({ name: "Администратор", role: "admin" });
    return;
  }

  if (!window.API) {
    finishErr("Сервер недоступен. Используйте admin/admin.");
    return;
  }

  window.API.login(u, p).then(function(res) {
    if (res && res.ok) {
      finishOk({ name: res.name || u, role: res.role || "teacher" });
    } else {
      finishErr((res && res.error) || "Неверный логин или пароль");
    }
  }).catch(function() {
    finishErr("Ошибка сети. Используйте admin/admin.");
  });
};

window.handleLogout = function() {
  if (!confirm("Выйти из аккаунта?")) return;
  window.state.student = null;
  window.state.staff = null;
  try {
    localStorage.removeItem("mdk.student");
    localStorage.removeItem("mdk.staff");
  } catch (e) {}
  var ov = document.getElementById("loginOverlay");
  if (ov) ov.style.display = "flex";
  window.closeDrawer();
  window.route();
};

window.switchCourse = function(id) {
  try { localStorage.setItem("mdk.active", id); } catch (e) {}
  location.reload();
};

window.closeDrawer = function() {
  if (window.$("drawer")) window.$("drawer").classList.remove("open");
  if (window.$("drawerOverlay")) window.$("drawerOverlay").classList.remove("open");
};

window.applyTheme = function(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try { localStorage.setItem("mdk.theme", theme); } catch (e) {}
};

window.renderUserChip = function() {
  if (!window.$("userChipName")) return;
  if (window.state.staff) {
    window.$("userChipName").textContent = window.state.staff.name;
    window.$("userChipGroup").textContent = "Преподаватель";
    window.$("userChipAvatar").innerHTML = "👨‍🏫";
    return;
  }
  if (!window.state.student) return;
  window.$("userChipName").textContent = window.state.student.name;
  window.$("userChipGroup").textContent = "Гр. " + window.state.student.group;
  window.$("userChipAvatar").innerHTML = "👨‍🎓";
};

// --- РЕНДЕРИНГ: ГЛАВНАЯ ---
function renderHome() {
  var app = window.$("app");
  if (!app) return;
  app.innerHTML = "";
  var c = window.COURSE;
  if (!c) {
    app.innerHTML = "<div class='module'>Ошибка: данные курса не загружены.</div>";
    return;
  }

  var html = '<section class="hero"><h1>' + window.escapeHtml(c.title) + '</h1>' +
             '<p>' + window.escapeHtml(c.module || "") + '</p></section>';
  html += '<div class="steps-title">Учебный план</div>';

  if (c.sections && c.sections.length) {
    c.sections.forEach(function(sec) {
      html += '<div style="font-weight:bold; margin:20px 0 10px; color:var(--accent); text-transform:uppercase; font-size:12px;">' +
              window.escapeHtml(sec.title) + '</div>';
      (sec.topics || []).forEach(function(t) {
        var isDone = window.state.results[t.id];
        var icon = isDone ? "✅" : "📖";
        var badges = [];
        if (t.lectures && t.lectures.length) badges.push("📖");
        if (t.practicals && t.practicals.length) badges.push("🛠");
        if (t.selfWork && t.selfWork.length) badges.push("✍️");
        if (t.test && t.test.length) badges.push("📝");
        if (t.presentations && t.presentations.length) badges.push("🎞");
        html += '<div class="topic" onclick="location.hash=\'#/topic/' + t.id + '/lecture\'">' +
          '<span style="margin-right:15px; font-size:20px;">' + icon + '</span>' +
          '<div style="flex:1;">' +
            '<div style="font-size:12px; color:var(--muted);">' + window.escapeHtml(t.code || "") + '</div>' +
            '<div style="font-weight:bold;">' + window.escapeHtml(t.title) + '</div>' +
            '<div style="font-size:13px; margin-top:4px; color:var(--muted);">' + badges.join(" ") + '</div>' +
          '</div>' +
        '</div>';
      });
    });
  } else {
    html += "<p>Темы для этого предмета пока не добавлены.</p>";
  }

  html += '<div style="display:flex;gap:10px;margin-top:24px;flex-wrap:wrap;">' +
    '<a class="btn ghost" href="#/training" style="flex:1;text-align:center;min-width:140px;">🎯 Тренировка</a>' +
    '<a class="btn" href="#/final" style="flex:1;text-align:center;min-width:140px;">📋 Экзамены</a>' +
    '</div>';
  app.innerHTML = html;
}

// --- РЕНДЕРИНГ: ТЕМА (5 вкладок) ---
window.renderTopic = function(id, tab) {
  tab = tab || "lecture";
  var c = window.COURSE;
  var t = null;
  if (c && c.sections) {
    for (var i = 0; i < c.sections.length && !t; i++) {
      var topics = c.sections[i].topics || [];
      for (var j = 0; j < topics.length; j++) {
        if (topics[j].id === id) { t = topics[j]; break; }
      }
    }
  }
  if (!t) { renderHome(); return; }

  // какие вкладки реально есть
  var hasLecture     = !!(t.lectures && t.lectures.length);
  var hasPractice    = !!(t.practicals && t.practicals.length);
  var hasSelfWork    = !!(t.selfWork && t.selfWork.length);
  var hasTest        = !!(t.test && t.test.length);
  var hasPresentation = !!(t.presentations && t.presentations.length);

  var tabOrder = [];
  if (hasLecture) tabOrder.push("lecture");
  if (hasPractice) tabOrder.push("practice");
  if (hasSelfWork) tabOrder.push("selfwork");
  if (hasTest) tabOrder.push("test");
  if (hasPresentation) tabOrder.push("presentation");

  if (tabOrder.indexOf(tab) === -1) tab = tabOrder[0] || "lecture";

  var tabLabels = {
    lecture:      "📖 Лекция",
    practice:     "🛠 Практика",
    selfwork:     "✍️ Самостоятельная",
    test:         "📝 Контрольная",
    presentation: "🎞 Презентация"
  };

  var app = window.$("app");
  var html = '<a class="backlink" href="#/" style="color:var(--accent);">← К программе</a>' +
    '<section class="topic-head">' +
      '<div style="font-size:12px; color:var(--muted);">' + window.escapeHtml(t.code || "") + '</div>' +
      '<h1>' + window.escapeHtml(t.title) + '</h1>' +
    '</section>';

  html += '<div style="display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap;">';
  tabOrder.forEach(function(key) {
    html += '<button class="tab ' + (key === tab ? 'active' : '') + '" ' +
            'onclick="location.hash=\'#/topic/' + id + '/' + key + '\'">' +
            tabLabels[key] + '</button>';
  });
  html += '</div>';

  var panelHtml = "";

  // -------- ЛЕКЦИЯ --------
  if (tab === "lecture" && hasLecture) {
    t.lectures.forEach(function(l) {
      panelHtml += '<h3>' + (l.code ? window.escapeHtml(l.code) + '. ' : '') +
                   window.escapeHtml(l.title) + '</h3>' +
                   '<div class="lecture-content" style="margin-bottom:20px;">' +
                   (l.content || "") + '</div>';
    });
    panelHtml += '<button class="btn" id="markDoneBtn" style="width:100%;margin-top:20px;">' +
                 'Отметить как изученное (+50 XP)</button>';
  }

  // -------- ПРАКТИКА --------
  if (tab === "practice" && hasPractice) {
    t.practicals.forEach(function(p) {
      panelHtml += '<div style="margin-bottom:20px; padding:20px; border:1px solid var(--border); border-radius:8px;">' +
        '<h4>' + window.escapeHtml(p.code) + '. ' + window.escapeHtml(p.title) + '</h4>' +
        '<p><b>Цель:</b> ' + window.escapeHtml(p.goal || '') + '</p>' +
        '<p><b>Задание:</b> ' + window.escapeHtml(p.task || '') + '</p>';
      if (p.variants && p.variants.length) {
        panelHtml += '<p><b>Варианты:</b></p><ul>' +
          p.variants.map(function(v) { return '<li>' + window.escapeHtml(v) + '</li>'; }).join("") +
          '</ul>';
      }
      panelHtml += '</div>';
    });
  }

  // -------- САМОСТОЯТЕЛЬНАЯ --------
  if (tab === "selfwork" && hasSelfWork) {
    t.selfWork.forEach(function(s) {
      panelHtml += '<div style="margin-bottom:20px; padding:20px; border:1px solid var(--border); border-radius:8px;">' +
        '<h4>' + window.escapeHtml(s.code) + '. ' + window.escapeHtml(s.title) + '</h4>' +
        '<p><b>Цель:</b> ' + window.escapeHtml(s.goal || '') + '</p>' +
        '<p><b>Задание:</b> ' + window.escapeHtml(s.task || '') + '</p>';
      if (s.questions && s.questions.length) {
        panelHtml += '<p><b>Контрольные вопросы:</b></p><ol>' +
          s.questions.map(function(q) { return '<li>' + window.escapeHtml(q) + '</li>'; }).join("") +
          '</ol>';
      }
      panelHtml += '</div>';
    });
    panelHtml += '<button class="btn" id="markSelfWorkBtn" style="width:100%;margin-top:10px;">' +
                 'Сдать самостоятельную (+100 XP)</button>';
  }

  // -------- КОНТРОЛЬНАЯ (тест) --------
  if (tab === "test" && hasTest) {
    t.test.forEach(function(q, qi) {
      panelHtml += '<div class="question"><div class="q-text">' + (qi + 1) + '. ' +
                   window.escapeHtml(q.q) + '</div>';
      q.options.forEach(function(opt, oi) {
        panelHtml += '<label class="option">' +
          '<input type="radio" name="q' + qi + '" value="' + oi + '">' +
          '<span>' + window.escapeHtml(opt) + '</span></label>';
      });
      panelHtml += '</div>';
    });
    panelHtml += '<button class="btn" id="finishTestBtn" style="width:100%;margin-top:10px;">Завершить</button>';
  }

  // -------- ПРЕЗЕНТАЦИЯ --------
  if (tab === "presentation" && hasPresentation) {
    t.presentations.forEach(function(p) {
      panelHtml += '<div style="margin-bottom:20px; padding:20px; border:1px solid var(--border); border-radius:8px;">' +
        '<h4>' + window.escapeHtml(p.code) + '. ' + window.escapeHtml(p.title) + '</h4>' +
        '<p>' + window.escapeHtml(p.description || '') + '</p>' +
        '<p style="color:var(--muted); font-size:13px;">' +
          '<b>Файл:</b> <code>' + window.escapeHtml(p.file || '') + '</code>' +
          (p.slides ? ' · <b>Слайдов:</b> ' + p.slides : '') +
        '</p>' +
        '<a class="btn" href="./presentations/' + encodeURIComponent(p.file) + '" ' +
        'target="_blank" rel="noopener" download style="display:inline-block; margin-top:8px;">' +
        '📥 Открыть / скачать презентацию</a>' +
      '</div>';
    });
    panelHtml += '<p style="color:var(--muted); font-size:13px;">' +
      'Файлы презентаций находятся в папке <code>presentations/</code> рядом с сайтом.</p>';
  }

  app.innerHTML = html + '<section class="panel module">' + panelHtml + '</section>';

  // -------- ОБРАБОТЧИКИ --------
  if (tab === "lecture") {
    var markBtn = document.getElementById("markDoneBtn");
    if (markBtn) {
      markBtn.onclick = function() {
        window.addXP(50);
        markBtn.textContent = "✅ Изучено";
        markBtn.disabled = true;
      };
    }
  }

  if (tab === "selfwork") {
    var markSelfBtn = document.getElementById("markSelfWorkBtn");
    if (markSelfBtn) {
      markSelfBtn.onclick = function() {
        window.addXP(100);
        markSelfBtn.textContent = "✅ Сдано";
        markSelfBtn.disabled = true;
      };
    }
  }

  if (tab === "test") {
    var finishBtn = document.getElementById("finishTestBtn");
    if (finishBtn) {
      finishBtn.onclick = function() {
        var correct = 0;
        t.test.forEach(function(q, qi) {
          var ch = document.querySelector('input[name="q' + qi + '"]:checked');
          if (ch && Number(ch.value) === q.correct) correct++;
        });
        finishBtn.disabled = true;
        finishBtn.textContent = "Завершено";
        var grade = Math.max(2, Math.round((correct / t.test.length) * 5));
        window.state.results[id] = { grade: grade };
        window.addXP(100);
        window.showToast("Оценка: " + grade, "ok");
        window.saveStudentData();
      };
    }
  }
};

// --- РЕНДЕРИНГ: ПРОФИЛЬ ---
window.renderProfilePage = function() {
  var app = window.$("app");
  if (!app) return;
  if (window.state.staff) {
    app.innerHTML =
      '<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>' +
      '<section class="hero"><h1>Профиль преподавателя</h1></section>' +
      '<div class="module">' +
        '<p><b>Имя:</b> ' + window.escapeHtml(window.state.staff.name) + '</p>' +
        '<p><b>Роль:</b> ' + (window.state.staff.role === "admin" ? "Администратор" : "Преподаватель") + '</p>' +
        '<p><a href="#/journal" class="btn" style="margin-top:10px;">📒 Перейти в журнал</a></p>' +
      '</div>';
    return;
  }
  app.innerHTML =
    '<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>' +
    '<section class="hero"><h1>Личный кабинет</h1></section>' +
    '<div class="module">' +
      '<p><b>ФИО:</b> ' + (window.state.student ? window.escapeHtml(window.state.student.name) : "Гость") + '</p>' +
      '<p><b>Группа:</b> ' + (window.state.student ? window.escapeHtml(window.state.student.group) : "—") + '</p>' +
      '<p><b>XP:</b> ' + window.state.xp + ' (Уровень ' + window.getLevel(window.state.xp) + ')</p>' +
    '</div>';
};

// --- РЕНДЕРИНГ: ПРОСТАЯ СТРАНИЦА (видео, паспорта, ОТ, оформление) ---
window.renderSimplePage = function(title, items, icon) {
  var app = window.$("app");
  if (!app) return;
  var list = "";
  (items || []).forEach(function(s) {
    var text = (s && typeof s === "object") ? (s.title || "") : String(s || "");
    if (!text) return;
    list += '<div style="padding:10px 0; border-bottom:1px solid var(--border);"><b>' +
            window.escapeHtml(text) + '</b></div>';
  });
  app.innerHTML =
    '<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>' +
    '<section class="hero"><h1>' + (icon || "") + ' ' + window.escapeHtml(title) + '</h1></section>' +
    '<div class="module">' + (list || "Нет данных") + '</div>';
};

// --- РОУТЕР ---
window.route = function() {
  window.closeDrawer();
  var hash = location.hash.replace(/^#/, "") || "/";
  var parts = hash.split("/").filter(Boolean);
  var app = window.$("app");
  if (!app) return;

  if (!window.state.student && !window.state.staff) {
    var ov = window.$("loginOverlay");
    if (ov) ov.style.display = "flex";
    app.innerHTML = "<div class='module' style='text-align:center;'><h2>Войдите в систему</h2></div>";
    return;
  }

  try {
    var page = parts[0] || "/";
    if (page === "topic") {
      window.renderTopic(parts[1], parts[2]);
    } else if (page === "profile") {
      window.renderProfilePage();
    } else if (page === "videos") {
      window.renderSimplePage("Видео", window.COURSE.videos, "🎬");
    } else if (page === "passports") {
      window.renderSimplePage("Паспорта", window.COURSE.passports, "📄");
    } else if (page === "safety") {
      window.renderSimplePage("Охрана труда", window.COURSE.safety, "🦺");
    } else if (page === "formatting") {
      var fmt = window.COURSE.formatting;
      var items = (fmt && fmt.title) ? [{ title: fmt.title }] : [];
      window.renderSimplePage("Оформление", items, "📝");
    } else if (page === "links" && window.renderLinksPage) {
      window.renderLinksPage();
    } else if (page === "training" && window.renderTrainingPage) {
      window.renderTrainingPage(parts[1]);
    } else if (page === "final" && window.renderFinalPage) {
      window.renderFinalPage(parts[1]);
    } else if (page === "arcade" && window.renderArcadePage) {
      window.renderArcadePage();
    } else if (page === "rating" && window.renderRatingPage) {
      window.renderRatingPage();
    } else if (page === "journal" && window.renderJournalPage) {
      window.renderJournalPage();
    } else if (page === "schedule" && window.renderSchedulePage) {
      window.renderSchedulePage();
    } else {
      renderHome();
    }
  } catch (err) {
    app.innerHTML = '<div class="module">Ошибка: ' + window.escapeHtml(err.message) + '</div>';
    if (window.console) console.error(err);
  }
  window.scrollTo(0, 0);
};

// --- ИНИЦИАЛИЗАЦИЯ ---
window.addEventListener("DOMContentLoaded", function() {
  if (!window.state.student && !window.state.staff) {
    var ov = window.$("loginOverlay");
    if (ov) ov.style.display = "flex";
  }
  if (window.state.student) window.loadStudentData();
  if (window.state.staff) window.updateXpDisplay();

  if (window.$("btnLoginStudent")) window.$("btnLoginStudent").onclick = window.doStudentLogin;
  if (window.$("btnLoginTeacher")) window.$("btnLoginTeacher").onclick = window.doTeacherLogin;

  if (window.$("themeToggle")) {
    window.$("themeToggle").onclick = function() {
      var cur = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      window.applyTheme(cur);
    };
  }
  if (window.$("burgerBtn")) {
    window.$("burgerBtn").onclick = function() {
      var d = window.$("drawer");
      var o = window.$("drawerOverlay");
      if (d) d.classList.toggle("open");
      if (o) o.classList.toggle("open");
    };
  }
  if (window.$("drawerClose")) window.$("drawerClose").onclick = window.closeDrawer;
  if (window.$("drawerOverlay")) window.$("drawerOverlay").onclick = window.closeDrawer;

  if (window.$("mdkSelector")) {
    window.$("mdkSelector").value = window.state.activeCourseId;
    window.$("mdkSelector").onchange = function(e) {
      window.switchCourse(e.target.value);
    };
  }

  document.querySelectorAll("[data-go]").forEach(function(item) {
    item.onclick = function(e) {
      e.preventDefault();
      location.hash = item.getAttribute("data-go");
      window.closeDrawer();
    };
  });

  window.renderUserCard = window.renderUserChip;
  window.renderUserChip();
  window.route();
});

window.addEventListener("hashchange", window.route);