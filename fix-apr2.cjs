const fs = require('fs');
const content = fs.readFileSync('src/calculators/finance/APRCalculator.jsx', 'utf8');
const lines = content.split('\n');

// Find the split point — line where findMonthlyRate starts
const splitLine = lines.findIndex(l => l.includes('function findMonthlyRate'));
console.log('Split at line:', splitLine + 1);

// Part 1: lines 0..splitLine-1 — only fix imports
const part1 = lines.slice(0, splitLine).map(line => {
  // Fix: import {{ X, Y }} from or import Foo, {{ X }} from
  return line
    .replace(/^import \{\{([^}]*)\}\}/, 'import {$1}')
    .replace(/^(import [^,]+,\s*)\{\{([^}]*)\}\}/, '$1{$2}')
    .replace(/^\s*\{\{ /, match => match.replace('{{ ', '{ '))  // array entries {{ key:
    .replace(/ \}\},\s*$/, m => m.replace(' }},', ' },'))       // closing of array entries
    .replace(/ \}\}\s*$/, m => m.replace(' }}', ' }'));          // closing of array entries (last)
});

// Part 2: lines splitLine.. — blanket reduce {{ -> { and }} -> }
// But we do it character by character to avoid reducing }} inside strings
const part2raw = lines.slice(splitLine).join('\n');

// Blanket reduce all {{ to { and }} to }
const part2 = part2raw
  .replace(/\{\{/g, '{')
  .replace(/\}\}/g, '}');

const result = [...part1, ...part2.split('\n')].join('\n');
fs.writeFileSync('src/calculators/finance/APRCalculator.jsx', result, 'utf8');
console.log('Done. Changed:', result !== content);
