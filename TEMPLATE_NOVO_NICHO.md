# 🔧 Template para Novo Nicho

Use este template ao criar uma nova instância do sistema para outro nicho/domínio.

---

## 📝 Informações do Novo Nicho

**Nome do Nicho:** _[Ex: Vinhos Artesanais]_

**Domínio:** _[Ex: vinhos-artesanais.com]_

**Descrição:** _[Breve descrição do nicho]_

---

## 🔑 Credenciais Supabase

### Projeto Supabase

- **Nome do Projeto:** _[Ex: vinhos-artesanais-prod]_
- **URL:** `https://____________.supabase.co`
- **Anon Key:** `eyJ____________`
- **Data de Criação:** _[DD/MM/AAAA]_

### Configuração

- [ ] Database schema aplicado
- [ ] Storage buckets criados
- [ ] RLS policies ativadas
- [ ] Autenticação configurada
- [ ] Primeiro usuário admin criado

---

## 🚀 Deploy EasyPanel

### Informações do Deploy

- **Nome do Projeto:** _[Ex: vinhos-artesanais]_
- **URL EasyPanel:** `https://____________.easypanel.host`
- **Domínio Personalizado:** _[Se aplicável]_
- **Data de Deploy:** _[DD/MM/AAAA]_

### Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://____________.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ____________
```

### Status

- [ ] Build concluído com sucesso
- [ ] Aplicação acessível
- [ ] Conexão com Supabase OK
- [ ] Testes básicos realizados

---

## 🎨 Personalizações Realizadas

### Branding

- [ ] Logo atualizado (`/public/logo.svg`)
- [ ] Favicon atualizado (`/public/favicon.ico`)
- [ ] Título da aplicação atualizado
- [ ] Cores do tema ajustadas (se necessário)

### Conteúdo

- [ ] Textos da landing page atualizados
- [ ] Descrições ajustadas para o nicho
- [ ] Imagens substituídas (se necessário)
- [ ] Termos de uso/privacidade atualizados

### Configurações

- [ ] Nome da aplicação no `package.json`
- [ ] Metadados SEO atualizados
- [ ] Analytics configurado (se aplicável)

---

## 👥 Usuários Iniciais

### Administrador

- **Email:** _[admin@exemplo.com]_
- **Nome:** _[Nome do Admin]_
- **Criado em:** _[DD/MM/AAAA]_

### Produtores de Teste

1. **Produtor 1**
   - Email: _[produtor1@exemplo.com]_
   - Nome: _[Nome]_

2. **Produtor 2**
   - Email: _[produtor2@exemplo.com]_
   - Nome: _[Nome]_

---

## 📊 Dados Iniciais

### Produtores Cadastrados

- [ ] Produtor 1: _[Nome]_
- [ ] Produtor 2: _[Nome]_
- [ ] Produtor 3: _[Nome]_

### Lotes de Teste

- [ ] Lote 1: _[Código]_
- [ ] Lote 2: _[Código]_
- [ ] Lote 3: _[Código]_

---

## 🔒 Segurança

### Checklist de Segurança

- [ ] RLS ativado em todas as tabelas
- [ ] Políticas de acesso configuradas
- [ ] Apenas Anon Key em uso (não Service Role)
- [ ] HTTPS ativo
- [ ] Backup automático configurado no Supabase
- [ ] Variáveis de ambiente não commitadas

### Backup

- **Frequência:** _[Ex: Diário]_
- **Localização:** _[Ex: Supabase automático]_
- **Último backup:** _[DD/MM/AAAA]_

---

## 📈 Monitoramento

### Métricas

- **Ferramenta:** _[Ex: Supabase Dashboard, Google Analytics]_
- **Configurado em:** _[DD/MM/AAAA]_

### Alertas

- [ ] Alertas de erro configurados
- [ ] Monitoramento de uptime
- [ ] Notificações de uso excessivo

---

## 📞 Contatos

### Responsáveis

**Técnico:**
- Nome: _[Nome]_
- Email: _[email@exemplo.com]_
- Telefone: _[+55 XX XXXXX-XXXX]_

**Negócio:**
- Nome: _[Nome]_
- Email: _[email@exemplo.com]_
- Telefone: _[+55 XX XXXXX-XXXX]_

---

## 📝 Notas Adicionais

_[Adicione aqui qualquer informação específica deste nicho, customizações especiais, integrações, etc.]_

---

## 🔄 Histórico de Atualizações

| Data | Versão | Descrição |
|------|--------|-----------|
| DD/MM/AAAA | 1.0.0 | Deploy inicial |
| | | |
| | | |

---

## 📚 Documentação

- [Guia de Deploy](./EASYPANEL_SETUP.md)
- [Checklist de Deploy](./DEPLOY_CHECKLIST.md)
- [Guia Rápido](./QUICK_DEPLOY.md)
- [Schema do Banco](./DATABASE_SCHEMA_README.md)
- [Configuração de Storage](./STORAGE_BUCKETS_GUIDE.md)

---

## ✅ Status Geral

- [ ] **Desenvolvimento:** Concluído
- [ ] **Testes:** Aprovado
- [ ] **Deploy:** Concluído
- [ ] **Produção:** Ativo
- [ ] **Documentação:** Completa

---

**Template criado em:** Janeiro 2026  
**Última atualização:** _[DD/MM/AAAA]_
