window.renderLinksPage = function(){
  var app = document.getElementById("app"); if (!app) return; app.innerHTML = "";
  document.getElementById("crumbs").textContent = "Полезные материалы";

  app.appendChild(el('<a class="backlink" href="#/">← На главную</a>'));
  app.appendChild(el('<section class="hero"><h1>Полезные материалы</h1><p>Подборка статей, видеороликов и книг по ЧПУ.</p></section>'));

  var data = window.LINKS_DATA || {};

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