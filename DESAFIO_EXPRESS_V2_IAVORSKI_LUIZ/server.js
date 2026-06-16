const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname)));

// Conexão com o banco de dados em arquivo local
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) console.error("Erro ao conectar ao banco:", err.message);
  else console.log("Banco de dados SQLite3 conectado.");
});

// Criação da tabela de produtos
db.run(`CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    preco REAL NOT NULL
)`);

// ROTA 1: Página Principal (Exibe os botões e faz a injeção do HTML do banco)
app.get("/", (req, res) => {
  db.all("SELECT * FROM produtos", [], (err, rows) => {
    if (err) return res.status(500).send("Erro no banco de dados.");

    // Construindo a injeção dinâmica de HTML
    let tabelaHtml = "";
    if (rows.length === 0) {
      tabelaHtml =
        '<p style="color: #777;">O banco de dados está vazio. Escolha uma das opções acima para popular!</p>';
    } else {
      tabelaHtml = `
                <table border="1" style="border-collapse: collapse; width: 50%; margin-top: 20px;">
                    <tr style="background-color: #ddd;">
                        <th>ID</th>
                        <th>Produto</th>
                        <th>Preço</th>
                    </tr>
                    ${rows
                      .map(
                        (item) => `
                        <tr>
                            <td>${item.id}</td>
                            <td>${item.nome}</td>
                            <td>R$ ${item.preco.toFixed(2)}</td>
                        </tr>
                    `,
                      )
                      .join("")}
                </table>`;
    }

    // Enviando a página com os links/botões requisitados
    res.send(`
      <!doctype html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Desafio Express + SQLite3</title>
        <style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{background:#eaf5fb;color:#223238;font-family:Verdana,Geneva,Tahoma,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
          .container{width:100%;max-width:1100px;margin:auto;padding:26px;border-radius:12px;background:linear-gradient(180deg,#fff,#f6fbfc);box-shadow:0 8px 24px rgba(34,50,60,0.08)}
          h1{color:#6b4b3a;margin-bottom:12px}
          .hero{display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap}
          .hero-text{flex:1 1 360px;min-width:280px}
          .hero-image{flex:0 1 380px;display:flex;justify-content:center}
          .hero-image img{width:100%;max-width:380px;border-radius:16px;box-shadow:0 12px 30px rgba(34,50,60,0.12)}
          .controls{margin-bottom:18px}
          .controls a{margin-right:10px;text-decoration:none}
          .btn{padding:10px 14px;border-radius:6px;border:none;cursor:pointer;background:#6b4b3a;color:#fff}
          .btn.ghost{background:#f1fbff;color:#223238;border:1px solid #d7eef6}
          table{border-collapse:collapse;width:100%;margin-top:14px}
          th,td{padding:8px;border:1px solid #dbecef}
          th{background:#f6fbfc;color:#223238}
          #empty{color:#55707a}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="hero">
            <div class="hero-text">
              <h1>Desafio Express + SQLite3</h1>
              <div class="controls">
                <a href="/popular-poucos"><button class="btn">Popular Poucos</button></a>
                <a href="/popular-muitos"><button class="btn">Popular Muitos</button></a>
                <a href="/limpar-banco"><button class="btn ghost">Limpar Banco</button></a>
              </div>
            </div>
            <div class="hero-image">
              <img src="/WhatsApp Image 2026-06-16 at 11.34.41.jpeg" alt="Ilustração lateral" />
            </div>
          </div>
          <h2>Dados Injetados:</h2>
          ${tabelaHtml}
        </div>
      </body>
      </html>
    `);
  });
});

// --- AS ROTAS DE POPULAÇÃO VÃO ENTRAR NO PRÓXIMO PASSO ---

// ROTA 2: Popular Poucos Registros
app.get("/popular-poucos", (req, res) => {
  const stmt = db.prepare("INSERT INTO produtos (nome, preco) VALUES (?, ?)");

  // Semeando 2 registros simples no banco
  stmt.run("Caderno Universitário", 19.9);
  stmt.run("Caneta Esferográfica", 2.5);
  stmt.finalize();

  // Página de confirmação com o botão para retornar à rota principal
  res.send(`
    <!doctype html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Registros adicionados</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:#eaf5fb;font-family:Verdana,Geneva,Tahoma,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px;color:#223238}
        .card{background:#fff;padding:24px;border-radius:10px;max-width:700px;width:100%;text-align:center;box-shadow:0 6px 18px rgba(34,50,60,0.06)}
        h2{color:#2b7a5a;margin-bottom:10px}
        a .btn{background:#6b4b3a;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none}
      </style>
    </head>
    <body>
      <div class="card">
        <h2>Sucesso: Poucos registros foram adicionados!</h2>
        <p>Foram inseridos 2 produtos padrão no arquivo SQLite3.</p>
        <hr style="margin:16px 0;opacity:.6" />
        <a href="/"><span class="btn">Voltar para a Página Principal</span></a>
      </div>
    </body>
    </html>
  `);
});

// ROTA 3: Popular Muitos Registros (Utilizando laço de repetição)
app.get("/popular-muitos", (req, res) => {
  const stmt = db.prepare("INSERT INTO produtos (nome, preco) VALUES (?, ?)");

  // Loop tradicional para simular carga em lote (15 itens)
  for (let i = 1; i <= 15; i++) {
    stmt.run(
      `Inserção automatizada de produto ${String.fromCharCode(64 + i)}`,
      12.5 * i,
    );
  }
  stmt.finalize();

  // Página de confirmação com o botão para retornar à rota principal
  res.send(`
    <!doctype html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Carga adicionada</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:#eaf5fb;font-family:Verdana,Geneva,Tahoma,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px;color:#223238}
        .card{background:#fff;padding:24px;border-radius:10px;max-width:700px;width:100%;text-align:center;box-shadow:0 6px 18px rgba(34,50,60,0.06)}
        h2{color:#234e6b;margin-bottom:10px}
        a .btn{background:#6b4b3a;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none}
      </style>
    </head>
    <body>
      <div class="card">
        <h2>Sucesso: Carga em lote adicionada!</h2>
        <p>Foram semeados 15 novos registros automatizados no banco de dados.</p>
        <hr style="margin:16px 0;opacity:.6" />
        <a href="/"><span class="btn">Voltar para a Página Principal</span></a>
      </div>
    </body>
    </html>
  `);
});

// ROTA AUXILIAR: Limpar Banco (Garante que a rota de entrada volte a carregar zerada)
app.get("/limpar-banco", (req, res) => {
  db.run("DELETE FROM produtos", [], (err) => {
    if (err) return res.status(500).send("Erro ao limpar a tabela.");
    // Redireciona o navegador de volta para a rota raiz
    res.redirect("/");
  });
});

// 3. Colocando o servidor em modo de escuta ativa
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
