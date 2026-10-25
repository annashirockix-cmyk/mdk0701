"use strict";

window.renderNewExam = function(courseId) {
    var app = document.getElementById("app");
    app.innerHTML = `<a class="backlink" href="#/" style="color:var(--accent);">← На главную</a>
    <section class="hero"><h1>📋 Итоговый экзамен</h1><p>30 вопросов · 2 письменных задания · 45 минут</p></section>
    <div class="module" id="examBox">
        <button class="btn" onclick="window.startExam('${courseId}')" style="width:100%; padding:20px; font-size:18px;">Начать экзамен</button>
    </div>`;
};

window.startExam = function(courseId) {
    var baseQuestions = [];
    var data = window.MDK_DATA[courseId];
    if (data && data.sections) {
        data.sections.forEach(s => s.topics.forEach(t => {
            if (t.test) baseQuestions = baseQuestions.concat(t.test);
        }));
    }
    
    // Добиваем до 30 вопросов, если их мало (используем заглушки для теста)
    while(baseQuestions.length < 30) {
        baseQuestions.push({ q: "Дополнительный вопрос по МДК (проверка знаний №" + (baseQuestions.length + 1) + ")", options: ["Вариант А", "Вариант Б", "Вариант В", "Вариант Г"], correct: 0 });
    }
    
    var examQuestions = baseQuestions.sort(() => 0.5 - Math.random()).slice(0, 30);
    var timeLeft = 45 * 60; // 45 минут
    
    var formHtml = `<div id="exTimer" style="font-size:24px; font-weight:bold; color:var(--err); text-align:center; margin-bottom:20px;">45:00</div><form id="examForm">`;
    
    // Тестовая часть
    examQuestions.forEach((q, i) => {
        formHtml += `<div style="margin-bottom:15px; padding:15px; background:var(--card-soft); border-radius:8px; border:1px solid var(--border);">
            <b>${i+1}. ${q.q}</b><br>`;
        q.options.forEach((opt, j) => {
            formHtml += `<label style="display:block; margin-top:5px; cursor:pointer;"><input type="radio" name="q${i}" value="${j}" style="margin-right:8px;"> ${opt}</label>`;
        });
        formHtml += `</div>`;
    });
    
    // Письменная часть
    formHtml += `<h3 style="margin-top:30px; color:var(--accent);">✍️ Письменные задания (на проверку преподавателю)</h3>
    <div style="margin-bottom:15px; padding:15px; background:var(--card-soft); border-radius:8px; border:1px solid var(--border);">
        <b>31. Опишите алгоритм наладки станка с ЧПУ.</b><br>
        <textarea name="written1" class="self-input" rows="4" style="margin-top:10px;" placeholder="Ваш ответ..."></textarea>
    </div>
    <div style="margin-bottom:15px; padding:15px; background:var(--card-soft); border-radius:8px; border:1px solid var(--border);">
        <b>32. Рассчитайте частоту вращения шпинделя, если V=120 м/мин, D=50 мм (ответ с решением).</b><br>
        <textarea name="written2" class="self-input" rows="2" style="margin-top:10px;" placeholder="Ваш ответ..."></textarea>
    </div>
    <button type="button" class="btn" onclick="window.finishExam()" style="width:100%; padding:15px; background:var(--ok); color:#000;">Завершить экзамен</button>
    </form>`;
    
    document.getElementById("examBox").innerHTML = formHtml;
    window._currentExamQuestions = examQuestions;
    
    var timerEl = document.getElementById("exTimer");
    window._examTimer = setInterval(() => {
        timeLeft--;
        var m = Math.floor(timeLeft / 60), s = timeLeft % 60;
        timerEl.textContent = `${m}:${s < 10 ? '0'+s : s}`;
        if (timeLeft <= 0) { clearInterval(window._examTimer); window.finishExam(); }
    }, 1000);
};

window.finishExam = function() {
    clearInterval(window._examTimer);
    var form = document.getElementById("examForm");
    var correct = 0;
    
    window._currentExamQuestions.forEach((q, i) => {
        var ch = form.querySelector(`input[name="q${i}"]:checked`);
        if (ch && parseInt(ch.value) === q.correct) correct++;
    });
    
    var pct = Math.round((correct / 30) * 100);
    var grade = pct >= 90 ? 5 : pct >= 75 ? 4 : pct >= 60 ? 3 : 2;
    
    var w1 = form.querySelector('textarea[name="written1"]').value;
    var w2 = form.querySelector('textarea[name="written2"]').value;
    
    // СОХРАНЯЕМ ОЦЕНКУ В РЕЗУЛЬТАТЫ
    if (!window.state.results) window.state.results = {};
    window.state.results["__final__"] = { grade: grade, total: correct, max: 30 };
    
    if (!window.state.examSubmissions) window.state.examSubmissions = [];
    window.state.examSubmissions.push({
        date: new Date().toLocaleString(),
        student: window.state.student ? window.state.student.name : "Неизвестный",
        group: window.state.student ? window.state.student.group : "",
        testScore: correct,
        maxTest: 30,
        written1: w1,
        written2: w2,
        status: "На проверке",
        teacherGrade: null
    });
    window.saveStudentData();
    
    document.getElementById("examBox").innerHTML = `
        <div style="text-align:center; padding:40px;">
            <h1 style="color:var(--ok);">🎉 Экзамен сдан!</h1>
            <p style="font-size:20px;">Тестовых ответов: <b>${correct} из 30</b></p>
            <h1 style="font-size:60px; margin:20px 0; color:var(--accent);">Оценка: ${grade}</h1>
            <p>Письменные задания отправлены преподавателю на проверку.</p>
            <a href="#/" class="btn" style="margin-top:20px;">На главную</a>
        </div>`;
};