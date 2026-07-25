const fs = require('fs');
const path = require('path');

class ExtentReporter {
  constructor(options = {}) {
    this.outputFolder = options.outputFolder || 'extent-report';
    this.tests = [];
  }

  onBegin(config, suite) {
    this.startTime = Date.now();
    this.projectName = config.projects?.[0]?.name || 'playwright';
  }

  onTestEnd(test, result) {
    this.tests.push({
      title: test.titlePath().join(' > '),
      status: result.status,
      duration: result.duration,
      error: result.error?.message || '',
      attachments: result.attachments.map((attachment) => attachment.name || attachment.path),
    });
  }

  async onEnd(result) {
    const outputDir = path.resolve(process.cwd(), this.outputFolder);
    fs.mkdirSync(outputDir, { recursive: true });
    const html = this.generateHtml(result);
    fs.writeFileSync(path.join(outputDir, 'index.html'), html, 'utf8');
  }

  generateHtml(result) {
    const passed = this.tests.filter((t) => t.status === 'passed').length;
    const failed = this.tests.filter((t) => t.status === 'failed').length;
    const skipped = this.tests.filter((t) => t.status === 'skipped').length;
    const total = this.tests.length;
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const overallStatus = failed > 0 ? 'FAILED' : 'PASSED';

    const rows = this.tests
      .map((test) => {
        const attachments = test.attachments.length
          ? `<ul>${test.attachments.map((name) => `<li>${name}</li>`).join('')}</ul>`
          : '';
        const error = test.error ? `<pre>${escapeHtml(test.error)}</pre>` : '';

        return `
          <tr class="${test.status}">
            <td>${escapeHtml(test.title)}</td>
            <td>${escapeHtml(test.status)}</td>
            <td>${test.duration} ms</td>
            <td>${error}${attachments}</td>
          </tr>`;
      })
      .join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Extent Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #f5f6fa; }
    h1, h2 { margin: 0 0 12px 0; }
    .summary { display: flex; gap: 24px; margin-bottom: 24px; }
    .card { padding: 16px; border-radius: 12px; background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.08); flex: 1; }
    .card strong { display: block; font-size: 1.2rem; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    th, td { padding: 12px 14px; border-bottom: 1px solid #e9ecef; text-align: left; }
    th { background: #eef2ff; }
    tr.passed td { color: #188038; }
    tr.failed td { color: #d93025; }
    tr.skipped td { color: #e8710a; }
    pre { white-space: pre-wrap; background: #f8f9fc; padding: 12px; border-radius: 6px; }
    ul { margin: 6px 0 0; padding-left: 20px; }
  </style>
</head>
<body>
  <h1>Extent-style Playwright Report</h1>
  <div class="summary">
    <div class="card"><strong>Status</strong><div>${overallStatus}</div></div>
    <div class="card"><strong>Total tests</strong><div>${total}</div></div>
    <div class="card"><strong>Passed</strong><div>${passed}</div></div>
    <div class="card"><strong>Failed</strong><div>${failed}</div></div>
    <div class="card"><strong>Skipped</strong><div>${skipped}</div></div>
    <div class="card"><strong>Duration</strong><div>${duration}s</div></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Test</th>
        <th>Status</th>
        <th>Duration</th>
        <th>Error / Attachments</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</body>
</html>`;
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = ExtentReporter;
