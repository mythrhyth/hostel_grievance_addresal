import { useState, useMemo, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { IssueCard } from '@/components/issues/IssueCard';
import { CreateIssueModal, CreateIssueData } from '@/components/issues/CreateIssueModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { IssueStatus, IssueCategory, IssuePriority } from '@/types';
import { toast } from 'sonner';
import { fetchIssues, createIssue } from '@/services/issueService';

type StatusFilter = IssueStatus | 'all';
type CategoryFilter = IssueCategory | 'all';
type PriorityFilter = IssuePriority | 'all';

export default function Issues() {
  const { user } = useAuth();
  const isManagement = user?.role === 'MANAGEMENT';

  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  // 🔄 LOAD ISSUES FROM BACKEND
  useEffect(() => {
    fetchIssues()
      .then(data => {
        const normalized = data.map((i: any) => ({
          ...i,
          id: i._id
        }));
        setIssues(normalized);
      })
      .catch(() => toast.error('Failed to load issues'))
      .finally(() => setLoading(false));
  }, []);

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !issue.title.toLowerCase().includes(q) &&
          !issue.description.toLowerCase().includes(q)
        ) return false;
      }

      if (statusFilter !== 'all' && issue.status !== statusFilter.toUpperCase()) return false;
      if (categoryFilter !== 'all' && issue.category !== categoryFilter) return false;
      if (priorityFilter !== 'all' && issue.priority !== priorityFilter) return false;

      return true;
    });
  }, [issues, searchQuery, statusFilter, categoryFilter, priorityFilter]);

  // 🆕 CREATE ISSUE → AUTO SEND LOCATION
  const handleCreateIssue = async (data: CreateIssueData) => {
    if (!user?.block) {
      toast.error('User location missing. Please contact admin.');
      return;
    }

    try {
      const issue = await createIssue({
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        spaceType: data.spaceType,

        // ✅ AUTO LOCATION FROM AUTH USER
        block: user.block,
        room: data.spaceType === 'PRIVATE' ? user.room : undefined
      });

      setIssues(prev => [{ ...issue, id: issue._id }, ...prev]);
      toast.success('Issue reported successfully');
      setCreateModalOpen(false);
    } catch {
      toast.error('Failed to report issue');
    }
  };

  const statusCounts = useMemo(() => ({
    all: issues.length,
    reported: issues.filter(i => i.status === 'REPORTED').length,
    assigned: issues.filter(i => i.status === 'ASSIGNED').length,
    in_progress: issues.filter(i => i.status === 'IN_PROGRESS').length,
    resolved: issues.filter(i => i.status === 'RESOLVED').length,
  }), [issues]);

  return (
    <DashboardLayout
      title="Issues"
      subtitle={isManagement ? 'Manage all reported issues' : 'View and report hostel issues'}
    >
      <div className="space-y-6">

        {/* ===== Action Bar ===== */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search issues..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={() => setCreateModalOpen(true)}
            className="w-full sm:w-auto gap-2"
          >
            <Plus className="w-4 h-4" />
            Report Issue
          </Button>
        </div>

        {/* ===== Status Tabs ===== */}
        <Tabs value={statusFilter} onValueChange={v => setStatusFilter(v as StatusFilter)}>
          <TabsList className="flex w-full overflow-x-auto no-scrollbar sm:w-auto">
            <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
            <TabsTrigger value="reported">Reported</TabsTrigger>
            <TabsTrigger value="assigned">Assigned</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* ===== Filters ===== */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <Select value={categoryFilter} onValueChange={v => setCategoryFilter(v as CategoryFilter)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="cleanliness">Cleanliness</SelectItem>
                  <SelectItem value="internet">Internet</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Priority</label>
              <Select value={priorityFilter} onValueChange={v => setPriorityFilter(v as PriorityFilter)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              onClick={() => {
                setCategoryFilter('all');
                setPriorityFilter('all');
              }}
              className="self-end"
            >
              Clear
            </Button>
          </div>
        )}

        {/* ===== Issues Grid ===== */}
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading issues…</p>
        ) : filteredIssues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredIssues.map(issue => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Filter className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No issues found</p>
          </div>
        )}
      </div>

      <CreateIssueModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreateIssue}
      />
    </DashboardLayout>
  );
}
