import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const API_BASE = 'http://localhost:5000/api';

async function runRealExternalSourcesTests() {
  console.log('================================================================');
  console.log('AI TOOL FINDER — REAL EXTERNAL REVIEW SOURCES TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
    }
  }

  // 1. Canva Magic Studio: Live Apple App Store official API integration
  await test('Canva Magic Studio: Live Apple iTunes API returns genuine rating and review count (>3M)', async () => {
    const res = await fetch(`${API_BASE}/tools/canva/external-reviews`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();

    if (!data.hasExternalReviews) throw new Error('Expected hasExternalReviews to be true for Canva');
    if (data.toolId !== 'canva') throw new Error(`Expected toolId "canva", got "${data.toolId}"`);

    const appleSource = data.sources.find(s => s.sourceId === 'apple_app_store');
    if (!appleSource) throw new Error('Apple App Store source missing for Canva');
    if (typeof appleSource.rating !== 'number' || appleSource.rating < 4.0 || appleSource.rating > 5.0) {
      throw new Error(`Invalid real Apple rating: ${appleSource.rating}`);
    }
    if (typeof appleSource.reviewCount !== 'number' || appleSource.reviewCount < 1000000) {
      throw new Error(`Invalid real Apple review count: ${appleSource.reviewCount}`);
    }
    if (!appleSource.sourceUrl.includes('apps.apple.com')) {
      throw new Error(`Invalid Apple URL: ${appleSource.sourceUrl}`);
    }
    if (appleSource.hasLiveRating !== true) {
      throw new Error('Expected hasLiveRating to be true for Apple App Store');
    }
  });

  // 2. Canva Magic Studio: Supported across multiple distinct external platforms
  await test('Canva Magic Studio: Returns multiple distinct third-party sources without combining', async () => {
    const res = await fetch(`${API_BASE}/tools/canva/external-reviews`);
    const data = await res.json();

    const expectedSources = ['apple_app_store', 'google_play', 'g2', 'capterra', 'trustpilot', 'product_hunt'];
    for (const srcId of expectedSources) {
      const found = data.sources.find(s => s.sourceId === srcId);
      if (!found) throw new Error(`Expected source "${srcId}" not found for Canva`);
    }

    // Verify each source is isolated with its own distinct object
    const sourceIds = data.sources.map(s => s.sourceId);
    const uniqueIds = new Set(sourceIds);
    if (uniqueIds.size !== sourceIds.length) {
      throw new Error('Duplicate sources returned');
    }
  });

  // 3. Zero-Scraping Compliance: Unauthenticated sources provide verified links without fake ratings
  await test('Zero-Scraping Compliance: Sources without API keys have rating: null and verified outbound links', async () => {
    const res = await fetch(`${API_BASE}/tools/canva/external-reviews`);
    const data = await res.json();

    const g2 = data.sources.find(s => s.sourceId === 'g2');
    const capterra = data.sources.find(s => s.sourceId === 'capterra');
    const googlePlay = data.sources.find(s => s.sourceId === 'google_play');

    if (g2.rating !== null) throw new Error('G2 must have rating: null when no API key is provided');
    if (!g2.sourceUrl.startsWith('https://www.g2.com')) throw new Error('G2 missing verified URL');

    if (capterra.rating !== null) throw new Error('Capterra must have rating: null');
    if (!capterra.sourceUrl.startsWith('https://www.capterra.com')) throw new Error('Capterra missing verified URL');

    if (googlePlay.rating !== null) throw new Error('Google Play must have rating: null (zero scraping)');
    if (!googlePlay.sourceUrl.startsWith('https://play.google.com')) throw new Error('Google Play missing verified URL');
  });

  // 4. Empty State: Tools without listings return hasExternalReviews: false
  await test('Empty State: Tools without external listings return hasExternalReviews: false', async () => {
    const res = await fetch(`${API_BASE}/tools/lovable/external-reviews`);
    const data = await res.json();

    if (data.hasExternalReviews !== false) {
      throw new Error(`Expected hasExternalReviews: false for unlisted tool, got ${data.hasExternalReviews}`);
    }
    if (data.count !== 0 || data.sources.length !== 0) {
      throw new Error(`Expected 0 sources for unlisted tool, got ${data.count}`);
    }
  });

  // 5. Providers Status API
  await test('GET /api/admin/external-sources/status reports provider connection modes', async () => {
    const res = await fetch(`${API_BASE}/admin/external-sources/status`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const status = await res.json();

    if (!Array.isArray(status) || status.length < 5) {
      throw new Error('Expected list of provider statuses');
    }

    const apple = status.find(s => s.id === 'apple_app_store');
    if (!apple || apple.mode !== 'live_api' || apple.requiresApiKey !== false) {
      throw new Error('Apple App Store provider status incorrect');
    }

    const g2 = status.find(s => s.id === 'g2');
    if (!g2 || g2.requiresApiKey !== true || g2.mode !== 'verified_outbound_link') {
      throw new Error('G2 provider status incorrect');
    }
  });

  // 6. Community Reviews separation preserved
  await test('Community reviews system remains 100% untouched and separate', async () => {
    const commRes = await fetch(`${API_BASE}/tools/canva/reviews`);
    if (!commRes.ok) throw new Error('Failed to fetch Canva community reviews');
    const commData = await commRes.json();

    if (!commData.stats || typeof commData.stats.totalRatings !== 'number') {
      throw new Error('Community reviews structure broken');
    }

    // Community reviews must NOT have external rating numbers mixed in
    if (commData.reviews.some(r => r.sourceId || r.hasLiveRating)) {
      throw new Error('External review fields leaked into Community reviews!');
    }
  });

  // 7. Security: HTTPS enforced on all returned review URLs
  await test('Security: All external review URLs use HTTPS', async () => {
    const res = await fetch(`${API_BASE}/tools/canva/external-reviews`);
    const data = await res.json();

    for (const src of data.sources) {
      if (!src.sourceUrl.startsWith('https://')) {
        throw new Error(`Non-HTTPS URL detected for ${src.sourceName}: ${src.sourceUrl}`);
      }
    }
  });

  console.log(`\n================================================================`);
  console.log(`RESULTS: ${passed}/${total} REAL EXTERNAL SOURCE TESTS PASSED (${Math.round((passed/total)*100)}%)`);
  console.log(`================================================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runRealExternalSourcesTests().catch(err => {
  console.error('Fatal error in real external sources tests:', err);
  process.exit(1);
});
