export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const dados = await request.json();
    const imagens = dados.imagens; // Agora é uma lista de imagens
    const id = crypto.randomUUID();
    const dataHoje = new Date().toISOString().split('T')[0];

    let dadosExtraidos = {
        tipo: 'luz', fornecedor: 'Fornecedor (IA)', valor: 0, consumo: 0,
        data_fatura: dataHoje, data_limite: dataHoje, referencia: '--- --- ---'
    };

    if (env.AI && imagens && imagens.length > 0) {
        try {
            // Prompt adaptado para múltiplas páginas
            const prompt = "Analise estas imagens (que podem ser várias páginas da mesma fatura de água, luz ou gás). Extraia os dados FINAIS e consolidados de todas as páginas em formato JSON estrito, sem markdown: {tipo: 'agua' ou 'luz' ou 'gas', fornecedor: string, valor: number, consumo: number, data_fatura: 'YYYY-MM-DD', data_limite: 'YYYY-MM-DD', referencia: string}. Se não encontrar um campo, use null.";
            
            const content = [{ type: "text", text: prompt }];
            
            // Adiciona todas as imagens ao pedido
            imagens.forEach(img => {
                content.push({ type: "image_url", image_url: { url: img } });
            });

            const response = await env.AI.run("@cf/meta/llama-3.2-11b-vision-instruct", {
                messages: [{ role: "user", content: content }]
            });
            
            let textoResposta = response.response || "";
            const jsonMatch = textoResposta.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const dadosIA = JSON.parse(jsonMatch[0]);
                dadosExtraidos = { ...dadosExtraidos, ...dadosIA };
            }
        } catch (e) {
            console.error("Erro na IA:", e);
        }
    }

    await env.DB.prepare(
      `INSERT INTO faturas (id, tipo, fornecedor, data_fatura, valor_total, consumo, imagem_base64, data_limite, referencia_pagamento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, dadosExtraidos.tipo, dadosExtraidos.fornecedor, dadosExtraidos.data_fatura, dadosExtraidos.valor, dadosExtraidos.consumo, 'img_ok', dadosExtraidos.data_limite, dadosExtraidos.referencia).run();

    return new Response(JSON.stringify({ sucesso: true, dados: dadosExtraidos }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (erro) {
    return new Response(JSON.stringify({ erro: erro.message }), { status: 500 });
  }
}
