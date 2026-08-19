# Sobe o Contador LCR no PC (Python + SQLite). Sem Docker e sem Postgres.
# Uso: clique duas vezes em iniciar.bat ou rode: .\iniciar.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

function Find-Python {
  foreach ($cmd in @("py", "python")) {
    $item = Get-Command $cmd -ErrorAction SilentlyContinue
    if ($item) { return $item.Source }
  }
  return $null
}

$PythonCmd = Find-Python
if (-not $PythonCmd) {
  Write-Host "Python nao encontrado. Instale Python 3 e marque 'Add python.exe to PATH'."
  exit 1
}

$VenvPython = Join-Path $Root "backend\.venv\Scripts\python.exe"
if (-not (Test-Path $VenvPython)) {
  Write-Host "Criando ambiente virtual..."
  if ($PythonCmd -like "*py.exe") {
    & $PythonCmd -3 -m venv (Join-Path $Root "backend\.venv")
  } else {
    & $PythonCmd -m venv (Join-Path $Root "backend\.venv")
  }
}

Write-Host "Instalando dependencias Python (uma vez)..."
& $VenvPython -m pip install -q -r (Join-Path $Root "backend\requirements.txt")

$Dist = Join-Path $Root "frontend\dist\index.html"
if (-not (Test-Path $Dist)) {
  $npm = Get-Command npm -ErrorAction SilentlyContinue
  if ($npm) {
    Write-Host "Gerando a interface (npm run build)..."
    Push-Location (Join-Path $Root "frontend")
    npm ci
    npm run build
    Pop-Location
  } else {
    Write-Host "Aviso: frontend/dist nao existe e o Node/npm nao esta instalado."
    Write-Host "A API sobe, mas a tela do app so aparece depois de um 'npm run build' na pasta frontend."
  }
}

New-Item -ItemType Directory -Force -Path (Join-Path $Root "data") | Out-Null

Write-Host "Abrindo http://127.0.0.1:8000"
Start-Process "http://127.0.0.1:8000"

Set-Location (Join-Path $Root "backend")
& $VenvPython -m uvicorn app.main:app --host 127.0.0.1 --port 8000
