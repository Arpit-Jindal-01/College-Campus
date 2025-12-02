import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChipSelect } from '@/components/campus-connect/ChipSelect';
import { REQUEST_CATEGORIES, Profile } from '@/types/campus-connect';
import { createRequest } from '@/lib/campus-connect/db';
import { toast } from '@/hooks/use-toast';
import { Plus, Loader2 } from 'lucide-react';

interface CreateRequestSheetProps {
  profile: Profile;
  onRequestCreated: () => void;
  children?: React.ReactNode;
}

export function CreateRequestSheet({ profile, onRequestCreated, children }: CreateRequestSheetProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [relatedInterests, setRelatedInterests] = useState<string[]>([]);
  const [maxParticipants, setMaxParticipants] = useState('');
  
  const allUserInterests = [...profile.interests, ...profile.hobbies];
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setRelatedInterests([]);
    setMaxParticipants('');
  };
  
  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ title: 'Please enter a title', variant: 'destructive' });
      return;
    }
    if (!category) {
      toast({ title: 'Please select a category', variant: 'destructive' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createRequest(profile.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        related_interests: relatedInterests,
        max_participants: maxParticipants ? parseInt(maxParticipants) : undefined
      });
      
      toast({ title: 'Request created!' });
      resetForm();
      setOpen(false);
      onRequestCreated();
    } catch (error: any) {
      toast({ 
        title: 'Error creating request', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Request
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-display">Create a Request</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-5 overflow-y-auto max-h-[calc(85vh-120px)] pb-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">What are you looking for? *</Label>
            <Input
              id="title"
              placeholder="e.g., Looking for a gym partner"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>
          
          {/* Category */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Tell others more about what you're looking for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>
          
          {/* Related Interests */}
          <div className="space-y-2">
            <Label>Related to your interests (optional)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Select interests to help others find your request
            </p>
            <ChipSelect
              options={allUserInterests}
              selected={relatedInterests}
              onChange={setRelatedInterests}
            />
            {allUserInterests.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Add interests in your profile to tag them here
              </p>
            )}
          </div>
          
          {/* Max Participants */}
          <div className="space-y-2">
            <Label htmlFor="max">Max participants (optional)</Label>
            <Input
              id="max"
              type="number"
              placeholder="Leave empty for unlimited"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              min={2}
              max={100}
            />
          </div>
          
          {/* Submit */}
          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Request'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
