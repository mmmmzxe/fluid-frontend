import React from 'react';
import { Navbar } from '@/components/Navbar';
import Footer from '@/components/Footer';

import { useTranslation } from 'react-i18next';

const About = () => {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">{t('about.title')}</h1>
                <div className="prose max-w-none">
                    <p className="mb-4">
                        {t('about.welcome')}
                    </p>
                    <p>
                        {t('about.history')}
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default About;
