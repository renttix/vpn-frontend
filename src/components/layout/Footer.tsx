"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-vpn-blue dark:bg-gray-900 text-white" role="contentinfo" aria-label="Site footer">
      <div className="container mx-auto py-8">
        {/* Logo and social links */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 px-3 sm:px-4">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="flex flex-col">
              <div className="relative h-12 w-32 flex items-center justify-center">
                <Image
                  src="/images/vpn-logo-white.png"
                  alt="VPN News Logo"
                  width={128}
                  height={48}
                  className="block"
                  priority
                />
              </div>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300" aria-label="Follow us on Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </a>
            <a href="https://twitter.com/vpnldn" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300" aria-label="Follow us on X (formerly Twitter)">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300" aria-label="Connect with us on LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Footer links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8 px-3 sm:px-4">
          <div>
            <h3 className="font-headline font-bold text-lg mb-3">About Us</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-300 hover:text-white">About</Link></li>
              <li><Link href="/contact-us" className="text-gray-300 hover:text-white">Contact Us</Link></li>
              <li><a href="https://buymeacoffee.com/videoproductionnews" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">Buy Me A Coffee</a></li>
              <li><Link href="/submit-tip" className="text-yellow-400 hover:text-yellow-300 font-medium">Submit a Tip</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-bold text-lg mb-3">Content</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/category/crime-news" className="text-gray-300 hover:text-white">Crime News</Link></li>
              <li><Link href="/category/court-news" className="text-gray-300 hover:text-white">Court News</Link></li>
              <li><Link href="/category/news" className="text-gray-300 hover:text-white">News</Link></li>
              <li><Link href="/category/legal-commentary" className="text-gray-300 hover:text-white">Legal Commentary</Link></li>
              <li>
                <a href="/feed.xml" className="text-gray-300 hover:text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                    <path d="M6.18,15.64A2.18,2.18 0 0,1 8.36,17.82C8.36,19 7.38,20 6.18,20C5,20 4,19 4,17.82A2.18,2.18 0 0,1 6.18,15.64M4,4.44A15.56,15.56 0 0,1 19.56,20H16.73A12.73,12.73 0 0,0 4,7.27V4.44M4,10.1A9.9,9.9 0 0,1 13.9,20H11.07A7.07,7.07 0 0,0 4,12.93V10.1Z" />
                  </svg>
                  RSS Feed
                </a>
              </li>
              <li>
                <Link href="/admin/apple-news" className="text-gray-300 hover:text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                    <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M7,10L12,15L17,10H7Z" />
                  </svg>
                  Apple News
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-bold text-lg mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms-of-use" className="text-gray-300 hover:text-white">Terms of Use</Link></li>
              <li><Link href="/privacy-policy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/cookie-settings" className="text-gray-300 hover:text-white">Cookie Settings</Link></li>
              <li><Link href="/accessibility" className="text-gray-300 hover:text-white">Accessibility</Link></li>
              <li><Link href="/ethical-journalism-policy" className="text-gray-300 hover:text-white">Ethical Journalism Policy</Link></li>
              <li><Link href="/admin/notifications" className="text-gray-300 hover:text-white">Admin</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-bold text-lg mb-3">Advertise</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/sponsorship" className="text-gray-300 hover:text-white">Sponsorship</Link></li>
              <li><Link href="/advertising" className="text-gray-300 hover:text-white">Advertising</Link></li>
              <li><Link href="/newsletters" className="text-gray-300 hover:text-white">Newsletters</Link></li>
              <li><Link href="/marketplace" className="text-gray-300 hover:text-white">Marketplace</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-bold text-lg mb-3">Contact</h3>
            <address className="not-italic text-sm text-gray-300">
              <p>Video Production News<br />
              10 South Grove<br />
              London<br />
              N6 6BS<br />
              United Kingdom</p>
              <p className="mt-2">Telephone: <a href="tel:+442036334699" className="hover:text-white">+44 20 3633 4699</a></p>
            </address>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-gray-400 border-t border-gray-700 pt-6 px-3 sm:px-4">
          <p>© 2025 Video Production News</p>
          <p className="mt-1">
            Reporting the Truth from the Courtroom Out
          </p>
        </div>
      </div>
    </footer>
  );
}
