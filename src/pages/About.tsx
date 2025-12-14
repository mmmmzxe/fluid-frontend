import React from 'react';
import { Navbar } from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO';
import { MapPin, Star, Award, TrendingUp, ShieldCheck, Ruler } from 'lucide-react';

import aboutHeroBg from '@/assets/about-hero-bg.png';

const About = () => {
    const { t } = useTranslation();
    const [activeLocation, setActiveLocation] = React.useState(0);

    const locations = [
        {
            name: "Value Mall",
            // Centered on Value Mall area in Shorouk
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3450.4862412891244!2d31.609456!3d30.138987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14581deaa9a4632b%3A0x6b4f742d5e751856!2sValue%20Mall%201!5e0!3m2!1sen!2seg!4v1700000000000!5m2!1sen!2seg" 
        },
        {
            name: "Ali Baba Mall",
            // Centered on Ali Baba Mall area
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3450.6276845625!2d31.625890!3d30.135012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14581d777d206f0b%3A0x3861d9a265691060!2sAli%20Baba%20Mall!5e0!3m2!1sen!2seg!4v1700000000000!5m2!1sen!2seg"
        }
    ];

    const features = [
        {
            icon: <Star className="w-8 h-8 text-primary" />,
            title: t('about.reasons.diverse'),
            description: t('about.reasons.diverse')
        },
        {
            icon: <Award className="w-8 h-8 text-primary" />,
            title: t('about.reasons.quality'),
            description: t('about.reasons.quality')
        },
        {
            icon: <TrendingUp className="w-8 h-8 text-primary" />,
            title: t('about.reasons.trends'),
            description: t('about.reasons.trends')
        },
        {
            icon: <Ruler className="w-8 h-8 text-primary" />,
            title: t('about.reasons.sizing'),
            description: t('about.reasons.sizing')
        },
        {
            icon: <ShieldCheck className="w-8 h-8 text-primary" />,
            title: t('about.reasons.secure'),
            description: t('about.reasons.secure')
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <SEO 
                title={t('about.title')} 
                description={t('about.welcome')}
            />
            <Navbar />
            
            {/* Hero Section */}
            <div 
                className="relative bg-navy text-white py-32 overflow-hidden"
                style={{
                    backgroundImage: `url(${aboutHeroBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-navy/80 z-0"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">{t('about.title')}</h1>
                    <p className="text-xl md:text-2xl max-w-2xl mx-auto opacity-90 leading-relaxed">
                        {t('about.welcome')}
                    </p>
                </div>
            </div>

            <main className="flex-grow">
                {/* Story Section */}
                <section className="py-16 container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-6 text-foreground">{t('about.history')}</h2>
                        <div className="w-24 h-1 bg-primary mx-auto mb-8 rounded-full"></div>
                    </div>
                </section>
                
                {/* Why Choose Us Grid */}
                <section className="py-16 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-12">{t('about.whyChooseUsTitle')}</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <div key={index} className="bg-background p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-border/50 group">
                                    <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                        {feature.icon}
                                    </div>
                                    <p className="text-lg font-medium text-foreground">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Locations Section with Map */}
                <section className="py-16 container mx-auto px-4">
                    <div className="bg-card rounded-2xl overflow-hidden shadow-lg border border-border">
                        <div className="grid md:grid-cols-2">
                            <div className="p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-background to-muted">
                                <h3 className="text-3xl font-bold mb-8 text-foreground flex items-center">
                                    <MapPin className="w-8 h-8 mr-3 text-primary" />
                                    {t('about.locationsTitle')}
                                </h3>
                                <ul className="space-y-6">
                                    <li 
                                        className={`flex items-start p-4 rounded-lg shadow-sm cursor-pointer transition-all duration-300 border-2 ${activeLocation === 0 ? 'bg-primary/5 border-primary' : 'bg-background border-transparent hover:border-primary/50'}`}
                                        onClick={() => setActiveLocation(0)}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0 rtl:ml-4 rtl:mr-0 transition-colors ${activeLocation === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                            <span className="font-bold">1</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">{t('about.locations.valueMall')}</h4>
                                            <p className="text-muted-foreground text-sm mt-1">{t('about.locations.valueMallAddress')}</p>
                                        </div>
                                    </li>
                                    <li 
                                        className={`flex items-start p-4 rounded-lg shadow-sm cursor-pointer transition-all duration-300 border-2 ${activeLocation === 1 ? 'bg-primary/5 border-primary' : 'bg-background border-transparent hover:border-primary/50'}`}
                                        onClick={() => setActiveLocation(1)}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0 rtl:ml-4 rtl:mr-0 transition-colors ${activeLocation === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                            <span className="font-bold">2</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">{t('about.locations.alibabaMall')}</h4>
                                            <p className="text-muted-foreground text-sm mt-1">{t('about.locations.alibabaMallAddress')}</p>
                                        </div>
                                    </li>
                                    <li className="flex items-center p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                                        <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center mr-4 shrink-0 rtl:ml-4 rtl:mr-0">
                                            <span className="text-xl">🚀</span>
                                        </div>
                                        <span className="font-bold text-secondary-foreground">{t('about.locations.soon')}</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="h-[400px] md:h-auto min-h-[400px] relative w-full bg-muted">
                                {locations.map((loc, index) => (
                                    <div 
                                        key={index}
                                        className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${activeLocation === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                                    >
                                        <iframe 
                                            src={loc.mapUrl}
                                            width="100%" 
                                            height="100%" 
                                            style={{ border: 0 }} 
                                            allowFullScreen 
                                            loading="lazy" 
                                            referrerPolicy="no-referrer-when-downgrade"
                                            className="w-full h-full"
                                            title={`${loc.name} Map`}
                                        ></iframe>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default About;
