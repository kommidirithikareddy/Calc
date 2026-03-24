const fs = require('fs');
const path = require('path');

/**
 * Scans file content and inserts missing } to balance JSX event handler expressions.
 * Handles both single-handler-per-line and compact all-on-one-line formats.
 */
function fixContent(content) {
  let result = '';
  let i = 0;

  while (i < content.length) {
    // Look for on[A-Z]...={
    const match = content.slice(i).match(/^(on[A-Z][a-zA-Z]*=)\{/);
    if (match) {
      const prefix = match[1];
      result += prefix;
      i += prefix.length;

      // Now we're at the opening { of the JSX expression
      // Collect the whole attribute value by tracking balanced braces,
      // being careful about strings and template literals
      let depth = 0;
      let attrValue = '';
      let inSingle = false, inDouble = false, inTemplate = false;
      let templateDepth = 0;
      let j = i;

      while (j < content.length) {
        const c = content[j];

        // Handle escape sequences
        if ((inSingle || inDouble || inTemplate) && c === '\\') {
          attrValue += c + (content[j + 1] || '');
          j += 2;
          continue;
        }

        // Toggle string states
        if (c === "'" && !inDouble && !inTemplate) {
          inSingle = !inSingle;
          attrValue += c; j++; continue;
        }
        if (c === '"' && !inSingle && !inTemplate) {
          inDouble = !inDouble;
          attrValue += c; j++; continue;
        }
        if (c === '`' && !inSingle && !inDouble) {
          inTemplate = !inTemplate;
          attrValue += c; j++; continue;
        }

        // Inside string/template literal, don't count braces
        if (inSingle || inDouble || inTemplate) {
          attrValue += c; j++; continue;
        }

        if (c === '{') { depth++; attrValue += c; j++; continue; }
        if (c === '}') {
          depth--;
          attrValue += c; j++;
          if (depth === 0) break; // Found the matching closing brace
          continue;
        }

        attrValue += c; j++;
      }

      // Check if the attribute is balanced (depth should be 0 after)
      // The attrValue now includes the closing }... but wait, we stopped at depth=0
      // Actually, we need to check if the CONTENT inside {} is balanced
      // attrValue includes the outer { and }

      // Count actual braces in attrValue to verify
      // If depth ended at 0, the attrValue is balanced as-is
      // If we ran out of content without depth reaching 0, we need to add }s

      if (depth > 0) {
        // Add missing closing braces
        attrValue += '}'.repeat(depth);
        console.log(`  Added ${depth} missing } for attribute at position ${i}`);
      }

      result += attrValue;
      i = j;
    } else {
      result += content[i];
      i++;
    }
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

console.log('Fixing JSX attribute brace balance...\n');
const total = walkDir(path.join(__dirname, 'src'));
console.log(`\nDone. Fixed ${total} file(s).`);
