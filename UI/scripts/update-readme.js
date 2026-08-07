const fs = require('node:fs');
const path = require('node:path');

function countTestCases(testFiles) {
  return testFiles.reduce((count, file) => {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(/\b(?:test|it)\s*\(/g) || [];
    return count + matches.length;
  }, 0);
}

function getFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getFiles(fullPath, out);
    } else if (entry.isFile()) {
      out.push(fullPath);
    }
  }
  return out;
}

function updateReadme(readmePath, projectRoot = process.cwd()) {
  // Project structure places tests/pages/data under `UI/`
  const testDir = path.join(projectRoot, 'UI', 'tests');
  const pagesDir = path.join(projectRoot, 'UI', 'pages');
  const dataDir = path.join(projectRoot, 'UI', 'data');

  const testFiles = fs.existsSync(testDir)
    ? getFiles(testDir).filter((file) => /\.spec\.(ts|js|tsx|jsx)$/.test(file))
    : [];
  const pageFiles = fs.existsSync(pagesDir)
    ? getFiles(pagesDir).filter((file) => /\.ts$/.test(file) || /\.js$/.test(file))
    : [];
  const dataFiles = fs.existsSync(dataDir)
    ? getFiles(dataDir).filter((file) => /\.(json|csv|yaml|yml)$/.test(file))
    : [];

  const snapshot = [
    '## Auto-generated project snapshot',
    '',
    `- Test files: ${testFiles.length}`,
    `- Total test cases: ${countTestCases(testFiles)}`,
    `- Page objects: ${pageFiles.length}`,
    `- Data files: ${dataFiles.length}`,
    '',
    '### Test files',
    ...testFiles.map((file) => `- ${path.relative(projectRoot, file)}`),
    '',
    '### Page objects',
    ...pageFiles.map((file) => `- ${path.relative(projectRoot, file)}`),
    '',
    '### Data files',
    ...dataFiles.map((file) => `- ${path.relative(projectRoot, file)}`),
    '',
  ].join('\n');

  const readmeContent = fs.readFileSync(readmePath, 'utf8');
  const startTag = '<!-- README-AUTO-GENERATED:START -->';
  const endTag = '<!-- README-AUTO-GENERATED:END -->';

  if (!readmeContent.includes(startTag) || !readmeContent.includes(endTag)) {
    throw new Error('README must contain README-AUTO-GENERATED start/end markers');
  }

  const updated = readmeContent.replace(
    new RegExp(`${startTag}[\\s\\S]*?${endTag}`),
    `${startTag}\n${snapshot}${endTag}`
  );

  fs.writeFileSync(readmePath, updated);
  return updated;
}

module.exports = { updateReadme };

if (require.main === module) {
  // Script lives in UI/scripts; project root is two levels up
  const projectRoot = path.resolve(__dirname, '..', '..');
  const readmePath = path.join(projectRoot, 'README.md');
  updateReadme(readmePath, projectRoot);
  console.log('README updated successfully.');
}
