# Variáveis de Ambiente - Resend Email

Para habilitar notificações de pedidos por email, adicione as seguintes variáveis:

## Resend API (Email Service)

1. Crie uma conta gratuita em: <https://resend.com>
2. Obtenha sua API Key em: <https://resend.com/api-keys>
3. Adicione as variáveis no Vercel:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
NOTIFICATION_EMAIL=projetovanava@gmail.com
```

### Configuração no Vercel

1. Acesse: <https://vercel.com/maicons-projects-4ce2b690/projetovava/settings/environment-variables>
2. Adicione:
   - `RESEND_API_KEY`: Sua chave da API Resend
   - `NOTIFICATION_EMAIL`: Email que receberá as notificações de pedidos

### Notas

- O plano gratuito do Resend permite 100 emails/dia
- Se a variável não estiver configurada, o sistema continua funcionando normalmente (sem enviar email)
- Os emails são enviados de forma assíncrona e não bloqueiam a criação do pedido
