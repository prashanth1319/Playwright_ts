export interface LoginRecord {
  scenario: string;
  username: string;
  password: string;
  expected: 'success' | 'error';
  expectedMessage?: string;
}

export interface CheckoutRecord {
  scenario: string;
  firstName: string;
  lastName: string;
  postalCode: string;
  expected: 'success' | 'error';
  expectedMessage?: string;
}

export interface EmailConfig {
  host?: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from?: string;
  to?: string;
  subject: string;
}

export interface AppConfig {
  baseUrl: string;
  defaultTimeout: number;
  email: EmailConfig;
}
