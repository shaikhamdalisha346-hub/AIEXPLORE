import { BaseProvider } from './BaseProvider.js';

export class GooglePlayStoreProvider extends BaseProvider {
  constructor() {
    super('google_play', 'Google Play', 'mobile_app_store');
  }

  hasApiKey() {
    return false;
  }

  async fetchData(tool, listings = {}) {
    const customConfig = listings.google_play;
    const playUrl = customConfig?.url || tool.officialAndroidUrl || tool.androidUrl;

    if (!playUrl) {
      return null;
    }

    // Requirement 5: Do NOT scrape Google Play HTML.
    // Display verified direct link to official store page without inventing ratings.
    return this.formatResult({
      sourceId: this.id,
      sourceName: this.name,
      sourceType: this.type,
      sourceUrl: playUrl,
      rating: null,
      ratingScale: 5,
      reviewCount: null,
      hasLiveRating: false,
      verificationMethod: 'Verified Store Listing Link',
      note: 'Official Google Play listing. Visit page directly to read verified Android user reviews.'
    });
  }
}
