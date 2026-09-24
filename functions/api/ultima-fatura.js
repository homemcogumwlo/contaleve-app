export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    // Pede à base de dados a fatura mais recente
    const { results } = await env.DB.prepare(
      `SELECT * FROM faturas ORDER BY created_at DESC LIMIT 1`
    ).all();
    
    // Envia a fatura de volta (ou null se não houver nenhuma)
    return new Response(JSON.stringify(results[0] || null), { 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
