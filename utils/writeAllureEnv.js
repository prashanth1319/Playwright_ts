const fs = require('fs');
const path = require('path');

function resolveBaseUrl(envName) {
  const env = (envName || process.env.TEST_ENV || 'dev').toLowerCase();
  if (process.env.BASE_URL) return process.env.BASE_URL;
  if (env === 'staging' && process.env.BASE_URL_STAGING) return process.env.BASE_URL_STAGING;
  if (env === 'dev' && process.env.BASE_URL_DEV) return process.env.BASE_URL_DEV;
  // fall back to a sensible default
  if (env === 'staging') return 'https://staging.example.com';
  return 'https://www.saucedemo.com';
}

function writeAllureEnv(envName) {
  const baseUrl = resolveBaseUrl(envName);
  const env = (envName || process.env.TEST_ENV || 'dev').toLowerCase();
  const lines = [
    `Environment=${env}`,
    `BaseURL=${baseUrl}`,
  ];

  const outDir = path.resolve(process.cwd(), 'allure-results');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outFile = path.join(outDir, 'environment.properties');
  fs.writeFileSync(outFile, lines.join('\n'));
  console.log(`Wrote Allure environment properties to ${outFile}`);
}

const argEnv = process.argv[2];
writeAllureEnv(argEnv);

// exit with success
process.exit(0);
