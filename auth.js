// Sistema de Autenticação OAuth ClickUp

// Estado da autenticação
let authState = {
  isAuthenticated: false,
  accessToken: null,
  user: null,
  expiresAt: null,
};

// Função para iniciar o processo de login OAuth
async function fazerLogin() {
  console.log("🔐 Iniciando processo de login OAuth...");

  // Aguardar configurações estarem prontas
  try {
    if (CONFIG.IS_PRODUCTION) {
      console.log("⏳ Aguardando configurações do servidor...");
      await waitForConfig();
    }
  } catch (error) {
    console.error("❌ Erro ao aguardar configurações:", error);
    showErrorModal(
      "Erro ao carregar configurações. Tente novamente em alguns instantes."
    );
    return;
  }

  // Verificar se as configurações foram carregadas
  if (
    !CONFIG.CLICKUP_CLIENT_ID ||
    CONFIG.CLICKUP_CLIENT_ID === "CARREGANDO..." ||
    CONFIG.CLICKUP_CLIENT_ID === "ERRO_CARREGAMENTO"
  ) {
    console.error("❌ Configurações não carregadas ainda");
    showErrorModal(
      "Aguarde um momento e tente novamente. As configurações ainda estão sendo carregadas."
    );
    return;
  }

  // Gerar state aleatório para segurança
  const state = generateRandomState();

  // Armazenar state no localStorage para verificação posterior
  localStorage.setItem("oauth_state", state);

  // Construir URL de autorização
  const authUrl = new URL(CONFIG.CLICKUP_AUTH_URL);
  authUrl.searchParams.append("client_id", CONFIG.CLICKUP_CLIENT_ID);
  authUrl.searchParams.append("redirect_uri", CONFIG.REDIRECT_URI);
  authUrl.searchParams.append("state", state);
  authUrl.searchParams.append("scope", CONFIG.SCOPE);

  console.log("🔗 Redirecionando para:", authUrl.toString());

  // Redirecionar para a página de autorização do ClickUp
  window.location.href = authUrl.toString();
}

// Função para fazer logout
function fazerLogout() {
  console.log("🚪 Fazendo logout...");

  // Limpar dados de autenticação
  authState = {
    isAuthenticated: false,
    accessToken: null,
    user: null,
    expiresAt: null,
  };

  // Limpar localStorage
  localStorage.removeItem("oauth_state");
  localStorage.removeItem("auth_data");

  // Mostrar tela de login
  showLoginScreen();
}

// Função para processar o callback OAuth
async function processarCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const state = urlParams.get("state");
  const error = urlParams.get("error");

  console.log("🔄 Processando callback OAuth...", {
    code: !!code,
    state: !!state,
    error,
  });

  // Verificar se há erro
  if (error) {
    console.error("❌ Erro na autorização:", error);
    showErrorModal("Erro na autorização: " + error);
    // Redirecionar para página principal após erro
    setTimeout(() => {
      window.location.href = "/";
    }, 3000);
    return;
  }

  // Verificar se temos o código de autorização
  if (!code) {
    console.error("❌ Código de autorização não encontrado");
    showErrorModal("Código de autorização não encontrado");
    // Redirecionar para página principal após erro
    setTimeout(() => {
      window.location.href = "/";
    }, 3000);
    return;
  }

  // Verificar state para segurança
  const savedState = localStorage.getItem("oauth_state");
  if (state !== savedState) {
    console.error("❌ State inválido - possível ataque CSRF");
    showErrorModal("Erro de segurança na autenticação");
    // Redirecionar para página principal após erro
    setTimeout(() => {
      window.location.href = "/";
    }, 3000);
    return;
  }

  try {
    console.log("🔄 Trocando código por token...");

    // Trocar código por token de acesso
    const tokenData = await trocarCodigoPorToken(code);

    // Obter informações do usuário
    const userData = await obterDadosUsuario(tokenData.access_token);

    // Verificar se o usuário pertence à equipe autorizada
    const temAcesso = await verificarAcessoEquipe(tokenData.access_token);

    if (!temAcesso) {
      console.error("❌ Usuário não tem acesso à equipe autorizada");
      showErrorModal(
        "Acesso negado. Você não tem permissão para acessar este sistema."
      );
      // Redirecionar para página principal após erro
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
      return;
    }

    // Salvar dados de autenticação
    const expiresIn = tokenData.expires_in || 3600; // Default 1 hora se não especificado
    authState = {
      isAuthenticated: true,
      accessToken: tokenData.access_token,
      user: userData,
      expiresAt: Date.now() + expiresIn * 1000,
    };

    // Salvar no localStorage
    localStorage.setItem("auth_data", JSON.stringify(authState));

    console.log("✅ Autenticação realizada com sucesso");

    // Limpar o state usado
    localStorage.removeItem("oauth_state");

    // Redirecionar para a página principal
    window.location.href = "/";
  } catch (error) {
    console.error("❌ Erro ao processar callback:", error);
    showErrorModal("Erro ao completar autenticação: " + error.message);
    // Redirecionar para página principal após erro
    setTimeout(() => {
      window.location.href = "/";
    }, 3000);
  }
}

// Função para trocar código por token
async function trocarCodigoPorToken(code) {
  // Aguardar configurações estarem prontas se necessário
  if (CONFIG.IS_PRODUCTION) {
    try {
      await waitForConfig();
    } catch (error) {
      throw new Error(
        "Erro ao carregar configurações do servidor. Tente novamente."
      );
    }
  }

  // Verificar se as configurações foram carregadas
  if (
    !CONFIG.CLICKUP_CLIENT_ID ||
    CONFIG.CLICKUP_CLIENT_ID === "CARREGANDO..." ||
    CONFIG.CLICKUP_CLIENT_ID === "ERRO_CARREGAMENTO"
  ) {
    throw new Error("Configurações não carregadas ainda. Tente novamente.");
  }

  const apiBase = CONFIG.API_BASE || "";
  const response = await fetch(`${apiBase}/api/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: CONFIG.CLICKUP_CLIENT_ID,
      code: code,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Erro ao trocar código por token: ${response.status} - ${
        errorData.error || errorData.message || "Erro desconhecido"
      }`
    );
  }

  return await response.json();
}

// Função para obter dados do usuário
async function obterDadosUsuario(accessToken) {
  const apiBase = CONFIG.API_BASE || "";
  const response = await fetch(`${apiBase}/api/user`, {
    headers: {
      Authorization: accessToken,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Erro ao obter dados do usuário: ${response.status} - ${
        errorData.error || errorData.message || "Erro desconhecido"
      }`
    );
  }

  return await response.json();
}

// Função para verificar se o usuário tem acesso à equipe autorizada
async function verificarAcessoEquipe(accessToken) {
  try {
    console.log("🔍 Verificando acesso à equipe...");

    const apiBase = CONFIG.API_BASE || "";
    const response = await fetch(`${apiBase}/api/teams`, {
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("❌ Erro ao buscar equipes para verificação de acesso");
      return false;
    }

    const data = await response.json();

    // Verificar se o usuário pertence à equipe autorizada
    // Configure o ID da equipe autorizada no CONFIG.CLICKUP_TEAM_ID
    // ou deixe como null para permitir acesso de qualquer equipe
    const EQUIPE_AUTORIZADA_ID = CONFIG.CLICKUP_TEAM_ID || null;
    
    // Se não houver equipe configurada, permitir acesso a qualquer equipe
    if (!EQUIPE_AUTORIZADA_ID || EQUIPE_AUTORIZADA_ID === "YOUR_TEAM_ID_HERE") {
      console.log("⚠️ Verificação de equipe desabilitada - permitindo acesso");
      return true;
    }
    
    const equipeAutorizada =
      data.teams && data.teams.some((team) => team.id === EQUIPE_AUTORIZADA_ID);

    if (equipeAutorizada) {
      console.log("✅ Usuário tem acesso à equipe autorizada");
      return true;
    } else {
      console.log("❌ Usuário não pertence à equipe autorizada");
      return false;
    }
  } catch (error) {
    console.error("❌ Erro ao verificar acesso à equipe:", error);
    return false;
  }
}

// Função para verificar se o usuário está autenticado
async function verificarAutenticacao() {
  console.log("🔍 Verificando autenticação...");

  // Verificar se estamos na página de callback
  if (window.location.pathname.includes("auth-callback")) {
    console.log("📄 Página de callback detectada");
    // Processar callback apenas uma vez
    if (!window.callbackProcessed) {
      window.callbackProcessed = true;
      // Aguardar configurações antes de processar callback
      try {
        if (CONFIG.IS_PRODUCTION) {
          console.log(
            "⏳ Aguardando configurações antes de processar callback..."
          );
          await waitForConfig();
        }
        processarCallback();
      } catch (error) {
        console.error(
          "❌ Erro ao aguardar configurações para callback:",
          error
        );
        showErrorModal("Erro ao carregar configurações. Tente novamente.");
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      }
    } else {
      console.log("⚠️ Callback já foi processado, redirecionando...");
      window.location.href = "/";
    }
    return;
  }

  // Tentar recuperar dados de autenticação do localStorage
  const savedAuth = localStorage.getItem("auth_data");
  console.log("💾 Dados salvos encontrados:", !!savedAuth);

  if (savedAuth) {
    try {
      authState = JSON.parse(savedAuth);
      console.log("🔑 Estado de autenticação:", authState);

      // Verificar se o token não expirou
      if (authState.expiresAt && Date.now() < authState.expiresAt) {
        console.log("✅ Usuário autenticado - mostrando formulário");
        showFormScreen();
        atualizarNomeUsuario();
        return;
      } else if (!authState.expiresAt) {
        // Se não tem expiresAt, assumir que ainda é válido (para tokens antigos)
        console.log("⚠️ Token sem expiração definida - assumindo válido");
        showFormScreen();
        atualizarNomeUsuario();
        return;
      } else {
        console.log("⏰ Token expirado");
        fazerLogout();
      }
    } catch (error) {
      console.error("❌ Erro ao recuperar dados de autenticação:", error);
      fazerLogout();
    }
  }

  // Se não está autenticado, mostrar tela de login
  console.log("🔐 Usuário não autenticado - mostrando login");
  showLoginScreen();
}

// Função para mostrar tela de login
function showLoginScreen() {
  console.log("🖥️ Mostrando tela de login...");
  const loginScreen = document.getElementById("login-screen");
  const formScreen = document.getElementById("form-screen");

  console.log("🔍 Elementos encontrados:", {
    loginScreen: !!loginScreen,
    formScreen: !!formScreen,
  });

  if (loginScreen) {
    loginScreen.style.display = "block";
    console.log("✅ Tela de login exibida");
  }
  if (formScreen) {
    formScreen.style.display = "none";
    console.log("✅ Tela de formulário ocultada");
  }
}

// Função para mostrar tela do formulário
function showFormScreen() {
  console.log("📝 Mostrando tela do formulário...");
  const loginScreen = document.getElementById("login-screen");
  const formScreen = document.getElementById("form-screen");

  console.log("🔍 Elementos encontrados:", {
    loginScreen: !!loginScreen,
    formScreen: !!formScreen,
  });

  if (loginScreen) {
    loginScreen.style.display = "none";
    console.log("✅ Tela de login ocultada");
  }
  if (formScreen) {
    formScreen.style.display = "block";
    console.log("✅ Tela de formulário exibida");
  }
}

// Função para atualizar nome do usuário na interface
function atualizarNomeUsuario() {
  console.log("👤 Atualizando nome do usuário na interface...");
  if (authState.user && authState.user.user) {
    const userNameElement = document.getElementById("user-name");
    if (userNameElement) {
      const userName =
        authState.user.user.username || authState.user.user.name || "Usuário";
      userNameElement.textContent = `👤 ${userName}`;
      console.log("✅ Nome do usuário atualizado:", userName);
    } else {
      console.log("❌ Elemento user-name não encontrado");
    }
  } else {
    console.log("❌ Dados do usuário não disponíveis");
  }
}

// Função para gerar state aleatório
function generateRandomState() {
  const array = new Uint32Array(28);
  crypto.getRandomValues(array);
  return Array.from(array, (dec) => ("0" + dec.toString(16)).substr(-2)).join(
    ""
  );
}

// Função para obter token de acesso (para uso em outras partes da aplicação)
function getAccessToken() {
  return authState.accessToken;
}

// Função para verificar se está autenticado
function isAuthenticated() {
  return authState.isAuthenticated && authState.accessToken;
}

// Função para mostrar modal de erro
function showErrorModal(message) {
  console.error("❌ Erro:", message);
  alert(message); // Fallback simples - você pode implementar um modal mais elegante se necessário
}

// Inicializar verificação de autenticação quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", async function () {
  console.log("🚀 Inicializando sistema de autenticação...");
  console.log("📄 DOM carregado, verificando elementos...");

  // Verificar se os elementos existem
  const loginScreen = document.getElementById("login-screen");
  const formScreen = document.getElementById("form-screen");

  console.log("🔍 Elementos encontrados no DOM:", {
    loginScreen: !!loginScreen,
    formScreen: !!formScreen,
  });

  try {
    await verificarAutenticacao();
  } catch (error) {
    console.error("❌ Erro ao verificar autenticação:", error);
  }
});

// Exportar funções para uso global
window.fazerLogin = fazerLogin;
window.fazerLogout = fazerLogout;
window.getAccessToken = getAccessToken;
window.isAuthenticated = isAuthenticated;
