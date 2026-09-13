import { BaseProvider } from './BaseProvider.js';

export class TrustpilotProvider extends BaseProvider {
  constructor() {
    super('trustpilot', 'Trustpilot', 'consumer_reviews');
  }

  hasApiKey() {
    return Boolean(process.env.TRUSTPILOT_API_KEY);
  }

  async fetchData(tool, listings = {}) {
    const listing = listings.trustpilot;
    const apiKey = process.env.TRUSTPILOT_API_KEY;

    // Only proceed if tool has a confirmed verified listing or an API key is available
    if (!listing?.url && !apiKey) {
      return null;
    }

    const domain = listing?.domain || tool.verifiedOfficialDomain || tool.officialDomain;
    const reviewUrl = listing?.url || (domain ? `https://www.trustpilot.com/review/${domain}` : null);

    if (!reviewUrl) {
      return null;
    }

    // If API Key is configured, attempt official Trustpilot API lookup
    if (apiKey && domain) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(`https://api.trustpilot.com/v1/business-units/find?name=${encodeURIComponent(domain)}`, {
          signal: controller.signal,
          headers: {
            'apikey': apiKey,
            'Accept': 'application/json'
          }
        });
        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          const rating = data?.score?.stars;
          const reviewCount = data?.numberOfReviews?.total;

          if (typeof rating === 'number') {
            return this.formatResult({
              sourceId: this.id,
              sourceName: this.name,
              sourceType: this.type,
              sourceUrl: reviewUrl,
              rating,
              ratingScale: 5,
              reviewCount,
              hasLiveRating: true,
              verificationMethod: 'Official Trustpilot API',
              note: `Live verified Trustpilot rating (${reviewCount || 0} reviews)`
            });
          }
        }
      } catch (err) {
        console.warn(`[TrustpilotProvider] Trustpilot API lookup failed for ${domain}:`, err.message);
      }
    }

    // Per Requirement 5: Do NOT scrape Trustpilot HTML.
    // Display verified outbound link to original review page without inventing ratings.
    return this.formatResult({
      sourceId: this.id,
      sourceName: this.name,
      sourceType: this.type,
      sourceUrl: reviewUrl,
      rating: null,
      ratingScale: 5,
      reviewCount: null,
      hasLiveRating: false,
      verificationMethod: 'Verified Platform Listing',
      note: 'Verified Trustpilot profile page. Direct link to customer feedback and trust ratings.'
    });
  }
}
