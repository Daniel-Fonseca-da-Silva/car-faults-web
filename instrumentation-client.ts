// Runs before the app hydrates on the client - the earliest point where we
// can patch console.error, before React or Next's dev overlay pick it up.
//
// React 19 warns whenever a <script> host element is rendered during a
// client render, which next/script's `beforeInteractive` strategy does by
// design (see app/layout.tsx). This is a known Next.js 16.2 + React 19
// compatibility quirk, not a bug in this app - the script itself runs fine.
// Suppress that one message in development until the framework fixes it.
if (process.env.NODE_ENV === "development") {
  const originalConsoleError = console.error;

  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag while rendering React component")
    ) {
      return;
    }

    originalConsoleError(...args);
  };
}
