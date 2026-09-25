export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const userId = url.searchParams.get('user_id');

  // Se for GET (Ler meta)
  if (request.method === 'GET') {
    const mesAtual = new Date().toISOString().slice(0, 7); // Ex: 2026-09
    const { results } = await env.DB.prepare(
      "SELECT * FROM metas WHERE user_id = ? AND mes = ?"
    ).bind(userId, mesAtual).all();
    return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
  }

  // Se for POST (Guardar meta)
  if (request.method === 'POST') {
    const dados = await request.json();
    const id = crypto.randomUUID();
    const mesAtual = new Date().toISOString().slice(0, 7);

    // Apaga a meta antiga deste mês (se existir) e insere a nova
    await env.DB.prepare("DELETE FROM metas WHERE user_id = ? AND mes = ? AND tipo = ?").bind(userId, mesAtual, dados.tipo).run();
    
    await env.DB.prepare(
      "INSERT INTO metas (id, user_id, tipo, valor_meta, mes) VALUES (?, ?, ?, ?, ?)"
    ).bind(id, userId, dados.tipo, dados.valor_meta, mesAtual).run();

    return new Response(JSON.stringify({ sucesso: true }), { headers: { 'Content-Type': 'application/json' } });
  }
}
