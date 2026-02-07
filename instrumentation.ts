// Next.js Instrumentation - runs on server startup
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register() {
  // Only run on server side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🚀 Server starting up...');
    
    // Import cache warmer dynamically to avoid client-side issues
    const { warmCaches } = await import('./lib/cache-warmer');
    
    // Warm caches in the background (don't block startup)
    warmCaches().then(() => {
      console.log('✅ Cache warming complete');
    }).catch((error) => {
      console.error('⚠️ Cache warming failed:', error);
    });
    
    console.log('📊 Connection pooling: connection_limit=20, pool_timeout=30');
  }
}
