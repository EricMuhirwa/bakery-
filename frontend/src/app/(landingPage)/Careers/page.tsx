"use client";

import React from "react";

const Careers: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-20 px-6 sm:px-10 max-w-4xl mx-auto" style={{ padding: "150px 20px" }}>
      <h1 className="text-4xl font-bold text-amber-900 mb-8 text-center">Careers at CEBK bakry Ltd</h1>

      <p className="mb-6 text-gray-700">
        Are you passionate about coffee, sustainability, and making a difference? CEBK ltd is always on the lookout for
        talented individuals who share our values and vision. Whether you&rsquo;re experienced or just starting out, we welcome
        enthusiastic professionals to join our team.
      </p>

      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Current Openings</h2>
      <ul className="list-disc list-inside mb-6 text-gray-700">
        <li>Sales & Marketing Manager</li>
        <li>Warehouse & Logistics Coordinator</li>
        <li>Customer Success Representative</li>
        <li>Social Media & Content Specialist</li>
      </ul>

      <p className="mb-6 text-gray-700">
        If you&rsquo;re interested in any of these positions or want to share your resume for future opportunities, email us at
        <a href="mailto:careers@uruyangecoffee.com" className="text-amber-800 underline ml-1">
          kabanzima1@gmail.com
        </a>
        
      </p>

      <p className="text-gray-700">
        At CEBK bakery Ltd, we believe in equal opportunities, fair treatment, and building a culture where everyone thrives.
        Join us on our mission to share the best of Rwandan coffee with the world.
      </p>
    </div>
  );
};

export default Careers;
