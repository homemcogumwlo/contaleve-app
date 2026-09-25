export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const userId = url.searchParams.get('user_id');
  
  // Pega no mês atual (ex: 2026-09)
  const mesAtual = new Date().toISOString().slice(0, 7);

  // Soma os valores apenas das faturas pagas deste mês
  const query = `
    SELECT tipo, SUM(valor_total) as total 
    FROM faturas 
    WHERE user_id = ? AND paga = 1 AND strftime('%Y-%m', data_fatura) = ? 
    GROUP BY tipo
  `;
  
  const { results } = await env.DB.prepare(query).bind(userId, mesAtual).all();
  return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
}
