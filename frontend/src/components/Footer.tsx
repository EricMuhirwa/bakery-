import Link from 'next/link';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-10 px-5 sm:px-10">
      {/* Main Footer Content */}
      <div className="container mx-auto flex flex-wrap justify-between gap-8">
        {/* Customer Service Section */}
        <div className="flex-1 min-w-[200px] mb-8">
          <h4 className="font-bold text-lg mb-4">Customer Service</h4>
          <ul className="space-y-2">
            <li><Link href="/FAQ" className="hover:text-gray-300 transition-colors">FAQ</Link></li>
            <li><Link href="/contact" className="hover:text-gray-300 transition-colors">Contact Us</Link></li>
            <li><Link href="/RefundPolicy" className="hover:text-gray-300 transition-colors">Refund Policy</Link></li>
            <li><Link href="/PrivacyPolicy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/TermsOfService" className="hover:text-gray-300 transition-colors">Terms of Service</Link></li>
            <li><Link href="/Wholesale" className="hover:text-gray-300 transition-colors">Wholesale</Link></li>
          </ul>
        </div>

        {/* Learn Section */}
        <div className="flex-1 min-w-[200px] mb-8">
          <h4 className="font-bold text-lg mb-4">Learn</h4>
          <ul className="space-y-2">
            <li><Link href="/about" className="hover:text-gray-300 transition-colors">About Us</Link></li>
            <li><Link href="/Careers" className="hover:text-gray-300 transition-colors">Careers</Link></li>
            <li><Link href="/contact" className="hover:text-gray-300 transition-colors">Contact Us</Link></li>
            <li><Link href="/Blog" className="hover:text-gray-300 transition-colors">Blog</Link></li>
            <li><Link href="/Press" className="hover:text-gray-300 transition-colors">Press</Link></li>
            <li><Link href="/Give5Get5" className="hover:text-gray-300 transition-colors">Give 5000 RWF, Get 5000 RWF</Link></li>
          </ul>
        </div>

        {/* Contact Section */}
        <div className="flex-1 min-w-[200px] mb-8">
          <h4 className="font-bold text-lg mb-4">CONTACT WITH US</h4>
          <div className="flex gap-4 mb-4">
            <a href="https://www.facebook.com/profile.php?id=100022420636518" className="text-white hover:text-gray-300 transition-colors">
              <FaFacebook size={24} />
            </a>
            <a href="https://www.instagram.com/kigeli_34/?next=%2F" className="text-white hover:text-gray-300 transition-colors">
              <FaInstagram size={24} />
            </a>
            <a href="https://x.com/kigeli_34" className="text-white hover:text-gray-300 transition-colors">
              <FaTwitter size={24} />
            </a>
          </div>
          <p className="font-semibold">SUPPORT</p>
          <a href="tel:+48452037323" className="text-white hover:text-gray-300 transition-colors">
          +250 788 563 705
          </a>
        </div>
      </div>

      {/* Footer Bottom Section */}
      <div className="text-gray-300 space-y-2 text-center">
        <p>We&rsquo;re located in The Bugesera  — a historic MMM</p>
        <p>neighborhood with a rich history of black entrepreneurs</p>
        <p>and culture. We&rsquo;re honored to have you as a partner</p>
        <p>in this journey to revitalize black and brown entrepreneurship.</p>
      </div>


      {/* Divider */}
      <hr className="border-gray-600 my-8" />

      {/* Footer Links */}
      <div className="container mx-auto flex flex-wrap justify-between gap-4 text-sm">
        <div className="flex flex-wrap gap-4">
          <Link href="/TermsOfService" className="text-white hover:text-gray-300 transition-colors">
            Terms & Conditions
          </Link>
          <Link href="/PrivacyPolicy" className="text-white hover:text-gray-300 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/TermsOfService" className="text-white hover:text-gray-300 transition-colors">
            Do Not Sell My Info
          </Link>
          <Link href="/TermsOfService" className="text-white hover:text-gray-300 transition-colors">
            Accessibility
          </Link>
        </div>
        <div>
          <p className="text-gray-300">© 2026 Bakery Ineza</p>
        </div>
      </div>
    </footer>
  );
}