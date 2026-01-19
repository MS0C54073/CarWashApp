# Start development server with automatic port cleanup
param(
    [int]$Port = 5000
)

Write-Host "Starting development server..." -ForegroundColor Cyan
Write-Host ""

# Check if port is in use and kill the process
Write-Host "Checking port $Port..." -ForegroundColor Yellow
$connections = netstat -ano | findstr ":$Port"
if ($connections) {
    $pids = $connections | ForEach-Object {
        $parts = $_ -split '\s+'
        $parts[-1]
    } | Select-Object -Unique

    foreach ($pid in $pids) {
        if ($pid -match '^\d+$') {
            Write-Host "Killing process PID: $pid (using port $Port)" -ForegroundColor Yellow
            taskkill /F /PID $pid 2>&1 | Out-Null
        }
    }
    
    Write-Host "Port $Port is now free" -ForegroundColor Green
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "Starting backend server..." -ForegroundColor Cyan
Write-Host ""

# Start the dev server
npm run dev
