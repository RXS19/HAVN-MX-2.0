import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, ArrowRight, User, Shield } from "lucide-react";
import { Logo } from "./Logo";

interface NavbarProps {
  onAdminClick: () => void;
  isAdminLoggedIn: boolean;
  onSelectTag?: (tag: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onAdminClick,
  isAdminLoggedIn,
  onSelectTag,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { label: "HAVN Premier", id: "premier-section" },
    { label: "Rentas", id: "our-properties-section" },
    { label: "Nuestras Propiedades", id: "our-properties-section" },
    { label: "Financiamiento", id: "financing-section" },
    { label: "Vender", id: "contact-section" },
  ];

  const handleScrollTo = (id: string, label?: string) => {
    setIsMobileMenuOpen(false);

    if (onSelectTag) {
      if (label === "Rentas") {
        onSelectTag("Renta");
      } else if (label === "Nuestras Propiedades") {
        onSelectTag("Todas");
      }
    }

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <motion.nav
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "py-3 bg-brand-bg/75 backdrop-blur-md border-b border-white/5 shadow-lg"
            : "py-6 bg-transparent"
        }`}
        style={{ top: isAdminLoggedIn ? "40px" : "0px" }}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <a href="#" className="flex items-center cursor-pointer">
            <Logo />
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleScrollTo(item.id, item.label)}
                className="text-sm font-medium text-white/80 hover:text-brand-green transition-colors cursor-pointer relative py-1 group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-green transition-all group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* Desktop CTA & Login */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => handleScrollTo("contact-section")}
              className="px-5 py-2.5 rounded-full bg-white text-brand-bg font-semibold text-sm transition-all duration-300 hover:bg-brand-green hover:text-brand-bg hover:shadow-[0_0_20px_rgba(59,227,122,0.4)] flex items-center gap-2 group cursor-pointer"
            >
              Comenzar
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Mobile Hamburguer Toggle */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full glass text-white"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-brand-bg/95 backdrop-blur-lg pt-28 px-6 md:px-12 flex flex-col justify-between pb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col gap-6">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  onClick={() => handleScrollTo(item.id, item.label)}
                  className="text-left text-2xl font-bold text-white hover:text-brand-green transition-colors py-2 border-b border-white/5"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>

            <motion.div
              className="flex flex-col gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <button
                onClick={() => handleScrollTo("contact-section")}
                className="w-full py-4 rounded-xl bg-brand-green text-brand-bg font-bold text-center flex items-center justify-center gap-2"
              >
                Comenzar ahora
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-center text-xs text-gray-500">
                HAVN México — Tu próximo capítulo comienza aquí.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
