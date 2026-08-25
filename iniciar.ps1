# Duplo clique / atalho: equivale a  .\cellquant start
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
& (Join-Path $Root "cellquant.ps1") start
