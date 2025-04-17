"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TipThankYou() {
  return (
    <div className="text-center py-10">
      <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg mb-6 max-w-2xl mx-auto">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-green-500 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <h2 className="text-2xl font-bold mb-4 text-vpn-gray dark:text-gray-100">
          Thank You for Your Submission
        </h2>
        <p className="text-lg mb-6 text-vpn-gray dark:text-gray-300">
          Your tip/story has been successfully submitted to our editorial team. We appreciate you taking the time to share this information with us.
        </p>
        <p className="mb-6 text-vpn-gray dark:text-gray-300">
          While we review all submissions, due to the volume we receive, we may not be able to respond to every tip individually. If our team determines your information warrants further investigation, we may contact you using the email address you provided.
        </p>
        <div className="mt-8">
          <Link href="/" passHref>
            <Button className="bg-vpn-blue hover:bg-vpn-blue/90 dark:bg-vpn-blue dark:hover:bg-vpn-blue/90 text-white font-medium px-8 py-2">
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
