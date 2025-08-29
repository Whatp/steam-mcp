import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { SteamService } from '../services/steamService.js';
import { SteamReviewOptions } from '../types/steam.js';

export class SteamMCP {
  private server: Server;
  private steamService: SteamService;

  constructor() {
    this.steamService = new SteamService();
    this.server = new Server(
      {
        name: 'steam-mcp',
        version: '1.0.0',
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // 获取游戏评论工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_steam_reviews',
            description: '获取Steam游戏的用户评论',
            inputSchema: {
              type: 'object',
              properties: {
                appId: {
                  type: 'string',
                  description: 'Steam游戏的App ID',
                },
                language: {
                  type: 'string',
                  description: '评论语言 (可选，默认: schinese)',
                  enum: ['schinese', 'tchinese', 'english', 'japanese', 'korean'],
                },
                filter: {
                  type: 'string',
                  description: '评论筛选 (可选，默认: all)',
                  enum: ['all', 'recent', 'updated'],
                },
                reviewType: {
                  type: 'string',
                  description: '评论类型 (可选，默认: all)',
                  enum: ['all', 'positive', 'negative'],
                },
                purchaseType: {
                  type: 'string',
                  description: '购买类型 (可选，默认: all)',
                  enum: ['all', 'non_steam_purchase', 'steam'],
                },
                numPerPage: {
                  type: 'number',
                  description: '每页评论数量 (可选，默认: 10)',
                  minimum: 1,
                  maximum: 50,
                },
                offset: {
                  type: 'number',
                  description: '评论偏移量 (可选，默认: 0)',
                  minimum: 0,
                },
              },
              required: ['appId'],
            },
          },
          {
            name: 'search_steam_games',
            description: '搜索Steam游戏',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: '搜索关键词',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'get_steam_game_details',
            description: '获取Steam游戏详细信息',
            inputSchema: {
              type: 'object',
              properties: {
                appId: {
                  type: 'string',
                  description: 'Steam游戏的App ID',
                },
              },
              required: ['appId'],
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
          case 'get_steam_reviews':
            const reviewOptions: SteamReviewOptions = {
              appId: String(args.appId),
              language: args.language ? String(args.language) : 'schinese',
              filter: args.filter ? String(args.filter) as 'all' | 'recent' | 'updated' : 'all',
              reviewType: args.reviewType ? String(args.reviewType) as 'all' | 'positive' | 'negative' : 'all',
              purchaseType: args.purchaseType ? String(args.purchaseType) as 'all' | 'non_steam_purchase' | 'steam' : 'all',
              numPerPage: args.numPerPage ? Number(args.numPerPage) : 10,
              offset: args.offset ? Number(args.offset) : 0,
            };

            const reviews = await this.steamService.getGameReviews(reviewOptions);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(reviews, null, 2),
                },
              ],
            };

          case 'search_steam_games':
            const games = await this.steamService.searchGames(String(args.query));
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(games, null, 2),
                },
              ],
            };

          case 'get_steam_game_details':
            const gameDetails = await this.steamService.getGameDetails(String(args.appId));
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(gameDetails, null, 2),
                },
              ],
            };

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

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Steam MCP 服务器已启动');
  }
}
