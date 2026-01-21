# 🔧 Configuração Específica para EasyPanel

## ⚠️ Problema Comum: Variáveis não sendo passadas

Se você está vendo o erro:
```
Uncaught Error: Variáveis de ambiente do Supabase não configuradas
```

Isso significa que o EasyPanel não está passando as variáveis corretamente para o Docker build.

---

## ✅ Solução: Configuração Passo a Passo

### 1️⃣ Vá para as Configurações do Projeto

No EasyPanel, navegue até:
```
Seu Projeto → Settings (Configurações)
```

---

### 2️⃣ Encontre a Seção "Environment Variables"

Procure por uma das seguintes seções:
- **Environment Variables**
- **Build Environment**
- **Build Args**
- **Docker Build Configuration**

---

### 3️⃣ Adicione as Variáveis

Adicione **EXATAMENTE** estas duas variáveis:

#### Variável 1:
```
Nome: VITE_SUPABASE_URL
Valor: https://giomnnxpgjrpwyjrkkwr.supabase.co
Tipo: Build Argument (ou Build-time)
```

#### Variável 2:
```
Nome: VITE_SUPABASE_ANON_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdpb21ubnhwZ2pycHd5anJra3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MTg1MzUsImV4cCI6MjA2Njk5NDUzNX0.L0WG0KW0keg2IwdraGVOmNxokIaZXNWrdCKty79bYv4
Tipo: Build Argument (ou Build-time)
```

---

### 4️⃣ Configuração Alternativa (Se não houver opção de Build Args)

Se o EasyPanel não tiver uma opção clara de "Build Arguments", tente:

#### Opção A: Adicionar como Environment Variables normais
```
VITE_SUPABASE_URL=https://giomnnxpgjrpwyjrkkwr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdpb21ubnhwZ2pycHd5anJra3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MTg1MzUsImV4cCI6MjA2Njk5NDUzNX0.L0WG0KW0keg2IwdraGVOmNxokIaZXNWrdCKty79bYv4
```

O Dockerfile atualizado agora aceita variáveis de ambas as formas.

---

### 5️⃣ Verificar Build Command

Certifique-se de que o Build Command está correto:

```
Build Command: npm run build
```

**OU** se o EasyPanel usar Docker diretamente, deixe em branco (o Dockerfile já tem o comando).

---

### 6️⃣ Fazer Rebuild

Após salvar as configurações:

1. **Delete o build anterior** (se houver)
2. Clique em **"Rebuild"** ou **"Deploy"**
3. **Acompanhe os logs** do build

---

## 🔍 Verificar nos Logs

Durante o build, você deve ver algo como:

```
Building with VITE_SUPABASE_URL: https://giomnnxpgjrpwyjrkkwr...
✓ built in XX.XXs
```

Se ver:
```
ERROR: Environment variables not set!
```

Significa que as variáveis ainda não estão sendo passadas corretamente.

---

## 🎯 Checklist de Verificação

- [ ] Variáveis adicionadas na seção correta do EasyPanel
- [ ] Nomes das variáveis estão **exatamente** como: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- [ ] Valores copiados corretamente (sem espaços extras)
- [ ] Build command configurado
- [ ] Rebuild feito após salvar configurações
- [ ] Logs verificados

---

## 🔧 Configuração Avançada (Se nada funcionar)

Se mesmo assim não funcionar, podemos criar um arquivo `.env` diretamente no build:

### Criar script de build personalizado:

1. Crie arquivo `build.sh` na raiz:

```bash
#!/bin/sh
echo "VITE_SUPABASE_URL=$VITE_SUPABASE_URL" > .env
echo "VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY" >> .env
npm run build
```

2. Modifique o Dockerfile para usar o script:

```dockerfile
RUN chmod +x build.sh && ./build.sh
```

---

## 📸 Interface do EasyPanel

A interface pode variar, mas geralmente é assim:

```
┌─────────────────────────────────────────────────┐
│ Environment Variables                           │
├─────────────────────────────────────────────────┤
│                                                 │
│ [+] Add Variable                                │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Name: VITE_SUPABASE_URL                     │ │
│ │ Value: https://giomnnxpgjrpwyjrkkwr...      │ │
│ │ ☑ Available at build time                   │ │
│ │ ☐ Secret                                    │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Name: VITE_SUPABASE_ANON_KEY                │ │
│ │ Value: eyJhbGciOiJIUzI1NiIsInR5cCI6...      │ │
│ │ ☑ Available at build time                   │ │
│ │ ☐ Secret                                    │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [Save]                                          │
└─────────────────────────────────────────────────┘
```

**IMPORTANTE:** Marque **"Available at build time"** ou similar!

---

## 🆘 Ainda não funciona?

Se depois de tudo isso ainda não funcionar:

1. **Tire um print** da tela de configuração de variáveis
2. **Copie os logs** completos do build
3. **Verifique** se o EasyPanel suporta Docker build args

Algumas plataformas têm limitações específicas.

---

## 📞 Alternativas

Se o EasyPanel não suportar build args adequadamente:

1. **Vercel** - Suporte nativo a variáveis de ambiente
2. **Netlify** - Configuração simples de env vars
3. **Railway** - Excelente suporte a Docker
4. **Render** - Fácil configuração

---

**Última atualização:** Janeiro 2026
