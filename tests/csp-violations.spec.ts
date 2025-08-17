import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"

// Type declaration for custom window property used in testing
interface CustomWindow extends Window {
  __cspEvents: Array<{
    effectiveDirective: string
    violatedDirective?: string
    blockedURI: string
    disposition: string
    sourceFile: string
    lineNumber: number
    columnNumber: number
    sample: string
    originalPolicy: string
  }>
}

// Helper function to install SPV listener
async function installSpvListener(page: Page) {
  await page.addInitScript(() => {
    // @ts-expect-error - Property '__cspEvents' does not exist on type 'Window & typeof globalThis'
    window.__cspEvents = []
    window.addEventListener("securitypolicyviolation", (event) => {
      const e = event as SecurityPolicyViolationEvent
      // @ts-expect-error - Property '__cspEvents' does not exist on type 'Window & typeof globalThis'
      window.__cspEvents.push({
        effectiveDirective: e.effectiveDirective ?? e.violatedDirective,
        violatedDirective: e.violatedDirective,
        blockedURI: e.blockedURI,
        disposition: e.disposition,
        sourceFile: e.sourceFile,
        lineNumber: e.lineNumber,
        columnNumber: e.columnNumber,
        sample: e.sample,
        originalPolicy: e.originalPolicy,
      })
    })
  })
}

test.describe("Content Security Policy Violations", () => {
  test.beforeEach(async ({ page }) => {
    await installSpvListener(page)
  })

  test("should detect CSP violations in browser console", async ({ page }) => {
    // Array to store console messages
    const consoleMessages: string[] = []

    // Listen to console messages
    page.on("console", (msg) => {
      consoleMessages.push(msg.text())
    })

    // Listen to page errors (including CSP violations)
    page.on("pageerror", (error) => {
      consoleMessages.push(error.message)
    })

    // Listen to request failures (including CSP blocked requests)
    page.on("requestfailed", (request) => {
      const failure = request.failure()
      if (failure?.errorText) {
        consoleMessages.push(failure.errorText)
      }
    })

    // Navigate to the page
    await page.goto("/")
    // Wait for page to settle
    await page.waitForLoadState("networkidle")

    // Check if any console messages contain CSP violation indicators
    const indicators = [
      "Content-Security-Policy",
      "script-src",
      "unsafe-eval",
      "violates",
      "Refused to",
    ]
    const cspViolations = consoleMessages.filter((msg) => {
      const hits = indicators.filter((i) => msg.includes(i)).length
      return hits >= 2
    })

    // Only log CSP violations if found
    if (cspViolations.length > 0) {
      console.log(`\n🚨 CSP violations detected: ${cspViolations.length}`)
      cspViolations.forEach((violation, index) => {
        console.log(`  ${index + 1}. ${violation}`)
      })
    }

    // Assert no CSP violations via browser event and keep the console-based guard
    const spv = await page.evaluate(
      () => (window as unknown as CustomWindow).__cspEvents || []
    )
    if (spv.length > 0 || cspViolations.length > 0) {
      await test.info().attach("spv-events.json", {
        body: JSON.stringify({ spv, cspViolations }, null, 2),
        contentType: "application/json",
      })
    }
    expect(spv.length).toBe(0)
    expect(cspViolations.length).toBe(0)
  })

  test("should not produce CSP eval violations", async ({ page }) => {
    const evalViolations: string[] = []

    // Listen to console messages
    page.on("console", (msg) => {
      if (!["error", "warning"].includes(msg.type())) return
      const text = msg.text()
      if (text.includes("eval") || text.includes("script-src")) {
        evalViolations.push(text)
      }
    })

    // Listen to page errors
    page.on("pageerror", (error) => {
      if (
        error.message.includes("eval") ||
        error.message.includes("script-src")
      ) {
        evalViolations.push(error.message)
      }
    })

    // Navigate to the page
    await page.goto("/")

    // Wait for potential violations
    await page.waitForTimeout(250)

    // Prefer using SecurityPolicyViolationEvent if installed (see first test)
    const spv = await page.evaluate(
      () => (window as unknown as CustomWindow).__cspEvents || []
    )
    const evalEvents = spv.filter(
      (e) =>
        e.effectiveDirective?.startsWith("script-src") &&
        e.blockedURI === "eval"
    )

    // Only log if violations found
    if (evalViolations.length > 0) {
      console.log(
        `\n⚠️ Eval-related violations found: ${evalViolations.length}`
      )
    }

    // Assert no eval violations occurred
    if (evalEvents.length > 0 || evalViolations.length > 0) {
      await test.info().attach("spv-eval-events.json", {
        body: JSON.stringify({ evalEvents, evalViolations }, null, 2),
        contentType: "application/json",
      })
    }
    expect(evalEvents.length).toBe(0)
    expect(evalViolations.length).toBe(0)
  })

  test("should monitor CSP violations during user interactions", async ({
    page,
  }) => {
    const violations: string[] = []

    // Set up listeners
    page.on("console", (msg) => {
      if (!["error", "warning"].includes(msg.type())) return
      const text = msg.text()
      const indicators = [
        "Content-Security-Policy",
        "script-src",
        "unsafe-eval",
        "violates",
        "Refused to",
      ]
      const hits = indicators.filter((i) => text.includes(i)).length
      if (hits >= 2) {
        violations.push(text)
      }
    })

    page.on("pageerror", (error) => {
      const indicators = [
        "Content-Security-Policy",
        "script-src",
        "unsafe-eval",
        "violates",
        "Refused to",
      ]
      const hits = indicators.filter((i) => error.message.includes(i)).length
      if (hits >= 2) {
        violations.push(error.message)
      }
    })

    // Navigate to the page
    await page.goto("/")

    // Perform some user interactions that might trigger CSP violations
    try {
      // Try to click on various elements
      await page.click("body")

      // Try to navigate to different routes if they exist
      const links = page.locator("a[href]")
      const count = await links.count()
      if (count > 0) {
        await links.first().click()
        await page.waitForLoadState("networkidle")
        await page.goBack()
      }

      // Optional brief grace period if you keep console-heuristics
      await page.waitForTimeout(250)
    } catch (error) {
      // Log any errors that might be CSP-related
      console.log("Error during interactions:", error)
    }

    // Only log if violations found
    if (violations.length > 0) {
      const spv = await page.evaluate(
        () => (window as unknown as CustomWindow).__cspEvents || []
      )
      await test.info().attach("csp-violations-interactions.json", {
        body: JSON.stringify({ spv, violations }, null, 2),
        contentType: "application/json",
      })
      console.log(
        `\n⚠️ CSP violations during interactions: ${violations.length}`
      )
    }

    // Assert no violations occurred during interactions
    expect(violations.length).toBe(0)
  })
})
