import React, { useEffect, useState } from 'react';
import {
  whatsappSettingsApi,
  WhatsAppSettingsData,
} from '@/services/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  MessageSquare,
  Key,
  Globe,
  PhoneCall,
  ShieldCheck,
  Send,
  Loader2,
  CheckCircle2,
  Copy,
  RefreshCw,
  Sparkles,
  Smartphone,
  Wallet,
} from 'lucide-react';

const WhatsAppSettingsManagement: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);

  const [settings, setSettings] = useState<WhatsAppSettingsData>({
    accountUniqueId: '',
    apiSecret: '',
    apiBaseUrl: 'https://hashtagmarketing.agency/api',
    webhookSecret: '',
    botPhone: '',
    instapayPhone: '',
    vodafonePhone: '',
    isEnabled: true,
    autoSendOrderConfirmation: true,
  });

  const [testPhone, setTestPhone] = useState<string>('');
  const [testMsg, setTestMsg] = useState<string>('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await whatsappSettingsApi.getSettings();
      if (res.data) {
        setSettings(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load WhatsApp settings:', err);
      toast.error(err?.response?.data?.message || 'Failed to load WhatsApp settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field: keyof WhatsAppSettingsData, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await whatsappSettingsApi.updateSettings(settings);
      if (res.data) {
        setSettings(res.data);
      }
      toast.success('WhatsApp settings updated successfully!');
    } catch (err: any) {
      console.error('Failed to update settings:', err);
      toast.error(err?.response?.data?.message || 'Failed to update WhatsApp settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone) {
      toast.error('Please enter a recipient phone number');
      return;
    }
    try {
      setTesting(true);
      const res = await whatsappSettingsApi.testMessage(testPhone, testMsg);
      toast.success(res.message || 'Test message sent successfully!');
    } catch (err: any) {
      console.error('Test message error:', err);
      toast.error(err?.response?.data?.message || 'Failed to send test WhatsApp message');
    } finally {
      setTesting(false);
    }
  };

  const webhookUrl = `${window.location.protocol}//${window.location.host}/api/whatsapp/webhook?secret=${settings.webhookSecret || settings.apiSecret}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading WhatsApp Configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 pb-16 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-8 text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" /> WhatsApp Integration
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${settings.isEnabled ? 'bg-emerald-400/20 text-emerald-100 border border-emerald-400/30' : 'bg-red-500/20 text-red-100 border border-red-500/30'}`}>
                {settings.isEnabled ? '● Active & Live' : '○ Disabled'}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">WhatsApp Settings & Configuration</h1>
            <p className="text-emerald-100/90 text-sm max-w-2xl">
              Manage your Hashtag WhatsApp API credentials, Account Unique ID, automated messaging triggers, and cash transfer payment phone numbers.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/20">
            <div className="space-y-1">
              <p className="text-xs text-emerald-100/80 uppercase tracking-wider font-semibold">Account Unique ID</p>
              <p className="font-mono text-xs font-bold text-white max-w-[200px] truncate" title={settings.accountUniqueId}>
                {settings.accountUniqueId || 'Not Configured'}
              </p>
            </div>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-white/20 hover:bg-white/30 text-white border-0"
              onClick={() => copyToClipboard(settings.accountUniqueId, 'Account Unique ID')}
              title="Copy Unique ID"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="credentials" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
          <TabsTrigger value="credentials" className="gap-2 text-xs font-medium rounded-lg">
            <Key className="h-4 w-4" /> Credentials
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2 text-xs font-medium rounded-lg">
            <Wallet className="h-4 w-4" /> Payments & Phones
          </TabsTrigger>
          <TabsTrigger value="test" className="gap-2 text-xs font-medium rounded-lg">
            <Send className="h-4 w-4" /> Send Test
          </TabsTrigger>
        </TabsList>

        {/* Credentials Tab */}
        <TabsContent value="credentials" className="mt-6">
          <form onSubmit={handleSave} className="space-y-6">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  API Credentials & Bot Configuration
                </CardTitle>
                <CardDescription>
                  Configure your Hashtag WhatsApp Marketing API settings and Account Unique ID.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Account Unique ID */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="accountUniqueId" className="font-semibold text-slate-800 dark:text-slate-200">
                      Account Unique ID <span className="text-red-500">*</span>
                    </Label>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">Current Active ID</span>
                  </div>
                  <div className="relative">
                    <Input
                      id="accountUniqueId"
                      value={settings.accountUniqueId}
                      onChange={(e) => handleChange('accountUniqueId', e.target.value)}
                      placeholder="e.g. 17900733771679091c5a880faf6fb5e6087eb1b2dc6ab25a21edaf1"
                      className="font-mono text-sm pr-10 border-slate-300 dark:border-slate-700 rounded-xl focus:ring-emerald-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(settings.accountUniqueId, 'Account Unique ID')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    This unique key identifies your WhatsApp sender instance on the Hashtag server.
                  </p>
                </div>

                {/* API Secret */}
                <div className="space-y-2">
                  <Label htmlFor="apiSecret" className="font-semibold text-slate-800 dark:text-slate-200">
                    API Secret Key <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="apiSecret"
                    type="password"
                    value={settings.apiSecret}
                    onChange={(e) => handleChange('apiSecret', e.target.value)}
                    placeholder="Enter your Hashtag API Secret"
                    className="font-mono text-sm border-slate-300 dark:border-slate-700 rounded-xl focus:ring-emerald-500"
                  />
                  <p className="text-xs text-slate-500">
                    Your confidential Hashtag API authentication secret.
                  </p>
                </div>

                {/* API Base URL */}
                <div className="space-y-2">
                  <Label htmlFor="apiBaseUrl" className="font-semibold text-slate-800 dark:text-slate-200">
                    API Base URL
                  </Label>
                  <Input
                    id="apiBaseUrl"
                    value={settings.apiBaseUrl}
                    onChange={(e) => handleChange('apiBaseUrl', e.target.value)}
                    placeholder="https://hashtagmarketing.agency/api"
                    className="font-mono text-sm border-slate-300 dark:border-slate-700 rounded-xl focus:ring-emerald-500"
                  />
                </div>

                {/* Webhook Secret */}
                <div className="space-y-2">
                  <Label htmlFor="webhookSecret" className="font-semibold text-slate-800 dark:text-slate-200">
                    Webhook Verification Secret
                  </Label>
                  <Input
                    id="webhookSecret"
                    value={settings.webhookSecret}
                    onChange={(e) => handleChange('webhookSecret', e.target.value)}
                    placeholder="Used to verify inbound webhook notifications"
                    className="font-mono text-sm border-slate-300 dark:border-slate-700 rounded-xl focus:ring-emerald-500"
                  />
                  <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="space-y-1 overflow-hidden">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Hashtag Webhook URL</p>
                      <p className="text-xs font-mono text-slate-500 truncate">{webhookUrl}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(webhookUrl, 'Webhook URL')}
                      className="shrink-0 gap-1 rounded-lg text-xs"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy URL
                    </Button>
                  </div>
                </div>

                {/* Automation Toggles */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-semibold text-slate-900 dark:text-white">Enable WhatsApp Integration</Label>
                      <p className="text-xs text-slate-500">Master switch to turn WhatsApp messaging on or off.</p>
                    </div>
                    <Switch
                      checked={settings.isEnabled}
                      onCheckedChange={(val) => handleChange('isEnabled', val)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-semibold text-slate-900 dark:text-white">Auto-Send Order Confirmation</Label>
                      <p className="text-xs text-slate-500">Automatically send deposit & summary message when a new order is created.</p>
                    </div>
                    <Switch
                      checked={settings.autoSendOrderConfirmation}
                      onCheckedChange={(val) => handleChange('autoSendOrderConfirmation', val)}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 gap-2 font-semibold shadow-md"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Save Credentials
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        {/* Payment Phones Tab */}
        <TabsContent value="payments" className="mt-6">
          <form onSubmit={handleSave} className="space-y-6">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                  <Smartphone className="h-5 w-5 text-emerald-600" />
                  Bot Phone & Payment Accounts
                </CardTitle>
                <CardDescription>
                  Phone numbers sent to customers via WhatsApp for deposit payments.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="botPhone" className="font-semibold text-slate-800 dark:text-slate-200">
                    WhatsApp Bot Phone Number
                  </Label>
                  <Input
                    id="botPhone"
                    value={settings.botPhone}
                    onChange={(e) => handleChange('botPhone', e.target.value)}
                    placeholder="e.g. 201286198016"
                    className="font-mono text-sm border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                  <p className="text-xs text-slate-500">
                    The mobile phone number attached to this WhatsApp sender account.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="instapayPhone" className="font-semibold text-slate-800 dark:text-slate-200">
                      InstaPay Wallet Phone
                    </Label>
                    <Input
                      id="instapayPhone"
                      value={settings.instapayPhone}
                      onChange={(e) => handleChange('instapayPhone', e.target.value)}
                      placeholder="e.g. 01128560748"
                      className="font-mono text-sm border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                    <p className="text-xs text-slate-500">Displayed in InstaPay deposit instructions.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vodafonePhone" className="font-semibold text-slate-800 dark:text-slate-200">
                      Vodafone Cash Wallet Phone
                    </Label>
                    <Input
                      id="vodafonePhone"
                      value={settings.vodafonePhone}
                      onChange={(e) => handleChange('vodafonePhone', e.target.value)}
                      placeholder="e.g. 01286198016"
                      className="font-mono text-sm border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                    <p className="text-xs text-slate-500">Displayed in Vodafone Cash deposit instructions.</p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 gap-2 font-semibold shadow-md"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Save Phone Numbers
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        {/* Send Test Tab */}
        <TabsContent value="test" className="mt-6">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                <Send className="h-5 w-5 text-emerald-600" />
                Live Connection & Message Test
              </CardTitle>
              <CardDescription>
                Send a live test message to verify that your Account Unique ID and API Secret are active.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTestSend} className="space-y-6 max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="testPhone" className="font-semibold text-slate-800 dark:text-slate-200">
                    Recipient Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="testPhone"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="e.g. 01001234567 or +201001234567"
                    className="font-mono text-sm border-slate-300 dark:border-slate-700 rounded-xl"
                    required
                  />
                  <p className="text-xs text-slate-500">Supports Egyptian mobile numbers in local or international format.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testMsg" className="font-semibold text-slate-800 dark:text-slate-200">
                    Custom Message (Optional)
                  </Label>
                  <Input
                    id="testMsg"
                    value={testMsg}
                    onChange={(e) => setTestMsg(e.target.value)}
                    placeholder="Default test notification message will be sent if blank."
                    className="text-sm border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={testing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 gap-2 font-semibold shadow-md w-full sm:w-auto"
                >
                  {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send Test Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WhatsAppSettingsManagement;
