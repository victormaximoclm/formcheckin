require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS - Permitir todos os domínios em produção
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sem origin (como mobile apps ou Postman)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      // Adicione seus domínios de produção aqui
      "http://localhost:3000",
      "http://localhost:3001",
      // Exemplo de domínios de produção:
      // "https://seu-dominio.com",
      // "https://www.seu-dominio.com",
    ];

    // Verificar se a origin está na lista de permitidos
    const isAllowed = allowedOrigins.some((allowed) => {
      if (typeof allowed === "string") {
        return origin === allowed;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`🚫 CORS bloqueado para origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware para parsing JSON
app.use(express.json());

// Middleware para logging de requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Servir arquivos estáticos
app.use(express.static("."));

// Rota proxy para trocar código por token
app.post("/api/oauth/token", async (req, res) => {
  try {
    const { client_id, code } = req.body;
    const client_secret = process.env.CLICKUP_CLIENT_SECRET;

    console.log("🔄 Proxy: Trocando código por token...");

    const response = await fetch("https://api.clickup.com/api/v2/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        code,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Erro na API do ClickUp:", data);
      return res.status(response.status).json({
        error: data.error || "Erro desconhecido",
        message: data.message || "Erro ao trocar código por token",
      });
    }

    console.log("✅ Proxy: Token obtido com sucesso");
    res.json(data);
  } catch (error) {
    console.error("❌ Erro no proxy:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: error.message,
    });
  }
});

// Rota para obter dados do usuário
app.get("/api/user", async (req, res) => {
  try {
    const accessToken = req.headers.authorization;

    if (!accessToken) {
      return res.status(401).json({
        error: "Token de acesso não fornecido",
      });
    }

    console.log("🔍 Proxy: Obtendo dados do usuário...");

    const response = await fetch("https://api.clickup.com/api/v2/user", {
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Erro ao obter dados do usuário:", data);
      return res.status(response.status).json({
        error: data.error || "Erro desconhecido",
        message: data.message || "Erro ao obter dados do usuário",
      });
    }

    console.log("✅ Proxy: Dados do usuário obtidos com sucesso");
    res.json(data);
  } catch (error) {
    console.error("❌ Erro no proxy (usuário):", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: error.message,
    });
  }
});

// Rota para buscar tarefas
app.get("/api/tasks", async (req, res) => {
  try {
    const accessToken = req.headers.authorization;
    const { list_id, status } = req.query;

    if (!accessToken) {
      return res.status(401).json({
        error: "Token de acesso não fornecido",
      });
    }

    if (!list_id) {
      return res.status(400).json({
        error: "ID da lista não fornecido",
      });
    }

    console.log("🔍 Proxy: Buscando tarefas...");

    const url = `https://api.clickup.com/api/v2/list/${list_id}/task${
      status ? `?statuses[]=${status}` : ""
    }`;

    console.log("🔗 URL da requisição:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Erro ao buscar tarefas:", data);
      return res.status(response.status).json({
        error: data.error || "Erro desconhecido",
        message: data.message || "Erro ao buscar tarefas",
      });
    }

    console.log("✅ Proxy: Tarefas obtidas com sucesso");
    console.log("📊 Dados recebidos:", JSON.stringify(data, null, 2));
    res.json(data);
  } catch (error) {
    console.error("❌ Erro no proxy (tarefas):", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: error.message,
    });
  }
});

// Rota para buscar equipes (teams)
app.get("/api/teams", async (req, res) => {
  try {
    const accessToken = req.headers.authorization;

    if (!accessToken) {
      return res.status(401).json({
        error: "Token de acesso não fornecido",
      });
    }

    console.log("🔍 Proxy: Buscando equipes...");

    const response = await fetch("https://api.clickup.com/api/v2/team", {
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Erro ao buscar equipes:", data);
      return res.status(response.status).json({
        error: data.error || "Erro desconhecido",
        message: data.message || "Erro ao buscar equipes",
      });
    }

    console.log("✅ Proxy: Equipes obtidas com sucesso");
    res.json(data);
  } catch (error) {
    console.error("❌ Erro no proxy (equipes):", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: error.message,
    });
  }
});

// Rota para fornecer configurações seguras para o cliente
app.get("/api/config", (req, res) => {
  // Retornar apenas as configurações necessárias para o cliente
  const clientConfig = {
    CLICKUP_CLIENT_ID: process.env.CLICKUP_CLIENT_ID || "SEU_CLIENT_ID_AQUI",
    CLICKUP_AUTH_URL: "https://app.clickup.com/api",
    CLICKUP_TOKEN_URL: "https://api.clickup.com/api/v2/oauth/token",
    REDIRECT_URI: `${req.protocol}://${req.get("host")}/auth-callback.html`,
    SCOPE: "read",
    APP_NAME: "Check-in System",
    CLICKUP_API_BASE: "https://api.clickup.com/api/v2",
    CLICKUP_LIST_ID: process.env.CLICKUP_LIST_ID || "YOUR_LIST_ID_HERE",
    CLICKUP_STATUS: process.env.CLICKUP_STATUS || "ativo",
    CLICKUP_TEAM_ID: process.env.CLICKUP_TEAM_ID || null,
  };

  console.log("🔧 Configurações fornecidas para o cliente:", {
    CLICKUP_CLIENT_ID: clientConfig.CLICKUP_CLIENT_ID
      ? "✅ Configurado"
      : "❌ Não configurado",
    CLICKUP_LIST_ID: clientConfig.CLICKUP_LIST_ID,
    CLICKUP_STATUS: clientConfig.CLICKUP_STATUS,
  });

  res.json(clientConfig);
});

// Rota principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Rota de callback
app.get("/auth-callback.html", (req, res) => {
  res.sendFile(path.join(__dirname, "auth-callback.html"));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🔧 Proxy OAuth ativo`);
  console.log(`📁 Servindo arquivos estáticos`);
  console.log(`🌍 Variáveis de ambiente:`);
  console.log(
    `   - CLICKUP_CLIENT_ID: ${
      process.env.CLICKUP_CLIENT_ID ? "✅ Configurado" : "❌ Não configurado"
    }`
  );
  console.log(
    `   - CLICKUP_CLIENT_SECRET: ${
      process.env.CLICKUP_CLIENT_SECRET
        ? "✅ Configurado"
        : "❌ Não configurado"
    }`
  );
  console.log(
    `   - CLICKUP_LIST_ID: ${
      process.env.CLICKUP_LIST_ID || "❌ Não configurado"
    }`
  );
  console.log(
    `   - CLICKUP_STATUS: ${process.env.CLICKUP_STATUS || "❌ Não configurado"}`
  );
});
