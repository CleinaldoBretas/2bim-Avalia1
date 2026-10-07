import { gerarDesenho } from './lib/desenho.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Rota da API
    if (url.pathname === '/api/desenho' && request.method === 'POST') {
      try {
        const body = await request.json();
        const numero = body.numero;
        const email_verified = true; // simplificado por enquanto

        // chama sua lib
        const svg = gerarDesenho(numero, email_verified);

        return new Response(JSON.stringify({ svg }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' }});
      }
    }

    // Todo resto serve o site da pasta public
    return env.ASSETS.fetch(request);
  }
}
