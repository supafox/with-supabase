import type { Reporter, TestCase, TestResult } from "@playwright/test/reporter"

class CleanReporter implements Reporter {
  private browsers = new Map<
    string,
    { running: number; passed: number; failed: number }
  >()
  private startTime = 0
  private spinner = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
  private spinnerIndex = 0
  private updateInterval: ReturnType<typeof setInterval> | null = null
  private hasTests = false

  onBegin(): void {
    // Don't show custom output initially - wait for tests to start
    this.startTime = Date.now()
  }

  onTestBegin(test: TestCase) {
    // First test starting - now we can show our custom output
    if (!this.hasTests) {
      this.hasTests = true
      console.log("\n🚀 Starting CSP Violation Tests...")

      // Start a timer to update the spinner every 100ms (interactive terminals only)
      if (process.stdout.isTTY) {
        this.updateInterval = setInterval(() => {
          this.updateDisplay()
        }, 100)
      }
    }

    const browser = test.parent.project()?.name || "unknown"

    if (!this.browsers.has(browser)) {
      this.browsers.set(browser, { running: 0, passed: 0, failed: 0 })
    }

    const stats = this.browsers.get(browser)!
    stats.running++
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const browser = test.parent.project()?.name || "unknown"
    let stats = this.browsers.get(browser)
    if (!stats) {
      stats = { running: 0, passed: 0, failed: 0 }
      this.browsers.set(browser, stats)
    }

    stats.running--

    if (result.status === "passed") {
      stats.passed++
    } else if (result.status === "failed") {
      stats.failed++
    } else if (
      result.status === "timedOut" ||
      result.status === "interrupted"
    ) {
      // Treat as failures for summary to avoid false "all green"
      stats.failed++
    }
  }

  onEnd() {
    // Only show results if we actually ran tests
    if (!this.hasTests) {
      return
    }

    // Stop the update timer
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }

    const totalTime = ((Date.now() - this.startTime) / 1000).toFixed(1)

    console.log("\n" + "=".repeat(60))
    console.log("📊 Final Results:")
    console.log("=".repeat(60))

    let totalPassed = 0
    let totalFailed = 0

    for (const [browser, stats] of Array.from(this.browsers.entries())) {
      const status = stats.failed > 0 ? "❌" : "✅"
      console.log(
        `${status} ${browser.padEnd(12)} | ${stats.passed
          .toString()
          .padStart(3)} passed | ${stats.failed.toString().padStart(3)} failed`
      )
      totalPassed += stats.passed
      totalFailed += stats.failed
    }

    console.log("=".repeat(60))
    const overallStatus = totalFailed > 0 ? "❌" : "✅"
    console.log(
      `${overallStatus} Total: ${
        totalPassed + totalFailed
      } tests | ${totalPassed} passed | ${totalFailed} failed | ${totalTime}s`
    )
    console.log("=".repeat(60))

    if (totalFailed > 0) {
      console.log("\n📋 HTML Report: pnpm exec playwright show-report")
    }
  }

  private updateDisplay() {
    // Only render live UI on interactive terminals
    if (!process.stdout.isTTY) return
    // Clear the screen and show current status
    process.stdout.write("\x1b[2J\x1b[H") // Clear screen and move cursor to top

    console.log("🚀 Starting CSP Violation Tests...")

    let output = ""
    for (const [browser, stats] of Array.from(this.browsers.entries())) {
      const spinner = stats.running > 0 ? this.spinner[this.spinnerIndex] : " "
      const status = stats.failed > 0 ? "❌" : stats.passed > 0 ? "✅" : "⏳"

      output += `${spinner} ${status} ${browser.padEnd(12)} | ${stats.passed
        .toString()
        .padStart(
          3
        )} passed | ${stats.failed.toString().padStart(3)} failed | ${
        stats.running > 0 ? "running" : "idle"
      }\n`
    }

    process.stdout.write(output)

    // Update spinner
    if (this.spinnerIndex < this.spinner.length - 1) {
      this.spinnerIndex++
    } else {
      this.spinnerIndex = 0
    }
  }
}

export default CleanReporter
