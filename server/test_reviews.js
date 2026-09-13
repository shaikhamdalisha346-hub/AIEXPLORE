const API_BASE = 'http://localhost:5000/api';

async function runReviewTests() {
  console.log('======================================================');
  console.log('AI TOOL FINDER — REAL USER REVIEW SYSTEM TEST SUITE');
  console.log('======================================================\n');

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

  // 1. Initial State: No community reviews for Gamma or Canva
  await test('Initial state: Gamma and Canva start with 0 community reviews', async () => {
    const resGamma = await fetch(`${API_BASE}/tools/gamma/reviews`);
    const dataGamma = await resGamma.json();
    if (dataGamma.stats.totalRatings !== 0) {
      throw new Error(`Expected Gamma to have 0 reviews initially, got ${dataGamma.stats.totalRatings}`);
    }
    if (dataGamma.stats.averageRating !== null) {
      throw new Error(`Expected Gamma averageRating to be null initially, got ${dataGamma.stats.averageRating}`);
    }

    const resCanva = await fetch(`${API_BASE}/tools/canva/reviews`);
    const dataCanva = await resCanva.json();
    if (dataCanva.stats.totalRatings !== 0) {
      throw new Error(`Expected Canva to have 0 reviews initially, got ${dataCanva.stats.totalRatings}`);
    }
  });

  let gammaReview1Id = null;

  // 2. Submit a real 5-star review for Gamma
  await test('Submit real 5-star review for Gamma as "Rahul"', async () => {
    const res = await fetch(`${API_BASE}/tools/gamma/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: 5,
        reviewTitle: 'Gamma helped me create my college presentation much faster',
        reviewText: 'Gamma helped me create my college presentation much faster. I liked the initial designs and editing was simple. Exported directly to PowerPoint.',
        useCase: 'Presentation',
        usageFrequency: 'Weekly',
        planType: 'Free',
        displayName: 'Rahul',
        isAnonymous: false,
        userId: 'user_rahul_101'
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit review');
    if (data.review.rating !== 5) throw new Error(`Expected rating 5, got ${data.review.rating}`);
    if (data.review.displayName !== 'Rahul') throw new Error(`Expected author Rahul, got ${data.review.displayName}`);
    if (data.stats.totalRatings !== 1) throw new Error(`Expected totalRatings 1, got ${data.stats.totalRatings}`);
    if (data.stats.averageRating !== 5.0) throw new Error(`Expected averageRating 5.0, got ${data.stats.averageRating}`);
    gammaReview1Id = data.review.id;
  });

  // 3. Verify Review appears on Gamma ONLY (Strict Tool Isolation)
  await test('Gamma review appears on Gamma only and NOT on Canva', async () => {
    const resGamma = await fetch(`${API_BASE}/tools/gamma/reviews`);
    const dataGamma = await resGamma.json();
    if (dataGamma.reviews.length !== 1) {
      throw new Error(`Expected Gamma to have 1 review, got ${dataGamma.reviews.length}`);
    }
    if (dataGamma.reviews[0].id !== gammaReview1Id) {
      throw new Error('Gamma review id mismatch');
    }

    const resCanva = await fetch(`${API_BASE}/tools/canva/reviews`);
    const dataCanva = await resCanva.json();
    if (dataCanva.reviews.length !== 0) {
      throw new Error(`Canva has ${dataCanva.reviews.length} reviews; reviews leaked between tools!`);
    }
  });

  // 4. Submit 4-star review for Gamma and verify dynamic rating update
  await test('Submit 4-star review for Gamma -> Average updates dynamically to 4.5', async () => {
    const res = await fetch(`${API_BASE}/tools/gamma/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: 4,
        reviewTitle: 'Good slides but minor formatting tweaks needed',
        reviewText: 'The AI-generated slides were useful, but I needed to make some changes to the card layout and customize colors.',
        useCase: 'College',
        usageFrequency: 'Occasionally',
        planType: 'Free',
        isAnonymous: true,
        userId: 'user_student_202'
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit review');
    if (data.stats.totalRatings !== 2) throw new Error(`Expected 2 ratings, got ${data.stats.totalRatings}`);
    if (data.stats.averageRating !== 4.5) throw new Error(`Expected average 4.5 ((5+4)/2), got ${data.stats.averageRating}`);
    if (data.stats.ratingDistribution[5] !== 1 || data.stats.ratingDistribution[4] !== 1) {
      throw new Error('Rating distribution mismatch');
    }
  });

  let canvaReviewId = null;

  // 5. Submit review for Canva -> Updates Canva independently
  await test('Submit review for Canva -> Canva updates independently', async () => {
    const res = await fetch(`${API_BASE}/tools/canva/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: 4,
        reviewTitle: 'Massive library of templates for student projects',
        reviewText: 'Canva has everything from posters to slides. The Magic Studio features are great for creating presentation graphics.',
        useCase: 'Design',
        usageFrequency: 'Daily',
        planType: 'Free',
        displayName: 'Sarah K.',
        isAnonymous: false,
        userId: 'user_sarah_303'
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit Canva review');
    if (data.stats.totalRatings !== 1) throw new Error(`Expected Canva 1 rating, got ${data.stats.totalRatings}`);
    if (data.stats.averageRating !== 4.0) throw new Error(`Expected Canva average 4.0, got ${data.stats.averageRating}`);
    canvaReviewId = data.review.id;
  });

  // 6. Test Helpful button functionality and anti-abuse single voting
  await test('Helpful button increments count and prevents duplicate voting by same user', async () => {
    const vote1 = await fetch(`${API_BASE}/reviews/${gammaReview1Id}/helpful`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'voter_user_999' })
    });
    const vote1Data = await vote1.json();
    if (vote1Data.helpfulCount !== 1) throw new Error(`Expected helpfulCount 1, got ${vote1Data.helpfulCount}`);
    if (!vote1Data.userHasLiked) throw new Error('Expected userHasLiked to be true');

    // Vote again with same user should toggle off or remain 1
    const vote2 = await fetch(`${API_BASE}/reviews/${gammaReview1Id}/helpful`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'voter_user_999' })
    });
    const vote2Data = await vote2.json();
    if (vote2Data.helpfulCount !== 0) throw new Error(`Expected toggle off to 0, got ${vote2Data.helpfulCount}`);
    if (vote2Data.userHasLiked) throw new Error('Expected userHasLiked to be false');
  });

  // 7. Test Reporting system
  await test('Report review -> Flags review for admin moderation', async () => {
    const rep = await fetch(`${API_BASE}/reviews/${canvaReviewId}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason: 'Advertising',
        details: 'Review looks like an advertisement',
        userId: 'reporter_444'
      })
    });
    const repData = await rep.json();
    if (!rep.ok) throw new Error(repData.error || 'Failed to report');
    if (repData.reportCount !== 1) throw new Error(`Expected reportCount 1, got ${repData.reportCount}`);
    if (repData.status !== 'flagged') throw new Error(`Expected status flagged, got ${repData.status}`);
  });

  // 8. Test Admin Moderation Dashboard API
  await test('Admin dashboard: GET /api/admin/reviews returns reported reviews', async () => {
    const res = await fetch(`${API_BASE}/admin/reviews?status=reported`);
    const data = await res.json();
    if (!res.ok) throw new Error('Failed to get admin reviews');
    const found = data.reviews.some(r => r.id === canvaReviewId);
    if (!found) throw new Error('Reported review not found in admin reported list');
  });

  // 9. Admin Removes reported review -> Disappears from public view
  await test('Admin removes review -> Review disappears from public tool page', async () => {
    const patchRes = await fetch(`${API_BASE}/admin/reviews/${canvaReviewId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'removed',
        moderationReason: 'Violated advertising policy'
      })
    });
    const patchData = await patchRes.json();
    if (!patchRes.ok) throw new Error(patchData.error || 'Failed to update review status');

    // Check public Canva reviews
    const resCanva = await fetch(`${API_BASE}/tools/canva/reviews`);
    const dataCanva = await resCanva.json();
    if (dataCanva.reviews.some(r => r.id === canvaReviewId)) {
      throw new Error('Removed review still visible in public reviews!');
    }
  });

  // 10. Anti-XSS Sanitization
  await test('XSS Sanitizer strips <script> tags and malicious HTML', async () => {
    const res = await fetch(`${API_BASE}/tools/gamma/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: 5,
        reviewTitle: '<script>alert("hack")</script>Clean Title Here',
        reviewText: '<script>document.cookie</script>This is clean review text without malicious scripts.',
        useCase: 'Presentation',
        userId: 'user_xss_tester'
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit review');
    if (data.review.reviewTitle.includes('<script>') || data.review.reviewText.includes('<script>')) {
      throw new Error('XSS script tag was not stripped!');
    }
  });

  // 11. Anti-Spam: One active review per user per tool (Updates existing instead of duplicating)
  await test('Anti-Spam: Updating review from same user does not create duplicate', async () => {
    const res = await fetch(`${API_BASE}/tools/gamma/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: 5,
        reviewTitle: 'Updated review title from Rahul',
        reviewText: 'Updated review content with additional notes on slide exports.',
        useCase: 'Presentation',
        userId: 'user_rahul_101'
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update review');

    const resGamma = await fetch(`${API_BASE}/tools/gamma/reviews`);
    const dataGamma = await resGamma.json();
    const rahulReviews = dataGamma.reviews.filter(r => r.userId === 'user_rahul_101');
    if (rahulReviews.length !== 1) {
      throw new Error(`Expected exactly 1 review for user_rahul_101, found ${rahulReviews.length}`);
    }
  });

  // 12. Isolated Science Expo Demo Mode
  await test('Demo mode is isolated with prominent demo label and does not pollute real reviews', async () => {
    const demoRes = await fetch(`${API_BASE}/tools/gamma/reviews?demo=true`);
    const demoData = await demoRes.json();
    if (!demoData.isDemo) throw new Error('Expected isDemo to be true in demo mode');
    if (demoData.reviews.length < 2) throw new Error('Expected demo reviews to load');
    for (const r of demoData.reviews) {
      if (!r.isDemo) throw new Error('Demo review missing isDemo flag');
    }
  });

  // Clean up any test reviews created during test execution
  try {
    const allReviewsRes = await fetch(`${API_BASE}/admin/reviews?status=all`);
    const allReviewsData = await allReviewsRes.json();
    for (const r of allReviewsData.reviews || []) {
      await fetch(`${API_BASE}/admin/reviews/${r.id}`, { method: 'DELETE' });
    }
  } catch (e) {
    // Ignore cleanup errors
  }

  console.log(`\n======================================================`);
  console.log(`RESULTS: ${passed}/${total} REVIEW TESTS PASSED (${Math.round((passed/total)*100)}%)`);
  console.log(`======================================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runReviewTests().catch(err => {
  console.error('Fatal error in review tests:', err);
  process.exit(1);
});
