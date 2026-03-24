const fs = require('fs');
const path = require('path');

/**
 * For JSX event handlers like onXxx={...}, we need the { } to be balanced.
 * When the handler uses a block arrow function (()=>{...}), the pattern
 * `handler={()=>{...}` needs `}}` at the end (or wherever the attribute ends).
 *
 * Strategy: find each on[A-Z]...={ in the file and check if the braces are
 * balanced. If at depth=1 and the next non-whitespace token looks like a JSX
 * prop or element close, insert the missing `}` there.
 */
function fixContent(content) {
  let result = '';
  let i = 0;
  let changes = 0;

  while (i < content.length) {
    // Look for on[A-Z]...={ to find JSX event handler attributes
    const remaining = content.slice(i);
    const attrMatch = remaining.match(/^(on[A-Z][a-zA-Z]*=)\{/);

    if (!attrMatch) {
      result += content[i];
      i++;
      continue;
    }

    const attrName = attrMatch[1]; // e.g. "onClick="
    result += attrName + '{';
    i += attrName.length + 1; // skip past "onClick={"

    // Now parse the attribute value starting after the opening {
    // We're at depth=1 (the outer JSX expression brace)
    let depth = 1;
    let inSingle = false, inDouble = false, inTemplate = false;

    while (i < content.length && depth > 0) {
      const c = content[i];

      // Handle escape sequences inside strings
      if ((inSingle || inDouble || inTemplate) && c === '\\') {
        result += c + (content[i + 1] || '');
        i += 2;
        continue;
      }

      // Toggle string states
      if (c === "'" && !inDouble && !inTemplate) {
        inSingle = !inSingle;
        result += c; i++; continue;
      }
      if (c === '"' && !inSingle && !inTemplate) {
        inDouble = !inDouble;
        result += c; i++; continue;
      }
      if (c === '`' && !inSingle && !inDouble) {
        inTemplate = !inTemplate;
        result += c; i++; continue;
      }

      if (inSingle || inDouble || inTemplate) {
        result += c; i++; continue;
      }

      if (c === '{') {
        depth++;
        result += c; i++; continue;
      }

      if (c === '}') {
        depth--;
        if (depth === 0) {
          // This would close the JSX expression. Good.
          result += c; i++;
          break;
        }

        // depth is now >= 1. Check if we're at depth=1 and the next content
        // looks like a JSX prop name or element close — if so, we're missing
        // a closing } for the JSX expression.
        if (depth === 1) {
          // Peek ahead past whitespace
          let peek = i + 1;
          while (peek < content.length && (content[peek] === ' ' || content[peek] === '\t')) {
            peek++;
          }
          const nextChars = content.slice(peek, peek + 30);
          // JSX prop name starts with a letter (attribute) or / or > (element end)
          // If next is a JSX attribute name followed by = or a space, or /> or >
          const looksLikeJsxProp = /^[a-zA-Z]/.test(nextChars) && /^[a-zA-Z][a-zA-Z]*[=\s{>\/]/.test(nextChars);
          const looksLikeElementClose = /^[\/>\n]/.test(nextChars);

          if (looksLikeJsxProp || looksLikeElementClose) {
            // Insert missing } to close the JSX expression
            result += '}';
            depth--;
            changes++;
            // Don't consume the current `}` character yet — continue to process it
            // Actually, we already know this `}` closes the arrow fn body.
            // After inserting the extra `}`, depth is now 0, so we close.
            result += c; i++;
            break;
          }
        }

        result += c; i++;
        continue;
      }

      // Newline — check if we're at depth=1 and should close the attribute here
      if (c === '\n' && depth === 1) {
        // We've hit end of line while still inside the JSX expression (depth=1).
        // This means the attribute was never closed. Insert missing }.
        result += '}\n';
        depth = 0;
        i++;
        changes++;
        break;
      }

      result += c; i++;
    }

    if (depth > 0) {
      // Still unbalanced at end of file
      result += '}'.repeat(depth);
      changes += depth;
    }
  }

  if (changes > 0) {
    console.log(`  Made ${changes} fixes`);
  }
  return result;
}

function fixFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const fixed = fixContent(original);
  if (fixed !== original) {
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log(`Saved: ${filePath}`);
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
    else if (e.name.endsWith('.jsx') || e.name.endsWith('.tsx')) {
      if (fixFile(full)) count++;
    }
  }
  return count;
}

console.log('Fixing JSX attribute brace balance (v2)...\n');
const total = walkDir(path.join(__dirname, 'src'));
console.log(`\nDone. Fixed ${total} file(s).`);
