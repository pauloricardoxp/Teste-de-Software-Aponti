/**
 * Erro "conhecido" da aplicação.
 *
 * Sempre que uma regra falha (validação, permissão, recurso não encontrado...),
 * lançamos um AppError com o status HTTP correto. O middleware de erros
 * (src/middlewares/erros.ts) transforma esse objeto no formato padrão:
 *
 *   { "erro": "mensagem", "detalhes": [...], "status": 422 }
 */

/** Um item da lista "detalhes": qual campo falhou e por quê. */
export interface DetalheErro {
  campo: string;
  mensagem: string;
}

export class AppError extends Error {
  public readonly status: number;
  public readonly detalhes: DetalheErro[];

  constructor(status: number, mensagem: string, detalhes: DetalheErro[] = []) {
    super(mensagem);
    this.name = 'AppError';
    this.status = status;
    this.detalhes = detalhes;
  }
}

/*
 * Atalhos para os erros mais comuns. Deixam o código dos serviços mais legível:
 *   throw naoEncontrado('Livro não encontrado');
 */

/** 400 - requisição malformada (JSON quebrado, id que não é número, filtro inválido). */
export const requisicaoInvalida = (mensagem: string, detalhes: DetalheErro[] = []) =>
  new AppError(400, mensagem, detalhes);

/** 401 - não autenticado (sem token, token inválido/expirado, login errado). */
export const naoAutenticado = (mensagem: string) => new AppError(401, mensagem);

/** 403 - autenticado, mas sem permissão para a ação. */
export const semPermissao = (mensagem: string) => new AppError(403, mensagem);

/** 404 - recurso não existe. */
export const naoEncontrado = (mensagem: string) => new AppError(404, mensagem);

/** 409 - dados corretos, mas o estado atual do sistema impede a ação. */
export const conflito = (mensagem: string, detalhes: DetalheErro[] = []) =>
  new AppError(409, mensagem, detalhes);

/** 422 - dados do payload inválidos (campo faltando, tipo errado, tamanho...). */
export const dadosInvalidos = (detalhes: DetalheErro[]) =>
  new AppError(422, 'Dados inválidos', detalhes);
