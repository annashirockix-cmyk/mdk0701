"use strict";

// ВСТАВЬТЕ СЮДА ВАШУ ССЫЛКУ ИЗ GOOGLE APPS SCRIPT (см. Шаг 3)
var APPS_SCRIPT_URL = "https://docs.google.com/spreadsheets/d/1lpNmnxr8TCaG-3-FpqUMU1wMAHQmk82jNlnSRDGASDQ/edit?gid=1051580763#gid=1051580763";

async function fetchAPI(action, params = {}, method = "GET") {
    if (APPS_SCRIPT_URL.includes("ВАША_ССЫЛКА")) {
        alert("Ошибка: В файле api.js не указана ссылка на Google Apps Script!");
        return { ok: false, error: "URL not configured" };
    }

    const url = new URL(APPS_SCRIPT_URL);
    url.searchParams.append("action", action);
    url.searchParams.append("t", Date.now()); 
    
    for (const key in params) { 
        if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key]); 
        } 
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); 
    
    try {
        const options = { 
            signal: controller.signal, 
            cache: "no-store",
            // Добавляем заголовки, чтобы браузер не блокировал запрос
            headers: {
                "Accept": "application/json"
            }
        };
        
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
