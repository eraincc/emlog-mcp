# Emlog MCP Server

[![GitHub License](https://img.shields.io/github/license/eraincc/emlog-mcp.svg)](https://img.shields.io/github/license/eraincc/emlog-mcp.svg)
[![English](https://img.shields.io/badge/English-Click-yellow)](README.md)
[![简体中文](https://img.shields.io/badge/简体中文-点击查看-orange)](README-zh.md)
[![繁體中文](https://img.shields.io/badge/繁體中文-點擊查看-orange)](README-zh_TW.md)

一个基于 Model Context Protocol (MCP) 的 Emlog 博客系统集成服务，允许 AI 助手通过标准化接口与 Emlog 博客进行交互。

<a href="https://glama.ai/mcp/servers/@eraincc/emlog-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@eraincc/emlog-mcp/badge" alt="Emlog MCP Server" />
</a>

## 功能特性

### 资源 (Resources)
- **博客文章** (`emlog://articles`) - 获取所有博客文章列表
- **分类** (`emlog://categories`) - 获取所有分类信息
- **评论** (`emlog://comments`) - 获取评论列表（基于最新文章）
- **微语笔记** (`emlog://notes`) - 获取微语笔记列表
- **草稿文章** (`emlog://drafts`) - 获取所有草稿文章列表
- **用户信息** (`emlog://user`) - 获取当前用户信息

### 工具 (Tools)
- **create_article** - 创建新的博客文章
- **update_article** - 更新现有博客文章
- **get_article** - 获取指定文章详情
- **search_articles** - 搜索文章（支持关键词、标签、分类等筛选）
- **like_article** - 为文章点赞
- **add_comment** - 添加评论
- **get_comments** - 获取指定文章的评论列表
- **create_note** - 创建微语笔记
- **upload_file** - 上传文件（图片等媒体资源）
- **get_user_info** - 获取用户信息
- **get_draft_list** - 获取草稿文章列表
- **get_draft_detail** - 获取指定草稿的详细信息

## 技术栈

- **TypeScript** - 类型安全的 JavaScript 超集
- **Node.js** - JavaScript 运行时环境
- **MCP SDK** - Model Context Protocol TypeScript SDK
- **Axios** - HTTP 客户端库
- **Zod** - TypeScript 优先的模式验证库
- **form-data** - 多部分表单数据处理

## 安装和配置

### 方式一：使用已发布的 npm 包（推荐）

直接在 Claude Desktop 配置中使用 `emlog-mcp`，无需本地安装。跳转到 [MCP 客户端配置](#mcp-客户端配置) 部分。

### 方式二：本地开发安装

#### 1. 克隆项目

```bash
git clone https://github.com/eraincc/emlog-mcp.git
cd emlog-mcp
```

#### 2. 安装依赖

```bash
npm install
```

#### 3. 环境变量配置

复制示例配置文件并编辑：

```bash
cp .env.example .env
```

在 `.env` 文件中设置以下环境变量：

```bash
# Emlog API 基础 URL（必需）
EMLOG_API_URL=https://your-emlog-site.com

# Emlog API 密钥（必需）
EMLOG_API_KEY=your_api_key_here
```

**获取 API 密钥：**
1. 登录你的 Emlog 后台管理系统
2. 进入「设置」→「API 接口」
3. 启用 API 功能并生成 API 密钥
4. 将生成的密钥复制到 `.env` 文件中

#### 4. 构建项目

```bash
npm run build
```

#### 5. 运行服务

```bash
npm start
```

或者开发模式：

```bash
npm run dev
```

## MCP 客户端配置

### Claude Desktop 配置

在 Claude Desktop 的配置文件中添加（通常位于 `~/Library/Application Support/Claude/claude_desktop_config.json`）：

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

**注意：** 现在配置直接使用已发布的 npm 包 `emlog-mcp`，无需本地安装或编译，`npx` 会自动下载并运行最新版本。

项目还提供了一个示例配置文件 `claude-desktop-config.json`，你可以参考其中的配置格式。

### 其他 MCP 客户端

对于其他支持 MCP 的客户端，请参考相应的文档来配置 stdio 传输。

## API 接口说明

本服务基于 Emlog 的 REST API 构建，支持以下主要操作：

### 文章管理
- `GET /api/article_list` - 获取文章列表
- `GET /api/article_view` - 获取指定文章详情
- `POST /api/article_save` - 创建/更新文章
- `POST /api/article_like` - 文章点赞

### 草稿管理
- `GET /api/draft_list` - 获取草稿列表
- `GET /api/draft_detail` - 获取指定草稿详情

### 分类管理
- `GET /api/sort_list` - 获取分类列表

### 评论管理
- `GET /api/comment_list` - 获取评论列表
- `POST /api/comment_save` - 发布评论

### 微语笔记
- `GET /api/note_list` - 获取微语笔记列表
- `POST /api/note_save` - 发布微语笔记

### 文件上传
- `POST /api/upload` - 上传文件

### 用户管理
- `GET /api/userinfo` - 获取用户信息

## 使用示例

### 创建博客文章

```typescript
// 通过 MCP 工具调用
{
  "name": "create_article",
  "arguments": {
    "title": "我的新文章",
    "content": "这是文章内容，支持 HTML 和 Markdown 格式。",
    "sort_id": 1,
    "tag": "技术,编程,MCP",
    "is_private": "n",
    "allow_comment": "y"
  }
}
```

### 搜索文章

```typescript
// 搜索包含关键词的文章
{
  "name": "search_articles",
  "arguments": {
    "keyword": "技术",
    "page": 1,
    "count": 10
  }
}
```

### 获取文章列表

```typescript
// 通过 MCP 资源访问
{
  "uri": "emlog://articles"
}
```

### 获取草稿列表

```typescript
// 获取草稿列表
{
  "name": "get_draft_list",
  "arguments": {
    "count": 10
  }
}
```

### 获取草稿详情

```typescript
// 获取指定草稿的详细信息
{
  "name": "get_draft_detail",
  "arguments": {
    "id": 123
  }
}
```

### 上传文件

```typescript
// 上传图片文件
{
  "name": "upload_file",
  "arguments": {
    "file_path": "/path/to/image.jpg"
  }
}
```

### 创建微语笔记

```typescript
// 发布微语笔记
{
  "name": "create_note",
  "arguments": {
    "content": "这是一条微语笔记",
    "is_private": false
  }
}
```

## 错误处理

服务包含完整的错误处理机制：

- **网络错误** - 自动重试和超时处理
- **API 错误** - 详细的错误信息返回
- **认证错误** - API 密钥验证失败提示
- **参数错误** - 输入参数验证和提示

## 开发和调试

### 可用脚本

```bash
# 构建项目
npm run build

# 启动服务
npm start

# 开发模式（自动重启）
npm run dev

# 监视模式（自动编译）
npm run watch

# 运行测试
npm test
```

### 日志输出

服务会在 stderr 输出运行状态信息，便于调试：

```bash
Emlog MCP server running on stdio
```

### 测试服务

项目包含一个简单的测试脚本 `test-server.js`，可以用来验证服务是否正常工作：

```bash
node test-server.js
```

## 安全注意事项

1. **API 密钥保护** - 确保 API 密钥不被泄露，使用环境变量存储
2. **HTTPS 连接** - 生产环境建议使用 HTTPS 连接 Emlog API
3. **权限控制** - 确保 API 密钥具有适当的权限范围
4. **输入验证** - 所有用户输入都经过验证和清理

## 故障排除

### 常见问题

1. **连接失败**
   - 检查 `EMLOG_API_URL` 是否正确
   - 确认 Emlog 站点可访问

2. **认证失败**
   - 验证 `EMLOG_API_KEY` 是否有效
   - 检查 API 密钥权限

3. **工具调用失败**
   - 查看错误信息中的具体原因
   - 确认参数格式正确

## 项目结构

```
emlog-mcp/
├── src/                    # 源代码目录
│   ├── index.ts           # MCP 服务主入口
│   └── emlog-client.ts    # Emlog API 客户端
├── dist/                  # 编译输出目录
├── docs/                  # 文档目录
│   └── api_doc.md        # Emlog API 详细文档
├── .env.example          # 环境变量示例文件
├── .gitignore            # Git 忽略文件配置
├── claude-desktop-config.json  # Claude Desktop 配置示例
├── test-server.js        # 测试脚本
├── package.json          # 项目配置和依赖
├── tsconfig.json         # TypeScript 配置
└── README.md             # 项目说明文档
```

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。在提交代码前，请确保：

1. 代码通过 TypeScript 编译检查
2. 遵循项目的代码风格
3. 添加适当的错误处理
4. 更新相关文档

## 许可证

MIT License

## 相关链接

- [项目仓库](https://github.com/eraincc/emlog-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Emlog 官方网站](https://www.emlog.net/)
- [Emlog API 文档](https://www.emlog.net/docs/api/)