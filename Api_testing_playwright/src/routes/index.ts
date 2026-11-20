/**
 * Junta todas as rotas da API sob o prefixo /api (definido em app.ts).
 */
import { Router } from 'express';
import { config } from '../config';
import { authRoutes } from './auth.routes';
import { emprestimosRoutes } from './emprestimos.routes';
import { livrosRoutes } from './livros.routes';
import { testRoutes } from './test.routes';
import { usuariosRoutes } from './usuarios.routes';

export const rotasApi = Router();

// GET /api/health -> 200; útil para saber se o servidor está no ar
rotasApi.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

rotasApi.use('/auth', authRoutes);
rotasApi.use('/usuarios', usuariosRoutes);
rotasApi.use('/livros', livrosRoutes);
rotasApi.use('/emprestimos', emprestimosRoutes);

// Endpoints de apoio a testes: desligados em produção (respondem 404).
if (!config.ehProducao) {
  rotasApi.use('/test', testRoutes);
}
