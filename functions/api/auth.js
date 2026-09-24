// Função para encriptar a password
async function hashSenha(senha) {
  const msgBuffer = new TextEncoder().encode(senha);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const dados = await request.json();
  const { acao, email, nome, senha } = dados;

  try {
    const senhaHash = await hashSenha(senha);

    if (acao === 'registrar') {
      // Verifica se o email já existe
      const existente = await env.DB.prepare("SELECT id FROM utilizadores WHERE email = ?").bind(email).first();
      if (existente) {
        return new Response(JSON.stringify({ erro: 'Este email já está registado.' }), { status: 400 });
      }

      // Cria novo utilizador
      const id = crypto.randomUUID();
      await env.DB.prepare(
        "INSERT INTO utilizadores (id, email, nome, senha_hash) VALUES (?, ?, ?, ?)"
      ).bind(id, email, nome, senhaHash).run();

      return new Response(JSON.stringify({ sucesso: true, user_id: id, nome: nome }));
    } 
    
    else if (acao === 'login') {
      // Procura o utilizador
      const user = await env.DB.prepare(
        "SELECT id, nome, senha_hash FROM utilizadores WHERE email = ?"
      ).bind(email).first();

      if (!user || user.senha_hash !== senhaHash) {
        return new Response(JSON.stringify({ erro: 'Email ou password incorretos.' }), { status: 401 });
      }

      return new Response(JSON.stringify({ sucesso: true, user_id: user.id, nome: user.nome }));
    }
  } catch (e) {
    return new Response(JSON.stringify({ erro: e.message }), { status: 500 });
  }
}
