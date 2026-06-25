class Produto {
  #preco;
  #quantidade;

  constructor(nome, preco, quantidade) {
    if (!nome || preco <= 0 || quantidade <= 0) {
      throw new Error("Dados inválidos para o produto");
    }
    this.nome = nome;

    this.#preco = parseFloat(preco);
    this.#quantidade = parseInt(quantidade);
  }

  get preco() {
    return this.#preco;
  }

  get quantidade() {
    return this.#quantidade;
  }

  valorTotal() {
    return this.#preco * this.#quantidade;
  }

  //Método toJSON();

  toJSON() {
    return {
      nome: this.nome,
      preco: this.#preco,
      quantidade: this.#quantidade,
    };
  }
}

//const produtos = [];
//Mudançã de arquitetura : cliente->servidor

//criar uma constante com endereço de API (rodadndo no nosso servidor)
const API_URL = "http://localhost:3000/produtos";

// requisição post : enviar inform dados para servidor
//função deve ser async pois o envio - resposta trafegam pela mesma rede
// usar await até q o servidor responda

document
  .getElementById("produto-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const preco = document.getElementById("preco").value;
    const quantidade = document.getElementById("quantidade").value;

    try {
      const novoProduto = new Produto(nome, preco, quantidade);

      //produtos.push(novoProduto);

      //disparo de rede : envia o produto(objeto) convertido em texto JSON para o express
      const resposta = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(novoProduto.toJSON()),
      });

      if (!resposta.ok) {
        throw new Error("Erro ao salvar o produto no servidor backend!!");
      }

      renderizarTabela();
      e.target.reset();
    } catch (erro) {
      alert(erro.message);
    }
  }); //Parei aqui!!!!!!!!!!!!!!!

function renderizarTabela() {
  const tabela = document.querySelector("#tabela-produtos tbody");
  tabela.innerHTML = "";

  produtos.forEach((produto, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
                <td>${produto.nome}</td>
                <td>R$ ${produto.preco.toFixed(2)}</td>
                <td>${produto.quantidade}</td>
                <td></td>
            `;

    const botaoRemover = document.createElement("button");
    botaoRemover.textContent = "Remover";
    botaoRemover.addEventListener("click", () => removerProduto(index));

    row.querySelector("td:last-child").appendChild(botaoRemover);
    tabela.appendChild(row);
  });

  atualizarTotal();
}

function atualizarTotal() {
  const total = produtos.reduce((acc, p) => acc + p.valorTotal(), 0);
  document.getElementById("total-estoque").textContent =
    `Total em estoque: R$ ${total.toFixed(2)}`;
}

function removerProduto(index) {
  produtos.splice(index, 1);
  renderizarTabela();
}

document.getElementById("limpar-tabela").addEventListener("click", function () {
  produtos.length = 0;
  renderizarTabela();
});
