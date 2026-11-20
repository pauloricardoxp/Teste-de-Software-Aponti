/**
 * layout.js - cabeçalho e proteção das páginas que exigem login.
 *
 * Toda página protegida chama exigirLogin() logo no início:
 * se não houver token no localStorage, redireciona para /login.
 */
function exigirLogin() {
  if (!Sessao.token()) {
    window.location.href = '/login';
    return false;
  }
  montarCabecalho();
  return true;
}

/** Preenche o <header id="cabecalho"> com o menu e o usuário logado. */
function montarCabecalho() {
  const usuario = Sessao.usuario() || {};
  const cabecalho = document.getElementById('cabecalho');
  cabecalho.textContent = '';

  const marca = criarElemento('a', { href: '/livros', class: 'marca' }, 'Biblioteca');

  const nav = criarElemento('nav');
  nav.append(
    criarElemento('a', { href: '/livros', 'data-testid': 'nav-livros' }, 'Livros'),
    criarElemento('a', { href: '/meus-emprestimos', 'data-testid': 'nav-meus-emprestimos' }, 'Meus empréstimos'),
  );

  const areaUsuario = criarElemento('div', { class: 'area-usuario' });
  const nome = criarElemento(
    'span',
    { 'data-testid': 'usuario-logado' },
    `${usuario.nome || ''} (${usuario.perfil || ''})`,
  );
  const sair = criarElemento('button', { type: 'button', 'data-testid': 'botao-sair', class: 'botao-secundario' }, 'Sair');
  sair.addEventListener('click', () => {
    Sessao.limpar();
    window.location.href = '/login';
  });
  areaUsuario.append(nome, sair);

  cabecalho.append(marca, nav, areaUsuario);
}
