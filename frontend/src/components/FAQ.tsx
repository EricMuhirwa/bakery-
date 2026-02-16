import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What makes CEBK Ltd special?',
    answer: 'CEBKis sourced from the finest high-altitude farms in Rwanda, ensuring rich flavors and ethical sourcing.',
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

const FAQ: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <section className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8 text-amber-900">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-300 rounded-lg p-4 cursor-pointer bg-white shadow-sm transition-all"
            onClick={() => toggleFAQ(index)}
          >
            <h3 className="font-semibold text-lg text-gray-800">{faq.question}</h3>
            {activeIndex === index && (
              <p className="mt-2 text-gray-600">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
