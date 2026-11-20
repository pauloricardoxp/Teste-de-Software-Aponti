/**
 * Rotas de livros (CRUD completo).
 *
 * Leitura (GET) é pública. Escrita (POST, PUT, PATCH, DELETE) exige token
 * de um usuário com perfil "admin":
 *   - sem token        -> 401
 *   - token de leitor  -> 403
 */
import { Router } from 'express';
import { exigePerfil, exigeToken } from '../middlewares/autenticacao';
import { LivroService } from '../services/livro.service';
import { validarFiltrosLivro, validarLivroCompleto, validarLivroParcial } from '../validations/livro.validation';
import { converterId } from '../validations/validador';

export const livrosRoutes = Router();

// Middlewares reutilizados nas rotas de escrita
const somenteAdmin = [exigeToken, exigePerfil('admin')] as const;

// GET /api/livros?autor=machado&disponivel=true -> 200 com a lista
livrosRoutes.get('/', (req, res) => {
  const filtros = validarFiltrosLivro(req.query);
  res.status(200).json(LivroService.listar(filtros));
});

// GET /api/livros/:id -> 200 com o livro
livrosRoutes.get('/:id', (req, res) => {
  const id = converterId(req.params.id);
  res.status(200).json(LivroService.buscar(id));
});

// POST /api/livros -> 201 com o livro criado (inclui id e createdAt)
livrosRoutes.post('/', ...somenteAdmin, (req, res) => {
  const dados = validarLivroCompleto(req.body);
  res.status(201).json(LivroService.criar(dados));
});

// PUT /api/livros/:id -> 200; substitui o livro inteiro (todos os campos obrigatórios)
livrosRoutes.put('/:id', ...somenteAdmin, (req, res) => {
  const id = converterId(req.params.id);
  const dados = validarLivroCompleto(req.body);
  res.status(200).json(LivroService.substituir(id, dados));
});

// PATCH /api/livros/:id -> 200; altera só os campos enviados
livrosRoutes.patch('/:id', ...somenteAdmin, (req, res) => {
  const id = converterId(req.params.id);
  const dados = validarLivroParcial(req.body);
  res.status(200).json(LivroService.atualizarParcial(id, dados));
});

// DELETE /api/livros/:id -> 204 sem corpo
livrosRoutes.delete('/:id', ...somenteAdmin, (req, res) => {
  const id = converterId(req.params.id);
  LivroService.excluir(id);
  res.status(204).send();
});
