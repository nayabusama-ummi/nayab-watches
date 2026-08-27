import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { signToken } from '../utils/jwt.js';
import { ConflictError, UnauthorizedError } from '../utils/errors.js';
import { RegisterInput, LoginInput } from '../validators/authValidator.js';

const BCRYPT_COST = 10;

/**
 * A real hash to compare against when the email does not exist.
 *
 * Without it, a missing account returns in ~1ms and a wrong password in ~80ms,
 * which is a reliable oracle for "does this address have a NAYAB account" —
 * exactly what the deliberately generic error message is there to hide.
 * Computed once at boot.
 */
const TIMING_EQUALISER_HASH = bcrypt.hashSync(
  'nayab_login_timing_equaliser',
  BCRYPT_COST
);

/**
 * The only shape of a user that leaves the server. `passwordHash` is impossible
 * to leak by accident because it is never selected — a positive allow-list
 * rather than deleting keys after the fact.
 */
const USER_DTO = {
  id: true,
  name: true,
  email: true,
  phone: true,
  avatar: true,
  role: true,
  createdAt: true,
} as const;

const normaliseEmail = (email: string) => email.trim().toLowerCase();

export class AuthService {
  static async register(input: RegisterInput) {
    const email = normaliseEmail(input.email);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictError(
        'A client account with this email address already exists.'
      );
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);

    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email,
        passwordHash,
        phone: input.phone?.trim() || null,
        // `role` is intentionally absent: it defaults to CUSTOMER at the schema
        // level, so no request body can ever set it. Promotion is a deliberate
        // out-of-band action (seed or SQL), never a self-service one.
      },
      select: USER_DTO,
    });

    return { user, token: signToken({ userId: user.id, email: user.email }) };
  }

  static async login(input: LoginInput) {
    const email = normaliseEmail(input.email);
    const user = await prisma.user.findUnique({ where: { email } });

    // Always spend the bcrypt time, whether or not the account exists.
    const isMatch = await bcrypt.compare(
      input.password,
      user?.passwordHash ?? TIMING_EQUALISER_HASH
    );

    if (!user || !isMatch) {
      // One message for both cases, by design — it must not reveal which failed.
      throw new UnauthorizedError('Invalid email or password.');
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
    };

    return { user: safeUser, token: signToken({ userId: user.id, email: user.email }) };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: USER_DTO,
    });

    if (!user) {
      throw new UnauthorizedError('Client account not found.');
    }

    return user;
  }
}
