const fs = require('fs');
const path = require('path');

const root = process.cwd();
const ignoredDirs = new Set(['node_modules', 'dist', 'coverage', '.git', '_site']);
const allowedSecretExamples = new Set(['.env.example']);
const publicFiles = new Set(['index.html', 'ui.html', 'style.css', 'config.public.js', '.nojekyll']);
const riskyPatterns = [
  { name: 'Supabase project host', pattern: /[a-z0-9]{20}\.supabase\.co/i },
  { name: 'Database URL', pattern: /postgres(?:ql)?:\/\/[^"'\s]+/i },
  { name: 'Private key block', pattern: /BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY/i },
  { name: 'Hardcoded secret assignment', pattern: /(AUTH_SECRET|DATABASE_URL)\s*=\s*["'][^"']+["']/i },
  { name: 'Figma MCP asset dependency', pattern: /figma\.com\/api\/mcp\/asset/i },
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

const failures = [];
const gitignorePath = path.join(root, '.gitignore');
const gitignore = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
if (!/(^|\n)\.env(\n|$)/.test(gitignore) || !/(^|\n)\.env\.\*(\n|$)/.test(gitignore)) {
  failures.push('.gitignore: must ignore .env and .env.*');
}

for (const file of walk(root)) {
  const rel = path.relative(root, file);
  if (rel.startsWith('.env') && !allowedSecretExamples.has(rel)) {
    continue;
  }
  if (allowedSecretExamples.has(rel)) continue;
  const ext = path.extname(file).toLowerCase();
  if (!['.js', '.ts', '.html', '.css', '.md', '.json', '.sql', '.prisma', '.yml', '.yaml', '.example', ''].includes(ext)) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const rule of riskyPatterns) {
    if (rule.pattern.test(text)) failures.push(`${rel}: ${rule.name}`);
  }
}

for (const file of publicFiles) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`${file}: missing GitHub Pages public file`);
}

if (failures.length) {
  console.error('Security check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Security check passed.');
