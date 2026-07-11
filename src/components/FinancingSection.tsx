import React from "react";
import { motion } from "motion/react";
import { Landmark, Coins, ShieldCheck, Sparkles } from "lucide-react";
import { FinancingSimulator } from "./FinancingSimulator";
import { FinancingService } from "../types";

interface FinancingSectionProps {
  title?: string;
  subtitle?: string;
  services?: FinancingService[];
  isAdminLoggedIn?: boolean;
  onEditSectionClick?: () => void;
  simulatorNoticeText?: string;
}

export const FinancingSection: React.FC<FinancingSectionProps> = ({
  title = "Servicios Financieros HAVN",
  subtitle = "Hacemos que el financiamiento sea tan simple como elegir una casa. Tasas competitivas, aprobación digital inmediata y asesoría personalizada.",
  services = [],
  isAdminLoggedIn,
  onEditSectionClick,
  simulatorNoticeText,
}) => {
  const getServiceIcon = (index: number) => {
    if (index === 0) return <Landmark className="w-6 h-6 stroke-[1.5]" />;
    if (index === 1) return <ShieldCheck className="w-6 h-6 stroke-[1.5]" />;
    return <Coins className="w-6 h-6 stroke-[1.5]" />;
  };

  return (
    <section className="bg-slate-50 text-brand-bg py-24 md:py-32 relative overflow-hidden" id="financing-section">
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <span className="text-xs font-bold text-brand-green bg-brand-green/10 px-3 py-1.5 rounded-full uppercase tracking-wider inline-block mb-3">
            Financiamiento Flexible
          </span>
          <h2 
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#080A0F]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {title}
          </h2>
          <p className="mt-4 text-base md:text-lg text-gray-500 font-medium">
            {subtitle}
          </p>
          {isAdminLoggedIn && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={(e) => { e.stopPropagation(); onEditSectionClick?.(); }}
                className="inline-flex items-center gap-1.5 bg-brand-green/10 text-brand-green border border-brand-green/20 hover:bg-brand-green hover:text-brand-bg px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm group"
              >
                <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                <span>Editar Servicios Financieros</span>
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mb-16 max-w-4xl mx-auto">
          {services.map((service, index) => {
            const isDark = service.isDark;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={isDark 
                  ? "bg-[#0b1017] border border-white/5 rounded-[24px] p-6 md:p-8 flex flex-col justify-between hover:shadow-xl hover:border-brand-green/30 transition-all group relative overflow-hidden"
                  : "bg-white border border-gray-100 rounded-[24px] p-6 md:p-8 flex flex-col justify-between hover:shadow-xl transition-all group"
                }
              >
                {isDark && <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 rounded-full blur-[40px]" />}
                
                <div className="relative z-10">
                  <div className={isDark 
                    ? "p-4 bg-white/5 text-brand-green w-fit rounded-2xl border border-white/5 transition-colors duration-300 mb-6"
                    : "p-4 bg-slate-50 text-[#080A0F] group-hover:text-brand-green w-fit rounded-2xl border border-gray-100 transition-colors duration-300 mb-6"
                  }>
                    {getServiceIcon(index)}
                  </div>
                  <h3 className={isDark ? "text-xl font-bold text-white font-sans mb-3" : "text-xl font-bold text-brand-bg font-sans mb-3"}>
                    {service.title}
                  </h3>
                  <p className={isDark ? "text-xs text-brand-green font-bold uppercase tracking-wider mb-4 block" : "text-xs text-gray-400 font-bold uppercase tracking-wider mb-4 block"}>
                    {service.badge}
                  </p>
                  <p className={isDark ? "text-sm text-gray-400 leading-relaxed font-medium" : "text-sm text-gray-500 leading-relaxed font-medium"}>
                    {service.description}
                  </p>
                </div>
                <div className={isDark 
                  ? "mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-white group-hover:text-brand-green transition-colors relative z-10"
                  : "mt-8 pt-4 border-t border-gray-50 flex items-center justify-between text-xs font-bold text-brand-bg group-hover:text-brand-green transition-colors"
                }>
                  <span>{service.buttonText || "Saber más"}</span>
                  <span className={isDark 
                    ? "p-1 rounded-full bg-white/5 group-hover:bg-brand-green/20 text-white group-hover:text-brand-green transition-all"
                    : "p-1 rounded-full bg-slate-100 group-hover:bg-brand-green/20 text-[#080A0F] group-hover:text-brand-green transition-all"
                  }>&rarr;</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Embedded Interactive Mortgage Simulator Component */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7 }}
          className="text-white mt-12"
        >
          <FinancingSimulator noticeText={simulatorNoticeText} />
        </motion.div>

      </div>
    </section>
  );
};
