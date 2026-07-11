import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Building2, TrendingUp, Sparkles, PieChart, ChevronDown, ChevronUp, CheckCircle, RefreshCw } from "lucide-react";
import { HAVN_FEATURES } from "../data";
import { HavnFeature } from "../types";

interface WhyHavnProps {
  title: string;
  subtitle: string;
  badge?: string;
  features?: HavnFeature[];
  isAdminLoggedIn?: boolean;
  onEditSectionClick?: () => void;
  onEditBenefitsClick?: () => void;
}

export const WhyHavn: React.FC<WhyHavnProps> = ({
  title,
  subtitle,
  badge = "El Futuro PropTech",
  features = HAVN_FEATURES,
  isAdminLoggedIn,
  onEditSectionClick,
  onEditBenefitsClick,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Building2":
        return <Building2 className="w-8 h-8 stroke-[1.25]" />;
      case "TrendingUp":
        return <TrendingUp className="w-8 h-8 stroke-[1.25]" />;
      case "Sparkles":
        return <Sparkles className="w-8 h-8 stroke-[1.25]" />;
      case "RefreshCw":
        return <RefreshCw className="w-8 h-8 stroke-[1.25]" />;
      case "PieChart":
        return <PieChart className="w-8 h-8 stroke-[1.25]" />;
      default:
        return <Building2 className="w-8 h-8 stroke-[1.25]" />;
    }
  };

  return (
    <section className="bg-brand-bg text-white py-24 md:py-32 relative overflow-hidden" id="why-havn-section">
      {/* Decorative ambient background glows */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-12 right-1/4 w-[400px] h-[400px] bg-brand-green/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-bold text-brand-green bg-brand-green/10 px-3 py-1.5 rounded-full uppercase tracking-wider inline-block mb-3">
            {badge}
          </span>
          <h2 
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {title}
          </h2>
          <p className="mt-4 text-base md:text-lg text-gray-400 font-medium">
            {subtitle}
          </p>
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
                onClick={(e) => { e.stopPropagation(); onEditBenefitsClick?.(); }}
                className="inline-flex items-center gap-1.5 bg-white/5 text-white border border-white/10 hover:bg-white/15 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm group"
              >
                <Building2 className="w-3.5 h-3.5 text-brand-green" />
                <span>Editar Beneficios</span>
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Cards Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${
          features.length === 3 ? "lg:grid-cols-3 max-w-6xl" :
          features.length === 2 ? "lg:grid-cols-2 max-w-3xl" :
          features.length === 1 ? "lg:grid-cols-1 max-w-md" :
          "lg:grid-cols-4"
        } mx-auto gap-6 items-start`}>
          {features.map((feat) => {
            const isExpanded = expandedId === feat.id;
            return (
              <motion.div
                key={feat.id}
                layout
                onClick={() => toggleExpand(feat.id)}
                className={`glass hover:border-brand-green/40 rounded-[24px] p-6 transition-all duration-300 cursor-pointer relative overflow-hidden group hover:shadow-[0_0_30px_rgba(59,227,122,0.1)] ${
                  isExpanded ? "ring-1 ring-brand-green/50 bg-[#151a24]" : ""
                }`}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Outline Icon */}
                <div className="text-brand-green mb-6 p-4 bg-white/5 w-fit rounded-2xl border border-white/5 group-hover:bg-brand-green/10 group-hover:border-brand-green/20 transition-all duration-300">
                  {getIcon(feat.iconName)}
                </div>

                <h3 
                  className="text-xl font-bold mb-2.5 text-white flex items-center gap-2"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {feat.title}
                </h3>
                
                <p className="text-sm text-gray-400 leading-relaxed font-medium mb-4">
                  {feat.description}
                </p>

                {/* Microinteraction Expand Indicator */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-green/80 group-hover:text-brand-green transition-colors mt-2">
                  <span>{isExpanded ? "Cerrar detalles" : "Ver detalles"}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
                  )}
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden mt-4 pt-4 border-t border-white/10"
                      onClick={(e) => e.stopPropagation()} // prevent double toggles
                    >
                      <p className="text-xs text-gray-300 leading-relaxed mb-4">
                        {feat.detailedDesc}
                      </p>
                      
                      <div className="space-y-2">
                        {feat.bullet1 && (
                          <div className="flex items-center gap-2 text-[11px] text-gray-300 font-semibold">
                            <CheckCircle className="w-3.5 h-3.5 text-brand-green" />
                            <span>{feat.bullet1}</span>
                          </div>
                        )}
                        {feat.bullet2 && (
                          <div className="flex items-center gap-2 text-[11px] text-gray-300 font-semibold">
                            <CheckCircle className="w-3.5 h-3.5 text-brand-green" />
                            <span>{feat.bullet2}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
