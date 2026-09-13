export function calculateTrendScore(tool) {
  // Recent Growth: 30%
  const growth = Number(tool.trendGrowth) || 85;

  // User Interest: 25%
  const interest = Number(tool.userInterest) || 85;

  // Feature Updates: 20%
  let featureUpdatesScore = 75;
  if (tool.recentlyUpdated) featureUpdatesScore = 95;
  if (tool.lastUpdated) {
    const daysSinceUpdate = Math.floor((Date.now() - new Date(tool.lastUpdated).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceUpdate <= 14) featureUpdatesScore = 98;
    else if (daysSinceUpdate <= 30) featureUpdatesScore = 90;
    else if (daysSinceUpdate <= 60) featureUpdatesScore = 80;
  }

  // Usage / Popularity: 15%
  const popularity = Number(tool.popularityScore) || 80;

  // Recency: 10%
  let recencyScore = 75;
  if (tool.recentlyAdded) recencyScore = 98;

  // Total weighted trend formula
  const computedTrend = Math.round(
    (growth * 0.30) +
    (interest * 0.25) +
    (featureUpdatesScore * 0.20) +
    (popularity * 0.15) +
    (recencyScore * 0.10)
  );

  return Math.min(100, Math.max(10, computedTrend));
}

export function getTrendingCollections(tools) {
  // Update dynamic trend scores on the fly
  const toolsWithTrends = tools.map(tool => ({
    ...tool,
    computedTrendScore: calculateTrendScore(tool)
  }));

  // 1. Trending Now (highest computed trend score)
  const trendingNow = [...toolsWithTrends]
    .sort((a, b) => b.computedTrendScore - a.computedTrendScore)
    .slice(0, 16);

  // 2. Rising Fast (highest trendGrowth)
  const risingFast = [...toolsWithTrends]
    .sort((a, b) => (b.trendGrowth || 0) - (a.trendGrowth || 0))
    .slice(0, 16);

  // 3. Recently Added
  const recentlyAdded = toolsWithTrends
    .filter(t => t.recentlyAdded)
    .sort((a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0))
    .slice(0, 16);

  // 4. Recently Updated
  const recentlyUpdated = toolsWithTrends
    .filter(t => t.recentlyUpdated || t.lastUpdated >= '2026-08-01')
    .sort((a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0))
    .slice(0, 16);

  // 5. Most Popular (highest popularityScore & overallRating)
  const mostPopular = [...toolsWithTrends]
    .sort((a, b) => ((b.popularityScore || 0) + (b.overallRating || 4.5) * 10) - ((a.popularityScore || 0) + (a.overallRating || 4.5) * 10))
    .slice(0, 16);

  // 6. Best Free Tools (free plan + high quality)
  const bestFreeTools = toolsWithTrends
    .filter(t => t.freePlan)
    .sort((a, b) => (b.qualityScore * 0.6 + b.popularityScore * 0.4) - (a.qualityScore * 0.6 + a.popularityScore * 0.4))
    .slice(0, 16);

  // 7. Best Tools for Students
  const bestForStudents = toolsWithTrends
    .filter(t => (t.targetUsers || []).some(u => u.toLowerCase().includes('student')) || (t.studentScore && t.studentScore >= 90))
    .sort((a, b) => (b.studentScore || 80) - (a.studentScore || 80))
    .slice(0, 16);

  return {
    trendingNow,
    risingFast,
    recentlyAdded,
    recentlyUpdated,
    mostPopular,
    bestFreeTools,
    bestForStudents
  };
}
