// script.js
// Versao inicial: todo o trabalho acontece no navegador.
// A tarefa consiste em levar gerarDesenho para o servidor (Pages Functions)
// e fazer esta pagina apenas enviar o numero e exibir a resposta.

let idToken = null;

function onGoogleLogin(resp) {
  idToken = resp.credential;
  document.getElementById("erro").textContent = "";
}

function mostrarErro(msg) {
  document.getElementById("erro").textContent = msg;
  document.getElementById("saida").innerHTML = "";
}

document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const numero = Number(document.getElementById("numero").value);

  if (!idToken) return mostrarErro("Faça login com o Google primeiro.");

  const resp = await fetch("/api/desenho", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + idToken,
    },
    body: JSON.stringify({ numero }),
  });

  if (resp.status === 400) return mostrarErro("Número inválido: informe um inteiro de 1 a 100.");
  if (resp.status === 401) return mostrarErro("Não autorizado: faça login com o Google novamente.");
  if (!resp.ok) return mostrarErro("Erro inesperado (" + resp.status + ").");

  document.getElementById("erro").textContent = "";
  document.getElementById("saida").innerHTML = await resp.text();
});
