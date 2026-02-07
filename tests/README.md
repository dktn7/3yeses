# Automated Testing Guide - Parental Consent System

## 🎯 Overview

This automated testing suite validates the complete parental consent system with three-tier age verification.

## 📋 Test Coverage

### Complete Flow Tests

1. **Adult (16+) Standard Signup**
   - Tests standard signup flow for users 16 and older
   - Validates SELF account type creation
   - Verifies redirect to email verification

2. **Teen (13-15) Self-Managed with Consent**
   - Tests teen selecting self-managed account
   - Validates SELF_WITH_CONSENT account type
   - Verifies parental consent email sent
   - Checks redirect to consent-pending page

3. **Teen (13-15) Parent-Managed**
   - Tests teen choosing parent-managed account
   - Validates PARENT_MANAGED account type
   - Verifies child name display in Steps 2 & 3
   - Checks media consent checkbox requirement

4. **Child (Under 13) Parent-Managed**
   - Tests automatic parent-managed requirement
   - Validates under-13 messaging
   - Verifies parent contact information collection
   - Checks complete parent-managed flow

### Validation Tests

- ✅ Minimum age requirement (13 years)
- ✅ Email format validation
- ✅ Password match validation
- ✅ Parental consent checkbox requirement
- ✅ Terms and conditions acceptance
- ✅ Required field validation

## 🚀 Quick Start

### Prerequisites

Make sure you have:
- Node.js installed
- Development server NOT running (tests will start it automatically)
- PostgreSQL database running

### Installation

```powershell
# Install Playwright (if not already installed)
npm install -D @playwright/test

# Install Playwright browsers
npx playwright install chromium
```

### Running Tests

#### Option 1: PowerShell Script (Recommended)
```powershell
.\run-tests.ps1
```

#### Option 2: NPM Commands
```powershell
# Run all tests
npm test

# Run only signup tests
npm run test:signup

# Run tests with UI (interactive mode)
npm run test:ui

# Run tests with browser visible
npm run test:headed

# View test report
npm run test:report
```

## 📊 Test Reports

After running tests, you'll get:

1. **Console Output**: Real-time test results with emojis
2. **HTML Report**: Detailed visual report
   ```powershell
   npx playwright show-report
   ```
3. **Screenshots**: Captured on test failures
4. **Videos**: Recorded for failed tests
5. **Traces**: Full interaction traces for debugging

All artifacts saved in: `test-results/`

## 🔍 What Gets Tested

### Step 1 - Account Information
- [x] Date of birth entry and age calculation
- [x] Age verification screens (under 13, 13-15, 16+)
- [x] Account type selection for teens
- [x] Personal information fields
- [x] Parent contact information (when needed)
- [x] Child information (for parent-managed)
- [x] Phone number with country selector
- [x] Password strength and matching
- [x] Parental consent checkbox (when required)
- [x] Terms and conditions checkbox

### Step 2 - Profile Details
- [x] Category and subcategory selection
- [x] Location autocomplete
- [x] Experience level selection
- [x] Bio field (optional)
- [x] Context banner for parent-managed accounts
- [x] Child name display
- [x] Auto-filled date of birth

### Step 3 - Media Upload
- [x] Profile photo upload
- [x] Context banner for parent-managed accounts
- [x] Media consent checkbox (parent-managed only)
- [x] Media consent validation
- [x] Form submission
- [x] Correct redirect based on account type

### API Integration
- [x] Account creation (all types)
- [x] Email sending (verification & consent)
- [x] Database record creation
- [x] Error handling
- [x] Response validation

## 🐛 Debugging Failed Tests

### View Detailed Report
```powershell
npx playwright show-report
```

### Run Single Test
```powershell
npx playwright test -g "Adult (16+)"
```

### Run with Browser Visible
```powershell
npm run test:headed
```

### Interactive Mode
```powershell
npm run test:ui
```

### View Trace
Failed tests generate trace files. Open them with:
```powershell
npx playwright show-trace test-results/[test-name]/trace.zip
```

## 📁 File Structure

```
tests/
└── e2e/
    └── signup-parental-consent.spec.ts  # Main test suite

test-results/
├── html/                                 # HTML reports
├── results.json                          # JSON results
├── screenshots/                          # Failure screenshots
└── videos/                              # Failure videos

playwright.config.ts                      # Test configuration
run-tests.ps1                            # PowerShell test runner
```

## ⚙️ Configuration

Edit `playwright.config.ts` to customize:

- **Timeout**: Test timeout duration
- **Retries**: Number of retry attempts
- **Workers**: Parallel execution
- **Browser**: Chrome, Firefox, Safari
- **Screenshots**: When to capture
- **Videos**: When to record

## 🎨 Test Output

The tests use emojis for easy scanning:

- 🧪 Test starting
- ✅ Test/step passed
- ❌ Test failed
- 📧 Email sent notification
- 📊 Report available
- 🔍 Debug info available

## 📝 Example Output

```
🧪 Testing: Adult (16+) Standard Signup
✅ Step 1 passed - Navigated to Step 2
✅ Step 2 passed - Navigated to Step 3
✅ Step 3 passed - Account created, redirected to email verification
📧 Verification email sent to: adult-1234567890@test.com

🧪 Testing: Teen Self-Managed with Parental Consent
✅ Parental consent notice displayed
✅ Step 1 passed
✅ Step 2 passed
✅ Step 3 passed - Account created, waiting for parental consent
📧 Consent email sent to: parent-consent-1234567890@test.com
```

## 🔄 Continuous Integration

To run tests in CI/CD:

```yaml
# GitHub Actions example
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium

- name: Run tests
  run: npm test
  env:
    CI: true
```

## 🛠️ Troubleshooting

### Port Already in Use
The tests automatically start the dev server. If port 3002 is busy:
```powershell
npm run kill-servers
```

### Playwright Not Found
```powershell
npm install -D @playwright/test
npx playwright install
```

### Tests Timeout
Increase timeout in `playwright.config.ts`:
```typescript
timeout: 120000, // 2 minutes
```

### Database Connection Issues
Ensure PostgreSQL is running and `.env` is configured correctly.

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
- [Project Documentation](./DEV_DOC.md)

## 🎯 Next Steps

After tests pass:
1. Test parental consent email links manually
2. Test email verification flow
3. Deploy to staging environment
4. Run tests against staging
5. Monitor production metrics
