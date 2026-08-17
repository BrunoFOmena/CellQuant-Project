# Alternativa: configura o banco no PostgreSQL instalado no Windows (sem Docker).
# Preferira: docker compose up -d  (veja bd/README.md)
#
# Uso:
#   cd bd
#   .\setup_windows.ps1
#   .\setup_windows.ps1 -PostgresPassword "sua_senha"
#   .\setup_windows.ps1 -Seed
#
# O seed mock só entra se a tabela estiver vazia.
# Nunca faz TRUNCATE se já houver exames.
param(
  [string]$PostgresPassword = "",
  [switch]$Seed
)

$ErrorActionPreference = "Stop"
$BdDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function Find-Psql {
  $candidates = @(
    "C:\Program Files\PostgreSQL\18\bin\psql.exe",
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe"
  )
  foreach ($p in $candidates) {
    if (Test-Path $p) { return $p }
  }
  $fromPath = Get-Command psql -ErrorAction SilentlyContinue
  if ($fromPath) { return $fromPath.Source }
  return $null
}

$psql = Find-Psql
if (-not $psql) {
  Write-Host "PostgreSQL nao encontrado em Program Files."
  Write-Host "Instale em https://www.postgresql.org/download/windows/ e rode este script de novo."
  Write-Host "Ou use Docker: docker compose up -d"
  exit 1
}

Write-Host "Usando: $psql"

if (-not $PostgresPassword) {
  $secure = Read-Host -AsSecureString "Senha do usuario postgres (superuser)"
  $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  $PostgresPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

$env:PGPASSWORD = $PostgresPassword
$env:PGCLIENTENCODING = "UTF8"
$hostAddr = "127.0.0.1"

function Invoke-Psql {
  param(
    [string]$Database,
    [string]$SqlFile,
    [string]$Command
  )
  if ($SqlFile) {
    & $psql -U postgres -h $hostAddr -p 5432 -d $Database -v ON_ERROR_STOP=1 -f $SqlFile
  } else {
    & $psql -U postgres -h $hostAddr -p 5432 -d $Database -v ON_ERROR_STOP=1 -c $Command
  }
  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao executar comando no banco $Database"
  }
}

try {
  Write-Host "Criando usuario lcr..."
  Invoke-Psql -Database "postgres" -Command @"
DO `$`$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'lcr') THEN
    CREATE ROLE lcr LOGIN PASSWORD 'lcr123';
  END IF;
END
`$`$;
"@

  Write-Host "Criando banco contador_lcr..."
  $exists = (& $psql -U postgres -h $hostAddr -p 5432 -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='contador_lcr'").Trim()
  if ($exists -ne "1") {
    Invoke-Psql -Database "postgres" -Command "CREATE DATABASE contador_lcr OWNER lcr;"
  } else {
    Write-Host "Banco ja existe — aplicando schema (sem apagar dados)."
  }

  Invoke-Psql -Database "postgres" -Command "GRANT ALL PRIVILEGES ON DATABASE contador_lcr TO lcr;"

  Write-Host "Aplicando schema.sql..."
  Invoke-Psql -Database "contador_lcr" -SqlFile (Join-Path $BdDir "schema.sql")

  $countRaw = (& $psql -U postgres -h $hostAddr -p 5432 -d contador_lcr -tAc "SELECT COUNT(*) FROM exames").Trim()
  $count = 0
  if ($countRaw -match '^\d+$') { $count = [int]$countRaw }

  if ($count -gt 0) {
    Write-Host "Tabela exames ja tem $count registro(s) — seed NAO sera aplicado (nao apagamos dados reais)."
    if ($Seed) {
      $confirm = Read-Host "Flag -Seed ignorada. Digite S apenas para confirmar que entendeu (dados preservados)"
      if ($confirm -ne "S" -and $confirm -ne "s") {
        Write-Host "Ok."
      }
    }
  } else {
    $aplicarSeed = $true
    if ($Seed) {
      $confirm = Read-Host "Tabela vazia. Carregar seed mock de teste? (S/N)"
      if ($confirm -ne "S" -and $confirm -ne "s") { $aplicarSeed = $false }
    }
    if ($aplicarSeed) {
      Write-Host "Tabela vazia — aplicando seed.sql (MOCK DE TESTE)..."
      Invoke-Psql -Database "contador_lcr" -SqlFile (Join-Path $BdDir "seed.sql")
    } else {
      Write-Host "Seed nao aplicado."
    }
  }

  Invoke-Psql -Database "contador_lcr" -Command "GRANT ALL ON ALL TABLES IN SCHEMA public TO lcr; GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO lcr; ALTER TABLE exames OWNER TO lcr;"

  Write-Host ""
  Write-Host "Pronto."
  Write-Host "DATABASE_URL=postgresql+psycopg2://lcr:lcr123@localhost:5432/contador_lcr"
}
finally {
  Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}
