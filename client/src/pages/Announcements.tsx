import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Pin,
  AlertTriangle,
  AlertCircle,
  Wrench,
  Info,
  Calendar,
  Building2,
  Users,
  Loader2,
  Trash2,
} from 'lucide-react';
import { fetchAnnouncements, createAnnouncement, deleteAnnouncement } from '@/services/announcementService';
import { createPoll } from '@/services/pollService';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Announcement } from '@/types';
import { PollCard } from '@/components/announcements/PollCard';

type TypeFilter = 'all' | 'info' | 'warning' | 'urgent' | 'maintenance' | 'polls';

const typeConfig = {
  urgent: { label: 'Urgent', icon: AlertTriangle, className: 'bg-destructive/10 text-destructive border-destructive/30' },
  warning: { label: 'Warning', icon: AlertCircle, className: 'bg-warning/10 text-warning border-warning/30' },
  maintenance: { label: 'Maintenance', icon: Wrench, className: 'bg-info/10 text-info border-info/30' },
  info: { label: 'Info', icon: Info, className: 'bg-muted text-muted-foreground border-border' },
};

export default function Announcements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createPollModalOpen, setCreatePollModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [submitting, setSubmitting] = useState(false);

  const isManagement = user?.role === 'management' || user?.role === 'caretaker';
  const isCaretaker = user?.role === 'caretaker';

  useEffect(() => {
    const fetchAnnouncementsData = async () => {
      try {
        const data = await fetchAnnouncements();
        setAnnouncements(data);
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
        toast.error('Failed to load announcements');
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncementsData();
  }, []);

  const refreshAnnouncements = async () => {
    try {
      const data = await fetchAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Failed to refresh announcements:', error);
      toast.error('Failed to refresh announcements');
    }
  };

  const filteredAnnouncements = announcements
    .filter(a => {
      if (typeFilter === 'polls') {
        return a.hasPoll && a.poll;
      }
      return typeFilter === 'all' || a.type === typeFilter;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <DashboardLayout
      title="Announcements"
      subtitle="Stay updated with hostel notices"
    >
      <div className="space-y-6">
        {/* ===== Header ===== */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Scrollable Tabs */}
          <Tabs value={typeFilter} onValueChange={v => setTypeFilter(v as TypeFilter)}>
            <TabsList className="flex w-full overflow-x-auto no-scrollbar sm:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="urgent">Urgent</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="polls">Polls</TabsTrigger>
            </TabsList>
          </Tabs>

          {isManagement && (
            <Button onClick={() => setCreateModalOpen(true)} className="w-full sm:w-auto gap-2">
              <Plus className="w-4 h-4" />
              New Announcement
            </Button>
          )}
          {isCaretaker && (
            <Button onClick={() => setCreatePollModalOpen(true)} className="w-full sm:w-auto gap-2" variant="outline">
              <Plus className="w-4 h-4" />
              Create Poll for Students
            </Button>
          )}
        </div>

        {/* ===== List ===== */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map(a => (
              <AnnouncementCard key={a._id} announcement={a} onRefresh={refreshAnnouncements} />
            ))
          ) : (
            <div className="text-center py-12">
              <Info className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {typeFilter === 'all' ? 'No announcements yet' : `No ${typeFilter} announcements`}
              </p>
            </div>
          )}
        </div>

        <CreateAnnouncementModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onAnnouncementCreated={(newAnnouncement) => {
            setAnnouncements(prev => [newAnnouncement, ...prev]);
          }}
        />
        
        <CreatePollModal
          open={createPollModalOpen}
          onOpenChange={setCreatePollModalOpen}
          onPollCreated={(newAnnouncement) => {
            // Add the new announcement with poll to the list
            setAnnouncements(prev => [newAnnouncement, ...prev]);
          }}
        />
      </div>
    </DashboardLayout>
  );
}

/* ===== Card ===== */

function AnnouncementCard({ announcement, onRefresh }: { 
  announcement: Announcement; 
  onRefresh?: () => void;
}) {
  const { user } = useAuth();
  const config = typeConfig[announcement.type];
  const Icon = config.icon;

  // Debug user object
  console.log('🔍 USER OBJECT DEBUG:', user);
  console.log('🔍 ANNOUNCEMENT DEBUG:', announcement);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      await deleteAnnouncement(announcement._id);
      toast.success('Announcement deleted successfully');
      onRefresh?.();
    } catch (error: any) {
      console.error('Failed to delete announcement:', error);
      toast.error(error.response?.data?.message || 'Failed to delete announcement');
    }
  };

  // Check if user can delete this announcement
  const canDelete = user && (
    user.id === announcement.createdBy._id || 
    user.role === 'management'
  );

  // Debug logging
  console.log('🔍 DELETE PERMISSION DEBUG:', {
    userId: user?.id,
    userRole: user?.role,
    announcementId: announcement._id,
    announcementCreatedBy: announcement.createdBy._id,
    createdByEquals: user?.id === announcement.createdBy._id,
    isManagement: user?.role === 'management',
    canDelete
  });

  return (
    <Card className="transition hover:shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex gap-4">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            config.className
          )}>
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex-1 space-y-2">
            {/* Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {announcement.isPinned && (
                  <Badge variant="secondary" className="gap-1">
                    <Pin className="w-3 h-3" />
                    Pinned
                  </Badge>
                )}
                <Badge variant="outline" className={config.className}>
                  {config.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(announcement.createdAt, { addSuffix: true })}
                </span>
              </div>
              
              {/* Delete button for caretakers */}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Title */}
            <h3 className="text-base sm:text-lg font-semibold">
              {announcement.title}
            </h3>

            {/* Content */}
            <p className="text-sm text-muted-foreground">
              {announcement.content}
            </p>

            {/* Poll */}
            {announcement.poll && announcement.hasPoll && (
              <div className="mt-4">
                <PollCard poll={announcement.poll} onVote={onRefresh} />
              </div>
            )}

            {/* Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {announcement.targetHostels.join(', ')}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                Block {announcement.targetBlocks.join(', ')}
              </span>
              {announcement.expiresAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Expires {format(announcement.expiresAt, 'MMM d')}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ===== Modal ===== */

function CreateAnnouncementModal({
  open,
  onOpenChange,
  onAnnouncementCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAnnouncementCreated: (announcement: any) => void;
}) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isManagement = user?.role === 'management';
  const isCaretaker = user?.role === 'caretaker';
  const [includePoll, setIncludePoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollExpiresAt, setPollExpiresAt] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    console.log('User object:', user);
    
    // Build announcement data based on user role
    let announcementData: any = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      type: formData.get('type') as string,
      targetHostels: [],
      targetBlocks: [],
      targetRoles: [],
      isPinned: false,
    };

    // Handle poll data
    let pollData = null;
    if (includePoll) {
      const validOptions = pollOptions.filter(opt => opt.trim()).map(opt => ({ text: opt.trim() }));
      
      if (validOptions.length < 2) {
        toast.error('At least 2 poll options are required');
        setIsSubmitting(false);
        return;
      }

      pollData = {
        question: pollQuestion.trim(),
        options: validOptions,
        pollExpiresAt: pollExpiresAt || undefined
      };
    }

    if (isCaretaker) {
      // Caretaker: target their assigned hostels and students only
      announcementData.targetHostels = (user as any)?.hostels || [user?.hostel].filter(Boolean);
      announcementData.targetRoles = ['student']; // Only students
    } else if (isManagement) {
      // Management: can target any hostels and roles
      const selectedHostels = formData.getAll('targetHostels') as string[];
      const selectedRoles = formData.getAll('targetRoles') as string[];
      
      announcementData.targetHostels = selectedHostels.includes('All') ? [] : selectedHostels;
      announcementData.targetRoles = selectedRoles.includes('All') ? [] : selectedRoles;
    }

    // Add poll data if included
    if (pollData) {
      announcementData.pollData = pollData;
    }

    console.log('Announcement data:', announcementData);

    try {
      const newAnnouncement = await createAnnouncement(announcementData);
      onAnnouncementCreated(newAnnouncement);
      toast.success('Announcement published successfully');
      onOpenChange(false);
      
      // Reset form
      setIncludePoll(false);
      setPollQuestion('');
      setPollOptions(['', '']);
      setPollExpiresAt('');
    } catch (error: any) {
      console.error('Failed to create announcement:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to publish announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isCaretaker ? 'Create Announcement for Students' : 'Create Announcement'}
          </DialogTitle>
          <DialogDescription>
            {isCaretaker 
              ? 'Publish an update for students in your assigned hostels'
              : 'Publish an update for residents'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required maxLength={200} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select name="type" defaultValue="info">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea id="content" name="content" rows={4} required maxLength={2000} />
          </div>

          {/* Poll Section */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Include Poll</Label>
              <input
                type="checkbox"
                checked={includePoll}
                onChange={(e) => setIncludePoll(e.target.checked)}
                className="w-4 h-4"
              />
            </div>
            
            {includePoll && (
              <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="pollQuestion">Poll Question</Label>
                  <Input
                    id="pollQuestion"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="What would you like to know?"
                    maxLength={200}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Poll Options</Label>
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...pollOptions];
                          newOptions[index] = e.target.value;
                          setPollOptions(newOptions);
                        }}
                        placeholder={`Option ${index + 1}`}
                        maxLength={100}
                        required
                      />
                      {pollOptions.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newOptions = pollOptions.filter((_, i) => i !== index);
                            setPollOptions(newOptions);
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
                    onClick={() => setPollOptions([...pollOptions, ''])}
                    disabled={pollOptions.length >= 5}
                  >
                    Add Option
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pollExpiresAt">Poll Expiration (Optional)</Label>
                  <Input
                    id="pollExpiresAt"
                    type="datetime-local"
                    value={pollExpiresAt}
                    onChange={(e) => setPollExpiresAt(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Role-specific targeting options */}
          {isCaretaker && (
            <div className="space-y-2">
              <Label>Target Hostels</Label>
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                {(user as any)?.hostels && (user as any).hostels.length > 0 
                  ? `Your assigned hostels: ${(user as any).hostels.join(', ')}`
                  : user?.hostel 
                    ? `Your assigned hostel: ${user.hostel}`
                    : 'No hostels assigned'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                As a caretaker, your announcements will only be sent to students in your assigned hostels.
              </p>
            </div>
          )}

          {isManagement && (
            <>
              <div className="space-y-2">
                <Label>Target Hostels</Label>
                <Select name="targetHostels" defaultValue="All">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Hostels</SelectItem>
                    <SelectItem value="Hostel A">Hostel A</SelectItem>
                    <SelectItem value="Hostel B">Hostel B</SelectItem>
                    <SelectItem value="Hostel C">Hostel C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Roles</Label>
                <Select name="targetRoles" defaultValue="All">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Roles</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="caretaker">Caretakers</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing
                </>
              ) : (
                'Publish'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ===== Create Poll Modal ===== */

function CreatePollModal({
  open,
  onOpenChange,
  onPollCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPollCreated: (poll: any) => void;
}) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [expiresAt, setExpiresAt] = useState('');
  const isCaretaker = user?.role === 'caretaker';

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

    try {
      const announcementData = {
        title: `Poll: ${question.trim()}`,
        content: `Vote on this poll: "${question.trim()}"`,
        type: 'info',
        targetHostels: (user as any)?.hostels || [user?.hostel].filter(Boolean),
        targetBlocks: [],
        targetRoles: ['student'], // Caretakers only target students
        isPinned: false,
        pollData: {
          question: question.trim(),
          options: validOptions,
          pollExpiresAt: expiresAt || undefined
        }
      };

      const newAnnouncement = await createAnnouncement(announcementData);

      onPollCreated(newAnnouncement);
      toast.success('Poll created successfully');
      onOpenChange(false);
      
      // Reset form
      setQuestion('');
      setOptions(['', '']);
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Poll for Students</DialogTitle>
          <DialogDescription>
            Create a poll to gather opinions from students in your assigned hostels
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pollQuestion">Poll Question</Label>
            <Textarea
              id="pollQuestion"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to know from students?"
              rows={2}
              required
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {question.length}/200 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label>Poll Options</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Add 2-5 options for students to choose from
            </p>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
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
                  <p className="text-xs text-muted-foreground mt-1">
                    {option.length}/100 characters
                  </p>
                </div>
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newOptions = options.filter((_, i) => i !== index);
                      setOptions(newOptions);
                    }}
                    className="mt-6"
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
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Option
            </Button>
          </div>

          {/* Target Hostels Display */}
          <div className="space-y-2">
            <Label>Target Hostels</Label>
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
              {(user as any)?.hostels && (user as any).hostels.length > 0 
                ? `Your assigned hostels: ${(user as any).hostels.join(', ')}`
                : user?.hostel 
                  ? `Your assigned hostel: ${user.hostel}`
                  : 'No hostels assigned'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              As a caretaker, your poll will only be sent to students in your assigned hostels.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pollExpiresAt">Poll Expiration (Optional)</Label>
            <Input
              id="pollExpiresAt"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for no expiration
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Poll...
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
