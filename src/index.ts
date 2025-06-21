#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { EmlogClient, EmlogPost, EmlogCategory, EmlogComment, EmlogNote, EmlogUser } from "./emlog-client.js";

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
const server = new Server(
  {
    name: "emlog-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Set up resource handlers
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'emlog://articles',
        mimeType: 'application/json',
        name: 'Emlog Articles',
        description: 'All blog articles from Emlog'
      },
      {
        uri: 'emlog://categories',
        mimeType: 'application/json',
        name: 'Emlog Categories',
        description: 'All categories from Emlog'
      },
      {
        uri: 'emlog://comments',
        mimeType: 'application/json',
        name: 'Emlog Comments',
        description: 'All comments from Emlog'
      },
      {
        uri: 'emlog://notes',
        mimeType: 'application/json',
        name: 'Emlog Notes',
        description: 'All micro-notes from Emlog'
      },
      {
        uri: 'emlog://users',
        mimeType: 'application/json',
        name: 'Emlog Users',
        description: 'User information from Emlog'
      }
    ]
  };
});

// Read specific resources
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  try {
    switch (uri) {
      case 'emlog://articles': {
        const result = await emlogClient.getArticleList({ page: 1, count: 20 });
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'emlog://categories': {
        const result = await emlogClient.getSortList();
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'emlog://comments': {
        // 获取最新文章的评论作为示例
        const articles = await emlogClient.getArticleList({ page: 1, count: 1 });
        if (articles.articles.length > 0) {
          const comments = await emlogClient.getCommentListSimple(articles.articles[0].id);
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(comments, null, 2)
              }
            ]
          };
        } else {
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({ comments: [] }, null, 2)
              }
            ]
          };
        }
      }

      case 'emlog://notes': {
        const result = await emlogClient.getNoteList({ page: 1, count: 20 });
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'emlog://users': {
        const result = await emlogClient.getCurrentUser();
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      default:
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Unknown resource: ${uri}`
        );
    }
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to read resource ${uri}: ${error}`
    );
  }
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_article',
        description: 'Create a new blog article',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'The title of the article'
            },
            content: {
              type: 'string',
              description: 'The content of the article'
            },
            excerpt: {
              type: 'string',
              description: 'The excerpt/summary of the article'
            },
            cover: {
              type: 'string',
              description: 'The cover image URL'
            },
            sort_id: {
              type: 'number',
              description: 'The category ID for the article'
            },
            tags: {
              type: 'string',
              description: 'Comma-separated tags for the article'
            },
            draft: {
              type: 'string',
              enum: ['y', 'n'],
              description: 'Whether to save as draft (y) or publish (n)'
            },
            top: {
              type: 'string',
              enum: ['y', 'n'],
              description: 'Whether to pin to homepage'
            },
            allow_remark: {
              type: 'string',
              enum: ['y', 'n'],
              description: 'Whether to allow comments'
            }
          },
          required: ['title', 'content']
        }
      },
      {
        name: 'update_article',
        description: 'Update an existing blog article',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'The ID of the article to update'
            },
            title: {
              type: 'string',
              description: 'The new title of the article'
            },
            content: {
              type: 'string',
              description: 'The new content of the article'
            },
            excerpt: {
              type: 'string',
              description: 'The new excerpt/summary'
            },
            cover: {
              type: 'string',
              description: 'The new cover image URL'
            },
            sort_id: {
              type: 'number',
              description: 'The new category ID'
            },
            tags: {
              type: 'string',
              description: 'New comma-separated tags'
            },
            draft: {
              type: 'string',
              enum: ['y', 'n'],
              description: 'Whether to save as draft (y) or publish (n)'
            }
          },
          required: ['id', 'title']
        }
      },
      {
        name: 'get_article',
        description: 'Get a specific article by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'The ID of the article to retrieve'
            },
            password: {
              type: 'string',
              description: 'Password for protected articles'
            }
          },
          required: ['id']
        }
      },
      {
        name: 'search_articles',
        description: 'Search articles by keyword, tag, or category',
        inputSchema: {
          type: 'object',
          properties: {
            keyword: {
              type: 'string',
              description: 'Search keyword for article titles'
            },
            tag: {
              type: 'string',
              description: 'Filter by tag'
            },
            sort_id: {
              type: 'number',
              description: 'Filter by category ID'
            },
            page: {
              type: 'number',
              description: 'Page number (default: 1)'
            },
            count: {
              type: 'number',
              description: 'Number of articles per page'
            },
            order: {
              type: 'string',
              enum: ['views', 'comnum'],
              description: 'Sort order: views (by view count) or comnum (by comment count)'
            }
          }
        }
      },
      {
        name: 'like_article',
        description: 'Like an article',
        inputSchema: {
          type: 'object',
          properties: {
            gid: {
              type: 'number',
              description: 'The ID of the article to like'
            },
            name: {
              type: 'string',
              description: 'Name of the person liking'
            },
            avatar: {
              type: 'string',
              description: 'Avatar URL of the person liking'
            }
          },
          required: ['gid']
        }
      },
      {
        name: 'add_comment',
        description: 'Add a comment to an article',
        inputSchema: {
          type: 'object',
          properties: {
            gid: {
              type: 'number',
              description: 'The ID of the article to comment on'
            },
            comname: {
              type: 'string',
              description: 'Name of the commenter'
            },
            comment: {
              type: 'string',
              description: 'The comment content'
            },
            commail: {
              type: 'string',
              description: 'Email of the commenter'
            },
            comurl: {
              type: 'string',
              description: 'Website URL of the commenter'
            },
            pid: {
              type: 'number',
              description: 'Parent comment ID for replies'
            }
          },
          required: ['gid', 'comname', 'comment']
        }
      },
      {
        name: 'get_comments',
        description: 'Get comments for an article',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'The ID of the article'
            },
            page: {
              type: 'number',
              description: 'Page number for paginated comments'
            }
          },
          required: ['id']
        }
      },
      {
        name: 'create_note',
        description: 'Create a new micro-note',
        inputSchema: {
          type: 'object',
          properties: {
            t: {
              type: 'string',
              description: 'The content of the micro-note'
            },
            private: {
              type: 'string',
              enum: ['y', 'n'],
              description: 'Whether the note is private (y) or public (n)'
            }
          },
          required: ['t']
        }
      },
      {
        name: 'upload_file',
        description: 'Upload a file (image, document, etc.)',
        inputSchema: {
          type: 'object',
          properties: {
            file_path: {
              type: 'string',
              description: 'Local path to the file to upload'
            },
            sid: {
              type: 'number',
              description: 'Resource category ID'
            }
          },
          required: ['file_path']
        }
      },
      {
        name: 'get_user_info',
        description: 'Get current user information',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error(`Missing arguments for tool: ${name}`);
  }

  try {
    switch (name) {
      case 'create_article': {
        const { title, content, excerpt, cover, sort_id, tags, draft, top, allow_remark } = args as {
          title: string;
          content: string;
          excerpt?: string;
          cover?: string;
          sort_id?: number;
          tags?: string;
          draft?: string;
          top?: string;
          allow_remark?: string;
        };

        const result = await emlogClient.createArticle({
             title,
             content,
             excerpt,
             cover,
             sort_id,
             tags,
             draft: draft as 'y' | 'n' | undefined,
             top: top as 'y' | 'n' | undefined,
             allow_remark: allow_remark as 'y' | 'n' | undefined
           });

         return {
            content: [{
              type: 'text',
              text: `Successfully created article: ${title} (ID: ${result.article_id || 'unknown'})`
            }]
          };
      }

      case 'update_article': {
        const { id, title, content, excerpt, cover, sort_id, tags, draft } = args as {
          id: number;
          title: string;
          content?: string;
          excerpt?: string;
          cover?: string;
          sort_id?: number;
          tags?: string;
          draft?: string;
        };

        const result = await emlogClient.updateArticle(id, {
             title,
             content,
             excerpt,
             cover,
             sort_id,
             tags,
             draft: draft as 'y' | 'n' | undefined
           });

         return {
           content: [{
             type: 'text',
             text: `Successfully updated article: ${title} (ID: ${id})`
           }]
         };
      }

      case 'get_article': {
         const { id, password } = args as { id: number; password?: string };
         const article = await emlogClient.getArticleDetail(id, password);

         return {
           content: [{
             type: 'text',
             text: `Article: ${article.title}\n\nContent: ${article.content}\n\nExcerpt: ${article.excerpt || 'N/A'}\nCategory: ${article.sort_id}\nTags: ${article.tags || 'N/A'}\nViews: ${article.views}\nComments: ${article.comnum}`
           }]
         };
       }

      case 'search_articles': {
         const { keyword, tag, sort_id, page, count, order } = args as {
           keyword?: string;
           tag?: string;
           sort_id?: number;
           page?: number;
           count?: number;
           order?: string;
         };

         const result = await emlogClient.getArticleList({
            keyword,
            tag,
            sort_id,
            page,
            count,
            order: order as 'views' | 'comnum' | undefined
          });

         const articles = result.articles;
         const articleList = articles.map((article: any) => 
           `- ${article.title} (ID: ${article.id}) - Views: ${article.views}, Comments: ${article.comnum}`
         ).join('\n');

         return {
           content: [{
             type: 'text',
             text: `Found ${articles.length} articles (Page ${result.page}/${result.total_pages}):\n\n${articleList || 'No articles found'}`
           }]
         };
       }

      case 'like_article': {
        const { gid, name, avatar } = args as {
          gid: number;
          name?: string;
          avatar?: string;
        };

        await emlogClient.likeArticle(gid, name, avatar);

        return {
          content: [{
            type: 'text',
            text: `Successfully liked article with ID: ${gid}`
          }]
        };
      }

      case 'add_comment': {
        const { gid, comname, comment, commail, comurl, pid } = args as {
          gid: number;
          comname: string;
          comment: string;
          commail?: string;
          comurl?: string;
          pid?: number;
        };

        const result = await emlogClient.addComment({
          gid,
          comname,
          comment,
          commail,
          comurl,
          pid
        });

        return {
          content: [{
            type: 'text',
            text: `Successfully added comment to article ${gid} by ${comname}`
          }]
        };
      }

      case 'get_comments': {
         const { id, page } = args as { id: number; page?: number };
         const result = await emlogClient.getCommentListSimple(id);
         const comments = result.comments;

         const commentList = comments.map((comment: any) => 
           `- ${comment.poster}: ${comment.comment} (${comment.date})`
         ).join('\n');

         return {
           content: [{
             type: 'text',
             text: `Comments for article ${id}:\n\n${commentList || 'No comments found'}`
           }]
         };
       }

      case 'create_note': {
        const { t, private: isPrivate } = args as {
          t: string;
          private?: string;
        };

        const result = await emlogClient.publishNote(t, isPrivate);

         return {
           content: [{
             type: 'text',
             text: `Successfully created micro-note: ${t.substring(0, 50)}${t.length > 50 ? '...' : ''}`
           }]
         };
      }

      case 'upload_file': {
        const { file_path, sid } = args as {
          file_path: string;
          sid?: number;
        };

        const result = await emlogClient.uploadFile(file_path, sid);

        return {
          content: [{
            type: 'text',
            text: `Successfully uploaded file: ${result.url}`
          }]
        };
      }

      case 'get_user_info': {
        const result = await emlogClient.getCurrentUser();
         const user = result.userinfo;

         return {
           content: [{
             type: 'text',
             text: `User: ${user.nickname}\nEmail: ${user.email}\nUID: ${user.uid}\nDescription: ${user.description || 'N/A'}`
           }]
         };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Emlog MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server failed to start:", error);
  process.exit(1);
});