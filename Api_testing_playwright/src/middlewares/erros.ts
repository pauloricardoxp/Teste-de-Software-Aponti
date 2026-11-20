/**
 * Tratamento centralizado de erros.
 *
 * Qualquer erro lançado em rotas, validações ou serviços chega aqui e é
 * convertido no formato padrão da API:
 *
 *   { "erro": "mensagem", "detalhes": [...], "status": 422 }
 */
import { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError, DetalheErro } from '../errors/AppError';

function responderErro(res: Parameters<RequestHandler>[1], status: number, erro: string, detalhes: DetalheErro[] = []) {
  res.status(status).json({ erro, detalhes, status });
}

/** Rota /api/... que não existe -> 404 no formato padrão. */
export const rotaNaoEncontrada: RequestHandler = (req, res) => {
  responderErro(res, 404, 'Rota não encontrada', [
    { campo: 'rota', mensagem: `${req.method} ${req.originalUrl}` },
  ]);
};

export const tratadorDeErros: ErrorRequestHandler = (err, _req, res, _next) => {
  // 1) Erros "conhecidos" lançados pela própria aplicação
  if (err instanceof AppError) {
    responderErro(res, err.status, err.message, err.detalhes);
    return;
  }

  // 2) JSON malformado no corpo (gerado pelo express.json())
  if (err?.type === 'entity.parse.failed') {
    responderErro(res, 400, 'JSON inválido no corpo da requisição', [
      { campo: 'corpo', mensagem: 'Verifique vírgulas, aspas e chaves do JSON enviado' },
    ]);
    return;
  }

  // 3) Qualquer outra coisa é um erro inesperado (bug)
  console.error('Erro inesperado:', err);
  responderErro(res, 500, 'Erro interno do servidor');
};
