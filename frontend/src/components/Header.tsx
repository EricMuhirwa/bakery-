'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaHome, FaCoffee, FaBox, FaInfoCircle, FaAddressBook, FaRocket, FaBars, FaTimes } from 'react-icons/fa';
import { usePathname } from "next/navigation";
import Image from 'next/image';

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname()

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black py-2 shadow-lg' : 'bg-gradient-to-b from-gray-900 via-gray-700 to-gray-500 py-4'}`}>
            <div className="container mx-auto flex justify-between items-center px-6">
                <div className="logo">
                    <Link href="/">
                        <Image
                            src="/images/profile.jpeg"
                            alt="Bakery Management System"
                            width={70} 
                            height={70}
                            className="h-16 w-16 rounded-full cursor-pointer hover:scale-105 transition-transform"
                        />

                    </Link>
                </div>
                <div className="lg:hidden cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <FaTimes className="text-white text-2xl" /> : <FaBars className="text-white text-2xl" />}
                </div>
                <div className={`lg:flex lg:items-center lg:space-x-6 absolute lg:static top-16 right-0 w-full lg:w-auto bg-gray-900 lg:bg-transparent p-4 lg:p-0 transition-all ${menuOpen ? 'block' : 'hidden'}`}>
                    <ul className="flex flex-col lg:flex-row lg:space-x-6 space-y-4 lg:space-y-0 text-white">
                        <li><Link href="/" className={`${pathname === "/" ? "text-yellow-600" : "text-white"} hover:text-yellow-600 flex items-center space-x-2`}><FaHome /> <span>Home</span></Link></li>
                        <li>
                            <Link
                                href="/ourcoffee"
                                className={`${pathname === "/ourcoffee" || (pathname && pathname.startsWith("/coffees")) ? "text-yellow-600" : "text-white"} hover:text-yellow-600 flex items-center space-x-2`}
                            >
                                <FaCoffee /> <span>Our Breads</span>
                            </Link>
                        </li>

                        <li><Link href="/subscription" className={`${pathname === "/subscription" ? "text-yellow-600" : "text-white"} hover:text-yellow-600 flex items-center space-x-2`}><FaBox /> <span>Subscription</span></Link></li>
                        <li><Link href="/about" className={`${pathname === "/about" ? "text-yellow-600" : "text-white"} hover:text-yellow-600 flex items-center space-x-2`}><FaInfoCircle /> <span>About Us</span></Link></li>
                        <li><Link href="/contact" className={`${pathname === "/contact" ? "text-yellow-600" : "text-white"} hover:text-yellow-600 flex items-center space-x-2`}><FaAddressBook /> <span>Contact</span></Link></li>
                    </ul>
                    <div className="mt-4 lg:mt-0 flex flex-col lg:flex-row lg:items-center lg:space-x-4">
                      
                        <Link href="/auth">
                            <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                                <FaRocket /> <span>Get Started</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}