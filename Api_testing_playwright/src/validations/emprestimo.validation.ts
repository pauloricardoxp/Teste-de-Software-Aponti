/**
 * Validações dos endpoints de empréstimos.
 *
 * Criação: { "livroId": 1 }  -> livroId é um inteiro positivo obrigatório.
 * Listagem: ?status=ativo ou ?status=devolvido (opcional).
 */
import { DetalheErro, requisicaoInvalida } from '../errors/AppError';
import { StatusEmprestimo } from '../models/emprestimo.model';
import { garantirObjeto, lancarSeHouverErros, lerQueryUnica, validarInteiro } from './validador';

export function validarCriacaoEmprestimo(corpoRecebido: unknown): { livroId: number } {
  const corpo = garantirObjeto(corpoRecebido);
  const detalhes: DetalheErro[] = [];

  const livroId = validarInteiro(corpo, 'livroId', detalhes, { min: 1, max: Number.MAX_SAFE_INTEGER });
  // Mensagem mais amigável para o caso de intervalo (ex.: livroId = 0)
  if (detalhes.length === 1 && detalhes[0].mensagem.includes('deve estar entre')) {
    detalhes[0].mensagem = "O campo 'livroId' deve ser um número inteiro positivo";
  }

  lancarSeHouverErros(detalhes);
  return { livroId: livroId! };
}

export function validarFiltrosEmprestimo(query: Record<string, unknown>): { status?: StatusEmprestimo } {
  const status = lerQueryUnica(query, 'status');
  if (status === undefined) return {};

  if (status !== 'ativo' && status !== 'devolvido') {
    throw requisicaoInvalida("Filtro 'status' inválido", [
      { campo: 'status', mensagem: "Use 'ativo' ou 'devolvido'" },
    ]);
  }
  return { status };
}
