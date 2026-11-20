/**
 * Model de Empréstimo: liga um usuário a um livro.
 *
 * Um empréstimo nasce com status "ativo" e passa para "devolvido"
 * quando o livro é devolvido (dataDevolucao é preenchida nesse momento).
 */
import { banco, gerarId, agora } from '../database/db';

export type StatusEmprestimo = 'ativo' | 'devolvido';

export interface Emprestimo {
  id: number;
  usuarioId: number;
  livroId: number;
  status: StatusEmprestimo;
  dataEmprestimo: string;
  dataDevolucao: string | null;
  createdAt: string;
}

/** Filtros opcionais para a listagem. */
export interface FiltroEmprestimo {
  usuarioId?: number;
  livroId?: number;
  status?: StatusEmprestimo;
}

export const EmprestimoModel = {
  listar(filtro: FiltroEmprestimo = {}): Emprestimo[] {
    return banco.emprestimos
      .filter((e) => filtro.usuarioId === undefined || e.usuarioId === filtro.usuarioId)
      .filter((e) => filtro.livroId === undefined || e.livroId === filtro.livroId)
      .filter((e) => filtro.status === undefined || e.status === filtro.status)
      .map((e) => ({ ...e }));
  },

  /** Conta quantos empréstimos atendem ao filtro (ex.: ativos de um usuário). */
  contar(filtro: FiltroEmprestimo): number {
    return this.listar(filtro).length;
  },

  buscarPorId(id: number): Emprestimo | undefined {
    const emprestimo = banco.emprestimos.find((e) => e.id === id);
    return emprestimo ? { ...emprestimo } : undefined;
  },

  criar(dados: { usuarioId: number; livroId: number }): Emprestimo {
    const dataAtual = agora();
    const emprestimo: Emprestimo = {
      id: gerarId('emprestimos'),
      usuarioId: dados.usuarioId,
      livroId: dados.livroId,
      status: 'ativo',
      dataEmprestimo: dataAtual,
      dataDevolucao: null,
      createdAt: dataAtual,
    };
    banco.emprestimos.push(emprestimo);
    return { ...emprestimo };
  },

  marcarComoDevolvido(id: number): Emprestimo | undefined {
    const emprestimo = banco.emprestimos.find((e) => e.id === id);
    if (!emprestimo) return undefined;
    emprestimo.status = 'devolvido';
    emprestimo.dataDevolucao = agora();
    return { ...emprestimo };
  },

  excluir(id: number): void {
    banco.emprestimos = banco.emprestimos.filter((e) => e.id !== id);
  },

  /** Apaga todo o histórico de um livro (usado ao excluir o livro). */
  excluirPorLivro(livroId: number): void {
    banco.emprestimos = banco.emprestimos.filter((e) => e.livroId !== livroId);
  },

  /** Apaga todo o histórico de um usuário (usado ao excluir o usuário). */
  excluirPorUsuario(usuarioId: number): void {
    banco.emprestimos = banco.emprestimos.filter((e) => e.usuarioId !== usuarioId);
  },
};
