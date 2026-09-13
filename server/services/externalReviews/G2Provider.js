import { BaseProvider } from './BaseProvider.js';

export class G2Provider extends BaseProvider {
  constructor() {
    super('g2', 'G2', 'business_software_reviews');
  }

  hasApiKey() {
    return Boolean(process.env.G2_API_KEY);
  }

  async fetchData(tool, listings = {}) {
    const listing = listings.g2;
    if (!listing?.url) {
      return null;
    }

    const apiKey = process.env.G2_API_KEY;

    // If API Key is configured, attempt G2 partner API query
    if (apiKey && listing.productSlug) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(`https://data.g2.com/api/v1/products/${listing.productSlug}`, {
          signal: controller.signal,
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json'
          }
        });
        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          const rating = data?.data?.attributes?.star_rating;
          const reviewCount = data?.data?.attributes?.reviews_count;

          if (typeof rating === 'number') {
            return this.formatResult({
              sourceId: this.id,
              sourceName: this.name,
              sourceType: this.type,
              sourceUrl: listing.url,
              rating,
              ratingScale: 5,
              reviewCount,
              hasLiveRating: true,
              verificationMethod: 'Official G2 API',
              note: `Verified rating from ${reviewCount || 0} G2 business software reviews`
            });
          }
        }
      } catch (err) {
        console.warn(`[G2Provider] G2 API lookup failed for ${listing.productSlug}:`, err.message);
      }
    }

    // Per Requirement 5: When API is not available, DO NOT SCRAPE.
    // Display verified outbound link to original review page without inventing ratings.
    return this.formatResult({
      sourceId: this.id,
      sourceName: this.name,
      sourceType: this.type,
      sourceUrl: listing.url,
      rating: null,
      ratingScale: 5,
      reviewCount: null,
      hasLiveRating: false,
      verificationMethod: 'Verified Platform Listing',
      note: 'Verified G2 product listing. Direct link to user reviews and ratings.'
    });
  }
}
