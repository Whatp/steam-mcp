import axios from 'axios';
import * as cheerio from 'cheerio';
import { SteamReview, SteamReviewOptions, SteamReviewResponse, SteamGame } from '../types/steam.js';

export class SteamService {
  private baseUrl = 'https://steamcommunity.com';
  private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  private axiosInstance: any;

  constructor() {
    // 创建axios实例，设置更好的配置
    this.axiosInstance = axios.create({
      timeout: 30000, // 增加超时时间到30秒
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      },
      maxRedirects: 5,
      validateStatus: (status) => status < 400
    });

    // 添加请求拦截器
    this.axiosInstance.interceptors.request.use((config: any) => {
      console.log(`正在请求: ${config.url}`);
      return config;
    });

    // 添加响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
          console.log('请求超时，尝试重试...');
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * 带重试的HTTP请求
   */
  private async makeRequest(url: string, retries = 3): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`尝试请求 (${i + 1}/${retries}): ${url}`);
        const response = await this.axiosInstance.get(url);
        return response;
      } catch (error: any) {
        console.log(`请求失败 (${i + 1}/${retries}): ${error.message}`);
        if (i === retries - 1) throw error;
        
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
      }
    }
  }

  /**
   * 获取游戏评论
   */
  async getGameReviews(options: SteamReviewOptions): Promise<SteamReviewResponse> {
    try {
      const url = `${this.baseUrl}/app/${options.appId}/reviews/`;
      const params = new URLSearchParams();
      
      if (options.language) params.append('l', options.language);
      if (options.filter) params.append('filter', options.filter);
      if (options.reviewType) params.append('review_type', options.reviewType);
      if (options.purchaseType) params.append('purchase_type', options.purchaseType);
      if (options.numPerPage) params.append('num_per_page', options.numPerPage.toString());
      if (options.offset) params.append('offset', options.offset.toString());

      const fullUrl = `${url}?${params.toString()}`;
      const response = await this.makeRequest(fullUrl);
      const $ = cheerio.load(response.data);
      
      const reviews: SteamReview[] = [];
      const reviewElements = $('.apphub_Card');

      reviewElements.each((_, element) => {
        const $review = $(element);
        
        const review: SteamReview = {
          id: $review.attr('data-gid') || '',
          author: $review.find('.apphub_CardContentAuthorName').text().trim(),
          authorId: $review.find('.apphub_CardContentAuthorName').attr('href')?.split('/').pop() || '',
          review: $review.find('.apphub_CardTextContent').text().trim(),
          rating: this.parseRating($review.find('.title.positive').length > 0, $review.find('.title.negative').length > 0),
          helpfulCount: parseInt($review.find('.found_helpful .found_helpful_yes').text().trim()) || 0,
          unhelpfulCount: parseInt($review.find('.found_helpful .found_helpful_no').text().trim()) || 0,
          date: $review.find('.date_posted').text().trim(),
          language: $review.find('.apphub_CardLanguage').text().trim() || 'English',
          playtime: this.parsePlaytime($review.find('.hours_played').text().trim()),
          isEarlyAccess: $review.find('.early_access_review').length > 0
        };

        if (review.author && review.review) {
          reviews.push(review);
        }
      });

      const totalCount = this.parseTotalCount($);
      const hasMore = this.checkHasMore($, options.offset || 0, options.numPerPage || 10);

      return {
        success: true,
        reviews,
        totalCount,
        hasMore
      };

    } catch (error) {
      console.error('获取Steam评论失败:', error);
      return {
        success: false,
        reviews: [],
        totalCount: 0,
        hasMore: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 搜索游戏
   */
  async searchGames(query: string): Promise<SteamGame[]> {
    try {
      const searchUrl = `${this.baseUrl}/search/`;
      const params = new URLSearchParams({
        q: query,
        category1: '998', // 游戏分类
        supportedlang: 'schinese', // 支持中文
        inlibrary: '0',
        sort_by: 'Relevance'
      });

      const fullUrl = `${searchUrl}?${params.toString()}`;
      const response = await this.makeRequest(fullUrl);
      const $ = cheerio.load(response.data);
      
      const games: SteamGame[] = [];
      const gameElements = $('.search_result_row');

      gameElements.each((_, element) => {
        const $game = $(element);
        const $title = $game.find('.search_name .title');
        
        const game: SteamGame = {
          id: $game.attr('data-ds-appid') || '',
          name: $title.text().trim(),
          appId: $game.attr('data-ds-appid') || '',
          url: $title.attr('href') || ''
        };

        if (game.name && game.appId) {
          games.push(game);
        }
      });

      return games;

    } catch (error) {
      console.error('搜索Steam游戏失败:', error);
      return [];
    }
  }

  /**
   * 获取游戏详情
   */
  async getGameDetails(appId: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/app/${appId}`;
      const response = await this.makeRequest(url);
      const $ = cheerio.load(response.data);
      
      return {
        name: $('.apphub_AppName').text().trim(),
        description: $('.game_description_snippet').text().trim(),
        price: $('.game_purchase_price').text().trim(),
        tags: $('.app_tag').map((_, el) => $(el).text().trim()).get(),
        releaseDate: $('.release_date .date').text().trim()
      };

    } catch (error) {
      console.error('获取游戏详情失败:', error);
      return null;
    }
  }

  private parseRating(hasPositive: boolean, hasNegative: boolean): 'positive' | 'negative' | 'mixed' {
    if (hasPositive && hasNegative) return 'mixed';
    if (hasPositive) return 'positive';
    return 'negative';
  }

  private parsePlaytime(playtimeText: string): number {
    const match = playtimeText.match(/(\d+(?:\.\d+)?)\s*hours?/i);
    return match ? parseFloat(match[1]) : 0;
  }

  private parseTotalCount($: cheerio.CheerioAPI): number {
    const totalText = $('.reviews_filter_options .reviews_filter_summary').text();
    const match = totalText.match(/共\s*(\d+)\s*条评论/);
    return match ? parseInt(match[1]) : 0;
  }

  private checkHasMore($: cheerio.CheerioAPI, offset: number, numPerPage: number): boolean {
    const totalCount = this.parseTotalCount($);
    return offset + numPerPage < totalCount;
  }
}
