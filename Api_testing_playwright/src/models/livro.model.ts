/**
 * Model de Livro.
 *
 * No banco guardamos apenas a "quantidade" total de exemplares.
 * A quantidade disponível NÃO é guardada: ela é calculada pelo serviço
 * (quantidade total - empréstimos ativos). Assim os números nunca ficam
 * fora de sincronia.
 */
import { banco, gerarId, agora } from '../database/db';

export interface Livro {
  id: number;
  titulo: string;
  autor: string;
  isbn: string;
  anoPublicacao: number;
  quantidade: number;
  createdAt: string;
  updatedAt: string;
}

/** Campos que o cliente pode enviar ao criar/alterar um livro. */
export interface DadosLivro {
  titulo: string;
  autor: string;
  isbn: string;
  anoPublicacao: number;
  quantidade: number;
}

export const LivroModel = {
  listar(): Livro[] {
    return banco.livros.map((l) => ({ ...l }));
  },

  buscarPorId(id: number): Livro | undefined {
    const livro = banco.livros.find((l) => l.id === id);
    return livro ? { ...livro } : undefined;
  },

  buscarPorIsbn(isbn: string): Livro | undefined {
    const livro = banco.livros.find((l) => l.isbn === isbn);
    return livro ? { ...livro } : undefined;
  },

  criar(dados: DadosLivro): Livro {
    const dataAtual = agora();
    const livro: Livro = {
      id: gerarId('livros'),
      ...dados,
      createdAt: dataAtual,
      updatedAt: dataAtual,
    };
    banco.livros.push(livro);
    return { ...livro };
  },

  /** Altera somente os campos informados e atualiza o updatedAt. */
  atualizar(id: number, dados: Partial<DadosLivro>): Livro | undefined {
    const livro = banco.livros.find((l) => l.id === id);
    if (!livro) return undefined;
    Object.assign(livro, dados, { updatedAt: agora() });
    return { ...livro };
  },

  excluir(id: number): void {
    banco.livros = banco.livros.filter((l) => l.id !== id);
  },
};
