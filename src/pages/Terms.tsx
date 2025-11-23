import React from 'react';
import { Navbar } from '@/components/Navbar';
import Footer from '@/components/Footer';

import { useTranslation } from 'react-i18next';

const Terms = () => {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">{t('terms.title')}</h1>
                <div className="prose max-w-none">
                    <p className="mb-4">
                        {t('terms.intro')}
                    </p>
                    <h2 className="text-xl font-semibold mt-4 mb-2">{t('terms.section1Title')}</h2>
                    <p className="mb-4">
                        {t('terms.section1Content')}
                    </p>
                    <h2 className="text-xl font-semibold mt-4 mb-2">{t('terms.section2Title')}</h2>
                    <p className="mb-4">
                        {t('terms.section2Content')}
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Terms;
