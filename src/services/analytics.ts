import { http } from "@/services/http";

export type IntervalParam = "day" | "week" | "month" | "quarter" | "year";

export interface OverTimePoint {
  period: string;
  value: number;
}

export interface OverTimeResponse {
  message: string;
  data: OverTimePoint[];
}

export interface OverTimeParams {
  startDate: string;
  endDate: string;
  interval?: IntervalParam;
}

export const analyticsApi = {
  getOrdersOverTime: async (params: OverTimeParams): Promise<OverTimeResponse> => {
    const search = new URLSearchParams();
    search.set("startDate", params.startDate);
    search.set("endDate", params.endDate);
    if (params.interval) search.set("interval", params.interval);
    return await http.get<OverTimeResponse>(`/dashboard/analytics/orders-over-time?${search.toString()}`);
  },

  getSalesOverTime: async (params: OverTimeParams): Promise<OverTimeResponse> => {
    const search = new URLSearchParams();
    search.set("startDate", params.startDate);
    search.set("endDate", params.endDate);
    if (params.interval) search.set("interval", params.interval);
    return await http.get<OverTimeResponse>(`/dashboard/analytics/sales-over-time?${search.toString()}`);
  },
};



