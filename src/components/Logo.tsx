import React from "react";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  iconOnly = false,
  size = "md",
}) => {
  const sizeClasses = {
    sm: { icon: "h-6 w-6", text: "text-lg" },
    md: { icon: "h-8 w-8", text: "text-2xl" },
    lg: { icon: "h-12 w-12", text: "text-4xl" },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Geometric HAVN Building Icon */}
      <svg
        className={currentSize.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="HAVN Logo Icon"
      >
        {/* Left tall building with slanted roof and sharp angular parallel notch */}
        <path
          d="M22 85 V43 L50 15 V51 L36 65 V85 H22 Z"
          fill="currentColor"
        />
        {/* Right short building with parallel slanted roof corrected to match the brand logo */}
        <path
          d="M56 85 V33 L78 55 V85 H56 Z"
          fill="currentColor"
        />
      </svg>

      {!iconOnly && (
        <span
          className={`font-sans font-bold tracking-[-0.03em] ${currentSize.text} text-white`}
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Havn
        </span>
      )}
    </div>
  );
};
