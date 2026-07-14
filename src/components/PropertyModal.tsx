import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Bed, ShowerHead, Square, MapPin, Landmark, Calendar, Phone, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Property } from "../types";

interface PropertyModalProps {
  property: Property | null;
  onClose: () => void;
  onScheduleVisit: () => void;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
  property,
  onClose,
  onScheduleVisit,
}) => {
  if (!property) return null;

  const imageList = property.images && property.images.length > 0 ? property.images : [property.image];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
        {/* Backdrop glass blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-brand-bg/85 backdrop-blur-md cursor-zoom-out"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-[32px] overflow-hidden max-w-4xl w-full relative shadow-2xl z-10 border border-gray-100 max-h-[90vh] flex flex-col md:flex-row text-brand-bg"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-[#080A0F]/80 hover:bg-[#080A0F] text-white hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-lg"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Column: Property Hero Image Slideshow & Thumbnails */}
          <div className="md:w-1/2 bg-[#080A0F] flex flex-col justify-between relative overflow-hidden group/slider min-h-[350px] md:min-h-[500px]">
            {/* Main Image Slider */}
            <div className="flex-1 relative overflow-hidden bg-[#080A0F] flex items-center justify-center">
              <motion.img
                key={currentImageIndex}
                src={imageList[currentImageIndex]}
                alt={`${property.title} - Imagen ${currentImageIndex + 1}`}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {/* Slider Controls (Only if multiple images exist) */}
              {imageList.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/95 text-brand-bg hover:bg-brand-green hover:text-brand-bg shadow-md transition-all active:scale-90 cursor-pointer opacity-100 md:opacity-0 md:group-hover/slider:opacity-100"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/95 text-brand-bg hover:bg-brand-green hover:text-brand-bg shadow-md transition-all active:scale-90 cursor-pointer opacity-100 md:opacity-0 md:group-hover/slider:opacity-100"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Tag Badge */}
              {property.rawPrice > 5000000 ? (
                <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-[10px] font-black tracking-wider shadow-md bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#aa771c] text-[#080A0F] border border-[#bf953f]/30 uppercase">
                  Premier
                </span>
              ) : (
                property.tag && (
                  <span className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-[10px] font-extrabold shadow-sm ${
                    property.tag.toLowerCase() === "destacada"
                      ? "bg-brand-green text-brand-bg"
                      : "bg-white/95 text-brand-bg"
                  }`}>
                    {property.tag}
                  </span>
                )
              )}
            </div>

            {/* Thumbnail Mini-Gallery below main image */}
            {imageList.length > 1 && (
              <div className="bg-[#0b0e16] p-3 border-t border-white/5 flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {imageList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                    }}
                    className={`relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-all border-2 ${
                      idx === currentImageIndex 
                        ? "border-brand-green scale-105" 
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Miniatura ${idx + 1}`} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information & CTAs */}
          <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[400px] md:max-h-[90vh]">
            <div className="space-y-6">
              {/* Location and Header */}
              <div>
                <span className="text-[10px] font-bold text-brand-green bg-brand-green/10 px-2.5 py-1 rounded-md uppercase tracking-wider inline-flex items-center gap-1 mb-2.5">
                  <MapPin className="w-3 h-3 text-brand-green" />
                  {property.location}
                </span>
                <h3 
                  className="text-2xl md:text-3xl font-extrabold text-[#080A0F] leading-tight"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {property.title}
                </h3>
                <p className="text-2xl font-black text-brand-green mt-2 tracking-tight">
                  {property.price}
                </p>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-3 text-center border-y border-gray-100 py-4">
                <div>
                  <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider block mb-1">Habitaciones</span>
                  <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-[#080A0F]">
                    <Bed className="w-4 h-4 text-gray-500" />
                    <span>{property.beds}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider block mb-1">Baños</span>
                  <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-[#080A0F]">
                    <ShowerHead className="w-4 h-4 text-gray-500" />
                    <span>{property.baths}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider block mb-1">Área</span>
                  <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-[#080A0F]">
                    <Square className="w-3.5 h-3.5 text-gray-500" />
                    <span>{property.sqm} m²</span>
                  </div>
                </div>
              </div>

              {/* Narrative description */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#080A0F]">Descripción de Autor</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Ubicado en una de las zonas con mayor exclusividad y plusvalía en {property.city}. Esta residencia de diseño contemporáneo cuenta con acabados premium cuidadosamente seleccionados, iluminación inteligente integrada, amplias terrazas, y una distribución de espacio impecable orientada al confort y la elegancia.
                </p>
              </div>

              {/* Full location and Interactive Live Map */}
              <div className="space-y-3 pt-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#080A0F] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-green" />
                  Ubicación Privada
                </h4>
                <p className="text-xs text-gray-500 font-medium">
                  {property.location}, {property.city}, México
                </p>
                {/* Embedded Live Google Map */}
                <div className="w-full h-44 rounded-2xl overflow-hidden border border-gray-100 shadow-inner relative bg-slate-100">
                  <iframe
                    title={`Mapa de ${property.title}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(property.location + ", " + property.city)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  />
                </div>
              </div>
            </div>

            {/* Direct scheduling CTAs */}
            <div className="mt-8 pt-4 border-t border-gray-100 space-y-3">
              <button
                onClick={onScheduleVisit}
                className="w-full py-3.5 rounded-xl bg-[#080A0F] hover:bg-brand-green hover:text-brand-bg text-white font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Calendar className="w-4 h-4" />
                Agendar visita privada
              </button>
              <button
                onClick={onScheduleVisit}
                className="w-full py-3.5 rounded-xl border border-gray-200 hover:bg-slate-50 text-gray-600 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                Contactar por WhatsApp
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
