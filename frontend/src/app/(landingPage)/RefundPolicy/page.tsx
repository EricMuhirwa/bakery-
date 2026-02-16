"use client";

import React from "react";

const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-20 px-6 sm:px-10 max-w-4xl mx-auto" style={{ padding: "150px 20px" }}>
      <h1 className="text-4xl font-bold text-amber-900 mb-8 text-center">Refund Policy</h1>
      <p className="mb-6 text-gray-700">
        At CEBK Bakery Ltd, we strive for your satisfaction. If you are not fully satisfied with your order,
        you may request a refund within 14 days of receiving your product. To be eligible, items must be
        unopened and in original packaging.
      </p>
      <p className="mb-6 text-gray-700">
        Please contact us at <a className="text-amber-800 underline" href="mailto:marcellinabimana@gmail.com">info@cebkltd.com</a>
        with your order number and reason for the refund request. Refunds are processed to the original payment method
        within 5-10 business days after approval.
      </p>
    </div>
  );
};

export default RefundPolicy;