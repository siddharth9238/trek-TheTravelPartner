import { z } from 'zod';

export const voiceCommandSchema = z.object({
  text: z.string().min(1, 'Voice command text is required'),
  language: z.string().default('en'),
});
export type VoiceCommand = z.infer<typeof voiceCommandSchema>;

export const voiceResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  action: z.string().optional(),
  data: z.record(z.unknown).optional(),
});
export type VoiceResponse = z.infer<typeof voiceResponseSchema>;