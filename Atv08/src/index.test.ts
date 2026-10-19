import { test, expect } from "vitest";

const loja = "https://serverest.dev";


test("Adicionar 3 unidades no carrinho e conferir o estoque", async () => {
  const email = `teste${Date.now()}@teste.com`;
  const senha = "1234";

  const cadastro = await fetch(`${loja}/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: "Teste",
      email,
      password: senha,
      administrador: "true",
    }),
  });

  expect(cadastro.status).toBe(201);

  const login = await fetch(`${loja}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: senha }),
  });

  expect(login.status).toBe(200);

  const dadosLogin = (await login.json()) as {
    authorization: string;
  };
  const token = dadosLogin.authorization;

  const produto = await fetch(`${loja}/produtos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({
      nome: `Produto ${Date.now()}`,
      preco: 100,
      descricao: "Produto de teste",
      quantidade: 10,
    }),
  });

  expect(produto.status).toBe(201);

  const dadosProduto = (await produto.json()) as { _id: string };
  const idProduto = dadosProduto._id;

  const carrinho = await fetch(`${loja}/carrinhos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({
      produtos: [{ idProduto, quantidade: 3 }],
    }),
  });

  expect(carrinho.status).toBe(201);

  const consulta = await fetch(`${loja}/produtos/${idProduto}`);
  expect(consulta.status).toBe(200);

  const produtoAtualizado = (await consulta.json()) as {
    quantidade: number;
  };

  expect(produtoAtualizado.quantidade).toBe(7);
}, 15000);



test("Cancelar a compra e devolver o estoque", async () => {
  const email = `teste${Date.now()}@teste.com`;
  const senha = "1234";

  const cadastro = await fetch(`${loja}/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: "Teste",
      email,
      password: senha,
      administrador: "true",
    }),
  });

  expect(cadastro.status).toBe(201);

  const login = await fetch(`${loja}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: senha }),
  });

  expect(login.status).toBe(200);

  const dadosLogin = (await login.json()) as {
    authorization: string;
  };
  const token = dadosLogin.authorization;

  const produto = await fetch(`${loja}/produtos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({
      nome: `Produto ${Date.now()}`,
      preco: 100,
      descricao: "Produto de teste",
      quantidade: 10,
    }),
  });

  expect(produto.status).toBe(201);

  const dadosProduto = (await produto.json()) as { _id: string };
  const idProduto = dadosProduto._id;

  const carrinho = await fetch(`${loja}/carrinhos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({
      produtos: [{ idProduto, quantidade: 3 }],
    }),
  });

  expect(carrinho.status).toBe(201);

  const cancelamento = await fetch(
    `${loja}/carrinhos/cancelar-compra`,
    {
      method: "DELETE",
      headers: { Authorization: token },
    }
  );

  expect(cancelamento.status).toBe(200);

  const consulta = await fetch(`${loja}/produtos/${idProduto}`);
  expect(consulta.status).toBe(200);

  const produtoAtualizado = (await consulta.json()) as {
    quantidade: number;
  };

  expect(produtoAtualizado.quantidade).toBe(10);
}, 15000);


test("Não permitir excluir um produto que está no carrinho", async () => {
  const email = `teste${Date.now()}@teste.com`;
  const senha = "1234";

  const cadastro = await fetch(`${loja}/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: "Teste",
      email,
      password: senha,
      administrador: "true",
    }),
  });

  expect(cadastro.status).toBe(201);

  const login = await fetch(`${loja}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: senha }),
  });

  expect(login.status).toBe(200);

  const dadosLogin = (await login.json()) as {
    authorization: string;
  };
  const token = dadosLogin.authorization;

  const produto = await fetch(`${loja}/produtos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({
      nome: `Produto ${Date.now()}`,
      preco: 100,
      descricao: "Produto de teste",
      quantidade: 10,
    }),
  });

  expect(produto.status).toBe(201);

  const dadosProduto = (await produto.json()) as { _id: string };
  const idProduto = dadosProduto._id;

  const carrinho = await fetch(`${loja}/carrinhos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({
      produtos: [{ idProduto, quantidade: 1 }],
    }),
  });

  expect(carrinho.status).toBe(201);

  const apagarProduto = await fetch(
    `${loja}/produtos/${idProduto}`,
    {
      method: "DELETE",
      headers: { Authorization: token },
    }
  );

  expect(apagarProduto.status).toBe(400);
}, 15000);