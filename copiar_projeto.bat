@echo off
echo Copiando o projeto original do Claude para a nova pasta 'sistema kambam antigravity'...
if not exist "C:\Users\user\Documents\sistema kambam antigravity" mkdir "C:\Users\user\Documents\sistema kambam antigravity"
robocopy "c:\Users\user\Documents\balao2026-main\balao2026-main" "C:\Users\user\Documents\sistema kambam antigravity" /E /XD node_modules .next /R:1 /W:1
echo.
echo Cópia concluída com sucesso em C:\Users\user\Documents\sistema kambam antigravity
pause
