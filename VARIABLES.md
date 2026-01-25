# 🔧 Variáveis de Ambiente

Este documento lista todas as variáveis de ambiente necessárias para configurar o projeto.

## 📋 Variáveis Obrigatórias

### Credenciais ClickUp

```bash
CLICKUP_CLIENT_ID=seu_client_id_aqui
CLICKUP_CLIENT_SECRET=seu_client_secret_aqui
```

**Como obter:**

1. Acesse [ClickUp Developer Portal](https://dev-docs.clickup.com/)
2. Crie uma nova aplicação OAuth
3. Configure a URL de redirecionamento:
   - Desenvolvimento: `http://localhost:3000/auth-callback.html`
   - Produção: `https://seu-dominio.com/auth-callback.html`
4. Copie o Client ID e Client Secret

### Configurações da Lista

```bash
CLICKUP_LIST_ID=id_da_sua_lista
CLICKUP_STATUS=ativo
```

**Como obter:**

1. No ClickUp, acesse a lista onde estão os itens que deseja buscar
2. O ID da lista está na URL: `https://app.clickup.com/{LIST_ID}/v/...`
3. O status deve ser o mesmo usado no ClickUp (ex: "ativo", "em andamento", etc.)

## 🔧 Variáveis Opcionais

### Configuração de Equipe (Restrição de Acesso)

```bash
CLICKUP_TEAM_ID=id_da_equipe_autorizada
```

**Como obter:**

1. No ClickUp, acesse as configurações da equipe
2. O ID da equipe pode ser encontrado na URL ou através da API
3. Se não configurado, o sistema permitirá acesso de qualquer equipe autenticada

**Nota**: Se você não configurar esta variável, qualquer usuário autenticado no ClickUp poderá acessar o sistema.

### Configurações do Servidor

```bash
PORT=3000
NODE_ENV=production
```

### Webhook (Opcional)

```bash
WEBHOOK_URL=https://seu-webhook.com/endpoint
```

Configure esta variável se desejar enviar os dados do formulário para um webhook externo.

## 📱 Configuração Local

### Criar arquivo `.env`

Na raiz do projeto, crie um arquivo `.env` com as variáveis:

```env
CLICKUP_CLIENT_ID=seu_client_id_aqui
CLICKUP_CLIENT_SECRET=seu_client_secret_aqui
CLICKUP_LIST_ID=id_da_sua_lista
CLICKUP_STATUS=ativo
CLICKUP_TEAM_ID=id_da_equipe (opcional)
PORT=3000
```

**Importante**: Adicione `.env` ao `.gitignore` para não commitar credenciais.

## 🚀 Configuração em Produção

### Plataformas de Deploy

#### Heroku

1. Acesse as configurações do seu app
2. Vá para a aba "Config Vars"
3. Adicione cada variável

#### Vercel

1. Acesse as configurações do projeto
2. Vá para "Environment Variables"
3. Adicione cada variável

#### Railway / Render

1. Acesse as configurações do serviço
2. Vá para "Environment Variables"
3. Adicione cada variável

### Exemplo de Configuração

```env
CLICKUP_CLIENT_ID=abc123xyz
CLICKUP_CLIENT_SECRET=secret123xyz
CLICKUP_LIST_ID=123456789
CLICKUP_STATUS=ativo
CLICKUP_TEAM_ID=987654321
PORT=3000
NODE_ENV=production
```

## ✅ Verificação da Configuração

Após configurar as variáveis:

1. **Reinicie o servidor** (se necessário)
2. **Acesse** `http://localhost:3000` (ou seu domínio)
3. **Verifique o console** do navegador (F12) para confirmar que as configurações foram carregadas
4. **Teste o login** com uma conta ClickUp autorizada

## 🚨 Segurança

- **NUNCA** commite o arquivo `.env` no GitHub
- **NUNCA** exponha as credenciais no frontend
- **Use sempre HTTPS** em produção
- **Configure corretamente** as URLs de redirecionamento no ClickUp
- **Mantenha as credenciais seguras** e rotacione-as periodicamente

## 🔍 Troubleshooting

### Erro: "Configurações não carregadas"

- Verifique se as variáveis estão configuradas corretamente
- Confirme se os nomes das variáveis estão exatos (case-sensitive)
- Reinicie o servidor após alterar as variáveis
- Verifique se o arquivo `.env` está na raiz do projeto

### Erro: "Redirect URI mismatch"

- Verifique se a URL de redirecionamento no ClickUp está exatamente igual à configurada
- Não deve ter barras finais ou diferenças de protocolo
- Em produção, use HTTPS

### Erro: "Access denied"

- Confirme se o usuário pertence à equipe autorizada (se `CLICKUP_TEAM_ID` estiver configurado)
- Verifique se o status das tarefas está correto
- Confirme se o `CLICKUP_LIST_ID` está correto

### Erro: "Invalid client credentials"

- Verifique se o `CLICKUP_CLIENT_ID` e `CLICKUP_CLIENT_SECRET` estão corretos
- Confirme se não há espaços extras nas variáveis
- Verifique se a aplicação OAuth está ativa no ClickUp

## 📚 Recursos Adicionais

- [Documentação ClickUp API](https://dev-docs.clickup.com/)
- [OAuth 2.0 Documentation](https://oauth.net/2/)
- [Express.js Documentation](https://expressjs.com/)
