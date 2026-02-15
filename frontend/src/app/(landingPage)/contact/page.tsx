'use client';

import { useState, FormEvent } from 'react';
import { FaFacebook, FaInstagram, FaTwitter, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';
import { useCreateMessageMutation } from '../../../lib/redux/slices/ContactSlice';

interface FormData {
    name: string;
    email: string;
    message: string;
}

interface FormStatus {
    submitted: boolean;
    success: boolean;
    message: string;
}

const ContactPage = () => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        message: ''
    });

    const [formStatus, setFormStatus] = useState<FormStatus>({
        submitted: false,
        success: false,
        message: ''
    });

    // Use the mutation hook
    const [createMessage, { isLoading }] = useCreateMessageMutation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        setFormStatus({
            submitted: true,
            success: false,
            message: 'Sending...'
        });

        try {
            // Prepare the data to match the CreateMessageDTO interface
            const createMessageDTO = {
                name: formData.name,
                email: formData.email,
                description: formData.message,
            };

            // Call the mutation
            await createMessage(createMessageDTO).unwrap();

            // On success
            setFormStatus({
                submitted: true,
                success: true,
                message: 'Thank you for your message! We will get back to you soon.'
            });
            setFormData({
                name: '',
                email: '',
                message: ''
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.log(error.message);
            } else {
                console.log(error);
                setFormStatus({ submitted: true, success: false, message: 'Something went wrong. Please try again later.' });
                throw error;
            }
        }
    };

    return (
        <div className="pt-24 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-6 py-16">
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">Get In Touch</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Contact Form */}
                    <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="p-8 md:p-12">
                            <h2 className="text-3xl font-bold mb-6 text-yellow-600">Send Us A Message</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        placeholder="Your full name"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="Your email address"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        placeholder="Your message"
                                        rows={5}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all resize-none"
                                        value={formData.message}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg shadow transition-colors"
                                        disabled={isLoading} // Disable button while loading
                                    >
                                        {isLoading ? 'Sending...' : 'Send Message'}
                                    </button>
                                </div>
                            </form>

                            {formStatus.submitted && (
                                <div className={`mt-6 p-4 rounded-lg ${formStatus.success ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {formStatus.message}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white rounded-xl shadow-lg p-8 md:p-10 h-full">
                            <h2 className="text-2xl font-bold mb-6 text-gray-900">Contact Information</h2>

                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                                        <FaMapMarkerAlt className="text-yellow-600 text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-700">Location</h3>
                                        <p className="text-gray-600 mt-1">Bugesera, Rwanda</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                                        <FaEnvelope className="text-yellow-600 text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-700">Email</h3>
                                        <a href="mailto:marcellinabimana@gmail.com" className="text-blue-600 hover:underline mt-1">
                                        inezabakery@gmail.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                                        <FaPhone className="text-yellow-600 text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-700">Phone</h3>
                                        <a href="tel:+48452037323" className="text-blue-600 hover:underline mt-1">
                                        +250 788 563 705
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12">
                                <h3 className="font-bold text-gray-700 mb-4">Follow Us</h3>
                                <div className="flex space-x-4">
                                    <a
                                        href="#"
                                        className="bg-gray-100 hover:bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                                        aria-label="Facebook"
                                    >
                                        <FaFacebook className="text-gray-700 text-xl" />
                                    </a>
                                    <a
                                        href="#"
                                        className="bg-gray-100 hover:bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                                        aria-label="Instagram"
                                    >
                                        <FaInstagram className="text-gray-700 text-xl" />
                                    </a>
                                    <a
                                        href="#"
                                        className="bg-gray-100 hover:bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                                        aria-label="Twitter"
                                    >
                                        <FaTwitter className="text-gray-700 text-xl" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="mt-12 bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-4">
                        <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">Find Us</h2>
                        <div className="h-96 w-full bg-gray-200 relative">
                            {/* Replace with actual map integration if needed */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-gray-500">Interactive map would be displayed here</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-16">
                    <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Frequently Asked Questions</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-xl font-bold mb-3 text-yellow-600">What are your business hours?</h3>
                            <p className="text-gray-600">We&rsquo;re available Monday through Friday from 8:00 AM to 6:00 PM Kigali time. On weekends, our hours are 10:00 AM to 4:00 PM.</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-xl font-bold mb-3 text-yellow-600">Do you offer international shipping?</h3>
                            <p className="text-gray-600">Yes, we ship our premium coffee worldwide. Shipping times and costs vary based on location.</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-xl font-bold mb-3 text-yellow-600">Can I visit your coffee plantation?</h3>
                            <p className="text-gray-600">We offer guided tours of our coffee plantations by appointment. Please contact us at least one week in advance to arrange a visit.</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-xl font-bold mb-3 text-yellow-600">How quickly do you respond to inquiries?</h3>
                            <p className="text-gray-600">We strive to respond to all inquiries within 24 hours during business days.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;