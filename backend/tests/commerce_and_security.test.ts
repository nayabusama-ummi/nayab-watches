import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';

const app = createApp();

describe('NAYAB Commerce, Security & Concurrency Test Suite', () => {
  let customerACookie = '';
  let customerBCookie = '';
  let adminCookie = '';
  let customerAId = '';
  let customerBId = '';

  let sovereignProduct: any = null;
  let meridianProduct: any = null;

  let customerAAddressId = '';
  let customerBAddressId = '';

  let createdOrderAId = '';
  let createdOrderANumber = '';

  beforeAll(async () => {
    // 1. Ensure admin user exists with known password
    const adminPasswordHash = await bcrypt.hash('Atelier@2026', 10);
    await prisma.user.upsert({
      where: { email: 'atelier@nayab.pk' },
      update: {
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
      },
      create: {
        name: 'NAYAB Atelier Master',
        email: 'atelier@nayab.pk',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
      },
    });

    // 2. Fetch products
    const prodsRes = await request(app).get('/api/products');
    expect(prodsRes.status).toBe(200);
    sovereignProduct = prodsRes.body.data.products.find((p: any) => p.slug === 'sovereign-39');
    meridianProduct = prodsRes.body.data.products.find((p: any) => p.slug === 'meridian-41');
    expect(sovereignProduct).toBeDefined();
    expect(meridianProduct).toBeDefined();

    // 3. Register Customer A
    const emailA = `customer_a_${Date.now()}@nayab.pk`;
    const resA = await request(app).post('/api/auth/register').send({
      name: 'Customer A',
      email: emailA,
      password: 'Password123!',
      phone: '+92 300 1111111',
    });
    expect(resA.status).toBe(201);
    customerACookie = resA.headers['set-cookie'][0];
    customerAId = resA.body.data.user.id;

    // 4. Register Customer B
    const emailB = `customer_b_${Date.now()}@nayab.pk`;
    const resB = await request(app).post('/api/auth/register').send({
      name: 'Customer B',
      email: emailB,
      password: 'Password123!',
      phone: '+92 300 2222222',
    });
    expect(resB.status).toBe(201);
    customerBCookie = resB.headers['set-cookie'][0];
    customerBId = resB.body.data.user.id;

    // 5. Login Admin
    const adminRes = await request(app).post('/api/auth/login').send({
      email: 'atelier@nayab.pk',
      password: 'Atelier@2026',
    });
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.data.user.role).toBe('ADMIN');
    adminCookie = adminRes.headers['set-cookie'][0];
  });

  // 1. ADDRESS MANAGEMENT & ACCESS ISOLATION
  describe('Address Management & Access Isolation', () => {
    it('Customer A creates an address', async () => {
      const res = await request(app)
        .post('/api/addresses')
        .set('Cookie', customerACookie)
        .send({
          fullName: 'Customer A Resident',
          phone: '+92 300 1111111',
          addressLine1: 'House 12, Street 4, F-7/2',
          city: 'Islamabad',
          province: 'Islamabad Capital Territory',
          postalCode: '44000',
          country: 'Pakistan',
          isDefault: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.address.fullName).toBe('Customer A Resident');
      expect(res.body.data.address.isDefault).toBe(true);
      customerAAddressId = res.body.data.address.id;
      expect(customerAAddressId).toBeDefined();
    });

    it('Customer B creates an address', async () => {
      const res = await request(app)
        .post('/api/addresses')
        .set('Cookie', customerBCookie)
        .send({
          fullName: 'Customer B Resident',
          phone: '+92 300 2222222',
          addressLine1: 'Flat 4B, Clifton Block 2',
          city: 'Karachi',
          province: 'Sindh',
          postalCode: '75600',
          country: 'Pakistan',
          isDefault: true,
        });

      expect(res.status).toBe(201);
      customerBAddressId = res.body.data.address.id;
      expect(customerBAddressId).toBeDefined();
    });

    it('Customer B CANNOT access Customer A address list', async () => {
      const resB = await request(app)
        .get('/api/addresses')
        .set('Cookie', customerBCookie);

      expect(resB.status).toBe(200);
      const addresses = resB.body.data.addresses;
      expect(addresses.length).toBe(1);
      expect(addresses[0].id).toBe(customerBAddressId);
      expect(addresses.some((a: any) => a.id === customerAAddressId)).toBe(false);
    });

    it('Customer B CANNOT update Customer A address (returns 404)', async () => {
      const res = await request(app)
        .patch(`/api/addresses/${customerAAddressId}`)
        .set('Cookie', customerBCookie)
        .send({ fullName: 'Malicious Overwrite' });

      expect(res.status).toBe(404);
    });

    it('Customer B CANNOT delete Customer A address (returns 404)', async () => {
      const res = await request(app)
        .delete(`/api/addresses/${customerAAddressId}`)
        .set('Cookie', customerBCookie);

      expect(res.status).toBe(404);
    });
  });

  // 2. GUEST BAG & CART MERGE
  describe('Guest Bag & Cart Merge', () => {
    const guestSessionId = `guest_test_${Date.now()}`;

    it('Guest adds items to anonymous bag using sessionId', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .send({
          productId: sovereignProduct.id,
          quantity: 1,
          sessionId: guestSessionId,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.cart.items.length).toBe(1);
      expect(res.body.data.cart.totalQuantity).toBe(1);
    });

    it('Guest bag merges into Customer A authenticated bag', async () => {
      const mergeRes = await request(app)
        .post('/api/cart/merge')
        .set('Cookie', customerACookie)
        .send({ sessionId: guestSessionId });

      expect(mergeRes.status).toBe(200);
      expect(mergeRes.body.data.cart.items.length).toBeGreaterThanOrEqual(1);
      expect(mergeRes.body.data.cart.items.some((i: any) => i.productId === sovereignProduct.id)).toBe(true);
    });
  });

  // 3. TRANSACTIONAL ORDER CREATION & INVENTORY DEDUCTION
  describe('Transactional Order Creation', () => {
    let initialStock = 0;

    it('Records initial product stock', async () => {
      const prod = await prisma.product.findUnique({ where: { id: sovereignProduct.id } });
      initialStock = prod?.stock ?? 0;
      expect(initialStock).toBeGreaterThan(0);
    });

    it('Customer A successfully places order using saved address', async () => {
      // 1. Ensure cart has 1 Sovereign 39
      const cartRes = await request(app).get('/api/cart').set('Cookie', customerACookie);
      expect(cartRes.body.data.cart.items.length).toBeGreaterThan(0);

      // 2. Create order
      const orderRes = await request(app)
        .post('/api/orders')
        .set('Cookie', customerACookie)
        .send({
          addressId: customerAAddressId,
          paymentMethod: 'SIMULATED',
        });

      expect(orderRes.status).toBe(201);
      const order = orderRes.body.data.order;
      expect(order.orderNumber).toMatch(/^NYB-\d{4}-[A-Z0-9]{6}$/);
      expect(order.status).toBe('PENDING');
      expect(order.items.length).toBe(1);
      expect(order.items[0].name).toBe('Sovereign 39');
      expect(order.items[0].reference).toBe('REF. NB-3901-RG');
      expect(order.shippingAddress.city).toBe('Islamabad');
      expect(order.formattedSubtotal).toContain('PKR');

      createdOrderAId = order.id;
      createdOrderANumber = order.orderNumber;
      expect(createdOrderAId).toBeDefined();
      expect(createdOrderAId.length).toBeGreaterThan(0);
    });

    it('Verifies inventory decremented and bag cleared after order placement', async () => {
      // 1. Stock decremented in database
      const prod = await prisma.product.findUnique({ where: { id: sovereignProduct.id } });
      expect(prod?.stock).toBe(initialStock - 1);

      // 2. Cart is now empty
      const cartRes = await request(app).get('/api/cart').set('Cookie', customerACookie);
      expect(cartRes.body.data.cart.items.length).toBe(0);
    });

    it('Verifies Order Item has immutable snapshot data', async () => {
      const orderItem = await prisma.orderItem.findFirst({
        where: { orderId: createdOrderAId },
      });
      expect(orderItem).toBeDefined();
      expect(orderItem?.productNameSnapshot).toBe('Sovereign 39');
      expect(orderItem?.referenceSnapshot).toBe('REF. NB-3901-RG');
      expect(orderItem?.productSlugSnapshot).toBe('sovereign-39');
      expect(orderItem?.unitPrice).toBe(BigInt(3850000));
    });
  });

  // 4. ORDER SECURITY & AUTHORIZATION
  describe('Order Security & User Isolation', () => {
    it('Customer A can retrieve their own order by ID and orderNumber', async () => {
      const byId = await request(app)
        .get(`/api/orders/${createdOrderAId}`)
        .set('Cookie', customerACookie);
      expect(byId.status).toBe(200);
      expect(byId.body.data.order.id).toBe(createdOrderAId);

      const byNum = await request(app)
        .get(`/api/orders/${createdOrderANumber}`)
        .set('Cookie', customerACookie);
      expect(byNum.status).toBe(200);
      expect(byNum.body.data.order.orderNumber).toBe(createdOrderANumber);
    });

    it('Customer B CANNOT access Customer A order by ID (returns 404)', async () => {
      const res = await request(app)
        .get(`/api/orders/${createdOrderAId}`)
        .set('Cookie', customerBCookie);

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
    });

    it('Customer B CANNOT access Customer A order by Order Number (returns 404)', async () => {
      const res = await request(app)
        .get(`/api/orders/${createdOrderANumber}`)
        .set('Cookie', customerBCookie);

      expect(res.status).toBe(404);
    });

    it('Customer B order listing does NOT include Customer A orders', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Cookie', customerBCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.orders.length).toBe(0);
    });
  });

  // 5. CONCURRENCY & OVERSELLING PROTECTION
  describe('Inventory Concurrency & Overselling Protection', () => {
    it('Guarantees overselling protection when stock is 1', async () => {
      // 1. Set Meridian 41 stock to exactly 1
      await prisma.product.update({
        where: { id: meridianProduct.id },
        data: { stock: 1, availability: 'LIMITED' },
      });

      // 2. Customer A adds 1 Meridian 41 to cart
      await request(app)
        .post('/api/cart/items')
        .set('Cookie', customerACookie)
        .send({ productId: meridianProduct.id, quantity: 1 });

      // 3. Customer B adds 1 Meridian 41 to cart
      await request(app)
        .post('/api/cart/items')
        .set('Cookie', customerBCookie)
        .send({ productId: meridianProduct.id, quantity: 1 });

      // 4. Simultaneous checkout attempt from Customer A and Customer B
      const [attemptA, attemptB] = await Promise.all([
        request(app)
          .post('/api/orders')
          .set('Cookie', customerACookie)
          .send({ addressId: customerAAddressId, paymentMethod: 'SIMULATED' }),
        request(app)
          .post('/api/orders')
          .set('Cookie', customerBCookie)
          .send({ addressId: customerBAddressId, paymentMethod: 'SIMULATED' }),
      ]);

      const results = [attemptA, attemptB];
      const successCount = results.filter((r) => r.status === 201).length;
      const failureCount = results.filter((r) => r.status === 409).length;

      // Exactly ONE must succeed and ONE must fail with 409 INSUFFICIENT_STOCK
      expect(successCount).toBe(1);
      expect(failureCount).toBe(1);

      // Verify stock in database is exactly 0 and NOT negative
      const updatedProduct = await prisma.product.findUnique({
        where: { id: meridianProduct.id },
      });
      expect(updatedProduct?.stock).toBe(0);
      expect(updatedProduct?.availability).toBe('OUT_OF_STOCK');
    });
  });

  // 6. CUSTOMER CANCELLATION & INVENTORY RESTORATION
  describe('Customer Order Cancellation', () => {
    it('Customer A cancels PENDING order and stock is restored', async () => {
      // Find current stock of Sovereign 39
      const prodBefore = await prisma.product.findUnique({ where: { id: sovereignProduct.id } });
      const stockBefore = prodBefore?.stock ?? 0;

      const cancelRes = await request(app)
        .post(`/api/orders/${createdOrderAId}/cancel`)
        .set('Cookie', customerACookie);

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.data.order.status).toBe('CANCELLED');

      // Check stock restored
      const prodAfter = await prisma.product.findUnique({ where: { id: sovereignProduct.id } });
      expect(prodAfter?.stock).toBe(stockBefore + 1);
    });

    it('Customer CANNOT cancel an already cancelled order', async () => {
      const cancelRes = await request(app)
        .post(`/api/orders/${createdOrderAId}/cancel`)
        .set('Cookie', customerACookie);

      expect(cancelRes.status).toBe(403);
    });
  });

  // 7. PRICE DRIFT & EDGE CASES
  describe('Price Drift & State Transition Integrity', () => {
    it('Blocks checkout and raises PriceChangedError if catalogue price changes while in cart', async () => {
      // 1. Customer A adds Sovereign 39 to cart
      await request(app)
        .post('/api/cart/items')
        .set('Cookie', customerACookie)
        .send({ productId: sovereignProduct.id, quantity: 1 });

      // 2. Database price changes (e.g. inflation or catalogue revision)
      await prisma.product.update({
        where: { id: sovereignProduct.id },
        data: { price: BigInt(4500000) },
      });

      // 3. Customer A attempts checkout
      const orderRes = await request(app)
        .post('/api/orders')
        .set('Cookie', customerACookie)
        .send({ addressId: customerAAddressId, paymentMethod: 'SIMULATED' });

      expect(orderRes.status).toBe(409);
      expect(orderRes.body.error.code).toBe('PRICE_CHANGED');

      // Restore original price
      await prisma.product.update({
        where: { id: sovereignProduct.id },
        data: { price: BigInt(3850000) },
      });
      // Clear cart
      await request(app).delete('/api/cart').set('Cookie', customerACookie);
    });

    it('Rejects invalid status transitions (e.g. PENDING directly to DELIVERED)', async () => {
      // Add item to cart and create a fresh order
      await request(app)
        .post('/api/cart/items')
        .set('Cookie', customerACookie)
        .send({ productId: sovereignProduct.id, quantity: 1 });

      const createRes = await request(app)
        .post('/api/orders')
        .set('Cookie', customerACookie)
        .send({ addressId: customerAAddressId, paymentMethod: 'SIMULATED' });

      expect(createRes.status).toBe(201);
      const testOrderId = createRes.body.data.order.id;

      // Attempt illegal jump: PENDING -> DELIVERED
      const illegalRes = await request(app)
        .patch(`/api/admin/orders/${testOrderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'DELIVERED' });

      expect(illegalRes.status).toBe(422);
      expect(illegalRes.body.error.code).toBe('INVALID_STATUS_TRANSITION');

      // Legal progression: PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED
      const step1 = await request(app)
        .patch(`/api/admin/orders/${testOrderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'CONFIRMED' });
      expect(step1.status).toBe(200);
      expect(step1.body.data.order.status).toBe('CONFIRMED');

      const step2 = await request(app)
        .patch(`/api/admin/orders/${testOrderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'PROCESSING' });
      expect(step2.status).toBe(200);

      const step3 = await request(app)
        .patch(`/api/admin/orders/${testOrderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'SHIPPED' });
      expect(step3.status).toBe(200);

      const step4 = await request(app)
        .patch(`/api/admin/orders/${testOrderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'DELIVERED' });
      expect(step4.status).toBe(200);
      expect(step4.body.data.order.status).toBe('DELIVERED');
    });
  });

  // 8. ADMIN AUTHORIZATION & OPERATIONS
  describe('Admin Authorization & Operations', () => {
    it('Non-admin customer receives 403 on admin endpoints', async () => {
      const res = await request(app)
        .get('/api/admin/overview')
        .set('Cookie', customerACookie);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('Unauthenticated request receives 401 on admin endpoints', async () => {
      const res = await request(app).get('/api/admin/overview');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('Admin can view overview metrics with simulated payment notice', async () => {
      const res = await request(app)
        .get('/api/admin/overview')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.overview.orders.total).toBeGreaterThanOrEqual(1);
      expect(res.body.data.overview.catalogue.total).toBeGreaterThanOrEqual(5);
      expect(res.body.data.overview.paymentNote).toContain('Simulated');
    });

    it('Admin can list all orders with customer details', async () => {
      const res = await request(app)
        .get('/api/admin/orders')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.orders.length).toBeGreaterThanOrEqual(1);
      const found = res.body.data.orders.find((o: any) => o.id === createdOrderAId);
      expect(found).toBeDefined();
      expect(found.user.name).toBe('Customer A');
    });

    it('Admin can adjust product stock (compare-and-set)', async () => {
      const prod = await prisma.product.findUnique({ where: { id: sovereignProduct.id } });
      const currentStock = prod?.stock ?? 4;

      // 1. Conflict if expectedStock is wrong
      const conflictRes = await request(app)
        .patch(`/api/admin/products/${sovereignProduct.id}/stock`)
        .set('Cookie', adminCookie)
        .send({
          stock: 10,
          expectedStock: currentStock + 99,
          reason: 'Test conflict',
        });
      expect(conflictRes.status).toBe(409);

      // 2. Success with correct expectedStock
      const successRes = await request(app)
        .patch(`/api/admin/products/${sovereignProduct.id}/stock`)
        .set('Cookie', adminCookie)
        .send({
          stock: 8,
          expectedStock: currentStock,
          reason: 'Atelier inventory delivery',
        });
      expect(successRes.status).toBe(200);
      expect(successRes.body.data.product.stock).toBe(8);
      expect(successRes.body.data.product.availability).toBe('AVAILABLE');
    });
  });
});
