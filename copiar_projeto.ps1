Write-Host "Copiando o projeto original do Claude para 'sistema kambam antigravity'..." -ForegroundColor Cyan
$origem = "c:\Users\user\Documents\balao2026-main\balao2026-main"
$destino = "C:\Users\user\Documents\sistema kambam antigravity"

if (!(Test-Path $destino)) {
    New-Item -ItemType Directory -Path $destino -Force | Out-Null
}

robocopy $origem $destino /E /XD node_modules .next /R:1 /W:1

Write-Host "Cópia concluída com sucesso em: $destino" -ForegroundColor Green
