/**
 * Ponto de entrada: popula o banco (fora de produção) e sobe o servidor HTTP.
 */
import { app } from './app';
import { config } from './config';
import { popularBanco } from './database/seed';

if (!config.ehProducao) {
  // O banco é em memória: a cada reinício ele começa vazio, então rodamos o seed.
  popularBanco();
  console.log('Seed aplicado: admin@biblioteca.com / Admin@123 e leitor@biblioteca.com / Leitor@123');
}

app.listen(config.porta, () => {
  const url = `http://localhost:${config.porta}`;
  console.log(`Servidor rodando em ${url}`);
  console.log(`  Interface web: ${url}/login`);
  console.log(`  Documentação:  ${url}/docs`);
});
