"use strict";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxpDY50bUB8gDHnyzLaX_FP2IKX6QOAD4iw9ATxofJu1uCDH7Z_bjsvfCsx8NZmOxHH/exec";

async function fetchAPI(action, params = {}, method = "GET") {
    const url = new URL(APPS_SCRIPT_URL);
    url.searchParams.append("action", action);
    for (const key in params) { if (params[key] !== undefined && params[key] !== null) url.searchParams.append(key, params[key]); }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
        const options = { signal: controller.signal, cache: "no-store" };
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
    saveStudent: (key, name, group, payload) => fetchAPI("save", { key, name, group, payload }, "POST")
};