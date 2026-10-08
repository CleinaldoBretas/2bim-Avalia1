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
  if (!Number.isInteger(numero) || numero < 1 || numero > 100) {
    return resp({ erro: "Número inválido" }, 400);
  }

  if (!dados.token) {
    return resp({ erro: "Token ausente" }, 401);
  }

  const r = await fetch(
    "https://oauth2.googleapis.com/tokeninfo?id_token=" +
      encodeURIComponent(dados.token)
  );
  if (r.status !== 200) {
    return resp({ erro: "Token inválido", status_google: r.status }, 401);
  }

  const info = await r.json();

  // DIAGNÓSTICO TEMPORÁRIO: remover depois
  if (info.aud !== env.GOOGLE_CLIENT_ID) {
    return resp({
      erro: "aud diferente",
      aud_do_token: info.aud,
      client_id_configurado: env.GOOGLE_CLIENT_ID ?? null,
    }, 401);
  }
  if (info.email_verified !== "true") {
    return resp({ erro: "e-mail não verificado" }, 401);
  }

  const svg = gerarDesenho(numero, info.email);
  return resp(svg, 200, "image/svg+xml");
}
