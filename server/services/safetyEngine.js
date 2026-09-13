import { URL } from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../db/tools.json');

// Base Whitelist of verified official domains
const BASE_OFFICIAL_DOMAINS = new Set([
  'gamma.app',
  'canva.com',
  'magicslides.app',
  'beautiful.ai',
  'slidesai.io',
  'plusdocs.com',
  'presentations.ai',
  'tome.app',
  'cursor.com',
  'github.com',
  'replit.com',
  'codeium.com',
  'tabnine.com',
  'aws.amazon.com',
  'perplexity.ai',
  'google.com',
  'notebooklm.google.com',
  'elicit.com',
  'consensus.app',
  'chatpdf.com',
  'humata.ai',
  'capcut.com',
  'invideo.io',
  'veed.io',
  'runwayml.com',
  'klingai.com',
  'lumalabs.ai',
  'pika.art',
  'heygen.com',
  'descript.com',
  'inshot.com',
  'framer.com',
  'webflow.com',
  'lovable.dev',
  'bolt.new',
  'v0.dev',
  'midjourney.com',
  'blackforestlabs.ai',
  'ideogram.ai',
  'adobe.com',
  'firefly.adobe.com',
  'podcast.adobe.com',
  'leonardo.ai',
  'photoroom.com',
  'remove.bg',
  'clipdrop.co',
  'magnific.ai',
  'looka.com',
  'brandmark.io',
  'recraft.ai',
  'krea.ai',
  'freepik.com',
  'elevenlabs.io',
  'suno.com',
  'udio.com',
  'speechify.com',
  'murf.ai',
  'otter.ai',
  'krisp.ai',
  'vocalremover.org',
  'soundraw.io',
  'beatoven.ai',
  'castmagic.io',
  'read.ai',
  'grammarly.com',
  'quillbot.com',
  'notion.so',
  'jasper.ai',
  'copy.ai',
  'writesonic.com',
  'rytr.me',
  'sudowrite.com',
  'novelai.net',
  'chatgpt.com',
  'openai.com',
  'claude.ai',
  'anthropic.com',
  'gemini.google.com',
  'deepseek.com',
  'x.ai',
  'microsoft.com',
  'copilot.microsoft.com',
  'wolframalpha.com',
  'quizlet.com',
  'khanacademy.org',
  'julius.ai',
  'make.com',
  'zapier.com',
  'n8n.io',
  'spline.design',
  'meshy.ai',
  'crewai.com',
  'deepl.com',
  'formulabot.com',
  'resume.io',
  'tealhq.com',
  'surferseo.com',
  'adcreative.ai',
  'flutterflow.io',
  'bubble.io',
  'pinecone.io',
  'huggingface.co',
  'groq.com',
  'replicate.com',
  'ollama.com',
  'fireflies.ai',
  'fathom.video',
  'supernormal.com',
  'harvey.ai',
  'casetext.com',
  'finchat.io',
  'alpha-sense.com',
  'snyk.io',
  'gitguardian.com',
  'outerbase.com',
  'mem.ai',
  'superhuman.com',
  'warp.dev',
  'typeset.io',
  'researchrabbit.ai',
  'connectedpapers.com',
  'semanticscholar.org',
  'scite.ai',
  'askyourpdf.com',
  'pdfgear.com',
  'rezi.ai',
  'kickresume.com',
  'you.com',
  'poe.com',
  'character.ai',
  'pi.ai',
  'playground.com',
  'vectorizer.ai',
  'rows.com',
  'akkio.com',
  'tableau.com',
  'sheetai.app',
  'retool.com',
  'glideapps.com',
  'softr.io',
  'dify.ai',
  'flowiseai.com',
  'langflow.org',
  'agpt.co',
  'taplio.com',
  'postwise.ai',
  'predis.ai',
  'simplified.com',
  'uizard.io',
  'usegalileo.ai',
  'relume.io',
  'durable.co',
  '10web.io',
  'phind.com',
  'coderabbit.ai',
  'together.ai',
  'weaviate.io',
  'trychroma.com',
  'wandb.ai',
  'kagi.com',
  'topazlabs.com',
  'mintlify.com',
  'play.ht'
]);

// Dynamically augment whitelist from tools database
function getVerifiedDomains() {
  const domainSet = new Set(BASE_OFFICIAL_DOMAINS);
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const tools = JSON.parse(raw);
      for (const t of tools) {
        if (t.officialDomain) domainSet.add(t.officialDomain.toLowerCase());
        if (t.verifiedOfficialDomain) domainSet.add(t.verifiedOfficialDomain.toLowerCase());
      }
    }
  } catch (e) {
    // Ignore and use base set
  }
  return domainSet;
}

// Suspicious patterns / tokens
const SUSPICIOUS_KEYWORDS = [
  'login', 'signin', 'account-verify', 'free-download', 'crack', 'keygen',
  'nulled', 'free-premium', 'claim-reward', 'bonus', 'airdrop', 'wallet-connect',
  'token-claim', 'secure-update', 'install-flash', 'update-browser', 'phish',
  'hacked', 'freepremium', 'crackversion', 'patch-download', 'bypass'
];

const HIGH_RISK_TLDS = new Set(['.xyz', '.top', '.tk', '.gq', '.cf', '.ml', '.work', '.fit', '.click', '.zip', '.mov', '.country', '.kim']);

export function analyzeUrlSafety(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      success: false,
      error: 'Please provide a valid URL string.',
      statusText: 'Safety verification temporarily unavailable. Please proceed cautiously.'
    };
  }

  let normalizedUrl = rawUrl.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(normalizedUrl);
  } catch {
    return {
      success: false,
      error: 'Invalid URL format.',
      riskScore: 90,
      riskLevel: 'High Risk',
      decision: 'BLOCK',
      statusText: 'High Risk — Invalid or corrupted URL structure.'
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const protocol = parsedUrl.protocol.toLowerCase();

  // Lexical Features Extraction
  const isHttps = protocol === 'https:';
  const urlLength = normalizedUrl.length;
  const dotCount = (hostname.match(/\./g) || []).length;
  const subdomainCount = Math.max(0, dotCount - 1);
  const hyphenCount = (hostname.match(/-/g) || []).length;
  const specialChars = (normalizedUrl.match(/[@%&=?_]/g) || []).length;
  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);

  const hasHighRiskTld = Array.from(HIGH_RISK_TLDS).some(tld => hostname.endsWith(tld));
  const fullUrlLower = normalizedUrl.toLowerCase();
  const foundKeywords = SUSPICIOUS_KEYWORDS.filter(k => fullUrlLower.includes(k));

  // Check verified domain whitelist
  const verifiedDomains = getVerifiedDomains();
  let isVerifiedOfficial = false;
  let matchedOfficialDomain = null;

  for (const domain of verifiedDomains) {
    if (hostname === domain || hostname.endsWith('.' + domain)) {
      isVerifiedOfficial = true;
      matchedOfficialDomain = domain;
      break;
    }
  }

  // Typosquatting / deceptive brand mimicry detection
  let deceptiveBrandDetected = false;
  const famousBrands = ['chatgpt', 'openai', 'claude', 'gamma', 'midjourney', 'elevenlabs', 'canva', 'cursor', 'runway', 'perplex'];
  for (const brand of famousBrands) {
    if (hostname.includes(brand) && !isVerifiedOfficial) {
      deceptiveBrandDetected = true;
      break;
    }
  }

  // Risk Score Heuristic (0 = safest, 100 = most dangerous)
  let riskScore = 15; // baseline

  if (!isHttps) riskScore += 35;
  if (isIpAddress) riskScore += 45;
  if (urlLength > 100) riskScore += 15;
  if (dotCount > 3) riskScore += 15;
  if (hyphenCount > 2) riskScore += 12;
  if (hasHighRiskTld) riskScore += 25;
  if (foundKeywords.length > 0) riskScore += (foundKeywords.length * 20);
  if (deceptiveBrandDetected) riskScore += 35;

  if (isVerifiedOfficial) {
    riskScore = Math.max(5, riskScore - 50); // Verified domain safety bonus
  }

  riskScore = Math.min(99, Math.max(5, riskScore));

  // ML Multi-class Softmax Simulation
  let pLow = 0;
  let pSuspicious = 0;
  let pMalicious = 0;

  if (riskScore <= 35) {
    pLow = (100 - riskScore) / 100;
    pSuspicious = (riskScore * 0.7) / 100;
    pMalicious = (riskScore * 0.3) / 100;
  } else if (riskScore <= 65) {
    pSuspicious = 0.65;
    pLow = 0.20;
    pMalicious = 0.15;
  } else {
    pMalicious = Math.min(0.92, (riskScore / 100) * 0.9);
    pSuspicious = (1 - pMalicious) * 0.7;
    pLow = (1 - pMalicious) * 0.3;
  }

  const totalP = pLow + pSuspicious + pMalicious;
  const lowProb = Math.round((pLow / totalP) * 100);
  const suspProb = Math.round((pSuspicious / totalP) * 100);
  const malProb = 100 - lowProb - suspProb;

  // Determine Risk Level & Gate Decision (OPEN, WARN, BLOCK)
  let riskLevel = 'Low Risk';
  let decision = 'OPEN';
  let statusText = 'Low Risk — No known suspicious indicators detected.';

  if (riskScore >= 70 || isIpAddress || (deceptiveBrandDetected && foundKeywords.length > 0)) {
    riskLevel = 'High Risk';
    decision = 'BLOCK';
    statusText = 'High Risk — Malicious or deceptive patterns detected.';
  } else if (riskScore >= 40 || !isHttps || deceptiveBrandDetected) {
    riskLevel = 'Suspicious';
    decision = 'WARN';
    statusText = 'Suspicious — Proceed with caution, potential safety anomalies detected.';
  }

  return {
    success: true,
    inputUrl: rawUrl,
    normalizedUrl,
    hostname,
    features: {
      isHttps,
      urlLength,
      dotCount,
      subdomainCount,
      hyphenCount,
      specialChars,
      isIpAddress,
      hasHighRiskTld,
      foundKeywords,
      deceptiveBrandDetected,
      isVerifiedOfficial,
      matchedOfficialDomain
    },
    probabilities: {
      lowRisk: lowProb,
      suspicious: suspProb,
      malicious: malProb
    },
    riskScore,
    riskLevel, // 'Low Risk', 'Suspicious', 'High Risk'
    decision,  // 'OPEN', 'WARN', 'BLOCK'
    statusText,
    lastChecked: new Date().toISOString().split('T')[0],
    disclaimer: 'This is a risk assessment, not a guarantee of safety.'
  };
}

export function verifyToolDomainMatch(toolUrl, officialDomain) {
  if (!toolUrl || !officialDomain) {
    return { isMatch: false, status: 'Unverified Website' };
  }
  try {
    const parsed = new URL(toolUrl.startsWith('http') ? toolUrl : 'https://' + toolUrl);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const cleanOfficial = officialDomain.toLowerCase().replace(/^www\./, '');
    const isMatch = host === cleanOfficial || host.endsWith('.' + cleanOfficial);
    return {
      isMatch,
      status: isMatch ? 'Verified Official Domain' : 'Unverified Website'
    };
  } catch {
    return { isMatch: false, status: 'Invalid URL' };
  }
}
