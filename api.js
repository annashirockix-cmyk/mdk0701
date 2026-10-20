"use strict";

/* ============================================================
   ВАЖНО: Вставьте сюда ссылку из Google Apps Script.
   Она находится в меню: Развернуть -> Управление развертываниями 
   -> Ваше развертывание (Веб-приложение) -> URL.
   Ссылка должна заканчиваться на /exec
   ============================================================ */
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw3Ev3stuvLl36nxjmXU0q2zi4UsS5ViXwEj1x6q_JjlCccMJld36o6y1H__CvJn5KB/exec";

async function fetchAPI(action, params = {}, method = "GET") {
    // Проверка, что ссылка заменена (защита от ошибок)
    if (APPS_SCRIPT_URL.includes("ВАША_НОВАЯ_ССЫЛКА")) {
        alert("Ошибка: В файле api.js не указана ссылка на Google Apps Script!");
        return { ok: false, error: "URL not configured" };
    }

    const url = new URL(APPS_SCRIPT_URL);
    url.searchParams.append("action", action);
    url.searchParams.append("t", Date.now()); // Защита от кэша
    
    for (const key in params) { 
        if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key]); 
        } 
    }
    
    const controller = new AbortController();
    // Таймаут 60 секунд (Google Apps Script иногда отвечает долго)
    const timeoutId = setTimeout(() => controller.abort(), 60000); 
    
    try {
        const options = { signal: controller.signal, cache: "no-store" };
        if (method === "POST") { 
            options.method = "POST"; 
            options.body = url.searchParams; 
        }
        const response = await fetch(url.toString(), options);
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
        
        const data = await response.json();
        return data;
    } catch (err) {
        clearTimeout(timeoutId);
        console.error(`API Error [${action}]:`, err);
        throw err;
    }
}

window.API = {
    // Авторизация
    login: (user, pass) => fetchAPI("login", { username: user, password: pass }),
    
    // Студенты
    getStudents: () => fetchAPI("getstudents"),
    getStudentData: (key) => fetchAPI("getstudentdata", { key: key }),
    saveStudent: (key, name, group, payload) => fetchAPI("save", { key, name, group, payload }, "POST"),
    grantXP: (key, amount) => fetchAPI("grantXP", { key, amount }, "POST"),
    deleteStudent: (key) => fetchAPI("deleteStudent", { key: key }, "POST"),

    // Чат
    getChat: (group) => fetchAPI("chatload", { group }),
    sendChat: (group, key, name, text) => fetchAPI("chatsave", { group, key, name, text }, "POST"),

    // Расписание
    getSchedule: () => fetchAPI("getschedule"),
    saveSchedule: (data) => fetchAPI("saveschedule", { data: JSON.stringify(data) }, "POST")
};