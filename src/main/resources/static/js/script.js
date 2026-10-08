/* ---------- MENU MOBILE ---------- */
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("aberto");
  });
}

/* =========================================================
   CARRINHO DE PEDIDOS
   ========================================================= */

const CHAVE_CARRINHO = "cafeDeCriaCarrinho";

function obterCarrinho() {
  const dados = localStorage.getItem(CHAVE_CARRINHO);
  return dados ? JSON.parse(dados) : [];
}

function salvarCarrinho(carrinho) {
  localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
}

function removerItem(indice) {
  const carrinho = obterCarrinho();

  carrinho.splice(indice, 1);

  salvarCarrinho(carrinho);
  renderizarPedido();
}

function calcularTotal(carrinho) {
  return carrinho.reduce(
    (soma, item) => soma + item.preco * item.quantidade,
    0
  );
}

function formatarPreco(valor) {
  return "R$ " + valor.toFixed(2).replace(".", ",");
}


/* =========================================================
   BOTÕES "ADICIONAR AO PEDIDO"
   ========================================================= */

document.querySelectorAll(".btn-add").forEach((botao) => {

  if (botao.closest(".produto-acoes")) return;

  botao.addEventListener("click", () => {

    adicionarItem(
      botao.dataset.nome,
      parseFloat(botao.dataset.preco),
      1,
      "",
      botao.dataset.img || ""
    );

    avisarBotao(botao);

  });

});


function avisarBotao(botao) {

  const textoOriginal = botao.textContent;

  botao.textContent = "Adicionado ✓";

  setTimeout(() => {
    botao.textContent = textoOriginal;
  }, 1200);

}


/* =========================================================
   ADICIONAR ITEM
   ========================================================= */

function adicionarItem(
  nome,
  preco,
  quantidade,
  observacao,
  imagem
) {

  const carrinho = obterCarrinho();

  const existente = carrinho.find(
    (item) =>
      item.nome === nome &&
      !item.observacao
  );

  if (existente && !observacao) {

    existente.quantidade += quantidade;

  } else {

    carrinho.push({
      nome,
      preco,
      quantidade,
      observacao: observacao || "",
      imagem: imagem || ""
    });

  }

  salvarCarrinho(carrinho);

}


/* =========================================================
   PÁGINA DE PEDIDOS - CATÁLOGO
   ========================================================= */

const categoriaTabs =
  document.getElementById("categoriaTabs");

const produtosGrid =
  document.getElementById("produtosGrid");


if (categoriaTabs && produtosGrid) {

  categoriaTabs
    .querySelectorAll(".tab-categoria")
    .forEach((tab) => {

      tab.addEventListener("click", () => {

        categoriaTabs
          .querySelectorAll(".tab-categoria")
          .forEach((t) => {
            t.classList.remove("ativo");
          });

        tab.classList.add("ativo");

        const categoria = tab.dataset.categoria;

        produtosGrid
          .querySelectorAll(".produto-card")
          .forEach((card) => {

            const mostrar =
              categoria === "todos" ||
              card.dataset.categoria === categoria;

            card.classList.toggle(
              "oculto-categoria",
              !mostrar
            );

          });

      });

    });

}


/* =========================================================
   STEPPER DE QUANTIDADE
   ========================================================= */

if (produtosGrid) {

  produtosGrid
    .querySelectorAll(".produto-card")
    .forEach((card) => {

      const input =
        card.querySelector(".qtd-input");

      card
        .querySelector(".qtd-menos")
        .addEventListener("click", () => {

          input.value = Math.max(
            1,
            parseInt(input.value, 10) - 1
          );

        });

      card
        .querySelector(".qtd-mais")
        .addEventListener("click", () => {

          input.value =
            parseInt(input.value, 10) + 1;

        });


      card
        .querySelector(".btn-add")
        .addEventListener("click", (evento) => {

          const botao = evento.currentTarget;

          const quantidade =
            parseInt(input.value, 10) || 1;

          adicionarItem(
            botao.dataset.nome,
            parseFloat(botao.dataset.preco),
            quantidade,
            "",
            botao.dataset.img
          );

          avisarBotao(botao);

          renderizarPedido();

          input.value = 1;

        });

    });

}


/* =========================================================
   PÁGINA DE PEDIDOS - CARRINHO
   ========================================================= */

const listaPedido =
  document.getElementById("listaPedido");

const subtotalPedidoEl =
  document.getElementById("subtotalPedido");

const taxaEntregaEl =
  document.getElementById("taxaEntrega");

const linhaTaxa =
  document.getElementById("linhaTaxa");

const totalPedidoEl =
  document.getElementById("totalPedido");

const mensagemPedido =
  document.getElementById("mensagemPedido");

const formCliente =
  document.getElementById("formCliente");

const campoEndereco =
  document.getElementById("campoEndereco");


const TAXA_ENTREGA = 5.0;


/* =========================================================
   ENTREGA
   ========================================================= */

function tipoEntregaSelecionado() {

  const radio =
    document.querySelector(
      'input[name="tipoEntrega"]:checked'
    );

  return radio
    ? radio.value
    : "retirada";

}


document
  .querySelectorAll('input[name="tipoEntrega"]')
  .forEach((radio) => {

    radio.addEventListener("change", () => {

      const ehEntrega =
        tipoEntregaSelecionado() === "entrega";

      if (campoEndereco) {

        campoEndereco.classList.toggle(
          "oculto",
          !ehEntrega
        );

      }

      renderizarPedido();

    });

  });


/* =========================================================
   RENDERIZAR PEDIDO
   ========================================================= */

function renderizarPedido() {

  if (!listaPedido) return;

  const carrinho = obterCarrinho();

  listaPedido.innerHTML = "";


  if (carrinho.length === 0) {

    listaPedido.innerHTML =
      '<li class="pedido-vazio">Seu carrinho está vazio. Adicione itens ao lado.</li>';

  } else {

    carrinho.forEach((item, indice) => {

      const li =
        document.createElement("li");

      li.className = "pedido-item";

      const subtotal =
        item.preco * item.quantidade;


      li.innerHTML = `
        <div class="pedido-item-esquerda">

          <p class="pedido-item-nome">
            ${item.nome}
          </p>

          <p class="pedido-item-preco-unit">
            ${formatarPreco(item.preco)} un.
          </p>

        </div>

        <div class="pedido-item-qtd">

          <button
            type="button"
            class="qtd-diminuir"
            data-indice="${indice}"
          >
            −
          </button>

          <span>
            ${item.quantidade}
          </span>

          <button
            type="button"
            class="qtd-aumentar"
            data-indice="${indice}"
          >
            +
          </button>

        </div>

        <div class="pedido-item-direita">

          <span class="pedido-item-subtotal">
            ${formatarPreco(subtotal)}
          </span>

          <button
            type="button"
            class="pedido-item-remover"
            data-indice="${indice}"
          >
            remover
          </button>

        </div>
      `;


      listaPedido.appendChild(li);

    });


    listaPedido
      .querySelectorAll(".qtd-diminuir")
      .forEach((botao) => {

        botao.addEventListener("click", () => {

          alterarQuantidade(
            parseInt(botao.dataset.indice, 10),
            -1
          );

        });

      });


    listaPedido
      .querySelectorAll(".qtd-aumentar")
      .forEach((botao) => {

        botao.addEventListener("click", () => {

          alterarQuantidade(
            parseInt(botao.dataset.indice, 10),
            1
          );

        });

      });


    listaPedido
      .querySelectorAll(".pedido-item-remover")
      .forEach((botao) => {

        botao.addEventListener("click", () => {

          removerItem(
            parseInt(botao.dataset.indice, 10)
          );

        });

      });

  }


  const subtotal =
    calcularTotal(carrinho);

  const ehEntrega =
    tipoEntregaSelecionado() === "entrega";

  const taxa =
    carrinho.length > 0 && ehEntrega
      ? TAXA_ENTREGA
      : 0;


  if (subtotalPedidoEl) {

    subtotalPedidoEl.textContent =
      formatarPreco(subtotal);

  }


  if (taxaEntregaEl) {

    taxaEntregaEl.textContent =
      formatarPreco(taxa);

  }


  if (linhaTaxa) {

    linhaTaxa.classList.toggle(
      "oculto",
      !ehEntrega
    );

  }


  if (totalPedidoEl) {

    totalPedidoEl.textContent =
      formatarPreco(subtotal + taxa);

  }

}


/* =========================================================
   ALTERAR QUANTIDADE
   ========================================================= */

function alterarQuantidade(indice, delta) {

  const carrinho = obterCarrinho();

  if (!carrinho[indice]) return;


  carrinho[indice].quantidade += delta;


  if (carrinho[indice].quantidade <= 0) {

    carrinho.splice(indice, 1);

  }


  salvarCarrinho(carrinho);

  renderizarPedido();

}


/* =========================================================
   PAGAMENTO
   ========================================================= */

const pagamentoCliente =
  document.getElementById("pagamentoCliente");

const opcoesCartao =
  document.getElementById("opcoesCartao");

const opcoesPix =
  document.getElementById("opcoesPix");

const pixQrCode =
  document.getElementById("pixQrCode");

const pixChave =
  document.getElementById("pixChave");

const copiarPix =
  document.getElementById("copiarPix");


const numeroCartao =
  document.getElementById("numeroCartao");

const nomeCartao =
  document.getElementById("nomeCartao");

const validadeCartao =
  document.getElementById("validadeCartao");

const cvvCartao =
  document.getElementById("cvvCartao");


/* =========================================================
   GERAR CHAVE PIX ALEATÓRIA
   ========================================================= */

function gerarChavePixAleatoria() {

  if (
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {

    return window.crypto.randomUUID();

  }

  return (
    "pix-" +
    Math.random()
      .toString(36)
      .substring(2, 10) +
    "-" +
    Date.now().toString(36)
  );

}


const CHAVE_PIX =
  gerarChavePixAleatoria();


/* =========================================================
   GERAR QR CODE
   ========================================================= */

function gerarQrCodePix() {

  if (!pixQrCode || !pixChave) return;


  pixChave.textContent = CHAVE_PIX;


  const urlQrCode =
    "https://api.qrserver.com/v1/create-qr-code/" +
    "?size=220x220&data=" +
    encodeURIComponent(CHAVE_PIX);


  pixQrCode.innerHTML = `
    <img
      src="${urlQrCode}"
      alt="QR Code Pix"
      class="pix-qr-imagem"
    >
  `;

}


/* =========================================================
   MOSTRAR OPÇÕES DE PAGAMENTO
   ========================================================= */

function atualizarPagamento() {

  if (!pagamentoCliente) return;


  const pagamento =
    pagamentoCliente.value;


  const ehCartao =
    pagamento === "Cartão";

  const ehPix =
    pagamento === "Pix";


  if (opcoesCartao) {

    opcoesCartao.classList.toggle(
      "oculto",
      !ehCartao
    );

  }


  if (opcoesPix) {

    opcoesPix.classList.toggle(
      "oculto",
      !ehPix
    );

  }


  if (numeroCartao) {
    numeroCartao.required = ehCartao;
  }

  if (nomeCartao) {
    nomeCartao.required = ehCartao;
  }

  if (validadeCartao) {
    validadeCartao.required = ehCartao;
  }

  if (cvvCartao) {
    cvvCartao.required = ehCartao;
  }


  if (ehPix) {

    gerarQrCodePix();

  }

}


if (pagamentoCliente) {

  pagamentoCliente.addEventListener(
    "change",
    atualizarPagamento
  );

}


/* =========================================================
   FORMATAÇÃO DO NÚMERO DO CARTÃO
   ========================================================= */

if (numeroCartao) {

  numeroCartao.addEventListener(
    "input",
    () => {

      let valor =
        numeroCartao.value
          .replace(/\D/g, "")
          .substring(0, 16);


      valor =
        valor.replace(
          /(\d{4})(?=\d)/g,
          "$1 "
        );


      numeroCartao.value = valor;

    }
  );

}


/* =========================================================
   FORMATAÇÃO DA VALIDADE
   ========================================================= */

if (validadeCartao) {

  validadeCartao.addEventListener(
    "input",
    () => {

      let valor =
        validadeCartao.value
          .replace(/\D/g, "")
          .substring(0, 4);


      if (valor.length >= 3) {

        valor =
          valor.substring(0, 2) +
          "/" +
          valor.substring(2);

      }


      validadeCartao.value = valor;

    }
  );

}


/* =========================================================
   COPIAR CHAVE PIX
   ========================================================= */

if (copiarPix) {

  copiarPix.addEventListener(
    "click",
    async () => {

      try {

        await navigator.clipboard.writeText(
          CHAVE_PIX
        );

        const textoOriginal =
          copiarPix.textContent;

        copiarPix.textContent =
          "Copiado ✓";


        setTimeout(() => {

          copiarPix.textContent =
            textoOriginal;

        }, 1500);

      } catch (erro) {

        alert(
          "Não foi possível copiar a chave Pix."
        );

      }

    }
  );

}


/* =========================================================
   FINALIZAR PEDIDO
   ========================================================= */

if (formCliente) {

  formCliente.addEventListener(
    "submit",
    (evento) => {

      evento.preventDefault();


      const carrinho =
        obterCarrinho();


      if (mensagemPedido) {
        mensagemPedido.innerHTML = "";
      }


      if (carrinho.length === 0) {

        mensagemPedido.innerHTML =
          '<p class="mensagem-erro">Adicione pelo menos um item ao carrinho antes de finalizar.</p>';

        return;

      }


      const nome =
        document
          .getElementById("nomeCliente")
          .value
          .trim();


      const telefone =
        document
          .getElementById("telefoneCliente")
          .value
          .trim();


      const ehEntrega =
        tipoEntregaSelecionado() === "entrega";


      const endereco =
        document
          .getElementById("enderecoCliente")
          .value
          .trim();


      const pagamento =
        document
          .getElementById("pagamentoCliente")
          .value;


      /* -----------------------------------------
         VALIDAÇÃO DOS DADOS
         ----------------------------------------- */

      if (!nome || !telefone) {

        mensagemPedido.innerHTML =
          '<p class="mensagem-erro">Preencha nome e telefone para finalizar.</p>';

        return;

      }


      if (ehEntrega && !endereco) {

        mensagemPedido.innerHTML =
          '<p class="mensagem-erro">Informe o endereço de entrega.</p>';

        return;

      }


      /* -----------------------------------------
         VALIDAÇÃO DO CARTÃO
         ----------------------------------------- */

      let tipoCartao = "";


      if (pagamento === "Cartão") {

        tipoCartao =
          document.querySelector(
            'input[name="tipoCartao"]:checked'
          )?.value || "Débito";


        const numero =
          numeroCartao.value
            .replace(/\D/g, "");


        const nomeNoCartao =
          nomeCartao.value.trim();


        const validade =
          validadeCartao.value.trim();


        const cvv =
          cvvCartao.value.trim();


        if (numero.length < 16) {

          mensagemPedido.innerHTML =
            '<p class="mensagem-erro">Digite um número de cartão válido.</p>';

          return;

        }


        if (!nomeNoCartao) {

          mensagemPedido.innerHTML =
            '<p class="mensagem-erro">Informe o nome que está no cartão.</p>';

          return;

        }


        if (!/^\d{2}\/\d{2}$/.test(validade)) {

          mensagemPedido.innerHTML =
            '<p class="mensagem-erro">Informe a validade do cartão no formato MM/AA.</p>';

          return;

        }


        if (!/^\d{3,4}$/.test(cvv)) {

          mensagemPedido.innerHTML =
            '<p class="mensagem-erro">Informe um CVV válido.</p>';

          return;

        }

      }


      /* -----------------------------------------
         TOTAL
         ----------------------------------------- */

      const subtotal =
        calcularTotal(carrinho);


      const taxa =
        ehEntrega
          ? TAXA_ENTREGA
          : 0;


      const total =
        subtotal + taxa;


      const numeroPedido =
        Math.floor(
          1000 +
          Math.random() * 9000
        );


      /* -----------------------------------------
         ITENS DO PEDIDO
         ----------------------------------------- */

      const itensHtml =
        carrinho
          .map(
            (item) =>
              `<li>${item.quantidade}x ${item.nome} — ${formatarPreco(
                item.preco * item.quantidade
              )}</li>`
          )
          .join("");


      /* -----------------------------------------
         TEXTO DO PAGAMENTO
         ----------------------------------------- */

      let textoPagamento =
        pagamento;


      if (pagamento === "Cartão") {

        textoPagamento =
          `Cartão (${tipoCartao})`;

      }


      /* -----------------------------------------
         CONFIRMAÇÃO
         ----------------------------------------- */

      mensagemPedido.innerHTML = `
        <div class="pedido-confirmado">

          <h3>
            Pedido #${numeroPedido} recebido! ☕
          </h3>

          <p>
            <strong>${nome}</strong> · ${telefone}
          </p>

          <p>
            ${
              ehEntrega
                ? "Entrega em: " + endereco
                : "Retirada na loja"
            }
            · Pagamento: ${textoPagamento}
          </p>

          <ul>
            ${itensHtml}
          </ul>

          <p>
            <strong>
              Total: ${formatarPreco(total)}
            </strong>
          </p>

        </div>
      `;


      /* -----------------------------------------
         LIMPAR CARRINHO
         ----------------------------------------- */

      localStorage.removeItem(
        CHAVE_CARRINHO
      );


      formCliente.reset();


      if (campoEndereco) {

        campoEndereco.classList.add(
          "oculto"
        );

      }


      atualizarPagamento();

      renderizarPedido();

    }
  );

}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

atualizarPagamento();

renderizarPedido();



/* =========================================================
   CARROSSEL HERO
   ========================================================= */

const carouselSlides = document.querySelectorAll(".carousel-slide");
const carouselIndicators = document.querySelectorAll(".carousel-indicator");
const carouselPrev = document.getElementById("carouselPrev");
const carouselNext = document.getElementById("carouselNext");

let currentSlide = 0;
let carouselInterval;


/* MOSTRAR SLIDE */

function showSlide(index) {

  carouselSlides.forEach((slide) => {
    slide.classList.remove("active");
  });

  carouselIndicators.forEach((indicator) => {
    indicator.classList.remove("active");
  });

  carouselSlides[index].classList.add("active");
  carouselIndicators[index].classList.add("active");

  currentSlide = index;
}


/* PRÓXIMO SLIDE */

function nextSlide() {

  let next = currentSlide + 1;

  if (next >= carouselSlides.length) {
    next = 0;
  }

  showSlide(next);
}


/* SLIDE ANTERIOR */

function previousSlide() {

  let previous = currentSlide - 1;

  if (previous < 0) {
    previous = carouselSlides.length - 1;
  }

  showSlide(previous);
}


/* BOTÃO PRÓXIMO */

if (carouselNext) {
  carouselNext.addEventListener("click", () => {
    nextSlide();
    restartCarousel();
  });
}


/* BOTÃO ANTERIOR */

if (carouselPrev) {
  carouselPrev.addEventListener("click", () => {
    previousSlide();
    restartCarousel();
  });
}


/* INDICADORES */

carouselIndicators.forEach((indicator, index) => {

  indicator.addEventListener("click", () => {
    showSlide(index);
    restartCarousel();
  });

});


/* CARROSSEL AUTOMÁTICO */

function startCarousel() {

  carouselInterval = setInterval(() => {
    nextSlide();
  }, 5000);

}


/* REINICIAR CONTAGEM */

function restartCarousel() {

  clearInterval(carouselInterval);
  startCarousel();

}


/* INICIAR */

if (carouselSlides.length > 0) {
  showSlide(0);
  startCarousel();
}

