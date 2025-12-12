import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supportApi } from '@/services/adminApi';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { useTranslation } from 'react-i18next';
import image from '@/assets/6.webp';
import { fbPixel } from '@/lib/fbPixel';

const ContactUs: React.FC = () => {
  const { t } = useTranslation();
  const [name, setName] = useState(' ');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameVal = name.trim();
    const phoneVal = phone.trim();
    const msgVal = message.trim();

    if (typeof nameVal !== 'string' || nameVal.length < 2 || nameVal.length > 100) {
      toast.error('Name must be a string between 2 and 100 characters');
      return;
    }
    if (typeof phoneVal !== 'string' || phoneVal.length === 0) {
      toast.error('Phone must be provided');
      return;
    }

    setLoading(true);
    try {
      const payload = { name: nameVal, phone: phoneVal, message: msgVal };
      await supportApi.create(payload as any);
      
      // Track lead/contact event
      fbPixel.lead({
        content_name: 'Contact Form Submission',
        content_category: 'support',
      });
      
      toast.success('Message sent — we will contact you shortly');
      setName('');
      setPhone('');
      setMessage('');
    } catch (err: any) {
      const msg = err?.message || 'Failed to send message';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl flex gap-5 items-center justify-between mx-auto p-6 mt-10 bg-white ">
        {/* صورة AI تعبّر عن محل ملابس */}
        <div className="flex justify-center mb-6">
          <img
            src={image}
            alt="Fashion Store Illustration"
            className="rounded-2xl w-full max-w-md object-cover shadow-md"
            loading="eager"
          />
        </div>

     

        <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {t('contact.contactOurStore')}
        </h1>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">{t('contact.name')}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-gray-300 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">{t('contact.phone')}</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border-gray-300 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">{t('contact.message')}</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="border-gray-300 focus:ring-pink-500 focus:border-pink-500"
              rows={4}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-pink-700 text-white"
            >
              {loading ? t('contact.sending') : t('contact.send')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
