const state = { config:null, year:new Date().getFullYear(), month:new Date().getMonth()+1, items:[], selectedDate:null };
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const api = async (path, options={}) => { const response=await fetch(path,{headers:{'content-type':'application/json'},...options}); const body=await response.json().catch(()=>({})); if(!response.ok) throw new Error(body.error||'Não foi possível concluir.'); return body; };
const statusLabel = { requested:'Solicitado', confirmed:'Confirmado', reserved:'Reservado', blocked:'Bloqueado', cancelled:'Cancelado' };
const monthNames = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

function showView(name) {
  $$('.view').forEach(view=>view.classList.toggle('active',view.id===`view-${name}`));
  $$('[data-view]').forEach(button=>button.classList.toggle('active',button.dataset.view===name));
  history.replaceState(null,'',`#${name}`); window.scrollTo({top:0,behavior:'smooth'});
}
$$('[data-view]').forEach(button=>button.addEventListener('click',()=>showView(button.dataset.view)));

async function loadConfig(){
  state.config=await api('/api/public/config');
  $('#sector-select').innerHTML='<option value="">Selecione</option>'+state.config.sectors.map(s=>`<option value="${s.id}">${escapeHtml(s.icon)} ${escapeHtml(s.name)}</option>`).join('');
  const a=state.config.auditorium; $('#auditorium-name').textContent=a.name; $('#auditorium-location').textContent=a.location;
  for(const key of ['capacity','equipment','structure','accessibility','duties','care']) $(`#info-${key}`).textContent=a[key]||'Informação a ser configurada.';
  $('#info-rules').innerHTML=(a.rules||'').split(/\n/).filter(Boolean).map(rule=>`<p>• ${escapeHtml(rule)}</p>`).join('');
  $('#photos').innerHTML=a.photos.length?a.photos.map(url=>`<img src="${escapeHtml(url)}" alt="Foto do ${escapeHtml(a.name)}" loading="lazy">`).join(''):'<div class="photo-placeholder" aria-label="Auditório">AS</div>';
}

async function loadCalendar(){
  const monthName=monthNames[state.month-1]; $('#month-title').textContent=`${monthName[0].toUpperCase()}${monthName.slice(1)} de ${state.year}`; $('#calendar').innerHTML='<div class="loading">Carregando…</div>';
  try{const data=await api(`/api/public/calendar?year=${state.year}&month=${state.month}`);state.items=data.items;renderCalendar();renderEvents();}catch(error){$('#calendar').innerHTML=`<div class="empty">${escapeHtml(error.message)}</div>`;}
}
function isoDate(year,month,day){return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;}
function renderCalendar(){
  const first=new Date(state.year,state.month-1,1),days=new Date(state.year,state.month,0).getDate(),previousDays=new Date(state.year,state.month-1,0).getDate();
  const cells=[]; for(let i=0;i<42;i++){const raw=i-first.getDay()+1;let day=raw,month=state.month,year=state.year,outside=false;if(raw<1){day=previousDays+raw;month--;outside=true;if(month<1){month=12;year--;}}else if(raw>days){day=raw-days;month++;outside=true;if(month>12){month=1;year++;}}const date=isoDate(year,month,day);const events=state.items.filter(item=>item.eventDate===date);cells.push(`<button class="calendar-day ${outside?'outside':''} ${date===state.selectedDate?'selected':''} ${date===new Date().toLocaleDateString('en-CA')?'today':''}" data-date="${date}" aria-label="${day}, ${events.length} eventos"><span>${day}</span><span class="day-dots">${events.slice(0,4).map(e=>`<i class="${e.status}"></i>`).join('')}</span></button>`);} $('#calendar').innerHTML=cells.join('');$$('.calendar-day').forEach(button=>button.addEventListener('click',()=>{state.selectedDate=button.dataset.date;renderCalendar();renderEvents();}));
}
function renderEvents(){
  const items=state.selectedDate?state.items.filter(item=>item.eventDate===state.selectedDate):state.items;
  $('#selected-title').textContent=state.selectedDate?`Agenda de ${new Date(`${state.selectedDate}T12:00:00`).toLocaleDateString('pt-BR')}`:'Eventos do mês';
  $('#show-month').hidden=!state.selectedDate;
  $('#event-list').innerHTML=items.length?items.map(item=>`<article class="event"><div class="sector-icon">${escapeHtml(item.sectorIcon)}</div><div><h3>${escapeHtml(item.eventName)}</h3><p>${escapeHtml(item.sectorName)}</p><div class="event-meta"><span>${new Date(`${item.eventDate}T12:00:00`).toLocaleDateString('pt-BR')}</span><span>${escapeHtml(item.startTime)} às ${escapeHtml(item.endTime)}</span><span class="status ${item.status}">${statusLabel[item.status]}</span></div></div></article>`).join(''):'<div class="empty">Nenhum evento para este período.</div>';
}
$('#prev-month').addEventListener('click',()=>{state.month--;if(state.month<1){state.month=12;state.year--;}state.selectedDate=null;loadCalendar();});
$('#next-month').addEventListener('click',()=>{state.month++;if(state.month>12){state.month=1;state.year++;}state.selectedDate=null;loadCalendar();});
$('#today').addEventListener('click',()=>{const now=new Date();state.year=now.getFullYear();state.month=now.getMonth()+1;state.selectedDate=new Date().toLocaleDateString('en-CA');loadCalendar();});
$('#show-month').addEventListener('click',()=>{state.selectedDate=null;renderCalendar();renderEvents();});

const form=$('#reservation-form'); const requesterType=form.elements.requesterType; const siape=form.elements.siape;
requesterType.addEventListener('change',()=>{const required=requesterType.value.toLocaleLowerCase('pt-BR').includes('servidor');siape.required=required;$('#siape-required').textContent=required?'*':'';});
$('#event-date').min=new Date().toLocaleDateString('en-CA');
function formData(){const raw=Object.fromEntries(new FormData(form));raw.sectorId=Number(raw.sectorId);raw.rulesAccepted=form.elements.rulesAccepted.checked;return raw;}
$('#review-request').addEventListener('click',()=>{
  if(!form.reportValidity())return; const data=formData(); if(data.startTime>=data.endTime){form.elements.endTime.setCustomValidity('O horário final deve ser posterior ao inicial.');form.elements.endTime.reportValidity();form.elements.endTime.setCustomValidity('');return;}
  const sector=state.config.sectors.find(item=>item.id===data.sectorId); const rows=[['Responsável',data.requesterName],['Tipo',data.requesterType],['Setor',`${sector?.icon||''} ${sector?.name||''}`],['Contato',`${data.phone} · ${data.email}`],['Evento',data.eventName],['Data e horário',`${new Date(`${data.eventDate}T12:00:00`).toLocaleDateString('pt-BR')} · ${data.startTime} às ${data.endTime}`],['Justificativa',data.justification]];
  $('#review-content').innerHTML='<h2>Confira antes de enviar</h2>'+rows.map(([label,value])=>`<div class="review-row"><small>${label}</small><b>${escapeHtml(value)}</b></div>`).join('');$('#form-fields').hidden=true;$('#review').hidden=false;$$('.form-progress span')[0].classList.remove('active');$$('.form-progress span')[1].classList.add('active');window.scrollTo({top:0,behavior:'smooth'});
});
$('#edit-request').addEventListener('click',()=>{$('#form-fields').hidden=false;$('#review').hidden=true;$$('.form-progress span')[0].classList.add('active');$$('.form-progress span')[1].classList.remove('active');});
form.addEventListener('submit',async event=>{event.preventDefault();const button=form.querySelector('[type="submit"]');button.disabled=true;button.textContent='Enviando…';try{const result=await api('/api/public/reservations',{method:'POST',body:JSON.stringify(formData())});$('#review').hidden=true;$('#form-result').hidden=false;$('#form-result').className='result';$('#form-result').innerHTML=`<h2>Solicitação enviada</h2><p>Protocolo: <b>${escapeHtml(result.protocol)}</b></p><p>Aguarde a análise e confirmação da administração.</p>`;form.reset();loadCalendar();}catch(error){$('#form-result').hidden=false;$('#form-result').className='result error';$('#form-result').textContent=error.message;}finally{button.disabled=false;button.textContent='Enviar solicitação';}});

void import('./brand-signature.js');
Promise.all([loadConfig(),loadCalendar()]).catch(console.error);showView(location.hash.slice(1)||'agenda');
