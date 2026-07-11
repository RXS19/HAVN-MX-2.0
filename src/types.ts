export interface Property {
  id: string;
  title: string;
  price: string;
  rawPrice: number; // for calculations
  location: string;
  city: string;
  beds: number;
  baths: number;
  sqm: number;
  image: string;
  images?: string[];
  tag?: string;
  isFavorite?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  comment: string;
  avatar: string;
  rating: number;
  location: string;
}

export interface ProcessStep {
  number: number;
  title: string;
  description: string;
  iconName: string;
}

export interface HavnFeature {
  id: string;
  title: string;
  description: string;
  detailedDesc: string;
  iconName: string;
  bullet1?: string;
  bullet2?: string;
}

export interface FinancingService {
  id: string;
  title: string;
  badge: string;
  description: string;
  buttonText: string;
  isDark?: boolean;
}
