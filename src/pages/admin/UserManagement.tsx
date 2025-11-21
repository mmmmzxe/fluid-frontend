import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Users, UserCheck, UserX, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import DataTable, { Column } from '@/components/admin/DataTable';
import { userApi, User } from '@/services/adminApi';
import UserDetails from '@/components/admin/UserDetails';
import EnhancedStatsCard from '@/components/admin/EnhancedStatsCard';
import EnhancedBadge from '@/components/admin/EnhancedBadge';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [roleFilter, setRoleFilter] = useState<string>('');

  // Mock data for demonstration - in real app, this would come from API
  const mockUsers: User[] = [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'superAdmin',
    },
    {
      _id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'admin',
    },
    {
      _id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'admin',
    },
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // In a real app, you would call an API endpoint to get all users
      // const response = await userApi.getAll();
      // setUsers(response.data);

      // For now, using mock data
      setUsers(mockUsers);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleView = (user: User) => {
    setSelectedUser(user);
    setShowDetails(true);
  };

  const getRoleVariant = (role: string): 'success' | 'warning' | 'error' | 'info' | 'purple' => {
    switch (role) {
      case 'superAdmin':
        return 'purple';
      case 'admin':
        return 'info';
      default:
        return 'info';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superAdmin':
        return <UserCheck className="h-4 w-4" />;
      case 'admin':
        return <Users className="h-4 w-4" />;
      default:
        return <UserX className="h-4 w-4" />;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = !roleFilter || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const columns: Column<User>[] = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
    },
    {
      key: 'email',
      title: 'Email',
      sortable: true,
    },
    {
      key: 'role',
      title: 'Role',
      render: (value) => (
        <EnhancedBadge variant={getRoleVariant(value)} glow>
          <span className="flex items-center gap-1">
            {getRoleIcon(value)}
            {value === 'superAdmin' ? 'Super Admin' : value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        </EnhancedBadge>
      ),
    },
    {
      key: '_id',
      title: 'User ID',
      render: (value) => (
        <div className="font-mono text-sm">
          {value.slice(-8).toUpperCase()}
        </div>
      ),
    },
  ];

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const roleFilters = [
    {
      key: 'role',
      label: 'Role',
      options: [
        { value: '', label: 'All Roles' },
        { value: 'superAdmin', label: 'Super Admin' },
        { value: 'admin', label: 'Admin' },
      ],
      onFilter: setRoleFilter,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header with Gradient */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage user accounts and their roles
          </p>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <EnhancedStatsCard
          title="Total Users"
          value={users.length}
          icon={Users}
          gradient="purple"
          loading={loading}
        />
        <EnhancedStatsCard
          title="Super Admins"
          value={users.filter(u => u.role === 'superAdmin').length}
          icon={ShieldCheck}
          gradient="orange"
          loading={loading}
        />
        <EnhancedStatsCard
          title="Admins"
          value={users.filter(u => u.role === 'admin').length}
          icon={UserCheck}
          gradient="blue"
          loading={loading}
        />
      </div>


      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            A list of all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={paginatedUsers}
            columns={columns}
            loading={loading}
            searchable
            searchPlaceholder="Search users..."
            onSearch={setSearchQuery}
            onView={handleView}
            pagination={{
              page,
              pageSize,
              total: filteredUsers.length,
              onPageChange: setPage,
              onPageSizeChange: setPageSize,
            }}
            filters={roleFilters}
          />
        </CardContent>
      </Card>

      {/* User Details Modal */}
      {
        showDetails && selectedUser && (
          <UserDetails
            user={selectedUser}
            onClose={() => {
              setShowDetails(false);
              setSelectedUser(null);
            }}
          />
        )
      }
    </div >
  );
};

export default UserManagement;


