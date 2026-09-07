import React from 'react';

export default function Header() {
  const handleOrderNowClick = () => {
    const orderSection = document.getElementById('order-request');
    if (orderSection) {
      orderSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'transparent',
      padding: '16px 24px',
      boxShadow: 'none'
    }}>
      <div style={{
        maxWidth: 'var(--page-max-width)',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo Brand Image */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <img 
            src="/logo.png" 
            alt="Iris Water Logo" 
            style={{ height: '44px', objectFit: 'contain' }} 
          />
          <span style={{
            fontSize: '22px',
            fontWeight: 900,
            letterSpacing: '0.04em',
            color: 'var(--color-primary-ink)',
            lineHeight: 1,
            whiteSpace: 'nowrap'
          }}>
            IRIS WATER
          </span>
        </a>

        {/* Right Header Navigation: Order Now Button */}
        <div>
          <button 
            className="btn-pill-primary"
            onClick={handleOrderNowClick}
            style={{ padding: '12px 24px', fontSize: '15px', fontWeight: 600 }}
          >
            Order Now ›
          </button>
        </div>
      </div>
    </header>
  );
}
