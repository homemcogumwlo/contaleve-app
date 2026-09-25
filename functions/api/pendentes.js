export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const userId = url.searchParams.get('user_id');
  
  const { results } = await env.DB.prepare(
    "SELECT * FROM faturas WHERE (paga = 0 OR paga IS NULL) AND user_id = ? ORDER BY data_limite ASC"
  ).bind(userId).all();
  return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
}
