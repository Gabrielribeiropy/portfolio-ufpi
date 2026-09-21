(function () {
  const key = 'gabriel.ccn-auditorio.demo.v1';
  const pad = (value) => String(value).padStart(2, '0');
  const iso = (offset) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };
  const initial = {
    sectors: [
      { id: 1, name: 'Direção do CCN', icon: '🏛️', active: true },
      { id: 2, name: 'Departamento de Matemática', icon: '📐', active: true },
      { id: 3, name: 'Departamento de Biologia', icon: '🧬', active: true }
    ],
    settings: {
      auditorium_name: 'Auditório Afonso Sena',
      capacity: '120 lugares',
      location: 'Centro de Ciências da Natureza — UFPI',
      equipment: 'Projetor, sistema de som, microfones e computador.',
      structure: 'Palco, climatização, cabine técnica e foyer.',
      accessibility: 'Acesso por rampa e espaços reservados.',
      duties: 'Manter os horários e informar alterações com antecedência.',
      care: 'Preservar equipamentos, mobiliário e limpeza do espaço.',
      rules: 'Solicitar com antecedência\nAguardar confirmação da administração\nRespeitar a capacidade do auditório',
      photos: '',
      direction_email: 'direcao.ccn@ufpi.edu.br'
    },
    reservations: [
      { id: 1, protocol: 'AS-DEMO-001', event_name: 'Seminário de Ciências', event_date: iso(2), start_time: '09:00', end_time: '11:00', sector_id: 3, sector_name: 'Departamento de Biologia', sector_icon: '🧬', status: 'confirmed', source: 'public', requester_name: 'Mariana Costa', requester_type: 'Servidora', phone: '(86) 99999-0000', email: 'mariana@ufpi.edu.br', institutional_email: 'mariana@ufpi.edu.br', siape: '0000000', justification: 'Apresentação acadêmica', admin_note: '' },
      { id: 2, protocol: 'AS-DEMO-002', event_name: 'Defesa de Trabalho', event_date: iso(6), start_time: '14:00', end_time: '16:00', sector_id: 2, sector_name: 'Departamento de Matemática', sector_icon: '📐', status: 'requested', source: 'public', requester_name: 'Lucas Lima', requester_type: 'Discente', phone: '(86) 98888-0000', email: 'lucas@ufpi.edu.br', institutional_email: '', siape: '', justification: 'Defesa acadêmica', admin_note: '' }
    ],
    logs: [{ action: 'reservation_requested', actor: 'Demonstração', entity_type: 'reservation', entity_id: 2, created_at: new Date().toISOString() }],
    outbox: [{ subject: 'Solicitação recebida', recipient: 'direcao.ccn@ufpi.edu.br', status: 'demo', attempts: 0, last_error: '' }]
  };
  const load = () => {
    try { return JSON.parse(localStorage.getItem(key)) || structuredClone(initial); }
    catch { return structuredClone(initial); }
  };
  const save = (state) => localStorage.setItem(key, JSON.stringify(state));
  const json = (body, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));
  const body = (options) => {
    try { return JSON.parse(options?.body || '{}'); }
    catch { return {}; }
  };
  const originalFetch = window.fetch.bind(window);

  window.fetch = function (input, options = {}) {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href);
    if (!url.pathname.startsWith('/api/')) return originalFetch(input, options);
    const state = load();
    const path = url.pathname;
    const method = (options.method || 'GET').toUpperCase();

    if (path === '/api/public/config') return json({ sectors: state.sectors.filter((item) => item.active), auditorium: { name: state.settings.auditorium_name, location: state.settings.location, capacity: state.settings.capacity, equipment: state.settings.equipment, structure: state.settings.structure, accessibility: state.settings.accessibility, duties: state.settings.duties, care: state.settings.care, rules: state.settings.rules, photos: String(state.settings.photos || '').split('\n').filter(Boolean) } });
    if (path === '/api/public/calendar') return json({ items: state.reservations.filter((item) => item.status !== 'cancelled').map((item) => ({ eventDate: item.event_date, eventName: item.event_name, startTime: item.start_time, endTime: item.end_time, sectorName: item.sector_name, sectorIcon: item.sector_icon, status: item.status })) });
    if (path === '/api/public/reservations' && method === 'POST') {
      const inputBody = body(options); const sector = state.sectors.find((item) => item.id === Number(inputBody.sectorId)) || state.sectors[0]; const id = Date.now(); const protocol = `AS-DEMO-${String(id).slice(-6)}`;
      state.reservations.push({ id, protocol, event_name: inputBody.eventName, event_date: inputBody.eventDate, start_time: inputBody.startTime, end_time: inputBody.endTime, sector_id: sector.id, sector_name: sector.name, sector_icon: sector.icon, status: 'requested', source: 'public', requester_name: inputBody.requesterName, requester_type: inputBody.requesterType, phone: inputBody.phone, email: inputBody.email, institutional_email: inputBody.institutionalEmail || '', siape: inputBody.siape || '', justification: inputBody.justification, admin_note: '' });
      state.logs.unshift({ action: 'reservation_requested', actor: inputBody.requesterName, entity_type: 'reservation', entity_id: id, created_at: new Date().toISOString() }); save(state); return json({ protocol });
    }
    if (path === '/api/admin/session' || path === '/api/admin/login' || path === '/api/admin/logout') return json({ ok: true });
    if (path === '/api/admin/data') return json(state);
    if (path === '/api/admin/reservations' && method === 'POST') {
      const inputBody = body(options); const sector = state.sectors.find((item) => item.id === Number(inputBody.sectorId)) || state.sectors[0]; const id = Date.now(); const protocol = `AS-ADM-${String(id).slice(-6)}`;
      state.reservations.push({ id, protocol, event_name: inputBody.eventName, event_date: inputBody.eventDate, start_time: inputBody.startTime, end_time: inputBody.endTime, sector_id: sector.id, sector_name: sector.name, sector_icon: sector.icon, status: inputBody.block ? 'blocked' : (inputBody.status || 'confirmed'), source: 'admin', requester_name: inputBody.requesterName, requester_type: inputBody.requesterType, phone: inputBody.phone, email: inputBody.email, institutional_email: inputBody.institutionalEmail || '', siape: inputBody.siape || '', justification: inputBody.justification, admin_note: '' }); save(state); return json({ protocol });
    }
    const reservationMatch = path.match(/^\/api\/admin\/reservations\/(\d+)$/);
    if (reservationMatch && method === 'PATCH') { const item = state.reservations.find((row) => row.id === Number(reservationMatch[1])); const inputBody = body(options); const sector = state.sectors.find((row) => row.id === Number(inputBody.sectorId)); if (item) Object.assign(item, { event_name: inputBody.eventName, event_date: inputBody.eventDate, start_time: inputBody.startTime, end_time: inputBody.endTime, sector_id: sector?.id || item.sector_id, sector_name: sector?.name || item.sector_name, sector_icon: sector?.icon || item.sector_icon, status: inputBody.status, admin_note: inputBody.adminNote || '' }); save(state); return json({ ok: true }); }
    if (path === '/api/admin/sectors' && method === 'POST') { const inputBody = body(options); state.sectors.push({ id: Date.now(), name: inputBody.name, icon: inputBody.icon || '🏛️', active: true }); save(state); return json({ ok: true }); }
    const sectorMatch = path.match(/^\/api\/admin\/sectors\/(\d+)$/);
    if (sectorMatch && method === 'PATCH') { const item = state.sectors.find((row) => row.id === Number(sectorMatch[1])); if (item) Object.assign(item, body(options)); save(state); return json({ ok: true }); }
    if (path === '/api/admin/settings' && method === 'POST') { Object.assign(state.settings, body(options)); save(state); return json({ ok: true }); }
    return json({ error: 'Ação indisponível nesta demonstração.' }, 404);
  };
  window.CCN_DEMO = { reset: () => { localStorage.removeItem(key); location.reload(); } };
})();
