export interface SupportTicket {
  _id: string;
  /** Simple support fields from backend */
  name?: string;
  phone?: string;
  message: string;
  /** Legacy fields kept optional for compatibility */
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  subject?: string;
  status?: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}
