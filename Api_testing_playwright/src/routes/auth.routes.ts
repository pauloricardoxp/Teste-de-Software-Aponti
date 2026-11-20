/**
 * Rotas de autenticação.
 *
 * As rotas são "finas": recebem a requisição, chamam a validação e o serviço,
 * e devolvem a resposta com o status correto. Regras ficam nos serviços.
 */
import { Router } from 'express';
import { exigeToken, usuarioLogado } from '../middlewares/autenticacao';
import { AuthService } from '../services/auth.service';
import { validarCadastro, validarLogin } from '../validations/auth.validation';

export const authRoutes = Router();

// POST /api/auth/register -> 201 com o usuário criado (sempre perfil "leitor")
authRoutes.post('/register', (req, res) => {
  const dados = validarCadastro(req.body);
  const usuario = AuthService.registrar(dados);
  res.status(201).json(usuario);
});

// POST /api/auth/login -> 200 com { token, tipo, expiraEm, usuario }
authRoutes.post('/login', (req, res) => {
  const dados = validarLogin(req.body);
  res.status(200).json(AuthService.login(dados));
});

// GET /api/auth/me -> 200 com o usuário dono do token
authRoutes.get('/me', exigeToken, (req, res) => {
  res.status(200).json(usuarioLogado(req));
});
