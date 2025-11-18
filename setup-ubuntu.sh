#!/bin/bash

# NiaHealth - Ubuntu/WSL2 Setup Script
echo "============================================"
echo "   NiaHealth - Ubuntu Setup Script"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Step 1: Update system packages
echo -e "${YELLOW}Step 1: Updating system packages...${NC}"
sudo apt update
sudo apt upgrade -y

# Step 2: Install Node.js and npm
echo ""
echo -e "${YELLOW}Step 2: Installing Node.js and npm...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
node_version=$(node --version)
npm_version=$(npm --version)
echo -e "${GREEN}✓ Node.js $node_version installed${NC}"
echo -e "${GREEN}✓ npm $npm_version installed${NC}"

# Step 3: Install MySQL Server
echo ""
echo -e "${YELLOW}Step 3: Installing MySQL Server...${NC}"
sudo apt install -y mysql-server

# Start MySQL
sudo service mysql start

# Verify MySQL installation
mysql_version=$(mysql --version)
echo -e "${GREEN}✓ MySQL installed: $mysql_version${NC}"

# Step 4: Configure MySQL root user (no password for development)
echo ""
echo -e "${YELLOW}Step 4: Configuring MySQL...${NC}"
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';"
sudo mysql -e "FLUSH PRIVILEGES;"
echo -e "${GREEN}✓ MySQL configured (no password for local development)${NC}"

# Step 5: Create NiaHealth database
echo ""
echo -e "${YELLOW}Step 5: Creating NiaHealth database...${NC}"
mysql -u root -e "CREATE DATABASE IF NOT EXISTS niahealth CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo -e "${GREEN}✓ Database 'niahealth' created${NC}"

# Step 6: Import database schema
echo ""
echo -e "${YELLOW}Step 6: Importing database schema...${NC}"
# Navigate to project root to find the schema file
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_FILE="$PROJECT_ROOT/docs/DB_SCHEMA.sql"

if [ -f "$SCHEMA_FILE" ]; then
    mysql -u root niahealth < "$SCHEMA_FILE"
    echo -e "${GREEN}✓ Database schema imported successfully${NC}"
else
    echo -e "${RED}✗ Schema file not found at $SCHEMA_FILE${NC}"
fi

# Step 7: Install backend dependencies
echo ""
echo -e "${YELLOW}Step 7: Installing backend dependencies...${NC}"
cd "$PROJECT_ROOT/backend"
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Step 8: Install frontend dependencies
echo ""
echo -e "${YELLOW}Step 8: Installing frontend dependencies...${NC}"
cd "$PROJECT_ROOT/frontend"
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Step 9: Create required directories
echo ""
echo -e "${YELLOW}Step 9: Creating application directories...${NC}"
mkdir -p "$PROJECT_ROOT/logs"
mkdir -p "$PROJECT_ROOT/backups"
echo -e "${GREEN}✓ Directories created${NC}"

# Step 10: Display completion message
echo ""
echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}   Setup Complete!${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Edit backend/.env with your email settings (if needed)"
echo "2. Start MySQL service (if not already running):"
echo -e "   ${CYAN}sudo service mysql start${NC}"
echo ""
echo "3. Start backend server:"
echo -e "   ${CYAN}cd backend && npm run dev${NC}"
echo ""
echo "4. Start frontend server (in new terminal/tab):"
echo -e "   ${CYAN}cd frontend && npm run dev${NC}"
echo ""
echo "5. Open your browser and go to:"
echo -e "   ${CYAN}http://localhost:5173${NC}"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""
