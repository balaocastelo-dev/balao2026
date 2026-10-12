@echo off
rem Liga a JUL.IA nesta janela (para ver o que ela faz). O normal e a tarefa
rem \BalaoFabrica\JUL.IA, criada pelo instalar.ps1, que liga sozinha.
cd /d "%~dp0"
set PYTHONIOENCODING=utf-8
.venv\Scripts\python.exe julia.py %*
