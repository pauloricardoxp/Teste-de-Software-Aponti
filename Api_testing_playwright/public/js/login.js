/**
 * login.js - envia e-mail e senha para a API e salva o token no localStorage.
 */
const formulario = document.querySelector('[data-testid="login-form"]');
const botaoEntrar = document.querySelector('[data-testid="login-submit"]');

// Veio redirecionado porque o token expirou?
if (new URLSearchParams(window.location.search).get('expirado')) {
  Mensagem.erro('Sessão expirada. Faça login novamente.');
}

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault(); // impede o recarregamento da página
  Mensagem.limpar();

  const email = document.querySelector('[data-testid="login-email"]').value;
  const senha = document.querySelector('[data-testid="login-senha"]').value;

  botaoEntrar.disabled = true;
  try {
    const resposta = await Api.post('/api/auth/login', { email, senha });

    if (resposta.ok) {
      Sessao.salvar(resposta.dados.token, resposta.dados.usuario);
      window.location.href = '/livros';
      return;
    }

    // 422 (campos vazios) traz o detalhe; 401 traz "E-mail ou senha inválidos"
    if (resposta.status === 422) {
      Mensagem.erro('Preencha e-mail e senha');
    } else {
      Mensagem.erro(mensagemDeErro(resposta));
    }
  } catch {
    Mensagem.erro('Não foi possível conectar ao servidor');
  } finally {
    botaoEntrar.disabled = false;
  }
});
