const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log(' Analyzing bundle size...\n');

try {
  // Build the project
  console.log(' Building project...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Analyze bundle
  console.log('\n Analyzing bundle...');
  execSync('npx @next/bundle-analyzer', { stdio: 'inherit' });
  
  console.log('\n Bundle analysis complete!');
  console.log('Check the browser window that opened to see your bundle breakdown.');
  console.log('Look for:');
  console.log('   - Large dependencies that could be lazy-loaded');
  console.log('   - Duplicate packages');
  console.log('   - Unused code (tree-shaking opportunities)');
  
} catch (error) {
  console.error(' Error during bundle analysis:', error.message);
  process.exit(1);
}
