export async function onRequestPost(context) {
  const { request, env } = context;
  const { id } = await request.json();
  await env.DB.prepare("UPDATE faturas SET paga = 1 WHERE id = ?").bind(id).run();
  return new Response(JSON.stringify({ sucesso: true }));
}
