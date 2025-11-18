# NiaHealth - Database Setup Script
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   NiaHealth Database Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Add MySQL to PATH for this session
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.4\bin"
if ($env:Path -notlike "*$mysqlPath*") {
    $env:Path += ";$mysqlPath"
}

Write-Host "Step 1: Checking MySQL service..." -ForegroundColor Yellow

# Check if MySQL service exists and start it
$mysqlService = Get-Service -Name MySQL* -ErrorAction SilentlyContinue

if ($mysqlService) {
    if ($mysqlService.Status -ne "Running") {
        Write-Host "Starting MySQL service..." -ForegroundColor Yellow
        try {
            Start-Service $mysqlService.Name -ErrorAction Stop
            Write-Host "MySQL service started successfully" -ForegroundColor Green
        } catch {
            Write-Host "Failed to start MySQL service. Please run as Administrator." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "MySQL service is already running" -ForegroundColor Green
    }
} else {
    Write-Host "MySQL service not found. Installing..." -ForegroundColor Yellow
    try {
        & "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --install
        Start-Sleep -Seconds 2
        $mysqlService = Get-Service -Name MySQL* | Select-Object -First 1
        Start-Service $mysqlService.Name
        Write-Host "MySQL service installed and started" -ForegroundColor Green
    } catch {
        Write-Host "Failed to install MySQL service. Please run as Administrator." -ForegroundColor Red
        exit 1
    }
}

Write-Host "`nStep 2: Creating NiaHealth database..." -ForegroundColor Yellow
Write-Host "Enter MySQL root password (press Enter if no password is set):" -ForegroundColor Gray

# Try to create database
$createDbScript = @"
CREATE DATABASE IF NOT EXISTS niahealth CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES LIKE 'niahealth';
"@

$tempSqlFile = Join-Path $env:TEMP "create_db.sql"
$createDbScript | Out-File -FilePath $tempSqlFile -Encoding ASCII

& mysql -u root -p -e "source $tempSqlFile"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database 'niahealth' created successfully!" -ForegroundColor Green
    
    Write-Host "`nStep 3: Importing database schema..." -ForegroundColor Yellow
    $schemaPath = Join-Path $PSScriptRoot "docs\DB_SCHEMA.sql"
    
    if (Test-Path $schemaPath) {
        & mysql -u root -p niahealth -e "source $schemaPath"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Database schema imported successfully!" -ForegroundColor Green
            
            Write-Host "`n============================================" -ForegroundColor Cyan
            Write-Host "   Setup Complete!" -ForegroundColor Cyan
            Write-Host "============================================" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Your database is ready! Next steps:" -ForegroundColor Yellow
            Write-Host "1. Update backend\.env with your MySQL password (if you set one)"
            Write-Host "2. Start backend: cd backend; npm run dev" -ForegroundColor Cyan
            Write-Host "3. Start frontend (new terminal): cd frontend; npm run dev" -ForegroundColor Cyan
            Write-Host ""
        } else {
            Write-Host "Failed to import schema. Check the error above." -ForegroundColor Red
        }
    } else {
        Write-Host "Schema file not found at: $schemaPath" -ForegroundColor Red
    }
} else {
    Write-Host "Failed to create database. Check your MySQL credentials." -ForegroundColor Red
}

Remove-Item $tempSqlFile -ErrorAction SilentlyContinue
