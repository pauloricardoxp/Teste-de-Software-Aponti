const baseUrl = "https://serverest.dev";

export class CartPage {
  async addProduct(
    idProduct: string,
    quantity: number,
    token: string
  ): Promise<Response> {
    return fetch(`${baseUrl}/carrinhos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        produtos: [{ idProduto: idProduct, quantidade: quantity }],
      }),
    });
  }

  async cancelPurchase(token: string): Promise<Response> {
    return fetch(`${baseUrl}/carrinhos/cancelar-compra`, {
      method: "DELETE",
      headers: { Authorization: token },
    });
  }
}
