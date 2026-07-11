import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, Calendar, FileText, ShieldCheck, Key, ArrowRight, Sparkles } from "lucide-react";
import { PROCESS_STEPS } from "../data";
import { ProcessStep } from "../types";

interface ProcessTimelineProps {
  title: string;
  subtitle: string;
  steps?: ProcessStep[];
  isAdminLoggedIn?: boolean;
  onEditSectionClick?: () => void;
  onEditStepsClick?: () => void;
}

export const ProcessTimeline: React.FC<ProcessTimelineProps> = ({
  title,
  subtitle,
  steps = PROCESS_STEPS,
  isAdminLoggedIn,
  onEditSectionClick,
  onEditStepsClick,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const getIcon = (iconName: string, isActive: boolean) => {
    const classes = `w-6 h-6 transition-colors duration-300 ${
      isActive ? "text-brand-green" : "text-gray-400"
    }`;
    switch (iconName) {
      case "Search":
        return <Search className={classes} />;
      case "Calendar":
        return <Calendar className={classes} />;
      case "FileText":
        return <FileText className={classes} />;
      case "ShieldCheck":
        return <ShieldCheck className={classes} />;
      case "Key":
        return <Key className={classes} />;
      default:
        return <Search className={classes} />;
    }
  };

  return (
    <section className="bg-slate-50 text-brand-bg py-24 md:py-32 relative overflow-hidden" id="process-section">
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <span className="text-xs font-bold text-brand-green bg-brand-green/10 px-3 py-1.5 rounded-full uppercase tracking-wider inline-block mb-3">
            Simplicidad radical
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
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); onEditSectionClick?.(); }}
                className="inline-flex items-center gap-1.5 bg-brand-green/10 text-brand-green border border-brand-green/20 hover:bg-brand-green hover:text-brand-bg px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm group"
              >
                <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                <span>Editar Título/Subtítulo</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onEditStepsClick?.(); }}
                className="inline-flex items-center gap-1.5 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm group"
              >
                <FileText className="w-3.5 h-3.5 text-brand-green" />
                <span>Editar Pasos de la Guía</span>
              </button>
            </div>
          )}
        </div>

        {/* Horizontal Timeline (Desktop/Tablet) */}
        <div className="hidden md:block relative mb-12">
          {/* Connector Line */}
          <div className="absolute top-[39px] left-[5%] right-[5%] h-0.5 bg-gray-200 z-0">
            {/* Animated active progress line */}
            <motion.div 
              className="h-full bg-brand-green shadow-[0_0_10px_rgba(59,227,122,0.5)]"
              initial={{ width: "0%" }}
              whileInView={{ width: `${((activeStep - 1) / (steps.length - 1 || 1)) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>

          <div className="grid grid-cols-5 gap-4 relative z-10">
            {steps.map((step) => {
              const isActive = activeStep === step.number;
              const isPast = activeStep > step.number;
              return (
                <div 
                  key={step.number} 
                  className="flex flex-col items-center text-center cursor-pointer group"
                  onClick={() => setActiveStep(step.number)}
                >
                  {/* Step Bubble Indicator */}
                  <motion.div
                    className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative ${
                      isActive 
                        ? "bg-[#080A0F] border-brand-green shadow-xl scale-110" 
                        : isPast 
                          ? "bg-[#080A0F] border-[#080A0F]" 
                          : "bg-white border-gray-200 hover:border-gray-400"
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {/* Circle Step Number */}
                    <span className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      isActive 
                        ? "bg-brand-green text-brand-bg font-extrabold shadow-md"
                        : isPast
                          ? "bg-brand-green text-brand-bg font-extrabold"
                          : "bg-gray-100 text-gray-400 border border-gray-200"
                    }`}>
                      {step.number}
                    </span>

                    {/* Step Icon */}
                    {getIcon(step.iconName, isActive || isPast)}
                  </motion.div>

                  {/* Step Label */}
                  <h3 className={`mt-5 text-base font-bold transition-colors ${
                    isActive ? "text-brand-green" : "text-brand-bg"
                  }`}>
                    {step.title}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Detail Card for Active Step (Desktop/Tablet) */}
        {steps[activeStep - 1] && (
          <div className="hidden md:block">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white border border-gray-100 rounded-[24px] p-8 max-w-3xl mx-auto shadow-sm text-left flex gap-6 items-center"
            >
              <div className="p-5 bg-slate-50 border border-gray-100 rounded-2xl text-brand-bg shrink-0">
                {getIcon(steps[activeStep - 1].iconName, true)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-brand-green bg-brand-green/10 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                    Paso {activeStep} de {steps.length}
                  </span>
                  <span className="text-xs text-gray-400 font-semibold">
                    Respaldo HAVN
                  </span>
                </div>
                <h4 className="text-xl font-extrabold text-[#080A0F] font-sans">
                  {steps[activeStep - 1].title}
                </h4>
                <p className="mt-2 text-sm text-gray-500 font-medium leading-relaxed">
                  {steps[activeStep - 1].description}
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Vertical Timeline (Mobile only) */}
        <div className="block md:hidden space-y-6">
          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white border border-gray-100 rounded-[20px] p-5 flex gap-4 items-start shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-[#080A0F] flex items-center justify-center text-white font-bold text-base shrink-0 border border-brand-green relative">
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-green text-brand-bg text-[9px] font-extrabold rounded-full flex items-center justify-center">
                  {step.number}
                </span>
                {getIcon(step.iconName, true)}
              </div>
              <div>
                <h4 className="text-base font-bold text-[#080A0F]">
                  {step.title}
                </h4>
                <p className="mt-1 text-xs text-gray-500 font-medium leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
