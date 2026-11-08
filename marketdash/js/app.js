/* ====== Utilitários ====== */
const $ = (s, r = document) => r.querySelector(s);
const brl = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const brl2 = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const num = n => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
const fdate = d => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');
const prod = id => DB.produtos.find(p => p.id == id);
const camp = id => DB.campanhas.find(c => c.id == id);
const cli = id => DB.clientes.find(c => c.id == id);
const esc = s => String(s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
const store = {
  get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} },
  del: k => { try { localStorage.removeItem(k); } catch (e) {} }
};
const PLATAFORMAS = ['Meta Ads', 'Google Ads', 'TikTok Ads', 'YouTube Ads', 'Pinterest', 'Outra'];
const COLORS = ['#0b7a62', '#e8a317', '#3b82c4', '#c8508b', '#7a5cd6', '#8a9a94'];

const ICON = {
  dashboard: '<path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z"/>',
  campanhas: '<path d="M3 11l18-8v18L3 13z"/><path d="M11 14v5a2 2 0 0 1-4 0v-3"/>',
  clientes: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6"/>',
  produtos: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  analise: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
  config: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.4 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.4-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.2-.8.2-1.2z"/>',
  money: '<path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  spend: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  profit: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
  roas: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>',
  active: '<path d="M13 2L3 14h8l-1 8 10-12h-8z"/>',
  moon: '<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'
};
const svg = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICON[n]}</svg>`;

/* ====== Cálculos ====== */
function statsCamp(c) {
  const vs = DB.vendas.filter(v => v.campanhaId == c.id);
  const fat = vs.reduce((s, v) => s + prod(v.produtoId).preco, 0);
  const custo = vs.reduce((s, v) => s + prod(v.produtoId).custo, 0);
  const lucro = fat - custo - c.investimento;
  const n = vs.length;
  return { vs, vendas: n, fat, lucro,
    roas: c.investimento ? fat / c.investimento : 0,
    roi: c.investimento ? lucro / c.investimento * 100 : 0,
    cac: n ? c.investimento / n : 0,
    conv: c.leads ? n / c.leads * 100 : 0 };
}
function clienteInfo(cl) {
  const vs = DB.vendas.filter(v => v.clienteId == cl.id).sort((a, b) => a.data.localeCompare(b.data));
  const total = vs.reduce((s, v) => s + prod(v.produtoId).preco, 0);
  return { vs, total, qtd: vs.length, ultima: vs.length ? vs[vs.length - 1].data : null, origem: vs.length ? camp(vs[0].campanhaId) : null };
}
function series(vs, days) {
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    out.push({ k: iso(d), l: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), v: 0 });
  }
  vs.forEach(v => { const o = out.find(x => x.k === v.data); if (o) o.v += prod(v.produtoId).preco; });
  return out;
}
const fatOf = vs => vs.reduce((s, v) => s + prod(v.produtoId).preco, 0);

/* ====== Componentes de gráfico ====== */
function lineChart(data) {
  const W = 640, H = 230, p = { l: 48, r: 12, t: 12, b: 26 };
  const vals = data.map(d => d.v);
  const max = Math.max(...vals, 1) * 1.1;
  const x = i => p.l + i * (W - p.l - p.r) / Math.max(vals.length - 1, 1);
  const y = v => p.t + (H - p.t - p.b) * (1 - v / max);
  const pts = vals.map((v, i) => x(i).toFixed(1) + ',' + y(v).toFixed(1)).join(' ');
  let g = '';
  for (let i = 0; i <= 4; i++) { const v = max * i / 4; g += `<line x1="${p.l}" x2="${W - p.r}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="${p.l - 8}" y="${y(v) + 4}" class="ax" text-anchor="end">${Math.round(v)}</text>`; }
  const step = Math.ceil(data.length / 6);
  data.forEach((d, i) => { if (i % step === 0) g += `<text x="${x(i)}" y="${H - 6}" class="ax" text-anchor="middle">${d.l}</text>`; });
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Gráfico de vendas"><defs><linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--primary)" stop-opacity=".28"/><stop offset="1" stop-color="var(--primary)" stop-opacity="0"/></linearGradient></defs>${g}<polygon points="${p.l},${H - p.b} ${pts} ${x(vals.length - 1)},${H - p.b}" fill="url(#gr)"/><polyline points="${pts}" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}
function hbars(items, alt) {
  const max = Math.max(...items.map(i => i.v), 1);
  return items.map(i => `<div class="hbar"><span class="lb" title="${esc(i.l)}">${esc(i.l)}</span><div class="track"><div class="fill ${alt || ''}" style="width:${i.v / max * 100}%"></div></div><b>${i.t}</b></div>`).join('') || '<div class="empty">Sem dados no período.</div>';
}
function donut(items) {
  const total = items.reduce((s, i) => s + i.v, 0) || 1;
  let acc = 0;
  const stops = items.map((it, i) => { const a = acc / total * 100; acc += it.v; return `${COLORS[i % 6]} ${a}% ${acc / total * 100}%`; }).join(',');
  return `<div class="donut-wrap"><div class="donut" style="background:conic-gradient(${stops || 'var(--surface-2) 0 100%'})"></div><div class="legend">${items.map((it, i) => `<div class="legend-row"><i style="background:${COLORS[i % 6]}"></i>${esc(it.l)}<b>${it.t}</b></div>`).join('')}</div></div>`;
}
const kpi = (label, value, icon, cls = '') => `<div class="card kpi ${cls}"><div class="ico">${svg(icon)}</div><span>${label}</span><strong>${value}</strong></div>`;
const roasTxt = n => num(n) + 'x';

/* ====== Views ====== */
const views = {};

views.dashboard = () => {
  const fat = fatOf(DB.vendas);
  const custo = DB.vendas.reduce((s, v) => s + prod(v.produtoId).custo, 0);
  const gasto = DB.campanhas.reduce((s, c) => s + c.investimento, 0);
  const lucro = fat - custo - gasto;
  const st = DB.campanhas.map(statsCamp);
  const avg = k => st.length ? st.reduce((s, x) => s + x[k], 0) / st.length : 0;
  const v30 = DB.vendas.filter(v => v.data >= daysAgo(29));
  const best = DB.campanhas.map(c => ({ c, s: statsCamp(c) })).sort((a, b) => b.s.roas - a.s.roas).slice(0, 4);
  return `
  <div class="toolbar"><div class="grow sub">Resumo geral de todas as campanhas</div><a class="btn primary" href="#campanhas" data-act="new-camp">+ Nova campanha</a></div>
  <div class="grid kpis">
    ${kpi('Faturamento', brl(fat), 'money', 'hero')}
    ${kpi('Gasto total', brl(gasto), 'spend')}
    ${kpi('Lucro', `<span class="${lucro >= 0 ? 'pos' : 'neg'}">${brl(lucro)}</span>`, 'profit')}
    ${kpi('ROAS médio', roasTxt(avg('roas')), 'roas')}
    ${kpi('ROI médio', num(avg('roi')) + '%', 'profit')}
    ${kpi('Campanhas ativas', DB.campanhas.filter(c => c.status === 'ativa').length, 'active')}
    ${kpi('Total de clientes', DB.clientes.length, 'clientes')}
  </div>
  <div class="grid cols-2">
    <div class="card"><div class="card-head"><h2>Vendas nos últimos 30 dias (R$)</h2><span class="badge">${v30.length} vendas</span></div>${lineChart(series(v30, 30))}</div>
    <div class="card"><h2>Melhores campanhas</h2>${hbars(best.map(b => ({ l: b.c.nome, v: b.s.roas, t: roasTxt(b.s.roas) })))}<a href="#analise">Ver análise completa</a></div>
  </div>
  <div class="card"><div class="card-head"><h2>Últimas compras</h2></div><div class="table-wrap"><table>
    <thead><tr><th>Data</th><th>Cliente</th><th>Produto</th><th>Campanha</th><th class="r">Valor</th></tr></thead><tbody>
    ${DB.vendas.slice(0, 6).map(v => `<tr><td>${fdate(v.data)}</td><td class="name">${esc(cli(v.clienteId).nome)}</td><td>${esc(prod(v.produtoId).nome)}</td><td>${esc(camp(v.campanhaId).nome)}</td><td class="r"><b>${brl(prod(v.produtoId).preco)}</b></td></tr>`).join('')}
    </tbody></table></div></div>`;
};

const campFilter = { plat: '', status: '' };
views.campanhas = () => `
  <div class="toolbar">
    <select data-filter="plat" aria-label="Plataforma"><option value="">Todas as plataformas</option>${PLATAFORMAS.map(p => `<option ${campFilter.plat === p ? 'selected' : ''}>${p}</option>`).join('')}</select>
    <select data-filter="status" aria-label="Status"><option value="">Todos os status</option><option value="ativa" ${campFilter.status === 'ativa' ? 'selected' : ''}>Ativa</option><option value="encerrada" ${campFilter.status === 'encerrada' ? 'selected' : ''}>Encerrada</option></select>
    <div class="grow"></div><button class="btn primary" data-act="new-camp">+ Nova campanha</button>
  </div>
  <div class="card"><div class="table-wrap" id="campTable">${campTable()}</div></div>`;

function campTable() {
  const list = DB.campanhas.filter(c => (!campFilter.plat || c.plataforma === campFilter.plat) && (!campFilter.status || c.status === campFilter.status));
  if (!list.length) return '<div class="empty">Nenhuma campanha encontrada. Ajuste os filtros ou crie uma campanha.</div>';
  return `<table><thead><tr><th>Campanha</th><th>Plataforma</th><th>Produto</th><th class="r">Investimento</th><th class="r">ROAS</th><th>Status</th><th></th></tr></thead><tbody>
  ${list.map(c => { const s = statsCamp(c); return `<tr><td><a href="#campanha/${c.id}" class="name">${esc(c.nome)}</a><div class="sub"><span class="code">${esc(c.codigo)}</span> · ${fdate(c.inicio)} a ${fdate(c.fim)}</div></td><td>${esc(c.plataforma)}</td><td>${esc(prod(c.produtoId)?.nome || '-')}</td><td class="r">${brl(c.investimento)}</td><td class="r"><b>${roasTxt(s.roas)}</b></td><td><span class="badge ${c.status === 'ativa' ? 'ok' : ''}">${c.status === 'ativa' ? 'Ativa' : 'Encerrada'}</span></td><td><div class="actions"><button class="btn sm" data-act="edit-camp" data-id="${c.id}">Editar</button><button class="btn sm ghost" data-act="del-camp" data-id="${c.id}">Excluir</button></div></td></tr>`; }).join('')}</tbody></table>`;
}

views.campanha = id => {
  const c = camp(id); if (!c) return '<div class="empty">Campanha não encontrada.</div>';
  const s = statsCamp(c);
  const byCli = {};
  s.vs.forEach(v => { byCli[v.clienteId] = (byCli[v.clienteId] || 0) + prod(v.produtoId).preco; });
  return `
  <a class="back" href="#campanhas">← Voltar para campanhas</a>
  <div class="card" style="margin-bottom:16px"><div class="card-head"><h2>${esc(c.nome)}</h2><span class="badge ${c.status === 'ativa' ? 'ok' : ''}">${c.status === 'ativa' ? 'Ativa' : 'Encerrada'}</span></div>
    <div class="kv"><div><span>Plataforma</span><strong>${esc(c.plataforma)}</strong></div><div><span>Produto</span><strong>${esc(prod(c.produtoId)?.nome || '-')}</strong></div><div><span>Período</span><strong>${fdate(c.inicio)} a ${fdate(c.fim)}</strong></div><div><span>Investimento</span><strong>${brl(c.investimento)}</strong></div><div><span>Código (API)</span><strong class="code">${esc(c.codigo)}</strong></div></div></div>
  <div class="grid kpis">
    ${kpi('ROI', `<span class="${s.roi >= 0 ? 'pos' : 'neg'}">${num(s.roi)}%</span>`, 'profit')}
    ${kpi('ROAS', roasTxt(s.roas), 'roas')}
    ${kpi('CAC', brl2(s.cac), 'spend')}
    ${kpi('Leads', c.leads, 'clientes')}
    ${kpi('Vendas', s.vendas, 'money')}
    ${kpi('Taxa de conversão', num(s.conv) + '%', 'active')}
  </div>
  <div class="card" style="margin-bottom:16px"><h2>Vendas ao longo do tempo (R$)</h2>${lineChart(series(s.vs, 60))}</div>
  <div class="card"><h2>Clientes que compraram por esta campanha</h2><div class="table-wrap"><table><thead><tr><th>Cliente</th><th>Email</th><th class="r">Total gasto</th></tr></thead><tbody>
  ${Object.keys(byCli).map(k => `<tr><td><a href="#cliente/${k}" class="name">${esc(cli(k).nome)}</a></td><td>${esc(cli(k).email)}</td><td class="r"><b>${brl(byCli[k])}</b></td></tr>`).join('') || '<tr><td colspan="3" class="empty">Nenhuma venda registrada ainda.</td></tr>'}
  </tbody></table></div></div>`;
};

views.clientes = () => `
  <div class="toolbar"><input type="search" id="cliSearch" placeholder="Buscar por nome ou email" aria-label="Buscar cliente"><div class="grow"></div><span class="sub">${DB.clientes.length} clientes</span></div>
  <div class="card"><div class="table-wrap" id="cliTable">${cliTable('')}</div></div>`;

function cliTable(q) {
  q = q.toLowerCase();
  const list = DB.clientes.filter(c => c.nome.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  if (!list.length) return '<div class="empty">Nenhum cliente encontrado para essa busca.</div>';
  return `<table><thead><tr><th>Nome</th><th>Email</th><th>Telefone</th><th class="r">Total gasto</th><th class="r">Compras</th><th>Última compra</th><th>Campanha de origem</th></tr></thead><tbody>
  ${list.map(c => { const i = clienteInfo(c); return `<tr><td><a href="#cliente/${c.id}" class="name">${esc(c.nome)}</a></td><td>${esc(c.email)}</td><td>${esc(c.telefone)}</td><td class="r"><b>${brl(i.total)}</b></td><td class="r">${i.qtd}</td><td>${i.ultima ? fdate(i.ultima) : '-'}</td><td>${i.origem ? esc(i.origem.nome) : '-'}</td></tr>`; }).join('')}</tbody></table>`;
}

views.cliente = id => {
  const c = cli(id); if (!c) return '<div class="empty">Cliente não encontrado.</div>';
  const i = clienteInfo(c);
  return `
  <a class="back" href="#clientes">← Voltar para clientes</a>
  <div class="card" style="margin-bottom:16px"><div class="card-head"><h2>${esc(c.nome)}</h2></div>
    <div class="kv"><div><span>Email</span><strong>${esc(c.email)}</strong></div><div><span>Telefone</span><strong>${esc(c.telefone)}</strong></div><div><span>Total gasto</span><strong>${brl(i.total)}</strong></div><div><span>Compras</span><strong>${i.qtd}</strong></div><div><span>Campanha de origem</span><strong>${i.origem ? esc(i.origem.nome) : '-'}</strong></div></div></div>
  <div class="card"><h2>Histórico de compras</h2><div class="table-wrap"><table><thead><tr><th>Data</th><th>Produto</th><th>Campanha</th><th class="r">Valor</th></tr></thead><tbody>
  ${[...i.vs].reverse().map(v => `<tr><td>${fdate(v.data)}</td><td>${esc(prod(v.produtoId).nome)}</td><td>${esc(camp(v.campanhaId).nome)}</td><td class="r"><b>${brl(prod(v.produtoId).preco)}</b></td></tr>`).join('') || '<tr><td colspan="4" class="empty">Este cliente ainda não comprou.</td></tr>'}
  </tbody></table></div></div>`;
};

function topProduct() {
  const t = {}; DB.vendas.forEach(v => t[v.produtoId] = (t[v.produtoId] || 0) + 1);
  return +Object.keys(t).sort((a, b) => t[b] - t[a])[0];
}
views.produtos = () => {
  const top = topProduct();
  return `
  <div class="toolbar"><div class="grow sub">${DB.produtos.length} produtos cadastrados</div><button class="btn primary" data-act="new-prod">+ Novo produto</button></div>
  <div class="card"><div class="table-wrap"><table><thead><tr><th>Produto</th><th class="r">Preço</th><th class="r">Custo</th><th class="r">Margem</th><th class="r">Vendas</th><th></th></tr></thead><tbody>
  ${DB.produtos.map(p => `<tr><td><span class="name">${esc(p.nome)}</span> ${p.id === top ? '<span class="badge star">Mais vendido</span>' : ''}</td><td class="r">${brl2(p.preco)}</td><td class="r">${brl2(p.custo)}</td><td class="r">${num((p.preco - p.custo) / p.preco * 100)}%</td><td class="r">${DB.vendas.filter(v => v.produtoId === p.id).length}</td><td><div class="actions"><button class="btn sm" data-act="edit-prod" data-id="${p.id}">Editar</button><button class="btn sm ghost" data-act="del-prod" data-id="${p.id}">Excluir</button></div></td></tr>`).join('') || '<tr><td colspan="6" class="empty">Nenhum produto cadastrado. Crie o primeiro para vincular às campanhas.</td></tr>'}
  </tbody></table></div></div>`;
};

let anDays = 30;
views.analise = () => {
  const vs = DB.vendas.filter(v => v.data >= daysAgo(anDays - 1));
  const rows = DB.campanhas.map(c => {
    const s = statsCamp(c); const f = fatOf(s.vs.filter(v => v.data >= daysAgo(anDays - 1)));
    return { c, s, f };
  });
  const plat = {}; vs.forEach(v => { const p = camp(v.campanhaId).plataforma; plat[p] = (plat[p] || 0) + prod(v.produtoId).preco; });
  const platItems = Object.keys(plat).map(k => ({ l: k, v: plat[k], t: brl(plat[k]) })).sort((a, b) => b.v - a.v);
  const pc = {}; vs.forEach(v => pc[v.produtoId] = (pc[v.produtoId] || 0) + 1);
  const prodItems = Object.keys(pc).map(k => ({ l: prod(k).nome, v: pc[k], t: pc[k] + ' vendas' })).sort((a, b) => b.v - a.v);
  return `
  <div class="toolbar"><select data-filter="days" aria-label="Período">${[7, 30, 60].map(d => `<option value="${d}" ${anDays === d ? 'selected' : ''}>Últimos ${d} dias</option>`).join('')}</select><div class="grow"></div><span class="sub">${vs.length} vendas · ${brl(fatOf(vs))}</span></div>
  <div class="card" style="margin-bottom:16px"><h2>Vendas ao longo do tempo (R$)</h2>${lineChart(series(vs, anDays))}</div>
  <div class="grid cols-eq">
    <div class="card"><h2>Faturamento por campanha</h2>${hbars(rows.map(r => ({ l: r.c.nome, v: r.f, t: brl(r.f) })).sort((a, b) => b.v - a.v))}</div>
    <div class="card"><h2>Vendas por plataforma</h2>${donut(platItems)}</div>
  </div>
  <div class="card" style="margin-bottom:16px"><h2>Produtos mais vendidos</h2>${hbars(prodItems, 'alt')}</div>
  <div class="card"><h2>Comparativo entre campanhas</h2><div class="table-wrap"><table><thead><tr><th>Campanha</th><th>Plataforma</th><th class="r">Investimento</th><th class="r">Vendas</th><th class="r">ROAS</th><th class="r">ROI</th><th class="r">CAC</th></tr></thead><tbody>
  ${rows.map(r => `<tr><td><a href="#campanha/${r.c.id}" class="name">${esc(r.c.nome)}</a></td><td>${esc(r.c.plataforma)}</td><td class="r">${brl(r.c.investimento)}</td><td class="r">${r.s.vendas}</td><td class="r"><b>${roasTxt(r.s.roas)}</b></td><td class="r ${r.s.roi >= 0 ? 'pos' : 'neg'}">${num(r.s.roi)}%</td><td class="r">${brl2(r.s.cac)}</td></tr>`).join('')}
  </tbody></table></div></div>`;
};

views.config = () => `
  <div class="settings">
    <form class="card form" data-form="perfil"><h2>Perfil</h2>
      <label>Nome<input name="nome" value="${esc(DB.usuario.nome)}" required></label>
      <label>Email<input name="email" type="email" value="${esc(DB.usuario.email)}" required></label>
      <label>Nova senha<input name="senha" type="password" placeholder="Deixe em branco para manter a atual" minlength="6"></label>
      <div id="perfilMsg"></div>
      <div class="form-actions"><button class="btn primary">Salvar alterações</button></div></form>
    <div class="card"><h2>Aparência</h2><div class="switch-row"><div><strong>Tema escuro</strong><div class="sub">Alterna entre tema claro e escuro em todas as telas.</div></div><button class="btn" data-act="theme">Alternar tema</button></div></div>
    <div class="card danger-zone"><h2>Excluir conta</h2><div class="switch-row"><div class="sub">Remove sua conta e todos os dados (campanhas, produtos, clientes e vendas). Essa ação não pode ser desfeita.</div><button class="btn danger" data-act="del-account">Excluir conta</button></div></div>
  </div>`;

/* ====== Autenticação ====== */
function authView(mode) {
  const login = mode === 'login';
  const flash = flashMsg; flashMsg = '';
  $('#auth').dataset.mode = mode;

  const sideCadastro = `
    <div class="auth-side">
      <div class="brand"><span class="logo">T</span><span>Trilha</span></div>
      <div class="hero">
        <h2>Pare de adivinhar. Descubra qual anúncio dá lucro.</h2>
        <p>Reúna investimento, vendas e clientes em um só painel e invista apenas no que traz retorno de verdade.</p>
        <ul class="points">
          <li><b>ROAS, ROI e CAC</b> de cada campanha, calculados automaticamente</li>
          <li><b>Clientes e vendas</b> ligados à campanha que os trouxe</li>
          <li><b>Comparativos</b> claros entre plataformas e produtos</li>
        </ul>
      </div>
      <div class="chips">
        <div class="chip"><strong>4,2x</strong><span>ROAS médio</span></div>
        <div class="chip"><strong>+ R$ 8.450</strong><span>Lucro no mês</span></div>
        <div class="chip"><strong>R$ 12</strong><span>Custo por cliente</span></div>
      </div>
    </div>`;

  const sideLogin = `
    <div class="auth-side">
      <div class="brand"><span class="logo">T</span><span>Trilha</span></div>
      <div class="hero">
        <h2>Bom ver você de volta.</h2>
        <p>Entre para acompanhar o desempenho das suas campanhas.</p>
        <ul class="simple">
          <li><span>Campanhas</span>Investimento e retorno de cada anúncio</li>
          <li><span>Vendas</span>Tudo o que entrou, em um só lugar</li>
          <li><span>Clientes</span>De qual campanha cada um veio</li>
        </ul>
      </div>
      <small>Projeto acadêmico · dados de demonstração</small>
    </div>`;

  $('#auth').innerHTML = `
  <button class="icon-btn auth-theme" data-act="theme" title="Alternar tema claro/escuro" aria-label="Alternar tema">
    <span class="i-moon">${svg('moon')}</span><span class="i-sun">${svg('sun')}</span>
  </button>
  ${login ? sideLogin : sideCadastro}
  <div class="auth-form"><form id="authForm" novalidate>
    <h1>${login ? 'Entrar na sua conta' : 'Criar conta'}</h1><p class="lead">${login ? 'Use seu email e senha para continuar.' : 'Leva menos de um minuto.'}</p>
    <div class="form">
      ${flash ? `<div class="msg okm">${flash}</div>` : ''}
      ${login ? '' : '<label>Nome<input name="nome" autocomplete="name"></label>'}
      <label>Email<input name="email" type="email" autocomplete="email"></label>
      <label>Senha<input name="senha" type="password" autocomplete="${login ? 'current-password' : 'new-password'}"></label>
      ${login ? '' : '<label>Confirmar senha<input name="conf" type="password" autocomplete="new-password"></label>'}
      <div id="authMsg"></div>
      <button class="btn primary">${login ? 'Entrar' : 'Criar conta'}</button>
    </div>
    <p class="alt">${login ? 'Ainda não tem conta? <a href="#cadastro">Cadastre-se</a>' : 'Já tem conta? <a href="#login">Entrar</a>'}</p>
  </form></div>`;

  $('#authForm').onsubmit = e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const err = m => $('#authMsg').innerHTML = `<div class="msg err">${m}</div>`;
    if (!login && !f.nome.trim()) return err('Informe seu nome.');
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return err('Digite um email válido, como nome@dominio.com.');
    if (f.senha.length < 6) return err('A senha precisa ter pelo menos 6 caracteres.');
    if (login) {
      const u = JSON.parse(store.get('td_user') || 'null');
      if (u && u.email !== f.email) return err('Email ou senha incorretos.');
      store.set('td_logged', '1'); location.hash = 'dashboard';
    } else {
      if (f.senha !== f.conf) return err('As senhas não são iguais.');
      DB.usuario = { nome: f.nome.trim(), email: f.email };
      store.set('td_user', JSON.stringify(DB.usuario));
      flashMsg = 'Conta criada! Entre com seu email e senha.'; location.hash = 'login';
    }
  };
}
let flashMsg = '';

/* ====== Modais e formulários ====== */
function openModal(title, body, onSubmit) {
  $('#modal').innerHTML = `<div class="dialog" role="dialog" aria-modal="true"><h2>${title}</h2><form class="form" id="mForm">${body}<div class="form-actions"><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Salvar</button></div></form></div>`;
  $('#modal').classList.remove('hidden');
  $('#mForm').onsubmit = e => { e.preventDefault(); onSubmit(Object.fromEntries(new FormData(e.target))); closeModal(); render(); };
  const first = $('#mForm input'); if (first) first.focus();
}
const closeModal = () => { $('#modal').classList.add('hidden'); $('#modal').innerHTML = ''; };

function campForm(c = {}) {
  openModal(c.id ? 'Editar campanha' : 'Nova campanha', `
    <label>Nome da campanha<input name="nome" value="${esc(c.nome || '')}" required></label>
    <div class="row2"><label>Plataforma<select name="plataforma">${PLATAFORMAS.map(p => `<option ${c.plataforma === p ? 'selected' : ''}>${p}</option>`).join('')}</select></label>
    <label>Produto vinculado<select name="produtoId">${DB.produtos.map(p => `<option value="${p.id}" ${c.produtoId == p.id ? 'selected' : ''}>${esc(p.nome)}</option>`).join('')}</select></label></div>
    <div class="row2"><label>Investimento total (R$)<input name="investimento" type="number" min="0" step="0.01" value="${c.investimento ?? ''}" required></label>
    <label>Código (usado pela API)<input name="codigo" value="${esc(c.codigo || 'CMP-' + String(DB.campanhas.length + 1).padStart(3, '0'))}" required></label></div>
    <div class="row2"><label>Início<input name="inicio" type="date" value="${c.inicio || iso(new Date())}" required></label><label>Fim<input name="fim" type="date" value="${c.fim || iso(new Date())}" required></label></div>
    <label>Status<select name="status"><option value="ativa" ${c.status !== 'encerrada' ? 'selected' : ''}>Ativa</option><option value="encerrada" ${c.status === 'encerrada' ? 'selected' : ''}>Encerrada</option></select></label>`,
    f => {
      const d = { nome: f.nome, plataforma: f.plataforma, produtoId: +f.produtoId, investimento: +f.investimento, codigo: f.codigo, inicio: f.inicio, fim: f.fim, status: f.status };
      if (c.id) Object.assign(c, d); else DB.campanhas.push({ id: Date.now(), leads: 0, ...d });
    });
}
function prodForm(p = {}) {
  openModal(p.id ? 'Editar produto' : 'Novo produto', `
    <label>Nome<input name="nome" value="${esc(p.nome || '')}" required></label>
    <div class="row2"><label>Preço (R$)<input name="preco" type="number" min="0" step="0.01" value="${p.preco ?? ''}" required></label><label>Custo (R$)<input name="custo" type="number" min="0" step="0.01" value="${p.custo ?? ''}" required></label></div>`,
    f => { const d = { nome: f.nome, preco: +f.preco, custo: +f.custo }; if (p.id) Object.assign(p, d); else DB.produtos.push({ id: Date.now(), ...d }); });
}

/* ====== Eventos ====== */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const id = el.dataset.id;
  switch (el.dataset.act) {
    case 'theme': setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); break;
    case 'menu': $('#sidebar').classList.toggle('open'); break;
    case 'close': closeModal(); break;
    case 'logout': store.del('td_logged'); location.hash = 'login'; break;
    case 'new-camp': e.preventDefault(); campForm(); break;
    case 'edit-camp': campForm(camp(id)); break;
    case 'del-camp': if (confirm('Excluir esta campanha? As vendas vinculadas continuam no histórico.')) { DB.campanhas.splice(DB.campanhas.findIndex(c => c.id == id), 1); DB.vendas = DB.vendas.filter(v => v.campanhaId != id); render(); } break;
    case 'new-prod': prodForm(); break;
    case 'edit-prod': prodForm(prod(id)); break;
    case 'del-prod':
      if (DB.campanhas.some(c => c.produtoId == id)) return alert('Este produto está vinculado a uma campanha. Altere ou exclua a campanha primeiro.');
      if (confirm('Excluir este produto?')) { DB.produtos.splice(DB.produtos.findIndex(p => p.id == id), 1); render(); } break;
    case 'del-account': {
      const w = prompt('Para confirmar, digite EXCLUIR. Todos os seus dados serão removidos.');
      if (w === 'EXCLUIR') { store.del('td_logged'); store.del('td_user'); DB.campanhas = []; DB.produtos = []; DB.clientes = []; DB.vendas = []; location.hash = 'cadastro'; }
      break; }
  }
});
document.addEventListener('change', e => {
  const k = e.target.dataset.filter; if (!k) return;
  if (k === 'days') anDays = +e.target.value; else campFilter[k] = e.target.value;
  render();
});
document.addEventListener('input', e => { if (e.target.id === 'cliSearch') $('#cliTable').innerHTML = cliTable(e.target.value); });
document.addEventListener('submit', e => {
  if (e.target.dataset.form !== 'perfil') return;
  e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target));
  DB.usuario = { nome: f.nome.trim(), email: f.email };
  store.set('td_user', JSON.stringify(DB.usuario)); fillUser();
  $('#perfilMsg').innerHTML = '<div class="msg okm">Alterações salvas.</div>';
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ====== Tema, usuário e rotas ====== */
function setTheme(t) {
  document.documentElement.dataset.theme = t; store.set('td_theme', t);
  $('#themeBtn').innerHTML = svg(t === 'dark' ? 'sun' : 'moon');
}
function fillUser() {
  $('#uName').textContent = DB.usuario.nome; $('#uEmail').textContent = DB.usuario.email;
  $('#avatar').textContent = DB.usuario.nome.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
}
const NAV = [['dashboard', 'Dashboard'], ['campanhas', 'Campanhas'], ['clientes', 'Clientes'], ['produtos', 'Produtos'], ['analise', 'Análise'], ['config', 'Configurações']];
const TITLES = { dashboard: 'Dashboard', campanhas: 'Campanhas', campanha: 'Detalhes da campanha', clientes: 'Clientes', cliente: 'Detalhes do cliente', produtos: 'Produtos', analise: 'Análise de campanhas', config: 'Configurações' };

function render() {
  const [page, id] = (location.hash.slice(1) || 'dashboard').split('/');
  const logged = store.get('td_logged');
  if (page === 'login' || page === 'cadastro' || !logged) {
    $('#app').classList.add('hidden'); $('#auth').classList.remove('hidden');
    return authView(page === 'cadastro' ? 'cadastro' : 'login');
  }
  $('#auth').classList.add('hidden'); $('#app').classList.remove('hidden');
  const p = views[page] ? page : 'dashboard';
  const group = p === 'campanha' ? 'campanhas' : p === 'cliente' ? 'clientes' : p;
  $('#nav').innerHTML = NAV.map(([k, l]) => `<a href="#${k}" class="${k === group ? 'active' : ''}">${svg(k === 'config' ? 'config' : k)}${l}</a>`).join('');
  $('#pageTitle').textContent = TITLES[p];
  $('#view').innerHTML = views[p](id);
  $('#sidebar').classList.remove('open');
  window.scrollTo(0, 0);
}

(function init() {
  const u = store.get('td_user'); if (u) DB.usuario = JSON.parse(u);
  $('#logoutBtn').innerHTML = svg('out');
  setTheme(store.get('td_theme') || 'light'); fillUser();
  window.addEventListener('hashchange', render);
  render();
})();
