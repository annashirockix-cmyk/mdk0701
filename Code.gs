// Вставьте это в конец вашего Code.gs (если вы уже обновляли его ранее).
// Если нет — замените весь Code.gs на тот, что я давал в прошлом сообщении, но добавьте в конец этот блок.

function h_get_rating(e) {
  const userRole = String(e.parameter.userRole || "").toLowerCase();
  const login = String(e.parameter.username || "").toLowerCase();
  const groupFilter = roleGroup_(userRole, login);
  
  const sh = sheet_("saves");
  const last = sh.getLastRow();
  if (last < 2) return json_({ ok:true, groups: [], studentsByGroup: {}, top10: [] });

  const data = sh.getRange(2, 1, last - 1, 5).getValues();
  const groupsMap = {}; 
  const studentsByGroup = {};
  const globalStudents = [];

  data.forEach(r => {
    const key = String(r[0]); const name = String(r[1]); const group = String(r[2]).trim().toUpperCase();
    if (groupFilter && group !== groupFilter) return; 

    let p = {}; try { p = JSON.parse(r[3] || "{}"); } catch(err){}
    const progress = p.progress || {};
    const topicsDone = Object.values(progress).filter(x => (x.done || 0) >= 5).length;
    const grades = [...Object.values(p.results || {}).map(x => x.grade), ...Object.values(p.selfResults || {}).map(x => x.grade)].filter(x => x > 0);
    const avgGrade = grades.length ? grades.reduce((a,b)=>a+b,0) / grades.length : 0;
    const worksCount = Object.keys(p.results || {}).length + Object.keys(p.selfResults || {}).length;

    const gradeScore = avgGrade * 20; 
    const topicScore = (topicsDone / 21) * 100; 
    let score = Math.round((gradeScore * 0.7) + (topicScore * 0.3));
    if (score < 0 || isNaN(score)) score = 0; if (score > 100) score = 100;

    const sObj = { key: key, name: name, group: group, avgGrade: avgGrade, topicsDone: topicsDone, worksCount: worksCount, score: score };
    globalStudents.push(sObj);

    if (!groupsMap[group]) { groupsMap[group] = { group: group, studentsCount: 0, sumGrade: 0, sumTopics: 0, sumScore: 0 }; studentsByGroup[group] = []; }
    groupsMap[group].studentsCount++; groupsMap[group].sumGrade += avgGrade; groupsMap[group].sumTopics += topicsDone; groupsMap[group].sumScore += score;
    studentsByGroup[group].push(sObj);
  });

  const groupsArray = Object.values(groupsMap).map(g => ({ group: g.group, studentsCount: g.studentsCount, avgGrade: g.studentsCount ? g.sumGrade / g.studentsCount : 0, avgTopicsDone: g.studentsCount ? Math.round(g.sumTopics / g.studentsCount) : 0, avgScore: g.studentsCount ? Math.round(g.sumScore / g.studentsCount) : 0 }));
  groupsArray.sort((a, b) => b.avgScore - a.avgScore);
  for (let g in studentsByGroup) { studentsByGroup[g].sort((a, b) => b.score - a.score); }
  globalStudents.sort((a, b) => b.score - a.score);

  return json_({ ok: true, groups: groupsArray, studentsByGroup: studentsByGroup, top10: globalStudents.slice(0, 10) });
}