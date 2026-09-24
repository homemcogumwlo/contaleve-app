export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    // Obter mês atual e anterior (formato YYYY-MM)
    const hoje = new Date();
    const mesAtual = hoje.toISOString().slice(0, 7); // ex: 2026-09
    
    const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1).toISOString().slice(0, 7);

    // Buscar total do mês atual
    const resultAtual = await env.DB.prepare(
      `SELECT SUM(valor_total) as total FROM faturas WHERE paga = 1 AND strftime('%Y-%m', data_fatura) = ?`
    ).bind(mesAtual).first();
    const totalAtual = resultAtual.total || 0;

    // Buscar total do mês anterior
    const resultAnterior = await env.DB.prepare(
      `SELECT SUM(valor_total) as total FROM faturas WHERE paga = 1 AND strftime('%Y-%m', data_fatura) = ?`
    ).bind(mesAnterior).first();
    const totalAnterior = resultAnterior.total || 0;

    // Calcular diferença
    let diferenca = totalAtual - totalAnterior;
    let percentagem = 0;
    let mensagem = "";
    let cor = "gray";

    if (totalAnterior === 0 && totalAtual === 0) {
      mensagem = "Ainda não tens dados suficientes para comparar. Começa a registar as tuas faturas!";
      cor = "gray";
    } else if (totalAnterior === 0) {
      mensagem = `Este mês gastaste ${totalAtual.toFixed(2)}€. Continua a registar para veres a tua evolução!`;
      cor = "blue";
    } else {
      percentagem = ((diferenca / totalAnterior) * 100).toFixed(1);
      
      if (diferenca < 0) {
        mensagem = `🎉 Parabéns! Gastaste ${Math.abs(percentagem)}% menos que no mês passado. Poupaste ${Math.abs(diferenca).toFixed(2)}€!`;
        cor = "green";
      } else if (diferenca > 0) {
        mensagem = `⚠️ Atenção! Gastaste ${percentagem}% mais que no mês passado. Que tal rever os consumos?`;
        cor = "red";
      } else {
        mensagem = "Mantiveste os gastos estáveis. Bom controlo!";
        cor = "yellow";
      }
    }

    return new Response(JSON.stringify({ 
      mensagem, 
      cor, 
      totalAtual, 
      totalAnterior,
      diferenca 
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ erro: e.message }), { status: 500 });
  }
}
