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

# De dia a placa de video e da JUL.IA e da URA. A foto e feita nas brechas da noite: 22h00 (antes do video da Pauta)
# e 5h30 (depois do video do dia e da dica, antes das 6h, quando o primeiro artigo agendado aparece).
# A rotina do blog escreve as 19h e agenda os artigos para o dia seguinte; sem foto, o site nao mostra o artigo.
$gatilhos = '22:00', '05:30' | ForEach-Object { New-ScheduledTaskTrigger -Daily -At $_ }
$act = New-ScheduledTaskAction -Execute $PYW -Argument 'capa_blog.py' -WorkingDirectory $WD
$set = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 150)
Register-ScheduledTask -TaskName 'Capa do blog' -TaskPath $pasta -Action $act -Trigger $gatilhos -Settings $set `
    -Principal $principal -Description 'Balao Content Factory - foto de capa do blog (Flux local + conferencia do Ollama)' -Force | Out-Null
Get-ScheduledTask -TaskPath $pasta -TaskName 'Capa do blog' | ForEach-Object { "{0,-14} {1}  proxima: {2}" -f $_.TaskName, $_.State, (Get-ScheduledTaskInfo $_).NextRunTime }
