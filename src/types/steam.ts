export interface SteamReview {
  id: string;
  author: string;
  authorId: string;
  review: string;
  rating: 'positive' | 'negative' | 'mixed';
  helpfulCount: number;
  unhelpfulCount: number;
  date: string;
  language: string;
  playtime: number;
  isEarlyAccess: boolean;
}

export interface SteamGame {
  id: string;
  name: string;
  appId: string;
  url: string;
}

export interface SteamReviewOptions {
  appId: string;
  language?: string;
  filter?: 'all' | 'recent' | 'updated';
  reviewType?: 'all' | 'positive' | 'negative';
  purchaseType?: 'all' | 'non_steam_purchase' | 'steam';
  numPerPage?: number;
  offset?: number;
}

export interface SteamReviewResponse {
  success: boolean;
  reviews: SteamReview[];
  totalCount: number;
  hasMore: boolean;
  error?: string;
}
