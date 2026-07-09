import { FaFacebookF, FaInstagram } from "react-icons/fa";
import logo from "@/assets/LogoNav.png";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCategories } from "@/hooks/useApi";
import { getCategoryName } from "@/lib/i18nHelpers";

export default function Footer() {
  const { t } = useTranslation();
  const { categories } = useCategories();
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo & Description */}
        <div>
          <img src={logo} alt="logo" className=" h-40" />
          <p className=" text-gray-600 text-sm">
            {t('footer.brandDescription')}
          </p>
          <div className="mt-6 space-y-3">
            {/* Kagal Socials */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-800 min-w-[70px]">Casual</span>
              <div className="flex gap-3">
                <a 
                  href="https://www.facebook.com/share/1BvAGqvgdN/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-[#1877F2] hover:text-white transition-all duration-300 transform hover:scale-110"
                  aria-label="Kagal Facebook"
                >
                  <FaFacebookF size={14} />
                </a>
                <a 
                  href="https://www.instagram.com/extrachic.eg?igsh=MXR5YTlkazE4NWY3aQ%3D%3D" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-[#E4405F] hover:text-white transition-all duration-300 transform hover:scale-110"
                  aria-label="Kagal Instagram"
                >
                  <FaInstagram size={16} />
                </a>
              </div>
            </div>

            {/* Homeware Socials */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-800 min-w-[70px]">Homeware</span>
              <div className="flex gap-3">
                <a 
                  href="https://www.facebook.com/share/1ALarwA2N8/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-[#1877F2] hover:text-white transition-all duration-300 transform hover:scale-110"
                  aria-label="Homeware Facebook"
                >
                  <FaFacebookF size={14} />
                </a>
                <a 
                  href="https://www.instagram.com/extrachic__1?igsh=aGRpM2l3d3Jtdnk0" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-[#E4405F] hover:text-white transition-all duration-300 transform hover:scale-110"
                  aria-label="Homeware Instagram"
                >
                  <FaInstagram size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Catalog */}
        <div>
          <h3 className="font-semibold mb-4">{t('footer.catalog').toUpperCase()}</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            {categories.slice(0, 5).map((category) => (
              <li key={category._id}>
                <Link to={`/products?category=${category._id}`} className="hover:text-gray-900">
                  {getCategoryName(category)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* About Us */}
        <div>
          <h3 className="font-semibold mb-4">{t('footer.aboutUs').toUpperCase()}</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link to="/products" className="hover:text-gray-900">{t('footer.ourProducers')}</Link></li>

            <li><Link to="/faq" className="hover:text-gray-900">{t('footer.faq')}</Link></li>
            <li><Link to="/about" className="hover:text-gray-900">{t('footer.aboutUs')}</Link></li>
            <li><Link to="/terms" className="hover:text-gray-900">{t('footer.termsOfService')}</Link></li>
          </ul>
        </div>

        {/* Customer Services */}
        <div>
          <h3 className="font-semibold mb-4">{t('footer.customerServices').toUpperCase()}</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link to="/contact" className="hover:text-gray-900">{t('footer.contactUs')}</Link></li>
            <li><Link to="/profile" className="hover:text-gray-900">{t('footer.trackOrder')}</Link></li>
            <li><Link to="/product-care" className="hover:text-gray-900">{t('footer.productCare')}</Link></li>
            <li><Link to="/contact" className="hover:text-gray-900">{t('footer.bookAppointment')}</Link></li>
            <li><Link to="/shipping-returns" className="hover:text-gray-900">{t('footer.shippingReturns')}</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-primary text-gray-200 text-sm py-4 px-6 flex flex-col md:flex-row justify-between items-center">
        <p>© 2018 Extrachic, Inc. {t('footer.allRightsReserved')}</p>
        <div className="flex space-x-2 mt-2 md:mt-0">
          <img src="https://paymob.com/images/logoC.png" alt="Visa" className="h-6" />

        </div>
        <a href="#" className="mt-2 md:mt-0 hover:text-white">Scroll To Top ↑</a>
      </div>
    </footer>
  );
}