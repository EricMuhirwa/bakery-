"use client";

import React from "react";

const Give5Get5: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-20 px-6 sm:px-10 max-w-4xl mx-auto" style={{ padding: "150px 20px" }}>
      <h1 className="text-4xl font-bold text-amber-900 mb-8 text-center">Give 5K RWF, Get 500 RWF</h1>
      <p className="mb-6 text-gray-700">
        Love CEBK bread? Share it with your friends and everyone wins! When you refer a friend, they’ll get $5 off
        their first purchase — and you’ll get $5 credit once they place an order.
      </p>
      <p className="mb-6 text-gray-700">
        It’s our way of saying thank you for spreading the word. Start referring today and enjoy coffee on us.
        Check your account dashboard to get your referral link!
      </p>
    </div>
  );
};

export default Give5Get5;
