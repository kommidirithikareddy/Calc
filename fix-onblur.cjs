const fs = require('fs');
const path = require('path');

// The broken onBlur pattern ends with onChange(c)}} (missing one })
// The correct pattern ends with onChange(c)}}}
const BROKEN = 'onChange(c)}}';
const CORRECT = 'onChange(c)}}}';

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimEnd();
    // Only fix lines that end with exactly }} (not }}})
    if (trimmed.endsWith(BROKEN) && !trimmed.endsWith(CORRECT)) {
      lines[i] = trimmed + '}';
      changed = true;
      console.log(`  Fixed line ${i + 1} (${path.basename(filePath)})`);
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
  let count = 0;
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) count += walkDir(full);
    else if (e.name.endsWith('.jsx') || e.name.endsWith('.tsx')) {
      if (fixFile(full)) count++;
    }
  }
  return count;
}

console.log('Fixing onBlur closing braces...\n');
const total = walkDir(path.join(__dirname, 'src'));
console.log(`\nDone. Fixed ${total} file(s).`);
