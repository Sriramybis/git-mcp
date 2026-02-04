#!/bin/bash

# Validation script for bug-fixer system setup
# Run this to check if everything is configured correctly

echo "🔍 Validating Bug Fixer System Setup..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success=0
failures=0

# Check 1: Node.js version
echo "1. Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
    ((success++))
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js 18+"
    ((failures++))
fi
echo ""

# Check 2: Git installed
echo "2. Checking Git installation..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo -e "${GREEN}✓${NC} Git installed: $GIT_VERSION"
    ((success++))
else
    echo -e "${RED}✗${NC} Git not found. Please install Git"
    ((failures++))
fi
echo ""

# Check 3: Issue Scanner built
echo "3. Checking Issue Scanner build..."
if [ -f "services/issue-scanner/dist/index.js" ]; then
    echo -e "${GREEN}✓${NC} Issue Scanner built successfully"
    ((success++))
else
    echo -e "${RED}✗${NC} Issue Scanner not built. Run: cd services/issue-scanner && npm run build"
    ((failures++))
fi
echo ""

# Check 4: Git Ops built
echo "4. Checking Git Operations build..."
if [ -f "services/git-ops/dist/index.js" ]; then
    echo -e "${GREEN}✓${NC} Git Operations built successfully"
    ((success++))
else
    echo -e "${RED}✗${NC} Git Operations not built. Run: cd services/git-ops && npm run build"
    ((failures++))
fi
echo ""

# Check 5: Issue Scanner .env
echo "5. Checking Issue Scanner .env file..."
if [ -f "services/issue-scanner/.env" ]; then
    if grep -q "your_github_token_here" services/issue-scanner/.env; then
        echo -e "${YELLOW}⚠${NC} .env file exists but token not configured"
        echo "   Please add your GitHub token to services/issue-scanner/.env"
    else
        echo -e "${GREEN}✓${NC} .env file configured"
        ((success++))
    fi
else
    echo -e "${RED}✗${NC} .env file missing. Copy from .env.example"
    ((failures++))
fi
echo ""

# Check 6: Git Ops .env
echo "6. Checking Git Operations .env file..."
if [ -f "services/git-ops/.env" ]; then
    if grep -q "your_github_token_here" services/git-ops/.env; then
        echo -e "${YELLOW}⚠${NC} .env file exists but token not configured"
        echo "   Please add your GitHub token to services/git-ops/.env"
    else
        echo -e "${GREEN}✓${NC} .env file configured"
        ((success++))
    fi
else
    echo -e "${RED}✗${NC} .env file missing. Copy from .env.example"
    ((failures++))
fi
echo ""

# Check 7: Workspace directory
echo "7. Checking workspace directory..."
if [ -d "services/git-ops/workspace" ]; then
    echo -e "${GREEN}✓${NC} Workspace directory exists"
    ((success++))
else
    echo -e "${YELLOW}⚠${NC} Workspace directory will be created on first use"
fi
echo ""

# Check 8: Git config
echo "8. Checking Git configuration..."
if git config --global user.name &> /dev/null && git config --global user.email &> /dev/null; then
    GIT_USER=$(git config --global user.name)
    GIT_EMAIL=$(git config --global user.email)
    echo -e "${GREEN}✓${NC} Git configured: $GIT_USER <$GIT_EMAIL>"
    ((success++))
else
    echo -e "${YELLOW}⚠${NC} Git not fully configured. Set with:"
    echo "   git config --global user.name \"Your Name\""
    echo "   git config --global user.email \"your@email.com\""
fi
echo ""

# Check 9: Dependencies installed
echo "9. Checking dependencies..."
if [ -d "services/issue-scanner/node_modules" ] && [ -d "services/git-ops/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Dependencies installed for both services"
    ((success++))
else
    echo -e "${RED}✗${NC} Dependencies missing. Run npm install in each service directory"
    ((failures++))
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary: $success checks passed, $failures checks failed"

if [ $failures -eq 0 ]; then
    echo -e "${GREEN}✓ System ready!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Add your GitHub token to both .env files"
    echo "2. Configure MCP in IBM Bob (check Bob's settings for MCP configuration)"
    echo "3. Restart IBM Bob"
    echo "4. Follow TEST.md for testing"
    echo ""
else
    echo -e "${RED}✗ Please fix the issues above${NC}"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
