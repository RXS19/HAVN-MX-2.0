import React, { useState, useEffect } from "react";
import { Undo2, Redo2 } from "lucide-react";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { FeaturedProperties } from "./components/FeaturedProperties";
import { HavnPremier } from "./components/HavnPremier";
import { OurProperties } from "./components/OurProperties";
import { WhyHavn } from "./components/WhyHavn";
import { ProcessTimeline } from "./components/ProcessTimeline";
import { HavnFlipSection } from "./components/HavnFlipSection";
import { FinancingSection } from "./components/FinancingSection";
import { TestimonialsCarousel } from "./components/TestimonialsCarousel";
import { ContactForm } from "./components/ContactForm";
import { PropertyModal } from "./components/PropertyModal";
import { Footer } from "./components/Footer";
import { SuperAdminPanel } from "./components/SuperAdminPanel";
import { Chatbot } from "./components/Chatbot";
import { Property, Testimonial, ProcessStep, HavnFeature, FinancingService } from "./types";
import { PROPERTIES, TESTIMONIALS, PROCESS_STEPS, HAVN_FEATURES, FLIP_DATA, FINANCING_SERVICES } from "./data";
import { db, doc, getDoc, setDoc, onSnapshot, collection, getDocs, deleteDoc } from "./lib/firebase";

const DEFAULT_PAGE_TEXTS = {
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

const DEFAULT_VISIBLE_SECTIONS = {
  hero: true,
  premier: true,
  featured: true,
  inventory: true,
  whyHavn: true,
  timeline: true,
  flip: true,
  financing: true,
  testimonials: true,
  contact: true
};

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

export default function App() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [inventoryActiveTag, setInventoryActiveTag] = useState("Todas");

  // 1. Properties State
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = safeGetItem("havn_properties");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return PROPERTIES;
  });

  // 2. Page Texts State
  const [pageTexts, setPageTexts] = useState(() => {
    const saved = safeGetItem("havn_page_texts");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_PAGE_TEXTS;
  });

  // 3. Brand Colors State
  const [brandGreenColor, setBrandGreenColor] = useState(() => {
    const saved = safeGetItem("havn_brand_green");
    if (saved === "#3BE37A") {
      safeSetItem("havn_brand_green", "#00C389");
      return "#00C389";
    }
    return saved || "#00C389";
  });
  const [brandBgColor, setBrandBgColor] = useState(() => {
    return safeGetItem("havn_brand_bg") || "#080A0F";
  });

  // 4. Font State
  const [selectedFont, setSelectedFont] = useState(() => {
    return safeGetItem("havn_selected_font") || "Plus Jakarta Sans";
  });

  // 5. Visible Sections State
  const [visibleSections, setVisibleSections] = useState(() => {
    const saved = safeGetItem("havn_visible_sections");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_VISIBLE_SECTIONS;
  });

  // 6. Special features/benefits list
  const [features, setFeatures] = useState<HavnFeature[]>(() => {
    const saved = safeGetItem("havn_features");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Correct icon for remodeling feature to RefreshCw if cached with Sparkles
        return parsed.map((f: any) => f.id === "feat-remodelar" ? { ...f, iconName: "RefreshCw" } : f).filter((f: any) => f.id !== "feat-invertir");
      } catch (e) {
        console.error(e);
      }
    }
    return HAVN_FEATURES;
  });

  // 7. Timeline Journey Steps
  const [steps, setSteps] = useState<ProcessStep[]>(() => {
    const saved = safeGetItem("havn_steps");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return PROCESS_STEPS;
  });

  // 8. Testimonials List
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    const saved = safeGetItem("havn_testimonials");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return TESTIMONIALS;
  });

  // 9. Havn Flip Stats
  const [flipData, setFlipData] = useState(() => {
    const saved = safeGetItem("havn_flip_data");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return FLIP_DATA;
  });

  // 10. Financing Services State
  const [financingServices, setFinancingServices] = useState<FinancingService[]>(() => {
    const saved = safeGetItem("havn_financing_services");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return FINANCING_SERVICES;
  });

  // 11. Load persistent settings from Firebase Firestore on mount (with real-time updates)
  useEffect(() => {
    const settingsColl = collection(db, "settings");
    
    const unsubscribe = onSnapshot(settingsColl, (querySnap) => {
      try {
        const loadedProperties: Property[] = [];
        let hasProperties = false;
        let mainData: any = null;
        
        querySnap.forEach((docSnap) => {
          if (docSnap.id === "main") {
            mainData = docSnap.data();
          } else if (docSnap.id.startsWith("property_")) {
            hasProperties = true;
            const propData = docSnap.data();
            // Remove authorization and metadata fields from the state property
            const { adminPassword, updatedAt, ...property } = propData;
            loadedProperties.push(property as Property);
          }
        });

        if (mainData) {
          if (mainData.pageTexts) {
            setPageTexts(mainData.pageTexts);
            safeSetItem("havn_page_texts", JSON.stringify(mainData.pageTexts));
          }
          if (mainData.brandGreenColor) {
            setBrandGreenColor(mainData.brandGreenColor);
            safeSetItem("havn_brand_green", mainData.brandGreenColor);
          }
          if (mainData.brandBgColor) {
            setBrandBgColor(mainData.brandBgColor);
            safeSetItem("havn_brand_bg", mainData.brandBgColor);
          }
          if (mainData.selectedFont) {
            setSelectedFont(mainData.selectedFont);
            safeSetItem("havn_selected_font", mainData.selectedFont);
          }
          if (mainData.visibleSections) {
            setVisibleSections(mainData.visibleSections);
            safeSetItem("havn_visible_sections", JSON.stringify(mainData.visibleSections));
          }
          if (mainData.features) {
            setFeatures(mainData.features);
            safeSetItem("havn_features", JSON.stringify(mainData.features));
          }
          if (mainData.steps) {
            setSteps(mainData.steps);
            safeSetItem("havn_steps", JSON.stringify(mainData.steps));
          }
          if (mainData.testimonials) {
            setTestimonials(mainData.testimonials);
            safeSetItem("havn_testimonials", JSON.stringify(mainData.testimonials));
          }
          if (mainData.flipData) {
            setFlipData(mainData.flipData);
            safeSetItem("havn_flip_data", JSON.stringify(mainData.flipData));
          }
          if (mainData.financingServices) {
            setFinancingServices(mainData.financingServices);
            safeSetItem("havn_financing_services", JSON.stringify(mainData.financingServices));
          }

          // Load properties only if they were initialized in the database
          const isInitialized = mainData.propertiesInitialized === true;
          if (isInitialized) {
            const propertyOrder = mainData.propertyOrder || [];
            if (propertyOrder.length > 0) {
              loadedProperties.sort((a, b) => {
                const idxA = propertyOrder.indexOf(a.id);
                const idxB = propertyOrder.indexOf(b.id);
                const valA = idxA === -1 ? 9999 : idxA;
                const valB = idxB === -1 ? 9999 : idxB;
                return valA - valB;
              });
            }
            setProperties(loadedProperties);
            safeSetItem("havn_properties", JSON.stringify(loadedProperties));
          }
        }
      } catch (err) {
        console.error("Error al procesar la actualización en tiempo real desde Firestore:", err);
      }
    }, (err: any) => {
      console.error("Error al suscribirse a la configuración en Firestore:", err);
      setFirestoreStatus("error");
      setFirestoreError(`La base de datos de Firestore ha excedido su límite de cuota diaria o se encuentra offline. La plataforma está operando en Modo Offline de forma segura utilizando los datos locales respaldados en el dispositivo.`);
    });

    return () => unsubscribe();
  }, []);

  const saveAllToFirestore = async (overrideState: any) => {
    // Only save to Firestore if logged in as admin
    const isAdmin = isAdminLoggedIn || safeGetItem("havn_admin_session") === "active";
    if (!isAdmin) return;

    setFirestoreStatus("saving");
    setFirestoreError(null);

    try {
      // Helper to compress base64 images to avoid 1MB Firestore limit
      const compressBase64 = (base64Str: string): Promise<string> => {
        if (!base64Str || !base64Str.startsWith("data:image/")) {
          return Promise.resolve(base64Str);
        }
        // If it's already a very small base64 string, keep it as is
        if (base64Str.length < 50000) {
          return Promise.resolve(base64Str);
        }
        return new Promise((resolve) => {
          const img = document.createElement("img");
          img.src = base64Str;
          img.onload = () => {
            try {
              const canvas = document.createElement("canvas");
              const maxWidth = 1000;
              const maxHeight = 1000;
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
              const compressed = canvas.toDataURL("image/jpeg", 0.7);
              resolve(compressed);
            } catch (e) {
              console.error("Error in fallback compressBase64:", e);
              resolve(base64Str);
            }
          };
          img.onerror = () => {
            resolve(base64Str);
          };
        });
      };

      const rawProperties = overrideState.properties !== undefined ? overrideState.properties : properties;
      const rawPageTexts = overrideState.pageTexts !== undefined ? overrideState.pageTexts : pageTexts;

      // Compress all property images before saving
      const compressedProperties = await Promise.all(
        rawProperties.map(async (prop: Property) => {
          const mainImage = await compressBase64(prop.image);
          const additionalImages = prop.images 
            ? await Promise.all(prop.images.map(img => compressBase64(img)))
            : undefined;
          return {
            ...prop,
            image: mainImage,
            images: additionalImages
          };
        })
      );

      // Compress page texts images
      let compressedPageTexts = { ...rawPageTexts };
      if (compressedPageTexts.heroImage) {
        compressedPageTexts.heroImage = await compressBase64(compressedPageTexts.heroImage);
      }

      // Sync the compressed versions back to React state and local storage
      if (overrideState.properties !== undefined || rawProperties !== properties) {
        setProperties(compressedProperties);
        safeSetItem("havn_properties", JSON.stringify(compressedProperties));
      }
      if (overrideState.pageTexts !== undefined || rawPageTexts !== pageTexts) {
        setPageTexts(compressedPageTexts);
        safeSetItem("havn_page_texts", JSON.stringify(compressedPageTexts));
      }

      const removeUndefined = (obj: any): any => {
        if (Array.isArray(obj)) {
          return obj.map(removeUndefined);
        } else if (obj !== null && typeof obj === 'object') {
          return Object.entries(obj).reduce((acc: any, [key, val]) => {
            if (val !== undefined) {
              acc[key] = removeUndefined(val);
            }
            return acc;
          }, {});
        }
        return obj;
      };

      // 1. Fetch all documents in the settings collection to perform a self-cleaning cleanup
      const querySnap = await getDocs(collection(db, "settings"));
      const existingPropDocIds: string[] = [];
      querySnap.forEach((docSnap) => {
        if (docSnap.id.startsWith("property_")) {
          existingPropDocIds.push(docSnap.id);
        }
      });

      // 2. Identify stale properties to delete
      const currentPropDocIds = compressedProperties.map(p => `property_${p.id}`);
      const docsToDelete = existingPropDocIds.filter(id => !currentPropDocIds.includes(id));

      // 3. Delete stale properties
      await Promise.all(
        docsToDelete.map(async (docId) => {
          const docRef = doc(db, "settings", docId);
          await deleteDoc(docRef);
        })
      );

      // 4. Save/update current properties as individual documents under the collection
      await Promise.all(
        compressedProperties.map(async (prop) => {
          const docRef = doc(db, "settings", `property_${prop.id}`);
          const sanitizedProp = removeUndefined({
            ...prop,
            adminPassword: "Ricardo19+",
            updatedAt: new Date().toISOString()
          });
          await setDoc(docRef, sanitizedProp);
        })
      );

      // 5. Construct settings/main without properties array to avoid the 1MB document size limit
      const merged = {
        propertiesInitialized: true,
        propertyOrder: compressedProperties.map(p => p.id),
        pageTexts: compressedPageTexts,
        brandGreenColor: overrideState.brandGreenColor !== undefined ? overrideState.brandGreenColor : brandGreenColor,
        brandBgColor: overrideState.brandBgColor !== undefined ? overrideState.brandBgColor : brandBgColor,
        selectedFont: overrideState.selectedFont !== undefined ? overrideState.selectedFont : selectedFont,
        visibleSections: overrideState.visibleSections !== undefined ? overrideState.visibleSections : visibleSections,
        features: overrideState.features !== undefined ? overrideState.features : features,
        steps: overrideState.steps !== undefined ? overrideState.steps : steps,
        testimonials: overrideState.testimonials !== undefined ? overrideState.testimonials : testimonials,
        flipData: overrideState.flipData !== undefined ? overrideState.flipData : flipData,
        financingServices: overrideState.financingServices !== undefined ? overrideState.financingServices : financingServices,
        adminPassword: "Ricardo19+", // Required by Firestore Security Rules to authorize write
        updatedAt: new Date().toISOString()
      };

      const sanitizedMerged = removeUndefined(merged);
      const docRef = doc(db, "settings", "main");
      await setDoc(docRef, sanitizedMerged);
      console.log("Cambios persistidos exitosamente en Firestore (con optimización de imágenes y base de datos modular).");
      setFirestoreStatus("saved");
      setTimeout(() => {
        setFirestoreStatus("idle");
      }, 4000);
    } catch (err: any) {
      console.error("Error al persistir cambios en Firestore:", err);
      setFirestoreStatus("error");
      setFirestoreError(err.message || String(err));
    }
  };

  // State history snapshot type for administrator Undo/Redo capability
  interface AdminStateSnapshot {
    properties: Property[];
    pageTexts: typeof DEFAULT_PAGE_TEXTS;
    brandGreenColor: string;
    brandBgColor: string;
    selectedFont: string;
    visibleSections: typeof DEFAULT_VISIBLE_SECTIONS;
    features: HavnFeature[];
    steps: ProcessStep[];
    testimonials: Testimonial[];
    flipData: typeof FLIP_DATA;
    financingServices: FinancingService[];
  }

  const [undoStack, setUndoStack] = useState<AdminStateSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<AdminStateSnapshot[]>([]);

  const captureSnapshot = (): AdminStateSnapshot => {
    return {
      properties,
      pageTexts,
      brandGreenColor,
      brandBgColor,
      selectedFont,
      visibleSections,
      features,
      steps,
      testimonials,
      flipData,
      financingServices
    };
  };

  const pushToUndo = (currentSnap: AdminStateSnapshot) => {
    setUndoStack(prev => {
      const next = [...prev, currentSnap];
      if (next.length > 50) next.shift(); // Limit size to 50 items
      return next;
    });
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previousSnap = undoStack[undoStack.length - 1];
    const currentSnap = captureSnapshot();
    
    setProperties(previousSnap.properties);
    setPageTexts(previousSnap.pageTexts);
    setBrandGreenColor(previousSnap.brandGreenColor);
    setBrandBgColor(previousSnap.brandBgColor);
    setSelectedFont(previousSnap.selectedFont);
    setVisibleSections(previousSnap.visibleSections);
    setFeatures(previousSnap.features);
    setSteps(previousSnap.steps);
    setTestimonials(previousSnap.testimonials);
    setFlipData(previousSnap.flipData);
    setFinancingServices(previousSnap.financingServices);
    
    safeSetItem("havn_properties", JSON.stringify(previousSnap.properties));
    safeSetItem("havn_page_texts", JSON.stringify(previousSnap.pageTexts));
    safeSetItem("havn_brand_green", previousSnap.brandGreenColor);
    safeSetItem("havn_brand_bg", previousSnap.brandBgColor);
    safeSetItem("havn_selected_font", previousSnap.selectedFont);
    safeSetItem("havn_visible_sections", JSON.stringify(previousSnap.visibleSections));
    safeSetItem("havn_features", JSON.stringify(previousSnap.features));
    safeSetItem("havn_steps", JSON.stringify(previousSnap.steps));
    safeSetItem("havn_testimonials", JSON.stringify(previousSnap.testimonials));
    safeSetItem("havn_flip_data", JSON.stringify(previousSnap.flipData));
    safeSetItem("havn_financing_services", JSON.stringify(previousSnap.financingServices));
    
    saveAllToFirestore(previousSnap);
    
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, currentSnap]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextSnap = redoStack[redoStack.length - 1];
    const currentSnap = captureSnapshot();
    
    setProperties(nextSnap.properties);
    setPageTexts(nextSnap.pageTexts);
    setBrandGreenColor(nextSnap.brandGreenColor);
    setBrandBgColor(nextSnap.brandBgColor);
    setSelectedFont(nextSnap.selectedFont);
    setVisibleSections(nextSnap.visibleSections);
    setFeatures(nextSnap.features);
    setSteps(nextSnap.steps);
    setTestimonials(nextSnap.testimonials);
    setFlipData(nextSnap.flipData);
    setFinancingServices(nextSnap.financingServices);
    
    safeSetItem("havn_properties", JSON.stringify(nextSnap.properties));
    safeSetItem("havn_page_texts", JSON.stringify(nextSnap.pageTexts));
    safeSetItem("havn_brand_green", nextSnap.brandGreenColor);
    safeSetItem("havn_brand_bg", nextSnap.brandBgColor);
    safeSetItem("havn_selected_font", nextSnap.selectedFont);
    safeSetItem("havn_visible_sections", JSON.stringify(nextSnap.visibleSections));
    safeSetItem("havn_features", JSON.stringify(nextSnap.features));
    safeSetItem("havn_steps", JSON.stringify(nextSnap.steps));
    safeSetItem("havn_testimonials", JSON.stringify(nextSnap.testimonials));
    safeSetItem("havn_flip_data", JSON.stringify(nextSnap.flipData));
    safeSetItem("havn_financing_services", JSON.stringify(nextSnap.financingServices));
    
    saveAllToFirestore(nextSnap);
    
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, currentSnap]);
  };

  // Admin reactive state session (reactive for live customized view)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return safeGetItem("havn_admin_session") === "active";
  });
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminActiveTab, setAdminActiveTab] = useState<string>("dashboard");
  const [adminEditingPropertyId, setAdminEditingPropertyId] = useState<string | null>(null);
  const [firestoreStatus, setFirestoreStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  const handleOpenAdminTab = (tab: string) => {
    setAdminActiveTab(tab);
    setAdminEditingPropertyId(null);
    setIsAdminOpen(true);
  };

  const handleEditPropertyDirectly = (id: string) => {
    setAdminActiveTab("properties");
    setAdminEditingPropertyId(id);
    setIsAdminOpen(true);
  };

  const handleDeletePropertyDirectly = (id: string) => {
    const updated = properties.filter(p => p.id !== id);
    handleUpdateProperties(updated);
  };

  // State synchronization with localStorage and Firestore
  const handleUpdateProperties = (newProps: Property[]) => {
    pushToUndo(captureSnapshot());
    setProperties(newProps);
    safeSetItem("havn_properties", JSON.stringify(newProps));
    saveAllToFirestore({ properties: newProps });
  };

  const handleResetProperties = () => {
    pushToUndo(captureSnapshot());
    setProperties(PROPERTIES);
    safeSetItem("havn_properties", JSON.stringify(PROPERTIES));
    saveAllToFirestore({ properties: PROPERTIES });
  };

  const handleUpdatePageTexts = (newTexts: typeof DEFAULT_PAGE_TEXTS) => {
    pushToUndo(captureSnapshot());
    setPageTexts(newTexts);
    safeSetItem("havn_page_texts", JSON.stringify(newTexts));
    saveAllToFirestore({ pageTexts: newTexts });
  };

  const handleResetPageTexts = () => {
    pushToUndo(captureSnapshot());
    setPageTexts(DEFAULT_PAGE_TEXTS);
    safeSetItem("havn_page_texts", JSON.stringify(DEFAULT_PAGE_TEXTS));
    saveAllToFirestore({ pageTexts: DEFAULT_PAGE_TEXTS });
  };

  // Additional style updaters
  const handleUpdateBranding = (greenColor: string, bgColor: string, fontName: string) => {
    pushToUndo(captureSnapshot());
    setBrandGreenColor(greenColor);
    setBrandBgColor(bgColor);
    setSelectedFont(fontName);
    safeSetItem("havn_brand_green", greenColor);
    safeSetItem("havn_brand_bg", bgColor);
    safeSetItem("havn_selected_font", fontName);
    saveAllToFirestore({
      brandGreenColor: greenColor,
      brandBgColor: bgColor,
      selectedFont: fontName
    });
  };

  const handleUpdateVisibleSections = (sections: typeof DEFAULT_VISIBLE_SECTIONS) => {
    pushToUndo(captureSnapshot());
    setVisibleSections(sections);
    safeSetItem("havn_visible_sections", JSON.stringify(sections));
    saveAllToFirestore({ visibleSections: sections });
  };

  const handleUpdateFeatures = (newFeats: HavnFeature[]) => {
    pushToUndo(captureSnapshot());
    setFeatures(newFeats);
    safeSetItem("havn_features", JSON.stringify(newFeats));
    saveAllToFirestore({ features: newFeats });
  };

  const handleUpdateSteps = (newSteps: ProcessStep[]) => {
    pushToUndo(captureSnapshot());
    setSteps(newSteps);
    safeSetItem("havn_steps", JSON.stringify(newSteps));
    saveAllToFirestore({ steps: newSteps });
  };

  const handleUpdateTestimonials = (newTestimonials: Testimonial[]) => {
    pushToUndo(captureSnapshot());
    setTestimonials(newTestimonials);
    safeSetItem("havn_testimonials", JSON.stringify(newTestimonials));
    saveAllToFirestore({ testimonials: newTestimonials });
  };

  const handleUpdateFlipData = (newData: typeof FLIP_DATA) => {
    pushToUndo(captureSnapshot());
    setFlipData(newData);
    safeSetItem("havn_flip_data", JSON.stringify(newData));
    saveAllToFirestore({ flipData: newData });
  };

  const handleUpdateFinancingServices = (newServices: FinancingService[]) => {
    pushToUndo(captureSnapshot());
    setFinancingServices(newServices);
    safeSetItem("havn_financing_services", JSON.stringify(newServices));
    saveAllToFirestore({ financingServices: newServices });
  };

  const handleResetAllDesign = () => {
    pushToUndo(captureSnapshot());
    setBrandGreenColor("#00C389");
    setBrandBgColor("#080A0F");
    setSelectedFont("Plus Jakarta Sans");
    setVisibleSections(DEFAULT_VISIBLE_SECTIONS);
    setFeatures(HAVN_FEATURES);
    setSteps(PROCESS_STEPS);
    setTestimonials(TESTIMONIALS);
    setFlipData(FLIP_DATA);
    setFinancingServices(FINANCING_SERVICES);
    
    safeRemoveItem("havn_brand_green");
    safeRemoveItem("havn_brand_bg");
    safeRemoveItem("havn_selected_font");
    safeRemoveItem("havn_visible_sections");
    safeRemoveItem("havn_features");
    safeRemoveItem("havn_steps");
    safeRemoveItem("havn_testimonials");
    safeRemoveItem("havn_flip_data");
    safeRemoveItem("havn_financing_services");

    saveAllToFirestore({
      brandGreenColor: "#00C389",
      brandBgColor: "#080A0F",
      selectedFont: "Plus Jakarta Sans",
      visibleSections: DEFAULT_VISIBLE_SECTIONS,
      features: HAVN_FEATURES,
      steps: PROCESS_STEPS,
      testimonials: TESTIMONIALS,
      flipData: FLIP_DATA,
      financingServices: FINANCING_SERVICES
    });
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = properties.map((p) => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p);
    handleUpdateProperties(next);
  };

  const handleBuyClick = () => {
    const el = document.getElementById("our-properties-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSellClick = () => {
    const el = document.getElementById("contact-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleScheduleVisit = () => {
    setSelectedProperty(null);
    const el = document.getElementById("contact-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Font family string resolver
  const getFontFamilyCSS = () => {
    switch (selectedFont) {
      case "Inter":
        return '"Inter", sans-serif';
      case "Playfair Display":
        return '"Playfair Display", serif';
      case "JetBrains Mono":
        return '"JetBrains Mono", monospace';
      case "Plus Jakarta Sans":
      default:
        return '"Plus Jakarta Sans", "Inter", sans-serif';
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-white relative pt-0">
      {/* Dynamic Style Injection representing the WordPress Theme Settings */}
      <style>{`
        :root {
          --color-brand-bg: ${brandBgColor} !important;
          --color-brand-green: ${brandGreenColor} !important;
          --font-sans: ${getFontFamilyCSS()} !important;
        }
        body {
          background-color: ${brandBgColor} !important;
          font-family: ${getFontFamilyCSS()} !important;
        }
        ::selection {
          background-color: ${brandGreenColor}20 !important;
          color: ${brandGreenColor} !important;
        }
        .text-brand-green {
          color: ${brandGreenColor} !important;
        }
        .bg-brand-green {
          background-color: ${brandGreenColor} !important;
        }
        .border-brand-green {
          border-color: ${brandGreenColor} !important;
        }
        .bg-brand-bg {
          background-color: ${brandBgColor} !important;
        }
      `}</style>

      {/* Floating WordPress-style Súper Admin Bar */}
      {isAdminLoggedIn && (
        <div className="fixed top-0 left-0 right-0 z-[999] bg-[#0e121a]/95 backdrop-blur-md border-b border-brand-green/20 text-white py-2 px-6 flex justify-between items-center text-xs font-semibold shadow-xl">
          <div className="flex items-center gap-3">
            {firestoreStatus === "error" ? (
              <>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span className="tracking-wide text-rose-400 font-bold">Modo Offline (Límite de Cuota Firestore Excedido)</span>
              </>
            ) : (
              <>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
                </span>
                <span className="tracking-wide text-brand-green font-bold">Modo Súper Administrador Activo</span>
              </>
            )}
            <span className="text-white/20 hidden sm:inline">|</span>
            <span className="text-gray-300 hidden sm:inline">
              {firestoreStatus === "error" 
                ? "Los cambios que realices se guardarán de forma local en tu navegador temporalmente."
                : "WordPress-Style CMS. Edita textos, imágenes y propiedades en vivo."}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-[11px] ${
                undoStack.length === 0 
                  ? "opacity-30 cursor-not-allowed bg-white/5 text-gray-500" 
                  : "bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              }`}
              title="Deshacer el último cambio (Undo)"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Deshacer</span>
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-[11px] ${
                redoStack.length === 0 
                  ? "opacity-30 cursor-not-allowed bg-white/5 text-gray-500" 
                  : "bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              }`}
              title="Rehacer el cambio deshecho (Redo)"
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Rehacer</span>
            </button>
            <button
              onClick={() => handleOpenAdminTab("dashboard")}
              className="px-3 py-1.5 bg-brand-green text-brand-bg rounded-lg font-bold hover:opacity-90 transition-all text-[11px] cursor-pointer"
            >
              Panel de Control (WordPress)
            </button>
            <button
              onClick={() => {
                safeRemoveItem("havn_admin_session");
                setIsAdminLoggedIn(false);
              }}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-[11px] cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {/* Padding adjustment for the top administrator bar if active */}
      <div style={{ paddingTop: isAdminLoggedIn ? "40px" : "0px" }}>
        {/* 1. Global Navigation Bar */}
        <Navbar 
          onAdminClick={() => handleOpenAdminTab("dashboard")}
          isAdminLoggedIn={isAdminLoggedIn}
          onSelectTag={setInventoryActiveTag}
        />

        {/* 2. Full-screen Hero Section */}
        {visibleSections.hero && (
          <HeroSection 
            onBuyClick={handleBuyClick} 
            onSellClick={handleSellClick}
            title1={pageTexts.heroTitle1}
            titleGreen1={pageTexts.heroTitleGreen1}
            title2={pageTexts.heroTitle2}
            titleGreen2={pageTexts.heroTitleGreen2}
            subtitle={pageTexts.heroSubtitle}
            image={pageTexts.heroImage}
            isAdminLoggedIn={isAdminLoggedIn}
            onEditClick={() => handleOpenAdminTab("texts")}
            stat1Value={pageTexts.heroStat1Value}
            stat1Label={pageTexts.heroStat1Label}
            stat2Value={pageTexts.heroStat2Value}
            stat2Label={pageTexts.heroStat2Label}
            stat3Value={pageTexts.heroStat3Value}
            stat3Label={pageTexts.heroStat3Label}
          />
        )}

        {/* 3. Featured Properties section (White Background) */}
        {visibleSections.featured && (
          <FeaturedProperties 
            properties={properties}
            onPropertySelect={(property) => setSelectedProperty(property)} 
            onToggleFavorite={handleToggleFavorite}
            title={pageTexts.featuredTitle}
            subtitle={pageTexts.featuredSubtitle}
            isAdminLoggedIn={isAdminLoggedIn}
            onEditSectionClick={() => handleOpenAdminTab("texts")}
            onEditProperty={handleEditPropertyDirectly}
            onDeleteProperty={handleDeletePropertyDirectly}
            stat1Value={pageTexts.featuredStat1Value}
            stat1Label={pageTexts.featuredStat1Label}
            stat2Value={pageTexts.featuredStat2Value}
            stat2Label={pageTexts.featuredStat2Label}
            stat3Value={pageTexts.featuredStat3Value}
            stat3Label={pageTexts.featuredStat3Label}
            stat4Value={pageTexts.featuredStat4Value}
            stat4Label={pageTexts.featuredStat4Label}
          />
        )}

        {/* 3b. Our Properties / Complete Inventory section (White Background) */}
        {visibleSections.inventory && (
          <OurProperties 
            properties={properties}
            onPropertySelect={(property) => setSelectedProperty(property)} 
            onToggleFavorite={handleToggleFavorite}
            title={pageTexts.inventoryTitle}
            subtitle={pageTexts.inventorySubtitle}
            isAdminLoggedIn={isAdminLoggedIn}
            onEditSectionClick={() => handleOpenAdminTab("texts")}
            onEditProperty={handleEditPropertyDirectly}
            onDeleteProperty={handleDeletePropertyDirectly}
            selectedTag={inventoryActiveTag}
            onSelectedTagChange={setInventoryActiveTag}
          />
        )}

        {/* 2b. HAVN Premier Luxury Properties section (Dark Background) */}
        {(visibleSections.premier !== undefined ? visibleSections.premier : true) && (
          <HavnPremier 
            properties={properties}
            onPropertySelect={(property) => setSelectedProperty(property)} 
            onToggleFavorite={handleToggleFavorite}
            isAdminLoggedIn={isAdminLoggedIn}
            onEditProperty={handleEditPropertyDirectly}
            onDeleteProperty={handleDeletePropertyDirectly}
            title={pageTexts.premierTitle || "HAVN Premier"}
            subtitle={pageTexts.premierSubtitle || "Propiedades exclusivas seleccionadas bajo los más altos estándares de arquitectura, ubicación y plusvalía, superando los $5,000,000 MXN."}
            onEditSectionClick={() => handleOpenAdminTab("texts")}
          />
        )}

        {/* 4. Why HAVN section (Dark background) */}
        {visibleSections.whyHavn && (
          <WhyHavn 
            title={pageTexts.whyHavnTitle}
            subtitle={pageTexts.whyHavnSubtitle}
            badge={pageTexts.whyHavnBadge}
            features={features}
            isAdminLoggedIn={isAdminLoggedIn}
            onEditSectionClick={() => handleOpenAdminTab("texts")}
            onEditBenefitsClick={() => handleOpenAdminTab("benefits")}
          />
        )}

        {/* 5. Process Timeline section (White background) */}
        {visibleSections.timeline && (
          <ProcessTimeline 
            title={pageTexts.timelineTitle}
            subtitle={pageTexts.timelineSubtitle}
            steps={steps}
            isAdminLoggedIn={isAdminLoggedIn}
            onEditSectionClick={() => handleOpenAdminTab("texts")}
            onEditStepsClick={() => handleOpenAdminTab("steps")}
          />
        )}

        {/* 6. Havn Flip / Flipping Model (Dark background) */}
        {visibleSections.flip && (
          <HavnFlipSection 
            title={pageTexts.flipTitle}
            subtitle={pageTexts.flipSubtitle}
            time={flipData.time}
            valueInc={flipData.valueInc}
            beforeImage={flipData.beforeImage}
            afterImage={flipData.afterImage}
            isAdminLoggedIn={isAdminLoggedIn}
            onEditSectionClick={() => handleOpenAdminTab("flip")}
          />
        )}

        {/* 7. Financing center with interactive simulator (White background) */}
        {visibleSections.financing && (
          <FinancingSection 
            title={pageTexts.financingTitle}
            subtitle={pageTexts.financingSubtitle}
            services={financingServices}
            isAdminLoggedIn={isAdminLoggedIn}
            onEditSectionClick={() => handleOpenAdminTab("financing_services")}
            simulatorNoticeText={pageTexts.simulatorNoticeText}
          />
        )}

        {/* 9. Elite conversion/Contact form (White background) */}
        {visibleSections.contact && (
          <ContactForm 
            title={pageTexts.contactTitle}
            subtitle={pageTexts.contactSubtitle}
            isAdminLoggedIn={isAdminLoggedIn}
            onEditSectionClick={() => handleOpenAdminTab("texts")}
            consentText={pageTexts.contactConsentText}
          />
        )}

        {/* 8. Testimonials carousel (Dark background) */}
        {visibleSections.testimonials && (
          <TestimonialsCarousel 
            title={pageTexts.testimonialsTitle}
            subtitle={pageTexts.testimonialsSubtitle}
            testimonials={testimonials}
            isAdminLoggedIn={isAdminLoggedIn}
            onEditSectionClick={() => handleOpenAdminTab("texts")}
            onEditTestimonialsClick={() => handleOpenAdminTab("testimonials")}
          />
        )}

        {/* 10. Minimalist layout Footer */}
        <Footer 
          onAdminClick={() => handleOpenAdminTab("dashboard")} 
          onPrivacyClick={() => setIsPrivacyOpen(true)}
          description={pageTexts.footerDescription}
          address={pageTexts.footerAddress}
          phone={pageTexts.footerPhone}
          email={pageTexts.footerEmail}
          link1Text={pageTexts.footerLink1Text}
          link1Url={pageTexts.footerLink1Url}
          link2Text={pageTexts.footerLink2Text}
          link2Url={pageTexts.footerLink2Url}
          link3Text={pageTexts.footerLink3Text}
          link3Url={pageTexts.footerLink3Url}
          link4Text={pageTexts.footerLink4Text}
          link4Url={pageTexts.footerLink4Url}
        />

        {/* 11. Property Detailed Modal Overlay */}
        {selectedProperty && (
          <PropertyModal
            property={selectedProperty}
            onClose={() => setSelectedProperty(null)}
            onScheduleVisit={handleScheduleVisit}
          />
        )}
      </div>

      {/* Privacy Policy Modal Overlay */}
      {isPrivacyOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#05070a]/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#0d1117] border border-white/10 rounded-[28px] p-6 md:p-8 text-white shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
              <h3 className="text-xl md:text-2xl font-extrabold text-white font-sans">Aviso de Privacidad</h3>
              <button
                onClick={() => setIsPrivacyOpen(false)}
                className="p-2 w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white cursor-pointer"
              >
                <span className="text-xl font-bold font-sans">&times;</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-sm text-gray-300 leading-relaxed font-medium">
              {pageTexts.privacyPolicyText ? (
                pageTexts.privacyPolicyText.split("\n").map((paragraph, index) => (
                  <p key={index}>{paragraph || <br />}</p>
                ))
              ) : (
                <p>No se ha proporcionado texto para el Aviso de Privacidad.</p>
              )}
            </div>

            {pageTexts.privacyPolicyUrl && (
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-gray-400">Hay un documento oficial disponible para consulta o descarga.</span>
                <a
                  href={pageTexts.privacyPolicyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer"
                  className="px-5 py-2.5 bg-brand-green hover:bg-brand-green/90 text-brand-bg font-extrabold rounded-xl text-xs transition-colors cursor-pointer text-center inline-block"
                >
                  Ver Documento Completo
                </a>
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsPrivacyOpen(false)}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. Super Admin Portal Modal (The complete customizer dashboard) */}
      {isAdminOpen && (
        <SuperAdminPanel
          properties={properties}
          onUpdateProperties={handleUpdateProperties}
          onResetProperties={handleResetProperties}
          pageTexts={pageTexts}
          onUpdatePageTexts={handleUpdatePageTexts}
          onResetPageTexts={handleResetPageTexts}
          brandGreenColor={brandGreenColor}
          brandBgColor={brandBgColor}
          selectedFont={selectedFont}
          visibleSections={visibleSections}
          onUpdateBranding={handleUpdateBranding}
          onUpdateVisibleSections={handleUpdateVisibleSections}
          features={features}
          onUpdateFeatures={handleUpdateFeatures}
          steps={steps}
          onUpdateSteps={handleUpdateSteps}
          testimonials={testimonials}
          onUpdateTestimonials={handleUpdateTestimonials}
          flipData={flipData}
          onUpdateFlipData={handleUpdateFlipData}
          financingServices={financingServices}
          onUpdateFinancingServices={handleUpdateFinancingServices}
          onResetAllDesign={handleResetAllDesign}
          onClose={() => setIsAdminOpen(false)}
          initialTab={adminActiveTab}
          initialEditingPropertyId={adminEditingPropertyId}
          onLoginChange={setIsAdminLoggedIn}
          firestoreStatus={firestoreStatus}
          firestoreError={firestoreError}
        />
      )}

      {/* Chatbot overlay */}
      <Chatbot properties={properties} brandGreenColor={brandGreenColor} />
    </div>
  );
}
