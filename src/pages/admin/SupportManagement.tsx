import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, MessageSquare, Plus } from 'lucide-react';
import { toast } from 'sonner';
import DataTable, { Column } from '@/components/admin/DataTable';
import SupportTicketDetails from '@/components/admin/SupportTicketDetails';
import { supportApi, SupportTicket } from '@/services/adminApi';

const SupportManagement: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // Backend provides name/phone/message only; remove status/priority filters

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await supportApi.getAll();
      setTickets(response.data);
    } catch (error) {
      toast.error('Failed to fetch support tickets');
      console.error('Error fetching support tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleView = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setShowDetails(true);
  };

  const filteredTickets = tickets.filter(ticket => {
    const q = searchQuery.toLowerCase();
    const fields = [
      ticket.name || '',
      ticket.phone || '',
      ticket.message || '',
    ];
    return fields.some(f => f.toLowerCase().includes(q));
  });

  const columns: Column<SupportTicket>[] = [
    {
      key: 'name',
      title: 'Name',
      render: (value) => value || '—',
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (value) => value || '—',
    },
    {
      key: 'message',
      title: 'Message',
      render: (value) => (
        <div className="max-w-md truncate">{value}</div>
      ),
    },
    {
      key: 'createdAt',
      title: 'Created At',
      render: (value) => new Date(value).toLocaleString(),
      sortable: true,
    },
  ];

  const paginatedTickets = filteredTickets.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const filters: any[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Management</h1>
          <p className="text-muted-foreground">
            Manage customer support tickets and inquiries
          </p>
        </div>
      </div>

      {/* Support Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(ticket => ticket.status === 'open').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(ticket => ticket.status === 'in-progress').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <MessageSquare className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(ticket => ticket.priority === 'high').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>
            A list of all customer support tickets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={paginatedTickets}
            columns={columns}
            loading={loading}
            searchable
            searchPlaceholder="Search tickets..."
            onSearch={setSearchQuery}
            onView={handleView}
            pagination={{
              page,
              pageSize,
              total: filteredTickets.length,
              onPageChange: setPage,
              onPageSizeChange: setPageSize,
            }}
            filters={filters}
          />
        </CardContent>
      </Card>

      {/* Ticket Details Modal */}
      {showDetails && selectedTicket && (
        <SupportTicketDetails
          ticket={selectedTicket}
          onClose={() => {
            setShowDetails(false);
            setSelectedTicket(null);
          }}
        />
      )}
    </div>
  );
};

export default SupportManagement;


