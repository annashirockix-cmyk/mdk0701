/* ============================================================
   МДК 07.01 — easter-eggs.js (v61.0 — FIXED)
   ============================================================ */
"use strict";

var konamiCode = ['c', 'n', 'c'];
var konamiIndex = 0;

document.addEventListener('keydown', function(e) {
  // ИСПРАВЛЕНИЕ: защита от undefined, если e.key не существует
  var key = e.key ? e.key.toLowerCase() : "";
  
  if (key === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      if (window.showToast) window.showToast("⚙️ Секретный режим ЧПУ активирован! Стружка летит во все стороны!", "ok");
      if (window.celebrate) window.celebrate();
      document.body.style.animation = "shake 0.5s";
      setTimeout(() => { document.body.style.animation = ""; }, 500);
      konamiIndex = 0;
    }
  } else { konamiIndex = 0; }
});

var logoClicks = 0;
document.addEventListener("click", function(e) {
  var brand = e.target.closest(".brand");
  if (brand) {
    logoClicks++;
    if (logoClicks === 5) {
      logoClicks = 0;
      if (window.showToast) window.showToast("Вы нашли пасхалку! 🎉", "ok");
      var badge = brand.querySelector(".brand-badge");
      if (badge) { 
          badge.textContent = "G-CODE PRO"; 
          badge.style.background = "var(--gold)"; 
          badge.style.color = "#000"; 
          setTimeout(() => { 
              badge.textContent = "МДК 07.01"; 
              badge.style.background = ""; 
              badge.style.color = ""; 
          }, 3000); 
      }
    }
  } else { logoClicks = 0; }
});

window.addEventListener("hashchange", function() {
  if (Math.random() < 0.2) {
    var memes = ["Станок не прощает ошибок...", "Если заготовка вибрирует — значит, вы что-то делаете не так.", "G00 — это не кнопка 'сделать красиво'.", "Стружка в кармане — это фича токаря."];
    if (window.showToast) window.showToast(memes[Math.floor(Math.random() * memes.length)], "info");
  }
});