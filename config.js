// Configuração da aplicação Check-in System
// Detecta automaticamente ambiente de produção vs desenvolvimento

const CONFIG = (function () {
  // Detectar se estamos em produção
  const isProduction =
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1" &&
    !window.location.hostname.includes("localhost");

  console.log(
    "🌍 Ambiente detectado:",
    isProduction ? "PRODUÇÃO" : "DESENVOLVIMENTO"
  );
  console.log("🏠 Hostname:", window.location.hostname);

  if (isProduction) {
    // Configurações para produção (Hostinger)
    return {
      // URLs da API
      API_BASE: "", // URL relativa em produção
      CLICKUP_AUTH_URL: "https://app.clickup.com/api",
      CLICKUP_TOKEN_URL: "https://api.clickup.com/api/v2/oauth/token",
      CLICKUP_API_BASE: "https://api.clickup.com/api/v2",

      // Configurações OAuth
      CLICKUP_CLIENT_ID: "CARREGANDO...", // Será carregado via /api/config
      CLICKUP_CLIENT_SECRET: "CARREGANDO...", // Será carregado via /api/config
      REDIRECT_URI: window.location.origin + "/auth-callback.html",
      SCOPE: "read",

      // Configurações da aplicação
      CLICKUP_LIST_ID: "YOUR_LIST_ID_HERE", // ID da lista no ClickUp
      CLICKUP_STATUS: "ativo", // Status das tarefas a buscar
      CLICKUP_TEAM_ID: null, // ID da equipe autorizada (null = permitir qualquer equipe)
      APP_NAME: "Check-in System",
      WEBHOOK_URL: "", // URL do webhook para envio dos dados (opcional)

      // Flags de ambiente
      IS_PRODUCTION: true,
      DEBUG_MODE: false,
    };
  } else {
    // Configurações para desenvolvimento local
    return {
      // URLs da API
      API_BASE: "http://localhost:3000",
      CLICKUP_AUTH_URL: "https://app.clickup.com/api",
      CLICKUP_TOKEN_URL: "https://api.clickup.com/api/v2/oauth/token",
      CLICKUP_API_BASE: "https://api.clickup.com/api/v2",

      // Configurações OAuth
      CLICKUP_CLIENT_ID: "SEU_CLIENT_ID_AQUI",
      CLICKUP_CLIENT_SECRET: "SEU_CLIENT_SECRET_AQUI",
      REDIRECT_URI: "http://localhost:3000/auth-callback.html",
      SCOPE: "read",

      // Configurações da aplicação
      CLICKUP_LIST_ID: "YOUR_LIST_ID_HERE",
      CLICKUP_STATUS: "ativo",
      CLICKUP_TEAM_ID: null, // ID da equipe autorizada (null = permitir qualquer equipe)
      APP_NAME: "Check-in System (DEV)",
      WEBHOOK_URL: "http://localhost:3000/api/webhook", // URL do webhook para desenvolvimento

      // Flags de ambiente
      IS_PRODUCTION: false,
      DEBUG_MODE: true,
    };
  }
})();

// Função para carregar configurações do servidor em produção
async function loadServerConfig() {
  if (!CONFIG.IS_PRODUCTION) {
    console.log("🔧 Modo desenvolvimento - usando configurações locais");
    return Promise.resolve();
  }

  try {
    console.log("🔄 Carregando configurações do servidor...");
    const response = await fetch("/api/config");

    if (!response.ok) {
      throw new Error(`Erro ao carregar configurações: ${response.status}`);
    }

    const serverConfig = await response.json();

    // Atualizar configurações com dados do servidor
    CONFIG.CLICKUP_CLIENT_ID = serverConfig.CLICKUP_CLIENT_ID;
    CONFIG.CLICKUP_LIST_ID = serverConfig.CLICKUP_LIST_ID;
    CONFIG.CLICKUP_STATUS = serverConfig.CLICKUP_STATUS;

    console.log("✅ Configurações do servidor carregadas:", {
      clientId: CONFIG.CLICKUP_CLIENT_ID,
      listId: CONFIG.CLICKUP_LIST_ID,
      status: CONFIG.CLICKUP_STATUS,
    });

    return Promise.resolve();
  } catch (error) {
    console.error("❌ Erro ao carregar configurações do servidor:", error);
    // Em caso de erro, usar configurações padrão
    CONFIG.CLICKUP_CLIENT_ID = "ERRO_CARREGAMENTO";
    CONFIG.CLICKUP_LIST_ID = "YOUR_LIST_ID_HERE";
    CONFIG.CLICKUP_STATUS = "ativo";
    return Promise.reject(error);
  }
}

// Função para aguardar configurações estarem prontas
async function waitForConfig() {
  if (CONFIG.IS_PRODUCTION) {
    // Aguardar configurações do servidor
    await loadServerConfig();
  }

  // Verificar se as configurações essenciais estão prontas
  if (
    CONFIG.CLICKUP_CLIENT_ID &&
    CONFIG.CLICKUP_CLIENT_ID !== "CARREGANDO..." &&
    CONFIG.CLICKUP_CLIENT_ID !== "ERRO_CARREGAMENTO"
  ) {
    return true;
  }

  return false;
}

// Carregar configurações automaticamente quando o script carregar
if (CONFIG.IS_PRODUCTION) {
  // Em produção, carregar configurações do servidor
  loadServerConfig().catch((error) => {
    console.error("❌ Falha ao carregar configurações iniciais:", error);
  });
} else {
  console.log("🔧 Modo desenvolvimento ativo");
}

// Exportar função de espera para configurações
window.waitForConfig = waitForConfig;

// Exportar para uso global
window.CONFIG = CONFIG;
