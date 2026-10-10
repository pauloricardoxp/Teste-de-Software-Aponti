
import { test, expect } from '@playwright/test';
import { fazerLogin } from './helpers';

test.describe('Testes da loja SauceDemo', () => {

  test('CT01 - Realizar login com dados válidos', async ({ page }) => {
    await fazerLogin(page);

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('.title')).toHaveText('Products');
  });

  test('CT02 - Mostrar erro ao informar senha incorreta', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');

    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('senha_errada');
    await page.locator('[data-test="login-button"]').click();

    await expect(page.locator('[data-test="error"]'))
      .toContainText('Username and password do not match');
  });

  test('CT03 - Adicionar produto ao carrinho', async ({ page }) => {
    await fazerLogin(page);

    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    await page.locator('.shopping_cart_link').click();

    await expect(page.locator('.inventory_item_name'))
      .toHaveText('Sauce Labs Backpack');
  });

  test('CT04 - Remover produto do carrinho', async ({ page }) => {
    await fazerLogin(page);

    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('.shopping_cart_link').click();
    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();

    await expect(page.locator('.cart_item')).toHaveCount(0);
    await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
  });

  test('CT05 - Finalizar uma compra', async ({ page }) => {
    await fazerLogin(page);

    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('.shopping_cart_link').click();
    await page.locator('[data-test="checkout"]').click();

    await page.locator('[data-test="firstName"]').fill('Paulo');
    await page.locator('[data-test="lastName"]').fill('Ricardo');
    await page.locator('[data-test="postalCode"]').fill('50000-000');

    await page.locator('[data-test="continue"]').click();

    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(page.locator('.cart_item')).toHaveCount(1);

    await page.locator('[data-test="finish"]').click();

    await expect(page.locator('.complete-header'))
      .toHaveText('Thank you for your order!');
  });

});
