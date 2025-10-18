import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Users, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import DataTable, { Column } from '@/components/admin/DataTable';
import { userApi, User } from '@/services/adminApi';
import UserDetails from '@/components/admin/UserDetails';

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
        <Badge className={getRoleColor(value)}>
          <span className="flex items-center gap-1">
            {getRoleIcon(value)}
            {value === 'superAdmin' ? 'Super Admin' : value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        </Badge>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts and their roles
          </p>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
            <UserCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(user => user.role === 'superAdmin').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(user => user.role === 'admin').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
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
      {showDetails && selectedUser && (
        <UserDetails
        

          user={selectedUser}
          onClose={() => {
            setShowDetails(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;


