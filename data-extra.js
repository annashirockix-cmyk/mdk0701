/* ============================================================
   data-extra.js — Дополнительные данные
   ============================================================ */
"use strict";

(function() {
    if (!window.MDK_DATA || !window.MDK_DATA["07.01"]) return;

    var course = window.MDK_DATA["07.01"];
    
    // 1. Автозамена SprutCAM → MasterCAM
    function replIn(obj){
        if (obj == null) return obj;
        if (typeof obj === "string"){
            return obj.replace(/SprutCAM/g, "MasterCAM").replace(/SprutCam/g, "MasterCAM");
        }
        if (Array.isArray(obj)){
            for (var i = 0; i < obj.length; i++) obj[i] = replIn(obj[i]);
            return obj;
        }
        if (typeof obj === "object"){
            for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) obj[k] = replIn(obj[k]);
            return obj;
        }
        return obj;
    }
    replIn(course);

    // 2. Добавление темы по истории ЧПУ
    var targetSec = null;
    course.sections.forEach(function(s){
        if (s.title && s.title.indexOf("современных систем") !== -1) targetSec = s;
    });
    if (!targetSec) targetSec = course.sections[course.sections.length - 1];
    if (!targetSec) return;

    var alreadyExists = targetSec.topics.some(function(t){ return t.id === "t-history"; });
    if (alreadyExists) return;

    var historyTopic = {
        id: "t-history",
        code: "Тема 3.0",
        title: "История развития ЧПУ в мире и в СССР",
        lectures: [
            {
                code: "3.0.1",
                title: "Первые шаги: жаккардовый станок и мечта об автоматизации",
                content: "<p>Историю ЧПУ принято отсчитывать с 1801 года, когда Жозеф Мари Жаккар построил ткацкий станок, управляемый перфокартами.</p><ul><li>1801 — жаккардовый станок (перфокарты);</li><li>1890 — Герман Холлерит применяет перфокарты;</li><li>1948 — Джон Пэрсонс в США работает над машиной для обработки лопаток вертолёта.</li></ul>"
            },
            {
                code: "3.0.2",
                title: "Первый станок с ЧПУ (1952, MIT)",
                content: "<p>В 1949 году ВВС США финансировали разработку машины, способной фрезеровать сложные поверхности. В 1952 году был представлен первый станок с ЧПУ.</p><ul><li>программа хранилась на перфоленте;</li><li>стойка была ламповой, размером с шкаф;</li><li>стоимость станка превышала стоимость 10 обычных фрезерных.</li></ul>"
            }
        ],
        practicals: [],
        test: [
            { q: "Первый станок с ЧПУ появился в", options: ["1940","1952","1965","1975"], correct: 1 },
            { q: "Что означает CNC?", options: ["Central Numerical Control","Computer Numerical Control","Common NC","Complex NC"], correct: 1 }
        ]
    };

    targetSec.topics.unshift(historyTopic);
})();