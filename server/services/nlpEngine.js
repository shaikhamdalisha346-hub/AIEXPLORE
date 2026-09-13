export function parseRequirement(query) {
  if (!query || typeof query !== 'string') {
    return {
      rawQuery: '',
      intent: 'General inquiry',
      detectedIntent: 'All-Rounder AI',
      primaryCategory: 'All-Rounder AI',
      primaryPurpose: 'Multi-purpose reasoning',
      purposes: ['Multi-purpose reasoning'],
      subcategories: [],
      budgetConstraint: 'flexible',
      targetUser: 'General Users',
      targetAudience: 'General Users',
      platforms: ['Web'],
      isExplicitPlatformRequested: false,
      experience: 'Beginner',
      requiredFeatures: ['AI Generation'],
      optionalFeatures: [],
      outputType: 'Interactive response',
      qualityExpectation: 'high',
      keywords: []
    };
  }

  const text = query.toLowerCase().trim();
  const tokens = text.replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(Boolean);

  // Category scores map
  const categoryScores = {
    'Presentation / PPT': 0,
    'Education / Study': 0,
    'Video': 0,
    'Website & App Building': 0,
    'Coding': 0,
    'Data Analysis': 0,
    'Image / Design': 0,
    'Voice / Audio': 0,
    'Writing': 0,
    'Automation': 0,
    '3D & Architecture': 0,
    'Productivity': 0,
    'All-Rounder AI': 0
  };

  const detectedPurposes = [];
  const requiredFeatures = [];

  // 1. PRESENTATION / PPT
  if (/\b(ppt|presentation|presentations|slide|slides|slidedeck|deck|powerpoint|pitch deck|pitchdeck|slideshow)\b/.test(text)) {
    categoryScores['Presentation / PPT'] += 55;
    detectedPurposes.push('Create Presentations');
    requiredFeatures.push('AI slide generation', 'Templates', 'Export to PPTX/PDF');
  }
  if (/\b(gamma|canva|magicslides|beautiful\.ai|slidesai|plus ai)\b/.test(text)) {
    categoryScores['Presentation / PPT'] += 35;
  }

  // 2. RESEARCH & CITATIONS (Specific preference over generic chatbots!)
  if (/\b(research|sources|citation|citations|reliable sources|academic|papers|thesis|literature review|arxiv|fact check|fact-checked|peer review|peer-reviewed|scopus|pubmed)\b/.test(text)) {
    categoryScores['Education / Study'] += 60;
    detectedPurposes.push('Research & Academic Citations');
    requiredFeatures.push('Web research', 'Source citations', 'Literature review');
  }
  if (/\b(perplexity|notebooklm|elicit|consensus|scispace|connected papers)\b/.test(text)) {
    categoryScores['Education / Study'] += 40;
  }

  // 3. STUDY & PDF ANALYSIS
  if (/\b(pdf|pdfs|textbook|textbooks|study|studying|300-page|long document|document analysis|summarize pdf|study guide|homework|revision|exam prep|flashcards|flashcard|quizlet)\b/.test(text)) {
    categoryScores['Education / Study'] += 55;
    detectedPurposes.push('Summarize PDFs & Long Documents', 'Study & Exam Prep');
    requiredFeatures.push('PDF grounding', 'Document Q&A', 'Citation backlinking');
  }

  // 4. VIDEO & REELS / CAPTIONS
  if (/\b(reel|reels|instagram reel|tiktok|shorts|short-form|video|videos|subtitles|caption|captions|auto-caption|clip|clips|capcut|invideo|veed|runway|kling|pika|luma)\b/.test(text)) {
    categoryScores['Video'] += 55;
    detectedPurposes.push('Create Videos & Reels', 'Video Editing & Subtitles');
    requiredFeatures.push('Auto-captions', 'Video editing timeline', 'Templates');
  }
  if (/\b(cinematic|vfx|generative video|ai video)\b/.test(text)) {
    categoryScores['Video'] += 35;
    detectedPurposes.push('Cinematic AI Video');
  }
  if (/\b(avatar|talking avatar|heygen)\b/.test(text)) {
    categoryScores['Video'] += 40;
    detectedPurposes.push('Create AI Avatars');
  }

  // 5. WEBSITE BUILDER WITHOUT CODING
  if (/\b(website|landing page|webpage|web page|portfolio)\b/.test(text) && /\b(without coding|no code|no-code|builder|drag and drop|without code|framer|webflow|wix)\b/.test(text)) {
    categoryScores['Website & App Building'] += 65;
    detectedPurposes.push('Build Websites without Coding');
    requiredFeatures.push('No-code visual editor', 'Prompt-to-website', 'Responsive layout');
  } else if (/\b(app|application|mobile app|saas)\b/.test(text) && /\b(using ai|build an app|create an app|lovable|bolt|flutterflow|bubble)\b/.test(text)) {
    categoryScores['Website & App Building'] += 65;
    detectedPurposes.push('Build Apps using AI');
    requiredFeatures.push('Fullstack code generation', 'Database integration');
  }

  // 6. CODING & ENGINEERING
  if (/\b(code|coding|programmer|programming|developer|fullstack|frontend|backend|react|python|javascript|debug|debugging|bug|ide|cursor|github copilot|replit|windsurf)\b/.test(text)) {
    // If not explicitly "without coding"
    if (!/\bwithout coding|no code|no-code\b/.test(text)) {
      categoryScores['Coding'] += 55;
      detectedPurposes.push('Code & Autonomous Engineering');
      requiredFeatures.push('Context-aware autocomplete', 'Repo-wide indexing');
    }
  }

  // 7. DATA ANALYSIS & EXCEL
  if (/\b(excel|spreadsheet|spreadsheets|csv|analyze data|data analysis|chart|charts|graphs|julius|formula bot|sql|rows)\b/.test(text)) {
    categoryScores['Data Analysis'] += 60;
    detectedPurposes.push('Analyze Data & Spreadsheets', 'Data Visualization & Charts');
    requiredFeatures.push('Spreadsheet data analysis', 'Chart generation');
  }

  // 8. VOICE & AUDIO & MUSIC
  if (/\b(music|song|songs|singing|audio track|beat|suno|udio|soundraw)\b/.test(text)) {
    categoryScores['Voice / Audio'] += 60;
    detectedPurposes.push('Generate Music & Sound Effects');
    requiredFeatures.push('Music generation', 'Full song synthesis');
  } else if (/\b(voice|tts|text to speech|text-to-speech|speech to text|voiceover|voice-over|narration|clone a voice|voice cloning|elevenlabs|murf|speechify)\b/.test(text)) {
    categoryScores['Voice / Audio'] += 60;
    detectedPurposes.push('Generate Voice & Voiceover', 'Text-to-Speech');
    if (text.includes('clone')) detectedPurposes.push('Voice Cloning');
    requiredFeatures.push('Natural emotional voices', 'Voice cloning');
  }

  // 9. IMAGE / DESIGN / BACKGROUND REMOVAL / LOGO
  if (/\b(remove background|background remover|cutout|remove the background|cut out)\b/.test(text)) {
    categoryScores['Image / Design'] += 65;
    detectedPurposes.push('Edit Images & Background Removal');
    requiredFeatures.push('1-click background removal', 'Transparent PNG');
  } else if (/\b(logo|logos|branding|brand identity|looka|brandmark)\b/.test(text)) {
    categoryScores['Image / Design'] += 60;
    detectedPurposes.push('Create Logos & Branding');
    requiredFeatures.push('Logo generation', 'Vector export');
  } else if (/\b(image|images|art|artwork|draw|midjourney|flux|photorealistic|illustration)\b/.test(text)) {
    categoryScores['Image / Design'] += 45;
    detectedPurposes.push('Generate Images & Art');
    requiredFeatures.push('Photorealistic rendering', 'High resolution');
  }

  // 10. WRITING & SEO
  if (/\b(seo|seo article|blog post|copywriting|paraphrase|proofread|grammar|essay|writesonic|jasper|copy\.ai|quillbot|grammarly)\b/.test(text)) {
    categoryScores['Writing'] += 50;
    detectedPurposes.push('Write Content & Copywriting');
    if (text.includes('seo')) {
      detectedPurposes.push('SEO & Keyword Optimization');
      requiredFeatures.push('SEO optimization score', 'Keyword density');
    }
  }

  // 11. AUTOMATION
  if (/\b(automate|automation|repetitive tasks|workflow|workflows|zapier|make\.com|n8n)\b/.test(text)) {
    categoryScores['Automation'] += 65;
    detectedPurposes.push('Automate Repetitive Tasks & Workflows');
    requiredFeatures.push('Visual workflow builder', 'Webhook integrations');
  }

  // 12. 3D & ARCHITECTURE
  if (/\b(3d|3d models|3d mesh|spline|meshy|architecture)\b/.test(text)) {
    categoryScores['3D & Architecture'] += 65;
    detectedPurposes.push('3D Modeling & Generation');
    requiredFeatures.push('Text-to-3D', 'Mesh export');
  }

  // 13. MEETINGS & TRANSCRIPTION
  if (/\b(meeting|meetings|transcribe a meeting|meeting notes|zoom|teams|otter|fathom|fireflies)\b/.test(text)) {
    categoryScores['Productivity'] += 55;
    detectedPurposes.push('Transcribe Audio & Meeting Notes');
    requiredFeatures.push('Automated transcription', 'Meeting action items');
  }

  // 14. RESUME & CAREER
  if (/\b(resume|cv|cover letter|interview prep|job interview)\b/.test(text)) {
    categoryScores['Productivity'] += 55;
    detectedPurposes.push('Resume & Career Preparation');
    requiredFeatures.push('ATS resume formatting', 'Keyword targeting');
  }

  // 15. ALL-ROUNDER (Only if explicitly general or no specific intent)
  if (/\b(everything|almost everything|many tasks|all tasks|multipurpose|multi-purpose|general|all-in-one|swiss army|overall assistant|chatgpt)\b/.test(text)) {
    categoryScores['All-Rounder AI'] += 45;
    detectedPurposes.push('Multi-purpose reasoning');
  }

  // Budget detection
  let budgetConstraint = 'flexible';
  if (/\b(free|no cost|without paying|zero cost|free of cost|free plan|free tier|unpaid|cheap)\b/.test(text)) {
    budgetConstraint = 'free';
  } else if (/\b(paid|pro|premium|subscription|enterprise|commercial license)\b/.test(text)) {
    budgetConstraint = 'paid';
  }

  // Target User / Audience detection
  let targetUser = 'General Users';
  if (/\b(college|student|students|university|campus|school|homework|class|exam)\b/.test(text)) {
    targetUser = 'Students';
  } else if (/\b(developer|coder|programmer|engineer|software)\b/.test(text)) {
    targetUser = 'Developers';
  } else if (/\b(creator|influencer|youtube|instagram|reels|tiktok|vlogger)\b/.test(text)) {
    targetUser = 'Content Creators';
  } else if (/\b(researcher|scientist|academic|phd|scholar)\b/.test(text)) {
    targetUser = 'Researchers';
  } else if (/\b(business|corporate|work|office|executive|startup|founder|client)\b/.test(text)) {
    targetUser = 'Professionals';
  }

  // Platform detection
  const platforms = [];
  if (/\b(mobile|phone|android|ios|iphone|ipad)\b/.test(text)) {
    if (/\b(android)\b/.test(text)) platforms.push('Android');
    if (/\b(ios|iphone|ipad)\b/.test(text)) platforms.push('iOS');
    if (platforms.length === 0) platforms.push('Android', 'iOS');
  }
  if (/\b(mac|macos|apple)\b/.test(text)) platforms.push('Mac');
  if (/\b(windows|pc)\b/.test(text)) platforms.push('Windows');
  if (/\b(web|browser|online)\b/.test(text)) platforms.push('Web');

  // Find best scoring category
  let primaryCategory = 'All-Rounder AI';
  let highestScore = 0;

  for (const [cat, score] of Object.entries(categoryScores)) {
    if (score > highestScore) {
      highestScore = score;
      primaryCategory = cat;
    }
  }

  if (highestScore === 0) {
    primaryCategory = 'All-Rounder AI';
    detectedPurposes.push('Multi-purpose reasoning');
  }

  const primaryPurpose = detectedPurposes[0] || 'Multi-purpose reasoning';

  // Determine subcategory & output type
  let subcategory = 'General';
  let outputType = 'Interactive solution';
  if (primaryCategory === 'Presentation / PPT') {
    subcategory = 'AI Slide Generator';
    outputType = 'Presentation slide deck (.pptx / .pdf)';
  } else if (primaryCategory === 'Education / Study') {
    subcategory = 'Research & Study Grounding';
    outputType = 'Citation-backed insights & study notes';
  } else if (primaryCategory === 'Video') {
    subcategory = 'Short-Form Video & Editing';
    outputType = 'Rendered video file (.mp4)';
  } else if (primaryCategory === 'Website & App Building') {
    subcategory = 'No-Code Web / App Studio';
    outputType = 'Interactive web application';
  } else if (primaryCategory === 'Coding') {
    subcategory = 'AI Code Assistant & IDE';
    outputType = 'Production-ready code & tests';
  } else if (primaryCategory === 'Voice / Audio') {
    subcategory = 'Audio & Voice Synthesis';
    outputType = 'Audio waveform (.mp3 / .wav)';
  } else if (primaryCategory === 'Image / Design') {
    subcategory = 'Visual Synthesis & Editing';
    outputType = 'High-resolution graphic (.png / .svg)';
  } else if (primaryCategory === 'Data Analysis') {
    subcategory = 'Spreadsheet & Visual Analytics';
    outputType = 'Interactive charts & data tables';
  } else if (primaryCategory === 'Automation') {
    subcategory = 'Workflow Automation Engine';
    outputType = 'Automated execution pipeline';
  }

  return {
    rawQuery: query,
    tokens,
    intent: detectedPurposes[0] || primaryCategory,
    detectedIntent: primaryCategory,
    primaryCategory,
    primaryPurpose,
    purposes: detectedPurposes.length > 0 ? Array.from(new Set(detectedPurposes)) : [primaryPurpose],
    subcategory,
    categoryScores,
    budgetConstraint,
    targetUser,
    targetAudience: targetUser,
    platforms: platforms.length > 0 ? platforms : ['Web'],
    isExplicitPlatformRequested: platforms.length > 0,
    experience: 'Beginner / Intermediate',
    requiredFeatures: Array.from(new Set(requiredFeatures)),
    optionalFeatures: ['Cloud sync', 'Collaboration'],
    outputType,
    qualityExpectation: 'high',
    keywords: tokens.slice(0, 10)
  };
}
