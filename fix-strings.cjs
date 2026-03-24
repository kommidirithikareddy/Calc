/**
 * fix-strings.js
 * Run from your project root: node fix-strings.js
 *
 * Fixes TWO problems across all .jsx/.js files in src/:
 *   1. Unescaped apostrophes in single-quoted strings  (you're → you\'re)
 *   2. Double {{ }} braces in JSX / object literals    ({{ }} → { })
 */

const fs = require('fs')
const path = require('path')

const TARGET_DIR = path.join(__dirname, 'src')
const EXTENSIONS = ['.jsx', '.js']

let totalFilesFixed = 0

function fixFile(filePath) {
  let src = fs.readFileSync(filePath, 'utf8')
  const original = src

  // ── Fix 1: unescaped apostrophes inside single-quoted strings ──────────
  // Match a single-quoted string: '...'
  // Inside it, replace word'word with word\'word
  src = src.replace(/'((?:[^'\\]|\\.)*)'/g, (match, inner) => {
    const fixed = inner.replace(/([a-zA-Z])'([a-zA-Z])/g, "$1\\'$2")
    return fixed !== inner ? `'${fixed}'` : match
  })

  // ── Fix 2: double braces {{ }} that aren't inside JSX expressions ──────
  // These appear as object literals written as {{ key: val }} or array items
  // written as {{ q: '...', a: '...' }}
  // We target:  [{{ and }}]  and  ,{{  and  }},  patterns typical in data arrays.
  // Safe replacement: collapse {{ → { and }} → } only when they appear as
  // paired double-braces in data contexts (not inside JSX style={{ }}).
  //
  // Strategy: replace patterns like:
  //   [{{   →  [{
  //   }}]   →  }]
  //   ,{{   →  ,{
  //   }},   →  },
  //   ={{ ( → ={ (JSX attribute double-brace — leave alone, handled separately)
  //
  // NOTE: JSX style={{ }} is intentionally double-brace and must NOT be changed.
  // We only fix data-array double-braces.

  // Mark JSX expressions that should keep double braces: style={{ ... }}
  // We'll use a placeholder approach
  const placeholders = []
  src = src.replace(/=\{\{([\s\S]*?)\}\}/g, (match) => {
    const id = `__PLACEHOLDER_${placeholders.length}__`
    placeholders.push(match)
    return id
  })

  // Now fix remaining double-braces in data arrays
  src = src.replace(/\{\{/g, '{').replace(/\}\}/g, '}')

  // Restore JSX placeholders
  placeholders.forEach((original, i) => {
    src = src.replace(`__PLACEHOLDER_${i}__`, original)
  })

  if (src !== original) {
    fs.writeFileSync(filePath, src, 'utf8')
    console.log(`✅ Fixed: ${path.relative(__dirname, filePath)}`)
    totalFilesFixed++
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (EXTENSIONS.includes(path.extname(entry.name))) fixFile(full)
  }
}

console.log('🔍 Scanning src/ for apostrophe and double-brace errors...\n')
walk(TARGET_DIR)
console.log(`\n✨ Done! Fixed ${totalFilesFixed} file(s).`)
console.log('👉 Now run: npm run build')
