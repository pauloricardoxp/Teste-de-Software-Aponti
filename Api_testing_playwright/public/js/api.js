/**
 * api.js - funções compartilhadas por todas as páginas.
 *
 *  - Guarda/lê a sessão (token e usuário) no localStorage.
 *  - Faz chamadas à API já enviando o token no cabeçalho Authorization.
 *  - Mostra mensagens de sucesso/erro na tela.
 *
 * Chaves usadas no localStorage (úteis nos testes):
 *   "token"   -> o JWT retornado pelo login
 *   "usuario" -> o objeto do usuário em JSON
 */
const Sessao = {
  salvar(token, usuario) {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
  },

  limpar() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },

  token() {
    return localStorage.getItem('token');
  },

  usuario() {
    try {
      return JSON.parse(localStorage.getItem('usuario'));
    } catch {
      return null;
    }
  },
};

const Api = {
  /**
   * Faz uma requisição à API e devolve { ok, status, dados }.
   * Se a API responder 401 numa página que já estava logada,
   * a sessão é limpa e o usuário volta para o login.
   */
  async requisicao(metodo, url, corpo) {
    const cabecalhos = { 'Content-Type': 'application/json' };
    const token = Sessao.token();
    if (token) cabecalhos.Authorization = 'Bearer ' + token;

    const resposta = await fetch(url, {
      method: metodo,
      headers: cabecalhos,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });

    // 204 não tem corpo
    const dados = resposta.status === 204 ? null : await resposta.json().catch(() => null);

    if (resposta.status === 401 && token) {
      Sessao.limpar();
      window.location.href = '/login?expirado=1';
    }

    return { ok: resposta.ok, status: resposta.status, dados };
  },

  get(url) {
    return this.requisicao('GET', url);
  },
  post(url, corpo) {
    return this.requisicao('POST', url, corpo);
  },
  patch(url, corpo) {
    return this.requisicao('PATCH', url, corpo);
  },
};

/**
 * Mensagens na tela. Cada página tem dois elementos fixos:
 *   [data-testid="mensagem-sucesso"] e [data-testid="mensagem-erro"]
 * Mostramos um e escondemos o outro. As mensagens NÃO somem sozinhas,
 * para não atrapalhar as verificações dos testes.
 */
const Mensagem = {
  sucesso(texto) {
    this._mostrar('mensagem-sucesso', texto);
    this._esconder('mensagem-erro');
  },
  erro(texto) {
    this._mostrar('mensagem-erro', texto);
    this._esconder('mensagem-sucesso');
  },
  limpar() {
    this._esconder('mensagem-sucesso');
    this._esconder('mensagem-erro');
  },
  _mostrar(testId, texto) {
    const el = document.querySelector(`[data-testid="${testId}"]`);
    el.textContent = texto;
    el.hidden = false;
  },
  _esconder(testId) {
    const el = document.querySelector(`[data-testid="${testId}"]`);
    el.textContent = '';
    el.hidden = true;
  },
};

/** Texto de erro amigável a partir da resposta da API. */
function mensagemDeErro(resposta) {
  return (resposta.dados && resposta.dados.erro) || `Erro inesperado (status ${resposta.status})`;
}

/** Cria um elemento HTML com atributos e texto (evita usar innerHTML com dados da API). */
function criarElemento(tag, atributos = {}, texto) {
  const el = document.createElement(tag);
  for (const [nome, valor] of Object.entries(atributos)) {
    el.setAttribute(nome, valor);
  }
  if (texto !== undefined) el.textContent = texto;
  return el;
}

/** Formata uma data ISO como dd/mm/aaaa. */
function formatarData(iso) {
  return iso ? new Date(iso).toLocaleDateString('pt-BR') : '-';
}
