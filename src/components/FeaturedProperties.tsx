import React, { useState } from "react";
import { motion } from "motion/react";
import { Bed, ShowerHead, Square, Star, Shield, TrendingUp, Sparkles, Building, ArrowUpRight, MapPin, Trash2, Edit, Car } from "lucide-react";
import { Property } from "../types";
import { PROPERTIES } from "../data";

interface FeaturedPropertiesProps {
  properties: Property[];
  onPropertySelect: (property: Property) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  title: string;
  subtitle: string;
  isAdminLoggedIn?: boolean;
  onEditSectionClick?: () => void;
  onEditProperty?: (id: string) => void;
  onDeleteProperty?: (id: string) => void;
  stat1Value?: string;
  stat1Label?: string;
  stat2Value?: string;
  stat2Label?: string;
  stat3Value?: string;
  stat3Label?: string;
  stat4Value?: string;
  stat4Label?: string;
}

export const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({
  properties,
  onPropertySelect,
  onToggleFavorite,
  title,
  subtitle,
  isAdminLoggedIn,
  onEditSectionClick,
  onEditProperty,
  onDeleteProperty,
  stat1Value = "+500 propiedades",
  stat1Label = "Portafolio curado y auditado legalmente",
  stat2Value = "4.9★ Calificación",
  stat2Label = "El estándar más alto de satisfacción en el país",
  stat3Value = "98% Satisfacción",
  stat3Label = "Clientes felices en compra, venta y remodelación",
  stat4Value = "+120 remodelaciones",
  stat4Label = "Proyectos Havn Flip completados con éxito",
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Only display properties marked as "Destacada" or "Exclusivo"
  const featuredListings = properties.filter((p) => {
    if (!p.tag) return false;
    const tagLower = p.tag.toLowerCase();
    return tagLower === "destacada" || tagLower === "destacadas" || tagLower === "exclusivo" || tagLower === "exclusiva" || tagLower === "exclusivos";
  });

  return (
    <section className="bg-slate-50 text-brand-bg py-24 md:py-32 relative z-20" id="properties-section">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Header content */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-xs font-bold text-brand-green bg-brand-green/10 px-3 py-1.5 rounded-full uppercase tracking-wider inline-block mb-3">
              DESTACADOS
            </span>
            <h2 
              className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#080A0F]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {title}
            </h2>
            <p className="mt-3 text-lg text-gray-500 max-w-xl font-medium">
              {subtitle}
            </p>
          </div>
          {isAdminLoggedIn && (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onEditSectionClick?.(); }}
                className="inline-flex items-center gap-1.5 bg-brand-green/10 text-brand-green border border-brand-green/20 hover:bg-brand-green hover:text-brand-bg px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm group"
              >
                <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                <span>Editar Título/Subtítulo</span>
              </button>
            </div>
          )}
        </div>

        {/* Asymmetrical Bento Layout: Grid on left (8 cols), Stats Sidebar on right (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT: Property Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredListings.map((prop, idx) => (
              <motion.div
                key={prop.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx % 2 * 0.1 }}
                className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer relative"
                onClick={() => onPropertySelect(prop)}
              >
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img
                    src={prop.image}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  {/* Badge */}
                  {prop.rawPrice > 5000000 ? (
                    <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-[10px] font-black tracking-wider shadow-md bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#aa771c] text-[#080A0F] border border-[#bf953f]/30 uppercase">
                      Premier
                    </span>
                  ) : (
                    prop.tag && (
                      <span className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-[10px] font-extrabold shadow-sm ${
                        prop.tag.toLowerCase() === "destacada"
                          ? "bg-brand-green text-brand-bg"
                          : "bg-white/95 text-brand-bg"
                      }`}>
                        {prop.tag}
                      </span>
                    )
                  )}

                  {/* Admin Actions Overlay on Card */}
                  {isAdminLoggedIn && (
                    <div className="absolute top-4 right-14 z-20 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {deletingId === prop.id ? (
                        <div className="flex gap-1 bg-red-950/90 border border-red-500/50 rounded-full p-1 items-center shadow-lg">
                          <button
                            onClick={() => {
                              onDeleteProperty?.(prop.id);
                              setDeletingId(null);
                            }}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-full text-[10px] font-extrabold cursor-pointer transition-all"
                            title="Confirmar"
                          >
                            Eliminar
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="px-2 py-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded-full text-[10px] font-bold cursor-pointer transition-all"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => onEditProperty?.(prop.id)}
                            className="p-2 bg-brand-green text-brand-bg rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer border border-brand-green/20"
                            title="Editar Propiedad"
                          >
                            <Edit className="w-3.5 h-3.5 font-bold" />
                          </button>
                          <button
                            onClick={() => setDeletingId(prop.id)}
                            className="p-2 bg-red-600 text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer border border-red-700/20"
                            title="Eliminar Propiedad"
                          >
                            <Trash2 className="w-3.5 h-3.5 font-bold" />
                          </button>
                        </>
                      )}
                    </div>
                  )}


                </div>

                {/* Info Section */}
                <div className="p-6">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    <MapPin className="w-3.5 h-3.5 text-brand-green" />
                    {prop.location}
                  </div>
                  <h3 
                    className="text-xl font-bold text-brand-bg group-hover:text-brand-green transition-colors"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {prop.title}
                  </h3>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-[#080A0F] tracking-tight">
                      {prop.price}
                    </span>
                    <span className="text-xs bg-slate-100 text-gray-500 font-bold px-2.5 py-1 rounded-md">
                      {prop.city}
                    </span>
                  </div>

                  {/* Technical Specs */}
                  <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-4 gap-1.5 text-[11px] text-gray-500 font-semibold">
                    <div className="flex items-center gap-1 justify-center py-1 bg-slate-50 rounded-lg">
                      <Bed className="w-3.5 h-3.5 text-gray-400" />
                      <span>{prop.beds} Recs</span>
                    </div>
                    <div className="flex items-center gap-1 justify-center py-1 bg-slate-50 rounded-lg">
                      <ShowerHead className="w-3.5 h-3.5 text-gray-400" />
                      <span>{prop.baths} Baños</span>
                    </div>
                    <div className="flex items-center gap-1 justify-center py-1 bg-slate-50 rounded-lg">
                      <Square className="w-3 h-3 text-gray-400" />
                      <span>{prop.sqm} m²</span>
                    </div>
                    <div className="flex items-center gap-1 justify-center py-1 bg-slate-50 rounded-lg">
                      <Car className="w-3.5 h-3.5 text-gray-400" />
                      <span>{prop.parking || 2} Estac.</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* RIGHT: Floating/Sticky Stats Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-[#0b1017] text-white rounded-[24px] p-6 md:p-8 shadow-xl relative overflow-hidden"
            >
              {/* Subtle glass grid back layer */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-brand-green/10 rounded-full blur-[60px]" />
              
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
                <Building className="w-5 h-5 text-brand-green" />
                <h4 className="text-lg font-bold tracking-tight uppercase text-gray-300">
                  HAVN Stats
                </h4>
              </div>

              <div className="space-y-6">
                {/* Stat 1 */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-brand-green shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-2xl font-extrabold tracking-tight">{stat1Value}</h5>
                    <p className="text-xs text-gray-400 font-medium">{stat1Label}</p>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-brand-green shrink-0">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-2xl font-extrabold tracking-tight">{stat2Value}</h5>
                    <p className="text-xs text-gray-400 font-medium">{stat2Label}</p>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-brand-green shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-2xl font-extrabold tracking-tight">{stat3Value}</h5>
                    <p className="text-xs text-gray-400 font-medium">{stat3Label}</p>
                  </div>
                </div>

                {/* Stat 4 */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-brand-green shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-2xl font-extrabold tracking-tight">{stat4Value}</h5>
                    <p className="text-xs text-gray-400 font-medium">{stat4Label}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
