// script.js
// Versao inicial: todo o trabalho acontece no navegador.
// A tarefa consiste em levar gerarDesenho para o servidor (Pages Functions)
// e fazer esta pagina apenas enviar o numero e exibir a resposta.

import { numeroValido } from "./desenho.js";

const formulario = document.getElementById("formulario");
const campoNumero = document.getElementById("numero");
const area = document.getElementById("desenho");
const mensagem = document.getElementById("mensagem");
const botaoBaixar = document.getElementById("baixar");

let svgAtual = "";
let idToken = null;

window.handleCredentialResponse = function(response) {
  idToken = response.credential;
  const data = JSON.parse(atob(response.credential.split(".")[1]));
  mensagem.textContent = `Logado com ${data.email}!`;
}

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensagem.textContent = "";

  const numero = Number(campoNumero.value);

  if (!idToken) {
    mensagem.textContent = "Faça login com Google primeiro!";
    return;
  }

  if (!numeroValido(numero)) {
    mensagem.textContent = "Digite um inteiro entre 1 e 100.";
    return;
  }

  const res = await fetch("/api/desenho", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ numero: numero, token: idToken })
  });

  const dados = await res.json();

  if (dados.svg) {
    svgAtual = dados.svg;
    area.innerHTML = svgAtual;
    botaoBaixar.hidden = false;
  } else {
    mensagem.textContent = dados.erro || "Erro";
  }
});

botaoBaixar.addEventListener("click", () => {
  const arquivo = new Blob([svgAtual], { type: "image/svg+xml" });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = "exemplo.svg";
  link.click();
  URL.revokeObjectURL(url);
});