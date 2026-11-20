const baseUrl = "https://serverest.dev";

type LoginResponse = {
  authorization: string;
};

export class UserPage {
  async register(email: string, password: string): Promise<Response> {
    return fetch(`${baseUrl}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: "Teste",
        email,
        password,
        administrador: "true",
      }),
    });
  }

  async login(
    email: string,
    password: string
  ): Promise<{ response: Response; token: string }> {
    const response = await fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = (await response.json()) as LoginResponse;

    return { response, token: data.authorization };
  }
}
