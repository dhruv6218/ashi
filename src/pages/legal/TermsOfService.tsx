import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { FileText } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export const TermsOfService = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();

  return (
    <MainLayout>
      <div className="bg-gray-50 pt-24 md:pt-32 pb-16 border-b border-gray-200 overflow-hidden relative">
        <div className="absolute inset-0 bg-noise"></div>
        <div className="max-w-[800px] mx-auto px-6 text-center relative z-10" ref={headerRef}>
          <div className={`inline-flex items-center justify-center gap-2 bg-brand-blue/10 text-brand-blue px-4 py-1.5 rounded-full font-mono text-xs font-bold uppercase tracking-widest mb-6 border border-brand-blue/20 transition-all duration-700 ${headerVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <FileText className="w-4 h-4" /> Legal & Compliance
          </div>
          <h1 className={`font-heading text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight transition-all duration-700 delay-100 ${headerVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Terms of Service
          </h1>
          <p className={`text-lg text-gray-500 font-medium transition-all duration-700 delay-200 ${headerVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Last updated: March 15, 2026
          </p>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 py-16 md:py-24">
        <div className="prose prose-lg prose-blue max-w-none text-gray-600 font-medium">
          <p className="lead text-xl text-gray-900 font-bold mb-8">
            Welcome to Astrix AI. By accessing or using our platform, you agree to be bound by these Terms of Service.
          </p>

          <h2 className="font-heading text-2xl font-bold text-gray-900 mt-12 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-8">
            By creating an account, accessing, or using the Astrix AI platform ("Service"), you agree to comply with and be bound by these Terms. If you do not agree to these Terms, you may not use the Service.
          </p>

          <h2 className="font-heading text-2xl font-bold text-gray-900 mt-12 mb-4">2. Description of Service</h2>
          <p className="mb-8">
            Astrix AI is a decision intelligence platform for B2B SaaS product teams. It ingests customer feedback, uses artificial intelligence to cluster signals, scores opportunities, and generates product documentation.
          </p>

          <h2 className="font-heading text-2xl font-bold text-gray-900 mt-12 mb-4">3. User Accounts and Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-2 mb-8">
            <li>You must provide accurate and complete information when creating an account.</li>
            <li>You are responsible for safeguarding your password and for all activities that occur under your account.</li>
            <li>You agree not to upload any data that violates third-party intellectual property rights or contains malicious code.</li>
          </ul>

          <h2 className="font-heading text-2xl font-bold text-gray-900 mt-12 mb-4">4. Data Rights and Intellectual Property</h2>
          <p className="mb-4">
            <strong>Your Data:</strong> You retain all rights to the data, feedback, and CRM information you upload to Astrix AI. You grant us a limited license to process this data solely for the purpose of providing the Service to you.
          </p>
          <p className="mb-8">
            <strong>Our IP:</strong> The Astrix AI platform, including its software, UI, and generated algorithms, are the exclusive property of Astrix AI Inc.
          </p>

          <h2 className="font-heading text-2xl font-bold text-gray-900 mt-12 mb-4">5. Payment and Billing</h2>
          <p className="mb-8">
            Certain features of the Service are billed on a subscription basis. You will be billed in advance on a recurring, periodic basis. Payments made via UPI or other gateways are non-refundable except as required by law.
          </p>

          <h2 className="font-heading text-2xl font-bold text-gray-900 mt-12 mb-4">6. Limitation of Liability</h2>
          <p className="mb-8">
            Astrix AI is provided "as is" without warranties of any kind. In no event shall Astrix AI Inc. be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of your use of the Service.
          </p>

          <h2 className="font-heading text-2xl font-bold text-gray-900 mt-12 mb-4">7. Contact</h2>
          <p>
            For any legal inquiries regarding these terms, please contact:
            <br />
            <a href="mailto:help.astrix@gmail.com" className="text-brand-blue font-bold hover:underline">help.astrix@gmail.com</a>
          </p>
        </div>
      </div>
    </MainLayout>
  );
};
