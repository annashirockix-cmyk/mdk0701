/* ============================================================
   МДК 07.01 — assistant.js
   Помощник: база знаний, поиск по курсу, голосовой ввод,
   история вопросов, тур по интерфейсу.
   ============================================================ */

"use strict";

var ASSISTANT_KB = [
  {
    keys: ["привет","здравствуй","hi","hello","добрый"],
    answer: "Привет! Я помощник МДК 07.01. Могу рассказать про G- и M-коды, темы курса, расписание, экзамен, журнал, рейтинг. Что тебя интересует?",
    quick: ["Что такое G01?","Где расписание?","Как сдать экзамен?","Что такое G-код?"]
  },
  {
    keys: ["спасибо","благодар","thanks"],
    answer: "Пожалуйста! Если нужна помощь — я рядом. 💡"
  },
  {
    keys: ["кто ты","что ты","помощник","assistant","ты кто"],
    answer: "Я локальный помощник по курсу МДК 07.01 «Оператор станков с ПУ». Работаю прямо в браузере, знаю содержимое курса и подскажу, где что найти.",
    quick: ["Покажи темы курса","Открой справочник G-кодов","Покажи тур по сайту"]
  },
  {
    keys: ["тур","показать тур","проведи тур","guided tour"],
    answer: "Запускаю тур по интерфейсу. Смотри подсветку и подсказки.",
    action: "tour"
  },
  {
    keys: ["g-код","g код","gcode","что такое g"],
    answer: "G-код — язык программирования станков с ЧПУ (стандарт ISO 6983-1:1982, ГОСТ 20999-83). Состоит из кадров с командами: G — подготовительные, M — вспомогательные, X/Y/Z — координаты, F — подача, S — обороты. Полный справочник — в разделе «📖 G- и M-коды».",
    link: { hash: "#/gcode-reference", text: "Открыть справочник G- и M-кодов" }
  },
  {
    keys: ["m-код","m код","mcode","что такое m"],
    answer: "M-коды — вспомогательные команды: M03/M04 — шпиндель по/против часовой, M05 — стоп, M06 — смена инструмента, M08/M09 — СОЖ, M30 — конец программы."
  },
  {
    keys: ["g01","g1","линейная интерполяция"],
    answer: "G01 — линейная интерполяция с подачей F. Основной код для точения и фрезерования. Пример: `G01 X30 Z-40 F0.15`.",
    link: { hash: "#/gcode-reference", text: "Справочник → G01" }
  },
  {
    keys: ["g00","g0","быстрое"],
    answer: "G00 — быстрое позиционирование. Для подвода и отвода без обработки. Пример: `G00 X50 Z5`."
  },
  {
    keys: ["g02","g03","круговая","дуга"],
    answer: "G02 — дуга по часовой, G03 — против. Радиус через R. Пример: `G03 X20 Z-45 R5`."
  },
  {
    keys: ["g71","черновой","черновая"],
    answer: "G71 — токарный черновой цикл. Пример: `G71 U2 R1` (глубина 2 мм, отход 1 мм) + `G71 P120 Q160 U0.4 W0.1 F0.3`."
  },
  {
    keys: ["g76","резьба","нарезание"],
    answer: "G76 — многопроходный цикл резьбы. Пример М20×2,5: `G76 P021060 Q100 R0.05` и `G76 X17.30 Z-40 P1350 Q300 F2.5`.",
    link: { hash: "#/gcode-reference", text: "Пример G76 с расшифровкой" }
  },
  {
    keys: ["g81","сверление цикл","сверлить"],
    answer: "G81 — простой цикл сверления. Пример: `G99 G81 X0 Y0 Z-15 R2 F80`. Для глубоких — G83 с параметром Q."
  },
  {
    keys: ["g80","отмена цикла"],
    answer: "G80 — отмена постоянного цикла. Ставь после G81/G83/G85."
  },
  {
    keys: ["g70","по окружности","отверстия по кругу"],
    answer: "G70 — цикл отверстий по окружности. Пример: `G70 I40 J0 L8` — 8 отверстий радиусом 40."
  },
  {
    keys: ["m03","m3","шпиндель"],
    answer: "M03 — шпиндель по часовой. Обычно `S1200 M03`."
  },
  {
    keys: ["m06","m6","смена","инструмент"],
    answer: "M06 — смена инструмента. Пример: `T01 M06`."
  },
  {
    keys: ["m30","конец программы"],
    answer: "M30 — конец программы с возвратом в начало. Предпочтительнее M02."
  },
  {
    keys: ["g54","нуль","ноль","система координат"],
    answer: "G54…G59 — рабочие СК. G54 — основная, в 90% программ."
  },
  {
    keys: ["скорость","режим","резания","подача"],
    answer: "Vc (м/мин) → n = 1000·Vc / (π·D). Подача: мм/об (G95) или мм/мин (G94). Для стали 45: черновая Vc=180, f=0,3; чистовая Vc=220, f=0,1."
  },
  {
    keys: ["точить","точение","токарный"],
    answer: "Токарная обработка: 1) подрезка торца, 2) центрование, 3) черновая (G71), 4) чистовая (G70), 5) фаски/канавки/резьба."
  },
  {
    keys: ["расписание","звонки"],
    answer: "Расписание — в разделе «📅 Расписание». Студент видит свою группу, куратор — только её, преподаватель и админ — любую.",
    link: { hash: "#/schedule", text: "Открыть расписание" }
  },
  {
    keys: ["журнал","посещаемость","отметки"],
    answer: "Журнал — в разделе «📔 Журнал». Учителя ставят отметки, куратор и студенты — только просмотр. Средний балл считается автоматически.",
    link: { hash: "#/journal", text: "Открыть журнал" }
  },
  {
    keys: ["рейтинг","место","соревнование"],
    answer: "Рейтинг — в разделе «🏆 Рейтинг». Формула: 70% × (средний балл × 20) + 30% × min(100, темы × 5).",
    link: { hash: "#/rating", text: "Открыть рейтинг" }
  },
  {
    keys: ["экзамен","итоговый","попытк"],
    answer: "Итоговый экзамен — 25 вопросов, 30 минут, 3 попытки. Если кончились — нажми «📩 Запросить дополнительную попытку».",
    link: { hash: "#/final-exam", text: "Открыть экзамен" }
  },
  {
    keys: ["тренировка","все вопросы"],
    answer: "Итоговая тренировка — все вопросы курса с мгновенной проверкой. Без оценки.",
    link: { hash: "#/final-training", text: "Открыть тренировку" }
  },
  {
    keys: ["статистика","прогресс","дашборд"],
    answer: "Статистика — в разделе «📊 Статистика»: диаграммы, активность по неделям, топ-3 сложных темы.",
    link: { hash: "#/dashboard", text: "Открыть статистику" }
  },
  {
    keys: ["отчёт","отчет","преподав"],
    answer: "Отчёт — в меню профиля → «Отправить отчёт»."
  },
  {
    keys: ["полезные материалы","книги","статьи","литература"],
    answer: "Раздел «📚 Полезные материалы»: 7 статей, 5 видеоканалов, 9 книг.",
    link: { hash: "#/links", text: "Открыть полезные материалы" }
  },
  {
    keys: ["гост","стандарт"],
    answer: "ГОСТы — в разделе «📐 ГОСТы»: 18097-93, 8-82, 8593-81, 20999-83 и др.",
    link: { hash: "#/gosts", text: "Открыть ГОСТы" }
  },
  {
    keys: ["темы курса","список тем","какие темы"],
    answer: "В курсе 2 раздела и 12 тем: Раздел 1 — токарные станки, Раздел 2 — системы ЧПУ + история.",
    link: { hash: "#/", text: "Открыть главную" }
  },
  {
    keys: ["практическая","практичек","пз","проверк","сдал","статус"],
    answer: "На каждой практической работе есть значок статуса: 📤 «Отправить на проверку» → 🕓 «На проверке» → ✅ «Проверено». Студент нажимает «Отправить», преподаватель — «Отметить проверенным»."
  },
  {
    keys: ["помощь","help","не работает","ошибка"],
    answer: "Если что-то не работает: 1) проверь интернет, 2) Ctrl+Shift+R, 3) проверь, что ты авторизован. Если ошибка остаётся — напиши через «❓ Вопросы»."
  }
];

function assistantAnswer(q){
  var lower = (q || "").toLowerCase().trim();
  if (!lower) return null;
  var best = null, bestLen = 0;
  ASSISTANT_KB.forEach(function(item){
    (item.keys || []).forEach(function(k){
      if (lower.indexOf(k) !== -1 && k.length > bestLen){
        best = item;
        bestLen = k.length;
      }
    });
  });
  return best;
}

function assistantSearchCourse(q){
  var results = [];
  var lower = (q || "").toLowerCase();
  if (lower.length < 2) return results;
  var c = null;
  try { c = (typeof COURSE !== "undefined") ? COURSE : window.COURSE; } catch(e){}
  if (!c || !c.sections) return results;
  function push(type, icon, title, text, hash){
    results.push({ type: type, icon: icon, title: title, text: text, hash: hash });
  }
  c.sections.forEach(function(sec){
    (sec.topics || []).forEach(function(t){
      if ((t.title + " " + t.code).toLowerCase().indexOf(lower) !== -1)
        push("Тема","📚", t.code + " · " + t.title, sec.code, "#/topic/" + t.id + "/passport");
      (t.lectures || []).forEach(function(l){
        var content = (l.content || "").replace(/<[^>]+>/g, " ").toLowerCase();
        if (l.title.toLowerCase().indexOf(lower) !== -1 || content.indexOf(lower) !== -1)
          push("Лекция","📖", l.code + ". " + l.title, t.code, "#/topic/" + t.id + "/lecture");
      });
      (t.practicals || []).forEach(function(p){
        var hay = (p.code + " " + p.title + " " + (p.goal || "") + " " + (p.task || "")).toLowerCase();
        if (hay.indexOf(lower) !== -1)
          push("Практика","🛠️", p.code + " · " + p.title, t.code, "#/topic/" + t.id + "/practice");
      });
    });
  });
  return results.slice(0, 8);
}

function assistantSearchGCode(q){
  var res = [];
  var ref = window.GCODE_REFERENCE;
  if (!ref) return res;
  var lower = (q || "").toLowerCase().trim();
  if (lower.length < 2) return res;
  (ref.groups || []).forEach(function(g){
    (g.items || []).forEach(function(it){
      var hay = (it.code + " " + it.name + " " + it.desc).toLowerCase();
      if (hay.indexOf(lower) !== -1){
        res.push({
          icon: "📖",
          title: it.code + " — " + it.name,
          text: it.desc + " · Пример: " + it.example,
          hash: "#/gcode-reference"
        });
      }
    });
  });
  return res.slice(0, 6);
}

var ASSISTANT_TOUR = [
  { target: "#burgerBtn", title: "Меню сайта", text: "Отсюда открывается боковая шторка со всеми разделами.", position: "bottom" },
  { target: ".steps-title", title: "Навигация по главной", text: "Здесь сгруппированы итоговые блоки: тренировка, экзамен, G-коды, рейтинг.", position: "bottom" },
  { target: ".topics", title: "Список тем", text: "Кликните на любую тему, чтобы открыть её: там лекция, практические, тесты.", position: "top" },
  { target: "#themeToggle", title: "Смена темы", text: "Переключение между светлой, тёмной, сепией, океаном, лесом и контрастной темами.", position: "bottom" },
  { target: "#asFab", title: "Помощник", text: "Я всегда здесь. Нажми — откроюсь снова. Горячая клавиша Ctrl + /.", position: "top" }
];

function startTour(){
  closeTour();
  var idx = 0;
  var overlay = document.createElement("div");
  overlay.className = "tour-overlay";
  overlay.id = "tourOverlay";
  document.body.appendChild(overlay);

  function step(){
    document.querySelectorAll(".tour-highlight, .tour-tip").forEach(function(x){ x.classList.remove("tour-highlight"); });
    document.querySelectorAll(".tour-tip").forEach(function(x){ x.remove(); });

    if (idx >= ASSISTANT_TOUR.length){
      endTour("Тур завершён. Приятной работы! 🚀");
      return;
    }
    var s = ASSISTANT_TOUR[idx];
    var target = document.querySelector(s.target);
    if (!target){
      idx++;
      step();
      return;
    }
    target.classList.add("tour-highlight");
    try { target.scrollIntoView({ behavior: "smooth", block: "center" }); } catch(e){}

    setTimeout(function(){
      var rect = target.getBoundingClientRect();
      var tip = document.createElement("div");
      tip.className = "tour-tip tour-tip-" + (s.position || "bottom");
      tip.innerHTML =
        '<div class="tour-step">Шаг ' + (idx + 1) + ' из ' + ASSISTANT_TOUR.length + '</div>' +
        '<div class="tour-tip-title">' + s.title + '</div>' +
        '<div class="tour-tip-text">' + s.text + '</div>' +
        '<div class="tour-tip-actions">' +
          '<button class="btn ghost tour-skip">Пропустить</button>' +
          '<button class="btn tour-next">' + (idx === ASSISTANT_TOUR.length - 1 ? "Готово" : "Далее →") + '</button>' +
        '</div>';
      document.body.appendChild(tip);

      var tipRect = tip.getBoundingClientRect();
      var top = 0, left = 0;
      var pos = s.position || "bottom";
      if (pos === "bottom"){ top = rect.bottom + 12; left = rect.left + rect.width / 2 - tipRect.width / 2; }
      else if (pos === "top"){ top = rect.top - tipRect.height - 12; left = rect.left + rect.width / 2 - tipRect.width / 2; }
      else if (pos === "right"){ top = rect.top + rect.height / 2 - tipRect.height / 2; left = rect.right + 12; }
      else if (pos === "left"){ top = rect.top + rect.height / 2 - tipRect.height / 2; left = rect.left - tipRect.width - 12; }
      top = Math.max(12, Math.min(top, window.innerHeight - tipRect.height - 12));
      left = Math.max(12, Math.min(left, window.innerWidth - tipRect.width - 12));
      tip.style.top = top + "px";
      tip.style.left = left + "px";

      tip.querySelector(".tour-next").addEventListener("click", function(){ idx++; step(); });
      tip.querySelector(".tour-skip").addEventListener("click", function(){ endTour("Тур прерван."); });
    }, 260);
  }

  function endTour(msg){
    document.querySelectorAll(".tour-highlight").forEach(function(x){ x.classList.remove("tour-highlight"); });
    document.querySelectorAll(".tour-tip").forEach(function(x){ x.remove(); });
    var ov = document.getElementById("tourOverlay");
    if (ov) ov.remove();
    if (msg) setTimeout(function(){ alert(msg); }, 100);
  }

  overlay.addEventListener("click", function(){ endTour("Тур прерван."); });
  step();
}

function closeTour(){
  var ov = document.getElementById("tourOverlay");
  if (ov) ov.remove();
  document.querySelectorAll(".tour-highlight").forEach(function(x){ x.classList.remove("tour-highlight"); });
  document.querySelectorAll(".tour-tip").forEach(function(x){ x.remove(); });
}

function histLoad(){
  try { return JSON.parse(sessionStorage.getItem("mdk0701.assistant.history") || "[]"); }
  catch(e){ return []; }
}
function histPush(q){
  q = (q || "").trim();
  if (!q) return;
  var h = histLoad();
  h = h.filter(function(x){ return x !== q; });
  h.unshift(q);
  h = h.slice(0, 8);
  try { sessionStorage.setItem("mdk0701.assistant.history", JSON.stringify(h)); } catch(e){}
}
function histClear(){
  try { sessionStorage.removeItem("mdk0701.assistant.history"); } catch(e){}
}

var _asRec = null;
var _asListening = false;
function initVoice(){
  if (_asRec) return _asRec;
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  var r = new SR();
  r.lang = "ru-RU";
  r.continuous = false;
  r.interimResults = false;
  r.maxAlternatives = 1;
  _asRec = r;
  return r;
}

function assistantMsgEl(text, role){
  var div = document.createElement("div");
  div.className = "as-msg as-" + role;
  var safe = String(text)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/\n/g, "<br>");
  div.innerHTML = safe;
  return div;
}

window.openAssistant = function(){
  var existing = document.getElementById("assistantPanel");
  if (existing){ existing.classList.toggle("open"); return; }
  document.querySelectorAll(".as-overlay").forEach(function(x){ x.remove(); });

  var panel = document.createElement("div");
  panel.id = "assistantPanel";
  panel.className = "as-panel";
  panel.innerHTML =
    '<div class="as-head">' +
      '<div class="as-head-info">' +
        '<span class="as-avatar">🤖</span>' +
        '<div>' +
          '<div class="as-title">Помощник МДК 07.01</div>' +
          '<div class="as-sub">Локальная база знаний · голос · история · тур</div>' +
        '</div>' +
      '</div>' +
      '<div class="as-head-actions">' +
        '<button class="as-icon-btn" id="asTour" title="Тур по сайту">🎯</button>' +
        '<button class="as-icon-btn" id="asHistory" title="История вопросов">🕐</button>' +
        '<button class="as-close" id="asClose" title="Закрыть">✕</button>' +
      '</div>' +
    '</div>' +
    '<div class="as-history" id="asHistoryBox" hidden>' +
      '<div class="as-history-head">' +
        '<span>История за сессию</span>' +
        '<button class="as-history-clear" id="asHistoryClear">Очистить</button>' +
      '</div>' +
      '<div class="as-history-list" id="asHistoryList"></div>' +
    '</div>' +
    '<div class="as-log" id="asLog"></div>' +
    '<div class="as-quick" id="asQuick"></div>' +
    '<form class="as-form" id="asForm">' +
      '<button type="button" class="as-mic" id="asMic" title="Голосовой ввод">🎤</button>' +
      '<input type="text" class="as-input" id="asInput" placeholder="Спроси про курс, G-код, экзамен…" autocomplete="off">' +
      '<button type="submit" class="btn as-send">➤</button>' +
    '</form>';

  document.body.appendChild(panel);
  setTimeout(function(){ panel.classList.add("open"); }, 20);

  var log = panel.querySelector("#asLog");
  var quick = panel.querySelector("#asQuick");
  var input = panel.querySelector("#asInput");
  var micBtn = panel.querySelector("#asMic");
  var histBox = panel.querySelector("#asHistoryBox");
  var histList = panel.querySelector("#asHistoryList");

  addBot("Привет! Я помощник по курсу МДК 07.01. Умею искать по лекциям и G-кодам, слушать голос, вести историю вопросов и проводить тур по сайту. Что интересует?");
  renderQuick(["Что такое G01?","Где расписание?","Как сдать экзамен?","Покажи тур по сайту","Открой рейтинг","Полезные материалы"]);

  function addBot(html, links){
    var m = assistantMsgEl(html, "bot");
    if (links && links.length){
      var box = document.createElement("div");
      box.className = "as-links";
      links.forEach(function(l){
        var a = document.createElement("a");
        a.href = "#";
        a.className = "as-link";
        a.textContent = (l.icon ? (l.icon + " ") : "") + (l.title || l.text);
        a.addEventListener("click", function(e){
          e.preventDefault();
          if (l.href){ window.open(l.href, "_blank", "noopener"); }
          else { location.hash = l.hash; window.closeAssistant(); }
        });
        box.appendChild(a);
      });
      m.appendChild(box);
    }
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
  }
  function addUser(text){
    log.appendChild(assistantMsgEl(text, "user"));
    log.scrollTop = log.scrollHeight;
  }
  function renderQuick(items){
    quick.innerHTML = "";
    items.forEach(function(q){
      var b = document.createElement("button");
      b.type = "button";
      b.className = "as-quick-btn";
      b.textContent = q;
      b.addEventListener("click", function(){ handle(q); });
      quick.appendChild(b);
    });
  }
  function renderHistory(){
    var h = histLoad();
    histList.innerHTML = "";
    if (!h.length){ histList.innerHTML = '<div class="as-history-empty">Пока ничего не спрашивали</div>'; return; }
    h.forEach(function(q){
      var b = document.createElement("button");
      b.type = "button";
      b.className = "as-history-item";
      b.textContent = q;
      b.addEventListener("click", function(){ histBox.hidden = true; handle(q); });
      histList.appendChild(b);
    });
  }

  function handle(text){
    text = (text || "").trim();
    if (!text) return;
    addUser(text);
    histPush(text);

    var kb = assistantAnswer(text);
    if (kb){
      if (kb.action === "tour"){
        addBot("Запускаю тур. Смотри подсветку и подсказки на экране.");
        setTimeout(startTour, 400);
        return;
      }
      var links = [];
      if (kb.link) links.push({ title: kb.link.text, hash: kb.link.hash });
      addBot(kb.answer, links.length ? links : null);
      if (kb.quick) renderQuick(kb.quick);
      return;
    }
    var gres = assistantSearchGCode(text);
    if (gres.length){
      addBot("Нашёл в справочнике G/M:", gres.map(function(r){ return { icon: r.icon, title: r.title, hash: r.hash }; }));
      return;
    }
    var cres = assistantSearchCourse(text);
    if (cres.length){
      addBot("Нашёл по теме:", cres.map(function(r){ return { icon: r.icon, title: r.title + " (" + r.text + ")", hash: r.hash }; }));
      return;
    }
    addBot("Не нашёл точного ответа. Попробуй спросить иначе — «что такое G71», «как открыть расписание», «покажи тур». Или открой раздел напрямую через боковое меню.");
    renderQuick(["Что такое G-код?","Как открыть журнал?","Где экзамен?","Полезные материалы","Покажи тур по сайту"]);
  }

  var voice = initVoice();
  if (!voice){
    micBtn.disabled = true;
    micBtn.title = "Голосовой ввод не поддерживается";
  } else {
    micBtn.addEventListener("click", function(){
      if (_asListening){ try { voice.stop(); } catch(e){} return; }
      try { voice.start(); _asListening = true; micBtn.classList.add("listening"); micBtn.title = "Слушаю…"; } catch(e){ _asListening = false; }
    });
    voice.onresult = function(e){
      _asListening = false; micBtn.classList.remove("listening"); micBtn.title = "Голосовой ввод";
      var transcript = e.results[0][0].transcript;
      input.value = transcript;
      setTimeout(function(){ handle(transcript); input.value = ""; }, 200);
    };
    voice.onerror = function(e){
      _asListening = false; micBtn.classList.remove("listening"); micBtn.title = "Голосовой ввод";
      if (e.error === "not-allowed") alert("Разреши доступ к микрофону в браузере.");
    };
    voice.onend = function(){ _asListening = false; micBtn.classList.remove("listening"); };
  }

  panel.querySelector("#asHistory").addEventListener("click", function(){
    histBox.hidden = !histBox.hidden;
    if (!histBox.hidden) renderHistory();
  });
  panel.querySelector("#asHistoryClear").addEventListener("click", function(){ histClear(); renderHistory(); });
  panel.querySelector("#asTour").addEventListener("click", function(){ window.closeAssistant(); setTimeout(startTour, 250); });
  panel.querySelector("#asClose").addEventListener("click", window.closeAssistant);
  panel.querySelector("#asForm").addEventListener("submit", function(e){
    e.preventDefault();
    var t = input.value;
    input.value = "";
    handle(t);
  });
  setTimeout(function(){ input.focus(); }, 100);
};

window.closeAssistant = function(){
  var panel = document.getElementById("assistantPanel");
  if (!panel) return;
  panel.classList.remove("open");
  setTimeout(function(){ if (panel && panel.parentNode) panel.remove(); }, 250);
};

window.startAssistantTour = startTour;

function initAssistantButton(){
  if (document.getElementById("asFab")) return;
  var btn = document.createElement("button");
  btn.id = "asFab";
  btn.className = "as-fab";
  btn.title = "Помощник (Ctrl+/)";
  btn.setAttribute("aria-label", "Помощник");
  btn.innerHTML = "🤖";
  btn.addEventListener("click", window.openAssistant);
  document.body.appendChild(btn);
}

document.addEventListener("keydown", function(e){
  if ((e.ctrlKey || e.metaKey) && (e.key === "/" || e.key === "?")){
    e.preventDefault();
    window.openAssistant();
  }
  if (e.key === "Escape"){
    if (document.getElementById("assistantPanel")) window.closeAssistant();
    closeTour();
  }
});

window.addEventListener("DOMContentLoaded", function(){ initAssistantButton(); });

console.log("[assistant.js] Помощник загружен. Ответов: " + ASSISTANT_KB.length + ". Шагов тура: " + ASSISTANT_TOUR.length);