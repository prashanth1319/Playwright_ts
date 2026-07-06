import * as dotenv from 'dotenv';
import { AppConfig } from '../types';

dotenv.config();

/**
 * Centralized environment configuration.
 * Add more keys here as the framework grows (API URLs, timeouts, feature flags, etc.)
 */
const config: AppConfig = {
  baseUrl: process.env.BASE_URL || 'https://www.saucedemo.com',
  defaultTimeout: 30000,
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

export default config;
