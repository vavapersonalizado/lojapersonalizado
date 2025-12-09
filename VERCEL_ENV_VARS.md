// Instruções para verificar variáveis de ambiente na Vercel

## Variáveis de Ambiente Necessárias

Verifique se as seguintes variáveis estão configuradas na Vercel:

### 1. NEXTAUTH_URL

**Importante**: Deve ser a URL completa da sua aplicação na Vercel

```
NEXTAUTH_URL=https://seu-projeto.vercel.app
```

### 2. NEXTAUTH_SECRET

Deve ser uma string aleatória segura. Você pode gerar uma com:

```bash
openssl rand -base64 32
```

### 3. Database URLs

```
DATABASE_URL=sua-connection-string-do-neon
POSTGRES_PRISMA_URL=sua-connection-string-do-neon
POSTGRES_URL_NON_POOLING=sua-connection-string-do-neon
```

### 4. Google OAuth

```
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
```

## Como Verificar na Vercel

1. Vá em: <https://vercel.com/dashboard>
2. Selecione seu projeto
3. Vá em "Settings" → "Environment Variables"
4. Verifique se todas as variáveis acima estão configuradas
5. **IMPORTANTE**: Após adicionar/modificar variáveis, faça um redeploy!

## Problema Comum

Se `NEXTAUTH_URL` não estiver configurada ou estiver errada, a sessão não funcionará.
