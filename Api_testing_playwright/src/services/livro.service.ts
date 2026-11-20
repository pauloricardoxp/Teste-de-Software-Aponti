/**
 * Serviço de livros: regras de negócio do CRUD.
 *
 * Regras que dependem do estado do banco (e por isso geram 409):
 *  - ISBN deve ser único;
 *  - livro com empréstimo ativo não pode ser excluído;
 *  - a quantidade total não pode ficar menor que os exemplares emprestados.
 */
import { conflito, naoEncontrado } from '../errors/AppError';
import { EmprestimoModel } from '../models/emprestimo.model';
import { DadosLivro, Livro, LivroModel } from '../models/livro.model';
import { FiltrosLivro } from '../validations/livro.validation';

/**
 * Formato do livro em TODAS as respostas da API.
 * Os campos quantidadeDisponivel e disponivel são calculados na hora.
 */
export interface LivroResposta {
  id: number;
  titulo: string;
  autor: string;
  isbn: string;
  anoPublicacao: number;
  quantidade: number;
  quantidadeDisponivel: number;
  disponivel: boolean;
  createdAt: string;
  updatedAt: string;
}

function contarAtivos(livroId: number): number {
  return EmprestimoModel.contar({ livroId, status: 'ativo' });
}

/** Monta o objeto de resposta a partir do registro do banco. */
export function formatarLivro(livro: Livro): LivroResposta {
  const quantidadeDisponivel = livro.quantidade - contarAtivos(livro.id);
  return {
    id: livro.id,
    titulo: livro.titulo,
    autor: livro.autor,
    isbn: livro.isbn,
    anoPublicacao: livro.anoPublicacao,
    quantidade: livro.quantidade,
    quantidadeDisponivel,
    disponivel: quantidadeDisponivel > 0,
    createdAt: livro.createdAt,
    updatedAt: livro.updatedAt,
  };
}

function buscarOuFalhar(id: number): Livro {
  const livro = LivroModel.buscarPorId(id);
  if (!livro) throw naoEncontrado('Livro não encontrado');
  return livro;
}

/** ISBN repetido -> 409. "idIgnorado" serve para o próprio livro numa atualização. */
function garantirIsbnUnico(isbn: string, idIgnorado?: number): void {
  const existente = LivroModel.buscarPorIsbn(isbn);
  if (existente && existente.id !== idIgnorado) {
    throw conflito('ISBN já cadastrado', [
      { campo: 'isbn', mensagem: `O ISBN '${isbn}' já pertence ao livro de id ${existente.id}` },
    ]);
  }
}

/** A nova quantidade total não pode ser menor que o número de exemplares emprestados. */
function garantirQuantidadeSuficiente(livroId: number, novaQuantidade: number): void {
  const ativos = contarAtivos(livroId);
  if (novaQuantidade < ativos) {
    throw conflito(
      `A quantidade não pode ser menor que o número de exemplares emprestados (${ativos})`,
      [{ campo: 'quantidade', mensagem: `Valor mínimo permitido no momento: ${ativos}` }],
    );
  }
}

export const LivroService = {
  listar(filtros: FiltrosLivro): LivroResposta[] {
    let livros = LivroModel.listar().map(formatarLivro);

    if (filtros.autor !== undefined) {
      // Busca parcial e sem diferenciar maiúsculas/minúsculas: "machado" encontra "Machado de Assis".
      const termo = filtros.autor.toLowerCase();
      livros = livros.filter((l) => l.autor.toLowerCase().includes(termo));
    }
    if (filtros.disponivel !== undefined) {
      livros = livros.filter((l) => l.disponivel === filtros.disponivel);
    }
    return livros;
  },

  buscar(id: number): LivroResposta {
    return formatarLivro(buscarOuFalhar(id));
  },

  criar(dados: DadosLivro): LivroResposta {
    garantirIsbnUnico(dados.isbn);
    return formatarLivro(LivroModel.criar(dados));
  },

  /** PUT: substitui todos os campos. */
  substituir(id: number, dados: DadosLivro): LivroResposta {
    buscarOuFalhar(id);
    garantirIsbnUnico(dados.isbn, id);
    garantirQuantidadeSuficiente(id, dados.quantidade);
    return formatarLivro(LivroModel.atualizar(id, dados)!);
  },

  /** PATCH: altera somente os campos enviados. */
  atualizarParcial(id: number, dados: Partial<DadosLivro>): LivroResposta {
    buscarOuFalhar(id);
    if (dados.isbn !== undefined) garantirIsbnUnico(dados.isbn, id);
    if (dados.quantidade !== undefined) garantirQuantidadeSuficiente(id, dados.quantidade);
    return formatarLivro(LivroModel.atualizar(id, dados)!);
  },

  excluir(id: number): void {
    buscarOuFalhar(id);

    const ativos = contarAtivos(id);
    if (ativos > 0) {
      throw conflito(`Livro possui ${ativos} empréstimo(s) ativo(s) e não pode ser excluído`);
    }

    // Sem empréstimos ativos: o histórico (devolvidos) é apagado junto com o livro.
    EmprestimoModel.excluirPorLivro(id);
    LivroModel.excluir(id);
  },
};
