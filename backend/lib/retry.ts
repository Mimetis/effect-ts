type RetryOptions = {
  retries: number;
  delayMs: number;
};

// Retries `fn` with an exponential backoff: delayMs, delayMs * 2, delayMs * 4…
export async function retry<T>(fn: () => Promise<T>, { retries, delayMs }: RetryOptions): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= retries) throw error;
      const wait = delayMs * 2 ** attempt;
      console.warn(`Retry ${attempt + 1}/${retries} in ${wait} ms:`, error instanceof Error ? error.message : error);
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }
}
