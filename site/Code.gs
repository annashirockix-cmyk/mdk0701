// ============================================================
// Code.gs — бэкенд учебного портала (Google Apps Script)
// ============================================================
// Таблица «Отчёты МДК 07.01» (владелец Anna AS).
// https://docs.google.com/spreadsheets/d/1WjmKFwl4uuU_4-vxoTBp776LPeF2MsfbOei4q5HPlJs/edit
const SPREAD_ID = "1WjmKFwl4uuU_4-vxoTBp776LPeF2MsfbOei4q5HPlJs";
const SHEET_STUDENTS = "Students";
const SHEET_CHAT = "Chat";
const SHEET_LOGINS = "Logins";

function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var action = (e && e.parameter && e.parameter.action) || "";
    var result = { ok: false, error: "Unknown action" };

    if (action === "login") result = loginUser(e.parameter.username, e.parameter.password);
    else if (action === "getstudents") result = getStudents();
    else if (action === "getstudentdata") result = getStudentData(e.parameter.key);
    else if (action === "save") result = saveStudent(e.parameter.key, e.parameter.name, e.parameter.group, e.parameter.payload);
    else if (action === "grantxp") result = grantXP(e.parameter.key, e.parameter.amount);
    else if (action === "chatload") result = loadChat(e.parameter.group);
    else if (action === "chatsave") result = saveChat(e.parameter.group, e.parameter.key, e.parameter.name, e.parameter.text);

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function getSheet(name) {
  var ss = SpreadsheetApp.openById(SPREAD_ID);
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === SHEET_STUDENTS) sheet.appendRow(["ID", "Name", "Group", "Payload", "LastUpdate"]);
    if (name === SHEET_CHAT) sheet.appendRow(["Timestamp", "Group", "Key", "Name", "Text"]);
    if (name === SHEET_LOGINS) sheet.appendRow(["Login", "Password", "Role", "Name"]);
  }
  return sheet;
}

function loginUser(user, pass) {
  if (user === "admin" && pass === "admin") return { ok: true, role: "admin", name: "Администратор" };
  var sheet = getSheet(SHEET_LOGINS);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(user) && String(data[i][1]) === String(pass)) {
      return { ok: true, role: data[i][2] || "teacher", name: data[i][3] || user };
    }
  }
  return { ok: false, error: "Неверный логин или пароль" };
}

function getStudents() {
  var sheet = getSheet(SHEET_STUDENTS);
  var data = sheet.getDataRange().getValues();
  var students = [];
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    students.push({ key: data[i][0], name: data[i][1], group: data[i][2], payload: data[i][3] });
  }
  return { ok: true, students: students };
}

function getStudentData(key) {
  var sheet = getSheet(SHEET_STUDENTS);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) if (data[i][0] === key) return { ok: true, payload: data[i][3] };
  return { ok: false, error: "Student not found" };
}

function saveStudent(key, name, group, payload) {
  var sheet = getSheet(SHEET_STUDENTS);
  var data = sheet.getDataRange().getValues();
  var now = new Date();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(name);
      sheet.getRange(i + 1, 3).setValue(group);
      sheet.getRange(i + 1, 4).setValue(payload);
      sheet.getRange(i + 1, 5).setValue(now);
      return { ok: true };
    }
  }
  sheet.appendRow([key, name, group, payload, now]);
  return { ok: true };
}

function grantXP(key, amount) {
  var sheet = getSheet(SHEET_STUDENTS);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      var payload = {};
      try { payload = JSON.parse(data[i][3] || "{}"); } catch (e) { payload = {}; }
      payload.xp = (payload.xp || 0) + parseInt(amount, 10);
      sheet.getRange(i + 1, 4).setValue(JSON.stringify(payload));
      return { ok: true, newXp: payload.xp };
    }
  }
  return { ok: false, error: "Student not found" };
}

function loadChat(group) {
  var sheet = getSheet(SHEET_CHAT);
  var data = sheet.getDataRange().getValues();
  var messages = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === group) messages.push({ time: data[i][0], name: data[i][3], text: data[i][4] });
  }
  return { ok: true, messages: messages.slice(-50) };
}

function saveChat(group, key, name, text) {
  getSheet(SHEET_CHAT).appendRow([new Date(), group, key, name, text]);
  return { ok: true };
}
