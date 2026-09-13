/**
 * Base Provider for External Review Sources
 * Standardizes source metadata, rating retrieval, and verified outbound URLs.
 */
export class BaseProvider {
  constructor(id, name, type) {
    this.id = id;
    this.name = name;
    this.type = type; // 'app_store' | 'b2b_software' | 'consumer_reviews' | 'product_launch'
  }

  /**
   * Check if this provider has configured API credentials in process.env
   * @returns {boolean}
   */
  hasApiKey() {
    return false;
  }

  /**
   * Fetch review or listing data for a given tool
   * @param {Object} tool - Tool record from catalog
   * @param {Object} listings - Verified listings config for tool
   * @returns {Promise<Object|null>} - Standardized external review source object or null if unavailable
   */
  async fetchData(tool, listings = {}) {
    throw new Error('fetchData() must be implemented by subclass');
  }

  /**
   * Standardized output format
   */
  formatResult({
    sourceId,
    sourceName,
    sourceType,
    sourceUrl,
    rating = null,
    ratingScale = 5,
    reviewCount = null,
    hasLiveRating = false,
    verificationMethod = 'verified_listing_page',
    note = null
  }) {
    return {
      id: `ext_${sourceId}_${Date.now()}`,
      sourceId,
      sourceName,
      sourceType,
      sourceUrl,
      rating: typeof rating === 'number' ? Number(rating.toFixed(1)) : null,
      ratingScale,
      reviewCount: typeof reviewCount === 'number' ? Math.round(reviewCount) : null,
      hasLiveRating,
      verificationMethod,
      note: note || (hasLiveRating 
        ? 'Real user rating from official public API'
        : 'Direct link to official third-party review page. Ratings require direct platform access.'),
      lastVerified: new Date().toISOString().slice(0, 10),
      status: 'active'
    };
  }
}
