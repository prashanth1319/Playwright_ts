/**
 * sendEmailReport.ts
 *
 * Sends the Playwright test results via email using Nodemailer + SMTP.
 * Reads test-results/results.json (produced by the "json" reporter) to build
 * a summary in the email body, and attaches the JUnit XML plus the zipped
 * HTML report (CI workflow zips playwright-report/ before calling this script).
 *
 * Usage:
 *   npx ts-node utils/sendEmailReport.ts
 *   (or: npm run report:send)
 *
 * Required environment variables (see .env.example):
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS,
 *   EMAIL_FROM, EMAIL_TO, EMAIL_SUBJECT
 */
import * as fs from 'fs';
import * as path from 'path';
import nodemailer from 'nodemailer';
import config from '../config/env.config';

interface TestResultLeaf {
  status: string;
}

interface SpecTest {
  results: TestResultLeaf[];
}

interface Spec {
  tests: SpecTest[];
}

interface Suite {
  specs?: Spec[];
  suites?: Suite[];
}

interface PlaywrightJsonReport {
  suites?: Suite[];
}

interface Summary {
  html: string;
  passed: number;
  failed: number;
  skipped: number;
  total: number;
}

function buildSummary(): Summary {
  const resultsPath = path.join(__dirname, '..', 'test-results', 'results.json');

  if (!fs.existsSync(resultsPath)) {
    return {
      html: '<p>No results.json found. Did the tests run?</p>',
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
    };
  }

  const raw: PlaywrightJsonReport = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  const walk = (suite: Suite): void => {
    (suite.specs || []).forEach((spec) => {
      spec.tests.forEach((t) => {
        const status = t.results[t.results.length - 1]?.status;
        if (status === 'passed') passed += 1;
        else if (status === 'skipped') skipped += 1;
        else failed += 1;
      });
    });
    (suite.suites || []).forEach(walk);
  };
  (raw.suites || []).forEach(walk);

  const total = passed + failed + skipped;
  const overallStatus = failed > 0 ? 'FAILED' : 'PASSED';
  const color = failed > 0 ? '#d93025' : '#188038';

  const html = `
    <h2 style="color:${color};">Playwright Test Run: ${overallStatus}</h2>
    <table cellpadding="6" style="border-collapse:collapse;">
      <tr><td><b>Total</b></td><td>${total}</td></tr>
      <tr><td style="color:#188038;"><b>Passed</b></td><td>${passed}</td></tr>
      <tr><td style="color:#d93025;"><b>Failed</b></td><td>${failed}</td></tr>
      <tr><td style="color:#e8710a;"><b>Skipped</b></td><td>${skipped}</td></tr>
    </table>
    <p>Full HTML report and JUnit XML are attached / linked in the CI build.</p>
  `;

  return { html, passed, failed, skipped, total };
}

async function sendEmail(): Promise<void> {
  const summary = buildSummary();

  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: Number(config.email.port),
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  const attachments: { filename: string; path: string }[] = [];

  const junitPath = path.join(__dirname, '..', 'test-results', 'junit-results.xml');
  if (fs.existsSync(junitPath)) {
    attachments.push({ filename: 'junit-results.xml', path: junitPath });
  }

  const zipPath = path.join(__dirname, '..', 'playwright-report.zip');
  if (fs.existsSync(zipPath)) {
    attachments.push({ filename: 'playwright-report.zip', path: zipPath });
  }

  const subjectStatus = summary.failed > 0 ? 'FAILED' : 'PASSED';

  await transporter.sendMail({
    from: config.email.from,
    to: config.email.to,
    subject: `${config.email.subject} - ${subjectStatus}`,
    html: summary.html,
    attachments,
  });

  console.log('Email report sent successfully.');
}

sendEmail().catch((err) => {
  console.error('Failed to send email report:', err);
  process.exit(1);
});
