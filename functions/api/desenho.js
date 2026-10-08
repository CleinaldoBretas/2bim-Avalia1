import { gerarDesenho } from "../../lib/desenho.js";

const resp = (corpo, status, tipo = "application/json") =>
  new Response(typeof corpo === "string" ? corpo : JSON.stringify(corpo), {
    status,
    headers: { "Content-Type": tipo },
  });

export async function onRequestPost({ request, env }) {
  let dados;
  try {
    dados = await request.json();
  } catch {
    return resp({ erro: "Corpo inválido" }, 400);
  }

  const numero = Number(dados.numero);
  if (!Number.isInteger(numero) || numero < 1) {
    return resp({ erro: "Número inválido" }, 400);
  }

  if (!dados.token) {
    return resp({ erro: "Token ausente" }, 401);
  }

  const r = await fetch(
    "https://oauth2.googleapis.com/tokeninfo?id_token=" +
      encodeURIComponent(dados.token)
  );
  if (r.status !== 200) return resp({ erro: "Token inválido" }, 401);

  const info = await r.json();
  if (info.aud !== env.GOOGLE_CLIENT_ID || info.email_verified !== "true") {
    return resp({ erro: "Token não aceito" }, 401);
  }

  const svg = gerarDesenho(numero, info.email); // e-mail vem do token
  return resp(svg, 200, "image/svg+xml");
}
