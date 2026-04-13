import { z } from 'zod';

/**
 * Environment variable validation schema
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  MONGODB_URI: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  EMAIL_HOST: z.string(),
  EMAIL_PORT: z.string().transform(Number),
  EMAIL_USER: z.string(),
  EMAIL_PASS: z.string(),
  FRONTEND_URL: z.string().url(),
});

/**
 * Parsed environment variables
 */
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Load and validate environment variables
 * @throws {ZodError} If environment variables don't match the schema
 * @returns {EnvConfig} Validated environment configuration
 */
export function loadEnv(): EnvConfig {
  const parsedEnv = envSchema.safeParse(process.env);
  
  if (!parsedEnv.success) {
    console.error(
      'Environment validation failed:',
      parsedEnv.error.flatten().fieldErrors
    );
    throw new Error('Invalid environment configuration');
  }
  
  return parsedEnv.data;
}

// Load environment variables on module import
const envConfig = loadEnv();

export default envConfig;