import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/products";
import { Navbar } from "@/components/Navbar";

import heroImage from "@/assets/hero-image.jpg";
import brandBanner from "@/assets/brand-banner.png";
import ExploreStyles from "./ExploreStyles";
import CollectionsHero from "./CollectionsHero";
import InstagramNewsletter from "./InstagramNewsletter";
import Footer from "@/components/Footer";

const brandLogos = [
  { name: "GRAPHIC STUDIO", logo: "GS" },
  { name: "S. SALVA ART DIRECTOR", logo: "SS" },
  { name: "VALANCE WORLD", logo: "VW" },
  { name: "FURNITURE DESIGN", logo: "FD" },
  { name: "TRAVEL GUIDEBOOK", logo: "TG" },
];

const Index = () => {
  const featuredProducts = products.slice(0, 8);
  const bestSellers = products.filter(p => p.rating >= 4.5).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
  <CollectionsHero/>

      {/* Brand Logos */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
            {brandLogos.map((brand, index) => (
              <div key={index} className="text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                    {brand.logo}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {brand.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ExploreStyles/>
      {/* Featured Products */}
      <section className="py-16 bg-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Explore New And Popular Styles
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link to="/products">
                View All Products
              </Link>
            </Button>
          </div>
        </div>
      </section>


      {/* ZARA-style Hero Section */}
      <section
      className="relative h-[80vh] text-white"
      style={{
        backgroundImage: `url('${brandBanner}')`, // 👈 left side image background
        backgroundSize: "cover",
        backgroundPosition: "left center",
      }}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-black/60 to-black/50"></div>

      <div className="relative max-w-7xl mx-auto h-full flex items-center px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
          {/* Left side (kept empty for image alignment) */}
          <div></div>

          {/* Right side text content */}
          <div className="relative z-10 flex flex-col justify-center space-y-6">
            {/* Big faded ZARA in background */}
            <h1 className="absolute -top-16 -right-10 text-[8rem] lg:text-[12rem] font-bold text-white/10 leading-none z-0 select-none">
              ZARA
            </h1>

            {/* Foreground small ZARA */}
            <h2 className="text-3xl lg:text-4xl font-bold">ZARA</h2>

            {/* Description */}
            <p className="text-base lg:text-lg text-gray-300 max-w-md leading-relaxed">
              Lustrous Yet Understated. The New Evening Wear Collection
              Exclusively Offered At The Reopened Giorgio Armani Boutique In Los
              Angeles.
            </p>

            {/* Button */}
            <button className="px-6 py-3 w-fit border border-white text-white font-medium hover:bg-white hover:text-black transition">
              See Collection
            </button>
          </div>
        </div>
      </div>
    </section>


      {/* Best Sellers */}
      <section className="py-16 bg-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Best Sellers
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
<InstagramNewsletter/>
  

      <Footer />
    </div>
  );
};

export default Index;
