# 🔐 Configuração de Gerenciamento de Usuários

## ✅ Configuração Automática

O gerenciamento de usuários está configurado usando uma **Edge Function** do Supabase, que mantém a Service Role Key segura no servidor.

A Edge Function `manage-users` já foi criada e está ativa no projeto.

## 📋 Configuração da Edge Function

A Edge Function usa automaticamente as variáveis de ambiente do Supabase:
- `SUPABASE_URL` - Configurado automaticamente
- `SUPABASE_SERVICE_ROLE_KEY` - Configurado automaticamente no ambiente da Edge Function

**Não é necessário configurar nada no frontend!** A segurança está garantida pela Edge Function.

## 🔒 Segurança

A implementação atual é segura porque:
- ✅ A Service Role Key nunca é exposta no frontend
- ✅ A Edge Function valida a autenticação do usuário antes de executar operações
- ✅ Apenas usuários autenticados podem acessar as funções
- ✅ Todas as operações passam pela validação de segurança do Supabase

### Exemplo de Edge Function

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { email, password, full_name } = await req.json()

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  })

  return new Response(JSON.stringify({ data, error }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

## ✅ Funcionalidades Disponíveis

Após a configuração, o administrador poderá:

- ✅ Listar todos os usuários do sistema
- ✅ Criar novos usuários
- ✅ Remover usuários
- ✅ Ver status de confirmação de email
- ✅ Ver data de criação dos usuários

## 🚨 Solução de Problemas

### Erro: "Service Role Key não configurada"

- Verifique se o arquivo `.env.local` existe
- Verifique se a variável `VITE_SUPABASE_SERVICE_ROLE_KEY` está configurada
- Reinicie o servidor após adicionar a variável

### Erro ao criar usuário

- Verifique se a service_role key está correta
- Verifique se o email já não está cadastrado
- Verifique se a senha atende aos requisitos (mínimo 6 caracteres)

