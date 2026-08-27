import { z } from 'zod';

/**
 * bcrypt operates on the first 72 BYTES of input and silently discards the rest.
 * Accepting a longer password would mean two different passwords sharing a
 * 72-byte prefix both authenticate — so it is rejected rather than truncated.
 */
const MAX_PASSWORD_BYTES = 72;

const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  // Not trimmed: leading and trailing spaces are legitimate password characters.
  .refine(
    (value) => Buffer.byteLength(value, 'utf8') <= MAX_PASSWORD_BYTES,
    `Password must be ${MAX_PASSWORD_BYTES} characters or fewer`
  );

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Email address is required')
  .max(254, 'Email address is too long')
  .email('Please enter a valid email address');

/**
 * The guest bag identifier, so a bag built before signing in survives the
 * transition. Optional everywhere — an absent value simply means "no guest bag".
 * Length-bounded because it is client-generated.
 */
const sessionIdField = z
  .string()
  .trim()
  .min(8, 'Session identifier is too short')
  .max(64, 'Session identifier is too long')
  .optional();

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must have at least 2 characters')
    .max(80, 'Name must be 80 characters or fewer'),
  email: emailField,
  password: passwordField,
  phone: z
    .string()
    .trim()
    .max(24, 'Phone number is too long')
    .optional()
    .or(z.literal('')),
  sessionId: sessionIdField,
  // `role` is absent by design. Even if a client sends it, zod strips unknown
  // keys, so privilege escalation through the registration body is impossible.
});

export const loginSchema = z.object({
  email: emailField,
  // Only presence is checked here. Applying the registration rules would let an
  // attacker distinguish "this password is too short to be ours" from a genuine
  // mismatch, and would lock out any account created before the rules changed.
  password: z.string().min(1, 'Password is required'),
  sessionId: sessionIdField,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
