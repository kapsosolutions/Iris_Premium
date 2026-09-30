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
        <a href="#" className="site-header-logo" aria-label="Iris Water">
          <img 
            src="/logo.png" 
            alt="Iris Water Logo" 
            className="site-header-logo-img"
          />
        </a>

        {/* Right Header Navigation: Order Now Button */}
        <div>
          <button 
            type="button"
            className="button"
            onClick={handleOrderNowClick}
          >
            <span className="liquid"></span>
            <span className="btn-txt">Order Now</span>
          </button>
        </div>
      </div>
    </header>
  );
}
