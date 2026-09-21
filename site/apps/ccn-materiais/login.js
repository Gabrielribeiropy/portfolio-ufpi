void import('./brand-signature.js');
const form=document.querySelector('#login-form'),message=document.querySelector('#login-message');
const requestedAccess=new URLSearchParams(location.search).get('acesso');if(requestedAccess==='master')form.elements.login.value='master';
document.querySelectorAll('[data-demo-login]').forEach(button=>button.addEventListener('click',()=>{form.elements.login.value=button.dataset.demoLogin;form.elements.password.value='demo123';form.elements.login.focus();}));
fetch('/api/auth/session').then(response=>response.ok?response.json():null).then(session=>{if(session)location.href=session.role==='master'?'./master/':'./app/';});
form.addEventListener('submit',async event=>{event.preventDefault();message.textContent='Entrando…';const response=await fetch('/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))}),body=await response.json().catch(()=>({}));if(!response.ok){message.textContent=body.error||'Não foi possível entrar.';return;}location.href=body.role==='master'?'./master/':'./app/';});
