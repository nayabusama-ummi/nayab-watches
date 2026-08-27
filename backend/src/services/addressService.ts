import { prisma } from '../config/prisma.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { AddressInput, UpdateAddressInput } from '../validators/orderValidator.js';

/**
 * A customer may keep at most this many saved addresses. Not a business rule so
 * much as a bound — without one, a script can fill the table indefinitely.
 */
const MAX_ADDRESSES_PER_USER = 10;

export class AddressService {
  static async list(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  static async create(userId: string, input: AddressInput) {
    const count = await prisma.address.count({ where: { userId } });
    if (count >= MAX_ADDRESSES_PER_USER) {
      throw new BadRequestError(
        `You may save up to ${MAX_ADDRESSES_PER_USER} addresses. Please remove one first.`
      );
    }

    // The first address a customer saves becomes their default automatically —
    // otherwise checkout would present a list with nothing preselected.
    const shouldDefault = input.isDefault || count === 0;

    return prisma.$transaction(async (tx) => {
      if (shouldDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          userId,
          fullName: input.fullName,
          phone: input.phone,
          addressLine1: input.addressLine1,
          addressLine2: input.addressLine2 || null,
          city: input.city,
          province: input.province,
          postalCode: input.postalCode || null,
          country: input.country,
          isDefault: shouldDefault,
        },
      });
    });
  }

  static async update(userId: string, addressId: string, input: UpdateAddressInput) {
    // Ownership is part of the lookup, so another customer's id reads as absent.
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundError('That address could not be found.');
    }

    return prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true, NOT: { id: addressId } },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id: addressId },
        data: {
          ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
          ...(input.phone !== undefined ? { phone: input.phone } : {}),
          ...(input.addressLine1 !== undefined
            ? { addressLine1: input.addressLine1 }
            : {}),
          ...(input.addressLine2 !== undefined
            ? { addressLine2: input.addressLine2 || null }
            : {}),
          ...(input.city !== undefined ? { city: input.city } : {}),
          ...(input.province !== undefined ? { province: input.province } : {}),
          ...(input.postalCode !== undefined
            ? { postalCode: input.postalCode || null }
            : {}),
          ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
        },
      });
    });
  }

  /**
   * Removes a saved address.
   *
   * Orders that referenced it are NOT deleted — the FK is ON DELETE SET NULL and
   * every order carries its own address snapshot, so past deliveries keep
   * showing where they actually went.
   */
  static async remove(userId: string, addressId: string) {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
      select: { id: true, isDefault: true },
    });

    if (!existing) {
      throw new NotFoundError('That address could not be found.');
    }

    await prisma.$transaction(async (tx) => {
      await tx.address.delete({ where: { id: addressId } });

      // Promote another address so the customer is never left without a default.
      if (existing.isDefault) {
        const next = await tx.address.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          select: { id: true },
        });
        if (next) {
          await tx.address.update({
            where: { id: next.id },
            data: { isDefault: true },
          });
        }
      }
    });

    return { id: addressId };
  }
}
