# Balao Content Factory - tarefa da FOTO DE CAPA DO BLOG (pasta \BalaoFabrica\). Criado pelo Claude em 11/10/2026.
# Copiar junto com o capa_blog.py para C:\Users\user\balao-content-factory\publisher\ e rodar uma vez.
# Nao mexe nas outras tarefas da fabrica. Para desligar:
#   Disable-ScheduledTask -TaskPath '\BalaoFabrica\' -TaskName 'Capa do blog'
# Para remover:
#   Unregister-ScheduledTask -TaskPath '\BalaoFabrica\' -TaskName 'Capa do blog' -Confirm:$false
$ErrorActionPreference = 'Stop'
$PYW = 'C:\Users\user\AppData\Local\Programs\Python\Python313\pythonw.exe'
$WD = 'C:\Users\user\balao-content-factory\publisher'
$pasta = '\BalaoFabrica\'
$user = "$env:USERDOMAIN\$env:USERNAME"
$principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Limited

# O blog publica perto das 6h, do meio-dia e das 18h. A tarefa olha a fila a cada tres horas: com a fila vazia
# sai na hora; com pedido, espera a placa de video ficar livre (ate 90 min) e deixa para a rodada seguinte se nao der.
$gatilhos = '06:20', '09:20', '12:20', '15:20', '18:20', '21:20' | ForEach-Object { New-ScheduledTaskTrigger -Daily -At $_ }
$act = New-ScheduledTaskAction -Execute $PYW -Argument 'capa_blog.py' -WorkingDirectory $WD
$set = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 150)
Register-ScheduledTask -TaskName 'Capa do blog' -TaskPath $pasta -Action $act -Trigger $gatilhos -Settings $set `
    -Principal $principal -Description 'Balao Content Factory - foto de capa do blog (Flux local + conferencia do Ollama)' -Force | Out-Null
Get-ScheduledTask -TaskPath $pasta -TaskName 'Capa do blog' | ForEach-Object { "{0,-14} {1}  proxima: {2}" -f $_.TaskName, $_.State, (Get-ScheduledTaskInfo $_).NextRunTime }
