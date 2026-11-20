/**
 * livro.js - mostra o detalhe de um livro e permite emprestá-lo.
 *
 * O id do livro vem da própria URL: /livros/7 -> id 7.
 *
 * Observação didática: o botão "Emprestar" fica SEMPRE habilitado, mesmo
 * para livros indisponíveis. Assim é possível testar a mensagem de erro
 * que a API devolve (ex.: "Livro indisponível").
 */
if (exigirLogin()) {
  const livroId = window.location.pathname.split('/').filter(Boolean).pop();
  const secaoDetalhe = document.querySelector('[data-testid="livro-detalhe"]');
  const botaoEmprestar = document.querySelector('[data-testid="botao-emprestar"]');

  function preencher(testId, texto) {
    document.querySelector(`[data-testid="${testId}"]`).textContent = texto;
  }

  function exibirLivro(livro) {
    document.title = `${livro.titulo} - Biblioteca`;
    preencher('livro-titulo', livro.titulo);
    preencher('livro-autor', livro.autor);
    preencher('livro-isbn', livro.isbn);
    preencher('livro-ano', String(livro.anoPublicacao));
    preencher('livro-quantidade-disponivel', `${livro.quantidadeDisponivel} de ${livro.quantidade}`);

    const situacao = document.querySelector('[data-testid="livro-disponibilidade"]');
    situacao.textContent = livro.disponivel ? 'Disponível' : 'Indisponível';
    situacao.className = livro.disponivel ? 'status-disponivel' : 'status-indisponivel';

    secaoDetalhe.hidden = false;
  }

  /** Busca o livro na API. Retorna true se deu certo. */
  async function carregarLivro() {
    const resposta = await Api.get(`/api/livros/${livroId}`);
    if (!resposta.ok) {
      secaoDetalhe.hidden = true;
      Mensagem.erro(mensagemDeErro(resposta)); // ex.: "Livro não encontrado"
      return false;
    }
    exibirLivro(resposta.dados);
    return true;
  }

  botaoEmprestar.addEventListener('click', async () => {
    Mensagem.limpar();
    botaoEmprestar.disabled = true; // evita clique duplo enquanto a requisição está em andamento

    try {
      const resposta = await Api.post('/api/emprestimos', { livroId: Number(livroId) });

      if (resposta.ok) {
        // Atualiza a disponibilidade na tela ANTES de mostrar a mensagem.
        // Assim, quando a mensagem aparecer, a tela já está consistente.
        await carregarLivro();
        Mensagem.sucesso('Empréstimo realizado com sucesso');
      } else {
        // 409 -> "Livro indisponível" ou "Limite de 3 empréstimos ativos atingido".
        // Recarregamos o livro porque a disponibilidade pode ter mudado desde que a página abriu.
        if (resposta.status === 409) await carregarLivro();
        Mensagem.erro(mensagemDeErro(resposta));
      }
    } catch {
      Mensagem.erro('Não foi possível conectar ao servidor');
    } finally {
      botaoEmprestar.disabled = false;
    }
  });

  carregarLivro();
}
