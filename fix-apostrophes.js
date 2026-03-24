/**
 * fix-apostrophes.js
 * Run from your project root: node fix-apostrophes.js
 *
 * Fixes unescaped apostrophes inside single-quoted JS strings in .jsx files.
 * Specifically targets FAQ/GLOSSARY/data arrays where strings like
 * 'you're' or 'buyer's' break the build.
 */

const fs = require('fs')
const path = require('path')

const TARGET_DIR = path.join(__dirname, 'src')
const EXTENSIONS = ['.jsx', '.js']

let totalFilesFixed = 0
let totalReplacements = 0

function fixFile(filePath) {
  let src = fs.readFileSync(filePath, 'utf8')
  let fixCount = 0

  // Strategy: find every single-quoted string in JS (outside JSX expressions)
  // and escape apostrophes that appear mid-string.
  //
  // We look for single-quoted string literals: '...'
  // and replace any ' inside that is preceded/followed by word chars (i.e. contractions).
  //
  // Regex: match single-quoted strings, then inside them fix word'word patterns.
  const fixed = src.replace(/'((?:[^'\\]|\\.)*)'/g, (match, inner) => {
    // Replace word'word (contractions) with word\'word
    const newInner = inner.replace(/([a-zA-Z])'([a-zA-Z])/g, (m, a, b) => {
      fixCount++
      return `${a}\\'${b}`
    })
    if (newInner !== inner) {
      return `'${newInner}'`
    }
    return match
  })

  if (fixCount > 0) {
    fs.writeFileSync(filePath, fixed, 'utf8')
    console.log(`✅ Fixed ${fixCount} apostrophe(s) in: ${path.relative(__dirname, filePath)}`)
    totalFilesFixed++
    totalReplacements += fixCount
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full)
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      fixFile(full)
    }
  }
}

console.log('🔍 Scanning src/ for unescaped apostrophes in single-quoted strings...\n')
walk(TARGET_DIR)
console.log(`\n✨ Done! Fixed ${totalReplacements} apostrophe(s) across ${totalFilesFixed} file(s).`)
console.log('Now run: npm run build')
