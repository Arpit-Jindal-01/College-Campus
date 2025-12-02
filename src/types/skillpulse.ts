// SkillPulse Core Types

export type OpportunityType = 
  | 'internship' 
  | 'job' 
  | 'hackathon' 
  | 'contest' 
  | 'event' 
  | 'scholarship' 
  | 'fellowship' 
  | 'conference'
  | 'workshop'
  | 'audition'
  | 'competition';

export type LocationType = 'remote' | 'onsite' | 'hybrid';

// Technical domains
export type TechDomain = 
  | 'web-dev' 
  | 'ai-ml' 
  | 'cybersecurity' 
  | 'design' 
  | 'mobile' 
  | 'data-science' 
  | 'blockchain' 
  | 'cloud' 
  | 'devops' 
  | 'product' 
  | 'business';

// Creative / Non-technical domains
export type CreativeDomain =
  | 'singing'
  | 'dancing'
  | 'theatre'
  | 'music'
  | 'content-writing'
  | 'public-speaking'
  | 'photography'
  | 'videography'
  | 'illustration'
  | 'fashion'
  | 'culinary';

export type Domain = TechDomain | CreativeDomain;

export type SkillCategory = 'tech' | 'creative';

export interface OpportunityLocation {
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  type: OpportunityType;
  locationType: LocationType;
  location?: OpportunityLocation; // Geolocation data for on-site/hybrid
  description: string;
  requirements: string[];
  skills: string[];
  compensation?: string;
  deadline?: string;
  eventDate?: string;
  sourceUrl: string;
  sourcePlatform: string;
  postedAt: string;
  isTrending?: boolean;
  domains: Domain[];
  skillCategory: SkillCategory;
  // Computed at runtime
  distance?: number; // Distance in km from user
}

export interface UserPreferences {
  domains: Domain[];
  locationType: LocationType[];
  notifications: {
    newRemote: boolean;
    newLocal: boolean;
    deadlineSoon: boolean;
  };
}

export interface UserLocation {
  city: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
  location?: UserLocation;
  savedOpportunities: string[];
  isOnboarded: boolean;
}

export interface FilterOptions {
  types: OpportunityType[];
  locationTypes: LocationType[];
  domains: Domain[];
  skillCategories: SkillCategory[];
  query: string;
}

export type SortOption = 'newest' | 'deadline' | 'relevance';

export const TECH_DOMAINS: TechDomain[] = [
  'web-dev', 'ai-ml', 'cybersecurity', 'design', 'mobile', 
  'data-science', 'blockchain', 'cloud', 'devops', 'product', 'business'
];

export const CREATIVE_DOMAINS: CreativeDomain[] = [
  'singing', 'dancing', 'theatre', 'music', 'content-writing',
  'public-speaking', 'photography', 'videography', 'illustration', 'fashion', 'culinary'
];

export const DOMAIN_LABELS: Record<Domain, string> = {
  // Tech
  'web-dev': 'Web Development',
  'ai-ml': 'AI / ML',
  'cybersecurity': 'Cybersecurity',
  'design': 'UI/UX Design',
  'mobile': 'Mobile Dev',
  'data-science': 'Data Science',
  'blockchain': 'Blockchain',
  'cloud': 'Cloud Computing',
  'devops': 'DevOps',
  'product': 'Product',
  'business': 'Business',
  // Creative
  'singing': 'Singing',
  'dancing': 'Dancing',
  'theatre': 'Theatre & Drama',
  'music': 'Music & Instruments',
  'content-writing': 'Content Writing',
  'public-speaking': 'Public Speaking',
  'photography': 'Photography',
  'videography': 'Videography',
  'illustration': 'Illustration & Art',
  'fashion': 'Fashion',
  'culinary': 'Culinary Arts',
};

export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  internship: 'Internship',
  job: 'Job',
  hackathon: 'Hackathon',
  contest: 'Contest',
  event: 'Event',
  scholarship: 'Scholarship',
  fellowship: 'Fellowship',
  conference: 'Conference',
  workshop: 'Workshop',
  audition: 'Audition',
  competition: 'Competition',
};

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  tech: 'Technical',
  creative: 'Creative & Arts',
};
