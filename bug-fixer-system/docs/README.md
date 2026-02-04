# 🤖 Automated Bug Fixing System

An intelligent system that automatically scans GitHub repositories for issues, prioritizes them, and uses BOB AI Assistant to generate fixes and create pull requests.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     BOB AI Assistant                        │
│              (Orchestrates the workflow)                    │
└────────────┬────────────────────────────────┬───────────────┘
             │                                │
             ▼                                ▼
┌────────────────────────┐      ┌────────────────────────────┐
│  Issue Scanner Service │      │   Git Operations Service   │
│      (MCP Server)      │      │       (MCP Server)         │
├────────────────────────┤      ├────────────────────────────┤
│ • List repositories    │      │ • Clone repository         │
│ • Fetch issues         │      │ • Create branch            │
│ • Get issue details    │      │ • Modify files             │
│ • Search issues        │      │ • Commit changes           │
│ • Prioritize issues    │      │ • Push changes             │
└────────────────────────┘      │ • Create pull request      │
             │                  └────────────────────────────┘
             │                               │
             ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      GitHub API                             │
└─────────────────────────────────────────────────────────────┘
```

Additionally, the system integrates with **GitMCP** for reading repository documentation and code:

```
┌────────────────────────┐
│   GitMCP (Existing)    │
│      (MCP Server)      │
├────────────────────────┤
│ • Fetch documentation  │
│ • Search documentation │
│ • Search code          │
│ • Fetch URL content    │
└────────────────────────┘
```

## 📁 Project Structure

```
bug-fixer-system/
├── config/
│   └── bug-fix-config.json          # Main configuration file
├── services/
│   ├── issue-scanner/               # Issue scanning MCP service
│   │   ├── src/
│   │   │   └── index.ts            # Issue scanner implementation
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env.example
│   └── git-ops/                     # Git operations MCP service
│       ├── src/
│       │   └── index.ts            # Git operations implementation
│       ├── package.json
│       ├── tsconfig.json
│       └── .env.example
├── workflows/
│   └── bug-fix-workflow.ts         # Main workflow orchestrator
└── docs/
    ├── README.md                    # This file
    ├── SETUP.md                     # Setup instructions
    └── USAGE.md                     # Usage guide
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- GitHub Personal Access Token with `repo` permissions
- IBM Bob IDE (MCP-compatible AI development environment)

### 1. Setup Services

#### Issue Scanner Service

```bash
cd services/issue-scanner
pnpm install
cp .env.example .env
# Edit .env and add your GITHUB_TOKEN
pnpm build
```

#### Git Operations Service

```bash
cd services/git-ops
pnpm install
cp .env.example .env
# Edit .env and add your GITHUB_TOKEN
pnpm build
```

### 2. Configure MCP Servers

Add both services to your MCP client configuration:

**For IBM Bob** (check Bob's documentation for config location, typically `~/.bob/mcp.json`):

```json
{
  "mcpServers": {
    "gitmcp": {
      "url": "https://gitmcp.io/docs"
    },
    "issue-scanner": {
      "command": "node",
      "args": ["/path/to/bug-fixer-system/services/issue-scanner/dist/index.js"]
    },
    "git-ops": {
      "command": "node",
      "args": ["/path/to/bug-fixer-system/services/git-ops/dist/index.js"]
    }
  }
}
```

**For IBM Bob** (check IBM Bob documentation for exact location, typically `~/.bob/mcp.json`):

```json
{
  "mcpServers": {
    "gitmcp": {
      "url": "https://gitmcp.io/docs"
    },
    "issue-scanner": {
      "command": "node",
      "args": ["/path/to/bug-fixer-system/services/issue-scanner/dist/index.js"]
    },
    "git-ops": {
      "command": "node",
      "args": ["/path/to/bug-fixer-system/services/git-ops/dist/index.js"]
    }
  }
}
```

**For Claude Desktop**:

```json
{
  "mcpServers": {
    "gitmcp": {
      "command": "npx",
      "args": ["mcp-remote", "https://gitmcp.io/docs"]
    },
    "issue-scanner": {
      "command": "node",
      "args": ["/path/to/bug-fixer-system/services/issue-scanner/dist/index.js"]
    },
    "git-ops": {
      "command": "node",
      "args": ["/path/to/bug-fixer-system/services/git-ops/dist/index.js"]
    }
  }
}
```

### 3. Configure Bug Fixing

Edit `config/bug-fix-config.json`:

```json
{
  "repositories": [
    "your-username/repo1",
    "your-username/repo2"
  ],
  "filters": {
    "labels": ["bug", "good-first-issue"],
    "exclude_labels": ["wontfix", "duplicate"],
    "max_age_days": 90
  },
  "github": {
    "token": "YOUR_GITHUB_TOKEN_HERE",
    "base_branch": "main",
    "pr_prefix": "[AutoFix]"
  }
}
```

## 🎯 How It Works

### Workflow Steps

1. **Scan Repositories**
   - Lists all specified repositories
   - Fetches open issues matching filter criteria
   - Returns structured issue data

2. **Prioritize Issues**
   - Analyzes issues based on:
     - Severity labels (critical, high, medium, low)
     - Issue age
     - Comment activity
     - Estimated complexity
   - Sorts by priority score

3. **Fix Issues (for each prioritized issue)**
   - Clone repository
   - Get detailed issue information
   - Use GitMCP to understand codebase
   - BOB analyzes issue and generates fix
   - Create feature branch
   - Apply code changes
   - Commit and push changes
   - Create pull request with issue reference

4. **Report Results**
   - Summary of issues processed
   - PRs created
   - Any failures

## 🛠️ Available MCP Tools

### Issue Scanner Tools

- `list_repositories` - List accessible repositories
- `fetch_issues` - Get issues from a repository
- `get_issue_details` - Get detailed issue information
- `search_issues` - Search issues across GitHub
- `prioritize_issues` - Prioritize issues by criteria

### Git Operations Tools

- `clone_repository` - Clone repo to workspace
- `create_branch` - Create new branch
- `modify_file` - Modify or create files
- `commit_changes` - Commit changes
- `push_changes` - Push to remote
- `create_pull_request` - Create PR on GitHub

### GitMCP Tools (Existing)

- `fetch_generic_documentation` - Get repository documentation
- `search_generic_documentation` - Search documentation
- `search_generic_code` - Search code
- `fetch_generic_url_content` - Fetch external URLs

## 💡 Usage Examples

### Example 1: Scan and Prioritize Issues

Ask BOB:
```
"Scan my repositories for bug issues and prioritize them by severity"
```

BOB will:
1. Use `list_repositories` to get your repos
2. Use `fetch_issues` for each repo with label filter "bug"
3. Use `prioritize_issues` to sort by severity
4. Present prioritized list

### Example 2: Fix a Specific Issue

Ask BOB:
```
"Fix issue #42 in owner/repo by analyzing the code and creating a PR"
```

BOB will:
1. Use `get_issue_details` to understand the issue
2. Use GitMCP tools to read documentation and search code
3. Use `clone_repository` to get the code
4. Analyze and generate fix
5. Use `create_branch`, `modify_file`, `commit_changes`, `push_changes`
6. Use `create_pull_request` to submit the fix

### Example 3: Automated Workflow

Ask BOB:
```
"Run the automated bug fixing workflow for repositories in my config file"
```

BOB will execute the full workflow as described in the "How It Works" section.

## 🔒 Security Considerations

- **GitHub Token**: Store securely, never commit to version control
- **Repository Access**: Only processes repos you have access to
- **PR Review**: All PRs should be reviewed before merging
- **Workspace Isolation**: Each repo cloned to separate directory
- **Rate Limiting**: Respects GitHub API rate limits

## 🐛 Troubleshooting

### Services won't start
- Check Node.js version (18+)
- Verify `.env` files exist with valid tokens
- Run `pnpm install` in each service directory

### MCP tools not available
- Restart IBM Bob completely
- Check MCP configuration paths are correct and absolute
- Verify MCP config file location for your client
- Verify services are built (`npm run build`)

### GitHub API errors
- Check token has correct permissions (`repo`, `read:org`)
- Verify token hasn't expired
- Check rate limit: https://api.github.com/rate_limit

## 📚 Additional Documentation

- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Usage Guide](./USAGE.md) - Advanced usage examples
- [GitMCP Documentation](https://github.com/idosal/git-mcp) - GitMCP reference

## 🤝 Contributing

This is a custom implementation for automated bug fixing. Feel free to:
- Extend with additional MCP tools
- Add support for more issue types
- Improve prioritization algorithms
- Add testing frameworks

## 📄 License

MIT License - See individual service directories for details

## 🙏 Acknowledgments

- Built on top of [GitMCP](https://github.com/idosal/git-mcp)
- Uses [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- Powered by BOB AI Assistant