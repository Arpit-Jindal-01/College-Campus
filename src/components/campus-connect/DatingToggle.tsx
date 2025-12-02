import { Heart, HeartOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDatingMode } from '@/contexts/DatingModeContext';
import { useCampusConnect } from '@/contexts/CampusConnectContext';
import { cn } from '@/lib/utils';

export function DatingToggle() {
  const { profile } = useCampusConnect();
  const { isDatingActive, setIsDatingActive } = useDatingMode();

  // Only show if user has dating_mode enabled
  if (!profile?.dating_mode) return null;

  return (
    <Button
      variant={isDatingActive ? "default" : "outline"}
      size="icon"
      onClick={() => setIsDatingActive(!isDatingActive)}
      className={cn(
        "rounded-full transition-all",
        isDatingActive 
          ? "bg-pink-500 hover:bg-pink-600 text-white border-pink-400" 
          : "border-pink-500/50 text-pink-500 hover:bg-pink-500/10"
      )}
    >
      {isDatingActive ? <HeartOff className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
    </Button>
  );
}
