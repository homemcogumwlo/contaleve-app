export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const userId = url.searchParams.get('user_id');
  
  const { results } = await env.DB.prepare(
    "SELECT * FROM faturas WHERE paga = 1 AND user_id = ? ORDER BY data_fatura DESC LIMIT 50"
  ).bind(userId).all();
  return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
}
