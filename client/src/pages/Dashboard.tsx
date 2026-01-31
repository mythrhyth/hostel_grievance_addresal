import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/common/StatCard';
import { IssueCard } from '@/components/issues/IssueCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchDashboardStats, 
  fetchRecentIssues, 
  fetchRecentAnnouncements,
  fetchLostAndFoundStats 
} from '@/services/dashboardService';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Plus,
  ChevronRight,
  AlertTriangle,
  Info,
  Wrench,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentIssues, setRecentIssues] = useState<any[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>([]);
  const [lostFoundStats, setLostFoundStats] = useState<any>(null);

  // ✅ FIX: role casing
  const isManagement = user?.role === 'management';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all dashboard data in parallel
        const [statsData, issuesData, announcementsData, lostFoundData] = await Promise.all([
          fetchDashboardStats(),
          fetchRecentIssues(5),
          fetchRecentAnnouncements(3),
          fetchLostAndFoundStats()
        ]);

        setStats(statsData);
        setRecentIssues(Array.isArray(issuesData) ? issuesData : issuesData.issues || []);
        setRecentAnnouncements(Array.isArray(announcementsData) ? announcementsData : announcementsData.announcements || []);
        setLostFoundStats(lostFoundData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Loading..." subtitle="Fetching dashboard data">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.name?.split(' ')[0] ?? 'User'}`}
      subtitle={
        isManagement
          ? 'Management Dashboard'
          : user?.hostel && user?.block
            ? `${user.hostel} • Block ${user.block}`
            : 'Dashboard'
      }
    >
      <div className="space-y-6">

        {/* ===================== STATS ===================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Issues"
            value={stats?.totalIssues || 0}
            change={`+${stats?.recentTrend?.at(-1)?.reported ?? 0} today`}
            changeType="neutral"
            icon={AlertCircle}
          />

          <StatCard
            title="Pending"
            value={stats?.pendingIssues || 0}
            change={stats?.totalIssues ? `${Math.round(
              (stats.pendingIssues / stats.totalIssues) * 100
            )}% of total` : '0% of total'}
            changeType="negative"
            icon={Clock}
          />

          <StatCard
            title="Resolved"
            value={stats?.resolvedIssues || 0}
            change={`+${stats?.recentTrend?.at(-1)?.resolved ?? 0} today`}
            changeType="positive"
            icon={CheckCircle}
          />

          <StatCard
            title="Avg. Resolution"
            value={`${stats?.avgResolutionTime || 0}h`}
            change="Response time"
            changeType="neutral"
            icon={TrendingUp}
          />
        </div>

        {/* ===================== CHARTS (MANAGEMENT ONLY) ===================== */}
        {isManagement && (
          <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg font-semibold">
                  Issue Trend (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[200px] sm:h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats?.recentTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10 }} 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="reported" stroke="#dc2626" strokeWidth={2} />
                      <Line type="monotone" dataKey="resolved" stroke="#16a34a" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg font-semibold">
                  Issues by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[200px] sm:h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats?.issuesByCategory?.slice(0, 6) || []}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis 
                        type="category" 
                        dataKey="category" 
                        width={70} 
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===================== RECENT ACTIVITY ===================== */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg font-semibold">Recent Issues</h2>
              <Link to="/issues">
                <Button variant="ghost" size="sm" className="gap-1 w-full sm:w-auto">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentIssues.length > 0 ? (
                recentIssues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent issues
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Announcements</h2>
              <Link to="/announcements">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            
            <Card>
              <CardContent className="p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : recentAnnouncements.length > 0 ? (
                  <div className="space-y-3">
                    {recentAnnouncements.slice(0, 3).map((announcement) => (
                      <div key={announcement._id} className="border-b last:border-b-0 pb-3 last:pb-0">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                            announcement.type === 'urgent' ? 'bg-red-100' :
                            announcement.type === 'warning' ? 'bg-yellow-100' :
                            announcement.type === 'maintenance' ? 'bg-blue-100' :
                            'bg-gray-100'
                          )}>
                            {announcement.type === 'urgent' ? <AlertTriangle className="w-4 h-4 text-red-600" /> :
                             announcement.type === 'warning' ? <AlertCircle className="w-4 h-4 text-yellow-600" /> :
                             announcement.type === 'maintenance' ? <Wrench className="w-4 h-4 text-blue-600" /> :
                             <Info className="w-4 h-4 text-gray-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{announcement.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">{announcement.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(announcement.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent announcements
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
