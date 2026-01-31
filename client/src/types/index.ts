export type UserRole = 'student' | 'caretaker' | 'management';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  hostel: string;
  hostels?: string[]; // For caretakers assigned to multiple hostels
  block: string;
  room: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
}

export type IssueCategory = 
  | 'plumbing' 
  | 'electrical' 
  | 'cleanliness' 
  | 'internet' 
  | 'furniture' 
  | 'security' 
  | 'pest_control'
  | 'other';

export type IssuePriority = 'low' | 'medium' | 'high' | 'emergency';

export type IssueStatus = 'reported' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

export type IssueVisibility = 'PUBLIC' | 'PRIVATE';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  visibility: IssueVisibility;
  reporterId: string;
  reporter: User;
  assigneeId?: string;
  assignee?: User;
  hostel: string;
  block: string;
  room: string;
  media: string[];
  upvotes: number;
  hasUpvoted?: boolean;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  statusHistory: StatusChange[];
  mergedWith?: string;
  mergedIssues?: string[];
}

export interface StatusChange {
  id: string;
  status: IssueStatus;
  remarks?: string;
  changedBy: User;
  changedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  issueId: string;
  parentId?: string;
  replies?: Comment[];
  reactions: Reaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Reaction {
  type: 'like' | 'helpful' | 'urgent';
  count: number;
  hasReacted: boolean;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'urgent' | 'maintenance';
  targetHostels: string[];
  targetBlocks: string[];
  targetRoles: string[];
  isPinned: boolean;
  expiresAt?: Date;
  createdBy: {
    _id: string;
    name: string;
    role: string;
  };
  createdAt: Date;
  updatedAt: Date;
  poll?: {
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
  };
  hasPoll?: boolean;
}

export type LostFoundStatus = 'lost' | 'found' | 'claimed';

export interface LostFoundItem {
  id: string;
  title: string;
  description: string;
  status: LostFoundStatus;
  category: string;
  location: string;
  date: Date;
  images: string[];
  reporterId: string;
  reporter: User;
  claimedById?: string;
  claimedBy?: User;
  claimedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalIssues: number;
  pendingIssues: number;
  resolvedIssues: number;
  avgResolutionTime: number;
  issuesByCategory: { category: IssueCategory; count: number }[];
  issuesByHostel: { hostel: string; count: number }[];
  issuesByPriority: { priority: IssuePriority; count: number }[];
  recentTrend: { date: string; reported: number; resolved: number }[];
}
