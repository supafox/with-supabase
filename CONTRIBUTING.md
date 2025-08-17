# 🧑‍💻 How to Contribute

## 🛠 Development Setup

### Required VS Code Extensions

This project recommends the **Deno VS Code extension** (`denoland.vscode-deno`) for optimal development experience. The extension provides:

- Enhanced TypeScript support for Deno runtime
- Improved IntelliSense and error detection
- Better integration with the project's development workflow

**Note**: This extension is particularly important for Supabase Edge Functions development. While the extension is automatically recommended when opening the project in VS Code, contributors should ensure they have version 1.42.0 or higher installed for full compatibility. The extension identifier in `.vscode/extensions.json` doesn't support version constraints, so please manually verify your extension version.

---

## 📝 Component Development

To add or update a component in `components/ui` or `components/primitives`:

---

## 1. Use Semantic, Accessible Primitives

- Prefer native elements (`<button>`, `<input>`, `<dialog>`, etc.)

- Compose UI components from:
  - ✅ Native HTML elements with proper ARIA attributes
  - ✅ Internal primitives in `components/primitives`

- ❌ Never use Radix UI, Headless UI, React Aria, or any third-party primitives

---

## 2. Style with Tailwind Only

- `components/ui/`: Use Tailwind utility classes only — no `style={{}}`, inline styles, CSS-in-JS, or dynamic class injection
- `components/primitives/`: Do not style directly — only use `@apply` sparingly for tokenization if needed

---

## 3. Ensure Accessibility

- Add `aria-*`, roles, and `label` attributes as needed
- Support full keyboard interaction (Tab, Enter, Escape, Arrow keys)
- Use `useId()` from React instead of hardcoded IDs or `Math.random()`

---

## 4. Be CSP-Safe by Default

- No injected `<style>` or `<script>` tags
- No `eval`, `Function`, or inline event handlers
- All animations must support `nonce` if used
- Framer Motion is allowed only with:
  - Static, optional variants
  - No dynamic inline styles
  - Proper nonce handling via config if MotionConfig is used

---

## 5. Follow Component API Conventions

- Accept `className`, `children`, and valid HTML attributes
- Use `React.forwardRef()` with correct typing
- Use `asChild` or `as="..."` pattern where appropriate to allow flexible composition

---

## 6. Write Idiomatic React

- Use React hooks (`useRef`, `useEffect`, etc.) correctly
- Clean up listeners and observers in effects
- Avoid direct DOM manipulation unless strictly necessary for accessibility

---

## ✅ Component Checklist

Before opening a PR:

- [ ] Component is in `components/ui/` or `components/primitives/`
- [ ] Uses **native HTML elements** or internal **primitives**
- [ ] Follows the [component checklist](docs/component-checklist.mdx)
- [ ] Passes `pnpm lint && pnpm typecheck`
- [ ] Screen reader / keyboard / aXe / Lighthouse tested
- [ ] CSP-safe under strict policy
- [ ] Reviewed by **CodeRabbit** or **Cursor**

---

## 📁 Folder Structure

```
components/
├── ui/            # Styled atomic components (Button, Spinner, etc.)
│   └── button.tsx
└── primitives/    # Unstyled semantic primitives with full accessibility
    └── dialog.tsx
```

---

## 🤖 AI Review Tools

### 🐰 CodeRabbit

- Automatic code review in PRs
- Uses `.coderabbit.yaml` with separate instructions per folder

### ✨ Cursor

- Enforces structure and conventions live in your editor
- Uses `.cursor/rules/ui.mdc` and `.cursor/rules/primitives.mdc`

---

## 🧪 Development

```bash
pnpm install
pnpm dev
```
