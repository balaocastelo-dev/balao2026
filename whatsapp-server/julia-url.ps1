# Atualiza o endereço do cérebro da Júlia IA na VPS.
#
# O cérebro dela (balao-assistente) roda no PC com a RTX 4090, e o túnel do
# Cloudflare (cloudflared) expõe ele na internet. A URL do túnel MUDA toda vez
# que o cloudflared reinicia, então este script existe para atualizar a VPS
# sem precisar entrar nela manualmente.
#
# Como usar (no PowerShell, dentro da pasta do projeto):
#
#   .\whatsapp-server\julia-url.ps1
#
# Ele:
#   1. Descobre a URL atual do túnel (lê o log do cloudflared que está rodando)
#   2. Grava JULIA_IA_URL em /etc/balao.env na VPS
#   3. Roda o deploy (recria o container com a nova variável)
#
# A senha pedida é a de root da VPS.

param(
  [string]$Servidor = "root@179.199.148.87",
  [string]$LogCloudflared = "$env:TEMP\cloudflared-log.txt",
  [string]$Url = ""
)

$ErrorActionPreference = "Stop"

if (-not $Url) {
  $linhas = @()
  foreach ($caminho in @(
      $LogCloudflared,
      "C:\Users\user\AppData\Local\Temp\opencode\cloudflared-log.txt",
      "C:\Users\user\AppData\Local\Temp\opencode\cloudflared-err.txt"
  )) {
    if (Test-Path $caminho) { $linhas += Get-Content $caminho -ErrorAction SilentlyContinue }
  }
  $achou = $linhas | Select-String -Pattern "https://[a-z0-9-]+\.trycloudflare\.com" | Select-Object -First 1
  if (-not $achou) {
    Write-Host "Não achei a URL do túnel nos logs. O cloudflared está rodando?" -ForegroundColor Red
    Write-Host "Se estiver, passe a URL manualmente: .\whatsapp-server\julia-url.ps1 -Url https://xxx.trycloudflare.com" -ForegroundColor DarkGray
    exit 1
  }
  $Url = ($achou.Matches[0].Value).TrimEnd("/")
}

Write-Host ""
Write-Host "Cérebro da Júlia IA:" -ForegroundColor Cyan
Write-Host "  $Url" -ForegroundColor White
Write-Host ""
Write-Host "Atualizando a VPS (pede a senha de root)..." -ForegroundColor DarkGray

$comando = @"
if [ -f /etc/balao.env ]; then
  sed -i '/^JULIA_IA_URL=/d' /etc/balao.env
  sed -i '/^JULIA_IA_MODO=/d' /etc/balao.env
fi
echo "JULIA_IA_URL=$Url" >> /etc/balao.env
echo "JULIA_IA_MODO=off" >> /etc/balao.env
chmod 600 /etc/balao.env
echo "OK_ENV"
"@

$saida = ssh $Servidor $comando
if ($saida -notmatch "OK_ENV") {
  Write-Host "Não consegui gravar o endereço na VPS." -ForegroundColor Red
  Write-Host $saida
  exit 1
}

Write-Host "  endereço gravado em /etc/balao.env" -ForegroundColor DarkGray
ssh $Servidor "bash /opt/balao2026/whatsapp-server/deploy-vps.sh"

if ($LASTEXITCODE -ne 0) {
  Write-Host "O deploy não terminou bem (código $LASTEXITCODE)." -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Pronto! A Júlia IA já conhece o cérebro dela." -ForegroundColor Green
Write-Host "Confira em https://www.balao.info/crm → painel da Júlia IA." -ForegroundColor DarkGray
Write-Host ""
