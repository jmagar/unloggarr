interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private completedMetrics: PerformanceMetric[] = [];
  private maxStoredMetrics = 1000;

  // Start tracking a performance metric
  start(name: string, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata
    };
    
    this.metrics.set(name, metric);
    console.log(`⏱️ Started tracking: ${name}`);
  }

  // End tracking and calculate duration
  end(name: string, additionalMetadata?: Record<string, any>): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`⚠️ No metric found for: ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    
    const completedMetric: PerformanceMetric = {
      ...metric,
      endTime,
      duration,
      metadata: { ...metric.metadata, ...additionalMetadata }
    };

    // Store completed metric
    this.completedMetrics.push(completedMetric);
    this.metrics.delete(name);

    // Cleanup old metrics to prevent memory bloat
    if (this.completedMetrics.length > this.maxStoredMetrics) {
      this.completedMetrics.splice(0, this.completedMetrics.length - this.maxStoredMetrics);
    }

    console.log(`✅ Completed tracking: ${name} (${duration.toFixed(2)}ms)`);
    return duration;
  }

  // Get metrics for a specific operation
  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.completedMetrics.filter(metric => metric.name === name);
    }
    return [...this.completedMetrics];
  }

  // Get performance statistics
  getStats(name?: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    total: number;
  } | null {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return null;

    const durations = metrics.map(m => m.duration!).filter(d => d !== undefined);
    if (durations.length === 0) return null;

    return {
      count: durations.length,
      average: durations.reduce((a, b) => a + b, 0) / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      total: durations.reduce((a, b) => a + b, 0)
    };
  }

  // Clear all metrics
  clear(): void {
    this.metrics.clear();
    this.completedMetrics.length = 0;
    console.log('🧹 Performance metrics cleared');
  }

  // Get memory usage (if available)
  getMemoryUsage(): {
    used: number;
    total: number;
    percentage: number;
  } | null {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100)
      };
    }
    return null;
  }

  // Log performance summary
  logSummary(): void {
    console.log('📊 Performance Summary:');
    
    const uniqueNames = [...new Set(this.completedMetrics.map(m => m.name))];
    uniqueNames.forEach(name => {
      const stats = this.getStats(name);
      if (stats) {
        console.log(`  ${name}: ${stats.count} calls, avg ${stats.average.toFixed(2)}ms, min ${stats.min.toFixed(2)}ms, max ${stats.max.toFixed(2)}ms`);
      }
    });

    const memory = this.getMemoryUsage();
    if (memory) {
      console.log(`  Memory: ${(memory.used / 1024 / 1024).toFixed(2)}MB used (${memory.percentage}%)`);
    }
  }
}

// Create global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Wrapper function to time async operations
export async function timeAsync<T>(
  name: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  performanceMonitor.start(name, metadata);
  
  try {
    const result = await operation();
    performanceMonitor.end(name, { success: true });
    return result;
  } catch (error) {
    performanceMonitor.end(name, { success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
}

// Wrapper function to time sync operations
export function timeSync<T>(
  name: string,
  operation: () => T,
  metadata?: Record<string, any>
): T {
  performanceMonitor.start(name, metadata);
  
  try {
    const result = operation();
    performanceMonitor.end(name, { success: true });
    return result;
  } catch (error) {
    performanceMonitor.end(name, { success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
}

// Log performance summary every 5 minutes in browser environment
if (typeof window !== 'undefined') {
  setInterval(() => {
    performanceMonitor.logSummary();
  }, 5 * 60 * 1000);
}