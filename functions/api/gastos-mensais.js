export async function onRequestGet(context) {
  const { env } = context;
  
  // Busca todas as faturas pagas, agrupadas por mês e tipo
  const query = `
    SELECT 
      strftime('%Y-%m', data_fatura) as mes,
      tipo,
      SUM(valor_total) as total
    FROM faturas 
    WHERE paga = 1 
    GROUP BY mes, tipo
    ORDER BY mes ASC
  `;
  
  const { results } = await env.DB.prepare(query).all();
  return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
}
