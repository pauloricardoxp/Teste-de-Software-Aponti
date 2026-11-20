/**
 * Serviço de usuários: consulta e exclusão.
 *
 * Permissões:
 *  - admin pode ver/excluir qualquer usuário;
 *  - leitor só pode ver/excluir a si mesmo.
 *
 * A exclusão existe principalmente para o teardown dos testes:
 * um usuário criado no setup pode ser apagado ao final.
 */
import { conflito, naoEncontrado, semPermissao } from '../errors/AppError';
import { EmprestimoModel } from '../models/emprestimo.model';
import { UsuarioModel, UsuarioPublico, paraUsuarioPublico } from '../models/usuario.model';

/** Garante que o solicitante é admin ou o próprio usuário. */
function verificarAcesso(id: number, solicitante: UsuarioPublico): void {
  if (solicitante.perfil !== 'admin' && solicitante.id !== id) {
    throw semPermissao('Acesso negado: você só pode acessar o seu próprio usuário');
  }
}

export const UsuarioService = {
  listar(): UsuarioPublico[] {
    return UsuarioModel.listar().map(paraUsuarioPublico);
  },

  buscar(id: number, solicitante: UsuarioPublico): UsuarioPublico {
    verificarAcesso(id, solicitante);
    const usuario = UsuarioModel.buscarPorId(id);
    if (!usuario) throw naoEncontrado('Usuário não encontrado');
    return paraUsuarioPublico(usuario);
  },

  excluir(id: number, solicitante: UsuarioPublico): void {
    verificarAcesso(id, solicitante);
    const usuario = UsuarioModel.buscarPorId(id);
    if (!usuario) throw naoEncontrado('Usuário não encontrado');

    const ativos = EmprestimoModel.contar({ usuarioId: id, status: 'ativo' });
    if (ativos > 0) {
      throw conflito(`Usuário possui ${ativos} empréstimo(s) ativo(s) e não pode ser excluído`);
    }

    // Sem empréstimos ativos: apagamos o histórico (devolvidos) e o usuário.
    EmprestimoModel.excluirPorUsuario(id);
    UsuarioModel.excluir(id);
  },
};
