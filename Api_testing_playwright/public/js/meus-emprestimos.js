/**
 * meus-emprestimos.js - lista os empréstimos do usuário logado e permite devolver.
 *
 * Cada linha recebe data-testid com o id real do EMPRÉSTIMO, por exemplo:
 *   emprestimo-linha-12, emprestimo-livro-12, emprestimo-status-12, botao-devolver-12
 *
 * Observação: a API devolve TODOS os empréstimos quando o usuário é admin.
 * Aqui filtramos pelo id do usuário logado, porque a página é "Meus" empréstimos.
 */
if (exigirLogin()) {
  const usuario = Sessao.usuario();
  const corpoTabela = document.querySelector('[data-testid="emprestimos-corpo-tabela"]');
  const avisoVazio = document.querySelector('[data-testid="emprestimos-vazio"]');

  function criarLinha(emprestimo) {
    const id = emprestimo.id;
    const ativo = emprestimo.status === 'ativo';
    const linha = criarElemento('tr', { 'data-testid': `emprestimo-linha-${id}` });

    linha.append(
      criarElemento('td', { 'data-testid': `emprestimo-livro-${id}` }, emprestimo.livro.titulo),
      criarElemento('td', { 'data-testid': `emprestimo-autor-${id}` }, emprestimo.livro.autor),
      criarElemento('td', { 'data-testid': `emprestimo-data-${id}` }, formatarData(emprestimo.dataEmprestimo)),
      criarElemento('td', { 'data-testid': `emprestimo-data-devolucao-${id}` }, formatarData(emprestimo.dataDevolucao)),
      criarElemento(
        'td',
        { 'data-testid': `emprestimo-status-${id}`, class: ativo ? 'status-ativo' : 'status-devolvido' },
        ativo ? 'Ativo' : 'Devolvido',
      ),
    );

    const celulaAcao = criarElemento('td');
    if (ativo) {
      const botao = criarElemento('button', { type: 'button', 'data-testid': `botao-devolver-${id}` }, 'Devolver');
      botao.addEventListener('click', () => devolver(id, botao));
      celulaAcao.append(botao);
    }
    linha.append(celulaAcao);

    return linha;
  }

  async function carregarEmprestimos() {
    const resposta = await Api.get('/api/emprestimos');
    corpoTabela.textContent = '';

    if (!resposta.ok) {
      Mensagem.erro(mensagemDeErro(resposta));
      return;
    }

    const meus = resposta.dados.filter((e) => e.usuarioId === usuario.id);
    meus.forEach((emprestimo) => corpoTabela.append(criarLinha(emprestimo)));
    avisoVazio.hidden = meus.length > 0;
  }

  async function devolver(id, botao) {
    Mensagem.limpar();
    botao.disabled = true;

    try {
      const resposta = await Api.patch(`/api/emprestimos/${id}/devolucao`);
      if (resposta.ok) {
        // Recarrega a tabela antes de exibir a mensagem (tela consistente).
        await carregarEmprestimos();
        Mensagem.sucesso('Livro devolvido com sucesso');
      } else {
        // ex.: 409 "Empréstimo já foi devolvido" ou 404 se foi excluído via API
        Mensagem.erro(mensagemDeErro(resposta));
        botao.disabled = false;
      }
    } catch {
      Mensagem.erro('Não foi possível conectar ao servidor');
      botao.disabled = false;
    }
  }

  carregarEmprestimos();
}
