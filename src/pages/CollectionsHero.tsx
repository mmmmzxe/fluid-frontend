import React from 'react';
import Slider from 'react-slick';
import { ShoppingBag, Sparkles, TrendingUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import image2 from "@/assets/bohemian-woman-elegant-home-wear-reading-book-stylish-living-room.webp";
import image3 from "@/assets/excited-barefoot-woman-pajama-holding-cup-coffee-full-length-view-joyful-woman-drinking-tea-smiling-home.webp";
import image4 from "@/assets/woman-purple-bathrobe-bedroom.webp";
import image5 from "@/assets/portrait-charming-woman-with-curly-hair-red-headband-earrings-yellow-outfit-posing-isolated-pink-background.webp";
import image6 from "@/assets/woman-wearing-fast-fashion-products.webp";

const images = [image6, image5, image2, image3, image4];

const CollectionsHero = () => {
  const { t } = useTranslation();
  const sliderSettings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    pauseOnHover: true,
    fade: true,
    speed: 1000,
  };

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-[hsl(var(--coral-light))] dark:bg-[hsl(var(--background))]">
      {/* Animated Background Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-[hsl(var(--coral-warm))] dark:bg-[hsl(var(--coral-warm))] rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-[hsl(var(--coral-beige))] dark:bg-[hsl(var(--coral-beige))] rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-[hsl(var(--secondary))] dark:bg-[hsl(var(--secondary))] rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* --- Text Content with Glassmorphism --- */}
          <div className="flex flex-col justify-center space-y-8 z-10">
            {/* Floating Badge */}
            <div className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md border border-[hsl(var(--border))] shadow-lg animate-float">
              <Sparkles className="w-4 h-4 text-[hsl(var(--primary))] dark:text-[hsl(var(--coral-warm))]" />
              <span className="text-sm font-semibold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] dark:from-[hsl(var(--coral-warm))] dark:to-[hsl(var(--coral-beige))] bg-clip-text text-transparent">
                {t('home.ourCollections')}
              </span>
            </div>

            {/* Main Heading with Gradient */}
            <h1 className="text-6xl lg:text-8xl font-black tracking-tight leading-none">
              <span className="bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--secondary))] to-[hsl(var(--coral-warm))] dark:from-[hsl(var(--coral-warm))] dark:via-[hsl(var(--coral-beige))] dark:to-[hsl(var(--secondary))] bg-clip-text text-transparent animate-gradient">
                {t('home.collections')}
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg lg:text-xl text-[hsl(var(--foreground))] dark:text-[hsl(var(--muted-foreground))] leading-relaxed max-w-xl">
              {t('home.exploreDiverseCollections')}
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="group p-4 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-[hsl(var(--border))] hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-elegant)]">
                <TrendingUp className="w-6 h-6 text-[hsl(var(--primary))] dark:text-[hsl(var(--coral-warm))] mb-2 group-hover:rotate-12 transition-transform" />
                <div className="text-2xl font-bold text-[hsl(var(--foreground))]">500+</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">Products</div>
              </div>
              <div className="group p-4 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-[hsl(var(--border))] hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-elegant)]">
                <Star className="w-6 h-6 text-[hsl(var(--secondary))] dark:text-[hsl(var(--coral-beige))] mb-2 group-hover:rotate-12 transition-transform" />
                <div className="text-2xl font-bold text-[hsl(var(--foreground))]">4.9</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">Rating</div>
              </div>
              <div className="group p-4 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-[hsl(var(--border))] hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-elegant)]">
                <Sparkles className="w-6 h-6 text-[hsl(var(--coral-warm))] dark:text-[hsl(var(--secondary))] mb-2 group-hover:rotate-12 transition-transform" />
                <div className="text-2xl font-bold text-[hsl(var(--foreground))]">New</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">Arrivals</div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Button
                size="lg"
                className="group relative overflow-hidden rounded-full px-10 py-7 text-lg font-semibold  hover:from-[hsl(var(--primary))]/90 hover:via-[hsl(var(--secondary))]/90 hover:to-[hsl(var(--coral-warm))]/90 text-white shadow-[var(--shadow-elegant)] hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 transition-transform group-hover:rotate-12 group-hover:scale-110" />
                  {t('home.shopNow')}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--coral-warm))] via-[hsl(var(--coral-beige))] to-[hsl(var(--secondary))] opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl"></div>
              </Button>
            </div>
          </div>

          {/* --- Image Carousel with Enhanced Effects --- */}
          <div className="relative z-10">
            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-[hsl(var(--coral-warm))] to-[hsl(var(--secondary))] rounded-full blur-2xl opacity-50 animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-[hsl(var(--secondary))] to-[hsl(var(--coral-beige))] rounded-full blur-2xl opacity-50 animate-pulse animation-delay-2000"></div>

            {/* Glassmorphism Frame */}
            <div className="relative p-3 rounded-3xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-[hsl(var(--border))] shadow-[var(--shadow-elegant)] hover:shadow-2xl transition-all duration-500 group">
              <Slider {...sliderSettings} className="rounded-2xl overflow-hidden">
                {images.map((src, index) => (
                  <div key={index} className="relative">
                    <div className="relative overflow-hidden rounded-2xl">
                      <img
                        src={src}
                        alt={`Fashion model ${index + 1}`}
                        className="w-full h-[600px] lg:h-[700px] object-cover transform transition-transform duration-700 group-hover:scale-105"
                        loading={index === 0 ? "eager" : "lazy"}
                        // @ts-ignore
                        fetchpriority={index === 0 ? "high" : "auto"}
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary))]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  </div>
                ))}
              </Slider>

              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-[hsl(var(--coral-warm))] dark:border-[hsl(var(--coral-beige))] rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-[hsl(var(--secondary))] dark:border-[hsl(var(--coral-warm))] rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};

export default CollectionsHero;
