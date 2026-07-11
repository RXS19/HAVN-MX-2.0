import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowLeftRight } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = "Antes",
  afterLabel = "Después con HAVN",
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[320px] md:h-[480px] rounded-[24px] overflow-hidden select-none cursor-ew-resize glass shadow-2xl"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseDown={(e) => {
        e.preventDefault();
        setIsDragging(true);
        handleMove(e.clientX);
      }}
      onTouchStart={() => {
        setIsDragging(true);
      }}
      id="before-after-container"
    >
      {/* Before Image (Background) */}
      <img
        src={beforeImage}
        alt="Property Before Remodeling"
        className="absolute inset-0 w-full h-full object-cover filter brightness-75 contrast-90"
        referrerPolicy="no-referrer"
        loading="lazy"
      />
      <div className="absolute top-4 left-4 z-10 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider glass text-white/80">
        {beforeLabel}
      </div>

      {/* After Image (Clipped overlay) */}
      <img
        src={afterImage}
        alt="Property After Remodeling"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
        }}
        referrerPolicy="no-referrer"
        loading="lazy"
      />
      <div className="absolute top-4 right-4 z-10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-green text-brand-bg shadow-lg">
        {afterLabel}
      </div>

      {/* Slider Split Line */}
      <div
        className="absolute inset-y-0 z-20 w-1 bg-white hover:bg-brand-green transition-colors"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Slider Handle Button */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full glass-light border border-white/20 hover:border-brand-green flex items-center justify-center text-white hover:text-brand-green shadow-xl cursor-ew-resize transition-all transform hover:scale-110 active:scale-95 bg-brand-bg/85 backdrop-blur-md">
          <ArrowLeftRight className="w-5 h-5" />
        </div>
      </div>

      {/* Subtle overlay helper instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full text-xs font-medium bg-black/40 backdrop-blur-sm text-white/60 pointer-events-none">
        Arrastra para revelar la transformación
      </div>
    </div>
  );
};
