/**
 * livros.js - lista os livros em uma tabela, com filtros por autor e disponibilidade.
 *
 * Cada linha recebe data-testid com o id real do livro, por exemplo:
 *   livro-linha-7, livro-titulo-7, livro-autor-7, livro-disponibilidade-7, livro-link-7
 */
if (exigirLogin()) {
  const corpoTabela = document.querySelector('[data-testid="livros-corpo-tabela"]');
  const avisoVazio = document.querySelector('[data-testid="livros-vazio"]');
  const campoAutor = document.querySelector('[data-testid="filtro-autor"]');
  const campoDisponivel = document.querySelector('[data-testid="filtro-disponivel"]');
  const formularioFiltros = document.querySelector('[data-testid="filtros-form"]');

  /** Monta a URL da API com os filtros preenchidos. */
  function montarUrl() {
    const parametros = new URLSearchParams();
    if (campoAutor.value.trim()) parametros.set('autor', campoAutor.value.trim());
    if (campoDisponivel.value) parametros.set('disponivel', campoDisponivel.value);
    const query = parametros.toString();
    return '/api/livros' + (query ? '?' + query : '');
  }

  function criarLinha(livro) {
    const linha = criarElemento('tr', { 'data-testid': `livro-linha-${livro.id}` });

    linha.append(
      criarElemento('td', { 'data-testid': `livro-titulo-${livro.id}` }, livro.titulo),
      criarElemento('td', { 'data-testid': `livro-autor-${livro.id}` }, livro.autor),
      criarElemento(
        'td',
        {
          'data-testid': `livro-disponibilidade-${livro.id}`,
          class: livro.disponivel ? 'status-disponivel' : 'status-indisponivel',
        },
        livro.disponivel ? 'Disponível' : 'Indisponível',
      ),
    );

    const celulaLink = criarElemento('td');
    celulaLink.append(criarElemento('a', { href: `/livros/${livro.id}`, 'data-testid': `livro-link-${livro.id}` }, 'Ver detalhes'));
    linha.append(celulaLink);

    return linha;
  }

  async function carregarLivros() {
    Mensagem.limpar();
    const resposta = await Api.get(montarUrl());

    corpoTabela.textContent = '';
    if (!resposta.ok) {
      Mensagem.erro(mensagemDeErro(resposta));
      return;
    }

    resposta.dados.forEach((livro) => corpoTabela.append(criarLinha(livro)));
    avisoVazio.hidden = resposta.dados.length > 0;
  }

  formularioFiltros.addEventListener('submit', (evento) => {
    evento.preventDefault();
    carregarLivros();
  });

  carregarLivros();
}
