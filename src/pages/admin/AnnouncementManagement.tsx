import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Megaphone, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import DataTable, { Column } from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EnhancedStatsCard from '@/components/admin/EnhancedStatsCard';
import GradientButton from '@/components/admin/GradientButton';
import { announcementApi, Announcement } from '@/services/adminApi';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AnnouncementFormData {
  textEn: string;
  textAr: string;
  isActive?: boolean;
}

const AnnouncementManagement: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<AnnouncementFormData>({ textEn: '', textAr: '', isActive: true });
  const [submitting, setSubmitting] = useState(false);

  const { dialogState, confirm, closeDialog } = useConfirmDialog();

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementApi.getAll();
      setAnnouncements(response.data);
    } catch (error) {
      toast.error('Failed to fetch announcements');
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenForm = (announcement?: Announcement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData({
        textEn: announcement.textEn,
        textAr: announcement.textAr,
        isActive: announcement.isActive,
      });
    } else {
      setEditingAnnouncement(null);
      setFormData({ textEn: '', textAr: '', isActive: true });
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.textEn.trim() || !formData.textAr.trim()) {
      toast.error('Both English and Arabic texts are required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingAnnouncement) {
        await announcementApi.update(editingAnnouncement._id, formData);
        toast.success('Announcement updated successfully');
      } else {
        await announcementApi.create(formData);
        toast.success('Announcement created successfully');
      }
      setShowForm(false);
      fetchAnnouncements();
    } catch (error) {
      toast.error(editingAnnouncement ? 'Failed to update announcement' : 'Failed to create announcement');
      console.error('Error saving announcement:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (announcement: Announcement) => {
    try {
      await announcementApi.update(announcement._id, { isActive: !announcement.isActive });
      toast.success(`Announcement ${!announcement.isActive ? 'activated' : 'deactivated'}`);
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = (id: string) => {
    confirm(
      'Delete Announcement',
      'Are you sure you want to delete this marquee text ticker?',
      async () => {
        try {
          await announcementApi.delete(id);
          toast.success('Announcement deleted successfully');
          fetchAnnouncements();
        } catch (error) {
          toast.error('Failed to delete announcement');
          console.error('Error deleting announcement:', error);
        }
      },
      'destructive'
    );
  };

  const filteredAnnouncements = announcements.filter(
    (item) =>
      item.textEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.textAr.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = announcements.filter((a) => a.isActive).length;

  const columns: Column<Announcement>[] = [
    {
      key: '_id',
      title: 'Index',
      render: (_value, row) => {
        const index = announcements.findIndex(a => a._id === row._id);
        return <span className="font-semibold text-xs text-muted-foreground">Text #{index + 1}</span>;
      },
    },
    {
      key: 'textEn',
      title: 'English Text (EN)',
      sortable: true,
      render: (value) => <span className="font-medium text-sm text-foreground">{value}</span>,
    },
    {
      key: 'textAr',
      title: 'Arabic Text (AR)',
      sortable: true,
      render: (value) => <span className="font-medium text-sm text-foreground font-arabic">{value}</span>,
    },
    {
      key: 'isActive',
      title: 'Status',
      sortable: true,
      render: (value, row) => (
        <Badge
          className={`cursor-pointer transition-colors ${
            value
              ? 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-200'
              : 'bg-rose-500/15 text-rose-700 hover:bg-rose-500/25 border-rose-200'
          }`}
          onClick={() => handleToggleStatus(row)}
        >
          {value ? (
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Active
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <XCircle className="h-3 w-3" /> Inactive
            </span>
          )}
        </Badge>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_value, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenForm(row)}
            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row._id)}
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
            Marquee Ticker Announcements
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage dynamic texts shown in the top navbar marquee ticker bar (Arabic & English).
          </p>
        </div>
        <GradientButton onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" /> Add Announcement
        </GradientButton>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <EnhancedStatsCard
          title="Total Messages"
          value={announcements.length}
          icon={Megaphone}
          description="All created ticker texts"
        />
        <EnhancedStatsCard
          title="Active Messages"
          value={activeCount}
          icon={Sparkles}
          description="Currently displaying in navbar"
        />
        <EnhancedStatsCard
          title="Inactive Messages"
          value={announcements.length - activeCount}
          icon={XCircle}
          description="Disabled ticker texts"
        />
      </div>

      {/* Form Modal / Card */}
      {showForm && (
        <Card className="border-purple-100 bg-white/80 backdrop-blur-sm shadow-md">
          <CardHeader>
            <CardTitle>{editingAnnouncement ? 'Edit Announcement Text' : 'Add New Marquee Text'}</CardTitle>
            <CardDescription>
              Enter the English and Arabic version of the message. It will auto-slide in the top bar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="textEn">English Text (Text EN) *</Label>
                  <Input
                    id="textEn"
                    placeholder="e.g. 💕 Comfort you feel. Style you love."
                    value={formData.textEn}
                    onChange={(e) => setFormData({ ...formData, textEn: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="textAr">Arabic Text (Text AR) *</Label>
                  <Input
                    id="textAr"
                    placeholder="مثال: 💕 راحة تشعر بها. أسلوب تحبه."
                    value={formData.textAr}
                    onChange={(e) => setFormData({ ...formData, textAr: e.target.value })}
                    className="font-arabic"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <Label htmlFor="isActive" className="cursor-pointer text-sm font-medium">
                  Active (show on site ticker)
                </Label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <GradientButton type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingAnnouncement ? 'Update Message' : 'Add Message'}
                </GradientButton>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card className="border-white/20 bg-white/60 backdrop-blur-md shadow-sm">
        <CardContent className="p-6">
          <DataTable
            data={filteredAnnouncements}
            columns={columns}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search marquee text..."
            isLoading={loading}
            emptyMessage="No announcement texts found. Click Add Announcement to create one!"
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        variant={dialogState.variant}
        onConfirm={dialogState.onConfirm}
        onClose={closeDialog}
      />
    </div>
  );
};

export default AnnouncementManagement;
