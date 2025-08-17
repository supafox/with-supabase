import { defineConfig, defineDocs } from "fumadocs-mdx/config"
import rehypePrettyCode from "rehype-pretty-code"

export default defineConfig({
  mdxOptions: {
    rehypePlugins: (plugins) => {
      // Filter by checking plugin constructor name or other metadata
      const filteredPlugins = plugins.filter((plugin) => {
        // Handle different plugin formats: [plugin, options] or just plugin
        const pluginFn = Array.isArray(plugin) ? plugin[0] : plugin

        // Check if the plugin function has a name property
        if (typeof pluginFn === "function" && "name" in pluginFn) {
          return pluginFn.name !== "rehypeSyntaxHighlight"
        }

        // Fallback: check if the plugin is the specific function we want to exclude
        // This is more reliable than toString() but still handles edge cases
        return true
      })
      return [...filteredPlugins, [rehypePrettyCode, { theme: "dracula" }]]
    },
  },
})

export const docs = defineDocs({
  dir: "data/content/docs",
})
