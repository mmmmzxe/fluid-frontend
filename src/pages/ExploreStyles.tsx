import { motion } from "framer-motion";
import styleHero from "@/assets/5.webp";
import manBlackOutfit from "@/assets/1.webp";
import womanWhiteOutfit from "@/assets/2.webp";
import womanRedFloral from "@/assets/3.webp";
import manBlackJacket from "@/assets/4.webp";

const gridImages = [
  { src: manBlackOutfit, alt: "Man in black outfit", sale: true },
  { src: womanWhiteOutfit, alt: "Woman in white outfit", sale: false },
  { src: womanRedFloral, alt: "Woman in red floral dress", sale: false },
  { src: manBlackJacket, alt: "Man in black jacket", sale: false },
];

// Animation settings
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const ExploreStyles = () => {
  return (
    <section className="w-full bg-background py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.4 }}
          transition={{ staggerChildren: 0.2 }}
        >
          {/* Hero Image */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.8 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <img
                src={styleHero}
                alt="Elegant woman in brown wrap dress"
                className="w-full h-[700px] lg:h-[800px] object-cover"
                loading="eager"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />

              {/* Vertical Text */}
              <div className="absolute left-6 top-1/2 -translate-y-1/2">
                <div className="writing-mode-vertical-rl text-orientation-mixed">
                  <h2 className="text-white font-bold text-lg lg:text-xl tracking-[0.3em] whitespace-nowrap">
                    EXPLORE NEW AND POPULAR STYLES
                  </h2>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Grid of Thumbnails */}
          <div className="grid grid-cols-2 gap-4 order-1 lg:order-2">
            {gridImages.map((image, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-xl shadow-lg">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-48 lg:h-[350px] object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    fetchPriority="auto"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  {image.sale && (
                    <div className="absolute top-3 right-3 bg-coral-charcoal text-white px-3 py-1 text-xs font-bold rounded">
                      SALE
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ExploreStyles;
