(function(){
'use strict';

var students=[
 {name:'Илья Воронцов',className:'4-2',house:'VISION',points:124,earned:145,lost:21,tutor:'А. Котова',parents:[['Анна Воронцова','мама','+7 999 111-22-33'],['Сергей Воронцов','папа','+7 999 444-55-66']]},
 {name:'Мария Орлова',className:'4-1',house:'SAPIENTIAE',points:119,earned:134,lost:15,tutor:'Е. Сафина',parents:[['Елена Орлова','мама','+7 999 222-33-44'],['Андрей Орлов','папа','+7 999 555-66-77']]},
 {name:'Алексей Данилов',className:'3-3',house:'IMPERIUM',points:116,earned:126,lost:10,tutor:'А. Котова',parents:[['Ольга Данилова','мама','+7 999 333-22-11'],['Михаил Данилов','папа','+7 999 777-66-55']]},
 {name:'Полина Власова',className:'4-2',house:'VISION',points:109,earned:117,lost:8,tutor:'А. Котова',parents:[['Екатерина Власова','мама','+7 999 707-80-90'],['Дмитрий Власов','папа','+7 999 808-90-10']]},
 {name:'Дарья Романова',className:'4-2',house:'VISION',points:92,earned:101,lost:9,tutor:'А. Котова',parents:[['Мария Романова','мама','+7 999 909-10-20'],['Павел Романов','папа','+7 999 010-20-30']]},
 {name:'Алексей Петров',className:'6-2',house:'VISION',points:91,earned:113,lost:22,tutor:'М. Петрова',parents:[['Наталья Петрова','мама','+7 999 101-20-30'],['Игорь Петров','папа','+7 999 202-30-40']]},
 {name:'Софья Морозова',className:'7-1',house:'SAPIENTIAE',points:88,earned:103,lost:15,tutor:'М. Петрова',parents:[['Марина Морозова','мама','+7 999 505-60-70'],['Александр Морозов','папа','+7 999 606-70-80']]},
 {name:'Алексей Петров',className:'8-1',house:'IMPERIUM',points:76,earned:92,lost:16,tutor:'Е. Сафина',parents:[['Ирина Петрова','мама','+7 999 303-40-50'],['Олег Петров','папа','+7 999 404-50-60']]}
];
var tutorKeys=['Илья Воронцов|4-2','Алексей Данилов|3-3','Полина Власова|4-2','Дарья Романова|4-2'];
var role='Старший тьютор начальной школы';
var assignedClass='4-2';
var assignedHouseMaster='';  // назначается администратором/старшим тьютором
var topVisible=true;
var pointsOpen=true;
var currentAction='award';
var selectedStudent=null;

var months=[
 ['2026-09','Сентябрь 2026','I четверть'],['2026-10','Октябрь 2026','I четверть'],
 ['2026-11','Ноябрь 2026','II четверть'],['2026-12','Декабрь 2026','II четверть'],
 ['2027-01','Январь 2027','III четверть'],['2027-02','Февраль 2027','III четверть'],
 ['2027-03','Март 2027','III / IV четверть'],['2027-04','Апрель 2027','IV четверть'],['2027-05','Май 2027','IV четверть']
];

function $(id){return document.getElementById(id)}
function show(el,on){if(el)el.style.display=on?'':'none'}
function grade(s){var m=(s.className||'').match(/^(\d+)/);return m?Number(m[1]):99}
function key(s){return s.name+'|'+s.className}
function isSenior(){return role.indexOf('Старший тьютор')===0}
function isTutor(){return role==='Тьютор'}
function isClassTeacher(){return role==='Классный руководитель'}
function isSubjectTeacher(){return role==='Учитель-предметник'}
function isAdmin(){return role==='Администратор'}

function navigate(id,action){
 var screen=$(id); if(!screen)return;
 document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active')});
 screen.classList.add('active');
 document.querySelectorAll('[data-nav]').forEach(function(a){a.classList.toggle('active',a.getAttribute('data-nav')===id)});
 var title={dashboard:'Главная',students:isTutor()?'Тьютор':isClassTeacher()?assignedClass:'Ученики',actions:'Действия',houses:'Хаусы',myHouse:assignedHouseMaster||'Мой хаус',policy:'Положение',requests:'Запросы',assignments:'Назначения',search:'Общий поиск',studentCard:'Карточка ученика',more:'Ещё'}[id]||id;
 if($('desktopTitle'))$('desktopTitle').textContent=title;
 if($('mobileTitle'))$('mobileTitle').textContent=title;
 if(id==='actions' && action)setAction(action);
 window.scrollTo(0,0);
}
document.addEventListener('click',function(e){
 var link=e.target.closest('[data-nav]');
 if(link){e.preventDefault();navigate(link.getAttribute('data-nav'))}
 var go=e.target.closest('[data-go]');
 if(go){e.preventDefault();navigate(go.getAttribute('data-go'),go.getAttribute('data-action'))}
 var row=e.target.closest('[data-student-key]');
 if(row && !e.target.closest('select')){openStudent(row.getAttribute('data-student-key'))}
});
window.addEventListener('hashchange',function(){var id=location.hash.replace('#','');if($(id))navigate(id)});

function populateMonths(){
 document.querySelectorAll('.school-month').forEach(function(sel){
   var old=sel.value;
   sel.innerHTML=months.map(function(m){return '<option value="'+m[0]+'">'+m[1]+'</option>'}).join('');
   if(months.some(function(m){return m[0]===old}))sel.value=old; else sel.value='2026-09';
   updateQuarter(sel);
   sel.addEventListener('change',function(){updateQuarter(sel)});
 });
}
function updateQuarter(sel){
 var item=months.find(function(m){return m[0]===sel.value}); if(!item)return;
 var helperId=sel.id.replace('Month','Quarter');
 if($(helperId))$(helperId).textContent=item[2];
 var marchWrap=sel.id==='awardMonth'?$('awardMarchWrap'):sel.id==='deductMonth'?$('deductMarchWrap'):null;
 if(marchWrap)show(marchWrap,sel.value==='2027-03');
}

function scopeStudents(){
 if(isTutor())return students.filter(function(s){return tutorKeys.indexOf(key(s))>=0});
 if(isClassTeacher())return students.filter(function(s){return s.className===assignedClass});
 if(role==='Старший тьютор начальной школы')return students.filter(function(s){return grade(s)<=4});
 if(role==='Старший тьютор старшей школы')return students.filter(function(s){return grade(s)>=5});
 if(isAdmin())return students.slice();
 return [];
}
function sum(arr,field){return arr.reduce(function(n,s){return n+(s[field]||0)},0)}
function updateMetrics(){
 var arr=scopeStudents();
 var scope=isTutor()?'Только мои закреплённые ученики':isClassTeacher()?'Класс '+assignedClass:role==='Старший тьютор начальной школы'?'Только начальная школа':role==='Старший тьютор старшей школы'?'Только старшая школа':isAdmin()?'Вся школа':'';
 $('scopeNote').textContent=scope;
 $('metricStudents').textContent=arr.length;
 $('metricEarned').textContent='+'+sum(arr,'earned');
 $('metricLost').textContent='−'+sum(arr,'lost');
 $('metricBalance').textContent=sum(arr,'points');
}

function roleVisibility(){
 var subject=isSubjectTeacher(), ct=isClassTeacher(), tutor=isTutor(), senior=isSenior(), admin=isAdmin();
 show($('teacherHome'),subject);
 show($('normalHome'),!subject);
 show($('seniorAdminCommon'),senior||admin);
 show($('sideStudents'),!subject);
 show($('sidePolicy'),tutor||senior||admin);
 show($('sideMore'),!subject);
 show($('sideMyHouse'),tutor&&!!assignedHouseMaster);
 show($('mobileStudents'),!subject);
 show($('mobileHouses'),senior||admin);
 show($('mobilePolicy'),tutor||senior||admin);
 show($('mobileMore'),!subject);
 show($('mobileMyHouse'),tutor&&!!assignedHouseMaster);
 show($('adminControls'),admin);
 show($('classTeacherAssignBox'),admin);
 show($('moreRequests'),tutor);
 show($('moreSearch'),tutor||senior||admin);
 show($('moreAssignments'),senior||admin);

 $('sideStudentsLabel').textContent=tutor?'Тьютор':ct?assignedClass:'Ученики';
 $('mobileStudentsLabel').textContent=tutor?'Тьютор':ct?assignedClass:'Ученики';
 $('sideMyHouseLabel').textContent=assignedHouseMaster||'Мой хаус';
 $('mobileMyHouseLabel').textContent=assignedHouseMaster||'Мой хаус';
 $('myHouseTitle').textContent=assignedHouseMaster||'Мой хаус';

 if(ct){
   $('awardHomeLabel').textContent='Предложить начисление';
   $('deductHomeLabel').textContent='Предложить списание';
   $('awardHomeSub').textContent='Количество определит тьютор';
   $('deductHomeSub').textContent='Запрос тьютору ученика';
 }else{
   $('awardHomeLabel').textContent='Начислить баллы';
   $('deductHomeLabel').textContent='Зафиксировать нарушение';
   $('awardHomeSub').textContent='Ученик, причина, количество';
   $('deductHomeSub').textContent='Запись и списание баллов';
 }
 if(subject && document.querySelector('.screen.active').id!=='dashboard' && document.querySelector('.screen.active').id!=='actions')navigate('dashboard');
 updateMetrics(); renderStudents(); renderHouseStudents(); configureActions();
}
document.querySelectorAll('.role-select').forEach(function(sel){
 sel.addEventListener('change',function(){
  role=sel.value;
  document.querySelectorAll('.role-select').forEach(function(x){x.value=role});
  roleVisibility();
  navigate('dashboard');
 });
});

function renderStudents(){
 var arr=scopeStudents();
 var q=($('studentSearch').value||'').toLowerCase().trim();
 var hf=$('houseFilter').value, sort=$('studentSort').value;
 if(q)arr=arr.filter(function(s){return s.name.toLowerCase().indexOf(q)>=0});
 if(hf)arr=arr.filter(function(s){return s.house===hf});
 if(sort==='alpha')arr.sort(function(a,b){return a.name.localeCompare(b.name,'ru')});
 if(sort==='pointsDesc')arr.sort(function(a,b){return b.points-a.points});
 if(sort==='pointsAsc')arr.sort(function(a,b){return a.points-b.points});
 $('studentsTitle').textContent=isTutor()?'Мои тьюторские ученики':isClassTeacher()?'Мой класс · '+assignedClass:'Ученики';
 $('studentsSub').textContent=isTutor()?'Только дети, назначенные вам администратором или старшим тьютором.':isClassTeacher()?'Только ученики назначенного вам класса.':'Доступный вам список учеников.';
 var canHouse=!isSubjectTeacher();
 $('studentList').innerHTML=arr.map(function(s){
   return '<div class="student-row" data-student-key="'+key(s)+'"><div><div class="student-name">'+s.name+'</div><div class="student-meta">'+s.className+' · '+s.tutor+'</div>'+
   (canHouse?'<div class="house-edit"><select class="inline-house" data-house-key="'+key(s)+'"><option '+(s.house==='VISION'?'selected':'')+'>VISION</option><option '+(s.house==='IMPERIUM'?'selected':'')+'>IMPERIUM</option><option '+(s.house==='SAPIENTIAE'?'selected':'')+'>SAPIENTIAE</option></select></div>':'')+
   '</div><div class="student-score">'+s.points+'<small>баллов</small></div></div>';
 }).join('');
 document.querySelectorAll('.inline-house').forEach(function(sel){sel.addEventListener('change',function(e){var s=findStudent(e.target.getAttribute('data-house-key'));if(s)s.house=e.target.value;renderStudents();renderHouseStudents()})});
}
['studentSearch','houseFilter','studentSort'].forEach(function(id){$(id).addEventListener(id==='studentSearch'?'input':'change',renderStudents)});

function findStudent(k){return students.find(function(s){return key(s)===k})}
function matchTypedStudent(value){
 var v=(value||'').trim().toLowerCase();
 return students.find(function(s){return (s.name+' · '+s.className+' · '+s.house).toLowerCase()===v}) ||
        students.find(function(s){return s.name.toLowerCase()===v});
}
function fillDatalist(){
 $('studentOptions').innerHTML=students.map(function(s){return '<option value="'+s.name+' · '+s.className+' · '+s.house+'"></option>'}).join('');
}
function bindStudentField(inputId,classId,houseId){
 $(inputId).addEventListener('change',function(){
   var s=matchTypedStudent($(inputId).value);
   selectedStudent=s||null;
   $(classId).value=s?s.className:'';
   $(houseId).value=s?s.house:'';
   configureActions();
 });
}
bindStudentField('awardStudent','awardClass','awardHouse');
bindStudentField('deductStudent','deductClass','deductHouse');

function setAction(type){
 currentAction=type;
 show($('awardPanel'),type==='award');show($('deductPanel'),type==='deduct');
 $('tabAward').className='btn '+(type==='award'?'primary':'secondary');
 $('tabDeduct').className='btn '+(type==='deduct'?'primary':'secondary');
}
$('tabAward').addEventListener('click',function(){setAction('award')});
$('tabDeduct').addEventListener('click',function(){setAction('deduct')});

function isOwnTutorStudent(s){return s && tutorKeys.indexOf(key(s))>=0}
function isMyHouseStudent(s){return s && assignedHouseMaster && s.house===assignedHouseMaster}
function configureActions(){
 var subject=isSubjectTeacher(), ct=isClassTeacher(), tutor=isTutor(), senior=isSenior(), admin=isAdmin();
 var direct=tutor||senior||admin;
 var awardDirect=direct;
 if(tutor && selectedStudent && !isOwnTutorStudent(selectedStudent) && !isMyHouseStudent(selectedStudent))awardDirect=false;
 if(subject||ct)awardDirect=false;
 show($('awardAmountWrap'),awardDirect);
 show($('deductAmountWrap'),!(subject||ct));

 if(subject){
  $('awardTitle').textContent='Предложить начисление';
  $('deductTitle').textContent='Предложить списание';
  $('awardRoleHint').textContent='Укажите ученика и причину. Количество выберет тьютор этого ученика.';
  $('deductRoleHint').textContent='Опишите нарушение. Количество списания определит тьютор ученика.';
  $('saveAward').textContent='Отправить предложение';
  $('saveDeduct').textContent='Отправить предложение';
 }else if(ct){
  $('awardTitle').textContent='Предложить начисление';
  $('deductTitle').textContent='Предложить списание';
  $('awardRoleHint').textContent='Предложение только по ученикам вашего класса. Количество определит тьютор.';
  $('deductRoleHint').textContent='Предложение уйдёт тьютору этого ученика.';
  $('saveAward').textContent='Отправить тьютору';
  $('saveDeduct').textContent='Отправить тьютору';
 }else if(tutor && selectedStudent && !isOwnTutorStudent(selectedStudent) && !isMyHouseStudent(selectedStudent)){
  $('awardRoleHint').textContent='Это не ваш тьюторский/хаусный ученик. Запрос с указанным количеством уйдёт его тьютору.';
  $('saveAward').textContent='Отправить запрос тьютору';
 }else{
  $('awardRoleHint').textContent=tutor?'Своим тьюторским ученикам и ученикам вашего хауса начисление проходит напрямую.':'Операция проводится напрямую в доступном вам контуре.';
  $('deductRoleHint').textContent='Причину можно описать обычным языком; система предложит близкий пункт Положения.';
  $('saveAward').textContent='Сохранить начисление';
  $('saveDeduct').textContent='Сохранить';
 }
 $('saveAward').disabled=!pointsOpen;$('saveDeduct').disabled=!pointsOpen;
}
$('awardStudent').addEventListener('input',configureActions);

function semanticHint(text,type){
 var t=(text||'').toLowerCase().replace(/ё/g,'е');
 if(!t.trim())return 'Начните писать причину — система предложит близкий пункт Положения.';
 if(type==='award'){
  if(/(выиграл|выиграла|победил|победила|перв.*мест|1.*мест)/.test(t) && /(соревн|турнир|кубок|конкурс|викторин|игр)/.test(t))
   return '<b>Похоже на: I место / Победитель — базово 20 баллов.</b><br>Далее нужно уточнить уровень мероприятия, потому что для ряда мероприятий применяется коэффициент.';
  if(/помог/.test(t) && /(тьютор|педагог|учител|хаус)/.test(t))
   return '<b>Похоже на: помощь тьютору / педагогу / хаус-мастеру — 3 балла.</b>';
  if(/(провел|провела|ведущ|организ)/.test(t) && /мероприят/.test(t))
   return '<b>Положение различает участие в проведении — 5 и проведение/ведущий — 10 баллов.</b>';
 }else{
  if(/(телефон|наушник|девайс|смарт.*час)/.test(t))return '<b>Похоже на использование электронного девайса без разрешения — 5 баллов.</b>';
  if(/(драк|ударил|ударила|подрал)/.test(t))return '<b>Похоже на причинение вреда (драка) — 30 баллов.</b>';
  if(/агресс/.test(t))return '<b>Похоже на проявление агрессии — 15 баллов.</b>';
  if(/сорвал.*урок|срыв.*урок/.test(t))return '<b>Похоже на срыв урока — 10 баллов.</b>';
 }
 return 'Точного соответствия пока нет. В рабочей версии смысловой поиск покажет несколько наиболее близких пунктов Положения для подтверждения сотрудником.';
}
$('awardReason').addEventListener('input',function(){$('awardPolicyHint').innerHTML=semanticHint(this.value,'award')});
$('deductReason').addEventListener('input',function(){$('deductPolicyHint').innerHTML=semanticHint(this.value,'deduct')});

function renderHouseStudents(){
 if(!assignedHouseMaster){$('houseStudentList').innerHTML='';$('hmCount').textContent='0';return}
 var q=($('houseStudentSearch').value||'').toLowerCase();
 var arr=students.filter(function(s){return s.house===assignedHouseMaster && s.name.toLowerCase().indexOf(q)>=0});
 $('hmCount').textContent=arr.length;
 $('houseStudentList').innerHTML=arr.map(function(s){return '<div class="student-row clickable" data-student-key="'+key(s)+'"><div><div class="student-name">'+s.name+'</div><div class="student-meta">'+s.className+' · тьютор '+s.tutor+' · заработал +'+s.earned+' · потерял −'+s.lost+'</div></div><div class="student-score">'+s.points+'<small>баллов</small></div></div>'}).join('');
}
$('houseStudentSearch').addEventListener('input',renderHouseStudents);

function openStudent(k){
 var s=findStudent(k);if(!s)return;
 $('cardName').textContent=s.name;$('cardMeta').textContent=s.className+' · '+s.house+' · тьютор '+s.tutor;
 $('parentsBlock').innerHTML=s.parents.map(function(p){return '<div class="student-row"><div><div class="student-name">'+p[0]+'</div><div class="student-meta">'+p[1]+' · '+p[2]+'</div></div></div>'}).join('');
 navigate('studentCard');
}
document.querySelectorAll('.editable-transaction').forEach(function(el){
 el.addEventListener('click',function(){
  if(!(isTutor()||isSenior()||isAdmin()))return;
  $('editAmount').value=el.getAttribute('data-points');$('editMonth').value=el.getAttribute('data-month');$('editReason').value=el.getAttribute('data-reason');updateQuarter($('editMonth'));$('editDialog').showModal();
 });
});

document.querySelectorAll('.approve-request').forEach(function(btn){
 btn.addEventListener('click',function(){
  $('approveStudent').textContent=btn.getAttribute('data-student');
  $('approveReason').value=btn.getAttribute('data-reason');
  $('approvePolicyHint').innerHTML=semanticHint(btn.getAttribute('data-reason'),btn.getAttribute('data-operation'));
  $('approveTitle').textContent=btn.getAttribute('data-operation')==='award'?'Подтвердить начисление':'Подтвердить списание';
  $('approveDialog').showModal();
 });
});

$('saveHm').addEventListener('click',function(){
 assignedHouseMaster=$('hmHouse').value;
 roleVisibility();
});
$('saveClassTeacher').addEventListener('click',function(){
 assignedClass=$('classTeacherClass').value;
 $('classTeacherAssignStatus').textContent='Назначен класс '+assignedClass+'. У классного руководителя появится отдельная вкладка «'+assignedClass+'».';
 roleVisibility();
});
$('pointsOpen').addEventListener('change',function(){pointsOpen=this.checked;configureActions()});
$('topVisible').addEventListener('change',function(){topVisible=this.checked;show($('top15Block'),topVisible)});

function renderGlobal(){
 var q=($('globalSearch').value||'').toLowerCase().trim();
 var arr=q?students.filter(function(s){return s.name.toLowerCase().indexOf(q)>=0}):students;
 $('globalResults').innerHTML=arr.map(function(s){return '<div class="student-row clickable" data-student-key="'+key(s)+'"><div><div class="student-name">'+s.name+'</div><div class="student-meta">'+s.className+' · '+s.house+'<br>'+s.parents.map(function(p){return p[0]+' ('+p[1]+') '+p[2]}).join('<br>')+'</div></div><div class="student-score">'+s.points+'<small>баллов</small></div></div>'}).join('');
}
$('globalSearch').addEventListener('input',renderGlobal);

fillDatalist();populateMonths();renderGlobal();setAction('award');roleVisibility();renderStudents();
if(location.hash && $(location.hash.slice(1)))navigate(location.hash.slice(1));
})();
