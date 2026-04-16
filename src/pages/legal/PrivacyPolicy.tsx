import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { ShieldCheck } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export const PrivacyPolicy = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();

  return (
    <MainLayout>
      <div className="bg-gray-50 pt-24 md:pt-32 pb-16 border-b border-gray-200 overflow-hidden relative">
        <div className="absolute inset-0 bg-noise"></div>
        <div className="max-w-[800px] mx-auto px-6 text-center relative z-10" ref={headerRef}>
          <div className={`inline-flex items-center justify-center gap-2 bg-brand-blue/10 text-brand-blue px-4 py-1.5 rounded-full font-mono text-xs font-bold uppercase tracking-widest mb-6 border border-brand-blue/20 transition-all duration-700 ${headerVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <ShieldCheck className="w-4 h-4" /> Legal & Compliance
          </div>
          <h1 className={`font-heading text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight transition-all duration-700 delay-100 ${headerVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Privacy Policy
          </h1>
          <p className={`text-lg text-gray-500 font-medium transition-all duration-700 delay-200 ${headerVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Last updated: March 15, 2026
          </p>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 py-16 md:py-24">
        <div className="prose prose-lg prose-blue max-w-none text-gray-600 font-medium">
          <p className="lead text-xl text-gray-900 font-bold mb-8">
            At Astrix AI, we take your privacy seriously. This policy describes how we collect, use, and protect your data when you use our platform.
          </p>

          <h2 className="font-heading text-2xl font-bold text-gray-900 mt-12 mb-4">1. Information We Collect</h2>
          <p>We collect information that you provide directly to us, including:</p>
          <ul className="list-disc pl-6 space-y-2 mb-8">
            <li><strong>Account Information:</strong> Name, email address, and password when you create an account.</li>
            <li><strong>Workspace Data:</strong> Signals, customer feedback, support tickets, and CRM data (like ARR and account names) that you connect or upload to Astrix.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our application, including log data, device information, and IP addresses.</li>
          </ul>

          <h2 className="font-heading text-2xl font-bold text-gray-900 mt-12 mb-4">2. How We Use Your Data</h2>
          <p>We use the collected data to:</p>
          <ul className="list-disc pl-6 space-y-2 mb-8">
            <li>Provide, maintain, and improve the Astrix platform.</li>
            <li>Process your signals using AI to generate clusters, insights, and artifacts.</li>
            <li>Send you technical notices, updates, security alerts, and support messages.</li>
          </ul>

          <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl my-8">
            <h3 className="font-heading text-lg font-bold text-gray-900 mb-2">Zero Data Retention for AI Training</h3>
            <p className="text-sm text-gray-700 m-0">
              We use enterprise-grade APIs (Groq and Gemini) to process your data. <strong>Your workspace data is strictly isolated and is NEVER used to train our models or third-party foundational models.</strong>
            </p>
          </div>

          <h2 className="font-heading text-2xl font-bold text-gray-900 mt-12 mb-4">3. Data Sharing and Disclosure</h2>
          <p>We do not sell your personal information. We may share data only in the following circumstances:</p>
          <ul className="list-disc pl-6 space-y-2 mb-8">
            <li><strong>With Service Providers:</strong> Third-party vendors who perform services on our behalf (e.g., hosting via Netlify, emails via Resend).</li>
            <li><strong>For Legal Reasons:</strong> If required to do so by law or in response to valid requests by public authorities.</li>
          </ul>

          <h2 className="font-heading text-2xl font-bold text-gray-900 mt-12 mb-4">4. Security</h2>
          <p className="mb-8">
            We implement industry-standard security measures to protect your data, including encryption in transit and at rest, role-based access controls, and regular security audits. However, no method of transmission over the Internet is 100% secure.
          </p>

          <h2 className="font-heading text-2xl font-bold text-gray-900 mt-12 mb-4">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact our Data Protection Officer at:
            <br />
            <a href="mailto:help.astrix@gmail.com" className="text-brand-blue font-bold hover:underline">help.astrix@gmail.com</a>
          </p>
        </div>
      </div>
    </MainLayout>
  );
};
