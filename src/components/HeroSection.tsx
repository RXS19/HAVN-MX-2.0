import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Star, Heart, MapPin, Sparkles } from "lucide-react";

interface HeroSectionProps {
  onBuyClick: () => void;
  onSellClick: () => void;
  title1: string;
  titleGreen1: string;
  title2: string;
  titleGreen2: string;
  subtitle: string;
  image?: string;
  isAdminLoggedIn?: boolean;
  onEditClick?: () => void;
  stat1Value?: string;
  stat1Label?: string;
  stat2Value?: string;
  stat2Label?: string;
  stat3Value?: string;
  stat3Label?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onBuyClick,
  onSellClick,
  title1,
  titleGreen1,
  title2,
  titleGreen2,
  subtitle,
  image = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  isAdminLoggedIn,
  onEditClick,
  stat1Value = "0%",
  stat1Label = "Burocracia / 100% Digital",
  stat2Value = "+$500M",
  stat2Label = "Pesos transaccionados",
  stat3Value = "< 10 días",
  stat3Label = "Cierre promedio de venta",
}) => {
  // Staggered float motion variations for the cards
  const floatTransition = (duration: number, delay: number) => ({
    y: {
      duration: duration,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut",
      delay: delay,
    },
    opacity: {
      duration: 0.8,
      delay: delay * 0.5,
    },
  });

  return (
    <section className="relative min-h-screen bg-brand-bg pt-28 md:pt-36 flex flex-col justify-between overflow-hidden">
      {/* Absolute decorative ambient light rings */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-brand-green/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 z-10" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-brand-green/5 rounded-full blur-[150px] pointer-events-none translate-x-1/3 z-10" />

      {/* Background integrated image on the right with custom green and dark gradients */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0">
        {/* Image aligned on the right on desktop, full-screen on mobile */}
        <motion.img
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.55, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          src={image}
          alt="HAVN background"
          className="absolute right-0 top-0 w-full lg:w-[60%] h-full object-cover object-center filter brightness-[0.75] contrast-[1.05] z-0"
          referrerPolicy="no-referrer"
        />

        {/* Desktop Seamless Horizontal Blending */}
        {/* 1. Solid background cover on the left (text area) to guarantee perfect readability */}
        <div className="hidden lg:block absolute inset-y-0 left-0 w-[45%] bg-[#080A0F] z-10" />
        {/* 2. Linear gradient fade transitioning from solid background to transparent over the image */}
        <div className="hidden lg:block absolute inset-y-0 left-[45%] w-[30%] bg-gradient-to-r from-[#080A0F] to-transparent z-10" />

        {/* Mobile & Tablet Full Coverage Overlay to ensure 100% text readability */}
        <div className="absolute inset-0 bg-[#080A0F]/85 lg:hidden z-10" />

        {/* Universal Top & Bottom Fades to merge seamlessly with Navbar and the lower wave transition */}
        <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-[#080A0F] via-[#080A0F]/30 to-transparent z-10" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#080A0F] via-[#080A0F]/80 to-transparent z-10" />
        
        {/* Sophisticated Green Gradient Accents for the ultimate premium brand integration */}
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-green/25 via-brand-green/5 to-transparent mix-blend-color-dodge z-10 opacity-80" />
        <div className="absolute inset-0 bg-brand-green/[0.04] mix-blend-overlay z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-green/[0.06] via-transparent to-transparent mix-blend-color z-10 opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-20 pb-20 md:pb-28">
        {/* Left column: Hero copy and CTAs */}
        <div className="lg:col-span-6 flex flex-col justify-center text-left">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-6xl lg:text-[68px] font-extrabold leading-[1.05] tracking-tight text-white font-sans"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {title1} {titleGreen1 && <span className="text-brand-green filter drop-shadow-[0_0_15px_rgba(59,227,122,0.15)]">{titleGreen1}</span>} <br />
            {title2} {titleGreen2 && <span className="text-brand-green filter drop-shadow-[0_0_15px_rgba(59,227,122,0.15)]">{titleGreen2}</span>}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mt-6 text-lg md:text-xl text-gray-300 leading-relaxed max-w-xl font-medium"
          >
            {subtitle}
          </motion.p>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
          >
            <button
              onClick={onBuyClick}
              className="px-8 py-4 rounded-xl bg-brand-green text-brand-bg font-bold text-base transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,227,122,0.5)] transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group cursor-pointer"
            >
              Comprar propiedad
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={onSellClick}
              className="px-8 py-4 rounded-xl glass hover:bg-white/10 text-white font-semibold text-base border border-white/10 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              Vender propiedad
            </button>
          </motion.div>

          {isAdminLoggedIn && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-left"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClick?.();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-brand-green/20 text-brand-green hover:bg-brand-green hover:text-brand-bg border border-brand-green/40 rounded-xl transition-all cursor-pointer shadow-md group"
              >
                <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                <span>Editar Hero (Textos e Imagen)</span>
              </button>
            </motion.div>
          )}

          {/* Bottom subtle metadata */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 pt-8 border-t border-white/5 flex flex-wrap items-center gap-x-8 gap-y-4"
          >
            <div>
              <span className="text-2xl font-bold text-white block">{stat1Value}</span>
              <span className="text-xs text-gray-400 font-medium">{stat1Label}</span>
            </div>
            <div className="w-px h-8 bg-white/10 hidden sm:block" />
            <div>
              <span className="text-2xl font-bold text-white block">{stat2Value}</span>
              <span className="text-xs text-gray-400 font-medium">{stat2Label}</span>
            </div>
            <div className="w-px h-8 bg-white/10 hidden sm:block" />
            <div>
              <span className="text-2xl font-bold text-white block">{stat3Value}</span>
              <span className="text-xs text-gray-400 font-medium">{stat3Label}</span>
            </div>
          </motion.div>
        </div>

        {/* Right column: Interactive Lifestyle Visuals & Floating Cards */}
        <div className="lg:col-span-6 relative w-full h-[500px] md:h-[600px] flex items-center justify-center">
          {/* Subtle green ambient circular glow behind the cards */}
          <div className="absolute w-[280px] h-[280px] bg-brand-green/15 rounded-full blur-[80px] pointer-events-none z-10" />

          {/* Floating Card 1: Left Top */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ y: [0, -10, 0] }}
            transition={floatTransition(4.5, 0.2)}
            className="absolute left-[-5%] top-[10%] z-20 w-[180px] md:w-[220px] glass rounded-2xl p-3 shadow-xl backdrop-blur-md hover:scale-105 transition-transform duration-300 group"
          >
            <div className="relative h-24 md:h-28 rounded-xl overflow-hidden mb-2.5">
              <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-green text-brand-bg flex items-center gap-0.5 shadow-sm">
                Nueva
              </span>
              <img
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80"
                alt="Propiedad 1"
                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-brand-green mb-0.5">Roma Norte</p>
            <h4 className="text-xs md:text-sm font-bold text-white truncate">Loft Orizaba</h4>
            <div className="flex justify-between items-center mt-1 pt-1 border-t border-white/5">
              <span className="text-[11px] md:text-xs font-bold text-white">$8,900,000 MXN</span>
              <Heart className="w-3.5 h-3.5 text-white/40 group-hover:text-red-500 transition-colors" />
            </div>
          </motion.div>

          {/* Floating Card 2: Right Top */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ y: [0, -12, 0] }}
            transition={floatTransition(5.2, 0.8)}
            className="absolute right-[-2%] top-[25%] z-20 w-[170px] md:w-[200px] glass rounded-2xl p-3 shadow-xl backdrop-blur-md hover:scale-105 transition-transform duration-300 group"
          >
            <div className="relative h-20 md:h-24 rounded-xl overflow-hidden mb-2">
              <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-green text-brand-bg shadow-sm">
                Nueva
              </span>
              <img
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80"
                alt="Propiedad 2"
                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-[9px] uppercase font-bold tracking-widest text-brand-green mb-0.5">San Ángel</p>
            <h4 className="text-xs font-bold text-white truncate">Casa del Parque</h4>
            <div className="flex justify-between items-center mt-1 pt-1 border-t border-white/5">
              <span className="text-[10px] md:text-xs font-bold text-white">$24,500,000 MXN</span>
              <Heart className="w-3 h-3 text-white/40 group-hover:text-red-500 transition-colors" />
            </div>
          </motion.div>

          {/* Floating Card 3: Left Bottom Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ y: [0, -8, 0] }}
            transition={floatTransition(4.8, 1.4)}
            className="absolute left-[5%] bottom-[-5%] z-30 w-[240px] md:w-[280px] glass rounded-2xl p-4 shadow-2xl backdrop-blur-md border border-white/15"
          >
            <div className="flex items-center gap-1 text-amber-400 mb-1.5">
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <p className="text-xs text-white/90 leading-relaxed font-medium italic">
              “HAVN hizo nuestro proceso increíblemente sencillo.”
            </p>
            <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-white/5">
              <span className="text-[11px] font-semibold text-white">— Familia Pérez</span>
              <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded-full text-white/60">CDMX</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modern, organic bottom wave transition (Apple design style) */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-30 translate-y-[2px]">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-[35px] md:h-[65px] text-white"
          fill="currentColor"
        >
          <path d="M0,0 C300,90 900,90 1200,0 L1200,120 L0,120 Z"></path>
        </svg>
      </div>
    </section>
  );
};
