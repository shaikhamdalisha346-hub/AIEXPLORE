const API_BASE = 'http://localhost:5000/api';

async function runIntegrationTests() {
  console.log('====================================================');
  console.log('AI TOOL FINDER - SCIENCE EXPO FULL INTEGRATION SUITE');
  console.log('====================================================\n');

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

  // 1. Tool Catalog size & schema check (150+ tools requirement)
  await test('GET /api/tools returns 150+ authentic tools with enriched schemas', async () => {
    const res = await fetch(`${API_BASE}/tools`);
    const data = await res.json();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (data.total < 150) throw new Error(`Expected at least 150 tools, got ${data.total}`);
    
    // Validate schema on sample tools
    const sample = data.tools.slice(0, 15);
    for (const t of sample) {
      if (!t.purpose && (!Array.isArray(t.purposes) || t.purposes.length === 0)) {
        throw new Error(`Tool ${t.name} missing purpose`);
      }
      if (!t.verifiedDomain && !t.verifiedOfficialDomain && !t.officialDomain) {
        throw new Error(`Tool ${t.name} missing verifiedDomain`);
      }
      if (!t.userReviewSummary) {
        throw new Error(`Tool ${t.name} missing userReviewSummary`);
      }
      if (!t.bestFor) {
        throw new Error(`Tool ${t.name} missing bestFor tag`);
      }
    }
  });

  // 2. Purposes endpoint (25+ purposes taxonomy)
  await test('GET /api/purposes returns 25+ purpose taxonomies with icons & counts', async () => {
    const res = await fetch(`${API_BASE}/purposes`);
    const data = await res.json();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!Array.isArray(data) || data.length < 25) {
      throw new Error(`Expected >= 25 purposes, got ${data.length}`);
    }
    for (const p of data) {
      if (!p.name || (!p.toolCount && !p.count)) {
        throw new Error(`Invalid purpose item: ${JSON.stringify(p)}`);
      }
      const count = p.toolCount || p.count;
      if (count <= 0) {
        throw new Error(`Purpose ${p.name} has 0 tools`);
      }
    }
  });

  // 3. Categories endpoint (14 operational domains)
  await test('GET /api/categories returns all operational domain categories', async () => {
    const res = await fetch(`${API_BASE}/categories`);
    const data = await res.json();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!Array.isArray(data) || data.length < 12) {
      throw new Error(`Expected >= 12 categories, got ${data.length}`);
    }
  });

  // 4. Trending collections (7 collections requirement)
  await test('GET /api/trending returns 7 dynamic collections', async () => {
    const res = await fetch(`${API_BASE}/trending`);
    const data = await res.json();
    const expectedKeys = [
      'trendingNow',
      'risingFast',
      'recentlyAdded',
      'recentlyUpdated',
      'mostPopular',
      'bestFreeTools',
      'bestForStudents'
    ];
    for (const key of expectedKeys) {
      if (!Array.isArray(data[key]) || data[key].length === 0) {
        throw new Error(`Collection ${key} is empty or missing`);
      }
    }
  });

  // 5. Multi-tool comparison (2 to 5 tools side-by-side)
  await test('POST /api/compare compares 2 to 5 tools side-by-side', async () => {
    const res = await fetch(`${API_BASE}/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toolIds: ['gamma', 'canva', 'magicslides', 'tome', 'beautifulai'] })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (data.count !== 5) throw new Error(`Expected 5 tools compared, got ${data.count}`);
    if (!data.matrix || !Array.isArray(data.matrix.featureRows)) {
      throw new Error('Comparison matrix missing featureRows');
    }
  });

  // 6. Safety Check - Whitelisted Official Domain
  await test('POST /api/safety/check verifies official domain as Low Risk / OPEN', async () => {
    const res = await fetch(`${API_BASE}/safety/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://gamma.app' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (data.riskLevel !== 'Low Risk') throw new Error(`Expected Low Risk, got ${data.riskLevel}`);
    if (data.decision !== 'OPEN') throw new Error(`Expected OPEN, got ${data.decision}`);
    if (!data.statusText.includes('Low Risk — No known suspicious indicators detected.')) {
      throw new Error(`Unexpected status text: ${data.statusText}`);
    }
  });

  // 7. Safety Check - Phishing pattern
  await test('POST /api/safety/check blocks phishing domain as High Risk / BLOCK', async () => {
    const res = await fetch(`${API_BASE}/safety/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'http://free-gamma-ppt-generator-download.xyz/login.php' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (data.riskLevel !== 'High Risk') throw new Error(`Expected High Risk, got ${data.riskLevel}`);
    if (data.decision !== 'BLOCK') throw new Error(`Expected BLOCK, got ${data.decision}`);
  });

  // 8. Review Integrity - Unverified reviews flag
  await test('Review integrity: unverified tools flag "Review information unavailable"', async () => {
    const res = await fetch(`${API_BASE}/tools/lovable`);
    const tool = await res.json();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (tool.userReviewSummary.rating !== null && tool.userReviewSummary.unverified !== true) {
      throw new Error('Expected unverified tool to have null rating or unverified flag');
    }
    if (!tool.userReviewSummary.text.includes('unavailable')) {
      throw new Error(`Expected unavailable notice in unverified review, got: ${tool.userReviewSummary.text}`);
    }
  });

  // =========================================================================
  // THE 5 SCIENCE EXPO DEMO QUERIES
  // =========================================================================

  // Demo 1: College PPT for free -> Winner Gamma (NOT ChatGPT)
  await test('Science Expo Demo 1: "I want to make a professional college presentation for free."', async () => {
    const res = await fetch(`${API_BASE}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'I want to make a professional college presentation for free.' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const winner = data.bestMatch.tool.name;
    const score = data.bestMatch.scores.finalScore;
    if (winner !== 'Gamma') {
      throw new Error(`Expected Gamma to win, but got ${winner}`);
    }
    if (score < 90) {
      throw new Error(`Expected high match score >= 90%, got ${score}%`);
    }
    const detected = data.analyzedRequirements?.purpose || data.parsedIntent?.primaryPurpose || '';
    if (!detected.toLowerCase().includes('presentation')) {
      throw new Error(`Expected presentation purpose, got: ${detected}`);
    }
    // Verify alternatives contain relevant presentation tools
    const altNames = data.alternatives.map(a => a.tool.name);
    const hasPresentationAlt = altNames.some(n => ['Canva Magic Studio', 'Canva', 'MagicSlides', 'Tome', 'Beautiful.ai'].includes(n));
    if (!hasPresentationAlt) {
      throw new Error(`Expected presentation alternatives, got: ${altNames.join(', ')}`);
    }
  });

  // Demo 2: Research literature review with reliable sources -> Winner Perplexity / NotebookLM / Consensus
  await test('Science Expo Demo 2: "I need to do research for my literature review with reliable sources."', async () => {
    const res = await fetch(`${API_BASE}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'I need to do research for my literature review with reliable sources.' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const winner = data.bestMatch.tool.name;
    const allowed = ['Perplexity AI', 'Perplexity', 'Google NotebookLM', 'NotebookLM', 'Consensus', 'Elicit', 'Scite'];
    if (!allowed.includes(winner)) {
      throw new Error(`Expected research winner among ${allowed.join(', ')}, but got ${winner}`);
    }
    if (winner === 'ChatGPT' || winner === 'Gamma') {
      throw new Error(`Generic chatbot or wrong category won: ${winner}`);
    }
  });

  // Demo 3: Instagram reel quickly -> Winner CapCut / InVideo / VEED
  await test('Science Expo Demo 3: "I want to make an Instagram reel quickly."', async () => {
    const res = await fetch(`${API_BASE}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'I want to make an Instagram reel quickly.' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const winner = data.bestMatch.tool.name;
    const allowed = ['CapCut', 'InVideo', 'VEED.io', 'CapCut AI', 'Descript', 'Opus Clip'];
    if (!allowed.includes(winner)) {
      throw new Error(`Expected video winner among ${allowed.join(', ')}, but got ${winner}`);
    }
  });

  // Demo 4: Build website for startup without coding -> Winner Framer / Webflow / Lovable / Bolt
  await test('Science Expo Demo 4: "I want to build a website for my startup without coding."', async () => {
    const res = await fetch(`${API_BASE}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'I want to build a website for my startup without coding.' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const winner = data.bestMatch.tool.name;
    const allowed = ['Framer', 'Webflow', 'Lovable', 'Bolt.new', 'Dora', '10Web'];
    if (!allowed.includes(winner)) {
      throw new Error(`Expected website builder winner among ${allowed.join(', ')}, but got ${winner}`);
    }
  });

  // Demo 5: 300-page research paper PDF study -> Winner NotebookLM / ChatPDF / Humata
  await test('Science Expo Demo 5: "I have a 300-page research paper PDF and I need to study it quickly."', async () => {
    const res = await fetch(`${API_BASE}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'I have a 300-page research paper PDF and I need to study it quickly.' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const winner = data.bestMatch.tool.name;
    const allowed = ['NotebookLM', 'Google NotebookLM', 'ChatPDF', 'Humata AI', 'PDFgear', 'Claude'];
    if (!allowed.includes(winner)) {
      throw new Error(`Expected PDF study winner among ${allowed.join(', ')}, but got ${winner}`);
    }
  });

  // 9. Admin Tool Creation and Deletion
  await test('POST & DELETE /api/admin/tools creates and deletes tool', async () => {
    const newToolData = {
      name: 'Expo Test AI',
      category: 'Coding',
      subcategory: 'Test Tool',
      purpose: 'code_generation',
      description: 'A test AI tool for Science Expo verification',
      features: ['Automated Testing', 'AST Analysis'],
      pricing: 'Free',
      freePlan: true,
      platforms: ['Web'],
      officialWebsite: 'https://expotest.ai',
      verifiedDomain: 'expotest.ai',
      developer: 'Expo Team',
      bestFor: 'Science Expo automated testing'
    };

    const addRes = await fetch(`${API_BASE}/admin/tools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newToolData)
    });
    const addData = await addRes.json();
    if (!addRes.ok) throw new Error(addData.error || 'Failed to add tool');

    const createdId = addData.tool.id;

    const delRes = await fetch(`${API_BASE}/admin/tools/${createdId}`, {
      method: 'DELETE'
    });
    if (!delRes.ok) throw new Error('Failed to delete test tool');
  });

  console.log(`\n====================================================`);
  console.log(`RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed/total)*100)}%)`);
  console.log(`====================================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runIntegrationTests().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
