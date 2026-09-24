export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // 1. Receber os dados que vêm do site
    const dados = await request.json();
    const tipo = dados.tipo; // 'agua', 'luz', ou 'gas'
    const valor = parseFloat(dados.valor);

    // 2. Preparar um utilizador e contador "fictícios" para testarmos
    const userId = 'utilizador-demo-1';
    const contadorId = 'contador-demo-1';
    const unidade = tipo === 'agua' ? 'm3' : 'kWh';

    // 3. Guardar o utilizador na base de dados (se ainda não existir)
    await env.DB.prepare(
      `INSERT OR IGNORE INTO utilizadores (id, email, nome) VALUES (?, ?, ?)`
    ).bind(userId, 'demo@contaleve.pt', 'Utilizador Teste').run();

    // 4. Guardar o contador na base de dados (se ainda não existir)
    await env.DB.prepare(
      `INSERT OR IGNORE INTO contadores (id, utilizador_id, tipo, nome, unidade) VALUES (?, ?, ?, ?, ?)`
    ).bind(contadorId, userId, tipo, 'Contador Principal ' + tipo, unidade).run();

    // 5. Finalmente, guardar a leitura!
    const idLeitura = crypto.randomUUID();
    const dataHoje = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    await env.DB.prepare(
      `INSERT INTO leituras (id, contador_id, data_leitura, valor_anterior, valor_atual, consumo) VALUES (?, ?, ?, 0, ?, ?)`
    ).bind(idLeitura, contadorId, dataHoje, valor, valor).run();

    // 6. Responder ao site que correu tudo bem
    return new Response(JSON.stringify({ sucesso: true, mensagem: 'Leitura guardada com sucesso!' }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (erro) {
    return new Response(JSON.stringify({ erro: erro.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
