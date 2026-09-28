export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const userId = url.searchParams.get('user_id');

  if (request.method === 'DELETE') {
    const dados = await request.json();
    await env.DB.prepare(`DELETE FROM faturas WHERE id = ? AND user_id = ?`).bind(dados.id, userId).run();
    return new Response(JSON.stringify({ sucesso: true }), { headers: { 'Content-Type': 'application/json' } });
  }

  if (request.method === 'PUT') {
    const dados = await request.json();
    await env.DB.prepare(
      `UPDATE faturas SET tipo = ?, fornecedor = ?, valor_total = ?, consumo = ?, data_fatura = ?, data_limite = ?, referencia_pagamento = ? WHERE id = ? AND user_id = ?`
    ).bind(dados.tipo, dados.fornecedor, dados.valor, dados.consumo, dados.data_fatura, dados.data_limite, dados.referencia, dados.id, userId).run();
    return new Response(JSON.stringify({ sucesso: true }), { headers: { 'Content-Type': 'application/json' } });
  }

  if (request.method === 'POST') {
    const dados = await request.json();
    const id = crypto.randomUUID();
    // Agora guardamos também o PDF (se existir)
    await env.DB.prepare(
      `INSERT INTO faturas (id, user_id, tipo, fornecedor, data_fatura, valor_total, consumo, data_limite, referencia_pagamento, paga, pdf_base64) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`
    ).bind(id, userId, dados.tipo, dados.fornecedor, dados.data_fatura, dados.valor, dados.consumo, dados.data_limite, dados.referencia, dados.pdf || null).run();
    return new Response(JSON.stringify({ sucesso: true, id: id }), { headers: { 'Content-Type': 'application/json' } });
  }
}
