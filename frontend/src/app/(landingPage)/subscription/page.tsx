'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useSubscriptionsQuery, useSingleSubscriptionQuery } from '../../../lib/redux/slices/subscribersSlice';
import { useBuySubscriptionMutation } from '../../../lib/redux/slices/PaymentSlice';
import { Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import b from "../../../../public/images/cheesebread.jpg";
import { toast } from 'sonner';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type CoffeeType = 'ground' | 'beans';
type RoastPreference = 'light' | 'medium' | 'dark';

interface Subscription {
    id: string;
    type?: string;
    name: string;
    price: number;
    billingCycle?: string;
    imageSrc?: string;
}



interface PaymentData {
    subscriptionType: Subscription;
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    apartment?: string;
    city: string;
    zipCode: string;
    phone?: string;
    receiveOffers: boolean;
    paymentMethod: string;
    paymentMethodId: string;
    coffeeType: CoffeeType;
    roastPreference: RoastPreference;
    subscriptionId: string;
    type: string;
    userId: string;
    price: number
}

const SubscriptionPage = () => {
    return (
        <Elements stripe={stripePromise}>
            <PaymentForm />
        </Elements>
    );
};

const PaymentForm = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const isLoggedIn = status === 'authenticated';

    const [selectedPlan, setSelectedPlan] = useState<Subscription | null>(null);
    const [selectedCoffeeType, setSelectedCoffeeType] = useState<CoffeeType | null>(null);
    const [selectedRoast, setSelectedRoast] = useState<RoastPreference | null>(null);
    const [showCoffeeTypeSelection, setShowCoffeeTypeSelection] = useState(false);
    const [showRoastSelection, setShowRoastSelection] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [showLoginMessage, setShowLoginMessage] = useState(false);


    const { data: subscriptions, isLoading: isLoadingSubscriptions } = useSubscriptionsQuery<SubscriptionsQueryResult>({});

    useSingleSubscriptionQuery(
        selectedPlan ? selectedPlan : undefined,
        { skip: !selectedPlan }
    );

    const [createPayment, { isLoading: isPaymentLoading, }] = useBuySubscriptionMutation();

    const [formData, setFormData] = useState({
        email: session?.user?.email || '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        firstName: '',
        lastName: '',
        address: '',
        apartment: '',
        city: '',
        zipCode: '',
        phone: '',
        receiveOffers: false,
        paymentMethod: 'card',
        coffeeType: '' as CoffeeType,
        roastPreference: '' as RoastPreference
    });

    const stripe = useStripe();
    const elements = useElements();

    const fallbackPlans = [
        {
            id: '1',
            name: 'weekly',
            price: 18.99,
            imageSrc: '/images/E.webp'
        },
        {
            id: '2',
            name: 'monthly',
            price: 49.99,
            imageSrc: '/images/wedding cake.jpg'
        },
        {
            id: '3',
            name: 'yearly',
            price: 199.99,
            imageSrc: '/images/C.webp'
        }
    ];

    interface SubscriptionsQueryResult {
        data: Subscription[];
        isLoading: boolean;
    }

    const plans = subscriptions?.length ? subscriptions : fallbackPlans;

    const getPlanDisplayName = (name: string) => {
        switch (name) {
            case 'weekly': return 'Weekly Plan';
            case 'monthly': return 'Monthly Plan';
            case 'yearly': return 'Daily Plan';
            default: return name;
        }
    };

    const getPlanPriceDisplay = (name: string, price: number) => {
        switch (name) {
            case 'weekly': return `$${price.toFixed(2)}/week`;
            case 'monthly': return `$${price.toFixed(2)}/month`;
            case 'yearly': return `$${price.toFixed(2)}/Daily`;
            default: return `RWF ${price}`;
        }
    };


    const handlePlanSelect = (plan: Subscription) => {
        setSelectedPlan(plan);

        if (!isLoggedIn) {
            setShowLoginMessage(true);
            setTimeout(() => {
                document.getElementById('login-message')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            return;
        }

        setShowCoffeeTypeSelection(true);
        setTimeout(() => {
            document.getElementById('coffee-type-selection')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleCoffeeTypeSelect = (type: CoffeeType) => {
        setSelectedCoffeeType(type);
        setShowRoastSelection(true);
        setTimeout(() => {
            document.getElementById('roast-selection')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleRoastSelect = (roast: RoastPreference) => {
        setSelectedRoast(roast);
        setShowPaymentForm(true);
        setFormData(prev => ({
            ...prev,
            coffeeType: selectedCoffeeType || 'ground',
            roastPreference: roast
        }));
        setTimeout(() => {
            document.getElementById('payment-form')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedPlan || !stripe || !elements || !selectedCoffeeType || !selectedRoast) {
            alert('Please complete all selections before payment');
            return;
        }

        try {
            const paymentData: PaymentData = {
                subscriptionType: selectedPlan,
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                address: formData.address,
                apartment: formData.apartment,
                city: formData.city,
                zipCode: formData.zipCode,
                phone: formData.phone,
                receiveOffers: formData.receiveOffers,
                paymentMethod: formData.paymentMethod,
                paymentMethodId: '',
                coffeeType: selectedCoffeeType,
                roastPreference: selectedRoast,
                subscriptionId: selectedPlan.id,
                type: selectedCoffeeType,
                userId: session?.user?.id || "",
                price: selectedPlan.price

            };
            const response = await createPayment(paymentData).unwrap();
            if (response) {
                window.location.href = response.sessionUrl
            }
        } catch (error) {
            console.error('Payment failed:', error);
            toast.error('Payment processing failed. Please try again.');
        }
    };

    const handleLoginRedirect = () => {
        if (selectedPlan) {
            sessionStorage.setItem('selectedSubscriptionPlan', selectedPlan.name);
        }
        router.push('/auth');
    };

    return (
        <>
            <section className="relative h-screen flex items-center justify-center text-white text-center">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/me5.webp')" }}></div>
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="relative z-10 px-6">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover the World Through Ineza</h1>
                    <p className="mb-6 text-lg max-w-lg mx-auto">
                    “Taste Breads from Every Corner of the World”
                    </p>
                </div>
            </section>
            <div className="pt-24 bg-gray-50 min-h-screen">
                <section id="plans" className="py-16">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-4xl font-bold mb-6">Subscription Plans</h2>
                        {isLoadingSubscriptions ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {plans.map((plan) => (
                                    <div key={plan.id} className="p-8 bg-white shadow-lg rounded transition-all hover:shadow-xl">
                                        <div className="relative h-48 w-full mb-4">

                                            <Image
                                                src={plan.imageSrc || b}
                                                alt={getPlanDisplayName(plan.name)}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                                className="rounded"
                                            />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-4">{getPlanDisplayName(plan.name)}</h3>
                                        <p className="text-lg text-gray-600 mb-6">{getPlanPriceDisplay(plan.name, plan.price)}</p>
                                        <button
                                            onClick={() => handlePlanSelect(plan)}
                                            className={`bg-yellow-500 text-white py-2 px-6 rounded shadow hover:bg-yellow-600 transition-colors ${selectedPlan?.name === plan.name ? 'ring-2 ring-yellow-400' : ''
                                                }`}
                                        >
                                            Subscribe
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {showLoginMessage && (
                    <section id="login-message" className="py-16 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600">
                        <div className="container mx-auto px-6 text-center">
                            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl">
                                <div className="text-yellow-500 mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V7a3 3 0 00-3-3H5a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3v-4" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold mb-4">Please Log In Before You Pay</h2>
                                <p className="text-gray-600 mb-6">
                                    To complete your subscription to our Here
                                    please log in to your account or create a new one.
                                </p>
                                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
                                    <button
                                        onClick={handleLoginRedirect}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded shadow transition-colors"
                                    >
                                        Log In
                                    </button>
                                    <button
                                        onClick={() => router.push('/signup?redirect=subscription')}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded shadow transition-colors"
                                    >
                                        Create Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {showCoffeeTypeSelection && (
                    <section id="coffee-type-selection" className="py-16 bg-gray-100">
                        <div className="container mx-auto px-6">
                            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                                <h2 className="text-3xl font-bold mb-6 text-center">Select Your Coffee Type</h2>
                                <h3 className="text-xl mb-6 text-center">
                                    Selected Plan: <span className="font-semibold text-blue-600">{selectedPlan && selectedPlan?.name}</span> - {selectedPlan && selectedPlan?.price}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                    <div
                                        className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${selectedCoffeeType === 'ground' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'}`}
                                        onClick={() => handleCoffeeTypeSelect('ground')}
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className="h-24 w-24 mb-4">
                                                <Image
                                                    src="/images/C.webp"
                                                    alt="Ground Coffee"
                                                    width={96}
                                                    height={96}
                                                    className="rounded-full"
                                                />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">Ground Coffee</h3>
                                            <p className="text-gray-600 text-center">Perfect for drip machines and French presses</p>
                                        </div>
                                    </div>
                                    <div
                                        className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${selectedCoffeeType === 'beans' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'}`}
                                        onClick={() => handleCoffeeTypeSelect('beans')}
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className="h-24 w-24 mb-4">
                                                <Image
                                                    src="/images/D.webp"
                                                    alt="Coffee Beans"
                                                    width={96}
                                                    height={96}
                                                    className="rounded-full"
                                                />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">Whole Wheat</h3>
                                            <p className="text-gray-600 text-center">For those who prefer to grind fresh</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {showRoastSelection && (
                    <section id="roast-selection" className="py-16 bg-gray-100">
                        <div className="container mx-auto px-6">
                            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                                <h2 className="text-3xl font-bold mb-6 text-center">Select Your Roast Preference</h2>
                                <h3 className="text-xl mb-6 text-center">
                                    Selected: <span className="font-semibold text-blue-600">{selectedCoffeeType === 'ground' ? 'Ground Coffee' : 'Whole Beans'}</span>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                                    <div
                                        className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${selectedRoast === 'light' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'}`}
                                        onClick={() => handleRoastSelect('light')}
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className="h-16 w-16 mb-4 bg-amber-200 rounded-full"></div>
                                            <h3 className="text-xl font-bold mb-2">Light Roast</h3>
                                            <p className="text-gray-600 text-center">Bright, acidic, and fruity flavors</p>
                                        </div>
                                    </div>
                                    <div
                                        className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${selectedRoast === 'medium' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'}`}
                                        onClick={() => handleRoastSelect('medium')}
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className="h-16 w-16 mb-4 bg-amber-500 rounded-full"></div>
                                            <h3 className="text-xl font-bold mb-2">Medium Roast</h3>
                                            <p className="text-gray-600 text-center">Balanced flavor with some sweetness</p>
                                        </div>
                                    </div>
                                    <div
                                        className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${selectedRoast === 'dark' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'}`}
                                        onClick={() => handleRoastSelect('dark')}
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className="h-16 w-16 mb-4 bg-amber-800 rounded-full"></div>
                                            <h3 className="text-xl font-bold mb-2">Dark Roast</h3>
                                            <p className="text-gray-600 text-center">Bold, rich, and slightly bitter</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {showPaymentForm && (
                    <section id="payment-form" className="py-16 bg-gray-100">
                        <div className="container mx-auto px-6">
                            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                                <h2 className="text-3xl font-bold mb-6 text-center">Payment Details</h2>
                                <h3 className="text-xl mb-6 text-center">
                                    Selected: <span className="font-semibold text-blue-600">
                                        {selectedPlan && selectedPlan?.name} - {selectedCoffeeType === 'ground' ? 'Ground' : 'Whole Beans'} ({selectedRoast})
                                    </span>
                                </h3>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <input type="hidden" name="coffeeType" value={selectedCoffeeType || ''} />
                                    <input type="hidden" name="roastPreference" value={selectedRoast || ''} />

                                    <h3 className="text-2xl font-bold mt-8 mb-4">Delivery Information</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">First Name (Optional)</label>
                                            <input
                                                type="text"
                                                id="firstName"
                                                name="firstName"
                                                placeholder="Enter your first name"
                                                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                onChange={handleInputChange}
                                                value={formData.firstName || ''}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">Last Name</label>
                                            <input
                                                type="text"
                                                id="lastName"
                                                name="lastName"
                                                placeholder="Enter your last name"
                                                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                                onChange={handleInputChange}
                                                value={formData.lastName || ''}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            placeholder="Enter your email"
                                            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                            onChange={handleInputChange}
                                            value={formData.email || ''}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="address" className="block text-gray-700 font-medium mb-2">Address</label>
                                        <input
                                            type="text"
                                            id="address"
                                            name="address"
                                            placeholder="Enter your address"
                                            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                            onChange={handleInputChange}
                                            value={formData.address || ''}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="apartment" className="block text-gray-700 font-medium mb-2">Apartment, Suite, etc. (Optional)</label>
                                        <input
                                            type="text"
                                            id="apartment"
                                            name="apartment"
                                            placeholder="Enter apartment or suite"
                                            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            onChange={handleInputChange}
                                            value={formData.apartment || ''}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="city" className="block text-gray-700 font-medium mb-2">City</label>
                                            <input
                                                type="text"
                                                id="city"
                                                name="city"
                                                placeholder="Enter your city"
                                                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                                onChange={handleInputChange}
                                                value={formData.city || ''}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="zipCode" className="block text-gray-700 font-medium mb-2">ZIP Code</label>
                                            <input
                                                type="text"
                                                id="zipCode"
                                                name="zipCode"
                                                placeholder="Enter your ZIP code"
                                                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                                onChange={handleInputChange}
                                                value={formData.zipCode || ''}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">Phone (Optional)</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            placeholder="Enter your phone number"
                                            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            onChange={handleInputChange}
                                            value={formData.phone || ''}
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="receiveOffers"
                                            name="receiveOffers"
                                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            onChange={handleInputChange}
                                            checked={formData.receiveOffers}
                                        />
                                        <label htmlFor="receiveOffers" className="ml-2 block text-gray-700">Text me with news and offers</label>
                                    </div>

                                    <div className="mt-8">
                                        <button
                                            type="submit"
                                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded shadow transition-colors"
                                            disabled={isPaymentLoading || !selectedCoffeeType || !selectedRoast}
                                        >
                                            {isPaymentLoading ? (
                                                <span className="flex items-center justify-center">
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Processing...
                                                </span>
                                            ) : (
                                                'Pay Now'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </>
    );
};

export default SubscriptionPage;