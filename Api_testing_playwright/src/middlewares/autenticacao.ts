/**
 * Middlewares de autenticação e autorização.
 *
 *  - exigeToken:  a rota precisa de um token válido. Sem token -> 401.
 *  - exigePerfil: a rota precisa de um perfil específico. Perfil errado -> 403.
 *
 * Uso em uma rota:
 *   router.post('/livros', exigeToken, exigePerfil('admin'), handler)
 *
 * A ordem importa: primeiro descobrimos QUEM é o usuário (401),
 * depois verificamos o que ele PODE fazer (403).
 */
import { NextFunction, Request, Response } from 'express';
import { naoAutenticado, semPermissao } from '../errors/AppError';
import { Perfil, UsuarioModel, UsuarioPublico, paraUsuarioPublico } from '../models/usuario.model';
import { verificarToken } from '../services/auth.service';

// Ensina o TypeScript que o objeto "req" pode carregar o usuário logado.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuario?: UsuarioPublico;
    }
  }
}

export function exigeToken(req: Request, _res: Response, next: NextFunction): void {
  const cabecalho = req.headers.authorization;

  if (!cabecalho) {
    throw naoAutenticado('Token não informado');
  }

  // Formato esperado: "Bearer eyJhbGciOi..."
  const [tipo, token] = cabecalho.split(' ');
  if (tipo !== 'Bearer' || !token) {
    throw naoAutenticado("Token mal formatado. Use o formato 'Bearer <token>'");
  }

  const { id } = verificarToken(token);

  // O usuário pode ter sido excluído depois que o token foi gerado.
  const usuario = UsuarioModel.buscarPorId(id);
  if (!usuario) {
    throw naoAutenticado('Usuário do token não existe mais');
  }

  req.usuario = paraUsuarioPublico(usuario);
  next();
}

export function exigePerfil(...perfisPermitidos: Perfil[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.usuario || !perfisPermitidos.includes(req.usuario.perfil)) {
      throw semPermissao(`Acesso negado: ação permitida apenas para o perfil ${perfisPermitidos.join(' ou ')}`);
    }
    next();
  };
}

/** Atalho para obter o usuário logado dentro das rotas protegidas. */
export function usuarioLogado(req: Request): UsuarioPublico {
  if (!req.usuario) throw naoAutenticado('Token não informado');
  return req.usuario;
}
