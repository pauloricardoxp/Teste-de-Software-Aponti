import { test, expect } from "@playwright/test";

const url = "http://localhost:3000";
const rotaLogin = `${url}/api/auth/login`;
const rotaEmprestimos = `${url}/api/emprestimos`;
const admin = {
  email: "admin@biblioteca.com",
  senha: "Admin@123",
};

test.describe("Emprestimos", () => {
  test("Não deve emprestar livro sem exemplares", async ({ request }) => {
    const respostaLogin = await request.post(rotaLogin, { data: admin });
    expect(respostaLogin.status()).toBe(200);
    const dadosLogin = await respostaLogin.json();

    const resposta = await request.post(rotaEmprestimos, {
      data: { livroId: 4 },
      headers: {
        Authorization: `Bearer ${dadosLogin.token}`,
      },
    });

    expect(resposta.status()).toBe(409);
    const dados = await resposta.json();
    expect(dados.erro).toBe("Livro indisponível");
  });
});
