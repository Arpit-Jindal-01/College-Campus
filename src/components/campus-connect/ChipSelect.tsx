import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ChipSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multiple?: boolean;
  className?: string;
}

export function ChipSelect({ 
  options, 
  selected, 
  onChange, 
  multiple = true,
  className 
}: ChipSelectProps) {
  const handleToggle = (option: string) => {
    if (multiple) {
      if (selected.includes(option)) {
        onChange(selected.filter(s => s !== option));
      } else {
        onChange([...selected, option]);
      }
    } else {
      onChange([option]);
    }
  };
  
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map(option => {
        const isSelected = selected.includes(option);
        return (
          <Badge
            key={option}
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "cursor-pointer px-3 py-2 text-sm transition-all press-effect",
              isSelected 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => handleToggle(option)}
          >
            {isSelected && <Check className="w-3 h-3 mr-1" />}
            {option}
          </Badge>
        );
      })}
    </div>
  );
}
