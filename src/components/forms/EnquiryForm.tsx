"use client";

import React from "react";
import ContactForm from "./ContactForm";

interface EnquiryFormProps {
  title?: string;
  subtitle?: string;
  successMessage?: string;
  className?: string;
}

export default function EnquiryForm({
  title = 'Send an Enquiry',
  subtitle = 'Have a question about our services? Fill out the form below and our team will get back to you.',
  successMessage = 'Thank you for your enquiry. Our team will review your message and respond as soon as possible.',
  className = ''
}: EnquiryFormProps) {
  return (
    <ContactForm
      formType="enquiry"
      title={title}
      subtitle={subtitle}
      successMessage={successMessage}
      className={className}
    />
  );
}
