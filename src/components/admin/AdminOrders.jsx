import React, { useState, useEffect } from 'react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const statuses = ['Requested', 'Proof Approved', 'Bottle Printing', 'Quality Check', 'Out for Delivery', 'Delivered'];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem('adminToken');
    const csrfToken = localStorage.getItem('csrfToken');

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });

      const data = await res.json();
      if (data.success) {
        alert(`Order #${data.data.orderId} updated to: ${newStatus}. WhatsApp notification sent!`);
        fetchOrders();
      }
    } catch (err) {
      alert('Error updating order status');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <span className="apple-badge-ember" style={{ display: 'block', marginBottom: '8px' }}>
          CUSTOMER ORDER CONCIERGE
        </span>
        <h1 className="section-title" style={{ marginBottom: '8px' }}>
          Customer Bottle Orders & Requests.
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--color-mid-gray)' }}>
          Manage incoming customized bottle orders, logo proofs, dispatch status timeline & instant WhatsApp triggers.
        </p>
      </div>

      {loading ? (
        <div style={{ fontSize: '15px', color: 'var(--color-mid-gray)' }}>Loading customer order requests...</div>
      ) : orders.length === 0 ? (
        <div className="apple-card" style={{ padding: '48px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: 'var(--radius-cards)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-primary-ink)' }}>No order requests submitted yet.</h3>
          <p style={{ fontSize: '14px', color: 'var(--color-mid-gray)', marginTop: '4px' }}>Customer order requests submitted on the website will appear here in real time.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {orders.map(ord => (
            <div key={ord._id} className="apple-card" style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-cards)',
              padding: '32px',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#ffffff',
                    backgroundColor: 'var(--color-electric-blue)',
                    padding: '4px 10px',
                    borderRadius: '100px',
                    display: 'inline-block',
                    marginBottom: '8px'
                  }}>
                    ORDER #{ord.orderId}
                  </span>
                  <h3 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--color-primary-ink)', margin: 0 }}>
                    {ord.productName || `${ord.brandName || 'Custom'} Water Bottle`} ({ord.bottleSize || '500ml'})
                  </h3>
                  <div style={{ fontSize: '14px', color: 'var(--color-mid-gray)', marginTop: '4px' }}>
                    Client: <strong>{ord.customerName}</strong> | WhatsApp: <strong>+{ord.whatsappNumber}</strong> | Contact: <strong>{ord.contactNumber || ord.whatsappNumber}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary-ink)', letterSpacing: '-0.02em' }}>
                    ₹{ord.totalAmount?.toLocaleString('en-IN')}
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--color-mid-gray)' }}>
                    {ord.quantity} bottles @ ₹{ord.unitPrice || 85}/pc
                  </span>
                </div>
              </div>

              {/* Order Proof Details Card */}
              <div style={{
                backgroundColor: 'var(--color-canvas)',
                padding: '20px',
                borderRadius: '16px',
                marginBottom: '20px',
                fontSize: '14px',
                color: 'var(--color-primary-ink)'
              }}>
                <div style={{ marginBottom: '6px' }}><strong>Brand / Event Name:</strong> {ord.brandName || ord.monogramText || 'N/A'}</div>
                <div style={{ marginBottom: '6px' }}><strong>Purpose:</strong> {ord.purpose || ord.customText || 'Customized Bottled Water'}</div>
                
                {ord.logoUrl && (
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <strong>Logo Design Proof:</strong>
                    <a href={ord.logoUrl} target="_blank" rel="noreferrer">
                      <img src={ord.logoUrl} alt="Logo Proof" style={{ height: '48px', borderRadius: '8px', border: '1px solid var(--color-hairline)', backgroundColor: '#ffffff', padding: '4px', objectFit: 'contain' }} />
                    </a>
                  </div>
                )}

                {ord.pdfInvoiceUrl && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong>PDF Tax Invoice:</strong> 
                    <a href={ord.pdfInvoiceUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-electric-blue)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                      Download Invoice
                    </a>
                  </div>
                )}
              </div>

              {/* Status Update Control */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderTop: '1px solid var(--color-hairline)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary-ink)' }}>UPDATE DISPATCH STATUS:</label>
                  <select
                    value={ord.orderStatus}
                    onChange={e => handleUpdateStatus(ord._id, e.target.value)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '12px',
                      border: '1px solid var(--color-electric-blue)',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: 'var(--color-electric-blue)',
                      backgroundColor: '#ffffff',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {statuses.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <span style={{ fontSize: '13px', color: 'var(--color-mid-gray)' }}>
                  Requested on: {new Date(ord.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
