"use strict";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzB0v37m5pC0jSnEmCEllIlN3IlRmgOhaPEW9giHbS6wNIYFHClxJv8Z5HyG4-AJBpdaQ/exec";

async function fetchAPI(action, params = {}, method = "GET") {
    const url = new URL(APPS_SCRIPT_URL);
    url.searchParams.append("action", action);
    for (const key in params) { if (params[key] !== undefined && params[key] !== null) url.searchParams.append(key, params[key]); }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Ждем максимум 8 секунд

    try {
        const options = { cache: "no-store", signal: controller.signal };
        if (method === "POST") { options.method = "POST"; options.body = url.searchParams; }
        
        const response = await fetch(url.toString(), options);
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
        return await response.json();
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}

window.API = {
    login: (user, pass) => fetchAPI("login", { username: user, password: pass }),
    getStudents: () => fetchAPI("getstudents"),
    saveStudent: (key, name, group, payload) => fetchAPI("save", { key, name, group, payload }, "POST"),
    grantXP: (key, amount) => fetchAPI("grantxp", { key, amount }, "POST")
};