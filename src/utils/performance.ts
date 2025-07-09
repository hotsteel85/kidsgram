class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startTimer(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      
      this.metrics.get(name)!.push(duration);
      
      // 성능 로그 (개발 모드에서만)
      if (__DEV__) {
        console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
      }
    };
  }

  getAverageTime(name: string): number {
    const times = this.metrics.get(name);
    if (!times || times.length === 0) return 0;
    
    const sum = times.reduce((acc, time) => acc + time, 0);
    return sum / times.length;
  }

  getMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    
    for (const [name, times] of this.metrics.entries()) {
      result[name] = this.getAverageTime(name);
    }
    
    return result;
  }

  clear(): void {
    this.metrics.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor(); 