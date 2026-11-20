/**
 * Rotas de empréstimos. Todas exigem token.
 */
import { Router } from 'express';
import { exigePerfil, exigeToken, usuarioLogado } from '../middlewares/autenticacao';
import { EmprestimoService } from '../services/emprestimo.service';
import { validarCriacaoEmprestimo, validarFiltrosEmprestimo } from '../validations/emprestimo.validation';
import { converterId } from '../validations/validador';

export const emprestimosRoutes = Router();

emprestimosRoutes.use(exigeToken);

// GET /api/emprestimos?status=ativo -> 200 (leitor: só os seus; admin: todos)
emprestimosRoutes.get('/', (req, res) => {
  const filtros = validarFiltrosEmprestimo(req.query);
  res.status(200).json(EmprestimoService.listar(usuarioLogado(req), filtros));
});

// GET /api/emprestimos/:id -> 200 (dono ou admin)
emprestimosRoutes.get('/:id', (req, res) => {
  const id = converterId(req.params.id);
  res.status(200).json(EmprestimoService.buscar(id, usuarioLogado(req)));
});

// POST /api/emprestimos { livroId } -> 201 com o empréstimo criado para o usuário logado
emprestimosRoutes.post('/', (req, res) => {
  const { livroId } = validarCriacaoEmprestimo(req.body);
  res.status(201).json(EmprestimoService.criar(usuarioLogado(req), livroId));
});

// PATCH /api/emprestimos/:id/devolucao -> 200 com status "devolvido" (dono ou admin)
emprestimosRoutes.patch('/:id/devolucao', (req, res) => {
  const id = converterId(req.params.id);
  res.status(200).json(EmprestimoService.devolver(id, usuarioLogado(req)));
});

// DELETE /api/emprestimos/:id -> 204 (somente admin; usado no teardown)
emprestimosRoutes.delete('/:id', exigePerfil('admin'), (req, res) => {
  const id = converterId(req.params.id);
  EmprestimoService.excluir(id);
  res.status(204).send();
});
