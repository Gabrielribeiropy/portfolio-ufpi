void import('./brand-signature.js');
const form=document.querySelector('#login-form'),message=document.querySelector('#login-message');
fetch('/api/auth/session').then(response=>response.ok?response.json():null).then(session=>{if(session)location.href=session.role==='master'?'./master/':'./app/';});
form.addEventListener('submit',async event=>{event.preventDefault();message.textContent='Entrando…';const response=await fetch('/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))}),body=await response.json().catch(()=>({}));if(!response.ok){message.textContent=body.error||'Não foi possível entrar.';return;}location.href=body.role==='master'?'./master/':'./app/';});
