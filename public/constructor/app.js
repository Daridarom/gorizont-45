const facilities=[
  {id:'cabin',label:'Эко-домик',short:'Домик',icon:'⌂',desc:'Номерной фонд на склоне с видом на море.',cost:8,nature:-3,appeal:8,community:2,max:12,color:'#f4bd68'},
  {id:'cafe',label:'Панорамное кафе',short:'Кафе',icon:'☕',desc:'Круговая обзорная точка на верхней площадке.',cost:18,nature:-5,appeal:15,community:10,max:1,color:'#e78553'},
  {id:'spa',label:'SPA-комплекс',short:'SPA',icon:'♨',desc:'Тихая оздоровительная зона вдали от берега.',cost:22,nature:-4,appeal:14,community:6,max:1,color:'#64c7c5'},
  {id:'amphitheater',label:'Амфитеатр',short:'Сцена',icon:'◉',desc:'Площадка для лекций и камерных событий.',cost:14,nature:-2,appeal:8,community:18,max:1,color:'#c89af0'},
  {id:'trail',label:'Экотропа',short:'Тропа',icon:'〰',desc:'Связывает объекты, сохраняя природный рельеф.',cost:4,nature:4,appeal:5,community:6,max:6,color:'#a8d178'},
  {id:'garden',label:'Природный сад',short:'Сад',icon:'♧',desc:'Локальные растения и восстановление ландшафта.',cost:5,nature:8,appeal:4,community:7,max:6,color:'#5dac6e'},
  {id:'lookout',label:'Видовая площадка',short:'Видовая',icon:'◇',desc:'Остановка на маршруте без капитальной застройки.',cost:7,nature:1,appeal:10,community:5,max:3,color:'#8eb8ef'}
];
const byId=Object.fromEntries(facilities.map(x=>[x.id,x]));
const initial=[
  {uid:'start-cabin-1',type:'cabin',x:26,y:43},{uid:'start-cabin-2',type:'cabin',x:34,y:52},
  {uid:'start-trail',type:'trail',x:19,y:69},{uid:'start-lookout',type:'lookout',x:48,y:34},
  {uid:'start-garden',type:'garden',x:40,y:65}
];
const $=id=>document.getElementById(id);
const clamp=(n,min=0,max=100)=>Math.max(min,Math.min(max,n));
const protectedZone=(x,y)=>x>72||(x>57&&y>61)||(x>46&&y>84);
let placements=loadPlan()||initial.map(x=>({...x}));
let selected='cabin',active=null,drag=null,toastTimer=null;

function loadPlan(){
  try{
    const shared=location.hash.match(/plan=([^&]+)/);
    if(shared){const value=JSON.parse(atob(decodeURIComponent(shared[1])));if(Array.isArray(value))return value.filter(validPlacement)}
    const saved=localStorage.getItem('h45-plan-v1');return saved?JSON.parse(saved).filter(validPlacement):null;
  }catch{return null}
}
function validPlacement(x){return x&&byId[x.type]&&typeof x.uid==='string'&&Number.isFinite(x.x)&&Number.isFinite(x.y)}
function counts(){return placements.reduce((a,x)=>(a[x.type]=(a[x.type]||0)+1,a),{})}
function totals(){return placements.reduce((a,x)=>{const f=byId[x.type];a.cost+=f.cost;a.nature+=f.nature;a.appeal+=f.appeal;a.community+=f.community;return a},{cost:0,nature:88,appeal:18,community:12})}
function state(){const t=totals(),nature=clamp(t.nature),appeal=clamp(t.appeal),community=clamp(t.community),remaining=120-t.cost;const goals=[nature>=70,appeal>=68,community>=55,remaining>=0];return{...t,nature,appeal,community,remaining,goals,reached:goals.filter(Boolean).length,readiness:Math.round(clamp((nature+appeal+community)/3-Math.max(0,-remaining)*1.5))}}
function advice(s){return s.community<55?'Добавьте амфитеатр или природный сад — территории не хватает общественного сценария.':s.appeal<68?'Усильте маршрут видовой площадкой или панорамным кафе.':s.nature<70?'Компенсируйте застройку экотропой и природным садом.':s.remaining<0?'Концепция вышла за условный лимит — сократите капитальные объекты.':'Баланс найден: берег свободен, а сценарий территории уже работает.'}
function showToast(text){const el=$('toast');el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2300)}
function save(){try{localStorage.setItem('h45-plan-v1',JSON.stringify(placements))}catch{}}

function renderFacilities(){const c=counts();const card=f=>`<button class="facility ${selected===f.id?'selected':''}" data-select="${f.id}" ${c[f.id]>=f.max?'disabled':''} style="--color:${f.color}"><span class="symbol">${f.icon}</span><span class="copy"><strong>${f.label}</strong><small>${f.desc}</small><span class="impact"><b>${f.cost} ед.</b><i class="${f.nature<0?'negative':''}">♧ ${f.nature>0?'+':''}${f.nature}</i></span></span>${c[f.id]?`<em>${c[f.id]}</em>`:''}</button>`;$('facilityList').innerHTML=facilities.map(card).join('');$('mobilePalette').innerHTML=facilities.map(f=>`<button class="quick ${selected===f.id?'selected':''}" data-select="${f.id}" ${c[f.id]>=f.max?'disabled':''} style="--color:${f.color}"><span class="symbol">${f.icon}</span><small>${f.short}</small></button>`).join('');document.querySelectorAll('[data-select]').forEach(b=>b.onclick=()=>{selected=b.dataset.select;active=null;render();showToast(`Выбран объект: ${byId[selected].label}`)})}
function renderMarkers(){const box=$('markers');box.innerHTML=placements.map(p=>{const f=byId[p.type];return`<button class="marker ${active===p.uid?'active':''}" data-marker="${p.uid}" style="left:${p.x}%;top:${p.y}%;--color:${f.color}" aria-label="${f.label}. Перетащите для перемещения"><span>${f.icon}</span><small>${f.short}</small></button>`}).join('');box.querySelectorAll('.marker').forEach(el=>{el.onpointerdown=e=>{e.preventDefault();e.stopPropagation();const p=placements.find(x=>x.uid===el.dataset.marker);drag={uid:p.uid,x:p.x,y:p.y};active=p.uid;el.setPointerCapture(e.pointerId);renderObjectCard();el.classList.add('active')}});renderObjectCard()}
function renderObjectCard(){const card=$('objectCard'),p=placements.find(x=>x.uid===active);if(!p){card.hidden=true;card.innerHTML='';return}const f=byId[p.type];card.hidden=false;card.innerHTML=`<span class="object-symbol" style="--color:${f.color}">${f.icon}</span><div><strong>${f.label}</strong><small>Перетащите маркер для перемещения</small></div><button type="button" aria-label="Удалить объект">⌫</button>`;card.querySelector('button').onclick=e=>{e.stopPropagation();placements=placements.filter(x=>x.uid!==p.uid);active=null;save();render();showToast(`${f.label} удалён`)}}
function metric(label,value,target,tone,soft,icon){return`<section class="metric" style="--tone:${tone};--soft:${soft}"><header><span class="metric-symbol">${icon}</span><span>${label}</span><strong>${value}</strong></header><div class="bar"><i style="width:${value}%"></i></div><footer><span>Цель: ${target}</span>${value>=target?'<b>✓ достигнута</b>':`<span>ещё ${target-value}</span>`}</footer></section>`}
function renderMetrics(){const s=state();$('metrics').innerHTML=metric('Природа',s.nature,70,'#3e8d59','#e4f4e9','♧')+metric('Привлекательность',s.appeal,68,'#d18b29','#fcf0d9','✦')+metric('Общественная польза',s.community,55,'#596fc1','#e8edfc','●');$('goalCount').textContent=`${s.reached}/4`;$('goalCount').classList.toggle('complete',s.reached===4);$('budgetLeft').textContent=Math.max(0,s.remaining);$('budgetLeft').style.color=s.remaining<0?'#b44b3f':'';$('budgetBar').style.width=`${clamp(s.cost/120*100)}%`;const rec=$('recommendation');rec.className=`recommendation ${s.reached===4?'ready':''}`;rec.innerHTML=`<span>${s.reached===4?'✓':'◇'}</span><div><small>${s.reached===4?'Концепция сбалансирована':'Следующий сильный ход'}</small><p>${advice(s)}</p></div>`;$('mapTip').innerHTML=selected?`Разместите: <b>${byId[selected].short}</b>`:'Выберите следующий объект'}
function render(){renderFacilities();renderMarkers();renderMetrics()}
function point(e){const r=$('terrain').getBoundingClientRect();return{x:clamp((e.clientX-r.left)/r.width*100,3,97),y:clamp((e.clientY-r.top)/r.height*100,5,95)}}
function add(x,y){if(!selected)return showToast('Сначала выберите объект');if(protectedZone(x,y))return showToast('Береговая зона остаётся свободной от застройки');const f=byId[selected],c=counts();if((c[selected]||0)>=f.max)return showToast('Для этого объекта достигнут лимит');if(state().cost+f.cost>140)return showToast('Лимит концепции превышен');const p={uid:`${selected}-${Date.now()}`,type:selected,x,y};placements.push(p);active=p.uid;if(f.max===1)selected=null;save();render();showToast(`${f.label} добавлен`)}
function share(){const encoded=encodeURIComponent(btoa(JSON.stringify(placements))),url=`${location.origin}${location.pathname}#plan=${encoded}`;history.replaceState(null,'',`#plan=${encoded}`);if(navigator.clipboard?.writeText){navigator.clipboard.writeText(url).then(()=>showToast('Ссылка на концепцию скопирована')).catch(()=>showToast('Ссылка создана в адресной строке'))}else showToast('Ссылка создана в адресной строке')}
function openSummary(){const s=state(),c=counts();$('summaryTitle').textContent=s.reached===4?'Территория обрела баланс':'Концепция уже принимает форму';$('summaryGoals').textContent=`${s.reached}/4 целей достигнуто`;$('summaryVerdict').textContent=s.reached===4?'Сбалансированный сценарий':'Развивающийся сценарий';$('summaryAdvice').textContent=advice(s);$('scoreValue').textContent=s.readiness;$('scoreRing').style.setProperty('--score',`${s.readiness*3.6}deg`);$('summaryMetrics').innerHTML=`<div><i>♧</i><span>Природа</span><b>${s.nature}</b></div><div><i>✦</i><span>Привлекательность</span><b>${s.appeal}</b></div><div><i>●</i><span>Общественная польза</span><b>${s.community}</b></div><div><i>⌂</i><span>Объектов</span><b>${placements.length}</b></div>`;$('composition').innerHTML=facilities.filter(f=>c[f.id]).map(f=>`<span>${f.short} × ${c[f.id]}</span>`).join('');$('summary').showModal()}

$('terrain').onpointerdown=e=>{if(e.target.closest('.marker')||e.target.closest('.object-card'))return;const p=point(e);add(p.x,p.y)};
$('terrain').onpointermove=e=>{if(!drag)return;const p=point(e),item=placements.find(x=>x.uid===drag.uid),marker=document.querySelector(`[data-marker="${drag.uid}"]`);if(item){item.x=p.x;item.y=p.y}if(marker){marker.style.left=`${p.x}%`;marker.style.top=`${p.y}%`}};
$('terrain').onpointerup=e=>{if(!drag)return;const p=point(e),item=placements.find(x=>x.uid===drag.uid);if(item&&protectedZone(p.x,p.y)){item.x=drag.x;item.y=drag.y;showToast('Объект возвращён: берег должен оставаться свободным')}drag=null;save();render()};
$('terrain').onpointercancel=$('terrain').onpointerup;
$('undo').onclick=()=>{placements.pop();active=null;save();render()};
$('reset').onclick=()=>{if(confirm('Вернуть стартовую концепцию?')){placements=initial.map(x=>({...x}));selected='cabin';active=null;history.replaceState(null,'',location.pathname);save();render();showToast('Восстановлен стартовый эскиз')}};
$('night').onclick=()=>document.body.classList.toggle('night');
$('share').onclick=share;$('copySummary').onclick=share;
$('result').onclick=openSummary;$('continue').onclick=()=>$('summary').close();
render();
