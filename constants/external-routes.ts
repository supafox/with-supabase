export interface ExternalRoutes {
  learn: string
  templates: string
  nextjs: string
  deploy: string
}

export const externalRoutes = {
  learn:
    "https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app",
  templates:
    "https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app",
  nextjs:
    "https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app",
  deploy:
    "https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsupafox%2Fnextjs-with-supabase",
} as const satisfies ExternalRoutes
