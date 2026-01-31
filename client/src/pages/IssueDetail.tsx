import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/common/StatusBadges';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  ArrowLeft,
  MapPin,
  Clock,
  ThumbsUp,
  MessageCircle,
  Send,
  Heart,
  Lightbulb,
  AlertTriangle,
  Link2
} from 'lucide-react';
import { fetchIssueById, fetchCommentsByIssueId, createComment, fetchIssueLogs } from '@/services/issueService';
import { updateIssueStatus } from '@/services/issueService';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { IssueStatus } from '@/types';

export default function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isManagement = user?.role === 'management';
  const isCaretaker = user?.role === 'caretaker';
  const canManageIssue = isManagement || isCaretaker;

  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [statusLogs, setStatusLogs] = useState<any[]>([]);
  const [statusLogsLoading, setStatusLogsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(0);
  const [statusRemarks, setStatusRemarks] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  // 🔄 LOAD ISSUE FROM BACKEND
  useEffect(() => {
    if (!id) return;
    
    const loadData = async () => {
      try {
        console.log('Loading data for issue:', id);
        const [issueData, commentsData, logsData] = await Promise.all([
          fetchIssueById(id),
          fetchCommentsByIssueId(id),
          fetchIssueLogs(id)
        ]);
        
        console.log('Issue data:', issueData);
        console.log('Comments data:', commentsData);
        console.log('Status logs data:', logsData);
        
        setIssue(issueData);
        setHasUpvoted(issueData.hasUpvoted || false);
        setUpvotes(issueData.upvotes || 0);
        setComments(commentsData);
        setStatusLogs(logsData);
      } catch (err) {
        console.error('Failed to load issue data:', err);
        setError('Failed to load issue');
      } finally {
        setLoading(false);
        setCommentsLoading(false);
        setStatusLogsLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Loading Issue...">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !issue) {
    return (
      <DashboardLayout title="Issue Not Found">
        <div className="text-center py-12">
          <p className="text-muted-foreground">{error || 'Issue not found'}</p>
          <Button onClick={() => navigate('/issues')} className="mt-4">
            Back to Issues
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleUpvote = () => {
    setHasUpvoted(!hasUpvoted);
    setUpvotes(v => (hasUpvoted ? v - 1 : v + 1));
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    
    try {
      setUpdatingStatus(true);
      await updateIssueStatus(id, newStatus.toUpperCase(), statusRemarks);
      
      // Update local issue state
      setIssue(prev => ({
        ...prev,
        status: newStatus.toUpperCase()
      }));
      
      // Refresh status logs
      const logsData = await fetchIssueLogs(id);
      setStatusLogs(logsData);
      
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
      setStatusRemarks(''); // Clear remarks after successful update
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim() || !id) return;
    
    try {
      const comment = await createComment(id, newComment.trim());
      setComments(prev => [...prev, comment]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    }
  };

  return (
    <DashboardLayout title={issue ? `Issue #${issue.id || id}` : 'Loading Issue...'}>
      <div className="space-y-4">
        {/* Back */}
        <Button
          variant="ghost"
          onClick={() => navigate('/issues')}
          className="gap-2 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ===== MAIN ===== */}
          <div className="xl:col-span-2 space-y-6">
            {/* Issue */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  <CategoryBadge category={issue.category} />
                  <PriorityBadge priority={issue.priority} />
                  <StatusBadge status={issue.status} />
                </div>

                <h1 className="text-xl sm:text-2xl font-bold mb-3">
                  {issue.title}
                </h1>

                <p className="text-muted-foreground mb-4">
                  {issue.description}
                </p>

                {/* Meta */}
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground border-t pt-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {(issue.reportedBy?.name || 'U')[0]}
                      </AvatarFallback>
                    </Avatar>
                    {issue.reportedBy?.name || 'Unknown'}
                  </div>

                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {issue.hostel}, Block {issue.block}
                    {issue.visibility === 'PRIVATE' && issue.room && `, Room ${issue.room}`}
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 mt-4">
                  <Button
                    size="sm"
                    variant={hasUpvoted ? 'default' : 'outline'}
                    onClick={handleUpvote}
                    className="gap-2 w-full sm:w-auto justify-center"
                  >
                    <ThumbsUp className={cn('w-4 h-4', hasUpvoted && 'fill-current')} />
                    {upvotes} Upvote{upvotes !== 1 ? 's' : ''}
                  </Button>

                  <Button size="sm" variant="outline" className="gap-2 w-full sm:w-auto justify-center">
                    <Link2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Status History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {statusLogsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : statusLogs.length > 0 ? (
                  statusLogs.map((log, index) => (
                    <div key={log._id || index} className="flex items-start gap-3 pb-3 border-b last:border-b-0 last:pb-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {log.changedBy?.name || 'System'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-1 bg-muted rounded text-muted-foreground">
                            {log.fromStatus || 'Created'}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                            {log.toStatus}
                          </span>
                        </div>
                        {log.remarks && (
                          <p className="text-sm text-muted-foreground mt-2 italic">
                            "{log.remarks}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No status changes yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ===== SIDEBAR ===== */}
          <div className="space-y-6">
            {canManageIssue && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {isManagement ? 'Manage Issue' : 'Update Status'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select 
                    defaultValue={issue.status.toLowerCase()} 
                    onValueChange={(value) => setSelectedStatus(value)}
                    disabled={updatingStatus}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reported">Reported</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Textarea 
                    placeholder="Add remarks about status change..." 
                    rows={3}
                    value={statusRemarks}
                    onChange={(e) => setStatusRemarks(e.target.value)}
                    disabled={updatingStatus}
                  />
                  <Button 
                    className="w-full" 
                    onClick={() => selectedStatus && handleStatusChange(selectedStatus)}
                    disabled={updatingStatus || !selectedStatus}
                  >
                    {updatingStatus ? 'Updating...' : 'Update Status'}
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reported</span>
                  {format(new Date(issue.createdAt), 'MMM d, yyyy')}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  {format(new Date(issue.updatedAt), 'MMM d, yyyy')}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="text-right">
                    {issue.hostel}, Block {issue.block}
                    {issue.visibility === 'PRIVATE' && issue.room && `, Room ${issue.room}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Visibility</span>
                  <span>{issue.visibility === 'PRIVATE' ? 'Private' : 'Public'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Comments ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {commentsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : comments.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {comments.map(c => (
                      <div key={c._id} className="flex gap-3">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="text-xs">{c.author?.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{c.author?.name || 'Unknown'}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm break-words">{c.content}</p>
                          {c.isInternal && (
                            <span className="inline-block mt-1 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                              Internal
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first to comment!</p>
                )}

                {/* Add comment */}
                <div className="border-t pt-4">
                  <Textarea
                    placeholder="Add a comment…"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <Button onClick={handleComment} className="w-full mt-2 gap-2" disabled={!newComment.trim()}>
                    <Send className="w-4 h-4" />
                    Post Comment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
