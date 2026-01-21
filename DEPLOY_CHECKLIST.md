# ✅ Checklist de Deploy - EasyPanel

Use este checklist para garantir que tudo está configurado corretamente antes do deploy.

## 📋 Pré-Deploy

### 1️⃣ Configuração do Supabase

- [ ] Projeto Supabase criado
- [ ] URL do projeto anotada (formato: `https://xxx.supabase.co`)
- [ ] Anon Key (chave pública) anotada
- [ ] Database schema aplicado (`database_complete_schema.sql`)
- [ ] Storage buckets criados e configurados
- [ ] Políticas RLS ativadas em todas as tabelas
- [ ] Autenticação configurada (Email/OAuth)

**Como obter as credenciais:**
1. Acesse seu projeto no Supabase
2. Vá em **Settings** → **API**
3. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

---

### 2️⃣ Preparação do Código

- [ ] Código commitado no Git
- [ ] Arquivo `.env` NÃO está no repositório (verificar `.gitignore`)
- [ ] Arquivo `Dockerfile` está na raiz do projeto
- [ ] Arquivo `nginx.conf` está na raiz do projeto
- [ ] Build local testado com sucesso

**Teste local:**
```bash
# Teste o build
npm run build

# Teste com Docker (opcional)
docker build \
  --build-arg VITE_SUPABASE_URL=https://seu-projeto.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=sua-chave \
  -t viva-rastrea .
```

---

## 🚀 Deploy no EasyPanel

### 3️⃣ Criar Projeto

- [ ] Conta no EasyPanel criada
- [ ] Novo projeto criado
- [ ] Repositório Git conectado
- [ ] Branch principal selecionada (main/master)

---

### 4️⃣ Configurar Build

**Build Settings:**
- [ ] **Build Method:** Docker
- [ ] **Dockerfile Path:** `Dockerfile`
- [ ] **Build Context:** `/` (raiz)

---

### 5️⃣ Configurar Variáveis de Ambiente

**Na seção "Environment Variables":**

- [ ] Variável `VITE_SUPABASE_URL` adicionada
  - Valor: `https://seu-projeto.supabase.co`
  - ✅ Marcada como **Build Argument**

- [ ] Variável `VITE_SUPABASE_ANON_KEY` adicionada
  - Valor: `sua-chave-anon-aqui`
  - ✅ Marcada como **Build Argument**

**⚠️ IMPORTANTE:** 
- Ambas devem estar marcadas como **Build Arguments**
- Não use a Service Role Key, apenas a Anon Key

---

### 6️⃣ Configurações Adicionais (Opcional)

**Recursos:**
- [ ] CPU: 0.5 - 1.0 (ajuste conforme necessário)
- [ ] Memory: 512MB - 1GB (ajuste conforme necessário)

**Health Check:**
- [ ] Path: `/`
- [ ] Interval: 30s
- [ ] Timeout: 10s

**Domínio:**
- [ ] Domínio personalizado configurado (se aplicável)
- [ ] SSL/HTTPS ativado (automático no EasyPanel)

---

### 7️⃣ Deploy

- [ ] Clicar em **"Deploy"**
- [ ] Aguardar build completar (5-10 minutos)
- [ ] Verificar logs de build (sem erros)
- [ ] Aplicação iniciada com sucesso

---

## ✅ Pós-Deploy

### 8️⃣ Verificação

- [ ] Aplicação acessível via URL do EasyPanel
- [ ] Página inicial carrega corretamente
- [ ] Login funciona
- [ ] Conexão com Supabase OK
- [ ] Imagens e assets carregam
- [ ] Sem erros no console do navegador

**Testes básicos:**
1. Acesse a URL fornecida pelo EasyPanel
2. Tente fazer login
3. Verifique se os dados do Supabase aparecem
4. Teste criar/editar um registro

---

### 9️⃣ Configurações Finais

- [ ] Domínio personalizado configurado (se aplicável)
- [ ] DNS apontando para o EasyPanel
- [ ] SSL/HTTPS funcionando
- [ ] Backup do banco configurado no Supabase
- [ ] Monitoramento configurado (opcional)

---

## 🆘 Troubleshooting

### ❌ Build falha

**Erro:** "Variáveis de ambiente não configuradas"
- ✅ Verifique se as variáveis estão marcadas como **Build Arguments**
- ✅ Confirme que os nomes estão corretos (case-sensitive)

**Erro:** "npm install failed"
- ✅ Verifique se `package.json` e `package-lock.json` estão no repositório
- ✅ Tente limpar cache do Docker no EasyPanel

---

### ❌ Aplicação não conecta ao Supabase

**Erro no console:** "Invalid Supabase credentials"
- ✅ Verifique se a URL não tem barra final (`/`)
- ✅ Confirme que está usando a Anon Key, não a Service Role Key
- ✅ Verifique se o projeto Supabase está ativo

---

### ❌ Página em branco

- ✅ Verifique os logs do container no EasyPanel
- ✅ Abra o console do navegador (F12) e veja erros
- ✅ Confirme que o build completou com sucesso
- ✅ Verifique se o nginx está servindo os arquivos

---

## 🔄 Replicar para Outro Nicho

Para criar uma nova instância:

1. **Novo Supabase:**
   - [ ] Criar novo projeto Supabase
   - [ ] Executar `database_complete_schema.sql`
   - [ ] Configurar storage buckets
   - [ ] Anotar novas credenciais

2. **Novo Deploy:**
   - [ ] Criar novo projeto no EasyPanel
   - [ ] Usar as **novas** variáveis de ambiente
   - [ ] Deploy!

3. **Personalização:**
   - [ ] Atualizar logos/branding
   - [ ] Ajustar cores (opcional)
   - [ ] Modificar textos (opcional)

---

## 📚 Documentação Adicional

- [EASYPANEL_SETUP.md](./EASYPANEL_SETUP.md) - Guia completo
- [SETUP.md](./SETUP.md) - Configuração inicial
- [DATABASE_SCHEMA_README.md](./DATABASE_SCHEMA_README.md) - Schema do banco
- [STORAGE_BUCKETS_GUIDE.md](./STORAGE_BUCKETS_GUIDE.md) - Configuração de storage

---

## ✨ Pronto!

Se todos os itens estão marcados, sua aplicação está pronta para uso! 🎉

**Próximos passos:**
- Configure usuários no Supabase
- Adicione produtores e lotes
- Compartilhe a URL com sua equipe
- Configure domínio personalizado (se aplicável)

---

**Última atualização:** Janeiro 2026
