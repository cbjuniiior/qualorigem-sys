# 🚀 Guia Rápido de Deploy - Viva Rastrea

## 📊 Visão Geral do Fluxo

```
┌─────────────────┐
│   SUPABASE      │
│  (Backend)      │
│                 │
│ 1. Criar projeto│
│ 2. Aplicar SQL  │
│ 3. Obter keys   │
└────────┬────────┘
         │
         │ Credenciais
         │
         ▼
┌─────────────────┐
│   EASYPANEL     │
│  (Deploy)       │
│                 │
│ 1. Conectar Git │
│ 2. Add ENV vars │
│ 3. Deploy       │
└────────┬────────┘
         │
         │ Build & Deploy
         │
         ▼
┌─────────────────┐
│   APLICAÇÃO     │
│   (Produção)    │
│                 │
│ ✅ Online!      │
└─────────────────┘
```

---

## 🎯 Passo a Passo Simplificado

### Etapa 1: Supabase (5 minutos)

```bash
1. Acesse: https://supabase.com
2. Crie novo projeto
3. Vá em: SQL Editor
4. Cole e execute: database_complete_schema.sql
5. Vá em: Settings → API
6. Copie:
   ✓ Project URL
   ✓ anon/public key
```

**Resultado:** ✅ Backend configurado

---

### Etapa 2: EasyPanel (3 minutos)

```bash
1. Acesse: https://easypanel.io
2. Create Project → From GitHub
3. Selecione o repositório
4. Configure:
   
   Build Settings:
   ├─ Build Method: Docker
   ├─ Dockerfile: Dockerfile
   └─ Context: /
   
   Environment Variables (Build Arguments):
   ├─ VITE_SUPABASE_URL = https://xxx.supabase.co
   └─ VITE_SUPABASE_ANON_KEY = eyJ...
   
5. Deploy!
```

**Resultado:** ✅ Aplicação online

---

## 🔑 Variáveis de Ambiente

### Onde encontrar no Supabase:

```
Supabase Dashboard
    └─ Settings
        └─ API
            ├─ Project URL ────────────► VITE_SUPABASE_URL
            └─ Project API keys
                └─ anon public ────────► VITE_SUPABASE_ANON_KEY
```

### Como configurar no EasyPanel:

```
EasyPanel Project
    └─ Settings
        └─ Environment Variables
            ├─ Add Variable: VITE_SUPABASE_URL
            │   ├─ Value: https://xxx.supabase.co
            │   └─ ✅ Build Argument
            │
            └─ Add Variable: VITE_SUPABASE_ANON_KEY
                ├─ Value: eyJ...
                └─ ✅ Build Argument
```

---

## 🔄 Replicar para Outro Nicho

### Cenário: Criar versão para outro domínio/nicho

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  NICHO 1 (Queijos)          NICHO 2 (Vinhos)           │
│  ├─ Supabase A              ├─ Supabase B               │
│  ├─ EasyPanel App A         ├─ EasyPanel App B          │
│  └─ queijos.com             └─ vinhos.com               │
│                                                          │
└──────────────────────────────────────────────────────────┘

Passos:
1. Criar novo projeto Supabase (Nicho 2)
2. Executar database_complete_schema.sql
3. Criar novo projeto EasyPanel
4. Usar NOVAS credenciais do Supabase B
5. Deploy!
```

**Tempo total:** ~10 minutos por nicho

---

## 📁 Arquivos Importantes

```
viva-rastrea/
├─ 📄 .env.example              ← Template de variáveis
├─ 📄 .env                      ← Suas credenciais (local)
├─ 🐳 Dockerfile                ← Configuração Docker
├─ 📄 nginx.conf                ← Servidor web
├─ 📘 EASYPANEL_SETUP.md        ← Guia completo
├─ ✅ DEPLOY_CHECKLIST.md       ← Checklist passo a passo
├─ 📄 easypanel.config.example  ← Exemplo de config
├─ 🗄️ database_complete_schema.sql ← Schema do banco
└─ 🔧 setup-env.bat/sh          ← Script de configuração
```

---

## ⚡ Comandos Úteis

### Desenvolvimento Local

```bash
# Configurar variáveis (Windows)
setup-env.bat

# Configurar variáveis (Linux/Mac)
chmod +x setup-env.sh
./setup-env.sh

# Instalar dependências
npm install

# Rodar localmente
npm run dev

# Build local
npm run build
```

### Teste Docker Local

```bash
# Build com variáveis
docker build \
  --build-arg VITE_SUPABASE_URL=https://xxx.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=eyJ... \
  -t viva-rastrea .

# Rodar container
docker run -p 8080:80 viva-rastrea

# Acessar
http://localhost:8080
```

---

## 🛡️ Segurança

### ✅ FAÇA:
- Use apenas a **Anon Key** (pública)
- Adicione `.env` ao `.gitignore`
- Configure **RLS** no Supabase
- Use **HTTPS** em produção

### ❌ NÃO FAÇA:
- Commitar arquivo `.env`
- Usar **Service Role Key** no frontend
- Desabilitar RLS sem necessidade
- Compartilhar credenciais publicamente

---

## 🆘 Problemas Comuns

### Build falha no EasyPanel

```
Erro: "Variáveis não configuradas"
Solução: ✅ Marcar como Build Arguments
```

### Aplicação não conecta

```
Erro: "Invalid credentials"
Solução: ✅ Verificar URL e Key no Supabase
```

### Página em branco

```
Erro: Nada aparece
Solução: ✅ Verificar console do navegador (F12)
```

---

## 📞 Recursos

| Recurso | Link |
|---------|------|
| Supabase Docs | https://supabase.com/docs |
| EasyPanel Docs | https://easypanel.io/docs |
| Guia Completo | [EASYPANEL_SETUP.md](./EASYPANEL_SETUP.md) |
| Checklist | [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) |

---

## ✨ Resultado Final

Após seguir este guia, você terá:

- ✅ Aplicação rodando em produção
- ✅ Backend Supabase configurado
- ✅ Deploy automatizado no EasyPanel
- ✅ HTTPS configurado automaticamente
- ✅ Fácil replicação para outros nichos

**Tempo total:** ~15 minutos

---

**Última atualização:** Janeiro 2026
**Versão:** 1.0
