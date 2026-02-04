# 🤖 Automated Bug Fixing System

> **Scan, prioritize, and automatically fix bugs across your GitHub repositories using BOB AI Assistant**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io/)

## 🎯 Overview

This system enables **fully automated bug fixing** across multiple GitHub repositories. It combines:
- **GitMCP** for reading repository documentation and code
- **Issue Scanner Service** for finding and prioritizing bugs
- **Git Operations Service** for applying fixes and creating PRs
- **BOB AI Assistant** for intelligent code analysis and fix generation

## ✨ Features

- 🔍 **Automatic Issue Scanning** - Scan multiple repositories for bugs
- 🎯 **Smart Prioritization** - Rank issues by severity, age, and complexity
- 🤖 **AI-Powered Fixes** - BOB analyzes code and generates fixes
- 🔀 **Automated PRs** - Creates pull requests with detailed descriptions
- 📊 **Batch Processing** - Fix multiple issues in one workflow
- 🔒 **Secure** - Uses GitHub tokens, no data stored externally
- ⚡ **Fast** - Parallel processing of multiple repositories

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Issue Scanner Service
cd services/issue-scanner
pnpm install && pnpm build

# Git Operations Service
cd ../git-ops
pnpm install && pnpm build
```

### 2. Configure GitHub Token

```bash
# Create .env files
cp services/issue-scanner/.env.example services/issue-scanner/.env
cp services/git-ops/.env.example services/git-ops/.env

# Add your GitHub token to both .env files
echo "GITHUB_TOKEN=ghp_your_token_here" >> services/issue-scanner/.env
echo "GITHUB_TOKEN=ghp_your_token_here" >> services/git-ops/.env
```

### 3. Setup MCP Client

Add to your MCP client configuration. For IBM Bob, the configuration file is typically located at `~/.bob/mcp.json` or in your IBM Bob settings directory:

```json
{
  "mcpServers": {
    "gitmcp": {
      "url": "https://gitmcp.io/docs"
    },
    "issue-scanner": {
      "command": "node",
      "args": ["<absolute-path>/services/issue-scanner/dist/index.js"]
    },
    "git-ops": {
      "command": "node",
      "args": ["<absolute-path>/services/git-ops/dist/index.js"]
    }
  }
}
```

### 4. Configure Repositories

Edit `config/bug-fix-config.json`:

```json
{
  "repositories": [
    "your-username/repo1",
    "your-username/repo2"
  ],
  "filters": {
    "labels": ["bug"],
    "exclude_labels": ["wontfix"]
  }
}
```

### 5. Start Fixing Bugs!

Open your MCP client and ask BOB:

```
"Scan my repositories for bugs, prioritize them, and fix the top 3 issues"
```

## 📖 Documentation

- **[Setup Guide](docs/SETUP.md)** - Detailed installation and configuration
- **[Usage Guide](docs/USAGE.md)** - Examples and best practices
- **[Architecture](docs/README.md)** - System design and components

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
│ • Prioritize issues    │      │ • Modify files             │
│ • Search issues        │      │ • Commit & push            │
└────────────────────────┘      │ • Create pull request      │
             │                  └────────────────────────────┘
             │                               │
             ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      GitHub API                             │
└─────────────────────────────────────────────────────────────┘

Plus: GitMCP for documentation and code search
```

## 🛠️ Available Tools

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

### GitMCP Tools
- `fetch_generic_documentation` - Get repository documentation
- `search_generic_documentation` - Search documentation
- `search_generic_code` - Search code
- `fetch_generic_url_content` - Fetch external URLs

## 💡 Usage Examples

### Example 1: Scan and Fix

```
"Scan all my repositories for critical bugs and fix them"
```

### Example 2: Specific Issue

```
"Fix issue #42 in owner/repo by analyzing the code and creating a PR"
```

### Example 3: Batch Processing

```
"Find all 'good-first-issue' bugs and fix the top 5"
```

### Example 4: Custom Prioritization

```
"Prioritize bugs by age and complexity, then fix the oldest high-complexity issue"
```

## 🔒 Security

- ✅ Uses GitHub Personal Access Tokens (never stored)
- ✅ All operations require explicit approval
- ✅ No external data storage
- ✅ Open source - audit the code yourself
- ✅ Respects repository permissions

## 📊 Workflow

1. **Scan** → Find issues across repositories
2. **Prioritize** → Rank by severity, age, complexity
3. **Analyze** → BOB reads code and documentation
4. **Fix** → Generate and apply code changes
5. **PR** → Create pull request with description
6. **Review** → You review and merge

## 🎓 Requirements

- Node.js 18+
- GitHub account with repo access
- IBM Bob IDE (MCP-compatible AI development environment)
- GitHub Personal Access Token with `repo` scope

## 🤝 Contributing

This is a custom implementation for automated bug fixing. Feel free to:
- Fork and customize for your needs
- Add new MCP tools
- Improve prioritization algorithms
- Share your improvements

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Built on [GitMCP](https://github.com/idosal/git-mcp)
- Uses [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- Powered by BOB AI Assistant

## 📞 Support

- Check [docs/SETUP.md](docs/SETUP.md) for setup issues
- Review [docs/USAGE.md](docs/USAGE.md) for usage questions
- Open an issue for bugs or feature requests

## 🚦 Status

- ✅ Issue Scanner Service - Complete
- ✅ Git Operations Service - Complete
- ✅ Configuration System - Complete
- ✅ Documentation - Complete
- ⏳ Testing - Ready for user testing
- 🔄 Continuous Improvement

---

**Ready to automate your bug fixing?** Follow the [Setup Guide](docs/SETUP.md) to get started!