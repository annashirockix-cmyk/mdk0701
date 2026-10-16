/**
 * МДК 07.01 — Apps Script backend v4 (роли)
 * Логины/пароли: admin / teacher / curator / tester1..tester5
 */

const REPORT_EMAILS     = ["camelia.2110@yandex.ru", "anna.shirockix@gmail.com"];
const COMMENT_TTL_YEARS = 5;
const DRIVE_FOLDER_NAME = "МДК 07.01 — Работы студентов";
const ONLINE_WINDOW_SEC = 90;

const USERS_DATABASE = {
  "admin":   { pass: "Admin!Mdk0701_Core", role: "admin",   name: "Главный Администратор" },
  "teacher": { pass: "Teacher2026_TechM",  role: "teacher", name: "Преподаватель предмета" },
  "curator": { pass: "Curator_LuhAvia24",  role: "curator", name: "Куратор группы ТМ-3", group: "ТМ-3" },
  "tester1": { pass: "Test_Pass01_xyz",    role: "tester",  name: "Тестировщик №1" },
  "tester2": { pass: "Test_Pass02_abc",    role: "tester",  name: "Тестировщик №2" },
  "tester3": { pass: "Test_Pass03_qwe",    role: "tester",  name: "Тестировщик №3" },
  "tester4": { pass: "Test_Pass04_rty",    role: "tester",  name: "Тестировщик №4" },
  "tester5": { pass: "Test_Pass05_vbn",    role: "tester",  name: "Тестировщик №5" }
};

const SHEET = {
  saves:    ["key","name","group","payload","savedAt"],
  comments: ["id","date","name","group","rating","text","avatar","parentId","likes","hearts","likedBy"],
  reports:  ["date","student","group","avatar","report"],
  chat:     ["date","group","key","name","avatar","text"],
  questions:["id","date","key","text","answer","answeredAt"],
  works:    ["date","key","name","group","avatar","topicId","workCode","workTitle","fileName","fileType","fileUrl"],
  heartbeats:["key","name","group","date"],
  announce: ["id","text","active","updatedAt"]
};

function ss_(){ return SpreadsheetApp.getActiveSpreadsheet(); }
function sheet_(name){
  const ss = ss_();
  let sh = ss.getSheetByName(name);
  if (!sh){
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, SHEET[name].length).setValues([SHEET[name]]);
    sh.setFrozenRows(1);
  }
  return sh;
}
function json_(o){
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function nowIso_(){ return new Date().toISOString(); }
function toIso_(v){ if (!v) return ""; const d = v instanceof Date ? v : new Date(v); return isNaN(d) ? "" : d.toISOString(); }
function uid_(){ return Utilities.getUuid(); }

/* --- Определяем группу, доступную пользователю по роли --- */
function roleGroup_(userRole, login){
  if (userRole === "curator"){
    const u = USERS_DATABASE[String(login||"").toLowerCase()];
    return u && u.group ? u.group : "ТМ-3";
  }
  return ""; // пусто = все группы
}

function doGet(e){
  try {
    const a = String(e.parameter.action || "").toLowerCase();
    const role = String(e.parameter.userRole || "").toLowerCase();
    const login = String(e.parameter.username || "").toLowerCase();
    if (a === "login")         return h_login(e);
    if (a === "load")          return h_load(e);
    if (a === "loadcomments")  return h_loadcomments(e);
    if (a === "groupstats")    return h_groupstats(e, role, login);
    if (a === "worksload")     return h_worksload(e, role, login);
    if (a === "chatload")      return h_chatload(e, role, login);
    if (a === "questionsload") return h_questionsload(e);
    if (a === "teacherlist")   return h_teacherlist(e, role, login);
    if (a === "online")        return h_online(e);
    if (a === "announcement")  return h_announcement(e);
    return json_({ ok:true, message:"МДК 07.01 API v4", time: nowIso_() });
  } catch (err){ return json_({ ok:false, error:String(err) }); }
}

function doPost(e){
  try {
    const a = String(e.parameter.action || "").toLowerCase();
    const role = String(e.parameter.userRole || "").toLowerCase();
    if (a === "save")            return h_save(e);
    if (a === "savecomment")     return h_savecomment(e);
    if (a === "likecomment")     return h_likecomment(e);
    if (a === "report")          return h_report(e);
    if (a === "uploadwork")      return h_uploadwork(e);
    if (a === "chatsave")        return h_chatsave(e);
    if (a === "questionsave")    return h_questionsave(e);
    if (a === "questionanswer"){
      if (!["teacher","admin","curator"].includes(role)) return json_({ ok:false, error:"forbidden" });
      return h_questionanswer(e);
    }
    if (a === "teachercorrect"){
      if (!["teacher","admin","curator"].includes(role)) return json_({ ok:false, error:"forbidden" });
      return h_teachercorrect(e);
    }
    if (a === "heartbeat")       return h_heartbeat(e);
    return json_({ ok:false, error:"Unknown action: " + a });
  } catch (err){ return json_({ ok:false, error:String(err) }); }
}

/* ---------- LOGIN ---------- */
function h_login(e){
  const user = String(e.parameter.username || "").trim().toLowerCase();
  const pass = String(e.parameter.password || "").trim();
  if (!user || !pass) return json_({ ok:false, error:"Заполните все поля" });
  const u = USERS_DATABASE[user];
  if (u && u.pass === pass){
    return json_({ ok:true, role:u.role, name:u.name, group:u.group || "" });
  }
  return json_({ ok:false, error:"Неверный логин или пароль" });
}

/* ---------- SAVE / LOAD ---------- */
function h_save(e){
  const key = String(e.parameter.key || "").trim();
  if (!key) return json_({ ok:false, error:"key required" });
  const payload = String(e.parameter.payload || "{}");
  try { JSON.parse(payload); } catch (err){ return json_({ ok:false, error:"invalid JSON" }); }
  const savedAt = nowIso_();
  const sh = sheet_("saves");
  const last = sh.getLastRow();
  const data = last >= 2 ? sh.getRange(2, 1, last - 1, 5).getValues() : [];
  let row = -1;
  for (let i = 0; i < data.length; i++) if (String(data[i][0]).trim() === key){ row = i + 2; break; }
  const values = [
    key,
    String(e.parameter.name || ""),
    String(e.parameter.group || "").toUpperCase(),
    payload,
    savedAt
  ];
  if (row > 0) sh.getRange(row, 1, 1, 5).setValues([values]);
  else sh.appendRow(values);
  return json_({ ok:true, savedAt });
}
function h_load(e){
  const key = String(e.parameter.key || "").trim();
  if (!key) return json_({ ok:false, error:"key required" });
  const sh = sheet_("saves");
  const last = sh.getLastRow();
  if (last < 2) return json_({ ok:true, payload:null });
  const data = sh.getRange(2, 1, last - 1, 5).getValues();
  for (let i = data.length - 1; i >= 0; i--){
    if (String(data[i][0]).trim() === key){
      return json_({ ok:true, payload:String(data[i][3]||"{}"), savedAt: toIso_(data[i][4]) });
    }
  }
  return json_({ ok:true, payload:null });
}

/* ---------- COMMENTS ---------- */
function h_loadcomments(){
  const sh = sheet_("comments");
  cleanupOldComments(sh);
  const last = sh.getLastRow();
  if (last < 2) return json_({ ok:true, comments:[] });
  const data = sh.getRange(2, 1, last - 1, SHEET.comments.length).getValues();
  const comments = data.map(r => ({
    id: String(r[0]||""), date: toIso_(r[1]),
    name: String(r[2]||""), group: String(r[3]||""),
    rating: Number(r[4]) || 5, text: String(r[5]||""),
    avatar: String(r[6]||"👨‍🎓"), parentId: String(r[7]||""),
    likes: Number(r[8]) || 0, hearts: Number(r[9]) || 0,
    likedBy: String(r[10]||"").split(",").filter(Boolean)
  })).filter(c => c.text && c.date);
  return json_({ ok:true, comments });
}
function h_savecomment(e){
  const text = String(e.parameter.text || "").trim().slice(0, 1000);
  if (text.length < 10) return json_({ ok:false, error:"too short" });
  sheet_("comments").appendRow([
    uid_(), nowIso_(),
    String(e.parameter.name||"Гость").slice(0,120),
    String(e.parameter.group||"—").slice(0,60).toUpperCase(),
    Math.max(1, Math.min(5, Number(e.parameter.rating)||5)),
    text,
    String(e.parameter.avatar||"👨‍🎓").slice(0,8),
    String(e.parameter.parentId||""), 0, 0, ""
  ]);
  return json_({ ok:true });
}
function h_likecomment(e){
  const id = String(e.parameter.id || "");
  const kind = String(e.parameter.kind || "like");
  const key = String(e.parameter.key || "");
  if (!id || !key) return json_({ ok:false, error:"id/key required" });
  const sh = sheet_("comments");
  const last = sh.getLastRow();
  if (last < 2) return json_({ ok:false });
  const data = sh.getRange(2, 1, last - 1, SHEET.comments.length).getValues();
  for (let i = 0; i < data.length; i++){
    if (String(data[i][0]) === id){
      const likedBy = String(data[i][10]||"").split(",").filter(Boolean);
      const idx = likedBy.indexOf(key);
      const col = kind === "heart" ? 9 : 8;
      if (idx >= 0){ likedBy.splice(idx, 1); data[i][col] = Math.max(0, (Number(data[i][col])||0) - 1); }
      else { likedBy.push(key); data[i][col] = (Number(data[i][col])||0) + 1; }
      data[i][10] = likedBy.join(",");
      sh.getRange(i+2, 1, 1, SHEET.comments.length).setValues([data[i]]);
      return json_({ ok:true });
    }
  }
  return json_({ ok:false });
}
function cleanupOldComments(sh){
  const last = sh.getLastRow();
  if (last < 2) return;
  const cutoff = new Date(); cutoff.setFullYear(cutoff.getFullYear() - COMMENT_TTL_YEARS);
  const data = sh.getRange(2, 2, last - 1, 1).getValues();
  const toDel = [];
  data.forEach((r, i) => { const d = r[0] ? new Date(r[0]) : null; if (d && !isNaN(d) && d < cutoff) toDel.push(i + 2); });
  toDel.reverse().forEach(row => sh.deleteRow(row));
}

/* ---------- REPORT ---------- */
function h_report(e){
  const student = String(e.parameter.student||"—").slice(0,160);
  const group   = String(e.parameter.group||"—").slice(0,60).toUpperCase();
  const report  = String(e.parameter.report||"").trim();
  if (!report) return json_({ ok:false, error:"empty" });
  sheet_("reports").appendRow([nowIso_(), student, group, String(e.parameter.avatar||""), report]);
  try {
    MailApp.sendEmail({
      to: REPORT_EMAILS.join(","),
      subject: "МДК 07.01 — отчёт " + student + " (гр. " + group + ")",
      body: report, name: "МДК 07.01"
    });
  } catch (err){}
  return json_({ ok:true });
}

/* ---------- GROUP STATS ---------- */
function h_groupstats(e, userRole, login){
  const groupFilter = roleGroup_(userRole, login);
  const group = groupFilter || String(e.parameter.group || "").trim().toUpperCase();
  const myKey = String(e.parameter.key || "").trim();
  if (!group) return json_({ ok:true, stats:null });
  const sh = sheet_("saves");
  const last = sh.getLastRow();
  if (last < 2) return json_({ ok:true, stats:null });
  const data = sh.getRange(2, 1, last - 1, 5).getValues()
    .filter(r => String(r[2]).trim().toUpperCase() === group);
  const total = data.length;
  if (!total) return json_({ ok:true, stats:null });
  const progressOf = r => { try { const p = JSON.parse(r[3]||"{}"); return Object.values(p.progress||{}).filter(x => (x.done||0) >= 5).length; } catch(err){ return 0; } };
  const avgOf = r => { try {
    const p = JSON.parse(r[3]||"{}");
    const all = [...Object.values(p.results||{}).map(x=>x.grade), ...Object.values(p.selfResults||{}).map(x=>x.grade)].filter(x => x > 0);
    return all.length ? all.reduce((a,b)=>a+b,0)/all.length : 0;
  } catch(err){ return 0; } };
  const sorted = data.slice().sort((a,b) => progressOf(b) - progressOf(a));
  const rank = myKey ? sorted.findIndex(r => String(r[0]).trim() === myKey) + 1 : null;
  const grades = data.map(avgOf).filter(x => x > 0);
  const avgGroup = grades.length ? grades.reduce((a,b)=>a+b,0)/grades.length : 0;
  return json_({ ok:true, stats:{ rank, total, avgGroup } });
}

/* ---------- WORKS ---------- */
function h_uploadwork(e){
  const fileData = String(e.parameter.fileData || "");
  const fileName = String(e.parameter.fileName || "file.bin");
  const fileType = String(e.parameter.fileType || "application/octet-stream");
  if (!fileData) return json_({ ok:false, error:"no fileData" });
  const folder = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME).hasNext()
    ? DriveApp.getFoldersByName(DRIVE_FOLDER_NAME).next()
    : DriveApp.createFolder(DRIVE_FOLDER_NAME);
  const file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(fileData), fileType, fileName));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  sheet_("works").appendRow([
    nowIso_(), String(e.parameter.key || ""), String(e.parameter.name || ""),
    String(e.parameter.group || "").toUpperCase(), String(e.parameter.avatar || ""),
    String(e.parameter.topicId || ""), String(e.parameter.workCode || ""),
    String(e.parameter.workTitle || ""), fileName, fileType, file.getUrl()
  ]);
  return json_({ ok:true, fileUrl: file.getUrl() });
}
function h_worksload(e, userRole, login){
  const groupFilter = roleGroup_(userRole, login);
  const group = groupFilter || String(e.parameter.group || "").trim().toUpperCase();
  const sh = sheet_("works");
  const last = sh.getLastRow();
  if (last < 2) return json_({ ok:true, works:[] });
  const works = sh.getRange(2, 1, last - 1, SHEET.works.length).getValues().map(r => ({
    date: toIso_(r[0]), key: String(r[1]), name: String(r[2]), group: String(r[3]),
    avatar: String(r[4]), topicId: String(r[5]), workCode: String(r[6]),
    workTitle: String(r[7]), fileName: String(r[8]), fileType: String(r[9]), fileUrl: String(r[10])
  })).filter(w => !group || w.group.toUpperCase() === group);
  return json_({ ok:true, works });
}

/* ---------- CHAT ---------- */
function h_chatload(e, userRole, login){
  const groupFilter = roleGroup_(userRole, login);
  const group = groupFilter || String(e.parameter.group || "").trim().toUpperCase();
  const since = String(e.parameter.since || "");
  const sh = sheet_("chat");
  const last = sh.getLastRow();
  if (last < 2) return json_({ ok:true, messages:[] });
  let msgs = sh.getRange(2, 1, last - 1, SHEET.chat.length).getValues().map(r => ({
    date: toIso_(r[0]), group: String(r[1]), key: String(r[2]),
    name: String(r[3]), avatar: String(r[4]), text: String(r[5])
  })).filter(m => (!group || m.group.toUpperCase() === group) && (!since || m.date > since));
  msgs.sort((a,b) => a.date.localeCompare(b.date));
  return json_({ ok:true, messages: msgs.slice(-100) });
}
function h_chatsave(e){
  const text = String(e.parameter.text || "").trim().slice(0, 500);
  if (!text) return json_({ ok:false });
  sheet_("chat").appendRow([
    nowIso_(), String(e.parameter.group || "").toUpperCase(),
    String(e.parameter.key || ""), String(e.parameter.name || ""),
    String(e.parameter.avatar || ""), text
  ]);
  return json_({ ok:true });
}

/* ---------- QUESTIONS ---------- */
function h_questionsload(){
  const sh = sheet_("questions");
  const last = sh.getLastRow();
  if (last < 2) return json_({ ok:true, questions:[] });
  const list = sh.getRange(2, 1, last - 1, SHEET.questions.length).getValues().map(r => ({
    id: String(r[0]), date: toIso_(r[1]), key: String(r[2]),
    text: String(r[3]), answer: String(r[4]), answeredAt: toIso_(r[5])
  })).filter(q => q.text);
  return json_({ ok:true, questions: list });
}
function h_questionsave(e){
  const text = String(e.parameter.text || "").trim().slice(0, 500);
  if (text.length < 5) return json_({ ok:false });
  sheet_("questions").appendRow([uid_(), nowIso_(), String(e.parameter.key || ""), text, "", ""]);
  return json_({ ok:true });
}
function h_questionanswer(e){
  const id = String(e.parameter.id || "");
  const answer = String(e.parameter.answer || "").trim().slice(0, 1000);
  if (!id || !answer) return json_({ ok:false });
  const sh = sheet_("questions");
  const last = sh.getLastRow();
  if (last < 2) return json_({ ok:false });
  const data = sh.getRange(2, 1, last - 1, SHEET.questions.length).getValues();
  for (let i = 0; i < data.length; i++){
    if (String(data[i][0]) === id){
      sh.getRange(i+2, 5, 1, 2).setValues([[answer, nowIso_()]]);
      return json_({ ok:true });
    }
  }
  return json_({ ok:false });
}

/* ---------- TEACHER / CURATOR ---------- */
function h_teacherlist(e, userRole, login){
  const groupFilter = roleGroup_(userRole, login);
  const sh = sheet_("saves");
  const last = sh.getLastRow();
  if (last < 2) return json_({ ok:true, students:[] });
  const students = sh.getRange(2, 1, last - 1, 5).getValues().map(r => {
    const p = (()=>{ try { return JSON.parse(r[3]||"{}"); } catch(err){ return {}; } })();
    const progress = p.progress || {};
    const topicsDone = Object.values(progress).filter(x => (x.done||0) >= 5).length;
    const grades = [...Object.values(p.results||{}).map(x=>x.grade), ...Object.values(p.selfResults||{}).map(x=>x.grade)].filter(x => x > 0);
    return {
      key: String(r[0]), name: String(r[1]), group: String(r[2]).toUpperCase(),
      topicsDone,
      topicsTotal: Object.keys(progress).length,
      testsTaken: Object.keys(p.results || {}).length,
      avgGrade: grades.length ? grades.reduce((a,b)=>a+b,0)/grades.length : 0,
      correction: (p.corrections && p.corrections.all) || "",
      correctionNote: (p.corrections && p.corrections.all_note) || ""
    };
  }).filter(s => !groupFilter || s.group === groupFilter);
  return json_({ ok:true, students });
}
function h_teachercorrect(e){
  const key = String(e.parameter.key || "");
  const topicId = String(e.parameter.topicId || "all");
  const grade = String(e.parameter.grade || "");
  const note = String(e.parameter.note || "");
  if (!key) return json_({ ok:false });
  const sh = sheet_("saves");
  const last = sh.getLastRow();
  if (last < 2) return json_({ ok:false });
  const data = sh.getRange(2, 1, last - 1, 5).getValues();
  for (let i = 0; i < data.length; i++){
    if (String(data[i][0]) === key){
      let p; try { p = JSON.parse(data[i][3]||"{}"); } catch(err){ p = {}; }
      p.corrections = p.corrections || {};
      if (grade) p.corrections[topicId] = grade; else delete p.corrections[topicId];
      if (note)  p.corrections[topicId + "_note"] = note;
      sh.getRange(i+2, 4).setValue(JSON.stringify(p));
      return json_({ ok:true });
    }
  }
  return json_({ ok:false });
}

/* ---------- HEARTBEAT / ONLINE ---------- */
function h_heartbeat(e){
  const key = String(e.parameter.key || "");
  if (!key) return json_({ ok:false });
  const sh = sheet_("heartbeats");
  sh.appendRow([key, String(e.parameter.name||""), String(e.parameter.group||"").toUpperCase(), nowIso_()]);
  const last = sh.getLastRow();
  if (last > 500) sh.deleteRows(2, last - 500);
  return json_({ ok:true });
}
function h_online(e){
  const win = Number(e.parameter.window) || ONLINE_WINDOW_SEC;
  const cutoff = new Date(Date.now() - win * 1000);
  const sh = sheet_("heartbeats");
  const last = sh.getLastRow();
  if (last < 2) return json_({ ok:true, count:0 });
  const data = sh.getRange(2, 1, last - 1, 4).getValues();
  const active = new Set();
  data.forEach(r => { const d = new Date(r[3]); if (d >= cutoff) active.add(String(r[0])); });
  return json_({ ok:true, count: active.size });
}

/* ---------- ANNOUNCEMENT ---------- */
function h_announcement(){
  const sh = sheet_("announce");
  const last = sh.getLastRow();
  if (last < 2) return json_({ ok:true, text:null });
  const data = sh.getRange(2, 1, last - 1, SHEET.announce.length).getValues();
  for (let i = data.length - 1; i >= 0; i--){
    if (String(data[i][2]).toLowerCase() === "true" || data[i][2] === true){
      return json_({ ok:true, id:String(data[i][0]), text:String(data[i][1]) });
    }
  }
  return json_({ ok:true, text:null });
}

/* ---------- SETUP ---------- */
function setupSpreadsheet(){
  Object.keys(SHEET).forEach(k => sheet_(k));
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === "dailyCleanup") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("dailyCleanup").timeBased().everyDays(1).atHour(3).create();
  Logger.log("✔ setupSpreadsheet выполнен. Учётки:");
  Object.keys(USERS_DATABASE).forEach(u => Logger.log("  " + u + " / " + USERS_DATABASE[u].pass + " (" + USERS_DATABASE[u].role + ")"));
}
function dailyCleanup(){
  try { cleanupOldComments(sheet_("comments")); } catch (err){}
}