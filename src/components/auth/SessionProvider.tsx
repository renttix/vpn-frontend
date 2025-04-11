"use client";

import { ReactNode } from "react";

// This is a simplified session provider that doesn't use NextAuth.js
export function SessionProvider({ children }: { children: ReactNode }) {
  // Simply render the children without any NextAuth.js provider
  return <>{children}</>;
}
