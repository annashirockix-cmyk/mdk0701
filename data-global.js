"use strict";

window.GLOBAL_DATA = {
  // Локальные видео (файлы должны лежать в папке video/ в корне репозитория)
  videos: [
    { title: "Видеоурок 1: Введение", description: "Основы ЧПУ", file: "video/1.mp4" },
    { title: "Видеоурок 2: G-коды", description: "Разбор команд", file: "video/2.mp4" },
    { title: "Видеоурок 3: Наладка", description: "Практические приемы", file: "video/3.mp4" },
    { title: "Видеоурок 4", description: "Учебный материал", file: "video/4.mp4" },
    { title: "Видеоурок 5", description: "Учебный материал", file: "video/5.mp4" },
    { title: "Видеоурок 6", description: "Учебный материал", file: "video/6.mp4" },
    { title: "Видеоурок 7", description: "Учебный материал", file: "video/7.mp4" },
    { title: "Видеоурок 8", description: "Учебный материал", file: "video/8.mp4" },
    { title: "Видеоурок 9", description: "Учебный материал", file: "video/9.mp4" }
  ],
  
  // Пути к PDF (Папка passport должна существовать)
  passports: [
    { title: "Паспорт станка 2Д450", description: "Радиально-сверлильный станок", file: "passport/2d450.pdf" },
    { title: "Паспорт станка 2С108П", description: "Вертикально-сверлильный станок", file: "passport/2s108p.pdf" },
    { title: "Паспорт станка 16К40", description: "Токарно-винторезный станок", file: "passport/16k40.pdf" },
    { title: "Паспорт станка X6142", description: "Универсальный консольно-фрезерный станок", file: "passport/MODEL-X6142-UNIVERSAL_RU.pdf" }
  ],
  
  // Инструкции (папка ohranatruda)
  safety: [
    { title: "ИОТ для токаря", description: "Инструкция по охране труда", file: "ohranatruda/иот токаря.docx" },
    { title: "ИОТ для фрезеровщика", description: "Инструкция по охране труда", file: "ohranatruda/иот фрезер.docx" },
    { title: "ИОТ при работе на вертикально-протяжном станке", description: "Инструкция", file: "ohranatruda/иот при работе на вертикально-протяжном.docx" },
    { title: "ИОТ для карабашки", description: "Инструкция", file: "ohranatruda/иот карабашки.docx" },
    { title: "Инструкция по охране труда (общая)", description: "Общие требования", file: "ohranatruda/Инструкция по охране труда.docx" }
  ],
  
  formatting: {
    title: "Требования к оформлению работ",
    content: `<h3>Общие правила</h3>
      <ul>
        <li><b>Шрифт:</b> Times New Roman, 14 пт.</li>
        <li><b>Интервал:</b> 1.5.</li>
        <li><b>Поля:</b> левое — 3 см, правое — 1.5 см, верхнее/нижнее — 2 см.</li>
        <li><b>Абзацный отступ:</b> 1.25 см.</li>
      </ul>`
  }
};