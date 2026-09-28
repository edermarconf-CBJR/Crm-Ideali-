param([switch]$SemAbrir)
$ErrorActionPreference='Stop'
$projeto=Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $projeto
$opcoes=@((Join-Path $env:LOCALAPPDATA 'Programs\nodejs\node.exe'),(Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'))
$node=$opcoes | Where-Object {Test-Path -LiteralPath $_} | Select-Object -First 1
if(!$node){$node=(Get-Command node -ErrorAction Stop).Source}
function PortaAberta([int]$porta){$c=New-Object System.Net.Sockets.TcpClient;try{$t=$c.ConnectAsync('127.0.0.1',$porta);return ($t.Wait(300) -and $c.Connected)}catch{return $false}finally{$c.Dispose()}}
function Iniciar([string]$nome,[string]$exe,[string]$argumentos){
$p=Start-Process -FilePath $exe -ArgumentList $argumentos -WorkingDirectory $projeto -WindowStyle Hidden -RedirectStandardOutput (Join-Path $projeto ".dados/$nome-saida.log") -RedirectStandardError (Join-Path $projeto ".dados/$nome-erros.log") -PassThru
$p.Id | Set-Content (Join-Path $projeto ".dados/$nome.pid")
}
if(!(Test-Path '.next/BUILD_ID')){throw 'Prepare a versao com npm run build antes de abrir.'}
if(!(PortaAberta 55432)){Iniciar 'banco' $node ('"'+$projeto+'/scripts/banco-local.mjs"')}
for($n=0;$n -lt 40 -and !(PortaAberta 55432);$n++){Start-Sleep -Milliseconds 500}
if(!(PortaAberta 55432)){throw 'Banco local nao iniciou. Consulte .dados/banco-erros.log.'}
if(!(PortaAberta 8333)){Iniciar 'arquivos' $node ('"'+$projeto+'/scripts/arquivos-local.mjs"')}
if(!(PortaAberta 1025)){Iniciar 'mensagens' (Join-Path $projeto '.dados/ferramentas/mailpit/mailpit.exe') '--smtp 127.0.0.1:1025 --listen 127.0.0.1:8025'}
if(!(PortaAberta 3100)){Iniciar 'crm' $node ('"'+$projeto+'/scripts/servir.mjs"')}
for($n=0;$n -lt 50 -and !(PortaAberta 3100);$n++){Start-Sleep -Milliseconds 500}
if(!(PortaAberta 3100)){throw 'CRM local nao iniciou. Consulte .dados/crm-erros.log.'}
if(!$SemAbrir){Start-Process 'http://127.0.0.1:3100'}
Write-Output 'CRM Ideali disponivel em http://127.0.0.1:3100'
