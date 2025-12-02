import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { BookOpen, Mic, Brain, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  {
    icon: Mic,
    title: 'Record Lectures',
    description: 'Capture your classes with a single tap. Works offline and supports long recordings.',
  },
  {
    icon: Brain,
    title: 'AI Transcription',
    description: 'Advanced speech-to-text that understands English, Hindi, and Hinglish mixed accents.',
  },
  {
    icon: Sparkles,
    title: 'Smart Notes',
    description: 'Auto-generate summaries, key points, exam questions, and study tasks from every lecture.',
  },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const { completeOnboarding } = useApp();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="min-h-screen gradient-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] gradient-glow pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center shadow-glow">
            <BookOpen className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl text-foreground">Class Whisperer</h1>
        </div>

        {/* Step content */}
        <div className="text-center mb-12 animate-fade-in" key={currentStep}>
          <div className="w-24 h-24 rounded-3xl gradient-card border border-border/50 mx-auto mb-8 flex items-center justify-center shadow-elevated">
            <CurrentIcon className="w-12 h-12 text-primary" />
          </div>
          <h2 className="font-display text-2xl text-foreground mb-4">
            {steps[currentStep].title}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {steps[currentStep].description}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === currentStep 
                  ? "w-8 gradient-gold" 
                  : i < currentStep 
                    ? "w-2 bg-primary/50" 
                    : "w-2 bg-muted"
              )}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button size="xl" onClick={handleNext} className="w-full">
            {currentStep < steps.length - 1 ? (
              <>
                Continue
                <ChevronRight className="w-5 h-5" />
              </>
            ) : (
              'Get Started'
            )}
          </Button>
          
          {currentStep < steps.length - 1 && (
            <Button 
              variant="ghost" 
              onClick={completeOnboarding}
              className="text-muted-foreground"
            >
              Skip
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
