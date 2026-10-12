# Troca o WhatsApp da loja para a Evolution API, direto do PowerShell do PC.
#
# Como usar (no PowerShell, dentro da pasta do projeto):
#
#   .\whatsapp-server\deploy-evo.ps1                    # instala / atualiza (o que está no main)
#   .\whatsapp-server\deploy-evo.ps1 -Commit 8bded2f    # sobe um commit ESPECÍFICO (é assim que se desfaz)
#   .\whatsapp-server\deploy-evo.ps1 -Importar          # copia o histórico da Evolution para o banco da loja (uma vez)
#   .\whatsapp-server\deploy-evo.ps1 -Diagnostico       # raio-X do banco (só leitura)
#   .\whatsapp-server\deploy-evo.ps1 -Agente            # traz o segredo da JUL.IA para ESTE PC (depois do deploy)
#   .\whatsapp-server\deploy-evo.ps1 -Voltar            # NÃO use para desfazer: liga o servidor ANTIGO,
#                                                       # o do whatsapp-web.js, de antes da Evolution
#
# Ele pede a senha de root da VPS (a senha é digitada por você e não fica
# gravada em lugar nenhum).

param(
  [string]$Servidor = "root@179.199.148.87",
  [string]$Commit = "",
  [switch]$Voltar,
  [switch]$Importar,
  [switch]$Diagnostico,
  [switch]$Agente
)

$ErrorActionPreference = "Stop"
# Sempre o deploy-evo.sh mais novo (o do main): é ele que sabe subir um commit
# específico. O código que ele sobe é o de -Commit, quando informado.
$atualizar = "git -C /opt/balao2026 fetch origin main --depth=100 && git -C /opt/balao2026 reset --hard origin/main"

if ($Voltar) {
  Write-Host "ATENCAO: isto liga o servidor ANTIGO (whatsapp-web.js, de antes da Evolution)." -ForegroundColor Red
  Write-Host "Para desfazer um deploy, use -Commit <commit anterior> (docs/whatsapp-fase1.md)." -ForegroundColor Yellow
  $ok = Read-Host "Digite VOLTAR para seguir mesmo assim"
  if ($ok -ne "VOLTAR") { exit 1 }
  ssh $Servidor "bash /opt/balao2026/whatsapp-server/deploy-evo.sh voltar"
  exit $LASTEXITCODE
}

if ($Importar) {
  Write-Host "Copiando o historico da Evolution para o banco da loja (pode levar alguns minutos)" -ForegroundColor Cyan
  ssh -t $Servidor "bash /opt/balao2026/whatsapp-server/deploy-evo.sh importar"
  exit $LASTEXITCODE
}

if ($Diagnostico) {
  Write-Host "Raio-X do banco (so leitura; nao mostra dado de cliente)" -ForegroundColor Cyan
  ssh -t $Servidor "bash /opt/balao2026/whatsapp-server/deploy-evo.sh diagnostico"
  exit $LASTEXITCODE
}

if ($Agente) {
  # O trabalhador da JUL.IA (scripts/agente-local) prova quem é para a VPS com
  # este segredo. Ele vem pela mesma conexão ssh do deploy e vai direto para o
  # arquivo: não aparece na tela nem fica no histórico do PowerShell.
  Write-Host "Trazendo o segredo da JUL.IA da VPS para este computador" -ForegroundColor Cyan
  Write-Host "A senha pedida a seguir e a de root da VPS." -ForegroundColor DarkGray
  $segredo = ssh $Servidor "cat /var/lib/balao-evo/painel/agente.segredo"
  if ($LASTEXITCODE -ne 0 -or -not $segredo) {
    Write-Host "Nao achei o segredo na VPS. Rode antes o deploy: .\whatsapp-server\deploy-evo.ps1" -ForegroundColor Red
    exit 1
  }
  $pasta = Join-Path $env:USERPROFILE ".balao-agente"
  New-Item -ItemType Directory -Force -Path $pasta | Out-Null
  $arquivo = Join-Path $pasta "segredo.txt"
  Set-Content -Path $arquivo -Value ([string]$segredo).Trim() -NoNewline -Encoding ascii
  # So o seu usuario do Windows le o arquivo.
  icacls $arquivo /inheritance:r /grant:r "$($env:USERNAME):(R,W)" | Out-Null
  Write-Host "Pronto: segredo gravado em $arquivo" -ForegroundColor Green
  Write-Host "Agora: .\scripts\agente-local\instalar.ps1" -ForegroundColor Cyan
  exit 0
}

if ($Commit -and $Commit -notmatch '^[0-9a-fA-F]{7,40}$') {
  Write-Host "Commit invalido: use o codigo do commit (7 a 40 letras/numeros hexadecimais)." -ForegroundColor Red
  exit 1
}

Write-Host ""
if ($Commit) {
  Write-Host "Subindo o commit $Commit em $Servidor" -ForegroundColor Cyan
  $comando = "$atualizar && REF=$Commit bash /opt/balao2026/whatsapp-server/deploy-evo.sh"
} else {
  Write-Host "Instalando/atualizando o WhatsApp (Evolution) em $Servidor" -ForegroundColor Cyan
  $comando = "$atualizar && bash /opt/balao2026/whatsapp-server/deploy-evo.sh"
}
Write-Host "A senha pedida a seguir e a de root da VPS." -ForegroundColor DarkGray
Write-Host ""

ssh -t $Servidor $comando

if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "O deploy nao terminou bem (codigo $LASTEXITCODE)." -ForegroundColor Red
  Write-Host "Para desfazer: .\whatsapp-server\deploy-evo.ps1 -Commit <commit anterior>  (docs/whatsapp-fase1.md)" -ForegroundColor DarkGray
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Pronto. Agora:" -ForegroundColor Green
Write-Host "  1) abra https://www.balao.info/crm e confira se o WhatsApp esta conectado"
Write-Host "  2) confira o /health (docs/whatsapp-fase1.md diz o que olhar)"
