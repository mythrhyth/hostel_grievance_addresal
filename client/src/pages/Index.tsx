import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  AlertCircle, 
  Megaphone, 
  Search, 
  BarChart3,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

const features = [
  {
    icon: AlertCircle,
    title: 'Issue Reporting',
    description: 'Report hostel issues with categories, priorities, and media attachments. Track status in real-time.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Management dashboard with insights on issue trends, resolution times, and facility performance.',
  },
  {
    icon: Megaphone,
    title: 'Announcements',
    description: 'Stay updated with hostel news, maintenance schedules, and important notices.',
  },
  {
    icon: Search,
    title: 'Lost & Found',
    description: 'Report lost items or help others find their belongings within the hostel.',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description: 'Secure system with different access levels for students and management.',
  },
  {
    icon: Clock,
    title: 'Real-Time Tracking',
    description: 'Track issue progress from reporting to resolution with complete transparency.',
  },
];

const stats = [
  { value: '500+', label: 'Issues Resolved' },
  { value: '48h', label: 'Avg Response Time' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '24/7', label: 'Support Available' },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">HostelCare</span>
          </div>
          <Link to="/auth">
            <Button>
              Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <CheckCircle className="w-4 h-4" />
            Trusted by 5+ Hostels
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Streamline Hostel Issue Management with{' '}
            <span className="gradient-text">HostelCare</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Replace informal complaints with a structured, accountable digital system. 
            Report issues, track resolution, and get data-driven insights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="gap-2 text-base px-8">
                Get Started
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 text-base px-8">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold gradient-text mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything You Need for Hostel Management
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A comprehensive platform designed to improve transparency, reduce response time, 
              and provide actionable insights into hostel operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover-lift border-border">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Transform Your Hostel Management?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of students and administrators who have already streamlined 
            their hostel operations with HostelCare.
          </p>
          <Link to="/auth">
            <Button size="lg" className="gap-2 px-8">
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">HostelCare</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 HostelCare. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
