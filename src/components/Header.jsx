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
        <a href="#" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img 
            src="/logo.png" 
            alt="Iris Premium Logo" 
            style={{ height: '44px', objectFit: 'contain' }} 
          />
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
