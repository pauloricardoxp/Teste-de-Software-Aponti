/**
 * Configurações da aplicação.
 *
 * Os valores podem ser trocados por variáveis de ambiente, por exemplo:
 *   PORT=4000 npm run dev
 *
 * Se nada for informado, usamos valores padrão pensados para desenvolvimento.
 */
export const config = {
  /** Porta HTTP onde o servidor vai escutar. */
  porta: Number(process.env.PORT) || 3000,

  /** Segredo usado para assinar os tokens JWT. Em produção, nunca use o valor padrão! */
  jwtSecret: process.env.JWT_SECRET || 'segredo-de-desenvolvimento-nao-use-em-producao',

  /** Tempo de validade do token, em segundos (3600 = 1 hora). */
  jwtExpiraEmSegundos: Number(process.env.JWT_EXPIRA_EM) || 3600,

  /**
   * Em produção (NODE_ENV=production) os endpoints /api/test/* ficam desligados
   * e o seed automático não é executado.
   */
  ehProducao: process.env.NODE_ENV === 'production',
};
