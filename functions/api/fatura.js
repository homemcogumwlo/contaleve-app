export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const dados = await request.json();
    const id = crypto.randomUUID();
    const dataHoje = new Date().toISOString().split('T')[0];

    // Guarda na tabela de faturas que criámos
    await env.DB.prepare(
      `INSERT INTO faturas (id, tipo, fornecedor, data_fatura, valor_total, consumo, imagem_base64) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, dados.tipo, dados.fornecedor, dataHoje, dados.valor, dados.consumo, 'imagem_ok').run();

    return new Response(JSON.stringify({ sucesso: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (erro) {
    return new Response(JSON.stringify({ erro: erro.message }), { status: 500 });
  }
}
