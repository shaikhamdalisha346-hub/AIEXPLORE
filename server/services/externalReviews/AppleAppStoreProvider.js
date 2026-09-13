import { BaseProvider } from './BaseProvider.js';

// 1-Hour in-memory cache for Apple App Store lookups to prevent rate limiting
const cache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000;

export class AppleAppStoreProvider extends BaseProvider {
  constructor() {
    super('apple_app_store', 'Apple App Store', 'mobile_app_store');
  }

  hasApiKey() {
    // Official iTunes Lookup API is open and public, no key required
    return true;
  }

  extractTrackId(url) {
    if (!url || typeof url !== 'string') return null;
    const match = url.match(/id(\d+)/i);
    return match ? match[1] : null;
  }

  async fetchData(tool, listings = {}) {
    const customConfig = listings.apple_app_store;
    const rawUrl = customConfig?.url || tool.officialIosUrl || tool.iosUrl;
    const trackId = customConfig?.trackId || this.extractTrackId(rawUrl);

    if (!trackId && !rawUrl) {
      return null;
    }

    // Check cache
    const cacheKey = `itunes_${trackId || rawUrl}`;
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return cached.data;
    }

    if (trackId) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(`https://itunes.apple.com/lookup?id=${trackId}`, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.results) && data.results.length > 0) {
            const app = data.results[0];
            const liveRating = typeof app.averageUserRating === 'number' ? app.averageUserRating : null;
            const reviewCount = typeof app.userRatingCount === 'number' ? app.userRatingCount : null;
            const liveUrl = app.trackViewUrl || rawUrl;

            const result = this.formatResult({
              sourceId: this.id,
              sourceName: this.name,
              sourceType: this.type,
              sourceUrl: liveUrl,
              rating: liveRating,
              ratingScale: 5,
              reviewCount,
              hasLiveRating: liveRating !== null,
              verificationMethod: 'Official Apple iTunes Lookup API',
              note: reviewCount ? `Live verified rating from ${reviewCount.toLocaleString()} iOS users` : 'Live verified Apple App Store rating'
            });

            cache.set(cacheKey, { timestamp: Date.now(), data: result });
            return result;
          }
        }
      } catch (err) {
        console.warn(`[AppleAppStoreProvider] iTunes API lookup failed for trackId ${trackId}:`, err.message);
      }
    }

    // Fallback: If network lookup fails or only raw URL available, return verified link without fake rating
    if (rawUrl) {
      const fallbackResult = this.formatResult({
        sourceId: this.id,
        sourceName: this.name,
        sourceType: this.type,
        sourceUrl: rawUrl,
        rating: null,
        reviewCount: null,
        hasLiveRating: false,
        verificationMethod: 'Verified Store Listing Link',
        note: 'Official App Store listing. Visit page directly to view ratings.'
      });
      return fallbackResult;
    }

    return null;
  }
}
