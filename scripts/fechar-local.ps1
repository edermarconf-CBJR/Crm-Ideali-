$ErrorActionPreference='Stop'
$projeto=[System.IO.Path]::GetFullPath((Split-Path $PSScriptRoot -Parent))
$registro=Join-Path $projeto '.dados/crm.pid'
if(Test-Path -LiteralPath $registro){
$numero=[int](Get-Content -LiteralPath $registro)
$p=Get-CimInstance Win32_Process -Filter "ProcessId=$numero" -ErrorAction SilentlyContinue
if($p -and $p.CommandLine -and $p.CommandLine.Contains($projeto)){
& taskkill.exe /PID $numero /T /F | Out-Null
}
}
Write-Output 'CRM encerrado. Banco e arquivos permanecem locais; desligar o computador encerra esses servicos.'
