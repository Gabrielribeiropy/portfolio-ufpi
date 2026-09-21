const news = [
  { category: 'Institucional', date: '03 set. 2026', title: 'CCN celebra o Dia do Biólogo', text: 'Uma homenagem aos profissionais que fazem parte da história e do cotidiano do Centro.' },
  { category: 'Comunicado', date: '02 set. 2026', title: 'Calendário de colações de grau — 2026.1', text: 'Confira as datas e orientações divulgadas para o período acadêmico.' },
  { category: 'Resultado', date: '01 set. 2026', title: 'Resultado final da seleção do PPG', text: 'Resultado demonstrativo referente ao processo seletivo do programa.' },
  { category: 'Institucional', date: '28 ago. 2026', title: 'Semana de Ciência e Tecnologia', text: 'Programação integrada de palestras, oficinas e apresentações.' }
];
const services = ['Graduação', 'Departamentos', 'Documentos', 'Espaços', 'Mapa do CCN', 'Calendário'];
const grid = document.querySelector('#news-grid');
function render(filter = 'Todas') {
  const rows = filter === 'Todas' ? news : news.filter((item) => item.category === filter);
  grid.innerHTML = rows.map((item, index) => `<article class="news-card"><div class="news-image">${String(index + 1).padStart(2, '0')}</div><div class="news-copy"><span>${item.category} · ${item.date}</span><h3>${item.title}</h3><p>${item.text}</p><button data-read="${item.title}">Ler notícia →</button></div></article>`).join('');
  document.querySelectorAll('[data-read]').forEach((button) => button.addEventListener('click', () => alert(`${button.dataset.read}\n\nConteúdo demonstrativo para visualização da experiência.`)));
}
document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => { document.querySelectorAll('[data-filter]').forEach((item) => item.classList.remove('active')); button.classList.add('active'); render(button.dataset.filter); }));
document.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => { const result = document.querySelector('#category-result'); result.hidden = false; result.textContent = `${button.dataset.category}: área demonstrativa preparada para receber conteúdos e serviços oficiais.`; result.scrollIntoView({ behavior: 'smooth', block: 'center' }); }));
const dialog = document.querySelector('#search-dialog'); const input = document.querySelector('#search-input'); const results = document.querySelector('#search-results');
document.querySelector('#search-open').addEventListener('click', () => dialog.showModal());
input.addEventListener('input', () => { const term = input.value.trim().toLowerCase(); const rows = [...news.map((item) => ({ title: item.title, type: item.category })), ...services.map((title) => ({ title, type: 'Serviço' }))].filter((item) => !term || item.title.toLowerCase().includes(term)); results.innerHTML = rows.slice(0, 8).map((item) => `<div class="search-row"><b>${item.title}</b><small>${item.type}</small></div>`).join('') || '<div class="search-row">Nenhum resultado encontrado.</div>'; });
const menu = document.querySelector('#mobile-menu'); document.querySelector('#menu-open').addEventListener('click', () => { menu.classList.add('open'); menu.setAttribute('aria-hidden', 'false'); }); document.querySelector('#menu-close').addEventListener('click', () => { menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true'); }); menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => document.querySelector('#menu-close').click()));
render();
