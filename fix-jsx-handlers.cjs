const fs = require('fs');
const path = require('path');

// Count unescaped braces in a string (ignoring braces inside string literals)
function countBraces(str) {
  let open = 0, close = 0;
  let inSingle = false, inDouble = false;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === "'" && !inDouble) { inSingle = !inSingle; continue; }
    if (c === '"' && !inSingle) { inDouble = !inDouble; continue; }
    if (inSingle || inDouble) continue;
    if (c === '{') open++;
    if (c === '}') close++;
  }
  return { open, close };
}

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Only process lines with JSX event handlers that have block arrow functions
    if (!/on[A-Z][a-zA-Z]*=\{/.test(line)) continue;
    if (!/=>\s*\{/.test(line)) continue;

    const trimmed = line.trimEnd();
    // Skip if already correctly closed (ends with }} or }> or }}>)
    if (/\}\}[^}]?\s*$/.test(trimmed) && !/\}\}\}\s*$/.test(trimmed)) continue;
    if (trimmed.endsWith('}}') || trimmed.endsWith('}}>') || trimmed.endsWith('}}}')) continue;

    const { open, close } = countBraces(trimmed);
    const deficit = open - close;
    if (deficit > 0) {
      lines[i] = trimmed + '}'.repeat(deficit);
      changed = true;
      console.log(`  Fixed line ${i + 1}: added ${deficit} } (${path.basename(filePath)})`);
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`Saved: ${filePath}`);
  }
  return changed;
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let fixedCount = 0;
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      fixedCount += walkDir(full);
    } else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx')) {
      if (fixFile(full)) fixedCount++;
    }
  }
  return fixedCount;
}

const srcDir = path.join(__dirname, 'src');
console.log('Fixing JSX event handler syntax errors...\n');
const total = walkDir(srcDir);
console.log(`\nDone. Fixed ${total} file(s).`);
