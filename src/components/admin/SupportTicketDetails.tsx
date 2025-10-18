import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, User, Mail, Calendar, AlertTriangle } from 'lucide-react';
import { SupportTicket } from '@/services/adminApi';

interface SupportTicketDetailsProps {
  ticket: SupportTicket;
  onClose: () => void;
}

const SupportTicketDetails: React.FC<SupportTicketDetailsProps> = ({
  ticket,
  onClose,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-purple-100 text-purple-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Support Ticket Details
            </span>
            <div className="flex gap-2">
              <Badge className={getPriorityColor(ticket.priority)}>
                <span className="flex items-center gap-1">
                  {getPriorityIcon(ticket.priority)}
                  {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                </span>
              </Badge>
              <Badge className={getStatusColor(ticket.status)}>
                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            Ticket ID: {ticket._id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Name:</span> {ticket.user?.name || 'Guest User'}
              </div>
              <div>
                <span className="font-medium">Email:</span> {ticket.user?.email || 'No email provided'}
              </div>
            </CardContent>
          </Card>

          {/* Ticket Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Ticket Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="font-medium">Subject:</span>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  {ticket.subject}
                </div>
              </div>
              
              <div>
                <span className="font-medium">Message:</span>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
                  {ticket.message}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Ticket Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Ticket Created</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                {ticket.status === 'in-progress' && (
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">Ticket In Progress</div>
                      <div className="text-sm text-muted-foreground">Ticket is being handled</div>
                    </div>
                  </div>
                )}
                
                {ticket.status === 'resolved' && (
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">Ticket Resolved</div>
                      <div className="text-sm text-muted-foreground">Issue has been resolved</div>
                    </div>
                  </div>
                )}
                
                {ticket.status === 'closed' && (
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">Ticket Closed</div>
                      <div className="text-sm text-muted-foreground">Ticket has been closed</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Response Section */}
          <Card>
            <CardHeader>
              <CardTitle>Respond to Customer</CardTitle>
              <CardDescription>
                Send a response to the customer regarding their ticket
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Type your response here..."
                className="min-h-32"
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  Mark as In Progress
                </Button>
                <Button variant="outline">
                  Mark as Resolved
                </Button>
                <Button>
                  Send Response
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportTicketDetails;


