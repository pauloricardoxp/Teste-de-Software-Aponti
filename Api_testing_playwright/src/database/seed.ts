/**
 * Seed: popula o banco com dados FIXOS e CONHECIDOS.
 *
 * Como o banco é zerado antes do seed, os ids são sempre os mesmos:
 *
 * Usuários
 *   id 1  admin@biblioteca.com   / Admin@123   (admin)
 *   id 2  leitor@biblioteca.com  / Leitor@123  (leitor)  -> sem empréstimos
 *   id 3  leitor2@biblioteca.com / Leitor@123  (leitor)  -> 1 empréstimo ativo (livro 3)
 *
 * Livros
 *   id 1  Dom Casmurro                      quantidade 3  -> disponível (3)
 *   id 2  Memórias Póstumas de Brás Cubas   quantidade 2  -> disponível (2)
 *   id 3  O Cortiço                         quantidade 2  -> disponível (1), tem empréstimo ativo
 *   id 4  Vidas Secas                       quantidade 0  -> INDISPONÍVEL
 *   id 5  A Hora da Estrela                 quantidade 5  -> disponível (5)
 *
 * Empréstimos
 *   id 1  leitor2 + livro 3, status ativo
 */
import { gerarHashSenha } from '../services/auth.service';
import { limparBanco } from './db';
import { UsuarioModel } from '../models/usuario.model';
import { LivroModel } from '../models/livro.model';
import { EmprestimoModel } from '../models/emprestimo.model';

export const USUARIOS_SEED = [
  { nome: 'Administrador', email: 'admin@biblioteca.com', senha: 'Admin@123', perfil: 'admin' as const },
  { nome: 'Leitor Padrão', email: 'leitor@biblioteca.com', senha: 'Leitor@123', perfil: 'leitor' as const },
  { nome: 'Leitor Dois', email: 'leitor2@biblioteca.com', senha: 'Leitor@123', perfil: 'leitor' as const },
];

export const LIVROS_SEED = [
  { titulo: 'Dom Casmurro', autor: 'Machado de Assis', isbn: '9788500000011', anoPublicacao: 1899, quantidade: 3 },
  { titulo: 'Memórias Póstumas de Brás Cubas', autor: 'Machado de Assis', isbn: '9788500000028', anoPublicacao: 1881, quantidade: 2 },
  { titulo: 'O Cortiço', autor: 'Aluísio Azevedo', isbn: '9788500000035', anoPublicacao: 1890, quantidade: 2 },
  { titulo: 'Vidas Secas', autor: 'Graciliano Ramos', isbn: '9788500000042', anoPublicacao: 1938, quantidade: 0 },
  { titulo: 'A Hora da Estrela', autor: 'Clarice Lispector', isbn: '9788500000059', anoPublicacao: 1977, quantidade: 5 },
];

/** Zera o banco e insere os dados fixos. Pode ser chamado quantas vezes quiser. */
export function popularBanco() {
  limparBanco();

  const usuarios = USUARIOS_SEED.map((u) =>
    UsuarioModel.criar({ nome: u.nome, email: u.email, senhaHash: gerarHashSenha(u.senha), perfil: u.perfil }),
  );

  const livros = LIVROS_SEED.map((l) => LivroModel.criar(l));

  const leitor2 = usuarios[2];
  const livroOCortico = livros[2];
  const emprestimos = [EmprestimoModel.criar({ usuarioId: leitor2.id, livroId: livroOCortico.id })];

  return {
    usuarios: usuarios.map((u) => ({ id: u.id, email: u.email, perfil: u.perfil })),
    livros: livros.map((l) => ({ id: l.id, titulo: l.titulo })),
    emprestimos: emprestimos.map((e) => ({ id: e.id, usuarioId: e.usuarioId, livroId: e.livroId, status: e.status })),
  };
}
