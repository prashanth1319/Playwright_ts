const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { updateReadme } = require('../scripts/update-readme');

test('updates README with project snapshot from current files', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'readme-update-'));
  const projectRoot = tempDir;

  fs.mkdirSync(path.join(projectRoot, 'tests'), { recursive: true });
  fs.mkdirSync(path.join(projectRoot, 'pages'), { recursive: true });
  fs.mkdirSync(path.join(projectRoot, 'data'), { recursive: true });

  fs.writeFileSync(path.join(projectRoot, 'tests', 'login.spec.ts'), "test('logs in', () => {});\nit('fails', () => {});\n");
  fs.writeFileSync(path.join(projectRoot, 'tests', 'cart.spec.ts'), "test('checkout', () => {});\n");
  fs.writeFileSync(path.join(projectRoot, 'pages', 'LoginPage.ts'), "export class LoginPage {}\n");
  fs.writeFileSync(path.join(projectRoot, 'data', 'loginData.json'), '{"name":"demo"}\n');

  const readmePath = path.join(projectRoot, 'README.md');
  fs.writeFileSync(readmePath, [
    '# Project',
    '',
    '<!-- README-AUTO-GENERATED:START -->',
    'old content',
    '<!-- README-AUTO-GENERATED:END -->',
    '',
    'More text',
  ].join('\n'));

  updateReadme(readmePath, projectRoot);

  const content = fs.readFileSync(readmePath, 'utf8');
  assert.match(content, /## Auto-generated project snapshot/);
  assert.match(content, /Test files: 2/);
  assert.match(content, /Total test cases: 3/);
  assert.match(content, /Page objects: 1/);
  assert.match(content, /Data files: 1/);
  assert.match(content, /login.spec.ts/);
  assert.match(content, /cart.spec.ts/);
});
