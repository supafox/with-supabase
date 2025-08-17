module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "build",
        "test",
        "chore",
        "revert",
      ],
    ],
    "header-max-length": [2, "always", 72],
    "subject-case": [2, "always", "lowercase"],
  },
}
