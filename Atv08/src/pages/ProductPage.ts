const baseUrl = "https://serverest.dev";

type ProductResponse = {
  _id: string;
};

export class ProductPage {
  async create(token: string): Promise<{ response: Response; id: string }> {
    const response = await fetch(`${baseUrl}/produtos`, {
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
    const data = (await response.json()) as ProductResponse;

    return { response, id: data._id };
  }

  async get(id: string): Promise<Response> {
    return fetch(`${baseUrl}/produtos/${id}`);
  }

  async delete(id: string, token: string): Promise<Response> {
    return fetch(`${baseUrl}/produtos/${id}`, {
      method: "DELETE",
      headers: { Authorization: token },
    });
  }
}
