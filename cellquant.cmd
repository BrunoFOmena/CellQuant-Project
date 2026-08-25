@echo off
setlocal
cd /d "%~dp0"
set "CELLQUANT_ROOT=%~dp0"
set "PYTHONPATH=%~dp0src"
set "PYTHONIOENCODING=utf-8"
set "PYTHONUTF8=1"
chcp 65001 >nul

where py >nul 2>&1
if %ERRORLEVEL%==0 (
  py -3 -m cellquant %*
  exit /b %ERRORLEVEL%
)

where python >nul 2>&1
if %ERRORLEVEL%==0 (
  python -m cellquant %*
  exit /b %ERRORLEVEL%
)

echo Python nao encontrado. Instale Python 3 e marque Add python.exe to PATH.
exit /b 1
