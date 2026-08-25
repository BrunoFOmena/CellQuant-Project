# Wrapper PowerShell: na pasta do projeto rode  .\cellquant start
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root
$env:CELLQUANT_ROOT = $Root
$env:PYTHONPATH = Join-Path $Root "src"
$env:PYTHONIOENCODING = "utf-8"
$env:PYTHONUTF8 = "1"

function Find-Python {
  $py = Get-Command py -ErrorAction SilentlyContinue
  if ($py) { return @{ Exe = $py.Source; Prefix = @("-3") } }
  foreach ($name in @("python3", "python")) {
    $item = Get-Command $name -ErrorAction SilentlyContinue
    if ($item) { return @{ Exe = $item.Source; Prefix = @() } }
  }
  return $null
}

$Python = Find-Python
if (-not $Python) {
  Write-Host "Python nao encontrado. Instale Python 3 e marque 'Add python.exe to PATH'."
  exit 1
}

& $Python.Exe @($Python.Prefix) -m cellquant @args
exit $LASTEXITCODE
