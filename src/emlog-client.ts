import axios, { AxiosInstance } from 'axios';
import fs from 'fs';
import FormData from 'form-data';

// Emlog API 数据接口
export interface EmlogPost {
  id: number;
  title: string;
  content: string;
  content_raw?: string;
  excerpt?: string;
  excerpt_raw?: string;
  description?: string;
  description_raw?: string;
  cover?: string;
  url?: string;
  author_id: number;
  author_name: string;
  author_avatar?: string;
  sort_id: number;
  sort_name: string;
  views: number;
  comnum: number;
  like_count: number;
  date: string;
  tags: Array<{ name: string; url: string }>;
  top: 'y' | 'n';
  sortop: 'y' | 'n';
  need_pwd: 'y' | 'n';
  allow_remark?: 'y' | 'n';
  password?: string;
  link?: string;
  fields?: Record<string, any>;
  type?: string;
}

export interface EmlogCategory {
  sid: number;
  sortname: string;
  description: string;
  alias: string;
  lognum: number;
  taxis: number;
  pid: number;
  template: string;
  children?: EmlogCategory[];
}

export interface EmlogComment {
  cid: number;
  gid: number;
  pid: number;
  poster: string;
  avatar?: string;
  uid: number;
  comment: string;
  content?: string;
  mail: string;
  url: string;
  ip: string;
  agent?: string;
  date: string;
  hide: 'y' | 'n';
  top: 'y' | 'n';
  level?: number;
  children?: EmlogComment[];
}

export interface EmlogCommentStack {
  // 评论堆栈结构，用于处理评论的层级关系
  // 根据实际API返回结构定义
  [key: string]: any;
}

export interface EmlogTag {
  name: string;
  url: string;
}

export interface EmlogUser {
  uid: number;
  nickname: string;
  role: string;
  avatar: string;
  email?: string;
  description: string;
  ip?: string;
  create_time: number;
}

export interface EmlogNote {
  t: string;
  t_raw?: string;
  date: string;
  author_id: number;
  author_name: string;
  private?: 'y' | 'n';
}

export interface EmlogMedia {
  media_id: number;
  url: string;
  file_info: {
    file_name: string;
    mime_type: string;
    size: number;
    width?: number;
    height?: number;
    file_path: string;
    thum_file?: string;
  };
}

export interface EmlogLike {
  id: number;
  gid: number;
  poster: string;
  avatar?: string;
  uid: number;
  ip: string;
  agent: string;
  date: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  category_id?: number;
  tags?: string;
  status?: string;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  category_id?: number;
  tags?: string;
  status?: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export class EmlogClient {
  private api: AxiosInstance;
  private apiKey: string;
  private baseUrl: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // 移除末尾斜杠
    this.apiKey = apiKey;
    
    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'User-Agent': 'Emlog-MCP-Client/1.0'
      }
    });

    // 请求拦截器
    this.api.interceptors.request.use(
      (config) => {
        // 根据请求类型设置 Content-Type
        if (config.method === 'post' && !(config.data instanceof FormData)) {
          config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.api.interceptors.response.use(
      (response) => {
        if (response.data.code !== undefined && response.data.code !== 0) {
          throw new Error(response.data.msg || 'API request failed');
        }
        return response;
      },
      (error) => {
        if (error.response) {
          const errorMsg = error.response.data?.msg || error.response.statusText || error.message;
          throw new Error(`HTTP ${error.response.status}: ${errorMsg}`);
        }
        throw error;
      }
    );
  }

  // 构建查询参数
  private buildParams(params: Record<string, string | number | boolean | undefined> = {}): URLSearchParams {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    searchParams.append('api_key', this.apiKey);
    return searchParams;
  }

  // 构建表单数据
  private buildFormData(data: Record<string, string | number | boolean | string[] | undefined> = {}): URLSearchParams {
    const formData = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => formData.append(`${key}[]`, String(item)));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    formData.append('api_key', this.apiKey);
    return formData;
  }

  // ========== 文章相关接口 ==========
  
  // 获取文章列表
  async getArticleList(params: {
    page?: number;
    count?: number;
    sort_id?: number;
    keyword?: string;
    tag?: string;
    order?: 'views' | 'comnum';
  } = {}): Promise<{ articles: EmlogPost[]; page: number; total_pages: number; has_more: boolean }> {
    const queryParams = this.buildParams(params);
    const response = await this.api.get(`/?rest-api=article_list&${queryParams.toString()}`);
    return response.data.data;
  }

  // 获取文章详情
  async getArticleDetail(id: number, password?: string): Promise<EmlogPost> {
    const params: { id: number; password?: string } = { id };
    if (password) params.password = password;
    const queryParams = this.buildParams(params);
    const response = await this.api.get(`/?rest-api=article_detail&${queryParams.toString()}`);
    return response.data.data.article;
  }

  // 发布文章
  async createArticle(article: {
    title: string;
    content: string;
    excerpt?: string;
    cover?: string;
    author_uid?: number;
    sort_id?: number;
    tags?: string;
    draft?: 'y' | 'n';
    post_date?: string;
    top?: 'y' | 'n';
    sortop?: 'y' | 'n';
    allow_remark?: 'y' | 'n';
    password?: string;
    link?: string;
    field_keys?: string[];
    field_values?: string[];
    auto_cover?: 'y' | 'n';
  }): Promise<{ article_id: number }> {
    const formData = this.buildFormData(article);
    const response = await this.api.post('/?rest-api=article_post', formData);
    return response.data.data;
  }

  // 更新文章
  async updateArticle(id: number, article: {
    title: string;
    content?: string;
    excerpt?: string;
    cover?: string;
    author_uid?: number;
    sort_id?: number;
    tags?: string;
    draft?: 'y' | 'n';
    post_date?: string;
  }): Promise<void> {
    const formData = this.buildFormData({ id, ...article });
    const response = await this.api.post('/?rest-api=article_update', formData);
    return response.data.data;
  }

  // 文章点赞
  async likeArticle(gid: number, name?: string, avatar?: string): Promise<{ id: number }> {
    const formData = new URLSearchParams();
    formData.append('gid', String(gid));
    if (name) formData.append('name', name);
    if (avatar) formData.append('avatar', avatar);
    const response = await this.api.post('/index.php?action=addlike', formData);
    return response.data.data;
  }

  // 取消文章点赞
  async unlikeArticle(gid: number): Promise<void> {
    const formData = this.buildFormData({ gid });
    const response = await this.api.post('/index.php?action=unlike', formData);
    return response.data.data;
  }

  // 获取文章点赞列表
  async getArticleLikes(id?: number): Promise<{ likes: EmlogLike[] }> {
    const params = id ? { id } : {};
    const queryParams = this.buildParams(params);
    const response = await this.api.get(`/?rest-api=like_list&${queryParams.toString()}`);
    return response.data.data;
  }

  // ========== 草稿相关接口 ==========
  
  // 获取草稿列表
  async getDraftList(params: {
    count?: number;
  } = {}): Promise<{ drafts: EmlogPost[] }> {
    const queryParams = this.buildParams(params);
    const response = await this.api.get(`/?rest-api=draft_list&${queryParams.toString()}`);
    return response.data.data;
  }

  // 获取草稿详情
  async getDraftDetail(id: number): Promise<{ draft: EmlogPost }> {
    const queryParams = this.buildParams({ id });
    const response = await this.api.get(`/?rest-api=draft_detail&${queryParams.toString()}`);
    return response.data.data;
  }

  // ========== 分类相关接口 ==========
  
  // 获取分类列表
  async getSortList(): Promise<{ sorts: EmlogCategory[] }> {
    const queryParams = this.buildParams();
    const response = await this.api.get(`/?rest-api=sort_list&${queryParams.toString()}`);
    return response.data.data;
  }

  // ========== 评论相关接口 ==========
  
  // 获取评论列表
  async getCommentList(id: number, page?: number): Promise<{ comments: Record<string, EmlogComment>; commentStacks: EmlogCommentStack[]; commentPageUrl: string }> {
    const params: { id: number; page?: number } = { id };
    if (page) params.page = page;
    const queryParams = this.buildParams(params);
    const response = await this.api.get(`/?rest-api=comment_list&${queryParams.toString()}`);
    return response.data.data;
  }

  // 获取评论列表 v2
  async getCommentListSimple(id: number): Promise<{ comments: EmlogComment[] }> {
    const queryParams = this.buildParams({ id });
    const response = await this.api.get(`/?rest-api=comment_list_simple&${queryParams.toString()}`);
    return response.data.data;
  }

  // 发布评论
  async addComment(comment: {
    gid: number;
    comname: string;
    comment: string;
    commail?: string;
    comurl?: string;
    avatar?: string;
    imgcode?: string;
    pid?: number;
  }): Promise<{ cid: number }> {
    const formData = this.buildFormData({ ...comment, resp: 'json' });
    const response = await this.api.post('/index.php?action=addcom', formData);
    return response.data.data;
  }

  // 评论点赞
  async likeComment(cid: number): Promise<void> {
    const formData = this.buildFormData({ cid });
    const response = await this.api.post('/index.php?action=likecom', formData);
    return response.data.data;
  }

  // ========== 微语笔记相关接口 ==========
  
  // 发布微语笔记
  async publishNote(content: string, isPrivate?: string): Promise<{ note_id: number }> {
    const note = {
      t: content,
      private: isPrivate || 'n'
    };
    const formData = this.buildFormData(note);
    const response = await this.api.post('/?rest-api=note_post', formData);
    return response.data.data;
  }

  // 获取微语笔记列表
  async getNoteList(params: {
    page?: number;
    count?: number;
    author_uid?: number;
  } = {}): Promise<{ notes: EmlogNote[] }> {
    const queryParams = this.buildParams(params);
    const response = await this.api.get(`/?rest-api=note_list&${queryParams.toString()}`);
    return response.data.data;
  }

  // ========== 用户相关接口 ==========
  
  // 用户登录
  async login(username: string, password: string): Promise<{ userinfo: EmlogUser }> {
    const formData = this.buildFormData({ username, password });
    const response = await this.api.post('/index.php?action=login', formData);
    return response.data.data;
  }

  // 获取当前登录用户信息
  async getCurrentUser(): Promise<{ userinfo: EmlogUser }> {
    const queryParams = this.buildParams();
    const response = await this.api.get(`/?rest-api=userinfo&${queryParams.toString()}`);
    return response.data.data;
  }

  // 获取用户详情
  async getUserDetail(id: number): Promise<{ userinfo: EmlogUser }> {
    const queryParams = this.buildParams({ id });
    const response = await this.api.get(`/?rest-api=user_detail&${queryParams.toString()}`);
    return response.data.data;
  }

  // ========== 文件上传接口 ==========
  
  // 上传文件
  async uploadFile(filePath: string, sid?: number): Promise<EmlogMedia> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    
    if (sid) formData.append('sid', String(sid));
    formData.append('api_key', this.apiKey);
    
    const response = await this.api.post('/?rest-api=upload', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    return response.data.data;
  }
}