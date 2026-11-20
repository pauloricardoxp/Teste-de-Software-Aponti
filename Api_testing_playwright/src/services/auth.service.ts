/**
 * Serviço de autenticação: cadastro, login e geração/verificação de tokens JWT.
 *
 * Como funciona o JWT nesta aplicação:
 *  1. O usuário faz login com e-mail e senha.
 *  2. A API devolve um token assinado contendo o id (sub) e o perfil do usuário.
 *  3. Nas próximas requisições o cliente envia: Authorization: Bearer <token>
 *  4. O middleware verifica a assinatura e a validade do token.
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { conflito, naoAutenticado } from '../errors/AppError';
import { Perfil, Usuario, UsuarioModel, UsuarioPublico, paraUsuarioPublico } from '../models/usuario.model';
import { DadosCadastro, DadosLogin } from '../validations/auth.validation';

/** "Custo" do bcrypt. Valores maiores = hash mais lento e mais seguro. 8 é suficiente para aula. */
const CUSTO_BCRYPT = 8;

export interface RespostaLogin {
  token: string;
  tipo: 'Bearer';
  expiraEm: number;
  usuario: UsuarioPublico;
}

export function gerarHashSenha(senha: string): string {
  return bcrypt.hashSync(senha, CUSTO_BCRYPT);
}

export function gerarToken(usuario: Usuario): string {
  return jwt.sign({ perfil: usuario.perfil }, config.jwtSecret, {
    subject: String(usuario.id),
    expiresIn: config.jwtExpiraEmSegundos,
  });
}

/**
 * Verifica o token e devolve o id e o perfil gravados nele.
 * Token inválido, adulterado ou expirado -> 401.
 */
export function verificarToken(token: string): { id: number; perfil: Perfil } {
  try {
    const conteudo = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
    return { id: Number(conteudo.sub), perfil: conteudo.perfil as Perfil };
  } catch {
    throw naoAutenticado('Token inválido ou expirado');
  }
}

export const AuthService = {
  /** Cadastro público: todo usuário novo é "leitor". */
  registrar(dados: DadosCadastro): UsuarioPublico {
    if (UsuarioModel.buscarPorEmail(dados.email)) {
      throw conflito('E-mail já cadastrado', [
        { campo: 'email', mensagem: `O e-mail '${dados.email}' já está em uso` },
      ]);
    }

    const usuario = UsuarioModel.criar({
      nome: dados.nome,
      email: dados.email,
      senhaHash: gerarHashSenha(dados.senha),
      perfil: 'leitor',
    });
    return paraUsuarioPublico(usuario);
  },

  login(dados: DadosLogin): RespostaLogin {
    const usuario = UsuarioModel.buscarPorEmail(dados.email);

    // Mesma mensagem para e-mail inexistente e senha errada:
    // assim não revelamos quais e-mails existem no sistema.
    if (!usuario || !bcrypt.compareSync(dados.senha, usuario.senhaHash)) {
      throw naoAutenticado('E-mail ou senha inválidos');
    }

    return {
      token: gerarToken(usuario),
      tipo: 'Bearer',
      expiraEm: config.jwtExpiraEmSegundos,
      usuario: paraUsuarioPublico(usuario),
    };
  },
};
