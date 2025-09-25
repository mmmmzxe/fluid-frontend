import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroModel from "@/assets/hero-model.jpg";

const CollectionsHero = () => {
  return (
    <section className="w-full bg-gradient-to-br from-coral-light to-background py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
              Collections
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
              You Can Explore Ans Shop Many Different Collection 
              From Various Brands Here.
            </p>
            <Button variant="shop" size="lg" className="group">
              <ShoppingBag className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              Shop Now
            </Button>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              <img
                src={heroModel}
                alt="Fashion model in elegant neutral outfit"
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-coral-warm/20 rounded-full blur-xl" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-coral-beige/30 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollectionsHero;