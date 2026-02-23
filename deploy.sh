#!/bin/bash

# VPN XO Website Deployment Script
# This script builds and deploys the website to the production server

set -e  # Exit on error

echo "ðŸš€ VPN XO Website Deployment"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
SERVER_USER="ubuntu"
SERVER_IP="51.222.9.219"
SERVER_PATH="/var/www/html"
BUILD_DIR="build"

# Step 1: Clean previous build
echo -e "${BLUE}Step 1: Cleaning previous build...${NC}"
if [ -d "$BUILD_DIR" ]; then
    rm -rf "$BUILD_DIR"
    echo -e "${GREEN}âœ“ Previous build cleaned${NC}"
else
    echo -e "${GREEN}âœ“ No previous build found${NC}"
fi
echo ""

# Step 2: Install dependencies
echo -e "${BLUE}Step 2: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}âœ“ Dependencies installed${NC}"
echo ""

# Step 3: Build the project
echo -e "${BLUE}Step 3: Building the project...${NC}"
npm run build
echo -e "${GREEN}âœ“ Build completed successfully${NC}"
echo ""

# Step 4: Create backup on server
echo -e "${BLUE}Step 4: Creating backup on server...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} "
    if [ -d ${SERVER_PATH}/vpnxo ]; then
        sudo cp -r ${SERVER_PATH}/vpnxo ${SERVER_PATH}/vpnxo_backup_\$(date +%Y%m%d_%H%M%S)
        echo 'Backup created'
    else
        echo 'No existing deployment to backup'
    fi
"
echo -e "${GREEN}âœ“ Backup completed${NC}"
echo ""

# Step 5: Deploy to server
echo -e "${BLUE}Step 5: Deploying to server...${NC}"

# Create vpnxo directory if it doesn't exist
ssh ${SERVER_USER}@${SERVER_IP} "sudo mkdir -p ${SERVER_PATH}/vpnxo"

# Copy build files
scp -r ${BUILD_DIR}/* ${SERVER_USER}@${SERVER_IP}:/tmp/vpnxo_deploy/

# Move files to final location
ssh ${SERVER_USER}@${SERVER_IP} "
    sudo rm -rf ${SERVER_PATH}/vpnxo/*
    sudo mv /tmp/vpnxo_deploy/* ${SERVER_PATH}/vpnxo/
    sudo chown -R www-data:www-data ${SERVER_PATH}/vpnxo
    sudo chmod -R 755 ${SERVER_PATH}/vpnxo
    rm -rf /tmp/vpnxo_deploy
"

echo -e "${GREEN}âœ“ Deployment completed${NC}"
echo ""

# Step 6: Verify deployment
echo -e "${BLUE}Step 6: Verifying deployment...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://${SERVER_IP}/vpnxo)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}âœ“ Website is accessible (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}âš  Warning: Website returned HTTP $HTTP_CODE${NC}"
fi
echo ""

# Summary
echo "=============================="
echo -e "${GREEN}ðŸŽ‰ Deployment Complete!${NC}"
echo ""
echo "Website URL: http://${SERVER_IP}/vpnxo"
echo "Live Site: http://vpn-xo.com/vpnxo"
echo ""
echo "Next steps:"
echo "1. Test the website in your browser"
echo "2. Check all pages and functionality"
echo "3. Monitor server logs for any errors"
echo ""
echo "To rollback, use the backup created in ${SERVER_PATH}/vpnxo_backup_*"
echo "=============================="

