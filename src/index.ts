#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { EmlogClient } from "./emlog-client.js";

// Get API configuration from environment
const EMLOG_API_URL = process.env.EMLOG_API_URL;
const EMLOG_API_KEY = process.env.EMLOG_API_KEY;

if (!EMLOG_API_URL || !EMLOG_API_KEY) {
  console.error("Missing required environment variables: EMLOG_API_URL and EMLOG_API_KEY");
  process.exit(1);
}

// Initialize Emlog client
const emlogClient = new EmlogClient(EMLOG_API_URL, EMLOG_API_KEY);

// Create MCP server
const server = new McpServer({
  name: "emlog-mcp",
  version: "1.0.2",
});

// Register resources
server.registerResource(
  "articles",
  "emlog://articles",
  { description: "All articles from the Emlog blog" },
  async (uri: URL) => {
    try {
        const result = await emlogClient.getArticleList({});
      return {
          contents: [{
            uri: uri.toString(),
            mimeType: "application/json",
            text: JSON.stringify(result, null, 2)
          }]
        };
    } catch (error) {
      throw new Error(`Failed to fetch articles: ${error}`);
    }
  }
);

server.registerResource(
  "categories",
  "emlog://categories",
  { description: "All categories from the Emlog blog" },
  async (uri: URL) => {
     try {
        const result = await emlogClient.getSortList();
      return {
          contents: [{
            uri: uri.toString(),
            mimeType: "application/json",
            text: JSON.stringify(result, null, 2)
          }]
        };
    } catch (error) {
      throw new Error(`Failed to fetch categories: ${error}`);
    }
  }
);

server.registerResource(
  "comments",
  "emlog://comments/{id}",
  { description: "Comments for a specific article. Use emlog://comments/{article_id} to get comments for a specific article." },
  async (uri: URL) => {
     try {
        // 从URI路径中解析文章ID，例如: emlog://comments/123
        const pathParts = uri.pathname.split('/').filter(part => part);
        const articleId = pathParts.length > 0 ? parseInt(pathParts[0]) : 1;
        
        if (isNaN(articleId)) {
          throw new Error('Invalid article ID in URI. Use format: emlog://comments/{article_id}');
        }
        
        const result = await emlogClient.getCommentListSimple(articleId);
      return {
          contents: [{
            uri: uri.toString(),
            mimeType: "application/json",
            text: JSON.stringify({
              articleId: articleId,
              comments: result.comments,
              totalComments: result.comments.length
            }, null, 2)
          }]
        };
    } catch (error) {
      throw new Error(`Failed to fetch comments: ${error}`);
    }
  }
);

server.registerResource(
  "notes",
  "emlog://notes",
  { description: "All notes from the Emlog blog" },
  async (uri: URL) => {
     try {
       const result = await emlogClient.getNoteList({ page: 1, count: 20 });
      return {
        contents: [{
          uri: uri.toString(),
          mimeType: "application/json",
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      throw new Error(`Failed to fetch notes: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
);

server.registerResource(
  "users",
  "emlog://users",
  { description: "All users from the Emlog blog" },
  async (uri: URL) => {
     try {
       const result = await emlogClient.getCurrentUser();
      return {
        contents: [{
          uri: uri.toString(),
          mimeType: "application/json",
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      throw new Error(`Failed to fetch user info: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
);

server.registerResource(
  "drafts",
  "emlog://drafts",
  { description: "All drafts from the Emlog blog" },
  async (uri: URL) => {
     try {
       const result = await emlogClient.getDraftList({ count: 20 });
      return {
        contents: [{
          uri: uri.toString(),
          mimeType: "application/json",
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      throw new Error(`Failed to fetch drafts: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
);



// Register tools
server.registerTool(
  "create_article",
  {
    title: "Create Article",
    description: "Create a new blog article",
    inputSchema: {
      title: z.string().describe("The title of the article"),
      content: z.string().describe("The content of the article"),
      excerpt: z.string().optional().describe("The excerpt/summary of the article"),
      cover: z.string().optional().describe("The cover image URL"),
      sort_id: z.number().optional().describe("The category ID for the article"),
      tags: z.string().optional().describe("Comma-separated tags for the article"),
      draft: z.enum(["y", "n"]).optional().describe("Whether to save as draft (y) or publish (n)"),
      top: z.enum(["y", "n"]).optional().describe("Whether to pin to homepage"),
      allow_remark: z.enum(["y", "n"]).optional().describe("Whether to allow comments")
    }
  },
  async ({ title, content, excerpt, cover, sort_id, tags, draft, top, allow_remark }) => {
    try {
      const result = await emlogClient.createArticle({
        title,
        content,
        excerpt,
        cover,
        sort_id,
        tags,
        draft,
        top,
        allow_remark
      });
      return {
        content: [{
          type: "text",
          text: `Successfully created article: ${title} (ID: ${result.article_id || 'unknown'})`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "update_article",
  {
    title: "Update Article",
    description: "Update an existing blog article. If the article is currently a draft and no draft parameter is specified, it will remain as a draft.",
    inputSchema: {
      id: z.number().describe("The ID of the article to update"),
      title: z.string().describe("The new title of the article"),
      content: z.string().optional().describe("The new content of the article"),
      excerpt: z.string().optional().describe("The new excerpt/summary"),
      cover: z.string().optional().describe("The new cover image URL"),
      sort_id: z.number().optional().describe("The new category ID"),
      tags: z.string().optional().describe("New comma-separated tags"),
      draft: z.enum(["y", "n"]).optional().describe("Whether to save as draft (y) or publish (n). If not specified and the article is currently a draft, it will remain as a draft.")
    }
  },
  async ({ id, title, content, excerpt, cover, sort_id, tags, draft }) => {
    try {
      // 如果用户没有明确指定draft参数，需要检查当前文章状态
      let finalDraft = draft;
      if (draft === undefined) {
        try {
          // 首先尝试从草稿中获取
          const draftResult = await emlogClient.getDraftDetail(id);
          if (draftResult && draftResult.draft) {
            // 如果在草稿中找到，保持草稿状态
            finalDraft = "y";
          }
        } catch (draftError) {
          // 如果不是草稿，尝试从已发布文章中获取
          try {
            await emlogClient.getArticleDetail(id);
            // 如果是已发布文章且用户没有指定draft，保持发布状态
            finalDraft = "n";
          } catch (articleError) {
            // 如果都找不到，可能是文章不存在
            console.error(`Article ${id} not found in drafts or published articles`);
          }
        }
      }

      await emlogClient.updateArticle(id, {
        title,
        content,
        excerpt,
        cover,
        sort_id,
        tags,
        draft: finalDraft
      });
      
      const statusText = finalDraft === "y" ? "(saved as draft)" : finalDraft === "n" ? "(published)" : "";
      return {
        content: [{
          type: "text",
          text: `Successfully updated article: ${title} (ID: ${id}) ${statusText}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "get_article",
  {
    title: "Get Article",
    description: "Get a specific article by ID",
    inputSchema: {
      id: z.number().describe("The ID of the article to retrieve"),
      password: z.string().optional().describe("Password for protected articles")
    }
  },
  async ({ id, password }) => {
    try {
      const article = await emlogClient.getArticleDetail(id, password);
      return {
        content: [{
          type: "text",
          text: `Article: ${article.title}\n\nContent: ${article.content}\n\nExcerpt: ${article.excerpt || 'N/A'}\nCategory: ${article.sort_id}\nTags: ${article.tags || 'N/A'}\nViews: ${article.views}\nComments: ${article.comnum}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "search_articles",
  {
    title: "Search Articles",
    description: "Search articles by keyword, tag, or category",
    inputSchema: {
      keyword: z.string().optional().describe("Search keyword for article titles"),
      tag: z.string().optional().describe("Filter by tag"),
      sort_id: z.number().optional().describe("Filter by category ID"),
      page: z.number().optional().describe("Page number (default: 1)"),
      count: z.number().optional().describe("Number of articles per page"),
      order: z.enum(["views", "comnum"]).optional().describe("Sort order: views (by view count) or comnum (by comment count)")
    }
  },
  async ({ keyword, tag, sort_id, page, count, order }) => {
    try {
      const result = await emlogClient.getArticleList({
        keyword,
        tag,
        sort_id,
        page,
        count,
        order
      });
      const articles = result.articles;
      const articleList = articles.map((article: any) => 
        `- ${article.title} (ID: ${article.id}) - Views: ${article.views}, Comments: ${article.comnum}`
      ).join('\n');
      return {
        content: [{
          type: "text",
          text: `Found ${articles.length} articles (Page ${result.page}/${result.total_pages}):\n\n${articleList || 'No articles found'}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "like_article",
  {
    title: "Like Article",
    description: "Like an article",
    inputSchema: {
      gid: z.number().describe("The ID of the article to like"),
      name: z.string().optional().describe("Name of the person liking"),
      avatar: z.string().optional().describe("Avatar URL of the person liking")
    }
  },
  async ({ gid, name, avatar }) => {
    try {
      await emlogClient.likeArticle(gid, name, avatar);
      return {
        content: [{
          type: "text",
          text: `Successfully liked article with ID: ${gid}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "add_comment",
  {
    title: "Add Comment",
    description: "Add a comment to an article",
    inputSchema: {
      gid: z.number().describe("The ID of the article to comment on"),
      comname: z.string().describe("Name of the commenter"),
      comment: z.string().describe("The comment content"),
      commail: z.string().optional().describe("Email of the commenter"),
      comurl: z.string().optional().describe("Website URL of the commenter"),
      pid: z.number().optional().describe("Parent comment ID for replies")
    }
  },
  async ({ gid, comname, comment, commail, comurl, pid }) => {
    try {
      await emlogClient.addComment({
        gid,
        comname,
        comment,
        commail,
        comurl,
        pid
      });
      return {
        content: [{
          type: "text",
          text: `Successfully added comment to article ${gid} by ${comname}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "get_comments",
  {
    title: "Get Comments",
    description: "Get comments for an article (with pagination support)",
    inputSchema: {
      id: z.number().describe("The ID of the article"),
      page: z.number().optional().describe("Page number for paginated comments (requires backend pagination enabled)")
    }
  },
  async ({ id, page }) => {
    try {
      // 如果提供了page参数，使用支持分页的comment_list接口
      // 否则使用简化的comment_list_simple接口
      if (page !== undefined) {
        const result = await emlogClient.getCommentList(id, page);
        const comments = Object.values(result.comments);
        const commentList = comments.map((comment: any) => 
          `- ${comment.poster}: ${comment.comment} (${comment.date})`
        ).join('\n');
        return {
          content: [{
            type: "text",
            text: `Comments for article ${id} (page ${page}):\n\n${commentList || 'No comments found'}\n\nPage URL: ${result.commentPageUrl || 'N/A'}`
          }]
        };
      } else {
        const result = await emlogClient.getCommentListSimple(id);
        const comments = result.comments;
        const commentList = comments.map((comment: any) => 
          `- ${comment.poster}: ${comment.comment} (${comment.date})`
        ).join('\n');
        return {
          content: [{
            type: "text",
            text: `Comments for article ${id}:\n\n${commentList || 'No comments found'}`
          }]
        };
      }
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "create_note",
  {
    title: "Create Note",
    description: "Create a new micro-note",
    inputSchema: {
      t: z.string().describe("The content of the micro-note"),
      private: z.enum(["y", "n"]).optional().describe("Whether the note is private (y) or public (n)")
    }
  },
  async ({ t, private: isPrivate }) => {
    try {
      await emlogClient.publishNote(t, isPrivate);
      return {
        content: [{
          type: "text",
          text: `Successfully created micro-note: ${t.substring(0, 50)}${t.length > 50 ? '...' : ''}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "upload_file",
  {
    title: "Upload File",
    description: "Upload a file (image, document, etc.)",
    inputSchema: {
      file_path: z.string().describe("Local path to the file to upload"),
      sid: z.number().optional().describe("Resource category ID")
    }
  },
  async ({ file_path, sid }) => {
    try {
      const result = await emlogClient.uploadFile(file_path, sid);
      return {
        content: [{
          type: "text",
          text: `Successfully uploaded file: ${result.url}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "get_user_info",
  {
    title: "Get User Info",
    description: "Get current user information",
    inputSchema: {}
  },
  async () => {
    try {
      const result = await emlogClient.getCurrentUser();
      const user = result.userinfo;
      return {
        content: [{
          type: "text",
          text: `User: ${user.nickname}\nEmail: ${user.email}\nUID: ${user.uid}\nDescription: ${user.description || 'N/A'}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "get_draft_list",
  {
    title: "Get Draft List",
    description: "Get list of draft articles",
    inputSchema: {
      count: z.number().optional().describe("Number of drafts to retrieve")
    }
  },
  async ({ count }) => {
    try {
      const result = await emlogClient.getDraftList({ count });
      const drafts = result.drafts;
      const draftList = drafts.map((draft: any) => 
        `- ID: ${draft.id}, Title: ${draft.title || 'Untitled'}, Date: ${draft.date}`
      ).join('\n');
      return {
        content: [{
          type: "text",
          text: `Draft articles (${drafts.length} found):\n\n${draftList || 'No drafts found'}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "get_draft_detail",
  {
    title: "Get Draft Detail",
    description: "Get details of a specific draft",
    inputSchema: {
      id: z.number().describe("The ID of the draft to retrieve")
    }
  },
  async ({ id }) => {
    try {
      const result = await emlogClient.getDraftDetail(id);
      const draft = result.draft;
      return {
        content: [{
          type: "text",
          text: `Draft Details:\n\nTitle: ${draft.title}\nID: ${draft.id}\nDate: ${draft.date}\nAuthor: ${draft.author_name}\nCategory: ${draft.sort_name || 'Uncategorized'}\nExcerpt: ${draft.excerpt || 'No excerpt'}\n\n--- Content ---\n${draft.content}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);


// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Emlog MCP server running on stdio');
}

main().catch(console.error);