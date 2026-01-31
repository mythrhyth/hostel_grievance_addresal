import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Plus,
  BarChart3,
  Clock,
  Users,
  Loader2,
  Calendar,
  Building2,
} from 'lucide-react';
import { createPoll, getPolls, voteOnPoll } from '@/services/pollService';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PollCard } from '@/components/announcements/PollCard';

interface Poll {
  _id: string;
  question: string;
  options: Array<{
    text: string;
    votes: number;
    voters: Array<{ _id: string; name: string }>;
  }>;
  totalVotes: number;
  userVoted: boolean;
  userVote?: number;
  isExpired: boolean;
  expiresAt?: string;
  createdBy: {
    name: string;
    role: string;
  };
  createdAt: string;
  targetHostels: string[];
  targetRoles: string[];
  isActive: boolean;
}

export default function Polls() {
  const { user } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isManagement, setIsManagement] = useState(false);

  // Check if user is management
  useEffect(() => {
    setIsManagement(user?.role === 'management');
  }, [user]);

  // Load polls
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const data = await getPolls();
        setPolls(data);
      } catch (error) {
        console.error('Failed to fetch polls:', error);
        toast.error('Failed to load polls');
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  const handleVote = async (pollId: string, optionIndex: number) => {
    try {
      await voteOnPoll(pollId, optionIndex);
      // Refresh polls to get updated data
      const updatedPolls = await getPolls();
      setPolls(updatedPolls);
      toast.success('Vote recorded successfully');
    } catch (error: any) {
      console.error('Failed to vote:', error);
      toast.error(error.response?.data?.message || 'Failed to vote');
    }
  };

  return (
    <DashboardLayout title="Polls" subtitle="Participate in polls and see results">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Polls</h1>
            <p className="text-muted-foreground">
              Participate in polls and see what the community thinks
            </p>
          </div>
          
          {isManagement && (
            <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Poll
            </Button>
          )}
        </div>

        {/* Polls List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : polls.length > 0 ? (
            polls.map(poll => (
              <PollCard key={poll._id} poll={poll} />
            ))
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No polls yet
              </h3>
              <p className="text-muted-foreground">
                {isManagement 
                  ? "Create the first poll to get started"
                  : "No polls available at the moment"
                }
              </p>
            </div>
          )}
        </div>

        {/* Create Poll Modal */}
        <CreatePollModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onPollCreated={(newPoll) => {
            setPolls(prev => [newPoll, ...prev]);
          }}
        />
      </div>
    </DashboardLayout>
  );
}

// Create Poll Modal Component
function CreatePollModal({
  open,
  onOpenChange,
  onPollCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPollCreated: (poll: Poll) => void;
}) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [targetHostels, setTargetHostels] = useState<string[]>([]);
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState('');
  const isManagement = user?.role === 'management';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validOptions = options.filter(opt => opt.trim()).map(opt => ({ text: opt.trim() }));
    
    if (!question.trim()) {
      toast.error('Poll question is required');
      setIsSubmitting(false);
      return;
    }

    if (validOptions.length < 2) {
      toast.error('At least 2 options are required');
      setIsSubmitting(false);
      return;
    }

    if (targetHostels.length === 0) {
      toast.error('At least one target hostel is required');
      setIsSubmitting(false);
      return;
    }

    try {
      const pollData = {
        question: question.trim(),
        options: validOptions,
        targetHostels: isManagement ? targetHostels : (user as any)?.hostels || [user?.hostel].filter(Boolean),
        targetRoles: isManagement ? targetRoles : ['student'],
        expiresAt: expiresAt || undefined
      };

      const newPoll = await createPoll(pollData);
      onPollCreated(newPoll);
      toast.success('Poll created successfully');
      onOpenChange(false);
      
      // Reset form
      setQuestion('');
      setOptions(['', '']);
      setTargetHostels([]);
      setTargetRoles([]);
      setExpiresAt('');
    } catch (error: any) {
      console.error('Failed to create poll:', error);
      toast.error(error.response?.data?.message || 'Failed to create poll');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Poll</DialogTitle>
          <DialogDescription>
            Create a poll to gather opinions from residents
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Poll Question</Label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to know?"
              rows={2}
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label>Poll Options</Label>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[index] = e.target.value;
                    setOptions(newOptions);
                  }}
                  placeholder={`Option ${index + 1}`}
                  maxLength={100}
                  required
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newOptions = options.filter((_, i) => i !== index);
                      setOptions(newOptions);
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOptions([...options, ''])}
              disabled={options.length >= 5}
            >
              Add Option
            </Button>
          </div>

          {isManagement && (
            <>
              <div className="space-y-2">
                <Label>Target Hostels</Label>
                <Select onValueChange={(values) => setTargetHostels(values)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hostels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hostel A">Hostel A</SelectItem>
                    <SelectItem value="Hostel B">Hostel B</SelectItem>
                    <SelectItem value="Hostel C">Hostel C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Roles</Label>
                <Select onValueChange={(values) => setTargetRoles(values)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="caretaker">Caretakers</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiration (Optional)</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Poll'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
