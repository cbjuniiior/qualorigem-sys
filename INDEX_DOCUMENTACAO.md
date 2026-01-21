# 📚 Índice de Documentação - Deploy e Configuração

Este arquivo serve como índice para toda a documentação relacionada a deploy e configuração do sistema.

---

## 🎯 Guias Principais

### 1. [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) ⚡
**Para quem:** Iniciantes ou quem quer deploy rápido  
**Tempo:** 5 minutos de leitura  
**Conteúdo:**
- Visão geral do fluxo de deploy
- Passo a passo simplificado
- Diagramas visuais
- Comandos úteis

**👉 Comece por aqui se é sua primeira vez!**

---

### 2. [EASYPANEL_SETUP.md](./EASYPANEL_SETUP.md) 📘
**Para quem:** Quem quer entender todos os detalhes  
**Tempo:** 15 minutos de leitura  
**Conteúdo:**
- Guia completo e detalhado
- Explicação de cada variável
- Troubleshooting extensivo
- Boas práticas de segurança
- Como replicar para outros nichos

**👉 Leia para entender profundamente o processo**

---

### 3. [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) ✅
**Para quem:** Quem está fazendo o deploy agora  
**Tempo:** Use durante o processo  
**Conteúdo:**
- Checklist passo a passo
- Itens para marcar
- Verificações pré e pós-deploy
- Troubleshooting rápido

**👉 Use como guia durante o deploy**

---

## 🔧 Arquivos de Configuração

### 4. [.env.example](./.env.example)
**Descrição:** Template de variáveis de ambiente  
**Uso:** Copie e preencha com suas credenciais

```bash
cp .env.example .env
# Edite .env com suas credenciais
```

---

### 5. [easypanel.config.example](./easypanel.config.example)
**Descrição:** Exemplo de configuração para EasyPanel  
**Uso:** Referência para configurar no painel do EasyPanel

---

### 6. [Dockerfile](./Dockerfile)
**Descrição:** Configuração Docker com suporte a variáveis de ambiente  
**Uso:** Usado automaticamente pelo EasyPanel

---

## 🛠️ Scripts de Configuração

### 7. [setup-env.bat](./setup-env.bat) (Windows)
**Descrição:** Script interativo para configurar variáveis de ambiente  
**Uso:**
```bash
setup-env.bat
```

---

### 8. [setup-env.sh](./setup-env.sh) (Linux/Mac)
**Descrição:** Script interativo para configurar variáveis de ambiente  
**Uso:**
```bash
chmod +x setup-env.sh
./setup-env.sh
```

---

## 📋 Templates e Referências

### 9. [TEMPLATE_NOVO_NICHO.md](./TEMPLATE_NOVO_NICHO.md)
**Descrição:** Template para documentar cada nova instância  
**Uso:** Copie e preencha ao criar deploy para novo nicho

---

## 🗄️ Banco de Dados

### 10. [database_complete_schema.sql](./database_complete_schema.sql)
**Descrição:** Schema completo do banco de dados  
**Uso:** Execute no Supabase SQL Editor

---

### 11. [DATABASE_SCHEMA_README.md](./DATABASE_SCHEMA_README.md)
**Descrição:** Documentação do schema do banco  
**Uso:** Referência para entender a estrutura

---

### 12. [STORAGE_BUCKETS_GUIDE.md](./STORAGE_BUCKETS_GUIDE.md)
**Descrição:** Guia de configuração de storage  
**Uso:** Configure buckets no Supabase

---

## 📖 Outros Guias

### 13. [README.md](./README.md)
**Descrição:** Documentação geral do projeto  
**Uso:** Visão geral e instruções gerais

---

### 14. [SETUP.md](./SETUP.md)
**Descrição:** Guia de configuração inicial  
**Uso:** Configuração do ambiente de desenvolvimento

---

### 15. [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)
**Descrição:** Guia rápido de uso do sistema  
**Uso:** Primeiros passos após deploy

---

## 🚀 Fluxo Recomendado

### Para Deploy Inicial:

```
1. Leia: QUICK_DEPLOY.md (visão geral)
   ↓
2. Siga: DEPLOY_CHECKLIST.md (passo a passo)
   ↓
3. Configure: .env (use setup-env.bat/sh)
   ↓
4. Execute: database_complete_schema.sql no Supabase
   ↓
5. Deploy: Configure no EasyPanel
   ↓
6. Documente: Use TEMPLATE_NOVO_NICHO.md
```

### Para Replicar para Outro Nicho:

```
1. Revise: EASYPANEL_SETUP.md (seção "Replicando")
   ↓
2. Crie: Novo projeto Supabase
   ↓
3. Execute: database_complete_schema.sql
   ↓
4. Use: DEPLOY_CHECKLIST.md novamente
   ↓
5. Documente: TEMPLATE_NOVO_NICHO.md
```

### Para Desenvolvimento Local:

```
1. Clone o repositório
   ↓
2. Execute: setup-env.bat/sh
   ↓
3. Leia: SETUP.md
   ↓
4. Execute: npm install && npm run dev
```

---

## 🆘 Onde Encontrar Ajuda

| Problema | Documento |
|----------|-----------|
| Erro no build | [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md#-troubleshooting) |
| Configurar variáveis | [EASYPANEL_SETUP.md](./EASYPANEL_SETUP.md#-variáveis-de-ambiente-necessárias) |
| Entender o banco | [DATABASE_SCHEMA_README.md](./DATABASE_SCHEMA_README.md) |
| Configurar storage | [STORAGE_BUCKETS_GUIDE.md](./STORAGE_BUCKETS_GUIDE.md) |
| Deploy rápido | [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) |
| Replicar sistema | [EASYPANEL_SETUP.md](./EASYPANEL_SETUP.md#-replicando-para-outro-nichodomínio) |

---

## 📊 Estrutura de Arquivos

```
viva-rastrea/
├─ 📘 Documentação de Deploy
│  ├─ QUICK_DEPLOY.md              ← Guia rápido visual
│  ├─ EASYPANEL_SETUP.md           ← Guia completo
│  ├─ DEPLOY_CHECKLIST.md          ← Checklist passo a passo
│  └─ INDEX_DOCUMENTACAO.md        ← Este arquivo
│
├─ 🔧 Configuração
│  ├─ .env.example                 ← Template de variáveis
│  ├─ .env                         ← Suas credenciais (não commitar)
│  ├─ easypanel.config.example     ← Exemplo EasyPanel
│  ├─ Dockerfile                   ← Config Docker
│  └─ nginx.conf                   ← Config servidor web
│
├─ 🛠️ Scripts
│  ├─ setup-env.bat                ← Setup Windows
│  └─ setup-env.sh                 ← Setup Linux/Mac
│
├─ 📋 Templates
│  └─ TEMPLATE_NOVO_NICHO.md       ← Template para novos nichos
│
├─ 🗄️ Banco de Dados
│  ├─ database_complete_schema.sql ← Schema completo
│  ├─ DATABASE_SCHEMA_README.md    ← Documentação do schema
│  └─ STORAGE_BUCKETS_GUIDE.md     ← Guia de storage
│
└─ 📖 Geral
   ├─ README.md                    ← Documentação geral
   ├─ SETUP.md                     ← Setup inicial
   └─ QUICK_START_GUIDE.md         ← Guia de uso
```

---

## ✨ Dicas Rápidas

### 🎯 Primeira vez fazendo deploy?
→ Leia [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

### 🔧 Configurando agora?
→ Use [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)

### 🔄 Replicando para outro nicho?
→ Veja [EASYPANEL_SETUP.md](./EASYPANEL_SETUP.md#-replicando-para-outro-nichodomínio)

### ❌ Algo deu errado?
→ Troubleshooting em [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md#-troubleshooting)

### 💻 Desenvolvimento local?
→ Execute `setup-env.bat` (Windows) ou `setup-env.sh` (Linux/Mac)

---

## 📞 Recursos Externos

- [Supabase Documentation](https://supabase.com/docs)
- [EasyPanel Documentation](https://easypanel.io/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Docker Build Arguments](https://docs.docker.com/engine/reference/builder/#arg)

---

**Última atualização:** Janeiro 2026  
**Versão:** 1.0
