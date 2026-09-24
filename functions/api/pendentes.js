export async function onRequestGet(context) {
  const { env } = context;
  // Busca apenas as faturas que ainda não foram pagas, ordenadas pelo prazo mais próximo
  const { results } = await env.DB.prepare(
    "SELECT * FROM faturas WHERE (paga = 0 OR paga IS NULL) ORDER BY data_limite ASC"
  ).all();
  return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
}
