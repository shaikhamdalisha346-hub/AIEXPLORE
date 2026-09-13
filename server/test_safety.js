import { analyzeUrlSafety } from './services/safetyEngine.js';

const testUrls = [
  "https://gamma.app",
  "https://canva.com/login",
  "http://free-gamma-ppt-generator-download.xyz/login.php",
  "http://192.168.1.1/chatgpt-free-premium",
  "https://elevenlabs.io"
];

console.log("==================================================");
console.log("TESTING SAFETY CHECKER & ML RISK ARCHITECTURE");
console.log("==================================================\n");

testUrls.forEach((url, i) => {
  const res = analyzeUrlSafety(url);
  console.log(`[Safety Test #${i + 1}] URL: ${url}`);
  console.log(`  -> Risk Level: ${res.riskLevel} (${res.riskScore}/100)`);
  console.log(`  -> Decision: ${res.decision}`);
  console.log(`  -> Status: ${res.statusText}`);
  console.log(`  -> Probabilities: Low=${res.probabilities.lowRisk}%, Suspicious=${res.probabilities.suspicious}%, Malicious=${res.probabilities.malicious}%`);
  console.log(`  -> Verified Official Domain: ${res.features.isVerifiedOfficial ? 'YES (' + res.features.matchedOfficialDomain + ')' : 'NO'}\n`);
});
