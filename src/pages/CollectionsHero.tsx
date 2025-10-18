import React, { useState, useEffect } from 'react';
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

import Autoplay from "embla-carousel-autoplay";
import image1 from "@/assets/full-length-portrait-slim-woman-glasses-white-sneakers-stroking-beagle-dog-which-sitting-chair.jpg";
import image2 from "@/assets/bohemian-woman-elegant-home-wear-reading-book-stylish-living-room.jpg";
import image3 from "@/assets/excited-barefoot-woman-pajama-holding-cup-coffee-full-length-view-joyful-woman-drinking-tea-smiling-home.jpg";
import image4 from "@/assets/woman-purple-bathrobe-bedroom.jpg";

import image5 from "@/assets/portrait-charming-woman-with-curly-hair-red-headband-earrings-yellow-outfit-posing-isolated-pink-background.jpg";
import image6 from "@/assets/woman-wearing-fast-fashion-products.jpg";
import image7 from "@/assets/woman-ladder-with-flowers-bouquet-coat.jpg";

const images = [
  image6,
  image5,
  image1,

  image2,
  image7,
  image3,
  image4,
];

const CollectionsHero = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
    api.on("reInit", () => {
        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section className="w-full bg-gradient-to-br from-coral-light to-background py-10 lg:py-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* --- المحتوى النصي (تم تعديله) --- */}
          {/* 1. استخدام space-y-6 لتقريب العناصر الأساسية */}
          <div className="flex flex-col justify-center space-y-6">
            
            {/* 2. إضافة "Pre-title" بلون مميز وحروف كبيرة */}
            <span className="text-lg font-semibold text-secondary tracking-widest uppercase">
              Our Collections
            </span>

            {/* 3. العنوان الرئيسي (كما هو) */}
            <h1 className="text-6xl lg:text-7xl font-bold text-foreground tracking-tight leading-tight">
              Collections
            </h1>

            {/* 4. تحسين نص الفقرة ليكون أكثر احترافية */}
            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
              Explore and shop diverse collections from various top brands, 
              all in one place. Find your next signature piece.
            </p>

            {/* 5. إضافة مسافة (padding-top) لفصل الزر عن النص */}
            <div className="pt-6">
              <Button variant="secondary" size="lg" className="group rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-shadow">
                <ShoppingBag className="h-5 w-5 mr-3 transition-transform group-hover:rotate-12" />
                Shop Now
              </Button>
            </div>
          </div>

          {/* --- الـ Carousel (كما هو) --- */}
          <div>
            <div className="relative group">
              <Carousel
                setApi={setApi}
                plugins={[plugin.current]}
                className="relative z-10 w-full transform rotate-3"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
              >
                <CarouselContent className="rounded-3xl">
                  {images.map((src, index) => (
                    <CarouselItem key={index}>
                      <div className="overflow-hidden rounded-3xl ">
                        <img
                          src={src}
                          alt={`Fashion model ${index + 1}`}
                          className="w-full h-[700px] object-cover "
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

            <div className="flex justify-center space-x-2 mt-6">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={`
                    h-2 rounded-full transition-all duration-300
                    ${current === index ? 'w-6 bg-secondary' : 'w-2 bg-secondary/40'}
                  `}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CollectionsHero;