// Practical examples of using @anthropic-ai/claude-code types
import { query, AbortError } from '@anthropic-ai/claude-code'
import type {
  Options,
  SDKMessage,
  McpStdioServerConfig,
  PermissionMode
} from '@anthropic-ai/claude-code'

import type {
  FileEditInput,
  BashInput,
  TodoWriteInput,
  GrepInput
} from '@anthropic-ai/claude-code/sdk-tools'

// Example 1: Basic code assistant with file operations
export async function codeAssistant(prompt: string, projectPath: string) {
  const options: Options = {
    cwd: projectPath,
    permissionMode: 'default' as PermissionMode,
    maxTurns: 10,
    allowedTools: [
      'FileRead',
      'FileEdit',
      'FileWrite',
      'Bash',
      'Grep',
      'Glob',
      'LS'
    ],
    model: 'claude-3-5-sonnet-20241022'
  }

  const response = query({ prompt, options })
  
  const messages: SDKMessage[] = []
  
  try {
    for await (const message of response) {
      messages.push(message)
      
      if (message.type === 'system') {
        console.log(`🚀 Session started: ${message.session_id}`)
        console.log(`📁 Working directory: ${message.cwd}`)
        console.log(`🔧 Available tools: ${message.tools.join(', ')}`)
      } else if (message.type === 'result') {
        if (message.subtype === 'success') {
          console.log(`✅ Task completed in ${message.duration_ms}ms`)
          console.log(`💰 Cost: $${message.total_cost_usd}`)
          return message.result
        } else {
          console.error(`❌ Task failed: ${message.subtype}`)
        }
      }
    }
  } catch (error) {
    if (error instanceof AbortError) {
      console.log('🛑 Operation was aborted')
    } else {
      console.error('💥 Unexpected error:', error)
    }
  }
  
  return messages
}

// Example 2: MCP Server integration for database operations
export function setupDatabaseMCP(): Options {
  const dbServerConfig: McpStdioServerConfig = {
    type: 'stdio',
    command: 'python',
    args: ['-m', 'database_mcp_server'],
    env: {
      DATABASE_URL: process.env.DATABASE_URL || 'sqlite:///dev.db',
      PYTHONPATH: '/path/to/mcp/servers'
    }
  }

  return {
    mcpServers: {
      'database': dbServerConfig
    },
    permissionMode: 'default',
    maxTurns: 20
  }
}

// Example 3: Automated code review and refactoring
export async function codeReview(filePath: string, reviewPrompt?: string) {
  const prompt = reviewPrompt || `
    Please review the file at ${filePath} and:
    1. Check for potential bugs or issues
    2. Suggest improvements for readability
    3. Identify any security concerns
    4. Recommend performance optimizations
    5. Make necessary fixes directly to the file
  `

  const options: Options = {
    allowedTools: ['FileRead', 'FileEdit', 'Grep', 'Bash'],
    permissionMode: 'acceptEdits', // Automatically accept file edits
    maxTurns: 15
  }

  return await query({ prompt, options })
}

// Example 4: Project setup and scaffolding
export async function scaffoldProject(projectName: string, projectType: 'react' | 'node' | 'python') {
  const prompt = `
    Create a new ${projectType} project named "${projectName}" with:
    1. Proper directory structure
    2. Package.json/requirements.txt with common dependencies
    3. Basic configuration files (tsconfig, eslint, etc.)
    4. Example source files
    5. README.md with setup instructions
    6. Run any necessary setup commands
  `

  const options: Options = {
    permissionMode: 'plan', // Show plan first, then execute
    allowedTools: [
      'FileWrite',
      'FileRead',
      'Bash',
      'LS',
      'FileEdit'
    ],
    executable: 'bun', // Use Bun for package management
    maxTurns: 25
  }

  return await query({ prompt, options })
}

// Example 5: Advanced search and replace across codebase
export async function refactorCodebase(
  searchPattern: string,
  replacement: string,
  fileGlob: string = '**/*.{ts,js,tsx,jsx}'
) {
  const prompt = `
    Please help me refactor the codebase by:
    1. Finding all occurrences of "${searchPattern}" in files matching "${fileGlob}"
    2. Replacing them with "${replacement}"
    3. Ensuring the changes don't break anything
    4. Running tests after the changes
    
    Be careful about context - don't replace things that shouldn't be replaced.
  `

  const options: Options = {
    allowedTools: ['Grep', 'FileEdit', 'FileRead', 'Bash', 'Glob'],
    permissionMode: 'default',
    maxTurns: 30
  }

  return await query({ prompt, options })
}

// Example 6: Interactive debugging session
export class DebuggingSession {
  private abortController = new AbortController()
  
  async startDebugging(issueDescription: string, cwd: string) {
    const prompt = `
      I'm experiencing this issue: ${issueDescription}
      
      Please help me debug this by:
      1. Examining the relevant code files
      2. Looking at logs and error messages
      3. Running diagnostic commands
      4. Suggesting and implementing fixes
      
      Work step by step and ask for confirmation before making significant changes.
    `

    const options: Options = {
      cwd,
      permissionMode: 'default',
      abortController: this.abortController,
      allowedTools: [
        'FileRead',
        'Bash',
        'Grep',
        'FileEdit',
        'WebSearch' // For looking up error messages
      ],
      maxTurns: 50
    }

    return query({ prompt, options })
  }

  async interrupt() {
    this.abortController.abort()
  }
}

// Example 7: Todo management for development tasks
export function createDevTodos(): TodoWriteInput {
  return {
    todos: [
      {
        id: 'setup-tests',
        content: 'Set up Jest testing framework with TypeScript support',
        status: 'pending',
        priority: 'high'
      },
      {
        id: 'add-docs',
        content: 'Add comprehensive API documentation',
        status: 'pending', 
        priority: 'medium'
      },
      {
        id: 'setup-ci',
        content: 'Configure GitHub Actions for CI/CD',
        status: 'in_progress',
        priority: 'high'
      },
      {
        id: 'refactor-utils',
        content: 'Refactor utility functions for better reusability',
        status: 'pending',
        priority: 'low'
      }
    ]
  }
}

// Example 8: Type-safe tool input creators
export const createToolInputs = {
  fileEdit: (filePath: string, oldText: string, newText: string, replaceAll = false): FileEditInput => ({
    file_path: filePath,
    old_string: oldText,
    new_string: newText,
    replace_all: replaceAll
  }),

  bash: (command: string, description?: string, timeout = 30000): BashInput => ({
    command,
    description,
    timeout,
    sandbox: false
  }),

  grep: (pattern: string, options: Partial<GrepInput> = {}): GrepInput => ({
    pattern,
    output_mode: 'content',
    '-n': true,
    ...options
  }),

  todo: (todos: Array<{ content: string; priority?: 'high' | 'medium' | 'low' }>): TodoWriteInput => ({
    todos: todos.map((todo, index) => ({
      id: `todo-${index}`,
      content: todo.content,
      status: 'pending' as const,
      priority: todo.priority || 'medium'
    }))
  })
}

// Example 9: Error handling and recovery
export async function robustQuery(prompt: string, options: Options, maxRetries = 3) {
  let attempt = 0
  
  while (attempt < maxRetries) {
    try {
      const response = query({ prompt, options })
      const results = []
      
      for await (const message of response) {
        results.push(message)
        
        if (message.type === 'result') {
          if (message.subtype === 'success') {
            return { success: true, data: results, result: message.result }
          } else if (message.subtype === 'error_during_execution') {
            throw new Error(`Execution error after ${message.num_turns} turns`)
          } else if (message.subtype === 'error_max_turns') {
            throw new Error(`Max turns (${message.num_turns}) reached`)
          }
        }
      }
      
      return { success: true, data: results }
      
    } catch (error) {
      attempt++
      console.warn(`Attempt ${attempt} failed:`, error)
      
      if (attempt >= maxRetries) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          attempts: attempt 
        }
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }
}

// Example usage:
/*
async function main() {
  // Basic code assistant
  const result = await codeAssistant(
    "Help me optimize this React component for performance",
    "/path/to/my/project"
  )
  
  // Code review
  const review = codeReview("/path/to/component.tsx")
  for await (const message of review) {
    console.log(message)
  }
  
  // Project scaffolding  
  const project = scaffoldProject("my-new-app", "react")
  for await (const message of project) {
    console.log(message)
  }
  
  // Interactive debugging
  const debugSession = new DebuggingSession()
  const debug = debugSession.startDebugging(
    "My API endpoints are returning 500 errors",
    "/path/to/api/project"
  )
  
  // Can interrupt if needed
  setTimeout(() => debugSession.interrupt(), 60000)
  
  for await (const message of debug) {
    console.log(message)
  }
}
*/