@echo off
chcp 65001 >nul
title Balao da Informatica - Servidor WhatsApp
cd /d "%~dp0"

echo ============================================
echo  Balao da Informatica - Servidor WhatsApp
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 goto sem_node

if exist "node_modules" goto ligar

echo Primeira vez: instalando dependencias...
echo Isso demora alguns minutos. Nao feche esta janela.
echo.
call npm install
if errorlevel 1 goto erro_install
if not exist "node_modules" goto erro_install
echo.

:ligar
echo Ligando o servidor...
echo.
echo   Deixe esta janela ABERTA enquanto a loja estiver atendendo.
echo   Fechar a janela desconecta o WhatsApp de todos os vendedores.
echo.
echo   Para ler o QR Code, abra www.balao.info/crm
echo.

:loop
node server.js
echo.
echo [!] O servidor parou. Reiniciando em 5 segundos...
echo     Para nao reiniciar, feche esta janela agora.
ping -n 6 127.0.0.1 >nul
goto loop

:sem_node
echo [ERRO] O Node.js nao esta instalado neste computador.
echo.
echo Baixe a versao LTS em https://nodejs.org e instale.
echo Depois abra este atalho de novo.
echo.
pause
exit /b 1

:erro_install
echo.
echo [ERRO] Falha ao instalar as dependencias.
echo.
echo Confira se este computador tem internet e tente de novo.
echo.
pause
exit /b 1