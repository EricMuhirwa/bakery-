"use client";

import React from "react";

const Press: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-20 px-6 sm:px-10 max-w-4xl mx-auto" style={{ padding: "150px 20px" }}>
      <h1 className="text-4xl font-bold text-amber-900 mb-8 text-center">Press</h1>
      <div className="mb-6 text-gray-700">
        <p>
          CEBK Bakery Ltd has been featured in a variety of media outlets for our commitment to quality,
          sustainability, and community. For press inquiries or media kits, please contact
          <a className="text-amber-800 underline" href="mailto:press@uruyangecoffee.com"> press@cebkltd.com</a>.
        </p>
      </div>
      <div className="mb-6 text-gray-700">
        <p>Check out some of our latest features and collaborations:</p>
        <ul className="list-disc pl-6 mt-2">
          <li>&rdquo;Rwandan Excellence in a Cup &rdquo; Coffee World Magazine</li>
          <li>&rdquo;The Sustainable Brew &rdquo; EcoDaily</li>
          <li>&rdquo;Meet the People Behind Uruyange &rdquo; Local Tastemakers Podcast</li>
        </ul>
      </div>
    </div>
  );
};

export default Press;