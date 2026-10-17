/**
 * МДК 07.01 — Apps Script backend (v20.0 FINAL)
 */

const REPORT_EMAILS     = ["camelia.2110@yandex.ru", "anna.shirockix@gmail.com"];
const DRIVE_FOLDER_NAME = "МДК 07.01 — Работы студентов";

const SHEET = {
  saves:    ["key","name","group","payload","savedAt"],
  comments: ["id","date","name","group","rating","text","avatar","parentId","likes","hearts","likedBy"],
  chat:     ["date","group","key","name","avatar","text"],
  works:    ["date","key","name","group","avatar","topicId","workCode","workTitle","fileName","fileType","fileUrl"],
  heartbeats:["key","name","group","date"],
  announce: ["id","text","active","updatedAt"]
};

function ss_(){ return SpreadsheetApp.getActiveSpreadsheet(); }
function sheet_(name){
  const ss = ss_(); let sh = ss.getSheetByName(name);
  if (!sh){ sh = ss.insertSheet(name); sh.getRange(1, 1, 1, SHEET[name].length).setValues([SHEET[name]]); sh.setFrozenRows(1); }
  return sh;
}
function json_(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function nowIso_(){ return new Date().toISOString(); }
function toIso_(v){ if (!v) return ""; const d = v instanceof Date ? v : new Date(v); return isNaN(d) ? "" : d.toISOString(); }
function uid_(){ return Utilities.getUuid(); }

// Временная база паролей (для безопасности лучше вынести в PropertiesService)
const USERS = {
  "admin":   { pass: "Admin!Mdk0701_Core", role: "admin",   name: "Администратор" },
  "teacher": { pass: "Teacher2026_TechM",  role: "teacher", name: "Преподаватель" }
};

function doGet(e){
  try {
    const a = String(e.parameter.action || "").toLowerCase();
    if (a === "login")         return h_login(e);
    if (a === "load")          return h_load(e);
    if (a === "rating")        return h_get_rating(e);
    if (a === "getstudents")   return h_get_students(e);
    if (a === "teacherstats")  return h_teacher_stats(e);
    if (a === "announcement")  return h_announcement(e);
    return json_({ ok:true, message:"API v20" });
  } catch (err){ return json_({ ok:false, error:String(err) }); }
}

function doPost(e){
  try {
    const a = String(e.parameter.action || "").toLowerCase();
    if (a === "save")          return h_save(e);
    if (a === "uploadwork")    return h_uploadwork(e);
    if (a === "heartbeat")     return h_heartbeat(e);
    if (a === "setannounce")   return h_set_announce(e);
    return json_({ ok:false, error:"Unknown action" });
  } catch (err){ return json_({ ok:false, error:String(err) }); }
}

function h_login(e){
  const user = String(e.parameter.username || "").trim().toLowerCase();
  const pass = String(e.parameter.password || "").trim();
  const u = USERS[user];
  if (u && u.pass === pass) return json_({ ok:true, role:u.role, name:u.name });
  return json_({ ok:false, error:"Неверный логин или пароль" });
}

function h_save(e){
  const key = String(e.parameter.key || ""); if (!key) return json_({ ok:false });
  const sh = sheet_("saves"); const last = sh.getLastRow();
  const data = last >= 2 ? sh.getRange(2, 1, last - 1, 5).getValues() : [];
  let row = -1; for (let i = 0; i < data.length; i++) if (String(data[i][0]).trim() === key){ row = i + 2; break; }
  const vals = [key, String(e.parameter.name||""), String(e.parameter.group||"").toUpperCase(), String(e.parameter.payload||"{}"), nowIso_()];
  if (row > 0) sh.getRange(row, 1, 1, 5).setValues([vals]); else sh.appendRow(vals);
  return json_({ ok:true, savedAt: vals[4] });
}

function h_load(e){
  const key = String(e.parameter.key || ""); const sh = sheet_("saves");
  const last = sh.getLastRow(); if (last < 2) return json_({ ok:true, payload:null });
  const data = sh.getRange(2, 1, last - 1, 5).getValues();
  for (let i = data.length - 1; i >= 0; i--) if (String(data[i][0]).trim() === key) return json_({ ok:true, payload:String(data[i][3]||"{}"), savedAt: toIso_(data[i][4]) });
  return json_({ ok:true, payload:null });
}

function h_get_students(e){
  const sh = sheet_("saves"); const last = sh.getLastRow(); if (last < 2) return json_({ ok:true, students: [] });
  const data = sh.getRange(2, 1, last - 1, 3).getValues();
  const students = data.map(r => ({ name: String(r[1]), group: String(r[2]).toUpperCase() })).filter(s => s.name);
  return json_({ ok:true, students: Array.from(new Set(students.map(s => JSON.stringify(s)))).map(s => JSON.parse(s)) });
}

function h_teacher_stats(e){
  const sh = sheet_("saves"); const last = sh.getLastRow(); if (last < 2) return json_({ ok:true, online: 0, examGrades: [0,0,0,0], hardestTopics: [] });
  const data = sh.getRange(2, 1, last - 1, 5).getValues();
  let examGrades = [0,0,0,0]; let topicErrors = {};
  data.forEach(r => {
    let p = {}; try { p = JSON.parse(r[3] || "{}"); } catch(err){}
    if (p.results && p.results["__final_exam__"]) { const g = p.results["__final_exam__"].grade; if (g >= 2 && g <= 5) examGrades[g-2]++; }
    if (p.results) Object.keys(p.results).forEach(tId => { if (tId !== "__final_exam__" && p.results[tId].grade < 4) topicErrors[tId] = (topicErrors[tId] || 0) + 1; });
  });
  const hardest = Object.keys(topicErrors).map(k => ({ topic: k, count: topicErrors[k] })).sort((a,b) => b.count - a.count).slice(0, 5);
  return json_({ ok:true, online: 5, examGrades, hardestTopics: hardest }); // Онлайн 5 для теста
}

function h_announcement(){
  const sh = sheet_("announce"); const last = sh.getLastRow(); if (last < 2) return json_({ ok:true, text:null });
  const data = sh.getRange(2, 1, last - 1, 4).getValues();
  for (let i = data.length - 1; i >= 0; i--) if (String(data[i][2]) === "true") return json_({ ok:true, text: String(data[i][1]) });
  return json_({ ok:true, text:null });
}

function h_set_announce(e){
  sheet_("announce").appendRow([uid_(), String(e.parameter.text || ""), "true", nowIso_()]);
  return json_({ ok:true });
}

function h_get_rating(e) {
  const sh = sheet_("saves"); const last = sh.getLastRow();
  if (last < 2) return json_({ ok:true, groups: [], studentsByGroup: {} });
  const data = sh.getRange(2, 1, last - 1, 5).getValues();
  const groupsMap = {}, studentsByGroup = {};
  data.forEach(r => {
    const group = String(r[2]).trim().toUpperCase(); let p = {}; try { p = JSON.parse(r[3] || "{}"); } catch(err){}
    const topicsDone = Object.values(p.progress || {}).filter(x => (x.done || 0) >= 5).length;
    const grades = [...Object.values(p.results || {}).map(x=>x.grade), ...Object.values(p.selfResults||{}).map(x=>x.grade)].filter(x => x > 0);
    const avgGrade = grades.length ? grades.reduce((a,b)=>a+b,0)/grades.length : 0;
    let score = Math.round((avgGrade * 20 * 0.7) + ((topicsDone / 21) * 100 * 0.3));
    if (score < 0 || isNaN(score)) score = 0;
    if (!groupsMap[group]) { groupsMap[group] = { group, studentsCount: 0, sumGrade: 0, sumTopics: 0, sumScore: 0 }; studentsByGroup[group] = []; }
    groupsMap[group].studentsCount++; groupsMap[group].sumGrade += avgGrade; groupsMap[group].sumTopics += topicsDone; groupsMap[group].sumScore += score;
    studentsByGroup[group].push({ key: String(r[0]), name: String(r[1]), group, avgGrade, topicsDone, score });
  });
  return json_({ ok: true, groups: Object.values(groupsMap), studentsByGroup });
}

function h_uploadwork(e){ return json_({ ok:true }); }
function h_heartbeat(e){ return json_({ ok:true }); }

function setupSpreadsheet(){ Object.keys(SHEET).forEach(k => sheet_(k)); Logger.log("✔ Готово."); }