export type DateString = string; // ISO 8601 date string

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}
