import { test, expect } from "@playwright/test";

const url = "http://localhost:3000";
const rotaLogin = `${url}/api/auth/login`;
const rotaLivros = `${url}/api/livros`;
const admin = {
  email: "admin@biblioteca.com",
  senha: "Admin@123",
};

const livro = {
  titulo: "O Alienista",
  autor: "Machado de Assis",
  isbn: "9788500000097",
  anoPublicacao: 1882,
  quantidade: 2,
};

test.describe("Administração de Livros", () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    const respostaLogin = await request.post(rotaLogin, { data: admin });

    expect(respostaLogin.status()).toBe(200);
    const dadosLogin = await respostaLogin.json();
    token = dadosLogin.token;
  });

  test("Cadastrar e excluir um livro novo com sucesso", async ({ request }) => {
    const resposta = await request.post(rotaLivros, {
      data: livro,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(resposta.status()).toBe(201);
    const livroCriado = await resposta.json();

    expect(livroCriado).toMatchObject(livro);
    expect(livroCriado.id).toBeDefined();

    const respostaExclusao = await request.delete(`${rotaLivros}/${livroCriado.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(respostaExclusao.status()).toBe(204);
  });

  test("Não deve cadastrar livro sem token", async ({ request }) => {
    const resposta = await request.post(rotaLivros, {
      data: livro,
    });

    expect(resposta.status()).toBe(401);
    const dados = await resposta.json();
    expect(dados.erro).toBe("Token não informado");
  });
});
