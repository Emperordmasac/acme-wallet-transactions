import '@testing-library/jest-dom/vitest'

// jsdom has no matchMedia; report "no match" so components render their default layout.
window.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }) as unknown as MediaQueryList
