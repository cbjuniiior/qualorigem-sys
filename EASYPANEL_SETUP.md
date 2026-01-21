# Guia de Configuração - EasyPanel

Este guia explica como configurar e implantar o **Viva Rastrea** no EasyPanel usando variáveis de ambiente, permitindo replicar facilmente o sistema para diferentes nichos e domínios.

## 📋 Pré-requisitos

1. Conta no [Supabase](https://supabase.com)
2. Conta no [EasyPanel](https://easypanel.io)
3. Projeto Supabase configurado com o schema do banco de dados

---

## 🔑 Variáveis de Ambiente Necessárias

O sistema requer as seguintes variáveis de ambiente para funcionar:

| Variável | Descrição | Onde Encontrar |
|----------|-----------|----------------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | Supabase Dashboard → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Chave pública (anon key) | Supabase Dashboard → Settings → API → Project API keys → anon/public |

---

## 🚀 Configuração no EasyPanel

### Passo 1: Criar Novo Projeto

1. Acesse o EasyPanel
2. Clique em **"Create Project"**
3. Selecione **"From GitHub"** (ou seu repositório Git)
4. Conecte o repositório do Viva Rastrea

### Passo 2: Configurar Build Settings

No EasyPanel, configure as seguintes opções:

**Build Configuration:**
- **Build Command:** `npm run build`
- **Build Context:** `/` (raiz do projeto)
- **Dockerfile:** `Dockerfile` (usar o Dockerfile existente)

### Passo 3: Configurar Variáveis de Ambiente

Na seção **"Environment Variables"** do EasyPanel, adicione:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

**⚠️ IMPORTANTE:** 
- Essas variáveis são **Build-time variables** (usadas durante o build)
- No EasyPanel, certifique-se de marcá-las como **"Build Arguments"**
- Nunca compartilhe a Service Role Key publicamente

### Passo 4: Configurar Build Arguments

No EasyPanel, na seção de **Docker Build**, adicione os seguintes **Build Arguments**:

```
VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
```

Isso permite que as variáveis de ambiente sejam passadas para o Docker durante o build.

### Passo 5: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar
3. Acesse a URL fornecida pelo EasyPanel

---

## 🔄 Replicando para Outro Nicho/Domínio

Para criar uma nova instância do sistema para outro nicho:

### 1. Criar Novo Projeto Supabase

1. Acesse [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Execute o script SQL completo: `database_complete_schema.sql`
4. Configure os Storage Buckets conforme `STORAGE_BUCKETS_GUIDE.md`
5. Anote a nova URL e Anon Key

### 2. Criar Nova Aplicação no EasyPanel

1. Clone ou faça fork do repositório
2. Crie um novo projeto no EasyPanel
3. Configure as variáveis de ambiente com as **novas credenciais** do Supabase
4. Deploy!

### 3. Personalização (Opcional)

Para personalizar para o novo nicho:
- Atualize logos e branding em `/public`
- Ajuste cores no `tailwind.config.ts`
- Modifique textos e labels conforme necessário

---

## 🛠️ Desenvolvimento Local

Para rodar localmente:

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd viva-rastrea
```

2. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

3. Edite `.env` com suas credenciais:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

4. Instale dependências e rode:
```bash
npm install
npm run dev
```

---

## 🐳 Build Local com Docker

Para testar o build Docker localmente:

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=https://seu-projeto.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui \
  -t viva-rastrea .

docker run -p 8080:80 viva-rastrea
```

Acesse: http://localhost:8080

---

## 📝 Checklist de Deploy

Antes de fazer deploy, verifique:

- [ ] Projeto Supabase criado e configurado
- [ ] Schema do banco de dados aplicado (`database_complete_schema.sql`)
- [ ] Storage Buckets configurados
- [ ] Variáveis de ambiente definidas no EasyPanel
- [ ] Build Arguments configurados corretamente
- [ ] Políticas RLS (Row Level Security) ativadas no Supabase
- [ ] Autenticação configurada no Supabase (Email, OAuth, etc.)

---

## 🔒 Segurança

**Boas Práticas:**

1. **Nunca commite** o arquivo `.env` no Git
2. Use apenas a **Anon Key** no frontend (nunca a Service Role Key)
3. Configure **RLS (Row Level Security)** em todas as tabelas
4. Use **HTTPS** em produção (EasyPanel fornece automaticamente)
5. Rotacione as chaves periodicamente

---

## 🆘 Troubleshooting

### Erro: "Variáveis de ambiente do Supabase não configuradas"

**Causa:** As variáveis `VITE_SUPABASE_URL` ou `VITE_SUPABASE_ANON_KEY` não foram definidas.

**Solução:** 
1. Verifique se as variáveis estão configuradas no EasyPanel
2. Certifique-se de que estão marcadas como **Build Arguments**
3. Faça um novo deploy

### Build falha no Docker

**Causa:** Build arguments não foram passados corretamente.

**Solução:**
1. Verifique a configuração de Build Arguments no EasyPanel
2. Certifique-se de que a sintaxe está correta: `${NOME_VARIAVEL}`

### Aplicação não conecta ao Supabase

**Causa:** URL ou chave incorretas.

**Solução:**
1. Verifique as credenciais no Supabase Dashboard
2. Confirme que a URL não tem barra final (`/`)
3. Verifique se o projeto Supabase está ativo

---

## 📚 Documentação Adicional

- [SETUP.md](./SETUP.md) - Guia de configuração inicial
- [DATABASE_SCHEMA_README.md](./DATABASE_SCHEMA_README.md) - Documentação do schema
- [STORAGE_BUCKETS_GUIDE.md](./STORAGE_BUCKETS_GUIDE.md) - Configuração de storage
- [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md) - Guia rápido de uso

---

## 💡 Dicas

1. **Múltiplos Ambientes:** Crie projetos separados no EasyPanel para dev/staging/prod
2. **Backup:** Faça backup regular do banco Supabase
3. **Monitoramento:** Use o dashboard do Supabase para monitorar uso e performance
4. **Logs:** Acesse os logs no EasyPanel para debug

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique a documentação do [Supabase](https://supabase.com/docs)
2. Consulte a documentação do [EasyPanel](https://easypanel.io/docs)
3. Revise os logs de build e runtime

---

**Última atualização:** Janeiro 2026
