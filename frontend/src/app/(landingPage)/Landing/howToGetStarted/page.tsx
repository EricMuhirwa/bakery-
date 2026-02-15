import React from 'react';
import Image from 'next/image';

const steps = [
    {
        number: 1,
        title: 'Sign up on Ineza Bakery',
        description: 'Start enjoy The Subscription Service',
        image: '/images/ch1.JPG'
    },
    {
        number: 2,
        title: 'Coose a Subscription',
        description: 'Choose a subscription plan that suits your needs and budget',
        image: '/images/wedding bread.JPG'
    },
    {
        number: 3,
        title: 'Pay for your Subscription',
        description: 'Pay for your subscription using our secure payment gateway',
        image: '/images/cheese brea.JPG'
    },
    {
        number: 4,
        title: 'Checkout Menus about our Coffee',
        description: 'Then you can choose the coffee you want to buy',
        image: '/images/ch2.JPG'
    },
    {
        number: 5,
        title: 'Any Questions?',
        description: 'Contact us for any questions or concerns',
        image: '/api/placeholder/280/200'
    }
];

const HowToGetStarted = () => {
    return (
        <div className="bg-white">
            <div className="max-w-6xl mx-auto py-16 px-4">
                <h2 className="text-2xl font-bold text-center text-[#1a1a1a] mb-12">
                    How to Get Started
                </h2>

                <div className="grid grid-cols-1 gap-12">
                    {steps.map((step, index) => (
                        <div
                            key={step.number}
                            className={`flex items-start gap-4 ${index % 2 === 0 ? 'pr-[50%]' : 'pl-[50%]'}`}
                        >
                            <div className="flex-shrink-0">
                                <div className="h-6 w-16 bg-blue-600 rounded-md flex items-center justify-center">
                                    <span className="text-white text-xs font-medium">
                                        Step {step.number}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-[#1a1a1a] mb-1">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    {step.description}
                                </p>
                                {index === 0 || index === 2 ? (
                                    <div className="rounded-lg overflow-hidden border border-gray-200">
                                        <Image
                                            src={step.image}
                                            width={350}   // or whatever size fits your design
                                            height={350}
                                            alt={`Step ${step.number}`}
                                            className="object-cover"
                                        />
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HowToGetStarted;