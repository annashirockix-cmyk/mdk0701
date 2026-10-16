/* ============================================================
   МДК 07.01 — links.js
   Раздел «Полезные материалы»:
   - Ссылки на статьи по ЧПУ и программированию
   - Видеоролики по теме
   - Список литературы
   ============================================================ */

"use strict";

window.LINKS_DATA = {
  articles: [
    {
      title: "Что такое G-код? Руководство по командам и программированию ЧПУ",
      source: "TiRapid",
      url: "https://tirapid.com/",
      desc: "Базовое руководство: из чего состоит язык G-кода, как он управляет положением инструмента, траекторией резания и режимами."
    },
    {
      title: "Модальные коды ЧПУ: полный гид для специалиста",
      source: "Intervesp",
      url: "https://intervespco.ru/",
      desc: "Разбор модальных кодов: какие G-команды сохраняют действие до замены, как это влияет на структуру программы и безопасность."
    },
    {
      title: "Программирование станков с ЧПУ: от G-кода до CAM-систем",
      source: "Abplanalp",
      url: "https://abplanalp.ua/",
      desc: "Обзорный материал: ручное программирование, структура программ, использование G- и M-кодов, переход к CAM."
    },
    {
      title: "Основы программирования ЧПУ (глава руководства Siemens)",
      source: "Siemens Industry",
      url: "https://cache.industry.siemens.com/",
      desc: "Официальное руководство: структура программы, выбор плоскостей G17–G19, смещение нулевой точки, линейная интерполяция."
    },
    {
      title: "G-Code for CNC Programming",
      source: "Autodesk Fusion 360 Blog",
      url: "https://www.autodesk.com/",
      desc: "Статья от Autodesk: что такое G-код, зачем он нужен, как выглядит базовая программа для станка с ЧПУ."
    },
    {
      title: "CNC Programming with G Code: Easy Free Tutorial",
      source: "CNC Cookbook",
      url: "https://www.cnccookbook.com/",
      desc: "Подробный бесплатный учебник по G-коду — от базовых перемещений до макропрограммирования Macro B."
    },
    {
      title: "Coordinate Systems (LinuxCNC)",
      source: "LinuxCNC Documentation",
      url: "https://linuxcnc.org/",
      desc: "Разбор систем координат в ЧПУ: машинные координаты, смещения G54–G59.3, глобальные и локальные смещения G92/G52."
    }
  ],
  videos: [
    {
      title: "ПЛАНЕТА ЧПУ — видеокурс на YouTube",
      source: "LOCNITI",
      url: "https://www.youtube.com/",
      desc: "Базовый видеокурс в 4K: более 54 видеоуроков по устройству и программированию станков с ЧПУ. Доступен бесплатно."
    },
    {
      title: "NYC CNC — канал по практическому ЧПУ",
      source: "YouTube",
      url: "https://www.youtube.com/@NYCNC",
      desc: "Один из самых известных обучающих каналов по ЧПУ: обзоры станков, наладка, программирование, работа в CAM-системах."
    },
    {
      title: "CNC Training Centre",
      source: "YouTube",
      url: "https://www.youtube.com/@CNCTrainingCentre",
      desc: "Разборы основ ЧПУ, объяснение G-кодов, приёмы работы оператора — подходит для начинающих и студентов СПО."
    },
    {
      title: "Autodesk HSM / Fusion 360 CAM",
      source: "YouTube",
      url: "https://www.youtube.com/@AutodeskHSM",
      desc: "Официальные видеоуроки по разработке управляющих программ в Fusion 360 CAM: 2D-, 3D- и многоосевая обработка."
    },
    {
      title: "DELMIA Machining — серия уроков",
      source: "Dassault Systèmes",
      url: "https://discover.3ds.com/",
      desc: "Учебная серия по CAM-обработке: создание инструментов, настройка операций, расчёт траекторий."
    }
  ],
  books: [
    {
      title: "Основы программирования для станков с ЧПУ",
      author: "И. Е. Колошкина, В. А. Селезнев",
      publisher: "Юрайт",
      year: "2025",
      desc: "Учебник для вузов. Начальное освоение программирования на устройстве ЧПУ HEIDENHAIN."
    },
    {
      title: "Программирование обработки на станках с ЧПУ",
      author: "Р. М. Нартыжев",
      publisher: "КБГУ",
      year: "2024",
      desc: "Учебное пособие для направления «Конструкторско-технологическое обеспечение производств»."
    },
    {
      title: "Станки с ЧПУ. Устройство, программирование, инструментальное обеспечение и оснастка",
      author: "Жорж Мрочек",
      publisher: "Флинта",
      year: "2024",
      desc: "Учебное пособие: устройство станков с ЧПУ, основы программирования, инструмент и оснастка."
    },
    {
      title: "Разработка управляющих программ для оборудования с ЧПУ",
      author: "И. Ф. Звонцов, К. М. Иванов, П. П. Серебреницкий",
      publisher: "Лань",
      year: "2023",
      desc: "Учебное пособие по программированию в системе Sinumerik 810/840D с примерами циклов точения, сверления и фрезерования."
    },
    {
      title: "Программирование обработки на станках с ЧПУ: Справочник",
      author: "Р. И. Гжиров, П. П. Серебреницкий",
      publisher: "Машиностроение",
      year: "1990",
      desc: "Классический справочник. Полезен для понимания базовых принципов программирования и работы с системами координат."
    },
    {
      title: "Современный станок с ЧПУ и CAD/CAM-система",
      author: "А. А. Ловыгин, Л. В. Теверовский",
      publisher: "ДМК Пресс",
      year: "2019",
      desc: "Практическое руководство по работе со станками с ЧПУ и CAD/CAM-системами: от модели до готовой детали."
    },
    {
      title: "CNC Machining Handbook: Volume II — G-Code Programming",
      author: "Cornelis Van Houte",
      publisher: "Cognella Academic Publishing",
      year: "2024",
      desc: "От базовых перемещений до сложных траекторий: работа с постоянными циклами, резьбой и расточкой."
    },
    {
      title: "Mastering CNC Programming and Precision Machining",
      author: "John Wyatt",
      publisher: "Cognella Academic Publishing",
      year: "2024",
      desc: "Современный профессиональный справочник: G- и M-коды для токарных и фрезерных центров, интегрированное производство."
    },
    {
      title: "Числа управляют станками",
      author: "научно-популярное издание",
      publisher: "Машиностроение",
      year: "1980-е",
      desc: "История и принципы работы станков с числовым управлением. Книга о том, как создавались первые системы ЧПУ."
    }
  ]
};

/* ============================================================
   Рендер страницы «Полезные материалы»
   ============================================================ */
window.renderLinksPage = function(){
  var app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = "";
  var crumbs = document.getElementById("crumbs");
  if (crumbs) crumbs.textContent = "Полезные материалы";

  var esc = (typeof escapeHtml === "function")
    ? escapeHtml
    : function(s){ return String(s == null ? "" : s); };

  app.appendChild(
    document.createElement("div")
  );
  app.lastChild.outerHTML = '<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>';
  app.removeChild(app.lastChild);
  app.appendChild(el('<a class="backlink" href="#/" onclick="goHome(event)">← На главную</a>'));

  app.appendChild(el(
    '<section class="hero">' +
      '<div class="meta">Дополнительные ресурсы</div>' +
      '<h1>Полезные материалы</h1>' +
      '<p>Подборка статей, видеороликов и книг по ЧПУ и программированию обработки. Материалы помогут глубже разобраться в теме и подготовиться к экзамену.</p>' +
    '</section>'
  ));

  var data = window.LINKS_DATA || {};

  /* ----- Статьи ----- */
  var artBlock = el(
    '<section class="module">' +
      '<div class="meta">Чтение</div>' +
      '<h2>📄 Статьи по ЧПУ и программированию</h2>' +
      '<p class="sub">Разборы G-кодов, систем координат, модальных команд, CAD/CAM-подходов.</p>' +
      '<div class="links-list" id="articlesList"></div>' +
    '</section>'
  );
  var artList = artBlock.querySelector("#articlesList");
  (data.articles || []).forEach(function(a){
    artList.appendChild(el(
      '<a class="link-card" href="' + esc(a.url) + '" target="_blank" rel="noopener">' +
        '<div class="link-card-icon">📄</div>' +
        '<div class="link-card-body">' +
          '<div class="link-card-title">' + esc(a.title) + '</div>' +
          '<div class="link-card-source">' + esc(a.source) + '</div>' +
          '<div class="link-card-desc">' + esc(a.desc) + '</div>' +
        '</div>' +
        '<div class="link-card-arrow">↗</div>' +
      '</a>'
    ));
  });
  app.appendChild(artBlock);

  /* ----- Видео ----- */
  var vidBlock = el(
    '<section class="module">' +
      '<div class="meta">Видеоматериалы</div>' +
      '<h2>🎬 Видеоролики по теме</h2>' +
      '<p class="sub">Обучающие каналы и видеокурсы: от первых шагов до практических приёмов работы на станке.</p>' +
      '<div class="links-list" id="videosList"></div>' +
    '</section>'
  );
  var vidList = vidBlock.querySelector("#videosList");
  (data.videos || []).forEach(function(v){
    vidList.appendChild(el(
      '<a class="link-card" href="' + esc(v.url) + '" target="_blank" rel="noopener">' +
        '<div class="link-card-icon">🎬</div>' +
        '<div class="link-card-body">' +
          '<div class="link-card-title">' + esc(v.title) + '</div>' +
          '<div class="link-card-source">' + esc(v.source) + '</div>' +
          '<div class="link-card-desc">' + esc(v.desc) + '</div>' +
        '</div>' +
        '<div class="link-card-arrow">↗</div>' +
      '</a>'
    ));
  });
  app.appendChild(vidBlock);

  /* ----- Литература ----- */
  var bookBlock = el(
    '<section class="module">' +
      '<div class="meta">Библиография</div>' +
      '<h2>📚 Литература по теме</h2>' +
      '<p class="sub">Учебники, справочники и пособия по устройству и программированию станков с ЧПУ.</p>' +
      '<div class="book-list" id="booksList"></div>' +
    '</section>'
  );
  var bookList = bookBlock.querySelector("#booksList");
  (data.books || []).forEach(function(b){
    bookList.appendChild(el(
      '<div class="book-card">' +
        '<div class="book-cover">📕</div>' +
        '<div class="book-body">' +
          '<div class="book-title">' + esc(b.title) + '</div>' +
          '<div class="book-author">' + esc(b.author) + '</div>' +
          '<div class="book-meta">' + esc(b.publisher) + ' · ' + esc(b.year) + '</div>' +
          '<div class="book-desc">' + esc(b.desc) + '</div>' +
        '</div>' +
      '</div>'
    ));
  });
  app.appendChild(bookBlock);

  window.scrollTo(0, 0);
};

console.log("[links.js] Раздел «Полезные материалы» готов: " +
  (window.LINKS_DATA.articles.length) + " статей, " +
  (window.LINKS_DATA.videos.length) + " видео, " +
  (window.LINKS_DATA.books.length) + " книг.");