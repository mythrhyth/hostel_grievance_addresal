import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Upload, X, AlertTriangle, Loader2 } from 'lucide-react';
import type { IssueCategory, IssuePriority, IssueVisibility } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CreateIssueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateIssueData) => void;
}

export interface CreateIssueData {
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  visibility: IssueVisibility;
  // PUBLIC | PRIVATE (server expects uppercase spaceType)
  spaceType: 'PUBLIC' | 'PRIVATE';
  media: File[];
}

const categories: { value: IssueCategory; label: string; icon: string }[] = [
  { value: 'plumbing', label: 'Plumbing', icon: '🔧' },
  { value: 'electrical', label: 'Electrical', icon: '⚡' },
  { value: 'cleanliness', label: 'Cleanliness', icon: '🧹' },
  { value: 'internet', label: 'Internet', icon: '📶' },
  { value: 'furniture', label: 'Furniture', icon: '🪑' },
  { value: 'security', label: 'Security', icon: '🔒' },
  { value: 'pest_control', label: 'Pest Control', icon: '🐛' },
  { value: 'other', label: 'Other', icon: '📋' },
];

const priorities: { value: IssuePriority; label: string; description: string }[] = [
  { value: 'low', label: 'Low', description: 'Minor inconvenience, can wait' },
  { value: 'medium', label: 'Medium', description: 'Needs attention within a few days' },
  { value: 'high', label: 'High', description: 'Urgent, needs quick resolution' },
  { value: 'emergency', label: 'Emergency', description: 'Immediate danger or critical issue' },
];

export function CreateIssueModal({ open, onOpenChange, onSubmit }: CreateIssueModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateIssueData>({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
    visibility: 'PUBLIC',
    // default spaceType based on visibility
    spaceType: 'PUBLIC',
    media: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Call parent onSubmit function - parent will handle the actual API call and success message
      onSubmit(formData);
      
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'other',
        priority: 'medium',
        visibility: 'PUBLIC',
        spaceType: 'PUBLIC',
        media: [],
      });
    } catch (error: any) {
      console.error('Failed to create issue:', error);
      toast.error('Failed to report issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        media: [...prev.media, ...Array.from(e.target.files || [])],
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report New Issue</DialogTitle>
          <DialogDescription>
            Fill in the details below to report a hostel issue. Your location will be automatically tagged.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Auto-tagged location */}
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <span className="text-muted-foreground">Location: </span>
            <span className="font-medium">{user?.hostel}, Block {user?.block}, Room {user?.room}</span>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Brief description of the issue"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: IssueCategory) => 
                  setFormData(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        {cat.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: IssuePriority) => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      <span className={cn(
                        'flex items-center gap-2',
                        p.value === 'emergency' && 'text-destructive'
                      )}>
                        {p.value === 'emergency' && <AlertTriangle className="w-4 h-4" />}
                        {p.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about the issue..."
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              required
            />
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <Label>Attachments (Optional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                id="media-upload"
              />
              <label htmlFor="media-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload images or videos
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, GIF, MP4 up to 10MB
                </p>
              </label>
            </div>
            {formData.media.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.media.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 text-sm"
                  >
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visibility */}
          <div className="flex items-center justify-between py-3 border-t border-border">
            <div>
              <Label htmlFor="visibility">Make this issue private</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Private issues are only visible to management and assigned caretakers
              </p>
            </div>
            <Switch
              id="visibility"
              checked={formData.spaceType === 'PRIVATE'}
              onCheckedChange={(checked) => {
                console.log('Toggle changed:', checked);
                setFormData(prev => {
                  const newData: CreateIssueData = {
                    ...prev,
                    visibility: (checked ? 'PRIVATE' : 'PUBLIC') as IssueVisibility,
                    spaceType: checked ? 'PRIVATE' : 'PUBLIC'
                  };
                  console.log('New form data:', newData);
                  return newData;
                });
              }}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Issue'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
