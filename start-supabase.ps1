# Start Supabase Local Development Server
# This script will start Supabase after checking Docker is running

Write-Host "🚀 Starting Supabase Local Development..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "📋 Checking Docker Desktop..." -ForegroundColor Yellow
try {
    $dockerCheck = docker ps 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker Desktop is not running!" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Please:" -ForegroundColor Yellow
        Write-Host "   1. Start Docker Desktop" -ForegroundColor White
        Write-Host "   2. Wait for Docker to fully start (whale icon in system tray)" -ForegroundColor White
        Write-Host "   3. Run this script again" -ForegroundColor White
        Write-Host ""
        Write-Host "   Or start Docker Desktop manually and then run:" -ForegroundColor Yellow
        Write-Host "   supabase start" -ForegroundColor White
        exit 1
    }
    Write-Host "✅ Docker Desktop is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Desktop is not running!" -ForegroundColor Red
    Write-Host "   Please start Docker Desktop first" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🔄 Starting Supabase..." -ForegroundColor Cyan

# Start Supabase
supabase start

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Supabase started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Copy the connection details from above" -ForegroundColor White
    Write-Host "   2. Update backend/.env with:" -ForegroundColor White
    Write-Host "      SUPABASE_URL=http://localhost:54325" -ForegroundColor Cyan
    Write-Host "      SUPABASE_ANON_KEY=(from status output above)" -ForegroundColor Cyan
    Write-Host "   3. Start your backend: cd backend && npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 Access Supabase Studio: http://localhost:54326" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Failed to start Supabase" -ForegroundColor Red
    Write-Host "   Check the error messages above" -ForegroundColor Yellow
}
