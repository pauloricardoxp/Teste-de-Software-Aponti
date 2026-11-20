/**
 * Serviço de empréstimos: as regras de negócio principais da biblioteca.
 *
 * Regras (todas geram 409, pois os dados estão certos mas o estado impede a ação):
 *  - livro sem exemplar disponível não pode ser emprestado  -> "Livro indisponível"
 *  - cada usuário pode ter no máximo 3 empréstimos ativos   -> "Limite de 3 empréstimos ativos atingido"
 *  - empréstimo já devolvido não pode ser devolvido de novo -> "Empréstimo já foi devolvido"
 *
 * Permissões:
 *  - leitor vê e devolve somente os próprios empréstimos;
 *  - admin vê e devolve qualquer empréstimo, e é o único que pode excluir.
 */
import { conflito, naoEncontrado, semPermissao } from '../errors/AppError';
import { Emprestimo, EmprestimoModel, StatusEmprestimo } from '../models/emprestimo.model';
import { LivroModel } from '../models/livro.model';
import { UsuarioPublico } from '../models/usuario.model';
import { formatarLivro } from './livro.service';

export const LIMITE_EMPRESTIMOS_ATIVOS = 3;

/** Formato do empréstimo em TODAS as respostas da API. */
export interface EmprestimoResposta extends Emprestimo {
  livro: { id: number; titulo: string; autor: string };
}

/** Acrescenta um resumo do livro, útil para exibir na tela sem outra requisição. */
function formatarEmprestimo(emprestimo: Emprestimo): EmprestimoResposta {
  const livro = LivroModel.buscarPorId(emprestimo.livroId);
  return {
    ...emprestimo,
    livro: {
      id: emprestimo.livroId,
      titulo: livro?.titulo ?? '',
      autor: livro?.autor ?? '',
    },
  };
}

/** Busca o empréstimo e verifica se o solicitante pode acessá-lo (404 e depois 403). */
function buscarComPermissao(id: number, solicitante: UsuarioPublico): Emprestimo {
  const emprestimo = EmprestimoModel.buscarPorId(id);
  if (!emprestimo) throw naoEncontrado('Empréstimo não encontrado');

  if (solicitante.perfil !== 'admin' && emprestimo.usuarioId !== solicitante.id) {
    throw semPermissao('Acesso negado: este empréstimo pertence a outro usuário');
  }
  return emprestimo;
}

export const EmprestimoService = {
  /** Leitor recebe só os seus; admin recebe todos. */
  listar(solicitante: UsuarioPublico, filtros: { status?: StatusEmprestimo }): EmprestimoResposta[] {
    const usuarioId = solicitante.perfil === 'admin' ? undefined : solicitante.id;
    return EmprestimoModel.listar({ usuarioId, status: filtros.status }).map(formatarEmprestimo);
  },

  buscar(id: number, solicitante: UsuarioPublico): EmprestimoResposta {
    return formatarEmprestimo(buscarComPermissao(id, solicitante));
  },

  /** O empréstimo é sempre criado para o usuário logado. */
  criar(solicitante: UsuarioPublico, livroId: number): EmprestimoResposta {
    const livro = LivroModel.buscarPorId(livroId);
    if (!livro) throw naoEncontrado('Livro não encontrado');

    if (!formatarLivro(livro).disponivel) {
      throw conflito('Livro indisponível', [
        { campo: 'livroId', mensagem: 'Não há exemplares disponíveis deste livro no momento' },
      ]);
    }

    const ativos = EmprestimoModel.contar({ usuarioId: solicitante.id, status: 'ativo' });
    if (ativos >= LIMITE_EMPRESTIMOS_ATIVOS) {
      throw conflito(`Limite de ${LIMITE_EMPRESTIMOS_ATIVOS} empréstimos ativos atingido`, [
        { campo: 'usuarioId', mensagem: 'Devolva um livro antes de fazer um novo empréstimo' },
      ]);
    }

    const emprestimo = EmprestimoModel.criar({ usuarioId: solicitante.id, livroId });
    return formatarEmprestimo(emprestimo);
  },

  devolver(id: number, solicitante: UsuarioPublico): EmprestimoResposta {
    const emprestimo = buscarComPermissao(id, solicitante);
    if (emprestimo.status === 'devolvido') {
      throw conflito('Empréstimo já foi devolvido');
    }
    return formatarEmprestimo(EmprestimoModel.marcarComoDevolvido(id)!);
  },

  /**
   * Exclusão (somente admin, verificado na rota). Se o empréstimo estiver ativo,
   * o exemplar volta automaticamente a ficar disponível, pois a disponibilidade
   * é calculada a partir dos empréstimos ativos.
   */
  excluir(id: number): void {
    const emprestimo = EmprestimoModel.buscarPorId(id);
    if (!emprestimo) throw naoEncontrado('Empréstimo não encontrado');
    EmprestimoModel.excluir(id);
  },
};
