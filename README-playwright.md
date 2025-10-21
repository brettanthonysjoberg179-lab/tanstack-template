# Playwright (E2E) Quick Start

1. Install Playwright locally (optional for contributors):
   ```bash
   npm i -D @playwright/test playwright
   npx playwright install
   ```

2. Run tests locally:
   ```bash
   npx playwright test
   ```

3. View HTML report after a run:
   ```bash
   npx playwright show-report
   ```

## Notes:
- Playwright config is in `playwright.config.ts`
- Tests live under `./tests`. The repo includes a minimal example test that visits example.com so CI validates Playwright runs.
- The CI workflow installs Playwright transiently in GitHub Actions so no changes to package.json are required.
