# Playwright + TypeScript POM / Data-Driven Automation Framework

End-to-end UI test automation framework built with **Playwright + TypeScript**,
using the **Page Object Model (POM)** and **Data-Driven Testing** design
patterns. Includes ready-to-use **GitHub Actions** and **Jenkins** pipelines
that run the suite on every push/PR and **email the test report** automatically.

Sample application under test: [saucedemo.com](https://www.saucedemo.com) — a public demo e-commerce site, so you can clone and run this immediately with no setup of your own app.

## 1. Project Structure

```
playwright-framework-ts/
├── .github/workflows/playwright.yml   # GitHub Actions CI pipeline
├── Jenkinsfile                        # Jenkins declarative pipeline
├── config/
│   └── env.config.ts                  # Centralized, typed env/config reader
├── data/
│   ├── loginData.json                 # Data-driven login scenarios
│   └── checkoutData.json              # Data-driven checkout scenarios
├── types/
│   └── index.ts                       # Shared interfaces (LoginRecord, CheckoutRecord, AppConfig...)
├── pages/                             # Page Object Model classes
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   └── CartPage.ts                    # (Cart, CheckoutInfo, Overview, Complete)
├── tests/
│   ├── login.spec.ts                  # Smoke tests
│   ├── dataDrivenLogin.spec.ts        # Data-driven test (loops over JSON)
│   ├── inventory.spec.ts              # Cart badge / sorting tests
│   └── cart.spec.ts                   # Full checkout E2E + data-driven checkout
├── utils/
│   └── sendEmailReport.ts             # Nodemailer-based report emailer
├── playwright.config.ts               # Reporters: list, html, json, junit
├── tsconfig.json
├── package.json
├── .env.example
└── .gitignore
```

## 2. Design Patterns Used

- **Page Object Model (POM)**: every page/screen is a class (`LoginPage`, `InventoryPage`, `CartPage`, etc.) holding its typed locators (`Locator`) and actions. Tests never touch selectors directly — they call page methods. `BasePage` holds shared helpers (click, fill, getText...) that every page object inherits.
- **Data-Driven Testing**: test scenarios live in JSON files under `data/`, typed via interfaces in `types/index.ts` (`LoginRecord`, `CheckoutRecord`). `dataDrivenLogin.spec.ts` and part of `cart.spec.ts` loop over these JSON arrays and generate one Playwright test per record — add a new row to the JSON, get a new test case, with zero code changes.

Playwright runs `.spec.ts` files natively (via its built-in esbuild-based transform) — **no manual build/compile step is required** to run tests. `npm run typecheck` (via `tsc --noEmit`) is provided purely as a static-analysis safety net for CI.

## 3. Local Setup

```bash
git clone <your-repo-url>
cd playwright-framework-ts
npm install
npx playwright install --with-deps
cp .env.example .env   # then fill in SMTP creds if you want local email sending
```

Run tests:

```bash
npm test                    # headless, all browsers
npm run test:headed         # headed mode
npm run test:chromium       # single browser
npm run test:ui             # Playwright UI mode (interactive)
npm run typecheck           # tsc --noEmit, verifies types with no test run
npm run report:show         # open the last HTML report
```

Send the report by email locally (after a test run):

```bash
npm run report:send
```

## 4. Test Cases Included

| File | Test cases |
|---|---|
| `login.spec.ts` | Valid login redirects to products page; locked-out user shows error |
| `dataDrivenLogin.spec.ts` | 5 data-driven scenarios from `loginData.json` (valid, locked out, wrong password, problem user, empty fields) |
| `inventory.spec.ts` | Add-to-cart badge count, remove-from-cart badge count, price sort validation |
| `cart.spec.ts` | Full purchase E2E flow + 3 data-driven checkout-info validation scenarios |

That's 4 spec files / 10+ individual test cases in total, easily extendable by editing the JSON data files (and, if new fields are needed, the interfaces in `types/index.ts`).

## 5. CI/CD — GitHub Actions

Workflow file: `.github/workflows/playwright.yml`. Triggers on push/PR to `main`/`master`, and can also be run manually.

**Setup:**
1. Push this repo to GitHub.
2. Go to **Settings > Secrets and variables > Actions** and add these repository secrets:
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, `EMAIL_TO`
   - (Optional) add a repository **variable** `BASE_URL` if testing a different environment.
3. On every run, the workflow:
   - Installs dependencies & browsers
   - Runs `tsc --noEmit` as a type-check gate
   - Runs all tests (`continue-on-error` so later steps still run on failure)
   - Zips the HTML report
   - Uploads the HTML report and JUnit XML as build artifacts
   - **Emails the report** (pass or fail) using [`dawidd6/action-send-mail`](https://github.com/dawidd6/action-send-mail), with the zipped report and JUnit XML attached
   - Finally fails the job if tests failed, so PR checks reflect the real result

> Gmail users: create an **App Password** (not your regular password) for `SMTP_PASS`, and use `smtp.gmail.com` / port `587`.

## 6. CI/CD — Jenkins

File: `Jenkinsfile` (declarative pipeline).

**Prerequisites on your Jenkins instance:**
1. Install plugins: **NodeJS Plugin**, **HTML Publisher Plugin**, **Email Extension Plugin (emailext)**, JUnit (bundled).
2. Manage Jenkins > Tools > add a NodeJS installation named `Node20` (matching the `tools { nodejs 'Node20' }` block — rename if you use a different name/version).
3. Manage Jenkins > Configure System > **Extended E-mail Notification**: set your SMTP server, default recipients, and credentials.
4. Create a **Pipeline** job (or Multibranch Pipeline) pointing at this repo, using the `Jenkinsfile` at the repo root.

**What the pipeline does:**
1. Checkout → Install deps → Install browsers → Type check → Run Playwright tests
2. Zips the HTML report
3. In `post { always { ... } }`:
   - Publishes JUnit results (pass/fail trend graph in Jenkins UI)
   - Publishes the HTML report as a Jenkins tab (via `publishHTML`)
   - Archives `playwright-report.zip` and `test-results/**` as build artifacts
   - Sends an **email** (`emailext`) with the HTML report zip + JUnit XML attached to the default recipients, on every build regardless of outcome
   - Marks the build as `FAILURE` if the test step returned a non-zero exit code

## 7. Extending the Framework

- **New page** → add a class under `pages/` extending `BasePage`, typing locators as `Locator`.
- **New data-driven scenario** → add a record to the relevant JSON file in `data/`; extend the matching interface in `types/index.ts` if you add new fields.
- **New environment** → add values to `.env` / `config/env.config.ts` and reference `config.baseUrl` etc.
- **New CI recipients or SMTP provider** → update GitHub secrets or Jenkins Email Extension config; no pipeline code changes needed.
