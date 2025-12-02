import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Waveform } from '@/components/Waveform';
import { useLectures } from '@/hooks/useLectures';
import { useNavigate } from 'react-router-dom';
import { Mic, Square, Pause, Play, X, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped' | 'details' | 'processing';

export default function Record() {
  const navigate = useNavigate();
  const { createLecture } = useLectures();
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [details, setDetails] = useState({
    subject: '',
    topic: '',
    teacherName: '',
    className: '',
  });
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000);
      setState('recording');
      setDuration(0);
      
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      toast.error('Could not access microphone. Please grant permission.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      setState('paused');
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setState('recording');
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setState('details');
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setState('idle');
    setDuration(0);
    audioChunksRef.current = [];
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSubmit = async () => {
    if (!details.subject || !details.topic) {
      toast.error('Please fill in subject and topic');
      return;
    }

    if (audioChunksRef.current.length === 0) {
      toast.error('No audio recorded');
      return;
    }

    setState('processing');

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const audioBase64 = await blobToBase64(audioBlob);

      const lectureId = await createLecture({
        ...details,
        duration,
        audioBase64,
      });

      if (lectureId) {
        toast.success('Recording uploaded! Processing in progress...');
        navigate(`/lecture/${lectureId}`);
      } else {
        throw new Error('Failed to create lecture');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Failed to process recording. Please try again.');
      setState('details');
    }
  };

  return (
    <div className="min-h-screen gradient-dark pb-24 md:pb-8 md:pl-64">
      <header className="p-6 border-b border-border/30">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display text-2xl text-foreground">Record Lecture</h1>
        </div>
      </header>

      <main className="p-6 max-w-md mx-auto">
        {state === 'idle' && (
          <div className="text-center py-12 animate-fade-in">
            <div className="relative inline-block mb-8">
              <Button variant="record" size="icon-xl" onClick={startRecording} className="relative z-10">
                <Mic className="w-10 h-10" />
              </Button>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Ready to Record</h2>
            <p className="text-muted-foreground">Tap the button to start recording your lecture</p>
          </div>
        )}

        {(state === 'recording' || state === 'paused') && (
          <div className="text-center py-8 animate-fade-in">
            <div className="relative mb-6">
              {state === 'recording' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-destructive/20 pulse-ring" />
                </div>
              )}
              <div className={cn(
                "w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-colors",
                state === 'recording' ? "bg-destructive" : "bg-muted"
              )}>
                <Mic className="w-10 h-10 text-foreground" />
              </div>
            </div>
            <p className="text-4xl font-mono text-foreground mb-2">{formatTime(duration)}</p>
            <p className={cn("text-sm mb-8", state === 'recording' ? "text-destructive" : "text-muted-foreground")}>
              {state === 'recording' ? '● Recording' : '⏸ Paused'}
            </p>
            <Waveform isRecording={state === 'recording'} className="mb-8" />
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="icon-lg" onClick={cancelRecording}><X className="w-6 h-6" /></Button>
              {state === 'recording' ? (
                <Button variant="glass" size="icon-lg" onClick={pauseRecording}><Pause className="w-6 h-6" /></Button>
              ) : (
                <Button variant="glass" size="icon-lg" onClick={resumeRecording}><Play className="w-6 h-6" /></Button>
              )}
              <Button variant="record" size="icon-lg" onClick={stopRecording}><Square className="w-6 h-6" /></Button>
            </div>
          </div>
        )}

        {state === 'details' && (
          <div className="py-8 animate-fade-in">
            <div className="text-center mb-8">
              <p className="text-3xl font-mono text-foreground mb-2">{formatTime(duration)}</p>
              <p className="text-muted-foreground">Recording complete</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input id="subject" placeholder="e.g., Computer Science" value={details.subject} onChange={(e) => setDetails(prev => ({ ...prev, subject: e.target.value }))} className="mt-2 bg-card/50 border-border/50" />
              </div>
              <div>
                <Label htmlFor="topic">Topic *</Label>
                <Input id="topic" placeholder="e.g., Introduction to Machine Learning" value={details.topic} onChange={(e) => setDetails(prev => ({ ...prev, topic: e.target.value }))} className="mt-2 bg-card/50 border-border/50" />
              </div>
              <div>
                <Label htmlFor="teacherName">Teacher's Name</Label>
                <Input id="teacherName" placeholder="e.g., Dr. Sharma" value={details.teacherName} onChange={(e) => setDetails(prev => ({ ...prev, teacherName: e.target.value }))} className="mt-2 bg-card/50 border-border/50" />
              </div>
              <div>
                <Label htmlFor="className">Class</Label>
                <Input id="className" placeholder="e.g., CSE 4th Year" value={details.className} onChange={(e) => setDetails(prev => ({ ...prev, className: e.target.value }))} className="mt-2 bg-card/50 border-border/50" />
              </div>
              <div className="pt-4 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={cancelRecording}>Cancel</Button>
                <Button className="flex-1" onClick={handleSubmit}>Save & Process</Button>
              </div>
            </div>
          </div>
        )}

        {state === 'processing' && (
          <div className="text-center py-12 animate-fade-in">
            <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Processing...</h2>
            <p className="text-muted-foreground">Uploading audio and starting transcription</p>
          </div>
        )}
      </main>
    </div>
  );
}
