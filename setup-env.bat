@echo off
REM Script de configuração de variáveis de ambiente para Viva Rastrea (Windows)
REM Este script ajuda a configurar rapidamente as variáveis de ambiente necessárias

echo.
echo ================================
echo Configuracao Viva Rastrea
echo ================================
echo.

REM Verificar se .env já existe
if exist .env (
    echo AVISO: Arquivo .env ja existe!
    set /p overwrite="Deseja sobrescrever? (s/N): "
    if /i not "%overwrite%"=="s" (
        echo Operacao cancelada.
        exit /b 0
    )
)

echo.
echo Por favor, forneca as credenciais do Supabase:
echo.
echo Voce pode encontrar essas informacoes em:
echo Supabase Dashboard - Settings - API
echo.

REM Solicitar URL do Supabase
set /p supabase_url="URL do Supabase (ex: https://seu-projeto.supabase.co): "

REM Solicitar Anon Key
set /p supabase_key="Anon Key do Supabase: "

REM Criar arquivo .env
(
echo # Supabase Configuration
echo # Gerado automaticamente em %date% %time%
echo.
echo VITE_SUPABASE_URL=%supabase_url%
echo VITE_SUPABASE_ANON_KEY=%supabase_key%
) > .env

echo.
echo Arquivo .env criado com sucesso!
echo.
echo Proximos passos:
echo   1. Verifique o arquivo .env
echo   2. Execute: npm install
echo   3. Execute: npm run dev
echo.
echo Para mais informacoes, consulte EASYPANEL_SETUP.md
echo.
pause
