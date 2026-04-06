import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    output: {
      mode: 'split',
      target: 'src/api/generated.ts',
      schemas: 'src/api/models',
      client: 'fetch',
      override: {
        mutator: {
          path: 'src/api/mutation.ts',
          name: 'customFetch',
        },
      },
    },
    input: {
      target: 'http://localhost:8000/openapi.json',
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write "src/api/**/*.{ts,tsx}"',
    },
  },
})
