// SkillPulse API Service Layer with Geospatial Support
// Structured for easy replacement with real APIs

import { Opportunity, FilterOptions, SortOption, Domain, OpportunityLocation } from '@/types/skillpulse';
import { calculateDistance } from '@/lib/geo';

// Mock data with real coordinates for all locations
const mockOpportunities: Opportunity[] = [
  // TECH OPPORTUNITIES
  {
    id: '1',
    title: 'Frontend Developer Intern',
    company: 'Google',
    companyLogo: 'https://www.google.com/favicon.ico',
    type: 'internship',
    locationType: 'remote',
    description: 'Join our team to build next-generation web applications using React and TypeScript.',
    requirements: ['Currently enrolled in CS/related field', '0-2 years experience', 'Strong JavaScript skills'],
    skills: ['React', 'TypeScript', 'CSS', 'Git'],
    compensation: '$8,000/month',
    deadline: '2024-02-15',
    sourceUrl: 'https://careers.google.com',
    sourcePlatform: 'Google Careers',
    postedAt: '2024-01-10',
    isTrending: true,
    domains: ['web-dev'],
    skillCategory: 'tech',
  },
  {
    id: '2',
    title: 'AI/ML Research Fellowship',
    company: 'OpenAI',
    companyLogo: 'https://openai.com/favicon.ico',
    type: 'fellowship',
    locationType: 'hybrid',
    location: { city: 'San Francisco', country: 'USA', lat: 37.7749, lng: -122.4194 },
    description: 'Research fellowship focusing on large language models and AI safety.',
    requirements: ['PhD or Masters in ML/AI', 'Published research papers', 'Strong Python skills'],
    skills: ['Python', 'PyTorch', 'TensorFlow', 'Research'],
    compensation: '$150,000/year',
    deadline: '2024-03-01',
    sourceUrl: 'https://openai.com/careers',
    sourcePlatform: 'OpenAI',
    postedAt: '2024-01-08',
    isTrending: true,
    domains: ['ai-ml'],
    skillCategory: 'tech',
  },
  {
    id: '3',
    title: 'HackMIT 2024',
    company: 'MIT',
    type: 'hackathon',
    locationType: 'onsite',
    location: { city: 'Cambridge', country: 'USA', lat: 42.3601, lng: -71.0589 },
    description: 'Annual hackathon at MIT with $50,000 in prizes. Build innovative solutions in 36 hours.',
    requirements: ['University students only', 'Team of 4 max'],
    skills: ['Any Tech Stack', 'Problem Solving', 'Innovation'],
    compensation: '$50,000 in prizes',
    eventDate: '2024-02-24',
    deadline: '2024-02-10',
    sourceUrl: 'https://hackmit.org',
    sourcePlatform: 'HackMIT',
    postedAt: '2024-01-05',
    isTrending: true,
    domains: ['web-dev', 'ai-ml', 'mobile'],
    skillCategory: 'tech',
  },
  {
    id: '4',
    title: 'Senior UX Designer',
    company: 'Figma',
    companyLogo: 'https://www.figma.com/favicon.ico',
    type: 'job',
    locationType: 'remote',
    description: 'Design beautiful, intuitive interfaces for millions of designers worldwide.',
    requirements: ['5+ years UX experience', 'Strong portfolio', 'Figma expertise'],
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    compensation: '$180,000 - $220,000',
    deadline: '2024-02-28',
    sourceUrl: 'https://figma.com/careers',
    sourcePlatform: 'Figma',
    postedAt: '2024-01-12',
    domains: ['design'],
    skillCategory: 'tech',
  },
  {
    id: '5',
    title: 'Cybersecurity CTF Challenge',
    company: 'DEF CON',
    type: 'contest',
    locationType: 'remote',
    description: 'Annual capture-the-flag competition testing your security skills.',
    requirements: ['Open to all skill levels', 'Individual or team'],
    skills: ['Penetration Testing', 'Reverse Engineering', 'Cryptography'],
    compensation: '$25,000 prize pool',
    eventDate: '2024-03-15',
    deadline: '2024-03-10',
    sourceUrl: 'https://defcon.org',
    sourcePlatform: 'DEF CON',
    postedAt: '2024-01-11',
    domains: ['cybersecurity'],
    skillCategory: 'tech',
  },
  {
    id: '6',
    title: 'Full Stack Engineer',
    company: 'Stripe',
    companyLogo: 'https://stripe.com/favicon.ico',
    type: 'job',
    locationType: 'hybrid',
    location: { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
    description: 'Build the economic infrastructure for the internet.',
    requirements: ['3+ years experience', 'Strong CS fundamentals', 'Payment systems knowledge a plus'],
    skills: ['Ruby', 'TypeScript', 'PostgreSQL', 'AWS'],
    compensation: '$200,000 - $280,000',
    deadline: '2024-03-15',
    sourceUrl: 'https://stripe.com/jobs',
    sourcePlatform: 'Stripe',
    postedAt: '2024-01-09',
    domains: ['web-dev', 'cloud'],
    skillCategory: 'tech',
  },
  {
    id: '7',
    title: 'Google Summer of Code',
    company: 'Google',
    companyLogo: 'https://www.google.com/favicon.ico',
    type: 'scholarship',
    locationType: 'remote',
    description: 'Global program offering stipends to university students for open source contributions.',
    requirements: ['University student', '18+ years old', 'Open source interest'],
    skills: ['Open Source', 'Programming', 'Git'],
    compensation: '$1,500 - $6,000 stipend',
    deadline: '2024-04-02',
    sourceUrl: 'https://summerofcode.withgoogle.com',
    sourcePlatform: 'Google',
    postedAt: '2024-01-15',
    isTrending: true,
    domains: ['web-dev', 'ai-ml', 'mobile', 'devops'],
    skillCategory: 'tech',
  },
  {
    id: '8',
    title: 'AWS re:Invent 2024',
    company: 'Amazon',
    companyLogo: 'https://aws.amazon.com/favicon.ico',
    type: 'conference',
    locationType: 'onsite',
    location: { city: 'Las Vegas', country: 'USA', lat: 36.1699, lng: -115.1398 },
    description: 'The biggest cloud computing conference with keynotes, workshops, and networking.',
    requirements: ['Conference pass required', 'Cloud interest'],
    skills: ['AWS', 'Cloud Computing', 'DevOps'],
    eventDate: '2024-11-25',
    deadline: '2024-10-15',
    sourceUrl: 'https://reinvent.awsevents.com',
    sourcePlatform: 'AWS',
    postedAt: '2024-01-14',
    domains: ['cloud', 'devops'],
    skillCategory: 'tech',
  },
  {
    id: '9',
    title: 'Mobile Developer - React Native',
    company: 'Meta',
    companyLogo: 'https://www.meta.com/favicon.ico',
    type: 'job',
    locationType: 'remote',
    description: 'Build cross-platform mobile apps reaching billions of users.',
    requirements: ['3+ years mobile dev', 'React Native expertise', 'Published apps'],
    skills: ['React Native', 'JavaScript', 'iOS', 'Android'],
    compensation: '$190,000 - $250,000',
    deadline: '2024-02-20',
    sourceUrl: 'https://meta.com/careers',
    sourcePlatform: 'Meta',
    postedAt: '2024-01-13',
    domains: ['mobile', 'web-dev'],
    skillCategory: 'tech',
  },
  {
    id: '10',
    title: 'Blockchain Developer Intern',
    company: 'Coinbase',
    companyLogo: 'https://www.coinbase.com/favicon.ico',
    type: 'internship',
    locationType: 'remote',
    description: 'Learn blockchain development while building the future of finance.',
    requirements: ['CS student', 'Blockchain basics', 'Smart contracts interest'],
    skills: ['Solidity', 'Ethereum', 'Web3.js', 'TypeScript'],
    compensation: '$7,500/month',
    deadline: '2024-02-28',
    sourceUrl: 'https://coinbase.com/careers',
    sourcePlatform: 'Coinbase',
    postedAt: '2024-01-16',
    domains: ['blockchain', 'web-dev'],
    skillCategory: 'tech',
  },
  {
    id: '11',
    title: 'Data Science Bootcamp Scholarship',
    company: 'DataCamp',
    type: 'scholarship',
    locationType: 'remote',
    description: 'Full scholarship for intensive data science bootcamp covering Python, ML, and analytics.',
    requirements: ['Underrepresented in tech', 'Basic programming', 'Strong motivation'],
    skills: ['Python', 'Statistics', 'SQL'],
    compensation: 'Full tuition ($15,000 value)',
    deadline: '2024-03-01',
    sourceUrl: 'https://datacamp.com/scholarships',
    sourcePlatform: 'DataCamp',
    postedAt: '2024-01-17',
    domains: ['data-science', 'ai-ml'],
    skillCategory: 'tech',
  },
  {
    id: '12',
    title: 'Product Manager - B2B SaaS',
    company: 'Notion',
    companyLogo: 'https://www.notion.so/favicon.ico',
    type: 'job',
    locationType: 'hybrid',
    location: { city: 'San Francisco', country: 'USA', lat: 37.7749, lng: -122.4194 },
    description: 'Lead product strategy for enterprise collaboration features.',
    requirements: ['4+ years PM experience', 'B2B SaaS background', 'Data-driven'],
    skills: ['Product Strategy', 'User Research', 'Analytics', 'Agile'],
    compensation: '$170,000 - $210,000',
    deadline: '2024-02-25',
    sourceUrl: 'https://notion.so/careers',
    sourcePlatform: 'Notion',
    postedAt: '2024-01-18',
    domains: ['product'],
    skillCategory: 'tech',
  },
  // CREATIVE OPPORTUNITIES - INDIA
  {
    id: '13',
    title: 'National Singing Competition 2024',
    company: 'Indian Idol Academy',
    type: 'contest',
    locationType: 'onsite',
    location: { city: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777 },
    description: 'Showcase your vocal talent in this national-level singing competition with cash prizes and recording contracts.',
    requirements: ['Ages 16-30', 'Any genre', 'Original or cover performances'],
    skills: ['Vocals', 'Stage Presence', 'Music Theory'],
    compensation: '₹10,00,000 Grand Prize',
    eventDate: '2024-03-20',
    deadline: '2024-02-28',
    sourceUrl: 'https://indianidol.com',
    sourcePlatform: 'Indian Idol',
    postedAt: '2024-01-19',
    isTrending: true,
    domains: ['singing'],
    skillCategory: 'creative',
  },
  {
    id: '14',
    title: 'Contemporary Dance Workshop',
    company: 'Shiamak Davar Dance Academy',
    type: 'workshop',
    locationType: 'onsite',
    location: { city: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090 },
    description: 'Learn contemporary dance techniques from renowned choreographers in this intensive 3-day workshop.',
    requirements: ['Basic dance experience', 'Ages 14+', 'Comfortable attire'],
    skills: ['Contemporary Dance', 'Flexibility', 'Body Movement'],
    compensation: 'Certificate + Performance Opportunity',
    eventDate: '2024-02-15',
    deadline: '2024-02-10',
    sourceUrl: 'https://shiamak.com',
    sourcePlatform: 'Shiamak',
    postedAt: '2024-01-20',
    domains: ['dancing'],
    skillCategory: 'creative',
  },
  {
    id: '15',
    title: 'Theatre Acting Internship',
    company: 'National School of Drama',
    type: 'internship',
    locationType: 'onsite',
    location: { city: 'New Delhi', country: 'India', lat: 28.6139, lng: 77.2090 },
    description: 'Join NSD for a 6-month intensive theatre training program with stipend and performance opportunities.',
    requirements: ['Passion for theatre', 'Audition required', 'Fluent in Hindi/English'],
    skills: ['Acting', 'Voice Modulation', 'Script Reading', 'Improvisation'],
    compensation: '₹15,000/month stipend',
    deadline: '2024-03-01',
    sourceUrl: 'https://nsd.gov.in',
    sourcePlatform: 'NSD',
    postedAt: '2024-01-21',
    domains: ['theatre'],
    skillCategory: 'creative',
  },
  {
    id: '16',
    title: 'Photography Contest - Urban Life',
    company: 'National Geographic India',
    type: 'contest',
    locationType: 'remote',
    description: 'Capture the essence of urban life in India. Winner gets featured in NatGeo magazine and wins camera gear.',
    requirements: ['Open to all', 'Original photos only', 'Submit up to 5 entries'],
    skills: ['Photography', 'Composition', 'Storytelling'],
    compensation: '$5,000 + Camera Kit',
    deadline: '2024-02-20',
    sourceUrl: 'https://natgeo.com/contests',
    sourcePlatform: 'NatGeo',
    postedAt: '2024-01-22',
    isTrending: true,
    domains: ['photography'],
    skillCategory: 'creative',
  },
  {
    id: '17',
    title: 'Content Writer - Travel Blog',
    company: 'Lonely Planet',
    companyLogo: 'https://www.lonelyplanet.com/favicon.ico',
    type: 'job',
    locationType: 'remote',
    description: "Write engaging travel content for one of the world's most recognized travel brands.",
    requirements: ['Portfolio required', 'Travel experience', 'SEO knowledge a plus'],
    skills: ['Content Writing', 'SEO', 'Storytelling', 'Research'],
    compensation: '$50,000 - $70,000/year',
    deadline: '2024-02-28',
    sourceUrl: 'https://lonelyplanet.com/careers',
    sourcePlatform: 'Lonely Planet',
    postedAt: '2024-01-23',
    domains: ['content-writing'],
    skillCategory: 'creative',
  },
  {
    id: '18',
    title: 'Public Speaking Championship',
    company: 'Toastmasters International',
    type: 'contest',
    locationType: 'hybrid',
    location: { city: 'Bangalore', country: 'India', lat: 12.9716, lng: 77.5946 },
    description: 'Compete in the regional public speaking championship. Winners advance to national finals.',
    requirements: ['Toastmasters member or open category', 'Prepared speech 5-7 min'],
    skills: ['Public Speaking', 'Persuasion', 'Confidence'],
    compensation: 'Trophy + $2,000 prize',
    eventDate: '2024-03-10',
    deadline: '2024-02-25',
    sourceUrl: 'https://toastmasters.org',
    sourcePlatform: 'Toastmasters',
    postedAt: '2024-01-24',
    domains: ['public-speaking'],
    skillCategory: 'creative',
  },
  {
    id: '19',
    title: 'Music Production Fellowship',
    company: 'AR Rahman Foundation',
    type: 'fellowship',
    locationType: 'onsite',
    location: { city: 'Chennai', country: 'India', lat: 13.0827, lng: 80.2707 },
    description: 'Learn music production from industry experts at the KM Music Conservatory founded by AR Rahman.',
    requirements: ['Basic music knowledge', 'Audition/portfolio', 'Ages 18-35'],
    skills: ['Music Production', 'DAW Software', 'Sound Engineering'],
    compensation: 'Full scholarship worth ₹5,00,000',
    deadline: '2024-03-15',
    sourceUrl: 'https://kmmc.in',
    sourcePlatform: 'KM Conservatory',
    postedAt: '2024-01-25',
    isTrending: true,
    domains: ['music'],
    skillCategory: 'creative',
  },
  {
    id: '20',
    title: 'Video Editor - YouTube Channel',
    company: 'T-Series',
    companyLogo: 'https://www.tseries.com/favicon.ico',
    type: 'job',
    locationType: 'hybrid',
    location: { city: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777 },
    description: "Edit music videos and promotional content for one of the world's largest YouTube channels.",
    requirements: ['2+ years editing experience', 'Premiere Pro/DaVinci', 'Fast turnaround'],
    skills: ['Video Editing', 'Color Grading', 'Motion Graphics', 'Adobe Suite'],
    compensation: '₹8,00,000 - ₹12,00,000/year',
    deadline: '2024-02-18',
    sourceUrl: 'https://tseries.com/careers',
    sourcePlatform: 'T-Series',
    postedAt: '2024-01-26',
    domains: ['videography'],
    skillCategory: 'creative',
  },
  {
    id: '21',
    title: 'Illustration Contest - Book Cover',
    company: 'Penguin Random House India',
    type: 'contest',
    locationType: 'remote',
    description: 'Design a book cover illustration for an upcoming bestseller. Winner gets published credit and prize.',
    requirements: ['Original artwork', 'Digital or traditional', 'High resolution submission'],
    skills: ['Illustration', 'Digital Art', 'Typography', 'Concept Design'],
    compensation: '₹1,00,000 + Book Credit',
    deadline: '2024-02-28',
    sourceUrl: 'https://penguin.co.in',
    sourcePlatform: 'Penguin India',
    postedAt: '2024-01-27',
    domains: ['illustration'],
    skillCategory: 'creative',
  },
  // Additional global opportunities
  {
    id: '22',
    title: 'Backend Engineer - Fintech',
    company: 'Razorpay',
    companyLogo: 'https://razorpay.com/favicon.ico',
    type: 'job',
    locationType: 'hybrid',
    location: { city: 'Bangalore', country: 'India', lat: 12.9716, lng: 77.5946 },
    description: 'Build scalable payment infrastructure serving millions of merchants.',
    requirements: ['3+ years backend experience', 'Java/Go', 'Distributed systems'],
    skills: ['Java', 'Go', 'Kubernetes', 'PostgreSQL'],
    compensation: '₹30,00,000 - ₹50,00,000/year',
    deadline: '2024-03-10',
    sourceUrl: 'https://razorpay.com/careers',
    sourcePlatform: 'Razorpay',
    postedAt: '2024-01-28',
    domains: ['web-dev', 'cloud'],
    skillCategory: 'tech',
  },
  {
    id: '23',
    title: 'Kathak Dance Competition',
    company: 'Sangeet Natak Akademi',
    type: 'competition',
    locationType: 'onsite',
    location: { city: 'Lucknow', country: 'India', lat: 26.8467, lng: 80.9462 },
    description: 'National level classical dance competition for Kathak dancers.',
    requirements: ['Min 5 years training', 'Solo performance', 'Traditional attire'],
    skills: ['Kathak', 'Rhythm', 'Expression', 'Classical Music'],
    compensation: '₹2,00,000 prize',
    eventDate: '2024-04-01',
    deadline: '2024-03-15',
    sourceUrl: 'https://sangeetnatak.gov.in',
    sourcePlatform: 'SNA',
    postedAt: '2024-01-29',
    domains: ['dancing'],
    skillCategory: 'creative',
  },
  {
    id: '24',
    title: 'Tech Lead - London',
    company: 'Revolut',
    companyLogo: 'https://revolut.com/favicon.ico',
    type: 'job',
    locationType: 'hybrid',
    location: { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
    description: 'Lead engineering teams building next-gen banking infrastructure.',
    requirements: ['7+ years experience', 'Team leadership', 'Fintech background'],
    skills: ['Java', 'Kotlin', 'AWS', 'Leadership'],
    compensation: '£150,000 - £200,000',
    deadline: '2024-03-20',
    sourceUrl: 'https://revolut.com/careers',
    sourcePlatform: 'Revolut',
    postedAt: '2024-01-30',
    domains: ['web-dev', 'cloud'],
    skillCategory: 'tech',
  },
  {
    id: '25',
    title: 'Classical Music Festival',
    company: 'Doverlane Music Conference',
    type: 'event',
    locationType: 'onsite',
    location: { city: 'Kolkata', country: 'India', lat: 22.5726, lng: 88.3639 },
    description: 'Annual classical music festival featuring renowned artists. Open for young performers.',
    requirements: ['Classical music background', 'Under 35 years', 'Performance ready'],
    skills: ['Indian Classical Music', 'Vocals/Instruments', 'Ragas'],
    compensation: 'Performance opportunity + ₹50,000',
    eventDate: '2024-01-26',
    deadline: '2024-01-20',
    sourceUrl: 'https://doverlane.org',
    sourcePlatform: 'Doverlane',
    postedAt: '2024-01-10',
    domains: ['music', 'singing'],
    skillCategory: 'creative',
  },
  {
    id: '26',
    title: 'ML Engineer - Berlin',
    company: 'DeepMind',
    companyLogo: 'https://deepmind.com/favicon.ico',
    type: 'job',
    locationType: 'onsite',
    location: { city: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050 },
    description: 'Work on cutting-edge AI research and production systems.',
    requirements: ['PhD preferred', 'ML/DL expertise', 'Research publications'],
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Research'],
    compensation: '€120,000 - €180,000',
    deadline: '2024-04-01',
    sourceUrl: 'https://deepmind.com/careers',
    sourcePlatform: 'DeepMind',
    postedAt: '2024-02-01',
    domains: ['ai-ml'],
    skillCategory: 'tech',
  },
  {
    id: '27',
    title: 'Film Editing Workshop',
    company: 'FTII',
    type: 'workshop',
    locationType: 'onsite',
    location: { city: 'Pune', country: 'India', lat: 18.5204, lng: 73.8567 },
    description: 'Learn professional film editing techniques from industry veterans.',
    requirements: ['Basic editing knowledge', 'Portfolio', 'Interest in cinema'],
    skills: ['Film Editing', 'DaVinci Resolve', 'Storytelling'],
    compensation: 'Certificate + Networking',
    eventDate: '2024-02-28',
    deadline: '2024-02-15',
    sourceUrl: 'https://ftii.ac.in',
    sourcePlatform: 'FTII',
    postedAt: '2024-02-02',
    domains: ['videography'],
    skillCategory: 'creative',
  },
  {
    id: '28',
    title: 'Software Engineer - Tokyo',
    company: 'Mercari',
    companyLogo: 'https://mercari.com/favicon.ico',
    type: 'job',
    locationType: 'hybrid',
    location: { city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
    description: 'Build marketplace features for Japan largest C2C platform.',
    requirements: ['3+ years experience', 'Go/Ruby', 'Japanese helpful'],
    skills: ['Go', 'Ruby', 'Microservices', 'GCP'],
    compensation: '¥10,000,000 - ¥15,000,000',
    deadline: '2024-03-25',
    sourceUrl: 'https://mercari.com/careers',
    sourcePlatform: 'Mercari',
    postedAt: '2024-02-03',
    domains: ['web-dev', 'mobile'],
    skillCategory: 'tech',
  },
  {
    id: '29',
    title: 'Stand-up Comedy Open Mic',
    company: 'Canvas Laugh Club',
    type: 'audition',
    locationType: 'onsite',
    location: { city: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777 },
    description: 'Weekly open mic night for aspiring comedians. Best performers get paid slots.',
    requirements: ['5 min set', 'Original material', 'Any language'],
    skills: ['Comedy', 'Stage Presence', 'Timing'],
    compensation: 'Paid gigs for top performers',
    eventDate: '2024-02-10',
    deadline: '2024-02-08',
    sourceUrl: 'https://canvaslaughclub.com',
    sourcePlatform: 'Canvas Laugh',
    postedAt: '2024-02-04',
    domains: ['theatre', 'public-speaking'],
    skillCategory: 'creative',
  },
  {
    id: '30',
    title: 'DevOps Engineer - Singapore',
    company: 'Grab',
    companyLogo: 'https://grab.com/favicon.ico',
    type: 'job',
    locationType: 'onsite',
    location: { city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198 },
    description: 'Build and maintain infrastructure serving millions of users across Southeast Asia.',
    requirements: ['5+ years DevOps', 'AWS/GCP', 'Kubernetes'],
    skills: ['Kubernetes', 'Terraform', 'AWS', 'Go'],
    compensation: 'SGD 150,000 - 200,000',
    deadline: '2024-03-30',
    sourceUrl: 'https://grab.careers',
    sourcePlatform: 'Grab',
    postedAt: '2024-02-05',
    domains: ['devops', 'cloud'],
    skillCategory: 'tech',
  },
];

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Constants for distance filtering
const LOCAL_RADIUS_KM = 100;

// Helper to get location display text
export function getLocationDisplay(opportunity: Opportunity): string {
  if (opportunity.locationType === 'remote') {
    return 'Remote';
  }
  if (opportunity.location) {
    return `${opportunity.location.city}, ${opportunity.location.country}`;
  }
  return 'On-site';
}

// API Service Functions
export const opportunitiesApi = {
  // Fetch all opportunities with optional filters and distance-based sorting
  async getOpportunities(
    filters?: Partial<FilterOptions>,
    sort: SortOption = 'newest',
    page: number = 1,
    limit: number = 10,
    userLocation?: { lat: number; lng: number; city?: string; country?: string }
  ): Promise<{ data: Opportunity[]; total: number; hasMore: boolean }> {
    await delay(800);

    let filtered = [...mockOpportunities];

    // Apply filters
    if (filters?.types?.length) {
      filtered = filtered.filter(o => filters.types!.includes(o.type));
    }
    if (filters?.locationTypes?.length) {
      filtered = filtered.filter(o => filters.locationTypes!.includes(o.locationType));
    }
    if (filters?.domains?.length) {
      filtered = filtered.filter(o => 
        o.domains.some(d => filters.domains!.includes(d))
      );
    }
    if (filters?.skillCategories?.length) {
      filtered = filtered.filter(o => filters.skillCategories!.includes(o.skillCategory));
    }
    if (filters?.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(o =>
        o.title.toLowerCase().includes(query) ||
        o.company.toLowerCase().includes(query) ||
        o.skills.some(s => s.toLowerCase().includes(query))
      );
    }

    // Calculate distance for each opportunity if user location provided
    if (userLocation && userLocation.lat !== 0 && userLocation.lng !== 0) {
      filtered = filtered.map(o => {
        if (o.locationType === 'remote') {
          return { ...o, distance: undefined };
        }
        if (o.location) {
          const dist = calculateDistance(
            { lat: userLocation.lat, lng: userLocation.lng },
            { lat: o.location.lat, lng: o.location.lng }
          );
          return { ...o, distance: dist };
        }
        return o;
      });

      // Filter by distance: show local (within 100km) + remote + nationwide fallback
      const localOpportunities = filtered.filter(o => 
        o.locationType === 'remote' || 
        (o.distance !== undefined && o.distance <= LOCAL_RADIUS_KM)
      );

      // If we have local results, use them; otherwise show nationwide (same country) or all
      if (localOpportunities.length >= 3) {
        filtered = localOpportunities;
      } else if (userLocation.country) {
        // Nationwide fallback
        const nationwideOpportunities = filtered.filter(o =>
          o.locationType === 'remote' ||
          (o.location?.country.toLowerCase() === userLocation.country?.toLowerCase())
        );
        filtered = nationwideOpportunities.length > 0 ? nationwideOpportunities : filtered;
      }
    }

    // Apply sorting
    switch (sort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
        break;
      case 'deadline':
        filtered.sort((a, b) => {
          const deadlineA = a.deadline || a.eventDate || '9999-12-31';
          const deadlineB = b.deadline || b.eventDate || '9999-12-31';
          return new Date(deadlineA).getTime() - new Date(deadlineB).getTime();
        });
        break;
      case 'relevance':
        // Sort by distance (nearest first), then trending
        filtered.sort((a, b) => {
          // Remote opportunities go to the end of distance sort
          const distA = a.distance ?? 99999;
          const distB = b.distance ?? 99999;
          if (distA !== distB) {
            return distA - distB;
          }
          return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0);
        });
        break;
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      total: filtered.length,
      hasMore: startIndex + limit < filtered.length,
    };
  },

  // Get trending opportunities
  async getTrending(limit: number = 5): Promise<Opportunity[]> {
    await delay(500);
    return mockOpportunities.filter(o => o.isTrending).slice(0, limit);
  },

  // Get opportunity by ID
  async getById(id: string): Promise<Opportunity | null> {
    await delay(300);
    return mockOpportunities.find(o => o.id === id) || null;
  },

  // Get similar opportunities
  async getSimilar(opportunity: Opportunity, limit: number = 4): Promise<Opportunity[]> {
    await delay(400);
    return mockOpportunities
      .filter(o => 
        o.id !== opportunity.id && 
        (o.domains.some(d => opportunity.domains.includes(d)) || o.type === opportunity.type)
      )
      .slice(0, limit);
  },

  // Search opportunities
  async search(query: string): Promise<Opportunity[]> {
    await delay(300);
    const lowerQuery = query.toLowerCase();
    return mockOpportunities.filter(o =>
      o.title.toLowerCase().includes(lowerQuery) ||
      o.company.toLowerCase().includes(lowerQuery) ||
      o.skills.some(s => s.toLowerCase().includes(lowerQuery))
    );
  },

  // Get opportunities by location with distance calculation
  async getByLocation(
    userLat: number,
    userLng: number,
    radiusKm: number = LOCAL_RADIUS_KM
  ): Promise<Opportunity[]> {
    await delay(600);
    
    return mockOpportunities
      .map(o => {
        if (o.locationType === 'remote') {
          return { ...o, distance: undefined };
        }
        if (o.location) {
          const dist = calculateDistance(
            { lat: userLat, lng: userLng },
            { lat: o.location.lat, lng: o.location.lng }
          );
          return { ...o, distance: dist };
        }
        return o;
      })
      .filter(o => 
        o.locationType === 'remote' || 
        (o.distance !== undefined && o.distance <= radiusKm)
      )
      .sort((a, b) => (a.distance ?? 99999) - (b.distance ?? 99999));
  },

  // Get by domain category
  async getByDomain(domain: Domain): Promise<Opportunity[]> {
    await delay(500);
    return mockOpportunities.filter(o => o.domains.includes(domain));
  },
};

export default opportunitiesApi;
