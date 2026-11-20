import { test, expect } from "@playwright/test";

const url = "http://localhost:3000";
const rota = `${url}/api/auth/login`;
const admin = {
  email: "admin@biblioteca.com",
  senha: "Admin@123",
};

test.describe("Login", () => {
  test("Login com sucesso", async ({ request }) => {
    const resposta = await request.post(rota, { data: admin });

    expect(resposta.status()).toBe(200);
  });
});
