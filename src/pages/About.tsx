import React from 'react';
import { Navbar } from '@/components/Navbar';
import Footer from '@/components/Footer';

import { useTranslation } from 'react-i18next';

import SEO from '@/components/SEO';

const About = () => {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen flex flex-col">
            <SEO 
                title={t('about.title')} 
                description={t('about.welcome')}
            />
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">{t('about.title')}</h1>
                <div className="prose max-w-none mb-12">
                    <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
                        {t('about.welcome')}
                    </p>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                        {t('about.history')}
                    </p>
                </div>

                <div className="bg-muted p-8 rounded-lg mt-8">
                    <h2 className="text-2xl font-bold mb-6 text-navy">{t('about.whyChooseUsTitle')}</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <p className="flex items-start">
                                <span className="bg-white p-2 rounded-full mr-3 shadow-sm">✨</span>
                                <span>{t('about.reasons.diverse')}</span>
                            </p>
                            <p className="flex items-start">
                                <span className="bg-white p-2 rounded-full mr-3 shadow-sm">💎</span>
                                <span>{t('about.reasons.quality')}</span>
                            </p>
                            <p className="flex items-start">
                                <span className="bg-white p-2 rounded-full mr-3 shadow-sm">🌟</span>
                                <span>{t('about.reasons.trends')}</span>
                            </p>
                        </div>
                        <div className="space-y-4">
                            <p className="flex items-start">
                                <span className="bg-white p-2 rounded-full mr-3 shadow-sm">📏</span>
                                <span>{t('about.reasons.sizing')}</span>
                            </p>
                            <p className="flex items-start">
                                <span className="bg-white p-2 rounded-full mr-3 shadow-sm">🔒</span>
                                <span>{t('about.reasons.secure')}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default About;
