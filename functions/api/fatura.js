export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const dados = await request.json();
    const userId = dados.user_id || 'demo-user'; 
    const id = crypto.randomUUID();

    await env.DB.prepare(
      `INSERT INTO faturas (id, tipo, fornecedor, data_fatura, valor_total, consumo, data_limite, referencia_pagamento, paga) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`
    ).bind(id, dados.tipo, dados.fornecedor, dados.data_fatura, dados.valor, dados.consumo, dados.data_limite, dados.referencia).run();

    return new Response(JSON.stringify({ sucesso: true, id: id }), { headers: { 'Content-Type': 'application/json' } });
  } catch (erro) {
    return new Response(JSON.stringify({ erro: erro.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
