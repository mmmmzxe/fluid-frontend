import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Zap } from "lucide-react";
import styleHero from "@/assets/5.webp";
import manBlackOutfit from "@/assets/1.webp";
import womanWhiteOutfit from "@/assets/2.webp";
import womanRedFloral from "@/assets/3.webp";
import manBlackJacket from "@/assets/4.webp";

const gridImages = [
  { src: manBlackOutfit, alt: "Man in black outfit", sale: true, tag: "Trending" },
  { src: womanWhiteOutfit, alt: "Woman in white outfit", sale: false, tag: "New" },
  { src: womanRedFloral, alt: "Woman in red floral dress", sale: false, tag: "Popular" },
  { src: manBlackJacket, alt: "Man in black jacket", sale: false, tag: "Featured" },
];

// Animation settings
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

const ExploreStyles = () => {
  return (
    <section className="relative w-full bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(var(--coral-light))] to-[hsl(var(--background))] py-16 lg:py-24 overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-[hsl(var(--coral-warm))] rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-[hsl(var(--secondary))] rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center"
          initial="hidden"
          whileInView="visible"
         
        >
          {/* Hero Image with Enhanced Effects */}
          <motion.div
            variants={fadeUp}
     
            className="relative order-2 lg:order-1 group"
          >
            {/* Decorative Floating Orbs */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-[hsl(var(--coral-warm))] to-[hsl(var(--secondary))] rounded-full blur-xl opacity-40 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-[hsl(var(--secondary))] to-[hsl(var(--coral-beige))] rounded-full blur-xl opacity-40 animate-pulse animation-delay-2000"></div>

            {/* Glassmorphism Frame */}
            <div className="relative p-2 rounded-3xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-[hsl(var(--border))] shadow-[var(--shadow-elegant)] hover:shadow-2xl transition-all duration-500">
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src={styleHero}
                  alt="Elegant woman in brown wrap dress"
                  className="w-full h-[700px] lg:h-[800px] object-cover transform transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                  fetchPriority="high"
                />
                {/* Enhanced Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary))]/30 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary))]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Vertical Text with Glassmorphism */}
                <div className="absolute left-6 top-1/2 -translate-y-1/2">
                  <div className="writing-mode-vertical-rl text-orientation-mixed">
                    <div className="px-4 py-6 rounded-2xl bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/40 dark:border-white/10">
                      <h2 className="text-white font-black text-lg lg:text-xl tracking-[0.3em] whitespace-nowrap drop-shadow-lg">
                        EXPLORE NEW AND POPULAR STYLES
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Floating Badge */}
                <motion.div
                 
                  className="absolute top-6 right-6 px-4 py-2 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-md border border-white/60 dark:border-white/20 shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[hsl(var(--primary))]" />
                    <span className="text-sm font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent">
                      Curated
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[hsl(var(--coral-warm))] rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[hsl(var(--secondary))] rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </motion.div>

          {/* Grid of Thumbnails with Enhanced Cards */}
          <div className="grid grid-cols-2 gap-4 lg:gap-6 order-1 lg:order-2">
            {gridImages.map((image, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
              
                className="relative group cursor-pointer"
              >
                {/* Glassmorphism Card */}
                <div className="relative p-2 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-[hsl(var(--border))] shadow-lg hover:shadow-[var(--shadow-elegant)] transition-all duration-300 hover:scale-105">
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-48 lg:h-[350px] object-cover transform transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      fetchPriority="auto"
                    />
                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary))]/60 via-[hsl(var(--primary))]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Sale Badge */}
                    {image.sale && (
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
                        className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-white text-xs font-bold shadow-lg flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" />
                        SALE
                      </motion.div>
                    )}

                    {/* Tag Badge */}
                    <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-md border border-white/60 dark:border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3 text-[hsl(var(--coral-warm))]" />
                        <span className="text-xs font-semibold text-[hsl(var(--foreground))]">
                          {image.tag}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Shine Effect */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
};

export default ExploreStyles;
