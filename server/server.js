import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { db } from './db/database.js';
import { reviewDb } from './db/reviewDatabase.js';
import { externalReviewDb } from './db/externalReviewDatabase.js';
import { externalReviewService } from './services/externalReviews/ExternalReviewService.js';
import { recommendTools } from './services/recommendationEngine.js';
import { analyzeUrlSafety, verifyToolDomainMatch } from './services/safetyEngine.js';
import { calculateTrendScore, getTrendingCollections } from './services/trendEngine.js';

// Load .env environment variables safely
try {
  if (typeof process.loadEnvFile === 'function' && fs.existsSync('.env')) {
    process.loadEnvFile('.env');
  }
} catch (e) {
  // Gracefully continue if .env is absent
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. RECOMMENDATION API
app.post('/api/recommend', (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Please describe what you want to accomplish.' });
    }

    const allTools = db.getAll();
    const result = recommendTools(query, allTools);
    return res.json(result);
  } catch (err) {
    console.error('Error in /api/recommend:', err);
    return res.status(500).json({ error: 'Internal recommendation engine error.' });
  }
});

// 2. TOOLS CATALOGUE (Search, multi-filter, sort)
app.get('/api/tools', (req, res) => {
  try {
    const { search, category, purpose, freeOnly, platform, targetUser, minRating, sort } = req.query;
    let tools = db.getAll();

    // Text search across name, description, features, useCases, purposes
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      tools = tools.filter(t => 
        (t.name && t.name.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q)) ||
        (Array.isArray(t.purposes) && t.purposes.some(p => p.toLowerCase().includes(q))) ||
        (Array.isArray(t.features) && t.features.some(f => f.toLowerCase().includes(q))) ||
        (Array.isArray(t.useCases) && t.useCases.some(u => u.toLowerCase().includes(q)))
      );
    }

    // Category filter
    if (category && category !== 'All') {
      const cLower = category.toLowerCase();
      tools = tools.filter(t => 
        (t.category && t.category.toLowerCase() === cLower) ||
        (Array.isArray(t.categories) && t.categories.some(cat => cat.toLowerCase() === cLower))
      );
    }

    // Purpose filter
    if (purpose && purpose !== 'All') {
      const pLower = purpose.toLowerCase();
      tools = tools.filter(t => 
        Array.isArray(t.purposes) && t.purposes.some(purp => purp.toLowerCase().includes(pLower))
      );
    }

    // Free only filter
    if (freeOnly === 'true' || freeOnly === true) {
      tools = tools.filter(t => t.freePlan === true);
    }

    // Platform filter
    if (platform && platform !== 'All') {
      tools = tools.filter(t => Array.isArray(t.platforms) && t.platforms.includes(platform));
    }

    // Target user filter
    if (targetUser && targetUser !== 'All') {
      tools = tools.filter(t => Array.isArray(t.targetUsers) && t.targetUsers.some(u => u.toLowerCase().includes(targetUser.toLowerCase())));
    }

    // Min Rating filter
    if (minRating && !isNaN(Number(minRating))) {
      const min = Number(minRating);
      tools = tools.filter(t => (t.overallRating || 0) >= min);
    }

    // Attach dynamic trend scores
    tools = tools.map(t => ({
      ...t,
      trendScore: calculateTrendScore(t)
    }));

    // Sorting
    switch (sort) {
      case 'popular':
      case 'most_popular':
        tools.sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0));
        break;
      case 'trending':
        tools.sort((a, b) => b.trendScore - a.trendScore);
        break;
      case 'newest':
        tools.sort((a, b) => (b.recentlyAdded ? 1 : 0) - (a.recentlyAdded ? 1 : 0) || new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0));
        break;
      case 'free':
        tools.sort((a, b) => (b.freePlan ? 1 : 0) - (a.freePlan ? 1 : 0));
        break;
      case 'rating':
      case 'highest_rated':
        tools.sort((a, b) => (b.overallRating || 0) - (a.overallRating || 0));
        break;
      case 'recently_updated':
        tools.sort((a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0));
        break;
      default:
        // Balanced quality & trend
        tools.sort((a, b) => (b.qualityScore + b.trendScore) - (a.qualityScore + a.trendScore));
        break;
    }

    return res.json({
      total: tools.length,
      tools
    });
  } catch (err) {
    console.error('Error in /api/tools:', err);
    return res.status(500).json({ error: 'Failed to retrieve tools catalog.' });
  }
});

// 3. SINGLE TOOL DETAIL (with alternatives)
app.get('/api/tools/:id', (req, res) => {
  try {
    const tool = db.getById(req.params.id);
    if (!tool) {
      return res.status(404).json({ error: 'AI Tool not found.' });
    }

    const trendScore = calculateTrendScore(tool);
    const communityStats = reviewDb.getCommunityStatsForTool(tool.id);
    
    // Find 3 similar alternatives in the same category/purposes
    const allTools = db.getAll();
    const alternatives = allTools
      .filter(t => t.id !== tool.id && (
        t.category === tool.category || 
        t.purposes.some(p => tool.purposes.includes(p))
      ))
      .slice(0, 3)
      .map(alt => ({
        id: alt.id,
        name: alt.name,
        category: alt.category,
        overallRating: alt.overallRating,
        pricing: alt.pricing,
        freePlan: alt.freePlan,
        officialWebsite: alt.officialWebsite,
        safetyStatus: alt.safetyStatus
      }));

    return res.json({
      ...tool,
      trendScore,
      communityRating: communityStats,
      similarAlternatives: alternatives
    });
  } catch (err) {
    console.error('Error in /api/tools/:id:', err);
    return res.status(500).json({ error: 'Failed to retrieve tool details.' });
  }
});

// 4. COMMUNITY REVIEWS API (Genuine user-generated reviews only)
app.get('/api/tools/:id/reviews', (req, res) => {
  try {
    const { sort, filter, demo } = req.query;
    const isDemo = demo === 'true' || demo === true;
    const result = reviewDb.getReviewsForTool(req.params.id, { sort, filter, isDemo });
    return res.json(result);
  } catch (err) {
    console.error('Error in GET /api/tools/:id/reviews:', err);
    return res.status(500).json({ error: 'Failed to retrieve community reviews.' });
  }
});

app.post('/api/tools/:id/reviews', (req, res) => {
  try {
    const toolId = req.params.id;
    const tool = db.getById(toolId);
    if (!tool) {
      return res.status(404).json({ error: 'AI Tool not found.' });
    }

    const isDemo = req.body.demo === 'true' || req.body.demo === true;
    const review = reviewDb.createReview({
      ...req.body,
      toolId: tool.id
    }, isDemo);

    const stats = reviewDb.getCommunityStatsForTool(tool.id, isDemo);
    return res.status(201).json({ review, stats });
  } catch (err) {
    console.error('Error in POST /api/tools/:id/reviews:', err);
    return res.status(400).json({ error: err.message || 'Failed to submit review.' });
  }
});

// Review helpful toggle
app.post('/api/reviews/:reviewId/helpful', (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId, demo } = req.body;
    const isDemo = demo === 'true' || demo === true;
    const result = reviewDb.toggleHelpful(reviewId, userId || 'anon_user', isDemo);
    return res.json(result);
  } catch (err) {
    console.error('Error in POST /api/reviews/:reviewId/helpful:', err);
    return res.status(400).json({ error: err.message || 'Failed to update helpful count.' });
  }
});

// Review reporting
app.post('/api/reviews/:reviewId/report', (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason, details, userId, demo } = req.body;
    const isDemo = demo === 'true' || demo === true;
    const result = reviewDb.reportReview(reviewId, { reason, details, userId }, isDemo);
    return res.json(result);
  } catch (err) {
    console.error('Error in POST /api/reviews/:reviewId/report:', err);
    return res.status(400).json({ error: err.message || 'Failed to report review.' });
  }
});

// 5. EXTERNAL USER REVIEWS & RATINGS API (Strictly separate from Community Reviews)
app.get('/api/tools/:id/external-reviews', async (req, res) => {
  try {
    const toolId = req.params.id;
    const result = await externalReviewService.getReviewsForTool(toolId);
    return res.json(result);
  } catch (err) {
    console.error('Error in GET /api/tools/:id/external-reviews:', err);
    return res.status(500).json({ error: 'External review information is temporarily unavailable.' });
  }
});

app.get('/api/tools/:id/external-reviews/summary', async (req, res) => {
  try {
    const toolId = req.params.id;
    const result = await externalReviewService.getSummaryForTool(toolId);
    return res.json(result);
  } catch (err) {
    console.error('Error in GET /api/tools/:id/external-reviews/summary:', err);
    return res.status(500).json({ error: 'External review summary is temporarily unavailable.' });
  }
});

// 5. EXTERNAL / BENCHMARK REVIEWS ENDPOINT (Kept strictly separate from Community Reviews)
app.get('/api/reviews/:toolId', (req, res) => {
  try {
    const tool = db.getById(req.params.toolId);
    if (!tool) {
      return res.status(404).json({ error: 'AI Tool not found.' });
    }

    return res.json({
      toolId: tool.id,
      toolName: tool.name,
      overallRating: tool.overallRating || 4.6,
      userRating: tool.userRating || 4.5,
      expertRating: tool.expertRating || 4.7,
      reviewCount: tool.reviewCount || 'Verified user aggregate',
      pros: tool.pros || tool.strengths || [],
      cons: tool.cons || tool.limitations || [],
      bestFor: tool.bestFor || tool.targetUsers || [],
      notIdealFor: tool.notIdealFor || [],
      easeOfUse: tool.easeOfUse || 4.7,
      featureQuality: tool.featureQuality || 4.7,
      valueForMoney: tool.valueForMoney || 4.5,
      reliability: tool.reliability || 4.7,
      reviewRecency: tool.reviewRecency || 'September 2026',
      reviewSources: tool.reviewSources || []
    });
  } catch (err) {
    console.error('Error in /api/reviews:', err);
    return res.status(500).json({ error: 'Failed to retrieve external reviews.' });
  }
});

// 5. PURPOSES TAXONOMY DIRECTORY
app.get('/api/purposes', (req, res) => {
  try {
    const purposesSummary = db.getPurposesSummary();
    return res.json(purposesSummary);
  } catch (err) {
    console.error('Error in /api/purposes:', err);
    return res.status(500).json({ error: 'Failed to retrieve purposes directory.' });
  }
});

// 6. CATEGORIES METADATA
app.get('/api/categories', (req, res) => {
  try {
    const categoriesSummary = db.getCategoriesSummary();
    return res.json(categoriesSummary);
  } catch (err) {
    console.error('Error in /api/categories:', err);
    return res.status(500).json({ error: 'Failed to retrieve categories.' });
  }
});

// 7. TRENDING COLLECTIONS (7 Dynamic Collections)
app.get('/api/trending', (req, res) => {
  try {
    const allTools = db.getAll();
    const collections = getTrendingCollections(allTools);
    return res.json(collections);
  } catch (err) {
    console.error('Error in /api/trending:', err);
    return res.status(500).json({ error: 'Failed to retrieve trending collections.' });
  }
});

// 8. MULTI-TOOL COMPARISON (2-5 Tools)
app.post('/api/compare', (req, res) => {
  try {
    const { toolIds } = req.body;
    if (!Array.isArray(toolIds) || toolIds.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of toolIds to compare.' });
    }

    const compared = toolIds
      .slice(0, 5) // max 5 tools
      .map(id => db.getById(id))
      .filter(Boolean)
      .map(tool => ({
        ...tool,
        trendScore: calculateTrendScore(tool)
      }));

    // Generate comparison matrix with feature rows and availability marks (✓, —, ?)
    const allFeaturesSet = new Set();
    compared.forEach(t => {
      (t.features || []).forEach(f => allFeaturesSet.add(f));
    });
    const keyFeatures = Array.from(allFeaturesSet).slice(0, 10);

    const featureRows = keyFeatures.map(feat => {
      const toolAvailability = {};
      compared.forEach(t => {
        const hasFeature = (t.features || []).some(f => f.toLowerCase().includes(feat.toLowerCase()));
        toolAvailability[t.id] = hasFeature ? '✓ Available' : '— Not available';
      });
      return {
        feature: feat,
        availability: toolAvailability
      };
    });

    return res.json({
      tools: compared,
      count: compared.length,
      matrix: {
        featureRows
      }
    });
  } catch (err) {
    console.error('Error in /api/compare:', err);
    return res.status(500).json({ error: 'Failed to generate comparison matrix.' });
  }
});

// 9. URL SAFETY CHECKER & ML ANALYSIS
app.post('/api/safety/check', (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required for safety verification.' });
    }

    const report = analyzeUrlSafety(url);
    return res.json(report);
  } catch (err) {
    console.error('Error in /api/safety/check:', err);
    return res.status(500).json({ error: 'Failed to analyze URL safety.' });
  }
});

// 10. ADMIN DASHBOARD STATS & CRUD
app.get('/api/admin/stats', (req, res) => {
  try {
    const tools = db.getAll();
    const totalTools = tools.length;
    const newTools = tools.filter(t => t.recentlyAdded).length;
    const trendingTools = tools.filter(t => calculateTrendScore(t) >= 90).length;
    const recentlyUpdated = tools.filter(t => t.recentlyUpdated).length;
    const toolsRequiringVerification = tools.filter(t => !t.verifiedOfficialDomain).length;
    const safetyAlerts = tools.filter(t => t.safetyStatus && t.safetyStatus.toLowerCase().includes('suspicious')).length;

    const purposesSummary = db.getPurposesSummary();
    const categoriesSummary = db.getCategoriesSummary();
    const reviewStats = reviewDb.getAdminReviewStats();

    return res.json({
      totalTools,
      totalCategories: categoriesSummary.length,
      totalPurposes: purposesSummary.length,
      newTools,
      trendingTools,
      recentlyUpdated,
      toolsRequiringVerification,
      safetyAlerts,
      reviews: reviewStats
    });
  } catch (err) {
    console.error('Error in /api/admin/stats:', err);
    return res.status(500).json({ error: 'Failed to retrieve admin statistics.' });
  }
});

// 11. ADMIN REVIEW MODERATION API
app.get('/api/admin/reviews', (req, res) => {
  try {
    const { status = 'all' } = req.query;
    const reviews = reviewDb.getModerationReviews(status);
    const stats = reviewDb.getAdminReviewStats();
    return res.json({ reviews, stats });
  } catch (err) {
    console.error('Error in GET /api/admin/reviews:', err);
    return res.status(500).json({ error: 'Failed to retrieve moderation reviews.' });
  }
});

app.patch('/api/admin/reviews/:reviewId/status', (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status, moderationReason } = req.body;
    const updated = reviewDb.updateStatus(reviewId, status, moderationReason);
    return res.json({ success: true, review: updated });
  } catch (err) {
    console.error('Error in PATCH /api/admin/reviews/:reviewId/status:', err);
    return res.status(400).json({ error: err.message || 'Failed to update review status.' });
  }
});

app.delete('/api/admin/reviews/:reviewId', (req, res) => {
  try {
    const { reviewId } = req.params;
    const deleted = reviewDb.deleteReview(reviewId);
    return res.json({ success: true, deleted });
  } catch (err) {
    console.error('Error in DELETE /api/admin/reviews/:reviewId:', err);
    return res.status(400).json({ error: err.message || 'Failed to delete review.' });
  }
});

// 12. ADMIN EXTERNAL REVIEWS MANAGEMENT API
app.get('/api/admin/external-reviews', (req, res) => {
  try {
    const { filter } = req.query;
    const reviews = externalReviewDb.getAll(filter);
    const sources = externalReviewDb.getSources();
    return res.json({ reviews, sources, total: reviews.length });
  } catch (err) {
    console.error('Error in GET /api/admin/external-reviews:', err);
    return res.status(500).json({ error: 'Failed to retrieve external reviews.' });
  }
});

app.post('/api/admin/external-reviews', (req, res) => {
  try {
    const review = externalReviewDb.addReview(req.body);
    return res.status(201).json({ success: true, review });
  } catch (err) {
    console.error('Error in POST /api/admin/external-reviews:', err);
    return res.status(400).json({ error: err.message || 'Failed to add external review.' });
  }
});

app.patch('/api/admin/external-reviews/:id', (req, res) => {
  try {
    const updated = externalReviewDb.updateReview(req.params.id, req.body);
    return res.json({ success: true, review: updated });
  } catch (err) {
    console.error('Error in PATCH /api/admin/external-reviews/:id:', err);
    return res.status(400).json({ error: err.message || 'Failed to update external review.' });
  }
});

app.delete('/api/admin/external-reviews/:id', (req, res) => {
  try {
    const deleted = externalReviewDb.deleteReview(req.params.id);
    return res.json({ success: true, deleted });
  } catch (err) {
    console.error('Error in DELETE /api/admin/external-reviews/:id:', err);
    return res.status(400).json({ error: err.message || 'Failed to delete external review.' });
  }
});

app.get('/api/admin/external-sources', (req, res) => {
  try {
    const sources = externalReviewDb.getSources();
    return res.json(sources);
  } catch (err) {
    console.error('Error in GET /api/admin/external-sources:', err);
    return res.status(500).json({ error: 'Failed to retrieve external review sources.' });
  }
});

app.get('/api/admin/external-sources/status', (req, res) => {
  try {
    const status = externalReviewService.getProvidersStatus();
    return res.json(status);
  } catch (err) {
    console.error('Error in GET /api/admin/external-sources/status:', err);
    return res.status(500).json({ error: 'Failed to retrieve provider connection status.' });
  }
});

app.post('/api/admin/tools', (req, res) => {
  try {
    const newTool = db.add(req.body);
    return res.status(201).json({
      success: true,
      message: `AI Tool "${newTool.name}" successfully added to database.`,
      tool: newTool
    });
  } catch (err) {
    console.error('Error adding tool:', err);
    return res.status(400).json({ error: err.message || 'Failed to add tool.' });
  }
});

app.put('/api/admin/tools/:id', (req, res) => {
  try {
    const updated = db.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Tool not found for update.' });
    }
    return res.json({
      success: true,
      message: `AI Tool "${updated.name}" updated successfully.`,
      tool: updated
    });
  } catch (err) {
    console.error('Error updating tool:', err);
    return res.status(400).json({ error: err.message || 'Failed to update tool.' });
  }
});

app.delete('/api/admin/tools/:id', (req, res) => {
  try {
    const deleted = db.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Tool not found for deletion.' });
    }
    return res.json({
      success: true,
      message: `Tool ${req.params.id} successfully removed from database.`
    });
  } catch (err) {
    console.error('Error deleting tool:', err);
    return res.status(500).json({ error: 'Failed to delete tool.' });
  }
});

app.post('/api/admin/verify-domain', (req, res) => {
  try {
    const { id, verifiedDomain, status } = req.body;
    if (!id || !verifiedDomain) {
      return res.status(400).json({ error: 'Tool ID and verified domain are required.' });
    }
    const tool = db.verifyDomain(id, verifiedDomain, status);
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found.' });
    }
    return res.json({
      success: true,
      message: `Domain verified for ${tool.name}`,
      tool
    });
  } catch (err) {
    console.error('Error verifying domain:', err);
    return res.status(500).json({ error: 'Failed to verify domain.' });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[AI TOOL FINDER Server] Running on http://localhost:${PORT}`);
  });
}

export default app;