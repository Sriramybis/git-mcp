import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Octokit } from "@octokit/rest";
import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const octokit = new Octokit({ auth: GITHUB_TOKEN });

// Tool schemas
const ListRepositoriesSchema = z.object({
  username: z.string().optional(),
  org: z.string().optional(),
  type: z.enum(["all", "owner", "member"]).optional(),
});

const FetchIssuesSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  state: z.enum(["open", "closed", "all"]).optional(),
  labels: z.array(z.string()).optional(),
  since: z.string().optional(),
});

const GetIssueDetailsSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  issue_number: z.number(),
});

const SearchIssuesSchema = z.object({
  query: z.string(),
  sort: z.enum(["created", "updated", "comments"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

const PrioritizeIssuesSchema = z.object({
  issues: z.array(z.any()),
  criteria: z.object({
    severity_weights: z.record(z.number()).optional(),
    age_weight: z.number().optional(),
    complexity_weight: z.number().optional(),
  }).optional(),
});

// Helper functions
function calculateIssuePriority(issue: any, criteria: any = {}): number {
  const severityWeights = criteria.severity_weights || {
    critical: 10,
    high: 7,
    medium: 5,
    low: 3,
  };
  
  let score = 0;
  
  // Check labels for severity
  const labels = issue.labels.map((l: any) => l.name.toLowerCase());
  for (const [severity, weight] of Object.entries(severityWeights)) {
    if (labels.includes(severity)) {
      score += weight as number;
      break;
    }
  }
  
  // Age factor (older issues get higher priority)
  const ageInDays = Math.floor(
    (Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  const ageWeight = criteria.age_weight || 0.1;
  score += ageInDays * ageWeight;
  
  // Comment count (more discussion = higher priority)
  score += issue.comments * 0.5;
  
  return score;
}

function estimateComplexity(issue: any): string {
  const body = (issue.body || "").toLowerCase();
  const title = issue.title.toLowerCase();
  const text = `${title} ${body}`;
  
  // Simple heuristics for complexity
  const complexKeywords = ["refactor", "architecture", "breaking change", "migration"];
  const simpleKeywords = ["typo", "documentation", "readme", "comment"];
  
  if (complexKeywords.some(k => text.includes(k))) {
    return "high";
  } else if (simpleKeywords.some(k => text.includes(k))) {
    return "low";
  }
  
  return "medium";
}

// Tool implementations
async function listRepositories(args: z.infer<typeof ListRepositoriesSchema>) {
  try {
    let repos;
    
    if (args.org) {
      const response = await octokit.repos.listForOrg({
        org: args.org,
        type: args.type || "all",
        per_page: 100,
      });
      repos = response.data;
    } else {
      const response = await octokit.repos.listForAuthenticatedUser({
        type: args.type || "all",
        per_page: 100,
      });
      repos = response.data;
    }
    
    return {
      success: true,
      count: repos.length,
      repositories: repos.map(r => ({
        owner: r.owner.login,
        name: r.name,
        full_name: r.full_name,
        description: r.description,
        url: r.html_url,
        open_issues: r.open_issues_count,
      })),
    };
  } catch (error) {
    throw new Error(`Failed to list repositories: ${error}`);
  }
}

async function fetchIssues(args: z.infer<typeof FetchIssuesSchema>) {
  try {
    const params: any = {
      owner: args.owner,
      repo: args.repo,
      state: args.state || "open",
      per_page: 100,
    };
    
    if (args.labels && args.labels.length > 0) {
      params.labels = args.labels.join(",");
    }
    
    if (args.since) {
      params.since = args.since;
    }
    
    const response = await octokit.issues.listForRepo(params);
    
    const issues = response.data.map(issue => ({
      number: issue.number,
      title: issue.title,
      state: issue.state,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      labels: issue.labels.map((l: any) => l.name),
      assignees: issue.assignees?.map((a: any) => a.login) || [],
      comments: issue.comments,
      url: issue.html_url,
      body: issue.body,
      complexity: estimateComplexity(issue),
    }));
    
    return {
      success: true,
      count: issues.length,
      issues,
    };
  } catch (error) {
    throw new Error(`Failed to fetch issues: ${error}`);
  }
}

async function getIssueDetails(args: z.infer<typeof GetIssueDetailsSchema>) {
  try {
    const issue = await octokit.issues.get({
      owner: args.owner,
      repo: args.repo,
      issue_number: args.issue_number,
    });
    
    const comments = await octokit.issues.listComments({
      owner: args.owner,
      repo: args.repo,
      issue_number: args.issue_number,
    });
    
    return {
      success: true,
      issue: {
        number: issue.data.number,
        title: issue.data.title,
        body: issue.data.body,
        state: issue.data.state,
        labels: issue.data.labels.map((l: any) => l.name),
        assignees: issue.data.assignees?.map((a: any) => a.login) || [],
        created_at: issue.data.created_at,
        updated_at: issue.data.updated_at,
        comments_count: issue.data.comments,
        url: issue.data.html_url,
        complexity: estimateComplexity(issue.data),
        comments: comments.data.map(c => ({
          author: c.user?.login,
          body: c.body,
          created_at: c.created_at,
        })),
      },
    };
  } catch (error) {
    throw new Error(`Failed to get issue details: ${error}`);
  }
}

async function searchIssues(args: z.infer<typeof SearchIssuesSchema>) {
  try {
    const response = await octokit.search.issuesAndPullRequests({
      q: args.query,
      sort: args.sort,
      order: args.order || "desc",
      per_page: 100,
    });
    
    const issues = response.data.items
      .filter(item => !item.pull_request) // Exclude PRs
      .map(issue => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        repository: issue.repository_url.split("/").slice(-2).join("/"),
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        labels: issue.labels.map((l: any) => l.name),
        comments: issue.comments,
        url: issue.html_url,
        complexity: estimateComplexity(issue),
      }));
    
    return {
      success: true,
      count: issues.length,
      total_count: response.data.total_count,
      issues,
    };
  } catch (error) {
    throw new Error(`Failed to search issues: ${error}`);
  }
}

async function prioritizeIssues(args: z.infer<typeof PrioritizeIssuesSchema>) {
  try {
    const prioritized = args.issues.map(issue => ({
      ...issue,
      priority_score: calculateIssuePriority(issue, args.criteria),
    }));
    
    prioritized.sort((a, b) => b.priority_score - a.priority_score);
    
    return {
      success: true,
      count: prioritized.length,
      issues: prioritized,
    };
  } catch (error) {
    throw new Error(`Failed to prioritize issues: ${error}`);
  }
}

// MCP Server setup
const server = new Server(
  {
    name: "bug-fixer-issue-scanner",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_repositories",
        description: "List GitHub repositories accessible to the authenticated user",
        inputSchema: {
          type: "object",
          properties: {
            username: { type: "string", description: "GitHub username (optional)" },
            org: { type: "string", description: "Organization name (optional)" },
            type: { type: "string", enum: ["all", "owner", "member"], description: "Repository type filter" },
          },
        },
      },
      {
        name: "fetch_issues",
        description: "Fetch issues from a specific repository",
        inputSchema: {
          type: "object",
          properties: {
            owner: { type: "string", description: "Repository owner" },
            repo: { type: "string", description: "Repository name" },
            state: { type: "string", enum: ["open", "closed", "all"], description: "Issue state" },
            labels: { type: "array", items: { type: "string" }, description: "Filter by labels" },
            since: { type: "string", description: "Only issues updated after this date (ISO 8601)" },
          },
          required: ["owner", "repo"],
        },
      },
      {
        name: "get_issue_details",
        description: "Get detailed information about a specific issue including comments",
        inputSchema: {
          type: "object",
          properties: {
            owner: { type: "string", description: "Repository owner" },
            repo: { type: "string", description: "Repository name" },
            issue_number: { type: "number", description: "Issue number" },
          },
          required: ["owner", "repo", "issue_number"],
        },
      },
      {
        name: "search_issues",
        description: "Search for issues across GitHub using query syntax",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query (e.g., 'is:issue is:open label:bug')" },
            sort: { type: "string", enum: ["created", "updated", "comments"], description: "Sort field" },
            order: { type: "string", enum: ["asc", "desc"], description: "Sort order" },
          },
          required: ["query"],
        },
      },
      {
        name: "prioritize_issues",
        description: "Prioritize a list of issues based on severity, age, and complexity",
        inputSchema: {
          type: "object",
          properties: {
            issues: { type: "array", description: "Array of issues to prioritize" },
            criteria: {
              type: "object",
              properties: {
                severity_weights: { type: "object", description: "Weight for each severity level" },
                age_weight: { type: "number", description: "Weight for issue age" },
                complexity_weight: { type: "number", description: "Weight for complexity" },
              },
            },
          },
          required: ["issues"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "list_repositories":
        return { content: [{ type: "text", text: JSON.stringify(await listRepositories(ListRepositoriesSchema.parse(args)), null, 2) }] };
      case "fetch_issues":
        return { content: [{ type: "text", text: JSON.stringify(await fetchIssues(FetchIssuesSchema.parse(args)), null, 2) }] };
      case "get_issue_details":
        return { content: [{ type: "text", text: JSON.stringify(await getIssueDetails(GetIssueDetailsSchema.parse(args)), null, 2) }] };
      case "search_issues":
        return { content: [{ type: "text", text: JSON.stringify(await searchIssues(SearchIssuesSchema.parse(args)), null, 2) }] };
      case "prioritize_issues":
        return { content: [{ type: "text", text: JSON.stringify(await prioritizeIssues(PrioritizeIssuesSchema.parse(args)), null, 2) }] };
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: JSON.stringify({ success: false, error: errorMessage }, null, 2) }],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Bug Fixer Issue Scanner MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

// Made with Bob
