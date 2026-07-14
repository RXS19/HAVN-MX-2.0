import React, { useState } from "react";
import { motion } from "motion/react";
import { Heart, Bed, ShowerHead, Square, Sparkles, MapPin, Trash2, Edit, Car } from "lucide-react";
import { Property } from "../types";

interface HavnPremierProps {
  properties: Property[];
  onPropertySelect: (property: Property) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  isAdminLoggedIn?: boolean;
  onEditProperty?: (id: string) => void;
  onDeleteProperty?: (id: string) => void;
  title?: string;
  subtitle?: string;
  onEditSectionClick?: () => void;
}

export const HavnPremier: React.FC<HavnPremierProps> = ({
  properties,
  onPropertySelect,
  onToggleFavorite,
  isAdminLoggedIn,
  onEditProperty,
  onDeleteProperty,
  title = "HAVN Premier",
  subtitle = "Propiedades exclusivas seleccionadas bajo los más altos estándares de arquitectura, ubicación y plusvalía, superando los $5,000,000 MXN.",
  onEditSectionClick,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter properties with rawPrice greater than 5,000,000 pesos
  const premierListings = properties.filter((p) => p.rawPrice > 5000000);

  if (premierListings.length === 0) return null;

  return (
    <section className="bg-brand-bg text-white py-24 md:py-32 relative overflow-hidden z-20" id="premier-section">
      {/* Decorative Background Elements using real brand green */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-green/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-green/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#aa771c] text-[#080A0F] px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 shadow-md font-black">
            Colección Premier
          </span>
          <h2 
            className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4 font-sans"
          >
            {title}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#bf953f] to-[#aa771c] mx-auto mb-6 rounded-full" />
          <p className="text-base md:text-lg text-gray-300 font-medium">
            {subtitle}
          </p>
          
          {isAdminLoggedIn && (
            <div className="mt-6 flex justify-center">
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

        {/* Premier Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {premierListings.map((prop, idx) => (
            <motion.div
              key={prop.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: (idx % 3) * 0.1 }}
              className="bg-white/[0.02] rounded-[24px] border border-white/5 overflow-hidden shadow-xl hover:shadow-2xl hover:border-brand-green/20 transition-all duration-300 group cursor-pointer relative flex flex-col justify-between backdrop-blur-sm"
              onClick={() => onPropertySelect(prop)}
            >
              <div>
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden bg-white/[0.01]">
                  <img
                    src={prop.image}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  
                  {/* Elegant Golden Tag */}
                  <span className="absolute top-4 left-4 z-10 px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-wider shadow-lg bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#aa771c] text-[#080A0F] border border-[#bf953f]/30 flex items-center gap-1">
                    Premier
                  </span>

                  {/* Admin Actions Overlay */}
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

                  {/* Favorite Toggle Button */}
                  <button
                    onClick={(e) => onToggleFavorite(prop.id, e)}
                    className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-gray-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer"
                    aria-label="Add to favorites"
                  >
                    <Heart
                      className={`w-4 h-4 transition-all duration-300 ${
                        prop.isFavorite ? "fill-red-500 text-red-500 scale-110" : "text-gray-400"
                      }`}
                    />
                  </button>
                </div>

                {/* Info Section */}
                <div className="p-6">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    <MapPin className="w-3.5 h-3.5 text-brand-green" />
                    {prop.location}
                  </div>
                  <h3 
                    className="text-xl font-bold text-white group-hover:text-brand-green transition-colors line-clamp-1 font-sans"
                  >
                    {prop.title}
                  </h3>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#aa771c] tracking-tight">
                      {prop.price}
                    </span>
                    <span className="text-xs bg-white/5 text-gray-200 border border-white/10 font-bold px-2.5 py-1 rounded-md">
                      {prop.city}
                    </span>
                  </div>
                </div>
              </div>

              {/* Technical Specs */}
              <div className="px-4 pb-6 pt-4 border-t border-white/5 grid grid-cols-4 gap-1.5 text-[11px] text-gray-300 font-semibold bg-white/[0.01] rounded-b-[24px]">
                <div className="flex items-center gap-1 justify-center py-2 bg-white/[0.02] border border-white/5 rounded-xl">
                  <Bed className="w-3.5 h-3.5 text-brand-green" />
                  <span>{prop.beds} Recs</span>
                </div>
                <div className="flex items-center gap-1 justify-center py-2 bg-white/[0.02] border border-white/5 rounded-xl">
                  <ShowerHead className="w-3.5 h-3.5 text-brand-green" />
                  <span>{prop.baths} Baños</span>
                </div>
                <div className="flex items-center gap-1 justify-center py-2 bg-white/[0.02] border border-white/5 rounded-xl">
                  <Square className="w-3 h-3 text-brand-green" />
                  <span>{prop.sqm} m²</span>
                </div>
                <div className="flex items-center gap-1 justify-center py-2 bg-white/[0.02] border border-white/5 rounded-xl">
                  <Car className="w-3.5 h-3.5 text-brand-green" />
                  <span>{prop.parking || 2} Estac.</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
