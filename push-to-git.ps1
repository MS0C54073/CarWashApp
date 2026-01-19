# Git Push Script for SuCAR Project
# This script helps you push your project to Git

Write-Host "`n🚀 SuCAR Git Push Helper" -ForegroundColor Cyan
Write-Host "========================`n" -ForegroundColor Cyan

# Check if git is installed
try {
    $gitVersion = git --version 2>&1
    Write-Host "✅ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    Write-Host "   Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Check if git is initialized
if (Test-Path .git) {
    Write-Host "✅ Git repository is initialized`n" -ForegroundColor Green
    
    # Check current status
    Write-Host "📊 Current Git Status:" -ForegroundColor Cyan
    git status --short
    
    Write-Host "`n📝 Staging all changes..." -ForegroundColor Yellow
    git add .
    
    Write-Host "`n💾 Committing changes..." -ForegroundColor Yellow
    $commitMessage = "Update: Enhanced animations, fixed color contrast issues, and improved UI/UX"
    git commit -m $commitMessage
    
    Write-Host "`n📡 Checking remote repository..." -ForegroundColor Cyan
    $remotes = git remote -v 2>&1
    
    if ($remotes -match "origin") {
        Write-Host "✅ Remote 'origin' is configured" -ForegroundColor Green
        Write-Host "`n🚀 Pushing to remote repository..." -ForegroundColor Yellow
        git push origin main 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Successfully pushed to Git!" -ForegroundColor Green
        } else {
            Write-Host "`n⚠️  Push failed. Trying 'master' branch..." -ForegroundColor Yellow
            git push origin master 2>&1
        }
    } else {
        Write-Host "⚠️  No remote repository configured" -ForegroundColor Yellow
        Write-Host "`nTo add a remote repository, run:" -ForegroundColor Cyan
        Write-Host "   git remote add origin <your-repo-url>" -ForegroundColor White
        Write-Host "`nExample:" -ForegroundColor Cyan
        Write-Host "   git remote add origin https://github.com/yourusername/sucar.git" -ForegroundColor White
    }
} else {
    Write-Host "⚠️  Git repository not initialized`n" -ForegroundColor Yellow
    Write-Host "Initializing Git repository..." -ForegroundColor Cyan
    
    git init
    git add .
    
    Write-Host "`n💾 Creating initial commit..." -ForegroundColor Yellow
    git commit -m "Initial commit: SuCAR Car Wash Booking System"
    
    Write-Host "`n✅ Git repository initialized!" -ForegroundColor Green
    Write-Host "`n📡 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Create a repository on GitHub/GitLab/Bitbucket" -ForegroundColor White
    Write-Host "2. Add the remote:" -ForegroundColor White
    Write-Host "   git remote add origin <your-repo-url>" -ForegroundColor Yellow
    Write-Host "3. Push to remote:" -ForegroundColor White
    Write-Host "   git push -u origin main" -ForegroundColor Yellow
    Write-Host "   (or 'master' if your default branch is master)" -ForegroundColor Gray
}

Write-Host "`n✨ Done!`n" -ForegroundColor Green
