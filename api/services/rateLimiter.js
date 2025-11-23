// rateLimiter.js - Replicate API rate limiting 처리

class RateLimiter {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.lastRequestTime = 0;
    this.minInterval = 10000; // 10초 간격 (6 requests/min = 1 request/10sec)
  }

  async addToQueue(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      if (timeSinceLastRequest < this.minInterval) {
        const waitTime = this.minInterval - timeSinceLastRequest;
        console.log(`⏳ Rate limit: waiting ${waitTime}ms before next request...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      const { fn, resolve, reject } = this.queue.shift();
      this.lastRequestTime = Date.now();
      
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        // 429 에러인 경우 재시도
        if (error.status === 429) {
          const retryAfter = (error.retry_after || 10) * 1000;
          console.log(`⚠️ Rate limited. Retrying after ${retryAfter}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter));
          
          // 다시 큐에 추가
          this.queue.unshift({ fn, resolve, reject });
        } else {
          reject(error);
        }
      }
    }
    
    this.processing = false;
  }
}

const rateLimiter = new RateLimiter();

module.exports = { rateLimiter };
