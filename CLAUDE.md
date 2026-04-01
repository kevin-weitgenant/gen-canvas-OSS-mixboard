# Project-specific Instructions for Claude Code

## Important Restrictions

- **Never run `npm run dev`**: Do not start the development server. The user will run it manually when needed. 

- **Check for typescript errors** after every change: Always check for TypeScript errors after making any changes to the code. This ensures that your code is type-safe and helps catch potential issues early on.

- **Do not use useCallback**: Avoid using `useCallback` in your code. We are using react 19 in this project, and only in really specific cases is it necessary to use `useCallback`. In most cases, it is not needed and can be avoided.