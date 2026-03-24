const fs = require('fs');
let c = fs.readFileSync('src/calculators/finance/APRCalculator.jsx', 'utf8');
const original = c;

// Fix import destructuring: import {{ ... }} from
c = c.replace(/import \{\{([^}]*)\}\}/g, 'import {$1}');

// Fix template literals: ${{ expr }} -> ${ expr }
c = c.replace(/\$\{\{([^}]*)\}\}/g, '${$1}');

// Fix function params and block opens combined: ({ meta, category }) {{
c = c.replace(/\(\{([^}]*)\}\)\s*\{\{/g, '({$1}) {');

// Fix standalone {{ at end of line (block opens): for/if/function bodies
c = c.replace(/\)\s*\{\{(\s*)$/mg, ') {$1');

// Fix array/object literal entries: {{  key: val }}, -> { key: val },
// Match lines starting with optional whitespace then {{ (array element pattern)
c = c.replace(/^(\s*)\{\{ /mg, '$1{ ');
c = c.replace(/ \}\},/g, ' },');
c = c.replace(/ \}\}$/mg, ' }');

// Fix JSX props with doubled value braces: prop={{expr}} -> prop={expr}
// Only when content has no colon (so not an object literal like style={{...}})
c = c.replace(/(\w+=)\{\{([^{}:,\n]+)\}\}/g, '$1{$2}');

// Fix prop={{<> (JSX fragments passed as props)
c = c.replace(/(\w+=)\{\{</g, '$1{<');

// Fix }}> at end (closing JSX fragment prop)
c = c.replace(/\}\}>/g, '}>');

console.log('Changed:', c !== original);
fs.writeFileSync('src/calculators/finance/APRCalculator.jsx', c, 'utf8');
