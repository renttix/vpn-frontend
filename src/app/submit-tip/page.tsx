import React from "react";
import TipForm from "@/components/tip/TipForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit a Tip | Video Production News",
  description:
    "Submit a news tip to Video Production News. Your information could be the missing piece to an important story.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function SubmitTipPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <TipForm />
    </div>
  );
}
