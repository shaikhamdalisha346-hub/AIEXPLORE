import { BaseProvider } from './BaseProvider.js';

export class ProductHuntProvider extends BaseProvider {
  constructor() {
    super('product_hunt', 'Product Hunt', 'product_launch');
  }

  hasApiKey() {
    return Boolean(process.env.PRODUCT_HUNT_API_TOKEN);
  }

  async fetchData(tool, listings = {}) {
    const listing = listings.product_hunt;
    const token = process.env.PRODUCT_HUNT_API_TOKEN;

    // Only proceed if tool has a confirmed verified listing or an API token is available
    if (!listing?.url && !token) {
      return null;
    }

    const reviewUrl = listing?.url || (listing?.productSlug ? `https://www.producthunt.com/products/${listing.productSlug}` : null);

    if (!reviewUrl) {
      return null;
    }

    // If Developer Token is configured, attempt Product Hunt GraphQL API query
    if (token && listing?.productSlug) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const query = `
          query {
            product(slug: "${listing.productSlug}") {
              name
              reviewsRating
              reviewsCount
              url
            }
          }
        `;

        const response = await fetch('https://api.producthunt.com/v2/api/graphql', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ query })
        });
        clearTimeout(timeout);

        if (response.ok) {
          const resJson = await response.json();
          const prod = resJson?.data?.product;
          if (prod && typeof prod.reviewsRating === 'number') {
            return this.formatResult({
              sourceId: this.id,
              sourceName: this.name,
              sourceType: this.type,
              sourceUrl: prod.url || reviewUrl,
              rating: prod.reviewsRating,
              ratingScale: 5,
              reviewCount: prod.reviewsCount,
              hasLiveRating: true,
              verificationMethod: 'Official Product Hunt GraphQL API',
              note: `Live rating from ${prod.reviewsCount || 0} Product Hunt reviews`
            });
          }
        }
      } catch (err) {
        console.warn(`[ProductHuntProvider] Product Hunt API lookup failed:`, err.message);
      }
    }

    // Per Requirement 5: Do NOT scrape Product Hunt HTML.
    // Display verified outbound link to original Product Hunt page without inventing ratings.
    return this.formatResult({
      sourceId: this.id,
      sourceName: this.name,
      sourceType: this.type,
      sourceUrl: listing?.url || reviewUrl,
      rating: null,
      ratingScale: 5,
      reviewCount: null,
      hasLiveRating: false,
      verificationMethod: 'Verified Platform Listing',
      note: 'Verified Product Hunt page. Direct link to community reviews and upvotes.'
    });
  }
}
