import { Property, Testimonial, ProcessStep, HavnFeature, FinancingService } from "./types";

export const PROPERTIES: Property[] = [
  {
    id: "prop-1",
    title: "Penthouse Campos Elíseos",
    price: "$28,500,000 MXN",
    rawPrice: 28500000,
    location: "Campos Elíseos, Polanco",
    city: "CDMX",
    beds: 3,
    baths: 3.5,
    sqm: 340,
    parking: 3,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80"
    ],
    tag: "Exclusivo",
    isFavorite: true
  },
  {
    id: "prop-2",
    title: "Villa Lomas Altas",
    price: "$42,000,000 MXN",
    rawPrice: 42000000,
    location: "Paseo de la Reforma, Lomas de Chapultepec",
    city: "CDMX",
    beds: 4,
    baths: 5,
    sqm: 680,
    parking: 4,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=1200&q=80"
    ],
    tag: "Venta",
    isFavorite: false
  },
  {
    id: "prop-3",
    title: "Apartamento Parque España",
    price: "$48,000 MXN / mes",
    rawPrice: 48000,
    location: "Av. Veracruz, Condesa",
    city: "CDMX",
    beds: 2,
    baths: 2.5,
    sqm: 185,
    parking: 2,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80"
    ],
    tag: "Renta",
    isFavorite: false
  },
  {
    id: "prop-4",
    title: "Residencia Sierra Madre",
    price: "$56,000,000 MXN",
    rawPrice: 56000000,
    location: "Sierra Madre, San Pedro Garza García",
    city: "Nuevo León",
    beds: 5,
    baths: 6,
    sqm: 850,
    parking: 5,
    image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"
    ],
    tag: "Destacada",
    isFavorite: true
  },
  {
    id: "prop-5",
    title: "Casa de las Flores",
    price: "$19,200,000 MXN",
    rawPrice: 19200000,
    location: "Francisco Sosa, Coyoacán",
    city: "CDMX",
    beds: 3,
    baths: 3.5,
    sqm: 290,
    parking: 3,
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=1200&q=80"
    ],
    tag: "Venta",
    isFavorite: false
  },
  {
    id: "prop-6",
    title: "Loft Highrise Santa Fe",
    price: "$35,000 MXN / mes",
    rawPrice: 35000,
    location: "Avenida Santa Fe, Santa Fe",
    city: "CDMX",
    beds: 1,
    baths: 1.5,
    sqm: 110,
    parking: 1,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
    ],
    tag: "Renta",
    isFavorite: false
  },
  {
    id: "prop-7",
    title: "Departamento Parque Lincoln",
    price: "$22,000,000 MXN",
    rawPrice: 22000000,
    location: "Luis G. Urbina, Polanco",
    city: "CDMX",
    beds: 3,
    baths: 3.5,
    sqm: 260,
    parking: 2,
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80"
    ],
    tag: "Venta",
    isFavorite: false
  },
  {
    id: "prop-8",
    title: "Residencia Valle Oriente",
    price: "$39,500,000 MXN",
    rawPrice: 39500000,
    location: "Valle Oriente, San Pedro Garza García",
    city: "Nuevo León",
    beds: 4,
    baths: 4.5,
    sqm: 520,
    parking: 3,
    image: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"
    ],
    tag: "Destacada",
    isFavorite: true
  },
  {
    id: "prop-9",
    title: "Garden House Amsterdam",
    price: "$52,000 MXN / mes",
    rawPrice: 52000,
    location: "Av. Amsterdam, Condesa",
    city: "CDMX",
    beds: 2,
    baths: 2,
    sqm: 160,
    parking: 2,
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80"
    ],
    tag: "Renta",
    isFavorite: false
  },
  {
    id: "prop-10",
    title: "Penthouse Lomas Virreyes",
    price: "$49,000,000 MXN",
    rawPrice: 49000000,
    location: "Lomas Virreyes, Lomas de Chapultepec",
    city: "CDMX",
    beds: 4,
    baths: 4.5,
    sqm: 480,
    parking: 4,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80"
    ],
    tag: "Venta",
    isFavorite: false
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t-1",
    name: "Sofía & Alejandro Pérez",
    role: "Emprendedores de Tecnología",
    comment: "HAVN transformó por completo nuestra experiencia al comprar. El proceso fue increíblemente ágil, sin la burocracia típica mexicana. La tecnología de simulación e inspección nos dio total confianza.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    rating: 5,
    location: "CDMX"
  },
  {
    id: "t-2",
    name: "Carlos Mendoza",
    role: "Inversionista Inmobiliario",
    comment: "El modelo Havn Flip cambió la forma en la que invierto. Compraron mi propiedad en Lomas, la remodelaron con arquitectura premium en tiempo récord, y el retorno de inversión superó mis expectativas.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    rating: 5,
    location: "Monterrey"
  },
  {
    id: "t-3",
    name: "Mariana Garza",
    role: "Diseñadora de Interiores",
    comment: "Como profesional del diseño, valoro la obsesión por los detalles. HAVN no solo vende casas; redefine el lujo moderno. Comprar con ellos fue como estar en la tienda insignia de Apple.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    rating: 5,
    location: "San Pedro Garza García"
  }
];

export const PROCESS_STEPS: ProcessStep[] = [
  {
    number: 1,
    title: "Encuentra",
    description: "Explora nuestra colección curada de propiedades exclusivas con recorridos inmersivos en 3D.",
    iconName: "Search"
  },
  {
    number: 2,
    title: "Agenda visita",
    description: "Reserva una experiencia presencial u online en segundos, guiada por un especialista de HAVN.",
    iconName: "Calendar"
  },
  {
    number: 3,
    title: "Oferta",
    description: "Realiza una oferta formal respaldada por análisis de mercado en tiempo real y asesoría legal.",
    iconName: "FileText"
  },
  {
    number: 4,
    title: "Firma",
    description: "Proceso digitalizado y transparente con notarías aliadas, brindando total seguridad.",
    iconName: "ShieldCheck"
  },
  {
    number: 5,
    title: "Recibe llaves",
    description: "Disfruta de tu nueva propiedad con nuestro exclusivo paquete de bienvenida premium.",
    iconName: "Key"
  }
];

export const HAVN_FEATURES: HavnFeature[] = [
  {
    id: "feat-comprar",
    title: "Comprar",
    description: "Propiedades exclusivas con diseño de autor y ubicaciones inmejorables.",
    detailedDesc: "Olvídate de portales inmobiliarios saturados de información duplicada. En HAVN te ofrecemos un catálogo estrictamente curado, verificado jurídica e higiénicamente, listo para escriturar.",
    iconName: "Building2",
    bullet1: "Proceso 100% transparente",
    bullet2: "Asesoría legal incluida"
  },
  {
    id: "feat-vender",
    title: "Vender",
    description: "Vendemos tu propiedad 3 veces más rápido usando IA and marketing de alta gama.",
    detailedDesc: "Obtén una oferta de compra directa por parte de HAVN en 48 horas, o enlistamos tu propiedad con renders 3D hiperrealistas, fotografía arquitectónica y distribución segmentada hacia inversores calificados.",
    iconName: "TrendingUp",
    bullet1: "Valuación comercial justa",
    bullet2: "Cierre rápido y seguro"
  },
  {
    id: "feat-remodelar",
    title: "Remodelar",
    description: "Elevamos el valor de tu propiedad con remodelaciones arquitectónicas premium.",
    detailedDesc: "Diseño minimalista y moderno a cargo de arquitectos galardonados. Optimizamos espacios, acabados, e iluminación inteligente para revalorizar tu propiedad hasta en un 35% en solo meses.",
    iconName: "RefreshCw",
    bullet1: "Materiales de alta gama",
    bullet2: "Arquitectos galardonados"
  }
];

export const FLIP_DATA = {
  beforeImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80", // old bath/kitchen room
  afterImage: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80", // premium modern living room/kitchen
  time: "94 días",
  valueInc: "+34%"
};

export const FINANCING_SERVICES: FinancingService[] = [
  {
    id: "fs-1",
    title: "Hipoteca Inteligente",
    badge: "Tasa Fija desde 8.9%",
    description: "Conectamos directamente con las mejores instituciones financieras de México y fondos privados para ofrecerte la menor tasa de interés del mercado.",
    buttonText: "Saber más",
    isDark: false
  },
  {
    id: "fs-2",
    title: "Aprobación Digital",
    badge: "Respuesta en 24 Horas",
    description: "Nuestra plataforma analiza tu perfil crediticio de manera automatizada y segura en minutos, brindando una pre-aprobación ágil respaldada legalmente.",
    buttonText: "Iniciar solicitud",
    isDark: true
  }
];

