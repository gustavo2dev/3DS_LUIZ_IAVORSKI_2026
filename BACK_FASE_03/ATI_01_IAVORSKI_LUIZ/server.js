const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();

app.listen(3000, () => {
  console.log("Servidor SQLite Subiu!");
});

const connection = new sqlite3.Database("./database.db", (error) => {
  if (error) {
    console.log("Erro na conexão ao SQLite: " + error.message);
  }
  console.log("Conexão com SQLite (arquivo local) com sucesso!");
});

connection.serialize(() => {
  connection.run(
    "CREATE TABLE IF NOT EXISTS tasks (" +
      "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
      "task TEXT, " +
      "status TEXT)",
  );
});

app.get("/", (req, res) => {
  connection.all("SELECT * FROM tasks", (err, rows) => {
    if (err) {
      res.send("Erro ao obter tarefas");
      console.error("ERRO NO BANCO !!!!!! \n", err.message);
    } else {
      res.sendFile("./VIEWS/home.html", { root: __dirname });
    }
  });
});

app.get("/insere-poucos", (req, res) => {
  const query = "INSERT INTO tasks (task, status) VALUES (?,?)";
  connection.run(query, ["Capinar um lote", "pendente"]);
  connection.run(query, ["Configurar banco de dados MYSQL", "em andamento"]);
  connection.run(query, ["Estudar para prova de matemática", "concluído"]);
  connection.run(query, ["Fazer texto de inglês", "em andamento"]);
  connection.run(query, ["Testar fonte de bancada nova", "pendente"], (err) => {
    if (err) {
      res.send("Erro ao inserir dados");
    } else {
      res.send(
        `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Preencher</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#eaf5fb;color:#223238;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:30px;font-family:Verdana,Geneva,Tahoma,sans-serif}.card{padding:22px;background:#fff;border-radius:10px;border:1px solid #e1f0f5;color:#223238;text-align:center;box-shadow:0 6px 18px rgba(34,50,60,0.06);max-width:700px;width:100%}h1{font-size:2rem;margin-bottom:16px;color:#6b4b3a}a{display:inline-block;background:#6b4b3a;color:#fff;padding:10px 16px;text-decoration:none;border-radius:6px;transition:background .2s}a:hover{background:#553826}</style></head><body><div class="card"><h1>Populado com sucesso!!</h1><a href="/">Voltar</a></div></body></html>`,
      );
    }
  });
});

app.get("/insere-muitos", (req, res) => {
  const query = "INSERT INTO tasks (task, status) VALUES (?, ?)";

  const tarefas = [
    "Estudar Node.js",
    "Fazer atividade de matemática",
    "Treinar C++",
    "Arrumar computador",
    "Configurar servidor",
    "Criar API REST",
    "Estudar SQLite",
    "Fazer exercícios",
    "Testar fonte de bancada",
    "Montar robô Arduino",
    "Fazer backup do sistema",
    "Atualizar drivers do PC",
    "Criar tela de login",
    "Corrigir bugs da aplicação",
    "Estudar Express",
    "Configurar roteador",
    "Formatar notebook",
    "Trocar pasta térmica do processador",
    "Criar banco de dados",
    "Adicionar autenticação JWT",
    "Fazer deploy do site",
    "Aprender Git e GitHub",
    "Criar dashboard administrativo",
    "Testar API com Postman",
    "Criar sistema de cadastro",
    "Montar relatório escolar",
    "Estudar lógica de programação",
    "Treinar SQL",
    "Implementar CRUD completo",
    "Criar tela responsiva",
    "Melhorar desempenho do sistema",
    "Documentar código",
    "Criar sistema de estoque",
    "Adicionar upload de imagens",
    "Testar conexão com banco",
    "Criar sistema de pedidos",
    "Configurar ambiente Linux",
    "Estudar programação orientada a objetos",
  ];

  const status = ["pendente", "em andamento", "concluído"];

  for (let i = 1; i <= 100; i++) {
    const tarefaAleatoria = tarefas[Math.floor(Math.random() * tarefas.length)];

    const statusAleatorio = status[Math.floor(Math.random() * status.length)];

    const nomeFinal = `${tarefaAleatoria} ${i}`;

    connection.run(query, [nomeFinal, statusAleatorio]);
  }

  res.send(
    `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Preencher</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#eaf5fb;color:#223238;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:30px;font-family:Verdana,Geneva,Tahoma,sans-serif}.card{padding:22px;background:#fff;border-radius:10px;border:1px solid #e1f0f5;color:#223238;text-align:center;box-shadow:0 6px 18px rgba(34,50,60,0.06);max-width:700px;width:100%}h1{font-size:2rem;margin-bottom:16px;color:#6b4b3a}a{display:inline-block;background:#6b4b3a;color:#fff;padding:10px 16px;text-decoration:none;border-radius:6px;transition:background .2s}a:hover{background:#553826}</style></head><body><div class="card"><h1>100 tarefas criadas com sucesso chefe!</h1><a href="/">Voltar</a></div></body></html>`,
  );
});

app.get("/tarefas", (req, res) => {
  connection.all("SELECT * FROM tasks", (err, rows) => {
    if (err) {
      res.send("Erro ao buscar tarefas");
    } else {
      let texto = "";

      rows.forEach((linha) => {
        texto += `<p>${linha.id} -> ${linha.task} / ${linha.status}</p>`;
      });

      res.send(texto);
    }
  });
});
