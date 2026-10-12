# Instala (ou atualiza) o vigia da Arena neste computador.
#
# Como usar, no PowerShell (a copia do projeto fica em $HOME\balao2026):
#
#   git -C $HOME\balao2026 pull
#   & $HOME\balao2026\scripts\arena-vigia\instalar.ps1
#
# Antes, em www.balao.info/painel/arena > Conexao com o Bling, clique em
# "Gerar chave do vigia": o navegador baixa arena-vigia-chave.txt para a pasta
# Downloads. Este instalador pega a chave de la (e apaga o arquivo baixado).
#
# O que ele faz:
#   1. copia o vigia para C:\Users\<voce>\balao-arena-vigia (dados\ e config.json ficam);
#   2. guarda a chave em C:\Users\<voce>\.balao-arena\chave.txt (fora da pasta do projeto);
#   3. confere Bling e site sem gravar nada;
#   4. cria a tarefa \BalaoFabrica\Arena Vigia, que roda a cada 2 minutos.
#
# O vigia so LE o Bling: o token e o mesmo que a sentinela do Bionic renova
# (07-Scripts\bling-oauth\bling_tokens.json). Ele nunca renova o token.

param(
  [string]$Destino = (Join-Path $env:USERPROFILE "balao-arena-vigia"),
  [switch]$SemTarefa
)

$ErrorActionPreference = "Stop"
$origem = $PSScriptRoot

Write-Host "Instalando o vigia da Arena em $Destino" -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $Destino | Out-Null
Get-ChildItem -Path $origem -File | Where-Object { $_.Extension -in ".py", ".md" } |
  ForEach-Object { Copy-Item $_.FullName -Destination $Destino -Force }

# Chave do vigia
$pastaChave = Join-Path $env:USERPROFILE ".balao-arena"
New-Item -ItemType Directory -Force -Path $pastaChave | Out-Null
$arqChave = Join-Path $pastaChave "chave.txt"
$baixada = Get-ChildItem -Path (Join-Path $env:USERPROFILE "Downloads") -Filter "arena-vigia-chave*.txt" -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($baixada) {
  (Get-Content $baixada.FullName -Raw).Trim() | Set-Content -Path $arqChave -NoNewline -Encoding ascii
  Remove-Item $baixada.FullName -Force
  Write-Host "Chave nova lida de Downloads\$($baixada.Name) (o arquivo baixado foi apagado)." -ForegroundColor Green
} elseif (-not (Test-Path $arqChave)) {
  throw "Nao achei a chave. Em www.balao.info/painel/arena > Conexao com o Bling, clique em 'Gerar chave do vigia' e rode este instalador de novo."
} else {
  Write-Host "Usando a chave que ja estava em $arqChave." -ForegroundColor DarkGray
}

# Python (so a biblioteca padrao)
$py = Get-Command py -ErrorAction SilentlyContinue
if ($py) {
  $python = (& py -3 -c "import sys; print(sys.executable)").Trim()
} else {
  $python = (Get-Command python -ErrorAction Stop).Source
}
$pythonw = Join-Path (Split-Path $python) "pythonw.exe"
if (-not (Test-Path $pythonw)) { $pythonw = $python }

# Conferencia (nao grava nada)
Push-Location $Destino
try {
  & $python vigia.py --conferir
  if ($LASTEXITCODE -ne 0) { throw "A conferencia falhou: veja a mensagem acima e $Destino\dados\vigia.log" }
} finally {
  Pop-Location
}

if (-not $SemTarefa) {
  $acao = New-ScheduledTaskAction -Execute $pythonw -Argument "vigia.py" -WorkingDirectory $Destino
  $gatilho = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 2)
  $ajustes = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 30) -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries -StartWhenAvailable -MultipleInstances IgnoreNew
  Register-ScheduledTask -TaskPath "\BalaoFabrica\" -TaskName "Arena Vigia" -Action $acao -Trigger $gatilho -Settings $ajustes `
    -Description "Leva vendas e orcamentos do Bling para a Arena (www.balao.info/arena). So le o Bling." -Force | Out-Null
  Start-ScheduledTask -TaskPath "\BalaoFabrica\" -TaskName "Arena Vigia"
  Write-Host ""
  Write-Host "Tarefa \BalaoFabrica\Arena Vigia criada e rodando (a cada 2 minutos)." -ForegroundColor Green
  Write-Host "A primeira volta traz os ultimos 3 meses do Bling e pode levar uns 10 minutos." -ForegroundColor Green
  Write-Host "Acompanhe em $Destino\dados\vigia.log ou no painel: /painel/arena > Conexao com o Bling." -ForegroundColor Cyan
}
