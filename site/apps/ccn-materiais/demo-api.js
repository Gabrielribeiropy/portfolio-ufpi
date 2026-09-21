(function () {
  const key = 'gabriel.ccn-materiais.demo.v1';
  const sessionKey = 'gabriel.ccn-materiais.demo.role';
  const now = new Date();
  const initial = {
    sector: { id: 1, name: 'Departamento de Matemática', responsible_name: 'Mariana Costa', siape: '0000000', institutional_email: 'mariana@ufpi.edu.br', phone: '(86) 99999-0000', request_contact: 'Mariana Costa' },
    types: [{ id: 1, name: 'Material de consumo' }, { id: 2, name: 'Material permanente' }],
    competencies: [
      { id: 101, type_id: 1, type_slug: 'consumo', type_icon: '📦', type_name: 'Material de consumo', month: now.getMonth() + 1, year: now.getFullYear(), request_status: 'filling', current_version: 1, pdf_id: null },
      { id: 102, type_id: 2, type_slug: 'permanente', type_icon: '🖥️', type_name: 'Material permanente', month: now.getMonth() + 1, year: now.getFullYear(), request_status: 'not_started', current_version: null, pdf_id: null }
    ],
    products: [
      { id: 1, code: '3016', name: 'Papel A4', description: 'Resma com 500 folhas', unit: 'resma', quantity: 2 },
      { id: 2, code: '4723', name: 'Caneta esferográfica azul', description: 'Ponta média', unit: 'unidade', quantity: 10 },
      { id: 3, code: '6120', name: 'Pasta arquivo', description: 'Pasta com elástico', unit: 'unidade', quantity: 0 },
      { id: 4, code: '7841', name: 'Marcador para quadro branco', description: 'Cor azul', unit: 'unidade', quantity: 4 }
    ],
    request: { id: 501, competency_id: 101, type_name: 'Material de consumo', month: now.getMonth() + 1, year: now.getFullYear(), status: 'filling', sheet_version: 1 },
    sectors: [
      { id: 1, name: 'Departamento de Matemática', responsible_name: 'Mariana Costa', institutional_email: 'mariana@ufpi.edu.br', login_name: 'matematica', phone: '(86) 99999-0000', siape: '0000000', request_contact: 'Mariana Costa', active: true },
      { id: 2, name: 'Departamento de Biologia', responsible_name: 'Lucas Lima', institutional_email: 'lucas@ufpi.edu.br', login_name: 'biologia', phone: '(86) 98888-0000', siape: '', request_contact: 'Lucas Lima', active: true }
    ],
    versions: [{ id: 701, competency_id: 101, type_name: 'Material de consumo', month: now.getMonth() + 1, year: now.getFullYear(), version_number: 1, row_count: 4, original_filename: 'materiais-demo.xlsx', status: 'published' }],
    requests: [{ id: 501, competency_id: 101, sector_id: 1, sector_name: 'Departamento de Matemática', responsible_name: 'Mariana Costa', type_name: 'Material de consumo', month: now.getMonth() + 1, year: now.getFullYear(), status: 'filling', current_version: null, latest_pdf_id: null, updated_at: new Date().toISOString() }],
    logs: [{ action: 'competency_published', actor_role: 'master', actor_id: 1, entity_type: 'competency', entity_id: 101, created_at: new Date().toISOString() }],
    outbox: [{ subject: 'Nova competência disponível', recipient: 'setores@ufpi.edu.br', status: 'demo' }],
    settings: { direction_email: 'direcao.ccn@ufpi.edu.br' }
  };
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const load = () => { try { return JSON.parse(localStorage.getItem(key)) || clone(initial); } catch { return clone(initial); } };
  const save = (state) => localStorage.setItem(key, JSON.stringify(state));
  const json = (payload, status = 200) => Promise.resolve(new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json' } }));
  const parseBody = (options) => { try { return JSON.parse(options?.body || '{}'); } catch { return {}; } };
  const originalFetch = window.fetch.bind(window);

  window.fetch = function (input, options = {}) {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href);
    if (!url.pathname.startsWith('/api/')) return originalFetch(input, options);
    const state = load(); const path = url.pathname; const method = (options.method || 'GET').toUpperCase();
    if (path === '/api/auth/session') { const role = sessionStorage.getItem(sessionKey); return role ? json({ role }) : json({ error: 'Sessão demonstrativa não iniciada.' }, 401); }
    if (path === '/api/auth/login' && method === 'POST') {
      const inputBody = parseBody(options); const login = String(inputBody.login || '').toLowerCase(); const role = login === 'master' ? 'master' : login === 'setor' ? 'user' : '';
      if (!role || inputBody.password !== 'demo123') return json({ error: 'Use setor ou master com a senha demo123.' }, 401);
      sessionStorage.setItem(sessionKey, role); return json({ role });
    }
    if (path === '/api/auth/logout') { sessionStorage.removeItem(sessionKey); return json({ ok: true }); }
    if (path.startsWith('/api/master/') && sessionStorage.getItem(sessionKey) !== 'master') return json({ error: 'Acesso Master necessário.' }, 401);
    if (path.startsWith('/api/user/') && sessionStorage.getItem(sessionKey) !== 'user') return json({ error: 'Acesso do setor necessário.' }, 401);
    if (path === '/api/user/dashboard') return json({ sector: state.sector, competencies: state.competencies });
    if (path === '/api/user/profile' && method === 'PATCH') { const inputBody = parseBody(options); Object.assign(state.sector, { responsible_name: inputBody.responsibleName, siape: inputBody.siape, institutional_email: inputBody.institutionalEmail, phone: inputBody.phone, request_contact: inputBody.requestContact }); save(state); return json({ ok: true }); }
    if (path === '/api/user/requests/start') { const inputBody = parseBody(options); const competency = state.competencies.find((item) => item.id === Number(inputBody.competencyId)) || state.competencies[0]; state.request.competency_id = competency.id; state.request.type_name = competency.type_name; state.request.month = competency.month; state.request.year = competency.year; save(state); return json({ requestId: state.request.id }); }
    if (path === `/api/user/requests/${state.request.id}` && method === 'GET') return json({ request: state.request, products: state.products, versions: state.request.status === 'submitted' ? [{ id: 801, version_number: 1 }] : [] });
    if (path.endsWith('/draft') && method === 'POST') { const inputBody = parseBody(options); for (const item of inputBody.items || []) { const product = state.products.find((row) => row.id === Number(item.productId)); if (product) product.quantity = Number(item.quantity) || 0; } save(state); return json({ ok: true }); }
    if (path.endsWith('/submit') && method === 'POST') { state.request.status = 'submitted'; state.competencies.find((item) => item.id === state.request.competency_id).request_status = 'submitted'; state.requests[0].status = 'submitted'; state.requests[0].current_version = 1; state.requests[0].updated_at = new Date().toISOString(); save(state); return json({ ok: true }); }
    if (path.endsWith('/request-rectification') && method === 'POST') { state.request.status = 'rectification_requested'; state.requests[0].status = 'rectification_requested'; save(state); return json({ ok: true }); }
    if (path === '/api/master/data') return json({ types: state.types, competencies: state.competencies, versions: state.versions, sectors: state.sectors, requests: state.requests, missing: [{ month: now.getMonth() + 1, year: now.getFullYear(), type_name: 'Material de consumo', sectors: [state.sectors[1]] }], logs: state.logs, outbox: state.outbox, settings: state.settings });
    const productsMatch = path.match(/^\/api\/master\/versions\/(\d+)\/products$/);
    if (productsMatch) return json({ items: state.products });
    if (path === '/api/master/competencies/import' && method === 'POST') return json({ versionId: 702, rowCount: state.products.length, preview: state.products });
    if (/\/api\/master\/versions\/\d+\/(validate|publish)$/.test(path)) return json({ ok: true });
    if (path === '/api/master/sectors' && method === 'POST') { const inputBody = parseBody(options); state.sectors.push({ id: Date.now(), name: inputBody.name, responsible_name: inputBody.responsibleName, institutional_email: inputBody.institutionalEmail, login_name: inputBody.loginName || 'novo.setor', phone: inputBody.phone || '', siape: inputBody.siape || '', request_contact: inputBody.requestContact || '', active: true }); save(state); return json({ setupUrl: './senha.html#demo' }); }
    const sectorMatch = path.match(/^\/api\/master\/sectors\/(\d+)$/);
    if (sectorMatch && method === 'PATCH') { const item = state.sectors.find((row) => row.id === Number(sectorMatch[1])); const inputBody = parseBody(options); if (item) Object.assign(item, { name: inputBody.name, responsible_name: inputBody.responsibleName, institutional_email: inputBody.institutionalEmail, login_name: inputBody.loginName, phone: inputBody.phone, siape: inputBody.siape, request_contact: inputBody.requestContact, active: inputBody.active }); save(state); return json({ ok: true }); }
    if (/\/api\/master\/sectors\/\d+\/reset$/.test(path)) return json({ message: 'Link demonstrativo gerado.' });
    const detailsMatch = path.match(/^\/api\/master\/requests\/(\d+)\/details$/);
    if (detailsMatch) return json({ request: state.requests[0], versions: [{ id: 801, version_number: 1, submitted_at: new Date().toISOString(), items: state.products.filter((item) => item.quantity > 0) }] });
    if (/\/api\/master\/requests\/\d+\/rectify$/.test(path)) { state.request.status = 'correction_allowed'; state.requests[0].status = 'correction_allowed'; save(state); return json({ ok: true }); }
    if (/\/api\/master\/requests\/\d+\/close$/.test(path)) { state.request.status = 'closed'; state.requests[0].status = 'closed'; save(state); return json({ ok: true }); }
    if (path === '/api/master/settings') { state.settings.direction_email = parseBody(options).directionEmail || state.settings.direction_email; save(state); return json({ ok: true }); }
    if (path === '/api/password/forgot' || path === '/api/password/set') return json({ message: 'Ação simulada com sucesso.' });
    return json({ error: 'Ação indisponível nesta demonstração.' }, 404);
  };
  window.CCN_DEMO = { reset: () => { localStorage.removeItem(key); location.reload(); } };
})();
