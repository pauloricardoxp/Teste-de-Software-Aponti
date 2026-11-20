/**
 * Rotas de APOIO A TESTES. Só são registradas fora de produção (ver routes/index.ts).
 *
 * Não exigem token, para que a suíte de testes consiga preparar o ambiente
 * mesmo quando nenhum usuário existe.
 */
import { Router } from 'express';
import { limparBanco } from '../database/db';
import { popularBanco } from '../database/seed';

export const testRoutes = Router();

// POST /api/test/reset -> 204; apaga TUDO (inclusive os usuários do seed)
testRoutes.post('/reset', (_req, res) => {
  limparBanco();
  res.status(204).send();
});

// POST /api/test/seed -> 200; zera o banco e insere os dados fixos (idempotente)
testRoutes.post('/seed', (_req, res) => {
  const resumo = popularBanco();
  res.status(200).json({ mensagem: 'Banco populado com os dados de seed', ...resumo });
});
