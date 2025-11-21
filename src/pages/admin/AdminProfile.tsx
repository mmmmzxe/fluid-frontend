import React, { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@/hooks/useRedux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, Shield, Calendar, Settings, RefreshCw } from 'lucide-react';
import { useUserProfile } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { getInitials } from '@/utils/adminHelpers';

interface ProfileData {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

const AdminProfile: React.FC = () => {
  const { user } = useAppSelector((state) => state.user);
  const { fetchProfile, loading } = useUserProfile();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshProfile = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await fetchProfile();
      setProfileData(data);
      toast.success('Profile refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh profile');
    } finally {
      setRefreshing(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    // Fetch profile data on component mount
    handleRefreshProfile();
  }, [handleRefreshProfile]);

  if (!user) {
    return <div>Loading...</div>;
  }

  // Use profile data if available, otherwise fall back to Redux user data
  const displayUser = profileData || user;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superAdmin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superAdmin':
        return <Shield className="h-4 w-4" />;
      case 'admin':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
          <p className="text-muted-foreground">
            Manage your admin account settings and preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefreshProfile}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your personal account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" alt={displayUser.name} />
                <AvatarFallback className="text-lg">
                  {getInitials(displayUser.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{displayUser.name}</h3>
                <p className="text-muted-foreground">{displayUser.email}</p>
                <Badge className={getRoleColor(displayUser.role || 'admin')}>
                  <span className="flex items-center gap-1">
                    {getRoleIcon(displayUser.role || 'admin')}
                    {displayUser.role === 'superAdmin' ? 'Super Admin' : 'Admin'}
                  </span>
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Email</div>
                  <div className="text-sm text-muted-foreground">{displayUser.email}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Phone</div>
                  <div className="text-sm text-muted-foreground">{displayUser.phone || 'Not provided'}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Member Since</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Account Settings
            </CardTitle>
            <CardDescription>
              Manage your account preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                Change Email Address
              </Button>

              <Button variant="outline" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                Change Password
              </Button>

              <Button variant="outline" className="w-full justify-start">
                <Phone className="mr-2 h-4 w-4" />
                Update Phone Number
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Security</h4>
              <Button variant="outline" className="w-full justify-start">
                Two-Factor Authentication
              </Button>

              <Button variant="outline" className="w-full justify-start">
                Login History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role & Permissions
          </CardTitle>
          <CardDescription>
            Your current role and associated permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Current Role</div>
                <div className="text-sm text-muted-foreground">
                  {displayUser.role === 'superAdmin'
                    ? 'Super Administrator - Full access to all features'
                    : 'Administrator - Limited access to order and support management'
                  }
                </div>
              </div>
              <Badge className={getRoleColor(displayUser.role || 'admin')}>
                <span className="flex items-center gap-1">
                  {getRoleIcon(displayUser.role || 'admin')}
                  {displayUser.role === 'superAdmin' ? 'Super Admin' : 'Admin'}
                </span>
              </Badge>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-3">Available Permissions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {user.role === 'superAdmin' ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Category Management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Product Management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Order Management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">User Management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">SubCategory Management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Support Management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Shipping Management</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Order Management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Support Management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Category Management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Product Management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">User Management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">SubCategory Management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Shipping Management</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfile;
