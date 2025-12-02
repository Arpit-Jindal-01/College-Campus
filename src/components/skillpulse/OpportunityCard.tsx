import { Opportunity, OPPORTUNITY_TYPE_LABELS } from '@/types/skillpulse';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark, MapPin, Calendar, Clock, Building2, Navigation } from 'lucide-react';
import { useSkillPulse } from '@/contexts/SkillPulseContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatDistance } from '@/lib/geo';
import { getLocationDisplay } from '@/services/opportunitiesApi';

interface OpportunityCardProps {
  opportunity: Opportunity;
  variant?: 'default' | 'compact' | 'trending';
}

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

export function OpportunityCard({ opportunity, variant = 'default' }: OpportunityCardProps) {
  const { savedOpportunities, toggleSaveOpportunity, isAuthenticated } = useSkillPulse();
  const navigate = useNavigate();
  const isSaved = savedOpportunities.includes(opportunity.id);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAuthenticated) {
      toggleSaveOpportunity(opportunity.id);
    }
  };

  const formatDeadline = (date?: string) => {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return 'Expired';
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff <= 7) return `${diff} days left`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (variant === 'trending') {
    return (
      <div
        onClick={() => navigate(`/opportunity/${opportunity.id}`)}
        className="glass-card-strong rounded-2xl p-4 min-w-[280px] max-w-[280px] cursor-pointer press-effect hover:shadow-lg transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {opportunity.companyLogo ? (
              <img 
                src={opportunity.companyLogo} 
                alt={opportunity.company}
                className="w-10 h-10 rounded-xl object-cover bg-secondary"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-foreground">{opportunity.company}</p>
              <Badge variant="outline" className={cn('text-[10px] px-1.5', typeColors[opportunity.type])}>
                {OPPORTUNITY_TYPE_LABELS[opportunity.type]}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleSave}
          >
            <Bookmark className={cn('w-4 h-4', isSaved && 'fill-primary text-primary')} />
          </Button>
        </div>
        
        <h3 className="font-display font-semibold text-foreground mb-2 line-clamp-2">
          {opportunity.title}
        </h3>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {getLocationDisplay(opportunity)}
          </span>
          {opportunity.distance !== undefined && (
            <span className="flex items-center gap-1 text-primary">
              <Navigation className="w-3 h-3" />
              {formatDistance(opportunity.distance)}
            </span>
          )}
          {opportunity.deadline && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDeadline(opportunity.deadline)}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1">
          {opportunity.skills.slice(0, 3).map(skill => (
            <Badge key={skill} variant="secondary" className="text-[10px] px-2 py-0">
              {skill}
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        onClick={() => navigate(`/opportunity/${opportunity.id}`)}
        className="flex items-center gap-4 p-3 bg-card/50 rounded-xl cursor-pointer press-effect hover:bg-card transition-colors"
      >
        {opportunity.companyLogo ? (
          <img 
            src={opportunity.companyLogo} 
            alt={opportunity.company}
            className="w-12 h-12 rounded-xl object-cover bg-secondary"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">{opportunity.title}</h4>
          <p className="text-sm text-muted-foreground truncate">{opportunity.company}</p>
        </div>
        
        <Badge variant="outline" className={cn('shrink-0 text-[10px]', typeColors[opportunity.type])}>
          {OPPORTUNITY_TYPE_LABELS[opportunity.type]}
        </Badge>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate(`/opportunity/${opportunity.id}`)}
      className="glass-card-strong rounded-2xl p-5 cursor-pointer press-effect hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {opportunity.companyLogo ? (
            <img 
              src={opportunity.companyLogo} 
              alt={opportunity.company}
              className="w-12 h-12 rounded-xl object-cover bg-secondary"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
          )}
          <div>
            <p className="font-medium text-foreground">{opportunity.company}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={cn('text-xs', typeColors[opportunity.type])}>
                {OPPORTUNITY_TYPE_LABELS[opportunity.type]}
              </Badge>
              <Badge variant="secondary" className="text-xs capitalize">
                {opportunity.locationType}
              </Badge>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={handleSave}
        >
          <Bookmark className={cn('w-5 h-5', isSaved && 'fill-primary text-primary')} />
        </Button>
      </div>
      
      <h3 className="font-display text-lg font-semibold text-foreground mb-2">
        {opportunity.title}
      </h3>
      
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {opportunity.description}
      </p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {opportunity.skills.slice(0, 4).map(skill => (
          <Badge key={skill} variant="secondary" className="text-xs">
            {skill}
          </Badge>
        ))}
        {opportunity.skills.length > 4 && (
          <Badge variant="secondary" className="text-xs">
            +{opportunity.skills.length - 4}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            {getLocationDisplay(opportunity)}
          </span>
          {opportunity.distance !== undefined && (
            <span className="flex items-center gap-1.5 text-primary font-medium">
              <Navigation className="w-4 h-4" />
              {formatDistance(opportunity.distance)}
            </span>
          )}
          {(opportunity.deadline || opportunity.eventDate) && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDeadline(opportunity.deadline || opportunity.eventDate)}
            </span>
          )}
        </div>
        
        {opportunity.compensation && (
          <span className="text-sm font-medium text-accent">
            {opportunity.compensation}
          </span>
        )}
      </div>
    </div>
  );
}
