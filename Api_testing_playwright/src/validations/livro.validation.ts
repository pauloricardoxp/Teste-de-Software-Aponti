/**
 * Validações de entrada dos endpoints de livros.
 *
 * Regras:
 *  - titulo:        texto de 2 a 150 caracteres
 *  - autor:         texto de 2 a 100 caracteres
 *  - isbn:          texto com 10 ou 13 dígitos numéricos (sem traços)
 *  - anoPublicacao: inteiro de 1450 até o ano atual (não pode ser no futuro)
 *  - quantidade:    inteiro de 0 a 100 (total de exemplares)
 *
 * A unicidade do ISBN NÃO é verificada aqui, e sim no serviço, porque depende
 * do estado do banco (e por isso gera 409, não 422).
 */
import { DetalheErro, requisicaoInvalida } from '../errors/AppError';
import { DadosLivro } from '../models/livro.model';
import {
  Corpo,
  ausente,
  garantirObjeto,
  lancarSeHouverErros,
  lerQueryUnica,
  validarInteiro,
  validarTexto,
} from './validador';

const CAMPOS_LIVRO: (keyof DadosLivro)[] = ['titulo', 'autor', 'isbn', 'anoPublicacao', 'quantidade'];
export const ANO_MINIMO = 1450;

/** Valida um único campo do livro, adicionando problemas em "detalhes". */
function validarCampoLivro(corpo: Corpo, campo: keyof DadosLivro, detalhes: DetalheErro[]) {
  switch (campo) {
    case 'titulo':
      return validarTexto(corpo, 'titulo', detalhes, { min: 2, max: 150 });

    case 'autor':
      return validarTexto(corpo, 'autor', detalhes, { min: 2, max: 100 });

    case 'isbn': {
      const valor = corpo.isbn;
      if (ausente(valor)) {
        detalhes.push({ campo: 'isbn', mensagem: "O campo 'isbn' é obrigatório" });
        return undefined;
      }
      if (typeof valor !== 'string') {
        detalhes.push({ campo: 'isbn', mensagem: "O campo 'isbn' deve ser um texto" });
        return undefined;
      }
      // ^\d{10}$ ou ^\d{13}$  -> exatamente 10 ou 13 dígitos
      if (!/^(\d{10}|\d{13})$/.test(valor)) {
        detalhes.push({
          campo: 'isbn',
          mensagem: "O campo 'isbn' deve conter 10 ou 13 dígitos numéricos, sem traços",
        });
        return undefined;
      }
      return valor;
    }

    case 'anoPublicacao': {
      const anoAtual = new Date().getFullYear();
      const valor = corpo.anoPublicacao;
      // Tratamos "no futuro" separadamente para ter uma mensagem mais clara.
      if (typeof valor === 'number' && Number.isInteger(valor) && valor > anoAtual) {
        detalhes.push({
          campo: 'anoPublicacao',
          mensagem: `O campo 'anoPublicacao' não pode ser no futuro (máximo: ${anoAtual})`,
        });
        return undefined;
      }
      return validarInteiro(corpo, 'anoPublicacao', detalhes, { min: ANO_MINIMO, max: anoAtual });
    }

    case 'quantidade':
      return validarInteiro(corpo, 'quantidade', detalhes, { min: 0, max: 100 });
  }
}

/**
 * POST e PUT: todos os campos são obrigatórios.
 * Retorna os dados já limpos (textos sem espaços nas pontas).
 */
export function validarLivroCompleto(corpoRecebido: unknown): DadosLivro {
  const corpo = garantirObjeto(corpoRecebido);
  const detalhes: DetalheErro[] = [];
  const dados: Partial<Record<keyof DadosLivro, unknown>> = {};

  for (const campo of CAMPOS_LIVRO) {
    dados[campo] = validarCampoLivro(corpo, campo, detalhes);
  }

  lancarSeHouverErros(detalhes);
  return dados as DadosLivro;
}

/**
 * PATCH: valida apenas os campos enviados. Exige ao menos um campo conhecido.
 */
export function validarLivroParcial(corpoRecebido: unknown): Partial<DadosLivro> {
  const corpo = garantirObjeto(corpoRecebido);
  const detalhes: DetalheErro[] = [];
  const dados: Partial<Record<keyof DadosLivro, unknown>> = {};

  const camposEnviados = CAMPOS_LIVRO.filter((campo) => corpo[campo] !== undefined);
  if (camposEnviados.length === 0) {
    detalhes.push({
      campo: 'corpo',
      mensagem: `Informe ao menos um campo para atualizar: ${CAMPOS_LIVRO.join(', ')}`,
    });
  }

  for (const campo of camposEnviados) {
    dados[campo] = validarCampoLivro(corpo, campo, detalhes);
  }

  lancarSeHouverErros(detalhes);
  return dados as Partial<DadosLivro>;
}

/** Filtros aceitos em GET /api/livros. */
export interface FiltrosLivro {
  autor?: string;
  disponivel?: boolean;
}

/**
 * Valida a query string da listagem. Filtro inválido gera 400.
 * Ex.: /api/livros?autor=machado&disponivel=true
 */
export function validarFiltrosLivro(query: Record<string, unknown>): FiltrosLivro {
  const filtros: FiltrosLivro = {};

  const autor = lerQueryUnica(query, 'autor');
  if (autor !== undefined && autor.trim() !== '') {
    filtros.autor = autor.trim();
  }

  const disponivel = lerQueryUnica(query, 'disponivel');
  if (disponivel !== undefined) {
    if (disponivel !== 'true' && disponivel !== 'false') {
      throw requisicaoInvalida("Filtro 'disponivel' inválido", [
        { campo: 'disponivel', mensagem: "Use 'true' ou 'false'" },
      ]);
    }
    filtros.disponivel = disponivel === 'true';
  }

  return filtros;
}
