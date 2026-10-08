// script.js
// Versao inicial: todo o trabalho acontece no navegador.
// A tarefa consiste em levar gerarDesenho para o servidor (Pages Functions)
// e fazer esta pagina apenas enviar o numero e exibir a resposta.

let idToken = null;

function onLogin(resposta) {
  idToken = resposta.credential; // id_token do Google
}

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const erro = document.getElementById("erro");
  const saida = document.getElementById("resultado");
  erro.textContent = "";
  saida.innerHTML = "";

  const numero = document.querySelector("#numero").value; // ajuste o id

  const r = await fetch("/api/desenho", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ numero, token: idToken }),
  });

  if (r.status === 400) {
    erro.textContent = "Erro 400: número inválido.";
  } else if (r.status === 401) {
    erro.textContent = "Erro 401: faça login com o Google.";
  } else if (!r.ok) {
    erro.textContent = "Erro inesperado: " + r.status;
  } else {
    saida.innerHTML = await r.text();
  }
});
