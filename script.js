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

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensagem.textContent = "";

  const numero = Number(campoNumero.value);

  if (!window.idToken) {
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
    body: JSON.stringify({ numero: numero, token: window.idToken })
  });

  const dados = await res.json();

  if (dados.erro) {
    mensagem.textContent = dados.erro;
    return;
  }

  svgAtual = dados.svg;
  area.innerHTML = svgAtual;
});

botaoBaixar.addEventListener("click", () => {
  if (!svgAtual) return;
  const blob = new Blob([svgAtual], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "desenho.svg";
  a.click();
});