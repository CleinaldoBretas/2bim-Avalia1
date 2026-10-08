import { gerarDesenho } from "../../lib/desenho.js";

function resposta(status, mensagem) {
  return new Response(JSON.stringify({ erro: mensagem }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequest({ request, env }) {
  // 1) método
  if (request.method !== "POST") {
    return new Response("Método não permitido", {
      status: 405,
      headers: { Allow: "POST" },
    });
  }

  // 2) corpo
  let corpo;
  try {
    corpo = await request.json();
  } catch {
    return resposta(400, "JSON inválido ou corpo ausente");
  }
  const numero = corpo && corpo.numero;
  if (!Number.isInteger(numero) || numero < 1 || numero > 100) {
    return resposta(400, "numero deve ser um inteiro entre 1 e 100");
  }

  // 3) token
  const auth = request.headers.get("Authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return resposta(401, "Token ausente");

  let info;
  try {
    const r = await fetch(
      "https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(m[1])
    );
    if (r.status !== 200) return resposta(401, "Token inválido ou expirado");
    info = await r.json();
  } catch {
    return resposta(401, "Não foi possível verificar o token");
  }

  if (info.aud !== env.GOOGLE_CLIENT_ID) return resposta(401, "aud diferente do Client ID");
  if (String(info.email_verified) !== "true") return resposta(401, "E-mail não verificado");
  if (!info.email) return resposta(401, "Token sem e-mail");

  // 200
  const svg = gerarDesenho(numero, info.email);
  return new Response(svg, { status: 200, headers: { "Content-Type": "image/svg+xml" } });
}
