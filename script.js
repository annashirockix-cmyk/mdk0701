/* ============================================================
   МДК 07.01 — script.js
   Ядро: темы, видео, аватары, авторизация студента, смена роли,
   облако, страницы тем, тесты, отчёты, роутер.
   ============================================================ */

"use strict";

var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzB0v37m5pC0jSnEmCEllIlN3IlRmgOhaPEW9giHbS6wNIYFHClxJv8Z5HyG4-AJBpdaQ/exec";

var DEFAULT_AVATAR      = "👨‍🎓";
var ACTIVITY_MAX        = 100;
var ONLINE_TIMEOUT_SEC  = 90;
var TEST_TIME_LIMIT_SEC = 15 * 60;

var AVATARS = [
  "👨‍🎓","👩‍🎓","🧑‍🎓","👨‍🔧","👩‍🔧","🧑‍🔧",
  "👷","👨‍🏭","👩‍🏭","🧑‍🏭","🦾","🤖",
  "⚙️","🔧","🛠️","🔩","🧰","📐",
  "📏","✈️","🚀","🛰️","⚡","🔥",
  "💡","🎓","🏆","🎯","🧠","🧑‍💻"
];

var THEMES = [
  { id:"light",    name:"Светлая",  colors:["#f5f2ec","#ffffff","#c14a2a","#4a4a4a"] },
  { id:"dark",     name:"Тёмная",   colors:["#0e0e10","#171719","#ff6b3d","#c8c5bd"] },
  { id:"sepia",    name:"Сепия",    colors:["#f4ecd8","#fbf5e6","#a0522d","#5c4a32"] },
  { id:"ocean",    name:"Океан",    colors:["#eef4f8","#ffffff","#1a6da8","#3c5361"] },
  { id:"forest",   name:"Лес",      colors:["#eef3ec","#ffffff","#3d7a3d","#3f5238"] },
  { id:"contrast", name:"Контраст", colors:["#ffffff","#f5f5f5","#0033cc","#000000"] }
];

var QUOTES = [
  "Точность — вежливость королей.",
  "Семь раз отмерь — один раз отрежь.",
  "Практика без теории слепа, теория без практики мертва.",
  "Станок не прощает спешки.",
  "Стружка — это металл, который вы потеряли.",
  "Качество не бывает случайным.",
  "Ошибка в кадре стоит часа работы.",
  "Знание G-кода открывает любые станки."
];

var ROLE_LABELS = {
  student: "🎓 Студент",
  admin:   "🛡 Администратор",
  teacher: "👨‍🏫 Преподаватель",
  curator: "🎓 Куратор группы",
  tester:  "🧪 Тестировщик"
};

/* ---------- Состояние ---------- */
var state = {
  student: null,
  staff:   null,
  progress:    {},
  results:     {},
  selfResults: {},
  activity:    [],
  lastSync:    ""
};

try {
  var _s = JSON.parse(localStorage.getItem("mdk0701.student") || "null");
  if (_s && _s.name && _s.group) state.student = _s;
} catch (e){}

try {
  var _st = JSON.parse(sessionStorage.getItem("mdk0701.staff") || "null");
  if (_st && _st.role) state.staff = _st;
} catch (e){}

/* ============================================================
   Доступ к COURSE
   ============================================================ */
function getCourse(){
  try { if (typeof COURSE !== "undefined" && COURSE && COURSE.sections) return COURSE; } catch (e){}
  try { if (typeof window !== "undefined" && window.COURSE && window.COURSE.sections) return window.COURSE; } catch (e){}
  return null;
}

/* ============================================================
   Утилиты
   ============================================================ */
function $(id){ return document.getElementById(id); }

function el(html){
  var t = document.createElement("template");
  t.innerHTML = String(html).trim();
  return t.content.firstChild;
}

function escapeHtml(s){
  return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
    if (c === "&") return "&amp;";
    if (c === "<") return "&lt;";
    if (c === ">") return "&gt;";
    if (c === '"') return "&quot;";
    if (c === "'") return "&#39;";
    return c;
  });
}

function findTopic(id){
  var c = getCourse();
  if (!c || !c.sections) return null;
  for (var i = 0; i < c.sections.length; i++){
    var s = c.sections[i];
    if (!s.topics) continue;
    for (var j = 0; j < s.topics.length; j++){
      if (s.topics[j].id === id) return { section: s, topic: s.topics[j] };
    }
  }
  return null;
}

function studentKey(s){
  s = s || state.student;
  if (!s || !s.name || !s.group) return null;
  return (s.name.trim().toLowerCase() + "|" + s.group.trim().toLowerCase());
}

function getAvatar(){
  return (state.student && state.student.avatar) || DEFAULT_AVATAR;
}

function shuffled(a){
  var r = a.slice();
  for (var i = r.length - 1; i > 0; i--){
    var j = Math.floor(Math.random() * (i + 1));
    var t = r[i]; r[i] = r[j]; r[j] = t;
  }
  return r;
}

function quoteOfDay(){
  return QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length];
}

function fmtDate(d){
  return new Date(d).toLocaleString("ru-RU", {
    day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit"
  });
}

function fmtRel(iso){
  var d = new Date(iso), diff = (Date.now() - d) / 1000;
  if (diff < 60) return "только что";
  if (diff < 3600) return Math.floor(diff / 60) + " мин назад";
  if (diff < 86400) return Math.floor(diff / 3600) + " ч назад";
  if (diff < 86400 * 7) return Math.floor(diff / 86400) + " дн назад";
  return d.toLocaleDateString("ru-RU");
}

function setSyncStatus(text){
  var n = $("syncStatus");
  if (!n) return;
  n.textContent = text;
  n.className = "sync-status";
  setTimeout(function(){ if (n.textContent === text) n.textContent = ""; }, 3000);
}

/* ============================================================
   Хранилище
   ============================================================ */
function loadStudentData(){
  var k = studentKey();
  if (!k){
    state.progress = {}; state.results = {}; state.selfResults = {}; state.activity = [];
    return;
  }
  var ek = encodeURIComponent(k);
  state.progress    = JSON.parse(localStorage.getItem("mdk0701.progress."    + ek) || "{}");
  state.results     = JSON.parse(localStorage.getItem("mdk0701.results."     + ek) || "{}");
  state.selfResults = JSON.parse(localStorage.getItem("mdk0701.selfResults." + ek) || "{}");
  state.activity    = JSON.parse(localStorage.getItem("mdk0701.activity."    + ek) || "[]");
  state.lastSync    = localStorage.getItem("mdk0701.lastSync." + ek) || "";
}
function saveStudentData(){
  var k = studentKey(); if (!k) return;
  var ek = encodeURIComponent(k);
  localStorage.setItem("mdk0701.progress."    + ek, JSON.stringify(state.progress));
  localStorage.setItem("mdk0701.results."     + ek, JSON.stringify(state.results));
  localStorage.setItem("mdk0701.selfResults." + ek, JSON.stringify(state.selfResults));
  localStorage.setItem("mdk0701.activity."    + ek, JSON.stringify(state.activity));
  if (state.lastSync) localStorage.setItem("mdk0701.lastSync." + ek, state.lastSync);
}
function saveStudent(){
  if (state.student) localStorage.setItem("mdk0701.student", JSON.stringify(state.student));
  else localStorage.removeItem("mdk0701.student");
}
function saveStaffSession(){
  if (state.staff) sessionStorage.setItem("mdk0701.staff", JSON.stringify(state.staff));
  else sessionStorage.removeItem("mdk0701.staff");
}

function logActivity(type, text){
  state.activity = state.activity || [];
  state.activity.push({ type: type, text: text, date: new Date().toISOString() });
  if (state.activity.length > ACTIVITY_MAX) state.activity = state.activity.slice(-ACTIVITY_MAX);
  saveStudentData();
}

function saveProgress(){ saveStudentData(); scheduleCloudSave(); }
function saveResults(){ saveStudentData(); scheduleCloudSave(); }
function saveSelfResults(){ saveStudentData(); scheduleCloudSave(); }

/* ============================================================
   Облако
   ============================================================ */
var cloudTimer = null;
var cloudBusy = false;

function scheduleCloudSave(){
  if (cloudTimer) clearTimeout(cloudTimer);
  cloudTimer = setTimeout(function(){ cloudSave(true); }, 3000);
}

function cloudSave(silent){
  if (!state.student || cloudBusy || !APPS_SCRIPT_URL) return Promise.resolve(false);
  if (!navigator.onLine) return Promise.resolve(false);
  cloudBusy = true;
  if (!silent) setSyncStatus("Отправляем…");

  var params = new URLSearchParams();
  params.append("action", "save");
  params.append("key",    studentKey());
  params.append("name",   state.student.name);
  params.append("group",  state.student.group);
  params.append("payload", JSON.stringify({
    avatar: state.student.avatar || DEFAULT_AVATAR,
    progress: state.progress,
    results: state.results,
    selfResults: state.selfResults
  }));

  return fetch(APPS_SCRIPT_URL, { method:"POST", body: params })
    .then(function(res){ return res.json(); })
    .then(function(data){
      if (data && data.ok){
        state.lastSync = data.savedAt || new Date().toISOString();
        var k = studentKey();
        if (k) localStorage.setItem("mdk0701.lastSync." + encodeURIComponent(k), state.lastSync);
        if (!silent) setSyncStatus("✔ Синхронизировано");
        cloudBusy = false;
        return true;
      }
      cloudBusy = false;
      return false;
    })
    .catch(function(){ cloudBusy = false; return false; });
}

function cloudLoad(){
  if (!state.student || !APPS_SCRIPT_URL) return Promise.resolve(null);
  var params = new URLSearchParams();
  params.append("action", "load");
  params.append("key",    studentKey());
  return fetch(APPS_SCRIPT_URL + "?" + params.toString())
    .then(function(res){ return res.json(); })
    .then(function(data){
      if (data && data.ok && data.payload){
        return { payload: JSON.parse(data.payload), savedAt: data.savedAt || "" };
      }
      return null;
    })
    .catch(function(){ return null; });
}

function applyCloudPayload(p){
  state.progress    = p.progress    || {};
  state.results     = p.results     || {};
  state.selfResults = p.selfResults || {};
}

/* ============================================================
   Тема оформления
   ============================================================ */
function applyTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("mdk0701.theme", theme);
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta){
    var map = {
      light:"#c14a2a", dark:"#0e0e10", sepia:"#a0522d",
      ocean:"#1a6da8", forest:"#3d7a3d", contrast:"#0033cc"
    };
    meta.setAttribute("content", map[theme] || "#c14a2a");
  }
}

function initTheme(){
  var saved = localStorage.getItem("mdk0701.theme");
  if (saved && THEMES.some(function(t){ return t.id === saved; })) applyTheme(saved);
  var btn = $("themeToggle");
  if (btn) btn.addEventListener("click", openThemeModal);
}

function openThemeModal(){
  document.querySelectorAll(".theme-overlay").forEach(function(x){ x.remove(); });
  var current = document.documentElement.getAttribute("data-theme") || "light";

  var modal = el(
    '<div class="theme-overlay">' +
      '<div class="theme-modal">' +
        '<h3>Цветовая тема</h3>' +
        '<p class="theme-sub">Выберите оформление — оно сохранится на этом устройстве.</p>' +
        '<div class="theme-grid"></div>' +
        '<div class="theme-actions"><button class="btn ghost" id="themeClose">Закрыть</button></div>' +
      '</div>' +
    '</div>'
  );

  var grid = modal.querySelector(".theme-grid");
  THEMES.forEach(function(t){
    var selectedClass = (t.id === current) ? "selected" : "";
    var card = el(
      '<button type="button" class="theme-card ' + selectedClass + '">' +
        '<div class="theme-preview">' +
          '<span style="background:' + t.colors[0] + '"></span>' +
          '<span style="background:' + t.colors[1] + '"></span>' +
          '<span style="background:' + t.colors[2] + '"></span>' +
          '<span style="background:' + t.colors[3] + '"></span>' +
        '</div>' +
        '<div class="theme-name"><span>' + t.name + '</span><span class="check">✓</span></div>' +
      '</button>'
    );
    card.addEventListener("click", function(){
      grid.querySelectorAll(".theme-card").forEach(function(x){ x.classList.remove("selected"); });
      card.classList.add("selected");
      applyTheme(t.id);
    });
    grid.appendChild(card);
  });

  document.body.appendChild(modal);
  modal.querySelector("#themeClose").addEventListener("click", function(){ modal.remove(); });
  modal.addEventListener("click", function(e){ if (e.target === modal) modal.remove(); });
}

/* ============================================================
   Аватары
   ============================================================ */
function buildAvatarPicker(selected, onPick){
  var wrap = el('<div class="avatar-picker-inline"></div>');
  AVATARS.forEach(function(a){
    var selectedClass = (a === selected) ? "selected" : "";
    var b = el('<button type="button" class="avatar-option ' + selectedClass + '">' + a + '</button>');
    b.addEventListener("click", function(){
      wrap.querySelectorAll(".avatar-option").forEach(function(x){ x.classList.remove("selected"); });
      b.classList.add("selected");
      if (onPick) onPick(a);
    });
    wrap.appendChild(b);
  });
  return wrap;
}

/* ============================================================
   Валидация
   ============================================================ */
function normalizeName(v){
  return v.trim().split(/\s+/).map(function(p){
    return p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : "";
  }).filter(Boolean).slice(0, 3).join(" ");
}
function validateName(v){
  var parts = v.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { ok:false, msg:"Введите минимум фамилию и имя" };
  for (var i = 0; i < parts.length; i++) if (parts[i].length < 2) return { ok:false, msg:"Слишком короткое слово" };
  return { ok:true, msg:"Похоже на ФИО", normalized: normalizeName(v) };
}
function validateGroup(v){
  var t = v.trim().toUpperCase();
  if (t.length < 2) return { ok:false, msg:"Слишком короткая группа" };
  return { ok:true, msg:"", normalized: t };
}

/* ============================================================
   Авторизация студента
   ============================================================ */
function initAuth(){
  var overlay    = $("loginOverlay");
  var nameInput  = $("loginName");
  var groupInput = $("loginGroup");
  var nameHint   = $("nameHint");
  var groupHint  = $("groupHint");
  var btn        = $("loginBtn");
  var staffLink  = $("loginStaffLink");

  var loginAvatar = DEFAULT_AVATAR;
  var picker = $("loginAvatarPicker");
  if (picker) picker.appendChild(buildAvatarPicker(loginAvatar, function(a){ loginAvatar = a; }));

  function showLogin(){
    if (!overlay) return;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    if (nameInput) setTimeout(function(){ nameInput.focus(); }, 50);
  }
  function hideLogin(){
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  if (!state.student && !state.staff) showLogin();
  else hideLogin();

  if (state.student){
    loadStudentData();
    cloudLoad().then(function(cloud){
      if (cloud && cloud.savedAt && cloud.savedAt > (state.lastSync || "")){
        if (cloud.payload.avatar && !state.student.avatar){
          state.student.avatar = cloud.payload.avatar;
          saveStudent();
        }
        applyCloudPayload(cloud.payload);
        state.lastSync = cloud.savedAt;
        saveStudentData();
        route();
      }
    });
  }

  if (nameInput) nameInput.addEventListener("input", function(){
    var r = validateName(nameInput.value);
    if (!nameHint) return;
    nameHint.textContent = !nameInput.value.trim() ? "" : (r.ok ? "✔ " + r.msg : "✘ " + r.msg);
    nameHint.className = "field-hint " + (r.ok ? "ok" : "bad");
  });

  if (groupInput) groupInput.addEventListener("input", function(){
    var r = validateGroup(groupInput.value);
    if (!groupHint) return;
    groupHint.textContent = !groupInput.value.trim() ? "" : (r.ok ? "✔ ОК" : "✘ " + r.msg);
    groupHint.className = "field-hint " + (r.ok ? "ok" : "bad");
  });

  if (btn) btn.addEventListener("click", function(){
    var rn = validateName(nameInput.value);
    var rg = validateGroup(groupInput.value);
    if (!rn.ok){ nameInput.focus(); return; }
    if (!rg.ok){ groupInput.focus(); return; }

    if (state.staff){
      state.staff = null;
      saveStaffSession();
    }

    if (state.student) saveStudentData();
    state.student = {
      name: rn.normalized,
      group: rg.normalized,
      avatar: loginAvatar,
      loginAt: new Date().toISOString()
    };
    saveStudent();
    loadStudentData();
    hideLogin();
    renderUserChip();

    cloudLoad().then(function(cloud){
      if (cloud && cloud.savedAt && cloud.savedAt > (state.lastSync || "")){
        if (cloud.payload.avatar){
          state.student.avatar = cloud.payload.avatar;
          saveStudent();
          renderUserChip();
        }
        applyCloudPayload(cloud.payload);
        state.lastSync = cloud.savedAt;
        saveStudentData();
      }
      logActivity("login", "Вход в систему");
      route();
    });
  });

  if (nameInput)  nameInput.addEventListener("keydown",  function(e){ if (e.key === "Enter") btn.click(); });
  if (groupInput) groupInput.addEventListener("keydown", function(e){ if (e.key === "Enter") btn.click(); });

  if (staffLink){
    staffLink.addEventListener("click", function(e){
      e.preventDefault();
      openRoleModal();
    });
  }

  var chip = $("userChip");
  if (chip) chip.addEventListener("click", openUserMenu);

  var roleBtn = $("roleBtn");
  if (roleBtn) roleBtn.addEventListener("click", openRoleModal);
}

/* ============================================================
   Смена роли
   ============================================================ */
function openRoleModal(){
  document.querySelectorAll(".avatar-overlay").forEach(function(x){ x.remove(); });

  var currentRole = state.staff ? state.staff.role : (state.student ? "student" : "none");

  var modal = el(
    '<div class="avatar-overlay" id="roleModal">' +
      '<div class="avatar-modal" style="max-width:520px">' +
        '<h3>Выбор роли</h3>' +
        '<p class="avatar-sub">Студент входит по ФИО и группе. Служебные роли — по логину и паролю.</p>' +
        '<div class="role-list" style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">' +
          Object.keys(ROLE_LABELS).map(function(r){
            var active = (r === currentRole) ? 'style="border-color:var(--accent);color:var(--accent)"' : '';
            var extra  = (r === currentRole) ? " · текущая" : "";
            return '<button class="btn ghost role-pick" data-role="' + r + '" ' + active + '>' +
                     ROLE_LABELS[r] + extra +
                   '</button>';
          }).join("") +
        '</div>' +
        '<div id="roleForm"></div>' +
        '<div class="avatar-modal-actions" style="margin-top:14px">' +
          '<button class="btn ghost" id="roleCancel">Закрыть</button>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
  document.body.appendChild(modal);

  var formBox = modal.querySelector("#roleForm");
  modal.querySelector("#roleCancel").addEventListener("click", function(){ modal.remove(); });
  modal.addEventListener("click", function(e){ if (e.target === modal) modal.remove(); });

  function renderStudentForm(){
    formBox.innerHTML = "";
    var html =
      '<div>' +
        '<p class="sub">Студент входит без пароля. Введите ФИО и группу.</p>' +
        '<div class="test-actions" style="margin-top:10px">' +
          '<button class="btn" id="switchToStudent">Перейти к вводу ФИО</button>' +
        '</div>';
    if (state.student){
      html += '<p class="sub" style="margin-top:10px">Сейчас активен: <b>' +
              escapeHtml(state.student.name) + '</b>, гр. ' +
              escapeHtml(state.student.group) + '</p>';
    }
    html += '</div>';
    var block = el(html);
    formBox.appendChild(block);
    block.querySelector("#switchToStudent").addEventListener("click", function(){
      modal.remove();
      state.staff = null;
      saveStaffSession();
      var ov = $("loginOverlay");
      if (ov) ov.hidden = false;
      document.body.style.overflow = "hidden";
      var li = $("loginName");
      if (li) setTimeout(function(){ li.focus(); }, 60);
    });
  }

  function renderStaffForm(role){
    formBox.innerHTML = "";
    var html =
      '<form>' +
        '<p class="sub">Введите логин и пароль для роли «' + ROLE_LABELS[role] + '».</p>' +
        '<label style="font-size:12px;color:var(--muted);letter-spacing:.06em;text-transform:uppercase">Логин</label>' +
        '<input type="text" id="roleUser" autocomplete="username" required ' +
          'style="width:100%;padding:12px 14px;border:1px solid var(--border);border-radius:10px;' +
          'background:var(--card-soft);color:var(--text);font:inherit;margin:6px 0 12px">' +
        '<label style="font-size:12px;color:var(--muted);letter-spacing:.06em;text-transform:uppercase">Пароль</label>' +
        '<input type="password" id="rolePass" autocomplete="current-password" required ' +
          'style="width:100%;padding:12px 14px;border:1px solid var(--border);border-radius:10px;' +
          'background:var(--card-soft);color:var(--text);font:inherit;margin:6px 0 0">' +
        '<div class="test-actions" style="margin-top:14px">' +
          '<button type="submit" class="btn">Войти</button>' +
          (state.staff ? '<button type="button" class="btn ghost" id="roleLogout">Выйти из служебной роли</button>' : '') +
        '</div>' +
        '<div class="comment-status" id="roleStatus" style="margin-top:10px"></div>' +
      '</form>';
    var form = el(html);
    formBox.appendChild(form);

    form.addEventListener("submit", function(e){
      e.preventDefault();
      var u = form.querySelector("#roleUser").value.trim().toLowerCase();
      var p = form.querySelector("#rolePass").value;
      var st = form.querySelector("#roleStatus");
      if (!u || !p){ st.textContent = "Заполните оба поля."; st.className = "comment-status bad"; return; }
      st.textContent = "Проверяем…"; st.className = "comment-status";

      var url = APPS_SCRIPT_URL + "?action=login&username=" + encodeURIComponent(u) + "&password=" + encodeURIComponent(p);
      fetch(url)
        .then(function(res){ return res.json(); })
        .then(function(d){
          if (d && d.ok){
            state.staff = { username: u, role: d.role, name: d.name, group: d.group || "" };
            saveStaffSession();
            st.textContent = "✔ " + d.name + " · роль: " + d.role;
            st.className = "comment-status ok";
            modal.remove();
            var ov = $("loginOverlay");
            if (ov) ov.hidden = true;
            document.body.style.overflow = "";
            renderUserChip();
            route();
          } else {
            st.textContent = "✘ " + ((d && d.error) || "Не удалось войти");
            st.className = "comment-status bad";
          }
        })
        .catch(function(){
          st.textContent = "Нет связи с сервером";
          st.className = "comment-status bad";
        });
    });

    var logout = form.querySelector("#roleLogout");
    if (logout) logout.addEventListener("click", function(){
      state.staff = null;
      saveStaffSession();
      modal.remove();
      renderUserChip();
      route();
    });
  }

  modal.querySelectorAll(".role-pick").forEach(function(b){
    b.addEventListener("click", function(){
      modal.querySelectorAll(".role-pick").forEach(function(x){ x.style.borderColor = ""; });
      b.style.borderColor = "var(--accent)";
      var role = b.dataset.role;
      if (role === "student") renderStudentForm();
      else renderStaffForm(role);
    });
  });

  if (currentRole === "student") renderStudentForm();
  else if (currentRole === "none") formBox.innerHTML = '<p class="sub">Выберите роль сверху.</p>';
  else renderStaffForm(currentRole);
}

/* ============================================================
   Чип и меню пользователя
   ============================================================ */
function renderUserChip(){
  var chip = $("userChip");
  if (!chip) return;
  if (state.staff){
    chip.hidden = false;
    $("userChipAvatar").textContent = "👤";
    $("userChipName").textContent = state.staff.name;
    $("userChipGroup").textContent = "[" + (state.staff.role || "staff") + "]";
    return;
  }
  if (state.student){
    chip.hidden = false;
    $("userChipAvatar").textContent = getAvatar();
    $("userChipName").textContent = state.student.name;
    $("userChipGroup").textContent = "Гр. " + state.student.group;
    return;
  }
  chip.hidden = true;
}

function openUserMenu(){
  document.querySelectorAll(".user-menu, .more-menu").forEach(function(m){ m.remove(); });
  var chip = $("userChip");
  if (!chip) return;
  var rect = chip.getBoundingClientRect();

  var isStaff = !!state.staff;
  var headerInfo = "";
  if (isStaff){
    headerInfo =
      '<div class="user-menu-name">' + escapeHtml(state.staff.name) + '</div>' +
      '<div class="user-menu-group">Роль: ' + escapeHtml(state.staff.role) +
      (state.staff.group ? " · " + escapeHtml(state.staff.group) : "") + '</div>';
  } else {
    headerInfo =
      '<div class="user-menu-name">' + escapeHtml(state.student ? state.student.name : "—") + '</div>' +
      '<div class="user-menu-group">Группа ' + escapeHtml(state.student ? state.student.group : "—") + '</div>';
  }

  var avatar = isStaff ? "👤" : getAvatar();

  var html =
    '<div class="user-menu">' +
      '<div class="user-menu-head">' +
        '<span class="user-menu-avatar">' + avatar + '</span>' +
        '<div class="user-menu-headtext">' + headerInfo + '</div>' +
      '</div>' +
      '<button class="user-menu-item" data-act="role">🎭 Сменить роль</button>' +
      '<button class="user-menu-item" data-act="theme">🌈 Сменить тему</button>';

  if (!isStaff){
    html +=
      '<button class="user-menu-item" data-act="dashboard">📊 Статистика</button>' +
      '<button class="user-menu-item" data-act="sync">☁ Синхронизировать</button>';
  } else {
    html += '<button class="user-menu-item" data-act="staffcab">🛠 Открыть кабинет</button>';
  }
  html += '<button class="user-menu-item danger" data-act="logout">🚪 Выйти</button></div>';

  var menu = el(html);
  document.body.appendChild(menu);
  menu.style.position = "fixed";
  menu.style.top = (rect.bottom + 8) + "px";
  menu.style.right = Math.max(8, window.innerWidth - rect.right) + "px";

  function close(e){
    if (!menu.contains(e.target) && e.target !== chip){
      menu.remove();
      document.removeEventListener("click", close);
    }
  }
  setTimeout(function(){ document.addEventListener("click", close); }, 0);

  menu.querySelector('[data-act="role"]').addEventListener("click", function(){ menu.remove(); openRoleModal(); });
  menu.querySelector('[data-act="theme"]').addEventListener("click", function(){ menu.remove(); openThemeModal(); });

  var dash = menu.querySelector('[data-act="dashboard"]');
  if (dash) dash.addEventListener("click", function(){ menu.remove(); location.hash = "#/dashboard"; });

  var sync = menu.querySelector('[data-act="sync"]');
  if (sync) sync.addEventListener("click", function(){
    menu.remove();
    cloudSave(false).then(function(ok){ if (ok) alert("Прогресс отправлен в облако."); });
  });

  var cab = menu.querySelector('[data-act="staffcab"]');
  if (cab) cab.addEventListener("click", function(){ menu.remove(); location.hash = "#/staff"; });

  menu.querySelector('[data-act="logout"]').addEventListener("click", function(){
    menu.remove();
    if (state.staff){
      state.staff = null;
      saveStaffSession();
      renderUserChip();
      location.hash = "#/";
      route();
      return;
    }
    if (state.student){
      if (!confirm("Выйти из аккаунта студента? Прогресс останется сохранён.")) return;
      saveStudentData();
      state.student = null;
      saveStudent();
      renderUserChip();
      var ov = $("loginOverlay");
      if (ov) ov.hidden = false;
      document.body.style.overflow = "hidden";
      var li = $("loginName"); if (li) li.value = "";
      var lg = $("loginGroup"); if (lg) lg.value = "";
      if (li) setTimeout(function(){ li.focus(); }, 60);
      route();
    }
  });
}

/* ============================================================
   Главная
   ============================================================ */
function renderHome(){
  var app = $("app");
  if (!app) return;
  app.innerHTML = "";
  var crumbs = $("crumbs"); if (crumbs) crumbs.textContent = "";
  setActiveTopBtn("");

  var c = getCourse();
  if (!c || !c.sections){
    app.appendChild(el(
      '<section class="module">' +
        '<h2>Не удалось загрузить курс</h2>' +
        '<p>Файл <code>data.js</code> не подключён или содержит ошибку. Проверьте консоль браузера.</p>' +
      '</section>'
    ));
    return;
  }

  try {
    var heroHtml =
      '<section class="hero">' +
        '<div class="meta">' + escapeHtml(c.specialty || "") + ' · набор 2024</div>' +
        '<h1>' + escapeHtml(c.title || "МДК 07.01") + '</h1>' +
        '<p>' + escapeHtml(c.module || "") + '</p>';

    if (state.student){
      heroHtml +=
        '<div class="hello">' +
          '<span class="hello-avatar">' + getAvatar() + '</span>' +
          '<span>Вы вошли как <b>' + escapeHtml(state.student.name) + '</b>, группа <b>' +
          escapeHtml(state.student.group) + '</b>.<span class="sync-status" id="syncStatus"></span></span>' +
        '</div>';
    }

    if (state.staff){
      heroHtml +=
        '<div class="hello">' +
          '<span class="hello-avatar">👤</span>' +
          '<span>Служебный вход: <b>' + escapeHtml(state.staff.name) +
          '</b> · роль <b>' + escapeHtml(state.staff.role) + '</b>.</span>' +
        '</div>';
    }

    heroHtml += '<div class="hero-quote">' + quoteOfDay() + '</div></section>';
    app.appendChild(el(heroHtml));

    // ----- Быстрые ссылки -----
    app.appendChild(el('<div class="steps-title">Итоговые блоки</div>'));
    var finals = el('<div class="steps"></div>');
    [["🏋️","Итоговая тренировка","#/final-training"],
     ["🎓","Итоговый экзамен","#/final-exam"],
     ["📖","G- и M-коды","#/gcode-reference"],
     ["📚","Полезные материалы","#/links"],
     ["📊","Статистика","#/dashboard"]]
      .forEach(function(item){
        var card = el(
          '<div class="step" style="cursor:pointer">' +
            '<div class="num">' + item[0] + '</div>' +
            '<div class="name">' + item[1] + '</div>' +
          '</div>'
        );
        card.addEventListener("click", function(){ location.hash = item[2]; });
        finals.appendChild(card);
      });
    app.appendChild(finals);

    // ----- Как устроена тема -----
    app.appendChild(el('<div class="steps-title">Как устроена тема</div>'));
    var stepsWrap = el('<div class="steps"></div>');
    [["01","Паспорт часов"],["02","Лекция"],["03","Практические"],["04","Самостоятельная"],["05","Контроль темы"]]
      .forEach(function(pair){
        stepsWrap.appendChild(el(
          '<div class="step"><div class="num">' + pair[0] + '</div><div class="name">' + pair[1] + '</div></div>'
        ));
      });
    app.appendChild(stepsWrap);

    // ----- Темы -----
    c.sections.forEach(function(sec){
      app.appendChild(el(
        '<div class="steps-title">' + escapeHtml(sec.code) + ' · ' + escapeHtml(sec.title) +
        ' · ' + escapeHtml(sec.hours) + ' ак. ч</div>'
      ));
      var list = el('<div class="topics"></div>');
      (sec.topics || []).forEach(function(t){
        var done = (state.progress[t.id] && state.progress[t.id].done) || 0;
        var card = el(
          '<div class="topic">' +
            '<div class="t-code">' + escapeHtml(t.code) + '</div>' +
            '<div class="t-body">' +
              '<div class="t-title">' + escapeHtml(t.title) + '</div>' +
              '<div class="t-meta">' + t.hours.total + ' ак. ч / практ. ' + t.hours.practice + ' ак. ч</div>' +
            '</div>' +
            '<div class="t-hours">' + t.hours.total + '\\' + t.hours.practice + '</div>' +
            '<div class="t-progress">' + done + '/5</div>' +
          '</div>'
        );
        card.addEventListener("click", function(){ location.hash = "#/topic/" + t.id; });
        list.appendChild(card);
      });
      app.appendChild(list);
    });

    // ----- Паспорта станков -----
    if (c.passports && c.passports.length){
      app.appendChild(el('<div class="steps-title">Паспорта станков</div>'));
      var block = el(
        '<section class="module">' +
          '<h2>Паспорта станков</h2>' +
          '<p class="sub">PDF-файлы. Открываются прямо на странице.</p>' +
          '<div class="doc-grid"></div>' +
        '</section>'
      );
      var grid = block.querySelector(".doc-grid");
      c.passports.forEach(function(p){
        var card = el(
          '<div class="doc-card" role="button" tabindex="0">' +
            '<div class="doc-code">' + escapeHtml(p.code) + '</div>' +
            '<div class="doc-title">' + escapeHtml(p.title) + '</div>' +
            '<div class="doc-summary">' + escapeHtml(p.summary) + '</div>' +
            '<div class="doc-action">Открыть PDF →</div>' +
          '</div>'
        );
        card.addEventListener("click", function(){ openPdfModal(p.file, p.title); });
        grid.appendChild(card);
      });
      app.appendChild(block);
    }

    // ----- Охрана труда -----
    if (c.safety && c.safety.length){
      app.appendChild(el('<div class="steps-title">Охрана труда</div>'));
      var block2 = el(
        '<section class="module">' +
          '<h2>Инструкции по охране труда</h2>' +
          '<p class="sub">DOCX-файлы. Скачиваются на компьютер.</p>' +
          '<div class="doc-grid"></div>' +
        '</section>'
      );
      var grid2 = block2.querySelector(".doc-grid");
      c.safety.forEach(function(s){
        grid2.appendChild(el(
          '<a class="doc-card" href="' + s.file + '" download>' +
            '<div class="doc-code">' + escapeHtml(s.code) + '</div>' +
            '<div class="doc-title">' + escapeHtml(s.title) + '</div>' +
            '<div class="doc-summary">' + escapeHtml(s.summary) + '</div>' +
            '<div class="doc-action">Скачать .docx →</div>' +
          '</a>'
        ));
      });
      app.appendChild(block2);
    }

    // ----- ВИДЕО (из COURSE.videos) -----
    if (c.videos && c.videos.length){
      app.appendChild(el('<div class="steps-title">История робототехники СССР</div>'));
      var vidsBlock = el(
        '<section class="module">' +
          '<div class="meta">Модуль 4 · Видеоматериалы</div>' +
          '<h2>История робототехники СССР</h2>' +
          '<p class="sub">Видеоматериалы к разделу. Просмотр — прямо на странице.</p>' +
          '<div class="videos"></div>' +
        '</section>'
      );
      var vwrap = vidsBlock.querySelector(".videos");
      c.videos.forEach(function(v){
        vwrap.appendChild(el(
          '<div class="video-card">' +
            '<video controls preload="metadata">' +
              '<source src="' + v.src + '" type="video/mp4">' +
            '</video>' +
            '<div class="v-cap">' + escapeHtml(v.title) + '</div>' +
          '</div>'
        ));
      });
      app.appendChild(vidsBlock);
    }

    // ----- Комментарии -----
    if (window.renderCommentsBlock && state.student){
      app.appendChild(window.renderCommentsBlock());
    }
  } catch (err){
    console.error("renderHome error:", err);
    app.appendChild(el(
      '<section class="module">' +
        '<h2>Ошибка при отрисовке</h2>' +
        '<pre style="white-space:pre-wrap;color:var(--err)">' +
        escapeHtml(String(err && err.stack ? err.stack : err)) +
        '</pre>' +
      '</section>'
    ));
  }
}

/* ============================================================
   Страница темы
   ============================================================ */
function renderTopic(id, tab, mode){
  tab  = tab  || "passport";
  mode = mode || "control";
  var found = findTopic(id);
  if (!found) return renderHome();
  var section = found.section, topic = found.topic;

  var app = $("app");
  if (!app) return;
  app.innerHTML = "";
  var crumbs = $("crumbs");
  if (crumbs) crumbs.textContent = topic.code + " · " + topic.title;
  setActiveTopBtn("");

  app.appendChild(el(
    '<a class="backlink" href="#/" onclick="goHome(event)">← К программе</a>' +
    '<section class="topic-head">' +
      '<div class="crumb">ПМ.07 · ' + escapeHtml(topic.code) + ' · ' + escapeHtml(section.title) + '</div>' +
      '<h1>' + escapeHtml(topic.title) + '</h1>' +
      '<div class="meta">' + topic.hours.total + '\\' + topic.hours.practice +
      ' · ' + topic.hours.total + ' ак. ч / практ. ' + topic.hours.practice + ' ак. ч</div>' +
    '</section>'
  ));

  var tabs = [
    ["passport","01","Паспорт часов"],
    ["lecture","02","Лекция"],
    ["practice","03","Практические"],
    ["self","04","Самостоятельная"],
    ["test","05","Контроль темы"]
  ];
  var tw = el('<div class="tabs"></div>');
  tabs.forEach(function(item){
    var k = item[0], n = item[1], name = item[2];
    var active = (k === tab) ? "active" : "";
    var t = el(
      '<button class="tab ' + active + '">' +
        '<span class="t-num">' + n + '</span>' +
        '<span class="t-name">' + name + '</span>' +
      '</button>'
    );
    t.addEventListener("click", function(){ location.hash = "#/topic/" + id + "/" + k; });
    tw.appendChild(t);
  });
  app.appendChild(tw);

  var panel = el('<section class="panel"></section>');
  app.appendChild(panel);

  if (tab === "passport") renderPassport(panel, topic);
  if (tab === "lecture")  renderLecture(panel, topic);
  if (tab === "practice") renderPractice(panel, topic);
  if (tab === "self")     renderSelf(panel, topic);
  if (tab === "test")     renderTest(panel, topic, mode);

  markDone(topic.id, tab);
}

function markDone(topicId, tab){
  state.progress[topicId] = state.progress[topicId] || { done:0, tabs:{} };
  if (!state.progress[topicId].tabs[tab]){
    state.progress[topicId].tabs[tab] = true;
    state.progress[topicId].done = Object.keys(state.progress[topicId].tabs).length;
    saveProgress();
    var t = findTopic(topicId);
    if (t) logActivity("topic", "Тема " + t.topic.code + " — вкладка " + tab);
  }
}

function renderPassport(panel, t){
  var lecturesList = (t.lectures || []).map(function(l){
    return '<li><b>' + escapeHtml(l.code) + '</b> ' + escapeHtml(l.title) + '</li>';
  }).join("");
  var practicalsList = (t.practicals || []).map(function(p){
    return '<li><b>' + escapeHtml(p.code) + '</b> ' + escapeHtml(p.title) + '</li>';
  }).join("");

  panel.innerHTML =
    '<h2>Паспорт часов</h2>' +
    '<p>Тема <b>' + escapeHtml(t.code) + '</b> — ' + escapeHtml(t.title) + '.</p>' +
    '<div class="kpi-row">' +
      '<div class="kpi"><div class="k-label">Всего</div><div class="k-value">' + t.hours.total + ' ч</div></div>' +
      '<div class="kpi"><div class="k-label">Теория</div><div class="k-value">' + t.hours.theory + ' ч</div></div>' +
      '<div class="kpi"><div class="k-label">Практика</div><div class="k-value">' + t.hours.practice + ' ч</div></div>' +
    '</div>' +
    '<h3>Содержание по рабочей программе</h3>' +
    '<ul>' + lecturesList + '</ul>' +
    '<h3>Практические занятия</h3>' +
    '<ul>' + practicalsList + '</ul>';
}

function renderLecture(panel, t){
  panel.innerHTML = '<h2>Лекция</h2><p class="accent">Теория, схема, вопросы для самопроверки.</p>';
  (t.lectures || []).forEach(function(l){
    panel.appendChild(el('<h3>' + escapeHtml(l.code) + '. ' + escapeHtml(l.title) + '</h3>'));
    panel.appendChild(el('<div>' + (l.content || '<p><i>Материал готовится.</i></p>') + '</div>'));
  });
}

function renderPractice(panel, t){
  panel.innerHTML = '<h2>Практические работы</h2><p class="accent">' + t.hours.practice + ' ч практической подготовки.</p>';
  (t.practicals || []).forEach(function(p){
    var html =
      '<div class="practice">' +
        '<div class="p-code">' + escapeHtml(p.code) + '</div>' +
        '<div class="p-title">' + escapeHtml(p.title) + '</div>';

    if (p.goal)    html += '<div class="p-goal">Цель: ' + escapeHtml(p.goal) + '</div>';
    if (p.task)    html += '<div class="p-task"><b>Задание:</b> ' + escapeHtml(p.task) + '</div>';
    if (p.example) html += '<div class="p-example"><b>Пример:</b> ' + escapeHtml(p.example) + '</div>';

    if (p.solution && p.solution.length){
      html += '<div class="p-solution"><h4>Ход решения по этапам</h4><ol>';
      p.solution.forEach(function(s){ html += '<li>' + s + '</li>'; });
      html += '</ol></div>';
    }

    html +=
      '<div class="test-actions">' +
        '<button class="btn ghost work-upload-btn">📎 Прикрепить работу</button>' +
      '</div>';

    html += '</div>';

    var box = el(html);
    box.querySelector(".work-upload-btn").addEventListener("click", function(){
      if (window.openUploadModal) window.openUploadModal(t.id, p.code, p.title);
    });

    if (p.variants && p.variants.rows && p.variants.rows.length){
      var v = el(
        '<div class="variants">' +
          '<div class="v-title">Варианты (1–' + p.variants.rows.length + ')</div>' +
          '<div class="v-scroll"></div>' +
        '</div>'
      );
      var tbl = el('<table class="v-table"></table>');
      if (p.variants.header){
        var th = el('<thead><tr></tr></thead>');
        p.variants.header.forEach(function(h){
          th.firstChild.appendChild(el('<th>' + escapeHtml(h) + '</th>'));
        });
        tbl.appendChild(th);
      }
      var tb = el('<tbody></tbody>');
      p.variants.rows.forEach(function(row){
        var tr = el('<tr></tr>');
        row.forEach(function(c){ tr.appendChild(el('<td>' + escapeHtml(c) + '</td>')); });
        tb.appendChild(tr);
      });
      tbl.appendChild(tb);
      v.querySelector(".v-scroll").appendChild(tbl);
      box.appendChild(v);
    }
    panel.appendChild(box);
  });
}

function renderSelf(panel, t){
  panel.innerHTML =
    '<h2>Самостоятельная работа</h2>' +
    '<p>Закрепление материала темы <b>' + escapeHtml(t.code) + '</b> «' + escapeHtml(t.title) + '».</p>' +
    '<p class="accent">Введите ответ. Регистр и лишние пробелы не важны.</p>';

  var tasks = (t.selfChecks && t.selfChecks.length)
    ? t.selfChecks
    : [{ q:"Как называется главное движение при точении?", a:"вращение заготовки", accept:["вращение детали"] }];

  var form = el('<form></form>');
  tasks.forEach(function(task, i){
    var block = el(
      '<div class="question self-q">' +
        '<div class="q-text">' + (i+1) + '. ' + escapeHtml(task.q) + '</div>' +
        '<div class="self-row">' +
          '<input type="text" class="self-input" placeholder="Ваш ответ">' +
          '<button type="button" class="btn ghost self-check">Проверить</button>' +
        '</div>' +
        '<div class="self-feedback"></div>' +
      '</div>'
    );
    var inp = block.querySelector(".self-input");
    var btn = block.querySelector(".self-check");
    var fb  = block.querySelector(".self-feedback");
    btn.addEventListener("click", function(){
      var ua = (inp.value || "").trim().toLowerCase();
      var correct = task.a.trim().toLowerCase();
      var accepted = Array.isArray(task.accept) ? task.accept.map(function(x){ return x.trim().toLowerCase(); }) : [];
      var ok = (ua === correct) || (accepted.indexOf(ua) !== -1);
      fb.textContent = ok ? "✔ Верно" : ("✘ Неверно. Правильный ответ: " + task.a);
      fb.className = "self-feedback " + (ok ? "ok" : "bad");
    });
    inp.addEventListener("keydown", function(e){ if (e.key === "Enter"){ e.preventDefault(); btn.click(); } });
    form.appendChild(block);
  });

  var result = el('<div class="test-result"></div>');
  var actions = el(
    '<div class="test-actions">' +
      '<button type="button" class="btn" id="selfCount">Подвести итог</button>' +
      '<button type="button" class="btn ghost" id="selfReset">Сбросить</button>' +
    '</div>'
  );
  form.appendChild(actions);
  form.appendChild(result);

  form.querySelector("#selfCount").addEventListener("click", function(){
    var ok = 0;
    form.querySelectorAll(".self-q").forEach(function(q){
      if (q.querySelector(".self-feedback").classList.contains("ok")) ok++;
    });
    var total = tasks.length;
    var pct = Math.round(ok / total * 100);
    var g = pct >= 90 ? 5 : pct >= 75 ? 4 : pct >= 60 ? 3 : 2;
    result.textContent = "Верных: " + ok + " из " + total + " (" + pct + "%). Оценка: " + g + ".";
    result.className = "test-result " + (g >= 3 ? "ok" : "bad");
    state.selfResults[t.id] = { ok: ok, total: total, pct: pct, grade: g, date: new Date().toISOString() };
    saveSelfResults();
    logActivity("self", "Сам. работа " + t.code + ": " + ok + "/" + total);
    if (g === 5 && window.celebrate) window.celebrate();
  });

  form.querySelector("#selfReset").addEventListener("click", function(){
    form.querySelectorAll(".self-input").forEach(function(i){ i.value = ""; });
    form.querySelectorAll(".self-feedback").forEach(function(f){ f.textContent = ""; f.className = "self-feedback"; });
    result.textContent = ""; result.className = "test-result";
  });

  panel.appendChild(form);
}

/* ============================================================
   Тесты по теме
   ============================================================ */
var testTimerId = null;

function clearTestTimer(){
  if (testTimerId){ clearInterval(testTimerId); testTimerId = null; }
}

function startTestTimer(sec, display, onEnd){
  clearTestTimer();
  var r = sec;
  function tick(){
    var m = Math.floor(r / 60), s = r % 60;
    display.textContent = "⏱ " + String(m).padStart(2,"0") + ":" + String(s).padStart(2,"0");
    display.classList.toggle("warn", r <= 60);
    if (r <= 0){ clearTestTimer(); onEnd(); return; }
    r--;
  }
  tick();
  testTimerId = setInterval(tick, 1000);
}

function renderTest(panel, t, mode){
  mode = mode || "control";
  panel.innerHTML = "";
  panel.appendChild(el(
    '<h2>Контроль темы</h2>' +
    '<p class="accent">🎯 <b>Контроль</b> — с таймером и разбором ошибок, идёт в отчёт. ' +
    '🎓 <b>Тренировка</b> — мгновенная проверка, без оценки.</p>' +
    '<div class="test-mode-tabs">' +
      '<button class="test-mode-tab ' + (mode === "control" ? "active" : "") + '" data-mode="control">🎯 Контроль</button>' +
      '<button class="test-mode-tab ' + (mode === "training" ? "active" : "") + '" data-mode="training">🎓 Тренировка</button>' +
    '</div>'
  ));
  panel.querySelectorAll(".test-mode-tab").forEach(function(b){
    b.addEventListener("click", function(){
      location.hash = "#/topic/" + t.id + "/test/" + b.dataset.mode;
    });
  });
  var body = el('<div></div>');
  panel.appendChild(body);
  if (!t.test || !t.test.length){
    body.appendChild(el('<p><i>Тест готовится.</i></p>'));
    return;
  }
  if (mode === "training") renderTestTraining(body, t);
  else renderTestControl(body, t);
}

function renderTestTraining(body, t){
  body.innerHTML = "";
  body.appendChild(el('<p class="accent">Отвечайте в любом порядке. После выбора сразу увидите правильный ответ.</p>'));
  var items = shuffled(t.test.map(function(q){ return { q: q }; }));
  items.forEach(function(it){
    var opts = it.q.options.map(function(opt, oi){ return { opt: opt, oi: oi }; });
    it.s = shuffled(opts);
    it.correctIdx = -1;
    for (var k = 0; k < it.s.length; k++) if (it.s[k].oi === it.q.correct){ it.correctIdx = k; break; }
  });

  var form = el('<form></form>');
  items.forEach(function(item, qi){
    var qb = el('<div class="question"><div class="q-text">' + (qi+1) + '. ' + escapeHtml(item.q.q) + '</div></div>');
    item.s.forEach(function(o, oi){
      qb.appendChild(el(
        '<label class="option">' +
          '<input type="radio" name="t' + qi + '" value="' + oi + '">' +
          '<span>' + escapeHtml(o.opt) + '</span>' +
        '</label>'
      ));
    });
    var fb = el('<div class="train-feedback"></div>');
    qb.appendChild(fb);
    qb.querySelectorAll("input[type=radio]").forEach(function(inp){
      inp.addEventListener("change", function(){
        var all = qb.querySelectorAll(".option");
        all.forEach(function(o){ o.classList.remove("correct"); o.classList.remove("wrong"); });
        var idx = Number(inp.value);
        if (idx === item.correctIdx){
          all[idx].classList.add("correct");
          fb.textContent = "✔ Верно!";
          fb.className = "train-feedback ok";
        } else {
          all[idx].classList.add("wrong");
          all[item.correctIdx].classList.add("correct");
          fb.textContent = "✘ Неверно.";
          fb.className = "train-feedback bad";
        }
      });
    });
    form.appendChild(qb);
  });
  body.appendChild(form);
}

function renderTestControl(body, t){
  body.innerHTML = "";
  var items = shuffled(t.test.map(function(q){ return { q: q }; }));
  items.forEach(function(it){
    var opts = it.q.options.map(function(opt, oi){ return { opt: opt, oi: oi }; });
    it.s = shuffled(opts);
    it.correctIdx = -1;
    for (var k = 0; k < it.s.length; k++) if (it.s[k].oi === it.q.correct){ it.correctIdx = k; break; }
  });

  var timer = el('<div class="test-timer">⏱ --:--</div>');
  body.appendChild(timer);
  body.appendChild(el('<p class="accent">Вопросы и варианты перемешаны. Время — 15 минут.</p>'));

  var form = el('<form></form>');
  items.forEach(function(item, qi){
    var qb = el('<div class="question"><div class="q-text">' + (qi+1) + '. ' + escapeHtml(item.q.q) + '</div></div>');
    item.s.forEach(function(o, oi){
      qb.appendChild(el(
        '<label class="option">' +
          '<input type="radio" name="q' + qi + '" value="' + oi + '">' +
          '<span>' + escapeHtml(o.opt) + '</span>' +
        '</label>'
      ));
    });
    form.appendChild(qb);
  });

  var result = el('<div class="test-result"></div>');
  var report = el('<div class="test-report"></div>');
  var actions = el(
    '<div class="test-actions">' +
      '<button type="button" class="btn" id="gradeBtn">Подвести итог</button>' +
      '<button type="button" class="btn ghost" id="resetTest">Сбросить</button>' +
    '</div>'
  );
  form.appendChild(actions);
  form.appendChild(result);
  form.appendChild(report);
  body.appendChild(form);

  var graded = false;

  function grade(){
    if (graded) return;
    graded = true;
    clearTestTimer();
    var ok = 0;
    var wrong = [];

    items.forEach(function(item, qi){
      var ch = form.querySelector('input[name="q' + qi + '"]:checked');
      var qb = form.querySelectorAll(".question")[qi];
      qb.querySelectorAll(".option").forEach(function(o){ o.classList.remove("correct"); o.classList.remove("wrong"); });
      if (ch){
        var idx = Number(ch.value);
        var opt = qb.querySelectorAll(".option")[idx];
        if (idx === item.correctIdx){
          ok++;
          opt.classList.add("correct");
        } else {
          opt.classList.add("wrong");
          qb.querySelectorAll(".option")[item.correctIdx].classList.add("correct");
          wrong.push({ q: item.q.q, u: item.s[idx].opt, c: item.q.options[item.q.correct] });
        }
      } else {
        qb.querySelectorAll(".option")[item.correctIdx].classList.add("correct");
        wrong.push({ q: item.q.q, u: "(нет ответа)", c: item.q.options[item.q.correct] });
      }
    });

    var total = items.length;
    var pct = Math.round(ok / total * 100);
    var g = 2;
    if (pct >= 90) g = 5; else if (pct >= 75) g = 4; else if (pct >= 60) g = 3;

    result.textContent = "Верных: " + ok + " из " + total + " (" + pct + "%). Оценка: " + g + ".";
    result.className = "test-result " + (g >= 3 ? "ok" : "bad");
    state.results[t.id] = { ok: ok, total: total, pct: pct, grade: g, date: new Date().toISOString() };
    saveResults();
    logActivity("test", "Тест " + t.code + ": " + ok + "/" + total + " (оценка " + g + ")");
    if (g === 5 && window.celebrate) window.celebrate();

    if (wrong.length){
      report.appendChild(el('<h3>Разбор ошибок</h3>'));
      wrong.forEach(function(w){
        report.appendChild(el(
          '<div class="error-item">' +
            '<div class="error-q">' + escapeHtml(w.q) + '</div>' +
            '<div class="error-line error-bad">Ваш ответ: ' + escapeHtml(w.u) + '</div>' +
            '<div class="error-line error-ok">Верно: ' + escapeHtml(w.c) + '</div>' +
          '</div>'
        ));
      });
      report.appendChild(el('<a class="backlink" href="#/topic/' + t.id + '/lecture">📖 Перечитать лекцию →</a>'));
    } else {
      report.appendChild(el('<p class="test-perfect">🎉 Все ответы верные!</p>'));
    }
    actions.querySelector("#gradeBtn").disabled = true;
  }

  form.querySelector("#gradeBtn").addEventListener("click", grade);
  form.querySelector("#resetTest").addEventListener("click", function(){
    clearTestTimer();
    form.querySelectorAll("input[type=radio]").forEach(function(i){ i.checked = false; });
    form.querySelectorAll(".option").forEach(function(o){ o.classList.remove("correct"); o.classList.remove("wrong"); });
    result.textContent = ""; result.className = "test-result";
    report.innerHTML = "";
    graded = false;
    actions.querySelector("#gradeBtn").disabled = false;
    startTestTimer(TEST_TIME_LIMIT_SEC, timer, grade);
  });

  startTestTimer(TEST_TIME_LIMIT_SEC, timer, grade);
}

/* ============================================================
   PDF
   ============================================================ */
function openPdfModal(file, title){
  document.querySelectorAll(".pdf-overlay").forEach(function(x){ x.remove(); });
  var modal = el(
    '<div class="pdf-overlay">' +
      '<div class="pdf-modal">' +
        '<div class="pdf-head">' +
          '<div class="pdf-title">' + escapeHtml(title) + '</div>' +
          '<div class="pdf-actions">' +
            '<button class="btn ghost" id="pdfDark">🌙 Тема</button>' +
            '<a class="btn ghost" href="' + file + '" download>⬇ Скачать</a>' +
            '<a class="btn ghost" href="' + file + '" target="_blank" rel="noopener">↗ Новая вкладка</a>' +
            '<button class="btn" id="pdfClose">✕ Закрыть</button>' +
          '</div>' +
        '</div>' +
        '<div class="pdf-body"><iframe src="' + file + '#view=FitH" title="' + escapeHtml(title) + '"></iframe></div>' +
      '</div>' +
    '</div>'
  );
  document.body.appendChild(modal);
  document.body.style.overflow = "hidden";
  function close(){ modal.remove(); document.body.style.overflow = ""; }
  modal.querySelector("#pdfClose").addEventListener("click", close);
  modal.addEventListener("click", function(e){ if (e.target === modal) close(); });
  modal.querySelector("#pdfDark").addEventListener("click", function(){ modal.classList.toggle("dark"); });
  function onEsc(e){ if (e.key === "Escape"){ close(); document.removeEventListener("keydown", onEsc); } }
  document.addEventListener("keydown", onEsc);
}

/* ============================================================
   Верхнее меню
   ============================================================ */
function setActiveTopBtn(which){
  var map = { dashboard:"dashboardBtn", chat:"chatBtn", questions:"questionsBtn", role:"roleBtn" };
  Object.keys(map).forEach(function(k){
    var b = $(map[k]);
    if (b) b.classList.toggle("active", which === k);
  });
}

function initTopMenus(){
  var s = $("searchBtn");
  if (s) s.addEventListener("click", function(){ if (window.openSearch) window.openSearch(); });

  var c = $("chatBtn");
  if (c) c.addEventListener("click", function(){
    if (!state.student){ alert("Чат доступен после входа как студент."); return; }
    location.hash = "#/chat";
  });

  var q = $("questionsBtn");
  if (q) q.addEventListener("click", function(){ location.hash = "#/questions"; });

  var d = $("dashboardBtn");
  if (d) d.addEventListener("click", function(){
    if (!state.student){ alert("Статистика доступна после входа как студент."); return; }
    location.hash = "#/dashboard";
  });

  var r = $("roleBtn");
  if (r) r.addEventListener("click", openRoleModal);

  var m = $("moreBtn");
  if (m) m.addEventListener("click", openMoreMenu);
}

function openMoreMenu(){
  document.querySelectorAll(".more-menu, .user-menu").forEach(function(x){ x.remove(); });
  var btn = $("moreBtn");
  if (!btn) return;
  var rect = btn.getBoundingClientRect();

  var menu = el(
    '<div class="more-menu">' +
      '<button class="more-menu-item" data-go="#/final-training">🏋️ Итоговая тренировка (все вопросы)</button>' +
      '<button class="more-menu-item" data-go="#/links">📚 Полезные материалы (статьи, видео, книги)</button>' +
      '<button class="more-menu-item" data-go="#/final-exam">🎓 Итоговый экзамен (25 вопросов)</button>' +
      '<button class="more-menu-item" data-go="#/gcode-reference">📖 G- и M-коды (справочник)</button>' +
      '<button class="more-menu-item" data-go="#/dashboard">📊 Статистика и работы</button>' +
      '<button class="more-menu-item" data-go="#/comments">💬 Отзывы о курсе</button>' +
      '<button class="more-menu-item" data-go="#/gallery">🖼 Галерея работ</button>' +
      '<button class="more-menu-item" data-go="#/calendar">📅 Календарь</button>' +
      '<button class="more-menu-item" data-go="#/gosts">📐 ГОСТы</button>' +
      '<button class="more-menu-item" data-go="#/qr">📱 QR-код</button>' +
      '<button class="more-menu-item" data-act="role">🎭 Сменить роль</button>' +
    '</div>'
  );
  document.body.appendChild(menu);
  menu.style.position = "fixed";
  menu.style.top = (rect.bottom + 8) + "px";
  menu.style.right = Math.max(8, window.innerWidth - rect.right) + "px";
  function close(e){
    if (!menu.contains(e.target) && e.target !== btn){ menu.remove(); document.removeEventListener("click", close); }
  }
  setTimeout(function(){ document.addEventListener("click", close); }, 0);
  menu.querySelectorAll("[data-go]").forEach(function(b){
    b.addEventListener("click", function(){ menu.remove(); location.hash = b.dataset.go; });
  });
  menu.querySelector('[data-act="role"]').addEventListener("click", function(){
    menu.remove();
    openRoleModal();
  });
}

/* ============================================================
   Роутер
   ============================================================ */
function goHome(e){ if (e) e.preventDefault(); location.hash = "#/"; }

function route(){
  clearTestTimer();
  document.querySelectorAll(".pdf-overlay, .theme-overlay, .user-menu, .more-menu").forEach(function(x){ x.remove(); });
  if (typeof closeSearch === "function") closeSearch();

  var hash = location.hash.replace(/^#/, "") || "/";
  var parts = hash.split("/").filter(Boolean);

  var app = $("app");
  if (!app) return;

  if (parts[0] === "staff"){
    if (state.staff && window.renderStaffPage){
      window.renderStaffPage();
    } else {
      openRoleModal();
      app.innerHTML = "";
    }
    window.scrollTo(0, 0);
    return;
  }

  if (!state.student){
    app.innerHTML = "";
    return;
  }

  var pages = {
    comments:  function(){ if (window.renderCommentsPage)  window.renderCommentsPage();  },
    dashboard: function(){ if (window.renderDashboard)     window.renderDashboard();     },
    chat:      function(){ if (window.renderChatPage)      window.renderChatPage();      },
    questions: function(){ if (window.renderQuestionsPage) window.renderQuestionsPage(); },
    gallery:   function(){ if (window.renderGalleryPage)   window.renderGalleryPage();   },
    calendar:  function(){ if (window.renderCalendarPage)  window.renderCalendarPage();  },
    gosts:     function(){ if (window.renderGostsPage)     window.renderGostsPage();     },
    qr:        function(){ if (window.renderQrPage)        window.renderQrPage();        },
    "final-training":  function(){ if (window.renderFinalTrainingPage) window.renderFinalTrainingPage(); },
    "final-exam":      function(){ if (window.renderFinalExamPage)     window.renderFinalExamPage();     },
    "gcode-reference": function(){ if (window.renderGCodeReferencePage) window.renderGCodeReferencePage(); },
    links:             function(){ if (window.renderLinksPage)         window.renderLinksPage();         }
  };

  if (parts[0] === "topic" && parts[1]){
    renderTopic(parts[1], parts[2] || "passport", parts[3] || "control");
  } else if (pages[parts[0]]){
    pages[parts[0]]();
  } else {
    renderHome();
  }
  window.scrollTo(0, 0);
}

/* ============================================================
   Объявления / heartbeat / сеть
   ============================================================ */
function loadAnnouncement(){
  var bar = $("announceBar");
  if (!bar || !APPS_SCRIPT_URL) return;
  var dismissed = localStorage.getItem("mdk0701.announceDismissed") || "";
  fetch(APPS_SCRIPT_URL + "?action=announcement")
    .then(function(res){ return res.json(); })
    .then(function(data){
      if (data && data.ok && data.text){
        var id = data.id || String(data.text).slice(0, 40);
        if (dismissed === id) return;
        $("announceText").textContent = data.text;
        bar.hidden = false;
        $("announceClose").addEventListener("click", function(){
          localStorage.setItem("mdk0701.announceDismissed", id);
          bar.hidden = true;
        });
      }
    })
    .catch(function(){});
}

var heartbeatTimer = null;

function sendHeartbeat(){
  if (!state.student || !APPS_SCRIPT_URL) return;
  var p = new URLSearchParams();
  p.append("action", "heartbeat");
  p.append("key", studentKey());
  p.append("name", state.student.name);
  p.append("group", state.student.group);
  fetch(APPS_SCRIPT_URL, { method:"POST", body: p }).catch(function(){});
}

function refreshOnline(){
  var node = $("onlineCount");
  if (!node || !APPS_SCRIPT_URL) return;
  fetch(APPS_SCRIPT_URL + "?action=online&window=" + ONLINE_TIMEOUT_SEC)
    .then(function(res){ return res.json(); })
    .then(function(data){ if (data && data.ok) node.textContent = "🌐 " + data.count; })
    .catch(function(){});
}

function startHeartbeat(){
  sendHeartbeat();
  refreshOnline();
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = setInterval(function(){ sendHeartbeat(); refreshOnline(); }, 60000);
}

function updateNetStatus(){
  var n = $("netStatus");
  if (!n) return;
  if (!navigator.onLine){ n.textContent = "📶 Офлайн"; n.classList.add("offline"); }
  else { n.textContent = "📶 Онлайн"; n.classList.remove("offline"); }
}

/* ============================================================
   Инициализация
   ============================================================ */
window.goHome = goHome;
window.openRoleModal = openRoleModal;

window.addEventListener("hashchange", route);
window.addEventListener("online",  function(){ updateNetStatus(); if (window.OfflineQueue) window.OfflineQueue.flush(); });
window.addEventListener("offline", updateNetStatus);

window.addEventListener("DOMContentLoaded", function(){
  try {
    initTheme();
    initAuth();
    initTopMenus();
    renderUserChip();
    updateNetStatus();

    var _course = getCourse();
    if (!_course || !_course.sections){
      var app = $("app");
      if (app){
        app.innerHTML = "";
        app.appendChild(el(
          '<section class="module">' +
            '<h2>Курс не загружен</h2>' +
            '<p>Файл <code>data.js</code> не подключён или повреждён. Проверьте, что он лежит рядом с <code>index.html</code>.</p>' +
          '</section>'
        ));
      }
      return;
    }

    route();
    loadAnnouncement();
    startHeartbeat();
  } catch (err){
    console.error("Init error:", err);
    var app2 = $("app");
    if (app2){
      app2.innerHTML = "";
      app2.appendChild(el(
        '<section class="module">' +
          '<h2>Ошибка инициализации</h2>' +
          '<pre style="white-space:pre-wrap;color:var(--err)">' +
          escapeHtml(String(err && err.stack ? err.stack : err)) +
          '</pre>' +
        '</section>'
      ));
    }
  }
});