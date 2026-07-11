import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, ChevronLeft, ChevronRight, Quote, Sparkles } from "lucide-react";
import { TESTIMONIALS } from "../data";
import { Testimonial } from "../types";

interface TestimonialsCarouselProps {
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
  isAdminLoggedIn?: boolean;
  onEditSectionClick?: () => void;
  onEditTestimonialsClick?: () => void;
}

export const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({
  title = "Nuestros clientes, nuestro mayor orgullo",
  subtitle = "Opinión de Clientes",
  testimonials = TESTIMONIALS,
  isAdminLoggedIn,
  onEditSectionClick,
  onEditTestimonialsClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // If testimonials change, make sure currentIndex is bounded
  useEffect(() => {
    if (currentIndex >= testimonials.length) {
      setCurrentIndex(0);
    }
  }, [testimonials, currentIndex]);

  const slideNext = () => {
    if (testimonials.length === 0) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const slidePrev = () => {
    if (testimonials.length === 0) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Autoplay loop
  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(slideNext, 6000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, []);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 150 : -150,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 150 : -150,
      opacity: 0,
    }),
  };

  return (
    <section className="bg-brand-bg text-white py-24 md:py-32 relative overflow-hidden" id="testimonials-section">
      {/* Decorative background glows */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-brand-green/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-brand-green/10 rounded-full blur-[150px] pointer-events-none translate-y-1/2" />

      <div className="max-w-4xl mx-auto px-6 md:px-8 relative z-10 text-center">
        
        {/* Header */}
        <div className="mb-16">
          <span className="text-xs font-bold text-brand-green bg-brand-green/10 px-3 py-1.5 rounded-full uppercase tracking-wider inline-block mb-3">
            {subtitle}
          </span>
          <h2 
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {title}
          </h2>
          {isAdminLoggedIn && (
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); onEditSectionClick?.(); }}
                className="inline-flex items-center gap-1.5 bg-brand-green/10 text-brand-green border border-brand-green/20 hover:bg-brand-green hover:text-brand-bg px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm group"
              >
                <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                <span>Editar Título/Subtítulo</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onEditTestimonialsClick?.(); }}
                className="inline-flex items-center gap-1.5 bg-white/5 text-white border border-white/10 hover:bg-white/15 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm group"
              >
                <Quote className="w-3 h-3 text-brand-green" />
                <span>Editar Testimonios</span>
              </button>
            </div>
          )}
        </div>

        {/* Testimonials Frame */}
        {testimonials.length > 0 ? (
          <div 
            className="relative min-h-[380px] md:min-h-[300px] flex items-center justify-center"
            onMouseEnter={stopTimer}
            onMouseLeave={startTimer}
          >
            {/* Big quotes icon background */}
            <div className="absolute top-0 left-4 text-white/5 pointer-events-none select-none">
              <Quote className="w-28 h-28 transform scale-x-[-1]" />
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="glass border-white/5 rounded-[32px] p-6 md:p-10 text-left relative z-10 shadow-2xl backdrop-blur-md max-w-3xl w-full"
              >
                {/* Star rating */}
                <div className="flex items-center gap-1 text-brand-green mb-6">
                  {[...Array(testimonials[currentIndex]?.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                {/* Review Comment */}
                <p className="text-base md:text-lg text-gray-200 leading-relaxed font-medium mb-8">
                  “{testimonials[currentIndex]?.comment}”
                </p>

                {/* Author Info */}
                <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonials[currentIndex]?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"}
                      alt={testimonials[currentIndex]?.name}
                      className="w-12 h-12 rounded-full object-cover border border-white/10"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {testimonials[currentIndex]?.name}
                      </h4>
                      <p className="text-xs text-gray-400 font-medium">
                        {testimonials[currentIndex]?.role}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold bg-white/5 text-brand-green px-3 py-1 rounded-full border border-white/5">
                    {testimonials[currentIndex]?.location}, México
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div className="glass border-white/5 rounded-[32px] p-12 text-center text-gray-400">
            No hay testimonios configurados. Agrega testimonios desde el panel de Súper Admin.
          </div>
        )}

        {/* Carousel controls */}
        {testimonials.length > 0 && (
          <div className="flex items-center justify-center gap-6 mt-10">
            <button
              onClick={slidePrev}
              className="p-3 rounded-full glass border-white/10 hover:border-brand-green/30 text-white hover:text-brand-green transition-all transform hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Previous Testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots Indicator */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > currentIndex ? 1 : -1);
                    setCurrentIndex(i);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === i ? "w-6 bg-brand-green" : "w-2 bg-white/20 hover:bg-white/45"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={slideNext}
              className="p-3 rounded-full glass border-white/10 hover:border-brand-green/30 text-white hover:text-brand-green transition-all transform hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Next Testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
