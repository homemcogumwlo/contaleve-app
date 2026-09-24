export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const dados = await request.json();
    const imagemBase64 = dados.imagem;
    const id = crypto.randomUUID();
    const dataHoje = new Date().toISOString().split('T')[0];

    // Dados padrão caso a IA falhe
    let dadosExtraidos = {
        tipo: 'luz', fornecedor: 'Fornecedor (IA)', valor: 0, consumo: 0,
        data_fatura: dataHoje, data_limite: dataHoje, referencia: '--- --- ---'
    };

    // Tenta usar a IA real se a imagem existir
    if (env.AI && imagemBase64 && imagemBase64.length > 1000) {
        try {
            const prompt = "Analise esta imagem de uma fatura (água, luz ou gás). Extraia os dados em formato JSON estrito, sem markdown: {tipo: 'agua' ou 'luz' ou 'gas', fornecedor: string, valor: number, consumo: number, data_fatura: 'YYYY-MM-DD', data_limite: 'YYYY-MM-DD', referencia: string}. Se não encontrar, use null.";
            
            // Chama o modelo de visão Llama 3.2
            const response = await env.AI.run("@cf/meta/llama-3.2-11b-vision-instruct", {
                messages: [{ 
                    role: "user", 
                    content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { url: imagemBase64 } }
                    ]
                }]
            });
            
            // Limpar a resposta para extrair o JSON
            let textoResposta = response.response || "";
            const jsonMatch = textoResposta.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const dadosIA = JSON.parse(jsonMatch[0]);
                // Mistura os dados da IA com os padrão (a IA sobrepõe se tiver dados)
                dadosExtraidos = { ...dadosExtraidos, ...dadosIA };
            }
        } catch (e) {
            console.error("Erro na IA:", e);
        }
    }

    // Guarda na base de dados
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
