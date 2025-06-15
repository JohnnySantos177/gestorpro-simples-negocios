
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorHandler?: (error: Error) => void
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      if (errorHandler) {
        errorHandler(errorObj);
      } else {
        console.error('Async operation failed:', errorObj);
      }
      
      return null;
    }
  };
};

export const withRetry = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  maxRetries: number = 3,
  delay: number = 1000
) => {
  return async (...args: T): Promise<R> => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
      }
    }
    
    throw lastError!;
  };
};

export const timeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
    )
  ]);
};
