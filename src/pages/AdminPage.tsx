import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, AdminProduct } from '../api/admin.api';
import { ApiError, messageFor } from '../api/client';
import { ORDER_STATUS_LABEL, OrderStatus } from '../api/orders.api';
import { Package, BarChart2, RefreshCw, AlertTriangle, ChevronDown, Minus, Plus } from 'lucide-react';
import './Commerce.css';

type AdminTab = 'orders' | 'inventory';

const STATUS_OPTIONS: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [statusUpdating, setStatusUpdating] = useState<string>('');
  const [stockDelta, setStockDelta] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const { data: overviewData } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: () => adminApi.overview(),
    staleTime: 60_000,
  });

  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ['admin', 'orders', statusFilter],
    queryFn: () => adminApi.listOrders({ limit: 50, status: statusFilter || undefined }),
    staleTime: 30_000,
  });

  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => adminApi.listProducts({ limit: 100 }),
    staleTime: 60_000,
  });

  const overview = overviewData?.overview;
  const orders = ordersData?.orders ?? [];
  const products = productsData?.products ?? [];

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setStatusUpdating(orderId);
    try {
      await adminApi.updateOrderStatus(orderId, status);
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    } catch (err) {
      alert(`Failed to update status: ${messageFor(err)}`);
    } finally {
      setStatusUpdating('');
    }
  };

  const adjustStock = async (product: AdminProduct) => {
    const delta = stockDelta[product.id] ?? 0;
    if (delta === 0) return;

    const newStock = Math.max(0, product.stock + delta);
    try {
      await adminApi.adjustProductStock(product.id, {
        stock: newStock,
        expectedStock: product.stock,
      });
      setStockDelta((prev) => ({ ...prev, [product.id]: 0 }));
      setFeedback((prev) => ({ ...prev, [product.id]: `Updated to ${newStock}` }));
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      setTimeout(() => setFeedback((prev) => ({ ...prev, [product.id]: '' })), 2000);
    } catch (err) {
      setFeedback((prev) => ({
        ...prev,
        [product.id]: err instanceof ApiError ? err.message : 'Update failed',
      }));
    }
  };

  const changeDelta = (productId: string, change: number) => {
    setStockDelta((prev) => ({ ...prev, [productId]: (prev[productId] ?? 0) + change }));
  };

  return (
    <main className="page-container theme-ivory commerce-page">
      <div className="container section-padding">
        <header className="commerce-header">
          <span className="eyebrow">Atelier Operations</span>
          <h1 className="display-1 commerce-header__title">Atelier Dashboard</h1>
        </header>

        {/* Overview Stats */}
        {overview && (
          <div className="admin-stats-row">
            <div className="admin-stat-card">
              <span className="admin-stat-card__label">Pending Orders</span>
              <span className="admin-stat-card__val">{overview.orders.pending}</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-card__label">Processing</span>
              <span className="admin-stat-card__val">{overview.orders.processing}</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-card__label">Shipped</span>
              <span className="admin-stat-card__val">{overview.orders.shipped}</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-card__label">Committed Value</span>
              <span className="admin-stat-card__val admin-stat-card__val--highlight">
                {overview.formattedCommittedValue}
              </span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-card__label">Catalogue</span>
              <span className="admin-stat-card__val">{overview.catalogue.total} refs</span>
              {overview.catalogue.outOfStock > 0 && (
                <span className="admin-stat-card__warn">
                  {overview.catalogue.outOfStock} out of stock
                </span>
              )}
            </div>
          </div>
        )}

        <div className="commerce-notice commerce-notice--info" role="note">
          <AlertTriangle size={14} style={{ flexShrink: 0 }} />
          <span>
            <strong>Simulated checkout only.</strong> {overview?.paymentNote ?? 'No digital payment is collected. All orders require client office settlement.'}
          </span>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'orders' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('orders')}
            aria-pressed={activeTab === 'orders'}
          >
            <Package size={15} /> Orders ({overview?.orders.total ?? '…'})
          </button>
          <button
            className={`admin-tab ${activeTab === 'inventory' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('inventory')}
            aria-pressed={activeTab === 'inventory'}
          >
            <BarChart2 size={15} /> Inventory
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <section className="admin-section">
            <div className="admin-filter-row">
              <label className="checkout-label" htmlFor="admin-status-filter">
                Filter by status
              </label>
              <select
                id="admin-status-filter"
                className="checkout-input checkout-select admin-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
              <button
                className="admin-refresh-btn"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })}
                aria-label="Refresh orders"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {ordersLoading && (
              <div className="page-loading">
                <span className="page-loading__text">Loading orders…</span>
              </div>
            )}
            {ordersError && (
              <div className="commerce-notice commerce-notice--error">
                <AlertTriangle size={14} />
                <span>{messageFor(ordersError)}</span>
              </div>
            )}

            {!ordersLoading && orders.length === 0 && (
              <div className="state-panel">
                <span className="eyebrow">No Orders</span>
                <h2 className="display-2 state-panel__title">No orders found</h2>
              </div>
            )}

            {!ordersLoading && orders.length > 0 && (
              <div className="admin-orders-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Client</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className={statusUpdating === order.id ? 'admin-row--updating' : ''}>
                        <td>
                          <a
                            href={`/orders/${order.id}`}
                            className="admin-order-link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {order.orderNumber}
                          </a>
                        </td>
                        <td>
                          {order.user ? (
                            <span className="admin-client-cell">
                              <span className="admin-client-cell__name">{order.user.name}</span>
                              <span className="admin-client-cell__email">{order.user.email}</span>
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          {new Date(order.createdAt).toLocaleDateString('en-PK', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td>{order.formattedTotal}</td>
                        <td>
                          <span className={`order-status-badge order-status--${order.status.toLowerCase()}`}>
                            {ORDER_STATUS_LABEL[order.status]}
                          </span>
                        </td>
                        <td>
                          {order.allowedTransitions.length > 0 ? (
                            <div className="admin-status-select-wrap">
                              <select
                                className="checkout-input checkout-select admin-status-select"
                                defaultValue=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    updateStatus(order.id, e.target.value as OrderStatus);
                                    e.target.value = '';
                                  }
                                }}
                                aria-label={`Update status for ${order.orderNumber}`}
                              >
                                <option value="">Move to…</option>
                                {order.allowedTransitions.map((t) => (
                                  <option key={t} value={t}>
                                    {ORDER_STATUS_LABEL[t]}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown size={12} className="admin-select-chevron" />
                            </div>
                          ) : (
                            <span className="admin-no-transitions">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <section className="admin-section">
            {productsLoading && (
              <div className="page-loading">
                <span className="page-loading__text">Loading inventory…</span>
              </div>
            )}
            {productsError && (
              <div className="commerce-notice commerce-notice--error">
                <AlertTriangle size={14} />
                <span>{messageFor(productsError)}</span>
              </div>
            )}

            {!productsLoading && (
              <div className="admin-orders-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Adjust Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const delta = stockDelta[product.id] ?? 0;
                      const preview = product.stock + delta;
                      return (
                        <tr key={product.id}>
                          <td><code>{product.reference}</code></td>
                          <td>{product.name}</td>
                          <td>{product.formattedPrice}</td>
                          <td className={product.stock === 0 ? 'admin-stock--zero' : product.stock < 3 ? 'admin-stock--low' : ''}>
                            {product.stock}
                          </td>
                          <td>
                            <span className={`order-status-badge order-status--${product.availability.toLowerCase()}`}>
                              {product.availability}
                            </span>
                          </td>
                          <td>
                            <div className="admin-stock-control">
                              <button
                                type="button"
                                className="admin-stock-btn"
                                onClick={() => changeDelta(product.id, -1)}
                                aria-label="Decrease stock by 1"
                                disabled={preview <= 0}
                              >
                                <Minus size={12} />
                              </button>
                              <span className={`admin-stock-preview ${delta !== 0 ? 'admin-stock-preview--changed' : ''}`}>
                                {preview}
                              </span>
                              <button
                                type="button"
                                className="admin-stock-btn"
                                onClick={() => changeDelta(product.id, 1)}
                                aria-label="Increase stock by 1"
                              >
                                <Plus size={12} />
                              </button>
                              {delta !== 0 && (
                                <button
                                  type="button"
                                  className="admin-stock-save"
                                  onClick={() => adjustStock(product)}
                                  aria-label={`Save stock update for ${product.name}`}
                                >
                                  Save
                                </button>
                              )}
                            </div>
                            {feedback[product.id] && (
                              <span className="admin-stock-feedback">{feedback[product.id]}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
};
