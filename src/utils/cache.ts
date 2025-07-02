interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class RequestCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 1000; // Maximum number of cached entries

  // Generate cache key from URL and parameters
  private generateKey(url: string, params?: any): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${url}:${paramsStr}`;
  }

  // Get cached data if valid
  get<T>(url: string, params?: any): T | null {
    const key = this.generateKey(url, params);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if cache entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    console.log(`📋 Cache hit for ${url}`);
    return entry.data;
  }

  // Set cache data with TTL (time to live in milliseconds)
  set<T>(url: string, data: T, ttl: number = 60000, params?: any): void {
    const key = this.generateKey(url, params);
    
    // Cleanup old entries if cache is getting too large
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    
    console.log(`💾 Cached response for ${url} (TTL: ${ttl}ms)`);
  }

  // Clear cache entries
  clear(): void {
    this.cache.clear();
    console.log('🧹 Cache cleared');
  }

  // Clear expired entries
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired cache entries`);
    }
  }

  // Get cache statistics
  getStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize
    };
  }
}

// Create global cache instance
export const requestCache = new RequestCache();

// Auto-cleanup expired entries every 5 minutes
setInterval(() => {
  requestCache.cleanup();
}, 5 * 60 * 1000);

// Cached fetch wrapper
export async function cachedFetch<T>(
  url: string, 
  options?: RequestInit,
  ttl: number = 60000, // 1 minute default
  cacheKey?: string
): Promise<T> {
  const key = cacheKey || url;
  const params = options?.body ? JSON.parse(options.body as string) : undefined;
  
  // Try to get from cache first
  const cached = requestCache.get<T>(key, params);
  if (cached !== null) {
    return cached;
  }
  
  // Make the actual request
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Cache the response
  requestCache.set(key, data, ttl, params);
  
  return data;
}

// Debounced function utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}