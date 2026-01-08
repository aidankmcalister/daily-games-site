import "@testing-library/jest-dom";
import React, { act } from "react";

// Polyfill for React 19 compatibility where some tools might still expect React.act
if (!React.act) {
  (React as any).act = act;
}
