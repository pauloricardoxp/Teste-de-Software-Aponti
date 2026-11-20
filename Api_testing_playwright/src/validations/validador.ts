/**
 * Funções auxiliares de validação.
 *
 * Ideia geral: cada função verifica UM campo e, se encontrar problema,
 * adiciona uma mensagem na lista "detalhes". No final, se a lista não
 * estiver vazia, lançamos um erro 422 com todos os problemas de uma vez.
 * Assim o cliente descobre todos os erros numa única requisição.
 */
import { DetalheErro, dadosInvalidos, requisicaoInvalida } from '../errors/AppError';

/** Um objeto qualquer vindo do corpo da requisição. */
export type Corpo = Record<string, unknown>;

/**
 * Garante que o corpo da requisição é um objeto JSON (e não um array, número etc.).
 * Corpo ausente vira {} para que os campos obrigatórios sejam apontados no 422.
 */
export function garantirObjeto(corpo: unknown): Corpo {
  if (corpo === undefined || corpo === null) return {};
  if (typeof corpo !== 'object' || Array.isArray(corpo)) {
    throw requisicaoInvalida('O corpo da requisição deve ser um objeto JSON');
  }
  return corpo as Corpo;
}

/** Retorna true quando o campo não foi enviado (undefined ou null). */
export function ausente(valor: unknown): boolean {
  return valor === undefined || valor === null;
}

/**
 * Valida um campo de texto.
 * Retorna o texto sem espaços nas pontas, ou undefined se houve erro.
 */
export function validarTexto(
  corpo: Corpo,
  campo: string,
  detalhes: DetalheErro[],
  opcoes: { min: number; max: number },
): string | undefined {
  const valor = corpo[campo];

  if (ausente(valor)) {
    detalhes.push({ campo, mensagem: `O campo '${campo}' é obrigatório` });
    return undefined;
  }
  if (typeof valor !== 'string') {
    detalhes.push({ campo, mensagem: `O campo '${campo}' deve ser um texto` });
    return undefined;
  }

  const texto = valor.trim();
  if (texto.length === 0) {
    detalhes.push({ campo, mensagem: `O campo '${campo}' é obrigatório` });
    return undefined;
  }
  if (texto.length < opcoes.min || texto.length > opcoes.max) {
    detalhes.push({
      campo,
      mensagem: `O campo '${campo}' deve ter entre ${opcoes.min} e ${opcoes.max} caracteres`,
    });
    return undefined;
  }
  return texto;
}

/**
 * Valida um número inteiro dentro de um intervalo.
 * Atenção: o texto "10" NÃO é aceito; o JSON deve trazer o número 10.
 */
export function validarInteiro(
  corpo: Corpo,
  campo: string,
  detalhes: DetalheErro[],
  opcoes: { min: number; max: number },
): number | undefined {
  const valor = corpo[campo];

  if (ausente(valor)) {
    detalhes.push({ campo, mensagem: `O campo '${campo}' é obrigatório` });
    return undefined;
  }
  if (typeof valor !== 'number' || !Number.isInteger(valor)) {
    detalhes.push({ campo, mensagem: `O campo '${campo}' deve ser um número inteiro` });
    return undefined;
  }
  if (valor < opcoes.min || valor > opcoes.max) {
    detalhes.push({
      campo,
      mensagem: `O campo '${campo}' deve estar entre ${opcoes.min} e ${opcoes.max}`,
    });
    return undefined;
  }
  return valor;
}

/** Se houver algum problema na lista, interrompe com erro 422. */
export function lancarSeHouverErros(detalhes: DetalheErro[]): void {
  if (detalhes.length > 0) {
    throw dadosInvalidos(detalhes);
  }
}

/**
 * Converte o ":id" da URL em número. Ids inválidos (ex.: "abc", "-1", "1.5")
 * geram 400, pois a própria URL está malformada.
 */
export function converterId(valor: string, nome = 'id'): number {
  if (!/^\d+$/.test(valor) || Number(valor) < 1) {
    throw requisicaoInvalida(`O parâmetro '${nome}' deve ser um número inteiro positivo`, [
      { campo: nome, mensagem: `Valor recebido: '${valor}'` },
    ]);
  }
  return Number(valor);
}

/**
 * Lê um parâmetro de query string que deve aparecer no máximo uma vez.
 * Ex.: ?autor=Machado  -> "Machado"
 *      ?autor=a&autor=b -> erro 400
 */
export function lerQueryUnica(query: Record<string, unknown>, nome: string): string | undefined {
  const valor = query[nome];
  if (valor === undefined) return undefined;
  if (typeof valor !== 'string') {
    throw requisicaoInvalida(`O filtro '${nome}' deve ser informado apenas uma vez`, [
      { campo: nome, mensagem: 'Informe um único valor' },
    ]);
  }
  return valor;
}
