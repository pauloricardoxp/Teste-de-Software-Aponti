/**
 * "Banco de dados" em memória.
 *
 * Para manter o projeto simples (sem instalar banco nenhum), os dados ficam em
 * arrays dentro da memória do processo Node. Consequências importantes:
 *
 *  - Ao reiniciar o servidor, tudo é apagado e o seed roda de novo.
 *  - Os ids são números sequenciais (1, 2, 3...) e voltam a 1 após um reset.
 *
 * Somente os arquivos de src/models acessam este objeto diretamente.
 * O restante do código conversa com os models.
 */
import type { Usuario } from '../models/usuario.model';
import type { Livro } from '../models/livro.model';
import type { Emprestimo } from '../models/emprestimo.model';

export interface Tabelas {
  usuarios: Usuario[];
  livros: Livro[];
  emprestimos: Emprestimo[];
}

/** As "tabelas" do banco. */
export const banco: Tabelas = {
  usuarios: [],
  livros: [],
  emprestimos: [],
};

/** Próximo id de cada tabela (funciona como um AUTO_INCREMENT). */
const proximosIds: Record<keyof Tabelas, number> = {
  usuarios: 1,
  livros: 1,
  emprestimos: 1,
};

/** Gera o próximo id da tabela informada. */
export function gerarId(tabela: keyof Tabelas): number {
  const id = proximosIds[tabela];
  proximosIds[tabela] = id + 1;
  return id;
}

/** Apaga todos os dados e reinicia os contadores de id. */
export function limparBanco(): void {
  banco.usuarios = [];
  banco.livros = [];
  banco.emprestimos = [];
  proximosIds.usuarios = 1;
  proximosIds.livros = 1;
  proximosIds.emprestimos = 1;
}

/** Data/hora atual no formato ISO 8601 (ex.: "2026-11-01T22:30:00.000Z"). */
export function agora(): string {
  return new Date().toISOString();
}
