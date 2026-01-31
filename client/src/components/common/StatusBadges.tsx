import { cn } from '@/lib/utils';
import type { IssuePriority, IssueStatus, IssueCategory, LostFoundStatus } from '@/types';

interface StatusBadgeProps {
  status: IssueStatus | string;
  className?: string;
}

const statusConfig: Record<IssueStatus, { label: string; className: string }> = {
  reported: { label: 'Reported', className: 'bg-muted text-muted-foreground' },
  assigned: { label: 'Assigned', className: 'bg-info/10 text-info' },
  in_progress: { label: 'In Progress', className: 'bg-warning/10 text-warning' },
  resolved: { label: 'Resolved', className: 'bg-success/10 text-success' },
  closed: { label: 'Closed', className: 'bg-muted text-muted-foreground' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Accept both server UPPERCASE statuses and client lowercase ones
  const key = (String(status || '')).toLowerCase() as IssueStatus;
  const config = statusConfig[key] ?? { label: String(status || 'Unknown'), className: 'bg-muted text-muted-foreground' };

  return (
    <span className={cn('status-badge', config.className, className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: IssuePriority;
  className?: string;
}

const priorityConfig: Record<IssuePriority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'priority-low' },
  medium: { label: 'Medium', className: 'priority-medium' },
  high: { label: 'High', className: 'priority-high' },
  emergency: { label: 'Emergency', className: 'priority-emergency' },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  return (
    <span className={cn('status-badge', config.className, className)}>
      {config.label}
    </span>
  );
}

interface CategoryBadgeProps {
  category: IssueCategory;
  className?: string;
}

const categoryConfig: Record<IssueCategory, { label: string; icon: string }> = {
  plumbing: { label: 'Plumbing', icon: '🔧' },
  electrical: { label: 'Electrical', icon: '⚡' },
  cleanliness: { label: 'Cleanliness', icon: '🧹' },
  internet: { label: 'Internet', icon: '📶' },
  furniture: { label: 'Furniture', icon: '🪑' },
  security: { label: 'Security', icon: '🔒' },
  pest_control: { label: 'Pest Control', icon: '🐛' },
  other: { label: 'Other', icon: '📋' },
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const config = categoryConfig[category];
  return (
    <span className={cn('status-badge bg-secondary text-secondary-foreground', className)}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}

interface LostFoundBadgeProps {
  status: string; // Changed from LostFoundStatus to string to handle type values
  className?: string;
}

const lostFoundConfig: Record<string, { label: string; className: string }> = {
  lost: { label: 'Lost', className: 'bg-destructive/10 text-destructive' },
  found: { label: 'Found', className: 'bg-success/10 text-success' },
  claimed: { label: 'Claimed', className: 'bg-muted text-muted-foreground' },
  active: { label: 'Active', className: 'bg-blue-100 text-blue-800' },
};

export function LostFoundBadge({ status, className }: LostFoundBadgeProps) {
  const config = lostFoundConfig[status];
  
  // Safety check for undefined status
  if (!config) {
    return (
      <span className={cn('status-badge bg-muted text-muted-foreground', className)}>
        Unknown
      </span>
    );
  }
  
  return (
    <span className={cn('status-badge', config.className, className)}>
      {config.label}
    </span>
  );
}
