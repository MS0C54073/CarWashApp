# Run booking_type migration on local Supabase
# This script connects to the local Supabase database and adds the booking_type column

Write-Host "Running booking_type migration..." -ForegroundColor Cyan
Write-Host ""

# Get Supabase status to find database connection details
$statusOutput = supabase status --output json 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Could not get Supabase status" -ForegroundColor Red
    Write-Host "Make sure Supabase is running: supabase start" -ForegroundColor Yellow
    exit 1
}

# Parse the status (if JSON output is available)
# For now, use default local connection
$dbHost = "localhost"
$dbPort = "54323"
$dbUser = "postgres"
$dbPassword = "postgres"
$dbName = "postgres"

Write-Host "Connecting to local Supabase database..." -ForegroundColor Yellow
Write-Host "Host: $dbHost`:$dbPort" -ForegroundColor Gray
Write-Host "Database: $dbName" -ForegroundColor Gray
Write-Host ""

# Read the migration SQL
$migrationFile = Join-Path $PSScriptRoot "migrations\add-booking-type-now.sql"
if (-not (Test-Path $migrationFile)) {
    Write-Host "Error: Migration file not found: $migrationFile" -ForegroundColor Red
    exit 1
}

$sql = Get-Content $migrationFile -Raw

# Try to use psql if available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if ($psqlPath) {
    Write-Host "Using psql to execute migration..." -ForegroundColor Green
    
    $env:PGPASSWORD = $dbPassword
    $sql | & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Migration completed successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "Migration failed. Please run manually in Supabase Studio." -ForegroundColor Red
        Write-Host "Open: http://localhost:54326" -ForegroundColor Yellow
    }
} else {
    Write-Host "psql not found. Please run the migration manually:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Use Supabase Studio" -ForegroundColor Cyan
    Write-Host "  1. Open: http://localhost:54326" -ForegroundColor White
    Write-Host "  2. Go to SQL Editor" -ForegroundColor White
    Write-Host "  3. Copy and paste the SQL from: $migrationFile" -ForegroundColor White
    Write-Host "  4. Click Run" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2: Install PostgreSQL client tools" -ForegroundColor Cyan
    Write-Host "  Then run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "SQL to run:" -ForegroundColor Yellow
    Write-Host "=" * 60 -ForegroundColor Gray
    Get-Content $migrationFile
    Write-Host "=" * 60 -ForegroundColor Gray
}
