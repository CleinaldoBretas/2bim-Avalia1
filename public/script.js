// script.js
// Versao inicial: todo o trabalho acontece no navegador.
// A tarefa consiste em levar gerarDesenho para o servidor (Pages Functions)
// e fazer esta pagina apenas enviar o numero e exibir a resposta.

function numeroValido(n) { return Number.isInteger(n) && n >= 1 && n <= 1000; }

const formulario = document.getElementById("formulario");
const campoNumero = document.getElementById("numero");
const area = document.getElementById("desenho");
const mensagem = document.getElementById("mensagem");
const botaoBaixar = document.getElementById("baixar");

let svgAtual = "";

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensagem.textContent = "";
  area.innerHTML = "";

  const numero = Number(campoNumero.value);

  if (!window.idToken) {
    mensagem.textContent = "Faça login com Google para desenhar";
    return;
  }

  if (!numeroValido(numero)) {
    mensagem.textContent = "Digite um inteiro entre 1 e 1000";
    return;
  }

  try {
    const res = await fetch("/api/desenho", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numero: numero, token: window.idToken })
    });

    const data = await res.json();

    if (res.status === 401) {
      mensagem.textContent = "Não autorizado: token inválido ou expirado";
      return;
    }

    if (res.status === 400) {
      mensagem.textContent = "Erro: " + (data.erro || "requisição inválida");
      return;
    }

    svgAtual = data.svg;
    area.innerHTML = svgAtual;
    botaoBaixar.disabled = false;

  } catch (e) {
    mensagem.textContent = "Erro ao conectar com o servidor";
  }
});

// Função de baixar que já tinha
botaoBaixar.addEventListener("click", () => {
  if (!svgAtual) return;
  const blob = new Blob([svgAtual], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "desenho.svg";
  a.click();
});