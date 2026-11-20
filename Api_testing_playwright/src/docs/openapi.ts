/**
 * Especificação OpenAPI 3 da API, exibida pelo Swagger UI em /docs.
 *
 * Mantida "à mão" num objeto TypeScript para que os alunos vejam claramente
 * a relação entre a documentação e o código.
 */

/** Atalho: resposta de erro no formato padrão, com um exemplo. */
function erro(descricao: string, status: number, mensagem: string, detalhes: object[] = []) {
  return {
    description: descricao,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/Erro' },
        example: { erro: mensagem, detalhes, status },
      },
    },
  };
}

/** Atalho: resposta de sucesso com um schema. */
function ok(descricao: string, schema: object) {
  return { description: descricao, content: { 'application/json': { schema } } };
}

const ref = (nome: string) => ({ $ref: `#/components/schemas/${nome}` });
const lista = (nome: string) => ({ type: 'array', items: ref(nome) });
const parametroId = { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } };
const seguranca = [{ bearerAuth: [] }];
const corpo = (schema: object, exemplo: object) => ({
  required: true,
  content: { 'application/json': { schema, example: exemplo } },
});

/** Campos de entrada de um livro (usados no POST/PUT e, opcionais, no PATCH). */
const propriedadesLivro = {
  titulo: { type: 'string', minLength: 2, maxLength: 150 },
  autor: { type: 'string', minLength: 2, maxLength: 100 },
  isbn: { type: 'string', pattern: '^(\\d{10}|\\d{13})$', description: '10 ou 13 dígitos, único' },
  anoPublicacao: { type: 'integer', minimum: 1450, description: 'Não pode ser no futuro' },
  quantidade: { type: 'integer', minimum: 0, maximum: 100, description: 'Total de exemplares' },
};

const exemploLivro = {
  titulo: 'O Alienista',
  autor: 'Machado de Assis',
  isbn: '9788500000097',
  anoPublicacao: 1882,
  quantidade: 2,
};

// Erros reutilizados em vários endpoints
const e400Id = erro('Id inválido na URL', 400, "O parâmetro 'id' deve ser um número inteiro positivo", [
  { campo: 'id', mensagem: "Valor recebido: 'abc'" },
]);
const e401 = erro('Token ausente, inválido ou expirado', 401, 'Token não informado');
const e403Admin = erro('Usuário sem perfil admin', 403, 'Acesso negado: ação permitida apenas para o perfil admin');
const e404Livro = erro('Livro não encontrado', 404, 'Livro não encontrado');
const e404Emprestimo = erro('Empréstimo não encontrado', 404, 'Empréstimo não encontrado');
const e409Isbn = erro('ISBN já cadastrado', 409, 'ISBN já cadastrado', [
  { campo: 'isbn', mensagem: "O ISBN '9788500000011' já pertence ao livro de id 1" },
]);
const e422Livro = erro('Dados inválidos', 422, 'Dados inválidos', [
  { campo: 'titulo', mensagem: "O campo 'titulo' é obrigatório" },
  { campo: 'anoPublicacao', mensagem: "O campo 'anoPublicacao' não pode ser no futuro (máximo: 2026)" },
]);

export const especificacaoOpenApi = {
  openapi: '3.0.3',
  info: {
    title: 'Biblioteca API',
    version: '1.0.0',
    description:
      'API didática para aulas de automação de testes com Playwright.\n\n' +
      '**Autenticação:** faça login em `POST /api/auth/login`, copie o `token` e clique em **Authorize**.\n\n' +
      '**Usuários do seed:** `admin@biblioteca.com` / `Admin@123` e `leitor@biblioteca.com` / `Leitor@123`.\n\n' +
      '**Erros:** sempre no formato `{ "erro": "...", "detalhes": [...], "status": 422 }`.\n\n' +
      '**400 x 422 x 409:** 400 = requisição malformada (JSON quebrado, id ou filtro inválido); ' +
      '422 = dados do payload inválidos; 409 = dados certos, mas o estado do sistema impede a ação.',
  },
  servers: [{ url: '/' }],
  tags: [
    { name: 'Auth', description: 'Cadastro e login' },
    { name: 'Usuários', description: 'Consulta e exclusão de usuários' },
    { name: 'Livros', description: 'CRUD de livros' },
    { name: 'Empréstimos', description: 'Empréstimo e devolução de livros' },
    { name: 'Testes', description: 'Apoio a testes (desligado em produção)' },
    { name: 'Saúde', description: 'Verificação do servidor' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Erro: {
        type: 'object',
        required: ['erro', 'detalhes', 'status'],
        properties: {
          erro: { type: 'string', example: 'Dados inválidos' },
          detalhes: {
            type: 'array',
            items: {
              type: 'object',
              properties: { campo: { type: 'string' }, mensagem: { type: 'string' } },
            },
          },
          status: { type: 'integer', example: 422 },
        },
      },
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 2 },
          nome: { type: 'string', example: 'Leitor Padrão' },
          email: { type: 'string', example: 'leitor@biblioteca.com' },
          perfil: { type: 'string', enum: ['admin', 'leitor'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Cadastro: {
        type: 'object',
        required: ['nome', 'email', 'senha'],
        properties: {
          nome: { type: 'string', minLength: 3, maxLength: 100 },
          email: { type: 'string', format: 'email', maxLength: 100 },
          senha: { type: 'string', minLength: 6, maxLength: 50 },
        },
      },
      Login: {
        type: 'object',
        required: ['email', 'senha'],
        properties: { email: { type: 'string' }, senha: { type: 'string' } },
      },
      RespostaLogin: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          tipo: { type: 'string', example: 'Bearer' },
          expiraEm: { type: 'integer', example: 3600, description: 'Validade em segundos' },
          usuario: ref('Usuario'),
        },
      },
      LivroEntrada: {
        type: 'object',
        required: ['titulo', 'autor', 'isbn', 'anoPublicacao', 'quantidade'],
        properties: propriedadesLivro,
      },
      LivroParcial: {
        type: 'object',
        description: 'Mesmos campos do LivroEntrada, todos opcionais (envie ao menos um)',
        properties: propriedadesLivro,
      },
      Livro: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          titulo: { type: 'string', example: 'Dom Casmurro' },
          autor: { type: 'string', example: 'Machado de Assis' },
          isbn: { type: 'string', example: '9788500000011' },
          anoPublicacao: { type: 'integer', example: 1899 },
          quantidade: { type: 'integer', example: 3 },
          quantidadeDisponivel: { type: 'integer', example: 3, description: 'quantidade - empréstimos ativos' },
          disponivel: { type: 'boolean', example: true, description: 'quantidadeDisponivel > 0' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Emprestimo: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          usuarioId: { type: 'integer', example: 2 },
          livroId: { type: 'integer', example: 1 },
          status: { type: 'string', enum: ['ativo', 'devolvido'] },
          dataEmprestimo: { type: 'string', format: 'date-time' },
          dataDevolucao: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          livro: {
            type: 'object',
            properties: { id: { type: 'integer' }, titulo: { type: 'string' }, autor: { type: 'string' } },
          },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Saúde'],
        summary: 'Verifica se o servidor está no ar',
        responses: { 200: ok('Servidor no ar', { type: 'object', example: { status: 'ok' } }) },
      },
    },

    // ---------------- Auth ----------------
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Cadastra um novo usuário (sempre com perfil leitor)',
        requestBody: corpo(ref('Cadastro'), { nome: 'Maria Silva', email: 'maria@teste.com', senha: 'Senha@123' }),
        responses: {
          201: ok('Usuário criado', ref('Usuario')),
          400: erro('JSON malformado', 400, 'JSON inválido no corpo da requisição'),
          409: erro('E-mail já cadastrado', 409, 'E-mail já cadastrado', [
            { campo: 'email', mensagem: "O e-mail 'maria@teste.com' já está em uso" },
          ]),
          422: erro('Dados inválidos', 422, 'Dados inválidos', [
            { campo: 'email', mensagem: "O campo 'email' deve ser um e-mail válido" },
          ]),
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Autentica e devolve o token JWT no corpo',
        requestBody: corpo(ref('Login'), { email: 'admin@biblioteca.com', senha: 'Admin@123' }),
        responses: {
          200: ok('Login realizado', ref('RespostaLogin')),
          401: erro('Credenciais inválidas', 401, 'E-mail ou senha inválidos'),
          422: erro('Campos ausentes', 422, 'Dados inválidos', [
            { campo: 'senha', mensagem: "O campo 'senha' é obrigatório" },
          ]),
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Retorna o usuário dono do token',
        security: seguranca,
        responses: { 200: ok('Usuário logado', ref('Usuario')), 401: e401 },
      },
    },

    // ---------------- Usuários ----------------
    '/api/usuarios': {
      get: {
        tags: ['Usuários'],
        summary: 'Lista todos os usuários (admin)',
        security: seguranca,
        responses: { 200: ok('Lista de usuários', lista('Usuario')), 401: e401, 403: e403Admin },
      },
    },
    '/api/usuarios/{id}': {
      get: {
        tags: ['Usuários'],
        summary: 'Busca um usuário (admin ou o próprio)',
        security: seguranca,
        parameters: [parametroId],
        responses: {
          200: ok('Usuário', ref('Usuario')),
          400: e400Id,
          401: e401,
          403: erro('Outro usuário', 403, 'Acesso negado: você só pode acessar o seu próprio usuário'),
          404: erro('Não encontrado', 404, 'Usuário não encontrado'),
        },
      },
      delete: {
        tags: ['Usuários'],
        summary: 'Exclui um usuário e seu histórico (admin ou o próprio)',
        security: seguranca,
        parameters: [parametroId],
        responses: {
          204: { description: 'Excluído (sem corpo)' },
          400: e400Id,
          401: e401,
          403: erro('Outro usuário', 403, 'Acesso negado: você só pode acessar o seu próprio usuário'),
          404: erro('Não encontrado', 404, 'Usuário não encontrado'),
          409: erro('Possui empréstimo ativo', 409, 'Usuário possui 1 empréstimo(s) ativo(s) e não pode ser excluído'),
        },
      },
    },

    // ---------------- Livros ----------------
    '/api/livros': {
      get: {
        tags: ['Livros'],
        summary: 'Lista livros (público), com filtros opcionais',
        parameters: [
          { name: 'autor', in: 'query', schema: { type: 'string' }, description: 'Busca parcial, sem diferenciar maiúsculas' },
          { name: 'disponivel', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
        ],
        responses: {
          200: ok('Lista de livros', lista('Livro')),
          400: erro('Filtro inválido', 400, "Filtro 'disponivel' inválido", [
            { campo: 'disponivel', mensagem: "Use 'true' ou 'false'" },
          ]),
        },
      },
      post: {
        tags: ['Livros'],
        summary: 'Cria um livro (admin)',
        security: seguranca,
        requestBody: corpo(ref('LivroEntrada'), exemploLivro),
        responses: {
          201: ok('Livro criado', ref('Livro')),
          400: erro('JSON malformado', 400, 'JSON inválido no corpo da requisição'),
          401: e401,
          403: e403Admin,
          409: e409Isbn,
          422: e422Livro,
        },
      },
    },
    '/api/livros/{id}': {
      get: {
        tags: ['Livros'],
        summary: 'Busca um livro por id (público)',
        parameters: [parametroId],
        responses: { 200: ok('Livro', ref('Livro')), 400: e400Id, 404: e404Livro },
      },
      put: {
        tags: ['Livros'],
        summary: 'Substitui todos os campos do livro (admin)',
        security: seguranca,
        parameters: [parametroId],
        requestBody: corpo(ref('LivroEntrada'), exemploLivro),
        responses: {
          200: ok('Livro atualizado', ref('Livro')),
          400: e400Id,
          401: e401,
          403: e403Admin,
          404: e404Livro,
          409: e409Isbn,
          422: e422Livro,
        },
      },
      patch: {
        tags: ['Livros'],
        summary: 'Altera apenas os campos enviados (admin)',
        description:
          'Retorna 409 se o ISBN já existir ou se a nova quantidade for menor que o número de exemplares emprestados.',
        security: seguranca,
        parameters: [parametroId],
        requestBody: corpo(ref('LivroParcial'), { quantidade: 10 }),
        responses: {
          200: ok('Livro atualizado', ref('Livro')),
          400: e400Id,
          401: e401,
          403: e403Admin,
          404: e404Livro,
          409: e409Isbn,
          422: erro('Nenhum campo ou campo inválido', 422, 'Dados inválidos', [
            { campo: 'corpo', mensagem: 'Informe ao menos um campo para atualizar: titulo, autor, isbn, anoPublicacao, quantidade' },
          ]),
        },
      },
      delete: {
        tags: ['Livros'],
        summary: 'Exclui o livro e seu histórico de empréstimos devolvidos (admin)',
        security: seguranca,
        parameters: [parametroId],
        responses: {
          204: { description: 'Excluído (sem corpo)' },
          400: e400Id,
          401: e401,
          403: e403Admin,
          404: e404Livro,
          409: erro('Empréstimo ativo', 409, 'Livro possui 1 empréstimo(s) ativo(s) e não pode ser excluído'),
        },
      },
    },

    // ---------------- Empréstimos ----------------
    '/api/emprestimos': {
      get: {
        tags: ['Empréstimos'],
        summary: 'Lista empréstimos (leitor: os seus; admin: todos)',
        security: seguranca,
        parameters: [{ name: 'status', in: 'query', schema: { type: 'string', enum: ['ativo', 'devolvido'] } }],
        responses: {
          200: ok('Lista de empréstimos', lista('Emprestimo')),
          400: erro('Filtro inválido', 400, "Filtro 'status' inválido", [
            { campo: 'status', mensagem: "Use 'ativo' ou 'devolvido'" },
          ]),
          401: e401,
        },
      },
      post: {
        tags: ['Empréstimos'],
        summary: 'Empresta um livro para o usuário logado',
        security: seguranca,
        requestBody: corpo(
          { type: 'object', required: ['livroId'], properties: { livroId: { type: 'integer', minimum: 1 } } },
          { livroId: 1 },
        ),
        responses: {
          201: ok('Empréstimo criado', ref('Emprestimo')),
          401: e401,
          404: e404Livro,
          409: {
            description: 'Livro indisponível OU limite de 3 empréstimos ativos atingido (diferenciados pela mensagem)',
            content: {
              'application/json': {
                schema: ref('Erro'),
                examples: {
                  indisponivel: {
                    summary: 'Sem exemplares',
                    value: {
                      erro: 'Livro indisponível',
                      detalhes: [{ campo: 'livroId', mensagem: 'Não há exemplares disponíveis deste livro no momento' }],
                      status: 409,
                    },
                  },
                  limite: {
                    summary: 'Limite atingido',
                    value: {
                      erro: 'Limite de 3 empréstimos ativos atingido',
                      detalhes: [{ campo: 'usuarioId', mensagem: 'Devolva um livro antes de fazer um novo empréstimo' }],
                      status: 409,
                    },
                  },
                },
              },
            },
          },
          422: erro('livroId inválido', 422, 'Dados inválidos', [
            { campo: 'livroId', mensagem: "O campo 'livroId' é obrigatório" },
          ]),
        },
      },
    },
    '/api/emprestimos/{id}': {
      get: {
        tags: ['Empréstimos'],
        summary: 'Busca um empréstimo (dono ou admin)',
        security: seguranca,
        parameters: [parametroId],
        responses: {
          200: ok('Empréstimo', ref('Emprestimo')),
          400: e400Id,
          401: e401,
          403: erro('Empréstimo de outro usuário', 403, 'Acesso negado: este empréstimo pertence a outro usuário'),
          404: e404Emprestimo,
        },
      },
      delete: {
        tags: ['Empréstimos'],
        summary: 'Exclui um empréstimo (admin). Se estiver ativo, o exemplar volta a ficar disponível.',
        security: seguranca,
        parameters: [parametroId],
        responses: {
          204: { description: 'Excluído (sem corpo)' },
          400: e400Id,
          401: e401,
          403: e403Admin,
          404: e404Emprestimo,
        },
      },
    },
    '/api/emprestimos/{id}/devolucao': {
      patch: {
        tags: ['Empréstimos'],
        summary: 'Devolve o livro (dono ou admin)',
        security: seguranca,
        parameters: [parametroId],
        responses: {
          200: ok('Empréstimo devolvido', ref('Emprestimo')),
          400: e400Id,
          401: e401,
          403: erro('Empréstimo de outro usuário', 403, 'Acesso negado: este empréstimo pertence a outro usuário'),
          404: e404Emprestimo,
          409: erro('Já devolvido', 409, 'Empréstimo já foi devolvido'),
        },
      },
    },

    // ---------------- Testes ----------------
    '/api/test/reset': {
      post: {
        tags: ['Testes'],
        summary: 'Apaga todos os dados (inclusive usuários do seed)',
        responses: { 204: { description: 'Banco limpo (sem corpo)' } },
      },
    },
    '/api/test/seed': {
      post: {
        tags: ['Testes'],
        summary: 'Zera o banco e insere os dados fixos do seed',
        responses: { 200: ok('Resumo do que foi criado', { type: 'object' }) },
      },
    },
  },
};
