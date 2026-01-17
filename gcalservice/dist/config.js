import { z } from 'zod';
const envSchema = z.object({
    PORT: z.string().default('3002'),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_REFRESH_TOKEN: z.string(),
    GOOGLE_CALENDAR_ID: z.string(),
    SYNC_INTERVAL_MINUTES: z.string().default('15'),
    MAIN_APP_URL: z.string().url().default('http://hytky:3000'),
    INTERNAL_API_SECRET: z.string(),
    NODE_ENV: z.enum(['development', 'production']).default('production'),
});
export const env = envSchema.parse(process.env);
