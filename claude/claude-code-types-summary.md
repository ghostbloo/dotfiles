# @anthropic-ai/claude-code Import Reference

Quick reference for types and imports from the Claude Code SDK.

## Import Paths

### `@anthropic-ai/claude-code`
Main SDK functionality and configuration types.

**Functions:**
- `query()` - Main function to query Claude Code, returns async generator

**Configuration Types:**
- `Options` - Main configuration object (20+ properties for controlling behavior)
- `PermissionMode` - Permission handling: `'default' | 'acceptEdits' | 'bypassPermissions' | 'plan'`
- `ApiKeySource` - API key source tracking: `'user' | 'project' | 'org' | 'temporary'`
- `ConfigScope` - Configuration scope: `'local' | 'user' | 'project'`

**MCP Server Types:**
- `McpServerConfig` - Union of all MCP server configurations
- `McpStdioServerConfig` - STDIO server config (most common)
- `McpSSEServerConfig` - Server-Sent Events server config  
- `McpHttpServerConfig` - HTTP server config

**Message Types:**
- `SDKMessage` - Union of all message types
- `SDKUserMessage` - User messages with session tracking
- `SDKAssistantMessage` - Assistant responses with session tracking
- `SDKResultMessage` - Success/error results with usage metrics and cost tracking
- `SDKSystemMessage` - System initialization messages with tool and server status

**Query Interface:**
- `Query` - Async generator interface with `interrupt()` method for streaming interactions

**Utility Types:**
- `NonNullableUsage` - Non-nullable version of Usage from Anthropic SDK
- `AbortError` - Error class for aborted operations

### `@anthropic-ai/claude-code/sdk-tools`
Tool input schema types for all built-in Claude Code tools.

**Union Type:**
- `ToolInputSchemas` - Union of all tool input types

**File Operations (4 types):**
- `FileReadInput` - Read files with optional offset/limit
- `FileWriteInput` - Write file content
- `FileEditInput` - Single string replacement with replace_all option
- `FileMultiEditInput` - Multiple edits in sequence

**Directory/Search (3 types):**
- `LsInput` - List directory contents with ignore patterns
- `GlobInput` - Pattern-based file matching
- `GrepInput` - Advanced ripgrep search with context options, multiline support, and output modes

**Command Execution (3 types):**
- `BashInput` - Execute shell commands with timeout, sandboxing, and custom shell support
- `BashOutputInput` - Get output from background shells
- `KillShellInput` - Kill background shell processes

**Jupyter Notebooks (2 types):**
- `NotebookReadInput` - Read notebook cells
- `NotebookEditInput` - Edit/insert/delete notebook cells with cell type support

**Web Operations (2 types):**
- `WebFetchInput` - Fetch and process web content
- `WebSearchInput` - Search with domain filtering

**Task Management (1 type):**
- `TodoWriteInput` - Manage todos with status, priority, and ID tracking

**Agent/Planning (2 types):**
- `AgentInput` - Spawn sub-agents for tasks
- `ExitPlanModeInput` - Present plans for approval

**MCP Operations (3 types):**
- `McpInput` - Generic MCP server operations
- `ListMcpResourcesInput` - List MCP server resources
- `ReadMcpResourceInput` - Read specific MCP resources

## Key Features

- **Streaming Architecture**: Async generators for real-time interaction
- **MCP Integration**: Full Model Context Protocol support with 3 transport types
- **Cost Tracking**: Built-in API usage and cost monitoring
- **Permission System**: 4 permission modes for operation control
- **Session Management**: All messages include unique session tracking
- **Type Safety**: Comprehensive TypeScript definitions for all functionality

## Usage Pattern

```typescript
import { query, type Options, type SDKMessage } from '@anthropic-ai/claude-code'
import type { FileEditInput, GrepInput } from '@anthropic-ai/claude-code/sdk-tools'

for await (const message of query({ prompt, options })) {
  // Handle streaming messages
}
```