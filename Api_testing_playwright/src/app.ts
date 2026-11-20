/**
 * Monta a aplicação Express: API, documentação (Swagger) e páginas web.
 *
 * Separado do server.ts para deixar claro o que é "configuração da aplicação"
 * e o que é "subir o servidor numa porta".
 */
import path from 'path';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { especificacaoOpenApi } from './docs/openapi';
import { rotaNaoEncontrada, tratadorDeErros } from './middlewares/erros';
import { rotasApi } from './routes';

export const app = express();

/** Pasta com os arquivos HTML, CSS e JS do front-end. */
const pastaPublica = path.join(__dirname, '..', 'public');

// 1) Lê corpos JSON das requisições (req.body)
app.use(express.json());

// 2) API
app.use('/api', rotasApi);
app.use('/api', rotaNaoEncontrada); // qualquer /api/... que não casou acima

// 3) Documentação: Swagger UI em /docs e o JSON da especificação em /docs.json
app.get('/docs.json', (_req, res) => {
  res.json(especificacaoOpenApi);
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(especificacaoOpenApi, { customSiteTitle: 'Biblioteca API' }));

// 4) Páginas web (URLs "amigáveis" apontando para os arquivos HTML)
const pagina = (arquivo: string) => (_req: express.Request, res: express.Response) =>
  res.sendFile(path.join(pastaPublica, arquivo));

app.get('/', (_req, res) => res.redirect('/livros'));
app.get('/login', pagina('login.html'));
app.get('/livros', pagina('livros.html'));
app.get('/livros/:id', pagina('livro.html'));
app.get('/meus-emprestimos', pagina('meus-emprestimos.html'));

// 5) Arquivos estáticos (css, js)
app.use(express.static(pastaPublica));

// 6) Tratamento de erros: sempre por último
app.use(tratadorDeErros);
