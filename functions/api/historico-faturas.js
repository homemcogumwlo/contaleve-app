export async function onRequestGet(context) {
  const { env } = context;
  // Busca todas as faturas pagas, ordenadas da mais recente para a mais antiga
  const { results } = await env.DB.prepare(
    "SELECT * FROM faturas WHERE paga = 1 ORDER BY data_fatura DESC LIMIT 50"
  ).all();
  return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
}
