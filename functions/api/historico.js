export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const userId = url.searchParams.get('user_id');

  const query = `SELECT l.id, l.data_leitura, l.valor_atual, l.consumo, c.tipo, c.unidade FROM leituras l INNER JOIN contadores c ON l.contador_id = c.id WHERE c.utilizador_id = ? ORDER BY l.data_leitura DESC LIMIT 20`;
  const { results } = await env.DB.prepare(query).bind(userId).all();
  return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
}
