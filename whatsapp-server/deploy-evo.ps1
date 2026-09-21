# Troca o WhatsApp da loja para a Evolution API, direto do PowerShell do PC.
#
# Como usar (no PowerShell, dentro da pasta do projeto):
#
#   .\whatsapp-server\deploy-evo.ps1            # instala / atualiza
#   .\whatsapp-server\deploy-evo.ps1 -Voltar    # volta para o servidor antigo
#
# Ele pede a senha de root da VPS (a senha é digitada por você e não fica
# gravada em lugar nenhum).

param(
  [string]$Servidor = "root@179.199.148.87",
  [switch]$Voltar
)

$ErrorActionPreference = "Stop"
$atualizar = "git -C /opt/balao2026 fetch origin main --depth=1 && git -C /opt/balao2026 reset --hard origin/main"

if ($Voltar) {
  Write-Host "Voltando para o servidor antigo em $Servidor" -ForegroundColor Yellow
  ssh $Servidor "bash /opt/balao2026/whatsapp-server/deploy-evo.sh voltar"
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Instalando/atualizando o WhatsApp (Evolution) em $Servidor" -ForegroundColor Cyan
Write-Host "A senha pedida a seguir e a de root da VPS." -ForegroundColor DarkGray
Write-Host ""

ssh -t $Servidor "$atualizar && bash /opt/balao2026/whatsapp-server/deploy-evo.sh"

if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "O deploy nao terminou bem (codigo $LASTEXITCODE)." -ForegroundColor Red
  Write-Host "Para voltar ao servidor antigo:  .\whatsapp-server\deploy-evo.ps1 -Voltar" -ForegroundColor DarkGray
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Pronto. Agora:" -ForegroundColor Green
Write-Host "  1) abra https://www.balao.info/crm e leia o QR Code com o celular da LOJA"
Write-Host "  2) abra https://www.balao.info/api/crm/teste-cruzado e leia o QR com o SEU celular"
Write-Host "  3) clique em 'Rodar o teste agora'"
