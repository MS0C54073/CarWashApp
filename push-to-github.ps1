# Push SuCAR Project to GitHub
# Repository: https://github.com/MS0C54073/SucarApp.git

Write-Host "`n🚀 Pushing SuCAR Project to GitHub" -ForegroundColor Cyan
Write-Host "Repository: https://github.com/MS0C54073/SucarApp.git`n" -ForegroundColor Gray

# Check if git is installed
try {
    $gitVersion = git --version 2>&1
    Write-Host "✅ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    Write-Host "   Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Navigate to project directory
Set-Location $PSScriptRoot

# Initialize git if not already initialized
if (-not (Test-Path .git)) {
    Write-Host "`n📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
}

# Add remote repository
Write-Host "`n🔗 Setting up remote repository..." -ForegroundColor Yellow
git remote remove origin 2>&1 | Out-Null
git remote add origin https://github.com/MS0C54073/SucarApp.git
Write-Host "✅ Remote 'origin' set to: https://github.com/MS0C54073/SucarApp.git" -ForegroundColor Green

# Check current status
Write-Host "`n📊 Checking repository status..." -ForegroundColor Yellow
$status = git status --short 2>&1
if ($status) {
    Write-Host "Files to commit:" -ForegroundColor Cyan
    git status --short
} else {
    Write-Host "No changes to commit" -ForegroundColor Gray
}

# Stage all files
Write-Host "`n📝 Staging all files..." -ForegroundColor Yellow
git add .
Write-Host "✅ Files staged" -ForegroundColor Green

# Check if there are changes to commit
$changes = git diff --cached --name-only 2>&1
if ($changes) {
    # Create commit
    Write-Host "`n💾 Creating commit..." -ForegroundColor Yellow
    $commitMessage = "Initial commit: SuCAR Car Wash Booking System with all features"
    git commit -m $commitMessage
    Write-Host "✅ Commit created" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  No changes to commit (repository is up to date)" -ForegroundColor Yellow
}

# Check current branch
$currentBranch = git branch --show-current 2>&1
if (-not $currentBranch) {
    Write-Host "`n🌿 Creating main branch..." -ForegroundColor Yellow
    git branch -M main
    $currentBranch = "main"
}

Write-Host "`n📡 Current branch: $currentBranch" -ForegroundColor Cyan

# Push to GitHub
Write-Host "`n🚀 Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "   Repository: https://github.com/MS0C54073/SucarApp.git" -ForegroundColor Gray
Write-Host "   Branch: $currentBranch`n" -ForegroundColor Gray

try {
    git push -u origin $currentBranch 2>&1 | ForEach-Object {
        if ($_ -match "error|fatal") {
            Write-Host $_ -ForegroundColor Red
        } else {
            Write-Host $_ -ForegroundColor White
        }
    }
    
    Write-Host "`n✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "`n🌐 View your repository at:" -ForegroundColor Cyan
    Write-Host "   https://github.com/MS0C54073/SucarApp" -ForegroundColor Yellow
} catch {
    Write-Host "`n❌ Error pushing to GitHub:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`n💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Make sure you're authenticated with GitHub" -ForegroundColor White
    Write-Host "   2. Check if the repository exists and you have write access" -ForegroundColor White
    Write-Host "   3. Try: git push -u origin $currentBranch --force" -ForegroundColor White
    Write-Host "      (Only if you want to overwrite remote history)" -ForegroundColor Gray
}

Write-Host "`n✨ Done!`n" -ForegroundColor Green
