# dev-clean.ps1 — kill any orphan node/vite/nodemon processes holding our dev
# ports, then start `npm run dev`. Idempotent; safe to re-run.
#
# Usage:  powershell -ExecutionPolicy Bypass -File dev-clean.ps1
$ErrorActionPreference = 'SilentlyContinue'
$ports = @(5000, 5001, 5002, 5173, 5174, 5175)
$procs = Get-Process node -ErrorAction SilentlyContinue
foreach ($p in $procs) {
    Write-Host "Killing node.exe PID $($p.Id) (started $($p.StartTime))"
    Stop-Process -Id $p.Id -Force
}
# Wait for the OS to actually release the ports
foreach ($port in $ports) {
    Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
        ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
}
Start-Sleep -Seconds 1
Write-Host "`nStarting npm run dev...`n" -ForegroundColor Cyan
npm run dev
