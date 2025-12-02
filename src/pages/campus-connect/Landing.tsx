import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Sparkles, Heart, Briefcase } from 'lucide-react';
import { useCampusConnect } from '@/contexts/CampusConnectContext';
import { useEffect } from 'react';

export default function CampusLanding() {
  const navigate = useNavigate();
  const { user, profile, loading, profileLoading } = useCampusConnect();
  
  useEffect(() => {
    // Wait for both auth and profile to finish loading
    if (!loading && !profileLoading && user) {
      if (profile?.onboarding_completed) {
        navigate('/', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [user, profile, loading, profileLoading, navigate]);
  
  if (loading || (user && profileLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        {/* Logo */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/30">
            <Users className="w-12 h-12 text-primary-foreground" />
          </div>
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-primary/50 to-accent/50 blur-xl opacity-50 animate-pulse" />
        </div>
        
        {/* Title */}
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-center mb-4">
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Campus Connect
          </span>
        </h1>
        
        <p className="text-lg text-muted-foreground text-center max-w-sm mb-8">
          Find friends, project partners, study groups, and maybe something more.
        </p>
        
        {/* Features */}
        <div className="grid grid-cols-2 gap-3 mb-12 w-full max-w-sm">
          {[
            { icon: Users, label: 'Make Friends' },
            { icon: Briefcase, label: 'Find Partners' },
            { icon: Sparkles, label: 'Join Teams' },
            { icon: Heart, label: 'Connect' }
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 p-3 rounded-xl bg-card/50 border border-border/50">
              <Icon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* CTA */}
      <div className="px-8 pb-12 safe-bottom space-y-3">
        <Button 
          size="lg"
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90"
          onClick={() => navigate('/auth')}
        >
          Get Started
        </Button>
        
        <p className="text-center text-sm text-muted-foreground">
          Connect with students across your campus
        </p>
      </div>
    </div>
  );
}
