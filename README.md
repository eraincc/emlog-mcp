# Emlog MCP Server

[![GitHub License](https://img.shields.io/github/license/eraincc/emlog-mcp.svg)](https://img.shields.io/github/license/eraincc/emlog-mcp.svg)
[![English](https://img.shields.io/badge/English-Click-yellow)](README.md)
[![简体中文](https://img.shields.io/badge/简体中文-点击查看-orange)](README-zh.md)
[![繁體中文](https://img.shields.io/badge/繁體中文-點擊查看-orange)](README-zh_TW.md)

An Emlog blog system integration service based on Model Context Protocol (MCP), allowing AI assistants to interact with Emlog blogs through standardized interfaces.

<a href="https://glama.ai/mcp/servers/@eraincc/emlog-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@eraincc/emlog-mcp/badge" alt="Emlog MCP Server" />
</a>

## Features

### Resources
- **Blog Articles** (`emlog://articles`) - Get all blog article lists
- **Categories** (`emlog://categories`) - Get all category information
- **Comments** (`emlog://comments`) - Get comment lists (based on latest articles)
- **Micro Notes** (`emlog://notes`) - Get micro note lists
- **Draft Articles** (`emlog://drafts`) - Get all draft article lists
- **User Information** (`emlog://user`) - Get current user information

### Tools
- **create_article** - Create new blog articles
- **update_article** - Update existing blog articles
- **get_article** - Get specific article details
- **search_articles** - Search articles (supports keyword, tag, category filtering)
- **like_article** - Like articles
- **add_comment** - Add comments
- **get_comments** - Get comment lists for specific articles
- **create_note** - Create micro notes
- **upload_file** - Upload files (images and other media resources)
- **get_user_info** - Get user information
- **get_draft_list** - Get draft article lists
- **get_draft_detail** - Get detailed information of specific drafts

## Tech Stack

- **TypeScript** - Type-safe JavaScript superset
- **Node.js** - JavaScript runtime environment
- **MCP SDK** - Model Context Protocol TypeScript SDK
- **Axios** - HTTP client library
- **Zod** - TypeScript-first schema validation library
- **form-data** - Multipart form data processing

## Installation and Configuration

### Method 1: Direct Use (Recommended)

Use `emlog-mcp` directly in Claude Desktop configuration without local installation. Jump to [MCP Client Configuration](#mcp-client-configuration) section.

### Method 2: Local Development Installation

#### 1. Clone the Project

```bash
git clone https://github.com/eraincc/emlog-mcp.git
cd emlog-mcp
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Environment Variable Configuration

Copy the example configuration file and edit:

```bash
cp .env.example .env
```

Set the following environment variables in the `.env` file:

```bash
# Emlog API base URL (required)
EMLOG_API_URL=https://your-emlog-site.com

# Emlog API key (required)
EMLOG_API_KEY=your_api_key_here
```

**Getting API Key:**
1. Log in to your Emlog backend management system
2. Go to "Settings" → "API Interface"
3. Enable API functionality and generate API key
4. Copy the generated key to the `.env` file

#### 4. Build Project

```bash
npm run build
```

#### 5. Run Service

```bash
npm start
```

Or development mode:

```bash
npm run dev
```

## MCP Client Configuration

### Claude Desktop Configuration

Add to Claude Desktop configuration file (usually located at `~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "emlog": {
      "command": "npx",
      "args": ["emlog-mcp"],
      "env": {
        "EMLOG_API_URL": "https://your-emlog-site.com",
        "EMLOG_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

**Note:** The configuration now directly uses the published npm package `emlog-mcp`, no local installation or compilation required. `npx` will automatically download and run the latest version.

The project also provides an example configuration file `claude-desktop-config.json` for reference.

### Other MCP Clients

For other MCP-supporting clients, please refer to their respective documentation for stdio transport configuration.

## API Interface Documentation

This service is built on Emlog's REST API, supporting the following main operations:

### Article Management
- `GET /api/article_list` - Get article lists
- `GET /api/article_view` - Get specific article details
- `POST /api/article_save` - Create/update articles
- `POST /api/article_like` - Like articles

### Draft Management
- `GET /api/draft_list` - Get draft lists
- `GET /api/draft_detail` - Get specific draft details

### Category Management
- `GET /api/sort_list` - Get category lists

### Comment Management
- `GET /api/comment_list` - Get comment lists
- `POST /api/comment_save` - Publish comments

### Micro Notes
- `GET /api/note_list` - Get micro note lists
- `POST /api/note_save` - Publish micro notes

### File Upload
- `POST /api/upload` - Upload files

### User Management
- `GET /api/userinfo` - Get user information

## Usage Examples

### Create Blog Article

```typescript
// Through MCP tool call
{
  "name": "create_article",
  "arguments": {
    "title": "My New Article",
    "content": "This is the article content, supporting HTML and Markdown formats.",
    "sort_id": 1,
    "tag": "technology,programming,MCP",
    "is_private": "n",
    "allow_comment": "y"
  }
}
```

### Search Articles

```typescript
// Search articles containing keywords
{
  "name": "search_articles",
  "arguments": {
    "keyword": "technology",
    "page": 1,
    "count": 10
  }
}
```

### Get Article List

```typescript
// Through MCP resource access
{
  "uri": "emlog://articles"
}
```

### Get Draft List

```typescript
// Get draft list
{
  "name": "get_draft_list",
  "arguments": {
    "count": 10
  }
}
```

### Get Draft Details

```typescript
// Get detailed information of specific draft
{
  "name": "get_draft_detail",
  "arguments": {
    "id": 123
  }
}
```

### Upload File

```typescript
// Upload image file
{
  "name": "upload_file",
  "arguments": {
    "file_path": "/path/to/image.jpg"
  }
}
```

### Create Micro Note

```typescript
// Publish micro note
{
  "name": "create_note",
  "arguments": {
    "content": "This is a micro note",
    "is_private": false
  }
}
```

## Error Handling

The service includes comprehensive error handling mechanisms:

- **Network Errors** - Automatic retry and timeout handling
- **API Errors** - Detailed error information return
- **Authentication Errors** - API key validation failure prompts
- **Parameter Errors** - Input parameter validation and prompts

## Development and Debugging

### Available Scripts

```bash
# Build project
npm run build

# Start service
npm start

# Development mode (auto restart)
npm run dev

# Watch mode (auto compile)
npm run watch

# Run tests
npm test
```

### Log Output

The service outputs runtime status information to stderr for debugging:

```bash
Emlog MCP server running on stdio
```

### Test Service

The project includes a simple test script `test-server.js` to verify if the service is working properly:

```bash
node test-server.js
```

## Security Considerations

1. **API Key Protection** - Ensure API keys are not leaked, use environment variables for storage
2. **HTTPS Connection** - Recommend using HTTPS connection to Emlog API in production
3. **Permission Control** - Ensure API keys have appropriate permission scope
4. **Input Validation** - All user inputs are validated and sanitized

## Troubleshooting

### Common Issues

1. **Connection Failure**
   - Check if `EMLOG_API_URL` is correct
   - Confirm Emlog site is accessible

2. **Authentication Failure**
   - Verify if `EMLOG_API_KEY` is valid
   - Check API key permissions

3. **Tool Call Failure**
   - Check specific reasons in error messages
   - Confirm parameter format is correct

## Project Structure

```
emlog-mcp/
├── src/                    # Source code directory
│   ├── index.ts           # MCP service main entry
│   └── emlog-client.ts    # Emlog API client
├── dist/                  # Compiled output directory
├── docs/                  # Documentation directory
│   └── api_doc.md        # Detailed Emlog API documentation
├── .env.example          # Environment variable example file
├── .gitignore            # Git ignore file configuration
├── claude-desktop-config.json  # Claude Desktop configuration example
├── test-server.js        # Test script
├── package.json          # Project configuration and dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md             # Project documentation
```

## Contributing

Welcome to submit Issues and Pull Requests to improve this project. Before submitting code, please ensure:

1. Code passes TypeScript compilation checks
2. Follows project code style
3. Adds appropriate error handling
4. Updates relevant documentation

## License

MIT License

## Related Links

- [Project Repository](https://github.com/eraincc/emlog-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Emlog Official Website](https://www.emlog.net/)
- [Emlog API Documentation](https://www.emlog.net/docs/api/)