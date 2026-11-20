import { test, expect } from "@playwright/test";

const url = "http://localhost:3000";
const id = 1;
const rota = `${url}/api/livros/${id}`;

test.describe("Livro", () => {
  test("Consulta o livro de id 1", async ({ request }) => {
    const resposta = await request.get(rota);

    expect(resposta.status()).toBe(200);
    const dados = await resposta.json();

    expect(dados.titulo).toBe("Dom Casmurro");
    expect(dados.disponivel).toBe(true);
  });
});
