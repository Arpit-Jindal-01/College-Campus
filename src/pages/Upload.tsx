import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLectures } from '@/hooks/useLectures';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, ArrowLeft, FileAudio, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type UploadState = 'idle' | 'selected' | 'details' | 'processing';

export default function Upload() {
  const navigate = useNavigate();
  const { createLecture } = useLectures();
  const [state, setState] = useState<UploadState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [details, setDetails] = useState({
    subject: '',
    topic: '',
    teacherName: '',
    className: '',
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('audio/')) {
        toast.error('Please select an audio file');
        return;
      }
      setFile(selectedFile);
      setState('details');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (!droppedFile.type.startsWith('audio/')) {
        toast.error('Please select an audio file');
        return;
      }
      setFile(droppedFile);
      setState('details');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const cancelUpload = () => {
    setFile(null);
    setState('idle');
    setDetails({ subject: '', topic: '', teacherName: '', className: '' });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!details.subject || !details.topic) {
      toast.error('Please fill in subject and topic');
      return;
    }

    if (!file) {
      toast.error('No file selected');
      return;
    }

    setState('processing');

    try {
      const audioBase64 = await fileToBase64(file);
      const estimatedDuration = Math.round((file.size / (1024 * 1024)) * 60);

      const lectureId = await createLecture({
        ...details,
        duration: estimatedDuration || 300,
        audioBase64,
      });

      if (lectureId) {
        toast.success('Audio uploaded! Processing in progress...');
        navigate(`/lecture/${lectureId}`);
      } else {
        throw new Error('Failed to create lecture');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Failed to process audio. Please try again.');
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
          <h1 className="font-display text-2xl text-foreground">Upload Audio</h1>
        </div>
      </header>

      <main className="p-6 max-w-md mx-auto">
        {state === 'idle' && (
          <div className="animate-fade-in" onDrop={handleDrop} onDragOver={handleDragOver}>
            <div 
              className="border-2 border-dashed border-border/50 rounded-2xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 rounded-2xl gradient-card border border-border/50 mx-auto mb-6 flex items-center justify-center">
                <UploadIcon className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Upload Audio File</h2>
              <p className="text-muted-foreground mb-6">Drag and drop or click to select</p>
              <p className="text-sm text-muted-foreground">Supports MP3, WAV, M4A, WebM and other audio formats</p>
            </div>
            <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileSelect} className="hidden" />
          </div>
        )}

        {(state === 'details' || state === 'processing') && file && (
          <div className="animate-fade-in">
            <div className="gradient-card border border-border/50 rounded-xl p-4 mb-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <FileAudio className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              {state === 'details' && (
                <Button variant="ghost" size="icon" onClick={cancelUpload}><X className="w-5 h-5" /></Button>
              )}
            </div>

            {state === 'details' && (
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
                  <Button variant="outline" className="flex-1" onClick={cancelUpload}>Cancel</Button>
                  <Button className="flex-1" onClick={handleSubmit}>Upload & Process</Button>
                </div>
              </div>
            )}

            {state === 'processing' && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Processing...</h2>
                <p className="text-muted-foreground">Uploading audio and starting transcription</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
