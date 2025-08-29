import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

const STEAM_API_BASE = "https://store.steampowered.com/";
const USER_AGENT = "steam-mcp/1.0";

// 代理配置
const PROXY_URL = process.env.HTTP_PROXY || process.env.HTTPS_PROXY || 'http://127.0.0.1:7890';
const agent = new HttpsProxyAgent(PROXY_URL);

// 配置axios使用代理
const axiosInstance = axios.create({
  httpsAgent: agent,
  timeout: 30000,
  headers: {
    'User-Agent': USER_AGENT
  }
});

// 清理评论文本的辅助函数
function cleanReviewText(text: string): string {
  if (!text) return "";
  
  // 移除HTML标签
  let cleanText = text.replace(/<\/?[^>]+(>|$)/g, "");
  
  // 解码常见HTML实体
  cleanText = cleanText.replace(/&amp;/g, "&")
                       .replace(/&lt;/g, "<")
                       .replace(/&gt;/g, ">")
                       .replace(/&quot;/g, "")
                       .replace(/&#39;/g, "")
                       .replace(/&nbsp;/g, " ");
  
  // 处理换行符和其他控制字符
  cleanText = cleanText.replace(/\r\n/g, "\\n")
                       .replace(/\n/g, "\\n")
                       .replace(/\r/g, "\\n");
  
  // 移除引号
  cleanText = cleanText.replace(/["']/g, "");
  
  // 将多个空格替换为单个空格
  cleanText = cleanText.replace(/\s+/g, " ");
  
  // 修剪多余空格
  return cleanText.trim();
}

export class SteamMCP {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'steam-mcp',
        version: '1.0.0',
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // 获取Steam游戏评论工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_steam_review',
            description: '获取Steam游戏的评论和游戏信息。返回格式化的评论数据，包括评论分数、正面/负面数量、评论文本和基本游戏信息。',
            inputSchema: {
              type: 'object',
              properties: {
                appid: {
                  type: 'string',
                  description: 'Steam应用ID',
                },
                filter: {
                  type: 'string',
                  description: 'recent: 按创建时间排序, updated: 按最后更新时间排序, all: (默认) 按有用性排序',
                  enum: ['recent', 'updated', 'all'],
                  default: 'all'
                },
                language: {
                  type: 'string',
                  description: '语言过滤器 (例如: english, french, schinese)。默认为所有语言。',
                  enum: [
                    'all', 'arabic', 'bulgarian', 'schinese', 'tchinese', 'czech', 'danish', 
                    'dutch', 'english', 'finnish', 'french', 'german', 'greek', 'hungarian', 
                    'indonesian', 'italian', 'japanese', 'koreana', 'norwegian', 'polish', 
                    'portuguese', 'brazilian', 'romanian', 'russian', 'spanish', 'latam', 
                    'swedish', 'thai', 'turkish', 'ukrainian', 'vietnamese'
                  ],
                  default: 'all'
                },
                day_range: {
                  type: 'number',
                  description: '从现在到n天前查找有用评论的范围。仅适用于all过滤器。',
                  default: 365
                },
                cursor: {
                  type: 'string',
                  description: '评论以20个为一批返回，所以第一次传递*，然后传递响应中返回的cursor值用于下一批，等等。',
                  default: '*'
                },
                review_type: {
                  type: 'string',
                  description: 'all: 所有评论 (默认), positive: 仅正面评论, negative: 仅负面评论',
                  enum: ['all', 'positive', 'negative'],
                  default: 'all'
                },
                purchase_type: {
                  type: 'string',
                  description: 'all: 所有评论, non_steam_purchase: 未在Steam上付费购买产品的用户撰写的评论, steam: 在Steam上付费购买产品的用户撰写的评论 (默认)',
                  enum: ['all', 'non_steam_purchase', 'steam'],
                  default: 'steam'
                },
                num_per_page: {
                  type: 'number',
                  description: '要获取的评论数量，最大100，默认50',
                  default: 50,
                  minimum: 1,
                  maximum: 100
                },
              },
              required: ['appid'],
            },
          },
          {
            name: 'search_steam_game',
            description: '搜索Steam游戏并返回游戏列表',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: '搜索关键词',
                },
                category: {
                  type: 'string',
                  description: '游戏分类',
                  default: 'games'
                },
                supportedlang: {
                  type: 'string',
                  description: '支持的语言',
                  default: 'schinese'
                }
              },
              required: ['query'],
            },
          },
        ],
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        if (!args) {
          throw new Error('缺少参数');
        }

        switch (name) {
          case 'get_steam_review':
            return await this.getSteamReview(args);

          case 'search_steam_game':
            return await this.searchSteamGame(args);

          default:
            throw new Error(`未知工具: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `错误: ${error instanceof Error ? error.message : '未知错误'}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async getSteamReview(args: any) {
    try {
      const appid = String(args.appid);
      const filter = args.filter || 'all';
      const language = args.language || 'all';
      const day_range = args.day_range || 365;
      const cursor = args.cursor || '*';
      const review_type = args.review_type || 'all';
      const purchase_type = args.purchase_type || 'steam';
      const num_per_page = args.num_per_page || 50;

      // 获取游戏评论
      const reviewsUrl = new URL(`appreviews/${appid}`, STEAM_API_BASE);
      reviewsUrl.searchParams.append("json", "1");
      reviewsUrl.searchParams.append("filter", filter);
      reviewsUrl.searchParams.append("language", language);
      reviewsUrl.searchParams.append("day_range", day_range.toString());
      reviewsUrl.searchParams.append("cursor", cursor);
      reviewsUrl.searchParams.append("review_type", review_type);
      reviewsUrl.searchParams.append("purchase_type", purchase_type);
      reviewsUrl.searchParams.append("num_per_page", num_per_page.toString());
      
      const reviewsResponse = await axiosInstance.get(reviewsUrl.toString());
      
      if (reviewsResponse.status !== 200) {
        throw new Error(`获取评论失败: ${reviewsResponse.statusText}`);
      }
      
      const reviewsData = reviewsResponse.data;
      
      // 提取评论信息
      const game_reviews = {
        success: reviewsData.success,
        review_score: reviewsData.query_summary?.review_score,
        review_score_desc: reviewsData.query_summary?.review_score_desc,
        total_positive: reviewsData.query_summary?.total_positive,
        total_negative: reviewsData.query_summary?.total_negative,
        reviews: reviewsData.reviews ? reviewsData.reviews.map((review: any) => cleanReviewText(review.review)) : []
      };
      
      // 获取游戏信息
      const infoUrl = new URL("api/appdetails", STEAM_API_BASE);
      infoUrl.searchParams.append("appids", appid);
      
      const infoResponse = await axiosInstance.get(infoUrl.toString());
      
      if (infoResponse.status !== 200) {
        throw new Error(`获取游戏信息失败: ${infoResponse.statusText}`);
      }
      
      const infoData = infoResponse.data;
      
      // 提取游戏信息
      const game_info = {
        name: infoData[appid]?.data?.name,
        detailed_description: infoData[appid]?.data?.detailed_description
      };
      
      // 格式化JSON数据
      const formattedJsonData = JSON.stringify({ game_reviews, game_info }, null, 2);
      
      return {
        content: [
          {
            type: "text",
            text: formattedJsonData
          }
        ]
      };
    } catch (error) {
      console.error('获取Steam评论失败:', error);
      throw error;
    }
  }

  private async searchSteamGame(args: any) {
    try {
      const query = String(args.query);
      const category = args.category || 'games';
      const supportedlang = args.supportedlang || 'schinese';

      // 构建搜索URL
      const searchUrl = new URL("search/", STEAM_API_BASE);
      searchUrl.searchParams.append("term", query);
      searchUrl.searchParams.append("category", category);
      searchUrl.searchParams.append("supportedlang", supportedlang);
      searchUrl.searchParams.append("inlibrary", "0");
      searchUrl.searchParams.append("sort_by", "Relevance");
      
      const response = await axiosInstance.get(searchUrl.toString());
      
      if (response.status !== 200) {
        throw new Error(`搜索失败: ${response.statusText}`);
      }
      
      const html = response.data;
      
      // 简单的HTML解析来提取游戏信息
      const games: any[] = [];
      const gameMatches = html.match(/data-ds-appid="(\d+)"[^>]*>[\s\S]*?<div[^>]*class="[^"]*search_name[^"]*"[^>]*>[\s\S]*?<span[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/span>/g);
      
      if (gameMatches) {
        gameMatches.forEach((match: string) => {
          const appIdMatch = match.match(/data-ds-appid="(\d+)"/);
          const titleMatch = match.match(/<span[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/span>/);
          
          if (appIdMatch && titleMatch) {
            games.push({
              appid: appIdMatch[1],
              name: titleMatch[1].trim()
            });
          }
        });
      }
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ games, query }, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('搜索Steam游戏失败:', error);
      throw error;
    }
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Steam MCP 服务器已启动');
  }
}
