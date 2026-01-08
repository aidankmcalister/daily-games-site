import "@testing-library/jest-dom";
import { act } from "react";
import * as React from "react";

// Polyfill for React 19 compatibility
// Many testing libraries expect React.act to be available from the 'react' default export
// or the global React object.

// 1. Shim on the default export
if (React && !(React as any).act) {
  (React as any).act = act;
}

// 2. Ensure global usage works if environment is set up that way
if (typeof globalThis !== "undefined" && !(globalThis as any).React) {
  (globalThis as any).React = React;
}
if ((globalThis as any).React && !(globalThis as any).React.act) {
  (globalThis as any).React.act = act;
}
