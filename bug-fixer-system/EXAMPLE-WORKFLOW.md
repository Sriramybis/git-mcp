# 🔄 Example Workflow: Automated Bug Fixing

This document shows a real example of using the bug-fixer system from start to finish.

## Scenario

You want to automatically scan your repositories for bugs, prioritize them, and fix the most critical ones.

## Prerequisites

✅ GitHub token configured in both .env files
✅ MCP services configured in IBM Bob
✅ IBM Bob restarted

---

## Step-by-Step Workflow

### Step 1: Discover Your Repositories

**Ask BOB:**
```
"Use list_repositories to show me all my GitHub repositories"
```

**Expected Output:**
```json
{
  "success": true,
  "count": 15,
  "repositories": [
    {
      "owner": "your-username",
      "name": "my-awesome-app",
      "full_name": "your-username/my-awesome-app",
      "description": "An awesome web application",
      "url": "https://github.com/your-username/my-awesome-app",
      "open_issues": 12
    },
    ...
  ]
}
```

---

### Step 2: Scan for Bug Issues

Pick a repository from above, then ask BOB:
```
"Use fetch_issues to get all open issues from your-username/my-awesome-app with label 'bug'"
```

**Expected Output:**
```json
{
  "success": true,
  "count": 5,
  "issues": [
    {
      "number": 42,
      "title": "Memory leak in user authentication",
      "state": "open",
      "labels": ["bug", "critical"],
      "complexity": "high",
      "comments": 3,
      "url": "https://github.com/your-username/my-awesome-app/issues/42"
    },
    {
      "number": 38,
      "title": "Typo in README",
      "state": "open",
      "labels": ["bug", "documentation"],
      "complexity": "low",
      "comments": 0,
      "url": "https://github.com/your-username/my-awesome-app/issues/38"
    },
    ...
  ]
}
```

---

### Step 3: Prioritize Issues

**Ask BOB:**
```
"Use prioritize_issues to rank these issues by severity and age"
```

Pass the issues array from Step 2.

**Expected Output:**
```json
{
  "success": true,
  "issues": [
    {
      "number": 42,
      "title": "Memory leak in user authentication",
      "priority_score": 15.8,
      "labels": ["bug", "critical"],
      "complexity": "high"
    },
    {
      "number": 39,
      "title": "API endpoint returns 500 error",
      "priority_score": 12.3,
      "labels": ["bug", "high"],
      "complexity": "medium"
    },
    ...
  ]
}
```

---

### Step 4: Get Issue Details

**Ask BOB:**
```
"Use get_issue_details to get full details of issue #42 in your-username/my-awesome-app"
```

**Expected Output:**
```json
{
  "success": true,
  "issue": {
    "number": 42,
    "title": "Memory leak in user authentication",
    "body": "When users log in and out repeatedly, memory usage increases...",
    "labels": ["bug", "critical"],
    "complexity": "high",
    "comments": [
      {
        "author": "developer1",
        "body": "I think this is related to event listeners not being cleaned up",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

### Step 5: Clone the Repository

**Ask BOB:**
```
"Use clone_repository to clone your-username/my-awesome-app"
```

**Expected Output:**
```json
{
  "success": true,
  "message": "Repository cloned successfully to ./workspace/your-username/my-awesome-app",
  "path": "./workspace/your-username/my-awesome-app"
}
```

---

### Step 6: Analyze the Repository

**Ask BOB:**
```
"Use analyze_repository to understand the structure of your-username/my-awesome-app"
```

**Expected Output:**
```json
{
  "success": true,
  "repository": "your-username/my-awesome-app",
  "language": "JavaScript/TypeScript",
  "dependencies": ["react", "express", "socket.io"],
  "scripts": ["start", "build", "test"],
  "structure": [
    {"name": "src", "type": "directory"},
    {"name": "tests", "type": "directory"},
    {"name": "package.json", "type": "file"},
    {"name": "README.md", "type": "file"}
  ]
}
```

---

### Step 7: Understand the Issue Context

**Ask BOB:**
```
"Based on issue #42 about memory leak in authentication, search the codebase for authentication-related files. Use list_files to explore the src/ directory, then read relevant files."
```

BOB will:
1. List files in src/
2. Identify auth-related files (e.g., `src/auth/login.js`)
3. Read those files to understand the code

---

### Step 8: Generate a Fix

**Ask BOB:**
```
"Based on the code you read and the issue description, what needs to be fixed? Provide a detailed explanation and the code changes needed."
```

**BOB's Response:**
```
The memory leak is caused by event listeners being added in the login function 
but never removed during logout. Here's the fix:

1. In src/auth/login.js, the loginUser function adds event listeners:
   - Line 45: document.addEventListener('sessionExpired', handleExpiry)
   
2. These listeners are never removed in src/auth/logout.js

3. Fix: Add cleanup in logout function:
   - Remove event listeners before clearing session
   - Use removeEventListener with the same handler reference

The modified logout.js should include:
```javascript
function logoutUser() {
  // Clean up event listeners
  document.removeEventListener('sessionExpired', handleExpiry);
  
  // Clear session
  sessionStorage.clear();
  // ... rest of logout logic
}
```
```

---

### Step 9: Create a Feature Branch

**Ask BOB:**
```
"Use create_branch to create a new branch called 'fix/issue-42-memory-leak' in your-username/my-awesome-app"
```

**Expected Output:**
```json
{
  "success": true,
  "message": "Branch 'fix/issue-42-memory-leak' created successfully",
  "branch": "fix/issue-42-memory-leak"
}
```

---

### Step 10: Apply the Fix

**Ask BOB:**
```
"Use read_file to get the current content of src/auth/logout.js, then use modify_file to apply the fix we discussed"
```

BOB will:
1. Read the current file
2. Apply the changes
3. Confirm the modification

**Expected Output:**
```json
{
  "success": true,
  "message": "File 'src/auth/logout.js' modified successfully"
}
```

---

### Step 11: Commit the Changes

**Ask BOB:**
```
"Use commit_changes to commit the fix with message 'Fix: Memory leak in authentication (Resolves #42)'"
```

**Expected Output:**
```json
{
  "success": true,
  "message": "Changes committed successfully",
  "commit": "Fix: Memory leak in authentication (Resolves #42)"
}
```

---

### Step 12: Push to Remote

**Ask BOB:**
```
"Use push_changes to push branch 'fix/issue-42-memory-leak' to remote in your-username/my-awesome-app"
```

**Expected Output:**
```json
{
  "success": true,
  "message": "Changes pushed to branch 'fix/issue-42-memory-leak'"
}
```

---

### Step 13: Create Pull Request

**Ask BOB:**
```
"Use create_pull_request to create a PR in your-username/my-awesome-app from 'fix/issue-42-memory-leak' to 'main' with title '[AutoFix] Fix memory leak in authentication' and body:

'Fixes #42

## Changes
- Added cleanup of event listeners in logout function
- Properly removes sessionExpired listener to prevent memory leak

## Testing
- Verified memory usage stays stable during repeated login/logout
- Ran existing test suite (all passing)
- Tested in Chrome DevTools memory profiler

## Impact
- Fixes critical memory leak affecting production users
- No breaking changes
- Improves app performance during extended sessions'
"
```

**Expected Output:**
```json
{
  "success": true,
  "message": "Pull request created successfully",
  "pr_number": 123,
  "pr_url": "https://github.com/your-username/my-awesome-app/pull/123"
}
```

---

## 🎉 Success!

You've successfully:
✅ Scanned repositories for bugs
✅ Prioritized issues by severity
✅ Analyzed the code to understand the problem
✅ Generated and applied a fix
✅ Created a professional pull request

The PR is now ready for review on GitHub!

---

## Automation: Full Workflow

Once you're comfortable with the individual steps, you can ask BOB to do everything in one go:

**Ask BOB:**
```
"Find the highest priority bug in your-username/my-awesome-app, analyze it, create a fix, and submit a pull request"
```

BOB will execute all 13 steps automatically!

---

## Tips for Best Results

1. **Start with simple bugs** (typos, documentation) to verify the workflow
2. **Review PRs carefully** before merging
3. **Use specific repositories** initially rather than scanning all repos
4. **Provide context** when asking BOB to fix issues
5. **Test locally** after BOB creates the PR

---

## Next Steps

- Fix more issues from your prioritized list
- Set up automated weekly scans
- Configure bug-fix-config.json for your preferences
- Create custom prioritization criteria
- Batch process similar issues together

Happy bug fixing! 🐛→✅
