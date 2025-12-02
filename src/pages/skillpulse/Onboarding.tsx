import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, MapPin, Zap, Target, Bell, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useSkillPulse } from '@/contexts/SkillPulseContext';
import { Domain, LocationType, DOMAIN_LABELS, UserPreferences, UserLocation } from '@/types/skillpulse';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useUserLocation } from '@/hooks/useUserLocation';

const domains: Domain[] = [
  'web-dev', 'ai-ml', 'cybersecurity', 'design', 'mobile', 
  'data-science', 'blockchain', 'cloud', 'devops', 'product', 'business',
  'singing', 'dancing', 'theatre', 'music', 'content-writing', 
  'public-speaking', 'photography', 'videography', 'illustration'
];

const slides = [
  {
    icon: Zap,
    title: 'Discover Opportunities',
    description: 'Find internships, jobs, hackathons, and more tailored to your interests.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Target,
    title: 'Personalized Feed',
    description: 'Get recommendations based on your skills, location, and preferences.',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    icon: Bell,
    title: 'Never Miss Out',
    description: 'Receive notifications for deadlines and new opportunities.',
    color: 'from-pink-500 to-pink-600',
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding, user } = useSkillPulse();
  const { location: savedLocation, isLoading: isLoadingLocation, error: locationError, detectLocation, setManualLocation } = useUserLocation();
  
  const [step, setStep] = useState(0);
  const [selectedDomains, setSelectedDomains] = useState<Domain[]>(user?.preferences.domains || []);
  const [selectedLocationTypes, setSelectedLocationTypes] = useState<LocationType[]>(user?.preferences.locationType || ['remote']);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCity, setManualCity] = useState('');
  const [manualCountry, setManualCountry] = useState('');

  const totalSteps = slides.length + 3; // slides + domains + location type + location

  const handleDomainToggle = (domain: Domain) => {
    setSelectedDomains(prev =>
      prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain]
    );
  };

  const handleLocationTypeToggle = (type: LocationType) => {
    setSelectedLocationTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const requestLocation = async () => {
    const result = await detectLocation();
    if (result) {
      toast({ title: 'Location detected!', description: `${result.city}, ${result.country}` });
    } else if (locationError) {
      toast({ 
        title: 'Could not get location', 
        description: locationError,
        variant: 'destructive' 
      });
      setShowManualInput(true);
    }
  };

  const handleManualLocation = async () => {
    if (manualCity.trim() && manualCountry.trim()) {
      const result = await setManualLocation(manualCity.trim(), manualCountry.trim());
      if (result) {
        toast({ title: 'Location set!', description: `${result.city}, ${result.country}` });
        setShowManualInput(false);
      } else {
        toast({ 
          title: 'Location not found', 
          description: 'Please check the spelling and try again.',
          variant: 'destructive' 
        });
      }
    }
  };

  const handleComplete = () => {
    const preferences: UserPreferences = {
      domains: selectedDomains,
      locationType: selectedLocationTypes.length > 0 ? selectedLocationTypes : ['remote'],
      notifications: {
        newRemote: true,
        newLocal: true,
        deadlineSoon: true,
      },
    };
    
    // Convert saved location to UserLocation format
    const userLocation: UserLocation | undefined = savedLocation ? {
      city: savedLocation.city,
      country: savedLocation.country,
      coordinates: {
        lat: savedLocation.lat,
        lng: savedLocation.lng,
      },
    } : undefined;
    
    completeOnboarding(preferences, userLocation);
    navigate('/');
  };

  const renderStep = () => {
    // Carousel slides
    if (step < slides.length) {
      const slide = slides[step];
      const Icon = slide.icon;
      return (
        <div className="flex flex-col items-center text-center px-8 animate-scale-in">
          <div className={cn(
            'w-32 h-32 rounded-3xl flex items-center justify-center mb-8 shadow-lg bg-gradient-to-br',
            slide.color
          )}>
            <Icon className="w-16 h-16 text-white" />
          </div>
          <h2 className="font-display text-3xl font-bold mb-4">{slide.title}</h2>
          <p className="text-muted-foreground text-lg">{slide.description}</p>
        </div>
      );
    }

    // Domains selection
    if (step === slides.length) {
      return (
        <div className="px-6 animate-scale-in">
          <h2 className="font-display text-2xl font-bold mb-2 text-center">
            What interests you?
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            Select your domains to personalize your feed
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {domains.map(domain => (
              <Badge
                key={domain}
                variant={selectedDomains.includes(domain) ? 'default' : 'outline'}
                className={cn(
                  'px-4 py-3 text-sm cursor-pointer press-effect transition-all',
                  selectedDomains.includes(domain) && 'gradient-primary text-primary-foreground'
                )}
                onClick={() => handleDomainToggle(domain)}
              >
                {selectedDomains.includes(domain) && <Check className="w-4 h-4 mr-1" />}
                {DOMAIN_LABELS[domain]}
              </Badge>
            ))}
          </div>
        </div>
      );
    }

    // Location type preference
    if (step === slides.length + 1) {
      return (
        <div className="px-6 animate-scale-in">
          <h2 className="font-display text-2xl font-bold mb-2 text-center">
            Work preference?
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            Choose your preferred work style
          </p>
          <div className="space-y-3">
            {(['remote', 'onsite', 'hybrid'] as LocationType[]).map(type => (
              <button
                key={type}
                onClick={() => handleLocationTypeToggle(type)}
                className={cn(
                  'w-full p-5 rounded-2xl border-2 text-left press-effect transition-all',
                  selectedLocationTypes.includes(type)
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold capitalize text-lg">{type}</p>
                    <p className="text-sm text-muted-foreground">
                      {type === 'remote' && 'Work from anywhere in the world'}
                      {type === 'onsite' && 'Work at company offices'}
                      {type === 'hybrid' && 'Mix of remote and in-office'}
                    </p>
                  </div>
                  {selectedLocationTypes.includes(type) && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Location access
    if (step === slides.length + 2) {
      return (
        <div className="px-6 animate-scale-in text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-accent flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MapPin className="w-12 h-12 text-white" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">
            Enable Location?
          </h2>
          <p className="text-muted-foreground mb-8">
            Get opportunities near you. You can change this later.
          </p>
          
          {savedLocation ? (
            <div className="glass-card-strong rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Your location</p>
                  <p className="font-display text-xl font-bold">
                    {savedLocation.city}, {savedLocation.country}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowManualInput(true)}>
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : showManualInput ? (
            <div className="space-y-3 mb-6">
              <Input
                placeholder="City (e.g., Mumbai)"
                value={manualCity}
                onChange={(e) => setManualCity(e.target.value)}
                className="h-12"
              />
              <Input
                placeholder="Country (e.g., India)"
                value={manualCountry}
                onChange={(e) => setManualCountry(e.target.value)}
                className="h-12"
              />
              <Button 
                className="w-full h-12 gradient-primary"
                onClick={handleManualLocation}
                disabled={!manualCity.trim() || !manualCountry.trim() || isLoadingLocation}
              >
                {isLoadingLocation ? 'Finding location...' : 'Set Location'}
              </Button>
              <Button 
                variant="ghost"
                className="w-full"
                onClick={() => setShowManualInput(false)}
              >
                Back to auto-detect
              </Button>
            </div>
          ) : (
            <>
              <Button 
                className="w-full h-14 mb-4 gradient-primary"
                onClick={requestLocation}
                disabled={isLoadingLocation}
              >
                <MapPin className="w-5 h-5 mr-2" />
                {isLoadingLocation ? 'Detecting...' : 'Use My Current Location'}
              </Button>
              <Button 
                variant="outline"
                className="w-full h-12 mb-4"
                onClick={() => setShowManualInput(true)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Enter Location Manually
              </Button>
            </>
          )}
          
          <Button 
            variant="ghost"
            className="w-full"
            onClick={() => setStep(step + 1)}
          >
            {savedLocation ? 'Continue' : 'Skip for now'}
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-top safe-bottom">
      {/* Progress */}
      <div className="px-6 pt-6">
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 rounded-full flex-1 transition-all duration-300',
                i <= step ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center py-8">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="px-6 pb-6 flex gap-3">
        {step > 0 && (
          <Button
            variant="outline"
            size="lg"
            className="h-14"
            onClick={() => setStep(step - 1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        
        <Button
          className="flex-1 h-14 font-semibold gradient-primary"
          onClick={() => {
            if (step < totalSteps - 1) {
              setStep(step + 1);
            } else {
              handleComplete();
            }
          }}
        >
          {step === totalSteps - 1 ? 'Get Started' : 'Continue'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
