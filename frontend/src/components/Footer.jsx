import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-6 mt-auto">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
              <span className="text-2xl">🍽️</span> Order On The Go
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Delicious food delivered to your doorstep. Fast, fresh, and always on time.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="hover:text-orange-500 transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-orange-500 transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-orange-500 transition">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-orange-500 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-orange-500 transition">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-orange-500 transition">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-orange-500 transition">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="hover:text-orange-500 transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-orange-500 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-orange-500 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="hover:text-orange-500 transition">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-orange-500" />
                <span>+91 7416518998</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-orange-500" />
                <span>thathieswarreddy@gmail.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-orange-500 mt-1" />
                <span>123 Food Street, Tirupati, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
          <p>© {currentYear} Order On The Go. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
