# Instala (ou atualiza) a JUL.IA neste computador.
#
# Como usar, no PowerShell, de qualquer pasta (a copia do projeto fica em $HOME\balao2026):
#
#   git -C $HOME\balao2026 pull
#   & $HOME\balao2026\whatsapp-server\deploy-evo.ps1 -Agente   # uma vez: traz o segredo da VPS (pede a senha de root)
#   & $HOME\balao2026\scripts\agente-local\instalar.ps1        # copia, instala o Whisper e cria a tarefa "JUL.IA"
#
# O que ele faz:
#   1. copia os arquivos para C:\Users\<voce>\balao-agente (dados e config.json ficam);
#   2. cria um Python separado (.venv) e instala o faster-whisper (o modelo de
#      voz e o mesmo da URA, ja baixado no PC);
#   3. cria a tarefa \BalaoFabrica\JUL.IA no Agendador do Windows: liga junto
#      com o Windows e volta sozinha se cair;
#   4. roda a conferencia (nada vai para cliente) e liga a tarefa.
#
# Ligar e desligar o ATENDIMENTO e no Centro de Comando do /crm (aba JUL.IA).
# A tarefa so deixa o computador pronto para atender.

param(
  [string]$Destino = (Join-Path $env:USERPROFILE "balao-agente"),
  [switch]$SemTarefa
)

$ErrorActionPreference = "Stop"
$origem = $PSScriptRoot

Write-Host "Instalando a JUL.IA em $Destino" -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $Destino | Out-Null

# 1. Arquivos (o que e do usuario fica: dados\, config.json)
Get-ChildItem -Path $origem -File | Where-Object { $_.Extension -in ".py", ".cmd", ".md" -or $_.Name -eq "config.exemplo.json" } |
  ForEach-Object { Copy-Item $_.FullName -Destination $Destino -Force }
if (-not (Test-Path (Join-Path $Destino "config.json"))) {
  Copy-Item (Join-Path $origem "config.exemplo.json") (Join-Path $Destino "config.json")
}

# 2. Python proprio (nao mexe no da URA nem no da fabrica)
$venv = Join-Path $Destino ".venv"
$python = Join-Path $venv "Scripts\python.exe"
if (-not (Test-Path $python)) {
  $py = Get-Command py -ErrorAction SilentlyContinue
  if ($py) {
    $versao = @("-3.13", "-3.12", "-3.11") | Where-Object { (& py $_ -c "print(1)" 2>$null) -eq "1" } | Select-Object -First 1
    if (-not $versao) { throw "Nao achei Python 3.11 a 3.13 (py -0 lista os instalados)." }
    & py $versao -m venv $venv
  } else {
    & python -m venv $venv
  }
}
Write-Host "Instalando o faster-whisper (pode levar alguns minutos na primeira vez)..." -ForegroundColor DarkGray
& $python -m pip install --upgrade pip *> (Join-Path $Destino "instalar.log")
& $python -m pip install --upgrade faster-whisper *>> (Join-Path $Destino "instalar.log")
if ($LASTEXITCODE -ne 0) { throw "pip falhou: veja $Destino\instalar.log" }

# 3. Tarefa agendada
if (-not $SemTarefa) {
  $pythonw = Join-Path $venv "Scripts\pythonw.exe"
  $acao = New-ScheduledTaskAction -Execute $pythonw -Argument "julia.py" -WorkingDirectory $Destino
  $gatilho = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
  $ajustes = New-ScheduledTaskSettingsSet -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) `
    -ExecutionTimeLimit ([TimeSpan]::Zero) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable `
    -MultipleInstances IgnoreNew
  Register-ScheduledTask -TaskPath "\BalaoFabrica\" -TaskName "JUL.IA" -Action $acao -Trigger $gatilho -Settings $ajustes `
    -Description "Agente de vendas do WhatsApp da Balao (JUL.IA). Liga/desliga o atendimento no /crm, aba JUL.IA." -Force | Out-Null
  Write-Host "Tarefa \BalaoFabrica\JUL.IA criada." -ForegroundColor Green
}

# 4. Conferencia e partida
Write-Host ""
Push-Location $Destino
try {
  & $python julia.py --conferir
} finally {
  Pop-Location
}
if (-not $SemTarefa) {
  Stop-ScheduledTask -TaskPath "\BalaoFabrica\" -TaskName "JUL.IA" -ErrorAction SilentlyContinue
  # Parar a tarefa fecha o lancador do .venv, mas o Python de verdade (filho dele)
  # pode ficar vivo segurando a trava: a versao nova abriria e sairia na hora.
  Get-CimInstance Win32_Process -Filter "Name='python.exe' or Name='pythonw.exe'" |
    Where-Object { $_.CommandLine -match 'julia\.py' -and $_.CommandLine -notmatch '--conferir|--conversar' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  Start-Sleep -Seconds 2
  Start-ScheduledTask -TaskPath "\BalaoFabrica\" -TaskName "JUL.IA"
  Write-Host ""
  Write-Host "JUL.IA rodando. No /crm > Centro de Comando > JUL.IA o computador aparece 'No ar'." -ForegroundColor Green
  Write-Host "Para conversar com ela aqui no terminal (sem WhatsApp): cd $Destino ; .\.venv\Scripts\python.exe julia.py --conversar" -ForegroundColor Cyan
}
