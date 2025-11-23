import React from 'react';
import { Navbar } from '@/components/Navbar';
import Footer from '@/components/Footer';

import { useTranslation } from 'react-i18next';

const ProductCare = () => {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">{t('productCare.title')}</h1>
                <div className="prose max-w-none">
                    <p className="mb-4">
                        {t('productCare.intro')}
                    </p>
                    <h2 className="text-xl font-semibold mt-4 mb-2">{t('productCare.generalCare')}</h2>
                    <ul className="list-disc pl-5 mb-4">
                        <li>{t('productCare.careList.item1')}</li>
                        <li>{t('productCare.careList.item2')}</li>
                        <li>{t('productCare.careList.item3')}</li>
                        <li>{t('productCare.careList.item4')}</li>
                    </ul>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ProductCare;
