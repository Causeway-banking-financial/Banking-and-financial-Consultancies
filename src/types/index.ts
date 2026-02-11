export type Locale = 'en' | 'ar';

export interface PageBlock {
  id: string;
  type: 'hero' | 'text' | 'cards' | 'cta' | 'stats' | 'image' | 'faq' | 'team';
  data: Record<string, any>;
}

export interface ResourceFilters {
  search?: string;
  category?: string;
  type?: string;
  sort?: 'latest' | 'oldest' | 'title';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CompletionIndicator {
  field: string;
  labelEn: string;
  labelAr: string;
  complete: boolean;
}

export interface HealthStatus {
  database: boolean;
  storage: boolean;
  brokenLinks: number;
  missingTranslations: number;
  draftCount: number;
  lastCheckAt: string;
}
