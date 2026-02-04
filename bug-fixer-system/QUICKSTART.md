# 🚀 Quick Start Guide

## Step 1: Set Up GitHub Token

You need a GitHub Personal Access Token with the following permissions:
- `repo` (Full control of private repositories)
- `read:org` (Read org and team membership)

### Create a Token:
1. Go to https://github.com/settings/tokens/new
2. Give it a name (e.g., "Bug Fixer System")
3. Select scopes: `repo`, `read:org`
4. Click "Generate token"
5. **Copy the token immediately** (you won't see it again!)

### Add Token to .env Files:

```bash
# Edit issue-scanner .env
nano services/issue-scanner/.env
# Replace "your_github_token_here" with your actual token

# Edit git-ops .env
nano services/git-ops/.env
# Replace "your_github_token_here" with your actual token
```

## Step 2: Verify Installation

Both services are already built! Verify with:

```bash
# Check if built files exist
ls services/issue-scanner/dist/
ls services/git-ops/dist/
```

You should see `index.js` files in both directories.

## Step 3: Test the Services

### Test Issue Scanner:
```bash
cd services/issue-scanner
echo '{"owner": "octocat", "repo": "Hello-World"}' | node dist/index.js
```

### Test Git Operations:
```bash
cd services/git-ops
node dist/index.js
```

## Step 4: Configure MCP Client

Add these services to your Bob MCP configuration (typically `~/.bob/mcp.json` or check Bob's documentation for the correct path):

```json
{
  "mcpServers": {
    "issue-scanner": {
      "command": "node",
      "args": ["/Users/amruthapappu/Downloads/git-mcp/bug-fixer-system/services/issue-scanner/dist/index.js"]
    },
    "git-ops": {
      "command": "node",
      "args": ["/Users/amruthapappu/Downloads/git-mcp/bug-fixer-system/services/git-ops/dist/index.js"]
    }
  }
}
```

**Note:** Update the paths if your directory is different! Also verify Bob's MCP config location in Bob's documentation.

## Step 5: Restart Bob

After updating the MCP configuration, restart Bob completely.

## Step 6: Test the System

Ask the BOB AI Assistant:

```
"List all MCP tools available"
```

You should see tools from both `issue-scanner` and `git-ops` services.

Then try:

```
"List all repositories I have access to on GitHub"
```

If this works, the system is ready!

## Step 7: Configure Your Repositories

Edit `config/bug-fix-config.json` and add your repositories:

```json
{
  "repositories": [
    "your-username/repo1",
    "your-username/repo2"
  ]
}
```

## 🎯 Ready to Use!

Now you can ask me to:
- "Scan my repositories for bug issues"
- "Find and prioritize all bugs in username/repo"
- "Fix issue #123 in username/repo and create a PR"

## 🐛 Troubleshooting

### Services not showing in MCP:
- Make sure paths in your IBM Bob MCP configuration are absolute paths
- Restart IBM Bob completely
- Check that both services built successfully

### GitHub API errors:
- Verify your token is correct in both `.env` files
- Check token has `repo` and `read:org` permissions
- Test token at: https://api.github.com/user (with Authorization header)

### Can't clone repositories:
- Make sure you have write access to the repositories
- Check that `WORKSPACE_DIR` exists and is writable
- Verify token has `repo` permission (not just `public_repo`)
