# Atualiza o servidor de WhatsApp SEM precisar entrar na VPS antes.
#
# Por que este arquivo existe: o comando de deploy (`deploy-vps.sh`) mora
# DENTRO da VPS. Rodá-lo no PowerShell do PC responde
# "No such file or directory" — o caminho não existe aqui. Já aconteceu duas
# vezes. Este script faz a conexão e o deploy num passo só.
#
# Como usar (no PowerShell, dentro da pasta do projeto):
#
#   .\whatsapp-server\deploy-daqui.ps1
#
# Ele pede a senha de root da VPS — a senha é sua e não fica gravada em
# lugar nenhum deste repositório.

param(
  # Endereço da VPS. Só precisa mudar se o servidor mudar de máquina.
  [string]$Servidor = "root@179.199.148.87",
  [switch]$SemConferir
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Atualizando o servidor de WhatsApp em $Servidor" -ForegroundColor Cyan
Write-Host "A senha pedida a seguir e a de root da VPS." -ForegroundColor DarkGray
Write-Host ""

ssh $Servidor "bash /opt/balao2026/whatsapp-server/deploy-vps.sh"

if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "O deploy nao terminou bem (codigo $LASTEXITCODE)." -ForegroundColor Red
  Write-Host "Para ver o que houve:  ssh $Servidor 'docker logs --tail 50 balao-whats'" -ForegroundColor DarkGray
  exit $LASTEXITCODE
}

if ($SemConferir) { exit 0 }

# O WhatsApp leva um ou dois minutos para abrir depois que o container sobe.
# Conferir antes disso mostra "loading" e parece que o deploy falhou.
Write-Host ""
Write-Host "Deploy feito. Esperando o WhatsApp conectar..." -ForegroundColor Cyan

for ($i = 1; $i -le 40; $i++) {
  Start-Sleep -Seconds 15
  try {
    $status = Invoke-RestMethod -Uri "https://srv1963897.hstgr.cloud/api/status" -TimeoutSec 10
  } catch {
    Write-Host "  ainda subindo..." -ForegroundColor DarkGray
    continue
  }

  if ($status.connected) {
    Write-Host ""
    Write-Host "Conectado. Numero: $($status.phoneNumber) - conversas: $($status.conversas.total)" -ForegroundColor Green
    Write-Host "Versao no ar: $($status.versao.hash)" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "Para repescar as fotos que ficaram sem arquivo:" -ForegroundColor Cyan
    Write-Host "  curl.exe -s https://srv1963897.hstgr.cloud/api/crm/midia/repescar" -ForegroundColor White
    exit 0
  }

  Write-Host "  estado: $($status.estado)" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "Passaram 10 minutos e o WhatsApp nao conectou." -ForegroundColor Yellow
Write-Host "Veja o QR Code em https://www.balao.info/crm ou os logs:" -ForegroundColor DarkGray
Write-Host "  ssh $Servidor 'docker logs --tail 80 balao-whats'" -ForegroundColor DarkGray
