"use client";

import React from "react";

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-20 px-6 sm:px-10 max-w-4xl mx-auto" style={{ padding: "150px 20px" }}>
      <h1 className="text-4xl font-bold text-amber-900 mb-8 text-center">Terms of Service</h1>
      <p className="mb-6 text-gray-700">
        By accessing or using the CEBK Unique Bakery website, you agree to comply with and be bound by these
        Terms of Service. All purchases and interactions are subject to our privacy and refund policies.
      </p>
      <p className="mb-6 text-gray-700">
        You agree not to misuse the services or violate any laws in your jurisdiction. CEBK Unique reserves
        the right to refuse service or terminate accounts at our discretion.
      </p>
    </div>
  );
};

export default TermsOfService;
