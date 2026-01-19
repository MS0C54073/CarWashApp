# Kill process using port 5000 (or specified port)
param(
    [int]$Port = 5000
)

Write-Host "Checking for processes using port $Port..." -ForegroundColor Cyan

$connections = netstat -ano | findstr ":$Port"
if ($connections) {
    $pids = $connections | ForEach-Object {
        $parts = $_ -split '\s+'
        $parts[-1]
    } | Select-Object -Unique

    foreach ($pid in $pids) {
        if ($pid -match '^\d+$') {
            Write-Host "Killing process PID: $pid" -ForegroundColor Yellow
            taskkill /F /PID $pid 2>&1 | Out-Null
        }
    }
    
    Write-Host "Port $Port is now free" -ForegroundColor Green
} else {
    Write-Host "Port $Port is already free" -ForegroundColor Green
}
