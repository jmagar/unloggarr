#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Building unloggarr Docker image...${NC}"

# Build the image
echo -e "${YELLOW}📦 Building Docker image...${NC}"
docker build -t unloggarr:latest .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
    
    # Show image info
    echo -e "${BLUE}📊 Image information:${NC}"
    docker images unloggarr:latest
    
    echo -e "${YELLOW}💡 Quick start commands:${NC}"
    echo -e "${GREEN}  Development:${NC} docker-compose up -d"
    echo -e "${GREEN}  Production:${NC} docker run -d --name unloggarr -p 3000:3000 -p 6970:6970 --env-file .env.local unloggarr:latest"
    echo -e "${GREEN}  Logs:${NC} docker logs -f unloggarr"
    echo -e "${GREEN}  Stop:${NC} docker-compose down"
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi 