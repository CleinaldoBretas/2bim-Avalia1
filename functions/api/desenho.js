import { gerarDesenho, numeroValido } from "../../lib/desenho.js";

export async function onRequestPost(ctx){
  const { request, env } = ctx;
  let body;
  try{ body = await request.json(); } catch { return new Response("JSON invalido",{status:400}); }
  
  if(!numeroValido(body?.numero)){
    return new Response("numero invalido",{status:400});
  }

  const auth = request.headers.get("Authorization")||"";
  if(!auth.startsWith("Bearer ")){
    return new Response("Token ausente",{status:401});
  }
  const token = auth.slice(7);

  const r = await fetch(https://oauth2.googleapis.com/tokeninfo?id_token=${token});
  if(!r.ok) return new Response("Token invalido",{status:401});
  const payload = await r.json();

  if(payload.aud !== env.GOOGLE_CLIENT_ID || payload.email_verified !== "true"){
    return new Response("Token nao autorizado",{status:401});
  }

  const svg = gerarDesenho(body.numero, payload.email);
  return new Response(svg, { status:200, headers:{ "Content-Type":"image/svg+xml" } });
}

export async function onRequest(ctx){
  if(ctx.request.method!=="POST") return new Response("Method Not Allowed",{status:405});
  return onRequestPost(ctx);
}