const fs = require('fs');
const path = require('path');

/**
 * Fix apostrophes in single-quoted strings that break JS parsing.
 * Words like you'll, it's, won't, doesn't etc. inside a:'...' or q:'...' entries
 * break single-quoted strings. Replace the word apostrophe with \u2019 (curly apostrophe).
 */
function fixContent(content) {
  let result = '';
  let i = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let changes = 0;

  while (i < content.length) {
    const c = content[i];

    if (c === '\\' && (inSingle || inDouble || inTemplate)) {
      // Escape sequence — pass through both chars unchanged
      result += c + (content[i + 1] || '');
      i += 2;
      continue;
    }

    if (c === "'" && !inDouble && !inTemplate) {
      if (!inSingle) {
        // Opening single quote
        inSingle = true;
        result += c;
        i++;
        continue;
      } else {
        // Either closing single quote OR an apostrophe inside the string
        // Check if this looks like a word apostrophe (preceded by a word char, followed by word char)
        const prev = result.length > 0 ? result[result.length - 1] : '';
        const next = content[i + 1] || '';
        const isWordApostrophe = /[a-zA-Z0-9]/.test(prev) && /[a-zA-Z0-9]/.test(next);

        if (isWordApostrophe) {
          // Replace word apostrophe with unicode right single quotation mark
          result += '\u2019';
          i++;
          changes++;
          continue;
        } else {
          // Closing single quote
          inSingle = false;
          result += c;
          i++;
          continue;
        }
      }
    }

    if (c === '"' && !inSingle && !inTemplate) {
      inDouble = !inDouble;
      result += c;
      i++;
      continue;
    }

    if (c === '`' && !inSingle && !inDouble) {
      inTemplate = !inTemplate;
      result += c;
      i++;
      continue;
    }

    result += c;
    i++;
  }

  if (changes > 0) {
    console.log(`  Replaced ${changes} word apostrophe(s)`);
  }
  return result;
}

function fixFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const fixed = fixContent(original);
  if (fixed !== original) {
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log(`Saved: ${path.basename(filePath)}`);
    return true;
  }
  return false;
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let count = 0;
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) count += walkDir(full);
    else if (e.name.endsWith('.jsx') || e.name.endsWith('.tsx') || e.name.endsWith('.js') || e.name.endsWith('.ts')) {
      if (fixFile(full)) count++;
    }
  }
  return count;
}

console.log('Fixing word apostrophes in single-quoted strings...\n');
const total = walkDir(path.join(__dirname, 'src'));
console.log(`\nDone. Fixed ${total} file(s).`);
