import { useNavigate } from 'react-router-dom';
import { 
  Code, Brain, Shield, Palette, Smartphone, BarChart3, Coins, Cloud, Settings, Briefcase, Building2,
  Mic, Music, Theater, Camera, Pen, MessageSquare, Video, Paintbrush, Scissors, ChefHat,
  Map, Sparkles
} from 'lucide-react';
import { SearchBar } from '@/components/skillpulse/SearchBar';
import { Domain, DOMAIN_LABELS, TECH_DOMAINS, CREATIVE_DOMAINS } from '@/types/skillpulse';
import { cn } from '@/lib/utils';
import { useSkillPulse } from '@/contexts/SkillPulseContext';

const domainIcons: Record<Domain, React.ElementType> = {
  // Tech
  'web-dev': Code,
  'ai-ml': Brain,
  'cybersecurity': Shield,
  'design': Palette,
  'mobile': Smartphone,
  'data-science': BarChart3,
  'blockchain': Coins,
  'cloud': Cloud,
  'devops': Settings,
  'product': Briefcase,
  'business': Building2,
  // Creative
  'singing': Mic,
  'dancing': Music,
  'theatre': Theater,
  'music': Music,
  'content-writing': Pen,
  'public-speaking': MessageSquare,
  'photography': Camera,
  'videography': Video,
  'illustration': Paintbrush,
  'fashion': Scissors,
  'culinary': ChefHat,
};

const techDomainColors: Record<string, string> = {
  'web-dev': 'from-blue-500 to-blue-600',
  'ai-ml': 'from-purple-500 to-purple-600',
  'cybersecurity': 'from-red-500 to-red-600',
  'design': 'from-pink-500 to-pink-600',
  'mobile': 'from-green-500 to-green-600',
  'data-science': 'from-yellow-500 to-yellow-600',
  'blockchain': 'from-orange-500 to-orange-600',
  'cloud': 'from-cyan-500 to-cyan-600',
  'devops': 'from-indigo-500 to-indigo-600',
  'product': 'from-teal-500 to-teal-600',
  'business': 'from-slate-500 to-slate-600',
};

const creativeDomainColors: Record<string, string> = {
  'singing': 'from-rose-500 to-rose-600',
  'dancing': 'from-fuchsia-500 to-fuchsia-600',
  'theatre': 'from-amber-500 to-amber-600',
  'music': 'from-violet-500 to-violet-600',
  'content-writing': 'from-emerald-500 to-emerald-600',
  'public-speaking': 'from-sky-500 to-sky-600',
  'photography': 'from-stone-500 to-stone-600',
  'videography': 'from-red-500 to-red-600',
  'illustration': 'from-lime-500 to-lime-600',
  'fashion': 'from-pink-400 to-pink-500',
  'culinary': 'from-orange-400 to-orange-500',
};

export default function Explore() {
  const navigate = useNavigate();
  const { setFilters } = useSkillPulse();

  const handleDomainClick = (domain: Domain) => {
    setFilters({ domains: [domain], types: [], locationTypes: [], skillCategories: [] });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 safe-top">
        <div className="px-4 py-4">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">
            Explore
          </h1>
          <SearchBar showFilter={false} placeholder="Search categories..." />
        </div>
      </header>

      <main className="px-4 pb-24">
        {/* Technical Skills */}
        <section className="py-6">
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Technical Skills</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 stagger-children">
            {TECH_DOMAINS.map(domain => {
              const Icon = domainIcons[domain];
              return (
                <button
                  key={domain}
                  onClick={() => handleDomainClick(domain)}
                  className={cn(
                    'p-5 rounded-2xl text-left press-effect transition-all duration-300',
                    'bg-gradient-to-br hover:scale-[1.02] hover:shadow-lg',
                    techDomainColors[domain]
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-white text-sm">
                    {DOMAIN_LABELS[domain]}
                  </h3>
                </button>
              );
            })}
          </div>
        </section>

        {/* Creative Skills */}
        <section className="py-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="font-display text-lg font-semibold">Creative & Arts</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 stagger-children">
            {CREATIVE_DOMAINS.map(domain => {
              const Icon = domainIcons[domain];
              return (
                <button
                  key={domain}
                  onClick={() => handleDomainClick(domain)}
                  className={cn(
                    'p-5 rounded-2xl text-left press-effect transition-all duration-300',
                    'bg-gradient-to-br hover:scale-[1.02] hover:shadow-lg',
                    creativeDomainColors[domain]
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-white text-sm">
                    {DOMAIN_LABELS[domain]}
                  </h3>
                </button>
              );
            })}
          </div>
        </section>

        {/* Map Preview (Placeholder) */}
        <section className="py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Nearby Events</h2>
            <span className="text-sm text-muted-foreground">Coming soon</span>
          </div>
          <div className="rounded-2xl bg-secondary/50 border border-border/50 p-8 flex flex-col items-center justify-center min-h-[200px]">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Map className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-center">
              Map view with nearby opportunities coming soon
            </p>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-6">
          <h2 className="font-display text-lg font-semibold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card-strong rounded-2xl p-5">
              <p className="text-3xl font-display font-bold text-primary">150+</p>
              <p className="text-sm text-muted-foreground">Remote Opportunities</p>
            </div>
            <div className="glass-card-strong rounded-2xl p-5">
              <p className="text-3xl font-display font-bold text-accent">45</p>
              <p className="text-sm text-muted-foreground">Active Competitions</p>
            </div>
            <div className="glass-card-strong rounded-2xl p-5">
              <p className="text-3xl font-display font-bold text-foreground">$2M+</p>
              <p className="text-sm text-muted-foreground">In Prizes</p>
            </div>
            <div className="glass-card-strong rounded-2xl p-5">
              <p className="text-3xl font-display font-bold text-foreground">89</p>
              <p className="text-sm text-muted-foreground">Workshops & Events</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
