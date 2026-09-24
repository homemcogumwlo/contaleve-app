export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    // Pergunta à base de dados: "Dá-me a leitura mais recente de cada contador"
    const query = `
      SELECT c.tipo, l.valor_atual, c.unidade 
      FROM leituras l 
      INNER JOIN contadores c ON l.contador_id = c.id 
      WHERE l.data_leitura = (SELECT MAX(data_leitura) FROM leituras l2 WHERE l2.contador_id = c.id)
    `;
    
    const { results } = await env.DB.prepare(query).all();
    
    // Envia os dados de volta para o site
    return new Response(JSON.stringify(results), { 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
