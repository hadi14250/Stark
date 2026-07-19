import { defineConfig } from "vitest/config";

/**
 * Until now the suite ran with NO config at all, which meant two things:
 * the environment was always `node`, so no component could ever be rendered,
 * and the `@/*` alias did not resolve, so every test had to use relative
 * imports. Both are why the previous 44 tests could not fail on anything the
 * redesign changes.
 *
 * Default environment stays `node` — most tests here are file/text/logic
 * assertions and jsdom would only slow them down. Tests that need a DOM opt in
 * per file with a docblock:
 *
 *   // @vitest-environment jsdom
 */
export default defineConfig({
  resolve: {
    // Native replacement for vite-tsconfig-paths; reads `paths` from
    // tsconfig.json so tests can import `@/components/...` like source does.
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    globals: false,
    server: {
      deps: {
        /**
         * next-intl ships ESM that imports "next/navigation" without an
         * extension. Node's ESM resolver rejects that, so any component
         * reaching next-intl's navigation helpers fails to load. Inlining
         * makes Vite resolve it (Vite honours package exports), which is how
         * Next itself resolves it at build time.
         */
        inline: ["next-intl"],
      },
    },
  },
});
