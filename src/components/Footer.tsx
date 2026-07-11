import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "./Logo";

interface FooterProps {
  onAdminClick: () => void;
  onPrivacyClick: () => void;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  link1Text?: string;
  link1Url?: string;
  link2Text?: string;
  link2Url?: string;
  link3Text?: string;
  link3Url?: string;
  link4Text?: string;
  link4Url?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onAdminClick,
  onPrivacyClick,
  description = "HAVN es la plataforma premium de PropTech que está redefiniendo el mercado inmobiliario en México mediante tecnología inmersiva, transacciones sin fricción y diseño de autor.",
  address = "Campos Elíseos 120, Polanco IV Sección, CDMX, C.P. 11560",
  phone = "+52 55 8421 9920",
  email = "privado@havn.mx",
  link1Text = "Comprar Propiedad",
  link1Url = "#properties-section",
  link2Text = "Vender tu Casa",
  link2Url = "#why-havn-section",
  link3Text = "Havn Flip (Flipping)",
  link3Url = "#havn-flip-section",
  link4Text = "Simulador Hipotecario",
  link4Url = "#financing-section",
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#05070a] text-white pt-20 pb-10 border-t border-white/5 relative overflow-hidden" id="footer-section">
      {/* Absolute decorative ambient light */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-green/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-16 border-b border-white/5">
          
          {/* Col 1: Logo & Vision */}
          <div className="lg:col-span-5 space-y-6">
            <Logo size="lg" />
            <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-sm">
              {description}
            </p>
          </div>

          {/* Col 2: Services Quick Links */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Servicios
            </h4>
            <ul className="space-y-2.5 text-sm font-medium text-gray-300">
              {link1Text && (
                <li>
                  <a href={link1Url} className="hover:text-brand-green transition-colors">{link1Text}</a>
                </li>
              )}
              {link2Text && (
                <li>
                  <a href={link2Url} className="hover:text-brand-green transition-colors">{link2Text}</a>
                </li>
              )}
              {link3Text && (
                <li>
                  <a href={link3Url} className="hover:text-brand-green transition-colors">{link3Text}</a>
                </li>
              )}
              {link4Text && (
                <li>
                  <a href={link4Url} className="hover:text-brand-green transition-colors">{link4Text}</a>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Contact & Offices */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Oficinas Privadas
            </h4>
            <ul className="space-y-3 text-sm font-medium text-gray-300">
              {address && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                  <span className="text-gray-400 leading-normal">
                    {address}
                  </span>
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-brand-green shrink-0" />
                  <span>{phone}</span>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-brand-green shrink-0" />
                  <span className="text-brand-green font-semibold">{email}</span>
                </li>
              )}
            </ul>
          </div>

        </div>

        {/* Bottom links and legal */}
        <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-gray-500 font-semibold">
          <p>© {currentYear} HAVN Technologies, S.A.P.I. de C.V. Todos los derechos reservados.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
            <button
              onClick={onAdminClick}
              className="hover:text-brand-green text-xs font-bold transition-colors cursor-pointer text-gray-500 flex items-center gap-1"
            >
              <span>ASM</span>
            </button>
            <button
              onClick={onPrivacyClick}
              className="hover:text-white transition-colors cursor-pointer text-xs font-semibold text-gray-500"
            >
              Aviso de Privacidad
            </button>
            <a href="#contact-section" className="hover:text-white transition-colors">Términos y Condiciones</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
