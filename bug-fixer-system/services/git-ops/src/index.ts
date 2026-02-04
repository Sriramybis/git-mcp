import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import simpleGit, { SimpleGit } from "simple-git";
import { Octokit } from "@octokit/rest";
import { z } from "zod";
import * as fs from "fs/promises";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const WORKSPACE_DIR = process.env.WORKSPACE_DIR || "./workspace";

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// Tool schemas
const CloneRepoSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  branch: z.string().optional(),
});

const CreateBranchSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  branchName: z.string(),
  baseBranch: z.string().optional(),
});

const ModifyFileSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  filePath: z.string(),
  content: z.string(),
});

const CommitChangesSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  message: z.string(),
  files: z.array(z.string()).optional(),
});

const PushChangesSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  branch: z.string(),
});

const CreatePRSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  title: z.string(),
  body: z.string(),
  head: z.string(),
  base: z.string(),
});

const ReadFileSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  filePath: z.string(),
});

const ListFilesSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  directory: z.string().optional(),
});

const AnalyzeRepoSchema = z.object({
  owner: z.string(),
  repo: z.string(),
});

// Helper functions
function getRepoPath(owner: string, repo: string): string {
  return path.join(WORKSPACE_DIR, owner, repo);
}

async function ensureWorkspaceDir(): Promise<void> {
  await fs.mkdir(WORKSPACE_DIR, { recursive: true });
}

async function getGit(owner: string, repo: string): Promise<SimpleGit> {
  const repoPath = getRepoPath(owner, repo);
  return simpleGit(repoPath);
}

// Tool implementations
async function cloneRepository(args: z.infer<typeof CloneRepoSchema>) {
  await ensureWorkspaceDir();
  const repoPath = getRepoPath(args.owner, args.repo);
  
  // Check if repo already exists
  try {
    await fs.access(repoPath);
    return {
      success: true,
      message: `Repository already cloned at ${repoPath}`,
      path: repoPath,
    };
  } catch {
    // Repo doesn't exist, clone it
  }

  const cloneUrl = `https://${GITHUB_TOKEN}@github.com/${args.owner}/${args.repo}.git`;
  const git = simpleGit();
  
  await git.clone(cloneUrl, repoPath, args.branch ? ["--branch", args.branch] : []);
  
  return {
    success: true,
    message: `Repository cloned successfully to ${repoPath}`,
    path: repoPath,
  };
}

async function createBranch(args: z.infer<typeof CreateBranchSchema>) {
  const git = await getGit(args.owner, args.repo);
  
  if (args.baseBranch) {
    await git.checkout(args.baseBranch);
  }
  
  await git.checkoutLocalBranch(args.branchName);
  
  return {
    success: true,
    message: `Branch '${args.branchName}' created successfully`,
    branch: args.branchName,
  };
}

async function modifyFile(args: z.infer<typeof ModifyFileSchema>) {
  const repoPath = getRepoPath(args.owner, args.repo);
  const filePath = path.join(repoPath, args.filePath);
  
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, args.content, "utf-8");
  
  return {
    success: true,
    message: `File '${args.filePath}' modified successfully`,
    path: filePath,
  };
}

async function commitChanges(args: z.infer<typeof CommitChangesSchema>) {
  const git = await getGit(args.owner, args.repo);
  
  if (args.files && args.files.length > 0) {
    await git.add(args.files);
  } else {
    await git.add(".");
  }
  
  await git.commit(args.message);
  
  return {
    success: true,
    message: "Changes committed successfully",
    commit: args.message,
  };
}

async function pushChanges(args: z.infer<typeof PushChangesSchema>) {
  const git = await getGit(args.owner, args.repo);
  
  await git.push("origin", args.branch);
  
  return {
    success: true,
    message: `Changes pushed to branch '${args.branch}'`,
    branch: args.branch,
  };
}

async function createPullRequest(args: z.infer<typeof CreatePRSchema>) {
  const response = await octokit.pulls.create({
    owner: args.owner,
    repo: args.repo,
    title: args.title,
    body: args.body,
    head: args.head,
    base: args.base,
  });
  
  return {
    success: true,
    message: "Pull request created successfully",
    pr_number: response.data.number,
    pr_url: response.data.html_url,
  };

async function readFileFromRepo(args: z.infer<typeof ReadFileSchema>) {
  const repoPath = getRepoPath(args.owner, args.repo);
  const filePath = path.join(repoPath, args.filePath);
  
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return {
      success: true,
      filePath: args.filePath,
      content,
      size: content.length,
    };
  } catch (error) {
    throw new Error(`Failed to read file: ${error}`);
  }
}

async function listFilesInRepo(args: z.infer<typeof ListFilesSchema>) {
  const repoPath = getRepoPath(args.owner, args.repo);
  const targetDir = args.directory 
    ? path.join(repoPath, args.directory)
    : repoPath;
  
  try {
    const entries = await fs.readdir(targetDir, { withFileTypes: true });
    const files = entries.map(entry => ({
      name: entry.name,
      type: entry.isDirectory() ? "directory" : "file",
      path: args.directory ? path.join(args.directory, entry.name) : entry.name,
    }));
    
    return {
      success: true,
      directory: args.directory || ".",
      files,
      count: files.length,
    };
  } catch (error) {
    throw new Error(`Failed to list files: ${error}`);
  }
}

async function analyzeRepository(args: z.infer<typeof AnalyzeRepoSchema>) {
  const repoPath = getRepoPath(args.owner, args.repo);
  
  try {
    // Check if repo exists
    await fs.access(repoPath);
  } catch {
    throw new Error(`Repository not cloned. Please clone it first using clone_repository.`);
  }
  
  const analysis: any = {
    success: true,
    repository: `${args.owner}/${args.repo}`,
    path: repoPath,
  };
  
  // Read package.json if exists (Node.js project)
  try {
    const packageJsonPath = path.join(repoPath, "package.json");
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));
    analysis.language = "JavaScript/TypeScript";
    analysis.dependencies = Object.keys(packageJson.dependencies || {});
    analysis.devDependencies = Object.keys(packageJson.devDependencies || {});
    analysis.scripts = Object.keys(packageJson.scripts || {});
  } catch {
    // Not a Node.js project or no package.json
  }
  
  // Read requirements.txt if exists (Python project)
  try {
    const requirementsPath = path.join(repoPath, "requirements.txt");
    const requirements = await fs.readFile(requirementsPath, "utf-8");
    analysis.language = "Python";
    analysis.dependencies = requirements.split("\n").filter(line => line.trim() && !line.startsWith("#"));
  } catch {
    // Not a Python project or no requirements.txt
  }
  
  // Read README
  try {
    const readmePath = path.join(repoPath, "README.md");
    const readme = await fs.readFile(readmePath, "utf-8");
    analysis.readme_preview = readme.substring(0, 500) + (readme.length > 500 ? "..." : "");
  } catch {
    // No README
  }
  
  // List top-level structure
  try {
    const entries = await fs.readdir(repoPath, { withFileTypes: true });
    analysis.structure = entries.map(entry => ({
      name: entry.name,
      type: entry.isDirectory() ? "directory" : "file",
    }));
  } catch {
    // Could not read structure
  }
  
  return analysis;
}
}

// MCP Server setup
const server = new Server(
  {
    name: "bug-fixer-git-ops",
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
        name: "clone_repository",
        description: "Clone a GitHub repository to the local workspace",
        inputSchema: {
          type: "object",
          properties: {
            owner: { type: "string", description: "Repository owner" },
            repo: { type: "string", description: "Repository name" },
            branch: { type: "string", description: "Branch to clone (optional)" },
          },
          required: ["owner", "repo"],
        },
      },
      {
        name: "create_branch",
        description: "Create a new branch in the cloned repository",
        inputSchema: {
          type: "object",
          properties: {
            owner: { type: "string", description: "Repository owner" },
            repo: { type: "string", description: "Repository name" },
            branchName: { type: "string", description: "Name of the new branch" },
            baseBranch: { type: "string", description: "Base branch (optional)" },
          },
          required: ["owner", "repo", "branchName"],
        },
      },
      {
        name: "modify_file",
        description: "Modify or create a file in the repository",
        inputSchema: {
          type: "object",
          properties: {
            owner: { type: "string", description: "Repository owner" },
            repo: { type: "string", description: "Repository name" },
            filePath: { type: "string", description: "Path to the file" },
            content: { type: "string", description: "New file content" },
          },
          required: ["owner", "repo", "filePath", "content"],
        },
      },
      {
        name: "commit_changes",
        description: "Commit changes to the repository",
        inputSchema: {
          type: "object",
          properties: {
            owner: { type: "string", description: "Repository owner" },
            repo: { type: "string", description: "Repository name" },
            message: { type: "string", description: "Commit message" },
            files: { type: "array", items: { type: "string" }, description: "Files to commit (optional)" },
          },
          required: ["owner", "repo", "message"],
        },
      },
      {
        name: "push_changes",
        description: "Push changes to remote repository",
        inputSchema: {
          type: "object",
          properties: {
            owner: { type: "string", description: "Repository owner" },
            repo: { type: "string", description: "Repository name" },
            branch: { type: "string", description: "Branch to push" },
          },
          required: ["owner", "repo", "branch"],
        },
      },
      {
        name: "create_pull_request",
        description: "Create a pull request on GitHub",
        inputSchema: {
          type: "object",
          properties: {
            owner: { type: "string", description: "Repository owner" },
            repo: { type: "string", description: "Repository name" },
            title: { type: "string", description: "PR title" },
            body: { type: "string", description: "PR description" },
            head: { type: "string", description: "Head branch" },
            base: { type: "string", description: "Base branch" },
          },
          required: ["owner", "repo", "title", "body", "head", "base"],
        },
      },
      {
        name: "read_file",
        description: "Read a file from the cloned repository",
        inputSchema: {
          type: "object",
          properties: {
            owner: { type: "string", description: "Repository owner" },
            repo: { type: "string", description: "Repository name" },
            filePath: { type: "string", description: "Path to the file to read" },
          },
          required: ["owner", "repo", "filePath"],
        },
      },
      {
        name: "list_files",
        description: "List files and directories in the cloned repository",
        inputSchema: {
          type: "object",
          properties: {
            owner: { type: "string", description: "Repository owner" },
            repo: { type: "string", description: "Repository name" },
            directory: { type: "string", description: "Directory to list (optional, defaults to root)" },
          },
          required: ["owner", "repo"],
        },
      },
      {
        name: "analyze_repository",
        description: "Analyze the cloned repository structure, dependencies, and configuration. Use this after cloning to understand the codebase before making changes.",
        inputSchema: {
          type: "object",
          properties: {
            owner: { type: "string", description: "Repository owner" },
            repo: { type: "string", description: "Repository name" },
          },
          required: ["owner", "repo"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "clone_repository":
        return { content: [{ type: "text", text: JSON.stringify(await cloneRepository(CloneRepoSchema.parse(args)), null, 2) }] };
      case "create_branch":
        return { content: [{ type: "text", text: JSON.stringify(await createBranch(CreateBranchSchema.parse(args)), null, 2) }] };
      case "modify_file":
        return { content: [{ type: "text", text: JSON.stringify(await modifyFile(ModifyFileSchema.parse(args)), null, 2) }] };
      case "commit_changes":
        return { content: [{ type: "text", text: JSON.stringify(await commitChanges(CommitChangesSchema.parse(args)), null, 2) }] };
      case "push_changes":
        return { content: [{ type: "text", text: JSON.stringify(await pushChanges(PushChangesSchema.parse(args)), null, 2) }] };
      case "create_pull_request":
        return { content: [{ type: "text", text: JSON.stringify(await createPullRequest(CreatePRSchema.parse(args)), null, 2) }] };
      case "read_file":
        return { content: [{ type: "text", text: JSON.stringify(await readFileFromRepo(ReadFileSchema.parse(args)), null, 2) }] };
      case "list_files":
        return { content: [{ type: "text", text: JSON.stringify(await listFilesInRepo(ListFilesSchema.parse(args)), null, 2) }] };
      case "analyze_repository":
        return { content: [{ type: "text", text: JSON.stringify(await analyzeRepository(AnalyzeRepoSchema.parse(args)), null, 2) }] };
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
  console.error("Bug Fixer Git Operations MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

// Made with Bob
