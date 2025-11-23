import React from 'react';
import { Navbar } from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

const Sitemap = () => {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">{t('sitemap.title')}</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">{t('sitemap.shop')}</h2>
                        <ul className="space-y-2">
                            <li><Link to="/products" className="text-blue-600 hover:underline">{t('sitemap.allProducts')}</Link></li>
                            <li><Link to="/cart" className="text-blue-600 hover:underline">{t('sitemap.cart')}</Link></li>
                            <li><Link to="/favorites" className="text-blue-600 hover:underline">{t('sitemap.favorites')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold mb-4">{t('sitemap.account')}</h2>
                        <ul className="space-y-2">
                            <li><Link to="/login" className="text-blue-600 hover:underline">{t('sitemap.login')}</Link></li>
                            <li><Link to="/signup" className="text-blue-600 hover:underline">{t('sitemap.signup')}</Link></li>
                            <li><Link to="/profile" className="text-blue-600 hover:underline">{t('sitemap.myProfile')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold mb-4">{t('sitemap.support')}</h2>
                        <ul className="space-y-2">
                            <li><Link to="/contact" className="text-blue-600 hover:underline">{t('sitemap.contactUs')}</Link></li>
                            <li><Link to="/faq" className="text-blue-600 hover:underline">{t('sitemap.faq')}</Link></li>
                            <li><Link to="/shipping-returns" className="text-blue-600 hover:underline">{t('sitemap.shippingReturns')}</Link></li>
                            <li><Link to="/about" className="text-blue-600 hover:underline">{t('sitemap.aboutUs')}</Link></li>
                            <li><Link to="/terms" className="text-blue-600 hover:underline">{t('sitemap.termsOfService')}</Link></li>
                        </ul>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Sitemap;
