// Explore @anthropic-ai/claude-code types
import type {
  // Core SDK types
  Options,
  PermissionMode,
  ApiKeySource,
  ConfigScope,
  
  // MCP Server Configuration types
  McpServerConfig,
  McpStdioServerConfig,
  McpSSEServerConfig,
  McpHttpServerConfig,
  
  // Message types
  SDKMessage,
  SDKUserMessage,
  SDKAssistantMessage,
  SDKResultMessage,
  SDKSystemMessage,
  
  // Usage and API types
  NonNullableUsage,
  
  // Query interface
  Query,
} from '@anthropic-ai/claude-code'

import type {
  // Tool input schemas
  ToolInputSchemas,
  AgentInput,
  BashInput,
  BashOutputInput,
  ExitPlanModeInput,
  FileEditInput,
  FileMultiEditInput,
  FileReadInput,
  FileWriteInput,
  GlobInput,
  GrepInput,
  KillShellInput,
  ListMcpResourcesInput,
  LsInput,
  McpInput,
  NotebookEditInput,
  NotebookReadInput,
  ReadMcpResourceInput,
  TodoWriteInput,
  WebFetchInput,
  WebSearchInput
} from '@anthropic-ai/claude-code/sdk-tools'

// Import the main query function and AbortError class
import { query, AbortError } from '@anthropic-ai/claude-code'

// Example type usage demonstrations

// 1. Options configuration
const optionsExample: Options = {
  maxTurns: 10,
  permissionMode: 'default',
  model: 'claude-3-5-sonnet-20241022',
  fallbackModel: 'claude-3-haiku-20240307',
  cwd: '/Users/me/code/ai/clodtools',
  allowedTools: ['Bash', 'FileRead', 'FileEdit'],
  disallowedTools: ['WebSearch'],
  executable: 'bun',
  executableArgs: ['--hot'],
  maxThinkingTokens: 1000,
  appendSystemPrompt: 'Please be concise in your responses.',
  mcpServers: {
    'my-server': {
      type: 'stdio',
      command: 'npx',
      args: ['my-mcp-server'],
      env: {
        NODE_ENV: 'development'
      }
    }
  }
}

// 2. MCP Server configurations
const stdioServerConfig: McpStdioServerConfig = {
  type: 'stdio',
  command: 'python',
  args: ['-m', 'my_mcp_server'],
  env: {
    PYTHONPATH: '/path/to/server'
  }
}

const sseServerConfig: McpSSEServerConfig = {
  type: 'sse',
  url: 'http://localhost:3000/sse',
  headers: {
    'Authorization': 'Bearer token'
  }
}

const httpServerConfig: McpHttpServerConfig = {
  type: 'http',
  url: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
}

// 3. Tool input examples
const bashInputExample: BashInput = {
  command: 'ls -la',
  description: 'List files in current directory',
  timeout: 5000,
  sandbox: false
}

const fileEditInputExample: FileEditInput = {
  file_path: '/Users/me/code/ai/clodtools/test.ts',
  old_string: 'console.log("old")',
  new_string: 'console.log("new")',
  replace_all: false
}

const multiEditInputExample: FileMultiEditInput = {
  file_path: '/Users/me/code/ai/clodtools/test.ts',
  edits: [
    {
      old_string: 'const a = 1',
      new_string: 'const a = 2'
    },
    {
      old_string: 'const b = 2',
      new_string: 'const b = 3',
      replace_all: true
    }
  ]
}

const grepInputExample: GrepInput = {
  pattern: 'function\\s+\\w+',
  path: '/Users/me/code/ai/clodtools',
  glob: '*.ts',
  output_mode: 'content',
  '-n': true,
  '-i': true,
  head_limit: 10
}

const todoInputExample: TodoWriteInput = {
  todos: [
    {
      id: '1',
      content: 'Implement feature X',
      status: 'pending',
      priority: 'high'
    },
    {
      id: '2',
      content: 'Fix bug Y',
      status: 'in_progress',
      priority: 'medium'
    }
  ]
}

const webSearchInputExample: WebSearchInput = {
  query: 'TypeScript async generators best practices',
  allowed_domains: ['stackoverflow.com', 'github.com'],
  blocked_domains: ['spam-site.com']
}

const notebookEditInputExample: NotebookEditInput = {
  notebook_path: '/Users/me/notebook.ipynb',
  cell_id: 'cell-1',
  new_source: 'print("Hello from notebook")',
  cell_type: 'code',
  edit_mode: 'replace'
}

// 4. Permission modes
const permissionModes: PermissionMode[] = [
  'default',
  'acceptEdits', 
  'bypassPermissions',
  'plan'
]

// 5. API key sources
const apiKeySources: ApiKeySource[] = [
  'user',
  'project', 
  'org',
  'temporary'
]

// 6. Config scopes
const configScopes: ConfigScope[] = [
  'local',
  'user',
  'project'
]

// Example usage function
async function exploreClaudeCodeTypes() {
  try {
    // Create a query
    const claudeQuery = query({
      prompt: "Help me understand the types available in @anthropic-ai/claude-code",
      options: optionsExample
    })

    // Iterate through the response
    for await (const message of claudeQuery) {
      console.log('Message type:', message.type)
      
      switch (message.type) {
        case 'system':
          console.log('System message - Session ID:', message.session_id)
          console.log('Available tools:', message.tools)
          console.log('MCP servers:', message.mcp_servers)
          break
          
        case 'user':
          console.log('User message - Session ID:', message.session_id)
          break
          
        case 'assistant':
          console.log('Assistant message - Session ID:', message.session_id)
          break
          
        case 'result':
          if (message.subtype === 'success') {
            console.log('Success result:', message.result)
            console.log('Duration:', message.duration_ms, 'ms')
            console.log('Cost:', message.total_cost_usd, 'USD')
          } else {
            console.log('Error result:', message.subtype)
          }
          break
      }
    }
  } catch (error) {
    if (error instanceof AbortError) {
      console.log('Query was aborted')
    } else {
      console.error('Error:', error)
    }
  }
}

// Export types for external use
export type {
  // Core types
  Options,
  PermissionMode,
  ApiKeySource,
  ConfigScope,
  Query,
  
  // MCP types  
  McpServerConfig,
  McpStdioServerConfig,
  McpSSEServerConfig,
  McpHttpServerConfig,
  
  // Message types
  SDKMessage,
  SDKUserMessage,
  SDKAssistantMessage,
  SDKResultMessage,
  SDKSystemMessage,
  
  // Tool input types
  ToolInputSchemas,
  BashInput,
  FileEditInput,
  FileMultiEditInput,
  FileReadInput,
  FileWriteInput,
  GlobInput,
  GrepInput,
  TodoWriteInput,
  WebFetchInput,
  WebSearchInput,
  NotebookEditInput,
  NotebookReadInput,
  AgentInput,
  McpInput,
  
  // Utility types
  NonNullableUsage
}

export {
  exploreClaudeCodeTypes,
  query
}