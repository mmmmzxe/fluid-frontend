import React from 'react';
import Slider from 'react-slick';
import { ShoppingBag } from "lucide-react";
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
    autoplaySpeed: 3000,
    arrows: false,
    pauseOnHover: true,
  };

  return (
    <section className="w-full bg-gradient-to-br from-coral-light to-background py-10 lg:py-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* --- Text content --- */}
          <div className="flex flex-col justify-center space-y-6">
            <span className="text-lg font-semibold text-secondary tracking-widest uppercase">
              {t('home.ourCollections')}
            </span>

            <h1 className="text-6xl lg:text-7xl font-bold text-foreground tracking-tight leading-tight">
              {t('home.collections')}
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
              {t('home.exploreDiverseCollections')}
            </p>

            <div className="pt-6">
              <Button variant="secondary" size="lg" className="group rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-shadow">
                <ShoppingBag className="h-5 w-5 mr-3 transition-transform group-hover:rotate-12" />
                {t('home.shopNow')}
              </Button>
            </div>
          </div>

          {/* --- Slick Carousel --- */}
          <div className="relative group">
            <Slider {...sliderSettings} className="rounded-3xl overflow-hidden">
              {images.map((src, index) => (
                <div key={index}>
                  <img
                    src={src}
                    alt={`Fashion model ${index + 1}`}
                    className="w-full h-[700px] object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                  />
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollectionsHero;
