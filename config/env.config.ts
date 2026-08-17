import * as dotenv from 'dotenv';
import { AppConfig } from '../UI/types';

dotenv.config();

// Known environment name keys and their defaults. These can be overridden
// via environment variables (e.g. BASE_URL_STAGING).
const ENV_DEFAULTS: Record<string, Partial<AppConfig>> = {
  dev: { baseUrl: process.env.BASE_URL_DEV || 'https://www.saucedemo.com' },
  staging: { baseUrl: process.env.BASE_URL_STAGING || 'https://staging.example.com' },
  prod: { baseUrl: process.env.BASE_URL || 'https://www.saucedemo.com' },
};

export function getAppConfig(envName?: string): AppConfig {
  const envKey = (envName || process.env.TEST_ENV || 'dev').toLowerCase();
  const env = ENV_DEFAULTS[envKey] || ENV_DEFAULTS.dev;

  const config: AppConfig = {
    baseUrl: env.baseUrl || process.env.BASE_URL || 'https://www.saucedemo.com',
    defaultTimeout: Number(process.env.DEFAULT_TIMEOUT) || 30000,
    email: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: process.env.EMAIL_SUBJECT || 'Playwright Automation Test Report',
    },
  };

  return config;
}

// Default export returns the resolved config for current TEST_ENV (or 'dev').
export default getAppConfig();
