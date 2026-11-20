# Biblioteca API

Aplicação didática (API REST + interface web) usada como base para duas aulas de automação com **Playwright**:

- **Automação de API I**: testes de API com `APIRequestContext`, validando status codes e payloads.
- **Automação de API II**: setup dos dados via API, ação na interface web e teardown via API.

O domínio é uma biblioteca simples com **usuários**, **livros** e **empréstimos**.

---

## Como rodar

**Requisito:** Node.js **18 ou superior** (testado também com 20 e 22+). Não é preciso banco de dados nem Docker.

```bash
npm install
npm run dev
```

| O quê | Endereço |
|---|---|
| Interface web | http://localhost:3000/login |
| Swagger (documentação interativa) | http://localhost:3000/docs |
| Especificação OpenAPI (JSON) | http://localhost:3000/docs.json |
| Health check | http://localhost:3000/api/health |

Outros scripts:

| Script | O que faz |
|---|---|
| `npm run dev` | Sobe o servidor e reinicia automaticamente ao salvar um arquivo |
| `npm run typecheck` | Verifica os tipos do TypeScript |
| `npm run build` e depois `npm start` | Compila para `dist/` e roda a versão compilada |

Variáveis de ambiente (opcionais):

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta HTTP |
| `JWT_SECRET` | valor de desenvolvimento | Segredo de assinatura do JWT |
| `JWT_EXPIRA_EM` | `3600` | Validade do token, em segundos |
| `NODE_ENV` | (vazio) | Com `production`, desliga `/api/test/*` e o seed automático |

Exemplo: `PORT=4000 npm run dev`

### Sobre o banco em memória

Os dados ficam **na memória** do processo:

- Toda vez que o servidor sobe (ou reinicia por causa do `npm run dev`), o banco é zerado e o **seed é aplicado automaticamente**.
- Os ids são sequenciais (1, 2, 3...) e voltam a 1 depois de um reset.

---

## Estrutura do projeto

```
src/
├── server.ts          # sobe o servidor e aplica o seed
├── app.ts             # monta o Express: API, /docs, páginas, erros
├── config.ts          # configurações (porta, JWT, ambiente)
├── database/          # "banco" em memória + seed
├── models/            # formato dos dados e acesso ao banco
├── validations/       # validação de entrada (gera 400/422)
├── services/          # regras de negócio (gera 404/409...)
├── routes/            # endpoints HTTP (finos: validam, chamam o serviço, respondem)
├── middlewares/       # autenticação (401/403) e tratamento de erros
├── errors/            # classe AppError
└── docs/              # especificação OpenAPI
public/                # páginas HTML + CSS + JavaScript puro
```

O caminho de uma requisição: **rota → validação → serviço → model**. Se algo falhar, um `AppError` é lançado e o middleware de erros monta a resposta.

---

## Convenções da API

### Formato de erro (sempre o mesmo)

```json
{
  "erro": "Dados inválidos",
  "detalhes": [
    { "campo": "titulo", "mensagem": "O campo 'titulo' é obrigatório" }
  ],
  "status": 422
}
```

`detalhes` é **sempre** um array (vazio quando não há detalhes).

### Quando cada status é usado

| Status | Quando |
|---|---|
| 200 | Consulta/alteração com sucesso |
| 201 | Recurso criado (corpo traz o objeto com `id` e `createdAt`) |
| 204 | Exclusão com sucesso (sem corpo) |
| 400 | Requisição **malformada**: JSON quebrado, id na URL que não é número, filtro de query inválido |
| 401 | Não autenticado: sem token, token inválido/expirado, e-mail ou senha errados |
| 403 | Autenticado, mas **sem permissão** (ex.: leitor tentando criar livro) |
| 404 | Recurso ou rota não encontrada |
| 409 | **Dados certos, mas o estado do sistema impede a ação** (a mensagem diz qual regra) |
| 422 | **Dados inválidos no payload** (campo faltando, tipo errado, tamanho, ano no futuro...) |

Casos de **409** (diferenciados pela mensagem em `erro`):

| Mensagem | Endpoint |
|---|---|
| `ISBN já cadastrado` | POST/PUT/PATCH `/api/livros` |
| `E-mail já cadastrado` | POST `/api/auth/register` |
| `Livro indisponível` | POST `/api/emprestimos` |
| `Limite de 3 empréstimos ativos atingido` | POST `/api/emprestimos` |
| `Empréstimo já foi devolvido` | PATCH `/api/emprestimos/:id/devolucao` |
| `Livro possui N empréstimo(s) ativo(s) e não pode ser excluído` | DELETE `/api/livros/:id` |
| `Usuário possui N empréstimo(s) ativo(s) e não pode ser excluído` | DELETE `/api/usuarios/:id` |
| `A quantidade não pode ser menor que o número de exemplares emprestados (N)` | PUT/PATCH `/api/livros/:id` |

### Autenticação

1. `POST /api/auth/login` com `{ "email": "...", "senha": "..." }`
2. A resposta traz `{ "token": "...", "tipo": "Bearer", "expiraEm": 3600, "usuario": {...} }`
3. Envie o token nas próximas requisições: `Authorization: Bearer <token>`

Perfis: **admin** (gerencia livros, vê tudo) e **leitor** (faz e devolve os próprios empréstimos). Todo cadastro feito por `/api/auth/register` cria um **leitor**.

### Formato dos objetos

**Usuário** (a senha nunca é retornada)
```json
{ "id": 2, "nome": "Leitor Padrão", "email": "leitor@biblioteca.com", "perfil": "leitor", "createdAt": "2026-11-01T22:00:00.000Z" }
```

**Livro**
```json
{
  "id": 1,
  "titulo": "Dom Casmurro",
  "autor": "Machado de Assis",
  "isbn": "9788500000011",
  "anoPublicacao": 1899,
  "quantidade": 3,
  "quantidadeDisponivel": 3,
  "disponivel": true,
  "createdAt": "2026-11-01T22:00:00.000Z",
  "updatedAt": "2026-11-01T22:00:00.000Z"
}
```
`quantidadeDisponivel` = `quantidade` − empréstimos ativos. `disponivel` = `quantidadeDisponivel > 0`.

**Empréstimo**
```json
{
  "id": 1,
  "usuarioId": 3,
  "livroId": 3,
  "status": "ativo",
  "dataEmprestimo": "2026-11-01T22:00:00.000Z",
  "dataDevolucao": null,
  "createdAt": "2026-11-01T22:00:00.000Z",
  "livro": { "id": 3, "titulo": "O Cortiço", "autor": "Aluísio Azevedo" }
}
```

### Validações

| Recurso | Campo | Regra |
|---|---|---|
| Livro | `titulo` | texto obrigatório, 2 a 150 caracteres |
| Livro | `autor` | texto obrigatório, 2 a 100 caracteres |
| Livro | `isbn` | texto com 10 ou 13 dígitos (sem traços), **único** (409) |
| Livro | `anoPublicacao` | inteiro, mínimo 1450, **não pode ser no futuro** |
| Livro | `quantidade` | inteiro de 0 a 100 (total de exemplares) |
| Cadastro | `nome` | texto obrigatório, 3 a 100 caracteres |
| Cadastro | `email` | e-mail válido, até 100 caracteres, **único** (409) |
| Cadastro | `senha` | texto, 6 a 50 caracteres |
| Empréstimo | `livroId` | inteiro positivo obrigatório |

- Números enviados como texto (`"2020"`) são **rejeitados** com 422 ("deve ser um número inteiro").
- Textos têm os espaços das pontas removidos.
- Campos desconhecidos são ignorados.
- No PUT todos os campos são obrigatórios. No PATCH só os enviados são validados, e é preciso enviar ao menos um.

---

## Endpoints

Legenda de acesso: **público** (sem token), **autenticado** (qualquer perfil), **admin**, **dono** (dono do recurso).

### Saúde

| Método | Rota | Acesso | Sucesso |
|---|---|---|---|
| GET | `/api/health` | público | 200 `{ "status": "ok" }` |

### Auth

| Método | Rota | Acesso | Sucesso | Erros |
|---|---|---|---|---|
| POST | `/api/auth/register` | público | 201 usuário (perfil leitor) | 400, 409, 422 |
| POST | `/api/auth/login` | público | 200 `{ token, tipo, expiraEm, usuario }` | 400, 401, 422 |
| GET | `/api/auth/me` | autenticado | 200 usuário logado | 401 |

### Usuários

| Método | Rota | Acesso | Sucesso | Erros |
|---|---|---|---|---|
| GET | `/api/usuarios` | admin | 200 lista | 401, 403 |
| GET | `/api/usuarios/:id` | admin ou o próprio | 200 | 400, 401, 403, 404 |
| DELETE | `/api/usuarios/:id` | admin ou o próprio | 204 (apaga também o histórico de devolvidos) | 400, 401, 403, 404, 409 |

### Livros

| Método | Rota | Acesso | Sucesso | Erros |
|---|---|---|---|---|
| GET | `/api/livros` | público | 200 lista | 400 |
| GET | `/api/livros/:id` | público | 200 | 400, 404 |
| POST | `/api/livros` | admin | 201 | 400, 401, 403, 409, 422 |
| PUT | `/api/livros/:id` | admin | 200 | 400, 401, 403, 404, 409, 422 |
| PATCH | `/api/livros/:id` | admin | 200 | 400, 401, 403, 404, 409, 422 |
| DELETE | `/api/livros/:id` | admin | 204 (apaga também o histórico de devolvidos) | 400, 401, 403, 404, 409 |

Filtros do `GET /api/livros` (podem ser combinados):

| Filtro | Exemplo | Comportamento |
|---|---|---|
| `autor` | `?autor=machado` | Busca parcial, sem diferenciar maiúsculas |
| `disponivel` | `?disponivel=true` | `true` ou `false`; outro valor → 400 |

### Empréstimos

| Método | Rota | Acesso | Sucesso | Erros |
|---|---|---|---|---|
| GET | `/api/emprestimos` | autenticado (leitor: os seus; admin: todos) | 200 lista | 400, 401 |
| GET | `/api/emprestimos/:id` | dono ou admin | 200 | 400, 401, 403, 404 |
| POST | `/api/emprestimos` | autenticado (cria para o usuário logado) | 201 | 400, 401, 404, 409, 422 |
| PATCH | `/api/emprestimos/:id/devolucao` | dono ou admin | 200 (`status: "devolvido"`) | 400, 401, 403, 404, 409 |
| DELETE | `/api/emprestimos/:id` | admin | 204 (se ativo, o exemplar volta a ficar disponível) | 400, 401, 403, 404 |

Filtro do `GET /api/emprestimos`: `?status=ativo` ou `?status=devolvido` (outro valor → 400).

Ordem das verificações no `POST /api/emprestimos`: payload (422), livro existe (404), estoque (409 "Livro indisponível"), limite do usuário (409 "Limite de 3...").

### Apoio a testes (somente fora de produção)

| Método | Rota | Acesso | Sucesso |
|---|---|---|---|
| POST | `/api/test/reset` | público | 204; apaga **tudo**, inclusive os usuários do seed |
| POST | `/api/test/seed` | público | 200; zera o banco e insere os dados fixos (pode chamar quantas vezes quiser) |

Com `NODE_ENV=production`, essas rotas respondem 404.

### Teardown: como apagar o que foi criado

| Criado com | Apagar com |
|---|---|
| `POST /api/livros` | `DELETE /api/livros/:id` (antes, devolva ou exclua os empréstimos **ativos** dele) |
| `POST /api/emprestimos` | `DELETE /api/emprestimos/:id` (admin) |
| `POST /api/auth/register` | `DELETE /api/usuarios/:id` (admin ou o próprio; sem empréstimos ativos) |

Ordem segura de teardown: **empréstimos → livros → usuários**.

---

## Dados do seed

### Usuários

| id | Nome | E-mail | Senha | Perfil | Observação |
|---|---|---|---|---|---|
| 1 | Administrador | `admin@biblioteca.com` | `Admin@123` | admin | |
| 2 | Leitor Padrão | `leitor@biblioteca.com` | `Leitor@123` | leitor | sem empréstimos |
| 3 | Leitor Dois | `leitor2@biblioteca.com` | `Leitor@123` | leitor | 1 empréstimo ativo (livro 3) |

### Livros

| id | Título | Autor | ISBN | Ano | Qtd. | Disponíveis |
|---|---|---|---|---|---|---|
| 1 | Dom Casmurro | Machado de Assis | 9788500000011 | 1899 | 3 | 3 |
| 2 | Memórias Póstumas de Brás Cubas | Machado de Assis | 9788500000028 | 1881 | 2 | 2 |
| 3 | O Cortiço | Aluísio Azevedo | 9788500000035 | 1890 | 2 | 1 (tem empréstimo ativo) |
| 4 | Vidas Secas | Graciliano Ramos | 9788500000042 | 1938 | 0 | **0 (indisponível)** |
| 5 | A Hora da Estrela | Clarice Lispector | 9788500000059 | 1977 | 5 | 5 |

### Empréstimos

| id | Usuário | Livro | Status |
|---|---|---|---|
| 1 | 3 (leitor2) | 3 (O Cortiço) | ativo |

---

## Páginas web e `data-testid`

Todas as páginas, exceto `/login`, exigem login. Sem token no `localStorage`, o usuário é redirecionado para `/login`. Se a API responder 401 (token inválido/expirado), a sessão é limpa e o usuário vai para `/login?expirado=1`.

As mensagens **não somem sozinhas** e não há animações. Mostrar uma mensagem de sucesso esconde a de erro, e vice-versa.

### Cabeçalho (todas as páginas logadas)

| data-testid | Elemento |
|---|---|
| `nav-livros` | Link "Livros" |
| `nav-meus-emprestimos` | Link "Meus empréstimos" |
| `usuario-logado` | Texto `Nome (perfil)`, ex.: `Leitor Padrão (leitor)` |
| `botao-sair` | Botão "Sair" (limpa o localStorage e vai para /login) |

### `/login`

| data-testid | Elemento |
|---|---|
| `login-form` | Formulário |
| `login-titulo` | Título "Entrar" |
| `login-email` | Campo e-mail |
| `login-senha` | Campo senha |
| `login-submit` | Botão "Entrar" |
| `mensagem-erro` | "E-mail ou senha inválidos", "Preencha e-mail e senha" ou "Sessão expirada. Faça login novamente." |

Após o login: salva `token` e `usuario` no `localStorage` e redireciona para `/livros`.

### `/livros`

| data-testid | Elemento |
|---|---|
| `livros-titulo-pagina` | Título da página |
| `filtro-autor` | Campo de filtro por autor |
| `filtro-disponivel` | Select: `""` (todos), `"true"`, `"false"` |
| `filtro-aplicar` | Botão "Filtrar" |
| `livros-tabela` | Tabela |
| `livros-corpo-tabela` | `<tbody>` da tabela |
| `livro-linha-{id}` | Linha do livro |
| `livro-titulo-{id}` | Célula do título |
| `livro-autor-{id}` | Célula do autor |
| `livro-disponibilidade-{id}` | Célula com `Disponível` ou `Indisponível` |
| `livro-link-{id}` | Link "Ver detalhes" |
| `livros-vazio` | Aviso "Nenhum livro encontrado." |
| `mensagem-sucesso` / `mensagem-erro` | Mensagens |

`{id}` é o id real do livro: um livro criado via API com id 7 aparece como `livro-linha-7`.

### `/livros/{id}` (detalhe)

| data-testid | Elemento |
|---|---|
| `voltar-livros` | Link de volta à lista |
| `livro-detalhe` | Seção com os dados (fica oculta se o livro não existir) |
| `livro-titulo` | Título |
| `livro-autor` | Autor |
| `livro-isbn` | ISBN |
| `livro-ano` | Ano de publicação |
| `livro-quantidade-disponivel` | Texto `N de M`, ex.: `0 de 1` |
| `livro-disponibilidade` | `Disponível` ou `Indisponível` |
| `botao-emprestar` | Botão "Emprestar" |
| `mensagem-sucesso` | `Empréstimo realizado com sucesso` |
| `mensagem-erro` | `Livro indisponível`, `Limite de 3 empréstimos ativos atingido`, `Livro não encontrado` |

O botão "Emprestar" fica **sempre habilitado**, inclusive para livros indisponíveis, para que seja possível testar a mensagem de erro. Depois de um empréstimo (ou de um 409), a página recarrega os dados do livro **antes** de mostrar a mensagem: quando ela aparece, a disponibilidade já está atualizada.

### `/meus-emprestimos`

| data-testid | Elemento |
|---|---|
| `emprestimos-titulo-pagina` | Título da página |
| `emprestimos-tabela` | Tabela |
| `emprestimos-corpo-tabela` | `<tbody>` da tabela |
| `emprestimo-linha-{id}` | Linha do empréstimo |
| `emprestimo-livro-{id}` | Título do livro |
| `emprestimo-autor-{id}` | Autor |
| `emprestimo-data-{id}` | Data do empréstimo (dd/mm/aaaa) |
| `emprestimo-data-devolucao-{id}` | Data da devolução ou `-` |
| `emprestimo-status-{id}` | `Ativo` ou `Devolvido` |
| `botao-devolver-{id}` | Botão "Devolver" (só existe para empréstimos ativos) |
| `emprestimos-vazio` | Aviso "Você não possui empréstimos." |
| `mensagem-sucesso` | `Livro devolvido com sucesso` |
| `mensagem-erro` | ex.: `Empréstimo já foi devolvido`, `Empréstimo não encontrado` |

`{id}` é o id do **empréstimo**, não do livro. A página mostra somente os empréstimos do usuário logado, mesmo para o admin.

### Dica: pular a tela de login nos testes

Como a sessão fica no `localStorage`, dá para logar via API e injetar o token antes de abrir a página:

```ts
const login = await request.post('/api/auth/login', { data: { email: 'leitor@biblioteca.com', senha: 'Leitor@123' } });
const { token, usuario } = await login.json();

await page.addInitScript(([t, u]) => {
  localStorage.setItem('token', t);
  localStorage.setItem('usuario', JSON.stringify(u));
}, [token, usuario]);

await page.goto('/livros');
```

---

## Sugestões de cenários

### Aula I: Automação de API (`APIRequestContext`)

**Caminho feliz**
1. `GET /api/health` retorna 200 e `{ status: "ok" }`.
2. `GET /api/livros` retorna 200, um array, e cada item tem todos os campos do formato de livro.
3. `GET /api/livros/1` retorna 200 com `titulo: "Dom Casmurro"` e `disponivel: true`.
4. `POST /api/livros` (admin) retorna 201; o corpo traz `id`, `createdAt` e os mesmos valores enviados; `quantidadeDisponivel` igual a `quantidade`.
5. Depois do POST, `GET /api/livros/:id` retorna exatamente o mesmo objeto.
6. `PUT /api/livros/:id` substitui todos os campos e `updatedAt` muda.
7. `PATCH /api/livros/:id` com só `{ "quantidade": 10 }` altera apenas esse campo.
8. `DELETE /api/livros/:id` retorna 204 sem corpo; o `GET` em seguida retorna 404.
9. `GET /api/livros?autor=machado` retorna apenas livros de Machado de Assis (2 no seed).
10. `GET /api/livros?disponivel=false` retorna só livros com `disponivel: false` (o "Vidas Secas" no seed).
11. `POST /api/auth/register` retorna 201 com `perfil: "leitor"` e **sem** campo de senha.
12. `POST /api/auth/login` retorna 200 com `token` (string não vazia), `tipo: "Bearer"` e `usuario.email` correto.
13. `POST /api/emprestimos` retorna 201 com `status: "ativo"` e `dataDevolucao: null`; o livro passa a ter `quantidadeDisponivel` reduzida em 1.
14. `PATCH /api/emprestimos/:id/devolucao` retorna 200 com `status: "devolvido"` e `dataDevolucao` preenchida; o estoque volta.

**Autenticação e autorização**
15. `POST /api/livros` sem token → 401 `Token não informado`.
16. `POST /api/livros` com token `abc` → 401 `Token inválido ou expirado`.
17. `POST /api/livros` com `Authorization: Token xyz` → 401 (formato errado).
18. `POST /api/livros` com token de leitor → 403.
19. `DELETE /api/emprestimos/:id` com token de leitor → 403.
20. Leitor faz `GET /api/emprestimos/1` (empréstimo do leitor2) → 403.
21. Leitor faz `GET /api/usuarios` → 403; admin → 200.
22. Login com senha errada → 401 `E-mail ou senha inválidos` (mesma mensagem para e-mail inexistente).
23. Leitor faz `GET /api/emprestimos` e só recebe os próprios; admin recebe todos.

**Validação de payload (422) e requisição malformada (400)**
24. `POST /api/livros` com `{}` → 422 com 5 itens em `detalhes`, um por campo.
25. `anoPublicacao` no ano seguinte → 422 com mensagem "não pode ser no futuro".
26. `anoPublicacao: "2020"` (texto) → 422 "deve ser um número inteiro".
27. `titulo: "A"` (1 caractere) → 422 de tamanho; testar também 151 caracteres.
28. `isbn: "123-456"` → 422.
29. `quantidade: -1` e `quantidade: 101` → 422 (valores de fronteira: 0 e 100 passam).
30. `PATCH` com corpo `{}` → 422 "Informe ao menos um campo...".
31. `PUT` com apenas o título → 422 listando os demais campos.
32. Cadastro com e-mail inválido e senha curta → 422 com 2 detalhes.
33. `POST /api/emprestimos` com `{ "livroId": "1" }` → 422.
34. JSON malformado no corpo → 400 `JSON inválido no corpo da requisição`.
35. `GET /api/livros/abc` → 400; `GET /api/livros/9999` → 404.
36. `GET /api/livros?disponivel=talvez` → 400.
37. Rota inexistente `GET /api/xyz` → 404 no formato padrão.

**Regras de negócio (409)**
38. `POST /api/livros` com ISBN `9788500000011` (já existe) → 409 `ISBN já cadastrado`.
39. Cadastro com e-mail já existente (inclusive com maiúsculas diferentes) → 409.
40. Emprestar o livro 4 (quantidade 0) → 409 `Livro indisponível`.
41. Leitor faz 3 empréstimos e tenta o 4º → 409 `Limite de 3 empréstimos ativos atingido`.
42. Devolver o mesmo empréstimo duas vezes → a segunda dá 409 `Empréstimo já foi devolvido`.
43. `DELETE /api/livros/3` (tem empréstimo ativo) → 409.
44. `PATCH /api/livros/3` com `quantidade: 0` → 409 (há 1 exemplar emprestado).
45. Livro com empréstimo **devolvido** pode ser excluído (204), e o empréstimo some junto (`GET` → 404).

**Contrato / formato**
46. Toda resposta de erro tem exatamente as chaves `erro` (string), `detalhes` (array) e `status` (igual ao status HTTP).
47. `GET /api/livros`, `GET /api/livros/:id`, `POST`, `PUT` e `PATCH` retornam o livro com o **mesmo conjunto de chaves**.
48. `createdAt`/`updatedAt` são datas ISO válidas.

**Uso dos endpoints de teste**
49. `POST /api/test/reset` seguido de `GET /api/livros` → `[]`; depois `POST /api/test/seed` → 5 livros.

### Aula II: Setup via API + ação na interface + teardown via API

Em todos: **setup** com `request` (login de admin, criação dos dados), **ação** com `page`, **teardown** com `request` (excluir empréstimos → livros → usuários).

1. **Emprestar pela tela**
   - Setup: criar livro com `quantidade: 1`.
   - Ação: logar como leitor, abrir `/livros/{id}`, clicar em `botao-emprestar`.
   - Validar: `mensagem-sucesso` = "Empréstimo realizado com sucesso"; `livro-disponibilidade` = "Indisponível"; `livro-quantidade-disponivel` = "0 de 1".
   - Validar via API: existe um empréstimo ativo do leitor para o livro.
   - Teardown: excluir o empréstimo e o livro.
2. **Livro sem estoque**
   - Setup: criar livro com `quantidade: 0`.
   - Ação: abrir o detalhe e clicar em Emprestar.
   - Validar: `mensagem-erro` = "Livro indisponível" e `mensagem-sucesso` oculta.
   - Teardown: excluir o livro.
3. **Livro aparece na listagem**
   - Setup: criar livro com título único (ex.: com timestamp).
   - Ação: abrir `/livros`.
   - Validar: `livro-linha-{id}` visível, com título, autor e "Disponível".
   - Teardown: excluir o livro.
4. **Filtros da listagem**
   - Setup: criar um livro disponível e um indisponível do mesmo autor inventado.
   - Ação: filtrar por esse autor e depois por "Indisponíveis".
   - Validar: as linhas exibidas batem com a API.
   - Teardown: excluir ambos.
5. **Devolver pela tela**
   - Setup: criar livro e criar o empréstimo via API com o token do leitor.
   - Ação: abrir `/meus-emprestimos`, clicar em `botao-devolver-{idEmprestimo}`.
   - Validar: "Livro devolvido com sucesso", `emprestimo-status-{id}` = "Devolvido", botão não existe mais.
   - Validar via API: o livro voltou a `disponivel: true`.
   - Teardown: excluir o livro (o histórico vai junto).
6. **Limite de 3 empréstimos**
   - Setup: criar 4 livros; via API, o leitor empresta 3 deles.
   - Ação: abrir o 4º livro e clicar em Emprestar.
   - Validar: "Limite de 3 empréstimos ativos atingido".
   - Teardown: excluir os 3 empréstimos e os 4 livros.
7. **Estado mudou depois que a página abriu**
   - Setup: criar livro com `quantidade: 1`.
   - Ação: abrir o detalhe (mostra "Disponível"); **via API**, outro usuário empresta o livro; clicar em Emprestar.
   - Validar: "Livro indisponível" e a disponibilidade já atualizada para "Indisponível".
   - Teardown: excluir empréstimo e livro.
8. **Usuário novo do zero**
   - Setup: `POST /api/auth/register` com e-mail único.
   - Ação: logar pela tela com esse usuário.
   - Validar: `usuario-logado` mostra o nome e "(leitor)"; `/meus-emprestimos` mostra `emprestimos-vazio`.
   - Teardown: `DELETE /api/usuarios/{id}`.
9. **Login inválido**
   - Ação: login com senha errada.
   - Validar: `mensagem-erro` = "E-mail ou senha inválidos" e a URL continua em `/login`.
   - Variação: campos vazios → "Preencha e-mail e senha".
10. **Login via token injetado**
    - Setup: login via API e injeção do token no `localStorage` (ver a dica acima).
    - Ação: abrir direto `/meus-emprestimos`, sem passar pela tela de login.
11. **Sessão inválida**
    - Setup: injetar `token = "invalido"` no `localStorage`.
    - Ação: abrir `/meus-emprestimos`.
    - Validar: redireciona para `/login?expirado=1` com "Sessão expirada. Faça login novamente."
12. **Livro excluído enquanto a tela estava aberta**
    - Setup: criar livro.
    - Ação: abrir o detalhe; excluir via API; recarregar a página.
    - Validar: `mensagem-erro` = "Livro não encontrado" e `livro-detalhe` oculto.
13. **Sair**
    - Ação: clicar em `botao-sair`.
    - Validar: vai para `/login`, `localStorage` sem token, e acessar `/livros` redireciona para `/login`.
