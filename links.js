/* ============================================================
   МДК 07.01 — links.js (v81.0 — HARDCODED DATA)
   ============================================================ */
"use strict";

window.renderLinksPage = function(){
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Полезные материалы";

  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el('<section class="hero"><h1>Полезные материалы</h1><p>Подборка статей, видеороликов и книг по ЧПУ.</p></section>'));

  // ДАННЫЕ ВШИТЫ ПРЯМО СЮДА, ЧТОБЫ ОНИ НЕ ПРОПАДАЛИ
  var data = {
    articles: [
        { title: "Что такое G-код? Руководство по командам и программированию ЧПУ", source: "TiRapid", url: "https://tirapid.com/", desc: "Базовое руководство: из чего состоит язык G-кода, как он управляет положением инструмента, траекторией резания и режимами." },
        { title: "Модальные коды ЧПУ: полный гид для специалиста", source: "Intervesp", url: "https://intervespco.ru/", desc: "Разбор модальных кодов: какие G-команды сохраняют действие до замены, как это влияет на структуру программы и безопасность." },
        { title: "Программирование станков с ЧПУ: от G-кода до CAM-систем", source: "Abplanalp", url: "https://abplanalp.ua/", desc: "Обзорный материал: ручное программирование, структура программ, использование G- и M-кодов, переход к CAM." }
    ],
    videos: [
        { title: "ПЛАНЕТА ЧПУ — видеокурс на YouTube", source: "LOCNITI", url: "https://www.youtube.com/", desc: "Базовый видеокурс в 4K: более 54 видеоуроков по устройству и программированию станков с ЧПУ. Доступен бесплатно." },
        { title: "NYC CNC — канал по практическому ЧПУ", source: "YouTube", url: "https://www.youtube.com/@NYCNC", desc: "Один из самых известных обучающих каналов по ЧПУ: обзоры станков, наладка, программирование, работа в CAM-системах." }
    ],
    books: [
        { title: "Основы программирования для станков с ЧПУ", author: "И. Е. Колошкина, В. А. Селезнев", publisher: "Юрайт", year: "2025", desc: "Учебник для вузов. Начальное освоение программирования на устройстве ЧПУ HEIDENHAIN." },
        { title: "Программирование обработки на станках с ЧПУ", author: "Р. М. Нартыжев", publisher: "КБГУ", year: "2024", desc: "Учебное пособие для направления «Конструкторско-технологическое обеспечение производств»." }
    ]
  };

  // СТАТЬИ
  var artBlock = el('<section class="module"><h2>📄 Статьи по ЧПУ</h2><div class="links-list" id="articlesList"></div></section>');
  var artList = artBlock.querySelector("#articlesList");
  (data.articles || []).forEach(a => {
    artList.appendChild(el(`<a class="link-card" href="${a.url}" target="_blank"><div class="link-card-icon">📄</div><div class="link-card-body"><div class="link-card-title">${a.title}</div><div class="link-card-source">${a.source}</div><div class="link-card-desc">${a.desc}</div></div><div class="link-card-arrow">↗</div></a>`));
  });
  app.appendChild(artBlock);

  // ВИДЕО
  var vidBlock = el('<section class="module"><h2>🎬 Видеоролики</h2><div class="links-list" id="videosList"></div></section>');
  var vidList = vidBlock.querySelector("#videosList");
  (data.videos || []).forEach(v => {
    vidList.appendChild(el(`<a class="link-card" href="${v.url}" target="_blank"><div class="link-card-icon">🎬</div><div class="link-card-body"><div class="link-card-title">${v.title}</div><div class="link-card-source">${v.source}</div><div class="link-card-desc">${v.desc}</div></div><div class="link-card-arrow">↗</div></a>`));
  });
  app.appendChild(vidBlock);

  // КНИГИ
  var bookBlock = el('<section class="module"><h2>📚 Литература</h2><div class="book-list" id="booksList"></div></section>');
  var bookList = bookBlock.querySelector("#booksList");
  (data.books || []).forEach(b => {
    bookList.appendChild(el(`<div class="book-card"><div class="book-cover">📕</div><div class="book-body"><div class="book-title">${b.title}</div><div class="book-author">${b.author}</div><div class="book-meta">${b.publisher} · ${b.year}</div><div class="book-desc">${b.desc}</div></div></div>`));
  });
  app.appendChild(bookBlock);
};