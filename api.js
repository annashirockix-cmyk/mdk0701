"use strict";

// Вставлен ваш новый URL от Google Apps Script
var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw3Ev3stuvLl36nxjmXU0q2zi4UsS5ViXwEj1x6q_JjlCccMJld36o6y1H__CvJn5KB/exec";

async function fetchAPI(action, params = {}, method = "GET") {
    // Проверка на случай, если URL забыли поменять
    if (APPS_SCRIPT_URL.includes("ВАША_НОВАЯ_ССЫЛКА")) {
        alert("Ошибка: В файле api.js не указана ссылка на Google Apps Script!");
        return { ok: false, error: "URL not configured" };
    }

    const url = new URL(APPS_SCRIPT_URL);
    url.searchParams.append("action", action);
    
    // Добавляем временную метку, чтобы браузер не кэшировал GET-запросы
    url.searchParams.append("t", Date.now());
    
    // Добавляем все переданные параметры
    for (const key in params) {
        if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key]);
        }
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // Таймаут 60 секунд
    
    try {
        const options = { signal: controller.signal, cache: "no-store" };
        
        // Если метод POST, параметры уходят в теле запроса
        if (method === "POST") {
            options.method = "POST";
            options.body = url.searchParams;
        }
        
        const response = await fetch(url.toString(), options);
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (err) {
        clearTimeout(timeoutId);
        console.error(`API Error [${action}]:`, err);
        throw err;
    }
}

// Экспортируем объект API для использования в других файлах (app.js, journal.js и т.д.)
window.API = {
    // Авторизация преподавателя
    login: (user, pass) => fetchAPI("login", { username: user, password: pass }),
    
    // Получение списка всех студентов
    getStudents: () => fetchAPI("getstudents"),
    
    // Получение данных конкретного студента по ключу (ФИО|Группа)
    getStudentData: (key) => fetchAPI("getstudentdata", { key: key }),
    
    // Сохранение данных студента (XP, результаты тестов, аватар и т.д.)
    saveStudent: (key, name, group, payload) => fetchAPI("save", { key, name, group, payload }, "POST"),
    
    // Начисление XP преподавателем вручную
    grantXP: (key, amount) => fetchAPI("grantXP", { key, amount }, "POST"),
    
    // Удаление студента (если используется)
    deleteStudent: (key) => fetchAPI("deleteStudent", { key: key }, "POST"),
    
    // Загрузка сообщений чата группы
    getChat: (group) => fetchAPI("chatload", { group }),
    
    // Отправка сообщения в чат
    sendChat: (group, key, name, text) => fetchAPI("chatsave", { group, key, name, text }, "POST"),
    
    // Получение расписания
    getSchedule: () => fetchAPI("getschedule"),
    
    // Сохранение расписания (преподавателем)
    saveSchedule: (data) => fetchAPI("saveschedule", { data: JSON.stringify(data) }, "POST")
};