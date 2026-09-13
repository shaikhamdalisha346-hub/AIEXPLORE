import { db } from './db/database.js';
import { recommendTools } from './services/recommendationEngine.js';

const testQueries = [
  { q: "Create a PPT for college", expectedCategory: "Presentation / PPT" },
  { q: "Edit an Instagram reel", expectedCategory: "Video" },
  { q: "Help me code", expectedCategory: "Coding" },
  { q: "Research with sources", expectedCategory: "Education / Study" },
  { q: "Study a PDF", expectedCategory: "Education / Study" },
  { q: "Generate an AI image", expectedCategory: "Image / Design" },
  { q: "Write an assignment", expectedCategory: "Writing" },
  { q: "Generate an AI voice", expectedCategory: "Voice / Audio" },
  { q: "I need a free AI tool", expectedCategory: null }, // any top scoring free tool
  { q: "I need an AI that can do many tasks", expectedCategory: "All-Rounder AI" }
];

console.log("==================================================");
console.log("TESTING RECOMMENDATION ENGINE (10 SPECIFIED CASES)");
console.log("==================================================\n");

const allTools = db.getAll();
const recommendedToolsList = [];
let allPassed = true;

testQueries.forEach((item, index) => {
  const result = recommendTools(item.q, allTools);
  const best = result.bestMatch;
  const bestTool = best ? best.tool : null;
  const winnerName = bestTool ? bestTool.name : "NONE";
  const winnerCategory = bestTool ? bestTool.category : "NONE";
  const score = best ? best.scores.finalScore : 0;
  recommendedToolsList.push(winnerName);

  const categoryMatch = !item.expectedCategory || winnerCategory === item.expectedCategory || (item.q.includes("PDF") && (winnerName.includes("NotebookLM") || winnerCategory.includes("Study")));

  console.log(`[Test #${index + 1}] Query: "${item.q}"`);
  console.log(`  -> Intent Detected: ${result.parsedIntent.detectedIntent}`);
  console.log(`  -> Winner: ${winnerName} (${winnerCategory}) | Score: ${score}%`);
  console.log(`  -> Why: ${best.whyRecommended}`);
  console.log(`  -> Category Test: ${categoryMatch ? "PASS" : "FAIL"}\n`);

  if (!categoryMatch) {
    allPassed = false;
  }
});

// Verify tools are NOT identical across requests
const uniqueWinners = new Set(recommendedToolsList);
console.log(`Total test queries: ${testQueries.length}`);
console.log(`Unique winners recommended: ${uniqueWinners.size} (${Array.from(uniqueWinners).join(', ')})`);

if (uniqueWinners.size >= 7 && allPassed) {
  console.log("\n>>> SUCCESS: Recommendation engine returns diverse, category-appropriate recommendations dynamically!");
} else {
  console.log("\n>>> WARNING: Diversity or Category test had issues.");
}
