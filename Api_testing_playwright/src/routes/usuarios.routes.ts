/**
 * Rotas de usuários. Todas exigem token.
 * A listagem é exclusiva do admin; consulta e exclusão por id são do admin ou do próprio usuário.
 */
import { Router } from 'express';
import { exigePerfil, exigeToken, usuarioLogado } from '../middlewares/autenticacao';
import { UsuarioService } from '../services/usuario.service';
import { converterId } from '../validations/validador';

export const usuariosRoutes = Router();

usuariosRoutes.use(exigeToken);

// GET /api/usuarios -> 200 com a lista (somente admin)
usuariosRoutes.get('/', exigePerfil('admin'), (_req, res) => {
  res.status(200).json(UsuarioService.listar());
});

// GET /api/usuarios/:id -> 200 (admin ou o próprio)
usuariosRoutes.get('/:id', (req, res) => {
  const id = converterId(req.params.id);
  res.status(200).json(UsuarioService.buscar(id, usuarioLogado(req)));
});

// DELETE /api/usuarios/:id -> 204 sem corpo (admin ou o próprio)
usuariosRoutes.delete('/:id', (req, res) => {
  const id = converterId(req.params.id);
  UsuarioService.excluir(id, usuarioLogado(req));
  res.status(204).send();
});
