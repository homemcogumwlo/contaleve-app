export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const dados = await request.json();
    const userId = dados.user_id; 
    const tipo = dados.tipo;
    const valor = parseFloat(dados.valor);
    const unidade = tipo === 'agua' ? 'm3' : 'kWh';
    const contadorId = 'contador-' + userId + '-' + tipo;

    await env.DB.prepare(`INSERT OR IGNORE INTO utilizadores (id, email, nome) VALUES (?, ?, ?)`).bind(userId, 'user@contaleve.pt', 'Utilizador').run();
    await env.DB.prepare(`INSERT OR IGNORE INTO contadores (id, utilizador_id, tipo, nome, unidade) VALUES (?, ?, ?, ?, ?)`).bind(contadorId, userId, tipo, 'Contador ' + tipo, unidade).run();

    const idLeitura = crypto.randomUUID();
    const dataHoje = new Date().toISOString().split('T')[0];
    
    await env.DB.prepare(`INSERT INTO leituras (id, contador_id, data_leitura, valor_anterior, valor_atual, consumo) VALUES (?, ?, ?, 0, ?, ?)`).bind(idLeitura, contadorId, dataHoje, valor, valor).run();

    return new Response(JSON.stringify({ sucesso: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (erro) {
    return new Response(JSON.stringify({ erro: erro.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
