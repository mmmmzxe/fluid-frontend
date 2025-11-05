import React from 'react';
import { Navbar } from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTranslation } from 'react-i18next';
import { Truck, RotateCcw, Package, Clock } from 'lucide-react';

const ShippingReturns: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-6xl mx-auto p-6 py-16">
        <h1 className="text-4xl font-bold text-center mb-4">{t('shipping.title')}</h1>
        <p className="text-center text-muted-foreground mb-12">
          {t('shipping.subtitle')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Shipping Section */}
          <div className="bg-white border rounded-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-full">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">{t('shipping.shippingPolicy')}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{t('shipping.deliveryTime')}</h3>
                <p className="text-muted-foreground">{t('shipping.deliveryTimeDesc')}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">{t('shipping.shippingCost')}</h3>
                <p className="text-muted-foreground">{t('shipping.shippingCostDesc')}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">{t('shipping.tracking')}</h3>
                <p className="text-muted-foreground">{t('shipping.trackingDesc')}</p>
              </div>
            </div>
          </div>

          {/* Returns Section */}
          <div className="bg-white border rounded-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-full">
                <RotateCcw className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">{t('shipping.returnPolicy')}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{t('shipping.returnWindow')}</h3>
                <p className="text-muted-foreground">{t('shipping.returnWindowDesc')}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">{t('shipping.returnConditions')}</h3>
                <p className="text-muted-foreground">{t('shipping.returnConditionsDesc')}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">{t('shipping.refundProcess')}</h3>
                <p className="text-muted-foreground">{t('shipping.refundProcessDesc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-muted rounded-lg p-6 flex gap-4">
            <Package className="h-10 w-10 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">{t('shipping.packaging')}</h3>
              <p className="text-sm text-muted-foreground">{t('shipping.packagingDesc')}</p>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-6 flex gap-4">
            <Clock className="h-10 w-10 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">{t('shipping.processingTime')}</h3>
              <p className="text-sm text-muted-foreground">{t('shipping.processingTimeDesc')}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 bg-primary/5 border border-primary/20 rounded-lg text-center">
          <h2 className="text-2xl font-semibold mb-2">{t('shipping.needHelp')}</h2>
          <p className="text-muted-foreground mb-4">{t('shipping.needHelpDesc')}</p>
          <a href="/contact" className="text-primary hover:underline font-medium">
            {t('footer.contactUs')} →
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ShippingReturns;

