# Emlog MCP Server

[![GitHub License](https://img.shields.io/github/license/eraincc/emlog-mcp.svg)](https://img.shields.io/github/license/eraincc/emlog-mcp.svg)
[![English](https://img.shields.io/badge/English-Click-yellow)](README.md)
[![简体中文](https://img.shields.io/badge/简体中文-点击查看-orange)](README-zh.md)
[![繁體中文](https://img.shields.io/badge/繁體中文-點擊查看-orange)](README-zh_TW.md)

一個基於 Model Context Protocol (MCP) 的 Emlog 部落格系統整合服務，允許 AI 助手透過標準化介面與 Emlog 部落格進行互動。

<a href="https://glama.ai/mcp/servers/@eraincc/emlog-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@eraincc/emlog-mcp/badge" alt="Emlog MCP Server" />
</a>

## 功能特色

### 資源 (Resources)
- **部落格文章** (`emlog://articles`) - 取得所有部落格文章清單
- **分類** (`emlog://categories`) - 取得所有分類資訊
- **評論** (`emlog://comments`) - 取得評論清單（基於最新文章）
- **微語筆記** (`emlog://notes`) - 取得微語筆記清單
- **草稿文章** (`emlog://drafts`) - 取得所有草稿文章清單
- **使用者資訊** (`emlog://user`) - 取得目前使用者資訊

### 工具 (Tools)
- **create_article** - 建立新的部落格文章
- **update_article** - 更新現有部落格文章
- **get_article** - 取得指定文章詳情
- **search_articles** - 搜尋文章（支援關鍵字、標籤、分類等篩選）
- **like_article** - 為文章按讚
- **add_comment** - 新增評論
- **get_comments** - 取得指定文章的評論清單
- **create_note** - 建立微語筆記
- **upload_file** - 上傳檔案（圖片等媒體資源）
- **get_user_info** - 取得使用者資訊
- **get_draft_list** - 取得草稿文章清單
- **get_draft_detail** - 取得指定草稿的詳細資訊

## 技術堆疊

- **TypeScript** - 型別安全的 JavaScript 超集
- **Node.js** - JavaScript 執行環境
- **MCP SDK** - Model Context Protocol TypeScript SDK
- **Axios** - HTTP 用戶端程式庫
- **Zod** - TypeScript 優先的模式驗證程式庫
- **form-data** - 多部分表單資料處理

## 安裝與設定

### 方式一：直接使用（推薦）

直接在 Claude Desktop 設定中使用 `emlog-mcp`，無需本地安裝。跳轉到 [MCP 用戶端設定](#mcp-用戶端設定) 部分。

### 方式二：本地開發安裝

#### 1. 複製專案

```bash
git clone https://github.com/eraincc/emlog-mcp.git
cd emlog-mcp
```

#### 2. 安裝相依性

```bash
npm install
```

#### 3. 環境變數設定

複製範例設定檔並編輯：

```bash
cp .env.example .env
```

在 `.env` 檔案中設定以下環境變數：

```bash
# Emlog API 基礎 URL（必需）
EMLOG_API_URL=https://your-emlog-site.com

# Emlog API 金鑰（必需）
EMLOG_API_KEY=your_api_key_here
```

**取得 API 金鑰：**
1. 登入你的 Emlog 後台管理系統
2. 進入「設定」→「API 介面」
3. 啟用 API 功能並產生 API 金鑰
4. 將產生的金鑰複製到 `.env` 檔案中

#### 4. 建置專案

```bash
npm run build
```

#### 5. 執行服務

```bash
npm start
```

或者開發模式：

```bash
npm run dev
```

## MCP 用戶端設定

### Claude Desktop 設定

在 Claude Desktop 的設定檔中新增（通常位於 `~/Library/Application Support/Claude/claude_desktop_config.json`）：

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

**注意：** 現在設定直接使用已發布的 npm 套件 `emlog-mcp`，無需本地安裝或編譯，`npx` 會自動下載並執行最新版本。

專案還提供了一個範例設定檔 `claude-desktop-config.json`，你可以參考其中的設定格式。

### 其他 MCP 用戶端

對於其他支援 MCP 的用戶端，請參考相應的文件來設定 stdio 傳輸。

## API 介面說明

本服務基於 Emlog 的 REST API 建構，支援以下主要操作：

### 文章管理
- `GET /api/article_list` - 取得文章清單
- `GET /api/article_view` - 取得指定文章詳情
- `POST /api/article_save` - 建立/更新文章
- `POST /api/article_like` - 文章按讚

### 草稿管理
- `GET /api/draft_list` - 取得草稿清單
- `GET /api/draft_detail` - 取得指定草稿詳情

### 分類管理
- `GET /api/sort_list` - 取得分類清單

### 評論管理
- `GET /api/comment_list` - 取得評論清單
- `POST /api/comment_save` - 發布評論

### 微語筆記
- `GET /api/note_list` - 取得微語筆記清單
- `POST /api/note_save` - 發布微語筆記

### 檔案上傳
- `POST /api/upload` - 上傳檔案

### 使用者管理
- `GET /api/userinfo` - 取得使用者資訊

## 使用範例

### 建立部落格文章

```typescript
// 透過 MCP 工具呼叫
{
  "name": "create_article",
  "arguments": {
    "title": "我的新文章",
    "content": "這是文章內容，支援 HTML 和 Markdown 格式。",
    "sort_id": 1,
    "tag": "技術,程式設計,MCP",
    "is_private": "n",
    "allow_comment": "y"
  }
}
```

### 搜尋文章

```typescript
// 搜尋包含關鍵字的文章
{
  "name": "search_articles",
  "arguments": {
    "keyword": "技術",
    "page": 1,
    "count": 10
  }
}
```

### 取得文章清單

```typescript
// 透過 MCP 資源存取
{
  "uri": "emlog://articles"
}
```

### 取得草稿清單

```typescript
// 取得草稿清單
{
  "name": "get_draft_list",
  "arguments": {
    "count": 10
  }
}
```

### 取得草稿詳情

```typescript
// 取得指定草稿的詳細資訊
{
  "name": "get_draft_detail",
  "arguments": {
    "id": 123
  }
}
```

### 上傳檔案

```typescript
// 上傳圖片檔案
{
  "name": "upload_file",
  "arguments": {
    "file_path": "/path/to/image.jpg"
  }
}
```

### 建立微語筆記

```typescript
// 發布微語筆記
{
  "name": "create_note",
  "arguments": {
    "content": "這是一條微語筆記",
    "is_private": false
  }
}
```

## 錯誤處理

服務包含完整的錯誤處理機制：

- **網路錯誤** - 自動重試和逾時處理
- **API 錯誤** - 詳細的錯誤資訊回傳
- **認證錯誤** - API 金鑰驗證失敗提示
- **參數錯誤** - 輸入參數驗證和提示

## 開發與除錯

### 可用指令

```bash
# 建置專案
npm run build

# 啟動服務
npm start

# 開發模式（自動重啟）
npm run dev

# 監視模式（自動編譯）
npm run watch

# 執行測試
npm test
```

### 日誌輸出

服務會在 stderr 輸出執行狀態資訊，便於除錯：

```bash
Emlog MCP server running on stdio
```

### 測試服務

專案包含一個簡單的測試指令碼 `test-server.js`，可以用來驗證服務是否正常運作：

```bash
node test-server.js
```

## 安全注意事項

1. **API 金鑰保護** - 確保 API 金鑰不被洩露，使用環境變數儲存
2. **HTTPS 連線** - 生產環境建議使用 HTTPS 連線 Emlog API
3. **權限控制** - 確保 API 金鑰具有適當的權限範圍
4. **輸入驗證** - 所有使用者輸入都經過驗證和清理

## 故障排除

### 常見問題

1. **連線失敗**
   - 檢查 `EMLOG_API_URL` 是否正確
   - 確認 Emlog 站點可存取

2. **認證失敗**
   - 驗證 `EMLOG_API_KEY` 是否有效
   - 檢查 API 金鑰權限

3. **工具呼叫失敗**
   - 查看錯誤資訊中的具體原因
   - 確認參數格式正確

## 專案結構

```
emlog-mcp/
├── src/                    # 原始碼目錄
│   ├── index.ts           # MCP 服務主入口
│   └── emlog-client.ts    # Emlog API 用戶端
├── dist/                  # 編譯輸出目錄
├── docs/                  # 文件目錄
│   └── api_doc.md        # Emlog API 詳細文件
├── .env.example          # 環境變數範例檔案
├── .gitignore            # Git 忽略檔案設定
├── claude-desktop-config.json  # Claude Desktop 設定範例
├── test-server.js        # 測試指令碼
├── package.json          # 專案設定和相依性
├── tsconfig.json         # TypeScript 設定
└── README.md             # 專案說明文件
```

## 貢獻

歡迎提交 Issue 和 Pull Request 來改進這個專案。在提交程式碼前，請確保：

1. 程式碼通過 TypeScript 編譯檢查
2. 遵循專案的程式碼風格
3. 新增適當的錯誤處理
4. 更新相關文件

## 授權條款

MIT License

## 相關連結

- [專案儲存庫](https://github.com/eraincc/emlog-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Emlog 官方網站](https://www.emlog.net/)
- [Emlog API 文件](https://www.emlog.net/docs/api/)