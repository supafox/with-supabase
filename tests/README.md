# Playwright Tests for CSP Violation Detection

This directory contains Playwright tests specifically designed to detect Content Security Policy (CSP) violations in your Next.js application.

**Production Testing**: These tests run against your production build, providing a more accurate representation of your live environment and catching issues that might not appear in development.

## Test Files

### `csp-violations.spec.ts`

General CSP violation detection tests that monitor:

- Console messages
- Page errors
- Request failures
- User interactions

### `csp-eval-violations.spec.ts`

Specialized tests that specifically look for the CSP eval violation pattern:

```text
Content-Security-Policy: The page's settings blocked a JavaScript eval (script-src) from being executed because it violates the following directive: "script-src 'strict-dynamic' 'nonce-i6dzmnajBVaTxwIG5VvqOw=='" (Missing 'unsafe-eval')
```

## Running the Tests

### Basic Test Run

```bash
pnpm test
```

### Interactive UI Mode

```bash
pnpm test:ui
```

### Headed Mode (see browser)

```bash
pnpm test:headed
```

### Debug Mode

```bash
pnpm test:debug
```

### Run Specific Test File

```bash
pnpm test csp-eval-violations.spec.ts
```

### Run Tests in Specific Browser

```bash
pnpm test --project=chromium
pnpm test --project=firefox
pnpm test --project=webkit
```

## Test Configuration

The tests are configured in `playwright.config.ts` with:

- Base URL: `http://localhost:3000`
- Automatic production server startup (build + start)
- HTTP support (production environment)
- Screenshot and video capture on failure
- Trace collection on retry

## What the Tests Monitor

### Console Messages

- All console.log, console.error, console.warn messages
- CSP-related error messages
- Script execution errors

### Page Errors

- JavaScript runtime errors
- CSP violation errors
- Network request failures

### Request Failures

- Blocked resource requests
- CSP policy violations
- Network errors

## Customizing Assertions

The tests include three different assertion strategies. You can modify them based on your needs:

### Option 1: Expect CSP Violations

If you want to ensure that CSP violations are detected:

```typescript
expect(cspViolations.length).toBeGreaterThan(0)
expect(exactPattern).toBeDefined()
```

### Option 2: Prevent CSP Violations

To assert that no CSP violations occur:

```typescript
expect(cspViolations.length).toBe(0)
expect(exactPattern).toBeUndefined()
```

### Option 3: Monitor Specific Patterns

To monitor specific violation patterns:

```typescript
expect(exactPattern).toContain("strict-dynamic")
expect(exactPattern).toMatch(/nonce-[a-zA-Z0-9]+/)
```

## Debugging CSP Violations

When violations are detected, the tests will:

1. Log all console messages and errors
2. Highlight CSP-specific violations
3. Extract nonce values for debugging
4. Show the exact violation pattern

## Common CSP Violation Sources

- Third-party scripts without proper nonces
- Inline event handlers
- Dynamic script injection
- Eval() function calls
- Inline styles without nonces

## Troubleshooting

### Tests Fail to Start

- The tests will automatically build and start your production server
- Ensure your production build completes successfully
- Check that Playwright is properly installed: `pnpm install`
- Ensure Playwright browsers are installed (first run/CI): `pnpm exec playwright install --with-deps`
- Production server runs on `http://localhost:3000`

### No Violations Detected

- Increase wait times in tests
- Check if CSP headers are properly configured
- Verify that the violation actually occurs in the browser

### False Positives

- Filter console messages more specifically
- Adjust the violation detection logic
- Use more targeted selectors for specific error types
