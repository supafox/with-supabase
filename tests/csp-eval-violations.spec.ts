import { expect, test } from "@playwright/test"

import { routes as routeDefs } from "../constants/routes"

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

test.describe("CSP Eval Violations - Specific Pattern Detection", () => {
  test("should not produce CSP eval violations", async ({ page }) => {
    // Store all console messages and errors
    const allMessages: string[] = []
    const cspViolations: string[] = []

    // Listen to console messages
    page.on("console", (msg) => {
      const text = msg.text()
      allMessages.push(`[CONSOLE] ${text}`)

      // Check for CSP-related messages
      if (
        text.includes("Content-Security-Policy") ||
        text.includes("CSP") ||
        text.includes("script-src") ||
        text.includes("unsafe-eval")
      ) {
        cspViolations.push(`[CONSOLE] ${text}`)
      }
    })

    // Listen to page errors
    page.on("pageerror", (error) => {
      const message = error.message
      allMessages.push(`[ERROR] ${message}`)

      if (
        message.includes("Content-Security-Policy") ||
        message.includes("CSP") ||
        message.includes("script-src") ||
        message.includes("unsafe-eval")
      ) {
        cspViolations.push(`[ERROR] ${message}`)
      }
    })

    // Listen to request failures
    page.on("requestfailed", (request) => {
      const failure = request.failure()
      if (failure?.errorText) {
        allMessages.push(`[REQUEST_FAILED] ${failure.errorText}`)

        if (
          failure.errorText.includes("Content-Security-Policy") ||
          failure.errorText.includes("CSP") ||
          failure.errorText.includes("script-src") ||
          failure.errorText.includes("unsafe-eval")
        ) {
          cspViolations.push(`[REQUEST_FAILED] ${failure.errorText}`)
        }
      }
    })

    // Install in-page SecurityPolicyViolationEvent listener before navigation
    await page.addInitScript(() => {
      // @ts-expect-error - Property '__cspEvents' does not exist on type 'Window & typeof globalThis'
      window.__cspEvents = []
      window.addEventListener("securitypolicyviolation", (event) => {
        const e = event as SecurityPolicyViolationEvent & {
          violatedDirective?: string
        }
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

    // Navigate to the page
    await page.goto("/")

    // Wait for page to load and any potential violations
    await page.waitForLoadState("networkidle")
    // Optional brief grace period if you keep console-heuristics
    await page.waitForTimeout(250)

    // Only log CSP violations, not all messages
    if (cspViolations.length > 0) {
      console.log(`\n🚨 CSP Violations detected in ${page.url()}:`)
      cspViolations.forEach((violation, index) => {
        console.log(`  ${index + 1}. ${violation}`)
      })
    }

    // Look for the exact pattern mentioned in the user query
    const exactPattern = allMessages.find((msg) => {
      const needles = ["Content-Security-Policy", "script-src", "nonce-"]
      const hasEvalPhrase =
        msg.includes("blocked a JavaScript eval") ||
        msg.includes("Refused to evaluate a string as JavaScript")
      return hasEvalPhrase && needles.every((n) => msg.includes(n))
    })

    if (exactPattern) {
      console.log("\n🎯 Exact CSP eval violation pattern detected!")
      console.log(`  Pattern: ${exactPattern}`)

      // Extract the nonce value for debugging - base64 can contain +, /, =, and _
      const nonceMatch = exactPattern.match(/nonce-([A-Za-z0-9+/_=-]+)/)
      if (nonceMatch) {
        console.log(`  Nonce: ${nonceMatch[1]}`)
      }
    }

    // Prefer SecurityPolicyViolationEvent for robust detection across engines
    const spv = await page.evaluate(
      () => (window as unknown as CustomWindow).__cspEvents || []
    )
    const evalEvents = spv.filter(
      (e) => e.effectiveDirective === "script-src" && e.blockedURI === "eval"
    )

    // Assert no eval violations occurred
    expect(evalEvents.length).toBe(0)
    expect(cspViolations.length).toBe(0)
  })

  test("should monitor CSP violations during dynamic content loading", async ({
    page,
  }) => {
    const violations: string[] = []

    // Install SecurityPolicyViolationEvent listener for this test
    await page.addInitScript(() => {
      // @ts-expect-error - Property '__cspEvents' does not exist on type 'Window'
      window.__cspEvents = []
      window.addEventListener("securitypolicyviolation", (event) => {
        const e = event as SecurityPolicyViolationEvent & {
          violatedDirective?: string
        }
        // @ts-expect-error - Property '__cspEvents' does not exist on type 'Window'
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

    // Set up listeners
    page.on("console", (msg) => {
      const text = msg.text()
      if (
        text.includes("Content-Security-Policy") ||
        text.includes("CSP") ||
        text.includes("script-src") ||
        text.includes("unsafe-eval")
      ) {
        violations.push(`[CONSOLE] ${text}`)
      }
    })

    page.on("pageerror", (error) => {
      const message = error.message
      if (
        message.includes("Content-Security-Policy") ||
        message.includes("CSP") ||
        message.includes("script-src") ||
        message.includes("unsafe-eval")
      ) {
        violations.push(`[ERROR] ${message}`)
      }
    })

    // Navigate to the page
    await page.goto("/")

    // Wait for initial load
    await page.waitForLoadState("networkidle")

    // Try to trigger dynamic content that might cause CSP violations
    try {
      // Look for any interactive elements
      const buttons = page.locator("button")
      const buttonCount = await buttons.count()

      if (buttonCount > 0) {
        // Click the first button to trigger any dynamic content
        await buttons.first().click()
        await page.waitForLoadState("networkidle")
      }

      // Look for any forms
      const forms = page.locator("form")
      const formCount = await forms.count()

      if (formCount > 0) {
        // Try to interact with form elements
        const inputs = page.locator("input")
        const inputCount = await inputs.count()

        if (inputCount > 0) {
          await inputs.first().focus()
          await page.waitForTimeout(250)
        }
      }

      // Optional brief grace period if you keep console-heuristics
      await page.waitForTimeout(250)
    } catch (error) {
      console.log("Error during dynamic content testing:", error)
    }

    // Only log if violations found
    if (violations.length > 0) {
      await test.info().attach("csp-violations-dynamic-content.json", {
        body: JSON.stringify(violations, null, 2),
        contentType: "application/json",
      })
      console.log(
        `\n⚠️ CSP violations during dynamic content loading: ${violations.length}`
      )
    }

    // Assert no violations occurred
    expect(violations.length).toBe(0)
  })

  test("should check for CSP violations in different routes", async ({
    page,
  }) => {
    const allViolations: string[] = []

    // Install SecurityPolicyViolationEvent listener for this test
    await page.addInitScript(() => {
      // @ts-expect-error - Property '__cspEvents' does not exist on type 'Window'
      window.__cspEvents = []
      window.addEventListener("securitypolicyviolation", (event) => {
        const e = event as SecurityPolicyViolationEvent & {
          violatedDirective?: string
        }
        // @ts-expect-error - Property '__cspEvents' does not exist on type 'Window'
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

    // Set up listeners
    page.on("console", (msg) => {
      const text = msg.text()
      if (
        text.includes("Content-Security-Policy") ||
        text.includes("CSP") ||
        text.includes("script-src") ||
        text.includes("unsafe-eval")
      ) {
        allViolations.push(`[${page.url()}] [CONSOLE] ${text}`)
      }
    })

    page.on("pageerror", (error) => {
      const message = error.message
      if (
        message.includes("Content-Security-Policy") ||
        message.includes("CSP") ||
        message.includes("script-src") ||
        message.includes("unsafe-eval")
      ) {
        allViolations.push(`[${page.url()}] [ERROR] ${message}`)
      }
    })

    // Test different routes - imported from shared constants for coverage
    const routes = [
      "/",
      ...routeDefs.documentation.map((r) => r.path),
      ...routeDefs.auth.map((r) => r.path),
      // add other route groups as needed
    ]

    for (const route of routes) {
      try {
        await page.goto(route)
        await page.waitForLoadState("networkidle")
        // Optional brief grace period if you keep console-heuristics
        await page.waitForTimeout(250)

        // Route tested silently
      } catch (error) {
        console.log(`Error testing route ${route}:`, error)
      }
    }

    // Only log if violations found
    if (allViolations.length > 0) {
      await test.info().attach("csp-violations-routes.json", {
        body: JSON.stringify(allViolations, null, 2),
        contentType: "application/json",
      })
      console.log(
        `\n🚨 CSP violations found across routes: ${allViolations.length}`
      )
      allViolations.forEach((violation, index) => {
        console.log(`  ${index + 1}. ${violation}`)
      })
    }

    // Assert no violations occurred on any route
    expect(allViolations.length).toBe(0)
  })
})
