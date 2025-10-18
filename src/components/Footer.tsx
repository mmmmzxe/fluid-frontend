import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import logo from "@/assets/Logo.png";
import { Link } from "react-router-dom";
export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo & Description */}
        <div>
         <img src={logo} alt="logo" className=" h-40" />
          <p className=" text-gray-600 text-sm">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <div className="flex space-x-4 mt-4 text-gray-600">
            <a href="#" className="hover:text-gray-900"><FaFacebookF /></a>
            <a href="#" className="hover:text-gray-900"><FaTwitter /></a>
            <a href="#" className="hover:text-gray-900"><FaLinkedinIn /></a>
            <a href="#" className="hover:text-gray-900"><FaInstagram /></a>
          </div>
        </div>

        {/* Catalog */}
        <div>
          <h3 className="font-semibold mb-4">CATALOG</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><a href="#" className="hover:text-gray-900">Necklaces</a></li>
            <li><a href="#" className="hover:text-gray-900">Hoodies</a></li>
            <li><a href="#" className="hover:text-gray-900">Jewelry Box</a></li>
            <li><a href="#" className="hover:text-gray-900">T-Shirt</a></li>
            <li><a href="#" className="hover:text-gray-900">Jacket</a></li>
          </ul>
        </div>

        {/* About Us */}
        <div>
          <h3 className="font-semibold mb-4">ABOUT US</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><a href="#" className="hover:text-gray-900">Our Producers</a></li>
            <li><a href="#" className="hover:text-gray-900">Sitemap</a></li>
            <li><a href="#" className="hover:text-gray-900">FAQ</a></li>
            <li><a href="#" className="hover:text-gray-900">About Us</a></li>
            <li><a href="#" className="hover:text-gray-900">Terms & Conditions</a></li>
          </ul>
        </div>

        {/* Customer Services */}
        <div>
          <h3 className="font-semibold mb-4">CUSTOMER SERVICES</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link to="/contact" className="hover:text-gray-900">Contact Us</Link></li>
            <li><a href="#" className="hover:text-gray-900">Track Your Order</a></li>
            <li><a href="#" className="hover:text-gray-900">Product Care & Repair</a></li>
            <li><a href="#" className="hover:text-gray-900">Book An Appointment</a></li>
            <li><a href="#" className="hover:text-gray-900">Shipping & Returns</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-primary text-gray-200 text-sm py-4 px-6 flex flex-col md:flex-row justify-between items-center">
        <p>© 2018 Extrachic, Inc.</p>
        <div className="flex space-x-2 mt-2 md:mt-0">
          <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-6" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="Paypal" className="h-6" />
        </div>
        <a href="#" className="mt-2 md:mt-0 hover:text-white">Scroll To Top ↑</a>
      </div>
    </footer>
  );
}