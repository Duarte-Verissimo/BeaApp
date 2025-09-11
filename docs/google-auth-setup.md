## Configuração do Login com Google no Supabase

Para habilitar o login com Google, você precisa configurar o provedor OAuth no painel do Supabase:

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para "Authentication" > "Providers"
4. Habilite o provedor "Google"
5. Configure as credenciais OAuth:
   - URL de redirecionamento autorizada: `http://localhost:3000/auth/callback`
   - No Console do Google Cloud:
     - Crie um projeto (ou use um existente)
     - Habilite a API Google+ (se necessário)
     - Na seção "Credenciais", crie uma credencial OAuth 2.0
     - Adicione `http://localhost:3000/auth/callback` nas URIs de redirecionamento autorizadas
   - Cole o Client ID e Client Secret no painel do Supabase

Após essa configuração, o login com Google estará funcionando na sua aplicação.