import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LostFoundBadge } from '@/components/common/StatusBadges';
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
  MapPin,
  Calendar,
  User,
  Search,
  Upload,
  Loader2,
  Package,
} from 'lucide-react';
import { fetchLostAndFoundItems, createLostAndFoundItem, claimLostAndFoundItem } from '@/services/lostAndFoundService';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import type { LostFoundStatus, LostFoundItem } from '@/types';

type StatusFilter = LostFoundStatus | 'all';

export default function LostFound() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 🔄 FETCH ITEMS FROM BACKEND
  const refreshItems = async () => {
    try {
      const data = await fetchLostAndFoundItems();
      setItems(data);
    } catch (error) {
      console.error('Failed to refresh items:', error);
      toast.error('Failed to refresh items');
    }
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const params: any = {};
        if (statusFilter === 'claimed') {
          params.status = 'claimed';
        } else if (statusFilter === 'lost' || statusFilter === 'found') {
          params.type = statusFilter;
        }
        if (searchQuery) params.search = searchQuery;
        
        console.log('Fetching with params:', params);
        const data = await fetchLostAndFoundItems(params);
        setItems(data.items || []);
      } catch (error) {
        console.error('Failed to fetch lost and found items:', error);
        toast.error('Failed to load items');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [statusFilter, searchQuery]);

  const filteredItems = items; // Filtering is now done on the backend

  const openCreateModal = (type: 'lost' | 'found') => {
    setReportType(type);
    setCreateModalOpen(true);
  };

  return (
    <DashboardLayout
      title="Lost & Found"
      subtitle="Report or find items within the hostel"
    >
      <div className="space-y-6">
        {/* ===== Header ===== */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => openCreateModal('found')}
              className="w-full sm:w-auto gap-2"
            >
              <Plus className="w-4 h-4" />
              Found Item
            </Button>
            <Button
              onClick={() => openCreateModal('lost')}
              className="w-full sm:w-auto gap-2"
            >
              <Plus className="w-4 h-4" />
              Lost Item
            </Button>
          </div>
        </div>

        {/* ===== Tabs ===== */}
        <Tabs value={statusFilter} onValueChange={v => setStatusFilter(v as StatusFilter)}>
          <TabsList className="flex w-full overflow-x-auto no-scrollbar sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="lost">Lost</TabsTrigger>
            <TabsTrigger value="found">Found</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* ===== Grid ===== */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <LostFoundCard key={item._id} item={item} onRefresh={refreshItems} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {statusFilter === 'all' 
                ? 'No items found' 
                : `No ${statusFilter} items found`
              }
            </p>
          </div>
        )}

        <CreateLostFoundModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          type={reportType}
        />
      </div>
    </DashboardLayout>
  );
}

/* ===== Card ===== */

function LostFoundCard({ item, onRefresh }: { item: any; onRefresh?: () => void }) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  
  const handleClaim = async () => {
    try {
      const contactInfo = {
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        room: user?.room || '',
        block: user?.block || '',
        hostel: user?.hostel || ''
      };

      await claimLostAndFoundItem(item._id, contactInfo);
      toast.success('Item claimed successfully! The reporter will be notified.');
      onRefresh?.(); // Refresh the items list
    } catch (error: any) {
      console.error('Failed to claim item:', error);
      toast.error(error.response?.data?.message || 'Failed to claim item');
    }
  };

  return (
    <Card className="transition hover:shadow-sm cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <CardContent className="p-5 space-y-3">
        <div className="flex justify-between items-start">
          <LostFoundBadge status={item.status === 'active' ? item.type : item.status} />
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </span>
        </div>

        <h3 className="font-semibold">{item.title}</h3>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description}
        </p>

        {/* Basic info - always visible */}
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" />
            {item.location}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            {format(new Date(item.dateLostOrFound), 'MMM d, yyyy')}
          </div>
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5" />
            {item.reportedBy?.name || 'Anonymous'}
          </div>
        </div>

        {/* Expanded details - shown when clicked */}
        {expanded && (
          <div className="mt-3 pt-3 border-t space-y-3">
            <div className="text-sm font-medium text-foreground">Detailed Information:</div>
            
            {/* Contact Information */}
            {item.contactInfo && (
              <div className="p-2 bg-muted rounded-lg space-y-1">
                <div className="font-medium text-foreground">Contact Information:</div>
                {item.contactInfo.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Phone:</span>
                    <span>{item.contactInfo.phone}</span>
                  </div>
                )}
                {item.contactInfo.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Email:</span>
                    <span>{item.contactInfo.email}</span>
                  </div>
                )}
                {item.contactInfo.block && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Block:</span>
                    <span>{item.contactInfo.block}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Reporter's hostel and room if available */}
            <div className="space-y-1 text-sm">
              {item.reportedBy?.hostel && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Hostel:</span>
                  <span>{item.reportedBy.hostel}</span>
                </div>
              )}
              {item.reportedBy?.room && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Room:</span>
                  <span>{item.reportedBy.room}</span>
                </div>
              )}
              {item.reportedBy?.phone && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Reporter Phone:</span>
                  <span>{item.reportedBy.phone}</span>
                </div>
              )}
            </div>

            {/* Additional details */}
            <div className="space-y-1 text-sm">
              <div className="font-medium text-foreground">Additional Details:</div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Category:</span>
                <span>{item.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Type:</span>
                <span>{item.type}</span>
              </div>
              {item.claimedBy && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Claimed by:</span>
                  <span>{item.claimedBy.name}</span>
                </div>
              )}
              {item.claimedAt && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Claimed at:</span>
                  <span>{format(new Date(item.claimedAt), 'MMM d, yyyy HH:mm')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action buttons - stop click propagation */}
        <div onClick={(e) => e.stopPropagation()}>
          {item.status === 'found' && (
            <Button size="sm" className="w-full" onClick={handleClaim}>
              Claim Item
            </Button>
          )}

          {item.status === 'claimed' && item.claimedBy && (
            <div className="text-xs text-center bg-muted rounded-lg p-2">
              Claimed by {item.claimedBy.name}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ===== Modal ===== */

function CreateLostFoundModal({
  open,
  onOpenChange,
  type,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'lost' | 'found';
}) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    // Add required fields that aren't in the form
    formData.append('type', type);
    formData.append('hostel', user?.hostel || '');
    formData.append('block', user?.block || '');
    
    // Ensure phone is included from the form, fallback to user phone if empty
    if (!formData.get('contactInfo[phone]') && user?.phone) {
      formData.set('contactInfo[phone]', user.phone);
    }

    try {
      const newItem = await createLostAndFoundItem(formData);
      // Refresh the items list
      window.location.reload(); // Simple refresh for now
      toast.success(`${type === 'lost' ? 'Lost' : 'Found'} item reported successfully`);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to create lost and found item:', error);
      toast.error(error.response?.data?.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Report {type === 'lost' ? 'Lost' : 'Found'} Item
          </DialogTitle>
          <DialogDescription className="text-sm">
            Help reunite items with their owners
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Item Name</Label>
            <Input id="title" name="title" placeholder="What item did you lose or find?" required className="w-full" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">Category</Label>
            <Select name="category" defaultValue="electronics">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="documents">Documents</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="books">Books</SelectItem>
                <SelectItem value="keys">Keys</SelectItem>
                <SelectItem value="wallet">Wallet</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              rows={4} 
              placeholder="Provide a detailed description of the item (color, brand, distinguishing features, etc.)" 
              required 
              className="w-full resize-none" 
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">Location</Label>
              <Input 
                id="location" 
                name="location" 
                placeholder="Where exactly was it lost or found?" 
                required 
                className="w-full" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateLostOrFound" className="text-sm font-medium">Date</Label>
              <Input 
                id="dateLostOrFound" 
                name="dateLostOrFound" 
                type="date" 
                required 
                className="w-full" 
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactName" className="text-sm font-medium">Your Name</Label>
                <Input 
                  id="contactName" 
                  name="contactInfo[name]" 
                  value={user?.name || ''}
                  readOnly
                  className="w-full bg-muted/50" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone" className="text-sm font-medium">Phone Number</Label>
                <Input 
                  id="contactPhone" 
                  name="contactInfo[phone]" 
                  value={user?.phone || ''}
                  readOnly
                  placeholder="Add phone number in settings"
                  className="w-full bg-muted/50" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-sm font-medium">Email</Label>
                <Input 
                  id="contactEmail" 
                  name="contactInfo[email]" 
                  type="email" 
                  value={user?.email || ''}
                  readOnly
                  className="w-full bg-muted/50" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactRoom" className="text-sm font-medium">Room Number</Label>
                <Input 
                  id="contactRoom" 
                  name="contactInfo[room]" 
                  value={user?.room || ''}
                  readOnly
                  placeholder="Add room number in profile"
                  className="w-full bg-muted/50" 
                />
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Contact information is fetched from your profile. Update your profile to change these details.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="images" className="text-sm font-medium">Upload Images (Optional)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 hover:border-muted-foreground/50 transition-colors">
              <Input 
                id="images" 
                name="images" 
                type="file" 
                multiple 
                accept="image/*"
                className="border-0 bg-transparent p-0 h-auto cursor-pointer"
              />
              <div className="flex items-center justify-center mt-2">
                <Upload className="w-5 h-5 text-muted-foreground mr-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload images (max 5 files, 5MB each)
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                `Report ${type === 'lost' ? 'Lost' : 'Found'} Item`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
