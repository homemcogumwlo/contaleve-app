export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const userId = url.searchParams.get('user_id');

  const query = `SELECT c.tipo, l.valor_atual, c.unidade FROM leituras l INNER JOIN contadores c ON l.contador_id = c.id WHERE c.utilizador_id = ? AND l.data_leitura = (SELECT MAX(data_leitura) FROM leituras l2 WHERE l2.contador_id = c.id)`;
  const { results } = await env.DB.prepare(query).bind(userId).all();
  return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
}
