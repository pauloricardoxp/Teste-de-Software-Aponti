/**
 * Validações de cadastro e login.
 *
 * Cadastro:
 *  - nome:  texto de 3 a 100 caracteres
 *  - email: formato de e-mail válido (até 100 caracteres)
 *  - senha: texto de 6 a 50 caracteres
 *
 * Login: apenas verifica se email e senha foram enviados como texto.
 * (Se estiverem errados, o serviço responde 401.)
 */
import { DetalheErro } from '../errors/AppError';
import { garantirObjeto, lancarSeHouverErros, validarTexto } from './validador';

/** Expressão regular simples para e-mail: algo@algo.algo */
const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
}

export interface DadosLogin {
  email: string;
  senha: string;
}

export function validarCadastro(corpoRecebido: unknown): DadosCadastro {
  const corpo = garantirObjeto(corpoRecebido);
  const detalhes: DetalheErro[] = [];

  const nome = validarTexto(corpo, 'nome', detalhes, { min: 3, max: 100 });

  let email = validarTexto(corpo, 'email', detalhes, { min: 1, max: 100 });
  if (email !== undefined && !FORMATO_EMAIL.test(email)) {
    detalhes.push({ campo: 'email', mensagem: "O campo 'email' deve ser um e-mail válido" });
    email = undefined;
  }

  validarTexto(corpo, 'senha', detalhes, { min: 6, max: 50 });

  lancarSeHouverErros(detalhes);
  // Daqui para baixo todos os campos são válidos (senão o erro já teria sido lançado).
  // A senha é usada exatamente como foi enviada (sem trim): espaços fazem parte dela.
  return { nome: nome!, email: email!.toLowerCase(), senha: corpo.senha as string };
}

export function validarLogin(corpoRecebido: unknown): DadosLogin {
  const corpo = garantirObjeto(corpoRecebido);
  const detalhes: DetalheErro[] = [];

  for (const campo of ['email', 'senha']) {
    const valor = corpo[campo];
    if (valor === undefined || valor === null || valor === '') {
      detalhes.push({ campo, mensagem: `O campo '${campo}' é obrigatório` });
    } else if (typeof valor !== 'string') {
      detalhes.push({ campo, mensagem: `O campo '${campo}' deve ser um texto` });
    }
  }

  lancarSeHouverErros(detalhes);
  return { email: (corpo.email as string).trim().toLowerCase(), senha: corpo.senha as string };
}
