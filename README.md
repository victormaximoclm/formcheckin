# Sistema de Check-in com OAuth ClickUp - Case Study

Este é um projeto de case study que demonstra a implementação de um sistema de check-in utilizando autenticação OAuth do ClickUp. O sistema permite que usuários autenticados façam check-in através de um formulário web integrado com a API do ClickUp.

## 📋 Sobre o Projeto

Este projeto foi desenvolvido como um case study para demonstrar:
- Integração com OAuth 2.0 do ClickUp
- Autenticação segura de usuários
- Integração com API REST do ClickUp
- Interface responsiva e moderna
- Sistema de formulários dinâmicos com dropdown customizado

## 🚀 Funcionalidades

- ✅ Autenticação OAuth com ClickUp
- ✅ Verificação de acesso por equipe (opcional)
- ✅ Busca dinâmica de tarefas/itens do ClickUp
- ✅ Formulário de check-in com validação
- ✅ Interface responsiva e moderna
- ✅ Envio de dados para webhook configurável

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Autenticação**: OAuth 2.0 (ClickUp)
- **API**: ClickUp API v2

## 📦 Instalação

### Pré-requisitos

- Node.js (v14 ou superior)
- npm ou yarn
- Conta no ClickUp
- Aplicação OAuth criada no ClickUp Developer Portal

### Passo a Passo

1. **Clone o repositório**

   ```bash
   git clone <seu-repositorio>
   cd clickup-oauth-checkin
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Configure a aplicação no ClickUp**

   - Acesse o [ClickUp Developer Portal](https://dev-docs.clickup.com/)
   - Crie uma nova aplicação OAuth
   - Configure a URL de redirecionamento: `http://localhost:3000/auth-callback.html`
   - Copie o Client ID e Client Secret

4. **Configure as variáveis de ambiente**

   Crie um arquivo `.env` na raiz do projeto:

   ```env
   CLICKUP_CLIENT_ID=seu_client_id_aqui
   CLICKUP_CLIENT_SECRET=seu_client_secret_aqui
   CLICKUP_LIST_ID=id_da_sua_lista
   CLICKUP_STATUS=ativo
   CLICKUP_TEAM_ID=id_da_equipe_autorizada (opcional)
   PORT=3000
   ```

   **Nota**: O `CLICKUP_TEAM_ID` é opcional. Se não for configurado, qualquer usuário autenticado poderá acessar o sistema.

5. **Execute o projeto**

   ```bash
   npm start
   ```

6. **Acesse no navegador**

   ```
   http://localhost:3000
   ```

## 🔧 Configuração

### Obter IDs Necessários

#### Client ID e Client Secret
1. Acesse [ClickUp Developer Portal](https://dev-docs.clickup.com/)
2. Crie uma nova aplicação OAuth
3. Configure a URL de redirecionamento
4. Copie as credenciais

#### List ID
1. No ClickUp, acesse a lista desejada
2. O ID está na URL: `https://app.clickup.com/{LIST_ID}/v/...`
3. Copie o ID da lista

#### Team ID (Opcional)
1. No ClickUp, acesse as configurações da equipe
2. O ID da equipe pode ser encontrado na URL ou na API
3. Se não configurado, o sistema permitirá acesso de qualquer equipe

### Configurar Webhook (Opcional)

Para enviar os dados do formulário para um webhook externo, configure a URL no arquivo `config.js`:

```javascript
WEBHOOK_URL: "https://seu-webhook.com/endpoint"
```

Ou configure via variável de ambiente no servidor.

## 📁 Estrutura do Projeto

```
clickup-oauth-checkin/
├── index.html              # Página principal
├── auth-callback.html      # Página de callback OAuth
├── config.js              # Configurações da aplicação
├── auth.js                # Sistema de autenticação OAuth
├── script.js              # Lógica principal da aplicação
├── styles.css             # Estilos CSS
├── server.js              # Servidor Express (proxy OAuth)
├── package.json           # Dependências do projeto
└── images/                # Imagens e ícones
    ├── clickup_logo.png
    └── hpsm_favicon.png
```

## 🔐 Fluxo de Autenticação

1. **Login**: Usuário clica em "Entrar com ClickUp"
2. **Redirecionamento**: É redirecionado para a página de autorização do ClickUp
3. **Autorização**: Usuário autoriza a aplicação
4. **Callback**: ClickUp redireciona de volta com código de autorização
5. **Token**: A aplicação troca o código por um token de acesso
6. **Verificação**: Sistema verifica se o usuário pertence à equipe autorizada (se configurado)
7. **Acesso**: Usuário pode usar o sistema com o token

## 🚀 Deploy em Produção

### Variáveis de Ambiente Necessárias

```env
CLICKUP_CLIENT_ID=seu_client_id
CLICKUP_CLIENT_SECRET=seu_client_secret
CLICKUP_LIST_ID=id_da_lista
CLICKUP_STATUS=ativo
CLICKUP_TEAM_ID=id_da_equipe (opcional)
PORT=3000
NODE_ENV=production
```

### Configuração no ClickUp

1. Atualize a URL de redirecionamento para: `https://seu-dominio.com/auth-callback.html`
2. Certifique-se de que está usando HTTPS (obrigatório para OAuth)

### Configuração de CORS

No arquivo `server.js`, atualize a lista de domínios permitidos:

```javascript
const allowedOrigins = [
  "https://seu-dominio.com",
  "https://www.seu-dominio.com",
];
```

## 🔍 Troubleshooting

### Erro de CORS
- Certifique-se de que está usando um servidor web (não abrindo o arquivo diretamente)
- Verifique se o domínio está na lista de permitidos no `server.js`

### Erro de Redirect URI
- Verifique se a URL de redirecionamento no ClickUp está exatamente igual à configurada
- Não deve ter barras finais ou diferenças de protocolo

### Token Expirado
- O sistema automaticamente faz logout quando o token expira
- O usuário precisará fazer login novamente

### Erro de Autenticação
- Verifique se as credenciais no `.env` estão corretas
- Confirme se a aplicação OAuth está configurada corretamente no ClickUp

## 📝 Personalização

### Modificar Estilos

Edite o arquivo `styles.css` para personalizar a aparência. O arquivo utiliza CSS Custom Properties para facilitar a customização.

### Adicionar Novos Campos

1. Adicione os campos no HTML (`index.html`)
2. Atualize a função `enviarFormulario()` no `script.js`
3. Configure a validação se necessário

### Integrar com Outras APIs

O token de acesso pode ser usado para outras APIs do ClickUp:
- Criar tarefas
- Atualizar status
- Buscar dados de usuários
- etc.

## 🔒 Segurança

- ✅ **HTTPS**: Sempre use HTTPS em produção
- ✅ **Client Secret**: Nunca exponha o Client Secret no frontend
- ✅ **State Parameter**: Protege contra ataques CSRF
- ✅ **Token Expiration**: Tokens expiram automaticamente
- ✅ **Validação**: Implemente validação adicional se necessário

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🤝 Contribuindo

Este é um projeto de case study. Sinta-se livre para usar como referência ou base para seus próprios projetos.

## 📞 Suporte

Para dúvidas sobre a API do ClickUp, consulte a [documentação oficial](https://dev-docs.clickup.com/).

---

**Desenvolvido como Case Study** 🚀
