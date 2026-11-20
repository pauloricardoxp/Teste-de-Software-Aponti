/**
 * Model de Usuário: define o formato do dado e as operações de acesso ao "banco".
 *
 * Regra de ouro: os models NÃO conhecem regras de negócio nem HTTP.
 * Eles apenas guardam, buscam, alteram e apagam dados.
 */
import { banco, gerarId, agora } from '../database/db';

export type Perfil = 'admin' | 'leitor';

/** Como o usuário fica guardado no banco (inclui o hash da senha). */
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senhaHash: string;
  perfil: Perfil;
  createdAt: string;
}

/** Como o usuário é devolvido pela API: igual ao do banco, mas SEM a senha. */
export type UsuarioPublico = Omit<Usuario, 'senhaHash'>;

/** Remove o campo senhaHash antes de enviar o usuário na resposta. */
export function paraUsuarioPublico(usuario: Usuario): UsuarioPublico {
  const { senhaHash, ...publico } = usuario;
  return publico;
}

export const UsuarioModel = {
  listar(): Usuario[] {
    // Devolvemos cópias para que ninguém altere o banco "sem querer".
    return banco.usuarios.map((u) => ({ ...u }));
  },

  buscarPorId(id: number): Usuario | undefined {
    const usuario = banco.usuarios.find((u) => u.id === id);
    return usuario ? { ...usuario } : undefined;
  },

  buscarPorEmail(email: string): Usuario | undefined {
    const usuario = banco.usuarios.find((u) => u.email === email.toLowerCase());
    return usuario ? { ...usuario } : undefined;
  },

  criar(dados: { nome: string; email: string; senhaHash: string; perfil: Perfil }): Usuario {
    const usuario: Usuario = {
      id: gerarId('usuarios'),
      nome: dados.nome,
      email: dados.email.toLowerCase(),
      senhaHash: dados.senhaHash,
      perfil: dados.perfil,
      createdAt: agora(),
    };
    banco.usuarios.push(usuario);
    return { ...usuario };
  },

  excluir(id: number): void {
    banco.usuarios = banco.usuarios.filter((u) => u.id !== id);
  },
};
