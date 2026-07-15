import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, SlidersHorizontal, Heart, Bed, ShowerHead, Square, Sparkles, MapPin, ArrowUpDown, RefreshCw, Trash2, Edit, Car } from "lucide-react";
import { Property } from "../types";
import { PROPERTIES } from "../data";

interface OurPropertiesProps {
  properties: Property[];
  onPropertySelect: (property: Property) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  title: string;
  subtitle: string;
  isAdminLoggedIn?: boolean;
  onEditSectionClick?: () => void;
  onEditProperty?: (id: string) => void;
  onDeleteProperty?: (id: string) => void;
  selectedTag?: string;
  onSelectedTagChange?: (tag: string) => void;
}

type SortOption = "price-asc" | "price-desc" | "sqm-desc" | "default";

export const OurProperties: React.FC<OurPropertiesProps> = ({
  properties,
  onPropertySelect,
  onToggleFavorite,
  title,
  subtitle,
  isAdminLoggedIn,
  onEditSectionClick,
  onEditProperty,
  onDeleteProperty,
  selectedTag,
  onSelectedTagChange,
}) => {
  const [localSelectedTag, setLocalSelectedTag] = useState("Todas");
  const activeTag = selectedTag !== undefined ? selectedTag : localSelectedTag;
  const handleTagChange = onSelectedTagChange !== undefined ? onSelectedTagChange : setLocalSelectedTag;

  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState("Todas");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [selectedBeds, setSelectedBeds] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [showFilters, setShowFilters] = useState(false);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCity("Todas");
    setSelectedPriceRange("all");
    setSelectedBeds("all");
    setSortBy("default");
    handleTagChange("Todas");
  };

  // Process, filter & sort properties
  const filteredAndSortedProperties = useMemo(() => {
    let result = [...properties];

    // Tag filter
    if (activeTag !== "Todas") {
      result = result.filter((p) => {
        if (!p.tag) return false;
        const tagLower = p.tag.toLowerCase();
        const activeTagLower = activeTag.toLowerCase();
        if (activeTagLower === "destacadas" || activeTagLower === "destacada") {
          return tagLower === "destacada" || tagLower === "destacadas";
        }
        if (activeTagLower === "rentas" || activeTagLower === "renta") {
          return tagLower === "renta" || tagLower === "rentas";
        }
        if (activeTagLower === "ventas" || activeTagLower === "venta") {
          return tagLower === "venta" || tagLower === "ventas";
        }
        return tagLower === activeTagLower || tagLower.includes(activeTagLower);
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q)
      );
    }

    // City filter
    if (selectedCity !== "Todas") {
      result = result.filter((p) => p.city === selectedCity);
    }

    // Price range filter
    if (selectedPriceRange !== "all") {
      if (selectedPriceRange === "under-20m") {
        result = result.filter((p) => p.rawPrice < 20000000);
      } else if (selectedPriceRange === "20m-40m") {
        result = result.filter((p) => p.rawPrice >= 20000000 && p.rawPrice <= 40000000);
      } else if (selectedPriceRange === "over-40m") {
        result = result.filter((p) => p.rawPrice > 40000000);
      }
    }

    // Bedrooms filter
    if (selectedBeds !== "all") {
      const minBeds = parseInt(selectedBeds, 10);
      result = result.filter((p) => p.beds >= minBeds);
    }

    // Sort sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.rawPrice - b.rawPrice);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.rawPrice - a.rawPrice);
    } else if (sortBy === "sqm-desc") {
      result.sort((a, b) => b.sqm - a.sqm);
    }

    return result;
  }, [properties, activeTag, searchQuery, selectedCity, selectedPriceRange, selectedBeds, sortBy]);

  return (
    <section className="bg-slate-50 text-brand-bg py-24 border-t border-slate-100 relative z-20" id="our-properties-section">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        
        {/* Title Block */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-green bg-brand-green/10 px-3 py-1.5 rounded-full uppercase tracking-wider inline-block mb-3.5">
            Inventario Completo
          </span>
          <h2 
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#080A0F]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {title}
          </h2>
          <p className="mt-3.5 text-base md:text-lg text-gray-500 font-medium">
            {subtitle}
          </p>
          {isAdminLoggedIn && (
            <div className="mt-4 flex justify-center">
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

        {/* Tag Category Quick Filters */}
        <div className="flex justify-center mb-10 overflow-x-auto max-w-full pb-2 scrollbar-none">
          <div className="inline-flex bg-slate-50 border border-slate-100 p-1.5 rounded-2xl gap-1.5 shadow-sm">
            {["Todas", "Venta", "Renta", "Destacadas"].map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagChange(tag)}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  (activeTag.toLowerCase() === tag.toLowerCase() || 
                   (tag === "Destacadas" && activeTag.toLowerCase() === "destacada") ||
                   (tag === "Renta" && activeTag.toLowerCase() === "rentas") ||
                   (tag === "Venta" && activeTag.toLowerCase() === "ventas"))
                    ? "bg-[#080A0F] text-white shadow-sm scale-[1.02]"
                    : "text-gray-500 hover:text-[#080A0F] hover:bg-slate-200/40"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters Hub */}
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 mb-10 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por zona, desarrollo, calle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-gray-200 text-brand-bg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent placeholder-gray-400 transition-all shadow-sm"
              />
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap gap-3 items-center justify-between lg:justify-end">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-5 py-3.5 rounded-2xl border text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  showFilters 
                    ? "bg-[#080A0F] text-white border-[#080A0F]" 
                    : "bg-white text-gray-600 border-gray-200 hover:bg-slate-50"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filtros avanzados</span>
                {showFilters && (
                  <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                )}
              </button>

              {/* Sort Selector */}
              <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl px-3 py-3 shadow-sm text-sm text-gray-600 font-semibold gap-1.5">
                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent border-none text-xs font-bold text-gray-700 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="default">Relevancia</option>
                  <option value="price-asc">Precio: Menor a Mayor</option>
                  <option value="price-desc">Precio: Mayor a Menor</option>
                  <option value="sqm-desc">Tamaño: Más grande</option>
                </select>
              </div>

              {/* Reset button (visible when filtering) */}
              {(searchQuery || selectedCity !== "Todas" || selectedPriceRange !== "all" || selectedBeds !== "all" || sortBy !== "default" || activeTag !== "Todas") && (
                <button
                  onClick={handleResetFilters}
                  className="p-3.5 rounded-2xl border border-dashed border-gray-300 text-gray-500 hover:text-brand-green hover:border-brand-green transition-all cursor-pointer bg-white flex items-center justify-center"
                  title="Restablecer filtros"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Expanded Advanced Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-6 pt-6 border-t border-gray-200/60"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  
                  {/* City selector */}
                  <div>
                    <label className="text-xs font-bold text-[#080A0F] uppercase tracking-wider block mb-2">
                      Estado / Ciudad
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {["Todas", "CDMX", "Nuevo León", "Estado De México", "Jalisco", "Riviera Maya"].map((city) => (
                        <button
                          key={city}
                          onClick={() => setSelectedCity(city)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            selectedCity === city
                              ? "bg-brand-green/10 text-brand-green border-brand-green"
                              : "bg-white text-gray-500 border-gray-200 hover:bg-slate-50"
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price range selector */}
                  <div>
                    <label className="text-xs font-bold text-[#080A0F] uppercase tracking-wider block mb-2">
                      Rango de Precio
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: "Todos", value: "all" },
                        { label: "&lt; $20M MXN", value: "under-20m" },
                        { label: "$20M - $40M", value: "20m-40m" },
                        { label: "&gt; $40M MXN", value: "over-40m" },
                      ].map((range) => (
                        <button
                          key={range.value}
                          onClick={() => setSelectedPriceRange(range.value)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            selectedPriceRange === range.value
                              ? "bg-brand-green/10 text-brand-green border-brand-green"
                              : "bg-white text-gray-500 border-gray-200 hover:bg-slate-50"
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bedrooms range selector */}
                  <div>
                    <label className="text-xs font-bold text-[#080A0F] uppercase tracking-wider block mb-2">
                      Habitaciones Mínimas
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: "Todas", value: "all" },
                        { label: "2+", value: "2" },
                        { label: "3+", value: "3" },
                        { label: "4+", value: "4" },
                      ].map((bedOpt) => (
                        <button
                          key={bedOpt.value}
                          onClick={() => setSelectedBeds(bedOpt.value)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            selectedBeds === bedOpt.value
                              ? "bg-brand-green/10 text-brand-green border-brand-green"
                              : "bg-white text-gray-500 border-gray-200 hover:bg-slate-50"
                          }`}
                        >
                          {bedOpt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Counter */}
        <div className="mb-6 flex justify-between items-center text-xs text-gray-500 font-bold uppercase tracking-wider">
          <span>Mostrando {filteredAndSortedProperties.length} de {properties.length} propiedades</span>
          {filteredAndSortedProperties.length === 0 && (
            <button 
              onClick={handleResetFilters}
              className="text-brand-green hover:underline cursor-pointer flex items-center gap-1"
            >
              Restablecer todo
            </button>
          )}
        </div>

        {/* Property Cards Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedProperties.map((prop, idx) => (
              <motion.div
                key={prop.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer relative flex flex-col justify-between"
                onClick={() => onPropertySelect(prop)}
              >
                <div>
                  {/* Image Section */}
                  <div className="relative h-60 overflow-hidden bg-gray-100">
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

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => onToggleFavorite(prop.id, e)}
                      className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm border border-white/20 text-gray-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer"
                      aria-label="Add to favorites"
                    >
                      <Heart
                        className={`w-4 h-4 transition-all duration-300 ${
                          prop.isFavorite ? "fill-red-500 text-red-500 scale-110" : "text-gray-400"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Info Panel */}
                  <div className="p-6">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      <MapPin className="w-3 h-3 text-brand-green" />
                      {prop.location}
                    </div>
                    <h3 
                      className="text-lg font-bold text-brand-bg group-hover:text-brand-green transition-colors leading-snug"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {prop.title}
                    </h3>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xl font-black text-[#080A0F] tracking-tight">
                        {prop.price}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-gray-500 font-bold px-2 py-0.5 rounded uppercase">
                        {prop.city}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Technical specs bottom bar */}
                <div className="px-4 pb-6 pt-4 border-t border-gray-50 grid grid-cols-4 gap-1.5 text-[11px] text-gray-500 font-semibold bg-slate-50/50 rounded-b-[24px]">
                  <div className="flex items-center gap-1.5 justify-center py-1.5 bg-white border border-gray-100 rounded-lg">
                    <Bed className="w-3.5 h-3.5 text-gray-400" />
                    <span>{prop.beds} recs</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center py-1.5 bg-white border border-gray-100 rounded-lg">
                    <ShowerHead className="w-3.5 h-3.5 text-gray-400" />
                    <span>{prop.baths} bñs</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center py-1.5 bg-white border border-gray-100 rounded-lg">
                    <Square className="w-3 h-3 text-gray-400" />
                    <span>{prop.sqm} m²</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center py-1.5 bg-white border border-gray-100 rounded-lg">
                    <Car className="w-3.5 h-3.5 text-gray-400" />
                    <span>{prop.parking || 2} est</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Fallback empty state */}
        {filteredAndSortedProperties.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-50 border border-slate-100 rounded-3xl py-16 px-6 text-center max-w-md mx-auto"
          >
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <h4 className="text-base font-bold text-brand-bg">No encontramos propiedades</h4>
            <p className="text-xs text-gray-500 mt-2 font-medium">
              Intenta cambiar los términos de búsqueda o restablecer los filtros avanzados para ver más opciones.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-6 px-5 py-2.5 bg-[#080A0F] hover:bg-brand-green hover:text-brand-bg text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Restablecer filtros
            </button>
          </motion.div>
        )}

      </div>
    </section>
  );
};
