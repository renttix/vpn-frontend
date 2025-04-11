"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page now simply redirects to the custom login page
export default function LoginRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the custom login page
    router.replace("/admin-login.html");
  }, [router]);
  
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
        <p className="text-lg">Redirecting to login page...</p>
      </div>
    </div>
  );
}
