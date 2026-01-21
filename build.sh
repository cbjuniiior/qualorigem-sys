#!/bin/sh

# Script de build para EasyPanel
# Este script garante que as variáveis de ambiente sejam usadas corretamente

echo "================================================"
echo "🚀 Build Script - Viva Rastrea"
echo "================================================"
echo ""

# Verificar se as variáveis estão definidas
if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "❌ ERRO: VITE_SUPABASE_URL não está definida!"
    echo "Configure esta variável no EasyPanel"
    exit 1
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ ERRO: VITE_SUPABASE_ANON_KEY não está definida!"
    echo "Configure esta variável no EasyPanel"
    exit 1
fi

# Mostrar informações (mascarando a chave)
echo "✅ Variáveis de ambiente detectadas:"
echo "   VITE_SUPABASE_URL: ${VITE_SUPABASE_URL:0:30}..."
echo "   VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY:0:20}..."
echo ""

# Criar arquivo .env para o build
echo "📝 Criando arquivo .env para o build..."
cat > .env << EOF
VITE_SUPABASE_URL=$VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
EOF

echo "✅ Arquivo .env criado"
echo ""

# Executar o build
echo "🔨 Iniciando build do Vite..."
npm run build

# Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo ""
    echo "================================================"
    echo "✅ Build concluído com sucesso!"
    echo "================================================"
else
    echo ""
    echo "================================================"
    echo "❌ Build falhou!"
    echo "================================================"
    exit 1
fi
