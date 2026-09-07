import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalOrders: 0,
    totalProducts: 0,
    weeklyData: []
  });
  const [leadsList, setLeadsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sRes, lRes] = await Promise.all([
        fetch('/api/leads/stats').then(r => r.json()).catch(() => null),
        fetch('/api/leads').then(r => r.json()).catch(() => null)
      ]);

      if (sRes && sRes.success) {
        setStats(sRes.data);
      }

      if (lRes && lRes.success) {
        setLeadsList(lRes.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = stats.weeklyData || [];
  const maxLeadVal = Math.max(...chartData.map(d => Math.max(d.leads, d.orders)), 5);

  return (
    <div>
      {/* Page Title Header */}
      <div style={{ marginBottom: '36px' }}>
        <span className="apple-badge-ember" style={{ display: 'block', marginBottom: '8px' }}>
          EXECUTIVE OVERVIEW & REAL-TIME ANALYTICS
        </span>
        <h1 className="section-title" style={{ marginBottom: '8px' }}>
          Plant Dashboard.
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--color-mid-gray)' }}>
          Real-time tracking of WhatsApp leads, customer bottle order volumes, and catalogue performance.
        </p>
      </div>

      {/* 3 Stats Cards in a Single 3-Column Grid Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        marginBottom: '36px'
      }}>
        
        {/* 1. Total Leads Card */}
        <div className="apple-card" style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '28px',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-electric-blue)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              TOTAL LEADS
            </span>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'rgba(0, 113, 227, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-electric-blue)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: 700, color: 'var(--color-primary-ink)', margin: 0, letterSpacing: '-0.03em' }}>
              {stats.totalLeads}
            </h2>
            <span style={{ fontSize: '13px', color: 'var(--color-mid-gray)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
              Real WhatsApp Inquiries in DB
            </span>
          </div>
        </div>

        {/* 2. Total Orders Card */}
        <div className="apple-card" style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '28px',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#f56300', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              TOTAL ORDERS
            </span>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'rgba(245, 99, 0, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f56300'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: 700, color: 'var(--color-primary-ink)', margin: 0, letterSpacing: '-0.03em' }}>
              {stats.totalOrders}
            </h2>
            <span style={{ fontSize: '13px', color: 'var(--color-mid-gray)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
              Customer Orders Submitted
            </span>
          </div>
        </div>

        {/* 3. Total Products Card */}
        <div className="apple-card" style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '28px',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#00a389', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              TOTAL PRODUCTS
            </span>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'rgba(0, 163, 137, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00a389'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              </svg>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: 700, color: 'var(--color-primary-ink)', margin: 0, letterSpacing: '-0.03em' }}>
              {stats.totalProducts}
            </h2>
            <span style={{ fontSize: '13px', color: 'var(--color-mid-gray)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
              Active Catalogue Products
            </span>
          </div>
        </div>

      </div>

      {/* Full-Width Section 1: Weekly WhatsApp Lead & Order Trends (Rich Smooth Area Chart) */}
      <div className="apple-card" style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '32px',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        marginBottom: '36px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-primary-ink)', margin: 0 }}>
              Weekly WhatsApp Lead Conversations & Orders
            </h3>
            <span style={{ fontSize: '13px', color: 'var(--color-mid-gray)' }}>
              Comparing unique incoming customer messages vs confirmed bottle bookings over the last 7 days.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-electric-blue)' }}></span>
              <span>Leads (Inquiries)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f56300' }}></span>
              <span>Orders Placed</span>
            </div>
          </div>
        </div>

        {/* SVG Area Chart */}
        <div style={{ width: '100%', height: '240px', position: 'relative' }}>
          {chartData.length > 0 ? (
            <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0071e3" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0071e3" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f56300" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#f56300" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#f0f0f2" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#f0f0f2" strokeDasharray="4 4" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#f0f0f2" strokeDasharray="4 4" />
              <line x1="0" y1="190" x2="500" y2="190" stroke="#e5e5e7" />

              {/* Smooth Spline Area Fills */}
              <path
                d={`M 0,190 
                   ${chartData.map((d, i) => `L ${(i * 500) / Math.max(chartData.length - 1, 1)},${190 - (d.leads / maxLeadVal) * 150}`).join(' ')} 
                   L 500,190 Z`}
                fill="url(#leadGrad)"
              />

              {/* Lead Line */}
              <path
                d={`M ${chartData.map((d, i) => `${(i * 500) / Math.max(chartData.length - 1, 1)},${190 - (d.leads / maxLeadVal) * 150}`).join(' L ')}`}
                fill="none"
                stroke="#0071e3"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Order Line */}
              <path
                d={`M ${chartData.map((d, i) => `${(i * 500) / Math.max(chartData.length - 1, 1)},${190 - (d.orders / maxLeadVal) * 150}`).join(' L ')}`}
                fill="none"
                stroke="#f56300"
                strokeWidth="2.5"
                strokeDasharray="5 3"
                strokeLinecap="round"
              />

              {/* Interactive Point Markers */}
              {chartData.map((d, i) => {
                const cx = (i * 500) / Math.max(chartData.length - 1, 1);
                const cyLead = 190 - (d.leads / maxLeadVal) * 150;
                const cyOrder = 190 - (d.orders / maxLeadVal) * 150;
                return (
                  <g key={i}>
                    <circle cx={cx} cy={cyLead} r="5" fill="#0071e3" stroke="#ffffff" strokeWidth="2" />
                    <circle cx={cx} cy={cyOrder} r="4" fill="#f56300" stroke="#ffffff" strokeWidth="2" />
                  </g>
                );
              })}
            </svg>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-mid-gray)', fontSize: '14px' }}>
              No weekly data recorded yet
            </div>
          )}

          {/* X-Axis Day Labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', padding: '0 4px' }}>
            {chartData.map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--color-mid-gray)' }}>
                {d.day}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full-Width Section 2: Live WhatsApp Customer Leads Activity Stream Table */}
      <div className="apple-card" style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '32px',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-primary-ink)', margin: 0 }}>
              Recent WhatsApp Lead Activity Stream
            </h3>
            <span style={{ fontSize: '13px', color: 'var(--color-mid-gray)' }}>
              Live customer incoming inquiries and flow interactions via WhatsApp Meta Cloud API
            </span>
          </div>
          <span className="apple-badge-ember" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
            REAL-TIME FEED
          </span>
        </div>

        {leadsList.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-mid-gray)', backgroundColor: 'var(--color-canvas)', borderRadius: '12px' }}>
            No customer WhatsApp interactions recorded in MongoDB yet. Send "Hi" on WhatsApp to generate real live leads!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-hairline)', color: 'var(--color-mid-gray)', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Client Name</th>
                  <th style={{ padding: '12px 16px' }}>WhatsApp Number</th>
                  <th style={{ padding: '12px 16px' }}>Last Action</th>
                  <th style={{ padding: '12px 16px' }}>Interactions</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {leadsList.map(ld => (
                  <tr key={ld._id} style={{ borderBottom: '1px solid var(--color-hairline)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-primary-ink)' }}>
                      {ld.name || 'WhatsApp Customer'}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--color-electric-blue)', fontWeight: 500 }}>
                      +{ld.phone}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--color-mid-gray)' }}>
                      {ld.lastFlowOption || 'Service Flow Inquiry'}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                      {ld.interactionCount || 1} msg(s)
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: 'rgba(16, 124, 65, 0.1)',
                        color: '#107c41'
                      }}>
                        Active Lead
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
