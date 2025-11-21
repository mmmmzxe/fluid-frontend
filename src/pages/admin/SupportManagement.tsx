import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, MessageSquare, Plus, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import DataTable, { Column } from '@/components/admin/DataTable';
import SupportTicketDetails from '@/components/admin/SupportTicketDetails';
import EnhancedStatsCard from '@/components/admin/EnhancedStatsCard';
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
    <div className="space-y-8">
      {/* Header with Gradient */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Support Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage customer support tickets and inquiries
          </p>
        </div>
      </div>

      {/* Support Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <EnhancedStatsCard
          title="Total Tickets"
          value={tickets.length}
          icon={MessageSquare}
          gradient="purple"
          loading={loading}
        />
        <EnhancedStatsCard
          title="Recent Tickets (24h)"
          value={tickets.filter(t => new Date(t.createdAt).getTime() > Date.now() - 86400000).length}
          icon={Clock}
          gradient="blue"
          loading={loading}
        />
        <EnhancedStatsCard
          title="Avg Tickets/Day"
          value={(tickets.length / 30).toFixed(1)}
          icon={MessageSquare}
          gradient="green"
          loading={loading}
          subtitle="Last 30 days"
        />
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
      {
        showDetails && selectedTicket && (
          <SupportTicketDetails
            ticket={selectedTicket}
            onClose={() => {
              setShowDetails(false);
              setSelectedTicket(null);
            }}
          />
        )
      }
    </div >
  );
};

export default SupportManagement;


