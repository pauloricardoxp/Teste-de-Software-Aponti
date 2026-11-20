import { expect, test } from "vitest";
import { CartPage } from "./pages/CartPage.js";
import { ProductPage } from "./pages/ProductPage.js";
import { UserPage } from "./pages/UserPage.js";

const userPage = new UserPage();
const productPage = new ProductPage();
const cartPage = new CartPage();

async function createAuthenticatedUser(): Promise<string> {
  const email = `teste${Date.now()}@teste.com`;
  const password = "1234";

  const registration = await userPage.register(email, password);
  expect(registration.status).toBe(201);

  const login = await userPage.login(email, password);
  expect(login.response.status).toBe(200);

  return login.token;
}

async function createProduct(token: string): Promise<string> {
  const product = await productPage.create(token);
  expect(product.response.status).toBe(201);

  return product.id;
}

test("Adicionar 3 unidades no carrinho e conferir o estoque", async () => {
  const token = await createAuthenticatedUser();
  const productId = await createProduct(token);

  const cart = await cartPage.addProduct(productId, 3, token);
  expect(cart.status).toBe(201);

  const product = await productPage.get(productId);
  expect(product.status).toBe(200);

  const updatedProduct = (await product.json()) as { quantidade: number };
  expect(updatedProduct.quantidade).toBe(7);
}, 15000);

test("Cancelar a compra e devolver o estoque", async () => {
  const token = await createAuthenticatedUser();
  const productId = await createProduct(token);

  const cart = await cartPage.addProduct(productId, 3, token);
  expect(cart.status).toBe(201);

  const cancellation = await cartPage.cancelPurchase(token);
  expect(cancellation.status).toBe(200);

  const product = await productPage.get(productId);
  expect(product.status).toBe(200);

  const updatedProduct = (await product.json()) as { quantidade: number };
  expect(updatedProduct.quantidade).toBe(10);
}, 15000);

test("Não permitir excluir um produto que está no carrinho", async () => {
  const token = await createAuthenticatedUser();
  const productId = await createProduct(token);

  const cart = await cartPage.addProduct(productId, 1, token);
  expect(cart.status).toBe(201);

  const deletion = await productPage.delete(productId, token);
  expect(deletion.status).toBe(400);
}, 15000);
