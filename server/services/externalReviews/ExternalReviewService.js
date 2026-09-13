import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../../db/database.js';
import { externalReviewDb } from '../../db/externalReviewDatabase.js';
import { AppleAppStoreProvider } from './AppleAppStoreProvider.js';
import { GooglePlayStoreProvider } from './GooglePlayStoreProvider.js';
import { G2Provider } from './G2Provider.js';
import { CapterraProvider } from './CapterraProvider.js';
import { TrustpilotProvider } from './TrustpilotProvider.js';
import { ProductHuntProvider } from './ProductHuntProvider.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LISTINGS_FILE = path.join(__dirname, '../../data/toolExternalListings.json');

class ExternalReviewService {
  constructor() {
    this.providers = [
      new AppleAppStoreProvider(),
      new GooglePlayStoreProvider(),
      new G2Provider(),
      new CapterraProvider(),
      new TrustpilotProvider(),
      new ProductHuntProvider()
    ];
    this.listings = {};
    this.loadListings();
  }

  loadListings() {
    try {
      if (fs.existsSync(LISTINGS_FILE)) {
        const raw = fs.readFileSync(LISTINGS_FILE, 'utf-8');
        this.listings = JSON.parse(raw);
      } else {
        this.listings = {};
      }
    } catch (err) {
      console.error('[ExternalReviewService] Failed to load toolExternalListings.json:', err);
      this.listings = {};
    }
  }

  /**
   * Status of all connected providers and their authentication mode
   */
  getProvidersStatus() {
    return this.providers.map(p => {
      let authType = 'none';
      let requiresApiKey = false;
      let isConnected = false;

      if (p.id === 'apple_app_store') {
        authType = 'public_rest_api';
        requiresApiKey = false;
        isConnected = true;
      } else if (p.id === 'g2') {
        authType = 'partner_api_bearer';
        requiresApiKey = true;
        isConnected = Boolean(process.env.G2_API_KEY);
      } else if (p.id === 'trustpilot') {
        authType = 'api_key_header';
        requiresApiKey = true;
        isConnected = Boolean(process.env.TRUSTPILOT_API_KEY);
      } else if (p.id === 'product_hunt') {
        authType = 'graphql_bearer_token';
        requiresApiKey = true;
        isConnected = Boolean(process.env.PRODUCT_HUNT_API_TOKEN);
      } else if (p.id === 'capterra') {
        authType = 'partner_portal';
        requiresApiKey = true;
        isConnected = Boolean(process.env.CAPTERRA_API_KEY);
      } else if (p.id === 'google_play') {
        authType = 'verified_listing_only';
        requiresApiKey = false;
        isConnected = true; // Connected via verified direct store links (non-scraping)
      }

      return {
        id: p.id,
        name: p.name,
        type: p.type,
        authType,
        requiresApiKey,
        isConfigured: p.hasApiKey(),
        mode: (p.id === 'apple_app_store' || p.hasApiKey()) ? 'live_api' : 'verified_outbound_link'
      };
    });
  }

  /**
   * Retrieve all verified external reviews & listings for a tool by exact toolId
   * @param {string} toolId
   */
  async getReviewsForTool(toolId) {
    if (!toolId) {
      return { toolId: '', sources: [], count: 0, hasExternalReviews: false };
    }

    const cleanId = toolId.toLowerCase().trim();
    const tool = db.getById(cleanId);
    if (!tool) {
      return { toolId: cleanId, sources: [], count: 0, hasExternalReviews: false };
    }

    const toolListings = this.listings[cleanId] || {};

    // 1. Gather live provider results
    const providerPromises = this.providers.map(async (provider) => {
      try {
        return await provider.fetchData(tool, toolListings);
      } catch (err) {
        console.error(`[ExternalReviewService] Provider ${provider.id} error on ${cleanId}:`, err);
        return null;
      }
    });

    const providerResults = (await Promise.all(providerPromises)).filter(Boolean);

    // 2. Gather active records from externalReviewDb (admin verified entries)
    const adminDbResult = externalReviewDb.getReviewsForTool(cleanId);
    const adminSources = adminDbResult?.sources || [];

    // 3. Merge: Admin-verified entries with custom rating or excerpt take precedence over fallback link
    const mergedMap = new Map();

    // First add provider results
    for (const r of providerResults) {
      mergedMap.set(r.sourceId, r);
    }

    // Overlay admin records (if an admin verified specific ratings/excerpts for G2/Capterra)
    for (const adm of adminSources) {
      mergedMap.set(adm.sourceId, {
        id: adm.id,
        sourceId: adm.sourceId,
        sourceName: adm.sourceName,
        sourceType: adm.sourceType,
        sourceUrl: adm.sourceUrl,
        rating: adm.rating,
        ratingScale: adm.ratingScale || 5,
        reviewCount: adm.reviewCount,
        reviewTitle: adm.reviewTitle,
        reviewExcerpt: adm.reviewExcerpt,
        reviewerName: adm.reviewerName,
        hasLiveRating: adm.rating !== null,
        verificationMethod: adm.dataMethod === 'manual' ? 'Admin Verified Record' : 'Authorized Public Feed',
        lastVerified: adm.lastVerified,
        status: adm.status
      });
    }

    const sources = Array.from(mergedMap.values());

    return {
      toolId: cleanId,
      sources,
      count: sources.length,
      hasExternalReviews: sources.length > 0
    };
  }

  /**
   * Summary for a tool, keeping each source strictly separate
   */
  async getSummaryForTool(toolId) {
    const { sources, hasExternalReviews } = await this.getReviewsForTool(toolId);

    if (!hasExternalReviews) {
      return {
        toolId,
        hasData: false,
        sourcesSummary: [],
        commonThemes: null
      };
    }

    const sourcesSummary = sources.map(s => ({
      sourceName: s.sourceName,
      rating: s.rating,
      ratingScale: s.ratingScale,
      reviewCount: s.reviewCount,
      sourceUrl: s.sourceUrl,
      hasLiveRating: s.hasLiveRating,
      verificationMethod: s.verificationMethod,
      lastVerified: s.lastVerified
    }));

    return {
      toolId,
      hasData: true,
      sourcesSummary,
      commonThemes: null
    };
  }
}

export const externalReviewService = new ExternalReviewService();
