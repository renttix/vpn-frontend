
 "use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TipReferrer() {
  return (
    <div className="border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto py-10 px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-roboto font-bold text-vpn-gray dark:text-vpn-gray-dark mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Got a tip worth investigating?
          </h2>
          <p className="text-lg text-vpn-gray dark:text-vpn-gray-dark/80 mb-6">
            Your information could be the missing piece to an important
            story. Submit your tip today and make a difference.
          </p>
          <Link href="/submit-tip" passHref>
            <Button 
              className="bg-vpn-blue hover:bg-vpn-blue/90 text-white font-medium px-8 py-2"
            >
              Submit Tip
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
