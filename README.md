# 🚀 Sistema de Check-in com OAuth (ClickUp) — Case Study

Sistema de check-in integrado ao ClickUp utilizando autenticação OAuth 2.0, permitindo que usuários autenticados realizem registros diretamente vinculados a tarefas e fluxos operacionais.

---

## 💡 Objetivo

Demonstrar a implementação de um fluxo completo de autenticação OAuth e integração com API externa, aplicando em um cenário real de controle operacional.

Este projeto resolve:

- 🔐 Autenticação segura via OAuth 2.0  
- 🔗 Integração com API do ClickUp  
- 🧾 Registro estruturado de check-ins  
- ⚙️ Automação de processos via webhook  

---

## 🧩 Funcionalidades

- ✅ Login com OAuth 2.0 (ClickUp)  
- ✅ Validação de acesso por equipe (opcional)  
- ✅ Consumo dinâmico da API do ClickUp (listas/tarefas)  
- ✅ Formulário de check-in com validação  
- ✅ Envio de dados para webhook externo  
- ✅ Interface responsiva e leve (vanilla JS)  

---

## 🖼️ Preview

> Adicione aqui prints do sistema (login, formulário, integração)

---

## 🧠 Arquitetura

- Frontend desacoplado (HTML + JS)
- Backend leve com Node.js + Express
- Autenticação via OAuth 2.0
- Integração com API REST externa (ClickUp)

Fluxo simplificado:

1. Usuário autentica via ClickUp  
2. Sistema recebe authorization code  
3. Backend troca por access token  
4. Dados do usuário são validados  
5. Usuário acessa o sistema e realiza check-in  
6. Dados são enviados para ClickUp / Webhook  

---

## 🛠️ Tecnologias Utilizadas

- Frontend: HTML5, CSS3, JavaScript (Vanilla)  
- Backend: Node.js, Express.js  
- Autenticação: OAuth 2.0  
- API: ClickUp API v2  

---

## ⚙️ Configuração do Ambiente

### Pré-requisitos

- Node.js (v14 ou superior)  
- npm ou yarn  
- Conta no ClickUp  
- Aplicação OAuth criada  

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
CLICKUP_CLIENT_ID=seu_client_id
CLICKUP_CLIENT_SECRET=seu_client_secret
CLICKUP_LIST_ID=id_da_lista
CLICKUP_STATUS=ativo
CLICKUP_TEAM_ID=id_da_equipe (opcional)
PORT=3000
```

---

## 🚀 Rodando o Projeto

```bash
# instalar dependências
npm install

# iniciar aplicação
npm start
```

Acesse: http://localhost:3000

---

## 🔧 Configuração no ClickUp

1. Acesse o Developer Portal  
2. Crie uma aplicação OAuth  
3. Configure o redirect URI:

```
http://localhost:3000/auth-callback.html
```

4. Copie:
- Client ID  
- Client Secret  

---

## 🔄 Fluxo de Autenticação

1. Usuário clica em "Entrar com ClickUp"  
2. Redirecionamento para autorização  
3. Usuário concede acesso  
4. Retorno com código de autorização  
5. Backend troca por access token  
6. Sistema valida acesso (team opcional)  
7. Usuário autenticado acessa o sistema  

---

## 🌐 Deploy em Produção

### Variáveis necessárias

```env
CLICKUP_CLIENT_ID=...
CLICKUP_CLIENT_SECRET=...
CLICKUP_LIST_ID=...
CLICKUP_STATUS=ativo
CLICKUP_TEAM_ID=... (opcional)
PORT=3000
NODE_ENV=production
```

### Ajustes necessários

- Atualizar redirect URI:
```
https://seu-dominio.com/auth-callback.html
```

- Configurar CORS no backend:

```js
const allowedOrigins = [
  "https://seu-dominio.com",
  "https://www.seu-dominio.com",
];
```

---

## 🔌 Webhook (Opcional)

Configure no `config.js`:

```js
WEBHOOK_URL: "https://seu-webhook.com/endpoint"
```

Permite integração com:
- automações (ex: n8n)  
- sistemas internos  
- CRMs  

---

## 🔒 Segurança

- ✅ Uso de OAuth 2.0  
- ✅ Proteção contra CSRF (state)  
- ✅ Tokens com expiração  
- ✅ Separação frontend/backend  
- ✅ Uso recomendado de HTTPS em produção  

---

## 🧩 Possíveis Extensões

- Integração com automações (ex: n8n)  
- Criação automática de tarefas no ClickUp  
- Dashboard de check-ins  
- Controle de permissões por usuário  
- Logs e auditoria  

---

## 👨‍💻 Autor

Desenvolvido como case study para demonstração de integração com OAuth e APIs externas.
