import React, { useState, useEffect } from "react";
import { 
  motion, AnimatePresence 
} from "motion/react";
import { 
  X, Shield, Lock, Save, Plus, Trash2, Edit2, Star, RefreshCw, 
  Layers, CheckCircle2, AlertTriangle, Eye, EyeOff, LayoutDashboard,
  Building2, Type, Sparkles, MessageSquare, Compass, Settings, 
  Palette, FileText, ArrowRight, Image, Check, CheckCircle, Mail, Upload
} from "lucide-react";
import { Property, Testimonial, ProcessStep, HavnFeature, FinancingService } from "../types";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

// Safe localStorage wrappers to avoid iframe / security / quota issues
const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn("localStorage.getItem blocked or unavailable:", e);
    return null;
  }
};

const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn("localStorage.setItem blocked or unavailable:", e);
  }
};

const safeRemoveItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn("localStorage.removeItem blocked or unavailable:", e);
  }
};

const compressImage = (base64Str: string, maxWidth = 1000, maxHeight = 1000, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64Str || !base64Str.startsWith("data:image/")) {
      resolve(base64Str);
      return;
    }
    const img = document.createElement("img");
    img.src = base64Str;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(base64Str);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", quality);
        resolve(compressed);
      } catch (e) {
        console.error("Error compressing image:", e);
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

interface PageTexts {
  heroTitle1: string;
  heroTitleGreen1: string;
  heroTitle2: string;
  heroTitleGreen2: string;
  heroSubtitle: string;
  heroImage: string;
  featuredTitle: string;
  featuredSubtitle: string;
  premierTitle?: string;
  premierSubtitle?: string;
  inventoryTitle: string;
  inventorySubtitle: string;
  whyHavnTitle: string;
  whyHavnSubtitle: string;
  timelineTitle: string;
  timelineSubtitle: string;
  flipTitle: string;
  flipSubtitle: string;
  financingTitle: string;
  financingSubtitle: string;
  testimonialsTitle: string;
  testimonialsSubtitle: string;
  contactTitle: string;
  contactSubtitle: string;
  heroStat1Value: string;
  heroStat1Label: string;
  heroStat2Value: string;
  heroStat2Label: string;
  heroStat3Value: string;
  heroStat3Label: string;
  footerDescription: string;
  footerAddress: string;
  footerPhone: string;
  footerEmail: string;
  footerLink1Text: string;
  footerLink1Url: string;
  footerLink2Text: string;
  footerLink2Url: string;
  footerLink3Text: string;
  footerLink3Url: string;
  footerLink4Text: string;
  footerLink4Url: string;
  whyHavnBadge?: string;
  featuredStat1Value?: string;
  featuredStat1Label?: string;
  featuredStat2Value?: string;
  featuredStat2Label?: string;
  featuredStat3Value?: string;
  featuredStat3Label?: string;
  featuredStat4Value?: string;
  featuredStat4Label?: string;
  contactConsentText?: string;
  simulatorNoticeText?: string;
  privacyPolicyUrl?: string;
  privacyPolicyText?: string;
}

const DEFAULT_PAGE_TEXTS: PageTexts = {
  heroTitle1: "Tu próximo",
  heroTitleGreen1: "Capítulo",
  heroTitle2: "comienza",
  heroTitleGreen2: "Aquí",
  heroSubtitle: "La forma más inteligente de comprar, vender y transformar propiedades. Redefiniendo el lujo moderno a través de la tecnología y la elegancia.",
  heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  featuredTitle: "Propiedades Destacadas",
  featuredSubtitle: "Explora una selección única de residencias exclusivas y remodelaciones premium con los más altos estándares de diseño en México.",
  premierTitle: "HAVN Premier",
  premierSubtitle: "Propiedades exclusivas seleccionadas bajo los más altos estándares de arquitectura, ubicación y plusvalía, superando los $5,000,000 MXN.",
  inventoryTitle: "Nuestras Propiedades",
  inventorySubtitle: "Encuentra la residencia que se adapta a tus necesidades exactas. Filtra por ubicación, precio o distribución con nuestro motor de búsqueda en tiempo real.",
  whyHavnTitle: "¿Por qué HAVN?",
  whyHavnSubtitle: "No somos una inmobiliaria convencional. Somos un ecosistema tecnológico diseñado para maximizar el valor de tu patrimonio de forma simple, transparente e inteligente.",
  timelineTitle: "Tu viaje con HAVN",
  timelineSubtitle: "Reducimos un proceso complejo de meses a pasos sencillos, transparentes y 100% seguros de principio a fin.",
  flipTitle: "Havn Flip",
  flipSubtitle: "Inversión Inteligente",
  financingTitle: "Servicios Financieros HAVN",
  financingSubtitle: "Hacemos que el financiamiento sea tan simple como elegir una casa. Tasas competitivas, aprobación digital inmediata y asesoría personalizada.",
  testimonialsTitle: "Nuestros clientes, nuestro mayor orgullo",
  testimonialsSubtitle: "Opinión de Clientes",
  contactTitle: "Comienza tu próximo capítulo hoy",
  contactSubtitle: "Ya sea que busques adquirir tu próximo hogar de ensueño en Polanco, o busques una venta acelerada respaldada por liquidez inmediata, nuestro equipo te guiará con la máxima eficiencia.",
  heroStat1Value: "0%",
  heroStat1Label: "Burocracia / 100% Digital",
  heroStat2Value: "+$500M",
  heroStat2Label: "Pesos transaccionados",
  heroStat3Value: "< 10 días",
  heroStat3Label: "Cierre promedio de venta",
  footerDescription: "HAVN es la plataforma premium de PropTech que está redefiniendo el mercado inmobiliario en México mediante tecnología inmersiva, transacciones sin fricción y diseño de autor.",
  footerAddress: "Campos Elíseos 120, Polanco IV Sección, CDMX, C.P. 11560",
  footerPhone: "+52 55 8421 9920",
  footerEmail: "privado@havn.mx",
  footerLink1Text: "Comprar Propiedad",
  footerLink1Url: "#properties-section",
  footerLink2Text: "Vender tu Casa",
  footerLink2Url: "#why-havn-section",
  footerLink3Text: "Havn Flip (Flipping)",
  footerLink3Url: "#havn-flip-section",
  footerLink4Text: "Simulador Hipotecario",
  footerLink4Url: "#financing-section",
  whyHavnBadge: "El Futuro PropTech",
  featuredStat1Value: "+500 propiedades",
  featuredStat1Label: "Portafolio curado y auditado legalmente",
  featuredStat2Value: "4.9★ Calificación",
  featuredStat2Label: "El estándar más alto de satisfacción en el país",
  featuredStat3Value: "98% Satisfacción",
  featuredStat3Label: "Clientes felices en compra, venta y remodelación",
  featuredStat4Value: "+120 remodelaciones",
  featuredStat4Label: "Proyectos Havn Flip completados con éxito",
  contactConsentText: "Al enviar, aceptas nuestro Aviso de Privacidad de Datos y autorizas la asignación directa de tu asesor.",
  simulatorNoticeText: "Tasa establecida por el proveedor final",
  privacyPolicyUrl: "",
  privacyPolicyText: "AVISO DE PRIVACIDAD\n\nEn HAVN Technologies, S.A.P.I. de C.V., nos comprometemos a proteger la privacidad y seguridad de sus datos personales. Sus datos serán tratados bajo estricta confidencialidad para fines de contacto, asignación de asesores e intermediación de servicios inmobiliarios y financieros.\n\nPara conocer el texto completo o ejercer sus derechos ARCO, contáctenos en contacto@havn.com.mx.",
};

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: "image" | "video" | "other";
  size?: string;
  uploadedAt: string;
}

export const DEFAULT_MEDIA_ITEMS: MediaItem[] = [
  {
    id: "med-1",
    name: "Mansión Moderna en Polanco (Exterior)",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    type: "image",
    size: "1.2 MB",
    uploadedAt: "2026-07-01"
  },
  {
    id: "med-2",
    name: "Interior de Lujo con Mármol",
    url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    type: "image",
    size: "890 KB",
    uploadedAt: "2026-07-02"
  },
  {
    id: "med-3",
    name: "Havn Flip - Cocina Vieja (Antes)",
    url: "https://images.unsplash.com/photo-1565183997392-2f6f122e5912?auto=format&fit=crop&w=1200&q=80",
    type: "image",
    size: "650 KB",
    uploadedAt: "2026-07-03"
  },
  {
    id: "med-4",
    name: "Havn Flip - Cocina Remodelada (Después)",
    url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
    type: "image",
    size: "950 KB",
    uploadedAt: "2026-07-03"
  },
  {
    id: "med-5",
    name: "Penthouse Terrazas (CDMX)",
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    type: "image",
    size: "1.4 MB",
    uploadedAt: "2026-07-04"
  },
  {
    id: "med-6",
    name: "Residencia Bosques de las Lomas",
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    type: "image",
    size: "1.1 MB",
    uploadedAt: "2026-07-05"
  },
  {
    id: "med-7",
    name: "Avatar Cliente - Sofía & Alejandro",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    type: "image",
    size: "45 KB",
    uploadedAt: "2026-07-05"
  }
];

interface VisibleSections {
  hero: boolean;
  premier?: boolean;
  featured: boolean;
  inventory: boolean;
  whyHavn: boolean;
  timeline: boolean;
  flip: boolean;
  financing: boolean;
  testimonials: boolean;
  contact: boolean;
}

interface SuperAdminPanelProps {
  properties: Property[];
  onUpdateProperties: (newProperties: Property[]) => void;
  onResetProperties: () => void;
  
  pageTexts: PageTexts;
  onUpdatePageTexts: (newTexts: PageTexts) => void;
  onResetPageTexts: () => void;
  
  brandGreenColor: string;
  brandBgColor: string;
  selectedFont: string;
  visibleSections: VisibleSections;
  onUpdateBranding: (green: string, bg: string, font: string) => void;
  onUpdateVisibleSections: (sections: VisibleSections) => void;
  
  features: HavnFeature[];
  onUpdateFeatures: (newFeats: HavnFeature[]) => void;
  
  steps: ProcessStep[];
  onUpdateSteps: (newSteps: ProcessStep[]) => void;
  
  testimonials: Testimonial[];
  onUpdateTestimonials: (newTestimonials: Testimonial[]) => void;
  
  flipData: {
    beforeImage: string;
    afterImage: string;
    time: string;
    valueInc: string;
  };
  onUpdateFlipData: (newData: any) => void;
  
  financingServices?: FinancingService[];
  onUpdateFinancingServices?: (services: FinancingService[]) => void;
  
  onResetAllDesign: () => void;
  onClose: () => void;
  initialTab?: string;
  initialEditingPropertyId?: string | null;
  onLoginChange?: (loggedIn: boolean) => void;
  firestoreStatus?: "idle" | "saving" | "saved" | "error";
  firestoreError?: string | null;
}

export interface AdminLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  intent: "buy" | "sell";
  budget: string;
  createdAt: string;
}

export type AdminTab = "dashboard" | "properties" | "texts" | "benefits" | "timeline" | "flip" | "testimonials" | "design" | "media" | "financing_services" | "leads";

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({
  properties,
  onUpdateProperties,
  onResetProperties,
  pageTexts,
  onUpdatePageTexts,
  onResetPageTexts,
  brandGreenColor,
  brandBgColor,
  selectedFont,
  visibleSections,
  onUpdateBranding,
  onUpdateVisibleSections,
  features,
  onUpdateFeatures,
  steps,
  onUpdateSteps,
  testimonials,
  onUpdateTestimonials,
  flipData,
  onUpdateFlipData,
  financingServices = [],
  onUpdateFinancingServices,
  onResetAllDesign,
  onClose,
  initialTab,
  initialEditingPropertyId,
  onLoginChange,
  firestoreStatus = "idle",
  firestoreError = null,
}) => {
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return safeGetItem("havn_admin_session") === "active";
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Left Sidebar Menu Active Tab (WordPress Style)
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [showPassword, setShowPassword] = useState(false);

  // --- Leads CMS management state ---
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);

  const fetchLeads = async () => {
    setIsLoadingLeads(true);
    try {
      const q = query(collection(db, "leads"));
      const querySnapshot = await getDocs(q);
      const leadsList: AdminLead[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        leadsList.push({
          id: doc.id,
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          intent: data.intent || "buy",
          budget: data.budget || "No especificado",
          createdAt: data.createdAt || ""
        });
      });
      // Sort by newest leads first
      leadsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setLeads(leadsList);
    } catch (err) {
      console.error("Error loading leads:", err);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este lead de forma permanente?")) return;
    try {
      await deleteDoc(doc(db, "leads", leadId));
      setLeads(leads.filter(l => l.id !== leadId));
      showSuccess("¡Lead de contacto eliminado con éxito!");
    } catch (err) {
      console.error("Error deleting lead:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "leads" && isLoggedIn) {
      fetchLeads();
    }
  }, [activeTab, isLoggedIn]);

  // --- Properties Form states ---
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [propertyToDeleteId, setPropertyToDeleteId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [propTitle, setPropTitle] = useState("");
  const [propPrice, setPropPrice] = useState("");
  const [propRawPrice, setPropRawPrice] = useState("");
  const [propLocation, setPropLocation] = useState("");
  const [propCity, setPropCity] = useState("CDMX");
  const [propBeds, setPropBeds] = useState("2");
  const [propBaths, setPropBaths] = useState("2");
  const [propSqm, setPropSqm] = useState("120");
  const [propParking, setPropParking] = useState("2");
  const [propDescription, setPropDescription] = useState("");
  const [propImage, setPropImage] = useState("");
  const [propImagesText, setPropImagesText] = useState("");
  const [propImages, setPropImages] = useState<string[]>([]);
  const [propTag, setPropTag] = useState("Destacada");

  // --- Design / Customizer Local States ---
  const [inputGreenColor, setInputGreenColor] = useState(brandGreenColor || "#00C389");
  const [inputBgColor, setInputBgColor] = useState(brandBgColor || "#080A0F");
  const [inputFont, setInputFont] = useState(selectedFont || "Plus Jakarta Sans");

  // --- Global Texts Local States ---
  const [textsForm, setTextsForm] = useState<PageTexts>(() => {
    const merged = { ...pageTexts };
    Object.keys(merged).forEach((key) => {
      if (merged[key as keyof PageTexts] === undefined) {
        (merged as any)[key] = "";
      }
    });
    return merged;
  });

  // --- Havn Flip Local States ---
  const [flipForm, setFlipForm] = useState(() => {
    const merged = { ...flipData };
    Object.keys(merged).forEach((key) => {
      if ((merged as any)[key] === undefined) {
        (merged as any)[key] = "";
      }
    });
    return merged;
  });

  // --- Financing Services CMS Local States ---
  const [financingServicesList, setFinancingServicesList] = useState<FinancingService[]>(() => financingServices);

  useEffect(() => {
    setFinancingServicesList(financingServices);
  }, [financingServices]);

  // --- Testimonials CRUD Local States ---
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [testName, setTestName] = useState("");
  const [testRole, setTestRole] = useState("");
  const [testComment, setTestComment] = useState("");
  const [testRating, setTestRating] = useState(5);
  const [testLocation, setTestLocation] = useState("");
  const [testAvatar, setTestAvatar] = useState("");

  // --- Media Library Local States ---
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    const saved = safeGetItem("havn_media_library");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error reading media library from localStorage:", e);
      }
    }
    return DEFAULT_MEDIA_ITEMS;
  });

  const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false);
  const [mediaSelectorCallback, setMediaSelectorCallback] = useState<((url: string) => void) | null>(null);
  const [isMultiSelecting, setIsMultiSelecting] = useState(false);

  const openMediaSelector = (callback: (url: string) => void) => {
    setIsMultiSelecting(false);
    setMediaSelectorCallback(() => callback);
    setMediaSelectorOpen(true);
  };

  const openMultiMediaSelector = (callback: (url: string) => void) => {
    setIsMultiSelecting(true);
    setMediaSelectorCallback(() => callback);
    setMediaSelectorOpen(true);
  };

  const handleSelectMedia = (url: string) => {
    if (mediaSelectorCallback) {
      mediaSelectorCallback(url);
    }
    if (!isMultiSelecting) {
      setMediaSelectorOpen(false);
      setMediaSelectorCallback(null);
    }
  };

  const saveMediaItems = (items: MediaItem[]) => {
    setMediaItems(items);
    safeSetItem("havn_media_library", JSON.stringify(items));
  };

  const [mediaSearchQuery, setMediaSearchQuery] = useState("");

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Url = event.target?.result as string;
        if (!base64Url) return;
        
        const isImg = file.type.startsWith("image/");
        const finalUrl = isImg ? await compressImage(base64Url) : base64Url;
        
        let sizeStr = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
        if (file.size < 1024 * 1024) {
          sizeStr = `${(file.size / 1024).toFixed(0)} KB`;
        }
        if (isImg) {
          const approxLength = finalUrl.length * 0.75;
          sizeStr = `${(approxLength / (1024 * 1024)).toFixed(2)} MB (comprimido)`;
          if (approxLength < 1024 * 1024) {
            sizeStr = `${(approxLength / 1024).toFixed(0)} KB (comprimido)`;
          }
        }

        const newItem: MediaItem = {
          id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: file.name.split('.').slice(0, -1).join('.'),
          url: finalUrl,
          type: isImg ? "image" : file.type.startsWith("video/") ? "video" : "other",
          size: sizeStr,
          uploadedAt: new Date().toISOString().split("T")[0]
        };

        setMediaItems((prevItems) => {
          const updated = [newItem, ...prevItems];
          safeSetItem("havn_media_library", JSON.stringify(updated));
          return updated;
        });
        showSuccess(`¡Archivo "${file.name}" subido con éxito!`);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setTimeout(() => {
      if (password === "Ricardo19+") {
        setIsLoggedIn(true);
        safeSetItem("havn_admin_session", "active");
        if (onLoginChange) onLoginChange(true);
        showSuccess("¡Sesión iniciada con éxito!");
      } else {
        setErrorMsg("Contraseña incorrecta.");
      }
      setIsLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    safeRemoveItem("havn_admin_session");
    if (onLoginChange) onLoginChange(false);
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // --- Design Presets ---
  const colorPresets = [
    { name: "HAVN Green (Default)", hex: "#00C389" },
    { name: "Emerald", hex: "#10b981" },
    { name: "Sky Blue", hex: "#0ea5e9" },
    { name: "Luxury Amber", hex: "#f59e0b" },
    { name: "Rose Gold", hex: "#f43f5e" },
    { name: "Imperial Purple", hex: "#8b5cf6" }
  ];

  const bgPresets = [
    { name: "HAVN Dark (Default)", hex: "#080A0F" },
    { name: "Pitch Black", hex: "#000000" },
    { name: "Midnight Blue", hex: "#0b121e" },
    { name: "Sleek Charcoal", hex: "#121212" }
  ];

  const handleApplyBranding = () => {
    onUpdateBranding(inputGreenColor, inputBgColor, inputFont);
    showSuccess("¡Cambios de diseño y tipografía aplicados con éxito!");
  };

  const handleToggleSection = (key: keyof VisibleSections) => {
    const next = { ...visibleSections, [key]: !visibleSections[key] };
    onUpdateVisibleSections(next);
    showSuccess(`Sección ${key.toUpperCase()} ${next[key] ? "activada" : "desactivada"}.`);
  };

  // --- Properties CRUD Actions ---
  const startEditProperty = (prop: Property) => {
    setEditingPropertyId(prop.id);
    setPropTitle(prop.title);
    setPropPrice(prop.price);
    setPropRawPrice(prop.rawPrice.toString());
    setPropLocation(prop.location);
    setPropCity(prop.city);
    setPropBeds(prop.beds.toString());
    setPropBaths(prop.baths.toString());
    setPropSqm(prop.sqm.toString());
    setPropParking((prop.parking || 2).toString());
    setPropDescription(prop.description || "");
    setPropImage(prop.image);
    setPropImages(prop.images || [prop.image]);
    setPropImagesText(prop.images ? prop.images.join(", ") : "");
    setPropTag(prop.tag || "");
    
    // Smoothly scroll the edit form into view (excellent UX!)
    setTimeout(() => {
      document.getElementById("property-form-container")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const clearPropertyForm = () => {
    setPropTitle("");
    setPropPrice("");
    setPropRawPrice("");
    setPropLocation("");
    setPropCity("CDMX");
    setPropBeds("2");
    setPropBaths("2");
    setPropSqm("120");
    setPropParking("2");
    setPropDescription("");
    setPropImage("");
    setPropImages([]);
    setPropImagesText("");
    setPropTag("Destacada");
  };

  const cancelEditProperty = () => {
    setEditingPropertyId(null);
    clearPropertyForm();
  };

  useEffect(() => {
    setTextsForm(pageTexts);
  }, [pageTexts]);

  // Synchronize initial active tab and property editing triggers from main view
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab as AdminTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialEditingPropertyId !== undefined) {
      setEditingPropertyId(initialEditingPropertyId);
      if (initialEditingPropertyId) {
        const prop = properties.find(p => p.id === initialEditingPropertyId);
        if (prop) {
          startEditProperty(prop);
        }
      } else {
        clearPropertyForm();
      }
    }
  }, [initialEditingPropertyId, properties]);

  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propTitle || !propPrice || !propRawPrice || !propLocation || !propImage) {
      setErrorMsg("Completa todos los campos con asterisco (*).");
      return;
    }

    const priceNum = parseFloat(propRawPrice) || 0;
    
    let finalImages = [...propImages];
    if (propImage && !finalImages.includes(propImage)) {
      finalImages = [propImage, ...finalImages];
    }
    const additionalImages = finalImages.length > 0 ? finalImages : [propImage];

    const updatedProp: Property = {
      id: editingPropertyId || `prop_${Date.now()}`,
      title: propTitle,
      price: propPrice,
      rawPrice: priceNum,
      location: propLocation,
      city: propCity,
      beds: parseInt(propBeds, 10) || 2,
      baths: parseFloat(propBaths) || 2,
      sqm: parseInt(propSqm, 10) || 120,
      parking: parseInt(propParking, 10) || 2,
      description: propDescription || undefined,
      image: propImage,
      images: additionalImages,
      tag: propTag || undefined,
      isFavorite: false
    };

    let nextProps = [...properties];
    if (editingPropertyId) {
      nextProps = nextProps.map(p => p.id === editingPropertyId ? updatedProp : p);
      showSuccess("¡Propiedad actualizada con éxito!");
    } else {
      nextProps = [updatedProp, ...nextProps];
      showSuccess("¡Nueva propiedad guardada con éxito!");
    }

    onUpdateProperties(nextProps);
    setEditingPropertyId(null);
    clearPropertyForm();
  };

  const handleDeleteProperty = (id: string) => {
    const nextProps = properties.filter(p => p.id !== id);
    onUpdateProperties(nextProps);
    showSuccess("Propiedad eliminada con éxito.");
  };

  const toggleFeatured = (id: string) => {
    const nextProps = properties.map(p => {
      if (p.id === id) {
        const isFeatured = p.tag === "Destacada";
        return { ...p, tag: isFeatured ? "" : "Destacada" };
      }
      return p;
    });
    onUpdateProperties(nextProps);
    showSuccess("Estado destacado actualizado.");
  };

  // --- Benefits (Why Havn Cards) ---
  const handleUpdateBenefit = (index: number, field: keyof HavnFeature, val: string) => {
    const nextFeats = [...features];
    nextFeats[index] = { ...nextFeats[index], [field]: val };
    onUpdateFeatures(nextFeats);
    showSuccess("Beneficio actualizado.");
  };

  // --- Timeline Journey ---
  const handleUpdateStep = (index: number, field: keyof ProcessStep, val: any) => {
    const nextSteps = [...steps];
    nextSteps[index] = { ...nextSteps[index], [field]: val };
    onUpdateSteps(nextSteps);
    showSuccess("Paso de timeline actualizado.");
  };

  // --- Havn Flip ---
  const handleSaveFlipData = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateFlipData(flipForm);
    showSuccess("¡Estadísticas de Havn Flip actualizadas!");
  };

  // --- Testimonials CRUD ---
  const startEditTestimonial = (test: Testimonial) => {
    setEditingTestimonialId(test.id);
    setTestName(test.name);
    setTestRole(test.role);
    setTestComment(test.comment);
    setTestRating(test.rating);
    setTestLocation(test.location);
    setTestAvatar(test.avatar);
  };

  const clearTestimonialForm = () => {
    setEditingTestimonialId(null);
    setTestName("");
    setTestRole("");
    setTestComment("");
    setTestRating(5);
    setTestLocation("");
    setTestAvatar("");
  };

  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName || !testRole || !testComment) {
      setErrorMsg("Completa los campos requeridos para el testimonio.");
      return;
    }

    const newTest: Testimonial = {
      id: editingTestimonialId || `t_${Date.now()}`,
      name: testName,
      role: testRole,
      comment: testComment,
      rating: testRating,
      location: testLocation || "México",
      avatar: testAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"
    };

    let nextTests = [...testimonials];
    if (editingTestimonialId) {
      nextTests = nextTests.map(t => t.id === editingTestimonialId ? newTest : t);
      showSuccess("Testimonio actualizado.");
    } else {
      nextTests = [newTest, ...nextTests];
      showSuccess("¡Nuevo testimonio agregado!");
    }

    onUpdateTestimonials(nextTests);
    clearTestimonialForm();
  };

  const handleDeleteTestimonial = (id: string) => {
    if (window.confirm("¿Deseas eliminar este testimonio de cliente?")) {
      const nextTests = testimonials.filter(t => t.id !== id);
      onUpdateTestimonials(nextTests);
      showSuccess("Testimonio eliminado.");
    }
  };

  // --- Financing Services CMS Handlers ---
  const handleUpdateFinancingServiceField = (index: number, field: keyof FinancingService, value: any) => {
    const newList = [...financingServicesList];
    newList[index] = { ...newList[index], [field]: value };
    setFinancingServicesList(newList);
  };

  const handleAddFinancingService = () => {
    const newService: FinancingService = {
      id: `service_${Date.now()}`,
      title: "Nuevo Servicio Financiero",
      badge: "CONVENIO PREMIUM",
      description: "Asesoría inmediata y pre-aprobación del crédito para adquirir cualquier propiedad del portafolio.",
      buttonText: "Iniciar Simulación",
      isDark: false
    };
    setFinancingServicesList([...financingServicesList, newService]);
    showSuccess("Nuevo servicio financiero agregado localmente.");
  };

  const handleDeleteFinancingService = (index: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este servicio financiero de la biblioteca?")) {
      const newList = financingServicesList.filter((_, idx) => idx !== index);
      setFinancingServicesList(newList);
      showSuccess("Servicio financiero eliminado localmente.");
    }
  };

  const handleSaveFinancingServices = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateFinancingServices) {
      onUpdateFinancingServices(financingServicesList);
      showSuccess("¡Servicios financieros guardados con éxito!");
    } else {
      showSuccess("Cambios guardados localmente.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-[#080A0F]/90 backdrop-blur-md cursor-zoom-out" 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 15 }}
        className="bg-[#0e121a] border border-white/10 rounded-[28px] w-full max-w-6xl shadow-2xl relative z-10 h-[85vh] flex flex-col text-white overflow-hidden"
      >
        {/* TOP BAR */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center border border-brand-green/20">
              <Shield className="w-5 h-5 text-brand-green" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded uppercase tracking-wider">
                  WordPress Pro
                </span>
                <span className="text-xs text-gray-400">v4.2.1</span>
                {firestoreStatus === "saving" && (
                  <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Guardando en la nube...
                  </span>
                )}
                {firestoreStatus === "saved" && (
                  <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Nube sincronizada
                  </span>
                )}
                {firestoreStatus === "error" && (
                  <span className="text-[11px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded flex items-center gap-1.5" title={firestoreError || ""}>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    Error de nube
                  </span>
                )}
              </div>
              <h3 className="text-base md:text-lg font-extrabold tracking-tight">Consola de Control HAVN</h3>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="text-xs text-gray-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/5 cursor-pointer font-semibold"
              >
                Cerrar Sesión
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MAIN BODY AREA */}
        {!isLoggedIn ? (
          /* LOGIN PANEL */
          <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center mb-6 border border-brand-green/20">
              <Lock className="w-8 h-8 text-brand-green" />
            </div>
            <h4 className="text-2xl font-bold font-sans">Acceso Restringido</h4>
            <p className="text-sm text-gray-400 mt-2 mb-8">
              Para resguardar el diseño de autor de HAVN, inicia sesión utilizando la clave maestra.
            </p>
            
            {errorMsg && (
              <div className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-4 text-xs text-red-400 text-left">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Contraseña del Administrador"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-brand-green hover:bg-brand-green/90 text-brand-bg font-extrabold transition-all cursor-pointer shadow-lg shadow-brand-green/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Iniciando sesión..." : "Entrar al Escritorio"}
              </button>
            </form>
          </div>
        ) : (
          /* WP-STYLE TWO COLUMN DASHBOARD */
          <div className="flex-1 flex overflow-hidden">
            
            {/* SIDEBAR NAVIGATION (LEFT) */}
            <div className="w-64 bg-black/25 border-r border-white/5 flex flex-col justify-between shrink-0 hidden md:flex">
              <div className="p-4 space-y-1">
                
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2 block">
                  Panel Principal
                </span>
                
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "dashboard" 
                      ? "bg-brand-green/15 text-brand-green border-l-2 border-brand-green" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Escritorio (Resumen)
                </button>

                <button
                  onClick={() => setActiveTab("properties")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "properties" 
                      ? "bg-brand-green/15 text-brand-green border-l-2 border-brand-green" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Propiedades (Inventario)
                </button>

                <button
                  onClick={() => setActiveTab("leads")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "leads" 
                      ? "bg-brand-green/15 text-brand-green border-l-2 border-brand-green" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-brand-green" />
                  Leads de Contacto
                </button>

                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 pt-4 mb-2 block">
                  Edición de Copys
                </span>

                <button
                  onClick={() => setActiveTab("texts")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "texts" 
                      ? "bg-brand-green/15 text-brand-green border-l-2 border-brand-green" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Type className="w-4 h-4" />
                  Textos de Páginas
                </button>

                <button
                  onClick={() => setActiveTab("benefits")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "benefits" 
                      ? "bg-brand-green/15 text-brand-green border-l-2 border-brand-green" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  Módulo de Beneficios
                </button>

                <button
                  onClick={() => setActiveTab("timeline")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "timeline" 
                      ? "bg-brand-green/15 text-brand-green border-l-2 border-brand-green" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Timeline Viaje HAVN
                </button>

                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 pt-4 mb-2 block">
                  Especiales & Layout
                </span>

                <button
                  onClick={() => setActiveTab("flip")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "flip" 
                      ? "bg-brand-green/15 text-brand-green border-l-2 border-brand-green" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Havn Flip
                </button>

                <button
                  onClick={() => setActiveTab("financing_services")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "financing_services" 
                      ? "bg-brand-green/15 text-brand-green border-l-2 border-brand-green" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Servicios Financieros
                </button>

                <button
                  onClick={() => setActiveTab("testimonials")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "testimonials" 
                      ? "bg-brand-green/15 text-brand-green border-l-2 border-brand-green" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Testimonios Clientes
                </button>

                <button
                  onClick={() => setActiveTab("media")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "media" 
                      ? "bg-brand-green/15 text-brand-green border-l-2 border-brand-green" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Image className="w-4 h-4" />
                  Biblioteca de Medios
                </button>

                <button
                  onClick={() => setActiveTab("design")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "design" 
                      ? "bg-brand-green/15 text-brand-green border-l-2 border-brand-green" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  Personalizador Visual
                </button>

              </div>
              
              <div className="p-4 border-t border-white/5">
                {showResetConfirm ? (
                  <div className="p-3 bg-red-950/40 border border-red-500/20 rounded-xl text-center space-y-2">
                    <span className="text-[10px] text-red-300 font-bold block leading-snug">¿Borrar todo y volver al estado inicial?</span>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => {
                          onResetProperties();
                          onResetPageTexts();
                          onResetAllDesign();
                          showSuccess("¡Toda la web ha sido restablecida!");
                          setShowResetConfirm(false);
                        }}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Sí, restaurar
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-brand-green hover:bg-brand-green/10 transition-all border border-white/10 rounded-xl py-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Restaurar Valores
                  </button>
                )}
              </div>
            </div>

            {/* CONTENT AREA (RIGHT) */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0f141f]">
              
              {/* MOBILE NAVIGATION TABS (SCROLLABLE ROW) */}
              <div className="flex md:hidden bg-black/45 overflow-x-auto border-b border-white/5 px-2 py-1.5 gap-1 shrink-0 scrollbar-none">
                {(["dashboard", "properties", "texts", "benefits", "timeline", "flip", "testimonials", "media", "design"] as AdminTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 capitalize cursor-pointer ${
                      activeTab === tab ? "bg-brand-green text-brand-bg font-extrabold" : "text-gray-400 bg-white/5"
                    }`}
                  >
                    {tab === "texts" ? "Textos" : tab === "benefits" ? "Beneficios" : tab === "timeline" ? "Timeline" : tab === "media" ? "Medios" : tab}
                  </button>
                ))}
              </div>

              {/* ACTIVE TAB CONTAINER */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                
                {/* NOTIFICATION TOAST OVERLAY IN CONTENT AREA */}
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-brand-green/10 border border-brand-green/30 rounded-xl text-xs text-brand-green font-bold flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {successMsg}
                  </motion.div>
                )}

                {firestoreStatus === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-bold flex flex-col gap-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">⚠️</span>
                      <span>No se pudieron sincronizar los cambios con la base de datos en la nube.</span>
                    </div>
                    <p className="text-xs text-red-300 font-medium pl-6 leading-relaxed">
                      Detalle del error: {firestoreError || "Error de red, de credenciales o base de datos no inicializada."}
                    </p>
                  </motion.div>
                )}

                {/* --- TAB 1: DASHBOARD --- */}
                {activeTab === "dashboard" && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-brand-green/20 to-transparent p-6 rounded-3xl border border-brand-green/20 relative overflow-hidden">
                      <div className="relative z-10">
                        <span className="text-[10px] font-bold text-brand-green uppercase tracking-wider bg-brand-green/10 px-2.5 py-1 rounded">
                          Bienvenido de vuelta
                        </span>
                        <h4 className="text-2xl font-extrabold mt-3 font-sans">¡Hola, Súper Administrador!</h4>
                        <p className="text-xs text-gray-300 mt-1 max-w-2xl leading-relaxed">
                          Este es tu panel estilo WordPress para HAVN. Aquí tienes el control absoluto de cada letra, cada precio, cada foto y cada color de tu sitio web sin tocar una sola línea de código.
                        </p>
                      </div>
                      <Shield className="absolute right-6 bottom-0 w-36 h-36 text-white/5 transform translate-y-6 pointer-events-none" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="glass p-5 rounded-2xl border-white/5">
                        <span className="text-xs text-gray-400 font-semibold block">Total Propiedades</span>
                        <span className="text-3xl font-extrabold mt-1 block">{properties.length}</span>
                        <span className="text-[10px] text-gray-500 font-bold block mt-2">En base de datos local</span>
                      </div>
                      <div className="glass p-5 rounded-2xl border-white/5">
                        <span className="text-xs text-gray-400 font-semibold block">Propiedades Destacadas</span>
                        <span className="text-3xl font-extrabold mt-1 block text-brand-green">
                          {properties.filter(p => p.tag === "Destacada" || p.tag === "Exclusivo").length}
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold block mt-2">Se muestran en carrusel superior</span>
                      </div>
                      <div className="glass p-5 rounded-2xl border-white/5">
                        <span className="text-xs text-gray-400 font-semibold block">Tema de Tipografía</span>
                        <span className="text-lg font-bold mt-2 block text-white truncate">{selectedFont}</span>
                        <span className="text-[10px] text-brand-green font-bold block mt-1">Cargada dinámicamente</span>
                      </div>
                      <div className="glass p-5 rounded-2xl border-white/5">
                        <span className="text-xs text-gray-400 font-semibold block">Color de Marca (Accent)</span>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="w-5 h-5 rounded-full border border-white/20 block" style={{ backgroundColor: brandGreenColor }} />
                          <span className="text-sm font-bold font-mono">{brandGreenColor}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-bold block mt-2">Variable CSS Activa</span>
                      </div>
                    </div>

                    {/* Quick Help Guide */}
                    <div className="glass p-6 rounded-2xl border-white/5">
                      <h5 className="text-sm font-bold text-white mb-3">Guía de Uso Rápido</h5>
                      <ul className="text-xs text-gray-400 space-y-2 leading-relaxed">
                        <li>• <strong className="text-gray-300">Inventario:</strong> Añade o edita casas en "Propiedades". Sube fotos de Unsplash para verlas al instante.</li>
                        <li>• <strong className="text-gray-300">Havn Flip:</strong> Configura el ROI promedio y los plazos que vendes a inversores.</li>
                        <li>• <strong className="text-gray-300">Personalizador:</strong> Cambia los colores a la paleta corporativa de tu cliente o desactiva secciones que aún no tengan stock.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* --- TAB 2: PROPERTIES CRUD --- */}
                {activeTab === "properties" && (
                  <div className="space-y-8">
                    {/* Property form */}
                    <div id="property-form-container" className={`glass p-6 rounded-3xl transition-all duration-300 ${editingPropertyId ? "border-2 border-brand-green/50 shadow-[0_0_25px_rgba(59,227,122,0.15)]" : "border-white/5"}`}>
                      <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-brand-green" />
                        {editingPropertyId ? `Editar Propiedad ID: ${editingPropertyId}` : "Añadir Nueva Propiedad"}
                      </h4>

                      <form onSubmit={handleSaveProperty} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-400 block mb-1 font-semibold">Título de la Propiedad *</label>
                            <input
                              type="text"
                              value={propTitle}
                              onChange={(e) => setPropTitle(e.target.value)}
                              placeholder="Ej. Penthouse Rubén Darío"
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:ring-1 focus:ring-brand-green outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1 font-semibold">Precio Formateado *</label>
                            <input
                              type="text"
                              value={propPrice}
                              onChange={(e) => setPropPrice(e.target.value)}
                              placeholder="Ej. $24,500,000 MXN"
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:ring-1 focus:ring-brand-green outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1 font-semibold">Precio Numérico (Filtros) *</label>
                            <input
                              type="number"
                              value={propRawPrice}
                              onChange={(e) => setPropRawPrice(e.target.value)}
                              placeholder="Ej. 24500000"
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:ring-1 focus:ring-brand-green outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1 font-semibold">Ubicación / Dirección *</label>
                            <input
                              type="text"
                              value={propLocation}
                              onChange={(e) => setPropLocation(e.target.value)}
                              placeholder="Ej. Rubén Darío, Polanco"
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:ring-1 focus:ring-brand-green outline-none"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                          <div>
                            <label className="text-xs text-gray-400 block mb-1 font-semibold">Ciudad</label>
                            <select
                              value={propCity}
                              onChange={(e) => setPropCity(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-[#0e121a] border border-white/10 text-white text-xs focus:ring-1 focus:ring-brand-green outline-none"
                            >
                              <option value="CDMX">CDMX</option>
                              <option value="Nuevo León">Nuevo León</option>
                              <option value="Estado De México">Estado De México</option>
                              <option value="Jalisco">Jalisco</option>
                              <option value="Riviera Maya">Riviera Maya</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1 font-semibold">Habitaciones</label>
                            <input
                              type="number"
                              value={propBeds}
                              onChange={(e) => setPropBeds(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:ring-1 focus:ring-brand-green outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1 font-semibold">Baños</label>
                            <input
                              type="number"
                              step="0.5"
                              value={propBaths}
                              onChange={(e) => setPropBaths(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:ring-1 focus:ring-brand-green outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1 font-semibold">Metros (m²)</label>
                            <input
                              type="number"
                              value={propSqm}
                              onChange={(e) => setPropSqm(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:ring-1 focus:ring-brand-green outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1 font-semibold">Estacionamiento</label>
                            <input
                              type="number"
                              value={propParking}
                              onChange={(e) => setPropParking(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:ring-1 focus:ring-brand-green outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1 font-semibold">Tag Distintivo</label>
                            <input
                              type="text"
                              value={propTag}
                              onChange={(e) => setPropTag(e.target.value)}
                              placeholder="Ej. Destacada, Exclusiva"
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:ring-1 focus:ring-brand-green outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs text-gray-400 font-semibold">Foto Principal URL *</label>
                            <button
                              type="button"
                              onClick={() => openMediaSelector((url) => setPropImage(url))}
                              className="text-[10px] text-brand-green hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Image className="w-3 h-3" /> Seleccionar de Biblioteca
                            </button>
                          </div>
                          <input
                            type="text"
                            value={propImage}
                            onChange={(e) => setPropImage(e.target.value)}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:ring-1 focus:ring-brand-green outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-xs text-gray-400 block mb-1 font-semibold text-brand-green uppercase tracking-wide">DESCRIPCIÓN DEL INMUEBLE</label>
                          <textarea
                            value={propDescription}
                            onChange={(e) => setPropDescription(e.target.value)}
                            placeholder="Ej. Hermoso departamento con acabados de lujo, vista espectacular y amplios espacios iluminados..."
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:ring-1 focus:ring-brand-green outline-none resize-none"
                          />
                        </div>

                        <div className="bg-[#0b0e16] border border-white/5 rounded-2xl p-4 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                            <div>
                              <label className="text-xs text-white font-extrabold flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-brand-green" />
                                Galería de Fotos Adicionales
                              </label>
                              <p className="text-[10px] text-gray-400">Anexa múltiples fotos de forma sencilla. El primer elemento será parte del carrusel.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {/* Add from library button */}
                              <button
                                type="button"
                                onClick={() => {
                                  openMultiMediaSelector((url) => {
                                    setPropImages((prev) => {
                                      if (prev.includes(url)) return prev;
                                      return [...prev, url];
                                    });
                                  });
                                }}
                                className="px-2.5 py-1.5 bg-brand-green/10 border border-brand-green/20 text-brand-green hover:bg-brand-green/20 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                              >
                                <Plus className="w-3 h-3" /> Añadir de Biblioteca
                              </button>

                              {/* Multi-upload local files button */}
                              <label className="px-2.5 py-1.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all">
                                <Upload className="w-3 h-3 text-brand-green" /> Subir Fotos Locales
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const files = e.target.files;
                                    if (!files || files.length === 0) return;
                                    
                                    const filesArr = Array.from(files) as File[];
                                    let loadedCount = 0;
                                    const newUrls: string[] = [];

                                    filesArr.forEach((file: File) => {
                                      const reader = new FileReader();
                                      reader.onload = async (event) => {
                                        const base64Url = event.target?.result as string;
                                        if (base64Url) {
                                          const compressedUrl = await compressImage(base64Url);
                                          newUrls.push(compressedUrl);

                                          // Also save to global media library
                                          const approxLength = compressedUrl.length * 0.75;
                                          let sizeStr = `${(approxLength / (1024 * 1024)).toFixed(2)} MB (comprimido)`;
                                          if (approxLength < 1024 * 1024) {
                                            sizeStr = `${(approxLength / 1024).toFixed(0)} KB (comprimido)`;
                                          }
                                          const newItem: MediaItem = {
                                            id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                                            name: file.name.split('.').slice(0, -1).join('.'),
                                            url: compressedUrl,
                                            type: "image",
                                            size: sizeStr,
                                            uploadedAt: new Date().toISOString().split("T")[0]
                                          };
                                          setMediaItems(prev => {
                                            const updated = [newItem, ...prev];
                                            safeSetItem("havn_media_library", JSON.stringify(updated));
                                            return updated;
                                          });
                                        }

                                        loadedCount++;
                                        if (loadedCount === filesArr.length) {
                                          setPropImages(prev => {
                                            const filtered = newUrls.filter(url => !prev.includes(url));
                                            return [...prev, ...filtered];
                                          });
                                          showSuccess(`¡${filesArr.length} fotos cargadas con éxito!`);
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    });
                                  }}
                                />
                              </label>
                            </div>
                          </div>

                          {/* Render attached images grid */}
                          {propImages.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[220px] overflow-y-auto p-1">
                              {propImages.map((imgUrl, imgIdx) => (
                                <div key={imgIdx} className="relative group/thumb aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-slate-950">
                                  <img 
                                    src={imgUrl} 
                                    alt={`Miniatura ${imgIdx + 1}`} 
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                  <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold">
                                    #{imgIdx + 1}
                                  </span>
                                  {/* Delete Thumbnail Button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPropImages(prev => prev.filter((_, idx) => idx !== imgIdx));
                                    }}
                                    className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-red-600/90 text-white hover:bg-red-700 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer opacity-100 sm:opacity-0 sm:group-hover/thumb:opacity-100"
                                    title="Quitar foto"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="border border-dashed border-white/10 rounded-xl p-6 text-center text-gray-500 text-xs">
                              No hay fotos adicionales agregadas. Usa los botones superiores para añadir fotos desde tu computadora o biblioteca de medios sin necesidad de URLs.
                            </div>
                          )}

                          {/* Optional: Add photo by URL simply */}
                          <div className="pt-2 border-t border-white/5 flex gap-2">
                            <input
                              type="text"
                              id="custom-photo-url-input"
                              placeholder="O pega un enlace de imagen externo aquí..."
                              className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-[11px] outline-none focus:ring-1 focus:ring-brand-green"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const input = e.currentTarget;
                                  const val = input.value.trim();
                                  if (val) {
                                    setPropImages(prev => prev.includes(val) ? prev : [...prev, val]);
                                    input.value = "";
                                    showSuccess("Enlace agregado a la galería.");
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const el = document.getElementById("custom-photo-url-input") as HTMLInputElement;
                                if (el && el.value.trim()) {
                                  const val = el.value.trim();
                                  setPropImages(prev => prev.includes(val) ? prev : [...prev, val]);
                                  el.value = "";
                                  showSuccess("Enlace agregado a la galería.");
                                }
                              }}
                              className="px-3 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg cursor-pointer border border-white/10 transition-all"
                            >
                              Agregar
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          {editingPropertyId && (
                            <button
                              type="button"
                              onClick={cancelEditProperty}
                              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-xs cursor-pointer"
                            >
                              Cancelar Edición
                            </button>
                          )}
                          <button
                            type="submit"
                            className="px-5 py-2 bg-brand-green text-brand-bg font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer hover:opacity-90"
                          >
                            <Save className="w-3.5 h-3.5" />
                            {editingPropertyId ? "Guardar Cambios" : "Guardar Nueva Propiedad"}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Properties List Table */}
                    <div className="glass rounded-3xl border-white/5 overflow-hidden">
                      <div className="p-5 border-b border-white/5 bg-white/[0.02]">
                        <h5 className="text-sm font-bold text-white">Inventario Activo ({properties.length})</h5>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-white/5 text-gray-400 font-bold bg-white/[0.01]">
                              <th className="p-4">Propiedad</th>
                              <th className="p-4">Precio</th>
                              <th className="p-4">Ubicación</th>
                              <th className="p-4">Detalles</th>
                              <th className="p-4">Etiqueta</th>
                              <th className="p-4 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {properties.map((p) => (
                              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <img 
                                      src={p.image} 
                                      alt="" 
                                      className="w-12 h-9 object-cover rounded-md border border-white/10 shrink-0"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div>
                                      <span className="font-bold text-white block">{p.title}</span>
                                      <span className="text-[10px] text-gray-500 block">ID: {p.id}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4 font-bold text-brand-green">{p.price}</td>
                                <td className="p-4">
                                  <span className="text-gray-300 block">{p.location}</span>
                                  <span className="text-[10px] text-gray-500 block">{p.city}</span>
                                </td>
                                <td className="p-4 text-gray-400">
                                  {p.beds} Rec • {p.baths} Baños • {p.sqm} m² • {p.parking || 2} Estac.
                                </td>
                                <td className="p-4">
                                  <span className="bg-brand-green/10 text-brand-green border border-brand-green/20 px-2 py-0.5 rounded text-[10px] font-bold">
                                    {p.tag || "Ninguna"}
                                  </span>
                                </td>
                                <td className="p-4 text-right space-x-1.5 shrink-0">
                                  <button
                                    onClick={() => toggleFeatured(p.id)}
                                    title="Toggle Featured"
                                    className={`p-1.5 rounded-lg border transition-all cursor-pointer inline-block ${
                                      p.tag === "Destacada" 
                                        ? "bg-brand-green/10 border-brand-green text-brand-green" 
                                        : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
                                    }`}
                                  >
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                  </button>
                                  <button
                                    onClick={() => startEditProperty(p)}
                                    title="Editar"
                                    className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:border-white/20 transition-all cursor-pointer inline-block"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  {propertyToDeleteId === p.id ? (
                                    <div className="inline-flex items-center gap-1 bg-red-950/80 border border-red-500/30 rounded-lg p-1">
                                      <button
                                        onClick={() => {
                                          handleDeleteProperty(p.id);
                                          setPropertyToDeleteId(null);
                                        }}
                                        className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold cursor-pointer"
                                      >
                                        Sí, borrar
                                      </button>
                                      <button
                                        onClick={() => setPropertyToDeleteId(null)}
                                        className="px-1.5 py-0.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded text-[10px] cursor-pointer"
                                      >
                                        No
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setPropertyToDeleteId(p.id)}
                                      title="Eliminar"
                                      className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-red-400 hover:border-red-500/20 transition-all cursor-pointer inline-block"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB 3: GLOBAL TEXTS --- */}
                {activeTab === "texts" && (
                  <div className="glass p-6 rounded-3xl border-white/5">
                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Type className="w-4 h-4 text-brand-green" />
                      Editor de Textos y Títulos de la Web
                    </h4>

                    <form onSubmit={(e) => { e.preventDefault(); onUpdatePageTexts(textsForm); showSuccess("¡Títulos y descripciones principales guardados!"); }} className="space-y-6">
                      
                      <div className="space-y-4">
                        <h5 className="text-xs font-bold text-brand-green uppercase tracking-wider border-b border-white/5 pb-1">1. Hero (Sección de Bienvenida)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Título Superior Blanco</label>
                            <input
                              type="text"
                              value={textsForm.heroTitle1}
                              onChange={(e) => setTextsForm({ ...textsForm, heroTitle1: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Título Superior Verde</label>
                            <input
                              type="text"
                              value={textsForm.heroTitleGreen1}
                              onChange={(e) => setTextsForm({ ...textsForm, heroTitleGreen1: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Título Inferior Blanco</label>
                            <input
                              type="text"
                              value={textsForm.heroTitle2}
                              onChange={(e) => setTextsForm({ ...textsForm, heroTitle2: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Título Inferior Verde</label>
                            <input
                              type="text"
                              value={textsForm.heroTitleGreen2}
                              onChange={(e) => setTextsForm({ ...textsForm, heroTitleGreen2: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">Subtítulo Hero</label>
                          <textarea
                            value={textsForm.heroSubtitle}
                            onChange={(e) => setTextsForm({ ...textsForm, heroSubtitle: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs text-gray-400">Imagen de Fondo Hero (URL)</label>
                            <button
                              type="button"
                              onClick={() => openMediaSelector((url) => setTextsForm({ ...textsForm, heroImage: url }))}
                              className="text-[10px] text-brand-green hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Image className="w-3 h-3" /> Seleccionar de Biblioteca
                            </button>
                          </div>
                          <input
                            type="text"
                            value={textsForm.heroImage}
                            onChange={(e) => setTextsForm({ ...textsForm, heroImage: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                          />
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <h5 className="text-xs font-bold text-brand-green uppercase tracking-wider border-b border-white/5 pb-1">2. Propiedades Destacadas</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Título</label>
                            <input
                              type="text"
                              value={textsForm.featuredTitle}
                              onChange={(e) => setTextsForm({ ...textsForm, featuredTitle: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Descripción</label>
                            <input
                              type="text"
                              value={textsForm.featuredSubtitle}
                              onChange={(e) => setTextsForm({ ...textsForm, featuredSubtitle: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <h5 className="text-xs font-bold text-brand-green uppercase tracking-wider border-b border-white/5 pb-1">2b. Colección HAVN Premier</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Título</label>
                            <input
                              type="text"
                              value={textsForm.premierTitle || ""}
                              onChange={(e) => setTextsForm({ ...textsForm, premierTitle: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Descripción</label>
                            <input
                              type="text"
                              value={textsForm.premierSubtitle || ""}
                              onChange={(e) => setTextsForm({ ...textsForm, premierSubtitle: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <h5 className="text-xs font-bold text-brand-green uppercase tracking-wider border-b border-white/5 pb-1">3. Nuestras Propiedades (Inventario Completo)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Título</label>
                            <input
                              type="text"
                              value={textsForm.inventoryTitle}
                              onChange={(e) => setTextsForm({ ...textsForm, inventoryTitle: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Descripción</label>
                            <input
                              type="text"
                              value={textsForm.inventorySubtitle}
                              onChange={(e) => setTextsForm({ ...textsForm, inventorySubtitle: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <h5 className="text-xs font-bold text-brand-green uppercase tracking-wider border-b border-white/5 pb-1">4. ¿Por qué HAVN?</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="text-xs text-gray-400 block mb-1">Etiqueta Informativa superior (e.g. El Futuro PropTech)</label>
                            <input
                              type="text"
                              value={textsForm.whyHavnBadge || ""}
                              onChange={(e) => setTextsForm({ ...textsForm, whyHavnBadge: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Título</label>
                            <input
                              type="text"
                              value={textsForm.whyHavnTitle}
                              onChange={(e) => setTextsForm({ ...textsForm, whyHavnTitle: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Descripción</label>
                            <input
                              type="text"
                              value={textsForm.whyHavnSubtitle}
                              onChange={(e) => setTextsForm({ ...textsForm, whyHavnSubtitle: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <h5 className="text-xs font-bold text-brand-green uppercase tracking-wider border-b border-white/5 pb-1">5. Tu Viaje con HAVN (Cronología)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Título</label>
                            <input
                              type="text"
                              value={textsForm.timelineTitle}
                              onChange={(e) => setTextsForm({ ...textsForm, timelineTitle: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Descripción</label>
                            <input
                              type="text"
                              value={textsForm.timelineSubtitle}
                              onChange={(e) => setTextsForm({ ...textsForm, timelineSubtitle: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <h5 className="text-xs font-bold text-brand-green uppercase tracking-wider border-b border-white/5 pb-1">6. Havn Flip</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Título</label>
                            <input
                              type="text"
                              value={textsForm.flipTitle}
                              onChange={(e) => setTextsForm({ ...textsForm, flipTitle: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Subtítulo</label>
                            <input
                              type="text"
                              value={textsForm.flipSubtitle}
                              onChange={(e) => setTextsForm({ ...textsForm, flipSubtitle: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <h5 className="text-xs font-bold text-brand-green uppercase tracking-wider border-b border-white/5 pb-1">7. Servicios Financieros</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Título</label>
                            <input
                              type="text"
                              value={textsForm.financingTitle}
                              onChange={(e) => setTextsForm({ ...textsForm, financingTitle: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Descripción</label>
                            <input
                              type="text"
                              value={textsForm.financingSubtitle}
                              onChange={(e) => setTextsForm({ ...textsForm, financingSubtitle: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <h5 className="text-xs font-bold text-brand-green uppercase tracking-wider border-b border-white/5 pb-1">8. Testimonios</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Título</label>
                            <input
                              type="text"
                              value={textsForm.testimonialsTitle}
                              onChange={(e) => setTextsForm({ ...textsForm, testimonialsTitle: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Subtítulo</label>
                            <input
                              type="text"
                              value={textsForm.testimonialsSubtitle}
                              onChange={(e) => setTextsForm({ ...textsForm, testimonialsSubtitle: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <h5 className="text-xs font-bold text-brand-green uppercase tracking-wider border-b border-white/5 pb-1">9. Formulario de Contacto</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Título</label>
                            <input
                              type="text"
                              value={textsForm.contactTitle}
                              onChange={(e) => setTextsForm({ ...textsForm, contactTitle: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Descripción</label>
                            <input
                              type="text"
                              value={textsForm.contactSubtitle}
                              onChange={(e) => setTextsForm({ ...textsForm, contactSubtitle: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <h5 className="text-xs font-bold text-brand-green uppercase tracking-wider border-b border-white/5 pb-1">10. Estadísticas HAVN (Hero)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Dato 1 Valor (e.g. 0%)</label>
                            <input
                              type="text"
                              value={textsForm.heroStat1Value}
                              onChange={(e) => setTextsForm({ ...textsForm, heroStat1Value: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-xs text-gray-400 block mb-1">Dato 1 Etiqueta (e.g. Burocracia)</label>
                            <input
                              type="text"
                              value={textsForm.heroStat1Label}
                              onChange={(e) => setTextsForm({ ...textsForm, heroStat1Label: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Dato 2 Valor (e.g. +$500M)</label>
                            <input
                              type="text"
                              value={textsForm.heroStat2Value}
                              onChange={(e) => setTextsForm({ ...textsForm, heroStat2Value: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-xs text-gray-400 block mb-1">Dato 2 Etiqueta (e.g. Pesos transaccionados)</label>
                            <input
                              type="text"
                              value={textsForm.heroStat2Label}
                              onChange={(e) => setTextsForm({ ...textsForm, heroStat2Label: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Dato 3 Valor (e.g. &lt; 10 días)</label>
                            <input
                              type="text"
                              value={textsForm.heroStat3Value}
                              onChange={(e) => setTextsForm({ ...textsForm, heroStat3Value: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-xs text-gray-400 block mb-1">Dato 3 Etiqueta (e.g. Cierre promedio de venta)</label>
                            <input
                              type="text"
                              value={textsForm.heroStat3Label}
                              onChange={(e) => setTextsForm({ ...textsForm, heroStat3Label: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <h5 className="text-xs font-bold text-brand-green uppercase tracking-wider border-b border-white/5 pb-1">11. Footer (Textos y Enlaces)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="text-xs text-gray-400 block mb-1">Descripción corta del Footer</label>
                            <textarea
                              value={textsForm.footerDescription}
                              onChange={(e) => setTextsForm({ ...textsForm, footerDescription: e.target.value })}
                              rows={2}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Dirección de Contacto</label>
                            <input
                              type="text"
                              value={textsForm.footerAddress}
                              onChange={(e) => setTextsForm({ ...textsForm, footerAddress: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Teléfono</label>
                            <input
                              type="text"
                              value={textsForm.footerPhone}
                              onChange={(e) => setTextsForm({ ...textsForm, footerPhone: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Email</label>
                            <input
                              type="text"
                              value={textsForm.footerEmail}
                              onChange={(e) => setTextsForm({ ...textsForm, footerEmail: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                        </div>

                        <div className="space-y-3 pt-2">
                          <h6 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Enlaces Rápidos (Texto y URL)</h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                            <div>
                              <label className="text-[10px] text-gray-400 block">Enlace 1: Texto</label>
                              <input
                                type="text"
                                value={textsForm.footerLink1Text}
                                onChange={(e) => setTextsForm({ ...textsForm, footerLink1Text: e.target.value })}
                                className="w-full px-2.5 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs outline-none mt-0.5 focus:border-brand-green"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 block">Enlace 1: URL/ID</label>
                              <input
                                type="text"
                                value={textsForm.footerLink1Url}
                                onChange={(e) => setTextsForm({ ...textsForm, footerLink1Url: e.target.value })}
                                className="w-full px-2.5 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs outline-none mt-0.5 focus:border-brand-green"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                            <div>
                              <label className="text-[10px] text-gray-400 block">Enlace 2: Texto</label>
                              <input
                                type="text"
                                value={textsForm.footerLink2Text}
                                onChange={(e) => setTextsForm({ ...textsForm, footerLink2Text: e.target.value })}
                                className="w-full px-2.5 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs outline-none mt-0.5 focus:border-brand-green"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 block">Enlace 2: URL/ID</label>
                              <input
                                type="text"
                                value={textsForm.footerLink2Url}
                                onChange={(e) => setTextsForm({ ...textsForm, footerLink2Url: e.target.value })}
                                className="w-full px-2.5 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs outline-none mt-0.5 focus:border-brand-green"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                            <div>
                              <label className="text-[10px] text-gray-400 block">Enlace 3: Texto</label>
                              <input
                                type="text"
                                value={textsForm.footerLink3Text}
                                onChange={(e) => setTextsForm({ ...textsForm, footerLink3Text: e.target.value })}
                                className="w-full px-2.5 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs outline-none mt-0.5 focus:border-brand-green"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 block">Enlace 3: URL/ID</label>
                              <input
                                type="text"
                                value={textsForm.footerLink3Url}
                                onChange={(e) => setTextsForm({ ...textsForm, footerLink3Url: e.target.value })}
                                className="w-full px-2.5 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs outline-none mt-0.5 focus:border-brand-green"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                            <div>
                              <label className="text-[10px] text-gray-400 block">Enlace 4: Texto</label>
                              <input
                                type="text"
                                value={textsForm.footerLink4Text}
                                onChange={(e) => setTextsForm({ ...textsForm, footerLink4Text: e.target.value })}
                                className="w-full px-2.5 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs outline-none mt-0.5 focus:border-brand-green"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 block">Enlace 4: URL/ID</label>
                              <input
                                type="text"
                                value={textsForm.footerLink4Url}
                                onChange={(e) => setTextsForm({ ...textsForm, footerLink4Url: e.target.value })}
                                className="w-full px-2.5 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs outline-none mt-0.5 focus:border-brand-green"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <h5 className="text-xs font-bold text-brand-green uppercase tracking-wider border-b border-white/5 pb-1">12. Estadísticas HAVN Sidebar (Propiedades Destacadas)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Dato 1 Valor (e.g. +500 propiedades)</label>
                            <input
                              type="text"
                              value={textsForm.featuredStat1Value || ""}
                              onChange={(e) => setTextsForm({ ...textsForm, featuredStat1Value: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Dato 1 Etiqueta (e.g. Portafolio curado)</label>
                            <input
                              type="text"
                              value={textsForm.featuredStat1Label || ""}
                              onChange={(e) => setTextsForm({ ...textsForm, featuredStat1Label: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Dato 2 Valor (e.g. 4.9★ Calificación)</label>
                            <input
                              type="text"
                              value={textsForm.featuredStat2Value || ""}
                              onChange={(e) => setTextsForm({ ...textsForm, featuredStat2Value: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Dato 2 Etiqueta (e.g. Estándar de satisfacción)</label>
                            <input
                              type="text"
                              value={textsForm.featuredStat2Label || ""}
                              onChange={(e) => setTextsForm({ ...textsForm, featuredStat2Label: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Dato 3 Valor (e.g. 98% Satisfacción)</label>
                            <input
                              type="text"
                              value={textsForm.featuredStat3Value || ""}
                              onChange={(e) => setTextsForm({ ...textsForm, featuredStat3Value: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Dato 3 Etiqueta (e.g. Clientes felices)</label>
                            <input
                              type="text"
                              value={textsForm.featuredStat3Label || ""}
                              onChange={(e) => setTextsForm({ ...textsForm, featuredStat3Label: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Dato 4 Valor (e.g. +120 remodelaciones)</label>
                            <input
                              type="text"
                              value={textsForm.featuredStat4Value || ""}
                              onChange={(e) => setTextsForm({ ...textsForm, featuredStat4Value: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Dato 4 Etiqueta (e.g. Proyectos completados)</label>
                            <input
                              type="text"
                              value={textsForm.featuredStat4Label || ""}
                              onChange={(e) => setTextsForm({ ...textsForm, featuredStat4Label: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <h5 className="text-xs font-bold text-brand-green uppercase tracking-wider border-b border-white/5 pb-1">13. Privacidad, Legales y Simulador</h5>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Texto de Consentimiento de Formulario de Contacto</label>
                            <textarea
                              rows={2}
                              value={textsForm.contactConsentText || ""}
                              onChange={(e) => setTextsForm({ ...textsForm, contactConsentText: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green font-medium"
                            />
                          </div>

                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Aviso Informativo del Simulador de Crédito</label>
                            <input
                              type="text"
                              value={textsForm.simulatorNoticeText || ""}
                              onChange={(e) => setTextsForm({ ...textsForm, simulatorNoticeText: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                            />
                          </div>

                          <div className="border-t border-white/5 pt-3">
                            <h6 className="text-[11px] text-brand-green font-bold uppercase tracking-wider mb-2">Aviso de Privacidad (Footer)</h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs text-gray-400 block mb-1">Archivo de Aviso de Privacidad (PDF / Imagen / URL)</label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Selecciona o pega URL..."
                                    value={textsForm.privacyPolicyUrl || ""}
                                    onChange={(e) => setTextsForm({ ...textsForm, privacyPolicyUrl: e.target.value })}
                                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => openMediaSelector((url) => setTextsForm({ ...textsForm, privacyPolicyUrl: url }))}
                                    className="px-3 bg-brand-green/20 hover:bg-brand-green/30 text-brand-green rounded-lg text-xs font-bold border border-brand-green/30 cursor-pointer"
                                  >
                                    Subir/Elegir
                                  </button>
                                </div>
                                <span className="text-[10px] text-gray-500 mt-1 block">Si subes un archivo, se abrirá directamente al pulsar "Aviso de Privacidad".</span>
                              </div>

                              <div>
                                <label className="text-xs text-gray-400 block mb-1">O escribe el Aviso de Privacidad en Texto</label>
                                <textarea
                                  rows={4}
                                  placeholder="Escribe el texto de tu aviso..."
                                  value={textsForm.privacyPolicyText || ""}
                                  onChange={(e) => setTextsForm({ ...textsForm, privacyPolicyText: e.target.value })}
                                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green font-medium"
                                />
                                <span className="text-[10px] text-gray-500 mt-1 block">Si no hay un archivo arriba, se desplegará este texto en una ventana emergente.</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => { setTextsForm(DEFAULT_PAGE_TEXTS); onUpdatePageTexts(DEFAULT_PAGE_TEXTS); showSuccess("Textos restablecidos."); }}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs cursor-pointer"
                        >
                          Restaurar Originales
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-brand-green text-brand-bg font-extrabold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Guardar Todos los Textos
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* --- TAB 4: BENEFITS MODULE --- */}
                {activeTab === "benefits" && (
                  <div className="space-y-6">
                    <div className="p-4 bg-brand-green/5 border border-brand-green/20 rounded-2xl text-xs text-brand-green">
                      💡 <strong>Módulo de Beneficios:</strong> Modifica las tarjetas de valor que se despliegan en la sección "¿Por qué HAVN?". Cada una posee un título, descripción general y un texto expandido con los detalles que ve el usuario al pulsar en ella.
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {features.map((feat, idx) => (
                        <div key={feat.id} className="glass p-5 rounded-2xl border-white/5 space-y-3 relative">
                          <span className="text-[10px] font-mono bg-white/5 text-gray-400 px-2.5 py-1 rounded-full absolute right-4 top-4">
                            Beneficio #{idx+1}
                          </span>
                          <h5 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{feat.title}</span>
                          </h5>
                          
                          <div className="space-y-3 pt-3">
                            <div>
                              <label className="text-[11px] text-gray-500 block">Título del Beneficio</label>
                              <input
                                type="text"
                                value={feat.title}
                                onChange={(e) => handleUpdateBenefit(idx, "title", e.target.value)}
                                className="w-full px-3 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs outline-none mt-0.5 focus:border-brand-green"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-gray-500 block">Slogan/Descripción Corta</label>
                              <input
                                type="text"
                                value={feat.description}
                                onChange={(e) => handleUpdateBenefit(idx, "description", e.target.value)}
                                className="w-full px-3 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs outline-none mt-0.5 focus:border-brand-green"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-gray-500 block">Descripción Detallada (Al Expandirse)</label>
                              <textarea
                                value={feat.detailedDesc}
                                onChange={(e) => handleUpdateBenefit(idx, "detailedDesc", e.target.value)}
                                rows={3}
                                className="w-full px-3 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs outline-none mt-0.5 focus:border-brand-green"
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[11px] text-gray-500 block">Etiqueta Informativa 1</label>
                                <input
                                  type="text"
                                  value={feat.bullet1 || ""}
                                  onChange={(e) => handleUpdateBenefit(idx, "bullet1", e.target.value)}
                                  className="w-full px-3 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs outline-none mt-0.5 focus:border-brand-green"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] text-gray-500 block">Etiqueta Informativa 2</label>
                                <input
                                  type="text"
                                  value={feat.bullet2 || ""}
                                  onChange={(e) => handleUpdateBenefit(idx, "bullet2", e.target.value)}
                                  className="w-full px-3 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs outline-none mt-0.5 focus:border-brand-green"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- TAB 5: JOURNEY TIMELINE --- */}
                {activeTab === "timeline" && (
                  <div className="space-y-6">
                    <div className="p-4 bg-brand-green/5 border border-brand-green/20 rounded-2xl text-xs text-brand-green">
                      🎯 <strong>Timeline Viaje HAVN:</strong> Configura los pasos de la experiencia de compra en línea que tiene el cliente. Puedes redefinir los nombres de los pasos de adquisición.
                    </div>

                    <div className="space-y-4">
                      {steps.map((step, idx) => (
                        <div key={step.number} className="glass p-5 rounded-2xl border-white/5 flex flex-col md:flex-row gap-4 items-center">
                          <div className="w-12 h-12 rounded-xl bg-brand-green text-brand-bg flex items-center justify-center font-extrabold text-base shrink-0">
                            {step.number}
                          </div>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            <div>
                              <label className="text-[11px] text-gray-500 block">Nombre del Paso {step.number}</label>
                              <input
                                type="text"
                                value={step.title}
                                onChange={(e) => handleUpdateStep(idx, "title", e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none mt-0.5"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-gray-500 block">Descripción del Paso {step.number}</label>
                              <input
                                type="text"
                                value={step.description}
                                onChange={(e) => handleUpdateStep(idx, "description", e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none mt-0.5"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- TAB 6: HAVN FLIP STATS --- */}
                {activeTab === "flip" && (
                  <div className="glass p-6 rounded-3xl border-white/5 space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-green" />
                        Estadísticas de Inversión y Modelos Havn Flip
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">Modifica los números clave y las imágenes del slider interactivo del modelo Havn Flip.</p>
                    </div>

                    <form onSubmit={handleSaveFlipData} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">Plazo de Ejecución</label>
                          <input
                            type="text"
                            value={flipForm.time}
                            onChange={(e) => setFlipForm({ ...flipForm, time: e.target.value })}
                            placeholder="Ej. 94 días"
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-brand-green"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">Aumento de Valor de la Propiedad</label>
                          <input
                            type="text"
                            value={flipForm.valueInc}
                            onChange={(e) => setFlipForm({ ...flipForm, valueInc: e.target.value })}
                            placeholder="Ej. +34%"
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-brand-green"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs text-gray-400">Imagen "Antes" (Remodelación)</label>
                            <button
                              type="button"
                              onClick={() => openMediaSelector((url) => setFlipForm({ ...flipForm, beforeImage: url }))}
                              className="text-[10px] text-brand-green hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Image className="w-3 h-3" /> Seleccionar
                            </button>
                          </div>
                          <input
                            type="text"
                            value={flipForm.beforeImage}
                            onChange={(e) => setFlipForm({ ...flipForm, beforeImage: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-brand-green"
                          />
                          <div className="mt-2 text-[10px] text-gray-500 truncate">Preview: {flipForm.beforeImage}</div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs text-gray-400">Imagen "Después" (Propiedad Premium)</label>
                            <button
                              type="button"
                              onClick={() => openMediaSelector((url) => setFlipForm({ ...flipForm, afterImage: url }))}
                              className="text-[10px] text-brand-green hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Image className="w-3 h-3" /> Seleccionar
                            </button>
                          </div>
                          <input
                            type="text"
                            value={flipForm.afterImage}
                            onChange={(e) => setFlipForm({ ...flipForm, afterImage: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-brand-green"
                          />
                          <div className="mt-2 text-[10px] text-gray-500 truncate">Preview: {flipForm.afterImage}</div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          className="px-5 py-2 bg-brand-green text-brand-bg font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Actualizar Estadísticas Flip
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* --- TAB: FINANCING SERVICES --- */}
                {activeTab === "financing_services" && (
                  <div className="space-y-6">
                    <div className="glass p-6 rounded-3xl border-white/5 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <Settings className="w-4 h-4 text-brand-green" />
                            Biblioteca de Servicios Financieros
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">Configura las tarjetas de crédito, tasas o hipotecas disponibles en el Simulador de la Web.</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddFinancingService}
                          className="px-4 py-2 bg-brand-green hover:bg-brand-green/90 text-brand-bg font-extrabold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          Añadir Servicio
                        </button>
                      </div>

                      <form onSubmit={handleSaveFinancingServices} className="space-y-6">
                        <div className="space-y-4">
                          {financingServicesList.map((service, index) => (
                            <div key={service.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 relative group">
                              <div className="absolute top-4 right-4 flex items-center gap-2">
                                <label className="flex items-center gap-1.5 text-[10px] text-gray-400 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={service.isDark || false}
                                    onChange={(e) => handleUpdateFinancingServiceField(index, "isDark", e.target.checked)}
                                    className="rounded border-white/10 bg-[#0e121a] text-brand-green focus:ring-brand-green"
                                  />
                                  <span>Tarjeta Oscura (Diseño Destacado)</span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFinancingService(index)}
                                  className="p-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-all cursor-pointer ml-2"
                                  title="Eliminar Servicio"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-xs text-gray-400 block mb-1">Título del Servicio *</label>
                                  <input
                                    type="text"
                                    value={service.title}
                                    onChange={(e) => handleUpdateFinancingServiceField(index, "title", e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-brand-green"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-400 block mb-1">Etiqueta / Badge *</label>
                                  <input
                                    type="text"
                                    value={service.badge}
                                    onChange={(e) => handleUpdateFinancingServiceField(index, "badge", e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-brand-green"
                                    required
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="text-xs text-gray-400 block mb-1">Descripción corta *</label>
                                  <textarea
                                    value={service.description}
                                    onChange={(e) => handleUpdateFinancingServiceField(index, "description", e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-brand-green"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-400 block mb-1">Texto del Botón *</label>
                                  <input
                                    type="text"
                                    value={service.buttonText || "Saber más"}
                                    onChange={(e) => handleUpdateFinancingServiceField(index, "buttonText", e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-brand-green"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          ))}

                          {financingServicesList.length === 0 && (
                            <div className="py-12 text-center text-xs text-gray-500">
                              No hay ningún servicio financiero creado. Haz clic en "Añadir Servicio" para agregar uno.
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            className="px-5 py-2 bg-brand-green text-brand-bg font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            Guardar Servicios Financieros
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* --- TAB 7: TESTIMONIALS --- */}
                {activeTab === "testimonials" && (
                  <div className="space-y-6">
                    <div className="glass p-5 rounded-3xl border-white/5">
                      <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-brand-green" />
                        {editingTestimonialId ? "Modificar Testimonio Seleccionado" : "Añadir Nuevo Testimonio de Cliente"}
                      </h4>

                      <form onSubmit={handleSaveTestimonial} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Nombre Completo *</label>
                            <input
                              type="text"
                              value={testName}
                              onChange={(e) => setTestName(e.target.value)}
                              placeholder="Ej. Sofía & Alejandro Pérez"
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-brand-green"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Rol / Profesión *</label>
                            <input
                              type="text"
                              value={testRole}
                              onChange={(e) => setTestRole(e.target.value)}
                              placeholder="Ej. Emprendedores / Directivos"
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-brand-green"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Ciudad (México) *</label>
                            <input
                              type="text"
                              value={testLocation}
                              onChange={(e) => setTestLocation(e.target.value)}
                              placeholder="Ej. Monterrey"
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-brand-green"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Puntuación Estrellas (1-5)</label>
                            <select
                              value={testRating}
                              onChange={(e) => setTestRating(parseInt(e.target.value, 10))}
                              className="w-full px-3 py-2 rounded-lg bg-[#0e121a] border border-white/10 text-white text-xs outline-none"
                            >
                              <option value="5">⭐⭐⭐⭐⭐ (5 Estrellas)</option>
                              <option value="4">⭐⭐⭐⭐ (4 Estrellas)</option>
                              <option value="3">⭐⭐⭐ (3 Estrellas)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs text-gray-400">Foto de Perfil / Avatar URL</label>
                            <button
                              type="button"
                              onClick={() => openMediaSelector((url) => setTestAvatar(url))}
                              className="text-[10px] text-brand-green hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Image className="w-3 h-3" /> Seleccionar de Biblioteca
                            </button>
                          </div>
                          <input
                            type="text"
                            value={testAvatar}
                            onChange={(e) => setTestAvatar(e.target.value)}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-brand-green"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-gray-400 block mb-1">Comentario / Opinión de Cliente *</label>
                          <textarea
                            value={testComment}
                            onChange={(e) => setTestComment(e.target.value)}
                            rows={3}
                            placeholder="Escribe la reseña que el cliente ha otorgado a la plataforma..."
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-brand-green"
                            required
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          {editingTestimonialId && (
                            <button
                              type="button"
                              onClick={clearTestimonialForm}
                              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-xs cursor-pointer"
                            >
                              Cancelar
                            </button>
                          )}
                          <button
                            type="submit"
                            className="px-5 py-2 bg-brand-green text-brand-bg font-extrabold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            {editingTestimonialId ? "Modificar Testimonio" : "Registrar Testimonio"}
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="glass rounded-3xl border-white/5 overflow-hidden">
                      <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                        <h5 className="text-xs font-bold text-white">Testimonios Vigentes ({testimonials.length})</h5>
                      </div>
                      <div className="p-4 space-y-3">
                        {testimonials.map((test) => (
                          <div key={test.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start justify-between flex-wrap md:flex-nowrap gap-4">
                            <div className="flex items-center gap-3">
                              <img src={test.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />
                              <div>
                                <span className="text-xs font-bold text-white block">{test.name}</span>
                                <span className="text-[10px] text-gray-500 block">{test.role} • {test.location}</span>
                                <span className="text-[10px] text-brand-green block">{"★".repeat(test.rating)}</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-400 italic flex-1 max-w-xl md:mx-4">
                              “{test.comment}”
                            </p>
                            <div className="flex gap-1.5 shrink-0">
                              <button
                                onClick={() => startEditTestimonial(test)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTestimonial(test.id)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-gray-300 hover:text-red-400 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB 8: DESIGN CUSTOMIZER --- */}
                {activeTab === "design" && (
                  <div className="space-y-6">
                    {/* Visual Customizer Form */}
                    <div className="glass p-6 rounded-3xl border-white/5 space-y-6">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Palette className="w-4 h-4 text-brand-green" />
                          Personalizador de Estilo WordPress
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">Configura las variables de diseño globales, tipografías e identidad visual de HAVN de forma inmediata.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* LEFT: Color picking and presets */}
                        <div className="space-y-4">
                          <h5 className="text-xs font-bold text-brand-green uppercase tracking-wider pb-1 border-b border-white/5">Paleta de Colores Corporativos</h5>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs text-gray-400 block mb-1">Color de Acento (Verde HAVN / Destacados)</label>
                              <div className="flex gap-2">
                                <input
                                  type="color"
                                  value={inputGreenColor}
                                  onChange={(e) => setInputGreenColor(e.target.value)}
                                  className="w-10 h-9 p-0.5 rounded border border-white/10 bg-[#0e121a] cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={inputGreenColor}
                                  onChange={(e) => setInputGreenColor(e.target.value)}
                                  className="flex-1 px-3 py-1 bg-white/5 border border-white/10 text-xs text-white rounded font-mono"
                                />
                              </div>
                              {/* Color presets */}
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {colorPresets.map((preset) => (
                                  <button
                                    key={preset.hex}
                                    type="button"
                                    onClick={() => setInputGreenColor(preset.hex)}
                                    className="px-2 py-1 rounded text-[9px] font-bold border border-white/5 hover:border-white/20 hover:bg-white/5 text-gray-400 flex items-center gap-1 cursor-pointer"
                                  >
                                    <span className="w-2.5 h-2.5 rounded-full inline-block border border-white/10" style={{ backgroundColor: preset.hex }} />
                                    {preset.name.split(" ")[0]}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="pt-2">
                              <label className="text-xs text-gray-400 block mb-1">Fondo Principal de la Web</label>
                              <div className="flex gap-2">
                                <input
                                  type="color"
                                  value={inputBgColor}
                                  onChange={(e) => setInputBgColor(e.target.value)}
                                  className="w-10 h-9 p-0.5 rounded border border-white/10 bg-[#0e121a] cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={inputBgColor}
                                  onChange={(e) => setInputBgColor(e.target.value)}
                                  className="flex-1 px-3 py-1 bg-white/5 border border-white/10 text-xs text-white rounded font-mono"
                                />
                              </div>
                              {/* Bg presets */}
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {bgPresets.map((preset) => (
                                  <button
                                    key={preset.hex}
                                    type="button"
                                    onClick={() => setInputBgColor(preset.hex)}
                                    className="px-2 py-1 rounded text-[9px] font-bold border border-white/5 hover:border-white/20 hover:bg-white/5 text-gray-400 flex items-center gap-1 cursor-pointer"
                                  >
                                    <span className="w-2.5 h-2.5 rounded-full inline-block border border-white/10" style={{ backgroundColor: preset.hex }} />
                                    {preset.name.split(" ")[0]}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* RIGHT: Typography and Layout settings */}
                        <div className="space-y-4">
                          <h5 className="text-xs font-bold text-brand-green uppercase tracking-wider pb-1 border-b border-white/5">Tipografía y Diseño de Autor</h5>
                          
                          <div>
                            <label className="text-xs text-gray-400 block mb-2">Tema Tipográfico Principal</label>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { name: "Plus Jakarta Sans", desc: "Modern & Dynamic (Default)" },
                                { name: "Inter", desc: "Swiss Minimalist" },
                                { name: "Playfair Display", desc: "Editorial Luxury Serif" },
                                { name: "JetBrains Mono", desc: "Tech / Brutalist Mono" }
                              ].map((font) => (
                                <button
                                  key={font.name}
                                  type="button"
                                  onClick={() => setInputFont(font.name)}
                                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer block ${
                                    inputFont === font.name
                                      ? "bg-brand-green/10 border-brand-green text-white"
                                      : "bg-white/5 border-white/5 hover:bg-white/10 text-gray-300"
                                  }`}
                                >
                                  <span className="text-xs font-bold block">{font.name}</span>
                                  <span className="text-[9px] text-gray-500 mt-1 block">{font.desc}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => {
                            setInputGreenColor("#00C389");
                            setInputBgColor("#080A0F");
                            setInputFont("Plus Jakarta Sans");
                            onUpdateBranding("#00C389", "#080A0F", "Plus Jakarta Sans");
                            showSuccess("Tema visual reajustado.");
                          }}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs cursor-pointer"
                        >
                          Resetear Paleta
                        </button>
                        <button
                          type="button"
                          onClick={handleApplyBranding}
                          className="px-6 py-2 bg-brand-green text-brand-bg font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Aplicar Cambios Visuales
                        </button>
                      </div>
                    </div>

                    {/* Section Visibilities Toggles */}
                    <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
                      <div>
                        <h5 className="text-sm font-bold text-white">Gestor de Módulos (Visibilidad de Secciones)</h5>
                        <p className="text-xs text-gray-400 mt-1">Activa o desactiva por completo secciones de la página de inicio con un solo interruptor.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                        {[
                          { key: "hero", label: "Sección de Bienvenida (Hero)" },
                          { key: "premier", label: "HAVN Premier (Lujo)" },
                          { key: "featured", label: "Propiedades Destacadas" },
                          { key: "inventory", label: "Nuestras Propiedades (Todas)" },
                          { key: "whyHavn", label: "¿Por qué HAVN? (Beneficios)" },
                          { key: "timeline", label: "Timeline de Compra (Viaje)" },
                          { key: "flip", label: "Inversión Havn Flip" },
                          { key: "financing", label: "Servicios Financieros (Simulador)" },
                          { key: "testimonials", label: "Testimonios de Clientes" },
                          { key: "contact", label: "Formulario de Contacto" }
                        ].map((section) => {
                          const isVisible = visibleSections[section.key as keyof VisibleSections];
                          return (
                            <div 
                              key={section.key} 
                              onClick={() => handleToggleSection(section.key as keyof VisibleSections)}
                              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer select-none ${
                                isVisible 
                                  ? "bg-brand-green/10 border-brand-green/35 text-white shadow-sm" 
                                  : "bg-white/[0.02] border-white/5 text-gray-500"
                              }`}
                            >
                              <div>
                                <span className="text-xs font-bold block">{section.label}</span>
                                <span className="text-[10px] text-gray-500 block mt-0.5">
                                  {isVisible ? "● Activa en la web" : "○ Ocultada temporalmente"}
                                </span>
                              </div>
                              <div className={`w-8 h-5 rounded-full p-0.5 transition-all duration-300 ${isVisible ? "bg-brand-green" : "bg-white/10"}`}>
                                <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${isVisible ? "translate-x-3" : "translate-x-0"}`} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB 9: MEDIA LIBRARY --- */}
                {activeTab === "media" && (
                  <div className="space-y-6">
                    <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <Image className="w-4 h-4 text-brand-green" />
                            Biblioteca de Medios HAVN
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">Sube imágenes y videos directamente desde tu computadora y selecciónalos al editar propiedades y textos sin necesidad de links externos.</p>
                        </div>
                        
                        {/* File Upload Trigger */}
                        <label className="px-4 py-2.5 bg-brand-green hover:bg-brand-green/90 text-brand-bg font-extrabold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all shrink-0 justify-center">
                          <Plus className="w-4 h-4" />
                          Subir Archivo
                          <input 
                            type="file" 
                            accept="image/*,video/*" 
                            className="hidden" 
                            onChange={handleUploadFile}
                            multiple
                          />
                        </label>
                      </div>

                      {/* Search Bar */}
                      <div className="pt-2">
                        <input
                          type="text"
                          placeholder="Buscar por nombre de archivo..."
                          value={mediaSearchQuery}
                          onChange={(e) => setMediaSearchQuery(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:ring-1 focus:ring-brand-green"
                        />
                      </div>
                    </div>

                    {/* Media Items Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {mediaItems
                        .filter((item) => item.name.toLowerCase().includes(mediaSearchQuery.toLowerCase()))
                        .map((item) => (
                          <div key={item.id} className="glass rounded-2xl border-white/5 overflow-hidden group relative flex flex-col bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                            
                            {/* Visual Asset Container */}
                            <div className="aspect-[4/3] w-full bg-black/40 relative flex items-center justify-center overflow-hidden border-b border-white/5">
                              {item.type === "image" ? (
                                <img 
                                  src={item.url} 
                                  alt={item.name} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  referrerPolicy="no-referrer"
                                />
                              ) : item.type === "video" ? (
                                <video 
                                  src={item.url} 
                                  className="w-full h-full object-cover" 
                                  muted 
                                  loop 
                                  playsInline
                                />
                              ) : (
                                <FileText className="w-8 h-8 text-gray-500" />
                              )}

                              {/* Mobile-friendly and Desktop top-right persistent Delete button */}
                              <div className="absolute top-2 right-2 z-10">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`¿Estás seguro de eliminar "${item.name}" de la biblioteca?`)) {
                                      const filtered = mediaItems.filter((m) => m.id !== item.id);
                                      saveMediaItems(filtered);
                                      showSuccess("Archivo eliminado de la biblioteca.");
                                    }
                                  }}
                                  className="p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-lg shadow-lg active:scale-95 transition-all cursor-pointer"
                                  title="Eliminar archivo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Hover copy URL button */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(item.url);
                                    showSuccess("¡URL copiada al portapapeles!");
                                  }}
                                  className="px-3 py-1.5 bg-brand-green text-brand-bg rounded-lg hover:scale-110 active:scale-95 transition-all cursor-pointer font-extrabold text-xs shadow-lg"
                                  title="Copiar URL"
                                >
                                  Copiar Link
                                </button>
                              </div>
                            </div>

                            {/* Details footer */}
                            <div className="p-3 flex-1 flex flex-col justify-between min-w-0">
                              <span className="text-[11px] font-bold text-white truncate block" title={item.name}>
                                {item.name}
                              </span>
                              <div className="flex items-center justify-between text-[9px] text-gray-500 font-medium mt-1">
                                <span>{item.size || "N/A"}</span>
                                <span>{item.uploadedAt}</span>
                              </div>
                            </div>
                          </div>
                        ))}

                      {mediaItems.filter((item) => item.name.toLowerCase().includes(mediaSearchQuery.toLowerCase())).length === 0 && (
                        <div className="col-span-full py-12 text-center text-xs text-gray-500">
                          No se encontraron archivos en la biblioteca. ¡Sube tu primer archivo!
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* --- TAB 11: LEADS --- */}
                {activeTab === "leads" && (
                  <div className="space-y-6 text-white animate-fadeIn">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="text-xl font-extrabold flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-brand-green" />
                          Leads de Contacto Registrados
                        </h4>
                        <p className="text-xs text-gray-400 mt-1 font-semibold">
                          Consola en tiempo real de formularios completados por interesados en comprar o vender.
                        </p>
                      </div>

                      <button
                        onClick={fetchLeads}
                        disabled={isLoadingLeads}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLeads ? 'animate-spin' : ''}`} />
                        Sincronizar Firestore
                      </button>
                    </div>

                    {/* Stats Summary cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="glass p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
                        <span className="text-xs text-gray-400 font-semibold block">Total Leads</span>
                        <span className="text-3xl font-extrabold mt-1 block text-white">{leads.length}</span>
                        <span className="text-[10px] text-gray-500 font-bold block mt-2">Registrados en la nube</span>
                      </div>
                      <div className="glass p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
                        <span className="text-xs text-gray-400 font-semibold block">Compradores</span>
                        <span className="text-3xl font-extrabold mt-1 block text-brand-green">
                          {leads.filter(l => l.intent === "buy").length}
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold block mt-2">Interés de compra</span>
                      </div>
                      <div className="glass p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
                        <span className="text-xs text-gray-400 font-semibold block">Vendedores</span>
                        <span className="text-3xl font-extrabold mt-1 block text-amber-500">
                          {leads.filter(l => l.intent === "sell").length}
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold block mt-2">Interés de venta</span>
                      </div>
                    </div>

                    {/* Leads Table Container */}
                    <div className="glass rounded-3xl border border-white/5 bg-[#0e121a] overflow-hidden">
                      {isLoadingLeads ? (
                        <div className="py-24 text-center space-y-4">
                          <svg className="animate-spin h-8 w-8 text-brand-green mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="text-xs text-gray-400 font-bold">Descargando leads desde base de datos segura...</p>
                        </div>
                      ) : leads.length === 0 ? (
                        <div className="py-24 text-center space-y-3">
                          <MessageSquare className="w-12 h-12 text-gray-600 mx-auto" />
                          <h5 className="text-sm font-bold text-white">No hay leads todavía</h5>
                          <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                            Los contactos que se registren en el sitio de HAVN aparecerán automáticamente en esta sección listos para ser atendidos.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-white/5 text-gray-400 uppercase tracking-wider text-[9px] font-extrabold border-b border-white/5">
                              <tr>
                                <th className="p-4">Fecha</th>
                                <th className="p-4">Interesado</th>
                                <th className="p-4">Contacto</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4">Presupuesto</th>
                                <th className="p-4 text-right">Acciones</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="p-4 text-gray-400 font-medium whitespace-nowrap">
                                    {lead.createdAt ? new Date(lead.createdAt).toLocaleString("es-MX", {
                                      day: "2-digit",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    }) : "N/A"}
                                  </td>
                                  <td className="p-4">
                                    <div className="font-bold text-white">{lead.name}</div>
                                  </td>
                                  <td className="p-4 space-y-1">
                                    <div className="text-gray-300 font-semibold">{lead.phone}</div>
                                    <div className="text-gray-400 font-semibold">{lead.email}</div>
                                  </td>
                                  <td className="p-4">
                                    {lead.intent === "buy" ? (
                                      <span className="px-2 py-1 rounded bg-brand-green/10 text-brand-green border border-brand-green/10 text-[10px] font-bold uppercase">
                                        Comprar
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/10 text-[10px] font-bold uppercase">
                                        Vender
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-4 text-white font-bold whitespace-nowrap">
                                    {lead.budget === "5m-15m" ? "$5M - $15M" :
                                     lead.budget === "15m-30m" ? "$15M - $30M" :
                                     lead.budget === "30m-50m" ? "$30M - $50M" :
                                     lead.budget === "50m+" ? "Más de $50M" :
                                     lead.budget === "" ? "No especificado" :
                                     lead.budget}
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center justify-end gap-2">
                                      <a
                                        href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Chatear por WhatsApp"
                                        className="p-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] rounded-lg transition-all"
                                      >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                      </a>
                                      <a
                                        href={`mailto:${lead.email}`}
                                        title="Enviar correo electrónico"
                                        className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-lg transition-all"
                                      >
                                        <Mail className="w-3.5 h-3.5" />
                                      </a>
                                      <button
                                        onClick={() => handleDeleteLead(lead.id)}
                                        title="Eliminar Lead"
                                        className="p-1.5 bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 text-red-400 rounded-lg transition-all cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

      </motion.div>

      {/* MEDIA SELECTOR MODAL OVERLAY */}
      <AnimatePresence>
        {mediaSelectorOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMediaSelectorOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-4xl bg-[#090b11] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] z-10"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/5 bg-[#0b0e16] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Image className="w-4 h-4 text-brand-green" />
                    Seleccionar Medio desde Biblioteca
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Haz clic en cualquier imagen o video para asignarlo directamente al campo de edición.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMediaSelectorOpen(false)}
                  className="p-1.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Upload & Search Zone inside selector */}
              <div className="p-4 border-b border-white/5 bg-[#0e111b] flex flex-col sm:flex-row gap-3 items-center justify-between">
                <input
                  type="text"
                  placeholder="Buscar medio..."
                  value={mediaSearchQuery}
                  onChange={(e) => setMediaSearchQuery(e.target.value)}
                  className="w-full sm:max-w-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none"
                />

                <label className="px-3 py-1.5 bg-brand-green/20 border border-brand-green/30 text-brand-green hover:bg-brand-green/35 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-all">
                  <Plus className="w-3.5 h-3.5" />
                  Subir nuevo archivo
                  <input 
                    type="file" 
                    accept="image/*,video/*" 
                    className="hidden" 
                    onChange={handleUploadFile}
                  />
                </label>
              </div>

              {/* Selector Scroll Area */}
              <div className="flex-1 overflow-y-auto p-6 bg-[#07090e]">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {mediaItems
                    .filter((item) => item.name.toLowerCase().includes(mediaSearchQuery.toLowerCase()))
                    .map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => handleSelectMedia(item.url)}
                        className="group bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-brand-green/45 rounded-xl overflow-hidden cursor-pointer transition-all flex flex-col p-2 relative"
                      >
                        <div className="aspect-[4/3] bg-black/40 rounded-lg overflow-hidden relative flex items-center justify-center">
                          {item.type === "image" ? (
                            <img 
                              src={item.url} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : item.type === "video" ? (
                            <video 
                              src={item.url} 
                              className="w-full h-full object-cover" 
                              muted
                            />
                          ) : (
                            <FileText className="w-6 h-6 text-gray-500" />
                          )}

                          {/* Delete button inside the selector modal */}
                          <div className="absolute top-1.5 right-1.5 z-10">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`¿Estás seguro de eliminar "${item.name}" de la biblioteca?`)) {
                                  const filtered = mediaItems.filter((m) => m.id !== item.id);
                                  saveMediaItems(filtered);
                                  showSuccess("Archivo eliminado de la biblioteca.");
                                }
                              }}
                              className="p-1 bg-red-600 hover:bg-red-700 text-white rounded shadow-md active:scale-95 transition-all cursor-pointer"
                              title="Eliminar de la biblioteca"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="absolute inset-0 bg-brand-green/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="px-2 py-1 bg-brand-green text-brand-bg font-extrabold text-[10px] rounded shadow-lg">Asignar</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-300 mt-2 truncate block px-1" title={item.name}>
                          {item.name}
                        </span>
                      </div>
                    ))}

                  {mediaItems.filter((item) => item.name.toLowerCase().includes(mediaSearchQuery.toLowerCase())).length === 0 && (
                    <div className="col-span-full py-12 text-center text-xs text-gray-500">
                      No se encontraron elementos en la biblioteca.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
