import React from "react";
import { motion } from "motion/react";
import { Sparkles, Clock, DollarSign, ArrowRight } from "lucide-react";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { FLIP_DATA } from "../data";

interface HavnFlipSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  detailedDescription?: string;
  time?: string;
  valueInc?: string;
  beforeImage?: string;
  afterImage?: string;
  isAdminLoggedIn?: boolean;
  onEditSectionClick?: () => void;
}

export const HavnFlipSection: React.FC<HavnFlipSectionProps> = ({
  title = "Havn Flip",
  subtitle = "Inversión Inteligente",
  description = "Adquirimos propiedades en ubicaciones clave con potencial de revalorización, las transformamos con diseño arquitectónico moderno de alta gama en tiempo récord, y las reintroducimos al mercado.",
  detailedDescription = "",
  time = FLIP_DATA.time,
  valueInc = FLIP_DATA.valueInc,
  beforeImage = FLIP_DATA.beforeImage,
  afterImage = FLIP_DATA.afterImage,
  isAdminLoggedIn,
  onEditSectionClick,
}) => {
  return (
    <section className="bg-brand-bg text-white py-24 md:py-32 relative overflow-hidden" id="havn-flip-section">
      {/* Decorative background ambient glows */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-brand-green/10 rounded-full blur-[120px] pointer-events-none translate-x-1/3" />
      <div className="absolute bottom-12 left-10 w-[400px] h-[400px] bg-brand-green/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT: Copy & Performance Metrics */}
          <div className="lg:col-span-5 text-left">
            <span className="text-xs font-bold text-brand-green bg-brand-green/10 px-3 py-1.5 rounded-full uppercase tracking-wider inline-block mb-3">
              {subtitle}
            </span>
            <h2 
              className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {title}
            </h2>
            <p className="mt-4 text-base md:text-lg text-gray-400 font-medium leading-relaxed">
              {description}
            </p>
             {detailedDescription && (
              <p className="mt-3 text-sm text-gray-500 leading-relaxed font-medium">
                {detailedDescription}
              </p>
            )}

            {/* Indicators Grid */}
            <div className="grid grid-cols-2 gap-4 mt-10">
              {/* Metric 1 */}
              <div className="glass border-white/5 rounded-2xl p-4 text-center">
                <div className="text-brand-green mb-2 flex justify-center">
                  <Clock className="w-5 h-5 text-brand-green" />
                </div>
                <span className="text-2xl md:text-3xl font-extrabold tracking-tight block text-white">
                  {time}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 block">
                  Plazo de Ejecución
                </span>
              </div>

              {/* Metric 2 */}
              <div className="glass border-white/5 rounded-2xl p-4 text-center">
                <div className="text-brand-green mb-2 flex justify-center">
                  <DollarSign className="w-5 h-5 text-brand-green" />
                </div>
                <span className="text-2xl md:text-3xl font-extrabold tracking-tight block text-white">
                  {valueInc}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 block">
                  Aumento de valor
                </span>
              </div>
            </div>

            {isAdminLoggedIn && (
              <div className="mt-6">
                <button
                  onClick={(e) => { e.stopPropagation(); onEditSectionClick?.(); }}
                  className="inline-flex items-center gap-1.5 bg-brand-green/10 text-brand-green border border-brand-green/20 hover:bg-brand-green hover:text-brand-bg px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm group"
                >
                  <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                  <span>Editar Textos, Datos e Imágenes (Havn Flip)</span>
                </button>
              </div>
            )}

            <button
              onClick={() => {
                const el = document.getElementById("contact-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-8 px-6 py-3.5 rounded-xl bg-white text-brand-bg hover:bg-brand-green hover:shadow-[0_0_20px_rgba(59,227,122,0.4)] transition-all font-bold text-sm flex items-center gap-2 group cursor-pointer"
            >
              Participar como inversionista
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* RIGHT: Interactive Before/After Reveal Slider */}
          <div className="lg:col-span-7 w-full">
            <BeforeAfterSlider
              beforeImage={beforeImage}
              afterImage={afterImage}
            />
          </div>

        </div>

      </div>
    </section>
  );
};
