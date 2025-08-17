#!/usr/bin/env node
import { spawnSync } from "child_process"

console.log("🔧 Checking Playwright installation requirements...")

try {
  // Normalise boolean-like env vars
  const isTruthy = (v) =>
    ["1", "true", "yes", "on"].includes(String(v).toLowerCase())

  // Check if we're in a deployment/build environment
  const vercelEnv = (process.env.VERCEL_ENV || "").toLowerCase()
  const isDeployment =
    process.env.NODE_ENV === "production" ||
    isTruthy(process.env.VERCEL) ||
    vercelEnv === "production" ||
    vercelEnv === "preview" ||
    isTruthy(process.env.BUILD_ENV) ||
    isTruthy(process.env.DEPLOYMENT_ENV)

  if (isDeployment) {
    console.log(
      "⏭️  Skipping Playwright installation in deployment environment"
    )
    console.log(
      "💡 Skipping automatic browser download; install browsers locally with 'pnpm playwright:install' or 'npx playwright install' if you plan to run tests."
    )
    process.exit(0)
  }

  // Check if we're in a containerized environment without system dependencies
  const isContainerized =
    process.env.CONTAINER ||
    process.env.DOCKER ||
    process.env.KUBERNETES ||
    !process.stdout.isTTY

  if (isContainerized) {
    console.log(
      "⏭️  Skipping Playwright installation in containerized environment"
    )
    console.log(
      "💡 Run 'pnpm playwright:install' manually when system dependencies are available"
    )
    process.exit(0)
  }

  // Honour standard Playwright env to skip downloads
  const skipByEnv =
    ["1", "true", "yes", "on"].includes(
      String(process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD).toLowerCase()
    ) || Boolean(process.env.PLAYWRIGHT_BROWSERS_PATH)
  if (skipByEnv) {
    console.log(
      "⏭️  Skipping Playwright installation due to environment configuration"
    )
    process.exit(0)
  }

  // Try to install browsers without system dependencies first
  console.log("📦 Installing Playwright browsers...")
  const ua = process.env.npm_config_user_agent || ""
  const isPnpm = /\bpnpm\b/.test(ua)
  const bin = isPnpm ? "pnpm" : "npx"
  const args = isPnpm
    ? ["exec", "playwright", "install"]
    : ["playwright", "install"]
  const { status } = spawnSync(bin, args, { stdio: "inherit" })
  if (typeof status === "number" && status !== 0) {
    throw new Error(`Playwright install exited with code ${status}`)
  }

  console.log("✅ Playwright browsers installed successfully!")
} catch (err) {
  console.log("⚠️  Playwright browser installation failed, but continuing...")
  if (process.env.DEBUG) {
    console.error("Reason:", err && err.message ? err.message : err)
  }
  console.log(
    '💡 You can run "pnpm playwright:install" manually later if needed.'
  )
  console.log(
    '💡 Or run "npx playwright install --with-deps" for full installation with system dependencies.'
  )

  // Exit with success to not break the install process
  process.exit(0)
}
