import { useEffect, useMemo, useState } from 'react';
import { analyticsApi, OverTimePoint, OverTimeParams } from '@/services/analytics';

function lastThirtyDays(): OverTimeParams {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 30);
  return {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
    interval: 'day',
  };
}

function sumSeries(series: OverTimePoint[] | null) {
  return series?.reduce((total, point) => total + (Number(point.value) || 0), 0) ?? 0;
}

export function useDashboardAnalytics(enabled: boolean) {
  const params = useMemo(lastThirtyDays, []);
  const [orders, setOrders] = useState<OverTimePoint[] | null>(null);
  const [sales, setSales] = useState<OverTimePoint[] | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) { setLoading(false); return; }
    let active = true;
    const load = async () => {
      setLoading(true); setError(null);
      try {
        const [ordersResponse, salesResponse] = await Promise.all([
          analyticsApi.getOrdersOverTime(params), analyticsApi.getSalesOverTime(params),
        ]);
        if (active) { setOrders(ordersResponse.data || []); setSales(salesResponse.data || []); }
      } catch (requestError) {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Failed to load analytics');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [enabled, params]);

  return { loading, error, totalOrders: sumSeries(orders), totalRevenue: sumSeries(sales) };
}
