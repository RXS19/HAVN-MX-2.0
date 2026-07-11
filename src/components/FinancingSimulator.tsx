import React, { useState } from "react";
import { motion } from "motion/react";
import { Calculator, ShieldCheck, Landmark, DollarSign, ArrowRight } from "lucide-react";

interface FinancingSimulatorProps {
  noticeText?: string;
}

export const FinancingSimulator: React.FC<FinancingSimulatorProps> = ({
  noticeText = "Tasa establecida por el proveedor final",
}) => {
  const [propertyValue, setPropertyValue] = useState(16800000); // default: 16.8M MXN
  const [downPaymentPercent, setDownPaymentPercent] = useState(20); // default: 20%
  const [termYears, setTermYears] = useState(20); // default: 20 years
  const [interestRate, setInterestRate] = useState(10.5); // default: 10.5% (Mexican average)

  // Calculations
  const downPaymentAmount = propertyValue * (downPaymentPercent / 100);
  const loanAmount = propertyValue - downPaymentAmount;
  
  // Monthly interest rate
  const r = (interestRate / 100) / 12;
  // Number of payments
  const n = termYears * 12;
  // PMT formula: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
  const monthlyPayment = r > 0 
    ? loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    : loanAmount / n;

  // Minimum required monthly income (typically monthly payment should not exceed 33% of income)
  const requiredIncome = monthlyPayment * 3;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="glass rounded-[24px] p-6 md:p-8 relative overflow-hidden" id="simulator-card">
      {/* Decorative gradient glowing blob */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-brand-green/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20" />

      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-brand-green/10 text-brand-green">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-xl font-bold text-white">Simulador de Financiamiento</h4>
          <p className="text-sm text-gray-400">Diseña tu plan de financiamiento a la medida en segundos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Sliders Form */}
        <div className="space-y-6">
          {/* Property Value */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <label className="text-gray-300 font-medium">Valor de la Propiedad</label>
              <span className="text-brand-green font-bold text-base">
                {formatCurrency(propertyValue)}
              </span>
            </div>
            <input
              type="range"
              min={1000000}
              max={20000000}
              step={500000}
              value={propertyValue}
              onChange={(e) => setPropertyValue(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-brand-green"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>$1M MXN</span>
              <span>$10M MXN</span>
              <span>$20M MXN</span>
            </div>
          </div>

          {/* Down Payment (Enganche) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <label className="text-gray-300 font-medium">Enganche ({downPaymentPercent}%)</label>
              <span className="text-white font-semibold">
                {formatCurrency(downPaymentAmount)}
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              step={5}
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-brand-green"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>10% (Min)</span>
              <span>30%</span>
              <span>50% (Max)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Plazo (Term) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <label className="text-gray-300 font-medium">Plazo</label>
                <span className="text-white font-semibold">{termYears} años</span>
              </div>
              <select
                value={termYears}
                onChange={(e) => setTermYears(Number(e.target.value))}
                className="w-full bg-brand-bg/80 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-green/50 transition-colors cursor-pointer"
              >
                <option value={5}>5 años</option>
                <option value={10}>10 años</option>
                <option value={15}>15 años</option>
                <option value={20}>20 años</option>
                <option value={30}>30 años</option>
              </select>
            </div>

            {/* Tasa de interés */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <label className="text-gray-300 font-medium">Tasa de Interés</label>
                <span className="text-white font-semibold">{interestRate}%</span>
              </div>
              <select
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full bg-brand-bg/80 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-green/50 transition-colors cursor-pointer"
              >
                <option value={8.5}>8.5% (Tasa Preferencial)</option>
                <option value={9.5}>9.5% (Excelente)</option>
                <option value={10.5}>10.5% (Mercado promedio)</option>
                <option value={11.5}>11.5% (Estándar)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Payment Breakdown Card */}
        <div className="bg-[#151b24] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-full relative">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                Pago Mensual Estimado
              </p>
              <h5 className="text-3xl md:text-4xl font-extrabold text-brand-green tracking-tight">
                {formatCurrency(monthlyPayment)}
                <span className="text-sm font-normal text-gray-400 ml-1">/ mes</span>
              </h5>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Monto del crédito:</span>
                <span className="text-white font-medium">{formatCurrency(loanAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Enganche requerido:</span>
                <span className="text-white font-medium">{formatCurrency(downPaymentAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Ingreso mensual sugerido:</span>
                <span className="text-white font-medium">{formatCurrency(requiredIncome)}</span>
              </div>
            </div>

            <div className="bg-brand-bg/40 rounded-xl p-3 border border-white/5 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-400 leading-relaxed">
                {noticeText}
              </p>
            </div>
          </div>

          <button
            className="w-full mt-6 py-3 px-4 rounded-xl bg-brand-green hover:bg-brand-green/90 text-brand-bg font-bold text-sm transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(59,227,122,0.3)] group cursor-pointer"
            onClick={() => {
              const el = document.getElementById("contact-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Pre-aprobar mi crédito
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
