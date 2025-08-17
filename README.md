# ⚡️ Next.js Starter Template

A scalable, maintainable, and modern Next.js starter with clear separation of concerns for UI primitives, shared logic, features, configuration, and styling.

Ideal for product teams and solo developers building full-featured, well-structured applications with ease and flexibility.

---

## ✨ Features

- ✅ App directory (Next.js 15.x)
- ✅ TypeScript, Tailwind CSS, and utility-first styling
- ✅ Flexible folder structure with clear boundaries
- ✅ Feature-first modularity
- ✅ Global design tokens and configuration
- ✅ Internationalization-ready
- ✅ Component-first development workflow
- ✅ MDX rendering support for documentation and content

---

## 📋 Requirements

- **Node.js**: Version 20, 22, or 24 (recommended: 24)
- **pnpm**: Version 8 or higher
- **Playwright**: Automatically installs browsers via postinstall script

### Node.js Version Management

This project includes version files for popular Node.js managers:

- `.nvmrc` - For nvm users (recommended: Node 24)
- `.node-version` - For fnm, nodenv, and other version managers (recommended: Node 24)

**Recommended Local Version**: Node 24 (LTS)

- Provides access to latest features and performance improvements
- Ensures consistency across development environments

**Compatibility**: We support Node 20, 22, and 24 for broad compatibility

---

## 🗂 Folder Structure

```
src/
├── app/                    # Next.js routing and layouts
│   └── (route segments)/
│
├── components/             # Reusable UI building blocks
│   ├── ui/                # Atomic elements (Button, Spinner, Toggle, etc.)
│   └── widgets/           # Composite blocks (Navbar, Footer, TeamGrid, etc.)
│
├── public/                # Static assets like images, favicons, or robots.txt
│
├── features/              # Domain-driven features
│   └── example-feature/
│       ├── components/    # Feature-specific UI (e.g. FeatureModal)
│       ├── actions/       # Server actions and API calls
│       ├── hooks/         # Local feature hooks
│       └── schemas/       # Zod validation schemas
│
├── shared/                # Global logic used across features
│   ├── hooks/             # Global hooks (e.g. useSession)
│   ├── types/             # Shared TypeScript types
│   └── ui/                # Cross-feature UI (e.g. UserAvatar)
│
├── lib/                   # Config, clients, and utilities
│   ├── api/               # API client setup and config
│   ├── database/          # Database client/server utils
│   └── utils.ts           # App-wide utility functions
│
├── data/                  # Static content and dictionaries
│   └── locales/           # Localization dictionaries (e.g. en.json, es.json)
│   └── docs/              # # MDX-based documentation content
│
├── constants/             # App-wide tokens and mappings
│   ├── tailwind.ts        # Tailwind spacing/class tokens (e.g. gap mappings)
│   ├── routes.ts          # Centralized route definitions
│   └── seo.ts             # Default meta and SEO config
│
├── config/                # Fonts, icons, theme config
│   ├── fonts.ts           # Font loading via next/font
│   └── icons.tsx          # Icon components or icon registry
│
├── providers/             # React context providers
│   └── theme-provider.tsx # Theme and other global providers
│
├── styles/                # Styling entry points
│   ├── globals.css        # Tailwind layers, base styles, resets
│   └── mdx.css            # Styles specifically for MDX content
│
└── middleware.ts          # Next.js middleware for auth, i18n, headers, etc.
```

---

## 🧱 Project Architecture Guide

This project uses a layered component architecture for clarity, reuse, and separation of concerns. Here's how each folder should be used:

---

### `components/ui/` — **Design system primitives**

> Low-level, framework-agnostic building blocks. No app logic, no context.

- Stateless and reusable
- Built with Tailwind or utility-first CSS
- Equivalent to `shadcn/ui` or `@radix-ui/*`

**Examples:**

- `Button`, `Input`, `Avatar`, `Card`, `Dialog`, `DropdownMenu`

---

### `shared/ui/` — **Reusable presentational components**

> Personalized UI patterns composed of `components/ui`, used across routes or pages.

- Accepts real props (e.g. user, name, avatarUrl)
- No side effects or data fetching
- Layout-aware or context-aware (e.g. responsive variations)

**Examples:**

- `UserAvatar`, `UserNav`, `ProfileCard`, `ThemeToggle`

---

### `shared/hooks/` — **Cross-feature logic**

> General-purpose utility hooks, used in any UI or feature layer.

**Examples:**

- `useIsMobile`, `useDebounce`, `useMounted`

---

### `features/*/` — **Reusable logic + UI for features**

> Encapsulates a specific feature's domain (e.g. Auth, Billing). May include hooks, components, actions.

- May fetch from Supabase, Stripe, etc.
- Can be reused across pages

**Examples:**

```typescript
features / auth / LoginForm.tsx
features / auth / useCurrentUser.ts
features / billing / StripeCheckoutButton.tsx
```

---

### `widgets/*/` — **Page-level or layout-specific compositions**

> One-off components or page-local modules. Not intended for reuse.

- Composes `shared/ui` + `features` + app logic
- May contain internal state or handlers
- Optimized for one route/layout

**Examples:**

```typescript
widgets / sidebar / NavUser.tsx
widgets / dashboard / StatsPanel.tsx
widgets / checkout / OrderSummary.tsx
```

---

### 🧠 General Rules of Thumb

| Folder          | Reusable? | Contains logic? | Purpose                                 |
| --------------- | --------- | --------------- | --------------------------------------- |
| `components/ui` | ✅        | ❌              | Design primitives                       |
| `shared/ui`     | ✅        | ❌              | App-wide reusable presentation          |
| `shared/hooks`  | ✅        | ✅              | Stateless reusable hooks                |
| `features/*`    | ✅        | ✅              | Feature-scoped logic + UI               |
| `widgets/*`     | ❌        | ✅              | Page- or layout-specific UI composition |

---

### ✅ Quick Reference Table

| Use Case                        | Place In                |
| ------------------------------- | ----------------------- |
| Visual-only button              | `components/ui/`        |
| Theme toggle button             | `components/ui/`        |
| User avatar with real data      | `shared/ui/`            |
| Sidebar / Header / Footer       | `components/widgets/`   |
| Contact form and modal          | `features/contact/`     |
| Auth login mutation & form      | `features/auth/`        |
| Global hook to get current user | `shared/hooks/`         |
| Utility to format a date        | `lib/utils.ts`          |
| Tailwind spacing config         | `constants/tailwind.ts` |

---

## 🌐 Localization

Organize all localization configuration and content like so:

- `lib/i18n/` → Localization setup and configuration
- `data/locales/` → JSON dictionaries per language (`en.json`, `es.json`, etc.)

---

## 🔧 Providers

The `providers/` directory contains React context providers that wrap your application:

- **Theme Provider** → Manages dark/light mode and theme switching
- **Auth Provider** → User authentication state management
- **Data Provider** → Global data fetching and caching
- **Feature Flags** → Feature toggle management

These providers should be added to your root layout to make their context available throughout the app.

```tsx
// app/layout.tsx
<ThemeProvider>
  <AuthProvider>{children}</AuthProvider>
</ThemeProvider>
```

---

## 📘 MDX Support

Custom MDX components should be defined in `components/mdx-components.tsx` and styled via `styles/mdx.css`. You can extend MDX syntax for callouts, code blocks, and other custom elements.

---

## ✅ Code Quality & Commit Conventions

This project enforces consistent and reliable code quality using:

- 🐶 **Husky** for Git hooks (`.husky/`)
- 🧹 **Lint-Staged** for fast pre-commit formatting (`.lint-staged.config.js`)
- 🎨 **Prettier** for consistent code style (`prettier.config.js`)
- 🧪 **ESLint** for static code analysis (`eslint.config.mjs`)
- 📝 **Commitlint** to enforce commit message standards (`commitlint.config.js`)

---

### 🧠 What Happens Automatically

| Git Hook     | Action                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------- |
| `pre-commit` | Runs ESLint (with `--cache` and `--fix` for speed) and Prettier on staged files via `lint-staged` |
| `commit-msg` | Validates commit message against conventional commit rules via Commitlint                         |

You don’t need to run anything manually — just use `git commit`, and it’s all automated.

---

### ✍️ Commit Message Format

This project follows [**Conventional Commits**](https://www.conventionalcommits.org/) to standardize Git history and support automatic changelog generation.

**Note:** This project uses Husky v9+ which automatically sets up git hooks. If you encounter any issues with git hooks, run `pnpm husky:setup` to reinstall them.

#### ✅ Allowed Commit Types

| Type       | Description                                               |
| ---------- | --------------------------------------------------------- |
| `feat`     | A new feature                                             |
| `fix`      | A bug fix                                                 |
| `docs`     | Documentation-only changes                                |
| `style`    | Code style changes (formatting, missing semicolons, etc.) |
| `refactor` | Code changes that neither fix bugs nor add features       |
| `perf`     | Performance improvements                                  |
| `test`     | Adding or updating tests                                  |
| `build`    | Changes to build system or external dependencies          |
| `chore`    | Routine tasks such as dependency updates                  |
| `revert`   | Reverts a previous commit                                 |

#### 🧪 Examples

````bash
git commit -m "feat: add dark mode toggle"
git commit -m "feat(navbar): add dark mode toggle"
git commit -m "fix: correct focus state on input field"
git commit -m "docs: update README usage section"
git commit -m "chore: bump dependencies"

## 🔧 Configuration

### Environment Variables

This project uses environment variables to avoid shipping template defaults. Create a `.env.local` file in your project root with the following variables:

**Note:** After editing any `.env*` files, restart the dev server (`Ctrl+C`, then `pnpm dev`) to apply changes.

#### Required Variables

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Optional Variables

```bash
# Twitter/X Social Media Configuration
# These override the default brand.twitterHandle values to avoid shipping template defaults
NEXT_PUBLIC_TWITTER_CREATOR=@yourusername
NEXT_PUBLIC_TWITTER_SITE=@yourbrand

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

#### Auto-Set Variables (Vercel)

The following variables are automatically set by Vercel when deploying:

```bash
# Vercel automatically sets these - no manual configuration needed
VERCEL_PROJECT_PRODUCTION_URL=auto_set_by_vercel
VERCEL_URL=auto_set_by_vercel
NODE_ENV=auto_set_by_vercel
```

#### Fallback Behavior

- **Twitter handles**: Will fall back to the values in `constants/brand.ts` if not set in environment variables
- **App URL**: Will fall back to `https://localhost:3000` in development if not set
- **Supabase variables**: Are required and will throw an error if missing

#### Usage Patterns

The project follows these patterns for environment variables:

- **Client-side variables**: Use `NEXT_PUBLIC_` prefix for variables needed in the browser
- **Server-side variables**: Use no prefix for variables only needed on the server
- **Required validation**: Critical variables like Supabase credentials are validated at runtime
- **Graceful fallbacks**: Non-critical variables fall back to sensible defaults
- **Security**: Sensitive variables are never exposed to the client
  - The Supabase anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) is intentionally public and safe for the browser. Never expose server secrets (e.g. service role keys) with `NEXT_PUBLIC_`.

## 🚀 Development

```bash
pnpm install
pnpm dev
```

### Testing with Playwright

This project includes comprehensive end-to-end testing with Playwright. Browsers are automatically installed on local installs via postinstall.

```bash
# Run all tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests in headed mode
pnpm test:headed

# Debug tests
pnpm test:debug

# Show test report
pnpm test:report

# Manually install browsers (if needed)
pnpm playwright:install

# Run development checks locally
pnpm dev:check

# Setup git hooks (if needed)
pnpm husky:setup

# Development with full checks
pnpm dev:full

# Clean install (if you encounter issues)
pnpm clean:install
```

### 🚨 Troubleshooting

If you encounter issues with dependencies or git hooks:

1. **Husky deprecation warning**: This is fixed in the current setup. If you see warnings, run `pnpm husky:setup`
2. **Playwright browsers not installing**: Run `pnpm playwright:install` manually
3. **Dependency issues**: Use `pnpm clean:install` to start fresh
4. **Git hooks not working**: Run `pnpm husky:setup` to reinstall hooks
````
