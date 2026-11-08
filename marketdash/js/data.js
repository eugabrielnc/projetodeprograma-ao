/* Dados mockados. Na versão real, vendas, leads e clientes chegam pela API. */
const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return iso(d); };

let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

const DB = {
  usuario: { nome: 'Ana Souza', email: 'ana@exemplo.com' },
  moeda: 'BRL',

  produtos: [
    { id: 1, nome: 'Curso de Python do zero', preco: 197, custo: 18 },
    { id: 2, nome: 'Ebook Marketing Digital', preco: 47, custo: 2 },
    { id: 3, nome: 'Mentoria Carreira Tech', preco: 497, custo: 60 },
    { id: 4, nome: 'Pack de Templates Notion', preco: 67, custo: 4 },
    { id: 5, nome: 'Curso de Excel Avançado', preco: 127, custo: 10 }
  ],

  campanhas: [
    { id: 1, codigo: 'CMP-001', nome: 'Black Friday Python', plataforma: 'Meta Ads', produtoId: 1, investimento: 1400, inicio: daysAgo(50), fim: daysAgo(-20), status: 'ativa', leads: 420 },
    { id: 2, codigo: 'CMP-002', nome: 'Lançamento Mentoria', plataforma: 'Google Ads', produtoId: 3, investimento: 3200, inicio: daysAgo(45), fim: daysAgo(-10), status: 'ativa', leads: 260 },
    { id: 3, codigo: 'CMP-003', nome: 'Ebook Gratuito Isca', plataforma: 'TikTok Ads', produtoId: 2, investimento: 600, inicio: daysAgo(40), fim: daysAgo(5), status: 'encerrada', leads: 510 },
    { id: 4, codigo: 'CMP-004', nome: 'Remarketing Templates', plataforma: 'Meta Ads', produtoId: 4, investimento: 450, inicio: daysAgo(30), fim: daysAgo(-15), status: 'ativa', leads: 180 },
    { id: 5, codigo: 'CMP-005', nome: 'Excel para Concursos', plataforma: 'YouTube Ads', produtoId: 5, investimento: 900, inicio: daysAgo(35), fim: daysAgo(-5), status: 'ativa', leads: 230 },
    { id: 6, codigo: 'CMP-006', nome: 'Teste Pinterest', plataforma: 'Pinterest', produtoId: 4, investimento: 300, inicio: daysAgo(55), fim: daysAgo(25), status: 'encerrada', leads: 90 }
  ],

  clientes: [
    ['Mariana Lopes', 'mariana.lopes@email.com', '(79) 99811-2030'], ['Carlos Eduardo', 'carlos.edu@email.com', '(11) 98822-1010'],
    ['Beatriz Nunes', 'bia.nunes@email.com', '(21) 97733-4455'], ['Rafael Mendes', 'rafael.m@email.com', '(79) 99654-7788'],
    ['Juliana Costa', 'ju.costa@email.com', '(85) 98877-6655'], ['Pedro Henrique', 'pedro.h@email.com', '(71) 99123-4567'],
    ['Larissa Prado', 'larissa.p@email.com', '(31) 98765-4321'], ['Gustavo Alves', 'gustavo.a@email.com', '(41) 99988-7766'],
    ['Fernanda Dias', 'fe.dias@email.com', '(62) 98456-1234'], ['Thiago Ramos', 'thiago.r@email.com', '(79) 99777-8899'],
    ['Camila Torres', 'camila.t@email.com', '(81) 98111-2299'], ['Lucas Barbosa', 'lucas.b@email.com', '(51) 99555-4433'],
    ['Aline Martins', 'aline.m@email.com', '(19) 98222-3344'], ['Diego Freitas', 'diego.f@email.com', '(27) 99666-1122']
  ].map((c, i) => ({ id: i + 1, nome: c[0], email: c[1], telefone: c[2] })),

  vendas: []
};

/* Gera vendas aleatórias (mas fixas) dos últimos 60 dias */
for (let i = 1; i <= 110; i++) {
  const c = DB.campanhas[Math.floor(rnd() * DB.campanhas.length)];
  DB.vendas.push({
    id: i,
    data: daysAgo(Math.floor(rnd() * 60)),
    clienteId: 1 + Math.floor(rnd() * DB.clientes.length),
    produtoId: c.produtoId,
    campanhaId: c.id
  });
}
DB.vendas.sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id);
