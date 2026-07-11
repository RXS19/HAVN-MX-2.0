import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Check, Phone, Mail, User, Landmark, Building2, Sparkles, ArrowRight, MessageSquare } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

interface ContactFormProps {
  title?: string;
  subtitle?: string;
  isAdminLoggedIn?: boolean;
  onEditSectionClick?: () => void;
  consentText?: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  title = "Comienza tu próximo capítulo hoy",
  subtitle = "Ya sea que busques adquirir tu próximo hogar de ensueño en Polanco, o busques una venta acelerada respaldada por liquidez inmediata, nuestro equipo te guiará con la máxima eficiencia.",
  isAdminLoggedIn,
  onEditSectionClick,
  consentText = "Al enviar, aceptas nuestro Aviso de Privacidad de Datos y autorizas la asignación directa de tu asesor.",
}) => {
  const [intent, setIntent] = useState<"buy" | "sell">("buy");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [budget, setBudget] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Constants requested by user
  const targetEmail = "ventas@havn.com.mx";
  const targetPhone = "+525630412871";

  // Build the message text for WhatsApp and Email
  const getWhatsAppLink = () => {
    const text = `Hola HAVN, un cliente ha completado el formulario de contacto:
• Nombre: ${name}
• Correo: ${email}
• Teléfono: ${phone}
• Interés: ${intent === "buy" ? "Quiero comprar (Comprador)" : "Quiero vender (Vendedor)"}
• Rango de presupuesto/valor: ${budget || "No especificado"}
• Código de prioridad: HAVN-SERIEA-992`;
    // Format target phone strictly as digits for wa.me API
    const cleanPhone = targetPhone.replace(/\D/g, "");
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const getMailtoLink = () => {
    const subject = `Nuevo Lead de Contacto HAVN: ${name}`;
    const body = `Hola equipo HAVN,

Se ha completado un nuevo formulario de contacto en la plataforma:

• Nombre Completo: ${name}
• Correo Electrónico: ${email}
• Teléfono de contacto: ${phone}
• Interés principal: ${intent === "buy" ? "Quiero comprar (Comprador)" : "Quiero vender (Vendedor)"}
• Presupuesto / Valor Estimado: ${budget || "No especificado"}
• Código de prioridad: HAVN-SERIEA-992

Este lead ha sido registrado automáticamente en la plataforma de administración.`;
    return `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;

    setIsSubmitting(true);
    try {
      // Save lead details to Firestore leads collection
      await addDoc(collection(db, "leads"), {
        name,
        email,
        phone,
        intent,
        budget: budget || "No especificado",
        createdAt: new Date().toISOString()
      });

      // Show success screen and let user trigger instant WhatsApp / email actions
      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error saving lead to Firestore:", error);
      // Fallback gracefully so the experience isn't blocked
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  return (
    <section className="bg-slate-50 text-brand-bg py-24 md:py-32 relative overflow-hidden" id="contact-section">
      {/* Soft gradient backgrounds */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-brand-green/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-brand-green/10 rounded-full blur-[150px] pointer-events-none translate-y-1/2" />

      <div className="max-w-6xl mx-auto px-6 md:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT: Core UX conversion messages */}
          <div className="lg:col-span-5 text-left space-y-6">
            <span className="text-xs font-bold text-brand-green bg-brand-green/10 px-3 py-1.5 rounded-full uppercase tracking-wider inline-block">
              Únete a HAVN
            </span>
            <h2 
              className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#080A0F]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {title}
            </h2>
            <p className="text-base text-gray-500 leading-relaxed font-medium">
              {subtitle}
            </p>
            {isAdminLoggedIn && (
              <div className="pt-2 text-left">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onEditSectionClick?.(); }}
                  className="inline-flex items-center gap-1.5 bg-brand-green/10 text-brand-green border border-brand-green/20 hover:bg-brand-green hover:text-brand-bg px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm group"
                >
                  <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                  <span>Editar Título/Subtítulo</span>
                </button>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 rounded-xl text-brand-bg shrink-0">
                  <User className="w-4 h-4 text-brand-green" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase text-[#080A0F] tracking-wider">Asignación Directa</h4>
                  <p className="text-xs text-gray-400 font-semibold">Especialista HAVN asignado</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 rounded-xl text-brand-bg shrink-0">
                  <Mail className="w-4 h-4 text-brand-green" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase text-[#080A0F] tracking-wider">Contacto Exclusivo</h4>
                  <p className="text-xs text-gray-400 font-semibold">contacto@havn.com.mx</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Ultra Premium Conversion Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-10 shadow-xl relative overflow-hidden">
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6 text-left"
                  >
                    {/* Header with toggle buy/sell */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-[#080A0F] font-sans">
                        ¿Cómo podemos ayudarte?
                      </h3>
                      <p className="text-xs text-gray-400 font-semibold">
                        Selecciona tu interés principal para personalizar tu experiencia.
                      </p>

                      {/* Dynamic Switcher */}
                      <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-gray-100 mt-4">
                        <button
                          type="button"
                          onClick={() => setIntent("buy")}
                          className={`py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            intent === "buy"
                              ? "bg-[#080A0F] text-white shadow-sm"
                              : "text-gray-500 hover:text-brand-bg"
                          }`}
                        >
                          <Building2 className="w-4 h-4" />
                          Quiero comprar
                        </button>
                        <button
                          type="button"
                          onClick={() => setIntent("sell")}
                          className={`py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            intent === "sell"
                              ? "bg-[#080A0F] text-white shadow-sm"
                              : "text-gray-500 hover:text-brand-bg"
                          }`}
                        >
                          <Landmark className="w-4 h-4" />
                          Quiero vender
                        </button>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-extrabold text-[#080A0F] uppercase tracking-wider">Nombre Completo</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. Sofía Pérez"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-50 border border-gray-200 focus:border-brand-green/60 rounded-xl px-4 py-3 text-sm text-brand-bg focus:outline-none transition-colors"
                          />
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-extrabold text-[#080A0F] uppercase tracking-wider">Teléfono de contacto</label>
                          <input
                            type="tel"
                            required
                            placeholder="Ej. 55 1234 5678"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-gray-200 focus:border-brand-green/60 rounded-xl px-4 py-3 text-sm text-brand-bg focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-[#080A0F] uppercase tracking-wider">Correo Electrónico</label>
                        <input
                          type="email"
                          required
                          placeholder="Ej. sofia.perez@empresa.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-gray-200 focus:border-brand-green/60 rounded-xl px-4 py-3 text-sm text-brand-bg focus:outline-none transition-colors"
                        />
                      </div>

                      {/* Budget / Range */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-[#080A0F] uppercase tracking-wider">
                          {intent === "buy" ? "Presupuesto Estimado" : "Valor Estimado de tu Propiedad"}
                        </label>
                        <select
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className="w-full bg-slate-50 border border-gray-200 focus:border-brand-green/60 rounded-xl px-4 py-3 text-sm text-brand-bg focus:outline-none transition-colors cursor-pointer"
                        >
                          <option value="">Selecciona un rango...</option>
                          <option value="5m-15m">$5,000,000 MXN - $15,000,000 MXN</option>
                          <option value="15m-30m">$15,000,000 MXN - $30,000,000 MXN</option>
                          <option value="30m-50m">$30,000,000 MXN - $50,000,000 MXN</option>
                          <option value="50m+">Más de $50,000,000 MXN</option>
                        </select>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-xl bg-[#080A0F] hover:bg-brand-green hover:text-brand-bg text-white font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(59,227,122,0.3)] disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Asignando especialista...
                        </>
                      ) : (
                        <>
                          {intent === "buy" ? "Iniciar proceso de compra" : "Iniciar proceso de venta"}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <p className="text-center text-[10px] text-gray-400 font-semibold leading-relaxed">
                      {consentText}
                    </p>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-6 text-center space-y-6"
                  >
                    <div className="space-y-2">
                      <span className="text-[10px] font-extrabold text-brand-green uppercase tracking-widest bg-brand-green/10 px-3 py-1 rounded-full border border-brand-green/10 inline-block">
                        <Sparkles className="w-3 h-3 text-brand-green inline-block mr-1.5 -translate-y-0.5" />
                        Registro Completado
                      </span>
                      <h3 className="text-2xl font-extrabold text-[#080A0F] font-sans">
                        ¡Bienvenido a HAVN!
                      </h3>
                      <p className="text-xs text-gray-500 font-semibold max-w-sm mx-auto leading-relaxed">
                        Hola <span className="text-[#080A0F] font-bold">{name}</span>, hemos recibido tus datos. Envía tu información para recibir atención inmediata:
                      </p>
                    </div>

                    {/* DIRECT TRANSMISSION BUTTONS */}
                    <div className="space-y-3 max-w-sm mx-auto">
                      <a
                        href={getWhatsAppLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 text-center"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Enviar por WhatsApp
                      </a>

                      <a
                        href={getMailtoLink()}
                        className="w-full py-3.5 rounded-xl bg-[#080A0F] hover:bg-slate-800 text-white font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg text-center"
                      >
                        <Mail className="w-4 h-4" />
                        Enviar por Correo Electrónico
                      </a>
                    </div>

                    <div className="p-4 bg-slate-50 border border-gray-100 rounded-xl text-left max-w-sm mx-auto space-y-1.5 text-xs text-gray-500 font-medium">
                      <p className="flex justify-between">
                        <span>Código de prioridad:</span>
                        <span className="font-bold text-[#080A0F]">HAVN-SERIEA-992</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Estatus:</span>
                        <span className="font-bold text-brand-green">Especialista Asignándose</span>
                      </p>
                    </div>

                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="text-xs text-brand-green font-bold hover:underline cursor-pointer"
                    >
                      Enviar otra solicitud
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
