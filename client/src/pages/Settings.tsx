import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from '@/services/profileService';
import { toast } from 'sonner';

export default function Settings() {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ phone: phoneNumber });
      toast.success('Phone number updated successfully!');
    } catch (error) {
      toast.error('Failed to update phone number');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout title="Settings" subtitle="Manage system preferences">
      <div className="w-full max-w-2xl space-y-6 animate-fade-in">
        {/* ===== Profile ===== */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your account details</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input defaultValue={user?.name} disabled className="bg-muted/50" />
                <p className="text-xs text-muted-foreground">Contact admin to change name</p>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={user?.email} type="email" disabled className="bg-muted/50" />
                <p className="text-xs text-muted-foreground">Contact admin to change email</p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Used for lost & found item contact</p>
            </div>

            {/* Hostel Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Hostel</Label>
                <Input defaultValue={user?.hostel} disabled className="bg-muted/50" />
              </div>

              <div className="space-y-2">
                <Label>Block</Label>
                <Input defaultValue={user?.block} disabled className="bg-muted/50" />
              </div>

              <div className="space-y-2">
                <Label>Room</Label>
                <Input defaultValue={user?.room} disabled className="bg-muted/50" />
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                {isSaving ? 'Saving...' : 'Save Phone Number'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ===== Notifications ===== */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure how you receive updates
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {[
              {
                title: 'Email Notifications',
                desc: 'Receive email updates for issue status changes',
                checked: true
              },
              {
                title: 'Push Notifications',
                desc: 'Get browser notifications for urgent updates',
                checked: true
              },
              {
                title: 'Announcement Alerts',
                desc: 'Notify me about new announcements',
                checked: true
              }
            ].map((item, i) => (
              <div key={i}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                  <Switch defaultChecked={item.checked} />
                </div>
                {i < 2 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
