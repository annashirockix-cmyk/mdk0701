/* ============================================================
   МДК 07.01 — api.js (Модуль работы с сетью)
   ============================================================ */
"use strict";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzB0v37m5pC0jSnEmCEllIlN3IlRmgOhaPEW9giHbS6wNIYFHClxJv8Z5HyG4-AJBpdaQ/exec";

// Безопасный fetch с таймаутом (10 секунд)
async function fetchAPI(action, params = {}, method = "GET") {
    const url = new URL(APPS_SCRIPT_URL);
    url.searchParams.append("action", action);
    url.searchParams.append("t", Date.now()); // Сброс кэша
    
    for (const key in params) {
        if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key]);
        }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const options = { signal: controller.signal, cache: "no-store" };
        if (method === "POST") {
            options.method = "POST";
            options.body = url.searchParams; // Отправляем как form-data
        }

        const response = await fetch(url.toString(), options);
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
        
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("Ошибка парсинга JSON. Сервер вернул:", text.substring(0, 100));
            throw new Error("Сервер вернул некорректные данные (не JSON)");
        }
    } catch (err) {
        clearTimeout(timeoutId);
        console.error("API Error:", err);
        if (err.name === "AbortError") throw new Error("Сервер не отвечает. Превышено время ожидания.");
        throw err;
    }
}

// Обертки для удобства
window.API = {
    login: (user, pass) => fetchAPI("login", { username: user, password: pass }),
    getStudents: () => fetchAPI("getstudents"),
    getStudentData: (key) => fetchAPI("getstudentdata", { key: key }),
    saveStudent: (key, name, group, payload) => fetchAPI("save", { key, name, group, payload }, "POST"),
    grantXP: (key, amount) => fetchAPI("grantxp", { key, amount }, "POST"),
    approveWork: (key, topicId, code, grade) => fetchAPI("approvework", { key, topicId, code, grade }, "POST"),
    getSchedule: () => fetchAPI("getschedules"),
    getChat: (group) => fetchAPI("chatload", { group }),
    sendChat: (group, key, name, text) => fetchAPI("chatsave", { group, key, name, text }, "POST"),
    loadComments: () => fetchAPI("loadcomments"),
    saveComment: (name, group, text) => fetchAPI("savecomment", { name, group, text }, "POST"),
    giveAchievement: (key, title, icon) => fetchAPI("giveachievement", { key, title, icon }, "POST")
};