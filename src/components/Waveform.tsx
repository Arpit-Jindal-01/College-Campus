import { cn } from '@/lib/utils';

interface WaveformProps {
  isRecording: boolean;
  className?: string;
}

export function Waveform({ isRecording, className }: WaveformProps) {
  const bars = 40;
  
  return (
    <div className={cn("flex items-center justify-center gap-1 h-24", className)}>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 bg-primary rounded-full transition-all duration-200",
            isRecording ? "waveform-bar" : "h-2 opacity-30"
          )}
          style={{
            animationDelay: isRecording ? `${i * 0.05}s` : undefined,
            height: isRecording ? undefined : '8px',
          }}
        />
      ))}
    </div>
  );
}
