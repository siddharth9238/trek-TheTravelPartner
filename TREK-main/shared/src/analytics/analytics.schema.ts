import { z } from 'zod';

export const analyticsDashboardSchema = z.object({
  totalTrips: z.number(),
  visitedCountries: z.array(z.object({
    country: z.string(),
    tripCount: z.number(),
    totalSpent: z.number()
  })),
  totalSpent: z.number(),
  flights: z.object({
    count: z.number(),
    totalAmount: z.number(),
    averagePrice: z.number()
  }),
  hotels: z.object({
    count: z.number(),
    totalAmount: z.number(),
    averagePrice: z.number()
  }),
  topCategories: z.array(z.object({
    category: z.string(),
    amount: z.number(),
    percentage: z.number()
  })),
  recentTrips: z.array(z.object({
    id: z.number(),
    title: z.string(),
    destination: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    totalAmount: z.number()
  }))
});
export type AnalyticsDashboard = z.infer<typeof analyticsDashboardSchema>;

export const analyticsFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  userId: z.number().optional()
});
export type AnalyticsFilter = z.infer<typeof analyticsFilterSchema>;