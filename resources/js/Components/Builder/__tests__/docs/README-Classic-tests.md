These tests are authored for React Testing Library with Jest/Vitest environment (jest-dom matchers).
- If this project uses Vitest: ensure test environment "jsdom" is configured.
- If using Jest: ensure @testing-library/jest-dom is imported in setup files or at test level.

Import path assumption:
- Classic component is expected at resources/js/Components/Builder/Classic.tsx
If the component file was initially misnamed as Classic.test.tsx containing component code, this change duplicated it into Classic.tsx to allow tests to import properly.