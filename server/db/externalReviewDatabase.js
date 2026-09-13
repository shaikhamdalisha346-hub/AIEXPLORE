import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXTERNAL_REVIEWS_FILE = path.join(__dirname, 'external_reviews.json');
const SOURCES_CONFIG_FILE = path.join(__dirname, '../data/externalReviewSources.json');

// XSS Sanitizer: strips HTML tags, scripts, and javascript: URLs
function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

class ExternalReviewDatabase {
  constructor() {
    this.reviews = [];
    this.sources = [];
    this.load();
    this.loadSources();
  }

  load() {
    try {
      if (fs.existsSync(EXTERNAL_REVIEWS_FILE)) {
        const raw = fs.readFileSync(EXTERNAL_REVIEWS_FILE, 'utf-8');
        this.reviews = JSON.parse(raw);
      } else {
        this.reviews = [];
        this.save();
      }
    } catch (err) {
      console.error('Error loading external reviews:', err);
      this.reviews = [];
    }
  }

  loadSources() {
    try {
      if (fs.existsSync(SOURCES_CONFIG_FILE)) {
        const raw = fs.readFileSync(SOURCES_CONFIG_FILE, 'utf-8');
        this.sources = JSON.parse(raw);
      } else {
        this.sources = [];
      }
    } catch (err) {
      console.error('Error loading external review sources:', err);
      this.sources = [];
    }
  }

  save() {
    try {
      fs.writeFileSync(EXTERNAL_REVIEWS_FILE, JSON.stringify(this.reviews, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Error saving external reviews:', err);
      return false;
    }
  }

  saveSources() {
    try {
      fs.writeFileSync(SOURCES_CONFIG_FILE, JSON.stringify(this.sources, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Error saving external review sources:', err);
      return false;
    }
  }

  getSources() {
    return [...this.sources];
  }

  getSourceById(sourceId) {
    if (!sourceId) return null;
    return this.sources.find(s => s.id === sourceId.toLowerCase().trim()) || null;
  }

  // Validate that sourceUrl is HTTPS and belongs strictly to approved platform domains
  validateSourceUrl(sourceUrl, sourceId) {
    if (!sourceUrl || typeof sourceUrl !== 'string') {
      return { valid: false, reason: 'URL is required' };
    }

    try {
      const parsed = new URL(sourceUrl);
      if (parsed.protocol !== 'https:') {
        return { valid: false, reason: 'Source URL must use secure HTTPS protocol' };
      }

      const hostname = parsed.hostname.toLowerCase();
      const sourceConfig = this.getSourceById(sourceId);

      if (sourceConfig && Array.isArray(sourceConfig.allowedDomains)) {
        const isAllowed = sourceConfig.allowedDomains.some(d => 
          hostname === d || hostname.endsWith('.' + d)
        );
        if (!isAllowed) {
          return { valid: false, reason: `URL host "${hostname}" does not match approved domains for ${sourceConfig.name}` };
        }
      } else {
        // Generic fallback check for known reputable review domains
        const generalApproved = ['g2.com', 'capterra.com', 'trustpilot.com', 'producthunt.com', 'apps.apple.com', 'play.google.com'];
        const isApproved = generalApproved.some(d => hostname === d || hostname.endsWith('.' + d));
        if (!isApproved) {
          return { valid: false, reason: `URL host "${hostname}" is not an approved external review platform domain` };
        }
      }

      return { valid: true, normalizedUrl: parsed.toString() };
    } catch (err) {
      return { valid: false, reason: 'Invalid URL format' };
    }
  }

  // Get external reviews for any of the 160 tools by exact toolId
  getReviewsForTool(toolId) {
    if (!toolId) return { toolId: '', sources: [], count: 0, hasExternalReviews: false };
    const cleanId = toolId.toLowerCase().trim();

    // Query external records strictly by toolId
    const records = this.reviews.filter(r => 
      r.toolId.toLowerCase() === cleanId && 
      r.status === 'active'
    );

    // Map and enrich with source configuration
    const enrichedSources = records.map(r => {
      const sourceCfg = this.getSourceById(r.sourceId || r.source) || {};
      return {
        id: r.id,
        toolId: r.toolId,
        sourceId: r.sourceId || r.source?.toLowerCase(),
        sourceName: r.sourceName || sourceCfg.name || r.source,
        sourceType: r.sourceType || sourceCfg.type || 'user_review_platform',
        sourceUrl: r.sourceUrl,
        rating: typeof r.rating === 'number' ? r.rating : null,
        ratingScale: r.ratingScale || sourceCfg.ratingScale || 5,
        reviewCount: typeof r.reviewCount === 'number' ? r.reviewCount : null,
        reviewTitle: r.reviewTitle ? sanitizeText(r.reviewTitle) : null,
        reviewExcerpt: r.reviewExcerpt ? sanitizeText(r.reviewExcerpt) : null,
        lastVerified: r.lastVerified || null,
        dataMethod: r.dataMethod || 'permitted_public_data',
        status: r.status,
        reviewerName: r.reviewerName ? sanitizeText(r.reviewerName) : null
      };
    });

    return {
      toolId: cleanId,
      sources: enrichedSources,
      count: enrichedSources.length,
      hasExternalReviews: enrichedSources.length > 0
    };
  }

  // Source-specific summary (never artificially combines ratings from different platforms)
  getSummaryForTool(toolId) {
    const { sources, hasExternalReviews } = this.getReviewsForTool(toolId);

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
      lastVerified: s.lastVerified
    }));

    // Generate summary themes ONLY if actual excerpts are present from multiple sources
    const excerpts = sources.filter(s => s.reviewExcerpt && s.reviewExcerpt.length > 15);
    let commonThemes = null;

    if (excerpts.length >= 2) {
      commonThemes = {
        attribution: 'AI-generated summary based on available external user-review data.',
        highlights: excerpts.map(e => `${e.sourceName} reviewers note: "${e.reviewExcerpt}"`),
        summaryText: `Independent reviews across ${sources.map(s => s.sourceName).join(' and ')} reflect real user experiences covering capabilities, workflow impact, and feature trade-offs.`
      };
    }

    return {
      toolId,
      hasData: true,
      sourcesSummary,
      commonThemes
    };
  }

  // Add external review record whose source/data has been verified by the administrator or obtained through an authorized/permitted data source
  addReview(data) {
    const {
      toolId,
      sourceId,
      sourceName,
      sourceUrl,
      rating,
      ratingScale = 5,
      reviewCount,
      reviewTitle,
      reviewExcerpt,
      reviewerName,
      lastVerified = new Date().toISOString().slice(0, 10),
      dataMethod = 'manual',
      isVerifiedByAdmin = false,
      status = 'active'
    } = data;

    if (!toolId) throw new Error('toolId is required.');
    const cleanToolId = toolId.toLowerCase().trim();

    // Verify toolId exists in tool catalog
    const toolExists = db.getById(cleanToolId);
    if (!toolExists) {
      throw new Error(`Tool with ID "${cleanToolId}" does not exist in the catalog.`);
    }

    if (!sourceId && !sourceName) {
      throw new Error('sourceId or sourceName is required.');
    }

    const cleanSourceId = (sourceId || sourceName).toLowerCase().replace(/[^a-z0-9]/g, '_');
    const sourceConfig = this.getSourceById(cleanSourceId);
    const finalSourceName = sourceName || sourceConfig?.name || cleanSourceId;

    // Validate Source URL
    const urlCheck = this.validateSourceUrl(sourceUrl, cleanSourceId);
    if (!urlCheck.valid) {
      throw new Error(`Invalid source URL: ${urlCheck.reason}`);
    }

    // Validate rating
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 0 || numRating > 5) {
      throw new Error('Rating must be a valid number between 0 and 5.');
    }

    // Do not automatically mark manually entered data as verified unless explicitly verified by admin
    const initialStatus = (dataMethod === 'manual' && !isVerifiedByAdmin) 
      ? 'needs_verification' 
      : status;

    const newRecord = {
      id: `ext_${cleanToolId}_${cleanSourceId}_${Date.now()}`,
      toolId: cleanToolId,
      sourceId: cleanSourceId,
      sourceName: finalSourceName,
      sourceUrl: urlCheck.normalizedUrl,
      rating: Number(numRating.toFixed(1)),
      ratingScale: Number(ratingScale) || 5,
      reviewCount: typeof reviewCount === 'number' ? Math.max(0, Math.round(reviewCount)) : (Number(reviewCount) || null),
      reviewTitle: reviewTitle ? sanitizeText(reviewTitle) : null,
      reviewExcerpt: reviewExcerpt ? sanitizeText(reviewExcerpt) : null,
      reviewerName: reviewerName ? sanitizeText(reviewerName) : null,
      sourceType: sourceConfig?.type || 'user_review_platform',
      lastVerified,
      dataMethod,
      isVerifiedByAdmin: Boolean(isVerifiedByAdmin),
      status: initialStatus
    };

    // Replace if same tool + same source already exists
    const existingIndex = this.reviews.findIndex(r => 
      r.toolId === cleanToolId && 
      r.sourceId === cleanSourceId
    );

    if (existingIndex !== -1) {
      this.reviews[existingIndex] = { ...this.reviews[existingIndex], ...newRecord };
      this.save();
      return this.reviews[existingIndex];
    }

    this.reviews.push(newRecord);
    this.save();
    return newRecord;
  }

  // Update existing record
  updateReview(id, updateData) {
    const record = this.reviews.find(r => r.id === id);
    if (!record) throw new Error(`External review with ID "${id}" not found.`);

    if (updateData.sourceUrl) {
      const urlCheck = this.validateSourceUrl(updateData.sourceUrl, record.sourceId);
      if (!urlCheck.valid) {
        throw new Error(`Invalid source URL: ${urlCheck.reason}`);
      }
      record.sourceUrl = urlCheck.normalizedUrl;
    }

    if (updateData.rating !== undefined) {
      const num = Number(updateData.rating);
      if (isNaN(num) || num < 0 || num > 5) throw new Error('Invalid rating');
      record.rating = Number(num.toFixed(1));
    }

    if (updateData.reviewCount !== undefined) {
      record.reviewCount = Number(updateData.reviewCount) || null;
    }

    if (updateData.reviewExcerpt !== undefined) {
      record.reviewExcerpt = sanitizeText(updateData.reviewExcerpt);
    }

    if (updateData.status) {
      record.status = updateData.status;
    }

    if (updateData.lastVerified) {
      record.lastVerified = updateData.lastVerified;
    }

    if (updateData.isVerifiedByAdmin !== undefined) {
      record.isVerifiedByAdmin = Boolean(updateData.isVerifiedByAdmin);
      if (record.isVerifiedByAdmin && record.status === 'needs_verification') {
        record.status = 'active';
      }
    }

    this.save();
    return record;
  }

  deleteReview(id) {
    const idx = this.reviews.findIndex(r => r.id === id);
    if (idx === -1) throw new Error(`External review with ID "${id}" not found.`);
    const deleted = this.reviews.splice(idx, 1);
    this.save();
    return deleted[0];
  }

  getAll(filter = 'all') {
    if (filter === 'active') return this.reviews.filter(r => r.status === 'active');
    if (filter === 'needs_verification') return this.reviews.filter(r => r.status === 'needs_verification');
    return [...this.reviews];
  }
}

export const externalReviewDb = new ExternalReviewDatabase();
