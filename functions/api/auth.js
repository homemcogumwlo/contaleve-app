async function hashSenha(senha) {
  const encoder = new TextEncoder();
  const data = encoder.encode(senha);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // VERIFICAÇÃO DE SEGURANÇA: A base de dados está ligada?
    if (!env.DB) {
      return new Response(JSON.stringify({ erro: 'ERRO DE CONFIGURAÇÃO: A base de dados (DB) não está ligada nas definições do Pages.' }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const dados = await request.json();
    const { acao, email, nome, senha } = dados;

    if (!acao || !email || !senha) {
      return new Response(JSON.stringify({ erro: 'Dados em falta (email e senha são obrigatórios).' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const senhaHash = await hashSenha(senha);

    if (acao === 'registrar') {
      const existente = await env.DB.prepare("SELECT id FROM utilizadores WHERE email = ?").bind(email).first();
      if (existente) {
        return new Response(JSON.stringify({ erro: 'Este email já está registado.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      const id = crypto.randomUUID();
      await env.DB.prepare(
        "INSERT INTO utilizadores (id, email, nome, senha_hash) VALUES (?, ?, ?, ?)"
      ).bind(id, email, nome || 'Utilizador', senhaHash).run();

      return new Response(JSON.stringify({ sucesso: true, user_id: id, nome: nome || 'Utilizador' }), { headers: { 'Content-Type': 'application/json' } });
    } 
    
    else if (acao === 'login') {
      const user = await env.DB.prepare(
        "SELECT id, nome, senha_hash FROM utilizadores WHERE email = ?"
      ).bind(email).first();

      if (!user || user.senha_hash !== senhaHash) {
        return new Response(JSON.stringify({ erro: 'Email ou password incorretos.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ sucesso: true, user_id: user.id, nome: user.nome }), { headers: { 'Content-Type': 'application/json' } });
    }
    
    return new Response(JSON.stringify({ erro: 'Ação inválida.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  } catch (e) {
    console.error("ERRO REAL NO AUTH:", e);
    return new Response(JSON.stringify({ erro: 'Erro interno do servidor: ' + e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
