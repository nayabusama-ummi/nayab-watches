import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('NAYAB Fine Watchmaking API Integration Tests', () => {
  let authToken = '';
  let authCookie = '';
  let sovereignProductId = '';
  let meridianProductId = '';

  // 1. Health
  it('GET /api/health returns 200 OK with service status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.service).toContain('NAYAB');
  });

  // 2. Collections
  it('GET /api/collections returns 5 collections', async () => {
    const res = await request(app).get('/api/collections');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data.collections)).toBe(true);
    expect(res.body.data.collections.length).toBe(5);
    const slugs = res.body.data.collections.map((c: any) => c.slug);
    expect(slugs).toEqual(expect.arrayContaining(['mehr', 'indus', 'noor', 'karakoram', 'zar']));
  });

  it('GET /api/collections/mehr returns collection with products', async () => {
    const res = await request(app).get('/api/collections/mehr');
    expect(res.status).toBe(200);
    expect(res.body.data.collection.name).toBe('MEHR');
    expect(res.body.data.collection.products.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.collection.products[0].formattedPrice).toContain('PKR');
  });

  it('GET /api/collections/invalid-slug returns 404 for unknown collection', async () => {
    const res = await request(app).get('/api/collections/non-existent-collection');
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });

  // 3. Products
  it('GET /api/products returns product list and pagination', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.data.products.length).toBeGreaterThanOrEqual(5);
    expect(res.body.data.pagination.total).toBeGreaterThanOrEqual(5);
    
    // Grab IDs for subsequent tests
    const sovereign = res.body.data.products.find((p: any) => p.slug === 'sovereign-39');
    const meridian = res.body.data.products.find((p: any) => p.slug === 'meridian-41');
    sovereignProductId = sovereign.id;
    meridianProductId = meridian.id;
    expect(sovereignProductId).toBeDefined();
  });

  it('GET /api/products/sovereign-39 returns detailed single product with specs, variants and images', async () => {
    const res = await request(app).get('/api/products/sovereign-39');
    expect(res.status).toBe(200);
    const prod = res.body.data.product;
    expect(prod.name).toBe('Sovereign 39');
    expect(prod.reference).toBe('REF. NB-3901-RG');
    expect(prod.images.length).toBeGreaterThan(0);
    expect(prod.formattedPrice).toBe('PKR 3,850,000');
    expect(prod.variants.length).toBeGreaterThanOrEqual(1);
    expect(prod.collection.slug).toBe('mehr');
  });

  it('GET /api/products/unknown-watch returns 404 for unknown product', async () => {
    const res = await request(app).get('/api/products/unknown-watch-slug');
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });

  // 4. Filtering & Sorting
  it('GET /api/products?collection=indus filters products by collection', async () => {
    const res = await request(app).get('/api/products?collection=indus');
    expect(res.status).toBe(200);
    expect(res.body.data.products.length).toBe(2);
    expect(res.body.data.products.every((p: any) => p.collection.slug === 'indus')).toBe(true);
  });

  it('GET /api/products?material=titanium filters products by case material', async () => {
    const res = await request(app).get('/api/products?material=titanium');
    expect(res.status).toBe(200);
    expect(res.body.data.products.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.products.every((p: any) => p.caseMaterial.toLowerCase().includes('titanium'))).toBe(true);
  });

  it('GET /api/products?size=39 filters products by diameter', async () => {
    const res = await request(app).get('/api/products?size=39');
    expect(res.status).toBe(200);
    expect(res.body.data.products.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.products.every((p: any) => p.caseDiameter.includes('39'))).toBe(true);
  });

  it('GET /api/products?availability=AVAILABLE filters products by availability', async () => {
    const res = await request(app).get('/api/products?availability=AVAILABLE');
    expect(res.status).toBe(200);
    expect(res.body.data.products.every((p: any) => p.availability === 'AVAILABLE')).toBe(true);
  });

  it('GET /api/products?search=midnight searches products by dial keyword', async () => {
    const res = await request(app).get('/api/products?search=midnight');
    expect(res.status).toBe(200);
    expect(res.body.data.products.some((p: any) => p.slug === 'meridian-41')).toBe(true);
  });

  it('GET /api/products?sort=price-asc sorts products by ascending price', async () => {
    const res = await request(app).get('/api/products?sort=price-asc');
    expect(res.status).toBe(200);
    const prices = res.body.data.products.map((p: any) => p.price);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });

  it('GET /api/products?sort=price-desc sorts products by descending price', async () => {
    const res = await request(app).get('/api/products?sort=price-desc');
    expect(res.status).toBe(200);
    const prices = res.body.data.products.map((p: any) => p.price);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
    }
  });

  // 5. Auth Integration
  it('POST /api/auth/register creates a new user account with cookie', async () => {
    const uniqueEmail = `collector_${Date.now()}@nayab.pk`;
    const res = await request(app).post('/api/auth/register').send({
      name: 'Ali Raza',
      email: uniqueEmail,
      password: 'SecurePassword123!',
      phone: '+92 300 1234567',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe(uniqueEmail);
    expect(res.body.data.token).toBeDefined();

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('nayab_auth_token=');
  });

  it('POST /api/auth/login logs in existing user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'client@nayab.pk',
      password: 'Nayab@2026',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('client@nayab.pk');
    authToken = res.body.data.token;
    authCookie = res.headers['set-cookie'][0];
  });

  it('POST /api/auth/login fails on invalid password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'client@nayab.pk',
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me returns authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('client@nayab.pk');
    expect(res.body.data.user.name).toBe('Mian Tariq');
  });

  // 6. Wishlist Integration
  it('POST /api/wishlist adds a product to wishlist', async () => {
    const res = await request(app)
      .post('/api/wishlist')
      .set('Cookie', authCookie)
      .send({ productId: sovereignProductId });

    expect(res.status).toBe(201);
    expect(res.body.data.item.productId).toBe(sovereignProductId);
  });

  it('POST /api/wishlist prevents duplicate product addition', async () => {
    const res = await request(app)
      .post('/api/wishlist')
      .set('Cookie', authCookie)
      .send({ productId: sovereignProductId });

    expect(res.status).toBe(409);
  });

  it('GET /api/wishlist retrieves authenticated user wishlist items', async () => {
    const res = await request(app)
      .get('/api/wishlist')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.items[0].product.name).toBe('Sovereign 39');
  });

  it('DELETE /api/wishlist/:productId removes product from wishlist', async () => {
    const res = await request(app)
      .delete(`/api/wishlist/${sovereignProductId}`)
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.success).toBe(true);
  });

  // 7. Cart / Bag Integration
  it('POST /api/cart/items adds product to bag', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Cookie', authCookie)
      .send({ productId: sovereignProductId, quantity: 1 });

    expect(res.status).toBe(200);
    expect(res.body.data.cart.items.length).toBe(1);
    expect(res.body.data.cart.totalQuantity).toBe(1);
    expect(res.body.data.cart.formattedSubtotal).toContain('PKR');
  });

  it('PATCH /api/cart/items/:id updates item quantity', async () => {
    const cartRes = await request(app).get('/api/cart').set('Cookie', authCookie);
    const itemId = cartRes.body.data.cart.items[0].id;

    const res = await request(app)
      .patch(`/api/cart/items/${itemId}`)
      .set('Cookie', authCookie)
      .send({ quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data.cart.items[0].quantity).toBe(2);
    expect(res.body.data.cart.totalQuantity).toBe(2);
  });

  it('DELETE /api/cart/items/:id removes item from bag', async () => {
    const cartRes = await request(app).get('/api/cart').set('Cookie', authCookie);
    const itemId = cartRes.body.data.cart.items[0].id;

    const res = await request(app)
      .delete(`/api/cart/items/${itemId}`)
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.cart.items.length).toBe(0);
  });
});
