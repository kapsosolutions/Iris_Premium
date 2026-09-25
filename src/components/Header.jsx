import React from 'react';

export default function Header() {
  const handleOrderNowClick = () => {
    const orderSection = document.getElementById('order-request');
    if (orderSection) {
      orderSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">
        {/* Logo Brand Image */}
        <a href="#" className="site-header-logo">
          <img 
            src="/logo.png" 
            alt="Iris Water Logo" 
            className="site-header-logo-img"
          />
          <span className="site-header-logo-text">
            IRIS WATER
          </span>
        </a>

        {/* Right Header Navigation: Order Now Button */}
        <div>
          <button 
            className="btn-pill-primary site-header-cta"
            onClick={handleOrderNowClick}
          >
            Order Now ›
          </button>
        </div>
      </div>
    </header>
  );
}
