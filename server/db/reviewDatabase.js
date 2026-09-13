import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REVIEWS_FILE = path.join(__dirname, 'user_reviews.json');
const DEMO_REVIEWS_FILE = path.join(__dirname, 'demo_reviews.json');

// XSS Sanitizer: strips HTML tags, script blocks, javascript: URLs
function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

class ReviewDatabase {
  constructor() {
    this.reviews = [];
    this.demoReviews = [];
    this.load();
    this.loadDemo();
  }

  load() {
    try {
      if (fs.existsSync(REVIEWS_FILE)) {
        const raw = fs.readFileSync(REVIEWS_FILE, 'utf-8');
        this.reviews = JSON.parse(raw);
      } else {
        this.reviews = [];
        this.save();
      }
    } catch (err) {
      console.error('Error reading user reviews database:', err);
      this.reviews = [];
    }
  }

  loadDemo() {
    try {
      if (fs.existsSync(DEMO_REVIEWS_FILE)) {
        const raw = fs.readFileSync(DEMO_REVIEWS_FILE, 'utf-8');
        this.demoReviews = JSON.parse(raw);
      } else {
        this.demoReviews = [];
      }
    } catch (err) {
      console.error('Error reading demo reviews database:', err);
      this.demoReviews = [];
    }
  }

  save() {
    try {
      fs.writeFileSync(REVIEWS_FILE, JSON.stringify(this.reviews, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Error saving user reviews database:', err);
      return false;
    }
  }

  saveDemo() {
    try {
      fs.writeFileSync(DEMO_REVIEWS_FILE, JSON.stringify(this.demoReviews, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Error saving demo reviews database:', err);
      return false;
    }
  }

  // Get active dataset depending on demo flag
  getDataset(isDemo = false) {
    return isDemo ? this.demoReviews : this.reviews;
  }

  // Get single review by id
  getById(id, isDemo = false) {
    const list = this.getDataset(isDemo);
    return list.find(r => r.id === id) || null;
  }

  // Calculate live statistics for a specific tool from actual published reviews
  getCommunityStatsForTool(toolId, isDemo = false) {
    if (!toolId) return null;
    const cleanToolId = toolId.toLowerCase().trim();
    const list = this.getDataset(isDemo);
    const toolReviews = list.filter(r => 
      r.toolId.toLowerCase() === cleanToolId && 
      (r.status === 'published' || !r.status)
    );

    const totalRatings = toolReviews.length;

    if (totalRatings === 0) {
      return {
        toolId: cleanToolId,
        averageRating: null,
        totalRatings: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        ratingPercentages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        positivePercentage: 0,
        criticalPercentage: 0,
        commonUseCases: [],
        whatUsersAreSaying: null,
        isDemo: Boolean(isDemo)
      };
    }

    const sum = toolReviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    const averageRating = Number((sum / totalRatings).toFixed(1));

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let positiveCount = 0;
    let criticalCount = 0;
    const useCaseCounts = {};

    for (const r of toolReviews) {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      distribution[star] = (distribution[star] || 0) + 1;

      if (star >= 4) positiveCount++;
      if (star <= 2) criticalCount++;

      if (r.useCase) {
        useCaseCounts[r.useCase] = (useCaseCounts[r.useCase] || 0) + 1;
      }
    }

    const ratingPercentages = {
      1: Math.round((distribution[1] / totalRatings) * 100),
      2: Math.round((distribution[2] / totalRatings) * 100),
      3: Math.round((distribution[3] / totalRatings) * 100),
      4: Math.round((distribution[4] / totalRatings) * 100),
      5: Math.round((distribution[5] / totalRatings) * 100)
    };

    const positivePercentage = Math.round((positiveCount / totalRatings) * 100);
    const criticalPercentage = Math.round((criticalCount / totalRatings) * 100);

    const commonUseCases = Object.entries(useCaseCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    // Generate summary only from actual reviews when >= 3 exist (Section 17 & 26)
    let whatUsersAreSaying = null;
    if (totalRatings >= 3) {
      const topUseCasesText = commonUseCases.map(u => u.name).join(', ');
      whatUsersAreSaying = {
        summaryText: `Users commonly utilize this tool for ${topUseCasesText || 'everyday workflows'}. Verified reviewers note a ${positivePercentage}% satisfaction rate across community evaluations.`,
        attribution: `AI-generated summary based on ${totalRatings} community reviews.`,
        positivePoints: toolReviews.filter(r => r.rating >= 4).slice(0, 3).map(r => r.reviewTitle || r.reviewText.slice(0, 60)),
        criticalPoints: toolReviews.filter(r => r.rating <= 3).slice(0, 2).map(r => r.reviewTitle || r.reviewText.slice(0, 60))
      };
    }

    return {
      toolId: cleanToolId,
      averageRating,
      totalRatings,
      ratingDistribution: distribution,
      ratingPercentages,
      positivePercentage,
      criticalPercentage,
      commonUseCases,
      whatUsersAreSaying,
      isDemo: Boolean(isDemo)
    };
  }

  // Get reviews list for a specific tool with sorting & filtering
  getReviewsForTool(toolId, options = {}) {
    if (!toolId) return { reviews: [], stats: null };
    const cleanToolId = toolId.toLowerCase().trim();
    const { sort = 'recent', filter = 'all', isDemo = false } = options;

    const list = this.getDataset(isDemo);
    let toolReviews = list.filter(r => 
      r.toolId.toLowerCase() === cleanToolId && 
      (r.status === 'published' || !r.status)
    );

    // Filter
    if (filter === 'positive') {
      toolReviews = toolReviews.filter(r => r.rating >= 4);
    } else if (filter === 'critical') {
      toolReviews = toolReviews.filter(r => r.rating <= 2);
    } else if (filter === 'verified') {
      toolReviews = toolReviews.filter(r => r.verifiedUsage === true);
    } else if (filter === 'free') {
      toolReviews = toolReviews.filter(r => (r.planType || '').toLowerCase() === 'free');
    } else if (filter === 'paid') {
      toolReviews = toolReviews.filter(r => (r.planType || '').toLowerCase() === 'paid');
    }

    // Sort
    switch (sort) {
      case 'highest':
        toolReviews.sort((a, b) => b.rating - a.rating || new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'lowest':
        toolReviews.sort((a, b) => a.rating - b.rating || new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'helpful':
        toolReviews.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0) || new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'recent':
      default:
        toolReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    const stats = this.getCommunityStatsForTool(toolId, isDemo);

    return {
      reviews: toolReviews,
      stats,
      isDemo: Boolean(isDemo)
    };
  }

  // Create a new real community review
  createReview(data, isDemo = false) {
    const {
      toolId,
      userId = `anon_${Math.random().toString(36).slice(2, 9)}`,
      displayName = 'Anonymous User',
      isAnonymous = true,
      rating,
      reviewTitle,
      reviewText,
      useCase = 'General',
      usageFrequency = 'Occasionally',
      planType = 'Free',
      hasUsedTool = true
    } = data;

    if (!toolId) throw new Error('Tool ID is required.');
    const cleanToolId = toolId.toLowerCase().trim();

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      throw new Error('Rating must be an integer between 1 and 5.');
    }

    const cleanTitle = sanitizeText(reviewTitle);
    if (!cleanTitle || cleanTitle.length < 3) {
      throw new Error('Review title must be at least 3 characters.');
    }

    const cleanText = sanitizeText(reviewText);
    if (!cleanText || cleanText.length < 10) {
      throw new Error('Review text must be at least 10 characters.');
    }

    const cleanAuthor = isAnonymous ? 'Anonymous User' : (sanitizeText(displayName) || 'Anonymous User');

    const targetList = this.getDataset(isDemo);

    // Anti-spam rule: 1 active review per user per tool
    const existingIndex = targetList.findIndex(r => 
      r.toolId.toLowerCase() === cleanToolId && 
      r.userId === userId && 
      r.status !== 'removed'
    );

    const now = new Date().toISOString();

    if (existingIndex !== -1) {
      // Update existing review
      const existing = targetList[existingIndex];
      existing.rating = Math.round(numRating);
      existing.reviewTitle = cleanTitle;
      existing.reviewText = cleanText;
      existing.useCase = sanitizeText(useCase) || 'General';
      existing.usageFrequency = sanitizeText(usageFrequency) || 'Occasionally';
      existing.planType = sanitizeText(planType) || 'Free';
      existing.displayName = cleanAuthor;
      existing.isAnonymous = Boolean(isAnonymous);
      existing.updatedAt = now;

      if (isDemo) this.saveDemo();
      else this.save();

      return existing;
    }

    const newReview = {
      id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      toolId: cleanToolId,
      userId,
      displayName: cleanAuthor,
      isAnonymous: Boolean(isAnonymous),
      rating: Math.round(numRating),
      reviewTitle: cleanTitle,
      reviewText: cleanText,
      useCase: sanitizeText(useCase) || 'General',
      usageFrequency: sanitizeText(usageFrequency) || 'Occasionally',
      planType: sanitizeText(planType) || 'Free',
      createdAt: now,
      updatedAt: now,
      helpfulCount: 0,
      helpfulUserIds: [],
      reportCount: 0,
      reports: [],
      status: 'published',
      verifiedUsage: false, // Transparent: only true when independently verified
      verificationMethod: 'Community Review — Usage not independently verified',
      isDemo: Boolean(isDemo)
    };

    targetList.unshift(newReview);

    if (isDemo) this.saveDemo();
    else this.save();

    return newReview;
  }

  // Toggle helpful vote (one vote per user)
  toggleHelpful(reviewId, userId, isDemo = false) {
    if (!reviewId || !userId) throw new Error('reviewId and userId are required.');
    const list = this.getDataset(isDemo);
    const review = list.find(r => r.id === reviewId);
    if (!review) throw new Error('Review not found.');

    if (!Array.isArray(review.helpfulUserIds)) {
      review.helpfulUserIds = [];
    }

    const userIndex = review.helpfulUserIds.indexOf(userId);
    let userHasLiked = false;

    if (userIndex !== -1) {
      // Toggle off
      review.helpfulUserIds.splice(userIndex, 1);
      userHasLiked = false;
    } else {
      // Add like
      review.helpfulUserIds.push(userId);
      userHasLiked = true;
    }

    review.helpfulCount = review.helpfulUserIds.length;

    if (isDemo) this.saveDemo();
    else this.save();

    return {
      reviewId,
      helpfulCount: review.helpfulCount,
      userHasLiked
    };
  }

  // Report review with reason
  reportReview(reviewId, reportData = {}, isDemo = false) {
    if (!reviewId) throw new Error('reviewId is required.');
    const list = this.getDataset(isDemo);
    const review = list.find(r => r.id === reviewId);
    if (!review) throw new Error('Review not found.');

    const { reason = 'Other', details = '', userId = 'anon_reporter' } = reportData;

    if (!Array.isArray(review.reports)) {
      review.reports = [];
    }

    // Check if same user already reported
    const alreadyReported = review.reports.some(rep => rep.userId === userId);
    if (!alreadyReported) {
      review.reports.push({
        reason: sanitizeText(reason),
        details: sanitizeText(details),
        userId,
        timestamp: new Date().toISOString()
      });
      review.reportCount = review.reports.length;

      // Automatically flag for moderation if reportCount >= 1
      if (review.status === 'published') {
        review.status = 'flagged';
      }

      if (isDemo) this.saveDemo();
      else this.save();
    }

    return {
      reviewId,
      reportCount: review.reportCount,
      status: review.status
    };
  }

  // Admin: Get reviews for moderation dashboard
  getModerationReviews(statusFilter = 'all') {
    let list = [...this.reviews];

    if (statusFilter === 'reported' || statusFilter === 'flagged') {
      list = list.filter(r => r.reportCount > 0 || r.status === 'flagged');
    } else if (statusFilter === 'removed') {
      list = list.filter(r => r.status === 'removed');
    } else if (statusFilter === 'published') {
      list = list.filter(r => r.status === 'published');
    }

    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Admin: Update status
  updateStatus(reviewId, newStatus, moderationReason = '') {
    const review = this.reviews.find(r => r.id === reviewId);
    if (!review) throw new Error('Review not found.');

    const allowed = ['published', 'flagged', 'removed', 'pending'];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid status. Allowed: ${allowed.join(', ')}`);
    }

    review.status = newStatus;
    review.moderationReason = sanitizeText(moderationReason);
    review.updatedAt = new Date().toISOString();

    this.save();
    return review;
  }

  // Admin: Delete review permanently
  deleteReview(reviewId) {
    const idx = this.reviews.findIndex(r => r.id === reviewId);
    if (idx === -1) throw new Error('Review not found.');
    const removed = this.reviews.splice(idx, 1);
    this.save();
    return removed[0];
  }

  // Admin stats
  getAdminReviewStats() {
    const total = this.reviews.length;
    const published = this.reviews.filter(r => r.status === 'published').length;
    const reported = this.reviews.filter(r => r.reportCount > 0 || r.status === 'flagged').length;
    const removed = this.reviews.filter(r => r.status === 'removed').length;

    return {
      total,
      published,
      reported,
      removed
    };
  }
}

export const reviewDb = new ReviewDatabase();
