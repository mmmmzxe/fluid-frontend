import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/products";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import heroImage from "@/assets/hero-image.jpg";

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
      <section className="relative bg-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-navy leading-tight">
                Collections
              </h1>
              <p className="text-lg text-muted-foreground">
                You Can Explore And Shop Many Different Collection
                From Various Brands Here.
              </p>
              <Button asChild size="lg" className="bg-navy hover:bg-navy/90 text-white">
                <Link to="/products">
                  Shop Now
                </Link>
              </Button>
            </div>
            <div className="relative">
              <img
                src={heroImage}
                alt="Fashion collection hero"
                className="w-full h-auto rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

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

      {/* Newsletter Signup */}
      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-navy mb-4">
            Or Subscribe To The Newsletter
          </h2>
          <p className="text-muted-foreground mb-8">
            Get the latest updates on new collections, sales, and exclusive offers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Email Address..."
              className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="bg-navy hover:bg-navy/90 text-white px-8">
              Submit
            </Button>
          </div>
        </div>
      </section>

      {/* ZARA-style Hero Section */}
      <section className="py-16 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold">
                CORAL
              </h2>
              <p className="text-lg text-gray-300">
                Luxurious Yet Understated. The New Evening
                Wear Collection Exclusively Offered At The
                Reopened Giorgio Armani Boutique In Los
                Angeles.
              </p>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-navy">
                See Collection
              </Button>
            </div>
            <div className="relative">
              <div className="text-6xl lg:text-8xl font-bold text-white/10 absolute inset-0 flex items-center justify-center">
                CORAL
              </div>
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

      {/* Instagram Follow Section */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-navy mb-8">
            Follow Products And Discounts On Instagram
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-gray-light rounded-lg overflow-hidden">
                <img
                  src={`https://images.unsplash.com/photo-${1500000000000 + i}?w=200&h=200&fit=crop`}
                  alt={`Instagram post ${i}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
          
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-navy mb-4">
              Or Subscribe To The Newsletter
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Email Address..."
                className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className="bg-navy hover:bg-navy/90 text-white px-8">
                SUBMIT
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
