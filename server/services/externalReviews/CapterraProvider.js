import { BaseProvider } from './BaseProvider.js';

export class CapterraProvider extends BaseProvider {
  constructor() {
    super('capterra', 'Capterra', 'business_software_reviews');
  }

  hasApiKey() {
    return Boolean(process.env.CAPTERRA_API_KEY);
  }

  async fetchData(tool, listings = {}) {
    const listing = listings.capterra;
    if (!listing?.url) {
      return null;
    }

    // Per Requirement 5: Do NOT scrape Capterra.
    // Display verified direct link to official Capterra review page without inventing ratings.
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
      note: 'Verified Capterra review profile. Direct link to user reviews and ratings.'
    });
  }
}
