import { gerarDesenho } from "../../lib/desenho.js";

async function verificarToken(token, clientId) {
  if (!token || typeof token !== "string") return null;
  try {
    const r = await fetch(
      "https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(token)
    );
    if (r.status !== 200) return null;
    const info = await r.json();
    if (info.aud !== clientId) return null;
    if (info.email_verified !== "true" && info.email_verified !== true) return null;
    return info.email || null;
  } catch {
    return null;
  }
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("JSON inválido", { status: 400 });
  }

  const email = await verificarToken(body.token, env.GOOGLE_CLIENT_ID);
  if (!email) {
    return new Response("Não autorizado", { status: 401 });
  }

  const numero = Number(body.numero);
  if (!Number.isInteger(numero) || numero < 1 || numero > 100) {
    return new Response("Número inválido", { status: 400 });
  }

  const svg = gerarDesenho(numero, email); // ajuste se a assinatura for outra
  return new Response(svg, {
    status: 200,
    headers: { "Content-Type": "image/svg+xml; charset=utf-8" },
  });
}
