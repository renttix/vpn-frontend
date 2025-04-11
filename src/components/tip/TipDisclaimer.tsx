"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface TipDisclaimerProps {
  onAccept: () => void;
}

export default function TipDisclaimer({ onAccept }: TipDisclaimerProps) {
  const [accepted, setAccepted] = React.useState(false);

  const handleAccept = () => {
    if (accepted) {
      onAccept();
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-6">
      <h2 className="text-xl font-bold mb-4 text-vpn-gray dark:text-vpn-gray-dark">
        PLEASE READ BEFORE SUBMITTING A TIP
      </h2>
      <div className="prose dark:prose-invert max-w-none text-sm">
        <p>
          Video Production News is a UK-based investigative news platform with a focus on public interest reporting. Our editorial and legal resources are limited. If you or someone you know is in immediate danger or experiencing an emergency, please contact emergency services by dialling 999. This tip line is not intended for urgent matters requiring immediate intervention, and we cannot respond to or act upon emergency submissions.
        </p>
        <p className="font-medium mt-4">
          By submitting information to Video Production News, you confirm that:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            You are not submitting any content that is unlawful, obtained through illegal means, or in breach of the Data Protection Act 2018, Official Secrets Act 1989, or other applicable UK laws.
          </li>
          <li>
            You are not sharing unsolicited creative works, including scripts, pitches, or proprietary material not specifically requested by our editorial team.
          </li>
          <li>
            The information and/or material you provide was legally acquired, and Video Production News had no involvement in its acquisition.
          </li>
        </ul>
        <p className="mt-4">
          We recognise that whistleblowers and concerned citizens play a crucial role in holding power to account. Submitting tips can involve personal risk, and we appreciate the courage it may take to share newsworthy information with us. Our team treats all credible submissions with the seriousness they deserve.
        </p>
        <p className="mt-4">
          We are committed to protecting the anonymity of our sources wherever possible and operate in line with Section 10 of the Contempt of Court Act 1981, which provides qualified protection for journalistic sources. While Video Production News is not your legal adviser, you may wish to seek independent legal advice before submitting sensitive information. You can also learn more about source protection in the UK via the NUJ or Index on Censorship.
        </p>
        <p className="font-medium mt-4">
          By making a submission, you agree that:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Any materials or information shared with Video Production News may be used at our discretion for journalistic purposes, including but not limited to reporting, investigation, and publication.
          </li>
          <li>
            You grant us a non-exclusive, royalty-free, worldwide licence to use the submitted material as we see fit, with no obligation to credit, compensate, or follow up.
          </li>
          <li>
            You waive any and all claims against Video Production News relating to the use, non-use, or publication of the submitted content.
          </li>
        </ul>
      </div>
      <div className="mt-6 flex items-center">
        <input
          type="checkbox"
          id="accept-terms"
          className="h-5 w-5 rounded border-gray-300 text-vpn-blue focus:ring-vpn-blue"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
        />
        <label htmlFor="accept-terms" className="ml-2 block text-sm font-medium">
          By submitting a tip, I confirm I have read, understood, and agreed to the above terms.
        </label>
      </div>
      <div className="mt-6">
        <Button
          onClick={handleAccept}
          disabled={!accepted}
          className="w-full bg-vpn-blue hover:bg-vpn-blue/90 text-white font-medium disabled:opacity-50"
        >
          Continue to Form
        </Button>
      </div>
    </div>
  );
}
