#!/bin/bash

# Script de configuração de variáveis de ambiente para Viva Rastrea
# Este script ajuda a configurar rapidamente as variáveis de ambiente necessárias

echo "🚀 Configuração de Variáveis de Ambiente - Viva Rastrea"
echo "========================================================"
echo ""

# Verificar se .env já existe
if [ -f .env ]; then
    echo "⚠️  Arquivo .env já existe!"
    read -p "Deseja sobrescrever? (s/N): " overwrite
    if [ "$overwrite" != "s" ] && [ "$overwrite" != "S" ]; then
        echo "❌ Operação cancelada."
        exit 0
    fi
fi

echo ""
echo "📝 Por favor, forneça as credenciais do Supabase:"
echo ""
echo "Você pode encontrar essas informações em:"
echo "Supabase Dashboard → Settings → API"
echo ""

# Solicitar URL do Supabase
read -p "🔗 VITE_SUPABASE_URL (ex: https://seu-projeto.supabase.co): " supabase_url

# Validar URL
if [[ ! $supabase_url =~ ^https:// ]]; then
    echo "❌ URL inválida. Deve começar com https://"
    exit 1
fi

# Solicitar Anon Key
read -p "🔑 VITE_SUPABASE_ANON_KEY: " supabase_key

# Validar se não está vazio
if [ -z "$supabase_key" ]; then
    echo "❌ A chave não pode estar vazia."
    exit 1
fi

# Criar arquivo .env
cat > .env << EOF
# Supabase Configuration
# Gerado automaticamente em $(date)

VITE_SUPABASE_URL=$supabase_url
VITE_SUPABASE_ANON_KEY=$supabase_key
EOF

echo ""
echo "✅ Arquivo .env criado com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Verifique o arquivo .env"
echo "   2. Execute: npm install"
echo "   3. Execute: npm run dev"
echo ""
echo "🐳 Para build Docker:"
echo "   docker build \\"
echo "     --build-arg VITE_SUPABASE_URL=$supabase_url \\"
echo "     --build-arg VITE_SUPABASE_ANON_KEY=*** \\"
echo "     -t viva-rastrea ."
echo ""
echo "📚 Para mais informações, consulte EASYPANEL_SETUP.md"
echo ""
