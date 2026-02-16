"use client";

import React from "react";

const Blog: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-20 px-6 sm:px-10 max-w-4xl mx-auto" style={{ padding: "150px 20px" }}>
      <h1 className="text-4xl font-bold text-amber-900 mb-8 text-center">Blog</h1>
      <p className="mb-6 text-gray-700">
        Welcome to the CEBK bakery td Blog! Here we share stories from our farms, brewing tips, bread facts,
        and behind-the-scenes looks at how we deliver premium coffee to your cup.
      </p>
      <p className="mb-6 text-gray-700">
        Stay tuned for updates and insights as we explore the rich culture of coffee from bean to brew.
      </p>
    </div>
  );
};

export default Blog;
