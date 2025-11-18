# NiaHealth Project - Complete Setup Script
# PowerShell Script for Windows
# Run this script from the project root directory

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   NiaHealth - Complete Setup Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 20+ first." -ForegroundColor Red
    exit 1
}

# Check if MySQL is installed
Write-Host "Checking MySQL installation..." -ForegroundColor Yellow
$mysqlService = Get-Service -Name MySQL* -ErrorAction SilentlyContinue
if ($mysqlService) {
    Write-Host "✓ MySQL service found: $($mysqlService.Name)" -ForegroundColor Green
} else {
    Write-Host "✗ MySQL not found. Please install MySQL 8+ first." -ForegroundColor Red
    exit 1
}

# Install backend dependencies
Write-Host "`nInstalling backend dependencies..." -ForegroundColor Yellow
Push-Location backend
try {
    npm install
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to install backend dependencies" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# Install frontend dependencies
Write-Host "`nInstalling frontend dependencies..." -ForegroundColor Yellow
Push-Location frontend
try {
    npm install
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# Create .env file if it doesn't exist
Write-Host "`nSetting up environment files..." -ForegroundColor Yellow
if (!(Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "✓ Created backend\.env (Please edit with your settings)" -ForegroundColor Yellow
} else {
    Write-Host "✓ backend\.env already exists" -ForegroundColor Green
}

# Create logs and backups directories
Write-Host "`nCreating necessary directories..." -ForegroundColor Yellow
$dirs = @("logs", "backups")
foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
        Write-Host "✓ Created $dir directory" -ForegroundColor Green
    } else {
        Write-Host "✓ $dir directory exists" -ForegroundColor Green
    }
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   Setup Complete!" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Edit backend\.env with your database and email settings"
Write-Host "2. Create the database:"
Write-Host "   mysql -u root -p < docs\DB_SCHEMA.sql"
Write-Host "3. Start the backend:"
Write-Host "   cd backend && npm run dev"
Write-Host "4. Start the frontend (in new terminal):"
Write-Host "   cd frontend && npm run dev"
Write-Host "5. Open http://localhost:5173 in your browser"
Write-Host ""
Write-Host "For detailed instructions, see docs\INSTALLATION.md" -ForegroundColor Cyan
Write-Host ""
