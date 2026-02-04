/**
 * Bug Fix Workflow Orchestrator
 * 
 * This script orchestrates the entire bug-fixing workflow:
 * 1. Scan repositories for issues
 * 2. Prioritize issues
 * 3. For each issue, use BOB to generate and apply fixes
 * 4. Create pull requests
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface Config {
  repositories: string[];
  filters: {
    labels: string[];
    exclude_labels: string[];
    max_age_days: number;
    min_age_days: number;
  };
  prioritization: {
    criteria: string[];
    severity_weights: Record<string, number>;
    auto_fix_threshold: string;
    max_issues_per_run: number;
  };
  github: {
    token: string;
    base_branch: string;
    pr_prefix: string;
    fork_repos: boolean;
  };
  git_operations: {
    workspace_dir: string;
    branch_prefix: string;
    commit_message_template: string;
  };
}

interface Issue {
  number: number;
  title: string;
  body: string;
  labels: string[];
  repository: string;
  owner: string;
  repo: string;
  priority_score?: number;
  complexity?: string;
}

interface WorkflowResult {
  total_issues_scanned: number;
  issues_prioritized: number;
  fixes_attempted: number;
  prs_created: number;
  failed: number;
  results: Array<{
    issue: Issue;
    status: 'success' | 'failed' | 'skipped';
    pr_url?: string;
    error?: string;
  }>;
}

/**
 * Load configuration from file
 */
async function loadConfig(configPath: string): Promise<Config> {
  const content = await fs.readFile(configPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Main workflow execution
 */
async function runBugFixWorkflow(configPath: string): Promise<WorkflowResult> {
  console.log('🚀 Starting Bug Fix Workflow...\n');
  
  const config = await loadConfig(configPath);
  const result: WorkflowResult = {
    total_issues_scanned: 0,
    issues_prioritized: 0,
    fixes_attempted: 0,
    prs_created: 0,
    failed: 0,
    results: [],
  };

  // Step 1: Scan all repositories for issues
  console.log('📊 Step 1: Scanning repositories for issues...');
  const allIssues: Issue[] = [];
  
  for (const repoFullName of config.repositories) {
    const [owner, repo] = repoFullName.split('/');
    console.log(`  - Scanning ${owner}/${repo}...`);
    
    // This would call the issue-scanner MCP service
    // For now, this is a placeholder showing the structure
    console.log(`    ℹ️  Use issue-scanner MCP tool: fetch_issues`);
    console.log(`       owner: ${owner}, repo: ${repo}`);
    console.log(`       labels: ${config.filters.labels.join(', ')}`);
    
    // Simulated issues (in real implementation, this comes from MCP)
    // allIssues.push(...fetchedIssues);
  }
  
  result.total_issues_scanned = allIssues.length;
  console.log(`  ✅ Found ${allIssues.length} issues\n`);

  // Step 2: Prioritize issues
  console.log('🎯 Step 2: Prioritizing issues...');
  console.log(`  ℹ️  Use issue-scanner MCP tool: prioritize_issues`);
  console.log(`     criteria: ${config.prioritization.criteria.join(', ')}`);
  
  // Filter and sort issues (in real implementation, this comes from MCP)
  const prioritizedIssues = allIssues
    .slice(0, config.prioritization.max_issues_per_run);
  
  result.issues_prioritized = prioritizedIssues.length;
  console.log(`  ✅ Prioritized ${prioritizedIssues.length} issues for fixing\n`);

  // Step 3: Process each issue
  console.log('🔧 Step 3: Processing issues with BOB...\n');
  
  for (const issue of prioritizedIssues) {
    console.log(`\n📝 Processing Issue #${issue.number}: ${issue.title}`);
    console.log(`   Repository: ${issue.owner}/${issue.repo}`);
    console.log(`   Complexity: ${issue.complexity || 'unknown'}`);
    console.log(`   Priority Score: ${issue.priority_score || 'N/A'}`);
    
    try {
      result.fixes_attempted++;
      
      // Step 3a: Clone repository
      console.log(`\n   🔄 Step 3a: Cloning repository...`);
      console.log(`      ℹ️  Use git-ops MCP tool: clone_repository`);
      console.log(`         owner: ${issue.owner}, repo: ${issue.repo}`);
      
      // Step 3b: Get issue details and context
      console.log(`\n   📖 Step 3b: Getting issue details...`);
      console.log(`      ℹ️  Use issue-scanner MCP tool: get_issue_details`);
      console.log(`         issue_number: ${issue.number}`);
      
      // Step 3c: Use GitMCP to understand codebase
      console.log(`\n   📚 Step 3c: Understanding codebase...`);
      console.log(`      ℹ️  Use GitMCP tools:`);
      console.log(`         - fetch_${issue.repo}_documentation`);
      console.log(`         - search_${issue.repo}_code`);
      
      // Step 3d: BOB analyzes and generates fix
      console.log(`\n   🤖 Step 3d: BOB analyzing issue and generating fix...`);
      console.log(`      ℹ️  BOB will:`);
      console.log(`         1. Read issue description and comments`);
      console.log(`         2. Search codebase for relevant files`);
      console.log(`         3. Analyze code and identify bug`);
      console.log(`         4. Generate fix`);
      
      // Step 3e: Create branch
      const branchName = `${config.git_operations.branch_prefix}issue-${issue.number}`;
      console.log(`\n   🌿 Step 3e: Creating branch: ${branchName}`);
      console.log(`      ℹ️  Use git-ops MCP tool: create_branch`);
      console.log(`         branchName: ${branchName}`);
      
      // Step 3f: Apply fix
      console.log(`\n   ✏️  Step 3f: Applying fix...`);
      console.log(`      ℹ️  Use git-ops MCP tool: modify_file`);
      console.log(`         (for each file that needs changes)`);
      
      // Step 3g: Commit changes
      const commitMessage = config.git_operations.commit_message_template
        .replace('{issue_title}', issue.title)
        .replace('{issue_number}', issue.number.toString());
      console.log(`\n   💾 Step 3g: Committing changes...`);
      console.log(`      ℹ️  Use git-ops MCP tool: commit_changes`);
      console.log(`         message: "${commitMessage}"`);
      
      // Step 3h: Push changes
      console.log(`\n   ⬆️  Step 3h: Pushing changes...`);
      console.log(`      ℹ️  Use git-ops MCP tool: push_changes`);
      console.log(`         branch: ${branchName}`);
      
      // Step 3i: Create pull request
      const prTitle = `${config.github.pr_prefix} ${issue.title}`;
      const prBody = `Fixes #${issue.number}\n\n## Changes\n\nAutomatic fix generated by BOB AI Assistant.\n\n## Issue Description\n${issue.body}`;
      
      console.log(`\n   🔀 Step 3i: Creating pull request...`);
      console.log(`      ℹ️  Use git-ops MCP tool: create_pull_request`);
      console.log(`         title: "${prTitle}"`);
      console.log(`         head: ${branchName}`);
      console.log(`         base: ${config.github.base_branch}`);
      
      result.prs_created++;
      result.results.push({
        issue,
        status: 'success',
        pr_url: `https://github.com/${issue.owner}/${issue.repo}/pull/XXX`,
      });
      
      console.log(`\n   ✅ Successfully created PR for issue #${issue.number}`);
      
    } catch (error) {
      result.failed++;
      result.results.push({
        issue,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
      });
      
      console.log(`\n   ❌ Failed to process issue #${issue.number}: ${error}`);
    }
  }

  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 WORKFLOW SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total issues scanned:     ${result.total_issues_scanned}`);
  console.log(`Issues prioritized:       ${result.issues_prioritized}`);
  console.log(`Fixes attempted:          ${result.fixes_attempted}`);
  console.log(`PRs created:              ${result.prs_created}`);
  console.log(`Failed:                   ${result.failed}`);
  console.log('='.repeat(60) + '\n');

  return result;
}

/**
 * CLI entry point
 */
async function main() {
  const configPath = process.argv[2] || path.join(__dirname, '../config/bug-fix-config.json');
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         🤖 Automated Bug Fixing Workflow                  ║');
  console.log('║         Powered by BOB AI Assistant                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  try {
    const result = await runBugFixWorkflow(configPath);
    
    // Save results
    const resultsPath = path.join(__dirname, '../results', `workflow-${Date.now()}.json`);
    await fs.mkdir(path.dirname(resultsPath), { recursive: true });
    await fs.writeFile(resultsPath, JSON.stringify(result, null, 2));
    console.log(`\n💾 Results saved to: ${resultsPath}`);
    
    process.exit(result.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Workflow failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runBugFixWorkflow, loadConfig };

// Made with Bob
