# 📖 Usage Guide

Comprehensive guide for using the Automated Bug Fixing System with BOB AI Assistant.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Workflow Examples](#workflow-examples)
- [Advanced Scenarios](#advanced-scenarios)
- [Best Practices](#best-practices)
- [Tips and Tricks](#tips-and-tricks)

## Basic Usage

### Starting a Session

1. Open your MCP client (Cursor, Claude Desktop, etc.)
2. Ensure all MCP servers are connected
3. Start interacting with BOB

### Verifying Tools Are Available

Ask BOB:
```
"What MCP tools do you have access to?"
```

You should see tools from:
- **GitMCP**: Documentation and code search
- **Issue Scanner**: Repository and issue management
- **Git Operations**: Repository modification and PR creation

## Workflow Examples

### Example 1: Scan Repositories for Bugs

**Goal**: Get an overview of all bug issues across your repositories.

**Prompt**:
```
"Scan all repositories listed in my config file for open bug issues and show me a summary"
```

**What BOB will do**:
1. Read your config file to get repository list
2. Use `fetch_issues` for each repository with label filter "bug"
3. Aggregate and present results

**Expected Output**:
```
Repository Summary:
- owner/repo1: 5 open bugs
- owner/repo2: 3 open bugs
- owner/repo3: 12 open bugs

Total: 20 open bugs across 3 repositories
```

### Example 2: Prioritize Issues

**Goal**: Get a prioritized list of issues to work on.

**Prompt**:
```
"Fetch all bug issues from my repositories, prioritize them by severity and age, and show me the top 10"
```

**What BOB will do**:
1. Fetch issues from all configured repositories
2. Use `prioritize_issues` with severity and age criteria
3. Present top 10 issues with priority scores

**Expected Output**:
```
Top 10 Priority Issues:

1. [Critical] owner/repo1 #42 - Memory leak in production (Score: 15.2)
   Age: 45 days | Comments: 8 | Complexity: high

2. [High] owner/repo2 #18 - API endpoint returns 500 (Score: 12.8)
   Age: 30 days | Comments: 5 | Complexity: medium

[... 8 more issues ...]
```

### Example 3: Fix a Specific Issue

**Goal**: Automatically fix a known issue and create a PR.

**Prompt**:
```
"Fix issue #42 in owner/repo1. Clone the repo, analyze the issue, generate a fix, and create a pull request"
```

**What BOB will do**:
1. Use `get_issue_details` to understand the issue
2. Use `clone_repository` to get the code
3. Use GitMCP to read documentation and search relevant code
4. Analyze the issue and generate a fix
5. Use `create_branch` to create a feature branch
6. Use `modify_file` to apply the fix
7. Use `commit_changes` and `push_changes`
8. Use `create_pull_request` to submit the fix

**Expected Output**:
```
✅ Successfully fixed issue #42

Branch created: autofix/issue-42
Files modified: src/memory-manager.ts
Commit: "Fix: Memory leak in production"
Pull Request: https://github.com/owner/repo1/pull/123

PR Description:
Fixes #42

## Changes
- Fixed memory leak by properly disposing event listeners
- Added cleanup in component unmount

## Testing
- Verified no memory leaks in Chrome DevTools
- Ran existing test suite (all passing)
```

### Example 4: Batch Fix Multiple Issues

**Goal**: Fix multiple issues in one session.

**Prompt**:
```
"Find the top 3 'good-first-issue' bugs in my repositories, fix them one by one, and create PRs for each"
```

**What BOB will do**:
1. Search for issues with labels "bug" and "good-first-issue"
2. Prioritize and select top 3
3. For each issue:
   - Clone repository (if not already cloned)
   - Analyze and fix
   - Create PR
4. Provide summary of all PRs created

### Example 5: Search for Specific Issue Types

**Goal**: Find issues related to a specific topic.

**Prompt**:
```
"Search for all open issues across my repositories that mention 'authentication' or 'login' and are labeled as bugs"
```

**What BOB will do**:
1. Use `search_issues` with query: `is:issue is:open label:bug authentication OR login`
2. Filter to only your repositories
3. Present results with links

## Advanced Scenarios

### Scenario 1: Custom Prioritization

**Prompt**:
```
"Fetch issues from owner/repo, but prioritize them with custom weights: critical=20, high=15, medium=8, low=2, and give more weight to older issues"
```

**What BOB will do**:
1. Fetch issues
2. Use `prioritize_issues` with custom severity weights
3. Apply age multiplier
4. Present prioritized list

### Scenario 2: Fix with Specific Requirements

**Prompt**:
```
"Fix issue #25 in owner/repo, but make sure to:
1. Add unit tests for the fix
2. Update the documentation
3. Follow the repository's coding style
4. Include a detailed PR description"
```

**What BOB will do**:
1. Clone and analyze the issue
2. Read repository's CONTRIBUTING.md and style guides using GitMCP
3. Generate fix with tests
4. Update relevant documentation
5. Create comprehensive PR with all changes

### Scenario 3: Dry Run (Analysis Only)

**Prompt**:
```
"Analyze issue #30 in owner/repo and tell me what needs to be fixed, but don't make any changes yet"
```

**What BOB will do**:
1. Get issue details
2. Use GitMCP to search relevant code
3. Analyze the problem
4. Provide detailed explanation and proposed solution
5. Wait for your approval before proceeding

### Scenario 4: Fix Across Multiple Repositories

**Prompt**:
```
"Search for all issues labeled 'typo' across my repositories and fix them all in one go"
```

**What BOB will do**:
1. Search all repositories for "typo" label
2. Group by repository
3. For each repository:
   - Clone once
   - Fix all typos
   - Create single PR with all fixes
4. Provide summary of all PRs

### Scenario 5: Incremental Workflow

**Prompt (Step 1)**:
```
"List all repositories I have access to"
```

**Prompt (Step 2)**:
```
"Fetch issues from owner/repo1 and owner/repo2"
```

**Prompt (Step 3)**:
```
"Prioritize those issues and show me the top 5"
```

**Prompt (Step 4)**:
```
"Fix the first issue in that list"
```

This approach gives you more control at each step.

## Best Practices

### 1. Start Small

Begin with:
- One repository
- Simple issues (typos, documentation)
- Manual review of each PR

### 2. Review Before Merging

Always review BOB's PRs before merging:
- Check the code changes
- Run tests locally
- Verify the fix addresses the issue
- Ensure no unintended changes

### 3. Use Descriptive Prompts

Good prompt:
```
"Fix issue #42 in owner/repo by analyzing the error logs in the issue description and the relevant code in src/api/"
```

Less effective prompt:
```
"Fix #42"
```

### 4. Leverage GitMCP for Context

Ask BOB to read documentation first:
```
"Before fixing issue #42, read the repository's architecture documentation and coding guidelines"
```

### 5. Batch Similar Issues

More efficient:
```
"Fix all typo issues in owner/repo in a single PR"
```

Less efficient:
```
"Fix issue #1, then #2, then #3..." (each a separate PR)
```

### 6. Set Expectations

Be clear about what you want:
```
"Fix issue #42, but only modify the minimum necessary code and add comments explaining the fix"
```

### 7. Use Configuration File

Update `bug-fix-config.json` for consistent behavior:
- Set appropriate filters
- Define priority weights
- Configure PR templates

## Tips and Tricks

### Tip 1: Check Issue Age

Before fixing, check if the issue is still relevant:
```
"Check if issue #42 in owner/repo is still reproducible by reading recent comments"
```

### Tip 2: Learn from Existing PRs

```
"Before fixing issue #42, show me how similar issues were fixed in this repository by searching closed PRs"
```

### Tip 3: Test Locally First

```
"Clone owner/repo and show me how to reproduce issue #42 locally so I can test the fix"
```

### Tip 4: Handle Dependencies

```
"Fix issue #42, and if it requires updating dependencies, list what needs to be updated and why"
```

### Tip 5: Create Draft PRs

```
"Fix issue #42 and create a DRAFT pull request so I can review before marking it ready"
```

### Tip 6: Link Related Issues

```
"Fix issue #42 and check if there are related issues that should be mentioned in the PR"
```

### Tip 7: Follow Up on PRs

```
"Check the status of all PRs created by the bug fixer system in the last week"
```

### Tip 8: Generate Reports

```
"Create a summary report of all issues fixed this month, including PR links and status"
```

## Common Patterns

### Pattern 1: Weekly Bug Sweep

```
"Scan all my repositories for new bugs opened in the last 7 days, prioritize them, and fix the top 3"
```

### Pattern 2: Good First Issues for Contributors

```
"Find all 'good-first-issue' bugs, fix them, and create PRs with detailed explanations to help new contributors learn"
```

### Pattern 3: Critical Bug Response

```
"Search for all critical bugs across my repositories and fix them immediately"
```

### Pattern 4: Documentation Fixes

```
"Find all issues labeled 'documentation' and fix them by updating the relevant docs"
```

### Pattern 5: Stale Issue Cleanup

```
"Find issues older than 90 days that are still open, analyze if they're still relevant, and either fix them or suggest closing"
```

## Monitoring and Maintenance

### Check System Status

```
"Show me statistics: how many issues have been scanned, how many PRs created, and success rate"
```

### Review Recent Activity

```
"List all PRs created by the bug fixer in the last 24 hours"
```

### Cleanup Workspace

```
"Clean up the git operations workspace by removing old cloned repositories"
```

## Troubleshooting During Use

### If a Fix Fails

```
"The fix for issue #42 failed. Show me the error and suggest what went wrong"
```

### If PR Creation Fails

```
"I see the fix was applied but the PR wasn't created. Try creating the PR again for branch autofix/issue-42"
```

### If You Need to Modify a Fix

```
"The fix for issue #42 needs adjustment. Checkout the branch, modify src/file.ts to [your changes], and update the PR"
```

## Next Steps

- Experiment with different prompts
- Customize the configuration for your workflow
- Set up regular automated runs
- Monitor PR success rates and adjust priorities

## Getting Help

If you need assistance:
1. Ask BOB to explain what it's doing: "Explain your approach to fixing this issue"
2. Request step-by-step execution: "Fix this issue but ask for confirmation at each step"
3. Review the logs in the service directories
4. Check the GitHub API rate limits if operations are slow