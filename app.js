// ================= РЕНДЕР ТЕМЫ (Лекции, Тесты) =================
window.renderTopic = function(topicId, activeTab) {
    var app = $("app"); if (!app) return; app.innerHTML = "";
    var topic = null;
    var foundCourseId = null;
    
    // 1. Ищем тему в текущем курсе
    if (window.COURSE && window.COURSE.sections) {
        window.COURSE.sections.forEach(s => {
            s.topics.forEach(t => { if (t.id === topicId) topic = t; });
        });
    }
    
    // 2. Если не нашли — ищем во ВСЕХ курсах
    if (!topic && window.MDK_DATA) {
        for (var cid in window.MDK_DATA) {
            var c = window.MDK_DATA[cid];
            if (c.sections) {
                c.sections.forEach(s => {
                    s.topics.forEach(t => { 
                        if (t.id === topicId) { 
                            topic = t; 
                            foundCourseId = cid;
                        } 
                    });
                });
            }
        }
    }
    
    if (!topic) { app.innerHTML = '<div class="module">Тема не найдена.</div>'; return; }
    
    // 3. Если тема найдена в другом курсе — переключаем селектор
    if (foundCourseId && window.state.activeCourseId !== foundCourseId) {
        window.state.activeCourseId = foundCourseId;
        window.COURSE = window.MDK_DATA[foundCourseId];
        var selector = document.getElementById("mdkSelector");
        if (selector) selector.value = foundCourseId;
    }

    app.appendChild(el('<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>'));
    app.appendChild(el(`<section class="hero"><span class="brand-badge">${topic.code}</span><h1>${topic.title}</h1></section>`));
    
    var tabs = [];
    if (topic.lectures && topic.lectures.length) tabs.push({ id: 'lectures', label: '📖 Лекции' });
    if (topic.practicals && topic.practicals.length) tabs.push({ id: 'practicals', label: '🛠 Практика' });
    if (topic.selfWork && topic.selfWork.length) tabs.push({ id: 'selfWork', label: '✍️ Самостоятельная' });
    // Поддерживаем и test, и tests (на случай старых данных)
    if ((topic.test && topic.test.length) || (topic.tests && topic.tests.length)) tabs.push({ id: 'test', label: '📝 Тест' });
    if (topic.presentations && topic.presentations.length) tabs.push({ id: 'presentations', label: '📊 Презентации' });

    // Исправление: URL приходит как 'lecture', а ID вкладки 'lectures'
    if (!activeTab || activeTab === 'lecture') activeTab = 'lectures';
    if (activeTab === 'practical') activeTab = 'practicals';

    var tabHtml = '<div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap;">';
    tabs.forEach(t => {
        var activeClass = (t.id === activeTab) ? 'active' : '';
        tabHtml += `<button class="tab ${activeClass}" onclick="window.renderTopic('${topicId}', '${t.id}')">${t.label}</button>`;
    });
    tabHtml += '</div>';
    app.appendChild(el(tabHtml));

    var contentBox = el('<div class="module"></div>');
    app.appendChild(contentBox);

    if (activeTab === 'lectures' && topic.lectures) {
        topic.lectures.forEach(lec => {
            contentBox.innerHTML += `<h3>${lec.code} ${lec.title}</h3><div style="line-height:1.6; margin-bottom:30px;">${lec.content}</div>`;
        });
        if(window.addXP) window.addXP(5); // Бонус за прочтение
    } 
    else if (activeTab === 'practicals' && topic.practicals) {
        topic.practicals.forEach(p => {
            contentBox.innerHTML += `<div style="margin-bottom:20px; padding:15px; background:var(--card-soft); border-radius:8px; border:1px solid var(--border);">
                <h4 style="margin-top:0; color:var(--accent);">${p.code} ${p.title}</h4>
                <p><b>Цель:</b> ${p.goal}</p>
                <p><b>Задание:</b> ${p.task}</p>
                ${p.variants ? '<p><b>Варианты:</b></p><ul>' + p.variants.map(v => `<li>${v}</li>`).join('') + '</ul>' : ''}
            </div>`;
        });
    } 
    else if (activeTab === 'selfWork' && topic.selfWork) {
        topic.selfWork.forEach(sw => {
            contentBox.innerHTML += `<div style="margin-bottom:20px; padding:15px; background:var(--card-soft); border-radius:8px; border:1px solid var(--border);">
                <h4 style="margin-top:0; color:var(--accent);">${sw.code} ${sw.title}</h4>
                <p><b>Задание:</b> ${sw.task}</p>
                ${sw.questions ? '<p><b>Контрольные вопросы:</b></p><ul>' + sw.questions.map(q => `<li>${q}</li>`).join('') + '</ul>' : ''}
            </div>`;
        });
    } 
    else if (activeTab === 'test' && (topic.test || topic.tests)) {
        contentBox.innerHTML = `<p>В этой теме доступен тест для проверки знаний.</p>
            <div style="display:flex; gap:10px; margin-top:20px; flex-wrap:wrap;">
                <a href="#/training/${window.state.activeCourseId}" class="btn">🎯 Перейти к тренировке</a>
                <a href="#/final/${window.state.activeCourseId}" class="btn ghost">📋 Пройти экзамен</a>
            </div>`;
    } 
    else if (activeTab === 'presentations' && topic.presentations) {
        topic.presentations.forEach(p => {
            contentBox.innerHTML += `<div style="margin-bottom:15px; padding:15px; background:var(--card-soft); border-radius:8px;">
                <h4 style="margin-top:0;">${p.code} ${p.title}</h4>
                <p>${p.description}</p>
                <a href="${p.file}" download class="btn ghost" style="padding:6px 12px; font-size:12px;">Скачать (${p.slides} слайдов)</a>
            </div>`;
        });
    }
};
