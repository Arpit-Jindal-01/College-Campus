import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSkillPulse } from '@/contexts/SkillPulseContext';
import { cn } from '@/lib/utils';

export default function Splash() {
  const navigate = useNavigate();
  const { isOnboarded } = useSkillPulse();
  const [isVisible, setIsVisible] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // If already onboarded, go directly to home
    if (isOnboarded) {
      navigate('/', { replace: true });
      return;
    }

    // Animate in
    const timer1 = setTimeout(() => setIsVisible(true), 100);
    const timer2 = setTimeout(() => setShowButton(true), 800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isOnboarded, navigate]);

  const handleGetStarted = () => {
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        {/* Logo and title */}
        <div className={cn(
          'text-center transition-all duration-1000 transform',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}>
          {/* Animated icon */}
          <div className="relative mb-8">
            <div className="w-28 h-28 mx-auto rounded-3xl gradient-primary flex items-center justify-center shadow-2xl shadow-primary/30">
              <Sparkles className="w-14 h-14 text-primary-foreground" />
            </div>
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-primary/50 to-accent/50 blur-xl opacity-50 animate-pulse" />
          </div>

          {/* Title */}
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
              SKILLPULSE
            </span>
          </h1>

          {/* Subtitle */}
          <p className={cn(
            'text-xl text-muted-foreground max-w-sm mx-auto transition-all duration-1000 delay-300',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}>
            Where Skills Meet Opportunities
          </p>
        </div>

        {/* Features preview */}
        <div className={cn(
          'mt-12 flex flex-wrap justify-center gap-3 transition-all duration-1000 delay-500',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}>
          {['Jobs', 'Internships', 'Hackathons', 'Contests', 'Auditions', 'Workshops'].map((tag, i) => (
            <span 
              key={tag}
              className="px-4 py-2 rounded-full bg-secondary/50 text-sm text-muted-foreground border border-border/50 backdrop-blur-sm"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className={cn(
        'px-8 pb-12 safe-bottom transition-all duration-700',
        showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}>
        <Button 
          size="lg"
          className="w-full h-16 text-lg font-semibold gradient-primary shadow-lg shadow-primary/30 press-effect"
          onClick={handleGetStarted}
        >
          Get Started
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Discover opportunities in Tech, Arts & more
        </p>
      </div>
    </div>
  );
}
