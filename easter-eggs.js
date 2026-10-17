/* ============================================================
   МДК 07.01 — easter-eggs.js (Пасхалки и мемы)
   ============================================================ */
"use strict";

// 1. Секретный код (наберите на клавиатуре "cnc")
var konamiCode = ['c', 'n', 'c'];
var konamiIndex = 0;

document.addEventListener('keydown', function(e) {
  var key = e.key.toLowerCase();
  if (key === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      triggerSecretMeme();
      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }
});

function triggerSecretMeme() {
  if (window.showToast) {
    window.showToast("⚙️ Секретный режим ЧПУ активирован! Стружка летит во все стороны!", "ok");
  }
  if (window.celebrate) window.celebrate();
  
  // Встряска экрана
  document.body.style.animation = "shake 0.5s";
  setTimeout(() => { document.body.style.animation = ""; }, 500);
}

// 2. Пасхалка при 5 кликах по логотипу
var logoClicks = 0;
document.addEventListener("click", function(e) {
  var brand = e.target.closest(".brand");
  if (brand) {
    logoClicks++;
    if (logoClicks === 5) {
      logoClicks = 0;
      if (window.showToast) window.showToast("Вы нашли пасхалку! 🎉 (Не забудьте про технику безопасности!)", "ok");
      // Меняем логотип
      var badge = brand.querySelector(".brand-badge");
      if (badge) {
        badge.textContent = "G-CODE PRO";
        badge.style.background = "var(--gold)";
        badge.style.color = "#000";
      }
      setTimeout(() => {
        if (badge) {
          badge.textContent = "МДК 07.01";
          badge.style.background = "";
          badge.style.color = "";
        }
      }, 3000);
    }
  } else {
    logoClicks = 0;
  }
});

// 3. Случайные мемы при переходе на страницы (иногда)
window.addEventListener("hashchange", function() {
  if (Math.random() < 0.2) { // 20% шанс
    var memes = [
      "Станок не прощает ошибок... как и преподаватель на экзамене.",
      "Если заготовка вибрирует — значит, вы что-то делаете не так.",
      "G00 — это не кнопка 'сделать красиво', это ускоренный ход.",
      "Стружка в кармане — это не баг, это фича токаря.",
      "Почему программисты ЧПУ любят кофе? Потому что без него ось Z летит не туда."
    ];
    var msg = memes[Math.floor(Math.random() * memes.length)];
    if (window.showToast) window.showToast(msg, "info");
  }
});