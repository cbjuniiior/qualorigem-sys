# 📦 Configuração de Storage Buckets - Viva Rastrea

## 🎯 Visão Geral

O sistema **Viva Rastrea** utiliza **2 buckets** do Supabase Storage para armazenar imagens e arquivos:

1. **propriedades** - Imagens de propriedades, lotes e produtos
2. **branding** - Logos de marcas, produtores, indústrias e associações

---

## 📊 Buckets Configurados

### 1. Bucket: `propriedades`

**Propósito**: Armazenar imagens de propriedades rurais, lotes de produtos e fotos gerais.

**Configurações**:
- **ID**: `propriedades`
- **Nome**: `propriedades`
- **Público**: ✅ Sim (acesso público para leitura)
- **Limite de tamanho**: 5 MB por arquivo
- **Tipos MIME permitidos**:
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`
  - `image/gif`

**Usado em**:
- Fotos de propriedades rurais
- Imagens de lotes de produtos
- Fotos de componentes de blend
- Imagens gerais do sistema

**Exemplo de uso no código**:
```typescript
import { uploadImageToSupabase } from '@/services/upload';

// Upload para bucket 'propriedades' (padrão)
const imageUrl = await uploadImageToSupabase(file);

// Ou especificando explicitamente
const imageUrl = await uploadImageToSupabase(file, 'propriedades');
```

---

### 2. Bucket: `branding`

**Propósito**: Armazenar logos e imagens de branding.

**Configurações**:
- **ID**: `branding`
- **Nome**: `branding`
- **Público**: ✅ Sim (acesso público para leitura)
- **Limite de tamanho**: 2 MB por arquivo
- **Tipos MIME permitidos**:
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`
  - `image/svg+xml` (SVG para logos vetoriais)

**Usado em**:
- Logos de marcas
- Logos de produtores
- Logos de indústrias
- Logos de associações
- Fotos de perfil

**Exemplo de uso no código**:
```typescript
import { uploadLogoToSupabase } from '@/services/upload';

// Upload de logo (usa bucket 'branding')
const logoUrl = await uploadLogoToSupabase(file);
```

---

## 🔒 Políticas de Segurança (RLS)

### Leitura Pública ✅

**Política**: `Public Access`
- **Ação**: SELECT (visualizar)
- **Quem**: Qualquer pessoa (público)
- **Buckets**: `propriedades`, `branding`

```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id IN ('propriedades', 'branding'));
```

**Resultado**: Qualquer pessoa pode visualizar as imagens via URL pública.

---

### Upload Autenticado 🔐

**Política**: `Authenticated users can upload`
- **Ação**: INSERT (fazer upload)
- **Quem**: Usuários autenticados
- **Buckets**: `propriedades`, `branding`

```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('propriedades', 'branding'));
```

**Resultado**: Apenas usuários logados podem fazer upload de arquivos.

---

### Atualização Autenticada 🔐

**Política**: `Authenticated users can update`
- **Ação**: UPDATE (atualizar)
- **Quem**: Usuários autenticados
- **Buckets**: `propriedades`, `branding`

```sql
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id IN ('propriedades', 'branding'));
```

**Resultado**: Usuários logados podem atualizar arquivos existentes.

---

### Exclusão Autenticada 🔐

**Política**: `Authenticated users can delete`
- **Ação**: DELETE (deletar)
- **Quem**: Usuários autenticados
- **Buckets**: `propriedades`, `branding`

```sql
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('propriedades', 'branding'));
```

**Resultado**: Usuários logados podem deletar arquivos.

---

## 🚀 Como os Buckets São Criados

### Automático via SQL

Os buckets são criados automaticamente quando você executa o arquivo `database_complete_schema.sql`:

```sql
-- Criar bucket para imagens de propriedades e lotes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'propriedades',
    'propriedades',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Criar bucket para logos e branding
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'branding',
    'branding',
    true,
    2097152, -- 2MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;
```

### Manual via Supabase Dashboard

Se preferir criar manualmente:

1. Acesse o **Supabase Dashboard**
2. Vá em **Storage** no menu lateral
3. Clique em **New bucket**
4. Configure conforme especificado acima

---

## 📁 Estrutura de Arquivos

### Bucket: `propriedades`

```
propriedades/
├── 1737456789-abc123.jpg    (foto de propriedade)
├── 1737456790-def456.png    (foto de lote)
├── 1737456791-ghi789.webp   (foto de componente)
└── ...
```

**Formato do nome**: `{timestamp}-{random}.{ext}`

### Bucket: `branding`

```
branding/
├── logo-1737456789.png      (logo de marca)
├── logo-1737456790.svg      (logo vetorial)
├── logo-1737456791.jpg      (logo de produtor)
└── ...
```

**Formato do nome**: `logo-{timestamp}.{ext}`

---

## 🔧 Funções de Upload

### 1. `uploadImageToSupabase()`

Faz upload de uma imagem para um bucket (padrão: `propriedades`).

**Parâmetros**:
- `file: File` - Arquivo a ser enviado
- `bucketName: string = 'propriedades'` - Nome do bucket (opcional)

**Retorna**: `Promise<string>` - URL pública da imagem

**Recursos**:
- ✅ Redimensiona imagens maiores que 500px
- ✅ Mantém proporção original
- ✅ Compressão com qualidade 80%
- ✅ Gera nome único automaticamente
- ✅ Retorna URL pública

**Exemplo**:
```typescript
const imageUrl = await uploadImageToSupabase(file);
// Retorna: https://giomnnxpgjrpwyjrkkwr.supabase.co/storage/v1/object/public/propriedades/1737456789-abc123.jpg
```

---

### 2. `uploadLogoToSupabase()`

Faz upload de um logo para o bucket `branding`.

**Parâmetros**:
- `file: File` - Arquivo de logo a ser enviado

**Retorna**: `Promise<string>` - URL pública do logo

**Recursos**:
- ✅ Redimensiona logos maiores que 500px
- ✅ Mantém proporção original
- ✅ Compressão com qualidade 80%
- ✅ Prefixo `logo-` no nome
- ✅ Fallback para bucket `propriedades` se falhar
- ✅ Retorna URL pública

**Exemplo**:
```typescript
const logoUrl = await uploadLogoToSupabase(file);
// Retorna: https://giomnnxpgjrpwyjrkkwr.supabase.co/storage/v1/object/public/branding/logo-1737456789.png
```

---

## 📊 Limites e Restrições

### Tamanhos Máximos

| Bucket | Tamanho Máximo | Observação |
|--------|----------------|------------|
| `propriedades` | 5 MB | Imagens são redimensionadas |
| `branding` | 2 MB | Logos são redimensionados |

### Tipos de Arquivo Aceitos

| Bucket | Formatos |
|--------|----------|
| `propriedades` | JPEG, JPG, PNG, WebP, GIF |
| `branding` | JPEG, JPG, PNG, WebP, SVG |

### Redimensionamento Automático

- **Largura máxima**: 500px
- **Altura**: Proporcional (mantém aspect ratio)
- **Qualidade**: 80%
- **Formato**: Mantém o original

---

## 🔍 Verificar Buckets Criados

### Via SQL

```sql
-- Listar todos os buckets
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- Verificar políticas dos buckets
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects';
```

### Via Supabase Dashboard

1. Acesse **Storage** no menu lateral
2. Você verá os buckets `propriedades` e `branding`
3. Clique em cada um para ver os arquivos

---

## 🌐 URLs Públicas

### Formato da URL

```
https://{PROJECT_ID}.supabase.co/storage/v1/object/public/{BUCKET_NAME}/{FILE_PATH}
```

### Exemplo Real

```
https://giomnnxpgjrpwyjrkkwr.supabase.co/storage/v1/object/public/propriedades/1737456789-abc123.jpg
```

**Componentes**:
- `giomnnxpgjrpwyjrkkwr` - Project ID
- `propriedades` - Bucket name
- `1737456789-abc123.jpg` - File path

---

## 🛠️ Gerenciamento de Arquivos

### Listar Arquivos de um Bucket

```typescript
const { data, error } = await supabase
  .storage
  .from('propriedades')
  .list();
```

### Deletar Arquivo

```typescript
const { error } = await supabase
  .storage
  .from('propriedades')
  .remove(['1737456789-abc123.jpg']);
```

### Obter URL Pública

```typescript
const { data } = supabase
  .storage
  .from('propriedades')
  .getPublicUrl('1737456789-abc123.jpg');

console.log(data.publicUrl);
```

---

## ⚠️ Notas Importantes

### 1. Buckets Públicos

Ambos os buckets são **públicos** para leitura:
- ✅ Qualquer pessoa pode ver as imagens via URL
- ✅ Ideal para fotos de produtos que serão compartilhadas
- ❌ Não armazene informações sensíveis

### 2. Autenticação para Upload

- ✅ Apenas usuários autenticados podem fazer upload
- ✅ Protege contra spam e uso indevido
- ✅ Mantém controle sobre quem adiciona conteúdo

### 3. Redimensionamento

- ✅ Imagens são automaticamente redimensionadas
- ✅ Economiza espaço de armazenamento
- ✅ Melhora performance de carregamento
- ⚠️ Imagens originais não são mantidas

### 4. Nomes de Arquivo

- ✅ Nomes são gerados automaticamente
- ✅ Evita conflitos de nome
- ✅ Inclui timestamp para ordenação
- ⚠️ Nomes originais não são preservados

---

## 🔄 Migração de Dados

Se você já tem um sistema com imagens:

### 1. Exportar URLs Antigas

```sql
SELECT id, image_url FROM product_lots WHERE image_url IS NOT NULL;
```

### 2. Fazer Upload para Supabase

```typescript
// Para cada imagem antiga
const response = await fetch(oldImageUrl);
const blob = await response.blob();
const file = new File([blob], 'image.jpg');
const newUrl = await uploadImageToSupabase(file);

// Atualizar banco
await supabase
  .from('product_lots')
  .update({ image_url: newUrl })
  .eq('id', lotId);
```

---

## 📞 Troubleshooting

### Erro: "Bucket não existe"

**Solução**: Execute o SQL de criação dos buckets:
```sql
-- Ver seção "Como os Buckets São Criados"
```

### Erro: "Arquivo muito grande"

**Solução**: 
- Bucket `propriedades`: máximo 5MB
- Bucket `branding`: máximo 2MB
- Redimensione antes do upload

### Erro: "Tipo de arquivo não permitido"

**Solução**: Verifique os tipos MIME permitidos:
- `propriedades`: JPEG, PNG, WebP, GIF
- `branding`: JPEG, PNG, WebP, SVG

### Erro: "Não autorizado para upload"

**Solução**: Certifique-se de que o usuário está autenticado:
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  // Redirecionar para login
}
```

---

## ✅ Checklist de Configuração

- [ ] Executar `database_complete_schema.sql`
- [ ] Verificar se buckets foram criados
- [ ] Testar upload de imagem
- [ ] Testar upload de logo
- [ ] Verificar URLs públicas funcionando
- [ ] Confirmar políticas RLS ativas
- [ ] Testar acesso público (sem autenticação)
- [ ] Testar upload autenticado

---

## 📚 Recursos Adicionais

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage RLS Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [Image Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations)

---

**Última atualização**: 2026-01-21  
**Versão**: 1.0  
**Buckets**: 2 (propriedades, branding)
