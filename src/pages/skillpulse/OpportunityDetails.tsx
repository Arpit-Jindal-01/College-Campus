import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bookmark, 
  Share2, 
  ExternalLink, 
  MapPin, 
  Calendar, 
  Clock, 
  Building2,
  DollarSign,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { OpportunityCard } from '@/components/skillpulse/OpportunityCard';
import { SkeletonCard } from '@/components/skillpulse/SkeletonCard';
import { useSkillPulse } from '@/contexts/SkillPulseContext';
import { opportunitiesApi } from '@/services/opportunitiesApi';
import { Opportunity, OPPORTUNITY_TYPE_LABELS } from '@/types/skillpulse';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { getLocationDisplay } from '@/services/opportunitiesApi';

const typeColors: Record<string, string> = {
  internship: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  job: 'bg-green-500/20 text-green-400 border-green-500/30',
  hackathon: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  contest: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  event: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  scholarship: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  fellowship: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  conference: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function OpportunityDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { savedOpportunities, toggleSaveOpportunity, isAuthenticated } = useSkillPulse();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [similar, setSimilar] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isSaved = id ? savedOpportunities.includes(id) : false;

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      const [opp, sim] = await Promise.all([
        opportunitiesApi.getById(id),
        opportunitiesApi.getById(id).then(o => o ? opportunitiesApi.getSimilar(o, 4) : [])
      ]);
      setOpportunity(opp);
      setSimilar(sim);
      setIsLoading(false);
    };
    fetchData();
  }, [id]);

  const handleShare = async () => {
    if (navigator.share && opportunity) {
      try {
        await navigator.share({
          title: opportunity.title,
          text: `Check out this ${opportunity.type}: ${opportunity.title} at ${opportunity.company}`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied to clipboard!' });
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 safe-top safe-bottom">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-2xl" />
          <div className="h-32 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="font-display text-xl font-semibold mb-2">Not Found</h2>
          <p className="text-muted-foreground mb-4">This opportunity doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => isAuthenticated && id && toggleSaveOpportunity(id)}
            >
              <Bookmark className={cn('w-5 h-5', isSaved && 'fill-primary text-primary')} />
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 pb-32">
        {/* Hero */}
        <section className="py-6">
          <div className="flex items-start gap-4 mb-4">
            {opportunity.companyLogo ? (
              <img 
                src={opportunity.companyLogo} 
                alt={opportunity.company}
                className="w-16 h-16 rounded-2xl object-cover bg-secondary"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                <Building2 className="w-8 h-8 text-primary-foreground" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={cn('text-xs', typeColors[opportunity.type])}>
                  {OPPORTUNITY_TYPE_LABELS[opportunity.type]}
                </Badge>
                <Badge variant="secondary" className="text-xs capitalize">
                  {opportunity.locationType}
                </Badge>
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-1">
                {opportunity.title}
              </h1>
              <p className="text-muted-foreground">{opportunity.company}</p>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="glass-card-strong rounded-xl p-4 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium text-sm">
                  {getLocationDisplay(opportunity)}
                </p>
              </div>
            </div>
            {opportunity.compensation && (
              <div className="glass-card-strong rounded-xl p-4 flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Compensation</p>
                  <p className="font-medium text-sm">{opportunity.compensation}</p>
                </div>
              </div>
            )}
            {opportunity.deadline && (
              <div className="glass-card-strong rounded-xl p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-destructive" />
                <div>
                  <p className="text-xs text-muted-foreground">Deadline</p>
                  <p className="font-medium text-sm">{formatDate(opportunity.deadline)}</p>
                </div>
              </div>
            )}
            {opportunity.eventDate && (
              <div className="glass-card-strong rounded-xl p-4 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Event Date</p>
                  <p className="font-medium text-sm">{formatDate(opportunity.eventDate)}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Description */}
        <section className="mb-6">
          <h2 className="font-display font-semibold text-lg mb-3">About</h2>
          <p className="text-muted-foreground leading-relaxed">
            {opportunity.description}
          </p>
        </section>

        {/* Requirements */}
        {opportunity.requirements.length > 0 && (
          <section className="mb-6">
            <h2 className="font-display font-semibold text-lg mb-3">Requirements</h2>
            <ul className="space-y-2">
              {opportunity.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Skills */}
        <section className="mb-6">
          <h2 className="font-display font-semibold text-lg mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {opportunity.skills.map(skill => (
              <Badge key={skill} variant="secondary" className="px-3 py-1.5">
                {skill}
              </Badge>
            ))}
          </div>
        </section>

        {/* Source */}
        <section className="mb-8">
          <div className="glass-card-strong rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Source</p>
              <p className="font-medium">{opportunity.sourcePlatform}</p>
            </div>
            <ExternalLink className="w-5 h-5 text-muted-foreground" />
          </div>
        </section>

        {/* Similar */}
        {similar.length > 0 && (
          <section>
            <h2 className="font-display font-semibold text-lg mb-3">Similar Opportunities</h2>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-4 pb-4">
                {similar.map(opp => (
                  <OpportunityCard key={opp.id} opportunity={opp} variant="trending" />
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="h-1" />
            </ScrollArea>
          </section>
        )}
      </main>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/50 safe-bottom">
        <Button 
          className="w-full h-14 text-lg font-semibold gradient-primary"
          onClick={() => window.open(opportunity.sourceUrl, '_blank')}
        >
          Apply Now
          <ExternalLink className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
