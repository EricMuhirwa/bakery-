"use client";

import React, { useState } from "react";
import Image from "next/image";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData: FAQItem[] = [
    {
      question: "What services does CEBK bakery Ltd provide?",
      answer:
        "We provide premium coffee sourcing, quality assurance, export logistics, and partnership opportunities for coffee importers worldwide.",
    },
    {
      question: "Which countries do you export to?",
      answer:
        "We export to several countries across Europe, Asia, and Africa, including Poland, India, Rwanda, Ethiopia, and more.",
    },
    {
      question: "How can I get in touch for a partnership?",
      answer:
        "You can use the contact form on our Contact page or email us directly at info@cebkltd.com.",
    },
    {
        question: 'What makes CEBK bakery Ltd special?',
        answer: 'CEBK bakery Ltd is sourced from the finest high-altitude farms in Rwanda, ensuring rich flavors and ethical sourcing.',
      },
      {
        question: 'Do you offer international shipping?',
        answer: 'Yes, we ship internationally. Shipping fees and delivery times vary depending on your location.',
      },
      {
        question: 'How can I track my order?',
        answer: 'Once your order is shipped, you’ll receive a tracking number via email to monitor your delivery in real time.',
      },
      {
        question: 'Are your products organic?',
        answer: 'Yes, all our coffee beans are organically grown without harmful chemicals or pesticides.',
      },
      {
        question: 'Can I return or exchange my order?',
        answer: 'If you’re not satisfied with your purchase, contact us within 14 days for a return or exchange.',
      },
  ];

  const countries = [
    { name: "Rwanda", image: "/images/kigali.jpg" },
    { name: "Poland", image: "/images/poland.jpg" },
    { name: "India", image: "/images/indian.jpg" },
    { name: "Ethiopia", image: "/images/ethiopia.jpg" },
    { name: "Germany", image: "/images/berlin.jpg" },
    { name: "USA", image: "/images/usa.jpg" },
  ];
  
  
  
  
  

  return (
    <div className="min-h-screen bg-white py-16 px-6 sm:px-10" style={{padding:'120px 20px'}}>
      <h1 className="text-4xl font-bold text-center text-amber-900 mb-10">
        Frequently Asked Questions
      </h1>

      <div className="max-w-3xl mx-auto space-y-6">
        {faqData.map((item, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-md shadow-sm p-4 cursor-pointer transition hover:shadow-md"
            onClick={() => toggleFAQ(index)}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                {item.question}
              </h2>
              <span className="text-xl text-amber-900">
                {openIndex === index ? "−" : "+"}
              </span>
            </div>
            {openIndex === index && (
              <p className="mt-3 text-gray-600">{item.answer}</p>
            )}
          </div>
        ))}
      </div>

      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-7xl mx-auto mt-20">
  {countries.map((country, index) => (
    <div
      key={index}
      className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-transform transform hover:scale-105"
    >
      <Image src={country.image}
        alt={country.name}
        className="w-full h-60 object-cover"
      />
      <div className="p-6 text-center">
        <h3 className="text-2xl font-semibold text-gray-800">
          {country.name}
        </h3>
      </div>
    </div>
  ))}
</div>




    </div>
  );
};

export default FAQ;
