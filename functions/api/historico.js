export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    // Pede à base de dados as últimas 20 leituras, ordenadas da mais recente para a mais antiga
    const query = `
      SELECT l.id, l.data_leitura, l.valor_atual, l.consumo, c.tipo, c.unidade 
      FROM leituras l 
      INNER JOIN contadores c ON l.contador_id = c.id 
      ORDER BY l.data_leitura DESC 
      LIMIT 20
    `;
    
    const { results } = await env.DB.prepare(query).all();
    
    return new Response(JSON.stringify(results), { 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
