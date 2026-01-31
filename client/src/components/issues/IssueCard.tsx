import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/common/StatusBadges';
import { MessageCircle, ThumbsUp, Clock, MapPin, Eye, EyeOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Issue } from '@/types';
import { Link } from 'react-router-dom';

interface IssueCardProps {
  issue: Issue;
  className?: string;
}

export function IssueCard({ issue, className }: IssueCardProps) {
  // Debug visibility
  console.log('Issue visibility:', issue.visibility, 'Issue:', issue);
  
  return (
    <Link to={`/issues/${issue.id}`}>
      <Card className={cn(
        'hover-lift cursor-pointer transition-all duration-200 border-border hover:border-primary/30',
        className
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CategoryBadge category={issue.category} />
                <PriorityBadge priority={issue.priority} />
                {issue.visibility === 'PRIVATE' ? (
                  <span className="status-badge bg-muted text-muted-foreground">
                    <EyeOff className="w-3 h-3" />
                    Private
                  </span>
                ) : (
                  <span className="status-badge bg-muted text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    Public
                  </span>
                )}
              </div>
              <CardTitle className="text-base font-semibold text-foreground line-clamp-1">
                {issue.title}
              </CardTitle>
            </div>
            <StatusBadge status={issue.status} />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {issue.description}
          </p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {issue.hostel}, Block {issue.block}
                {issue.visibility === 'private' && issue.room && `, Room ${issue.room}`}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDistanceToNow(issue.createdAt, { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5" />
                {issue.upvotes}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                {issue.commentsCount}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
