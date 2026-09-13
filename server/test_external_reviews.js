import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const API_BASE = 'http://localhost:5000/api';

async function runExternalReviewTests() {
  console.log('================================================================');
  console.log('AI TOOL FINDER — EXTERNAL USER REVIEWS & RATINGS TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;
  const createdRecordIds = [];

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

  try {
    // ------------------------------------------------------------------------
    // Test 1: Initial state - No fake or seeded reviews exist
    // ------------------------------------------------------------------------
    await test('Initial state: external_reviews.json contains no fake or seeded reviews', async () => {
      const resGamma = await fetch(`${API_BASE}/tools/gamma/external-reviews`);
      const dataGamma = await resGamma.json();
      if (dataGamma.hasExternalReviews !== false) {
        throw new Error(`Expected hasExternalReviews: false, got ${dataGamma.hasExternalReviews}`);
      }
      if (dataGamma.count !== 0) {
        throw new Error(`Expected count 0, got ${dataGamma.count}`);
      }
      if (!Array.isArray(dataGamma.sources) || dataGamma.sources.length !== 0) {
        throw new Error(`Expected empty sources array, got ${JSON.stringify(dataGamma.sources)}`);
      }

      const resSyn = await fetch(`${API_BASE}/tools/synthesia/external-reviews`);
      const dataSyn = await resSyn.json();
      if (dataSyn.hasExternalReviews !== false || dataSyn.count !== 0) {
        throw new Error('Expected unlisted tool (synthesia) to have 0 external reviews initially');
      }
    });

    // ------------------------------------------------------------------------
    // Test 2: Unverified manually entered data must NOT be displayed publicly
    // ------------------------------------------------------------------------
    await test('Manual entry without admin verification is set to needs_verification and hidden from public endpoint', async () => {
      const res = await fetch(`${API_BASE}/admin/external-reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: 'gamma',
          sourceId: 'capterra',
          sourceName: 'Capterra',
          sourceUrl: 'https://www.capterra.com/p/gamma-app/reviews/',
          rating: 4.5,
          reviewCount: 400,
          dataMethod: 'manual',
          isVerifiedByAdmin: false
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add external review');
      if (data.review.status !== 'needs_verification') {
        throw new Error(`Expected status "needs_verification" for unverified manual data, got "${data.review.status}"`);
      }
      if (data.review.isVerifiedByAdmin !== false) {
        throw new Error('Expected isVerifiedByAdmin to be false');
      }
      createdRecordIds.push(data.review.id);

      // Verify that public endpoint for Gamma does NOT expose this unverified review
      const pubRes = await fetch(`${API_BASE}/tools/gamma/external-reviews`);
      const pubData = await pubRes.json();
      if (pubData.hasExternalReviews !== false || pubData.count !== 0) {
        throw new Error('Unverified manual review was leaked to public tool endpoint!');
      }
    });

    // ------------------------------------------------------------------------
    // Test 3: Admin verification activates record
    // ------------------------------------------------------------------------
    await test('Admin verification activates the external review record', async () => {
      const targetId = createdRecordIds[createdRecordIds.length - 1];
      const patchRes = await fetch(`${API_BASE}/admin/external-reviews/${targetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'active',
          isVerifiedByAdmin: true
        })
      });
      const patchData = await patchRes.json();
      if (!patchRes.ok) throw new Error(patchData.error || 'Failed to patch verification');
      if (patchData.review.status !== 'active' || !patchData.review.isVerifiedByAdmin) {
        throw new Error('Record was not activated/verified properly');
      }

      // Now public endpoint returns it
      const pubRes = await fetch(`${API_BASE}/tools/gamma/external-reviews`);
      const pubData = await pubRes.json();
      if (pubData.count !== 1 || pubData.sources[0].sourceId !== 'capterra') {
        throw new Error('Verified Capterra review not returned on public endpoint');
      }
    });

    // ------------------------------------------------------------------------
    // Test 4 (User Test #1): When verified external G2/Capterra data exists for Gamma, verify that it is returned and displayed correctly
    // ------------------------------------------------------------------------
    let gammaG2Id = null;
    await test('When verified external G2/Capterra data exists for Gamma, verify that it is returned and displayed correctly', async () => {
      const res = await fetch(`${API_BASE}/admin/external-reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: 'gamma',
          sourceId: 'g2',
          sourceName: 'G2',
          sourceUrl: 'https://www.g2.com/products/gamma-app/reviews',
          rating: 4.6,
          reviewCount: 2100,
          reviewExcerpt: 'Users praise the rapid slide deck generation and modern formatting.',
          dataMethod: 'permitted_public_data',
          isVerifiedByAdmin: true,
          status: 'active'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add G2 record');
      gammaG2Id = data.review.id;
      createdRecordIds.push(gammaG2Id);

      // Query public endpoint for Gamma
      const pubRes = await fetch(`${API_BASE}/tools/gamma/external-reviews`);
      const pubData = await pubRes.json();
      if (pubData.count !== 2) {
        throw new Error(`Expected 2 external records (Capterra + G2) for Gamma, got ${pubData.count}`);
      }

      const g2Record = pubData.sources.find(s => s.sourceId === 'g2');
      if (!g2Record) throw new Error('G2 record not found in Gamma external reviews');
      if (g2Record.rating !== 4.6) throw new Error(`Expected G2 rating 4.6, got ${g2Record.rating}`);
      if (g2Record.reviewCount !== 2100) throw new Error(`Expected G2 count 2100, got ${g2Record.reviewCount}`);
      if (g2Record.sourceUrl !== 'https://www.g2.com/products/gamma-app/reviews') {
        throw new Error(`Unexpected sourceUrl: ${g2Record.sourceUrl}`);
      }
    });

    // ------------------------------------------------------------------------
    // Test 5: Tool Isolation - Gamma external reviews do NOT leak to Canva
    // ------------------------------------------------------------------------
    await test('Strict Tool Isolation: Gamma external reviews do NOT appear on Canva', async () => {
      const resCanva = await fetch(`${API_BASE}/tools/canva/external-reviews`);
      const dataCanva = await resCanva.json();
      if (dataCanva.sources.some(s => s.id === gammaG2Id || s.toolId === 'gamma')) {
        throw new Error('Gamma external review leaked to Canva!');
      }
      if (dataCanva.toolId !== 'canva') {
        throw new Error(`Expected toolId "canva", got "${dataCanva.toolId}"`);
      }
    });

    // ------------------------------------------------------------------------
    // Test 6: Source ratings remain separate (Never artificially combined)
    // ------------------------------------------------------------------------
    await test('Ratings remain source-specific: G2 (4.6) and Capterra (4.5) are kept separate and not averaged into one number', async () => {
      const pubRes = await fetch(`${API_BASE}/tools/gamma/external-reviews`);
      const pubData = await pubRes.json();
      const capterra = pubData.sources.find(s => s.sourceId === 'capterra');
      const g2 = pubData.sources.find(s => s.sourceId === 'g2');

      if (!capterra || !g2) throw new Error('Both sources must be present');
      if (capterra.rating !== 4.5 || g2.rating !== 4.6) {
        throw new Error('Individual source ratings were modified or distorted');
      }

      // Check summary endpoint: sourcesSummary lists each independently
      const sumRes = await fetch(`${API_BASE}/tools/gamma/external-reviews/summary`);
      const sumData = await sumRes.json();
      if (!sumData.hasData || sumData.sourcesSummary.length !== 2) {
        throw new Error('Summary does not maintain separate sources');
      }
      const sumG2 = sumData.sourcesSummary.find(s => s.sourceName === 'G2');
      const sumCap = sumData.sourcesSummary.find(s => s.sourceName === 'Capterra');
      if (!sumG2 || !sumCap) throw new Error('Missing individual source in summary');
      if (sumG2.rating !== 4.6 || sumCap.rating !== 4.5) {
        throw new Error('Ratings were artificially merged in summary');
      }
    });

    // ------------------------------------------------------------------------
    // Test 7: Community Reviews remain completely separate and unaffected
    // ------------------------------------------------------------------------
    await test('Community reviews system is completely separate from external reviews', async () => {
      const commRes = await fetch(`${API_BASE}/tools/gamma/reviews`);
      const commData = await commRes.json();

      // Community reviews data structure check
      if (!commData.stats || commData.stats.ratingDistribution === undefined) {
        throw new Error('Community review structure was corrupted');
      }

      // External ratings should NOT impact community reviews stats
      // Post a community review and verify external reviews are untouched
      const postCommRes = await fetch(`${API_BASE}/tools/gamma/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: 5,
          reviewTitle: 'Independent community review',
          reviewText: 'This is a genuine community test review to verify system separation.',
          useCase: 'Work',
          userId: 'test_user_isolation_check'
        })
      });
      const postCommData = await postCommRes.json();
      if (!postCommRes.ok) throw new Error('Failed to post community review');

      // Verify external reviews still has exactly 2 sources
      const extRes = await fetch(`${API_BASE}/tools/gamma/external-reviews`);
      const extData = await extRes.json();
      if (extData.count !== 2) {
        throw new Error(`External review count changed unexpectedly: ${extData.count}`);
      }

      // Clean up community test review
      if (postCommData.review?.id) {
        await fetch(`${API_BASE}/admin/reviews/${postCommData.review.id}`, { method: 'DELETE' });
      }
    });

    // ------------------------------------------------------------------------
    // Test 8: Security - Reject non-HTTPS or unapproved domains
    // ------------------------------------------------------------------------
    await test('Security: Rejects non-HTTPS and unapproved external domains', async () => {
      // Test HTTP
      const httpRes = await fetch(`${API_BASE}/admin/external-reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: 'gamma',
          sourceId: 'g2',
          sourceName: 'G2',
          sourceUrl: 'http://www.g2.com/products/gamma-app/reviews',
          rating: 4.5,
          isVerifiedByAdmin: true
        })
      });
      if (httpRes.status !== 400) {
        throw new Error(`Expected HTTP URL to be rejected with 400, got ${httpRes.status}`);
      }

      // Test unapproved domain
      const evilRes = await fetch(`${API_BASE}/admin/external-reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: 'gamma',
          sourceId: 'g2',
          sourceName: 'G2',
          sourceUrl: 'https://malicious-scam-site.org/g2/reviews',
          rating: 4.5,
          isVerifiedByAdmin: true
        })
      });
      if (evilRes.status !== 400) {
        throw new Error(`Expected unauthorized domain to be rejected with 400, got ${evilRes.status}`);
      }
    });

    // ------------------------------------------------------------------------
    // Test 9: Security - Anti-XSS Sanitization on excerpts and titles
    // ------------------------------------------------------------------------
    await test('Security: Strips scripts and tags from excerpts and titles', async () => {
      const xssRes = await fetch(`${API_BASE}/admin/external-reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: 'gamma',
          sourceId: 'trustpilot',
          sourceName: 'Trustpilot',
          sourceUrl: 'https://www.trustpilot.com/review/gamma.app',
          rating: 4.2,
          reviewTitle: '<script>alert("hack")</script>Great Presentation AI',
          reviewExcerpt: '<img src=x onerror="alert(1)"/>Reliable tool for quick decks.',
          dataMethod: 'permitted_public_data',
          isVerifiedByAdmin: true,
          status: 'active'
        })
      });
      const xssData = await xssRes.json();
      if (!xssRes.ok) throw new Error(xssData.error || 'Failed to submit record with HTML');
      createdRecordIds.push(xssData.review.id);

      if (xssData.review.reviewTitle.includes('<script>') || xssData.review.reviewExcerpt.includes('<img')) {
        throw new Error('XSS payload was not sanitized in external review excerpt/title');
      }
    });

    // ------------------------------------------------------------------------
    // Test 10: Graceful handling when external data is unavailable
    // ------------------------------------------------------------------------
    await test('When external data is unavailable for a tool, returns empty state without error', async () => {
      // Test an arbitrary tool with no external reviews (e.g. "synthesia")
      const res = await fetch(`${API_BASE}/tools/synthesia/external-reviews`);
      if (!res.ok) throw new Error(`Expected 200 OK, got ${res.status}`);
      const data = await res.json();
      if (data.hasExternalReviews !== false || data.count !== 0 || data.sources.length !== 0) {
        throw new Error('Expected no external reviews for synthesia');
      }

      const sumRes = await fetch(`${API_BASE}/tools/synthesia/external-reviews/summary`);
      if (!sumRes.ok) throw new Error(`Expected 200 OK for summary, got ${sumRes.status}`);
      const sumData = await sumRes.json();
      if (sumData.hasData !== false) {
        throw new Error('Expected summary hasData: false');
      }
    });

    // ------------------------------------------------------------------------
    // Test 11: Admin External Review Sources configuration API
    // ------------------------------------------------------------------------
    await test('Admin external sources endpoint returns approved platform configurations', async () => {
      const res = await fetch(`${API_BASE}/admin/external-sources`);
      const sources = await res.json();
      if (!Array.isArray(sources) || sources.length === 0) {
        throw new Error('Expected list of configured external review sources');
      }
      const g2 = sources.find(s => s.id === 'g2');
      const capterra = sources.find(s => s.id === 'capterra');
      const trustpilot = sources.find(s => s.id === 'trustpilot');
      if (!g2 || !capterra || !trustpilot) {
        throw new Error('Missing standard sources in external sources configuration');
      }
      if (!g2.allowedDomains.includes('g2.com')) {
        throw new Error('g2.com missing in allowedDomains');
      }
    });

    // ------------------------------------------------------------------------
    // Test 12: Admin Delete external review record
    // ------------------------------------------------------------------------
    await test('Admin can delete an external review record', async () => {
      const toDeleteId = createdRecordIds.pop();
      const delRes = await fetch(`${API_BASE}/admin/external-reviews/${toDeleteId}`, {
        method: 'DELETE'
      });
      const delData = await delRes.json();
      if (!delRes.ok || !delData.success) {
        throw new Error('Failed to delete external review');
      }

      // Verify deletion from public endpoint
      const pubRes = await fetch(`${API_BASE}/tools/gamma/external-reviews`);
      const pubData = await pubRes.json();
      if (pubData.sources.some(s => s.id === toDeleteId)) {
        throw new Error('Deleted external review still visible on public endpoint');
      }
    });

    // ------------------------------------------------------------------------
    // Test 13: Clean up all test-created records so zero fake/seeded records remain
    // ------------------------------------------------------------------------
    await test('Cleanup: Delete remaining test records to keep external_reviews.json pristine', async () => {
      while (createdRecordIds.length > 0) {
        const id = createdRecordIds.pop();
        await fetch(`${API_BASE}/admin/external-reviews/${id}`, { method: 'DELETE' });
      }

      const resGamma = await fetch(`${API_BASE}/tools/gamma/external-reviews`);
      const dataGamma = await resGamma.json();
      if (dataGamma.count !== 0 || dataGamma.hasExternalReviews !== false) {
        throw new Error('Cleanup failed: Gamma still has external records');
      }
    });

    // ------------------------------------------------------------------------
    // Test 14 (User Test #14): Verify external-review system is supported by all 160 tools and isolated by exact toolId
    // ------------------------------------------------------------------------
    await test('Verify the external-review system is supported by all 160 tools and that every external review is isolated by its exact toolId', async () => {
      // 1. Fetch all tools from catalog
      const toolsRes = await fetch(`${API_BASE}/tools`);
      const toolsData = await toolsRes.json();
      const allTools = toolsData.tools || [];

      if (allTools.length !== 160) {
        throw new Error(`Expected 160 tools in catalog, found ${allTools.length}`);
      }

      // 2. Verify GET /api/tools/:id/external-reviews returns valid response for every single tool
      let successCount = 0;
      for (const tool of allTools) {
        const res = await fetch(`${API_BASE}/tools/${tool.id}/external-reviews`);
        if (!res.ok) {
          throw new Error(`GET /api/tools/${tool.id}/external-reviews returned status ${res.status}`);
        }
        const data = await res.json();
        if (data.toolId !== tool.id.toLowerCase().trim()) {
          throw new Error(`Tool ID mismatch for ${tool.id}: got ${data.toolId}`);
        }
        if (!Array.isArray(data.sources)) {
          throw new Error(`sources for tool ${tool.id} is not an array`);
        }
        successCount++;
      }

      if (successCount !== 160) {
        throw new Error(`Only ${successCount} of 160 tools were verified`);
      }

      // 3. Test exact toolId isolation across multiple different tools
      // Pick 3 diverse tools: e.g. "descript", "midjourney", "synthesia"
      const testTools = ['descript', 'midjourney', 'synthesia'].filter(id => allTools.some(t => t.id === id));
      if (testTools.length < 3) {
        testTools.push(allTools[0].id, allTools[1].id, allTools[2].id);
      }

      const tempIds = [];
      try {
        // Add a verified record for testTools[0] (descript)
        const res0 = await fetch(`${API_BASE}/admin/external-reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toolId: testTools[0],
            sourceId: 'g2',
            sourceName: 'G2',
            sourceUrl: 'https://www.g2.com/products/descript/reviews',
            rating: 4.5,
            reviewCount: 350,
            dataMethod: 'permitted_public_data',
            isVerifiedByAdmin: true,
            status: 'active'
          })
        });
        const d0 = await res0.json();
        if (d0.review) tempIds.push(d0.review.id);

        // Add a verified record for testTools[1] (midjourney)
        const res1 = await fetch(`${API_BASE}/admin/external-reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toolId: testTools[1],
            sourceId: 'trustpilot',
            sourceName: 'Trustpilot',
            sourceUrl: 'https://www.trustpilot.com/review/midjourney.com',
            rating: 4.3,
            reviewCount: 150,
            dataMethod: 'permitted_public_data',
            isVerifiedByAdmin: true,
            status: 'active'
          })
        });
        const d1 = await res1.json();
        if (d1.review) tempIds.push(d1.review.id);

        // Verify testTools[0] has ONLY its own G2 review
        const check0 = await (await fetch(`${API_BASE}/tools/${testTools[0]}/external-reviews`)).json();
        if (check0.count !== 1 || check0.sources[0].sourceId !== 'g2') {
          throw new Error(`Isolation failed: ${testTools[0]} did not have exactly its G2 review`);
        }

        // Verify testTools[1] has ONLY its own Trustpilot review
        const check1 = await (await fetch(`${API_BASE}/tools/${testTools[1]}/external-reviews`)).json();
        if (check1.count !== 1 || check1.sources[0].sourceId !== 'trustpilot') {
          throw new Error(`Isolation failed: ${testTools[1]} did not have exactly its Trustpilot review`);
        }

        // Verify testTools[2] has ZERO reviews (not polluted by 0 or 1)
        const check2 = await (await fetch(`${API_BASE}/tools/${testTools[2]}/external-reviews`)).json();
        if (check2.count !== 0 || check2.hasExternalReviews !== false) {
          throw new Error(`Isolation failed: ${testTools[2]} was polluted by other tools`);
        }
      } finally {
        // Clean up temporary isolation test records
        for (const id of tempIds) {
          await fetch(`${API_BASE}/admin/external-reviews/${id}`, { method: 'DELETE' });
        }
      }
    });

    // ------------------------------------------------------------------------
    // Test 15: external_reviews.json file state is pristine empty array
    // ------------------------------------------------------------------------
    await test('external_reviews.json is verified empty and free of placeholder/fake data', async () => {
      const dbFile = path.join(__dirname, 'db/external_reviews.json');
      const content = fs.readFileSync(dbFile, 'utf-8').trim();
      const parsed = JSON.parse(content);
      if (!Array.isArray(parsed) || parsed.length !== 0) {
        throw new Error(`external_reviews.json must be empty array [], found ${parsed.length} records`);
      }
    });

  } finally {
    // Ensure any stray records are cleaned up
    for (const id of createdRecordIds) {
      try {
        await fetch(`${API_BASE}/admin/external-reviews/${id}`, { method: 'DELETE' });
      } catch (e) {}
    }
  }

  console.log(`\n================================================================`);
  console.log(`RESULTS: ${passed}/${total} EXTERNAL REVIEW TESTS PASSED (${Math.round((passed/total)*100)}%)`);
  console.log(`================================================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runExternalReviewTests().catch(err => {
  console.error('Fatal error in external review tests:', err);
  process.exit(1);
});
