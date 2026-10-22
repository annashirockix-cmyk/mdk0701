"use strict";

// ★ Ваша рабочая ссылка из Google Apps Script (обязательно должна заканчиваться на /exec)
var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw3Ev3stuvLl36nxjmXU0q2zi4UsS5ViXwEj1x6q_JjlCccMJld36o6y1H__CvJn5KB/exec";

async function fetchAPI(action, params = {}, method = "GET") {
    // Проверка, что ссылка указана верно
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("ВАША_ССЫЛКА")) {
        console.error("Ошибка: В файле api.js не указана ссылка на Google Apps Script!");
        return { ok: false, error: "URL not configured" };
    }

    const url = new URL(APPS_SCRIPT_URL);
    url.searchParams.append("action", action);
    url.searchParams.append("t", Date.now()); // Защита от кэша
    
    // Добавляем остальные параметры
    for (const key in params) { 
        if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key]); 
        } 
    }
    
    // Таймаут на 60 секунд, чтобы страница не висела при плохом интернете
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); 
    
    try {
        const options = { 
            signal: controller.signal, 
            cache: "no-store",
            // ★ ВАЖНО: text/plain помогает обойти CORS preflight (OPTIONS) запросы
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        };
        
        if (method === "POST") { 
            options.method = "POST"; 
            options.body = url.searchParams; 
        }
        
        const response = await fetch(url.toString(), options);
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status} (${response.statusText})`);
        }
        
        const data = await response.json();
        return data;
        
    } catch (err) {
        clearTimeout(timeoutId);
        console.error(`API Error [${action}]:`, err);
        // Возвращаем объект с ошибкой, чтобы приложение не падало полностью
        return { ok: false, error: err.message || "Network error" };
    }
}

// Экспортируем методы для использования в других файлах (app.js, journal.js и т.д.)
window.API = {
    login: (user, pass) => fetchAPI("login", { username: user, password: pass }),
    
    getStudents: () => fetchAPI("getstudents"),
    getStudentData: (key) => fetchAPI("getstudentdata", { key: key }),
    
    saveStudent: (key, name, group, payload) => fetchAPI("save", { key, name, group, payload }, "POST"),
    grantXP: (key, amount) => fetchAPI("grantXP", { key, amount }, "POST"),
    deleteStudent: (key) => fetchAPI("deleteStudent", { key: key }, "POST"),
    
    getChat: (group) => fetchAPI("chatload", { group }),
    sendChat: (group, key, name, text) => fetchAPI("chatsave", { group, key, name, text }, "POST"),
    
    getSchedule: () => fetchAPI("getschedule"),
    saveSchedule: (data) => fetchAPI("saveschedule", { data: JSON.stringify(data) }, "POST")
};
