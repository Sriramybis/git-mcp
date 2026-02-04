# 🧪 Testing Guide

This guide walks you through testing the bug-fixer system end-to-end.

## Prerequisites

✅ Both services built successfully
✅ GitHub token configured in both `.env` files
✅ MCP services registered in Bob (or your MCP client)

## Test 1: List Repositories

Ask BOB:
```
"Use the list_repositories tool to show me all repositories I have access to"
```

**Expected Result:** A list of your GitHub repositories with their names, URLs, and open issue counts.

**If this fails:**
- Check your GitHub token in `services/issue-scanner/.env`
- Verify token has `repo` and `read:org` permissions

## Test 2: Fetch Issues from a Repository

Pick a repository from the list above that has issues. Ask BOB:
```
"Use fetch_issues to get all open issues from <owner>/<repo> with label 'bug'"
```

**Expected Result:** A list of bug issues with titles, labels, complexity estimates, etc.

**If this fails:**
- Make sure the repository exists and you have access
- Check if the repository has any issues labeled "bug"

## Test 3: Get Issue Details

Pick an issue number from above. Ask BOB:
```
"Use get_issue_details to get full details of issue #<number> in <owner>/<repo>"
```

**Expected Result:** Full issue details including body, comments, labels, etc.

## Test 4: Clone a Repository

Ask BOB:
```
"Use clone_repository to clone <owner>/<repo> to the workspace"
```

**Expected Result:** Repository cloned to `./workspace/<owner>/<repo>`

**If this fails:**
- Check write permissions on the workspace directory
- Verify token has `repo` permission (not just `public_repo`)
- Check git is installed: `git --version`

## Test 5: Read Files from Cloned Repository

Ask BOB:
```
"Use list_files to show me the files in <owner>/<repo>"
```

Then:
```
"Use read_file to read the README.md from <owner>/<repo>"
```

**Expected Result:** Directory listing, then file contents.

## Test 6: Analyze Repository

Ask BOB:
```
"Use analyze_repository to analyze the structure of <owner>/<repo>"
```

**Expected Result:** Project type, dependencies, README preview, file structure.

## Test 7: End-to-End Bug Fix (Dry Run)

Ask BOB:
```
"Analyze issue #<number> in <owner>/<repo> and tell me what needs to be fixed, but don't make any changes yet"
```

**Expected Result:** BOB analyzes the issue and proposes a solution without making changes.

## Test 8: Create a Test Branch

Ask BOB:
```
"Use create_branch to create a branch called 'test-bug-fixer' in <owner>/<repo>"
```

**Expected Result:** New branch created locally.

**Verify:**
```bash
cd services/git-ops/workspace/<owner>/<repo>
git branch
# Should show 'test-bug-fixer'
```

## Test 9: Modify a File

Ask BOB:
```
"Use modify_file to add a comment '// Test from bug fixer' to the top of README.md in <owner>/<repo>"
```

**Expected Result:** File modified locally.

## Test 10: Commit and Push

Ask BOB:
```
"Use commit_changes to commit the changes in <owner>/<repo> with message 'Test: Bug fixer system'"
```

Then:
```
"Use push_changes to push the test-bug-fixer branch to remote in <owner>/<repo>"
```

**Expected Result:** Changes committed and pushed to GitHub.

**Verify on GitHub:** Check that the branch appears on GitHub.

## Test 11: Create a Pull Request

Ask BOB:
```
"Use create_pull_request to create a PR in <owner>/<repo> from test-bug-fixer to main with title 'Test PR' and body 'Testing the bug fixer system'"
```

**Expected Result:** Pull request created on GitHub.

**Verify on GitHub:** The PR should appear in the repository's PR list.

## Test 12: Full Workflow

Now test the complete workflow. Ask BOB:
```
"Find an open bug issue in <owner>/<repo>, analyze it, create a fix, and submit a PR"
```

**Expected Workflow:**
1. BOB fetches issues with 'bug' label
2. Gets details of a specific issue
3. Clones the repository (if not already cloned)
4. Analyzes the code
5. Creates a new branch
6. Modifies the necessary files
7. Commits the changes
8. Pushes to remote
9. Creates a pull request

**Expected Result:** A new PR on GitHub with the fix.

## Cleanup After Testing

Ask BOB:
```
"Close the test PR we created and delete the test-bug-fixer branch"
```

Or manually:
1. Close the test PR on GitHub
2. Delete the branch on GitHub
3. Clean up local workspace:
   ```bash
   rm -rf services/git-ops/workspace
   ```

## Common Issues

### "Repository not found"
- Check you have access to the repository
- Verify the owner/repo format is correct

### "Permission denied"
- Check your GitHub token has correct permissions
- Token needs `repo` scope for private repos

### "Git errors"
- Make sure git is configured:
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your@email.com"
  ```

### "MCP tools not available"
- Restart Bob completely
- Check Bob's MCP config file has correct absolute paths
- Verify Bob's MCP config location (consult Bob's documentation)
- Verify both services built successfully (dist/ folders exist)

## Success Criteria

✅ Can list repositories
✅ Can fetch and prioritize issues
✅ Can clone repositories
✅ Can read/modify files
✅ Can create branches and commits
✅ Can push changes
✅ Can create pull requests
✅ Complete workflow executes successfully

## 🎉 System Ready!

If all tests pass, your bug-fixer system is fully functional and ready to automate bug fixes across your repositories!
