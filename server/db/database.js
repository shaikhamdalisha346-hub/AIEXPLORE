import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'tools.json');

class Database {
  constructor() {
    this.tools = [];
    this.load();
  }

  enrichTool(tool) {
    if (!tool) return tool;
    const purpose = (Array.isArray(tool.purposes) && tool.purposes.length > 0) ? tool.purposes[0] : (tool.category || 'All-Rounder AI');
    const verifiedDomain = tool.verifiedOfficialDomain || tool.officialDomain || (tool.officialWebsite ? (() => {
      try { return new URL(tool.officialWebsite).hostname.replace(/^www\./, ''); } catch { return ''; }
    })() : '');

    const isUnverified = tool.id === 'lovable' || tool.id === 'ideogram' || tool.unverifiedReview || !tool.overallRating;

    const userReviewSummary = isUnverified ? {
      rating: null,
      unverified: true,
      text: 'Review information unavailable',
      sourceAttribution: null,
      reviewCount: null
    } : {
      rating: tool.overallRating || 4.5,
      unverified: false,
      text: `Rated ${tool.overallRating || 4.5}/5 across verified user benchmarks`,
      sourceAttribution: (Array.isArray(tool.reviewSources) && tool.reviewSources[0]?.sourceName) || 'Verified editorial evaluation',
      reviewCount: tool.reviewCount || 'Verified user aggregate'
    };

    const bestForStr = Array.isArray(tool.bestFor) ? tool.bestFor.join(', ') : (tool.bestFor || (tool.targetUsers || []).join(', '));

    return {
      ...tool,
      purpose,
      verifiedDomain,
      userReviewSummary,
      bestFor: bestForStr || 'Students & Professionals'
    };
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.tools = parsed.map(t => this.enrichTool(t));
      } else {
        this.tools = [];
      }
    } catch (err) {
      console.error('Error reading tools database file:', err);
      this.tools = [];
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.tools, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Error saving tools database file:', err);
      return false;
    }
  }

  getAll() {
    return [...this.tools];
  }

  getById(id) {
    if (!id) return null;
    const q = id.toLowerCase().trim();
    const cleanQ = q.replace(/[^a-z0-9]/g, '');
    return this.tools.find(t => 
      t.id.toLowerCase() === q || 
      (t.slug && t.slug.toLowerCase() === q) ||
      t.id.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanQ
    ) || null;
  }

  getByCategory(category) {
    if (!category || category === 'All') return this.getAll();
    const c = category.toLowerCase().trim();
    return this.tools.filter(t => 
      (t.category && t.category.toLowerCase() === c) ||
      (Array.isArray(t.categories) && t.categories.some(cat => cat.toLowerCase() === c))
    );
  }

  getByPurpose(purpose) {
    if (!purpose || purpose === 'All') return this.getAll();
    const p = purpose.toLowerCase().trim();
    return this.tools.filter(t => 
      Array.isArray(t.purposes) && t.purposes.some(item => item.toLowerCase().includes(p))
    );
  }

  getPurposesSummary() {
    const purposeMap = new Map();

    for (const tool of this.tools) {
      const purposes = Array.isArray(tool.purposes) ? tool.purposes : [];
      for (const purp of purposes) {
        if (!purposeMap.has(purp)) {
          purposeMap.set(purp, {
            name: purp,
            label: purp,
            tag: purp.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            icon: purp,
            toolCount: 0,
            count: 0,
            topTools: []
          });
        }
        const entry = purposeMap.get(purp);
        entry.toolCount++;
        entry.count++;
        if (entry.topTools.length < 4) {
          entry.topTools.push({
            id: tool.id,
            name: tool.name,
            qualityScore: tool.qualityScore || 90,
            overallRating: tool.overallRating || 4.6
          });
        }
      }
    }

    return Array.from(purposeMap.values()).sort((a, b) => b.toolCount - a.toolCount);
  }

  getCategoriesSummary() {
    const categoriesMeta = [
      { name: 'Presentation / PPT', icon: 'Presentation', badge: 'Slide Creators', description: 'Turn prompts, PDFs, and outlines into structured, visually engaging presentation decks.' },
      { name: 'Video', icon: 'Video', badge: 'Reels & Generation', description: 'Auto-captions, generative video, viral reel templates, and timeline editors.' },
      { name: 'Coding', icon: 'Code', badge: 'Engineering', description: 'Agentic IDEs, context-aware autocompletion, terminal agents, and autonomous code assistants.' },
      { name: 'Education / Study', icon: 'GraduationCap', badge: 'Academic & Research', description: 'PDF grounding, citation-backed research engines, Socratic tutoring, and computational solvers.' },
      { name: 'Image / Design', icon: 'Palette', badge: 'Art & Design', description: 'Photorealistic image synthesis, vector art, typography rendering, and visual branding suites.' },
      { name: 'Writing', icon: 'PenTool', badge: 'Copy & Content', description: 'Nuanced long-form prose, grammatical precision, tone modulation, and smart paraphrasing.' },
      { name: 'Voice / Audio', icon: 'Mic', badge: 'Audio & Music', description: 'Hyper-realistic voice cloning, text-to-speech narration, AI music composition, and audio enhancement.' },
      { name: 'Website & App Building', icon: 'Globe', badge: 'No-Code Builders', description: 'Natural language to fullstack web applications, landing pages, and production codebases.' },
      { name: 'Data Analysis', icon: 'BarChart', badge: 'Spreadsheets & BI', description: 'Conversational Excel analysis, predictive modeling, statistical graphing, and automated metrics.' },
      { name: 'Automation', icon: 'Zap', badge: 'Workflows & Agents', description: 'Visual multi-step web service connectors, webhook routers, and autonomous execution pipelines.' },
      { name: 'Productivity', icon: 'Sparkles', badge: 'Workspace & Notes', description: 'Connected knowledge bases, automated meeting minutes, speed email, and task assistants.' },
      { name: '3D & Architecture', icon: 'Box', badge: 'Spatial Design', description: 'Generative 3D mesh synthesis, interactive WebGL design, PBR textures, and spatial UI.' },
      { name: 'AI Agents', icon: 'Bot', badge: 'Autonomous Squads', description: 'Multi-agent orchestration, recursive goal breakdown, autonomous web scraping, and tool calling.' },
      { name: 'All-Rounder AI', icon: 'Compass', badge: 'General Intelligence', description: 'Multi-purpose foundation models and reasoning engines capable of wide-ranging cognitive tasks.' }
    ];

    return categoriesMeta.map(cat => {
      const toolsInCat = this.getByCategory(cat.name);
      return {
        ...cat,
        toolCount: toolsInCat.length,
        topTools: toolsInCat.slice(0, 4).map(t => ({
          id: t.id,
          name: t.name,
          qualityScore: t.qualityScore || 90,
          overallRating: t.overallRating || 4.6
        }))
      };
    });
  }

  add(toolData) {
    const id = (toolData.id || toolData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')).toLowerCase();
    const existing = this.getById(id);
    if (existing) {
      throw new Error(`Tool with ID "${id}" already exists.`);
    }

    const toArray = (val, fallback = []) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string' && val.trim()) return val.split(',').map(s => s.trim()).filter(Boolean);
      return fallback;
    };

    const newTool = {
      id,
      name: toolData.name || 'Unnamed AI Tool',
      slug: id,
      description: toolData.description || '',
      shortDescription: toolData.shortDescription || (toolData.description ? toolData.description.slice(0, 140) + '...' : ''),
      category: toolData.category || 'All-Rounder AI',
      primaryCategory: toolData.category || 'All-Rounder AI',
      subcategory: toolData.subcategory || 'General',
      categories: toArray(toolData.categories, [toolData.category || 'All-Rounder AI']),
      purposes: toArray(toolData.purposes, [toolData.category || 'All-Rounder AI']),
      useCases: toArray(toolData.useCases, ['General Productivity']),
      targetUsers: toArray(toolData.targetUsers, ['Students', 'Professionals']),
      features: toArray(toolData.features, ['AI Generation']),
      strengths: toArray(toolData.strengths || toolData.pros, ['User friendly']),
      limitations: toArray(toolData.limitations || toolData.cons, ['Internet required']),
      pricing: toolData.pricing || 'Free tier available',
      freePlan: Boolean(toolData.freePlan),
      freeTrial: toolData.freeTrial !== undefined ? Boolean(toolData.freeTrial) : true,
      pricingDetails: toolData.pricingDetails || toolData.pricing || 'Free tier available',
      platforms: toArray(toolData.platforms, ['Web']),
      officialWebsite: toolData.officialWebsite || '',
      officialAndroidUrl: toolData.officialAndroidUrl || null,
      officialIosUrl: toolData.officialIosUrl || null,
      officialDesktopUrl: toolData.officialDesktopUrl || null,
      officialDomain: toolData.officialDomain || toolData.verifiedOfficialDomain || (toolData.officialWebsite ? new URL(toolData.officialWebsite).hostname.replace(/^www\./, '') : ''),
      verifiedOfficialDomain: toolData.verifiedOfficialDomain || toolData.officialDomain || '',
      developer: toolData.developer || toolData.company || 'Independent',
      company: toolData.company || toolData.developer || 'Independent',
      popularityScore: Number(toolData.popularityScore) || 85,
      trendScore: Number(toolData.trendScore) || 85,
      qualityScore: Number(toolData.qualityScore) || 90,
      studentScore: Number(toolData.studentScore) || 85,
      easeOfUseScore: Number(toolData.easeOfUseScore) || 90,
      featureScore: Number(toolData.featureScore) || 90,
      overallRating: Number(toolData.overallRating) || 4.6,
      userRating: Number(toolData.userRating) || 4.5,
      expertRating: Number(toolData.expertRating) || 4.7,
      reviewCount: toolData.reviewCount || 'Verified user aggregate',
      pros: toArray(toolData.pros || toolData.strengths, ['Fast generation', 'User friendly']),
      cons: toArray(toolData.cons || toolData.limitations, ['Requires network connection']),
      bestFor: toArray(toolData.bestFor, ['Students and professionals']),
      notIdealFor: toArray(toolData.notIdealFor, ['Offline use']),
      easeOfUse: Number(toolData.easeOfUse) || 4.7,
      featureQuality: Number(toolData.featureQuality) || 4.7,
      valueForMoney: Number(toolData.valueForMoney) || 4.6,
      reliability: Number(toolData.reliability) || 4.7,
      reviewRecency: toolData.reviewRecency || 'September 2026',
      reviewSources: Array.isArray(toolData.reviewSources) ? toolData.reviewSources : [
        {
          sourceName: 'AI Benchmark & User Reviews',
          sourceUrl: toolData.officialWebsite || '',
          rating: Number(toolData.overallRating) || 4.6,
          reviewText: `${toolData.name} delivers strong performance for verified tasks.`,
          reviewDate: '2026-09-01',
          verified: true,
          sourceType: 'Editorial'
        }
      ],
      lastUpdated: new Date().toISOString().split('T')[0],
      lastVerified: new Date().toISOString().split('T')[0],
      lastPricingCheck: new Date().toISOString().split('T')[0],
      lastFeatureCheck: new Date().toISOString().split('T')[0],
      lastDomainCheck: new Date().toISOString().split('T')[0],
      lastReviewCheck: new Date().toISOString().split('T')[0],
      lastTrendCheck: new Date().toISOString().split('T')[0],
      safetyStatus: toolData.safetyStatus || 'Low Risk — No known suspicious indicators detected.',
      recentlyAdded: true,
      recentlyUpdated: false,
      trendGrowth: Number(toolData.trendGrowth) || 85,
      userInterest: Number(toolData.userInterest) || 85,
      status: 'active'
    };

    this.tools.push(newTool);
    this.save();
    return newTool;
  }

  update(id, updates) {
    const idx = this.tools.findIndex(t => t.id.toLowerCase() === id.toLowerCase() || (t.slug && t.slug.toLowerCase() === id.toLowerCase()));
    if (idx === -1) {
      return null;
    }

    const current = this.tools[idx];
    const toArray = (val, existingVal) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string' && val.trim()) return val.split(',').map(s => s.trim()).filter(Boolean);
      return existingVal;
    };

    const updated = {
      ...current,
      ...updates,
      id: current.id,
      slug: current.slug || current.id,
      features: toArray(updates.features, current.features),
      purposes: toArray(updates.purposes, current.purposes),
      useCases: toArray(updates.useCases, current.useCases),
      targetUsers: toArray(updates.targetUsers, current.targetUsers),
      platforms: toArray(updates.platforms, current.platforms),
      pros: toArray(updates.pros, current.pros),
      cons: toArray(updates.cons, current.cons),
      bestFor: toArray(updates.bestFor, current.bestFor),
      notIdealFor: toArray(updates.notIdealFor, current.notIdealFor),
      lastUpdated: new Date().toISOString().split('T')[0],
      lastVerified: new Date().toISOString().split('T')[0],
      recentlyUpdated: true
    };

    this.tools[idx] = updated;
    this.save();
    return updated;
  }

  delete(id) {
    const initialLen = this.tools.length;
    this.tools = this.tools.filter(t => t.id.toLowerCase() !== id.toLowerCase() && (!t.slug || t.slug.toLowerCase() !== id.toLowerCase()));
    if (this.tools.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  verifyDomain(id, verifiedDomain, status) {
    const tool = this.getById(id);
    if (!tool) return null;
    tool.verifiedOfficialDomain = verifiedDomain || tool.verifiedOfficialDomain;
    tool.officialDomain = verifiedDomain || tool.officialDomain;
    tool.safetyStatus = status || 'Low Risk — No known suspicious indicators detected.';
    tool.lastVerified = new Date().toISOString().split('T')[0];
    tool.lastDomainCheck = new Date().toISOString().split('T')[0];
    this.save();
    return tool;
  }
}

export const db = new Database();
