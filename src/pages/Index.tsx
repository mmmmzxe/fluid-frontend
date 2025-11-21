import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard, transformApiProduct } from "@/components/ProductCard";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import brandBanner from "@/assets/brand-banner.png";
import ExploreStyles from "./ExploreStyles";
import CollectionsHero from "./CollectionsHero";

import Footer from "@/components/Footer";
import TextVideoSection from "./MediaSection";
import { useProducts } from "@/hooks/useApi";

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
  const { products: apiFeatured } = useProducts();
  const featuredProducts = apiFeatured.map(transformApiProduct).slice(0, 8);
  const { products: apiProducts } = useProducts({ sortBy: "best-selling" });
  const apiBestSelling = apiProducts;
  const bestSellingProducts = apiBestSelling.map(transformApiProduct).slice(0, 4);
  return (
    <motion.div
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <CollectionsHero />
      </motion.div>

      {/* Brand Logos */}
      <motion.section
        className="py-16 bg-background"
        initial="initial"
        whileInView="animate"
        viewport={{ once: false, amount: 0.3 }}
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: false, amount: 0.2 }}
          >
            {brandLogos.map((brand, index) => (
              <motion.div
                key={index}
                className="text-center"
                variants={scaleIn}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                    {brand.logo}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {brand.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>


      <ExploreStyles />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        <TextVideoSection />
      </motion.div>
      {/* Featured Products */}
      <motion.section
        className="py-16 bg-gray-light"
        initial="initial"
        whileInView="animate"
        viewport={{ once: false, amount: 0.2 }}
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: false, amount: 0.1 }}
          >
            {featuredProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={fadeInUp}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
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
            viewport={{ once: false, amount: 0.5 }}
          >
            <Button asChild variant="outline" size="lg">
              <Link to="/products">
                {t('home.viewAllProducts')}
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>


      {/* ZARA-style Hero Section */}
      <motion.section
        className="relative h-[80vh] text-white"
        style={{
          backgroundImage: `url('${brandBanner}')`,
          backgroundSize: "cover",
          backgroundPosition: "left center",
        }}
        initial="initial"
        whileInView="animate"
        viewport={{ once: false, amount: 0.3 }}
        variants={fadeInUp}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-black/60 to-black/50"></div>

        <div className="relative max-w-7xl mx-auto h-full flex items-center px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
            {/* Left side (kept empty for image alignment) */}
            <div></div>

            {/* Right side text content */}
            <motion.div
              className="relative z-10 flex flex-col justify-center space-y-6"
              variants={fadeInRight}
            >
              {/* Big faded ZARA in background */}
              <motion.h1
                className="absolute -top-16 -right-10 text-[8rem] lg:text-[12rem] font-bold text-white/10 leading-none z-0 select-none"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.1, scale: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                EXTRACHIC
              </motion.h1>

              {/* Foreground small ZARA */}
              <motion.h2
                className="text-3xl lg:text-4xl font-bold"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {t('home.brandHeading')}
              </motion.h2>

              {/* Description */}
              <motion.p
                className="text-base lg:text-lg text-gray-300 max-w-md leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {t('home.brandDescription')}
              </motion.p>

              {/* Button */}
              <motion.button
                className="px-6 py-3 w-fit border border-white text-white font-medium hover:bg-white hover:text-black transition"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}

                whileTap={{ scale: 0.95 }}
              >
                {t('home.seeCollection')}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.section>


      {/* Best Sellers */}
      <motion.section
        className="py-16 bg-gray-light"
        initial="initial"
        whileInView="animate"
        viewport={{ once: false, amount: 0.2 }}
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: false, amount: 0.1 }}
          >
            {bestSellingProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={fadeInUp}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
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
