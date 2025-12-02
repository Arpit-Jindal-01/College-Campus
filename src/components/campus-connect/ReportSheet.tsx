import { useState } from 'react';
import { Flag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCampusConnect } from '@/contexts/CampusConnectContext';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ReportSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportedUserId: string;
  reportedUserName: string;
}

const REPORT_REASONS = [
  'Inappropriate content',
  'Harassment or bullying',
  'Spam or scam',
  'Fake profile',
  'Inappropriate behavior',
  'Other'
];

export function ReportSheet({
  open,
  onOpenChange,
  reportedUserId,
  reportedUserName
}: ReportSheetProps) {
  const { user } = useCampusConnect();
  const { toast } = useToast();
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !selectedReason) return;

    try {
      setSubmitting(true);

      const reason = selectedReason === 'Other' && additionalInfo
        ? `Other: ${additionalInfo}`
        : selectedReason;

      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          reported_id: reportedUserId,
          reason
        });

      if (error) throw error;

      toast({
        title: 'Report submitted',
        description: 'Thank you for helping keep Campus Connect safe.'
      });

      onOpenChange(false);
      setSelectedReason('');
      setAdditionalInfo('');
    } catch (error) {
      console.error('Report error:', error);
      toast({
        title: 'Failed to submit report',
        description: 'Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh]">
        <SheetHeader>
          <SheetTitle>Report {reportedUserName}</SheetTitle>
          <SheetDescription>
            Help us understand what's happening. Your report is anonymous.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <Label>Reason for reporting</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="mt-3 space-y-3">
              {REPORT_REASONS.map((reason) => (
                <div key={reason} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason} id={reason} />
                  <Label htmlFor={reason} className="font-normal cursor-pointer">
                    {reason}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {selectedReason === 'Other' && (
            <div>
              <Label htmlFor="additional">Additional information</Label>
              <Textarea
                id="additional"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Please provide more details..."
                className="mt-2"
                rows={3}
              />
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!selectedReason || submitting}
            className="w-full"
          >
            <Flag className="w-4 h-4 mr-2" />
            {submitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}