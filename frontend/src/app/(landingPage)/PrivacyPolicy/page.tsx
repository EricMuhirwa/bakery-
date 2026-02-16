"use client";

import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-white py-20 px-6 sm:px-12 md:px-24 lg:px-40 xl:px-52" style={{padding:'150px, 20px'}}>
      <h1 className="text-4xl font-bold text-amber-900 mb-10 text-center">
        Privacy Policy
      </h1>

      <p className="mb-6 text-gray-700 text-lg leading-relaxed">
        At CEBK bakery Ltd, we respect your privacy and are committed to
        protecting your personal information. This policy outlines how we
        collect, use, and safeguard your data when you interact with our
        website or services.
      </p>

      <h2 className="text-2xl font-semibold text-gray-800 mb-2 mt-8">
        1. Information We Collect
      </h2>
      <p className="mb-6 text-gray-700 text-lg leading-relaxed">
        We may collect personal information such as your name, email address,
        phone number, and shipping details when you make a purchase or contact
        us. We also gather non-personal data through cookies and analytics tools
        to improve your experience.
      </p>

      <h2 className="text-2xl font-semibold text-gray-800 mb-2 mt-8">
        2. How We Use Your Information
      </h2>
      <p className="mb-6 text-gray-700 text-lg leading-relaxed">
        Your information is used to process orders, provide customer support,
        send updates, and improve our services. We do not sell or rent your
        information to third parties.
      </p>

      <h2 className="text-2xl font-semibold text-gray-800 mb-2 mt-8">
        3. Cookies & Tracking
      </h2>
      <p className="mb-6 text-gray-700 text-lg leading-relaxed">
        We use cookies to enhance your browsing experience. You can disable
        cookies in your browser settings, but this may limit certain features of
        our site.
      </p>

      <h2 className="text-2xl font-semibold text-gray-800 mb-2 mt-8">
        4. Data Security
      </h2>
      <p className="mb-6 text-gray-700 text-lg leading-relaxed">
        We implement appropriate security measures to protect your information
        from unauthorized access, alteration, or disclosure.
      </p>

      <h2 className="text-2xl font-semibold text-gray-800 mb-2 mt-8">
        5. Your Rights
      </h2>
      <p className="mb-6 text-gray-700 text-lg leading-relaxed">
        You have the right to access, correct, or delete your personal data. To
        make a request, please contact us at{" "}
        <a
          href="mailto:marcellinabimana@gmail.com"
          className="text-amber-800 underline"
        >
          marcellinabimana@gmail.com
        </a>
        .
      </p>

      <h2 className="text-2xl font-semibold text-gray-800 mb-2 mt-8">
        6. Changes to This Policy
      </h2>
      <p className="mb-6 text-gray-700 text-lg leading-relaxed">
        We may update this policy from time to time. Any changes will be posted
        on this page with an updated revision date.
      </p>

      <p className="text-gray-700 text-lg">
        Last updated: April 16, 2025
      </p>
    </div>
  );
};

export default PrivacyPolicy;
