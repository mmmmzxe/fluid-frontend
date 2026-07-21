import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard, transformApiProduct } from "@/components/ProductCard";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import PageLoader from "@/components/PageLoader";

import brandBanner from "@/assets/brand-banner.png";
import ExploreStyles from "./ExploreStyles";
import CollectionsHero from "./CollectionsHero";
import CategorySection from "@/components/CategorySection";
import CategoryLoader from "@/components/CategoryLoader";

import Footer from "@/components/Footer";

import TextVideoSection from "./MediaSection";
import CreativeShowcase from "./CreativeShowcase";
import { useProducts, useCategories } from "@/hooks/useApi";

const brandLogos = [
  { name: "GRAPHIC STUDIO", logo: "GS" },
  { name: "S. SALVA ART DIRECTOR", logo: "SS" },
  { name: "VALANCE WORLD", logo: "VW" },
  { name: "FURNITURE DESIGN", logo: "FD" },
  { name: "TRAVEL GUIDEBOOK", logo: "TG" },
];

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
};

const Index = () => {
  const { t } = useTranslation();
  const { products: apiFeatured, loading: isFeaturedLoading } = useProducts();
  const featuredProducts = apiFeatured.map(transformApiProduct).slice(0, 8);
  const { products: apiProducts, loading: isBestSellingLoading } = useProducts({ sortBy: "best-selling" });
  const apiBestSelling = apiProducts;
  const bestSellingProducts = apiBestSelling.map(transformApiProduct).slice(0, 4);
  
  const { categories, loading: categoriesLoading } = useCategories();
  const isLoading = isFeaturedLoading || isBestSellingLoading || categoriesLoading;

  if (isLoading) {
    return <PageLoader message="Loading homepage..." />;
  }

  return (
    <motion.div
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <SEO 
        title="ExtraChic - Stylish & Affordable Fashion"
        description="Discover the latest trends in fashion at ExtraChic. Shop stylish and affordable clothing, accessories, and more. Your go-to destination for premium fashion."
        keywords="fashion, clothing, style, affordable fashion, online shopping, ExtraChic, trendy clothes, accessories"
      />
      <Navbar />



 
  
        {/* Categories with products */}
        {!categoriesLoading && categories?.map((cat) => (
          <CategoryLoader key={cat._id} category={cat} />
        ))}
 
      



        {/* Featured Products */}
      <motion.section
        className="py-16 bg-gray-light"
        initial="initial"
        whileInView="animate"
      
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-bold text-navy mb-4">
              {t('home.exploreNewStyles')}
            </h2>
          </motion.div>
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
           
          >
            {featuredProducts.map((product) => (
              <motion.div
                key={product.id}
                
               
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            className="text-center mt-12"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
           
          >
            <Button asChild variant="outline" size="lg">
              <Link to="/products">
                {t('home.viewAllProducts')}
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>








      {/* Best Sellers */}
      <motion.section
        className="bg-gray-light"
        initial="initial"
        whileInView="animate"
       
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-bold text-navy mb-4">
              {t('home.bestSellers')}
            </h2>
          </motion.div>
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
         
          >
            {bestSellingProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={fadeInUp}
                
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>



      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.6 }}
      >
        <Footer />
      </motion.div>
    </motion.div>
  );
};

export default Index;
