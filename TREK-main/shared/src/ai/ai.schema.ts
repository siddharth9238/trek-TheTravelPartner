import { z } from 'zod';

export const aiChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});
export type AiChatMessage = z.infer<typeof aiChatMessageSchema>;

export const aiChatRequestSchema = z.object({
  message: z.string().min(1),
  tripId: z.number().optional(),
  history: z.array(aiChatMessageSchema).optional(),
});
export type AiChatRequest = z.infer<typeof aiChatRequestSchema>;

export const AiChatRequestSchema = aiChatRequestSchema;

export const aiItinerarySchema = z.object({
  title: z.string(),
  destination: z.string(),
  days: z.number(),
  budget: z.string().optional(),
  interests: z.array(z.string()).optional(),
});
export type AiItineraryRequest = z.infer<typeof aiItinerarySchema>;

export const AiItineraryRequestSchema = aiItinerarySchema;

export const aiChatResponseSchema = z.object({
  response: z.string(),
  tripContext: z
    .object({
      id: z.number().optional(),
      title: z.string().optional(),
      destination: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      budget: z.string().optional(),
    })
    .nullable()
    .optional(),
});
export type AiChatResponse = z.infer<typeof aiChatResponseSchema>;

export const aiItineraryResponseSchema = z.object({
  itinerary: z.array(
    z.object({
      day: z.number(),
      date: z.string().optional(),
      activities: z.array(z.string()),
      hotels: z.array(z.string()).optional(),
      restaurants: z.array(z.string()).optional(),
    }),
  ),
  estimatedBudget: z
    .object({
      total: z.number(),
      breakdown: z.record(z.number(), z.number()),
    })
    .optional(),
  packingList: z
    .object({
      clothes: z.array(z.string()),
      electronics: z.array(z.string()),
      medicines: z.array(z.string()),
      documents: z.array(z.string()),
    })
    .optional(),
  transportSuggestions: z.array(z.string()).optional(),
});
export type AiItineraryResponse = z.infer<typeof aiItineraryResponseSchema>;

export const aiPackingRequestSchema = z.object({
  destination: z.string(),
  days: z.number(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  tripType: z.string().optional(),
  activities: z.array(z.string()).optional(),
});
export type AiPackingRequest = z.infer<typeof aiPackingRequestSchema>;

export const aiPackingResponseSchema = z.object({
  clothes: z.array(z.string()),
  electronics: z.array(z.string()),
  medicines: z.array(z.string()),
  documents: z.array(z.string()),
  optionalItems: z.array(z.string()).optional(),
});
export type AiPackingResponse = z.infer<typeof aiPackingResponseSchema>;

export const aiExpenseAnalysisRequestSchema = z.object({
  tripId: z.number(),
  budgetItems: z
    .array(
      z.object({
        category: z.string(),
        name: z.string(),
        total_price: z.number(),
      }),
    )
    .optional(),
});
export type AiExpenseAnalysisRequest = z.infer<typeof aiExpenseAnalysisRequestSchema>;

export const aiExpenseAnalysisResponseSchema = z.object({
  summary: z.string(),
  breakdown: z.array(
    z.object({
      category: z.string(),
      amount: z.number(),
      percentage: z.number(),
    }),
  ),
  suggestions: z.array(z.string()),
  savingsEstimate: z.number().optional(),
});
export type AiExpenseAnalysisResponse = z.infer<typeof aiExpenseAnalysisResponseSchema>;

export const aiDestinationRequestSchema = z.object({
  budget: z.string(),
  days: z.number(),
  month: z.string().optional(),
  interests: z.array(z.string()).optional(),
  travelers: z.number().optional(),
});
export type AiDestinationRequest = z.infer<typeof aiDestinationRequestSchema>;

export const aiDestinationResponseSchema = z.object({
  destinations: z.array(
    z.object({
      name: z.string(),
      country: z.string(),
      estimatedCost: z.number(),
      duration: z.string(),
      highlights: z.array(z.string()),
      reason: z.string(),
    }),
  ),
});
export type AiDestinationResponse = z.infer<typeof aiDestinationResponseSchema>;

export const aiTripSummaryRequestSchema = z.object({
  tripId: z.number(),
  tripTitle: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  places: z
    .array(
      z.object({
        name: z.string(),
        dayId: z.number().optional(),
      }),
    )
    .optional(),
  budgetTotal: z.number().optional(),
});
export type AiTripSummaryRequest = z.infer<typeof aiTripSummaryRequestSchema>;

export const aiTripSummaryResponseSchema = z.object({
  journal: z.string(),
  timeline: z.array(
    z.object({
      date: z.string(),
      title: z.string(),
      description: z.string(),
    }),
  ),
  expenseSummary: z
    .object({
      total: z.number(),
      breakdown: z.record(z.string(), z.number()),
    })
    .optional(),
  memorablePlaces: z.array(z.string()),
});
export type AiTripSummaryResponse = z.infer<typeof aiTripSummaryResponseSchema>;

export const aiImageRequestSchema = z.object({
  destination: z.string(),
  tripTitle: z.string(),
  date: z.string().optional(),
  style: z.string().optional(),
  colors: z.array(z.string()).optional(),
});
export type AiImageRequest = z.infer<typeof aiImageRequestSchema>;

export const aiImageResponseSchema = z.object({
  imageUrl: z.string(),
  prompt: z.string(),
  revisedPrompt: z.string().optional(),
});
export type AiImageResponse = z.infer<typeof aiImageResponseSchema>;
